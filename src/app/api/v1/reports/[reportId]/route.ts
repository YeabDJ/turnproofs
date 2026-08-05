import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { validateApiKey, logApiRequest, getIpAddress } from '@/lib/api-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ reportId: string }> }
) {
  const startTime = Date.now();
  const ipAddress = getIpAddress(request);
  
  const auth = await validateApiKey(request, 'reports:read');
  const { reportId } = await params;
  const responseHeaders: Record<string, string> = {
    'x-request-id': auth.requestId
  };

  if (auth.rateLimitMax !== undefined) {
    responseHeaders['X-RateLimit-Limit'] = auth.rateLimitMax.toString();
    responseHeaders['X-RateLimit-Remaining'] = (auth.tokensRemaining ?? 0).toString();
    responseHeaders['X-RateLimit-Reset'] = Math.ceil((60000 - (Date.now() % 60000)) / 1000).toString();
  }

  if (auth.statusCode !== 200) {
    const errorBody = {
      error: auth.error
    };
    
    await logApiRequest({
      apiKeyId: auth.apiKeyId,
      hostId: auth.hostId,
      endpoint: `/api/v1/reports/${reportId}`,
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
    const { data: report, error: reportError } = await supabaseAdmin
      .from('airbnb_reports')
      .select('*, airbnb_properties(*)')
      .eq('id', reportId)
      .maybeSingle();

    if (reportError) {
      throw new Error(reportError.message);
    }

    if (!report) {
      await logApiRequest({
        apiKeyId: auth.apiKeyId,
        hostId: auth.hostId,
        endpoint: `/api/v1/reports/${reportId}`,
        method: 'GET',
        ipAddress,
        statusCode: 404,
        responseTimeMs: Date.now() - startTime,
        errorMessage: 'Report not found',
        requestId: auth.requestId
      });
      return NextResponse.json({
        error: {
          code: 'not_found',
          message: 'Report not found'
        }
      }, { 
        status: 404,
        headers: responseHeaders
      });
    }

    const propertyHostId = report.airbnb_properties?.host_id;
    if (propertyHostId !== auth.hostId) {
      await logApiRequest({
        apiKeyId: auth.apiKeyId,
        hostId: auth.hostId,
        endpoint: `/api/v1/reports/${reportId}`,
        method: 'GET',
        ipAddress,
        statusCode: 403,
        responseTimeMs: Date.now() - startTime,
        errorMessage: 'Forbidden: Report does not belong to this host',
        requestId: auth.requestId
      });
      return NextResponse.json({
        error: {
          code: 'insufficient_permissions',
          message: 'The API key does not have access to this property report'
        }
      }, { 
        status: 403,
        headers: responseHeaders
      });
    }

    if (auth.propertyIds && Array.isArray(auth.propertyIds)) {
      if (!auth.propertyIds.includes(report.property_id)) {
        await logApiRequest({
          apiKeyId: auth.apiKeyId,
          hostId: auth.hostId,
          endpoint: `/api/v1/reports/${reportId}`,
          method: 'GET',
          ipAddress,
          statusCode: 403,
          responseTimeMs: Date.now() - startTime,
          errorMessage: 'Forbidden: Report property is not within key scope',
          requestId: auth.requestId
        });
        return NextResponse.json({
          error: {
            code: 'insufficient_permissions',
            message: 'The API key does not have access to this property report'
          }
        }, { 
          status: 403,
          headers: responseHeaders
        });
      }
    }

    const { data: tasks, error: tasksError } = await supabaseAdmin
      .from('airbnb_report_tasks')
      .select('*')
      .eq('report_id', reportId)
      .order('created_at', { ascending: true });

    if (tasksError) {
      throw new Error(tasksError.message);
    }

    let parsedNotes = report.notes || '';
    try {
      if (report.notes && (report.notes.startsWith('{') || report.notes.startsWith('['))) {
        parsedNotes = JSON.parse(report.notes);
      }
    } catch (e) {}

    const formattedReport = {
      id: report.id,
      property: {
        id: report.airbnb_properties?.id,
        name: report.airbnb_properties?.name,
        address: report.airbnb_properties?.address,
        cover_image_url: report.airbnb_properties?.cover_image_url ? report.airbnb_properties.cover_image_url.split('|||')[0] : null
      },
      cleaner_name: report.cleaner_name,
      started_at: report.started_at,
      completed_at: report.completed_at,
      duration_seconds: Math.max(0, Math.floor((new Date(report.completed_at).getTime() - new Date(report.started_at).getTime()) / 1000)),
      verification: {
        start_latitude: report.start_latitude ? parseFloat(report.start_latitude) : null,
        start_longitude: report.start_longitude ? parseFloat(report.start_longitude) : null,
        end_latitude: report.end_latitude ? parseFloat(report.end_latitude) : null,
        end_longitude: report.end_longitude ? parseFloat(report.end_longitude) : null
      },
      notes: parsedNotes,
      created_at: report.created_at
    };

    const formattedTasks = (tasks || []).map((t: any) => ({
      id: t.id,
      task_name: t.task_name,
      requires_photo: !!t.requires_photo,
      completed: !!t.completed,
      photo_url: t.photo_url || null,
      created_at: t.created_at
    }));

    await logApiRequest({
      apiKeyId: auth.apiKeyId,
      hostId: auth.hostId,
      endpoint: `/api/v1/reports/${reportId}`,
      method: 'GET',
      ipAddress,
      statusCode: 200,
      responseTimeMs: Date.now() - startTime,
      requestId: auth.requestId
    });

    return NextResponse.json({
      success: true,
      report: formattedReport,
      tasks: formattedTasks
    }, { headers: responseHeaders });
  } catch (error: any) {
    console.error('[Report Detail API] Error:', error);
    
    await logApiRequest({
      apiKeyId: auth.apiKeyId,
      hostId: auth.hostId,
      endpoint: `/api/v1/reports/${reportId}`,
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
