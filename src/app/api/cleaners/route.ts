import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthenticatedHost } from '@/lib/auth';

// GET cleaners list
// Can be requested by host (via authentication cookie)
// OR by cleaner page (via ?propertyId=xxx query param)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');

    let hostId = null;

    if (propertyId) {
      // Find the host who owns this property
      const { data: property, error: propError } = await supabaseAdmin
        .from('airbnb_properties')
        .select('host_id')
        .eq('id', propertyId)
        .maybeSingle();

      if (propError || !property) {
        return NextResponse.json({ success: false, error: 'Property not found or invalid.' }, { status: 404 });
      }
      hostId = property.host_id;
    } else {
      // Must be authenticated host
      const host = await getAuthenticatedHost();
      if (!host) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
      hostId = host.id;
    }

    const { data: cleaners, error } = await supabaseAdmin
      .from('airbnb_cleaners')
      .select('*')
      .eq('host_id', hostId)
      .order('name', { ascending: true });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, cleaners });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST create a cleaner (requires host auth)
export async function POST(request: NextRequest) {
  try {
    const host = await getAuthenticatedHost();
    if (!host) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { name, phone } = await request.json();

    if (!name || !phone) {
      return NextResponse.json({ success: false, error: 'Cleaner name and phone number are required.' }, { status: 400 });
    }

    const { data: newCleaner, error } = await supabaseAdmin
      .from('airbnb_cleaners')
      .insert({
        host_id: host.id,
        name: name.trim(),
        phone: phone.trim()
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, cleaner: newCleaner });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE a cleaner (requires host auth)
export async function DELETE(request: NextRequest) {
  try {
    const host = await getAuthenticatedHost();
    if (!host) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Cleaner ID is required.' }, { status: 400 });
    }

    // Verify cleaner belongs to host
    const { data: cleaner, error: fetchError } = await supabaseAdmin
      .from('airbnb_cleaners')
      .select('id')
      .eq('id', id)
      .eq('host_id', host.id)
      .maybeSingle();

    if (fetchError || !cleaner) {
      return NextResponse.json({ success: false, error: 'Cleaner not found or access denied.' }, { status: 404 });
    }

    const { error: deleteError } = await supabaseAdmin
      .from('airbnb_cleaners')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return NextResponse.json({ success: false, error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
