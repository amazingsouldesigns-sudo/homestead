import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createServiceRoleClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('session_id');
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      const supabase = createServiceRoleClient();
      const metadata = session.metadata;

      // Update payment status
      await supabase
        .from('payments')
        .update({
          status: 'completed',
          stripe_payment_id: session.payment_intent as string,
        })
        .eq('stripe_session_id', sessionId);

      // Update property status
      if (metadata?.property_id) {
        const updates: any = {};

        if (metadata.type === 'listing_publish') {
          updates.listing_status = 'pending'; // Will be approved by admin
        } else if (metadata.type === 'listing_featured') {
          updates.is_featured = true;
          updates.featured_until = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        }

        if (Object.keys(updates).length > 0) {
          await supabase
            .from('properties')
            .update(updates)
            .eq('id', metadata.property_id);
        }
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, status: session.payment_status });
  } catch (error: any) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
