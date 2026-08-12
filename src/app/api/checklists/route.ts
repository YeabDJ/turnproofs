import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getAuthenticatedHost } from '@/lib/auth';

// GET checklist tasks for a property (accessible to both hosts and cleaners)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');

    if (!propertyId) {
      return NextResponse.json({ success: false, error: 'Property ID is required.' }, { status: 400 });
    }

    if (propertyId === 'demo' || propertyId === 'sample-property') {
      const demoTasks = [
        {
          id: 'demo-task-1',
          property_id: 'demo',
          task_name: '[Entry Security & Access] 🔑 Main Entry Keypad Code verified set to 4829# & deadbolt response tested',
          requires_photo: false,
          sort_order: 1
        },
        {
          id: 'demo-task-2',
          property_id: 'demo',
          task_name: '[Utility & Supply Closet] 🔐 Utility Closet Code (1042) opened, extra linens restocked & locked',
          requires_photo: false,
          sort_order: 2
        },
        {
          id: 'demo-task-3',
          property_id: 'demo',
          task_name: '[Master Bedroom] 🧹 Vacuum rug & wipe down nightstands',
          requires_photo: false,
          sort_order: 3
        },
        {
          id: 'demo-task-4',
          property_id: 'demo',
          task_name: '[Main Bathroom] 🚿 Scrub shower tile, sanitize toilet & restock paper towels',
          requires_photo: true,
          sort_order: 4
        },
        {
          id: 'demo-task-5',
          property_id: 'demo',
          task_name: '[Kitchen & Dining] 🍽️ Empty dishwasher, wipe countertops & sanitize sink',
          requires_photo: true,
          sort_order: 5
        },
        {
          id: 'demo-task-6',
          property_id: 'demo',
          task_name: '[Living Room] 📺 Dust TV stand & arrange decorative couch pillows',
          requires_photo: false,
          sort_order: 6
        }
      ];
      return NextResponse.json({ success: true, tasks: demoTasks });
    }

    const { data: tasks, error } = await supabaseAdmin
      .from('airbnb_checklists')
      .select('*')
      .eq('property_id', propertyId)
      .order('sort_order', { ascending: true });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, tasks });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST create a new checklist task (requires host auth)
