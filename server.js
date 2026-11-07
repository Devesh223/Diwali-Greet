// Zero-dependency static server for Render. Injects absolute URLs + personalised
// OpenGraph tags so WhatsApp / Instagram link previews show "A Diwali wish for <Name>".
const http = require('http'), https = require('https'), fs = require('fs'), path = require('path'), zlib = require('zlib');
const PUB = path.join(__dirname, 'public'), PORT = process.env.PORT || 3000;
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.json': 'application/json', '.txt': 'text/plain', '.mp3': 'audio/mpeg' };
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clean = (v) => String(v || '').replace(/[<>\u0000-\u001f]/g, '').trim().slice(0, 24);
const indexTpl = fs.readFileSync(path.join(PUB, 'index.html'), 'utf8');

http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  let p = decodeURIComponent(url.pathname);
  if (p === '/healthz') { res.writeHead(200); return res.end('ok'); }
  if (p === '/' || p === '/index.html') {
    const proto = (req.headers['x-forwarded-proto'] || 'http').split(',')[0], host = req.headers['x-forwarded-host'] || req.headers.host;
    const origin = `${proto}://${host}`, to = clean(url.searchParams.get('to')), from = clean(url.searchParams.get('from'));
    const title = to ? `A Diwali wish for ${to} 🪔 The Journey of Light` : 'The Journey of Light — A Cinematic Diwali Experience';
    const desc = to ? `${from ? from + ' has' : 'Someone special has'} lit a lamp for you. Open this cinematic Diwali journey — with sound on.` : 'One flame. One story. A cinematic Diwali journey you can share with the people you love.';
    const html = indexTpl.replace(/__TITLE__/g, esc(title)).replace(/__DESC__/g, esc(desc)).replace(/__ORIGIN__/g, esc(origin)).replace(/__URL__/g, esc(origin + req.url));
    const buf = Buffer.from(html);
    res.writeHead(200, { 'Content-Type': TYPES['.html'], 'Cache-Control': 'no-cache' });
    return res.end(buf);
  }
  const file = path.join(PUB, path.normalize(p));
  if (!file.startsWith(PUB)) { res.writeHead(403); return res.end(); }
  fs.stat(file, (err, stats) => {
    if (err || !stats.isFile()) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found'); }
    const ext = path.extname(file);
    if (ext === '.mp3') {
      const range = req.headers.range;
      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${stats.size}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': (end - start) + 1,
          'Content-Type': 'audio/mpeg'
        });
        fs.createReadStream(file, { start, end }).pipe(res);
        return;
      }
      res.writeHead(200, { 'Content-Length': stats.size, 'Content-Type': 'audio/mpeg', 'Accept-Ranges': 'bytes', 'Cache-Control': 'public, max-age=86400' });
      fs.createReadStream(file).pipe(res);
      return;
    }
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found'); }
      const h = { 'Content-Type': TYPES[ext] || 'application/octet-stream', 'Cache-Control': ext === '.png' ? 'public, max-age=86400' : 'public, max-age=300' };
      if (/\.(js|css|html|svg)$/.test(ext) && /gzip/.test(req.headers['accept-encoding'] || '')) { h['Content-Encoding'] = 'gzip'; res.writeHead(200, h); return res.end(zlib.gzipSync(data)); }
      res.writeHead(200, h); res.end(data);
    });
  });
}).listen(PORT, () => {
  console.log('Journey of Light on :' + PORT);
  const extUrl = process.env.RENDER_EXTERNAL_URL || process.env.PING_URL;
  if (extUrl) {
    const target = extUrl.replace(/\/$/, '') + '/healthz';
    const client = target.startsWith('https') ? https : http;
    setInterval(() => {
      client.get(target, (res) => res.resume()).on('error', () => {});
    }, 13 * 60 * 1000);
  }
});
