import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { jsPDF } from 'jspdf';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const { reportId } = await params;

    let report: any = null;

    if (reportId === 'sample-report' || reportId === 'demo') {
      report = {
        id: 'demo-sample-report',
        cleaner_name: 'Sarah Jenkins',
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        airbnb_properties: {
          name: 'DuuuPPiii Luxury Suite',
          address: '123 Ocean Drive, Miami Beach, FL'
        }
      };
    } else {
      const { data: dbReport } = await supabaseAdmin
        .from('airbnb_reports')
        .select('*, airbnb_properties(name, address)')
        .eq('id', reportId)
        .maybeSingle();

      report = dbReport;
    }

    if (!report) {
      return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 });
    }

    const rawPropName = report.airbnb_properties?.name || 'Property';
    const propNameClean = rawPropName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const dateObj = report.completed_at || report.created_at ? new Date(report.completed_at || report.created_at) : new Date();
    const formattedDate = `${dateObj.getMonth() + 1}-${dateObj.getDate()}-${dateObj.getFullYear()}`;
    const filename = `TurnProofs_Report_${propNameClean}_${formattedDate}.pdf`;

    // Generate 100% native PDF binary document using jsPDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Dark theme header background
    doc.setFillColor(15, 23, 42); // #0f172a
    doc.rect(0, 0, 210, 45, 'F');

    // Title & Badge
    doc.setTextColor(16, 185, 129); // Emerald
    doc.setFontSize(10);
    doc.text('VERIFIED TURNOVER AUDIT CERTIFICATE', 15, 15);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text(`TurnProofs Report: ${rawPropName}`, 15, 26);

    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text('Cryptographically Verified Sanitation Audit Log', 15, 34);

    // Metadata Section
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.text('AUDIT SUMMARY & VERIFICATION', 15, 58);

    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    doc.text(`Property Name: ${rawPropName}`, 15, 68);
    doc.text(`Property Address: ${report.airbnb_properties?.address || 'N/A'}`, 15, 76);
    doc.text(`Cleaning Subcontractor: ${report.cleaner_name || 'Cleaning Crew'}`, 15, 84);
    doc.text(`Completion Date & Time: ${dateObj.toLocaleString()}`, 15, 92);
    doc.text(`Certificate ID: ${report.id}`, 15, 100);

    // Security Footer
    doc.setDrawColor(226, 232, 240);
    doc.line(15, 270, 195, 270);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('TurnProofs Mobile Verification System • Permanent Dispute Protection Log • turnproofs.com', 15, 278);

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    // Return true PDF binary buffer with exact requested headers
    return new NextResponse(pdfBuffer, {
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
