# SỔ TAY VÂN HẢI TÔNG

File này là trí nhớ chung của dự án. `/batdau` chỉ đọc file này. `/ketthuc` cập nhật mục 5 và 6.
Dòng "Cập nhật" ở dưới do `/ketthuc` ghi lại.

Cập nhật: 10/11/2026.

---

## 1. Game là gì

Game tu tiên tương tác cho **TikTok LIVE**. Người xem gõ lệnh, thả tim, tặng quà thì nhân vật của họ tu luyện, đột phá cảnh giới, đánh yêu thú, tham gia sự kiện. Cảnh game là một trang web, đưa vào TikTok LIVE Studio bằng nguồn Link. Sự kiện TikTok lấy qua **TikFinity**. Có tông sư đọc lời bằng giọng AI (VieNeu, giọng "Thiền Tâm Đức").

Có thêm **bản web** cho người chơi vào bằng điện thoại, dùng chung nhân vật với LIVE.

- Công nghệ: Node.js (ES modules), Canvas trên trình duyệt, WebSocket, ảnh PNG. Không có bước build cho frontend: sửa file trong `public/` là trang quản lý tự nạp lại (ETag). **Overlay LIVE (`sound=1`) KHÔNG tự nạp** — user phải làm mới nguồn Link trong LIVE Studio.
- Codex làm đầu tiên (31/10/2026), sau đó Claude và Codex cùng làm. Có Git (`.git` ẩn).
- Tông chủ trong game: `hackermutrang000`.

## 2. Thư mục và cách chạy

**Thư mục game:** `C:\Users\Admins\.codex\visualizations\2026\10\31\01a18f7c-ea76-71b3-b2f6-4615155b3497\tien-gioi-live`
Dự định chuyển sang `C:\GAME\VanHaiTong`. Chưa chuyển vì phải tắt server, chỉ làm khi user không LIVE. Khi chuyển xong thì sửa dòng này.

| Việc | Cách làm |
|---|---|
| Bật LIVE 1 chạm | `BAT-LIVE.cmd` (lối tắt Desktop "Bat LIVE Van Hai Tong"): bật server/sync nếu tắt, chép link overlay, mở trang quản lý |
| Trang điều hành | `http://127.0.0.1:4317/?world=live` — tab `#scene` (sân khấu), `#events` (sự kiện) |
| Nguồn LIVE Studio | `http://127.0.0.1:4317/?overlay=1&world=live&stage=world&sound=1&voice=1&idle=1&quality=auto#tiktok.studio` |
| Xem thử đột phá | `/ascension-preview.html?realm=N`, `/cinema-preview.html?realm=8&autoplay=1` |
| Bản web (thật) | **https://vanhaitong.duckdns.org** — VPS CloudFly `103.82.26.70` (root, khóa `~/.ssh/vanhai-admin.pem`, known_hosts riêng `~/.ssh/vanhai-cloudfly-known_hosts`). Service `van-hai-web` (127.0.0.1:4320, data `/var/lib/van-hai-web`, env `/etc/van-hai-web.env`: `WEB_CLOUD_GAMEPLAY=1`, `WEB_CLOUD_TRIAL=1`). VPS dùng thử tới 09/11 23:59 |
| Deploy web | push **tag `prod-*` mới** trỏ commit có workflow (`.github/workflows/deploy-production.yml`); kiểm `/deploy-version.json`, `/healthz`, `/api/site-status` |
| Đồng bộ LIVE ↔ web | agent `web/cloud/agent.mjs` chạy trên máy này (config riêng `data/web-cloud-agent.json`, không lên Git); `start-watchdog.ps1` tự nạp secret + bật agent. Xem log: `XEM-LOG-WEB.cmd` → `data/web-logs/` |
| Bản web local cũ | cổng 4320 local (cờ `data/web-enabled`) — hiện tắt, không dùng nữa |
| Kiểm tra server sống | `GET /api/state?world=live` (có `players`, `sectQi`); trạng thái watchdog: `data/watchdog-status.json`; độ bận server `GET /api/perf`; FPS/lag overlay thật trong LIVE Studio: `GET /api/client-status?world=live` (trường `fps`, `frameMs`, `diag`) |
| Bật giám sát | `BAT-GIAM-SAT-SERVER.cmd` → `scripts/start-watchdog.ps1` → `scripts/server-watchdog.mjs` (chạy ẩn, tự bật lại server) |
| Khởi động lại backend an toàn | dùng script `scripts/restart-*.ps1` (mẫu: `restart-claude-merge.ps1`): tạm dừng watchdog, giữ quà đang đến, xuất dữ liệu rồi mới tắt |
| Test | `node --test --test-concurrency=2 test/*.test.mjs` (lần gần nhất 581/581 đạt, 09/11 tối), `npm run check`, web: `npm run test:web` |
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
- `daily-practice.mjs` (hạn mức tu luyện ngày; thưởng sự kiện nguồn `'reward'` được miễn), `rebirth.mjs`, `opportunity-progress.mjs`, `master-rewards.mjs` (Tông chủ = tặng MỘT món ≥2.000 coin, người tặng gần nhất ngồi ghế; cờ `sectMasterGiftAt`), `talk.mjs` (lọc trò chuyện).
- Hiệu năng server (08/11): `snapshot(w,now,{select})` chỉ dựng hồ sơ sẽ gửi; lưu 3 s ghi đĩa nền (`saveGen`), lưu bắt buộc vẫn đồng bộ; quà TikFinity `broadcast(true)` gửi ngay. Dọn hồ sơ: `scripts/prune-inactive.mjs <file> [ngày] [--dry] [--realm0]` (chỉ khi server tắt — dùng `restart-prune-*.ps1`).
- `data/` — dữ liệu thật: `live.json`, `demo.json`, `web/accounts.json`, log. **Không sửa tay.**

