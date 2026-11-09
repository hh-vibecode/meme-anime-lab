# Công thức code cine-kit (dùng lại khi dựng phim)

Cách đọc: mỗi mục = MỤC ĐÍCH · NGUỒN (clip + giây, mở `clips/<id>/sheet-NN.jpg` để xem khung) · SỐ NHỊP · CODE.
Code viết theo API THẬT của `chaos-battle-lab/js/cine-kit.js` (đã soát 9/11/2026): `def.impact(t)` → `0|'bw'|'inv'|'red'`, `def.shake(t)` → px,
`def.screen(F,t)` (vẽ sau thế giới), `def.panels(t)` → `[{cam,clip}]`, `def.post(F,t)` → `{shocks,zoom,chroma,heat}`, `def.shots` = `[{t0,t1,a,b,ease}]`
(giữa 2 shot là cắt cứng), `K.flash(F,a,col)`, `K.speedLines(F,{k,n,r0,cx,cy,col})`, `K.panLines(F,{k,ang,n})`, `K.smoke(F,{x,y,z,t0,n,spread,rise,life,size,seed,swirl,tint,a})`,
`K.debris(F,{x,y,z,t0,n,speed,size,life,dir,cone,seed,col})`, `K.sparks`, `K.slash`, `K.ring`, `K.sfxText`, `K.letterbox`, `K.vignette`,
sprite `{..., white, smear:{dx,dy,dz,n}, aura:{col,k,preset}}`, `K.twos(t)`, `K.seg/lerp/clamp/hash`, `K.EASE.{lin,eio,eout,ein,eout3,ein3}`.
Phim 2D (kiểu `film-fin1.js` / `film-l2pro.js`: `shots:[{t0:0,t1:DUR,a:{}}]`, mỗi cảnh tự vẽ với `cam(g,cx,cy,z,rot)` riêng) dùng được hết phần
`impact / shake / screen / post` bên dưới; phần `shots` chỉ áp cho phim 2.5D.
**LÀM SẴN (9/11/2026):** `chaos-battle-lab/js/cine-cam.js` → `CineKit.cam.*` (playCineKit tự tải) — mục nào có dòng "→ đã có" thì GỌI HÀM, khỏi chép code mẫu.
Mục đánh dấu **CHƯA CÓ — việc chờ** = chưa có hàm, phải tự vẽ trong phim hoặc dựng thêm trong `js/vfx-gl.js` (xem cuối file).

Mẫu chung cho các mốc thời gian (dùng ở nhiều mục):
```js
const inAt=(t,list,d)=>list.some(a=>t>=a&&t<a+d);           // t có nằm trong [a, a+d) của mốc nào không
const hit=(t,a,amp,d)=>(t>=a&&t<a+d)?amp*(1-(t-a)/d):0;      // rung tắt dần (giống film-l2pro.js)
```

---

## 1. Khung ÂM BẢN 1 khung lúc va chạm / chuyển cảnh
→ đã có: `impact: CineKit.cam.negFrames([giây…], 0.07, 'inv', [đòn mạnh → 'red' rồi 'inv'])`.
Mục đích: đánh dấu cú va chạm / cắt máy bằng 1 khung đen-trắng đảo màu thay cho loé trắng. Mắt thấy "giật", não đọc là "trúng".
Nguồn: `clips/fight-1` 1:07.9, 1:08.9, 1:11.3, 1:12.0, 1:13.3, 1:14.0, 1:25.8, 1:26.5, 1:31.8, 1:37.4, 1:48.3, 1:49.0 (12 lần / 60s).
Nhịp: dài 1 khung vẽ = ~1/12s (0.06–0.08s). Dày nhất 1 cái / 0.5–1s, trung bình 1 cái / 5s. Hay đặt NGAY ĐẦU shot mới (khung đầu), hoặc khung cuối shot trước.
Hay đi cặp: `'inv'` rồi `'bw'` liền nhau (đảo → đen trắng tương phản) cho đòn mạnh nhất.
```js
const NEG=[T.hit1, T.hit2, T.cut3];                       // giây phim — đặt trùng mốc cắt / trúng đòn
impact:t=> inAt(t,NEG,0.07)?'inv' : inAt(t,BIG,0.07)?'red' : inAt(t,BIG.map(a=>a+0.07),0.07)?'inv' : 0,
shake:t=> Math.max(...NEG.map(a=>hit(t,a,10,0.4)), 0),
```

