# Đột phá thành VIDEO — ý tưởng + kế hoạch (22/11/2026, Claude)

## Ý tưởng của user
Quay sẵn màn đột phá từng cảnh giới thành video; khi ai đột phá thì phát video cảnh giới đó, chèn **tên + avatar** lên trên.
Mục tiêu: hết lag, hết lệch âm (âm nằm trong video). Chống "reproduced content" của TikTok bằng biến thể mỗi lần chiếu.

## Đã chốt trong phiên 22/11
- **Không dùng AI gen video** (Veo/Kling…) — chưa có kinh phí (ước $300–500+ cho 28 cảnh giới). Ghi lại để sau: Veo 3.1 có âm sẵn, 8 s/đoạn, dùng ảnh skin làm khung đầu/cuối, chia 3–4 cảnh cắt kiểu phim.
- **Làm bây giờ: quay CHÍNH hiệu ứng hiện tại thành video** (giữ y hình + âm).
- Lúc đột phá ai cũng mặc trang phục cảnh giới mặc định (`defaultRitualLook` trong `public/live-cinema.js`, chủ game chốt 15/11) → mỗi cảnh giới chỉ cần bản **nam + nữ**.
- Máy LIVE: **Ryzen 7 5800H + Radeon Vega 8 (iGPU)** — CPU khỏe, GPU yếu. Giải mã H.264/VP9 do khối VCN 2.0 riêng làm, không ăn khối vẽ 3D → video giảm tải đúng phần yếu. **Không dùng AV1** (Vega 8 không giải mã phần cứng). Không dùng video nền trong suốt (VP9 alpha hay rơi về CPU).
- Biến thể chống lặp: nướng sẵn vào video (render nhiều bản với id biến thể khác → `ritualAppearance`/`qiVariant` tự đổi màu, lật, thời tiết, cao độ âm). Lúc chạy chỉ thêm lớp rẻ: lật trái–phải, 1 khung viền PNG, tên + avatar. KHÔNG lọc màu CSS / nhiễu phim / blur full màn khi chạy (ăn GPU).

## Đã làm
- `scripts/render-breakthrough-video.mjs <realm> <nam|nu> <variantId> <out.mp4>` — Chrome ẩn mở `ascension-preview.html?capture=1` trên server 4317 (chỉ đọc file tĩnh, không đụng LIVE), **đồng hồ giả** (performance.now + rAF do script bước 1/30 s) → chụp từng khung JPEG → ffmpeg H.264 CRF 21; âm dựng bằng đúng `CultivationAudio.scheduleRitual` trong OfflineAudioContext (có lớp biến thể theo id) → AAC, ghép. Ẩn `.ritual-hud` (tên + cảnh giới để overlay vẽ DOM lên trên).
- Thử Kim Đan nam (`v1`): 11,8 s + 0,5 s đuôi, 369 khung, **render 37 s**, 8 MB, đỉnh âm 0,73, 0 lỗi JS. Ảnh từng khúc khớp bản đang chạy (đan lô → kim đan → nổ → đổi trang phục tím).
- `onRitualSound` = 0 tiếng là ĐÚNG: trên LIVE `onRitualAudio` có gán nên scene không gọi tiếng một phát (chỉ chạy khi không có onRitualAudio, realm 14–21).

## Việc còn lại (theo thứ tự)
1. **Kiểm LIVE Studio phát được codec nào**: thêm vào `diag` của `/api/client-status` kết quả `video.canPlayType('video/mp4; codecs="avc1.640028"')` và VP9 webm. Nếu không có H.264 → xuất VP9/WebM.
2. Nghe/xem video thử (mở file mp4) — chưa nghe bằng tai. Cân CRF (8 MB/12 s khá nặng; thử CRF 24–26, có thể 30 fps giữ nguyên).
3. **Trình phát trên overlay** (`public/live-cinema.js` / `scene.js` dòng 683 nhánh ritual):
   - Có video cho (realm, giới tính) → phát `<video>` DOM phủ canvas (hoặc drawImage vào canvas), **scene ngừng vẽ cảnh nghi thức** cho nhẹ GPU; thiếu/lỗi video → chạy code cũ (dự phòng).
   - Server tĩnh **không hỗ trợ Range** và mime chưa có `.mp4` (`server.mjs` dòng ~164) → hoặc thêm mime + Range (phải restart an toàn), hoặc `fetch` → blob URL (không cần Range, nạp sẵn ~10 MB).
   - Âm video đi qua WebAudio (`createMediaElementSource`) để vẫn hạ nhạc nền (duck theo `*MusicDuck`), bù `ritualAudioLead`; tắt `audio.ritual` dựng âm khi đang phát video.
   - Nạp trước video khi có người sắp đột phá (dùng chỗ gọi `prerenderRitual`).
   - HUD: tên + cảnh giới DOM sẵn có (`mountRitualHud`) + thêm avatar TikTok; khung Luân Hồi (`drawLuanHoiRitualFrame`) vẽ đè cho người đã chuyển sinh.
   - Chọn bản biến thể ngẫu nhiên, né bản vừa chiếu; lật ngẫu nhiên; khung viền ngẫu nhiên.
4. Render hàng loạt: cảnh giới thấp (xảy ra nhiều) 3–6 bản × nam/nữ, cảnh giới cao 1–2 bản. Ước dung lượng 1–2 GB → để ngoài Git (vd. `public/assets/breakthrough-video/` + `.gitignore`, hoặc thư mục data) — quyết lúc làm.
5. Đo trên máy LIVE: Task Manager "3D" vs "Video Decode" + FPS overlay (`/api/client-status`) bản cũ vs video. Có số mới làm hết 28 cảnh giới.
6. Lưu ý: cảnh giới thay đổi code đột phá sau này thì phải render lại video tương ứng.
