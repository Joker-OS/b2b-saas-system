// Supabase 连接诊断脚本
const { createClient } = require('@supabase/supabase-js')

console.log('🔍 Supabase 连接诊断开始...\n')

// 检查环境变量
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('📋 环境变量检查:')
console.log(`  URL: ${supabaseUrl ? '✅ 已设置' : '❌ 未设置'}`)
console.log(`  Key: ${supabaseAnonKey ? '✅ 已设置' : '❌ 未设置'}`)

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('\n❌ 错误: 环境变量未正确设置')
  console.log('请创建 .env.local 文件并设置以下变量:')
  console.log('NEXT_PUBLIC_SUPABASE_URL=你的_supabase_项目_url')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_supabase_匿名密钥')
  process.exit(1)
}

// 创建客户端
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function diagnoseConnection() {
  try {
    console.log('\n🔗 测试 Supabase 连接...')
    
    // 测试基本连接
    const { data, error } = await supabase
      .from('members')
      .select('count')
      .limit(1)
    
    if (error) {
      console.log('❌ 连接失败:', error.message)
      console.log('错误代码:', error.code)
      console.log('错误详情:', error.details)
      
      if (error.code === 'PGRST116') {
        console.log('\n💡 解决方案: 数据库表不存在')
        console.log('请在 Supabase SQL 编辑器中运行以下 SQL:')
        console.log(`
CREATE TABLE IF NOT EXISTS members (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  assignee TEXT NOT NULL,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inventory_items (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  stock INTEGER DEFAULT 0,
  threshold INTEGER DEFAULT 10,
  category_id TEXT DEFAULT 'default',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 设置 RLS 策略
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous access" ON members FOR ALL USING (true);
CREATE POLICY "Allow anonymous access" ON tasks FOR ALL USING (true);
CREATE POLICY "Allow anonymous access" ON inventory_items FOR ALL USING (true);
        `)
      } else if (error.code === '42501') {
        console.log('\n💡 解决方案: 权限不足')
        console.log('请检查 RLS 策略设置，确保允许匿名用户访问')
      } else if (error.code === '42P01') {
        console.log('\n💡 解决方案: 表不存在')
        console.log('请先创建数据库表结构')
      }
    } else {
      console.log('✅ 连接成功!')
      
      // 测试数据查询
      console.log('\n📊 测试数据查询...')
      const { data: members, error: membersError } = await supabase
        .from('members')
        .select('*')
        .limit(5)
      
      if (membersError) {
        console.log('❌ 查询成员数据失败:', membersError.message)
      } else {
        console.log(`✅ 成功查询到 ${members.length} 个成员`)
        if (members.length > 0) {
          console.log('示例数据:', members[0])
        }
      }
      
      // 测试任务查询
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .limit(5)
      
      if (tasksError) {
        console.log('❌ 查询任务数据失败:', tasksError.message)
      } else {
        console.log(`✅ 成功查询到 ${tasks.length} 个任务`)
      }
      
      // 测试库存查询
      const { data: inventory, error: inventoryError } = await supabase
        .from('inventory_items')
        .select('*')
        .limit(5)
      
      if (inventoryError) {
        console.log('❌ 查询库存数据失败:', inventoryError.message)
      } else {
        console.log(`✅ 成功查询到 ${inventory.length} 个商品`)
      }
    }
    
  } catch (error) {
    console.log('❌ 诊断过程中发生错误:', error.message)
  }
}

diagnoseConnection() 