## 2. CO LẠI RỒI BÙNG (đếm ngược trước vụ nổ lớn)
→ đã có: bước c `C.implode(F,t,T.c)` · bước d `C.negFrames([T.c+0.3])` · bước e–f `C.birdToWorm(T.e,{tx,tz})` (máy).
Mục đích: cho khán giả "hít vào" trước khi nổ — năng lượng thu về 1 điểm rồi mới bung, nổ to gấp đôi cảm giác.
Nguồn: `clips/fight-1` 1:12.9–1:15.9 (Hollow Purple vào toà nhà).
Nhịp (tổng ~3s):
| bước | dài | nội dung |
|---|---|---|
| a | 0.4s | cầu sáng lao vào toà nhà, cửa sổ sáng màu nhấn |
| b | 0.3s | nổ bên trong (khối màu bung trong toà nhà) |
| c | 0.3s (3 khung) | NỀN ĐEN + 1 chấm trắng co nhỏ dần, vài tia mảnh tách ra |
| d | 1 khung | âm bản (`'inv'`) |
| e | 0.9s | GÓC CHIM: nổ lửa đỏ-cam + khói toon nâu cuộn lên |
| f | 0.9s | GÓC GIUN nhìn lên toà nhà, khói nâu cuộn — rồi vào khoảng thở (mục 10) |
```js
// c: nền đen + chấm co lại (vẽ trong screen)
screen(F,t){ const g=F.g, u=K.seg(t,T.c,T.c+0.3);
  if(t>=T.c&&t<T.c+0.3){ K.flash(F,1,'#000'); const r=K.lerp(40,4,K.EASE.ein(u));
    g.fillStyle='#fff'; g.beginPath(); g.arc(F.VW/2,F.VH/2,r,0,Math.PI*2); g.fill();
    K.speedLines(F,{k:0.6*u,n:14,r0:0.05,col:'rgba(255,255,255,0.9)'}); } },
impact:t=> (t>=T.c+0.3&&t<T.c+0.37)?'inv':0,
// e: nổ góc chim (2.5D: shot e có pitch 70–80) — khói toon nhuộm nâu + đá văng
world(F,t){ K.smoke(F,{x:0,z:0,y:0,t0:T.e,n:26,spread:260,rise:180,life:1.6,size:120,seed:7,swirl:0.6,tint:'150,95,55',a:1});
  K.debris(F,{x:0,z:0,y:40,t0:T.e,n:30,speed:520,size:14,life:1.4,seed:3}); },
post(F,t){ return {shocks:t>=T.e&&t<T.e+0.6?[{x:0,y:0,z:0,r:40+600*K.seg(t,T.e,T.e+0.6),w:40,str:26*(1-K.seg(t,T.e,T.e+0.6))}]:[]}; },
```
Lửa đỏ-cam đặc kiểu manga (khối có viền) → **đã có** `CineKitFx.blast(F,{x,y,z,t0,size:170})` (js/vfx-manga.js).

