import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  try {
    const { reportId } = await params;

    if (!reportId || reportId === 'undefined' || reportId === 'null') {
      return NextResponse.json({ success: false, error: 'Invalid Report ID. Please open the report from your Host Dashboard.' }, { status: 400 });
    }

    // Public Demo Fallback
    if (reportId.includes('demo') || reportId.includes('sample')) {
      return NextResponse.json({
        success: true,
        report: {
          id: 'demo-report-123',
          property_id: 'demo',
          cleaner_name: 'Sunset Cleaning Crew (Public Demo)',
          started_at: new Date(Date.now() - 3600000 * 1.25).toISOString(),
          completed_at: new Date().toISOString(),
          start_latitude: 25.7617,
          start_longitude: -80.1918,
          notes: JSON.stringify({
            text: 'Unit left in S-tier condition. Checked all checkout protocols and locked up.',
            cleanerEmail: 'cleaner@sunsetstay.com',
            supplies: { toiletPaper: 'full', soap: 'full', trashBags: 'full', paperTowels: 'full' }
          }),
          airbnb_properties: {
            id: 'demo',
            name: 'Sunset Villa Luxury Suite (Public Demo)',
            address: '100 Ocean Drive, Suite 402, Miami Beach, FL 33139',
            cover_image_url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80|||manager@sunsetstay.com,host@sunsetstay.com'
          }
        },
        tasks: [
          { id: 'demo-task-1', task_name: '🧹 Living Room & Foyer Sanitize & Vacuum', requires_photo: true, completed: true, photo_url: 'https://images.unsplash.com/photo-1603618301084-d122295ab138?auto=format&fit=crop&w=600&q=80' },
          { id: 'demo-task-2', task_name: '🛏️ Master Bedroom Fresh Linen & Pillow Styling', requires_photo: true, completed: true, photo_url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80' },
          { id: 'demo-task-3', task_name: '🚿 Executive Bathroom Towels & Toiletries Restock', requires_photo: true, completed: true, photo_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80' },
          { id: 'demo-task-4', task_name: '🍳 Chef\'s Kitchen Appliances & Countertop Disinfection', requires_photo: true, completed: true, photo_url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80' },
          { id: 'demo-task-5', task_name: '🌊 Private Balcony Patio Furniture & Glass Door Wipe', requires_photo: true, completed: true, photo_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80' },
          { id: 'demo-task-6', task_name: '🔑 Keypad Lock & Smart Thermostat Reset to 72°F', requires_photo: false, completed: true, photo_url: null }
        ]
      });
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
