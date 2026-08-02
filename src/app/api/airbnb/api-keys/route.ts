import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedHost } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { generateRawApiKey } from '@/lib/api-auth';

// GET active/all keys for host
export async function GET() {
  try {
    const host = await getAuthenticatedHost();
    if (!host) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { data: keys, error: fetchErr } = await supabaseAdmin
      .from('airbnb_api_keys')
      .select('id, name, api_key_prefix, scopes, property_ids, created_at, last_used_at, expires_at, revoked_at, revoked_by, revocation_reason')
      .eq('host_id', host.id)
      .order('created_at', { ascending: false });

    if (fetchErr) {
      return NextResponse.json({ success: false, error: fetchErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, keys });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST generate a new api key with prefix, salt, and salted hash
export async function POST(request: NextRequest) {
  try {
    const host = await getAuthenticatedHost();
    if (!host) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, scopes, property_ids, expires_in_days, environment } = body;
    const targetEnv = environment === 'test' ? 'test' : 'live';

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ success: false, error: 'API key name is required.' }, { status: 400 });
    }

    const targetScopes = Array.isArray(scopes) && scopes.length > 0 
      ? scopes 
      : ['properties:read', 'reports:read'];

    let targetPropertyIds = null;
    if (Array.isArray(property_ids) && property_ids.length > 0) {
      const { data: hostProperties } = await supabaseAdmin
        .from('airbnb_properties')
        .select('id')
        .eq('host_id', host.id);

      const validIds = (hostProperties || []).map((p: any) => p.id);
      const filteredPropertyIds = property_ids.filter(id => validIds.includes(id));
      
      if (filteredPropertyIds.length > 0) {
        targetPropertyIds = filteredPropertyIds;
      }
    }

    let expiresAt = null;
    if (expires_in_days && !isNaN(parseInt(expires_in_days))) {
      const days = parseInt(expires_in_days);
      if (days > 0) {
        expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
      }
    }

    // Set rate limit based on host tier: Commercial = 5000, standard = 500
    const limitMax = host.subscription_tier === 'commercial' ? 5000.0 : 500.0;

    // Use production-grade key generator: returns raw, prefix, hash, salt
    const { rawKey, prefix, hash, salt } = generateRawApiKey(targetEnv);

    const { data: newKey, error: insertErr } = await supabaseAdmin
      .from('airbnb_api_keys')
      .insert({
        host_id: host.id,
        name: name.trim(),
        api_key_hash: hash,
        api_key_prefix: prefix,
        salt,
        scopes: targetScopes,
        property_ids: targetPropertyIds,
        expires_at: expiresAt,
        rate_limit_max: limitMax,
        rate_limit_tokens: limitMax,
        rate_limit_last_refilled_at: new Date().toISOString(),
        environment: targetEnv,
        created_by: host.id
      })
      .select('id, name, api_key_prefix, scopes, property_ids, created_at, expires_at, rate_limit_max, environment, created_by')
      .single();

    if (insertErr) {
      return NextResponse.json({ success: false, error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      key: {
        ...newKey,
        rawKey // Show raw key once
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE soft-revokes key with reason audit trailing
export async function DELETE(request: NextRequest) {
  try {
    const host = await getAuthenticatedHost();
    if (!host) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('id');
    const reason = searchParams.get('reason') || 'Revoked by owner';

    if (!keyId) {
      return NextResponse.json({ success: false, error: 'Key ID is required.' }, { status: 400 });
    }

    // Verify key ownership
    const { data: existingKey } = await supabaseAdmin
      .from('airbnb_api_keys')
      .select('host_id')
      .eq('id', keyId)
      .maybeSingle();

    if (!existingKey) {
      return NextResponse.json({ success: false, error: 'Key not found.' }, { status: 404 });
    }

    if (existingKey.host_id !== host.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Soft revoke key rather than dropping record completely
    const { error: updateErr } = await supabaseAdmin
      .from('airbnb_api_keys')
      .update({
        revoked_at: new Date().toISOString(),
        revoked_by: 'host',
        revocation_reason: reason
      })
      .eq('id', keyId);

    if (updateErr) {
      return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
