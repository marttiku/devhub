const http = require('http');
const { execFile } = require('child_process');

const PORT = process.env.HOST_HELPER_PORT || 4243;

const server = http.createServer((req, res) => {
  if (req.method !== 'POST') {
    res.writeHead(405).end('Method Not Allowed');
    return;
  }

  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    let payload;
    try { payload = JSON.parse(body); } catch {
      res.writeHead(400).end('Bad JSON');
      return;
    }

    if (req.url === '/open-browser' && payload.url) {
      execFile('open', [payload.url], (err) => {
        res.writeHead(err ? 500 : 200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: !err, error: err?.message }));
      });
    } else if (req.url === '/open-cursor' && payload.path) {
      execFile('cursor', [payload.path], (err) => {
        res.writeHead(err ? 500 : 200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: !err, error: err?.message }));
      });
    } else {
      res.writeHead(404).end('Not Found');
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`DevHub host helper listening on 0.0.0.0:${PORT}`);
});
