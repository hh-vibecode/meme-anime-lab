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
Viết `tools/x/film-check.js <id> [--t mốc,…] [--step 0.5]`: tự bật `serve.js` cổng riêng → mở trình duyệt ngầm → chụp bảng khung qua `tools/x/film-sheet.html`
→ LUÔN tắt trình duyệt + máy chủ (kể cả khi lỗi, giới hạn cứng 4 phút) → chạy luôn sfx-lint → in đường dẫn ảnh + số lỗi. Mac + PC.
**Xong khi:** `film-check.js fin1c4` trả về < 3 phút, không để sót tiến trình; ghi cách dùng vào skill dung-phim (thay đoạn hướng dẫn playwright cũ).

### Bước 3 — Danh mục tiếng + "tai máy" · thư mục `chaos-battle-lab`
(a) `tools/x/sfx-catalog.js` → `assets/audio/catalog.json`: mỗi key: file, độ dài, mô tả (lấy từ chú thích AUDIO_SAMPLES; thiếu thì điền), loại (va chạm / vút / nổ / rung / giọng / nhạc / nền),
    của nhân vật nào, đang dùng ở phim nào. (b) Tai máy: model phân loại âm thanh chạy trong trình duyệt ngầm, gắn 3 nhãn + % cho từng file, ghi vào catalog
    (ứng viên CHƯA KIỂM: CLAP zero-shot qua transformers.js; YAMNet tfjs; Whisper qua transformers.js để đọc giọng nói gì — phải mở trang gốc xác nhận trước).
(c) sfx-lint đọc catalog: NHÃN của dòng sfx lệch loại tiếng → báo "🎯 LỆCH NGHĨA"; skill tim-sound: chọn tiếng từ catalog trước, không đoán theo tên.
**Xong khi:** catalog phủ 100% file trong `assets/audio`; lint bắt được ví dụ `cine_drop` gắn nhãn không phải vật rơi.

### Bước 4 — Bối cảnh vẽ thay khối hộp · thư mục `chaos-battle-lab`
Đọc: skill `ve-anh-gpt`, `../meme-anime-lab/playbook/luat.md`. Cách làm như anime thật: NỀN VẼ theo shot, tách lớp trượt lệch nhau (parallax).
(a) Vẽ bằng GPT (`tools/x/gpt-image.sh --size 1536x1024`, không `--green`) bộ nền thành phố Final cùng 1 phong cách: ban ngày bình yên · trăng máu Friend · đang cháy ·
    đại lộ đổ nát · hố Shinra · bầu trời tím sau nổ; mỗi nền 3–4 lớp (trời / nhà xa / nhà gần / tiền cảnh) — vẽ từng lớp riêng hoặc tách lớp bằng tách nền.
(b) `CineKit.bg` (file mới `js/cine-bg.js`): vẽ lớp nền theo máy quay (2D và 2.5D), có rung / đổ / cháy đơn giản trên lớp.
(c) Thay nền hộp ở `film-fin1c4.js` trước (lộ nhất), rồi các shot toàn cảnh của `film-fin1.js`; giữ tỉ lệ meme nhỏ so với nhà.
Ứng viên CHƯA KIỂM (chỉ khi cần): Depth Anything V2 (ONNX trong trình duyệt) để tách lớp theo độ sâu; Kenney City Kit (CC0, glTF) + three.js nếu muốn thành phố 3D thật.
**Xong khi:** anh xem bảng khung cảnh 4 và duyệt nền; không còn shot nào thấy khối hộp trơn.

### Bước 5 — Nhân vật có sức sống · thư mục `chaos-battle-lab`
(a) Lưới biến dạng ảnh 2D trong `js/vfx-gl.js` (việc chờ từ 9/11): thở, nghiêng, dẹt khi tiếp đất, áo / đuôi phất theo gió — áp cho mọi sprite qua 1 tham số.
(b) Hành động chính (đấm, bay, kết ấn): xin GPT sprite sheet 3–4 khung, phát 12 hình/giây. (c) Không cắt ảnh thành ô chữ nhật cho cử động riêng (làm vỡ mặt — anh chê 9/11).
**Xong khi:** shot đứng yên nào nhân vật cũng có chuyển động nhỏ; 1 đòn đánh mẫu chạy bằng sprite sheet.

### Bước 6 — Bảng phân cảnh thành DỮ LIỆU + tự soát nhịp · thư mục `chaos-battle-lab`
Mỗi phim khai `shotlist:[{t0,t1,co,goc,hanhDong,anh:[…],sfx:[…],nhac}]`. Từ đó: sinh danh sách ảnh cần vẽ (tự vẽ nền song song theo skill), sinh khung lịch tiếng có nhãn,
và `film-lint` soát theo `../meme-anime-lab/playbook/nhip.md`: shot đánh 0.2–0.9s, khoảng thở 1.4–1.6s sau nổ lớn, không shot tĩnh > 3s, ≥ 3 cỡ cảnh / 10s, khung âm bản ở mỗi va chạm.
**Xong khi:** `film-check.js` chạy cả film-lint; Final 1 cảnh 4 có shotlist và qua lint.

### Bước 7 — Giọng Nhật đọc tên chiêu
Cần cho: "Ryōiki Tenkai — Muryōkūsho", Hollow Purple, Almighty Push. Ứng viên CHƯA KIỂM: VOICEVOX (máy chủ nội bộ, chạy CPU), edge-tts, Style-Bert-VITS2 (cần Python → Mac).
Xem điều khoản dùng giọng trước khi chọn. Hoặc anh gửi clip gốc → cắt theo skill tim-sound. **Xong khi:** mỗi tên chiêu có 1 file giọng, khai trong catalog.

### Bước 8 — Máy Mac · thư mục `~/Desktop/1. meme-anime-lab` và `~/Desktop/1. chaos-battle-lab`
Làm theo `VIEC.md` mục "Mac": `git pull`, `node tools/hoc-clip.js --test` (đáp án trong VIEC.md), chạy `film-check.js` cả 4 cảnh, đo ms/khung hiệu ứng, ghi kết quả vào VIEC.md.
Sau đó mới xuất video khi anh bảo.

### Bước 9 — Nâng máy học clip (làm sau cùng) · thư mục `meme-anime-lab`
Máy dò cắt cảnh còn sót ở chuyển cảnh bằng mảnh vụn / nhoè. Ứng viên CHƯA KIỂM: TransNetV2 (có bản ONNX?), PySceneDetect (Python → Mac). Thêm mẫu ghi chú shot chặt hơn
(nhân vật / góc máy / hành động) để nối thẳng sang `shotlist` của Bước 6.

## Việc tìm công cụ GitHub còn dở
Agent tìm công cụ 10/11 bị ngắt giữa chừng (hết hạn mức), CHƯA có danh sách đã kiểm. Mọi tên "ứng viên" ở trên là theo trí nhớ của Claude — bắt buộc mở trang gốc
xác nhận (có thật, giấy phép, ngày cập nhật, cần gì để chạy) trước khi cài, theo luật Bước 0. Chỉ kiểm công cụ của bước đang làm, không tìm tràn lan.

## Đã có sẵn (đừng làm lại)
`tools/x/sfx-lint.js` (soát tiếng không cần nghe) · `tools/x/film-sheet.html` (bảng khung) · `js/cine-cam.js` (góc máy, nhịp, wipe, implode…) · `js/vfx-manga.js` (smear, swirl, halftone,
mangaBW, blast, rimLight) · skill `ve-anh-gpt` + `tach-nen-anh` (tự vẽ + tách nền) · playbook 4 clip (kaiju-a, kaiju-b, fight-1, gojo-domain-1).
