# Meme Anime Lab — thư viện cảnh anime cho Meme Cinema

Làm việc bằng tiếng Việt, gọi người dùng là **anh** (anh Hải). Repo `hh-vibecode/meme-anime-lab` (CÔNG KHAI — anh chọn 9/11/2026), nhánh `main`.
Thư mục trên máy: `0.van-phong-ao/meme-anime-lab`, nằm CẠNH `0.van-phong-ao/chaos-battle-lab` (repo game) — công cụ ở đây mượn `chaos-battle-lab/tools/x/cdp.js`.

## ⚠️ ĐỌC TRƯỚC — luồng này dựng trên máy PC Windows (9/11/2026), anh dùng 1 PC + 1 Mac
- Anh làm trên **2 máy: PC Windows + MacBook**, đẩy chung lên `main`. Đầu mỗi phiên: `git pull` repo này (và repo game nếu dựng phim).
- Bộ nhớ Claude của từng máy KHÔNG sang máy kia → mọi luật / cách làm / ghi nhớ phải nằm trong FILE của repo này.
- Công cụ viết để chạy được CẢ 2 máy (Node thuần + trình duyệt chạy ngầm, không npm, không ffmpeg). Đã chạy thử trọn vòng trên PC (9/11);
  **trên Mac CHƯA chạy lần nào** → lần đầu ở Mac: chạy `node tools/hoc-clip.js --test` trước, đúng đáp án mới dùng thật (xem "Tự kiểm" dưới).
- Repo CÔNG KHAI: không chứa khoá / mật khẩu; video gốc KHÔNG lên GitHub; ảnh khung chỉ để phân tích, nén nhỏ.

## Mục đích
Anh nạp clip anime / phim mẫu → Claude cắt cảnh → xem bảng khung → viết bảng cảnh + rút LUẬT đạo diễn + CÔNG THỨC CODE → dùng khi dựng phim
trong game (bộ khung `chaos-battle-lab/js/cine-kit.js`, skill `dung-phim` — skill đó đã ghi: trước khi lên bảng phân cảnh phải đọc `playbook/` ở đây).
Claude KHÔNG tự học / không nhớ giữa các phiên — chỉ những gì GHI RA FILE ở đây mới dùng lại được.
Claude KHÔNG xem được video, KHÔNG nghe được tiếng → xem chuỗi KHUNG HÌNH + đường độ to tiếng; nội dung tiếng (thoại, kiểu nhạc) anh ghi chú lúc nạp (`--note`).
Đã cân nhắc + bỏ (9/11): Gemini / ChatGPT xem video hộ (thêm tài khoản; Gemini mặc định chỉ ~1 khung/giây — thưa hơn mình), dịch vụ ngoài qua MCP (gửi video ra ngoài, tốn tiền).

## Nguyên tắc công cụ (anh chốt 9/11/2026)
Anh hay gửi công cụ / add-on tìm trên mạng (Blender, Unity, AI xem video…). KHÔNG cài công cụ ngoài vào quy trình —
xem nó làm được gì, lấy làm THAM KHẢO, rồi TỰ DỰNG LẠI bằng công cụ của mình (cine-kit trong trình duyệt, Node thuần, chạy được cả PC lẫn Mac).
Tên công cụ AI liệt kê hay bị bịa → tra lại trước khi nói với anh.
Việc đang chờ: bộ GÓC MÁY LÀM SẴN `CineKit.cam.*` (lia giật / whip pan, dolly zoom, lao theo đòn + khựng, xoay quanh lúc gồng chiêu…, ý từ add-on Cinepack của Blender)
— dựng SAU khi học vài clip, chỉnh số theo nhịp anime thật (ghi vào `playbook/cong-thuc.md`).
Cũng đang chờ (từ đợt tham khảo 9/11, tự dựng lại, không cài):
- LƯỚI BIẾN DẠNG ảnh 2D (ý Stretchy Studio / Spine / Live2D): 1 ảnh tự dẹt khi tiếp đất, kéo dài theo hướng lao (smear thật), nghiêng, thở — WebGL trong `chaos-battle-lab/js/vfx-gl.js`.
- BỘ NHỊP CHUYỂN ĐỘNG làm sẵn (ý AnimAide): giữ rồi bật (hold → snap), vượt quá rồi bật lại, hãm gấp — gom chung với `CineKit.cam.*`.
- Mẫu ghi chú shot chặt hơn cho `phan-tich.md` (ý bộ dữ liệu AnimeShooter: nhân vật / góc máy / hành động mỗi shot).
Đã xem + bỏ: AnimationGPT (khung xương 3D, cần Linux + RTX 4090), GhibliGenerator (đá / cảnh Blender, 2022), Mocap-Anything / Motion2MixamoRig (cần xương 3D).

