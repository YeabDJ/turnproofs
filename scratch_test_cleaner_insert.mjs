import https from 'https';

const SUPABASE_URL = 'https://vtcjypssthnmkbvbrpjq.supabase.co';
const FALLBACK_JWT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0Y2p5cHNzdGhubWtidmJycGpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTI3MDEwMSwiZXhwIjoyMTAwODQ2MTAxfQ.XAI-5oXSk1EFzgJSQKFis7WVleue74Wa0E8zfSr07z0';

const body = JSON.stringify({
  property_id: '1b1ee51b-b6fe-47de-9b93-3557d7fba3ab',
  name: 'Morgan',
  phone: 'info@eqcdmv.com'
});

const req = https.request(`${SUPABASE_URL}/rest/v1/airbnb_cleaners`, {
  method: 'POST',
  headers: {
    'apikey': FALLBACK_JWT_KEY,
    'Authorization': `Bearer ${FALLBACK_JWT_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  }
}, (res) => {
  console.log("INSERT STATUS:", res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log("INSERT BODY:", data));
});

req.write(body);
req.end();
