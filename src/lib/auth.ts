import { cookies } from 'next/headers';
import { supabaseAdmin } from './supabase';

export interface Host {
  id: string;
  email: string;
  pin_code: string;
  business_name: string | null;
  created_at: string;
}

export async function getAuthenticatedHost(): Promise<Host | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('airbnb_host_token')?.value;
  if (!token) return null;

  const { data: host, error } = await supabaseAdmin
    .from('airbnb_hosts')
    .select('*')
    .eq('id', token)
    .single();

  if (error || !host) {
    return null;
  }
  return host as Host;
}