**Frontend (`public/`)**
- `index.html` — trang điều hành + overlay; `app.js` (luồng chính, lịch NPC đột phá), `scene.js` (vẽ sân khấu), `stage.js` (24 ghế), `motion.js`, `performance.js`, `crowd-policy.js` (giảm đồ họa khi đông).
- `social-ui.js` — tab Sự kiện. `social-stage.js` — vị trí đấu thủ tỷ thí (`TOURNAMENT_FLOOR=.78` khớp nền `maps-v3/tournament-arena.png`).
- `live-diag.js` — bộ đo lag trong overlay (nhịp rAF thật, long animation frames + script gây chặn), gửi kèm client-status. Chỉ đo.
- `heaven-strike.js`, `heaven-strike-audio.js` — Thiên Đạo giáng lôi (hình + âm tự tổng hợp). Server: `heavenStrike()` trong `engine.mjs`, `POST /api/heaven-strike`; khung điều khiển `renderHeavenPanel()` trong `app.js`. QA: `scripts/qa-heaven-strike.mjs` (server thử cổng 4399), `scripts/render-heaven-strike.mjs`.
- Chống tự thả tim: `heartGate()`/`HEART_GATE` trong `engine.mjs`, bật bằng `settings.heartGate` (server tự bật cho LIVE).
- Hàng hiệu ứng LIVE: `public/presentation.js` (ưu tiên; quà = 8), `enqueueReady`/`playNext`/`giftMayPreempt` trong `app.js`; hàng giọng `public/voice.js` (`fastVoiceFile` = câu dự phòng), TTS 1 câu/lúc trong `speech.mjs`.
- `sect-war.mjs` + `public/sect-war.js` — Chính Ma Đại Chiến; bản đồ ngang "Vạn Lý Chiến Đạo" ở `public/war-road.js` (±1.000 trượng, 20 trượng/điểm, mỗi quà đẩy N trượng).
- Quà: `giftEventRule()` trong `engine.mjs` (đang có sự kiện thì chỉ áp luật sự kiện), `giftJackpot()` (≥500 coin lúc không sự kiện = Đại lễ). Thẻ luật quà góc phải: `public/gift-rule-card.js` (ảnh quà → kết quả theo sự kiện). Ảnh quà thật: `public/gift-icons.js` + `public/assets/gifts/` (giftArt khóa `tên|giá`). Giọng ghép tên + câu dựng sẵn: `voice-parts.mjs` (quà, Chính–Ma, Tông chủ ban), `/api/voice-part`. QA: `scripts/qa-gift-first.mjs`, `scripts/qa-ceremony.mjs`. `voice.js` (`VOICE_RATE`), `audio.js`, `impact-audio.js`.
- Top ngày/tuần (chỉ trang quản lý `#scene`): `period-tops.mjs` (mốc bộ đếm theo kỳ, giờ VN, tuần từ thứ Hai; lưu `w.periodStats`, không gửi xuống overlay), API `GET /api/period-tops?world=live`, giao diện `public/period-tops.js/.css`. 6 mục: tu vi, quà, tim (`p.heartsTotal`), câu đố (`p.quizSolved`), tỷ thí (huy chương), skin mới.
- Pháp bảo ↔ linh thú thay phiên 7,5 phút: `public/follower-turn.js` (`relicTurn`, `petTurn`, `relicBob`). Thưởng sự kiện: `EVENT_GEAR_SHARE` trong `engine.mjs`, `ALC.reward`/`alchemyGiftMult` trong `alchemy.mjs`. Cánh theo tổng coin: `WING_TIERS` trong `public/boss-arena.js` (cao nhất 2.000).
- Linh thú: `public/spirit-pets.js` (`SPIRIT_PETS` 5 con thường + `RARE_PETS` thần thú hiếm Lôi Oa/Văn Thú/Kỳ Lân 200 coin, `ALL_PETS`), `spirit-pets.mjs` (mỗi lượt Linh Thú Cốc chọn ngẫu nhiên 1 thần thú có ảnh, `w.petEvent.featured`), `spirit-pet-art.js` (`drawRareFx`: sét/huyết khí/lửa), `pet-cove.js`, `pet-arrival-fx.js`. Ảnh `public/assets/spirit-pets-v1/*.png` (3 ô, Codex image_gen; prompt trong `prompts.json`).
- Skin phi kiếm: `public/race-sword-skins.js` (4 skin; `race-cuu-thien` Cửu Thiên Lưu Ly Kiếm có `drawSwordSparkle` nháy), giải quà đua `RACE_GIFT_PRIZES` trong `sword-race.mjs` (top 1 = Cửu Thiên). Ảnh `public/assets/events-v1/sword-cuu-thien-v1.png`.
- Đột phá theo cảnh giới: lớp chung `qi-impact.js` (`setFxPalette`, `qiRemap`, `pushFxCamera`); từng cảnh giới `*-awakening.js`, `*-formation.js`, `*-audio.js`, `*-timeline.js` (luyen-khi, truc-co, kim-dan, nguyen-anh, hoa-than, chan-tien…). `ascension-stage.js` (thiên đài), `ritual-appearance.js` (biến thể mỗi lần đột phá; Luyện Khí–Kim Đan có thêm nền ảnh/lật/zoom/chỉnh màu/thời tiết/âm thanh ngẫu nhiên, né lựa chọn vừa dùng — tiếng nhấn ở `ritualVariant()` trong `audio.js`). So biến thể: `scripts/render-ritual-variety.mjs`.
- Đột phá mới (Claude 07/11): Thái Ất v2 `thai-at-awakening.js`, Đại La v2 `dai-la-awakening.js` (bản v1 ở `data/backups/`), Tiên Đế v1 `tien-de-awakening.js` (34 s, nền `assets/tien-de-v1/heaven-court.png`). Âm sinh từ `scripts/<tên>-score.txt` ghép với bộ máy trong `chan-tien-audio.js`. Lớp tăng âm cho cảnh giới ≥6: `public/ritual-boost-audio.js`. Render khung: `FRAMES=1,2.5 node scripts/render-tien-de.mjs <dir> 13` (không dùng biến `SECONDS`). Tiến độ ghi trong `skills/van-hai-dot-pha/SKILL.md`.
- Skin sự kiện khách: `tudo-ma-ton.js`, `khuy-niet.js` (Khuy Niết Lôi Tôn: 300c skin, 500c Tử Lôi Long; ảnh `assets/khuy-niet-v1/`, xem thử `/khuy-preview.html`, render `scripts/render-khuy.mjs`). Bảng sự kiện: `visitor-event.js`, `visitor-rewards.js`; màn biến hình `transform-fx.js`. Skin nạp tiền luôn có hiệu ứng kể cả sân đông (`premiumTargets` trong `scene.js`, tối đa 8 người).
- Ghế sân (09/11): map thường dùng **ghế cố định** `plazaSlots`/`stableTargets` trong `public/live-cinema.js` (52 ghế so le, tối đa 50, nhân vật nhỏ; ai ngồi đâu giữ nguyên, người mới lấy ghế trống gần giữa, NPC ngồi rìa; người mặc skin lớn giữ trống 2 ghế bên + 2 ghế sau). Map tông môn (`sect`) vẫn `sectHallTargets`. Ghế lưu ở `scene.plazaSeats`.
- Pháp bảo kèm skin: `public/skin-gear.js` (`SKIN_GEAR`, `ownsGear`) — sở hữu là hiện, bất kể đang mặc skin nào; server gửi `skinGear` trong luồng overlay.
- Nhạc nền: `public/music-rotation.js` (`BGM_LIST` 8 bài, tự đổi mỗi 30 phút, `musicIndex`, `applyMusicCommand`), `POST /api/music` {cmd: auto|next|số}, lưu `settings.music`; khung chọn trên `#scene`. Ghi công CC BY trong `public/assets/AUDIO.md`.
- Ảnh: `public/assets/` (`divine-war-v1` = thần trang 14 cảnh giới nam/nữ, `realm-skins-v2`, `chan-tien-cinema-v2`, `worlds-v2`…). Danh mục: `public/assets/CHARACTERS.md`.
- Chú ý: file awakening cảnh giới ≥3 dùng xuống dòng CRLF.