## 3. WIPE bằng MÀU / BÓNG / THÂN QUÁI / MẢNH VỠ (chuyển cảnh không cắt cứng)
→ đã có: `C.wipeBlob(F,t,a,0.2,col)` · `C.wipeLeaves(F,t,a,0.2,{col,dir})` (thân quái lướt: đổi col + d) — cả 2 che kín đúng a + d/2 = chỗ cắt máy.
Mục đích: nối 2 shot bằng 1 vật che kín khung trong 0.1–0.3s, vừa đổi cảnh vừa giữ đà.
Nguồn:
- Màu nhấn phủ kín 0.2s (vết loang tím tràn từ góc): `clips/fight-1` 1:04.5.
- Bóng lá cây quét chéo qua: `clips/fight-1` 1:43.4, 1:44.3 (mỗi lần 0.1–0.2s, cùng hướng).
- Thân quái / hàm răng lướt ngang che khung rồi lộ cảnh sau: `clips/kaiju-b` 1:18.3 (1.0s).
- Mảnh vỡ nổ tung che khung: `clips/kaiju-b` 1:12.2 (0.2s).
```js
// wipe màu: 1 vệt loang lớn tràn từ góc, đổi shot ở giữa (khi đã che kín)
function wipeBlob(F,t,a,d,col){ const u=K.seg(t,a,a+d); if(u<=0||u>=1) return; const g=F.g, R=Math.hypot(F.VW,F.VH);
  const k=u<0.5?K.EASE.eout(u*2):1-K.EASE.ein((u-0.5)*2);           // nở ra → co lại về góc đối diện
  const cx=u<0.5?0:F.VW, cy=u<0.5?F.VH:0; g.fillStyle=col; g.beginPath();
  for(let i=0;i<=24;i++){ const th=i/24*Math.PI*2, r=R*k*(0.85+0.15*Math.sin(th*5+t*20)); g.lineTo(cx+Math.cos(th)*r,cy+Math.sin(th)*r); } g.fill(); }
screen(F,t){ wipeBlob(F,t,T.w1-0.1,0.2,'#c018ff'); }                // cắt máy đúng T.w1 (giữa wipe)
// wipe mảnh vỡ: K.debris bắn THẲNG VỀ MÁY (dir/cone hướng về phía máy, size lớn) + cắt máy ở đỉnh
world(F,t){ K.debris(F,{x:0,y:60,z:-200,t0:T.w2-0.15,n:40,speed:900,size:60,life:0.4,dir:-90,cone:50,seed:9}); },
```
Bóng lá cây / thân quái lướt: dùng 1 ảnh tối (silhouette) vẽ trong `screen`, kéo ngang qua khung trong 0.2–1.0s; đổi shot khi ảnh che >90%.
Bóng lá đổ trên nền nâu (halftone) → **CHƯA CÓ** ảnh/hàm; tạm vẽ vài hình lá đen alpha 0.8 bằng path.

## 4. KẾT ẤN ĐỐI XỨNG + MẶT CHIA ĐÔI
→ đã có: máy `C.mirror(t0,{A,B,cam,flip})` · mặt chia đôi `panels: t=>C.splitFace(t,a,1.0,camA,camB)` + `C.splitTint(F,t,a,1.0)` trong screen.
Mục đích: 2 phe ra chiêu "soi gương" nhau → khán giả so sánh trực tiếp. Mỗi phe 1 MÀU riêng giữ suốt phim (Gojo xanh lam/tím, Sukuna đỏ).
Nguồn: `clips/fight-1` 1:43.6–1:45.2 (A kết ấn 0.7s: chữ thập ngắm đỏ → xoáy đỏ · wipe bóng lá 0.2s · B cùng bố cục, chữ thập tím → xoáy xanh 0.7s);
mặt chia đôi 1:24.0–1:25.0 (1.0s, nửa trái Sukuna nền đỏ, nửa phải Gojo nền xanh, vạch dọc giữa).
```js
// A và B: 2 shot cùng máy (cùng dist/pitch/ox), chỉ đổi nhân vật + màu. Giữa 2 shot: wipe bóng (mục 3).
shots:[ {t0:T.sA,t1:T.sA+0.7,a:{tx:0,ty:80,dist:260,pitch:5,ox:-0.12},b:{dist:230}},
        {t0:T.sB,t1:T.sB+0.7,a:{tx:0,ty:80,dist:260,pitch:5,ox:-0.12},b:{dist:230}} ],
// mặt chia đôi: 2 ô, mỗi ô 1 máy nhìn 1 nhân vật (clip = đa giác tỉ lệ 0–1)
panels:t=> (t>=T.split&&t<T.split+1.0) ? [
  {cam:{tx:X_SUKUNA,ty:150,dist:120,yaw:-8}, clip:[[0,0],[0.5,0],[0.5,1],[0,1]]},
  {cam:{tx:X_GOJO,  ty:150,dist:120,yaw: 8}, clip:[[0.5,0],[1,0],[1,1],[0.5,1]]} ] : null,
screen(F,t){ if(t>=T.split&&t<T.split+1.0){ const g=F.g; g.save(); g.globalCompositeOperation='multiply';
  g.fillStyle='rgba(255,60,50,0.35)'; g.fillRect(0,0,F.VW/2,F.VH); g.fillStyle='rgba(60,140,255,0.35)'; g.fillRect(F.VW/2,0,F.VW/2,F.VH); g.restore(); } },
```
Chữ thập ngắm (2 vạch + vòng tròn) vẽ được bằng path trong `screen`. XOÁY MÀU sau lưng → **đã có** `CineKitFx.swirl(F,t,{colA:'255,30,40',colB:'90,170,255'})` — vẽ TRƯỚC nhân vật.

