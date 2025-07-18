# 快速修复指南

## 当前问题
根据错误信息，主要问题是 **Supabase 数据库表不存在**。

## 立即解决方案

### 1. 运行表检查脚本
```bash
node check-tables.js
```

### 2. 在 Supabase 中创建表
访问你的 Supabase 项目 → SQL Editor → 运行以下 SQL：

```sql
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

-- 插入示例数据
INSERT INTO members (name) VALUES 
  ('张三'),
  ('李四'),
  ('王五')
ON CONFLICT DO NOTHING;

INSERT INTO tasks (title, assignee, due_date, status) VALUES 
  ('完成项目文档', '张三', CURRENT_DATE + INTERVAL '7 days', 'pending'),
  ('代码审查', '李四', CURRENT_DATE + INTERVAL '3 days', 'pending')
ON CONFLICT DO NOTHING;

INSERT INTO inventory_items (name, stock, threshold) VALUES 
  ('笔记本电脑', 15, 5),
  ('办公椅', 8, 3),
  ('显示器', 12, 4)
ON CONFLICT DO NOTHING;
```

### 3. 刷新应用
执行 SQL 后，刷新浏览器页面。

## 错误说明

### 400 错误
- **原因**: 数据库表不存在
- **解决**: 创建表结构

### CSS 404 错误
- **原因**: 外部库的 CSS 文件缺失
- **影响**: 不影响核心功能，可以忽略

### 任务创建失败
- **原因**: 表不存在导致插入失败
- **解决**: 创建表后即可正常使用

## 验证修复

修复后，你应该看到：
1. ✅ 不再有红色错误提示
2. ✅ 任务创建成功
3. ✅ 成员列表正常显示
4. ✅ 概览页面显示正确数据

## 如果仍有问题

1. 检查 `.env.local` 文件是否正确设置
2. 确认 Supabase 项目正常运行
3. 运行 `node check-tables.js` 检查表状态
4. 查看浏览器控制台的详细错误信息 