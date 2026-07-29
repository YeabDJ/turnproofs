import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthenticatedHost } from '@/lib/auth';

async function simulateAutoEmailReport(propertyId: string, reportId: string, cleanerEmail?: string) {
  try {
    const { data: property } = await supabaseAdmin
      .from('airbnb_properties')
      .select('name, cover_image_url')
      .eq('id', propertyId)
      .maybeSingle();

    const recipientsList: string[] = [];
    if (property && property.cover_image_url?.includes('|||')) {
      const facilityEmails = property.cover_image_url.split('|||')[1];
      if (facilityEmails && facilityEmails.trim()) {
        recipientsList.push(facilityEmails.trim());
      }
    }
    if (cleanerEmail && cleanerEmail.trim()) {
      recipientsList.push(cleanerEmail.trim());
    }

    if (recipientsList.length > 0) {
      console.log(`\n==================================================`);
      console.log(`[EMAIL SIMULATION] Dispatching Sanitation Compliance PDF Report!`);
      console.log(`Facility: "${property?.name || 'Vacation Unit'}"`);
      console.log(`Report ID: ${reportId}`);
      console.log(`Sending Auto-Emailed Certificate to: ${recipientsList.join(', ')}`);
      console.log(`==================================================\n`);
    }
  } catch (e) {
    console.error('Failed to run email simulation', e);
  }
}

