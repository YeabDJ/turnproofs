import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { supabaseAdmin } from './supabase';

const API_KEY_PEPPER = process.env.API_KEY_PEPPER || 'turnproofs_pms_pepper_salt_9e3d';
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://knjafkrildnehfbbmrqa.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export function hashApiKey(secret: string, salt: string): string {
  return crypto
    .createHash('sha256')
    .update(secret + salt + API_KEY_PEPPER)
    .digest('hex');
}

export function generateRawApiKey(environment: 'live' | 'test' = 'live'): { rawKey: string; prefix: string; hash: string; salt: string } {
  // 1. Generate unique 8-hex prefix (4 bytes)
  const prefixHex = crypto.randomBytes(4).toString('hex');
  const prefix = `tp_${environment}_${prefixHex}`;

  // 2. Generate secure high-entropy secret (32 bytes / 64 hex characters)
  const secret = crypto.randomBytes(32).toString('hex');

  // 3. Generate key salt
  const salt = crypto.randomBytes(16).toString('hex');

  // 4. Create raw token and salted hash
  const rawKey = `tp_${environment}_${prefixHex}_${secret}`;
  const hash = hashApiKey(secret, salt);

  return { rawKey, prefix, hash, salt };
}

export interface ApiAuthResult {
  hostId?: string;
  apiKeyId?: string;
  propertyIds?: string[] | null;
  scopes?: string[];
  requestId: string;
  rateLimitMax?: number;
  tokensRemaining?: number;
  error?: {
    code: string;
    message: string;
  };
  retryAfter?: number;
  statusCode: number;
}

export function anonymizeIp(ip: string): string {
  if (!ip) return '0.0.0.0';
  if (ip.includes('.')) {
    // IPv4: 192.168.1.123 -> 192.168.1.0
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
    }
  } else if (ip.includes(':')) {
    // IPv6: truncate to /48 subnet
    const parts = ip.split(':');
    if (parts.length >= 3) {
      return `${parts[0]}:${parts[1]}:${parts[2]}::`;
    }
  }
  return ip;
}

