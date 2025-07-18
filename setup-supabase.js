// Supabase 数据库设置脚本
// 这个脚本会帮助你设置 Supabase 数据库表

const { createClient } = require('@supabase/supabase-js')

// 从环境变量获取配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 错误: 请先设置 Supabase 环境变量')
  console.log('请创建 .env.local 文件并添加以下内容:')
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function setupDatabase() {
  console.log('🚀 开始设置 Supabase 数据库...')
  
  try {
    // 1. 创建任务表
    console.log('📋 创建任务表...')
    const { error: tasksError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS tasks (
          id BIGSERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          assignee TEXT NOT NULL,
          due_date DATE NOT NULL,
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    if (tasksError) {
      console.log('⚠️  任务表可能已存在或需要手动创建')
    } else {
      console.log('✅ 任务表创建成功')
    }

    // 2. 创建成员表
    console.log('👥 创建成员表...')
    const { error: membersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS members (
          id BIGSERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    if (membersError) {
      console.log('⚠️  成员表可能已存在或需要手动创建')
    } else {
      console.log('✅ 成员表创建成功')
    }

    // 3. 创建库存商品表
    console.log('📦 创建库存商品表...')
    const { error: inventoryError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS inventory_items (
          id BIGSERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          stock INTEGER DEFAULT 0,
          threshold INTEGER DEFAULT 10,
          category_id TEXT DEFAULT 'default',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    })
    
    if (inventoryError) {
      console.log('⚠️  库存商品表可能已存在或需要手动创建')
    } else {
      console.log('✅ 库存商品表创建成功')
    }

    // 4. 插入示例数据
    console.log('📝 插入示例数据...')
    
    // 插入示例成员
    const { error: insertMembersError } = await supabase
      .from('members')
      .insert([
        { name: '张三' },
        { name: '李四' },
        { name: '王五' }
      ])
      .select()
    
    if (insertMembersError) {
      console.log('⚠️  示例成员数据可能已存在')
    } else {
      console.log('✅ 示例成员数据插入成功')
    }

    // 插入示例任务
    const { error: insertTasksError } = await supabase
      .from('tasks')
      .insert([
        { 
          title: '完成项目文档', 
          assignee: '张三', 
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'pending'
        },
        { 
          title: '代码审查', 
          assignee: '李四', 
          due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'pending'
        }
      ])
      .select()
    
    if (insertTasksError) {
      console.log('⚠️  示例任务数据可能已存在')
    } else {
      console.log('✅ 示例任务数据插入成功')
    }

    // 插入示例商品
    const { error: insertProductsError } = await supabase
      .from('inventory_items')
      .insert([
        { name: '笔记本电脑', stock: 15, threshold: 5 },
        { name: '办公椅', stock: 8, threshold: 3 },
        { name: '显示器', stock: 12, threshold: 4 }
      ])
      .select()
    
    if (insertProductsError) {
      console.log('⚠️  示例商品数据可能已存在')
    } else {
      console.log('✅ 示例商品数据插入成功')
    }

    console.log('🎉 Supabase 数据库设置完成!')
    console.log('现在你可以访问应用查看数据了')

  } catch (error) {
    console.error('❌ 设置过程中发生错误:', error.message)
    console.log('请手动在 Supabase SQL 编辑器中运行 database-setup.sql 文件中的 SQL 语句')
  }
}

setupDatabase() 