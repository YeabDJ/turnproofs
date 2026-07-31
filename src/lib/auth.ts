import { cookies } from 'next/headers';
import { supabaseAdmin } from './supabase';

export interface Host {
  id: string;
  email: string;
  pin_code: string;
  business_name: string | null;
  subscription_tier: string;
  subscription_status?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
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

  const rawBusiness = host.business_name || '';
  const isCommercial = rawBusiness.includes('|||commercial');
  const cleanBusinessName = rawBusiness.replace('|||commercial', '').trim();

  return {
    ...host,
    business_name: cleanBusinessName,
    subscription_tier: isCommercial ? 'commercial' : 'standard'
  } as Host;
}
