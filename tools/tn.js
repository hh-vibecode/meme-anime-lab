// TransNetV2 (soCzech/TransNetV2, MIT) chạy trong trình duyệt bằng onnxruntime-web — xác suất CẮT MÁY cho từng khung.
// Model ONNX cộng đồng: huggingface.co/elya5/transnetv2 (MIT, 31MB, sha256 c4d54a68…) — KHÔNG để trong repo:
//   PC: D:/tools/transnetv2/transnetv2.onnx · Mac: <repo>/models/transnetv2/transnetv2.onnx (gitignore) · hoặc biến MAL_TN = thư mục.
//   Máy chủ serve.js phát ở /tn-model/transnetv2.onnx (404 = không có model → cat-canh chạy như cũ).
// Đầu vào chuẩn: 100 khung 48×27 RGB (0–255), cửa sổ trượt 50, lấy 50 khung giữa (như inference/transnetv2.py gốc).
(function (root) {
  const VER = '1.20.1', CDN = `https://cdn.jsdelivr.net/npm/onnxruntime-web@${VER}/dist/`;
  const W = 48, H = 27;
  let sess = null, info = null;
  const sig = x => 1 / (1 + Math.exp(-x));
  async function load(url) {
    if (sess) return info;
    if (!root.ort) await new Promise((res, rej) => { const s = document.createElement('script'); s.src = CDN + 'ort.min.js'; s.onload = res;
      s.onerror = () => rej(new Error('không tải được onnxruntime-web ' + VER)); document.head.appendChild(s); });
    root.ort.env.wasm.wasmPaths = CDN; root.ort.env.wasm.numThreads = 1;   // không có cross-origin isolation → 1 luồng
    sess = await root.ort.InferenceSession.create(url, { executionProviders: ['wasm'] });
    info = { inputs: sess.inputNames, outputs: sess.outputNames, ort: VER };
    return info;
  }
  // lấy 1 khung 48×27 RGB từ video / canvas (thu nhỏ 2 bước cho đỡ răng cưa)
  const c1 = document.createElement('canvas'), c2 = document.createElement('canvas');
  c1.width = 192; c1.height = 108; c2.width = W; c2.height = H;
  const g1 = c1.getContext('2d'), g2 = c2.getContext('2d', { willReadFrequently: true });
  g1.imageSmoothingQuality = 'high'; g2.imageSmoothingQuality = 'high';
  function grab(src) {
    g1.drawImage(src, 0, 0, 192, 108); g2.drawImage(c1, 0, 0, W, H);
    const d = g2.getImageData(0, 0, W, H).data, o = new Uint8Array(W * H * 3);
    for (let i = 0, j = 0; i < d.length; i += 4) { o[j++] = d[i]; o[j++] = d[i + 1]; o[j++] = d[i + 2]; }
    return o;
  }
  // frames: mảng Uint8Array(27·48·3) → { p: xác suất cắt từng khung (single_frame), m: many_hot }
  let dtype = 'float32';
  async function predict(frames) {
    const n = frames.length, F = W * H * 3; if (!n) return { p: [], m: [] };
    const end = 25 + 50 - (n % 50 || 50), pad = [];
    for (let i = 0; i < 25; i++) pad.push(frames[0]); for (const f of frames) pad.push(f); for (let i = 0; i < end; i++) pad.push(frames[n - 1]);
    const p = [], m = [];
    for (let ptr = 0; ptr + 100 <= pad.length; ptr += 50) {
      const make = () => { const a = dtype === 'uint8' ? new Uint8Array(100 * F) : new Float32Array(100 * F); for (let k = 0; k < 100; k++) a.set(pad[ptr + k], k * F);
        return new root.ort.Tensor(dtype, a, [1, 100, H, W, 3]); };
      let out;
      try { out = await sess.run({ [sess.inputNames[0]]: make() }); }
      catch (e) { if (dtype !== 'float32') throw e; dtype = 'uint8'; out = await sess.run({ [sess.inputNames[0]]: make() }); }
      const o = sess.outputNames.map(k => out[k].data);
      // đầu ra là logit (gốc: tf.sigmoid sau model) — nếu đã là xác suất (0..1) thì giữ nguyên
      const fix = a => { let lo = Infinity, hi = -Infinity; for (const x of a) { lo = Math.min(lo, x); hi = Math.max(hi, x); } return lo < 0 || hi > 1 ? Array.from(a, sig) : Array.from(a); };
      const a0 = fix(o[0]), a1 = o[1] ? fix(o[1]) : a0;
      for (let k = 25; k < 75; k++) { p.push(a0[k]); m.push(a1[k]); }
    }
    return { p: p.slice(0, n), m: m.slice(0, n), dtype };
  }
  root.TN = { load, grab, predict, W, H, VER };
})(window);
