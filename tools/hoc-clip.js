// HỌC CLIP: 1 lệnh cắt cảnh 1 video → clips/<id>/ (bảng khung, bảng cảnh, độ to tiếng, data.json, info.json).
// Mac:      node tools/hoc-clip.js <video> --id <id> [--a 12.5] [--b 40] [--fps 6] [--note "..."] [--url "https://youtu.be/..."]
// Windows:  powershell -NoProfile -File ../chaos-battle-lab/tools/node.ps1 tools/hoc-clip.js <video> --id <id> ...
//           (máy PC của anh không có node → mượn Node của VS Code qua node.ps1 trong repo game, cùng thư mục 0.van-phong-ao)
// Thử công cụ: ... tools/hoc-clip.js --test   (tự tạo video 6s biết trước đáp án → clips/_test/, không commit)
// Cần: repo chaos-battle-lab nằm cạnh (dùng tools/x/cdp.js để chạy Edge/Chrome ngầm), Edge hoặc Chrome đã cài.
// Video không nằm trong videos/ thì được CHÉP vào videos/<id><đuôi> (video gốc chỉ ở máy này, không lên GitHub).
// --fps: 6 cho cảnh thường; 10–12 cho đoạn đánh nhanh (đoạn ngắn); >900 khung thì tự hạ fps.
const fs = require('fs'), path = require('path'), os = require('os'), { spawn } = require('child_process');
const { start, ROOT } = require('./serve.js');
const argv = process.argv.slice(2), opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const PORT = +opt('--port', 8790), CDP_PORT = +opt('--cdp-port', 9466);
const CDP = path.resolve(ROOT, '..', 'chaos-battle-lab', 'tools', 'x', 'cdp.js');
const PROFILE = path.join(os.tmpdir(), 'mal-browser-profile');
const vnTime = () => new Date(Date.now() + 7 * 3600e3).toISOString().replace('T', ' ').slice(0, 16) + ' (giờ VN)';

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
  let video = test ? 'videos/_test.webm' : argv.find((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--')));
  const id = test ? '_test' : opt('--id');
  if (!video || !id || !/^[\w.-]+$/.test(id)) { console.error('Cách dùng: hoc-clip.js <video> --id <tên-không-dấu> [--a giây] [--b giây] [--fps 6] [--note "..."] [--url link]'); process.exit(2); }
  const srv = await new Promise(r => start(PORT, r));
  try {
    if (test) { const r = await inBrowser('tools/_test-video.html', 2); console.log('tạo video thử: ' + r.msg); if (!r.ok) throw new Error('không tạo được video thử'); }
    // video → videos/
    let abs = path.resolve(test ? ROOT : process.cwd(), video);
    if (!fs.existsSync(abs)) throw new Error('không thấy video ' + abs);
    let rel = path.relative(ROOT, abs).replace(/\\/g, '/');
    if (!rel.startsWith('videos/')) { const dst = path.join(ROOT, 'videos', id + path.extname(abs).toLowerCase()); fs.copyFileSync(abs, dst); console.log('đã chép video vào ' + path.relative(ROOT, dst)); rel = path.relative(ROOT, dst).replace(/\\/g, '/'); }
    const dir = path.join(ROOT, 'clips', id); fs.mkdirSync(dir, { recursive: true });
    for (const f of fs.readdirSync(dir)) if (/^(sheet|shots|audio)-\d+\.(jpg|png)$/.test(f)) fs.unlinkSync(path.join(dir, f));   // chạy lại: xoá ảnh cũ
    const q = new URLSearchParams({ src: rel, id, fps: opt('--fps', '6') }); if (opt('--a')) q.set('a', opt('--a')); if (opt('--b')) q.set('b', opt('--b'));
    const sizeMB = fs.statSync(abs).size / 1e6;
    const r = await inBrowser('tools/cat-canh.html?' + q, Math.min(20, 2 + sizeMB / 20));
    const infoF = path.join(dir, 'info.json'), old = fs.existsSync(infoF) ? JSON.parse(fs.readFileSync(infoF, 'utf8')) : {};
    const info = Object.assign(old, {
      id, nguon: opt('--url', old.nguon || path.basename(abs)), doan: { a: +opt('--a', 0) || 0, b: opt('--b') ? +opt('--b') : null }, fps: +opt('--fps', 6),
      ghi_chu_cua_anh: opt('--note', old.ghi_chu_cua_anh || ''),
      video_o_may: { may: os.platform() === 'darwin' ? 'Mac' : os.platform() === 'win32' ? 'PC Windows' : os.platform(), ten_may: os.hostname(), duong_dan: rel, MB: Math.round(sizeMB * 10) / 10 },
      cat_luc: vnTime(), ket_qua: r.msg });
    fs.writeFileSync(infoF, JSON.stringify(info, null, 2));
    console.log((r.ok ? 'XONG ' : 'LỖI ') + r.msg + '\n→ ' + path.relative(process.cwd(), dir));
    if (!r.ok) process.exitCode = 1;
  } catch (e) { console.error('LỖI: ' + e.message); process.exitCode = 1; }
  finally { srv.close(); }
})();
