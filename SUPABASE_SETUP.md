# Supabase 设置指南

## 快速设置步骤

### 1. 创建环境变量文件

在项目根目录创建 `.env.local` 文件，内容如下：

```env
NEXT_PUBLIC_SUPABASE_URL=你的_supabase_项目_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_supabase_匿名密钥
```

### 2. 获取 Supabase 配置

1. 访问 [Supabase](https://supabase.com)
2. 创建新项目或选择现有项目
3. 进入项目设置 → API
4. 复制以下信息：
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. 创建数据库表

在 Supabase 项目的 SQL 编辑器中运行以下 SQL 语句：

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

-- 设置 RLS 策略（开发环境）
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

### 4. 重启开发服务器

```bash
npm run dev
```

### 5. 验证连接

访问应用后，打开浏览器开发者工具的控制台，应该能看到：

```
Supabase 配置检查: {
  hasUrl: true,
  hasKey: true,
  url: "https://your-project.supabase.co...",
  hasValidConfig: true,
  isAvailable: true
}
```

## 故障排除

### 问题 1: 仍然显示"获取成员失败"

**解决方案：**
1. 检查 `.env.local` 文件是否正确创建
2. 确认 Supabase URL 和 Key 是否正确
3. 重启开发服务器
4. 检查 Supabase 项目是否正常运行

### 问题 2: 数据库表不存在

**解决方案：**
1. 在 Supabase SQL 编辑器中运行上述 SQL 语句
2. 检查 RLS 策略是否正确设置
3. 确认匿名密钥有足够权限

### 问题 3: 权限错误

**解决方案：**
1. 检查 RLS 策略设置
2. 确认使用的是 `anon public` 密钥，不是 `service_role` 密钥
3. 在 Supabase 项目设置中检查 API 权限

## 生产环境部署

部署到生产环境时，请确保：

1. 设置正确的环境变量
2. 配置适当的 RLS 策略
3. 使用 HTTPS 连接
4. 定期备份数据库

## 支持

如果遇到问题，请检查：
- Supabase 项目状态
- 网络连接
- 环境变量配置
- 数据库表结构 