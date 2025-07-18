// 详细的 Supabase 连接测试脚本
const { createClient } = require('@supabase/supabase-js')

console.log('🔍 详细测试 Supabase 连接...\n')

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

console.log(`\n🔗 URL 格式检查:`)
console.log(`  原始 URL: ${supabaseUrl}`)
console.log(`  是否以 https:// 开头: ${supabaseUrl.startsWith('https://')}`)
console.log(`  是否包含 supabase.co: ${supabaseUrl.includes('supabase.co')}`)

console.log(`\n🔑 Key 格式检查:`)
console.log(`  Key 长度: ${supabaseAnonKey.length}`)
console.log(`  是否以 eyJ 开头: ${supabaseAnonKey.startsWith('eyJ')}`)

// 创建客户端
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
  try {
    console.log('\n🚀 开始连接测试...')
    
    // 测试 1: 基本连接
    console.log('\n📡 测试 1: 基本连接')
    const { data: healthData, error: healthError } = await supabase
      .from('_supabase_migrations')
      .select('*')
      .limit(1)
    
    if (healthError) {
      console.log('❌ 基本连接失败:', healthError.message)
      console.log('错误代码:', healthError.code)
    } else {
      console.log('✅ 基本连接成功')
    }
    
    // 测试 2: 测试 tasks 表
    console.log('\n📋 测试 2: tasks 表')
    try {
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .limit(1)
      
      if (tasksError) {
        console.log('❌ tasks 表访问失败:', tasksError.message)
        console.log('错误代码:', tasksError.code)
        
        if (tasksError.code === '42P01') {
          console.log('💡 解决方案: tasks 表不存在，需要创建')
        } else if (tasksError.code === '42501') {
          console.log('💡 解决方案: 权限不足，需要设置 RLS 策略')
        }
      } else {
        console.log('✅ tasks 表访问成功')
        console.log(`   数据数量: ${tasksData.length}`)
      }
    } catch (err) {
      console.log('❌ tasks 表测试异常:', err.message)
    }
    
    // 测试 3: 测试 members 表
    console.log('\n👥 测试 3: members 表')
    try {
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('*')
        .limit(1)
      
      if (membersError) {
        console.log('❌ members 表访问失败:', membersError.message)
        console.log('错误代码:', membersError.code)
        
        if (membersError.code === '42P01') {
          console.log('💡 解决方案: members 表不存在，需要创建')
        } else if (membersError.code === '42501') {
          console.log('💡 解决方案: 权限不足，需要设置 RLS 策略')
        }
      } else {
        console.log('✅ members 表访问成功')
        console.log(`   数据数量: ${membersData.length}`)
      }
    } catch (err) {
      console.log('❌ members 表测试异常:', err.message)
    }
    
    // 测试 4: 测试插入操作
    console.log('\n➕ 测试 4: 插入操作')
    try {
      const testTask = {
        title: '测试任务',
        assignee: '测试用户',
        due_date: new Date().toISOString().split('T')[0],
        status: 'pending'
      }
      
      const { data: insertData, error: insertError } = await supabase
        .from('tasks')
        .insert([testTask])
        .select()
      
      if (insertError) {
        console.log('❌ 插入操作失败:', insertError.message)
        console.log('错误代码:', insertError.code)
        
        if (insertError.code === '42P01') {
          console.log('💡 解决方案: tasks 表不存在')
        } else if (insertError.code === '42501') {
          console.log('💡 解决方案: 插入权限不足')
        } else if (insertError.code === '23505') {
          console.log('💡 解决方案: 数据重复')
        }
      } else {
        console.log('✅ 插入操作成功')
        console.log('   插入的数据:', insertData[0])
        
        // 清理测试数据
        if (insertData[0]?.id) {
          await supabase
            .from('tasks')
            .delete()
            .eq('id', insertData[0].id)
          console.log('   已清理测试数据')
        }
      }
    } catch (err) {
      console.log('❌ 插入操作异常:', err.message)
    }
    
  } catch (error) {
    console.log('❌ 连接测试过程中发生错误:', error.message)
    console.log('错误堆栈:', error.stack)
  }
}

testConnection().then(() => {
  console.log('\n📝 总结:')
  console.log('如果看到表不存在的错误，请在 Supabase SQL 编辑器中运行:')
  console.log(`
CREATE TABLE IF NOT EXISTS tasks (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  assignee TEXT NOT NULL,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS members (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous access" ON tasks FOR ALL USING (true);
CREATE POLICY "Allow anonymous access" ON members FOR ALL USING (true);
  `)
}) 