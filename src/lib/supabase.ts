import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = "https://knjafkrildnehfbbmrqa.supabase.co";
const DEFAULT_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuamFma3JpbGRuZWhmYmJtcnFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDQ4MzExNCwiZXhwIjoyMDkwMDU5MTE0fQ.xVrMuo4bTBbN7J71zUMdBcCCdmu1fmkburd_4V0sFrY";
const DEFAULT_ANON_KEY = "sb_publishable_KM8JgvDrKDD2eEeLMHYkeA_ta4SC1Q0";

const rawUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseUrl = (rawUrl && !rawUrl.includes('vtcjpsstnmkbvbrpjq')) ? rawUrl : DEFAULT_SUPABASE_URL;

const rawServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseServiceKey = rawServiceKey || DEFAULT_SERVICE_ROLE_KEY;

const rawAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseAnonKey = rawAnonKey || DEFAULT_ANON_KEY;

// Server-side client using the service role key to bypass RLS policies where necessary
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

// Client-side or anonymous client
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
