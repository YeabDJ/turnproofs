import { NextResponse } from 'next/server';

export async function GET() {
  const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "https://vtcjypssthnmkbvbrpjq.supabase.co").replace(/["'\s]/g, '');
  const cleanUrl = supabaseUrl.startsWith('http') ? supabaseUrl : `https://${supabaseUrl}`;

  const jwtKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0Y2p5cHNzdGhubWtidmJycGpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTI3MDEwMSwiZXhwIjoyMTAwODQ2MTAxfQ.XAI-5oXSk1EFzgJSQKFis7WVleue74Wa0E8zfSr07z0";

  let testResult: any = {};

  try {
    const target = `${cleanUrl}/rest/v1/airbnb_hosts?select=id,email`;
    const res = await fetch(target, {
      headers: {
        'apikey': jwtKey,
        'Authorization': `Bearer ${jwtKey}`
      },
      cache: 'no-store'
    });

    const status = res.status;
    const body = await res.json().catch(() => ({}));
    testResult = { ok: res.ok, status, body };
  } catch (err: any) {
    testResult = {
      ok: false,
      errorName: err.name,
      errorMessage: err.message,
      cause: err.cause ? (err.cause.message || String(err.cause)) : null,
      stack: err.stack
    };
  }

  return NextResponse.json({
    env_SUPABASE_URL: process.env.SUPABASE_URL || null,
    env_SERVICE_KEY_PREFIX: process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 15) : null,
    cleanUrl,
    testResult
  });
}
