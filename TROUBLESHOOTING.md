# Supabase 连接故障排除指南

## 问题诊断步骤

### 1. 检查环境变量
```bash
node check-env.js
```

### 2. 测试 Supabase 连接
```bash
node test-supabase-connection.js
```

### 3. 检查数据库表
```bash
node check-tables.js
```

## 常见问题及解决方案

### 问题 1: 环境变量未设置
**症状**: 控制台显示 "环境变量未设置"
**解决**: 
1. 创建 `.env.local` 文件
2. 添加正确的 Supabase 配置

### 问题 2: 表不存在
**症状**: 错误代码 `42P01` 或 "表不存在"
**解决**: 在 Supabase SQL 编辑器中运行创建表的 SQL

### 问题 3: 权限不足
**症状**: 错误代码 `42501`
**解决**: 设置正确的 RLS 策略

### 问题 4: 网络连接问题
**症状**: 网络错误或超时
**解决**: 检查网络连接和 Supabase 项目状态

## 完整修复流程

### 步骤 1: 验证环境变量
```bash
node check-env.js
```

### 步骤 2: 测试连接
```bash
node test-supabase-connection.js
```

### 步骤 3: 创建数据库表
在 Supabase SQL 编辑器中运行：

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

### 步骤 4: 验证修复
1. 刷新浏览器页面
2. 检查控制台是否还有错误
3. 尝试创建任务和成员

## 错误代码说明

- `42P01`: 表不存在
- `42501`: 权限不足
- `23505`: 数据重复
- `PGRST116`: 数据库连接问题

## 联系支持

如果问题仍然存在，请提供：
1. 环境变量检查结果
2. 连接测试结果
3. 浏览器控制台错误信息
4. Supabase 项目状态截图 