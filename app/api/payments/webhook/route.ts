import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServiceRoleClient } from '@/lib/supabase-server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata;

      // Update payment record
      await supabase
        .from('payments')
        .update({
          status: 'completed',
          stripe_payment_id: session.payment_intent as string,
        })
        .eq('stripe_session_id', session.id);

      // Update property
      if (metadata?.property_id) {
        if (metadata.type === 'listing_publish') {
          await supabase
            .from('properties')
            .update({ listing_status: 'pending' })
            .eq('id', metadata.property_id);
        } else if (metadata.type === 'listing_featured') {
          await supabase
            .from('properties')
            .update({
              is_featured: true,
              featured_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            })
            .eq('id', metadata.property_id);
        }
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const intent = event.data.object as Stripe.PaymentIntent;
      await supabase
        .from('payments')
        .update({ status: 'failed' })
        .eq('stripe_payment_id', intent.id);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
