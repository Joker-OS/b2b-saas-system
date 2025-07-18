require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

console.log('🔧 更新数据库表结构...\n');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ 环境变量未设置');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function updateDatabaseStructure() {
  try {
    console.log('📋 检查当前表结构...');
    
    // 检查当前 tasks 表结构
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .limit(1);
    
    if (tasksError) {
      console.log(`❌ 无法访问 tasks 表: ${tasksError.message}`);
      return;
    }
    
    console.log('✅ tasks 表存在');
    if (tasksData && tasksData.length > 0) {
      console.log('   当前列结构:', Object.keys(tasksData[0]));
    }
    
    console.log('\n📋 需要在 Supabase SQL 编辑器中运行以下 SQL 命令:');
    console.log('');
    console.log('-- 为 tasks 表添加 description 列');
    console.log('ALTER TABLE tasks ADD COLUMN IF NOT EXISTS description TEXT;');
    console.log('');
    console.log('-- 更新现有数据（可选）');
    console.log('UPDATE tasks SET description = \'暂无描述\' WHERE description IS NULL;');
    console.log('');
    console.log('-- 或者重新创建表（推荐，如果表结构不完整）');
    console.log('DROP TABLE IF EXISTS tasks CASCADE;');
    console.log('CREATE TABLE tasks (');
    console.log('  id BIGSERIAL PRIMARY KEY,');
    console.log('  title TEXT NOT NULL,');
    console.log('  description TEXT,');
    console.log('  assignee TEXT NOT NULL,');
    console.log('  due_date DATE NOT NULL,');
    console.log('  status TEXT DEFAULT \'pending\' CHECK (status IN (\'pending\', \'completed\', \'overdue\')),');
    console.log('  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()');
    console.log(');');
    console.log('');
    console.log('-- 设置 RLS 策略');
    console.log('ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;');
    console.log('CREATE POLICY "Allow all access" ON tasks FOR ALL USING (true);');
    console.log('');
    
    console.log('⚠️  注意: 如果选择重新创建表，现有数据将会丢失。');
    console.log('   建议先备份数据，或者使用第一种方案（添加列）。');
    
  } catch (error) {
    console.log('❌ 分析失败:', error.message);
  }
}

updateDatabaseStructure(); 