# Kế hoạch nâng cấp luồng dựng phim (viết 10/11/2026 — để phiên Claude khác làm từng bước)

Anh Hải xem Final Part 1 (repo game `chaos-battle-lab`, Ver 531) và chê: **tiếng sai nhiều** (mượn tiếng nhân vật không liên quan, 1 chiêu mà tiếng kêu 3 lần,
tiếng rơi gắn chỗ không có gì rơi, nhạc tắt giữa cảnh) và **hình còn nâng được** (thành phố, bối cảnh). Anh muốn luồng dựng phim xịn nhất, tự động nhất,
giống anime nhất; được kéo công cụ ngoài về nếu dùng được.

## Cách làm để ĐỠ TỐN (đọc trước)
- **Mỗi bước 1 phiên MỚI**, mở trong đúng thư mục ghi ở bước đó. Không làm 2 bước trong 1 phiên dài.
- Chỉ đọc file ghi ở mục "Đọc". `js/film-fin1.js` (96KB, dòng rất dài) và `js/game.js` KHÔNG đọc cả file — dùng Grep rồi Read đúng đoạn.
- Ưu tiên kiểm bằng CHỮ (sfx-lint, báo cáo) trước, ảnh sau. Bảng khung chụp nhỏ (`w=320`), chỉ các mốc vừa sửa.
- Không spawn agent trừ khi anh bảo. Không xuất video khi anh chưa bảo. Lên bản game: `tools/x/release.js --files …` (luật trong CLAUDE.md repo game).
- Chụp khung: lệnh `cdp.js --launch … | grep` KHÔNG trả về (nhiều khả năng trình duyệt con giữ ống stdout) → ghi log ra file, chạy nền có `timeout`,
  chờ file PNG xuất hiện rồi `cdp.js --stop --profile <thư mục>` + `serve.js --stop`. Bước 2 dưới đây gói việc này thành 1 lệnh.

## Phân tích: luồng hiện tại yếu ở đâu
| # | Điểm yếu | Bằng chứng | Hậu quả |
|---|----------|------------|---------|
| 1 | Claude không nghe được, chọn tiếng theo TÊN file | `sfx-lint fin1` ra 40 lỗi: 3 nhạc tắt sớm · 20 tiếng mượn · 4 tiếng riêng bị lặp · 11 chỗ chồng · 2 dòng chữ Hán | tiếng không khớp hình |
| 2 | Tiếng không ghi "kêu cho việc gì" | 77/77 dòng sfx không có nhãn; `cine_drop` (vật rơi) dùng 3 lần ở chỗ không có gì rơi | máy không soát được nghĩa |
| 3 | Kho tiếng không có danh mục | chú thích nằm rải trong `AUDIO_SAMPLES` (game.js ~2557–2800), nhiều key không có mô tả | khó tìm đúng tiếng, hay lấy bừa |
| 4 | Nhạc xếp theo giây mà không biết độ dài file | `dp_akatsuki` 8.3s xếp 32s · `pain_theme` 21.8s xếp 50s · `cine_epic` 12.1s xếp 14.5s, đều không lặp | im lặng giữa cảnh |
| 5 | Bối cảnh vẽ bằng khối hộp, 2 hệ thành phố khác nhau | `film-fin1.js` 2D (MEME_H=32, tầng 84–100) · `film-fin1c4.js` 2.5D hộp (H=120, tầng 300) | rẻ tiền, không liền mạch giữa các cảnh |
| 6 | Nhân vật là ảnh tĩnh | chỉ có tịnh tiến / lật ảnh; "lưới biến dạng" vẫn là việc chờ | thiếu sức sống |
| 7 | Bảng phân cảnh chỉ là chú thích | đầu `film-fin1c4.js` | không tự sinh danh sách ảnh / tiếng, không tự soát nhịp theo playbook |
| 8 | Soát phim rời rạc, hay treo | 9/11 treo 3 tiếng vì lệnh chụp không thoát | chậm, tốn |
| 9 | Chưa chạy trên Mac; chưa có giọng Nhật tên chiêu; máy dò cắt cảnh còn sót (kaiju-b 12/14, fight-1 ~57/78) | VIEC.md | |
Máy PC: i5-14400F · RAM 16GB · AMD RX 560 4GB · không Python / ffmpeg / node (mượn Node của VS Code) · ổ C còn ~29GB, D còn ~106GB (công cụ để `D:\tools`).
→ KHÔNG chạy nổi model tạo video / tạo tiếng nặng. Chỉ dùng thứ chạy trong trình duyệt (WASM / WebGL / ONNX) hoặc file chạy đơn; thứ nặng để Mac.