**Khác**
- `web/` — bản web (README.md, HOSTING.md, `server.mjs`, `game-view.mjs`, `dungeon.mjs`…). Cloud: `web/cloud/server.mjs` (VPS), `agent.mjs` (máy LIVE), `play-sessions.mjs` (phiên web, tự trả về LIVE khi web im 45 s nếu LIVE xin / 2 phút), `live-transfers.mjs` (khóa bàn giao trong `live.json`; không cần `roilive` nếu 60 s không tương tác LIVE). `web/error-log.mjs` + `web/public/error-report.js` ghi lỗi vào `<data>/logs/web-errors.jsonl`. Chế độ thử: `WEB_CLOUD_TRIAL` trong `web/app.mjs`. Hướng dẫn deploy: `web/deploy/PRODUCTION.md`.
- `scripts/restart-cloud-sync.ps1` — restart LIVE + watchdog kèm secret; `scripts/xem-log-web.ps1` — gom log VPS + agent.
- `test/` — test Node. `scripts/` — QA (`qa-*.mjs`), render xem thử, restart. `render-*.mjs` ở gốc — xuất ảnh/clip review vào `output/`.
- Ghi chú theo chủ đề: các file `*.md` viết hoa ở gốc (vd. `LIVE-LATENCY-CROWD-2026-11-06.md`). **Giảm lag 07–08/11: `LIVE-LAG-2026-11-08.md`** (đo gì, đã sửa gì, `/api/perf`, `diag` trong `/api/client-status`, script `prune-inactive.mjs`). ⚠ Kết luận "WebGL lợi ~0" trong file đó đã SAI (chỉ đo CPU) — xem nhật ký 08/11 tối: GPU mới là nút thắt khi đông người. **README chỉ ghi tới v18, code đã đi xa hơn nhiều; tin code và ghi chú mới hơn README.**
- `skills/van-hai-dot-pha/SKILL.md` — skill cho Codex về đột phá.
- **`SOI-BAT-THUONG.md` — user hỏi ai gian lận/dùng tool/lên nhanh bất thường thì làm theo file này** (cách tra bằng dữ liệu đang có + kế hoạch bộ log phát hiện bất thường, chưa cài).

## 4. Quy tắc user đã chốt (đọc kỹ)

- Trả lời tiếng Việt, ngắn gọn. Làm thật, tự xem hình/chuyển động; **test đạt không có nghĩa là đẹp**.
- **Không restart kiểu thô** (đã được thay bằng quy tắc dòng dưới: xong việc tự restart an toàn). Sửa frontend thì trang tự nạp lại. Restart backend chỉ bằng script restart an toàn; chỉ kill `server.mjs` khi watchdog đang chạy, không mở thêm `start.cmd`.
- **⚠ ƯU TIÊN CAO NHẤT (user nhắc lại 08/11):** xong việc là test → commit → push → restart an toàn ngay, **kể cả đang LIVE, không hỏi, không dừng chờ**. Lệnh restart chạy đúng dạng `powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts\restart-<tên>.ps1` (khớp quyền trong `.claude/settings.local.json`, user tự thêm). Nếu vẫn bị chặn thì đưa user lệnh `! powershell ...` ngay.
- **Làm xong là tự up lên LIVE (user dặn 07/11, tối):** sửa backend thì tự chạy script restart an toàn (mẫu `scripts/restart-khuy-niet.ps1`), kể cả đang LIVE, rồi kiểm connection/watchdog. User chỉ load lại live, không phải tự chạy lệnh.
- Không sửa giá quà, dữ liệu người chơi, lịch sự kiện khi không được yêu cầu.
- **Không hiệu ứng toàn màn hình nào lặp y hệt**: mọi cảnh lặp phải có biến thể và giãn cách. TikTok đã khóa quà 3 lần vì "reproduced content". Màn đột phá toàn cảnh tối đa 1 lần / 60 giây.
- Giữ nguyên model nhân vật và quái có sẵn; animation làm từ ảnh gốc. Không tự vẽ nhân vật/quái mới. Hỏi trước khi tạo nội dung hình ảnh lớn.
- Ảnh mới user yêu cầu (linh thú, kiếm…): Claude tự gọi Codex vẽ bằng `codex exec --skip-git-repo-check` (image_gen), lưu ra scratchpad, tự xem rồi mới cài. Muốn giống ảnh mẫu thì xin user dán ảnh (bài trong nhóm Facebook không tải được).
- Giọng: VieNeu "Thiền Tâm Đức" là giọng chính (edge-tts NamMinh chỉ dự phòng). Tông sư xưng "lão phu". Gọi "sư huynh/sư tỷ" theo giới tính người chơi tự khai, chưa khai thì "đạo hữu".
- Đồ họa LIVE luôn 1080 px. Chữ tên không thu nhỏ (bị mờ). **Đông người (user chốt 08/11): >50 người bỏ hết hiệu ứng, kể cả skin xịn, chỉ để lại hình — ưu tiên nét và không lag** (>30 người đã bỏ cánh/pháp bảo/hào quang).
- **Không biết thì tra mạng trước (08/11):** gặp vấn đề lạ thì WebSearch cách ngành làm, rồi chỉ đo 1–2 lần để xác nhận; không thử mò nhiều lượt tốn token. Nói rõ đo cái gì và khác LIVE thật ở đâu.
- **Dọn hồ sơ người chơi là chủ ý của user** — không để chốt an toàn nào chặn đồng bộ web vì chuyện đó; nếu kẹt thì tự gỡ.
- Thay đổi lớn: lên kế hoạch chi tiết trước, tính trường hợp vài trăm người cùng lúc.
- Đột phá: cảnh giới càng cao càng hoành tráng, có nhịp nguyên nhân → chuyển hóa → cao trào → biến hình. Làm từng cảnh giới cho chỉn chu.
- Bản web: mobile-first (~390 px), là game thật (joystick, nút chiêu), người LIVE không thấy hành động trên web.
- Đột phá: mỗi cảnh giới phải có **cơ chế và cấu trúc mới thật sự**, không chỉ đổi màu (user chê Đại La v1 "giống cảnh trước"); dồn dập, có tiếng bùm theo từng biến cố; mỗi cảnh chỉ dài hơn cảnh trước 1–2 s.
- Tông chủ: chỉ ai tặng **một món ≥2.000 coin** (không tính cộng dồn hay lịch sử) — trên bảng quà là ảnh **Vương miện 2.000 coin**.
- **Quà (chốt 08/11):** đang có sự kiện thì chỉ áp luật quà của sự kiện đó, không cộng quà mặc định; không sự kiện mới có quà mặc định (≥500 = Đại lễ: +50% tu vi + skin ngẫu nhiên chưa có ≤200 + đá + thảo). **Không bao giờ nói/ghi "đa tạ tâm ý"/"cảm ơn đạo hữu"** — chỉ đọc hiệu ứng (cộng tu vi, chúc mừng skin, bứt tốc, phản công…). Chính–Ma: không cho đột phá.
- **Không mồi tương tác (09/11, sau khi TikTok hạn chế LIVE vì "Fake Engagement"):** giọng/chữ không được hứa thưởng cho thả tim/follow/share ("thả tim để…", "đa tạ đã theo dõi", "thả tim nhận thưởng mốc…"). Chỉ báo hiệu ứng. Còn sót gợi ý lệnh "❤ thả tim → vận công" — nếu bị phạt lại thì bỏ nốt.
- Bảng/thẻ quà: chỉ ảnh quà thật → kết quả, không ghi chú dài, không hộp quà emoji, không số coin ("ai hỏi thì user trả lời").
- Không chạy lại lịch/heartbeat cũ (Thần Đế/Vương Lâm 03/11) từ lịch sử chat.
- **Xong việc là tự đẩy lên, không hỏi lại (07/11):** test đạt → commit → push nhánh → tạo **tag `prod-*` mới** và push để deploy web. Không di chuyển/xóa tag cũ, không force-push. Restart LIVE server: theo quy tắc "làm xong tự up lên LIVE" ở trên.

