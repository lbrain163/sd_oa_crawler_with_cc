# 日报导入工具

上传 Excel 文件，将日报数据导入 Supabase 数据库。

## 技术栈

- Next.js 14 (App Router)
- Tailwind CSS
- xlsx (SheetJS)
- Supabase

## 开发

```bash
npm install
npm run dev
```

## 环境变量

```env
NEXT_PUBLIC_SUPABASE_URL=https://bkdrhorayjkqncnilwij.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 部署

自动部署到 Vercel，详情见 `.github/workflows/ci.yml`。

## Supabase 表结构

```sql
CREATE TABLE daily_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submitter_name VARCHAR(64),
  work_date DATE,
  day_type VARCHAR(16),
  work_mode VARCHAR(16),
  project_name VARCHAR(64),
  task_name VARCHAR(64),
  work_ratio INTEGER,
  work_content TEXT,
  approver_name VARCHAR(64),
  approval_status VARCHAR(16),
  approval_time TIMESTAMP,
  approval_comment VARCHAR(64),
  created_at TIMESTAMP DEFAULT now()
);

CREATE UNIQUE INDEX idx_daily_reports_unique
  ON daily_reports (project_name, submitter_name, work_date, task_name);
```
