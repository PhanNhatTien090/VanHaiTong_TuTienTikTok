# SỔ TAY VÂN HẢI TÔNG

File này là trí nhớ chung của dự án. `/batdau` chỉ đọc file này. `/ketthuc` cập nhật mục 5 và 6.
Dòng "Cập nhật" ở dưới do `/ketthuc` ghi lại.

Cập nhật: 07/11/2026.

---

## 1. Game là gì

Game tu tiên tương tác cho **TikTok LIVE**. Người xem gõ lệnh, thả tim, tặng quà thì nhân vật của họ tu luyện, đột phá cảnh giới, đánh yêu thú, tham gia sự kiện. Cảnh game là một trang web, đưa vào TikTok LIVE Studio bằng nguồn Link. Sự kiện TikTok lấy qua **TikFinity**. Có tông sư đọc lời bằng giọng AI (VieNeu, giọng "Thiền Tâm Đức").

Có thêm **bản web** cho người chơi vào bằng điện thoại, dùng chung nhân vật với LIVE.

- Công nghệ: Node.js (ES modules), Canvas trên trình duyệt, WebSocket, ảnh PNG. Không có bước build cho frontend: sửa file trong `public/` là trang tự nạp lại (ETag).
- Codex làm đầu tiên (31/10/2026), sau đó Claude và Codex cùng làm. Có Git (`.git` ẩn).
- Tông chủ trong game: `hackermutrang000`.

## 2. Thư mục và cách chạy

**Thư mục game:** `C:\Users\Admins\.codex\visualizations\2026\10\31\01a18f7c-ea76-71b3-b2f6-4615155b3497\tien-gioi-live`
Dự định chuyển sang `C:\GAME\VanHaiTong`. Chưa chuyển vì phải tắt server, chỉ làm khi user không LIVE. Khi chuyển xong thì sửa dòng này.

| Việc | Cách làm |
|---|---|
| Trang điều hành | `http://127.0.0.1:4317/?world=live` — tab `#scene` (sân khấu), `#events` (sự kiện) |
| Nguồn LIVE Studio | `http://127.0.0.1:4317/?overlay=1&world=live&stage=world&sound=1&voice=1&idle=1&quality=auto#tiktok.studio` |
| Xem thử đột phá | `/ascension-preview.html?realm=N`, `/cinema-preview.html?realm=8&autoplay=1` |
| Bản web | cổng 4320, chạy chung tiến trình khi có file cờ `data/web-enabled` |
| Kiểm tra server sống | `GET /api/state?world=live` (có `players`, `sectQi`); trạng thái watchdog: `data/watchdog-status.json` |
| Bật giám sát | `BAT-GIAM-SAT-SERVER.cmd` → `scripts/start-watchdog.ps1` → `scripts/server-watchdog.mjs` (chạy ẩn, tự bật lại server) |
| Khởi động lại backend an toàn | dùng script `scripts/restart-*.ps1` (mẫu: `restart-claude-merge.ps1`): tạm dừng watchdog, giữ quà đang đến, xuất dữ liệu rồi mới tắt |
| Test | `node --test --test-concurrency=2 test/*.test.mjs` (lần gần nhất 476/476 đạt), `npm run check`, web: `npm run test:web` |
| Link web công khai | `MO-LINK-WEB.cmd` / `TAT-LINK-WEB.cmd` (Cloudflare Quick Tunnel, link đổi mỗi lần mở) |

Tiến trình khi đang chạy: `server.mjs` (node), `scripts/server-watchdog.mjs` (node), `scripts/vieneu_worker.py` (python; venv ở `C:\WorkSpace\TIKTOK\tools\vieneu`).

## 3. Bản đồ file quan trọng

**Backend (gốc dự án)**
- `server.mjs` — HTTP + WebSocket, nối TikFinity, API `/api/state`, `/api/export`.
- `engine.mjs` (~110 KB) — luật chơi chính: người chơi, tu luyện, cảnh giới, quà, lệnh.
- `speech.mjs`, `speech-lines.mjs` — lời tông sư; xưng hô trong `announcement()`.
- `engagement.mjs` — câu đố, lì xì, nhiệm vụ, nhịp sự kiện nhỏ (`nextSmallAt`).
- `event-pacing.mjs` — khoảng nghỉ giữa sự kiện lớn.
- `social-events.mjs`, `bond-festival.mjs`, `lantern-festival.mjs`, `sword-race.mjs`, `spirit-pets.mjs`, `companions.mjs`, `heart-events.mjs` — từng loại sự kiện.
- `daily-practice.mjs` (hạn mức tu luyện ngày; thưởng sự kiện nguồn `'reward'` được miễn), `rebirth.mjs`, `opportunity-progress.mjs`, `master-rewards.mjs` (Tông chủ ≥2.000 coin), `talk.mjs` (lọc trò chuyện).
- `data/` — dữ liệu thật: `live.json`, `demo.json`, `web/accounts.json`, log. **Không sửa tay.**

