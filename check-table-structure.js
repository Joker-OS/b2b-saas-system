require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

console.log('🔍 检查 Supabase 表结构...\n');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ 环境变量未设置');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTableStructure() {
  try {
    console.log('📋 检查 tasks 表结构...');
    
    // 尝试获取表结构信息
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .limit(1);
    
    if (tasksError) {
      console.log(`❌ 无法访问 tasks 表: ${tasksError.message}`);
      console.log(`   错误代码: ${tasksError.code}`);
      return;
    }
    
    console.log('✅ tasks 表存在');
    
    // 尝试插入一个测试记录来查看列结构
    const testTask = {
      title: '测试任务',
      assignee: '测试用户',
      due_date: new Date().toISOString().split('T')[0],
      status: 'pending'
    };
    
    console.log('\n📋 尝试插入测试数据...');
    console.log('   测试数据:', testTask);
    
    const { data: insertData, error: insertError } = await supabase
      .from('tasks')
      .insert([testTask])
      .select();
    
    if (insertError) {
      console.log(`❌ 插入失败: ${insertError.message}`);
      console.log(`   错误代码: ${insertError.code}`);
      console.log(`   错误详情: ${insertError.details}`);
      console.log(`   错误提示: ${insertError.hint}`);
      
      // 尝试不同的列名组合
      console.log('\n🔍 尝试不同的列名组合...');
      
      // 测试1: 使用 assignee_id 而不是 assignee
      const test1 = {
        title: '测试任务1',
        assignee_id: '测试用户',
        due_date: new Date().toISOString().split('T')[0],
        status: 'pending'
      };
      
      const { error: error1 } = await supabase
        .from('tasks')
        .insert([test1]);
      
      if (error1) {
        console.log(`   测试 assignee_id: ${error1.message}`);
      } else {
        console.log('   ✅ 使用 assignee_id 成功');
      }
      
      // 测试2: 使用 user_id 而不是 assignee
      const test2 = {
        title: '测试任务2',
        user_id: '测试用户',
        due_date: new Date().toISOString().split('T')[0],
        status: 'pending'
      };
      
      const { error: error2 } = await supabase
        .from('tasks')
        .insert([test2]);
      
      if (error2) {
        console.log(`   测试 user_id: ${error2.message}`);
      } else {
        console.log('   ✅ 使用 user_id 成功');
      }
      
      // 测试3: 只使用基本字段
      const test3 = {
        title: '测试任务3',
        due_date: new Date().toISOString().split('T')[0],
        status: 'pending'
      };
      
      const { error: error3 } = await supabase
        .from('tasks')
        .insert([test3]);
      
      if (error3) {
        console.log(`   测试基本字段: ${error3.message}`);
      } else {
        console.log('   ✅ 使用基本字段成功');
      }
      
    } else {
      console.log('✅ 插入成功');
      console.log('   插入的数据:', insertData);
      
      // 清理测试数据
      if (insertData && insertData[0]) {
        const { error: deleteError } = await supabase
          .from('tasks')
          .delete()
          .eq('id', insertData[0].id);
        
        if (!deleteError) {
          console.log('✅ 测试数据已清理');
        }
      }
    }
    
    // 检查 members 表
    console.log('\n📋 检查 members 表...');
    const { data: membersData, error: membersError } = await supabase
      .from('members')
      .select('*')
      .limit(1);
    
    if (membersError) {
      console.log(`❌ 无法访问 members 表: ${membersError.message}`);
    } else {
      console.log('✅ members 表存在');
      console.log('   示例数据:', membersData);
    }
    
  } catch (error) {
    console.log('❌ 检查失败:', error.message);
  }
}

checkTableStructure(); 