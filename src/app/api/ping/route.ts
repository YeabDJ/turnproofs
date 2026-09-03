import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const revalidate = 0;

export async function GET() {
  try {
    // Keep-alive query to maintain Supabase activity and prevent free-tier auto-pausing
    const { data, error } = await supabaseAdmin
      .from('airbnb_hosts')
      .select('id')
      .limit(1);

    if (error) {
      return NextResponse.json({ status: 'error', error: error.message, timestamp: new Date().toISOString() }, { status: 500 });
    }

    return NextResponse.json({
      status: 'ok',
      message: 'TurnProofs Keep-Alive & Supabase Ping Operational',
      timestamp: new Date().toISOString(),
      active: true
    });
  } catch (err: any) {
    return NextResponse.json({ status: 'error', error: err.message, timestamp: new Date().toISOString() }, { status: 500 });
  }
}
