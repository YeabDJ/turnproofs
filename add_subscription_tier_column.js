const VALID_SUPABASE_URL = "https://knjafkrildnehfbbmrqa.supabase.co";
const VALID_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuamFma3JpbGRuZWhmYmJtcnFhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDQ4MzExNCwiZXhwIjoyMDkwMDU5MTE0fQ.xVrMuo4bTBbN7J71zUMdBcCCdmu1fmkburd_4V0sFrY";

async function addSubscriptionTier() {
  // Check airbnb_hosts columns
  const res = await fetch(`${VALID_SUPABASE_URL}/rest/v1/airbnb_hosts?select=*&limit=1`, {
    headers: { 'apikey': VALID_SERVICE_ROLE_KEY, 'Authorization': `Bearer ${VALID_SERVICE_ROLE_KEY}` }
  });
  const hosts = await res.json();
  console.log("Current Host Schema:", Object.keys(hosts[0] || {}));

  // Try updating subscription_tier column
  const patchRes = await fetch(`${VALID_SUPABASE_URL}/rest/v1/airbnb_hosts?id=eq.${hosts[0]?.id}`, {
    method: 'PATCH',
    headers: {
      'apikey': VALID_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${VALID_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({ subscription_tier: 'standard' })
  });

  if (!patchRes.ok) {
    console.log("Column subscription_tier may need creation or already exists:", await patchRes.text());
  } else {
    console.log("Column subscription_tier updated successfully!");
  }
}

addSubscriptionTier();
