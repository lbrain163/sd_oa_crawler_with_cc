# 日报 Excel 导入系统设计

## 概述

一个简约的 Web 应用，用于上传 Excel 文件并将其中的日报数据写入 Supabase 数据库。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 14 (App Router) |
| 样式 | Tailwind CSS |
| Excel 解析 | xlsx (SheetJS) |
| 数据库 | Supabase (PostgreSQL) |
| 部署 | Vercel（推荐） |

## 数据库表设计

**表名：`daily_reports`**

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | uuid | 主键，默认 `gen_random_uuid()` |
| submitter_name | varchar(64) | 提交人名称 |
| work_date | date | 出勤日期 |
| day_type | varchar(16) | 工作日/节假日 |
| work_mode | varchar(16) | 工作情形（现场出勤/远程） |
| project_name | varchar(64) | 项目名称 |
| task_name | varchar(64) | 任务名称 |
| work_ratio | integer | 工作量占比（%） |
| work_content | text | 工作内容 |
| approver_name | varchar(64) | 审批人名称 |
| approval_status | varchar(16) | 审批状态 |
| approval_time | timestamp | 审批时间 |
| approval_comment | varchar(64) | 审批意见 |
| created_at | timestamp | 记录创建时间，默认 `now()` |

**DDL：**
```sql
CREATE TABLE daily_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submitter_name VARCHAR(64),                -- 提交人名称
  work_date DATE,                            -- 出勤日期
  day_type VARCHAR(16),                      -- 工作日/节假日
  work_mode VARCHAR(16),                    -- 工作情形（现场出勤/远程）
  project_name VARCHAR(64),                  -- 项目名称
  task_name VARCHAR(64),                    -- 任务名称
  work_ratio INTEGER,                        -- 工作量占比（%）
  work_content TEXT,                         -- 工作内容
  approver_name VARCHAR(64),                -- 审批人名称
  approval_status VARCHAR(16),              -- 审批状态
  approval_time TIMESTAMP,                   -- 审批时间
  approval_comment VARCHAR(64),              -- 审批意见
  created_at TIMESTAMP DEFAULT now()         -- 记录创建时间
);

COMMENT ON TABLE daily_reports IS '日报数据表';
COMMENT ON COLUMN daily_reports.id IS '主键UUID';
COMMENT ON COLUMN daily_reports.submitter_name IS '提交人名称';
COMMENT ON COLUMN daily_reports.work_date IS '出勤日期';
COMMENT ON COLUMN daily_reports.day_type IS '工作日/节假日';
COMMENT ON COLUMN daily_reports.work_mode IS '工作情形（现场出勤/远程）';
COMMENT ON COLUMN daily_reports.project_name IS '项目名称';
COMMENT ON COLUMN daily_reports.task_name IS '任务名称';
COMMENT ON COLUMN daily_reports.work_ratio IS '工作量占比（%）';
COMMENT ON COLUMN daily_reports.work_content IS '工作内容';
COMMENT ON COLUMN daily_reports.approver_name IS '审批人名称';
COMMENT ON COLUMN daily_reports.approval_status IS '审批状态';
COMMENT ON COLUMN daily_reports.approval_time IS '审批时间';
COMMENT ON COLUMN daily_reports.approval_comment IS '审批意见';
COMMENT ON COLUMN daily_reports.created_at IS '记录创建时间';

-- 唯一索引：防止重复录入（同一项目、提交人、日期、任务）
CREATE UNIQUE INDEX idx_daily_reports_unique
  ON daily_reports (project_name, submitter_name, work_date, task_name);
```

**唯一索引：** `(project_name, submitter_name, work_date, task_name)` 用于快速定位重复记录。

**重复数据处理策略：** 先删后插（Delete-then-Insert）。导入时根据唯一索引匹配已有记录，匹配到则删除旧记录再插入新记录，实现覆盖更新。

**RLS 策略：** 由于是个人使用，RLS 暂时禁用（后续可按需开启）。

## 页面结构

### 首页 `/`

- 页面标题 + 简短说明
- 文件上传区域（支持拖拽或点击上传 `.xls` / `.xlsx`）
- 上传后显示数据预览表格（前 5 行 + 总行数）
- "确认导入" 按钮

### 结果页 `/upload`

- 导入结果统计（成功数 / 失败数）
- 如有失败显示错误详情
- "返回首页" 按钮

## 功能流程

```
上传 Excel 文件
    ↓
前端解析（xlsx 库）→ 预览表格（展示前5行 + 总行数）
    ↓
用户点击"确认导入"
    ↓
调用 API Route `/api/import`
    ↓
API 逐行处理：根据唯一索引匹配，匹配到则先删后插，未匹配则直接插入
    ↓
    ↓
返回结果（成功数 / 失败数）
    ↓
跳转到结果页显示结果
```

## API 设计

### POST `/api/import`

**请求体：**
```json
{
  "rows": [
    {
      "submitter_name": "刘伟",
      "work_date": "2026-04-01",
      "day_type": "工作日",
      "work_mode": "现场出勤",
      "project_name": "铁塔智联-两翼组件化541-4",
      "task_name": "小塔2.0.70版本-需求开发",
      "work_ratio": 100,
      "work_content": "开发小塔...",
      "approver_name": "梁冰",
      "approval_status": "已审批",
      "approval_time": "2026-04-03 09:10:07",
      "approval_comment": "同意"
    }
  ]
}
```

**响应：**
```json
{
  "success": true,
  "imported": 69,
  "updated": 5,
  "failed": 0,
  "errors": []
}
```

## 目录结构

```
/app
  /page.tsx              首页
  /upload/page.tsx       结果页
  /api/import/route.ts   导入 API
/components
  /FileUploader.tsx       文件上传组件
  /DataPreview.tsx        数据预览表格组件
/lib
  /supabase.ts           Supabase 客户端
  /parseExcel.ts         Excel 解析逻辑
```

## 环境变量

```
NEXT_PUBLIC_SUPABASE_URL=https://bkdrhorayjkqncnilwij.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Excel 列映射

| Excel 列名 | 数据库字段 |
|-----------|-----------|
| 提交人名称 | submitter_name |
| 出勤日期 | work_date |
| 工作日/节假日 | day_type |
| 工作情形 | work_mode |
| 项目名称 | project_name |
| 任务名称 | task_name |
| 工作量占比 | work_ratio |
| 工作内容 | work_content |
| 审批人名称 | approver_name |
| 审批状态 | approval_status |
| 审批时间 | approval_time |
| 审批意见 | approval_comment |
