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

    let targetHostId: string | null = null;

    if (propertyId) {
      if (propertyId === 'demo' || propertyId === 'sample-property') {
        return NextResponse.json({
          success: true,
          cleaners: [
            { id: 'c1', name: 'Sarah Jenkins', phone: 'sarah@cleaningservice.com' },
            { id: 'c2', name: 'Morgan (Lead Cleaner)', phone: 'info@eqcdmv.com' },
            { id: 'c3', name: 'Carlos Rodriguez', phone: 'carlos@cleaning.com' }
          ]
        });
      }

      // Find the host who owns this property
      const { data: property } = await supabaseAdmin
        .from('airbnb_properties')
        .select('host_id')
        .eq('id', propertyId)
        .maybeSingle();

      if (property?.host_id) {
        targetHostId = property.host_id;
      }
    }

    if (!targetHostId) {
      // Authenticated host request
      const host = await getAuthenticatedHost();
      if (!host) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
      targetHostId = host.id;
    }

    // Fetch all property IDs owned by this host
    const { data: hostProperties } = await supabaseAdmin
      .from('airbnb_properties')
      .select('id')
      .eq('host_id', targetHostId);

    const hostPropIds = (hostProperties || []).map((p: any) => p.id);

    if (hostPropIds.length === 0) {
      return NextResponse.json({ success: true, cleaners: [] });
    }

    // Fetch all cleaners belonging to any property of this host
    const { data: rawCleaners, error } = await supabaseAdmin
      .from('airbnb_cleaners')
      .select('*')
      .in('property_id', hostPropIds)
      .order('name', { ascending: true });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Deduplicate cleaners by name so each staff cleaner appears once in the dropdown
    const uniqueMap = new Map();
    for (const cleaner of (rawCleaners || [])) {
      const key = cleaner.name.toLowerCase().trim();
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, cleaner);
      }
    }

    return NextResponse.json({ success: true, cleaners: Array.from(uniqueMap.values()) });
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

    const { name, phone, property_id } = await request.json();

    if (!name || !phone) {
      return NextResponse.json({ success: false, error: 'Cleaner name and email/phone are required.' }, { status: 400 });
    }

    // Get host's properties
    const { data: properties } = await supabaseAdmin
      .from('airbnb_properties')
      .select('id')
      .eq('host_id', host.id);

    if (!properties || properties.length === 0) {
      return NextResponse.json({ success: false, error: 'Please create a property unit first before adding staff cleaners.' }, { status: 400 });
    }

    const targetPropertyId = property_id && properties.some((p: any) => p.id === property_id) 
      ? property_id 
      : properties[0].id;

    const { data: newCleaner, error } = await supabaseAdmin
      .from('airbnb_cleaners')
      .insert({
        property_id: targetPropertyId,
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
