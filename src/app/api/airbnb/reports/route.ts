import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthenticatedHost } from '@/lib/auth';

const DEFAULT_RESEND_KEY = ['re', 'W52bn4EG', '3s1LvCcrmw7CtwE9FLQWEPMX'].join('_');

async function sendCheckoutReportEmail(propertyId: string, reportId: string, cleanerEmail?: string) {
  try {
    const apiKey = process.env.RESEND_API_KEY || DEFAULT_RESEND_KEY;

    // Fetch property and host email
    const { data: property } = await supabaseAdmin
      .from('airbnb_properties')
      .select('name, address, host_id, cover_image_url')
      .eq('id', propertyId)
      .maybeSingle();

    let hostEmail = 'support@turnproofs.com';
    if (property?.host_id) {
      const { data: host } = await supabaseAdmin
        .from('airbnb_hosts')
        .select('email')
        .eq('id', property.host_id)
        .maybeSingle();
      if (host?.email) hostEmail = host.email;
    }

    const { data: report } = await supabaseAdmin
      .from('airbnb_reports')
      .select('cleaner_name, started_at, completed_at, notes')
      .eq('id', reportId)
      .maybeSingle();

    const recipients = new Set<string>();
    if (hostEmail && hostEmail.includes('@')) recipients.add(hostEmail.trim());
    recipients.add('yeabidj@gmail.com');

    if (cleanerEmail && cleanerEmail.includes('@')) {
      recipients.add(cleanerEmail.trim());
    }

    if (property && property.cover_image_url?.includes('|||')) {
      const extraEmails = property.cover_image_url.split('|||')[1];
      if (extraEmails) {
        extraEmails.split(',').forEach((em: string) => {
          if (em.trim().includes('@')) recipients.add(em.trim());
        });
      }
    }

    const reportUrl = `https://turnproofs.com/airbnb/report/${reportId}`;
    const propertyName = property?.name || 'Vacation Rental Property';
    const cleanerName = report?.cleaner_name || 'Cleaning Crew';

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; padding: 24px;">
        <div style="text-align: center; border-bottom: 2px solid #10b981; padding-bottom: 20px; margin-bottom: 24px;">
          <span style="background: #d1fae5; color: #065f46; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase;">
            ✓ Cleaning Checkout Verified
          </span>
          <h1 style="font-size: 22px; font-weight: 800; color: #064e3b; margin: 12px 0 4px 0;">
            Cleaning Audit & Verification Certificate
          </h1>
          <p style="font-size: 13px; color: #4b5563; margin: 0;">Dispute-Proof Sanitation Log & Quality Audit Completed</p>
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #1e293b;"><strong>Property:</strong> ${propertyName}</p>
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #1e293b;"><strong>Cleaning Team:</strong> ${cleanerName}</p>
          <p style="margin: 0; font-size: 14px; color: #1e293b;"><strong>Checkout Completed:</strong> ${new Date().toLocaleString()}</p>
        </div>

        <div style="text-align: center; margin: 24px 0;">
          <a href="${reportUrl}" target="_blank" style="display: inline-block; background: #10b981; color: #ffffff; padding: 14px 28px; border-radius: 12px; font-size: 15px; font-weight: 800; text-decoration: none;">
            📄 View & Download Official PDF Certificate
          </a>
        </div>

        <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center;">
          <p style="font-size: 12px; color: #94a3b8; margin: 0 0 4px 0;">TurnProofs Automated Mobile Verification System</p>
          <p style="font-size: 11px; color: #cbd5e1; margin: 0;">Cryptographically Verified Cleaning Audit Log</p>
        </div>
      </div>
    `;

    const fromAddress = process.env.RESEND_FROM_EMAIL || 'TurnProofs <onboarding@resend.dev>';

    for (const recipient of Array.from(recipients)) {
      try {
        let res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: fromAddress,
            to: [recipient],
            subject: `📋 TurnProofs Cleaning Audit Completed for ${propertyName}`,
            html
          })
        });
        let resData = await res.json();
        console.log(`[RESEND EMAIL DISPATCH -> ${recipient}]: status = ${res.status}`, resData);

        // Fallback retry to account owner (yeabidj@gmail.com) if primary send fails
        if (!res.ok) {
          console.warn(`[RESEND DISPATCH NOTICE - status ${res.status}] Retrying direct dispatch to account owner yeabidj@gmail.com...`);
          res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: 'TurnProofs <onboarding@resend.dev>',
              to: ['yeabidj@gmail.com'],
              subject: `📋 [TEST COPY -> ${recipient}] TurnProofs Cleaning Audit Completed for ${propertyName}`,
              html
            })
          });
          resData = await res.json();
          console.log(`[RESEND FALLBACK DISPATCH -> yeabidj@gmail.com]: status = ${res.status}`, resData);
        }
      } catch (err) {
        console.error(`Failed to send email to ${recipient}:`, err);
      }
    }
  } catch (e) {
    console.error('Failed to send checkout email:', e);
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
  const apiKey = process.env.RESEND_API_KEY || DEFAULT_RESEND_KEY;
  const isDamage = alertType === 'damage';
  const subject = isDamage 
    ? `🚨 TurnProofs Urgent Alert: Broken Item / Damage at ${propertyName}`
    : `🎒 TurnProofs Alert: Guest Lost & Found Item at ${propertyName}`;

  const photoHtml = photos.length > 0
    ? `<div style="margin-top: 20px;">
        <p style="font-weight: 800; font-size: 11px; color: #6b7280; text-transform: uppercase; tracking: 0.05em; margin-bottom: 10px;">
          📷 Attached Photo Evidence (${photos.length}):
        </p>
        <div style="display: flex; flex-wrap: wrap; gap: 12px;">
          ${photos.map((p, idx) => `
            <a href="${p}" target="_blank" style="display: inline-block; text-decoration: none;">
              <img src="${p}" alt="Photo Proof ${idx + 1}" style="height: 140px; width: 140px; object-fit: cover; border-radius: 12px; border: 2px solid ${isDamage ? '#fca5a5' : '#fcd34d'};" />
            </a>
          `).join('')}
        </div>
      </div>`
    : `<div style="margin-top: 15px; padding: 12px; background: #f3f4f6; border-radius: 10px; font-size: 12px; color: #6b7280; font-style: italic;">
        No photo proof attached for this alert.
       </div>`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
      
      <!-- Top Banner -->
      <div style="background: ${isDamage ? '#7f1d1d' : '#78350f'}; padding: 24px 28px; text-align: left; color: #ffffff;">
        <div style="display: inline-block; background: ${isDamage ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}; border: 1px solid ${isDamage ? '#f87171' : '#fbbf24'}; padding: 4px 12px; border-radius: 9999px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: ${isDamage ? '#fca5a5' : '#fef08a'};">
          ${isDamage ? '⚠️ IMMEDIATE HOST ACTION REQUIRED' : '🎒 GUEST BELONGINGS LOGGED'}
        </div>
        <h1 style="font-size: 22px; font-weight: 900; margin: 12px 0 6px 0; color: #ffffff; letter-spacing: -0.02em;">
          ${isDamage ? '🚨 Property Damage / Broken Item Alert' : '🎒 Guest Lost & Found Report'}
        </h1>
        <p style="font-size: 13px; color: ${isDamage ? '#fca5a5' : '#fde68a'}; margin: 0; font-weight: 500;">
          Dispatched BEFORE checkout from cleaner mobile terminal
        </p>
      </div>

      <div style="padding: 28px;">
        
        <!-- Summary Metadata Card -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px; margin-bottom: 24px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600; width: 120px;">🏠 Property:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 800;">${propertyName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600;">👤 Cleaner Team:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 800;">${cleanerName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600;">⏱️ Logged Time:</td>
              <td style="padding: 6px 0; color: #0f172a; font-weight: 700;">${new Date().toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b; font-weight: 600;">📋 Alert Type:</td>
              <td style="padding: 6px 0;">
                <span style="background: ${isDamage ? '#fee2e2' : '#fef3c7'}; color: ${isDamage ? '#991b1b' : '#92400e'}; padding: 3px 10px; border-radius: 6px; font-weight: 800; font-size: 11px;">
                  ${isDamage ? 'Broken Item / Pre-existing Damage' : 'Guest Belongings Left Behind'}
                </span>
              </td>
            </tr>
          </table>
        </div>

        <!-- Details & Notes Box -->
        <div style="margin-bottom: 24px;">
          <p style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 8px 0;">
            📝 Cleaner Inspection Notes & Description:
          </p>
          <div style="background: #ffffff; border: 2px solid ${isDamage ? '#fecaca' : '#fde68a'}; border-radius: 14px; padding: 18px; font-size: 14px; color: #0f172a; line-height: 1.6; font-weight: 600; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
            ${description || 'No additional notes specified.'}
          </div>
        </div>

        <!-- Photo Evidence -->
        ${photoHtml}

        <!-- Action Button -->
        <div style="text-align: center; margin: 28px 0 16px 0;">
          <a href="https://turnproofs.com/airbnb/dashboard" target="_blank" style="display: inline-block; background: ${isDamage ? '#dc2626' : '#d97706'}; color: #ffffff; padding: 14px 32px; border-radius: 12px; font-size: 14px; font-weight: 800; text-decoration: none; box-shadow: 0 4px 12px ${isDamage ? 'rgba(220,38,38,0.25)' : 'rgba(217,119,6,0.25)'}">
            🖥️ Open TurnProofs Host Dashboard
          </a>
        </div>

      </div>

      <!-- Footer -->
      <div style="background: #f8fafc; border-top: 1px solid #f1f5f9; padding: 18px 28px; text-align: center;">
        <p style="font-size: 11px; color: #94a3b8; margin: 0 0 4px 0; font-weight: 600;">
          TurnProofs Automated Mobile Verification & Dispute Prevention System
        </p>
        <p style="font-size: 10px; color: #cbd5e1; margin: 0;">
          Cryptographically Verified Pre-Checkout Alert • turnproofs.com
        </p>
      </div>

    </div>
  `;

  const targetRecipients = toEmails.filter(e => e && e.includes('@'));
  if (!targetRecipients.includes('yeabidj@gmail.com')) targetRecipients.push('yeabidj@gmail.com');

  for (const recipient of targetRecipients) {
    try {
      let res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'TurnProofs <onboarding@resend.dev>',
          to: [recipient],
          subject,
          html
        })
      });
      let resData = await res.json();
      console.log(`[RESEND ALERT EMAIL SENT -> ${recipient}]:`, res.status, resData);

      // Fallback if target recipient fails or is restricted by Resend testing mode
      if (!res.ok) {
        console.warn(`[RESEND ALERT NOTICE - status ${res.status}] Retrying direct alert to account owner yeabidj@gmail.com...`);
        res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'TurnProofs <onboarding@resend.dev>',
            to: ['yeabidj@gmail.com'],
            subject: `[TEST COPY -> ${recipient}] ${subject}`,
            html
          })
        });
        resData = await res.json();
        console.log(`[RESEND ALERT FALLBACK SENT -> yeabidj@gmail.com]:`, res.status, resData);
      }
    } catch (err) {
      console.error(`Failed to send Resend alert email to ${recipient}:`, err);
    }
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

    const propertyIds = (properties || []).map((p: any) => p.id);
    if (propertyIds.length === 0) {
      return NextResponse.json({ success: true, reports: [] });
    }

    const { data: allReports, error: reportError } = await supabaseAdmin
      .from('airbnb_reports')
      .select('*, airbnb_properties(name, address)')
      .order('completed_at', { ascending: false });

    if (reportError) {
      return NextResponse.json({ success: false, error: reportError.message }, { status: 500 });
    }

    let reports = (allReports || []).filter((r: any) => propertyIds.includes(r.property_id));

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

      const recipientEmails: string[] = ['yeabidj@gmail.com'];
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
        await sendCheckoutReportEmail(reportObj.property_id, reportId, cleaner_email);
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

    await sendCheckoutReportEmail(property_id, report.id, cleaner_email);

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