**Frontend (`public/`)**
- `index.html` — trang điều hành + overlay; `app.js` (luồng chính, lịch NPC đột phá), `scene.js` (vẽ sân khấu), `stage.js` (24 ghế), `motion.js`, `performance.js`, `crowd-policy.js` (giảm đồ họa khi đông).
- `social-ui.js` — tab Sự kiện.
- `heaven-strike.js`, `heaven-strike-audio.js` — Thiên Đạo giáng lôi (hình + âm tự tổng hợp). Server: `heavenStrike()` trong `engine.mjs`, `POST /api/heaven-strike`; khung điều khiển `renderHeavenPanel()` trong `app.js`. QA: `scripts/qa-heaven-strike.mjs` (server thử cổng 4399), `scripts/render-heaven-strike.mjs`.
- Chống tự thả tim: `heartGate()`/`HEART_GATE` trong `engine.mjs`, bật bằng `settings.heartGate` (server tự bật cho LIVE). `voice.js` (`VOICE_RATE`), `audio.js`, `impact-audio.js`.
- Đột phá theo cảnh giới: lớp chung `qi-impact.js` (`setFxPalette`, `qiRemap`, `pushFxCamera`); từng cảnh giới `*-awakening.js`, `*-formation.js`, `*-audio.js`, `*-timeline.js` (luyen-khi, truc-co, kim-dan, nguyen-anh, hoa-than, chan-tien…). `ascension-stage.js` (thiên đài), `ritual-appearance.js` (biến thể mỗi lần đột phá).
- Ảnh: `public/assets/` (`divine-war-v1` = thần trang 14 cảnh giới nam/nữ, `realm-skins-v2`, `chan-tien-cinema-v2`, `worlds-v2`…). Danh mục: `public/assets/CHARACTERS.md`.
- Chú ý: file awakening cảnh giới ≥3 dùng xuống dòng CRLF.

**Khác**
- `web/` — bản web (README.md, HOSTING.md, `server.mjs`, `game-view.mjs`, `dungeon.mjs`…).
- `test/` — test Node. `scripts/` — QA (`qa-*.mjs`), render xem thử, restart. `render-*.mjs` ở gốc — xuất ảnh/clip review vào `output/`.
- Ghi chú theo chủ đề: các file `*.md` viết hoa ở gốc (vd. `LIVE-LATENCY-CROWD-2026-11-06.md`). **README chỉ ghi tới v18, code đã đi xa hơn nhiều; tin code và ghi chú mới hơn README.**
- `skills/van-hai-dot-pha/SKILL.md` — skill cho Codex về đột phá.

## 4. Quy tắc user đã chốt (đọc kỹ)

- Trả lời tiếng Việt, ngắn gọn. Làm thật, tự xem hình/chuyển động; **test đạt không có nghĩa là đẹp**.
- **Đang LIVE thì không tự restart server.** Sửa frontend thì trang tự nạp lại. Restart backend chỉ bằng script restart an toàn; chỉ kill `server.mjs` khi watchdog đang chạy, không mở thêm `start.cmd`.
- Không sửa giá quà, dữ liệu người chơi, lịch sự kiện khi không được yêu cầu.
- **Không hiệu ứng toàn màn hình nào lặp y hệt**: mọi cảnh lặp phải có biến thể và giãn cách. TikTok đã khóa quà 3 lần vì "reproduced content". Màn đột phá toàn cảnh tối đa 1 lần / 60 giây.
- Giữ nguyên model nhân vật và quái có sẵn; animation làm từ ảnh gốc. Không tự vẽ nhân vật/quái mới. Hỏi trước khi tạo nội dung hình ảnh lớn.
- Giọng: VieNeu "Thiền Tâm Đức" là giọng chính (edge-tts NamMinh chỉ dự phòng). Tông sư xưng "lão phu". Gọi "sư huynh/sư tỷ" theo giới tính người chơi tự khai, chưa khai thì "đạo hữu".
- Đồ họa LIVE luôn 1080 px, cánh luôn hiện; đông người chỉ bớt nền. Chữ tên không thu nhỏ (bị mờ).
- Thay đổi lớn: lên kế hoạch chi tiết trước, tính trường hợp vài trăm người cùng lúc.
- Đột phá: cảnh giới càng cao càng hoành tráng, có nhịp nguyên nhân → chuyển hóa → cao trào → biến hình. Làm từng cảnh giới cho chỉn chu.
- Bản web: mobile-first (~390 px), là game thật (joystick, nút chiêu), người LIVE không thấy hành động trên web.
- Không chạy lại lịch/heartbeat cũ (Thần Đế/Vương Lâm 03/11) từ lịch sử chat.