## Các bước (làm theo thứ tự; mỗi bước có "Xong khi")

### Bước 0 — Ghi luật mới về công cụ ngoài (5 phút) · thư mục `meme-anime-lab`
✅ **XONG 10/11**: CLAUDE.md mục "Nguyên tắc công cụ" đã đổi.
Anh cho phép (10/11): kéo công cụ / model / asset ngoài về dùng. Sửa mục "Nguyên tắc công cụ" trong `CLAUDE.md` (đang ghi "KHÔNG cài công cụ ngoài"):
được dùng khi (a) đã MỞ trang gốc xác nhận có thật + còn bảo trì, (b) giấy phép cho dùng, (c) chạy được trên PC nêu trên hoặc ghi rõ "chỉ Mac",
(d) để ở `D:\tools` (PC), không commit file nặng. **Xong khi:** CLAUDE.md đã sửa + push.

### Bước 1 — Sửa tiếng Final Part 1 cho sạch · thư mục `chaos-battle-lab`
✅ **XONG 10/11** (repo game, sau Ver 538): sfx-lint fin1 = 0 lỗi, còn 5 lưu ý lặp tiếng chung (l2p_whoosh ×7, ep3_whoosh ×7, cine_deep_impact ×7, l2p_explode ×4, vine_boom ×5 cố ý).
   Logo Meowkatsuki (chữ Hán 零青白… và 猫) đang GIỮ, ghi `lint-ok: cjk` — CHỜ ANH quyết giữ hay bỏ. Chưa nghe thử bằng tai: anh nghe lại khi xem.
Đọc: `.claude/skills/tim-sound/SKILL.md`, mục sfx trong `.claude/skills/dung-phim/SKILL.md`, chú thích đầu `tools/x/sfx-lint.js`.
Chạy: `powershell -NoProfile -ExecutionPolicy Bypass -File tools/node.ps1 tools/x/sfx-lint.js fin1 --out <scratchpad>/fin1-sfx.md` rồi đọc báo cáo.
Việc: (1) khai `cast` cho từng cảnh (fin1c1–c3: `fr`, `cry`…; fin1c4: `mw`, `mewing`, `ps`, `dp`); (2) thêm NHÃN thứ 5 cho mọi dòng sfx (việc đang xảy ra trên hình);
(3) bỏ tiếng mượn: `fr_dash` ×5, `sm_schwing` ×3, `wg_axe_whoosh`, `lightsaber_clash_06` → thay tiếng dùng chung (`cine_*`, `ep3_*`, `l2p_*`) hoặc tìm tiếng mới theo skill tim-sound;
(4) `ps_shinra` (giọng "Shinra Tensei") chỉ để 1 lần đúng lúc cast; 2 lần Almighty Push dùng tiếng lực đẩy khác; `mw_gojo` 1 lần; (5) `cine_drop` chỉ để chỗ có vật rơi thật;
(6) gỡ 11 chỗ chồng (mỗi nhịp 1 tiếng); (7) nhạc: `loop:true` hoặc bản dài hơn, nhạc Akatsuki phủ hết cảnh nóc nhà, nhạc Pain phủ hết cảnh 4;
(8) 2 dòng chữ Hán ở `film-fin1.js` 631 / 648 là LOGO Meowkatsuki dựng theo mẫu logo anh gửi 5/11 → hỏi anh giữ hay bỏ; giữ thì ghi `// lint-ok: cjk`.
**Xong khi:** sfx-lint fin1 = 0 lỗi phải sửa; lên bản.

