import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const { reportId } = await params;

    // Fetch report and property details
    const { data: report, error } = await supabaseAdmin
      .from('airbnb_reports')
      .select('*, airbnb_properties(name, address)')
      .eq('id', reportId)
      .maybeSingle();

    if (error || !report) {
      return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 });
    }

    const rawPropName = report.airbnb_properties?.name || 'Property';
    const propNameClean = rawPropName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dateObj = report.completed_at || report.created_at ? new Date(report.completed_at || report.created_at) : new Date();
    const formattedDate = `${dateObj.getMonth() + 1}-${dateObj.getDate()}-${dateObj.getFullYear()}`;
    const filename = `TurnProofs_Report_${propNameClean}_${formattedDate}.pdf`;

    // Render HTML content for PDF conversion
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${filename}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0a0a0a; color: #ffffff; padding: 32px; }
    .card { background: #171717; border: 1px solid #262626; border-radius: 20px; padding: 24px; margin-bottom: 20px; }
    .title { font-size: 24px; font-weight: 800; color: #10b981; margin-bottom: 8px; }
    .meta { font-size: 14px; color: #a3a3a3; line-height: 1.6; }
    .badge { display: inline-block; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #34d399; font-weight: 800; font-size: 11px; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">Verified Turnover Audit Certificate</span>
    <div class="title" style="margin-top: 12px;">TurnProofs Audit Report: ${rawPropName}</div>
    <div class="meta">
      <p><strong>Property Address:</strong> ${report.airbnb_properties?.address || 'N/A'}</p>
      <p><strong>Cleaner Name:</strong> ${report.cleaner_name || 'Cleaning Team'}</p>
      <p><strong>Checkout Date:</strong> ${dateObj.toLocaleString()}</p>
      <p><strong>Certificate ID:</strong> ${report.id}</p>
    </div>
  </div>
</body>
</html>`;

    // Return HTML / PDF response with exact requested headers
    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
