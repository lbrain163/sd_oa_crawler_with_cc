'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function UploadResultContent() {
  const params = useSearchParams();

  const total = parseInt(params.get('total') || '0', 10);
  const imported = parseInt(params.get('imported') || '0', 10);
  const updated = parseInt(params.get('updated') || '0', 10);
  const failed = parseInt(params.get('failed') || '0', 10);
  const errorsParam = params.get('errors');
  const errors = errorsParam ? JSON.parse(errorsParam) : [];

  return (
    <>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-gray-900">{total}</div>
          <div className="text-sm text-gray-500 mt-1">总记录数</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-green-600">{imported}</div>
          <div className="text-sm text-gray-500 mt-1">新增</div>
        </div>
        {updated > 0 ? (
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{updated}</div>
            <div className="text-sm text-gray-500 mt-1">更新</div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-gray-400">0</div>
            <div className="text-sm text-gray-500 mt-1">更新</div>
          </div>
        )}
      </div>

      {failed > 0 ? (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-600 font-medium mb-2">导入失败: {failed} 条</div>
          <ul className="text-sm text-red-500 space-y-1">
            {errors.map((err: { row: number; message: string }, i: number) => (
              <li key={i}>第 {err.row} 行: {err.message}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600">
          导入完成，所有记录已成功处理
        </div>
      )}

      <Link
        href="/"
        className="inline-block px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
      >
        返回首页
      </Link>
    </>
  );
}

function LoadingFallback() {
  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      <div className="bg-gray-50 rounded-lg p-4 text-center animate-pulse h-24" />
      <div className="bg-gray-50 rounded-lg p-4 text-center animate-pulse h-24" />
      <div className="bg-gray-50 rounded-lg p-4 text-center animate-pulse h-24" />
    </div>
  );
}

export default function UploadResultPage() {
  return (
    <main className="min-h-screen p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">导入结果</h1>
      <Suspense fallback={<LoadingFallback />}>
        <UploadResultContent />
      </Suspense>
    </main>
  );
}