## 5. Trạng thái hiện tại

- Server LIVE chạy (PID 2652, restart an toàn 09/11 tối sau commit nhạc nền, TikFinity connected). Nhiều phiên cùng làm 09/11 — mỗi lúc chỉ nên một phiên đụng server LIVE.
- Git: commit mới nhất `c198918` (nhạc nền), đã push `main`. Chưa commit: `SO-TAY.md`, `NHAT-KY-CU.md`.
- **Chờ user (09/11, nhạc/ghế/pháp bảo):** làm mới nguồn Link để overlay nạp ghế cố định, pháp bảo kèm skin, code nhạc mới; dán dòng ghi công CC BY (trong `public/assets/AUDIO.md`) vào mô tả LIVE; nghe thử 5 bài nhạc mới (Claude chưa nghe, chỉ đo âm lượng); xem ghế sân trên LIVE thật đông người.
- **Cân thưởng sự kiện (09/11, `5caf7d7`):** theo dõi xem người chơi có kêu "ép" không; chỉnh ở `EVENT_GEAR_SHARE` (`engine.mjs`) và `ALC.reward` (`alchemy.mjs`). **Chưa có tag `prod-*` mới** (mới nhất `prod-20261107-handoff`).
- **Chờ deploy web:** linh thú web có chiêu (`f6a02cb`) chưa lên prod — lần push tag bị bộ phân quyền chặn. User nói "cập nhật lên prod" hoặc tự chạy `! git tag prod-20261109-web-pets HEAD && git push origin refs/tags/prod-20261109-web-pets`, rồi kiểm `/deploy-version.json` + `/healthz`.
- **Chờ user làm mới nguồn Link** trong LIVE Studio để overlay nạp: pháp bảo đứng yên/thay phiên linh thú (09/11), bản đồ Chính–Ma mới, thẻ luật quà, thẻ Tông chủ ban, sửa vinh danh 2 người, nhắc điểm danh. Chưa kiểm trên LIVE thật (đọc `/api/client-status` sau khi user làm mới).
- Hoãn theo lời user: Linh căn khi nhập môn ("phức tạp quá, tạm để đó"). Ý tưởng từ ảnh đối thủ chưa làm: Tuyệt Chiêu cut-in, thẻ "xem tên", PK, mục tiêu tông, dọn sân khấu.
- **Đồng bộ web:** agent chạy lại từ 08/11 ~21:20 (PID mới, khởi bằng `scripts/start-web-cloud-agent.ps1`), web 4.589 hồ sơ, `liveConnected:true`. Ngưỡng chặn xóa hàng loạt giờ là >90% (chỉ bắt export rỗng/hỏng).
- **Liên kết chờ:** Wuang Dzinh (ID `74630122395`, realm 10) và "ng luôn tệ làm người tuôn lệ" phải lấy mã mới rồi gõ `lienket MÃ` lúc đang LIVE (các mã cũ đã hết hạn).
- Dữ liệu LIVE đã dọn 08/11: 7.978 → 2.450 hồ sơ (xóa 926 người >7 ngày không vào + 4.602 Phàm Nhân, đều chưa từng tặng quà). Sao lưu: `data/backups/prune-inactive-20261107T200820/`, `data/backups/prune-realm0-20261107T201140/`. Phàm Nhân mới lại đang tăng (390 lúc 11:30).
- **LAG ĐÔNG NGƯỜI (08/11 tối, đã sửa, chờ kiểm trên LIVE):** thủ phạm là `imageSmoothingQuality='high'` trên canvas sân khấu (GPU dựng mipmap mỗi lần dán ảnh cache) → `'low'`; >50 người chế độ chỉ ảnh (`bareCrowd` trong `scene.js`). User phải **làm mới nguồn Link** để overlay nạp code mới. Hình mờ/chữ nhỏ bể là do TikTok nén video (chữ to/đậm hơn, kiểm bitrate/đầu ra 1080×1920 LIVE Studio) — chưa sửa.
- **LAG LIVE 08/11 trưa (cũ):** overlay trong LIVE Studio chỉ 1–2 FPS (khoảng cách khung đúng 1.000 ms), trong khi cùng trang mở bằng Chrome riêng chạy 60–100 FPS, CPU/GPU tích hợp rảnh, JS gần như không làm gì → nguồn Link của LIVE Studio bị hãm/kẹt. Đã bảo user: làm mới nguồn Link → xóa và thêm lại → khởi động lại LIVE Studio; không thu nhỏ cửa sổ. 12:18 overlay được nạp lại (id mới) → **30 FPS đều, rAF 180/s, không khung bị chặn**. User để ý "lúc đua bay không lag" (lúc đua tắt hiệu ứng skin nạp tiền/NPC/khí quyển — đã kiểm: hiệu ứng skin nạp tiền không dùng filter/shadowBlur, chỉ 1 người mặc → không phải nguyên nhân). Lưu ý: overlay LIVE Studio đang ở mức chất lượng `high` (đặt cố định, `RenderBudget` không tự hạ từ `high` dù FPS thấp) — nếu giật lại: đổi link sang `quality=balanced`/`auto` và cân nhắc cho budget tự hạ khi `rafFps` thấp. Nếu giật lại: đọc `diag` trước (rafGapMax ~1000 = nguồn Link bị hãm → làm mới nguồn).
- **3 cảnh giới mới sau Hồng Mông (08/11): CODE ĐÃ XONG + đã lên LIVE (6f5d587)** — realm 22–24 có trong progression/god-forms/realm-outfits/ascension-art/presence/pacing/opportunity (giá cơ duyên thêm 399.999/599.999/999.999), chuyển sinh mở ở 24. Hình hiện là TẠM: thân thần cũ đổi màu (GOD_FORMS: Ma Thần ô 3 hue −28 đỏ; Thiên Ma ô 3 hue 255 tím; Diệt Thế ô 2 hue −12 bạch kim đen). MÀN ĐỘT PHÁ RIÊNG ĐÃ XONG (09/11): 22 Ma Thần 46 s (`ma-than-awakening.js`), 23 Thiên Ma Thánh Đế 48 s "Thiên Ma Đăng Thánh" (`thien-ma-awakening.js`: khe trời, 7 thánh ấn, vạn nhãn, luân hoàn có mắt, nuốt sao, Thiên Ma Nhãn, miện kiếm, càn khôn đảo), 24 Diệt Thế Chí Tôn 50 s "Diệt Thế Quy Hư" (`diet-the-awakening.js`: hố đen, xé 5 hành tinh, hư hỏa, kiếm nứt không gian chém 3 nhát, cánh vỡ, vành hành tinh, xoá thế giới, vụ nổ lớn). Nhạc: `scripts/<slug>-score.txt` → `node scripts/build-realm-audio.mjs thien-ma|diet-the`. Đã sửa lỗi Ma Thần v1 không trả khung HUD (LIVE mất chữ + nhạc) và `scene.js` chặn nhạc riêng cho realm >13. CÒN: vẽ skin riêng khi Codex có hạn mức (sau 12/11 23:26), user xem/nghe duyệt 3 màn, deploy web khi user nói. Ghi chú cũ: Ma Thần → Thiên Ma Thánh Đế → Diệt Thế Chí Tôn (realm 22–24, chuyển sinh dời sang 24). Phong cách skin: thần giáp cổ đại + công nghệ huyền bí, giáp khắc hoa văn kỳ dị, đầu cực ngầu; màn đột phá riêng làm SAU (tạm dùng màn thần hiện có). Brief vẽ (scratchpad phiên 08/11, sẽ mất): Ma Thần = giáp obsidian khắc phù văn mạch đỏ như dung nham, vương miện sừng đen + mặt nạ nửa, vai mặt quỷ thần, kích đen; Thiên Ma Thánh Đế = giáp tím đen + vàng hoàng gia khắc ký hiệu hình học phi Euclid, mắt thứ ba, vương miện lưỡi kiếm lơ lửng, vòng hào quang cơ khí có mắt; Diệt Thế Chí Tôn = giáp bạch kim đen có lõi hố đen, phù điêu hành tinh vỡ, vương miện vành hành tinh gãy + lửa hư không, cánh mảnh giáp vỡ, kiếm là vết nứt không gian. Ảnh nền trong suốt, đứng 1024×1536 / ngồi 1254×1254, nam + nữ (nữ giáp kín). **Codex hết hạn mức tới 12/11 23:26 → chưa vẽ được ảnh nào.** Cần sửa: `public/progression.js` (REALM_NAMES), `public/god-forms.js` (GOD_FORMS +3), `realm-outfits.js`, `honors.js`, ảnh `output/realm-skins-v3/<slug>/` + `scripts/install-realm-skins-v2.py` (thêm realm + APPROVED), kiểm bản web, test.
- Chờ user tự thêm `.claude/settings.local.json` (allow `PowerShell(powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts\\restart-*.ps1)`) để restart an toàn không bị chặn — chưa có file này.
- Chờ user (từ 07/11, chưa trả lời): duyệt Tiên Đế (realm 13); thu hồi đồ 5 người Tông chủ luật cũ; bàn giao web "ưu tiên LIVE"; trang quản lý gửi số liệu cũ làm lùi tu vi khi sửa (có thể phiên khác đã sửa — restart "admin-edit-fix" 08/11 11:36, chưa kiểm); thưởng Chính–Ma theo % tu vi; nghe âm Thiên Đạo; duyệt skin thần v3.
- Việc chờ: chuyển dự án sang `C:\GAME\VanHaiTong` khi không LIVE.
- **Web (VPS):** prod `8779e2c` (tag `prod-20261107-handoff`), chế độ thử. **VPS dùng thử hết hạn 09/11 23:59 — chưa rõ user đã gia hạn chưa, kiểm `/healthz`.** Còn: đổi khóa SSH quản trị (đã lộ), backup ngoài VPS. Code cloud nhánh `claude/cloud-merge` — kiểm lại đã vào `main` qua `067bb3a` chưa.

