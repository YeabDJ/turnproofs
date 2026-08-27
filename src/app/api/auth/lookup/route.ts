import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Simple in-memory rate limiter for lookup queries per IP
const lookupIpTracker = new Map<string, { count: number; resetTime: number }>();

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    const now = Date.now();
    
    // Rate limit lookup per IP: max 30 lookups per 1 minute
    const ipRecord = lookupIpTracker.get(ip) || { count: 0, resetTime: now + 60000 };
    if (now > ipRecord.resetTime) {
      ipRecord.count = 0;
      ipRecord.resetTime = now + 60000;
    }
    ipRecord.count += 1;
    lookupIpTracker.set(ip, ipRecord);

    if (ipRecord.count > 30) {
      return NextResponse.json({ success: false, error: 'Too many requests. Please wait a moment.' }, { status: 429 });
    }

    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ success: false, error: 'Valid email is required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Query database for host record existence
    const { data: host } = await supabaseAdmin
      .from('airbnb_hosts')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    const exists = !!host;

    return NextResponse.json({
      success: true,
      exists
    });
  } catch (error: any) {
    console.error('[AUTH LOOKUP ERROR]:', error);
    return NextResponse.json({ success: false, error: 'Failed to lookup email.' }, { status: 500 });
  }
}
