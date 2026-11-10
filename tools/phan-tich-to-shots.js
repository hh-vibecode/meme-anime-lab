// BẢNG SHOT trong clips/<id>/phan-tich.md → JSON cùng định dạng shotlist repo game (chaos-battle-lab/js/shots/<phim>.json),
// để mang thẳng 1 clip mẫu sang bảng phân cảnh phim.
//   node tools/phan-tich-to-shots.js clips/<id>/phan-tich.md [--out file.json] [--abs] [--from 1:10.4] [--to 1:20.2]
//   (PC: powershell -NoProfile -ExecutionPolicy Bypass -File ../chaos-battle-lab/tools/node.ps1 tools/phan-tich-to-shots.js …)
// Mặc định t0/t1 tính lại từ 0 (giây đầu của shot đầu tiên được lấy) · --abs = giữ giây trong video gốc · --from/--to = chỉ lấy 1 đoạn.
// Đọc được 2 kiểu bảng:
//   MỚI (mẫu playbook/README.md, 10/11/2026): | # | t0 | t1 | co | goc | hanhDong | loai | may | vfx | tieng | ghiChu |
//   CŨ (clip nạp 9/11):  | # | giây | dài | cỡ cảnh | góc máy | máy chuyển động | hành động | VFX | tiếng |  → tự đoán co / goc, loai để trống (báo).
// Ra mỗi shot: {t0, t1, co, goc, hanhDong, loai, anh: [], sfx: [], ghiChu} — anh / sfx là mã ảnh / tiếng của PHIM nên để trống, điền khi dựng;
//   may / vfx / tieng của clip mẫu gộp vào ghiChu ("máy: … · vfx: … · tiếng: …").
// Giá trị hợp lệ (đúng shotlist repo game, xem fin1c4.json):
const CO = ['toàn', 'trung', 'cận', 'đặc tả'], GOC = ['giun', 'ngang', 'chéo', 'chim', 'qua vai'],
  LOAI = ['giới thiệu', 'đối mặt', 'đánh', 'ra chiêu', 'chuyển cảnh', 'nổ lớn', 'thở', 'lãnh địa'];
