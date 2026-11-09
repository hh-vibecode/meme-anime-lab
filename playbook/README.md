# Sổ tay đạo diễn (playbook)

Gom luật + công thức từ mọi clip đã học. Skill `dung-phim` của repo game đọc thư mục này TRƯỚC khi lên bảng phân cảnh.
Mỗi luật ghi clip nguồn `(clips/<id> #shot)` để quay lại xem khung.

## File
- `luat.md`       luật đạo diễn theo chủ đề (cận chiến, ra chiêu lớn, phá huỷ diện rộng, lãnh địa / kết giới, đối mặt, chuyển cảnh, nhịp cắt, tiếng).
- `cong-thuc.md`  công thức code cine-kit dùng lại (tên hàm, tham số, phim nào đã dùng).
- `nhip.md`       số liệu nhịp: độ dài shot trung bình theo loại cảnh, số khung hit-stop, khung loé… (lấy từ `data.json`).
(Tạo file khi có clip đầu tiên — chưa có thì chưa tạo.)

## Mẫu `clips/<id>/phan-tich.md`
```
# <tên clip> — <nguồn, đoạn giây>
Ghi chú của anh: …
Tóm tắt: <1–2 câu: cảnh gì, cảm giác gì>

| # | giây | dài | cỡ cảnh | góc máy | máy chuyển động | hành động | VFX | tiếng |
|---|------|-----|---------|---------|-----------------|-----------|-----|-------|

Nhịp: <độ dài shot trung bình, chỗ nhanh/chậm, khung loé ở đâu, khựng bao lâu>
Rút ra (→ đã ghi vào playbook):
- luật …
- công thức …
Đính chính máy dò: <cắt nhầm / sót ở đâu>
```