### Bước 2 — Một lệnh soát phim, không treo · thư mục `chaos-battle-lab`
✅ **XONG 10/11**: `tools/x/film-check.js` (thử fin1c4 4 mốc: 6s, thoát sạch, không sót trình duyệt); skill dung-phim bước 4 đã đổi sang lệnh này.
Viết `tools/x/film-check.js <id> [--t mốc,…] [--step 0.5]`: tự bật `serve.js` cổng riêng → mở trình duyệt ngầm → chụp bảng khung qua `tools/x/film-sheet.html`
→ LUÔN tắt trình duyệt + máy chủ (kể cả khi lỗi, giới hạn cứng 4 phút) → chạy luôn sfx-lint → in đường dẫn ảnh + số lỗi. Mac + PC.
**Xong khi:** `film-check.js fin1c4` trả về < 3 phút, không để sót tiến trình; ghi cách dùng vào skill dung-phim (thay đoạn hướng dẫn playwright cũ).

### Bước 3 — Danh mục tiếng + "tai máy" · thư mục `chaos-battle-lab`
✅ **XONG 10/11** (Ver 540): `tools/x/sfx-catalog.js` (→ sfx-catalog.json, `--find`), `tools/x/sfx-tag.js` + `sfx-tag.html` (AST AudioSet qua transformers.js, chạy trình duyệt; `--port` riêng khi chạy song song). sfx-lint báo 🎯 lệch nghĩa + 🗣️ có giọng. Lượt gắn nhãn cả kho đang/đã chạy — kiểm `tai` trong catalog.
(a) `tools/x/sfx-catalog.js` → `assets/audio/catalog.json`: mỗi key: file, độ dài, mô tả (lấy từ chú thích AUDIO_SAMPLES; thiếu thì điền), loại (va chạm / vút / nổ / rung / giọng / nhạc / nền),
    của nhân vật nào, đang dùng ở phim nào. (b) Tai máy: model phân loại âm thanh chạy trong trình duyệt ngầm, gắn 3 nhãn + % cho từng file, ghi vào catalog
    (ứng viên CHƯA KIỂM: CLAP zero-shot qua transformers.js; YAMNet tfjs; Whisper qua transformers.js để đọc giọng nói gì — phải mở trang gốc xác nhận trước).
(c) sfx-lint đọc catalog: NHÃN của dòng sfx lệch loại tiếng → báo "🎯 LỆCH NGHĨA"; skill tim-sound: chọn tiếng từ catalog trước, không đoán theo tên.
**Xong khi:** catalog phủ 100% file trong `assets/audio`; lint bắt được ví dụ `cine_drop` gắn nhãn không phải vật rơi.

### Bước 4 — Bối cảnh vẽ thay khối hộp · thư mục `chaos-battle-lab`
✅ **XONG phần lớn 10/11** (Ver 540): phông FIN_BG_DAY/RED/RUIN/PURPLE + mặt tiền FIN_TEX_DAY/NIGHT (GPT vẽ, WebP); cảnh 4 dán mặt tiền + phông theo yaw; cảnh 1–2 phông xa. Góc chim cảnh 2 (scD5) đã thay bằng phông FIN_BG_TOP (Ver 544). CÒN: cảnh 1 dãy cửa hàng che gần hết trời.
Đọc: skill `ve-anh-gpt`, `../meme-anime-lab/playbook/luat.md`. Cách làm như anime thật: NỀN VẼ theo shot, tách lớp trượt lệch nhau (parallax).
(a) Vẽ bằng GPT (`tools/x/gpt-image.sh --size 1536x1024`, không `--green`) bộ nền thành phố Final cùng 1 phong cách: ban ngày bình yên · trăng máu Friend · đang cháy ·
    đại lộ đổ nát · hố Shinra · bầu trời tím sau nổ; mỗi nền 3–4 lớp (trời / nhà xa / nhà gần / tiền cảnh) — vẽ từng lớp riêng hoặc tách lớp bằng tách nền.
