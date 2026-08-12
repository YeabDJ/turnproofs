import https from 'https';

function checkDiag() {
  https.get('https://www.turnproofs.com/api/diag', (res) => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => {
      console.log("DIAG RESPONSE:", res.statusCode, body);
    });
  });
}

setTimeout(checkDiag, 12000);
