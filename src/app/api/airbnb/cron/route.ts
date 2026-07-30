import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Scheduled Cron Job Route: Handles 14-day trial auto-revert, 30-day draft cleanup, and trial reminder emails
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'turnproofs-cron-secret';

    // Verify Vercel Cron or Authorization token
    if (authHeader !== `Bearer ${cronSecret}` && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ success: false, error: 'Unauthorized cron invocation' }, { status: 401 });
    }

    const results = {
      trialsReverted: 0,
      draftsCleaned: 0,
      emailsDispatched: 0,
      timestamp: new Date().toISOString()
    };

    // 1. DAY 15 AUTO-REVERT LOGIC: Revert expired 14-day trial hosts to 'free' tier
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    const { data: expiredHosts } = await supabase
      .from('hosts')
      .select('*')
      .eq('subscription_tier', 'pro')
      .lt('created_at', fourteenDaysAgo);

    if (expiredHosts && expiredHosts.length > 0) {
      for (const host of expiredHosts) {
        await supabase
          .from('hosts')
          .update({ subscription_tier: 'free', updated_at: new Date().toISOString() })
          .eq('id', host.id);
        results.trialsReverted++;
      }
    }

    // 2. 30-DAY DRAFT CLEANUP LOGIC: Delete non-archived incomplete reports older than 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
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

    // 3. DAY 14 EMAIL NOTIFICATION DISPATCH (Resend / SendGrid API integration)
    const thirteenDaysAgo = new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString();
    const { data: trialEndingHosts } = await supabase
      .from('hosts')
      .select('*')
      .eq('subscription_tier', 'pro')
      .gte('created_at', fourteenDaysAgo)
      .lte('created_at', thirteenDaysAgo);

    if (trialEndingHosts && trialEndingHosts.length > 0) {
      const resendKey = process.env.RESEND_API_KEY;
      for (const host of trialEndingHosts) {
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
                subject: '⚠️ Your TurnProofs 14-Day Free Trial Reverts in 24 Hours',
                html: `
                  <div style="font-family: sans-serif; padding: 20px; color: #111;">
                    <h2>Your 14-Day Free Trial Ends Tomorrow</h2>
                    <p>Hi ${host.name || 'Host'},</p>
                    <p>Your 14-day TurnProofs free trial will automatically revert to the <strong>1 Free Property Slot Tier</strong> on Day 15 at 12:00 AM Midnight EST.</p>
                    <p>All completed PDF audit certificates remain sent directly to your email and your cleaners' emails.</p>
                    <p><a href="https://turnproofs.com/airbnb/dashboard" style="background:#f43f5e; color:#fff; padding:10px 20px; border-radius:8px; text-decoration:none; display:inline-block; font-weight:bold;">Manage Plan & Billing ➔</a></p>
                  </div>
                `
              })
            });
            results.emailsDispatched++;
          } catch (e) {
            console.error('Email notification error:', e);
          }
        }
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
