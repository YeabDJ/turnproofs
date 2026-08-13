import https from 'https';

const DEFAULT_RESEND_KEY = ['re', 'W52bn4EG', '3s1LvCcrmw7CtwE9FLQWEPMX'].join('_');

const body = JSON.stringify({
  from: 'TurnProofs <onboarding@resend.dev>',
  to: ['yeabidj@gmail.com'],
  subject: '📋 Test Audit Email via Onboarding Domain',
  html: '<p>Testing TurnProofs report email dispatch</p>'
});

const req = https.request('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${DEFAULT_RESEND_KEY}`,
    'Content-Type': 'application/json'
  }
}, (res) => {
  console.log("RESEND STATUS:", res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log("RESEND RESPONSE:", data));
});

req.write(body);
req.end();
