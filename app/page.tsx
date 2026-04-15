'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import FileUploader from '@/components/FileUploader';
import DataPreview from '@/components/DataPreview';
import { DailyReportRow } from '@/lib/parseExcel';

export default function HomePage() {
  const router = useRouter();
  const [rows, setRows] = useState<DailyReportRow[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDataLoaded = useCallback((data: DailyReportRow[], count: number) => {
    setRows(data);
    setTotal(count);
    setError('');
  }, []);

  const handleError = useCallback((msg: string) => {
    setError(msg);
    setRows([]);
    setTotal(0);
  }, []);

  const handleImport = async () => {
    if (rows.length === 0) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '导入失败');
        setLoading(false);
        return;
      }

      // 跳转到结果页
      const params = new URLSearchParams({
        total: String(data.total),
        imported: String(data.imported),
        updated: String(data.updated || 0),
        failed: String(data.failed),
      });

      if (data.errors.length > 0) {
        params.set('errors', JSON.stringify(data.errors));
      }

      router.push(`/upload?${params.toString()}`);
    } catch {
      setError('网络错误，请重试');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">日报导入</h1>
      <p className="text-gray-500 mb-8">上传 Excel 文件，将日报数据导入 Supabase 数据库</p>

      <FileUploader onDataLoaded={handleDataLoaded} onError={handleError} />

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      {rows.length > 0 && (
        <>
          <DataPreview rows={rows} total={total} />

          <div className="mt-6 flex gap-4">
            <button
              onClick={handleImport}
              disabled={loading}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? '导入中...' : '确认导入'}
            </button>

            <button
              onClick={() => { setRows([]); setTotal(0); }}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              重新选择
            </button>
          </div>
        </>
      )}
    </main>
  );
}