const fs = require('fs'), path = require('path');
const argv = process.argv.slice(2), opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const file = argv.find((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--')));
if (!file) { console.error('Cách dùng: phan-tich-to-shots.js clips/<id>/phan-tich.md [--out f.json] [--abs] [--from giây] [--to giây]'); process.exit(2); }
const secs = v => { if (v == null || v === '') return null; v = String(v).trim().replace(/s$/, ''); return v.includes(':') ? v.split(':').reduce((a, x) => a * 60 + +x, 0) : +v; };
const r2 = x => Math.round(x * 100) / 100;
const low = s => String(s || '').toLowerCase();
// đoán từ chữ tự do (bảng cũ) — thứ tự quan trọng: "cực cận"/"đặc tả" trước "cận"
const guessCo = s => { s = low(s); if (!s) return ''; if (/đặc tả|cực cận|cận mắt|cận tay/.test(s)) return 'đặc tả'; if (/cận/.test(s)) return 'cận'; if (/trung/.test(s)) return 'trung'; if (/toàn|xa/.test(s)) return 'toàn'; return ''; };
const guessGoc = s => { s = low(s); if (!s) return ''; if (/qua vai/.test(s)) return 'qua vai'; if (/giun|ngước|từ dưới|thấp/.test(s)) return 'giun';
  if (/chim|từ trên|trên cao|hơi cao|cao/.test(s)) return 'chim'; if (/chéo|nghiêng|dutch/.test(s)) return 'chéo'; if (/ngang|thẳng/.test(s)) return 'ngang'; return ''; };

const md = fs.readFileSync(file, 'utf8').split(/\r?\n/);
const cells = l => l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
let hdr = null, rows = [], warn = [];
for (const l of md) {
  if (!/^\s*\|/.test(l)) { if (hdr && rows.length) break; hdr = rows.length ? hdr : null; continue; }   // lấy BẢNG SHOT đầu tiên
  const c = cells(l);
  if (!hdr) { if (c[0] === '#' && c.length >= 5) hdr = c.map(low); continue; }
  if (c.every(x => /^:?-{2,}:?$/.test(x) || x === '')) continue;   // dòng gạch
  rows.push(c);
}
if (!hdr) { console.error('Không thấy bảng shot (dòng tiêu đề bắt đầu bằng "| # |") trong ' + file); process.exit(1); }
const col = (...names) => { for (const n of names) { const i = hdr.indexOf(n); if (i >= 0) return i; } return -1; };
const NEW = col('t0') >= 0;
const I = NEW ? { t0: col('t0'), t1: col('t1'), co: col('co'), goc: col('goc'), hd: col('hanhdong'), loai: col('loai'), may: col('may'), vfx: col('vfx'), tieng: col('tieng'), gc: col('ghichu') }
  : { giay: col('giây', 'giay'), dai: col('dài', 'dai'), co: col('cỡ cảnh', 'co', 'cỡ / góc'), goc: col('góc máy', 'goc', 'cỡ / góc'), hd: col('hành động', 'hanhdong'), loai: col('loại', 'loai'), may: col('máy chuyển động', 'may'), vfx: col('vfx'), tieng: col('tiếng', 'tieng'), gc: col('ghi chú', 'ghichu') };
const get = (r, i) => i >= 0 && r[i] != null ? r[i].replace(/\*\*/g, '').trim() : '';
let shots = rows.map(r => {
  const n = get(r, 0);
  let t0, t1;
  if (NEW) { t0 = secs(get(r, I.t0)); t1 = secs(get(r, I.t1)); }
  else { const g = get(r, I.giay).split(/\s*[–—-]\s*/); t0 = secs(g[0]); t1 = secs(g[1]);
    if (t1 == null && t0 != null) { const d = get(r, I.dai); t1 = r2(t0 + (/khung/.test(d) ? (parseFloat(d) || 1) * 0.1 : (parseFloat(d) || 0))); } }   // 1 dòng 1 giây + cột "dài" ("0.9" / "1 khung" = 0.1s ở 10 khung/giây)
  let co = get(r, I.co), goc = get(r, I.goc), loai = get(r, I.loai);
  if (!NEW) { const c0 = co, g0 = goc; co = guessCo(c0); goc = guessGoc(g0) || (I.goc >= 0 && !g0 ? '' : guessGoc(g0));
    const one = I.co === I.goc;   // cột gộp "cỡ / góc" (fight-1): thiếu 1 trong 2 là bình thường
    if (c0 && !co && !(one && goc)) warn.push(`#${n}: không đoán được co từ "${c0}"`); if (g0 && !goc && !(one && co)) warn.push(`#${n}: không đoán được goc từ "${g0}"`); }
  if (co && !CO.includes(co)) warn.push(`#${n}: co "${co}" ngoài danh sách (${CO.join(' / ')})`);
  if (goc && !GOC.includes(goc)) warn.push(`#${n}: goc "${goc}" ngoài danh sách (${GOC.join(' / ')})`);
  if (!loai) warn.push(`#${n}: thiếu loai`); else if (!LOAI.includes(loai)) warn.push(`#${n}: loai "${loai}" ngoài danh sách (${LOAI.join(' / ')})`);
  if (!(t1 > t0)) warn.push(`#${n}: thời gian lạ t0=${t0} t1=${t1}`);
  const note = [['máy', get(r, I.may)], ['vfx', get(r, I.vfx)], ['tiếng', get(r, I.tieng)]].filter(x => x[1]).map(x => x[0] + ': ' + x[1]);
  const gc = get(r, I.gc); if (gc) note.unshift(gc);
  return { n, t0, t1, co, goc, same: /như\s*#\s*(\d+)/i.exec(get(r, I.goc) + ' ' + get(r, I.co)), hanhDong: get(r, I.hd), loai, anh: [], sfx: [], ghiChu: note.join(' · ') };
});
shots.forEach(s => { if (!s.same) return; const o = shots.find(x => String(x.n) === s.same[1]); if (o) { s.co = s.co || o.co; s.goc = s.goc || o.goc;
  warn = warn.filter(w => !(w.startsWith('#' + s.n + ':') && /đoán/.test(w))); } });   // "như #9" → chép co / goc của shot 9
const from = secs(opt('--from')), to = secs(opt('--to'));
if (from != null) shots = shots.filter(s => s.t0 >= from - 0.01);
if (to != null) shots = shots.filter(s => s.t1 <= to + 0.01);
if (!shots.length) { console.error('Không còn shot nào (xem --from / --to)'); process.exit(1); }
const base = argv.includes('--abs') ? 0 : shots[0].t0;
const out = shots.map(s => ({ t0: r2(s.t0 - base), t1: r2(s.t1 - base), co: s.co, goc: s.goc, hanhDong: s.hanhDong, loai: s.loai, anh: s.anh, sfx: s.sfx, ghiChu: s.ghiChu }));
const json = '[\n' + out.map(s => '  ' + JSON.stringify(s)).join(',\n') + '\n]\n';   // 1 shot / dòng như fin1c4.json
if (opt('--out')) { fs.writeFileSync(opt('--out'), json); console.log(`${out.length} shot → ${opt('--out')} (bảng ${NEW ? 'mới' : 'cũ'})`); } else process.stdout.write(json);
const keep = new Set(shots.map(s => '#' + s.n + ':')); warn = warn.filter(w => keep.has(w.slice(0, w.indexOf(':') + 1)));   // chỉ báo shot đã lấy
if (warn.length) console.error(`CẦN SOÁT ${warn.length}:\n- ` + warn.join('\n- '));
