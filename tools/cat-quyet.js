// Quyết định CẮT MÁY / KHUNG LOÉ / KHUNG ÂM BẢN từ đặc trưng từng khung — dùng chung: trang cat-canh.html (trình duyệt) + Node (chỉnh ngưỡng
// ngoài máy trên data.json đã lưu: node tools/cat-quyet.js clips/<id>/data.json [giây cắt đúng, phẩy cách] → in khớp / sót / thừa).
// Đặc trưng mỗi khung f: score (khác màu + khác histogram với khung trước, 0–1), luma (độ sáng TB), sd (độ tương phản),
//   c1 / c2 = tương quan CẤU TRÚC với khung trước / trước-nữa (-1..1; null = khung phẳng như trắng xoá / đen xoá).
// Kết quả gắn vào f: cut (khung đầu cảnh mới), flash (khung loé sáng/tối 1–3 khung), neg (khung ÂM BẢN: hình đảo đen trắng).
(function (root) {
  const P = {
    colMin: 0.2, colK: 3.2,      // luật cũ theo màu: score > max(colMin, colK × trung vị 24 khung trước)
    strAbs: 0.15, strDrop: 0.2, strSc: 0.05,    // luật cấu trúc: c1 < strAbs (hình gần như không còn giống), thấp hơn trung vị c1 24 khung trước ≥ strDrop
                                 //   (anime vẽ 2–3 khung 1 hình nên trong 1 cảnh c1 nhảy 1 ↔ 0.2–0.5; đoạn hỗn loạn như nổ thì trung vị thấp → không báo nhầm), và màu cũng đổi (score > strSc)
    settle: 0.3,                 // cắt thật thì hình mới ỔN ĐỊNH ngay: c1 của 1 trong 2 khung sau > settle (đoạn hỗn loạn — nổ, xoáy — khung nào cũng khác → không báo)
    colStr: 0.6,                 // luật màu bị CHẶN khi cấu trúc vẫn giống (c1 ≥ colStr): chỉ đổi ánh sáng / chớp, cùng 1 shot (fight-1 mặt Sukuna 1:21)
    negMax: -0.2,                // âm bản: c1 < negMax (đảo ngược khung trước) VÀ khung sau lật về (c1 sau < negMax hoặc c2 sau > sameShot)
    sameShot: 0.5,               // khung sau âm bản mà c2 > sameShot → vẫn cảnh cũ (không phải cắt)
    tnHi: 0.55, tnLo: 0.1, tnC1: 0.5,  // TransNetV2: cắt khi tn > tnHi (0.55 chứ không 0.5: hình phẳng như video thử ra đúng 0.50–0.51 = model "không biết"), HOẶC tn > tnLo mà cấu trúc cũng đổi (c1 < tnC1) và hình mới ổn định
    tnOff: 1,                    // TransNetV2: khung TN j báo cắt → chỗ cắt ở tj + tnOff/tn.fps
  };
  // TransNetV2 (tools/tn.js) chạy ở tn.fps (25) riêng → gán cho khung phân tích k xác suất lớn nhất của các khung TN có chỗ cắt rơi vào (t[k-1], t[k]]
  //   (khung TN j báo cắt = chỗ cắt nằm ở tj + tnOff / tn.fps). Chỉnh tnOff ngoài máy được vì data.json giữ nguyên chuỗi tn.p.
  function mapTn(frames, tn, fps, p) {
    p = Object.assign({}, P, p || {}); if (!tn || !tn.p) return frames;
    const dt = 1 / fps, eps = 1e-6;
    frames.forEach((f, k) => { const lo = k ? frames[k - 1].t : f.t - dt; let m = 0;
      for (let j = Math.max(0, Math.floor((lo - tn.from) * tn.fps) - 2); j < tn.p.length; j++) { const ct = tn.from + (j + p.tnOff) / tn.fps;
        if (ct > f.t + eps) break; if (ct > lo + eps) m = Math.max(m, tn.p[j]); }
      f.tn = Math.round(m * 1000) / 1000; });
    return frames;
  }
  const med = a => { if (!a.length) return 0; const s = a.slice().sort((x, y) => x - y); return s[s.length >> 1]; };
  function decide(frames, p) {
    p = Object.assign({}, P, p || {});
    const sc = [], cs = [];
    for (let k = 0; k < frames.length; k++) {
      const f = frames[k]; f.cut = false; f.flash = false; f.neg = false;
      if (k === 0) { sc.push(0); cs.push(1); continue; }
      const mc = med(sc.slice(-24)), mcc = med(cs.slice(-24));
      const n1 = frames[k + 1], n2 = frames[k + 2];
      const settled = !n1 || [n1, n2].some(x => x && (x.c1 == null || x.c1 > p.settle));
      const byCol = f.score > Math.max(p.colMin, p.colK * mc) && (f.c1 == null || f.c1 < p.colStr);
      const byStr = f.c1 != null && f.c1 < p.strAbs && mcc - f.c1 >= p.strDrop && f.score > p.strSc && settled;
      const byTn = f.tn != null && (f.tn > p.tnHi || (f.tn > p.tnLo && f.c1 != null && f.c1 < p.tnC1 && settled));
      if (f.c1 != null && f.c1 < p.negMax && n1 && n1.c1 != null && (n1.c1 < p.negMax || (n1.c2 != null && n1.c2 > p.sameShot))) f.neg = true;
      // khung ngay sau âm bản: so với khung TRƯỚC âm bản (c2) — giống thì vẫn cảnh cũ
      const pv = frames[k - 1];
      if (pv.neg) f.cut = !(f.c2 != null && f.c2 > p.sameShot) && (f.c2 != null ? f.c2 < p.strAbs : byCol);
      else f.cut = byCol || byStr;
      f.tnCut = !f.cut && !pv.neg && byTn;   // cắt CHỈ nhờ TransNetV2 → gộp với cắt kề bên ở lượt sau
      if (f.neg) f.cut = false;   // âm bản không tính là cắt máy
      sc.push(f.score); cs.push(f.c1 == null ? mcc : f.c1);
    }
    // TransNetV2 lệch ±1 khung so với luật cũ (tn báo khung cuối cảnh cũ, đếm tay / luật cũ báo khung đầu cảnh mới) → 1 chỗ cắt chỉ giữ 1:
    //   bỏ cắt-nhờ-TN nếu khung kề đã cắt theo luật cũ; 2 khung kề cùng cắt-nhờ-TN thì giữ khung tn cao hơn.
    for (let k = 0; k < frames.length; k++) { const f = frames[k]; if (!f.tnCut) continue;
      const a = frames[k - 1], b = frames[k + 1];
      if ((a && a.cut) || (b && b.cut && !b.tnCut) || (b && b.tnCut && b.tn > f.tn)) continue;
      if (!f.neg) f.cut = true; }
    frames.forEach(f => delete f.tnCut);
    // khung loé (luật cũ): cắt ở k, cắt lại ở k+m (m ≤ 3), khung k+m giống khung k-1 về độ sáng, các khung giữa sáng / tối hẳn
    for (let k = 1; k < frames.length - 1; k++) {
      if (!frames[k].cut) continue;
      for (let m = 1; m <= 3 && k + m < frames.length; m++) {
        if (!frames[k + m].cut) continue;
        const a = frames[k - 1], c = frames[k + m], mid = frames.slice(k, k + m);
        if (Math.abs(a.luma - c.luma) < 0.08 && mid.every(f => Math.abs(f.luma - a.luma) > 0.15)) { frames[k].cut = false; frames[k + m].cut = false; mid.forEach(f => f.flash = true); }
        break;
      }
    }
    return frames;
  }
  const api = { P, decide, mapTn };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.CatQuyet = api;

  // ---- Node: chỉnh ngưỡng trên data.json đã lưu ----
  if (typeof require !== 'undefined' && require.main === module) {
    const fs = require('fs'), [file, truth, pj] = process.argv.slice(2);
    const D = JSON.parse(fs.readFileSync(file, 'utf8')), cols = D.frameCols;
    const fr = D.frames.map(r => Object.fromEntries(cols.map((c, i) => [c, r[i]])));
    const pp = pj ? JSON.parse(pj) : null;
    if (D.tn && D.tn.p) mapTn(fr, D.tn, D.fps, pp);   // tính lại cột tn theo tnOff (chỉnh được ngoài máy)
    if (fr[0].c1 === undefined) { console.error('data.json cũ (chưa có c1/c2) — chạy lại hoc-clip.js cho clip này'); process.exit(1); }
    decide(fr, pp);
    const cuts = fr.filter(f => f.cut).map(f => f.t), negs = fr.filter(f => f.neg).map(f => f.t), fl = fr.filter(f => f.flash).map(f => f.t);
    console.log(`cắt ${cuts.length}: ${cuts.join(' ')}\nâm bản ${negs.length}: ${negs.join(' ')}\nloé ${fl.length}: ${fl.join(' ')}`);
    if (truth) { const T = truth.split(',').map(Number), near = (x, L) => L.some(y => Math.abs(x - y) <= 0.11);
      const ok = T.filter(x => near(x, cuts)), miss = T.filter(x => !near(x, cuts)), extra = cuts.filter(x => !near(x, T));
      console.log(`ĐÚNG ${ok.length}/${T.length} · sót: ${miss.join(' ') || '-'} · thừa ${extra.length}: ${extra.join(' ') || '-'}`); }
  }
})(typeof window !== 'undefined' ? window : globalThis);
