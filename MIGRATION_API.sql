-- =========================================================================
-- CLEANPROOF PMS API MIGRATION SCRIPT (PRODUCTION-GRADE UPGRADES)
-- Copy and paste this script into your Supabase Dashboard SQL Editor.
-- =========================================================================

-- 1. Create API Keys Table
CREATE TABLE IF NOT EXISTS airbnb_api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id UUID REFERENCES airbnb_hosts(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  api_key_hash TEXT UNIQUE NOT NULL,
  api_key_prefix TEXT UNIQUE NOT NULL,
  salt TEXT NOT NULL,
  scopes TEXT[] DEFAULT '{properties:read,reports:read}' NOT NULL,
  property_ids UUID[] DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  revoked_by TEXT DEFAULT NULL,
  revocation_reason TEXT DEFAULT NULL,
  last_ip TEXT DEFAULT NULL,
  last_endpoint TEXT DEFAULT NULL,
  rate_limit_max NUMERIC NOT NULL DEFAULT 100.0,
  rate_limit_tokens NUMERIC NOT NULL DEFAULT 100.0,
  rate_limit_last_refilled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  environment TEXT DEFAULT 'live' NOT NULL,
  created_by UUID REFERENCES airbnb_hosts(id) ON DELETE SET NULL
);

-- 2. Create API Access Logs Table
CREATE TABLE IF NOT EXISTS airbnb_api_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_id UUID REFERENCES airbnb_api_keys(id) ON DELETE CASCADE,
  host_id UUID REFERENCES airbnb_hosts(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  ip_address TEXT,
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER,
  error_message TEXT,
  request_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Alter existing tables to add columns if they were created in a previous run
ALTER TABLE airbnb_api_keys ADD COLUMN IF NOT EXISTS salt TEXT;
ALTER TABLE airbnb_api_keys ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE airbnb_api_keys ADD COLUMN IF NOT EXISTS revoked_by TEXT DEFAULT NULL;
ALTER TABLE airbnb_api_keys ADD COLUMN IF NOT EXISTS revocation_reason TEXT DEFAULT NULL;
ALTER TABLE airbnb_api_keys ADD COLUMN IF NOT EXISTS last_ip TEXT DEFAULT NULL;
ALTER TABLE airbnb_api_keys ADD COLUMN IF NOT EXISTS last_endpoint TEXT DEFAULT NULL;
ALTER TABLE airbnb_api_keys ADD COLUMN IF NOT EXISTS rate_limit_max NUMERIC NOT NULL DEFAULT 100.0;
ALTER TABLE airbnb_api_keys ADD COLUMN IF NOT EXISTS rate_limit_tokens NUMERIC NOT NULL DEFAULT 100.0;
ALTER TABLE airbnb_api_keys ADD COLUMN IF NOT EXISTS rate_limit_last_refilled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
ALTER TABLE airbnb_api_keys ADD COLUMN IF NOT EXISTS environment TEXT DEFAULT 'live' NOT NULL;
ALTER TABLE airbnb_api_keys ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES airbnb_hosts(id) ON DELETE SET NULL;

ALTER TABLE airbnb_api_logs ADD COLUMN IF NOT EXISTS request_id UUID;

-- 4. Create indexes for high-performance prefix-lookup and queries
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON airbnb_api_keys(api_key_prefix);
CREATE INDEX IF NOT EXISTS idx_api_logs_request_id ON airbnb_api_logs(request_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_host_created ON airbnb_api_logs(host_id, created_at DESC);

-- 5. Strict Row Level Security (RLS) Configuration
ALTER TABLE airbnb_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE airbnb_api_logs ENABLE ROW LEVEL SECURITY;

-- Drop all permissive RLS policies to prevent public anon/authenticated access
DROP POLICY IF EXISTS "Allow all" ON airbnb_api_keys;
DROP POLICY IF EXISTS "Allow all" ON airbnb_api_logs;

-- Explicitly verify that no SELECT/INSERT/UPDATE policies exist for public roles.
-- Backend calls using the Supabase Service Role Key bypass RLS automatically.

-- 6. Atomic PL/pgSQL Token-Bucket Rate Limiter Function
CREATE OR REPLACE FUNCTION consume_api_token(key_uuid UUID)
RETURNS TABLE (allowed BOOLEAN, tokens_left NUMERIC) AS $$
DECLARE
  updated_rows INT;
  remaining NUMERIC;
BEGIN
  UPDATE airbnb_api_keys
  SET
    rate_limit_tokens = LEAST(
      rate_limit_max,
      rate_limit_tokens + EXTRACT(EPOCH FROM (now() - rate_limit_last_refilled_at)) * (rate_limit_max / 60.0)
    ) - 1.0,
    rate_limit_last_refilled_at = now()
  WHERE id = key_uuid 
    AND revoked_at IS NULL 
    AND (expires_at IS NULL OR expires_at > now())
    AND LEAST(
      rate_limit_max,
      rate_limit_tokens + EXTRACT(EPOCH FROM (now() - rate_limit_last_refilled_at)) * (rate_limit_max / 60.0)
    ) >= 1.0;
    
  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  
  IF updated_rows > 0 THEN
    SELECT rate_limit_tokens INTO remaining FROM airbnb_api_keys WHERE id = key_uuid;
    RETURN QUERY SELECT TRUE, remaining;
  ELSE
    SELECT rate_limit_tokens INTO remaining FROM airbnb_api_keys WHERE id = key_uuid;
    RETURN QUERY SELECT FALSE, remaining;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. API Transactional Outbox (Designed for webhooks event streaming in Phase 2)
CREATE TABLE IF NOT EXISTS airbnb_api_outbox (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  attempts INTEGER DEFAULT 0 NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE airbnb_api_outbox ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all" ON airbnb_api_outbox;
CREATE INDEX IF NOT EXISTS idx_api_outbox_status_created ON airbnb_api_outbox(status, created_at);

