import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { validateApiKey, logApiRequest, getIpAddress } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const ipAddress = getIpAddress(request);
  
  const auth = await validateApiKey(request, 'properties:read');
  const responseHeaders: Record<string, string> = {
    'x-request-id': auth.requestId
  };
  
  if (auth.statusCode !== 200) {
    const errorBody = {
      error: auth.error
    };
    
    await logApiRequest({
      apiKeyId: auth.apiKeyId,
      hostId: auth.hostId,
      endpoint: '/api/v1/properties',
      method: 'GET',
      ipAddress,
      statusCode: auth.statusCode,
      responseTimeMs: Date.now() - startTime,
      errorMessage: auth.error?.message || 'Authentication failed',
      requestId: auth.requestId
    });

    if (auth.statusCode === 429 && auth.retryAfter) {
      responseHeaders['Retry-After'] = auth.retryAfter.toString();
    }

    return NextResponse.json(errorBody, { 
      status: auth.statusCode, 
      headers: responseHeaders 
    });
  }

  try {
    const { data: properties, error: propError } = await supabaseAdmin
      .from('airbnb_properties')
      .select('*')
      .eq('host_id', auth.hostId);

    if (propError) {
      throw new Error(propError.message);
    }

    let filteredProperties = properties || [];
    if (auth.propertyIds && Array.isArray(auth.propertyIds)) {
      filteredProperties = filteredProperties.filter((p: any) =>
        auth.propertyIds!.includes(p.id)
      );
    }

    const data = filteredProperties.map((p: any) => ({
      id: p.id,
      name: p.name,
      address: p.address,
      cover_image_url: p.cover_image_url ? p.cover_image_url.split('|||')[0] : null,
      latitude: p.latitude ? parseFloat(p.latitude) : null,
      longitude: p.longitude ? parseFloat(p.longitude) : null,
      created_at: p.created_at
    }));

    await logApiRequest({
      apiKeyId: auth.apiKeyId,
      hostId: auth.hostId,
      endpoint: '/api/v1/properties',
      method: 'GET',
      ipAddress,
      statusCode: 200,
      responseTimeMs: Date.now() - startTime,
      requestId: auth.requestId
    });

    return NextResponse.json({ success: true, properties: data }, {
      headers: responseHeaders
    });
  } catch (error: any) {
    console.error('[Properties API] Error:', error);
    
    await logApiRequest({
      apiKeyId: auth.apiKeyId,
      hostId: auth.hostId,
      endpoint: '/api/v1/properties',
      method: 'GET',
      ipAddress,
      statusCode: 500,
      responseTimeMs: Date.now() - startTime,
      errorMessage: error.message,
      requestId: auth.requestId
    });

    return NextResponse.json({
      error: {
        code: 'server_error',
        message: 'An unexpected error occurred'
      }
    }, { 
      status: 500,
      headers: responseHeaders
    });
  }
}