export async function validateApiKey(
  request: NextRequest,
  requiredScope: string
): Promise<ApiAuthResult> {
  const requestId = crypto.randomUUID();
  try {
    // 1. Extract API Key
    const authHeader = request.headers.get('authorization') || request.headers.get('x-api-key');
    if (!authHeader) {
      return {
        requestId,
        error: { code: 'invalid_api_key', message: 'API key is invalid or revoked' },
        statusCode: 401
      };
    }

    let rawKey = '';
    if (authHeader.startsWith('Bearer ')) {
      rawKey = authHeader.substring(7).trim();
    } else {
      rawKey = authHeader.trim();
    }

    // Key format check: tp_[live|test]_[prefix]_[secret]
    const parts = rawKey.split('_');
    if (parts.length !== 4 || parts[0] !== 'tp' || (parts[1] !== 'live' && parts[1] !== 'test')) {
      return {
        requestId,
        error: { code: 'invalid_api_key', message: 'API key is invalid or revoked' },
        statusCode: 401
      };
    }

    const env = parts[1];
    const prefix = `tp_${env}_${parts[2]}`;
    const secret = parts[3];

    // 2. Lookup by indexed prefix (O(1) database lookup)
    const { data: keyRecord, error: keyError } = await supabaseAdmin
      .from('airbnb_api_keys')
      .select('*')
      .eq('api_key_prefix', prefix)
      .maybeSingle();

    if (keyError || !keyRecord || keyRecord.revoked_at) {
      return {
        requestId,
        error: { code: 'invalid_api_key', message: 'API key is invalid or revoked' },
        statusCode: 401
      };
    }

    // Verify salted hash matching with server pepper
    const computedHash = hashApiKey(secret, keyRecord.salt);
    if (computedHash !== keyRecord.api_key_hash) {
      return {
        requestId,
        error: { code: 'invalid_api_key', message: 'API key is invalid or revoked' },
        statusCode: 401
      };
    }

    // Check expiration
    if (keyRecord.expires_at && new Date(keyRecord.expires_at) < new Date()) {
      return {
        requestId,
        error: { code: 'invalid_api_key', message: 'API key is invalid or revoked' },
        statusCode: 401
      };
    }

    // 3. Verify scopes
    const scopes: string[] = keyRecord.scopes || [];
    if (!scopes.includes(requiredScope)) {
      return {
        requestId,
        error: { code: 'insufficient_permissions', message: 'The API key does not have the required scope' },
        statusCode: 403
      };
    }

    // 4. Atomic PostgreSQL Token-Bucket Rate Limiter (No concurrency race conditions)
    let allowed = false;
    let tokensLeft = 0;
    try {
      const rpcUrl = `${SUPABASE_URL}/rest/v1/rpc/consume_api_token`;
      const apiKeyVal = SUPABASE_SERVICE_ROLE_KEY || keyRecord.host_id; // Fallback helper if env is loading
      
      const rpcRes = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
          'apikey': apiKeyVal,
          'Authorization': `Bearer ${apiKeyVal}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.pgrst.object+json'
        },
        body: JSON.stringify({ key_uuid: keyRecord.id }),
        cache: 'no-store'
      });

      if (rpcRes.ok) {
        const rateLimitResult = await rpcRes.json();
        allowed = !!rateLimitResult.allowed;
        tokensLeft = parseFloat(rateLimitResult.tokens_left || '0');
      } else {
        console.error('[API Auth] Rate limiter RPC request failed status:', rpcRes.status);
        // Fail open under rare database RPC errors, or fall back to basic count. Let's fail secure:
        return {
          requestId,
          error: { code: 'server_error', message: 'An unexpected error occurred' },
          statusCode: 500
        };
      }
    } catch (rpcErr) {
      console.error('[API Auth] Rate limiter RPC query error:', rpcErr);
      return {
        requestId,
        error: { code: 'server_error', message: 'An unexpected error occurred' },
        statusCode: 500
      };
    }

    if (!allowed) {
      // Return Retry-After calculated based on refill rate (e.g. 60s max/refill duration)
      // Free: max 100/min = refill rate 1.66/sec. To get 1 token, wait 0.6 seconds.
      // Let's return a standard 10-second wait or calculate dynamically.
      const retryAfter = keyRecord.rate_limit_max > 0 
        ? Math.ceil(60.0 / parseFloat(keyRecord.rate_limit_max)) 
        : 60;

      return {
        requestId,
        error: { code: 'rate_limit_exceeded', message: `You have exceeded ${keyRecord.rate_limit_max} requests per minute` },
        retryAfter,
        rateLimitMax: keyRecord.rate_limit_max,
        tokensRemaining: 0,
        statusCode: 429
      };
    }

    // Update metadata on key record asynchronously (non-blocking)
    const clientIp = anonymizeIp(getIpAddress(request));
    supabaseAdmin
      .from('airbnb_api_keys')
      .update({
        last_used_at: new Date().toISOString(),
        last_ip: clientIp,
        last_endpoint: request.nextUrl.pathname
      })
      .eq('id', keyRecord.id)
      .then();

    // Successful validation
    return {
      hostId: keyRecord.host_id,
      apiKeyId: keyRecord.id,
      propertyIds: keyRecord.property_ids,
      scopes,
      requestId,
      rateLimitMax: keyRecord.rate_limit_max,
      tokensRemaining: Math.max(0, Math.floor(tokensLeft)),
      statusCode: 200
    };
  } catch (err: any) {
    console.error('[API Auth] Unexpected validation error:', err);
    return {
      requestId,
      error: { code: 'server_error', message: 'An unexpected error occurred' },
      statusCode: 500
    };
  }
}

export async function logApiRequest(log: {
  apiKeyId?: string;
  hostId?: string;
  endpoint: string;
  method: string;
  ipAddress?: string | null;
  statusCode: number;
  responseTimeMs: number;
  errorMessage?: string | null;
  requestId: string;
}) {
  try {
    // Only log anonymized IP and keep request correlator ID
    const anonymizedIp = log.ipAddress ? anonymizeIp(log.ipAddress) : null;
    
    // Explicitly exclude request headers, secrets, or raw keys
    await supabaseAdmin.from('airbnb_api_logs').insert({
      api_key_id: log.apiKeyId || null,
      host_id: log.hostId || null,
      endpoint: log.endpoint,
      method: log.method,
      ip_address: anonymizedIp,
      status_code: log.statusCode,
      response_time_ms: log.responseTimeMs,
      error_message: log.errorMessage || null,
      request_id: log.requestId
    });
  } catch (err) {
    console.error('[API Auth] Failed to insert API log:', err);
  }
}

export function getIpAddress(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || '127.0.0.1';
}