## 6. Nhật ký phiên (mới nhất ở trên, giữ tối đa 8 phiên; phiên cũ hơn chuyển sang `NHAT-KY-CU.md`)

### 20/11/2026 — Chào người mới bằng câu đọc sẵn, câu chúc nhập môn, Giờ Vàng hiện trên màn
- Vì sao: giọng chào tạo theo tên mất vài giây, trình phát chỉ chờ 1,5 s rồi BỎ → người mới lướt đi mới được chào hoặc không được chào.
- Đã làm: `public/welcome-lines.js` (8 câu chào người mới, 3 câu người quay lại, 5 câu chúc nhập môn; chỉ lệnh gõ, không mồi tim/follow). `voice.js`: người mới → phát ngay câu đọc sẵn (cả sân 1 câu / 8 s, trước 20 s); người cũ → thử câu có tên, không kịp/máy giọng bận thì câu đọc sẵn thay vì im; bình luận đầu tiên (nhập môn) có câu chúc, làn riêng 8 s. `server.mjs`: có file đọc sẵn thì không tạo giọng theo tên cho người mới (máy giọng để dành cho quà). Giờ Vàng: snapshot có `golden`, lệnh bài người mới thêm dòng "Giờ Vàng 30 phút · tu luyện ×2" (ẩn khi có dải "Tân đệ tử"), nhãn trên đầu "Gõ 1 · tu luyện ×2".
- Ảnh đại diện TikTok trên đỉnh lệnh bài (viền vàng + vòng ngọc + quầng thở + vệt sáng chạy quanh, chỉ transform/opacity). Lệnh bài không chờ ảnh; ảnh lỗi/không có thì giữ tranh núi. Sự kiện vào sân mang `avatar`.
- **Phải chạy 1 lần trên máy LIVE (lúc không LIVE):** `node scripts/make-welcome-voice.mjs` → `public/assets/voice-welcome-v1/*.mp3` + `manifest.json`. Chưa có manifest thì giọng chạy y như cũ. Restart: `scripts/restart-chao-nguoi-moi.ps1`.
- Kiểm: 997/997 test + `test/welcome-clips.test.mjs`, ảnh xem trước lệnh bài. Chưa kiểm: nghe 16 câu thật bằng VieNeu (file tạo trên máy user).