## Cấu trúc
- `videos/`      VIDEO GỐC — chỉ nằm trên máy đã nạp, gitignore. Mỗi clip ghi máy đang giữ trong `clips/<id>/info.json` (`video_o_may`).
- `clips/<id>/`  `info.json` (nguồn, đoạn, ghi chú của anh, máy giữ video) · `sheet-NN.jpg` (bảng khung) · `shots-NN.jpg` (đầu/giữa/cuối mỗi cảnh)
                 · `audio-01.png` (độ to tiếng) · `data.json` (số liệu) · `phan-tich.md` (Claude viết).
- `playbook/`    SỔ TAY ĐẠO DIỄN gom từ mọi clip (đọc `playbook/README.md`).
- `tools/`       `hoc-clip.js` (lệnh chính) · `cat-canh.html` (trang cắt cảnh) · `serve.js` (máy chủ, có Range + POST lưu) · `_test-video.html` (video thử).

## Cách nạp 1 clip (Claude làm, anh chỉ cần đưa video + nói đoạn nào, học gì)
1. **Lấy video vào `videos/`**
   - Anh gửi FILE: anh bỏ vào `videos/` (hoặc đưa đường dẫn — lệnh tự chép vào `videos/<id>.<đuôi>`).
   - Anh gửi LINK YouTube:
     - **Mac**: `yt-dlp --download-sections "*1:20-1:45" -f "bv*[height<=1080]+ba/b" --merge-output-format mp4 -o videos/<id>.mp4 "<link>"` (Mac có yt-dlp + ffmpeg).
     - **PC Windows** (anh cho cài 9/11): `D:\tools\yt-dlp\yt-dlp.exe` + `deno.exe` (yt-dlp cần để giải mã YouTube). KHÔNG có ffmpeg → dùng thẳng
       `hoc-clip.js --yt "<link>" --id <id> --a 1:47 --b 1:52 …`: tải hình ≤720p + tiếng m4a thành 2 file (1 lần / video), cắt nhiều đoạn dùng lại.
   - ⚠️ PC: ổ C GẦN ĐẦY → video gốc ở `D:\meme-anime-lab-videos\` (serve.js tự chọn), công cụ ở `D:\tools\` (codex-cli, codex-home, yt-dlp).
     Cả thư mục `0.van-phong-ao` chuyển sang `D:\0.van-phong-ao`. Desktop KHÔNG còn bản `0.van-phong-ao` (đã dọn 9/11) → luôn dùng `D:\0.van-phong-ao`.
2. **Cắt cảnh** (đặt `<id>` không dấu, vd `jjk-gojo-vs-sukuna-1`):
   - **Mac**:        `node tools/hoc-clip.js videos/<id>.mp4 --id <id> --a 80 --b 105 --fps 10 --note "..." --url "<link>"`
   - **PC Windows**: `powershell -NoProfile -ExecutionPolicy Bypass -File ../chaos-battle-lab/tools/node.ps1 tools/hoc-clip.js videos/<id>.mp4 --id <id> --a 80 --b 105 --fps 10 --note "..."`
     (PC không có node → `node.ps1` của repo game mượn Node của VS Code.)
   - `--a/--b` = giây đầu/cuối (bỏ trống = cả video) · `--fps` 6 cảnh thường, 10–12 đoạn đánh nhanh (>900 khung thì tự hạ) · chạy lại cùng `--id` = ghi đè ảnh cũ.
   - Mất ~1–3 phút cho 30s ở 10 khung/giây. Cổng: máy chủ 8790, trình duyệt ngầm 9466 (profile riêng `mal-browser-profile` trong thư mục tạm, KHÔNG đụng trình duyệt của phiên khác).
3. **Claude xem**: Read `shots-NN.jpg` trước (toàn cục), rồi `sheet-NN.jpg` (chi tiết từng khung), `audio-01.png` (tiếng bật khớp khung nào).
   Vạch ĐỎ + `#n` = khung đầu cảnh mới · viền VÀNG `FLASH` = khung loé / impact frame (không tính là cắt máy) · cột chữ = giây trong video gốc.
   `audio-01.png`: vạch xanh dài = tiếng bật mạnh (onset) · vạch xanh ngắn = nhịp (tiếng bật trong nhạc to đều) · dải vàng = khoảng lặng.
   ⚠️ Clip AMV / lồng nhạc (nhạc nền ghép đè lên phim) thì KHÔNG học tiếng — chỉ học HÌNH (anh dặn 9/11/2026). Chỉ học tiếng khi clip giữ âm thanh đánh nhau gốc.
   Máy dò chỗ cắt có thể nhầm ở đoạn máy lia cực nhanh / chớp liên tục → Claude soát lại bằng mắt, ghi đính chính trong `phan-tich.md`.
