'use client';

import { DailyReportRow } from '@/lib/parseExcel';

interface DataPreviewProps {
  rows: DailyReportRow[];
  total: number;
}

export default function DataPreview({ rows, total }: DataPreviewProps) {
  const preview = rows.slice(0, 5);

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-medium">数据预览</h2>
        <span className="text-sm text-gray-500">共 {total} 条记录</span>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-gray-600">提交人</th>
              <th className="px-3 py-2 text-left text-gray-600">日期</th>
              <th className="px-3 py-2 text-left text-gray-600">类型</th>
              <th className="px-3 py-2 text-left text-gray-600">项目</th>
              <th className="px-3 py-2 text-left text-gray-600">任务</th>
              <th className="px-3 py-2 text-left text-gray-600">占比</th>
              <th className="px-3 py-2 text-left text-gray-600">审批状态</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {preview.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-3 py-2">{row.submitter_name}</td>
                <td className="px-3 py-2">{row.work_date}</td>
                <td className="px-3 py-2">{row.day_type}</td>
                <td className="px-3 py-2 max-w-[200px] truncate">{row.project_name}</td>
                <td className="px-3 py-2 max-w-[150px] truncate">{row.task_name}</td>
                <td className="px-3 py-2">{row.work_ratio}%</td>
                <td className="px-3 py-2">{row.approval_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {total > 5 && (
        <p className="text-sm text-gray-400 mt-2">显示前 5 条，其余 {total - 5} 条将在导入时处理</p>
      )}
    </div>
  );
}
