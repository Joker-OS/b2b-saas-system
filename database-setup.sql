-- B2B SaaS 管理系统数据库初始化脚本
-- 请在 Supabase SQL 编辑器中运行此脚本

-- 创建任务表
CREATE TABLE IF NOT EXISTS tasks (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
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

-- 插入示例数据（可选）
INSERT INTO members (name) VALUES 
  ('张三'),
  ('李四'),
  ('王五')
ON CONFLICT DO NOTHING;

INSERT INTO tasks (title, description, assignee, due_date, status) VALUES 
  ('完成项目文档', '编写详细的项目技术文档和用户手册', '张三', CURRENT_DATE + INTERVAL '7 days', 'pending'),
  ('代码审查', '对核心模块进行代码质量检查和优化建议', '李四', CURRENT_DATE + INTERVAL '3 days', 'pending'),
  ('用户测试', '组织用户进行功能测试和反馈收集', '王五', CURRENT_DATE + INTERVAL '5 days', 'pending')
ON CONFLICT DO NOTHING;

INSERT INTO inventory_items (name, stock, threshold) VALUES 
  ('笔记本电脑', 15, 5),
  ('办公椅', 8, 3),
  ('显示器', 12, 4)
ON CONFLICT DO NOTHING;

-- 设置 RLS 策略（开发环境 - 允许所有访问）
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- 删除现有策略（如果存在）
DROP POLICY IF EXISTS "Allow anonymous access" ON tasks;
DROP POLICY IF EXISTS "Allow anonymous access" ON members;
DROP POLICY IF EXISTS "Allow anonymous access" ON inventory_items;

-- 创建允许匿名访问的策略（仅用于开发环境）
CREATE POLICY "Allow anonymous access" ON tasks FOR ALL USING (true);
CREATE POLICY "Allow anonymous access" ON members FOR ALL USING (true);
CREATE POLICY "Allow anonymous access" ON inventory_items FOR ALL USING (true);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_inventory_stock ON inventory_items(stock);
CREATE INDEX IF NOT EXISTS idx_members_name ON members(name); 