import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // Insert lead email into database
    const { error } = await supabaseAdmin
      .from('turnproofs_leads')
      .insert({ email });

    if (error) {
      // If it already exists, just treat it as success (idempotent)
      if (error.code === '23505') {
        return NextResponse.json({ success: true, alreadyExists: true });
      }
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
