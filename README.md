# B2B SaaS 管理系统

这是一个基于 Next.js 和 Supabase 的 B2B SaaS 管理系统，提供任务管理、成员管理、库存管理等功能。

## 功能特性

- 📋 任务管理：创建、分配、跟踪任务状态
- 👥 成员管理：添加和管理团队成员
- 📦 库存管理：商品入库、出库、库存预警
- 📊 数据概览：实时统计和进度展示

## 技术栈

- **前端**: Next.js 15, React 19, TypeScript
- **UI 组件**: Shadcn UI, Radix UI, Tailwind CSS
- **后端**: Supabase (PostgreSQL)
- **状态管理**: React Hooks

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 设置 Supabase

1. 在 [Supabase](https://supabase.com) 创建新项目
2. 获取项目 URL 和匿名密钥
3. 创建 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 创建数据库表

在 Supabase SQL 编辑器中运行以下 SQL 语句：

```sql
-- 创建任务表
CREATE TABLE tasks (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  assignee TEXT NOT NULL,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建成员表
CREATE TABLE members (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建库存商品表
CREATE TABLE inventory_items (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  stock INTEGER DEFAULT 0,
  threshold INTEGER DEFAULT 10,
  category_id TEXT DEFAULT 'default',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 设置 RLS 策略（可选，用于生产环境）
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- 允许匿名用户访问（开发环境）
CREATE POLICY "Allow anonymous access" ON tasks FOR ALL USING (true);
CREATE POLICY "Allow anonymous access" ON members FOR ALL USING (true);
CREATE POLICY "Allow anonymous access" ON inventory_items FOR ALL USING (true);
```

### 4. 运行开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 项目结构

```
b2b-saas-system/
├── app/                    # Next.js App Router 页面
│   ├── page.tsx           # 首页/概览
│   ├── tasks/             # 任务管理
│   ├── members/           # 成员管理
│   ├── inventory/         # 库存管理
│   └── add-product/       # 添加商品
├── components/            # React 组件
│   ├── ui/               # Shadcn UI 组件
│   ├── app-sidebar.tsx   # 应用侧边栏
│   └── custom-sidebar.tsx # 自定义侧边栏
├── lib/                  # 工具库
│   ├── supabaseClient.ts # Supabase 客户端
│   ├── storage.ts        # 本地存储工具
│   └── utils.ts          # 通用工具函数
└── hooks/                # 自定义 Hooks
```

## 数据同步说明

- **任务管理**: 使用 Supabase 数据库存储
- **成员管理**: 使用 Supabase 数据库存储
- **库存管理**: 使用本地 localStorage（可扩展为 Supabase）

## 故障排除

### 常见问题

1. **Supabase 连接错误**
   - 检查环境变量是否正确设置
   - 确认 Supabase 项目是否正常运行
   - 检查网络连接

2. **数据库表不存在**
   - 运行上述 SQL 语句创建表
   - 检查表名是否正确

3. **权限错误**
   - 检查 RLS 策略设置
   - 确认匿名密钥权限

### 开发模式

如果遇到 Supabase 连接问题，系统会自动使用默认数据：

- 默认成员：张三、李四、王五
- 默认任务：示例任务
- 默认商品：示例商品

## 部署

### Vercel 部署

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 设置环境变量
4. 部署

### 其他平台

支持部署到任何支持 Next.js 的平台，如：
- Netlify
- Railway
- DigitalOcean App Platform

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License 