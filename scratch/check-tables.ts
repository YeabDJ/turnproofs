import { supabaseAdmin } from '../src/lib/supabase';

async function check() {
  console.log("Checking if airbnb_api_keys table exists...");
  const { data, error } = await supabaseAdmin.from('airbnb_api_keys').select('*').limit(1);
  if (error) {
    console.error("Error or Table does not exist:", error);
  } else {
    console.log("airbnb_api_keys table exists! Data:", data);
  }

  console.log("Checking if airbnb_api_logs table exists...");
  const { data: logsData, error: logsError } = await supabaseAdmin.from('airbnb_api_logs').select('*').limit(1);
  if (logsError) {
    console.error("Error or Table does not exist:", logsError);
  } else {
    console.log("airbnb_api_logs table exists! Data:", logsData);
  }

  console.log("Checking if turnproofs_leads table exists...");
  const { data: leadsData, error: leadsError } = await supabaseAdmin.from('turnproofs_leads').select('*').limit(1);
  if (leadsError) {
    console.error("Error or Table does not exist:", leadsError);
  } else {
    console.log("turnproofs_leads table exists! Data:", leadsData);
  }
}

check();
