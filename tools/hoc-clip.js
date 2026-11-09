// HỌC CLIP: 1 lệnh cắt cảnh 1 video → clips/<id>/ (bảng khung, bảng cảnh, độ to tiếng, data.json, info.json).
// Mac:      node tools/hoc-clip.js <video> --id <id> [--a 12.5] [--b 40] [--fps 6] [--note "..."] [--url "https://youtu.be/..."]
// Windows:  powershell -NoProfile -File ../chaos-battle-lab/tools/node.ps1 tools/hoc-clip.js <video> --id <id> ...
//           (máy PC của anh không có node → mượn Node của VS Code qua node.ps1 trong repo game, cùng thư mục 0.van-phong-ao)
// Thử công cụ: ... tools/hoc-clip.js --test   (tự tạo video 6s biết trước đáp án → clips/_test/, không commit)
// Cần: repo chaos-battle-lab nằm cạnh (dùng tools/x/cdp.js để chạy Edge/Chrome ngầm), Edge hoặc Chrome đã cài.
// Video gốc ở thư mục VIDEOS (PC: D:/meme-anime-lab-videos vì ổ C gần đầy · Mac: <repo>/videos) — file ngoài thư mục đó được CHÉP vào. Không lên GitHub.
// YouTube: --yt "<link>" thay cho <video> → tải 1 lần hình ≤720p H.264 + tiếng m4a thành 2 file (không cần ffmpeg) VIDEOS/yt-<mã video>.mp4/.m4a,
//          cắt nhiều đoạn cùng 1 video thì chỉ tải lần đầu. yt-dlp: PC D:/tools/yt-dlp/yt-dlp.exe (+ deno.exe cạnh đó) · Mac: yt-dlp trong PATH.
// --a / --b nhận giây (107) hoặc phút:giây (1:47).
// --fps: 6 cho cảnh thường; 10–12 cho đoạn đánh nhanh (đoạn ngắn); >900 khung thì tự hạ fps.
const fs = require('fs'), path = require('path'), os = require('os'), { spawn } = require('child_process');
const { start, ROOT, VIDEOS } = require('./serve.js');
const argv = process.argv.slice(2), opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const PORT = +opt('--port', 8790), CDP_PORT = +opt('--cdp-port', 9466);
const CDP = path.resolve(ROOT, '..', 'chaos-battle-lab', 'tools', 'x', 'cdp.js');
const PROFILE = path.join(os.tmpdir(), 'mal-browser-profile');
const secs = v => v == null ? null : String(v).includes(':') ? String(v).split(':').reduce((a, x) => a * 60 + +x, 0) : +v;
function ytdlp(url, out, fmt) {
  const exe = fs.existsSync('D:/tools/yt-dlp/yt-dlp.exe') ? 'D:/tools/yt-dlp/yt-dlp.exe' : 'yt-dlp', deno = 'D:/tools/yt-dlp/deno.exe';
  const args = ['--no-warnings', '--no-playlist', '-f', fmt, '-o', out, url]; if (fs.existsSync(deno)) args.unshift('--js-runtimes', 'deno:' + deno);
  return new Promise((res, rej) => { const p = spawn(exe, args, { stdio: ['ignore', 'pipe', 'pipe'] }); let e = ''; p.stderr.on('data', d => e += d);
    p.on('error', rej); p.on('close', c => c === 0 && fs.existsSync(out) ? res() : rej(new Error('yt-dlp lỗi: ' + e.slice(-400)))); });
}
const vnTime =() => new Date(Date.now() + 7 * 3600e3).toISOString().replace('T', ' ').slice(0, 16) + ' (giờ VN)';

