const SUPABASE_URL = process.env.SUPABASE_URL || "https://vtcjypssthnmkbvbrpjq.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0Y2p5cHNzdGhubWtidmJycGpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTI3MDEwMSwiZXhwIjoyMTAwODQ2MTAxfQ.XAI-5oXSk1EFzgJSQKFis7WVleue74Wa0E8zfSr07z0";

async function grantSupportAccess() {
  const email = 'support@turnproofs.com';
  const defaultPin = '123456';
  const businessName = 'TurnProofs Commercial Support Admin';

  console.log(`Granting Commercial Tier access to ${email}...`);

  // Check if exists
  const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/airbnb_hosts?email=eq.${encodeURIComponent(email)}`, {
    headers: {
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
    }
  });

  const existing = await checkRes.json();

  if (Array.isArray(existing) && existing.length > 0) {
    const host = existing[0];
    console.log('Account exists. Updating to Commercial tier...');
    const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/airbnb_hosts?id=eq.${host.id}`, {
      method: 'PATCH',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        business_name: `${businessName}|||commercial`,
        pin_code: host.pin_code || defaultPin
      })
    });
    const updated = await updateRes.json();
    console.log('Successfully updated support host:', updated);
  } else {
    console.log('Creating new host account for support@turnproofs.com...');
    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/airbnb_hosts`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        email,
        pin_code: defaultPin,
        business_name: `${businessName}|||commercial`
      })
    });
    const created = await insertRes.json();
    console.log('Successfully created support host account:', created);
  }
}

grantSupportAccess();
