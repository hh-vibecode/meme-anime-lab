// Máy chủ tĩnh cho Meme Anime Lab (Mac + Windows, Node thuần, không npm).
//   node tools/serve.js [--port 8790]          (Windows: powershell -NoProfile -File ../chaos-battle-lab/tools/node.ps1 tools/serve.js)
// - GET có Range (video tua được), gốc = thư mục repo.
// - POST /save?p=<đường dẫn> ghi file — CHỈ cho phép trong clips/ (kết quả phân tích) và videos/_test* (video thử). Không '..'.
// Thường không cần chạy tay: tools/hoc-clip.js tự bật / tắt.
const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
// VIDEO GỐC: PC để ở D:/meme-anime-lab-videos (ổ C gần đầy, anh dặn 9/11/2026) · Mac / máy khác: <repo>/videos · đặt riêng: biến môi trường MAL_VIDEOS
const VIDEOS = process.env.MAL_VIDEOS || (process.platform === 'win32' && fs.existsSync('D:/meme-anime-lab-videos') ? 'D:/meme-anime-lab-videos' : path.join(ROOT, 'videos'));
// MODEL TransNetV2 (tools/tn.js, tuỳ chọn --tn): KHÔNG để repo. PC: D:/tools/transnetv2 · Mac: <repo>/models/transnetv2 (gitignore) · đặt riêng: MAL_TN
const TN_DIR = process.env.MAL_TN || (process.platform === 'win32' && fs.existsSync('D:/tools/transnetv2') ? 'D:/tools/transnetv2' : path.join(ROOT, 'models', 'transnetv2'));
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.css': 'text/css',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.mp4': 'video/mp4', '.m4v': 'video/mp4', '.webm': 'video/webm',
  '.mov': 'video/quicktime', '.mkv': 'video/x-matroska', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.md': 'text/plain; charset=utf-8', '.onnx': 'application/octet-stream' };

function safe(rel) {
  rel = decodeURIComponent(rel).replace(/\\/g, '/').replace(/^\/+/, '');
  if (rel.split('/').includes('..')) return null;
  if (rel.startsWith('videos/')) return path.join(VIDEOS, rel.slice(7));   // /videos/... → thư mục video gốc của máy này
  if (rel.startsWith('tn-model/')) return path.join(TN_DIR, rel.slice(9));  // /tn-model/transnetv2.onnx → model ngoài repo
  return path.join(ROOT, rel);
}

function start(port, cb) {
  const srv = http.createServer((req, res) => {
    const u = new URL(req.url, 'http://x');
    if (req.method === 'POST' && u.pathname === '/save') {
      const rel = (u.searchParams.get('p') || '').replace(/\\/g, '/');
      const ok = /^clips\/[\w.-]+\//.test(rel) || /^videos\/_test[\w.-]*$/.test(rel);
      const file = ok && safe(rel);
      if (!file) { res.writeHead(403); return res.end('forbidden'); }
      const chunks = []; req.on('data', c => chunks.push(c));
      req.on('end', () => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, Buffer.concat(chunks)); res.writeHead(200); res.end('ok'); });
      return;
    }
    let file = safe(u.pathname === '/' ? 'tools/cat-canh.html' : u.pathname);
    if (!file || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('404'); }
    const size = fs.statSync(file).size, type = TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
    const m = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
    if (m && size > 0) {
      let a = m[1] ? +m[1] : Math.max(0, size - (+m[2] || 0)), b = m[1] && m[2] ? +m[2] : size - 1;
      b = Math.min(b, size - 1); if (a > b) { res.writeHead(416, { 'Content-Range': `bytes */${size}` }); return res.end(); }
      res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${a}-${b}/${size}`, 'Accept-Ranges': 'bytes', 'Content-Length': b - a + 1, 'Cache-Control': 'no-store' });
      fs.createReadStream(file, { start: a, end: b }).pipe(res);
    } else {
      res.writeHead(200, { 'Content-Type': type, 'Content-Length': size, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-store' });
      fs.createReadStream(file).pipe(res);
    }
  });
  srv.listen(port, '127.0.0.1', () => cb && cb(srv));
  return srv;
}
module.exports = { start, ROOT, VIDEOS, TN_DIR };
if (require.main === module) {
  const i = process.argv.indexOf('--port'), port = i > 0 ? +process.argv[i + 1] : 8790;
  start(port, () => console.log(`http://127.0.0.1:${port}/  root=${ROOT}`));
}