function run(args, label) {
  return new Promise(res => {
    const p = spawn(process.execPath, args, { env: process.env, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = ''; p.stdout.on('data', d => out += d); p.stderr.on('data', d => out += d);
    p.on('close', code => { if (label) console.log(`[${label}] exit ${code}`); res(out); });
  });
}
async function inBrowser(pagePath, waitMin) {
  const steps = path.join(os.tmpdir(), `mal-steps-${process.pid}.txt`);
  fs.writeFileSync(steps, Array(Math.max(1, Math.ceil(waitMin / 2))).fill('waitfor window.__done').join('\n') + '\neval window.__done\n');
  const url = `http://127.0.0.1:${PORT}/${pagePath}`;
  await run([CDP, '--stop', '--profile', PROFILE]);   // dọn trình duyệt lần trước còn sót (lần chạy trước bị lỗi giữa chừng)
  const out = await run([CDP, '--launch', '--port', String(CDP_PORT), '--profile', PROFILE, '--url', url, '--steps', steps, '--out', os.tmpdir()]);
  await run([CDP, '--stop', '--profile', PROFILE]);
  try { fs.unlinkSync(steps); } catch (e) {}
  const m = out.match(/(OK[^\n]*|ERR[^\n]*)\s*$/); return { ok: !!(m && m[1].startsWith('OK')), msg: m ? m[1] : out.slice(-600) };
}

(async () => {
  if (!fs.existsSync(CDP)) { console.error('Không thấy ' + CDP + ' — cần repo chaos-battle-lab nằm cạnh meme-anime-lab.'); process.exit(2); }
  if (opt('--page')) {   // dò lỗi: chạy 1 trang bất kỳ của repo, in window.__done
    const srv = await new Promise(r => start(PORT, r)); const r = await inBrowser(opt('--page'), 2); console.log(r.msg); srv.close(); return;
  }
  const test = argv.includes('--test');
  let video = test ? path.join(VIDEOS, '_test.webm') : argv.find((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--')));
  const yt = opt('--yt'); let audio = null;
  const id = test ? '_test' : opt('--id');
  if ((!video && !yt) || !id || !/^[\w.-]+$/.test(id)) { console.error('Cách dùng: hoc-clip.js <video> --id <tên-không-dấu> [--a giây] [--b giây] [--fps 6] [--note "..."] [--url link]'); process.exit(2); }
  const srv = await new Promise(r => start(PORT, r));
  try {
    if (test) { const r = await inBrowser('tools/_test-video.html', 2); console.log('tạo video thử: ' + r.msg); if (!r.ok) throw new Error('không tạo được video thử'); }
    fs.mkdirSync(VIDEOS, { recursive: true });
    if (yt) {   // YouTube → VIDEOS/yt-<mã>.mp4 + .m4a (tải 1 lần)
      const m = yt.match(/(?:v=|youtu\.be\/|shorts\/)([\w-]{11})/); if (!m) throw new Error('link YouTube lạ: ' + yt);
      video = path.join(VIDEOS, 'yt-' + m[1] + '.mp4'); audio = path.join(VIDEOS, 'yt-' + m[1] + '.m4a');
      if (!fs.existsSync(video)) { console.log('tải hình…'); await ytdlp(yt, video, 'bv*[height<=720][vcodec^=avc1][ext=mp4]/bv*[height<=720][ext=mp4]'); }
      if (!fs.existsSync(audio)) { console.log('tải tiếng…'); await ytdlp(yt, audio, 'ba[ext=m4a]/ba'); }
    }
    let abs = path.resolve(process.cwd(), video);
    if (!fs.existsSync(abs)) throw new Error('không thấy video ' + abs);
    const inV = p => { const r = path.relative(VIDEOS, p); return !r.startsWith('..') && !path.isAbsolute(r); };
    if (!inV(abs)) { const dst = path.join(VIDEOS, id + path.extname(abs).toLowerCase()); fs.copyFileSync(abs, dst); console.log('đã chép video vào ' + dst); abs = dst; }
    const rel = 'videos/' + path.relative(VIDEOS, abs).replace(/\\/g, '/');
    const dir = path.join(ROOT, 'clips', id); fs.mkdirSync(dir, { recursive: true });
    for (const f of fs.readdirSync(dir)) if (/^(sheet|shots|audio)-\d+\.(jpg|png)$/.test(f)) try { fs.unlinkSync(path.join(dir, f)); } catch (e) { console.log('(không xoá được ' + f + ' — ' + e.code + ', sẽ ghi đè)'); }   // chạy lại: xoá ảnh cũ (Windows: file đang mở xem có thể bị giữ)
    const FPS_ = test ? '10' : opt('--fps', '6');   // --test luôn 10 khung/giây (đáp án cố định)
    const q = new URLSearchParams({ src: rel, id, fps: FPS_ }); if (opt('--a')) q.set('a', secs(opt('--a'))); if (opt('--b')) q.set('b', secs(opt('--b'))); if (audio) q.set('aud', 'videos/' + path.relative(VIDEOS, audio).replace(/\\/g, '/'));
    const sizeMB = fs.statSync(abs).size / 1e6;
    const r = await inBrowser('tools/cat-canh.html?' + q, Math.min(20, 2 + sizeMB / 20));
    const infoF = path.join(dir, 'info.json'), old = fs.existsSync(infoF) ? JSON.parse(fs.readFileSync(infoF, 'utf8')) : {};
    const info = Object.assign(old, {
      id, nguon: yt || opt('--url', old.nguon || path.basename(abs)), doan: { a: secs(opt('--a', 0)) || 0, b: opt('--b') ? secs(opt('--b')) : null }, fps: +FPS_,
      ghi_chu_cua_anh: opt('--note', old.ghi_chu_cua_anh || ''),
      video_o_may: { may: os.platform() === 'darwin' ? 'Mac' : os.platform() === 'win32' ? 'PC Windows' : os.platform(), ten_may: os.hostname(), duong_dan: abs.replace(/\\/g, '/'), MB: Math.round(sizeMB * 10) / 10 },
      cat_luc: vnTime(), ket_qua: r.msg });
    fs.writeFileSync(infoF, JSON.stringify(info, null, 2));
    console.log((r.ok ? 'XONG ' : 'LỖI ') + r.msg + '\n→ ' + path.relative(process.cwd(), dir));
    if (!r.ok) process.exitCode = 1;
  } catch (e) { console.error('LỖI: ' + e.message); process.exitCode = 1; }
  finally { srv.close(); }
})();