## 5. MATCH CUT đổi màu mắt (cùng bố cục mặt)
→ đã có máy: `C.pushIn(t0,{d:1.6})` 2 lần cùng tham số (đổi mắt ở shot 2).
Mục đích: báo "đổi phe / thức tỉnh" mà không cần thoại — giữ nguyên bố cục, chỉ đổi màu điểm sáng.
Nguồn: `clips/fight-1` 1:20.8–1:24.0 — cận mặt mắt ĐỎ, máy đẩy vào rất chậm 1.6s (ánh sáng chớp liên tục) → nhoè 0.1s → cùng khung, mắt XANH 1.6s → mặt chia đôi (mục 4).
```js
shots:[ {t0:T.m,    t1:T.m+1.6, a:{tx:0,ty:160,dist:140}, b:{dist:120}, ease:'lin'},
        {t0:T.m+1.6,t1:T.m+3.2, a:{tx:0,ty:160,dist:140}, b:{dist:120}, ease:'lin'} ],   // shot 2 CÙNG máy, chỉ đổi mắt
world(F,t){ const eye=t<T.m+1.6?'255,40,40':'80,170,255';
  K.sprite(F,{img:F.I.face,x:0,z:0,h:260,aura:{col:eye,k:0}}); /* chấm mắt: vẽ 2 đốm glow màu eye ở toạ độ mắt */ },
screen(F,t){ if(Math.abs(t-(T.m+1.6))<0.05) K.flash(F,0.9,'#fff'); },   // nhoè/loé 1 khung che chỗ đổi
```
Chớp sáng nền liên tục (máy dò tách sai thành 6 cảnh) = `K.flash(F, 0.15*hash(Math.floor(t*12)), '#cfe4ff')`.

## 6. ĐƯỜNG HẦM TỐC ĐỘ khi bị đánh văng xa
→ đã có: `C.speedTunnel(F,t,a,0.8)` (zoom hậu kỳ vẫn tự thêm trong post nếu muốn).
Mục đích: nối "trúng đòn" với "bay ra toàn cảnh thành phố" — 0.8s tia toả tâm + trắng dần, rồi cắt sang toàn cảnh sáng.
Nguồn: `clips/fight-1` 1:28.8–1:29.6 (khung kính vỡ 0.5s trước đó → đường hầm 0.8s → toàn cảnh thành phố ban ngày 1.1s, toà nhà + người bay).
```js
screen(F,t){ const u=K.seg(t,T.tun,T.tun+0.8); if(t>=T.tun&&t<T.tun+0.8){
  K.flash(F,1,'#000');                                                     // nền tối
  K.speedLines(F,{k:0.6+0.4*u,n:90,r0:K.lerp(0.35,0.08,u),col:'rgba(255,255,255,0.9)'});
  K.flash(F,K.EASE.ein(u),'#fff'); } },                                     // trắng dần → cắt sang toàn cảnh ở T.tun+0.8
post(F,t){ return (t>=T.tun&&t<T.tun+0.8)?{zoom:{sx:F.VW/2,sy:F.VH/2,k:1+0.4*K.seg(t,T.tun,T.tun+0.8)},chroma:0.6}:null; },
```

