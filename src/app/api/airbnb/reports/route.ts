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

async function sendResendAlertEmail({
  toEmails,
  alertType,
  propertyName,
  cleanerName,
  description,
  photos
}: {
  toEmails: string[];
  alertType: string;
  propertyName: string;
  cleanerName: string;
  description: string;
  photos: string[];
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[RESEND API KEY MISSING] Cannot dispatch alert email');
    return;
  }
  const isDamage = alertType === 'damage';
  const subject = isDamage 
    ? `🚨 TurnProofs Urgent Alert: Broken Item / Property Damage Reported!`
    : `🎒 TurnProofs Alert: Guest Lost & Found Item Logged!`;

  const photoHtml = photos.length > 0
    ? `<div style="margin-top: 15px;">
        <p style="font-weight: bold; font-size: 12px; color: #4b5563; text-transform: uppercase;">Attached Photo Evidence (${photos.length}):</p>
        <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 8px;">
          ${photos.map(p => `<a href="${p}" target="_blank"><img src="${p}" style="height: 120px; width: 120px; object-fit: cover; border-radius: 8px; border: 1px solid #d1d5db;" /></a>`).join('')}
        </div>
      </div>`
    : '';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; padding: 24px;">
      <div style="border-bottom: 2px solid ${isDamage ? '#ef4444' : '#f59e0b'}; padding-bottom: 16px; margin-bottom: 20px;">
        <span style="background: ${isDamage ? '#fee2e2' : '#fef3c7'}; color: ${isDamage ? '#991b1b' : '#92400e'}; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase;">
          ${isDamage ? '⚠️ Immediate Action Required' : '🎒 Guest Belongings Logged'}
        </span>
        <h1 style="font-size: 20px; font-weight: 800; color: #111827; margin: 12px 0 4px 0;">
          ${isDamage ? '🚨 Property Damage / Broken Item Alert' : '🎒 Guest Lost & Found Report'}
        </h1>
        <p style="font-size: 13px; color: #6b7280; margin: 0;">Dispatched BEFORE checkout from cleaner mobile terminal</p>
      </div>

      <div style="background: #f9fafb; border: 1px solid #f3f4f6; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
        <p style="margin: 0 0 8px 0; font-size: 13px; color: #374151;"><strong>Property:</strong> ${propertyName}</p>
        <p style="margin: 0 0 8px 0; font-size: 13px; color: #374151;"><strong>Cleaner:</strong> ${cleanerName}</p>
        <p style="margin: 0; font-size: 13px; color: #374151;"><strong>Reported at:</strong> ${new Date().toLocaleString()}</p>
      </div>

      <div style="margin-bottom: 20px;">
        <p style="font-size: 12px; font-weight: bold; color: #4b5563; text-transform: uppercase; margin-bottom: 6px;">Details & Notes:</p>
        <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px; font-size: 14px; color: #111827; line-height: 1.5; font-weight: 500;">
          ${description}
        </div>
      </div>

      ${photoHtml}

      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f3f4f6; text-align: center;">
        <p style="font-size: 11px; color: #9ca3af; margin: 0;">TurnProofs Automated Mobile Verification & Host Dispatch System</p>
      </div>
    </div>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'TurnProofs <onboarding@resend.dev>',
        to: toEmails.length > 0 ? toEmails : ['yeabidj@gmail.com'],
        subject,
        html
      })
    });
    const resData = await res.json();
    console.log('[RESEND ALERT EMAIL SENT]:', res.status, resData);
  } catch (err) {
    console.error('Failed to send Resend alert email:', err);
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

    // Support alias host accounts (yeabidj@gmail.com & support@turnproofs.com)
    const { data: sisterHosts } = await supabaseAdmin
      .from('airbnb_hosts')
      .select('id')
      .in('email', ['yeabidj@gmail.com', 'support@turnproofs.com']);
    
    const hostIds = (sisterHosts && ['yeabidj@gmail.com', 'support@turnproofs.com'].includes(host.email))
      ? sisterHosts.map((h: any) => h.id)
      : [host.id];

    // First get properties owned by this host
    const { data: properties, error: propError } = await supabaseAdmin
      .from('airbnb_properties')
      .select('id')
      .in('host_id', hostIds);

    if (propError) {
      return NextResponse.json({ success: false, error: propError.message }, { status: 500 });
    }

    const propertyIds = (properties || []).map((p: any) => p.id);
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
        .select('name, cover_image_url, host_id')
        .eq('id', property_id)
        .maybeSingle();

      const recipientEmails: string[] = ['support@turnproofs.com'];
      if (property && property.cover_image_url?.includes('|||')) {
        const custom = property.cover_image_url.split('|||')[1];
        if (custom) {
          custom.split(',').forEach((e: string) => {
            if (e.trim() && !recipientEmails.includes(e.trim())) {
              recipientEmails.push(e.trim());
            }
          });
        }
      }

      if (property && property.host_id) {
        const { data: hostObj } = await supabaseAdmin
          .from('airbnb_hosts')
          .select('email')
          .eq('id', property.host_id)
          .maybeSingle();

        if (hostObj && hostObj.email && !recipientEmails.includes(hostObj.email)) {
          recipientEmails.push(hostObj.email);
        }
      }

      const photosList = photoUrl ? photoUrl.split('|||').filter(Boolean) : [];

      console.log(`\n==================================================`);
      console.log(`🚨 [INSTANT URGENT ALERT DISPATCHED BEFORE CHECKOUT]`);
      console.log(`Alert Type: ${alertType === 'damage' ? '⚠️ DAMAGE / BROKEN ITEM' : '🎒 GUEST LOST & FOUND'}`);
      console.log(`Property: "${property?.name || 'Vacation Unit'}"`);
      console.log(`Cleaner: "${cleaner_name}"`);
      console.log(`Details: "${description}"`);
      console.log(`Photos: ${photosList.length} attached`);
      console.log(`Recipients: ${recipientEmails.join(', ')}`);
      console.log(`==================================================\n`);

      // Dispatch real email via Resend API!
      await sendResendAlertEmail({
        toEmails: recipientEmails,
        alertType: alertType || 'lost_found',
        propertyName: property?.name || 'Vacation Rental Unit',
        cleanerName: cleaner_name || 'Cleaner',
        description: description || 'No details provided.',
        photos: photosList
      });

      return NextResponse.json({
        success: true,
        message: 'Urgent alert dispatched to host email immediately.'
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

    // Host Action: Request Touch-Up / Fix from Cleaner
    if (action === 'request_touchup') {
      const { reportId, touchup_items, host_notes } = body;
      if (!reportId || (!touchup_items?.length && !host_notes)) {
        return NextResponse.json({ success: false, error: 'Report ID and touch-up items/notes are required.' }, { status: 400 });
      }

      const { data: existingReport } = await supabaseAdmin
        .from('airbnb_reports')
        .select('notes, property_id, cleaner_name')
        .eq('id', reportId)
        .maybeSingle();

      if (!existingReport) {
        return NextResponse.json({ success: false, error: 'Report not found.' }, { status: 404 });
      }

      let notesObj: any = {};
      try {
        if (existingReport.notes) notesObj = JSON.parse(existingReport.notes);
      } catch (e) {
        notesObj = { rawNotes: existingReport.notes || '' };
      }

      const cleanerEmail = notesObj.cleanerEmail || '';

      notesObj.touchupRequest = {
        id: 'touchup_' + Date.now(),
        timestamp: new Date().toISOString(),
        items: touchup_items || [],
        notes: host_notes || '',
        status: 'pending'
      };

      const { error: updateErr } = await supabaseAdmin
        .from('airbnb_reports')
        .update({ notes: JSON.stringify(notesObj) })
        .eq('id', reportId);

      if (updateErr) {
        return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
      }

      // If cleaner email exists, send direct Touch-Up Notification Email via Resend
      if (cleanerEmail && cleanerEmail.includes('@')) {
        const apiKey = process.env.RESEND_API_KEY;
        if (apiKey) {
          const touchupUrl = `https://turnproofs.com/airbnb/clean/${existingReport.property_id}?reportId=${reportId}&mode=touchup`;
          const html = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; padding: 24px;">
              <div style="border-bottom: 2px solid #f59e0b; padding-bottom: 16px; margin-bottom: 20px;">
                <span style="background: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase;">
                  🔍 Host Touch-Up Requested
                </span>
                <h1 style="font-size: 20px; font-weight: 800; color: #111827; margin: 12px 0 4px 0;">
                  Quality Control Touch-Up Request
                </h1>
                <p style="font-size: 13px; color: #6b7280; margin: 0;">The host reviewed the cleaning report and requested a quick touch-up.</p>
              </div>

              <div style="background: #fffbebf5; border: 1px solid #fef3c7; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #92400e;">Requested Touch-Up Items:</p>
                <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #78350f;">
                  ${(touchup_items || []).map((item: string) => `<li style="margin-bottom: 4px;">${item}</li>`).join('')}
                </ul>
                ${host_notes ? `<p style="margin: 10px 0 0 0; font-size: 12px; color: #78350f; font-style: italic;"><strong>Host Notes:</strong> "${host_notes}"</p>` : ''}
              </div>

              <div style="text-align: center; margin: 24px 0;">
                <a href="${touchupUrl}" target="_blank" style="display: inline-block; background: #f59e0b; color: #ffffff; padding: 12px 24px; border-radius: 12px; font-size: 14px; font-weight: 800; text-decoration: none;">
                  📷 Open Mobile Touch-Up Terminal
                </a>
              </div>

              <p style="font-size: 11px; color: #9ca3af; text-align: center; margin: 0;">TurnProofs Automated Mobile Verification System</p>
            </div>
          `;

          try {
            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                from: 'TurnProofs <onboarding@resend.dev>',
                to: [cleanerEmail],
                subject: '🔍 TurnProofs Quality Control: Host Touch-Up Requested',
                html
              })
            });
          } catch (e) {
            console.error('Failed to send touch-up email:', e);
          }
        }
      }

      return NextResponse.json({ success: true, message: 'Touch-up request sent to cleaner.' });
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
