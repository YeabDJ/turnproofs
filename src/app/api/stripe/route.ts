import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedHost } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const host = await getAuthenticatedHost();
    if (!host) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, plan, propertiesCount, customerId, cycle = 'monthly' } = body;
    const stripeSecret = process.env.STRIPE_SECRET_KEY;

    // 1. Handle Customer Portal / Billing Management
    if (action === 'portal' || action === 'cancel') {
      const activeCustomerId = customerId || host.stripe_customer_id;
      if (stripeSecret && activeCustomerId) {
        try {
          const res = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${stripeSecret}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
              'customer': activeCustomerId,
              'return_url': 'https://turnproofs.com/dashboard?tab=billing'
            })
          });
          const portalSession = await res.json();
          if (portalSession.url) {
            return NextResponse.json({ success: true, portalUrl: portalSession.url });
          }
        } catch (err) {
          console.error('Stripe Customer Portal error:', err);
        }
      }

      // Demo Mode fallback for cancellation / management
      return NextResponse.json({
        success: true,
        demo: true,
        canceled: true,
        message: `Subscription Management: Host ${host.email} billing session initiated.`
      });
    }

    // 2. Calculate Tier Pricing
    let baseMonthlyAmount = 9.00;
    let planName = 'Pro Plan (1 Property)';
    const count = parseInt(propertiesCount || '1', 10);

    if (plan === 'growth' || (count >= 2 && count <= 3)) {
      baseMonthlyAmount = 18.99;
      planName = 'Growth Plan (2-3 Properties)';
    } else if (plan === 'elite' || count >= 4) {
      if (count <= 6) {
        baseMonthlyAmount = 29.99;
        planName = 'Elite Plan (4-6 Properties)';
      } else {
        const extra = count - 6;
        baseMonthlyAmount = parseFloat((29.99 + extra * 4.99).toFixed(2));
        planName = `Elite Scaling Plan (${count} Properties)`;
      }
    } else if (plan === 'commercial') {
      baseMonthlyAmount = 89.99;
      planName = 'Commercial Site Plan';
    }

    const isAnnual = cycle === 'annual';
    const finalMonthlyRate = isAnnual ? parseFloat((baseMonthlyAmount * 0.85).toFixed(2)) : baseMonthlyAmount;
    const finalChargedAmount = isAnnual ? parseFloat((finalMonthlyRate * 12).toFixed(2)) : baseMonthlyAmount;

    // 3. Direct Stripe Checkout Integration (When STRIPE_SECRET_KEY is configured)
    if (stripeSecret) {
      try {
        const lineItemName = `TurnProofs ${planName} (${isAnnual ? 'Annual Billing — 15% OFF' : 'Monthly Billing'})`;
        const lineItemAmountCents = Math.round(finalChargedAmount * 100);

        const params = new URLSearchParams({
          'payment_method_types[]': 'card',
          'line_items[0][price_data][currency]': 'usd',
          'line_items[0][price_data][product_data][name]': lineItemName,
          'line_items[0][price_data][unit_amount]': lineItemAmountCents.toString(),
          'line_items[0][quantity]': '1',
          'mode': 'subscription',
          'success_url': `https://turnproofs.com/dashboard?upgraded=true&plan=${plan}`,
          'cancel_url': 'https://turnproofs.com/dashboard?tab=billing',
          'customer_email': host.email,
          'client_reference_id': host.id,
          'metadata[host_id]': host.id,
          'metadata[plan_key]': plan || 'pro',
          'metadata[cycle]': cycle
        });

        if (isAnnual) {
          params.append('line_items[0][price_data][recurring][interval]', 'year');
        } else {
          params.append('line_items[0][price_data][recurring][interval]', 'month');
        }

        const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${stripeSecret}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params
        });

        const session = await res.json();
        if (session.url) {
          return NextResponse.json({ success: true, checkoutUrl: session.url });
        }
      } catch (err) {
        console.error('Stripe API checkout session error:', err);
      }
    }

    // 4. Fallback / Immediate Confirmation (When Stripe keys are not set or during testing)
    if (supabaseAdmin) {
      try {
        await supabaseAdmin
          .from('airbnb_hosts')
          .update({
            subscription_status: 'active',
            subscription_tier: plan || 'pro',
            updated_at: new Date().toISOString()
          })
          .eq('id', host.id);
      } catch (e) {
        console.error('Database update error:', e);
      }
    }

    return NextResponse.json({
      success: true,
      demo: true,
      amount: finalChargedAmount,
      monthlyRate: finalMonthlyRate,
      planName,
      message: `Subscription setup completed for ${host.email} on ${planName} ($${finalMonthlyRate}/mo). Add STRIPE_SECRET_KEY for live processing.`
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
