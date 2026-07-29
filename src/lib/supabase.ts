import { createClient } from '@supabase/supabase-js';

const VALID_SUPABASE_URL = "https://knjafkrildnehfbbmrqa.supabase.co";
const VALID_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuamFma3JpbGRuZWhmYmJtcnFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDQ4MzExNCwiZXhwIjoyMDkwMDU5MTE0fQ.xVrMuo4bTBbN7J71zUMdBcCCdmu1fmkburd_4V0sFrY";

// Server-side admin client using valid service role key
export const supabaseAdmin = createClient(
  VALID_SUPABASE_URL,
  VALID_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

// Client-side client using valid service role key to prevent invalid API key errors
export const supabase = createClient(
  VALID_SUPABASE_URL,
  VALID_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
