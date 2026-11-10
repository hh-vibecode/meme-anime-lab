# Sổ tay đạo diễn (playbook)

Gom luật + công thức từ mọi clip đã học. Skill `dung-phim` của repo game đọc thư mục này TRƯỚC khi lên bảng phân cảnh.
Mỗi luật ghi clip nguồn `(clips/<id> #shot)` để quay lại xem khung.

## File
- `luat.md`       luật đạo diễn theo chủ đề (cận chiến, ra chiêu lớn, phá huỷ diện rộng, lãnh địa / kết giới, đối mặt, chuyển cảnh, nhịp cắt, tiếng).
- `cong-thuc.md`  công thức code cine-kit dùng lại (tên hàm, tham số, phim nào đã dùng).
- `nhip.md`       số liệu nhịp: độ dài shot trung bình theo loại cảnh, số khung hit-stop, khung loé… (lấy từ `data.json`).
Đã có cả 3 file (9/11/2026, từ kaiju-a, kaiju-b, fight-1).

## Mẫu `clips/<id>/phan-tich.md`
```
# <tên clip> — <nguồn, đoạn giây>
Ghi chú của anh: …
Tóm tắt: <1–2 câu: cảnh gì, cảm giác gì>

| # | t0 | t1 | co | goc | hanhDong | loai | may | vfx | tieng | ghiChu |
|---|----|----|----|-----|----------|------|-----|-----|-------|--------|
| 1 | 1:06.0 | 1:07.5 | cận | giun | quái gầm, 1:06.7 mắt đỏ bật sáng | giới thiệu | đứng yên | mắt phát sáng | gầm liền | |

Nhịp: <độ dài shot trung bình, chỗ nhanh/chậm, khung loé ở đâu, khựng bao lâu>
Rút ra (→ đã ghi vào playbook):
- luật …
- công thức …
Đính chính máy dò: <cắt nhầm / sót ở đâu>
```
Bảng shot dùng ĐÚNG trường của shotlist repo game (`chaos-battle-lab/js/shots/<phim>.json`, vd `fin1c4.json`) — từ 10/11/2026:
- `t0` / `t1`: giây trong video gốc (`1:06.0` hoặc `66.0`), lấy từ `shots-NN.jpg` / `data.json` rồi soát bằng mắt.
- `co` (cỡ cảnh) CHỈ 1 trong: `toàn` · `trung` · `cận` · `đặc tả`.
- `goc` (góc máy) CHỈ 1 trong: `giun` (từ dưới lên) · `ngang` · `chéo` (nghiêng / dutch) · `chim` (từ trên xuống) · `qua vai`.
- `loai` CHỈ 1 trong: `giới thiệu` · `đối mặt` · `đánh` · `ra chiêu` · `chuyển cảnh` · `nổ lớn` · `thở` · `lãnh địa`.
- `hanhDong`: ai làm gì, ngắn, ghi giây của khoảnh khắc chính nếu có. `may`: đứng yên / đẩy vào / lia / xoay / rung / lướt… (tên `CineKit.cam.*` nếu khớp).
  `vfx`, `tieng`, `ghiChu`: chữ tự do (clip lồng nhạc thì bỏ trống `tieng`). Thiếu gì để trống, KHÔNG viết chữ khác vào 3 cột co / goc / loai.
- Chuyển sang JSON shotlist (mang thẳng sang phim): `node tools/phan-tich-to-shots.js clips/<id>/phan-tich.md [--from 1:10 --to 1:20] [--out x.json]`
  → `{t0,t1,co,goc,hanhDong,loai,anh:[],sfx:[],ghiChu}` (t0 tính lại từ 0; `may` / `vfx` / `tieng` gộp vào `ghiChu`; `anh` / `sfx` điền khi dựng phim).
  Script in "CẦN SOÁT" nếu co / goc / loai ngoài danh sách. Bảng kiểu cũ (clip nạp 9/11: cột "giây", "cỡ cảnh", "góc máy"…) vẫn đọc được — tự đoán co / goc, loai để trống.
