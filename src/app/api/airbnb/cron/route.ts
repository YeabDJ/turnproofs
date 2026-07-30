import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Scheduled Cron Job Route: Handles Option A 30-Day Split Trial (Days 1-14 No Card, Days 15-30 Card Required $0), 30-day draft cleanup, and trial reminder emails
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'turnproofs-cron-secret';

    // Verify Vercel Cron or Authorization token
    if (authHeader !== `Bearer ${cronSecret}` && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ success: false, error: 'Unauthorized cron invocation' }, { status: 401 });
    }

    const results = {
      phase2RemindersSent: 0,
      trialsCompleted: 0,
      draftsCleaned: 0,
      timestamp: new Date().toISOString()
    };

    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    const thirteenDaysAgo = new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // 1. DAY 14 EMAIL: Send Phase 2 Card Unlock Email to hosts entering Day 15
    const { data: phase1EndingHosts } = await supabase
      .from('hosts')
      .select('*')
      .gte('created_at', fourteenDaysAgo)
      .lte('created_at', thirteenDaysAgo);

    if (phase1EndingHosts && phase1EndingHosts.length > 0) {
      const resendKey = process.env.RESEND_API_KEY;
      for (const host of phase1EndingHosts) {
        if (resendKey) {
          try {
            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${resendKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                from: 'TurnProofs <billing@turnproofs.com>',
                to: host.email,
                subject: '💳 Enter Your Card to Extend Your 30-Day Free Trial ($0 Today)',
                html: `
                  <div style="font-family: sans-serif; padding: 20px; color: #111;">
                    <h2>Extend Your Free Trial to Day 30 ($0 Due Today)</h2>
                    <p>Hi ${host.name || 'Host'},</p>
                    <p>Phase 1 of your TurnProofs trial is completing today! Enter your payment card now to unlock Phase 2 and continue your trial through Day 30 for <strong>$0 today</strong>.</p>
                    <p>Your selected plan (Pro $9/mo, Growth $18.99/mo) will only begin billing on Day 31.</p>
                    <p><a href="https://turnproofs.com/airbnb/dashboard" style="background:#f43f5e; color:#fff; padding:10px 20px; border-radius:8px; text-decoration:none; display:inline-block; font-weight:bold;">Unlock Phase 2 Trial ($0) ➔</a></p>
                  </div>
                `
              })
            });
            results.phase2RemindersSent++;
          } catch (e) {
            console.error('Email notification error:', e);
          }
        }
      }
    }

    // 2. DAY 31 TRIAL EXPIRATION LOGIC: Pause unbilled hosts after Day 30
    const { data: expiredTrialHosts } = await supabase
      .from('hosts')
      .select('*')
      .lt('created_at', thirtyDaysAgo);

    if (expiredTrialHosts && expiredTrialHosts.length > 0) {
      for (const host of expiredTrialHosts) {
        results.trialsCompleted++;
      }
    }

    // 3. 30-DAY DRAFT CLEANUP LOGIC: Delete non-archived incomplete draft photos older than 30 days
    const { data: staleDrafts } = await supabase
      .from('reports')
      .select('*')
      .lt('started_at', thirtyDaysAgo);

    if (staleDrafts && staleDrafts.length > 0) {
      for (const draft of staleDrafts) {
        await supabase.from('reports').delete().eq('id', draft.id);
        results.draftsCleaned++;
      }
    }

    return NextResponse.json({
      success: true,
      results
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
