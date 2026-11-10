# VIỆC — Meme Anime Lab (luồng công cụ phim)
Đọc file này ĐẦU MỖI PHIÊN, trên cả PC lẫn Mac (bộ nhớ Claude không sang máy kia — mọi thứ phải ghi ở đây).
Phiên Claude mở trong `meme-anime-lab` = "luồng công cụ phim" (anh đặt 9/11/2026): nạp clip, phân tích, viết playbook, sửa tools/.
Xong việc: cập nhật file này → commit → push `main`. Đầu phiên: `git pull`.


## 📌 Quyết định của anh + trạng thái (10/11/2026) — đọc trước khi làm phim
- **Âm thanh**: kho **Sonniss GDC 2026** — DÙNG THOẢI MÁI (anh là người làm phim, không phát triển AI). GIỮ TOÀN BỘ kho ở `D:	oolssonniss` (PC) để tận dụng lâu dài cho game + phim;
  tìm bằng `tools/x/sonniss-index.js --find` (repo game). Tiếng chọn dùng → `assets/audio/sn_*.mp3` (tiền tố dùng chung). Mac chưa có kho → tải lại khi cần.
- **Giọng Nhật tên chiêu**: VOICEVOX (`D:	oolsoicevox`, script `tools/x/voicevox.js`), giọng 玄野武宏 — mô tả video PHẢI ghi `VOICEVOX:玄野武宏`. Anh chưa nghe duyệt.
- **Chữ trên màn hình CHỈ tiếng Anh**, không chữ Hán / Nhật, không tiêu đề / thẻ cuối / "TO BE CONTINUED" khi anh không yêu cầu. (Logo MEOWKATSUKI có chữ Hán theo mẫu anh gửi 5/11 — chờ anh quyết giữ / bỏ.)
- **Meme giữ NGUYÊN form gốc**: đứng thẳng như ảnh gốc, KHÔNG tư thế 4 chân. Meme NHỎ so với nhà.
- **Tự vẽ ảnh song song** khi dựng phim (skill ve-anh-gpt), không hỏi / không chờ anh. **Kiểm agent 5 phút / lần**, lệnh nền luôn có timeout.
- **Menu Meme Cinema**: MEME LORE 2 → thư mục **Final · Part 1** (`__fin1` trong js/game.js) chứa: Story (fin1, 3 cảnh) · Fight Gojo vs Pain (fin1c4, phim riêng) · Trailer 9:16 (fin1tr, ~18s).
  Các trận lớn TÁCH khỏi tập vì chưa có cảnh nối; khi anh thêm cảnh nối mới ghép lại.
- **Trận phụ (anh xử lý sau)**: yêu cầu đầy đủ ở repo game `prompts/fin1-fight-phu.md` — fin1f1 Chud+Mlem vs Doge+Clapping · fin1f2 Bat vs Pop+Huh · fin1f3 Ninja vs Berserk, 10–20s, signature move đúng game.
- **Soát phim 1 lệnh** (repo game): `tools/x/film-check.js <id>` = bảng khung + sfx-lint (tiếng) + film-lint (nhịp, cần js/shots/<id>.json). Phải 0 lỗi trước khi báo anh.
- Kế hoạch nâng cấp + công cụ ngoài đã kiểm: `KE-HOACH-NANG-CAP.md`. Đã xong Bước 0–7; còn Bước 8 (Mac), 9 (máy học clip).

## Trạng thái (cập nhật 9/11/2026, PC Windows)
Đã học 3 clip, đã có phân tích + playbook:
| clip | nội dung | video gốc đang ở | phân tích |
|------|----------|------------------|-----------|
| kaiju-a | Avengers — quái chui cổng (1:47–1:52) | PC `D:/meme-anime-lab-videos/yt-atOgj_ZaO7M.mp4` | xong |
| kaiju-b | Cửu Vĩ phá làng Lá (1:06–1:23) | PC `D:/meme-anime-lab-videos/yt-JAMyK-5WzDM.mp4` | xong |
| fight-1 | Gojo vs Sukuna AMV (1:00–2:00) — LỒNG NHẠC, chỉ học hình | PC `D:/meme-anime-lab-videos/yt-44pt8w67S8I.mp4` | xong |
Playbook: `playbook/luat.md` · `playbook/cong-thuc.md` · `playbook/nhip.md`.
Mac muốn xem lại video gốc: tải lại bằng yt-dlp theo `nguon` + `doan` trong `clips/<id>/info.json` (video không lên GitHub).

Công cụ (9/11):
- `--yt "<link>"` tải YouTube không cần ffmpeg (hình ≤720p + tiếng m4a, 2 file), `--a/--b` nhận `1:47`.
- Tiếng: ngoài `onset` (bật mạnh) có thêm `nhip` (tiếng bật trong nhạc to đều, dải cao, ngưỡng tự chỉnh) và `lang` (khoảng lặng giữa đoạn to).
- `--test` luôn chạy 10 khung/giây. Đáp án: `OK 3 cảnh · 62 khung · 1 bảng khung · flash 2 · âm bản 0 · onset 3 · nhịp 3 · lặng 0`.

