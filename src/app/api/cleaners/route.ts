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
            { id: 'c2', name: 'Maria (Sunset Villa Specialist)', phone: 'maria@cleaning.com' },
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
      // Authenticated host request (Dashboard Staff List view)
      const host = await getAuthenticatedHost();
      if (!host) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
      targetHostId = host.id;
    }

    // Fetch all property IDs owned by this host
    const { data: hostProperties } = await supabaseAdmin
      .from('airbnb_properties')
      .select('id, name')
      .eq('host_id', targetHostId);

    const hostPropIds = (hostProperties || []).map((p: any) => p.id);

    if (hostPropIds.length === 0) {
      return NextResponse.json({ success: true, cleaners: [] });
    }

    // If requested for a specific property link (?propertyId=xxx), return cleaners for that propertyId
    if (propertyId) {
      const { data: cleaners, error } = await supabaseAdmin
        .from('airbnb_cleaners')
        .select('*')
        .eq('property_id', propertyId)
        .order('name', { ascending: true });

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, cleaners: cleaners || [] });
    }

    // Authenticated host dashboard staff list
    const { data: rawCleaners, error } = await supabaseAdmin
      .from('airbnb_cleaners')
      .select('*')
      .in('property_id', hostPropIds)
      .order('name', { ascending: true });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Group cleaners by name & phone to determine if assigned to ALL properties or a specific property
    const grouped = new Map<string, { cleaner: any; propIds: Set<string> }>();
    for (const c of (rawCleaners || [])) {
      const key = `${c.name.toLowerCase().trim()}_${c.phone.toLowerCase().trim()}`;
      if (!grouped.has(key)) {
        grouped.set(key, { cleaner: { ...c }, propIds: new Set([c.property_id]) });
      } else {
        grouped.get(key)!.propIds.add(c.property_id);
      }
    }

    const cleanersResult: any[] = [];
    grouped.forEach(({ cleaner, propIds }) => {
      // If cleaner is registered across all host properties, mark property_id as 'ALL'
      if (hostPropIds.length > 0 && propIds.size >= hostPropIds.length) {
        cleanersResult.push({ ...cleaner, property_id: 'ALL' });
      } else {
        cleanersResult.push(cleaner);
      }
    });

    return NextResponse.json({ success: true, cleaners: cleanersResult });
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

    // Fetch host's properties
    const { data: properties } = await supabaseAdmin
      .from('airbnb_properties')
      .select('id')
      .eq('host_id', host.id);

    if (!properties || properties.length === 0) {
      return NextResponse.json({ success: false, error: 'Please create a property unit first before adding staff cleaners.' }, { status: 400 });
    }

    // If a specific property_id was selected (and is a valid property owned by host)
    if (property_id && properties.some((p: any) => p.id === property_id)) {
      const { data: newCleaner, error } = await supabaseAdmin
        .from('airbnb_cleaners')
        .insert({
          property_id: property_id,
          name: name.trim(),
          phone: phone.trim()
        })
        .select('*')
        .single();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, cleaner: newCleaner });
    } else {
      // "All Portfolio Properties" selected -> Insert cleaner record for each property owned by host
      const recordsToInsert = properties.map((p: any) => ({
        property_id: p.id,
        name: name.trim(),
        phone: phone.trim()
      }));

      const { data: createdCleaners, error } = await supabaseAdmin
        .from('airbnb_cleaners')
        .insert(recordsToInsert)
        .select('*');

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      const firstCleaner = createdCleaners && createdCleaners.length > 0 
        ? { ...createdCleaners[0], property_id: 'ALL' } 
        : null;

      return NextResponse.json({ success: true, cleaner: firstCleaner });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE a cleaner (requires host auth)
// Deletes cleaner by name & phone across host properties (or by ID)
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

    // Find the cleaner details first
    const { data: targetCleaner } = await supabaseAdmin
      .from('airbnb_cleaners')
      .select('name, phone')
      .eq('id', id)
      .maybeSingle();

    if (targetCleaner) {
      // Delete all records matching this cleaner name & phone for this host's properties
      const { data: hostProperties } = await supabaseAdmin
        .from('airbnb_properties')
        .select('id')
        .eq('host_id', host.id);

      const hostPropIds = (hostProperties || []).map((p: any) => p.id);

      if (hostPropIds.length > 0) {
        await supabaseAdmin
          .from('airbnb_cleaners')
          .delete()
          .in('property_id', hostPropIds)
          .eq('name', targetCleaner.name)
          .eq('phone', targetCleaner.phone);
      }
    } else {
      await supabaseAdmin
        .from('airbnb_cleaners')
        .delete()
        .eq('id', id);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