### 09/11/2026 (tối) — Gỡ mồi tương tác, ghế cố định, pháp bảo skin, nhạc nền
- Đã làm: bỏ lời mồi thả tim/follow/share sau cảnh báo "Fake Engagement" (`93b7a68`); trang quản lý chọn/gỡ linh thú cho người chơi (`6f23fa2`); ghế sân cố định 52 ghế so le, người mặc skin lớn được chừa chỗ (`0de7aed`, `6436bcb`, `e2e6ea4`); pháp bảo kèm skin (Song Đao Liệt Diễm/Tử Lôi Long/Huyết Đao) luôn hiện cho người sở hữu — vụ Công Tài mua Tần Mục 500 coin mà không thấy pháp bảo (`ba83fa9`); nhạc nền 8 bài (+5 Kevin MacLeod CC BY), tự đổi 30 phút, khung chọn trên `#scene` (`c198918`).
- File đổi: `speech-lines.mjs`, `engine.mjs`, `heart-events.mjs`, `server.mjs`, `public/{app,scene,live-cinema,audio,skin-gear,music-rotation,viem-ton,khuy-niet,tudo-ma-ton}.js`, `public/assets/bgm-tu-tien-4..8.mp3`, test mới `skin-gear`, `music-rotation`.
- Đã kiểm tra: 581/581 test, `npm run test:web` 41/41; tự xem render ghế sân offline; luồng overlay SSE có `skinGear` của Công Tài và `settings.music`; mp3 mới tải được. Chưa kiểm tra: nghe nhạc bằng tai; trên LIVE thật (user chưa làm mới nguồn Link); chưa rõ Fake Engagement có hết không.
- Tiếp theo: user làm mới nguồn Link, dán ghi công nhạc, nghe duyệt nhạc; theo dõi LIVE có bị hạn chế lại không.

### 09/11/2026 (tối) — Cân thưởng sự kiện, pháp bảo đứng yên + thay phiên linh thú
- Đã làm: soi Nam nguyễn lên nhanh → không gian lận (tim ~1/s, ~75 tr từ tim); >90% tu vi top đến từ thưởng sự kiện (nguồn `'reward'`, không trừ hạn mức) × hệ số pháp bảo (Nam 2,13). Sửa (`5caf7d7`): thưởng sự kiện chỉ ăn 50% hệ số pháp bảo (`EVENT_GEAR_SHARE`), lò đan 0,8%→0,7%/phẩm, ai tặng quà trong lò ×1,5/×2/×3 (≥1/5/99 coin). Pháp bảo đứng yên cạnh vai nhích 3 px, pháp bảo ↔ linh thú thay phiên 7,5 phút theo giờ thật, Linh Thú Cốc thì thú luôn hiện (`f857a63`, `public/follower-turn.js`).
- File đổi: `engine.mjs`, `alchemy.mjs`, `public/scene.js`, `public/follower-turn.js` (mới), test `event-reward-balance`, `follower-turn`.
- Đã kiểm tra: 574/574 test + test mới; tự xem render 2 lượt pháp bảo/linh thú; restart an toàn (`restart-cloud-sync.ps1`), TikFinity connected, 5.817 hồ sơ. Chưa kiểm tra: overlay LIVE thật (user chưa làm mới nguồn Link), FPS sau đổi.
- Hỏi đáp: cánh cao nhất hiện là phượng hoàng vàng (cộng dồn ≥2.000 coin, `WING_TIERS` trong `public/boss-arena.js`); chưa có mốc 3k — muốn thêm phải vẽ cánh mới (atlas chỉ 4 ô).
- Tiếp theo: user làm mới nguồn Link → đo `/api/client-status`; nếu user muốn cánh 3k thì nhờ Codex vẽ sau 12/11 23:26.

### 08–09/11/2026 — Luật quà theo sự kiện, bản đồ Chính–Ma, thẻ luật quà, linh thú web
- Đã làm: `BAT-LIVE.cmd` + lối tắt Desktop; giọng hết im sau chào (prewarm nền không chặn câu thật); 3 bản nhạc tu tiên CC BY (+4 dB, `assets/AUDIO.md`); nhắc điểm danh 4–6 phút; sửa hồng bao, vinh danh 2 người, Tông chủ ban Tiểu/Trung Lễ có thẻ + giọng. Quà: sự kiện chỉ áp luật sự kiện, bỏ mọi "đa tạ/cảm ơn", ≥500 không sự kiện = Đại lễ. Chính–Ma: cấm đột phá, giọng "X phản công", chiêu kiếm/huyết chưởng theo cỡ quà, bản đồ ngang Vạn Lý Chiến Đạo đẩy N trượng. Bảng skin + thẻ luật quà dùng ảnh quà thật, gọn (không ghi chú). Web: Kỳ Lân/Lôi Oa/Văn Thú dùng được, mọi linh thú có chiêu (hồi máu, khiên, đốt, choáng, hút máu…).
- File đổi chính: `engine.mjs`, `speech*.mjs`, `voice-parts.mjs`, `server.mjs`, `sect-war.mjs`, `public/{app,voice,audio,sect-war,war-road,gift-rule-card,gift-icons,ceremony,idle-lines}.js`, `public/clean-hud.css`, `web/progress.mjs`, `web/public/battle.js`; commit `ed64328`…`e53a6c1`.
- Đã kiểm tra: 555/555 test, `npm run test:web` 41/41; giả lập từng sự kiện bằng lệnh ingest thật (giọng/chữ quà đúng luật); tự xem hình bản đồ Chính–Ma, thẻ quà, hồng bao, vinh danh, trận web. Chưa kiểm tra: trên LIVE thật (user chưa làm mới nguồn Link); bản web linh thú chưa lên prod.
- Bài học: đã nói nhầm "overlay tự nạp" — với `sound=1` phải làm mới tay (đã ghi bộ nhớ). File CRLF: script vá phải dò `\r\n`; heredoc có backtick hỏng → viết script ra file rồi chạy node.
- Tiếp theo: user làm mới nguồn Link + xác nhận; deploy web linh thú khi user cho; gia hạn VPS trước 09/11 23:59.