## Mac — làm khi mở phiên lần đầu ở Mac
1. Mac: repo game CÓ SẴN ở `~/Desktop/1. chaos-battle-lab` (anh đặt "1. " cho lên đầu, 9/11) → `git pull` ở đó; clone repo này vào `~/Desktop/1. meme-anime-lab` (đặt tên giống)
   (cạnh nhau là đủ — hoc-clip.js tự tìm thư mục game cạnh bên dù có tiền tố số; Mac KHÔNG cần `0.van-phong-ao`. Tài liệu ghi `../meme-anime-lab` / `../chaos-battle-lab` = thư mục cạnh bên, trên Mac là bản có "1. ").
2. `node tools/hoc-clip.js --test` → phải ra đúng đáp án trên. Sai thì sửa tools/ trước, chưa nạp clip thật.
3. Mac có yt-dlp + ffmpeg: nạp YouTube dùng `--yt` như PC (đã viết chạy cả 2 máy, nhưng CHƯA thử trên Mac), hoặc lệnh yt-dlp tải đoạn trong CLAUDE.md.
4. Video gốc trên Mac để ở `videos/` trong repo (gitignore) — `serve.js` tự chọn.

## Đã xong đợt công cụ 9/11 (PC)
- [x] Máy dò chỗ cắt mới: độ giống CẤU TRÚC (`tools/cat-quyet.js`, chỉnh ngưỡng ngoài máy bằng Node) + dò khung ÂM BẢN (viền hồng). kaiju-b 2 → 12/14 cảnh.
- [x] Repo game Ver 525 `js/cine-cam.js` → `CineKit.cam.*` (góc máy, nhịp holdSnap/overshoot/brake, implode, wipe, đường hầm, khoảng thở, chia đôi).
- [x] Repo game Ver 526 `js/vfx-manga.js` → `CineKitFx` (smear, swirl, halftone, mangaBW, blast, rimLight).

## Dựng phim bằng playbook — đợt đầu (9/11, repo game Ver 527)
- Final Part 1 nâng cấp theo kaiju-a/b + fight-1: thành phố đúng tỉ lệ (meme nhỏ, nhà to), Friend lộ diện bộ ba, ĐUÔI quật kiểu Cửu Vĩ, tĩnh trước phá, hậu quả;
  nóc nhà hết vỡ mặt (bỏ thở từng ô), Rinnegan vẽ rõ; cảnh 4 Gojo vs Pain bản đầu (`js/film-fin1c4.js`, ảnh tạm — lệnh vẽ ở `prompts/fin1-gojo-pain.txt` repo game).
- Soát khung phim: `tools/x/film-sheet.html?id=<id>&file=<file>` (repo game) qua `cdp.js` — LUÔN bọc `timeout 420`, kiểm ~10 phút/lần (9/11 treo 3 tiếng vì không kiểm).
- Luật anh dặn khi dựng: xin ẢNH SỚM ngay từ kịch bản; meme NHỎ so với nhà; không cho từng ô ảnh cắt chữ nhật cử động riêng (xé mặt nhân vật).

## Việc còn mở
- [ ] CHƯA phim nào dùng `CineKit.cam` / `CineKitFx` — lần dựng đầu (đề xuất: làm lại Final Part 1 cảnh 2 Friend phá thành phố, rồi Gojo vs Pain cảnh 4–5) sẽ lộ lỗi.
- [ ] Máy dò vẫn sót ở chỗ chuyển bằng mảnh vụn / nhoè và đoạn hỗn loạn (nổ, xoáy) — vẫn soát bằng mắt, ghi đính chính.
- [ ] Hiệu ứng `CineKitFx` đo trên CPU 10–22 ms/khung — chưa đo GPU thật; trên Mac đo lại.
- [ ] Lưới biến dạng ảnh 2D thật (dẹt / thở / nghiêng, WebGL) · mẫu ghi chú shot chặt hơn.
- [ ] `clips/fight-2/` rỗng — hỏi anh còn muốn nạp đoạn nào.

## Nhật ký
- 9/11 PC: dựng công cụ, nạp kaiju-a/b + fight-1, viết phân tích 3 clip + playbook (luat, cong-thuc, nhip); thêm nhịp/lặng cho tiếng.
  PC mất `~/.gitconfig` → đặt tên commit riêng cho repo này (`git config user.name hh-vibecode`, email noreply như các commit trước).

## ⭐ Kế hoạch nâng cấp luồng dựng phim (10/11)
Đọc `KE-HOACH-NANG-CAP.md` — 10 bước, mỗi bước 1 phiên mới. Chưa bước nào bắt đầu (trừ công cụ `sfx-lint.js` đã có ở repo game).