// GET historical reports for host
export async function GET(request: NextRequest) {
  try {
    const host = await getAuthenticatedHost();
    if (!host) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');

    // First get properties owned by this host
    const { data: properties, error: propError } = await supabaseAdmin
      .from('airbnb_properties')
      .select('id')
      .eq('host_id', host.id);

    if (propError) {
      return NextResponse.json({ success: false, error: propError.message }, { status: 500 });
    }

    const propertyIds = properties.map(p => p.id);
    if (propertyIds.length === 0) {
      return NextResponse.json({ success: true, reports: [] });
    }

    let query = supabaseAdmin
      .from('airbnb_reports')
      .select('*, airbnb_properties(name, address)')
      .in('property_id', propertyIds);

    if (propertyId) {
      query = query.eq('property_id', propertyId);
    }

    const { data: reports, error: reportError } = await query.order('completed_at', { ascending: false });

    if (reportError) {
      return NextResponse.json({ success: false, error: reportError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, reports });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST handles cleaner actions: start_session, join_session, checkout_session, and legacy single checkout POST
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      action,
      property_id,
      cleaner_name,
      cleaner_email,
      started_at,
      completed_at,
      start_latitude,
      start_longitude,
      end_latitude,
      end_longitude,
      notes,
      tasks,
      reportId
    } = body;

    // Instant Alert Action: Send Red Flag or Lost & Found Email BEFORE Checkout
    if (action === 'instant_alert') {
      const { property_id, alertType, cleaner_name, description, photoUrl } = body;
      
      const { data: property } = await supabaseAdmin
        .from('airbnb_properties')
        .select('name, cover_image_url')
        .eq('id', property_id)
        .maybeSingle();

      const recipientEmails: string[] = [];
      if (property && property.cover_image_url?.includes('|||')) {
        const custom = property.cover_image_url.split('|||')[1];
        if (custom) {
          custom.split(',').forEach((e: string) => {
            if (e.trim()) recipientEmails.push(e.trim());
          });
        }
      }

      console.log(`\n==================================================`);
      console.log(`🚨 [INSTANT URGENT ALERT DISPATCHED BEFORE CHECKOUT]`);
      console.log(`Alert Type: ${alertType === 'damage' ? '⚠️ DAMAGE / BROKEN ITEM' : '🎒 GUEST LOST & FOUND'}`);
      console.log(`Property: "${property?.name || 'Vacation Unit'}"`);
      console.log(`Cleaner: "${cleaner_name}"`);
      console.log(`Details: "${description}"`);
      console.log(`Photo Log: ${photoUrl || 'None attached'}`);
      console.log(`Recipients: ${recipientEmails.length > 0 ? recipientEmails.join(', ') : 'Host Direct Email & support@turnproofs.com'}`);
      console.log(`==================================================\n`);

      return NextResponse.json({
        success: true,
        message: 'Urgent alert dispatched to host immediately before cleaning completion.'
      });
    }

    // Follow-up Quality Control Addendum (Host request / Cleaner retouch update)
    if (action === 'add_retouch_update') {
      const { reportId, author, text, photoUrl } = body;
      if (!reportId || !text) {
        return NextResponse.json({ success: false, error: 'Report ID and description are required.' }, { status: 400 });
      }

      const { data: existingReport } = await supabaseAdmin
        .from('airbnb_reports')
        .select('notes, property_id')
        .eq('id', reportId)
        .maybeSingle();

      let notesObj: any = {};
      try {
        if (existingReport?.notes) {
          notesObj = JSON.parse(existingReport.notes);
        }
      } catch (e) {
        notesObj = { rawNotes: existingReport?.notes || '' };
      }

      const retouches = notesObj.retouches || [];
      retouches.push({
        id: 'retouch_' + Date.now(),
        timestamp: new Date().toISOString(),
        author: author || 'Cleaner Retouch',
        text: text.trim(),
        photoUrl: photoUrl || null
      });

      notesObj.retouches = retouches;

      const { error: updateErr } = await supabaseAdmin
        .from('airbnb_reports')
        .update({ notes: JSON.stringify(notesObj) })
        .eq('id', reportId);

      if (updateErr) {
        return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Follow-up retouch addendum saved to report certificate.' });
    }

    // Collaborative Action: Start Session
    if (action === 'start_session') {
      if (!property_id || !cleaner_name) {
        return NextResponse.json({ success: false, error: 'Property ID and cleaner name are required.' }, { status: 400 });
      }

      // 1. Create active report
      const { data: report, error: reportError } = await supabaseAdmin
        .from('airbnb_reports')
        .insert({
          property_id,
          cleaner_name: cleaner_name.trim(),
          started_at: started_at || new Date().toISOString(),
          completed_at: started_at || new Date().toISOString(), // Initial same value
          start_latitude: start_latitude ? parseFloat(start_latitude) : null,
          start_longitude: start_longitude ? parseFloat(start_longitude) : null,
          notes: ''
        })
        .select('*')
        .single();

      if (reportError) {
        return NextResponse.json({ success: false, error: reportError.message }, { status: 500 });
      }

      // 2. Fetch templates for this property
      const { data: checklistTemplates, error: fetchErr } = await supabaseAdmin
        .from('airbnb_checklists')
        .select('*')
        .eq('property_id', property_id)
        .order('sort_order', { ascending: true });

      if (fetchErr) {
        return NextResponse.json({ success: false, error: fetchErr.message }, { status: 500 });
      }

      // 3. Populate report tasks
      if (checklistTemplates && checklistTemplates.length > 0) {
        const taskInserts = checklistTemplates.map((task: any) => ({
          report_id: report.id,
          task_name: task.task_name,
          requires_photo: !!task.requires_photo,
          photo_url: null,
          completed: false
        }));

        const { error: tasksError } = await supabaseAdmin
          .from('airbnb_report_tasks')
          .insert(taskInserts);

        if (tasksError) {
          console.error('Error inserting report tasks:', tasksError);
        }
      }

      return NextResponse.json({ success: true, reportId: report.id, report });
    }

    // Collaborative Action: Join Session
    if (action === 'join_session') {
      if (!reportId || !cleaner_name) {
        return NextResponse.json({ success: false, error: 'Report ID and cleaner name are required.' }, { status: 400 });
      }

      // Get current report
      const { data: report, error: getErr } = await supabaseAdmin
        .from('airbnb_reports')
        .select('cleaner_name')
        .eq('id', reportId)
        .maybeSingle();

      if (getErr || !report) {
        return NextResponse.json({ success: false, error: 'Cleaning session not found.' }, { status: 404 });
      }

      const currentNames = report.cleaner_name;
      const joinedName = cleaner_name.trim();
      let updatedNames = currentNames;

      if (!currentNames.includes(joinedName)) {
        updatedNames = `${currentNames} & ${joinedName}`;
      }

      const { data: updatedReport, error: updateErr } = await supabaseAdmin
        .from('airbnb_reports')
        .update({ cleaner_name: updatedNames })
        .eq('id', reportId)
        .select('*')
        .single();

      if (updateErr) {
        return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, report: updatedReport });
    }

    // Collaborative Action: Checkout/Finalize Session
    if (action === 'checkout_session') {
      if (!reportId) {
        return NextResponse.json({ success: false, error: 'Report ID is required.' }, { status: 400 });
      }

      // Fetch the property_id of this report before updating
      const { data: reportObj } = await supabaseAdmin
        .from('airbnb_reports')
        .select('property_id')
        .eq('id', reportId)
        .maybeSingle();

      const { error: updateErr } = await supabaseAdmin
        .from('airbnb_reports')
        .update({
          completed_at: completed_at || new Date().toISOString(),
          end_latitude: end_latitude ? parseFloat(end_latitude) : null,
          end_longitude: end_longitude ? parseFloat(end_longitude) : null,
          notes: notes?.trim() || ''
        })
        .eq('id', reportId);

      if (updateErr) {
        return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
      }

      if (reportObj) {
        await simulateAutoEmailReport(reportObj.property_id, reportId, cleaner_email);
      }

      return NextResponse.json({ success: true });
    }

    // --- LEGACY SINGLE STEP SUBMISSION ---
    if (!property_id || !cleaner_name) {
      return NextResponse.json({ success: false, error: 'Property ID and cleaner name are required.' }, { status: 400 });
    }

    // Insert the report
    const { data: report, error: reportError } = await supabaseAdmin
      .from('airbnb_reports')
      .insert({
        property_id,
        cleaner_name: cleaner_name.trim(),
        started_at: started_at || new Date().toISOString(),
        completed_at: completed_at || new Date().toISOString(),
        start_latitude: start_latitude ? parseFloat(start_latitude) : null,
        start_longitude: start_longitude ? parseFloat(start_longitude) : null,
        end_latitude: end_latitude ? parseFloat(end_latitude) : null,
        end_longitude: end_longitude ? parseFloat(end_longitude) : null,
        notes: notes?.trim() || ''
      })
      .select('*')
      .single();

    if (reportError) {
      return NextResponse.json({ success: false, error: reportError.message }, { status: 500 });
    }

    // Insert verification tasks linked to this report
    if (tasks && Array.isArray(tasks) && tasks.length > 0) {
      const taskInserts = tasks.map((task: any) => ({
        report_id: report.id,
        task_name: task.task_name,
        requires_photo: !!task.requires_photo,
        photo_url: task.photo_url || null,
        completed: !!task.completed
      }));

      const { error: tasksError } = await supabaseAdmin
        .from('airbnb_report_tasks')
        .insert(taskInserts);

      if (tasksError) {
        console.error('Error inserting report tasks:', tasksError);
      }
    }

    await simulateAutoEmailReport(property_id, report.id, cleaner_email);

    return NextResponse.json({ success: true, reportId: report.id, report });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT updates a single task's completion status in active reports (for real-time team checks)
export async function PUT(request: NextRequest) {
  try {
    const { taskId, completed, photoUrl } = await request.json();

    if (!taskId) {
      return NextResponse.json({ success: false, error: 'Task ID is required.' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('airbnb_report_tasks')
      .update({
        completed: !!completed,
        photo_url: photoUrl || null
      })
      .eq('id', taskId);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