4. **Viết `clips/<id>/phan-tich.md`** theo mẫu `playbook/README.md` (bảng cảnh từng shot + nhịp + mẹo rút ra).
5. **Cập nhật `playbook/`** ngay trong phiên: luật mới / công thức code mới (ghi clip nguồn). Rồi commit + push (repo này) — KHÔNG commit `videos/`.

## Tự kiểm công cụ (bắt buộc lần đầu ở máy mới, hoặc sau khi sửa tools/)
`... tools/hoc-clip.js --test` → tự tạo video 6s biết trước đáp án → `clips/_test/` (gitignore). ĐÚNG khi in:
`OK 3 cảnh · 62 khung · 1 bảng khung · flash 2 · onset 3 · nhịp 3 · lặng 0` (cắt 2.0s + 4.0s, loé 3.0–3.1s, tiếng bật ~1.0 / 2.48 / 4.48s).
`--test` luôn chạy 10 khung/giây (bỏ qua `--fps`) để đáp án cố định.
Dò lỗi 1 trang: `... tools/hoc-clip.js --page tools/<trang>.html` (in `window.__done`).

## Bài học khi dựng công cụ (PC 9/11) — đừng làm lại
- Edge chạy ngầm: `MediaRecorder` ghi ra **0 byte** → video thử phải mã hoá bằng **WebCodecs** (VP8 + Opus) rồi tự đóng gói WebM (`_test-video.html`). WebM tự ghép phải có Duration + Cues, không thì không tua được.
- Khung đầu lấy trước sự kiện `loadeddata` ra màn đen → báo nhầm 1 cảnh 0.1s (đã sửa: chờ `loadeddata`).
- Máy chủ phải hỗ trợ Range (video tua) và không sập khi file rỗng; lần chạy lỗi giữa chừng để sót trình duyệt giữ cổng 9466 → `hoc-clip.js` luôn `--stop` trước khi mở.
- Video quá nặng (>450MB) thì bỏ phần tiếng (giải mã cả file sẽ tràn RAM) — cắt đoạn ngắn trước khi nạp.
- Nhạc AMV bị nén to đều (~-10dB liên tục) → luật onset cũ (nhảy 8dB) ra 0 → thêm `nhip` (độ nhảy dải tần cao, ngưỡng tự chỉnh theo ±1s) + `lang` (tụt ≥6dB dưới trung vị, ≥0.1s).
  Đã thử dò phách / BPM rồi BỎ (9/11): clip lồng nhạc không học nhạc.
- Windows có thể giữ file ảnh đang mở xem (EPERM khi xoá) → bước xoá ảnh cũ bỏ qua lỗi, ảnh mới ghi đè.

## Luồng chat Claude
Nên mở 1 phiên Claude Code RIÊNG trong thư mục `meme-anime-lab` để nạp + phân tích clip (phiên đó tự đọc file này).
Phiên game (chaos-battle-lab) chỉ ĐỌC `playbook/` khi dựng phim. Không trộn 2 việc trong 1 phiên dài.
