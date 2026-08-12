import https from 'https';

const SUPABASE_URL = 'https://vtcjypssthnmkbvbrpjq.supabase.co';
const FALLBACK_JWT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0Y2p5cHNzdGhubWtidmJycGpxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTI3MDEwMSwiZXhwIjoyMTAwODQ2MTAxfQ.XAI-5oXSk1EFzgJSQKFis7WVleue74Wa0E8zfSr07z0';

const req = https.request(`${SUPABASE_URL}/rest/v1/airbnb_cleaners?select=*&limit=5`, {
  headers: {
    'apikey': FALLBACK_JWT_KEY,
    'Authorization': `Bearer ${FALLBACK_JWT_KEY}`
  }
}, (res) => {
  console.log("STATUS:", res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log("BODY:", data));
});

req.end();
