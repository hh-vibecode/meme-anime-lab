# Meme Anime Lab — thư viện cảnh anime cho Meme Cinema

Làm việc bằng tiếng Việt, gọi người dùng là **anh** (anh Hải). Repo `hh-vibecode/meme-anime-lab`, nhánh `main`. Tạo 9/11/2026.

## Mục đích
Anh nạp clip anime / phim mẫu → Claude phân tích thành bảng cảnh → rút LUẬT đạo diễn + CÔNG THỨC CODE → dùng khi dựng phim
trong game Chaos Battle Lab (`../chaos-battle-lab`, bộ khung `js/cine-kit.js`, skill `dung-phim`).
Claude không tự học / không nhớ giữa các phiên: chỉ những gì GHI RA FILE ở repo này mới được dùng lại. Claude không xem được video, không nghe được tiếng
→ xem chuỗi KHUNG HÌNH (đoạn đánh nhanh 10–12 khung/giây) + đo độ to / nhịp tiếng theo khung; nội dung tiếng (thoại, kiểu nhạc) do anh ghi chú lúc nạp.

## Cấu trúc
- `videos/`   VIDEO GỐC — chỉ nằm trên máy đã nạp (Mac hoặc Windows), KHÔNG đẩy lên GitHub (.gitignore).
- `clips/<id>/` mỗi clip 1 thư mục: `info.json` (nguồn, mốc giây, máy đang giữ video + đường dẫn, ghi chú của anh), bảng khung nén nhỏ, `phan-tich.md` (bảng cảnh).
- `playbook/` SỔ TAY ĐẠO DIỄN rút từ mọi clip: luật (góc máy, nhịp, hit-stop, chuyển cảnh, VFX…) + công thức code cine-kit. Skill `dung-phim` đọc ở đây.
- `tools/`    công cụ nạp + cắt cảnh (chạy trên trình duyệt → dùng được cả Windows không có ffmpeg/python; Mac có thể dùng ffmpeg).

## Luật
- Video gốc không lên GitHub. Ảnh khung trong repo chỉ để phân tích, nén nhỏ.
- Phân tích xong clip nào → cập nhật `playbook/` ngay trong phiên (luật mới + clip nguồn).
- Không chứa khoá / mật khẩu.
