import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const { reportId } = await params;

    if (!reportId) {
      return NextResponse.json({ success: false, error: 'Report ID is required.' }, { status: 400 });
    }

    // Fetch the report details joined with property details
    const { data: report, error: reportError } = await supabaseAdmin
      .from('airbnb_reports')
      .select('*, airbnb_properties(*)')
      .eq('id', reportId)
      .maybeSingle();

    if (reportError) {
      return NextResponse.json({ success: false, error: reportError.message }, { status: 500 });
    }

    if (!report) {
      return NextResponse.json({ success: false, error: 'Report not found.' }, { status: 404 });
    }

    // Fetch the tasks for this report
    const { data: tasks, error: tasksError } = await supabaseAdmin
      .from('airbnb_report_tasks')
      .select('*')
      .eq('report_id', reportId)
      .order('created_at', { ascending: true });

    if (tasksError) {
      return NextResponse.json({ success: false, error: tasksError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      report,
      tasks
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
