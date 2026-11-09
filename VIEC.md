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
- `--test` luôn chạy 10 khung/giây. Đáp án: `OK 3 cảnh · 62 khung · 1 bảng khung · flash 2 · onset 3 · nhịp 3 · lặng 0`.

## Mac — làm khi mở phiên lần đầu ở Mac
1. `git pull` (repo này + `chaos-battle-lab` nằm cạnh).
2. `node tools/hoc-clip.js --test` → phải ra đúng đáp án trên. Sai thì sửa tools/ trước, chưa nạp clip thật.
3. Mac có yt-dlp + ffmpeg: nạp YouTube dùng `--yt` như PC (đã viết chạy cả 2 máy, nhưng CHƯA thử trên Mac), hoặc lệnh yt-dlp tải đoạn trong CLAUDE.md.
4. Video gốc trên Mac để ở `videos/` trong repo (gitignore) — `serve.js` tự chọn.

## Việc còn mở
- [ ] Máy dò chỗ cắt sai nhiều ở nét manga đen trắng / halftone (fight-1: gộp nhiều shot) và ở bảng màu tối phẳng (kaiju-b: chỉ ra 2/14 cảnh) →
      cần ngưỡng tự chỉnh theo đoạn (như `nhip`), không dùng 1 ngưỡng cố định. Máy chưa bắt khung ÂM BẢN (đảo màu) — chỉ bắt loé sáng.
- [ ] Bộ góc máy làm sẵn `CineKit.cam.*` + bộ nhịp chuyển động (hold → snap, vượt rồi bật lại) — số đã có trong `nhip.md`; dựng trong repo game.
- [ ] Những thứ cine-kit chưa có (xem mục "chưa có" trong `cong-thuc.md`) — báo phiên game, KHÔNG sửa repo game từ đây.
- [ ] Lưới biến dạng ảnh 2D (vfx-gl), mẫu ghi chú shot chặt hơn — xem CLAUDE.md "đang chờ".
- [ ] `clips/fight-2/` rỗng — hỏi anh còn muốn nạp đoạn nào.

## Nhật ký
- 9/11 PC: dựng công cụ, nạp kaiju-a/b + fight-1, viết phân tích 3 clip + playbook (luat, cong-thuc, nhip); thêm nhịp/lặng cho tiếng.
  PC mất `~/.gitconfig` → đặt tên commit riêng cho repo này (`git config user.name hh-vibecode`, email noreply như các commit trước).
