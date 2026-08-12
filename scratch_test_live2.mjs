import https from 'https';

async function testLiveLogin() {
  const data = JSON.stringify({
    email: 'yeabidj@gmail.com',
    pin_code: '123456'
  });

  const req = https.request('https://www.turnproofs.com/api/auth', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  }, (res) => {
    console.log("STATUS:", res.statusCode);
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => console.log("LIVE RESPONSE BODY:", body));
  });

  req.write(data);
  req.end();
}

// Wait 12s for Vercel deployment to finish building
setTimeout(testLiveLogin, 12000);