### 08/11/2026 (tối) — Gỡ kẹt đồng bộ web, tìm ra thủ phạm lag khi đông người
- Đã làm: (1) Agent đồng bộ LIVE→web bị chặn cả ngày ("Large deletion blocked", do dọn 4.553 hồ sơ) → web `liveConnected:false`, `lienket` kẹt. User xác nhận xóa là chủ ý → chạy 1 lần `--once` với `allowLargeDeletion`, bật lại agent; nâng ngưỡng chặn 20%→90% (`4a14dfa`). (2) Lag đông người: đo bằng Chrome trên GPU tích hợp + server thử demo + người giả (không đụng LIVE): đột phá riêng lẻ mượt; 24+ người → 8–11 FPS, tiến trình GPU 96%, JS rảnh. Khoanh bằng A/B: thủ phạm là `imageSmoothingQuality='high'` trên canvas chính (mỗi lần dán ảnh cache nhân vật/tên GPU dựng lại mipmap). Đổi sang `'low'` + thêm bậc `bareCrowd` (>50 người: chỉ ảnh — bỏ khí quyển, mây/chim/đốm sáng, NPC, mưa hoa, dây đạo lữ, hiệu ứng quà; giữ màn đột phá; ảnh nhân vật cache đúng cỡ hiển thị cho nét) (`4f71ac7`).
- File đổi: `web/cloud/agent.mjs`, `public/scene.js`, `NHAT-KY-CU.md` (mới).
- Đã kiểm tra: web `/healthz` 4.589 hồ sơ, `liveConnected:true`; `npm run test:web` đạt; 555/555 test + `npm run check`; server LIVE đang phát `scene.js` mới (no-cache). A/B ép `low` trên code cũ: 30 người 10→180 FPS rAF, 80 người 8→180. Chưa kiểm tra: đo lại trên chính bản đã commit (user dừng lượt đo); bậc >50 người chưa đo/chưa tự xem hình; chưa kiểm trên LIVE thật; viền nhân vật ở `low` có xấu đi không (user chưa xem).
- Bài học: chèn `//` vào dòng code một dòng lại làm hỏng `drawEffect` (5 test đỏ, bắt được trước commit) → luôn dùng `/* */`. Chèn script qua CDP `addScriptToEvaluateOnNewDocument` cần `Page.enable`, thiếu thì A/B vô hiệu. Số "vẽ 0,3–9 ms/khung" cũ chỉ là thời gian CPU, không thấy tải GPU → kết luận cũ "WebGL lợi ~0" sai.
- Tiếp theo: buổi LIVE đông người tới: user làm mới nguồn Link → đọc `GET /api/client-status?world=live` (`fps`, `diag`). Vẫn giật >50 người → làm thử 1 ngày lớp nhân vật bằng PixiJS (WebGL batching), đo bằng bài 80 người; phương án cuối: máy có card rời/cloud GPU thuê theo giờ. Wuang Dzinh (ID `74630122395`) cần lấy mã mới + gõ `lienket MÃ` (N4P9ZA chưa từng tới agent, đã hết hạn).

### 08/11/2026 — Giảm lag LIVE, dọn hồ sơ, quà gửi ngay, sửa sân tỷ thí
- Đã làm: nghiên cứu 2 vòng + đo thật. Server: snapshot chỉ dựng hồ sơ cần gửi (87→26 ms), currentParticipant vế rẻ trước (tick 22→15 ms), lưu nền, `/api/perf` (`aa04da0`); quà gửi xuống overlay ngay (TB 257→168 ms, `7c13ef0`); xóa 926 hồ sơ >7 ngày + 4.602 Phàm Nhân chưa tặng quà (`dbbd71d`, `bf5fcc7`); bộ đo `live-diag.js` (`e70d339`); đấu thủ tỷ thí đứng trên sàn nền mới (`77cad7e`); ghi chú `LIVE-LAG-2026-11-08.md` (`647949d`). Dọn máy giữa LIVE: tắt Burp Suite, OneDrive, Widgets, Snipping Tool, 2 server thử kẹt (RAM trống 1,6→3,3 GB). Ghi luật "xong là đẩy lên LIVE" thành ưu tiên (mục 4 + bộ nhớ).
- Không làm (có lý do, xem ghi chú lag): giao thức delta, WebGL/pixi (vẽ chỉ 0,3–9 ms/khung trong LIVE Studio), SQLite.
- Đã kiểm tra: 530/530 test; snapshot mới ra giống hệt cũ (test + so trên dữ liệu thật); bài tải 300 người; độ trễ quà bằng TikFinity giả; mỗi lần restart: TikFinity connected, không mất/tụt hồ sơ; tự xem ảnh tỷ thí trước/sau. Chưa kiểm tra: overlay về 30 FPS sau khi user làm mới nguồn Link; đông người thật với bản mới.
- Bài học: `git worktree remove --force` xóa xuyên junction → làm rỗng `node_modules` game (đã `npm ci`); không viết markdown có dấu backtick bên trong lệnh shell (bash hiểu là lệnh con — đã làm hỏng sổ tay 1 lần, sửa lại bằng Edit); không chạy Chrome headless/benchmark lúc LIVE (tranh tài nguyên, số nhiễu); chỉ tắt đúng PID mình mở; lệnh restart phải ở dạng đơn giản (bọc điều kiện "đang LIVE thì dừng" là sai luật user).
- Dở dang / tiếp theo: (1) theo dõi lag LIVE Studio sau khi user làm mới nguồn Link; (2) 3 cảnh giới Ma Thần/Thiên Ma Thánh Đế/Diệt Thế Chí Tôn — vẽ lại khi Codex có hạn mức (sau 12/11), duyệt, rồi code + test + cài; (3) user gia hạn VPS trước 09/11 23:59.

