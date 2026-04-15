import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '日报导入',
  description: '上传 Excel 文件导入日报数据到 Supabase',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