## 7. TỈ LỆ NHẢY CỰC ĐOAN trong đánh tay đôi
→ đã có máy: `C.scaleJump(t0,{tx,ty,tz,steps})` (mặc định đúng chuỗi fight-1 G) · `C.orbit(t0,{cut:0.15})` · `C.chargeFollow` · ease `brake`.
Mục đích: combo cận chiến đọc rõ + có lực: xen RẤT XA (nhân vật nhỏ, nền trắng trống) với CỰC CẬN (nắm đấm che nửa khung).
Nguồn: `clips/fight-1` 1:55.2–2:00.0 (fan-animation đen trắng). Chuỗi: xa 0.2 → cận mặt 0.2 → rất xa 0.8 → đối thủ lao 0.3 → nắm đấm che khung 0.3
→ đá cận + tia tốc độ 0.2 → combo máy XOAY quanh 2 người 1.0 → vật 0.8 → đập xuống: SMEAR DỌC 0.5 → đất vỡ 0.3.
Nhịp: 0.2–0.6s/shot, shot "rất xa" là chỗ thở duy nhất (0.8s). Có 1 khoảng LẶNG tiếng ~0.1s ngay trước cú đá 1:57.3.
```js
shots:[ {t0:a,     t1:a+0.2, a:{tx:0,ty:80,dist:1400,pitch:8}},                 // rất xa
        {t0:a+0.2, t1:a+0.4, a:{tx:30,ty:150,dist:110,yaw:20}},                 // cận mặt
        {t0:a+0.4, t1:a+1.2, a:{tx:0,ty:60,dist:1800,pitch:4}},                 // rất xa, đứng yên
        {t0:a+1.2, t1:a+1.5, a:{tx:-40,ty:90,dist:70,fov:70},b:{dist:40}},      // nắm đấm lao vào máy (fov rộng = méo)
        {t0:a+1.7, t1:a+2.7, a:{tx:0,ty:90,dist:320,yaw:-60},b:{yaw:60},ease:'lin'} ],   // xoay quanh lúc combo
world(F,t){ K.sprite(F,{img:F.I.gojo,x:X(t),z:0,y:Y(t),h:100,smear:t>=T.slam&&t<T.slam+0.15?{dx:0,dy:120,dz:0,n:6}:null}); },
```
`smear` của sprite chỉ là bóng mờ lặp. SMEAR DỌC thật (ảnh kéo thành vệt sọc) → **đã có** `CineKitFx.smear(F,F.I.gojo,x,y,w,h,{dy:260})`.

## 8. BỘ BA GIỚI THIỆU QUÁI KHỔNG LỒ
→ đã có máy: `C.slideAlong(t0,{ty,ty1})` → `C.wormHold(t0+2.75)` → cận mặt người (shot thường) · kaiju-b: `C.pushIn(t0,{d:2.9})`.
Mục đích: cho thấy quái TO + đáng sợ trong 5–6s, không cần hiệu ứng.
Nguồn A — `clips/kaiju-a` (Avengers): cực cận lướt dọc thân 2.75s → toàn cảnh GÓC GIUN, 2 toà nhà kẹp 2 mép, quái nhỏ trên trời, ĐỨNG YÊN 2.0s → cận mặt người ngước 0.25s+.
Nguồn B — `clips/kaiju-b` (Cửu Vĩ): cận mặt + MẮT BẬT SÁNG 1.5s → toàn cảnh giữa 2 dãy nhà, trăng sau lưng, đẩy vào rất chậm 2.9s → dân chạy ở tiền cảnh 0.3s.
```js
shots:[ {t0:0,   t1:2.75, a:{tx:0,ty:300,tz:0,dist:160,pitch:-25,roll:-8}, b:{ty:700}, ease:'lin'},   // lướt dọc thân (đổi ty)
        {t0:2.75,t1:4.75, a:{tx:0,ty:40,tz:-900,dist:200,pitch:-38,fov:62}},                          // góc giun, đứng yên, toà nhà 2 mép
        {t0:4.75,t1:5.5,  a:{tx:HERO_X,ty:110,dist:130,pitch:-10}} ],                                 // cận mặt người ngước
world(F,t){ K.sprite(F,{img:F.I.monster,x:0,z:600,y:250,h:900,shadow:false}); /* + toà nhà 2 bên */ },
screen(F,t){ if(t<2.75) K.flash(F,0.25,'#fff'); K.vignette(F,0.6); },   // ngược sáng: khối tối + viền sáng
```
Mắt bật sáng (B): sprite quái + 2 đốm glow đỏ hiện ở giây 0.7 của shot, `a` tăng trong 0.1s.
Ngược sáng thật (quái thành khối tối có viền sáng) → **đã có** `CineKitFx.rimLight(F,F.I.friend,x,y,w,h,{col:'255,60,40'})` (bỏ `dir` = sáng bao quanh, `dir:-90` = sáng từ trên).

