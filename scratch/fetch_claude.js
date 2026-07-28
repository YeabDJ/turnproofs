const https = require('https');
const fs = require('fs');

const url = 'https://claude.ai/share/7a7e8ee0-628f-4df0-9140-0d9e3660b3eb';

https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    fs.writeFileSync('scratch/claude_raw.html', body);
    console.log('Saved raw HTML, length:', body.length);

    // Try finding JSON scripts or embedded state
    const scriptMatches = body.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
    if (scriptMatches) {
      console.log('Found scripts count:', scriptMatches.length);
      scriptMatches.forEach((s, i) => {
        if (s.includes('pricing') || s.includes('Turno') || s.includes('Breezeway')) {
          console.log(`Script ${i} matches relevant text!`);
          fs.writeFileSync(`scratch/script_${i}.txt`, s);
        }
      });
    }
  });
});
