require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 测试 Supabase 连接...\n');

// 获取环境变量
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('📋 环境变量检查:');
console.log(`  URL: ${supabaseUrl ? '✅ 已设置' : '❌ 未设置'}`);
console.log(`  Key: ${supabaseAnonKey ? '✅ 已设置' : '❌ 未设置'}`);

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('\n❌ 错误: 环境变量未正确设置');
  process.exit(1);
}

// 创建 Supabase 客户端
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('\n🔗 测试数据库连接...');
    
    // 测试1: 检查 tasks 表
    console.log('\n📋 测试 tasks 表...');
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('count')
      .limit(1);
    
    if (tasksError) {
      console.log(`❌ tasks 表错误: ${tasksError.message}`);
      console.log(`   错误代码: ${tasksError.code}`);
      console.log(`   错误详情: ${tasksError.details}`);
    } else {
      console.log('✅ tasks 表连接成功');
    }
    
    // 测试2: 检查 members 表
    console.log('\n📋 测试 members 表...');
    const { data: membersData, error: membersError } = await supabase
      .from('members')
      .select('count')
      .limit(1);
    
    if (membersError) {
      console.log(`❌ members 表错误: ${membersError.message}`);
      console.log(`   错误代码: ${membersError.code}`);
      console.log(`   错误详情: ${membersError.details}`);
    } else {
      console.log('✅ members 表连接成功');
    }
    
    // 测试3: 尝试插入测试数据
    console.log('\n📋 测试插入数据...');
    const { data: insertData, error: insertError } = await supabase
      .from('tasks')
      .insert([{
        title: '测试任务',
        assignee: '测试用户',
        due_date: new Date().toISOString().split('T')[0],
        status: 'pending'
      }])
      .select();
    
    if (insertError) {
      console.log(`❌ 插入数据失败: ${insertError.message}`);
      console.log(`   错误代码: ${insertError.code}`);
      console.log(`   错误详情: ${insertError.details}`);
      console.log(`   错误提示: ${insertError.hint}`);
    } else {
      console.log('✅ 插入数据成功');
      console.log('   插入的数据:', insertData);
      
      // 删除测试数据
      if (insertData && insertData[0]) {
        const { error: deleteError } = await supabase
          .from('tasks')
          .delete()
          .eq('id', insertData[0].id);
        
        if (deleteError) {
          console.log(`⚠️  删除测试数据失败: ${deleteError.message}`);
        } else {
          console.log('✅ 测试数据已清理');
        }
      }
    }
    
  } catch (error) {
    console.log('❌ 连接测试失败:', error.message);
  }
}

testConnection(); 