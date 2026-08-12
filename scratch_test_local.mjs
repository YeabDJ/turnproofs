import http from 'http';

function testLocalLogin() {
  const data = JSON.stringify({
    email: 'yeabidj@gmail.com',
    pin_code: '123456'
  });

  const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  }, (res) => {
    console.log("LOCAL STATUS:", res.statusCode);
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => console.log("LOCAL BODY:", body));
  });

  req.write(data);
  req.end();
}

testLocalLogin();