(b) `CineKit.bg` (file mới `js/cine-bg.js`): vẽ lớp nền theo máy quay (2D và 2.5D), có rung / đổ / cháy đơn giản trên lớp.
(c) Thay nền hộp ở `film-fin1c4.js` trước (lộ nhất), rồi các shot toàn cảnh của `film-fin1.js`; giữ tỉ lệ meme nhỏ so với nhà.
Ứng viên CHƯA KIỂM (chỉ khi cần): Depth Anything V2 (ONNX trong trình duyệt) để tách lớp theo độ sâu; Kenney City Kit (CC0, glTF) + three.js nếu muốn thành phố 3D thật.
**Xong khi:** anh xem bảng khung cảnh 4 và duyệt nền; không còn shot nào thấy khối hộp trơn.

### Bước 5 — Nhân vật có sức sống · thư mục `chaos-battle-lab`
✅ **XONG (a) 10/11**: `K.sprite({life:{breath,sway,wind,squash,stretch}})` + `K.squash()` trong cine-kit (lưới tam giác, ~2ms/khung), mặc định nhẹ cho mọi sprite. CÒN: (b) sprite sheet đòn đánh; aura chưa theo hình đã biến dạng.
(a) Lưới biến dạng ảnh 2D trong `js/vfx-gl.js` (việc chờ từ 9/11): thở, nghiêng, dẹt khi tiếp đất, áo / đuôi phất theo gió — áp cho mọi sprite qua 1 tham số.
(b) Hành động chính (đấm, bay, kết ấn): xin GPT sprite sheet 3–4 khung, phát 12 hình/giây. (c) Không cắt ảnh thành ô chữ nhật cho cử động riêng (làm vỡ mặt — anh chê 9/11).
**Xong khi:** shot đứng yên nào nhân vật cũng có chuyển động nhỏ; 1 đòn đánh mẫu chạy bằng sprite sheet.

### Bước 6 — Bảng phân cảnh thành DỮ LIỆU + tự soát nhịp · thư mục `chaos-battle-lab`
✅ **XONG 10/11**: `js/shots/<id>.json` + `tools/x/film-lint.js`, film-check chạy cả 3 lint. fin1c4 film-lint 0 lỗi.
Mỗi phim khai `shotlist:[{t0,t1,co,goc,hanhDong,anh:[…],sfx:[…],nhac}]`. Từ đó: sinh danh sách ảnh cần vẽ (tự vẽ nền song song theo skill), sinh khung lịch tiếng có nhãn,
và `film-lint` soát theo `../meme-anime-lab/playbook/nhip.md`: shot đánh 0.2–0.9s, khoảng thở 1.4–1.6s sau nổ lớn, không shot tĩnh > 3s, ≥ 3 cỡ cảnh / 10s, khung âm bản ở mỗi va chạm.
**Xong khi:** `film-check.js` chạy cả film-lint; Final 1 cảnh 4 có shotlist và qua lint.

### Bước 7 — Giọng Nhật đọc tên chiêu
✅ **XONG 10/11**: VOICEVOX ở `D:	oolsoicevox` (directml), giọng 玄野武宏 — mô tả video PHẢI ghi `VOICEVOX:玄野武宏`. Key mw_ryoiki_tenkai / mw_muryokusho / mw_murasaki; script `tools/x/voicevox.js`. Anh chưa nghe duyệt.
Cần cho: "Ryōiki Tenkai — Muryōkūsho", Hollow Purple, Almighty Push. Ứng viên CHƯA KIỂM: VOICEVOX (máy chủ nội bộ, chạy CPU), edge-tts, Style-Bert-VITS2 (cần Python → Mac).
Xem điều khoản dùng giọng trước khi chọn. Hoặc anh gửi clip gốc → cắt theo skill tim-sound. **Xong khi:** mỗi tên chiêu có 1 file giọng, khai trong catalog.

### Bước 8 — Máy Mac · thư mục `~/Desktop/1. meme-anime-lab` và `~/Desktop/1. chaos-battle-lab`
Làm theo `VIEC.md` mục "Mac": `git pull`, `node tools/hoc-clip.js --test` (đáp án trong VIEC.md), chạy `film-check.js` cả 4 cảnh, đo ms/khung hiệu ứng, ghi kết quả vào VIEC.md.
Sau đó mới xuất video khi anh bảo.