## 5. Trạng thái hiện tại

- Server LIVE chạy ổn, watchdog "healthy" (PID server 13376, khởi động lại lúc 07/11 01:12 — không phải Claude làm, có thể Codex/watchdog). Bản này **đã có Thiên Đạo** nhưng **chưa có chống tự thả tim** (sửa lúc 09:48) → cần restart an toàn: `scripts/restart-heaven-strike.ps1` khi user cho phép.
- Commit mới nhất vẫn `5ab9b65`. Rất nhiều thay đổi chưa commit, lẫn của Claude và Codex (Codex đang làm song song: đếm tim top ngày/tuần, chuyển LIVE↔web, workflow deploy Cloudfly, AGENTS.md, âm/hình Đại Thừa, Luyện Hư…). Claude phiên 07/11 đổi: `engine.mjs`, `daily-practice.mjs`, `server.mjs`, `speech-lines.mjs`, `public/{app.js,scene.js,presentation.js,voice.js,index.html,clean-hud.css}`, file mới `public/heaven-strike*.js`, test `heaven-strike`, `heart-gate`, sửa `daily-practice`/`unified-progress` test.
- Chờ user: nghe thử âm thanh Thiên Đạo trên LIVE (Claude không nghe được); duyệt skin thần v3 (`output/realm-skins-v3`); Chân Tiên cinematic v3 (`BAN-GIAO-CHAT-MOI-2026-11-04.md`).
- Việc chờ: chuyển dự án sang `C:\GAME\VanHaiTong` khi không LIVE.

## 6. Nhật ký phiên (mới nhất ở trên, giữ tối đa 8 phiên; phiên cũ hơn chuyển sang `NHAT-KY-CU.md`)

### 07/11/2026 — Hạn mức ngày, Thiên Đạo giáng lôi, chống tự thả tim
- Sửa hạn mức tu luyện ngày: thưởng sự kiện (điểm danh chuỗi, lì xì, câu đố, nhiệm vụ, kiến tạo tông) không trừ hạn mức — trước đó điểm danh 7 ngày của Nam nguyễn (Thần Tổ, 83 triệu tu vi) ăn 1.635/2.025 điểm. Restart an toàn (`scripts/restart-checkin-exempt.ps1`), trả 1.635 điểm cho Nam nguyễn (user đồng ý).
- Thiên Đạo (tab Sự kiện): chọn người/ngẫu nhiên, bấm 2 lần → trừ 20% tu vi hiện có, choáng 5 phút (chặn vận công/hái/đánh/đan/đột phá, tim không ra tu vi, quà vẫn nhận), hồi 60 s. Hiệu ứng ~7,6 s, biến thể theo seed (4 màu lôi, 1–3 đạo, 5 tiêu đề); giọng "Thiên kiếp giáng xuống tông môn…" 4×4 câu; dấu choáng trên đầu.
- Chống tự thả tim (chung cho mọi người, ngầm, không thông báo): điểm sự kiện từ tim ≤ ~2 tim/s (dồn 120); thả liên tục >1,5 tim/s (~5 phút) → tim tụ linh hồi 30 s thay vì 10 s. Dựa trên số liệu tối 06/11 (Anh Đức 12.649 tim/90 phút).
- Đã kiểm tra: 493/493 test, `npm run check`; tự xem khung hình Thiên Đạo (render + Chrome headless trên server thử cổng 4399), đo âm thanh offline (không vỡ tiếng). Chưa kiểm tra: nghe âm thanh thật; dấu tiếng Việt khi chụp headless bị tách (chữ tên sẵn có cũng vậy — nghi do font máy headless).
- Tiếp theo: restart để bật chống tự thả tim; user nghe/duyệt Thiên Đạo; theo dõi người dùng tool sau khi bật.

### 06/11/2026 — Dựng sổ tay
- Tìm ra thư mục game, lập SO-TAY.md và lệnh `/batdau`, `/ketthuc`.
- Chưa chuyển thư mục (user đang LIVE).
- Tiếp theo: chuyển sang `C:\GAME\VanHaiTong` khi user báo.
