import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const sig = request.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    // Parse event payload
    let event: any;
    try {
      event = JSON.parse(body);
    } catch (err: any) {
      return NextResponse.json({ error: `Webhook Payload Error: ${err.message}` }, { status: 400 });
    }

    // Handle supported event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const hostId = session.client_reference_id || session.metadata?.host_id;
        const customerId = session.customer;
        const subscriptionId = session.subscription;
        const planKey = session.metadata?.plan_key || 'pro';

        if (hostId && supabaseAdmin) {
          await supabaseAdmin
            .from('airbnb_hosts')
            .update({
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              subscription_status: 'active',
              subscription_tier: planKey,
              updated_at: new Date().toISOString()
            })
            .eq('id', hostId);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const status = subscription.status; // 'active', 'past_due', 'canceled', 'unpaid'

        if (customerId && supabaseAdmin) {
          await supabaseAdmin
            .from('airbnb_hosts')
            .update({
              subscription_status: status === 'active' ? 'active' : status,
              updated_at: new Date().toISOString()
            })
            .eq('stripe_customer_id', customerId);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        if (customerId && supabaseAdmin) {
          await supabaseAdmin
            .from('airbnb_hosts')
            .update({
              subscription_status: 'canceled',
              stripe_subscription_id: null,
              updated_at: new Date().toISOString()
            })
            .eq('stripe_customer_id', customerId);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        if (customerId && supabaseAdmin) {
          await supabaseAdmin
            .from('airbnb_hosts')
            .update({
              subscription_status: 'active',
              updated_at: new Date().toISOString()
            })
            .eq('stripe_customer_id', customerId);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        if (customerId && supabaseAdmin) {
          await supabaseAdmin
            .from('airbnb_hosts')
            .update({
              subscription_status: 'past_due',
              updated_at: new Date().toISOString()
            })
            .eq('stripe_customer_id', customerId);
        }
        break;
      }

      default:
        // Unhandled event type
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Stripe webhook processing failed:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
