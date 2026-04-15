import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { DailyReportRow } from '@/lib/parseExcel';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rows: DailyReportRow[] = body.rows;

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: '无效的数据' }, { status: 400 });
    }

    let imported = 0;
    let updated = 0;
    let failed = 0;
    const errors: { row: number; message: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // Excel 行号（从 2 开始，第 1 行是表头）

      // 检查是否已存在
      const { data: existing } = await supabase
        .from('daily_reports')
        .select('id')
        .eq('project_name', row.project_name)
        .eq('submitter_name', row.submitter_name)
        .eq('work_date', row.work_date)
        .eq('task_name', row.task_name)
        .maybeSingle();

      if (existing) {
        // 先删
        const { error: deleteError } = await supabase
          .from('daily_reports')
          .delete()
          .eq('id', existing.id);

        if (deleteError) {
          failed++;
          errors.push({ row: rowNum, message: `删除旧记录失败: ${deleteError.message}` });
          continue;
        }
      }

      // 后插
      const { error: insertError } = await supabase
        .from('daily_reports')
        .insert({
          submitter_name: row.submitter_name,
          work_date: row.work_date,
          day_type: row.day_type,
          work_mode: row.work_mode,
          project_name: row.project_name,
          task_name: row.task_name,
          work_ratio: row.work_ratio,
          work_content: row.work_content,
          approver_name: row.approver_name,
          approval_status: row.approval_status,
          approval_time: row.approval_time || null,
          approval_comment: row.approval_comment,
        });

      if (insertError) {
        failed++;
        errors.push({ row: rowNum, message: insertError.message });
      } else {
        if (existing) {
          updated++;
        } else {
          imported++;
        }
      }
    }

    return NextResponse.json({
      success: failed === 0,
      total: rows.length,
      imported,
      updated,
      failed,
      errors,
    });
  } catch (err) {
    console.error('Import error:', err);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