### 07/11/2026 (khuya) — Đột phá Đại La v2 + Tiên Đế, tăng âm, skin Khuy Niết, sửa Tông chủ
- Đã làm: Đại La v2 "Nhất Niệm Vạn Giới" (user: "cũng tạm được"); Tiên Đế v1 "Đăng Cơ" 34 s (cổng Nam Thiên Môn, 9 bậc, thiên binh quỳ bái, Cửu Đỉnh, thánh chỉ + ngọc tỷ, ngai, mũ miện, VẠN TUẾ); tăng âm đột phá cảnh giới ≥6 (bus nén + lớp trống/nổ/kèn, RMS ~×2,2). Skin Khuy Niết Lôi Tôn (Codex vẽ; sét vàng/tím, lôi diễm dưới chân, cầu Âm Dương, thiên lôi; 500c Tử Lôi Long) + màn giáng thế + thẻ dashboard. Tông chủ đổi sang luật một món ≥2000 (gỡ 5 danh hiệu cũ, giữ đồ). Skin nạp tiền luôn có hiệu ứng khi sân >20 người.
- File đổi: xem mục 5 "Chưa commit".
- Đã kiểm tra: 509/509 test; tự xem khung hình Tiên Đế, Đại La, skin Khuy Niết; đo âm offline. 3 lần restart an toàn, server vẫn nối TikFinity. Chưa kiểm tra: nghe âm thật; Tiên Đế chưa được user duyệt; hiệu ứng Khuy Niết trên LIVE đông người mới kiểm bằng test.
- Bài học: Nam nguyễn mất khỏi sân là do tự mở web (bàn giao), không phải lỗi; cờ cũ từ bản web có thể đè dữ liệu nên điều kiện danh hiệu phải dựa trên dấu mới.
- Tiếp theo: user duyệt Tiên Đế → realm 14; trả lời 3 câu chờ ở mục 5; commit phần này.

### 07/11/2026 (tối) — Top ngày/tuần, thần thú hiếm, đột phá đầu đa dạng, kiếm Cửu Thiên
- Top ngày/tuần trên `#scene` (chỉ trang quản lý): 6 mục, 4 kỳ (hôm nay/tuần này/hôm qua/tuần trước). Lần cài đầu dựng lại coin quà trong tuần từ `data/audit/gifts-live-*.jsonl`; các mục khác tính từ lúc cài.
- Thần thú hiếm Linh Thú Cốc (Codex vẽ, 200 coin, mỗi lượt ngẫu nhiên 1 con, không trùng lần trước): Lôi Oa `thú 6` (sét), Văn Thú `thú 7` (muỗi, huyết khí), Kỳ Lân `thú 8` (lửa). 200 coin nhận luôn cả Tinh Hà Thần Long. Tông chủ có cả 3. Muỗi/kì lân vẽ theo đặc điểm chung (không xem được ảnh Facebook).
- Đột phá Luyện Khí→Kim Đan (chống "reproduced content"): mỗi lần ngẫu nhiên 1/10 nền ảnh, lật trái/phải, zoom 100–110%, chỉnh màu 1/10 tông (chừa vùng nhân vật), thời tiết 1/8, âm to ×1,25–1,7 + âm sắc + tiếng nhấn lúc nổ (chiêng/chuông/trống/khánh/sấm); né lựa chọn vừa dùng.
- Kiếm Cửu Thiên Lưu Ly (Codex vẽ, sao nháy + chớp + hào quang cầu vồng) thay Thương Long làm giải top 1 quà đua (user chọn); `phi kiếm 4`.
- Đã kiểm tra: 507/507 test, `npm run check`; tự xem render sân Linh Thú Cốc, bảng 3×3 biến thể đột phá (`output/ritual-variety-after/sheet.png`), kiếm nháy (`output/sword-v2/sparkle.png`). 2 lần restart an toàn (`restart-spirit-beasts.ps1`, `restart-race-sword-v2.ps1`), server sau đó vẫn nối TikFinity, watchdog healthy. Chưa kiểm tra: nghe âm thanh biến thể đột phá bằng tai; giao diện bảng top trong trình duyệt thật (mới kiểm API).
- Tiếp theo: commit phần này (chỉ file của phiên); user nghe âm đột phá; nếu user gửi ảnh muỗi/kì lân thì cho Codex vẽ lại; còn 2 thần thú nữa cho đủ 5.

### 07/11/2026 — Đưa bản web lên VPS (vanhaitong.duckdns.org)
- Đã làm: theo bàn giao CloudFly — sao lưu (`C:\GAME\_backups\vanhai-20261107-001353`), gộp `codex/cloudfly-setup` vào main (nhánh `claude/cloud-merge`), nhập 4 tài khoản + 3 nhân vật web lên VPS, bật service + nginx HTTPS, agent full sync, bật gameplay. Sau đó: chế độ thử (`WEB_CLOUD_TRIAL`), ghi log lỗi + `XEM-LOG-WEB.cmd`, sửa lỗi 401 (restart của phiên khác không nạp secret → `server.mjs` tự đọc `data/web-cloud-agent.json`), tự bàn giao LIVE ↔ web không cần đăng xuất/`roilive`.
- File đổi: `web/app.mjs`, `web/dungeon.mjs`, `web/cloud/{server,agent,play-sessions,live-transfers}.mjs`, `web/error-log.mjs`, `web/public/{error-report.js,index.html}`, `engine.mjs` (ingest đặt `wantsLiveAt`), `server.mjs`, `scripts/{restart-cloud-sync,xem-log-web,start-watchdog}.ps1`, `XEM-LOG-WEB.cmd`, test `web/test/{trial,error-log,auto-handoff}.test.mjs`.
- Đã kiểm tra: test 517/517 (worktree), HTTPS/healthz/deploy-version/site-status `trial:true` trên prod, `/admin` 403, `/data` 404, log viewer chạy thật. Chưa kiểm tra: một lượt bàn giao thật bằng tài khoản người chơi (không tạo tài khoản/quà giả trên prod); giao diện web chế độ thử trên điện thoại.
- Dở dang / tiếp theo: restart agent cho code mới; user thử bàn giao bằng tài khoản thật; gộp `claude/cloud-merge` vào `main`; đổi khóa SSH; gia hạn VPS trước 09/11; chuyển sang `C:\GAME\VanHaiTong`.
