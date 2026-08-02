import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { validateApiKey, logApiRequest, getIpAddress } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const ipAddress = getIpAddress(request);
  
  const auth = await validateApiKey(request, 'reports:read');
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
      endpoint: '/api/v1/reports',
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
    const { searchParams } = new URL(request.url);
    const queryPropertyId = searchParams.get('property_id');
    const since = searchParams.get('since');
    const cursor = searchParams.get('cursor'); // Cursor completes cursor-based pagination
    
    let limit = parseInt(searchParams.get('limit') || '50');
    let offset = parseInt(searchParams.get('offset') || '0');
    
    if (isNaN(limit) || limit <= 0) limit = 50;
    if (limit > 100) limit = 100;
    if (isNaN(offset) || offset < 0) offset = 0;

    // 1. Fetch properties owned by this host
    const { data: properties, error: propError } = await supabaseAdmin
      .from('airbnb_properties')
      .select('id')
      .eq('host_id', auth.hostId);

    if (propError) {
      throw new Error(propError.message);
    }

    let allowedPropertyIds = (properties || []).map((p: any) => p.id);

    // Apply API key's scoped properties restriction
    if (auth.propertyIds && Array.isArray(auth.propertyIds)) {
      allowedPropertyIds = allowedPropertyIds.filter((id: string) =>
        auth.propertyIds!.includes(id)
      );
    }

    if (allowedPropertyIds.length === 0) {
      await logApiRequest({
        apiKeyId: auth.apiKeyId,
        hostId: auth.hostId,
        endpoint: '/api/v1/reports',
        method: 'GET',
        ipAddress,
        statusCode: 200,
        responseTimeMs: Date.now() - startTime,
        requestId: auth.requestId
      });
      return NextResponse.json({
        success: true,
        data: [],
        pagination: { total: 0, limit, offset, has_more: false, next_cursor: null }
      }, { headers: responseHeaders });
    }

    // Determine target properties to query
    let targetPropertyIds = [...allowedPropertyIds];
    if (queryPropertyId) {
      if (allowedPropertyIds.includes(queryPropertyId)) {
        targetPropertyIds = [queryPropertyId];
      } else {
        await logApiRequest({
          apiKeyId: auth.apiKeyId,
          hostId: auth.hostId,
          endpoint: '/api/v1/reports',
          method: 'GET',
          ipAddress,
          statusCode: 200,
          responseTimeMs: Date.now() - startTime,
          requestId: auth.requestId
        });
        return NextResponse.json({
          success: true,
          data: [],
          pagination: { total: 0, limit, offset, has_more: false, next_cursor: null }
        }, { headers: responseHeaders });
      }
    }

    // 2. Count Total Matching Reports (Total reports without pagination limits)
    let countQuery = supabaseAdmin
      .from('airbnb_reports')
      .select('id')
      .in('property_id', targetPropertyIds);

    if (since) {
      countQuery = countQuery.gte('completed_at', since);
    }

    const { data: totalReports, error: countError } = await countQuery;
    if (countError) {
      throw new Error(countError.message);
    }

    const total = totalReports ? totalReports.length : 0;

    if (total === 0) {
      await logApiRequest({
        apiKeyId: auth.apiKeyId,
        hostId: auth.hostId,
        endpoint: '/api/v1/reports',
        method: 'GET',
        ipAddress,
        statusCode: 200,
        responseTimeMs: Date.now() - startTime,
        requestId: auth.requestId
      });
      return NextResponse.json({
        success: true,
        data: [],
        pagination: { total: 0, limit, offset, has_more: false, next_cursor: null }
      }, { headers: responseHeaders });
    }

    // 3. Query Paginated Page of Reports
    let pageQuery = supabaseAdmin
      .from('airbnb_reports')
      .select('*, airbnb_properties(name, address)')
      .in('property_id', targetPropertyIds);

    if (since) {
      pageQuery = pageQuery.gte('completed_at', since);
    }

    // Apply cursor filter if present (cursor-based pagination is prioritized over offset)
    if (cursor) {
      pageQuery = pageQuery.lt('completed_at', cursor);
    }

    // Apply paging constraints
    if (!cursor) {
      pageQuery = pageQuery.offset(offset);
    }

    const { data: reports, error: pageError } = await pageQuery
      .order('completed_at', { ascending: false })
      .limit(limit);

    if (pageError) {
      throw new Error(pageError.message);
    }

    const formattedData = (reports || []).map((r: any) => {
      let parsedNotes = r.notes || '';
      try {
        if (r.notes && (r.notes.startsWith('{') || r.notes.startsWith('['))) {
          parsedNotes = JSON.parse(r.notes);
        }
      } catch (e) {}

      return {
        id: r.id,
        property_id: r.property_id,
        property_name: r.airbnb_properties?.name || 'Unknown Property',
        property_address: r.airbnb_properties?.address || 'Unknown Address',
        cleaner_name: r.cleaner_name,
        started_at: r.started_at,
        completed_at: r.completed_at,
        start_latitude: r.start_latitude ? parseFloat(r.start_latitude) : null,
        start_longitude: r.start_longitude ? parseFloat(r.start_longitude) : null,
        end_latitude: r.end_latitude ? parseFloat(r.end_latitude) : null,
        end_longitude: r.end_longitude ? parseFloat(r.end_longitude) : null,
        notes: parsedNotes,
        created_at: r.created_at
      };
    });

    // Determine pagination status and next cursor
    const has_more = cursor 
      ? formattedData.length === limit 
      : offset + limit < total;
      
    const next_cursor = formattedData.length > 0 && has_more
      ? formattedData[formattedData.length - 1].completed_at
      : null;

    await logApiRequest({
      apiKeyId: auth.apiKeyId,
      hostId: auth.hostId,
      endpoint: '/api/v1/reports',
      method: 'GET',
      ipAddress,
      statusCode: 200,
      responseTimeMs: Date.now() - startTime,
      requestId: auth.requestId
    });

    return NextResponse.json({
      success: true,
      data: formattedData,
      pagination: {
        total,
        limit,
        offset: cursor ? null : offset,
        has_more,
        next_cursor
      }
    }, { headers: responseHeaders });
  } catch (error: any) {
    console.error('[Reports List API] Error:', error);
    
    await logApiRequest({
      apiKeyId: auth.apiKeyId,
      hostId: auth.hostId,
      endpoint: '/api/v1/reports',
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
