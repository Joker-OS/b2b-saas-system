require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

console.log('🔧 修复数据库表结构...\n');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ 环境变量未设置');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixDatabaseStructure() {
  try {
    console.log('📋 当前表结构分析...');
    
    // 检查当前 tasks 表结构
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .limit(1);
    
    if (tasksError) {
      console.log(`❌ 无法访问 tasks 表: ${tasksError.message}`);
    } else {
      console.log('✅ tasks 表存在');
      if (tasksData && tasksData.length > 0) {
        console.log('   当前列结构:', Object.keys(tasksData[0]));
      }
    }
    
    // 检查当前 members 表结构
    const { data: membersData, error: membersError } = await supabase
      .from('members')
      .select('*')
      .limit(1);
    
    if (membersError) {
      console.log(`❌ 无法访问 members 表: ${membersError.message}`);
    } else {
      console.log('✅ members 表存在');
      if (membersData && membersData.length > 0) {
        console.log('   当前列结构:', Object.keys(membersData[0]));
      }
    }
    
    console.log('\n📋 建议的解决方案:');
    console.log('1. 在 Supabase SQL 编辑器中运行以下 SQL 命令来修复表结构:');
    console.log('');
    console.log('-- 删除现有表（如果存在）');
    console.log('DROP TABLE IF EXISTS tasks CASCADE;');
    console.log('DROP TABLE IF EXISTS members CASCADE;');
    console.log('DROP TABLE IF EXISTS inventory_items CASCADE;');
    console.log('');
    console.log('-- 重新创建 tasks 表');
    console.log('CREATE TABLE tasks (');
    console.log('  id BIGSERIAL PRIMARY KEY,');
    console.log('  title TEXT NOT NULL,');
    console.log('  assignee TEXT NOT NULL,');
    console.log('  due_date DATE NOT NULL,');
    console.log('  status TEXT DEFAULT \'pending\' CHECK (status IN (\'pending\', \'completed\', \'overdue\')),');
    console.log('  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()');
    console.log(');');
    console.log('');
    console.log('-- 重新创建 members 表');
    console.log('CREATE TABLE members (');
    console.log('  id BIGSERIAL PRIMARY KEY,');
    console.log('  name TEXT NOT NULL,');
    console.log('  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()');
    console.log(');');
    console.log('');
    console.log('-- 重新创建 inventory_items 表');
    console.log('CREATE TABLE inventory_items (');
    console.log('  id BIGSERIAL PRIMARY KEY,');
    console.log('  name TEXT NOT NULL,');
    console.log('  stock INTEGER DEFAULT 0,');
    console.log('  threshold INTEGER DEFAULT 10,');
    console.log('  category_id TEXT DEFAULT \'default\',');
    console.log('  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()');
    console.log(');');
    console.log('');
    console.log('-- 插入示例数据');
    console.log('INSERT INTO members (name) VALUES (\'张三\'), (\'李四\'), (\'王五\');');
    console.log('');
    console.log('-- 设置 RLS 策略');
    console.log('ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;');
    console.log('ALTER TABLE members ENABLE ROW LEVEL SECURITY;');
    console.log('ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;');
    console.log('');
    console.log('-- 创建允许所有访问的策略');
    console.log('CREATE POLICY "Allow all access" ON tasks FOR ALL USING (true);');
    console.log('CREATE POLICY "Allow all access" ON members FOR ALL USING (true);');
    console.log('CREATE POLICY "Allow all access" ON inventory_items FOR ALL USING (true);');
    console.log('');
    
    console.log('2. 或者，如果你想保留现有数据，可以手动添加缺失的列:');
    console.log('');
    console.log('-- 为 tasks 表添加缺失的列');
    console.log('ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assignee TEXT;');
    console.log('ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date DATE;');
    console.log('ALTER TABLE tasks ADD COLUMN IF NOT EXISTS status TEXT DEFAULT \'pending\';');
    console.log('ALTER TABLE tasks ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();');
    console.log('');
    console.log('-- 为 members 表添加缺失的列');
    console.log('ALTER TABLE members ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();');
    console.log('');
    
    console.log('⚠️  注意: 建议使用第一种方案（重新创建表），因为这样可以确保表结构完全正确。');
    console.log('   如果你选择第二种方案，可能需要手动更新现有数据。');
    
  } catch (error) {
    console.log('❌ 分析失败:', error.message);
  }
}

fixDatabaseStructure(); 