import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabase-server';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Keep digits only; require 10 digits (US) or 11 starting with 1 */
function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) return digits;
  if (digits.length === 10) return digits;
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const property_id = typeof body.property_id === 'string' ? body.property_id.trim() : '';
    const phoneRaw = typeof body.phone === 'string' ? body.phone : '';
    const listing_url =
      typeof body.listing_url === 'string' ? body.listing_url.trim().slice(0, 2000) : null;

    if (!UUID_RE.test(property_id)) {
      return NextResponse.json({ error: 'Invalid listing' }, { status: 400 });
    }

    const phone = normalizePhone(phoneRaw);
    if (!phone) {
      return NextResponse.json(
        { error: 'Enter a valid 10-digit U.S. phone number' },
        { status: 400 }
      );
    }

    const supabaseAuth = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser();

    const admin = createServiceRoleClient();

    const { data: prop, error: propErr } = await admin
      .from('properties')
      .select('id')
      .eq('id', property_id)
      .in('listing_status', ['active', 'pending'])
      .maybeSingle();

    if (propErr || !prop) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    const { error } = await admin.from('schedule_call_requests').insert({
      property_id,
      phone,
      user_id: user?.id ?? null,
      listing_url: listing_url || null,
    });

    if (error) {
      console.error('schedule_call_requests insert', error);
      return NextResponse.json({ error: 'Could not save request' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}
