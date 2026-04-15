'use client';

import { useState, useCallback } from 'react';
import { parseExcel, DailyReportRow } from '@/lib/parseExcel';

interface FileUploaderProps {
  onDataLoaded: (rows: DailyReportRow[], total: number) => void;
  onError: (msg: string) => void;
}

export default function FileUploader({ onDataLoaded, onError }: FileUploaderProps) {
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (!file.name.match(/\.(xls|xlsx)$/i)) {
      onError('请上传 .xls 或 .xlsx 文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const rows = parseExcel(buffer);
        if (rows.length === 0) {
          onError('文件中没有数据');
          return;
        }
        onDataLoaded(rows, rows.length);
      } catch {
        onError('解析 Excel 文件失败');
      }
    };
    reader.readAsArrayBuffer(file);
  }, [onDataLoaded, onError]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
        dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      <input
        type="file"
        accept=".xls,.xlsx"
        onChange={onChange}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <div className="text-gray-600">
          <p className="text-lg mb-2">拖拽 Excel 文件到此处，或点击选择</p>
          <p className="text-sm text-gray-400">支持 .xls / .xlsx 格式</p>
        </div>
      </label>
    </div>
  );
}