### Bước 9 — Nâng máy học clip · thư mục `meme-anime-lab` — XONG 10/11/2026 (PC)
- (a) TransNetV2 chạy trong trình duyệt ngầm: `tools/tn.js` (onnxruntime-web 1.20.1 CDN jsdelivr) + `hoc-clip.js --tn [--tn-fps 25]` → cột `tn` trong data.json.
  Model `elya5/transnetv2` (MIT, gốc soCzech/TransNetV2 MIT — đã mở 2 trang xác nhận) ở `D:	ools	ransnetv2	ransnetv2.onnx` (không commit). Không có model → như cũ.
- (b) Đo (đáp án đếm tay, `cat-quyet.js`): kaiju-b 8/13 thừa 0 → 12/13 thừa 1 · fight-1 57/82 thừa 10 → 67/82 thừa 13. Luật = luật cũ HOẶC tn > 0.55
  HOẶC (tn > 0.1 và c1 < 0.5 và hình mới ổn định), gộp cắt lệch 1 khung. Quét lại ngưỡng luật cũ: không hơn → giữ. `--test` vẫn đúng (cả khi --tn).
  Giá: chậm ~9 phút / 60s clip (tua 25 khung/giây). Còn sót ở fight-1 (theo số liệu, chưa soát bằng mắt): đoạn âm bản liên tục 108–109s, nền trắng sáng 116–117s, 65.3 / 73.4–73.7 hỗn loạn.
- (c) Mẫu bảng shot mới trong `playbook/README.md` dùng đúng trường shotlist repo game (`t0 t1 co goc hanhDong loai` + may / vfx / tieng / ghiChu, giá trị co / goc / loai
  theo danh sách cố định) + `tools/phan-tich-to-shots.js` → JSON như `js/shots/fin1c4.json` (đọc được cả bảng kiểu cũ, báo "CẦN SOÁT").
- Chưa làm: PySceneDetect (chỉ Mac) — không cần nữa.

## Công cụ ngoài ĐÃ KIỂM (agent mở trang gốc 10/11/2026 — dùng danh sách này, đừng tìm lại)
DÙNG NGAY trên PC (trình duyệt / file chạy đơn):
- **transformers.js** github.com/huggingface/transformers.js (Apache-2.0, v4.3.2 10/2026) — "tai máy" Bước 3b: AST `Xenova/ast-finetuned-audioset-10-10-0.4593` (527 nhãn AudioSet, có "Speech"),
  CLAP zero-shot `Xenova/clap-htsat-unfused` (chấm mp3 theo mô tả), Whisper `Xenova/whisper-small` (đọc thoại). Thử ~20 file biết đáp án trước khi tin CLAP.
  Cũng chạy được: **Depth Anything V2 Small** `onnx-community/depth-anything-v2-small` (CHỈ bản Small là Apache; Base/Large CC-BY-NC) — tách nền vẽ thành lớp parallax (Bước 4);
  **BiRefNet_lite** `onnx-community/BiRefNet_lite-ONNX` (MIT) — tách nền nhân vật.
- **sherpa-onnx** github.com/k2-fsa/sherpa-onnx (Apache-2.0) — dự phòng gắn nhãn tiếng hàng loạt bằng file chạy (Win x64 / macOS arm64). silero-vad (MIT) — tìm đoạn có giọng người.
- **VOICEVOX Engine** github.com/VOICEVOX/voicevox_engine — bản **windows-directml** chạy GPU AMD; HTTP `127.0.0.1:50021` (`/audio_query` → `/synthesis`). Đọc tên chiêu (Bước 7).
  Mỗi giọng có luật riêng: vd Zundamon dùng thương mại được NẾU ghi "VOICEVOX:ずんだもん" trong mô tả video → luôn ghi nguồn.
