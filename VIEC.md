# VIỆC — Meme Anime Lab (luồng công cụ phim)
Đọc file này ĐẦU MỖI PHIÊN, trên cả PC lẫn Mac (bộ nhớ Claude không sang máy kia — mọi thứ phải ghi ở đây).
Phiên Claude mở trong `meme-anime-lab` = "luồng công cụ phim" (anh đặt 9/11/2026): nạp clip, phân tích, viết playbook, sửa tools/.
Xong việc: cập nhật file này → commit → push `main`. Đầu phiên: `git pull`.

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
1. `git pull` (repo này + `chaos-battle-lab` nằm cạnh).
2. `node tools/hoc-clip.js --test` → phải ra đúng đáp án trên. Sai thì sửa tools/ trước, chưa nạp clip thật.
3. Mac có yt-dlp + ffmpeg: nạp YouTube dùng `--yt` như PC (đã viết chạy cả 2 máy, nhưng CHƯA thử trên Mac), hoặc lệnh yt-dlp tải đoạn trong CLAUDE.md.
4. Video gốc trên Mac để ở `videos/` trong repo (gitignore) — `serve.js` tự chọn.

## Đã xong đợt công cụ 9/11 (PC)
- [x] Máy dò chỗ cắt mới: độ giống CẤU TRÚC (`tools/cat-quyet.js`, chỉnh ngưỡng ngoài máy bằng Node) + dò khung ÂM BẢN (viền hồng). kaiju-b 2 → 12/14 cảnh.
- [x] Repo game Ver 525 `js/cine-cam.js` → `CineKit.cam.*` (góc máy, nhịp holdSnap/overshoot/brake, implode, wipe, đường hầm, khoảng thở, chia đôi).
- [x] Repo game Ver 526 `js/vfx-manga.js` → `CineKitFx` (smear, swirl, halftone, mangaBW, blast, rimLight).

## Việc còn mở
- [ ] CHƯA phim nào dùng `CineKit.cam` / `CineKitFx` — lần dựng đầu (đề xuất: làm lại Final Part 1 cảnh 2 Friend phá thành phố, rồi Gojo vs Pain cảnh 4–5) sẽ lộ lỗi.
- [ ] Máy dò vẫn sót ở chỗ chuyển bằng mảnh vụn / nhoè và đoạn hỗn loạn (nổ, xoáy) — vẫn soát bằng mắt, ghi đính chính.
- [ ] Hiệu ứng `CineKitFx` đo trên CPU 10–22 ms/khung — chưa đo GPU thật; trên Mac đo lại.
- [ ] Lưới biến dạng ảnh 2D thật (dẹt / thở / nghiêng, WebGL) · mẫu ghi chú shot chặt hơn.
- [ ] `clips/fight-2/` rỗng — hỏi anh còn muốn nạp đoạn nào.

## Nhật ký
- 9/11 PC: dựng công cụ, nạp kaiju-a/b + fight-1, viết phân tích 3 clip + playbook (luat, cong-thuc, nhip); thêm nhịp/lặng cho tiếng.
  PC mất `~/.gitconfig` → đặt tên commit riêng cho repo này (`git config user.name hh-vibecode`, email noreply như các commit trước).
