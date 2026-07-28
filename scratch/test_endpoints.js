const https = require('https');

const shareId = '7a7e8ee0-628f-4df0-9140-0d9e3660b3eb';
const endpoints = [
  `https://claude.ai/api/share/${shareId}`,
  `https://claude.ai/api/auth/shared_conversations/${shareId}`,
  `https://claude.ai/api/organizations/share/${shareId}`,
  `https://claude.ai/api/chat_snapshots/${shareId}`
];

endpoints.forEach(url => {
  https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Accept': 'application/json' } }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(url, 'Status:', res.statusCode, 'Length:', data.length);
      if (res.statusCode === 200) {
        console.log('DATA:', data.slice(0, 300));
      }
    });
  });
});
