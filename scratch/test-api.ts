import crypto from 'crypto';
import { supabaseAdmin, supabase } from '../src/lib/supabase';
import { hashApiKey } from '../src/lib/api-auth';

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('\x1b[35;1m=== TURNPROFS PMS API PRODUCTION-GRADE TEST SUITE ===\x1b[0m\n');
  console.log('Testing against Next.js local server at:', BASE_URL);
  
  // 1. Verify Database RPC Rate Limiter Function Exists
  console.log('\x1b[36m[1/7] Checking Database schema & PL/pgSQL RPC rate limiter...\x1b[0m');
  const { data: keysTableCheck, error: keysErr } = await supabaseAdmin.from('airbnb_api_keys').select('id').limit(1);
  if (keysErr) {
    console.error('\x1b[31mFAIL: Database tables airbnb_api_keys not found. Run SQL migration first.\x1b[0m');
    process.exit(1);
  }
  console.log('✓ API keys table verified.');

  // Check RPC function
  const { error: rpcErr } = await supabaseAdmin.rpc('consume_api_token', { key_uuid: '00000000-0000-0000-0000-000000000000' });
  if (rpcErr && rpcErr.message.includes('does not exist')) {
    console.error('\x1b[31mFAIL: PL/pgSQL function consume_api_token does not exist. Ensure SQL migration ran completely.\x1b[0m');
    process.exit(1);
  }
  console.log('✓ PL/pgSQL consume_api_token rate limiter RPC verified.\n');

  // 2. Setup isolated Test Host context (Cascade deletes on cleanup)
  console.log('\x1b[36m[2/7] Initializing isolated mock test host context...\x1b[0m');
  const testHostId = crypto.randomUUID();
  const testPropertyId = crypto.randomUUID();

  // Create isolated mock host
  const { error: hostErr } = await supabaseAdmin.from('airbnb_hosts').insert({
    id: testHostId,
    email: `api-test-${testHostId.substring(0, 8)}@turnproofs.com`,
    password_hash: 'mock_password_hash',
    full_name: 'API Test Runner Host',
    subscription_tier: 'standard'
  });

  if (hostErr) {
    console.error('\x1b[31mFAIL: Unable to create isolated test host:\x1b[0m', hostErr);
    process.exit(1);
  }

  // Create isolated mock property
  const { error: propErr } = await supabaseAdmin.from('airbnb_properties').insert({
    id: testPropertyId,
    host_id: testHostId,
    name: 'Isolated API Test Property',
    address: '123 API Test Way, San Francisco, CA'
  });

  if (propErr) {
    console.error('\x1b[31mFAIL: Unable to create test property:\x1b[0m', propErr);
    await cleanup(testHostId);
    process.exit(1);
  }
  console.log(`✓ Created isolated test host (${testHostId}) and property (${testPropertyId}).\n`);

  // Helper request function
  const makeApiRequest = async (path: string, authHeaderValueValue: string | null) => {
    const headers: Record<string, string> = { 'Accept': 'application/json' };
    if (authHeaderValueValue) {
      headers['Authorization'] = authHeaderValueValue;
    }
    const res = await fetch(`${BASE_URL}${path}`, { headers });
    const text = await res.text();
    let json = {};
    try {
      json = JSON.parse(text);
    } catch (e) {}
    return {
      status: res.status,
      headers: res.headers,
      json
    } as any;
  };

  // Helper key generator
  const createMockDbKey = async (options: {
    name: string;
    scopes: string[];
    rate_limit_max?: number;
    expires_at?: string | null;
    revoked_at?: string | null;
    environment?: 'live' | 'test';
  }) => {
    const env = options.environment || 'live';
    const prefixHex = crypto.randomBytes(4).toString('hex');
    const secret = crypto.randomBytes(32).toString('hex');
    const salt = crypto.randomBytes(16).toString('hex');
    const prefix = `tp_${env}_${prefixHex}`;
    const rawKey = `tp_${env}_${prefixHex}_${secret}`;
    const keyHash = hashApiKey(secret, salt);

    const limitMax = options.rate_limit_max || 100;

    const { data: dbRecord, error: insertErr } = await supabaseAdmin
      .from('airbnb_api_keys')
      .insert({
        host_id: testHostId,
        name: options.name,
        api_key_hash: keyHash,
        api_key_prefix: prefix,
        salt,
        scopes: options.scopes,
        expires_at: options.expires_at || null,
        revoked_at: options.revoked_at || null,
        rate_limit_max: limitMax,
        rate_limit_tokens: limitMax,
        rate_limit_last_refilled_at: new Date().toISOString(),
        environment: env,
        created_by: testHostId
      })
      .select('*')
      .single();

    if (insertErr || !dbRecord) {
      throw new Error(`Failed to generate mock DB key: ${insertErr?.message}`);
    }

    return { rawKey, record: dbRecord };
  };

  try {
    // 3. Assert Authorization Edge Cases
    console.log('\x1b[36m[3/7] Asserting API Authorization Validation & Malformed Keys...\x1b[0m');
    
    // Test A: No header -> 401
    const res1 = await makeApiRequest('/api/v1/properties', null);
    assert(res1.status === 401, 'No auth header must return 401');
    assert(res1.json.error?.code === 'invalid_api_key', 'Must return invalid_api_key code');
    assert(!!res1.headers.get('x-request-id'), 'Must include x-request-id header on failure');

    // Test B: Malformed header -> 401
    const res2 = await makeApiRequest('/api/v1/properties', 'Bearer tp_invalid_format');
    assert(res2.status === 401, 'Malformed key must return 401');
    assert(res2.json.error?.code === 'invalid_api_key', 'Malformed key error code matches');

    // Test C: Non-existent key -> 401
    const res3 = await makeApiRequest('/api/v1/properties', 'Bearer tp_live_aa11bb22_3344556677889900');
    assert(res3.status === 401, 'Non-existent key prefix must return 401');

    // Test D: Expired key -> 401
    const expiredKey = await createMockDbKey({
      name: 'Expired Key',
      scopes: ['properties:read'],
      expires_at: new Date(Date.now() - 3600 * 1000).toISOString() // 1 hour ago
    });
    const res4 = await makeApiRequest('/api/v1/properties', `Bearer ${expiredKey.rawKey}`);
    assert(res4.status === 401, 'Expired key must return 401');
    assert(res4.json.error?.code === 'invalid_api_key', 'Expired key error code matches');

    // Test E: Revoked key -> 401
    const revokedKey = await createMockDbKey({
      name: 'Revoked Key',
      scopes: ['properties:read'],
      revoked_at: new Date().toISOString()
    });
    const res5 = await makeApiRequest('/api/v1/properties', `Bearer ${revokedKey.rawKey}`);
    assert(res5.status === 401, 'Revoked key must return 401');
    assert(res5.json.error?.code === 'invalid_api_key', 'Revoked key error code matches');

    // Test F: Scope-denied key -> 403
    const scopeDeniedKey = await createMockDbKey({
      name: 'Scope Denied Key',
      scopes: ['properties:read'] // No reports:read
    });
    const res6 = await makeApiRequest('/api/v1/reports', `Bearer ${scopeDeniedKey.rawKey}`);
    assert(res6.status === 403, 'Scope denied key must return 403 Forbidden');
    assert(res6.json.error?.code === 'insufficient_permissions', 'Scope denied error code matches');
    
    console.log('\x1b[32mPASS: All authentication rejections, expirations, and scope limits conform.\x1b[0m\n');

    // 4. Assert Atomic Rate Limiting (Token Bucket)
    console.log('\x1b[36m[4/7] Asserting Atomic Rate Limiting (Token Bucket)...\x1b[0m');
    const rateLimitedKey = await createMockDbKey({
      name: 'Rate Limited Key',
      scopes: ['properties:read'],
      rate_limit_max: 3 // Set low limit to 3 requests/minute
    });

    console.log('Sending 4 parallel requests against rate_limit_max = 3...');
    const responses = await Promise.all([
      makeApiRequest('/api/v1/properties', `Bearer ${rateLimitedKey.rawKey}`),
      makeApiRequest('/api/v1/properties', `Bearer ${rateLimitedKey.rawKey}`),
      makeApiRequest('/api/v1/properties', `Bearer ${rateLimitedKey.rawKey}`),
      makeApiRequest('/api/v1/properties', `Bearer ${rateLimitedKey.rawKey}`)
    ]);

    const statuses = responses.map(r => r.status);
    const rateLimitCount = statuses.filter(s => s === 429).length;
    const successCount = statuses.filter(s => s === 200).length;

    console.log(`Statuses returned: [${statuses.join(', ')}]`);
    assert(successCount === 3, `Expected exactly 3 successful requests, got ${successCount}`);
    assert(rateLimitCount === 1, `Expected exactly 1 rate-limited request (429), got ${rateLimitCount}`);

    const limitedRes = responses.find(r => r.status === 429);
    assert(limitedRes.json.error?.code === 'rate_limit_exceeded', 'Rate limit error code matches');
    assert(!!limitedRes.headers.get('Retry-After'), 'Retry-After header present');
    console.log('\x1b[32mPASS: Atomic token-bucket rate limiter successfully throttles concurrent requests.\x1b[0m\n');

    // 5. Assert Output Schemas, Headers & Pagination
    console.log('\x1b[36m[5/7] Asserting Output Schemas, Headers & Pagination...\x1b[0m');
    const validKey = await createMockDbKey({
      name: 'Valid Key',
      scopes: ['properties:read', 'reports:read']
    });

    // Verify Success response formatting
    const propRes = await makeApiRequest('/api/v1/properties', `Bearer ${validKey.rawKey}`);
    assert(propRes.status === 200, 'Properties query success');
    assert(propRes.json.success === true, 'Success envelope verified');
    assert(Array.isArray(propRes.json.properties), 'Properties is array');
    assert(!!propRes.headers.get('x-request-id'), 'x-request-id header present on success');

    // Verify Test Key Prefix success response formatting
    const validTestKey = await createMockDbKey({
      name: 'Valid Test Key',
      scopes: ['properties:read'],
      environment: 'test'
    });
    const testPropRes = await makeApiRequest('/api/v1/properties', `Bearer ${validTestKey.rawKey}`);
    assert(testPropRes.status === 200, 'Properties query success with tp_test_ prefix key');
    assert(testPropRes.json.success === true, 'Test key success envelope verified');

    // Insert dummy report to test cursor next_cursor pagination
    const mockReportId = crypto.randomUUID();
    await supabaseAdmin.from('airbnb_reports').insert({
      id: mockReportId,
      property_id: testPropertyId,
      cleaner_name: 'Test Runner Cleaner',
      started_at: new Date(Date.now() - 3600 * 1000).toISOString(),
      completed_at: new Date().toISOString(),
      start_latitude: '37.7749',
      start_longitude: '-122.4194',
      end_latitude: '37.7749',
      end_longitude: '-122.4194',
      notes: 'Sanitized'
    });

    const reportsRes = await makeApiRequest('/api/v1/reports?limit=10', `Bearer ${validKey.rawKey}`);
    assert(reportsRes.status === 200, 'Reports query success');
    assert(Array.isArray(reportsRes.json.data), 'Reports payload list is nested in "data"');
    assert(reportsRes.json.data.length === 1, 'Mock report returned');
    assert(reportsRes.json.pagination !== undefined, 'Pagination metadata envelope exists');
    assert(reportsRes.json.pagination.total === 1, 'Pagination total reports is 1');
    assert(reportsRes.json.pagination.has_more === false, 'No more pages');
    
    console.log('\x1b[32mPASS: Output structures, response headers, and pagination envelopes match standard.\x1b[0m\n');

    // 6. Assert Row Level Security (RLS) Blocks Anon
    console.log('\x1b[36m[6/7] Asserting Row Level Security (RLS) Blocks Public Roles...\x1b[0m');
    const { data: anonData, error: anonError } = await supabase
      .from('airbnb_api_keys')
      .select('*')
      .limit(1);

    // If RLS is enabled with no policies, anon/authenticated role receives an empty dataset or error
    assert(anonError || !anonData || anonData.length === 0, 'RLS must block public anon select access');
    console.log('\x1b[32mPASS: RLS prevents public role access to API key table.\x1b[0m\n');

    // 7. Assert Logs Security (No raw keys logged)
    console.log('\x1b[36m[7/7] Asserting Logs Integrity & Security...\x1b[0m');
    const { data: logs, error: logsErr } = await supabaseAdmin
      .from('airbnb_api_logs')
      .select('*')
      .eq('host_id', testHostId);

    assert(!logsErr && logs && logs.length > 0, 'API access logs record exists');
    for (const log of logs) {
      // Assert raw key is never present in log table
      assert(!JSON.stringify(log).includes(validKey.rawKey), 'Logs must never store raw live API key values');
      assert(!JSON.stringify(log).includes(validTestKey.rawKey), 'Logs must never store raw test API key values');
      assert(log.ip_address !== '127.0.0.1', 'Logs must store anonymized/truncated IP subnets');
      assert(log.request_id !== null, 'Logs must store correlated request_id UUIDs');
    }
    console.log('\x1b[32mPASS: Logs conform to security/privacy controls.\x1b[0m\n');

    console.log('\x1b[35;1mALL PRODUCTION-GRADE PMS API INTEGRATION TESTS PASSED SUCCESSFULLY!\x1b[0m');

  } catch (err: any) {
    console.error('\x1b[31;1mTEST SUITE TERMINATED WITH ERRORS:\x1b[0m', err.message);
  } finally {
    // Cleanup isolated data cascade deletes keys, logs, and properties
    await cleanup(testHostId);
  }
}

async function cleanup(hostId: string) {
  console.log('\n\x1b[90mCleanup: Deleting isolated mock test host and all associated logs/keys...\x1b[0m');
  await supabaseAdmin.from('airbnb_hosts').delete().eq('id', hostId);
  console.log('\x1b[90mCleanup complete.\x1b[0m');
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assert failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

runTests();
