import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthenticatedHost } from '@/lib/auth';

// GET all properties for host or public view of a single property
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const { data: property, error } = await supabaseAdmin
        .from('airbnb_properties')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
      if (!property) {
        return NextResponse.json({ success: false, error: 'Property not found' }, { status: 404 });
      }

      // Check if host account is paused
      const { data: hostRecord } = await supabaseAdmin
        .from('hosts')
        .select('subscription_status')
        .eq('id', property.host_id)
        .maybeSingle();

      const isPaused = hostRecord?.subscription_status === 'paused';

      // Check if current user is owner
      const host = await getAuthenticatedHost();
      if (host && property.host_id === host.id) {
        return NextResponse.json({ success: true, property, isOwner: true, isPaused });
      }

      // Public data for cleaner
      return NextResponse.json({
        success: true,
        property: {
          id: property.id,
          name: property.name,
          address: property.address,
          cover_image_url: property.cover_image_url,
          latitude: property.latitude,
          longitude: property.longitude
        },
        isOwner: false,
        isPaused
      });
    }

    const host = await getAuthenticatedHost();
    if (!host) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { data: properties, error } = await supabaseAdmin
      .from('airbnb_properties')
      .select('*')
      .eq('host_id', host.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, properties });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}


// POST create a property
export async function POST(request: NextRequest) {
  try {
    const host = await getAuthenticatedHost();
    if (!host) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { name, address, cover_image_url, latitude, longitude } = await request.json();

    if (!name || !address) {
      return NextResponse.json({ success: false, error: 'Property name and address are required.' }, { status: 400 });
    }

    // Insert property
    const { data: newProperty, error } = await supabaseAdmin
      .from('airbnb_properties')
      .insert({
        host_id: host.id,
        name: name.trim(),
        address: address.trim(),
        cover_image_url: cover_image_url?.trim() || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80',
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Automatically create a default checklist for the property to save the host time
    const defaultTasks = [
      { property_id: newProperty.id, task_name: 'Sweep and mop all floors', requires_photo: false, sort_order: 1 },
      { property_id: newProperty.id, task_name: 'Make beds with fresh linens', requires_photo: true, sort_order: 2 },
      { property_id: newProperty.id, task_name: 'Clean kitchen countertops and empty trash', requires_photo: false, sort_order: 3 },
      { property_id: newProperty.id, task_name: 'Sanitize toilet, shower, and sink', requires_photo: true, sort_order: 4 },
      { property_id: newProperty.id, task_name: 'Replenish toilet paper, soap, and towels', requires_photo: false, sort_order: 5 }
    ];

    await supabaseAdmin.from('airbnb_checklists').insert(defaultTasks);

    return NextResponse.json({ success: true, property: newProperty });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE a property
export async function DELETE(request: NextRequest) {
  try {
    const host = await getAuthenticatedHost();
    if (!host) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Property ID is required.' }, { status: 400 });
    }

    // Verify property belongs to host
    const { data: property, error: fetchError } = await supabaseAdmin
      .from('airbnb_properties')
      .select('id')
      .eq('id', id)
      .eq('host_id', host.id)
      .maybeSingle();

    if (fetchError) {
      return NextResponse.json({ success: false, error: fetchError.message }, { status: 500 });
    }

    if (!property) {
      return NextResponse.json({ success: false, error: 'Property not found or does not belong to this host.' }, { status: 404 });
    }

    // Delete property (cascading deletes will handle checklist/reports if foreign key configured,
    // otherwise let's delete checklists first)
    await supabaseAdmin.from('airbnb_checklists').delete().eq('property_id', id);
    const { error: deleteError } = await supabaseAdmin
      .from('airbnb_properties')
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

// PUT update a property
export async function PUT(request: NextRequest) {
  try {
    const host = await getAuthenticatedHost();
    if (!host) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id, name, address, cover_image_url, latitude, longitude } = await request.json();

    if (!id || !name || !address) {
      return NextResponse.json({ success: false, error: 'Property ID, name, and address are required.' }, { status: 400 });
    }

    // Verify property belongs to host
    const { data: property, error: fetchError } = await supabaseAdmin
      .from('airbnb_properties')
      .select('id')
      .eq('id', id)
      .eq('host_id', host.id)
      .maybeSingle();

    if (fetchError || !property) {
      return NextResponse.json({ success: false, error: 'Property not found or access denied.' }, { status: 404 });
    }

    const { data: updatedProperty, error: updateError } = await supabaseAdmin
      .from('airbnb_properties')
      .update({
        name: name.trim(),
        address: address.trim(),
        cover_image_url: cover_image_url?.trim() || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80',
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null
      })
      .eq('id', id)
      .select('*')
      .single();

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, property: updatedProperty });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