## 9. TĨNH TRƯỚC PHÁ + KẾT BẰNG HẬU QUẢ
→ máy: shot thường (đứng yên, cùng tham số 2 shot); hậu quả `C.wormHold`/shot đứng yên 2.8s.
Mục đích: cho thấy vật còn nguyên trong 1 nhịp ngắn → khán giả kịp "thương" nó → phá. Kết đoạn phá huỷ bằng shot hậu quả đứng yên dài để lắng.
Nguồn: `clips/kaiju-b` 1:16.3 (tháp canh đứng trước trăng tròn, đứng yên 0.4s) → 1:16.7 đuôi quét qua, tháp gãy 1.1s (cùng máy) … 1:20.2–1:23.0 đống đổ nát, người nhỏ li ti, đứng yên 2.8s.
```js
shots:[ {t0:T.still,     t1:T.still+0.4, a:{tx:TOWER_X,ty:200,dist:500,pitch:-20}},       // đứng yên
        {t0:T.still+0.4, t1:T.still+1.5, a:{tx:TOWER_X,ty:200,dist:500,pitch:-20}},       // CÙNG máy — chỉ có đuôi quét + gãy
        {t0:T.after,     t1:T.after+2.8, a:{tx:0,ty:60,dist:1200,pitch:25}} ],            // hậu quả, đứng yên
world(F,t){ K.debris(F,{x:TOWER_X,y:300,z:0,t0:T.still+0.55,n:36,speed:600,size:18,life:1.2,dir:0,cone:120,seed:4}); },
shake:t=>hit(t,T.still+0.55,9,0.6),
```

## 10. KHOẢNG THỞ sau vụ nổ lớn
→ đã có: `C.restBeat(F,t,a,1.5)` (nền nâu + bóng lá + viền tối; halftone vẫn chưa có).
Mục đích: sau đỉnh cao trào phải có 1.4–1.6s TĨNH, tông trầm, không nhân vật rõ mặt → reset mắt người xem trước đoạn mới.
Nguồn: `clips/fight-1` 1:15.9–1:17.3 (sau nổ Hollow Purple) và 1:38.2–1:39.7 (sau nổ đỏ): nền nâu sẫm + bóng lá cây đung đưa chậm, hạt halftone.
Đoạn sau mở bằng shot đứng yên, nhân vật bình thản (giơ ngón cái / đứng nhìn) — tương phản với nổ.
```js
screen(F,t){ if(t>=T.rest&&t<T.rest+1.5){ const g=F.g; K.flash(F,1,'#3a2a1e');
  g.fillStyle='rgba(15,10,6,0.75)'; for(let i=0;i<7;i++){ const s=i*13, x=F.VW*K.hash(s)+Math.sin(t*1.3+i)*14, y=F.VH*K.hash(s+1);
    g.beginPath(); g.ellipse(x,y,90+60*K.hash(s+2),22,K.hash(s+3)*3,0,Math.PI*2); g.fill(); }   // bóng lá
  K.vignette(F,0.7); } },
```
Lớp halftone → **đã có** `CineKitFx.halftone(F,{mode:'luma',dot:5,paper:'#f4f1ea'})`; đen trắng giữ 1 màu nhấn → `CineKitFx.mangaBW(F,{keep:'#2878ff'})` (gọi CUỐI `def.screen`).

---

## Hiệu ứng manga — `CineKitFx` (repo game `js/vfx-manga.js`, Ver 526, canvas 2D, chạy cả PC / Mac / xuất video offline)
Trong file phim dùng `window.CineKitFx` (`CineKit.fx` gắn chậm ~20ms). Gọi trong `def.screen`; toạ độ = đơn vị logic của phim.
| hàm | dùng ở mục | ms/khung 1280×720 (CPU, chậm nhất) |
|---|---|---|
| `smear(F,img,x,y,w,h,{dx,dy,n,streak,lines})` — vệt nhoè sọc khi đập / lao | 7 | 9.6 |
| `swirl(F,t,{cx,cy,r,colA,colB,colC,arms,speed})` — xoáy màu kết ấn / lãnh địa | 4 | 11.8 |
| `halftone(F,{mode:'flat' hoặc 'luma',dot,col,paper})` — chấm manga | 2, 10 | 9.6–14.3 |
| `mangaBW(F,{keep,tol,scale})` — đen trắng, giữ 1 màu nhấn | 4 (C1/C3 fight-1) | 21.9 (`scale:0.25` → 16.5) |
| `blast(F,{x,y,z,t0,life,size})` — lửa nổ khối đặc viền đen → khói nâu | 2 | 0.7 |
| `rimLight(F,img,x,y,w,h,{col,dir,dark})` — quái ngược sáng | 8 | 11.2 |
Chưa đo trên GPU thật; `mangaBW` nặng nhất → chỉ bật trong shot cần.
