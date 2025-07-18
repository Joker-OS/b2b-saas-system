require('dotenv').config({ path: '.env.local' });// 检查 Supabase 数据库表是否存在
const { createClient } = require('@supabase/supabase-js')

console.log('🔍 检查 Supabase 数据库表...\n')

// 检查环境变量
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ 环境变量未设置')
  console.log('请创建 .env.local 文件并设置:')
  console.log('NEXT_PUBLIC_SUPABASE_URL=你的_supabase_项目_url')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_supabase_匿名密钥')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkTables() {
  const tables = ['tasks', 'members', 'inventory_items']
  
  for (const tableName of tables) {
    try {
      console.log(`📋 检查表: ${tableName}`)
      
      const { data, error } = await supabase
        .from(tableName)
        .select('count')
        .limit(1)
      
      if (error) {
        console.log(`❌ ${tableName} 表不存在或无法访问`)
        console.log(`   错误: ${error.message}`)
        console.log(`   代码: ${error.code}`)
        
        if (error.code === '42P01') {
          console.log(`   💡 解决方案: 需要创建 ${tableName} 表`)
        } else if (error.code === '42501') {
          console.log(`   💡 解决方案: 需要设置 RLS 策略`)
        }
      } else {
        console.log(`✅ ${tableName} 表存在且可访问`)
        
        // 检查数据数量
        const { count, error: countError } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true })
        
        if (countError) {
          console.log(`   ⚠️  无法获取数据数量`)
        } else {
          console.log(`   📊 数据数量: ${count}`)
        }
      }
      
      console.log('')
      
    } catch (err) {
      console.log(`❌ 检查 ${tableName} 表时发生错误:`, err.message)
      console.log('')
    }
  }
  
  console.log('📝 如果表不存在，请在 Supabase SQL 编辑器中运行以下 SQL:')
  console.log(`
-- 创建任务表
CREATE TABLE IF NOT EXISTS tasks (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  assignee TEXT NOT NULL,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建成员表
CREATE TABLE IF NOT EXISTS members (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建库存商品表
CREATE TABLE IF NOT EXISTS inventory_items (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  stock INTEGER DEFAULT 0,
  threshold INTEGER DEFAULT 10,
  category_id TEXT DEFAULT 'default',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 设置 RLS 策略
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- 允许匿名用户访问
CREATE POLICY "Allow anonymous access" ON tasks FOR ALL USING (true);
CREATE POLICY "Allow anonymous access" ON members FOR ALL USING (true);
CREATE POLICY "Allow anonymous access" ON inventory_items FOR ALL USING (true);
  `)
}

checkTables() 