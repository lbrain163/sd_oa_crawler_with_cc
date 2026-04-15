import * as XLSX from 'xlsx';

export interface DailyReportRow {
  submitter_name: string;
  work_date: string;
  day_type: string;
  work_mode: string;
  project_name: string;
  task_name: string;
  work_ratio: number;
  work_content: string;
  approver_name: string;
  approval_status: string;
  approval_time: string;
  approval_comment: string;
}

const COLUMN_MAP: Record<string, keyof DailyReportRow> = {
  '提交人名称': 'submitter_name',
  '出勤日期': 'work_date',
  '工作日/节假日': 'day_type',
  '工作情形': 'work_mode',
  '项目名称': 'project_name',
  '任务名称': 'task_name',
  '工作量占比': 'work_ratio',
  '工作内容': 'work_content',
  '审批人名称': 'approver_name',
  '审批状态': 'approval_status',
  '审批时间': 'approval_time',
  '审批意见': 'approval_comment',
};

export function parseExcel(buffer: ArrayBuffer): DailyReportRow[] {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

  if (json.length === 0) return [];

  const headers = Object.keys(json[0]);

  return json.map((row) => {
    const mapped: DailyReportRow = {
      submitter_name: '',
      work_date: '',
      day_type: '',
      work_mode: '',
      project_name: '',
      task_name: '',
      work_ratio: 100,
      work_content: '',
      approver_name: '',
      approval_status: '',
      approval_time: '',
      approval_comment: '',
    };

    headers.forEach((header) => {
      const key = COLUMN_MAP[header];
      if (key) {
        const value = row[header];
        if (key === 'work_ratio') {
          mapped[key] = typeof value === 'number' ? value : parseInt(String(value), 10) || 100;
        } else {
          mapped[key] = String(value ?? '');
        }
      }
    });

    return mapped;
  });
}
