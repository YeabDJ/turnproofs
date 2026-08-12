import https from 'https';

function testFinalLiveLogin() {
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
    console.log("FINAL LIVE STATUS:", res.statusCode);
    console.log("FINAL COOKIE:", res.headers['set-cookie'] ? "SUCCESSFULLY SET!" : "No cookie");
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => console.log("FINAL BODY:", body));
  });

  req.write(data);
  req.end();
}

setTimeout(testFinalLiveLogin, 12000);