- **Kenney** Impact Sounds / Sci-fi Sounds / Particle Pack / City Kit (CC0, kenney.nl) — để được trong repo công khai. **Quaternius Downtown City MegaKit** (CC0, glTF, 5/2026).
- **three.js** (MIT, r187: MeshToonMaterial, OutlineEffect, UnrealBloomPass, Sky) + **pmndrs/postprocessing** (Zlib) — chỉ khi chuyển cảnh phá phố sang 3D thật.
- **Effekseer** editor + **EffekseerForWebGL** (MIT, hiệu ứng mẫu CC0) — tia / hào quang / sóng chấn động; **three.quarks** (MIT) hạt bằng code.
- **Real-ESRGAN ncnn-vulkan** (anime model, BSD-3) / **realcugan-ncnn-vulkan** (MIT) / **rife-ncnn-vulkan** (MIT) — exe Vulkan chạy được RX 560: làm nét ảnh GPT, nội suy khung (dùng ít).
- **Mediabunny** github.com/Vanilagy/mediabunny (MPL-2.0) — đọc/ghi MP4/WebM trong trình duyệt (thay WebM tự ghép).
ĐÃ KÉO (Ver 547 game): **Kenney** Impact/Sci-fi/RPG (CC0, `D:	oolskenney-audio`) → 5 key `kn_*` · **効果音ラボ** soundeffect-lab.info (thương mại miễn phí, cấm phân phối lại / Content ID; FAQ: game trên GitHub lộ file KHÔNG tính là phân phối lại) → 12 key `se_*`, file gốc `D:	oolssoundeffect-lab`. Nghe lại bằng tai: se_whoosh_fast, se_teleport, se_collapse (máy tai gắn nhãn lạ). Chưa thêm vào js/asset-groups.js (split_assets.py — chạy trên Mac).
Sonniss GDC 2026: anh cho dùng (10/11). Trang tải chặn Cloudflare → tải qua Chrome của anh (tiện ích Claude in Chrome, anh tự bấm xác nhận nếu hiện) → torrent + aria2 chọn nhóm (~2.5GB) → `D:	oolssonniss` → `tools/x/sonniss-index.js --stats`. CHƯA tải (Chrome chưa kết nối tiện ích).
Chỉ Mac: PySceneDetect, Stable Audio Open Small (tạo SE từ chữ), Style-Bert-VITS2 / GPT-SoVITS.
ĐÃ DÙNG (10/11): TransNetV2 ONNX `elya5/transnetv2` (MIT, 31MB, sha256 c4d54a68…) + onnxruntime-web 1.20.1 (MIT) — `D:	ools	ransnetv2`, Bước 9.
Thử: Iki github.com/zeikar/iki (MIT, rig Live2D-kiểu do AI, rất mới).
Tham khảo cách tổ chức: ViMax (HKUDS, MIT), FilmAgent/VideoClaw (MIT), Anime-Shooter (mẫu ghi chú shot).
BỎ: ToonCrafter / FramePack / Wan2.2 (cần NVIDIA mạnh) · LivePortrait (chế độ động vật không chạy Mac) · Spine (trả phí) · DragonBones (ngừng) · BRIA RMBG (cấm thương mại) ·
Kokoro (tiếng Nhật kém) · edge-tts (chưa rõ điều khoản) · YAMNet tfjs (không còn bản bảo trì) · three-pinata (không có giấy phép).
Chưa kiểm: Kenney City Kit có GLB không · cú pháp lọc CC0 của Freesound API.

## Thêm 10/11
- Trailer dọc 9:16 `fin1tr` (~18s, code trong film-fin1.js, mục riêng trong MEME LORE 2): Friend gầm → Banana Cat khóc → câu hỏi + câu Pain → 5 thẻ thành viên → logo. Mỗi shot zoom / tâm riêng.
- cdp.js --stop giờ tắt hẳn mọi tiến trình của hồ sơ (trước để sót 13 Edge); film-check / sfx-tag dùng hồ sơ + cổng riêng theo --port.

## Đã có sẵn (đừng làm lại)
`tools/x/sfx-lint.js` (soát tiếng không cần nghe) · `tools/x/film-sheet.html` (bảng khung) · `js/cine-cam.js` (góc máy, nhịp, wipe, implode…) · `js/vfx-manga.js` (smear, swirl, halftone,
mangaBW, blast, rimLight) · skill `ve-anh-gpt` + `tach-nen-anh` (tự vẽ + tách nền) · playbook 4 clip (kaiju-a, kaiju-b, fight-1, gojo-domain-1).
