import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedHost } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const host = await getAuthenticatedHost();
    if (!host) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { plan, propertiesCount } = await request.json();

    // Calculate plan amount
    let amount = 9.00;
    let planName = 'Pro Plan';

    const count = parseInt(propertiesCount || '1', 10);
    if (plan === 'growth' || (count >= 2 && count <= 3)) {
      amount = 18.99;
      planName = 'Growth Plan (2-3 units)';
    } else if (plan === 'elite' || count >= 4) {
      if (count <= 8) {
        amount = 29.99;
        planName = 'Elite Plan (4-8 units)';
      } else {
        const extra = count - 8;
        amount = parseFloat((29.99 + extra * 4.99).toFixed(2));
        planName = `Elite Plan (${count} units - $29.99 + ${extra}x$4.99)`;
      }
    } else if (plan === 'commercial') {
      amount = 89.99;
      planName = 'Commercial Site Plan ($89.99/building)';
    }

    const stripeSecret = process.env.STRIPE_SECRET_KEY;

    if (stripeSecret) {
      // Direct Stripe Checkout Session API integration
      try {
        const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${stripeSecret}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            'payment_method_types[]': 'card',
            'line_items[0][price_data][currency]': 'usd',
            'line_items[0][price_data][product_data][name]': `TurnProofs ${planName}`,
            'line_items[0][price_data][unit_amount]': Math.round(amount * 100).toString(),
            'line_items[0][price_data][recurring][interval]': 'month',
            'line_items[0][quantity]': '1',
            'mode': 'subscription',
            'success_url': `https://turnproofs.com/airbnb/dashboard?upgraded=true&plan=${plan}`,
            'cancel_url': 'https://turnproofs.com/airbnb/dashboard?canceled=true',
            'customer_email': host.email
          })
        });

        const session = await res.json();
        if (session.url) {
          return NextResponse.json({ success: true, checkoutUrl: session.url });
        }
      } catch (err) {
        console.error('Stripe API error:', err);
      }
    }

    // Demo Mode fallback if Stripe keys are not added yet
    return NextResponse.json({
      success: true,
      demo: true,
      amount,
      planName,
      message: `Demo Mode: Upgraded host ${host.email} to ${planName} ($${amount}/mo)! Add STRIPE_SECRET_KEY to .env.local for live payments.`
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