export async function POST(request: NextRequest) {
  try {
    const host = await getAuthenticatedHost();
    if (!host) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Handle bulk checklist tasks import (e.g. pasted from Turno, Word doc, or Email)
    if (body.tasks && Array.isArray(body.tasks)) {
      const { property_id, tasks } = body;
      if (!property_id || tasks.length === 0) {
        return NextResponse.json({ success: false, error: 'Property ID and tasks array are required.' }, { status: 400 });
      }

      // Verify property belongs to host
      const { data: property, error: propError } = await supabaseAdmin
        .from('airbnb_properties')
        .select('id')
        .eq('id', property_id)
        .eq('host_id', host.id)
        .maybeSingle();

      if (propError || !property) {
        return NextResponse.json({ success: false, error: 'Property not found or access denied.' }, { status: 404 });
      }

      // Get highest existing sort_order for property
      const { data: existing } = await supabaseAdmin
        .from('airbnb_checklists')
        .select('sort_order')
        .eq('property_id', property_id)
        .order('sort_order', { ascending: false })
        .limit(1);

      const maxSort = existing && existing.length > 0 ? (existing[0].sort_order || 0) : 0;

      const bulkTasks = tasks.map((t: any, index: number) => ({
        property_id,
        task_name: t.task_name.trim(),
        requires_photo: !!t.requires_photo,
        sort_order: maxSort + index + 1
      }));

      const { data: createdTasks, error } = await supabaseAdmin
        .from('airbnb_checklists')
        .insert(bulkTasks)
        .select('*');

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, tasks: createdTasks });
    }

    const { property_id, task_name, requires_photo, sort_order } = body;

    if (!property_id || !task_name) {
      return NextResponse.json({ success: false, error: 'Property ID and task name are required.' }, { status: 400 });
    }

    // Verify property belongs to host
    const { data: property, error: propError } = await supabaseAdmin
      .from('airbnb_properties')
      .select('id')
      .eq('id', property_id)
      .eq('host_id', host.id)
      .maybeSingle();

    if (propError || !property) {
      return NextResponse.json({ success: false, error: 'Property not found or access denied.' }, { status: 404 });
    }

    const { data: newTask, error } = await supabaseAdmin
      .from('airbnb_checklists')
      .insert({
        property_id,
        task_name: task_name.trim(),
        requires_photo: !!requires_photo,
        sort_order: typeof sort_order === 'number' ? sort_order : 100
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, task: newTask });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT update a checklist task or reorder multiple tasks (requires host auth)
export async function PUT(request: NextRequest) {
  try {
    const host = await getAuthenticatedHost();
    if (!host) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Check if body is an array (for reordering tasks)
    if (Array.isArray(body)) {
      // Validate all tasks in the list belong to the host's properties
      for (const item of body) {
        if (!item.id) continue;
        const { data: task, error: fetchError } = await supabaseAdmin
          .from('airbnb_checklists')
          .select('property_id, airbnb_properties(host_id)')
          .eq('id', item.id)
          .single();

        if (fetchError || !task) {
          return NextResponse.json({ success: false, error: 'Task not found.' }, { status: 404 });
        }

        // @ts-ignore
        const taskHostId = task.airbnb_properties?.host_id;
        if (taskHostId !== host.id) {
          return NextResponse.json({ success: false, error: 'Access denied.' }, { status: 403 });
        }
      }

      // Perform updates
      for (const item of body) {
        if (!item.id) continue;
        await supabaseAdmin
          .from('airbnb_checklists')
          .update({
            task_name: item.task_name?.trim(),
            requires_photo: item.requires_photo !== undefined ? !!item.requires_photo : undefined,
            sort_order: typeof item.sort_order === 'number' ? item.sort_order : undefined
          })
          .eq('id', item.id);
      }

      return NextResponse.json({ success: true });
    } else {
      // Single task update
      const { id, task_name, requires_photo, sort_order } = body;

      if (!id) {
        return NextResponse.json({ success: false, error: 'Task ID is required.' }, { status: 400 });
      }

      // Fetch task to check ownership
      const { data: task, error: fetchError } = await supabaseAdmin
        .from('airbnb_checklists')
        .select('property_id')
        .eq('id', id)
        .single();

      if (fetchError || !task) {
        return NextResponse.json({ success: false, error: 'Task not found.' }, { status: 404 });
      }

      // Check property ownership
      const { data: property, error: propError } = await supabaseAdmin
        .from('airbnb_properties')
        .select('host_id')
        .eq('id', task.property_id)
        .single();

      if (propError || property.host_id !== host.id) {
        return NextResponse.json({ success: false, error: 'Access denied.' }, { status: 403 });
      }

      const { data: updatedTask, error: updateError } = await supabaseAdmin
        .from('airbnb_checklists')
        .update({
          task_name: task_name !== undefined ? task_name.trim() : undefined,
          requires_photo: requires_photo !== undefined ? !!requires_photo : undefined,
          sort_order: typeof sort_order === 'number' ? sort_order : undefined
        })
        .eq('id', id)
        .select('*')
        .single();

      if (updateError) {
        return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, task: updatedTask });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE a checklist task (requires host auth)
export async function DELETE(request: NextRequest) {
  try {
    const host = await getAuthenticatedHost();
    if (!host) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Task ID is required.' }, { status: 400 });
    }

    // Verify task belongs to property owned by host
    const { data: task, error: fetchError } = await supabaseAdmin
      .from('airbnb_checklists')
      .select('property_id')
      .eq('id', id)
      .single();

    if (fetchError || !task) {
      return NextResponse.json({ success: false, error: 'Task not found.' }, { status: 404 });
    }

    const { data: property, error: propError } = await supabaseAdmin
      .from('airbnb_properties')
      .select('host_id')
      .eq('id', task.property_id)
      .single();

    if (propError || property.host_id !== host.id) {
      return NextResponse.json({ success: false, error: 'Access denied.' }, { status: 403 });
    }

    const { error: deleteError } = await supabaseAdmin
      .from('airbnb_checklists')
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
