import { NextRequest, NextResponse } from 'next/server';
import { stripe, LISTING_PRICES } from '@/lib/stripe';
import { createServiceRoleClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const { type, property_id, user_id } = await request.json();

    if (!type || !user_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const priceConfig = type === 'featured' ? LISTING_PRICES.featured : LISTING_PRICES.publish;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: priceConfig.label,
              description: priceConfig.description,
            },
            unit_amount: priceConfig.amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/failure`,
      metadata: {
        type: type === 'featured' ? 'listing_featured' : 'listing_publish',
        property_id: property_id || '',
        user_id,
      },
    });

    // Create pending payment record
    const supabase = createServiceRoleClient();
    await supabase.from('payments').insert({
      user_id,
      property_id: property_id || null,
      stripe_payment_id: session.id,
      stripe_session_id: session.id,
      amount: priceConfig.amount / 100,
      currency: 'usd',
      payment_type: type === 'featured' ? 'listing_featured' : 'listing_publish',
      status: 'pending',
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
