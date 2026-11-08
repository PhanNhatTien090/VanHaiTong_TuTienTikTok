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
| Bản web (thật) | **https://vanhaitong.duckdns.org** — VPS CloudFly `103.82.26.70` (root, khóa `~/.ssh/vanhai-admin.pem`, known_hosts riêng `~/.ssh/vanhai-cloudfly-known_hosts`). Service `van-hai-web` (127.0.0.1:4320, data `/var/lib/van-hai-web`, env `/etc/van-hai-web.env`: `WEB_CLOUD_GAMEPLAY=1`, `WEB_CLOUD_TRIAL=1`). VPS dùng thử tới 09/11 23:59 |
| Deploy web | push **tag `prod-*` mới** trỏ commit có workflow (`.github/workflows/deploy-production.yml`); kiểm `/deploy-version.json`, `/healthz`, `/api/site-status` |
| Đồng bộ LIVE ↔ web | agent `web/cloud/agent.mjs` chạy trên máy này (config riêng `data/web-cloud-agent.json`, không lên Git); `start-watchdog.ps1` tự nạp secret + bật agent. Xem log: `XEM-LOG-WEB.cmd` → `data/web-logs/` |
| Bản web local cũ | cổng 4320 local (cờ `data/web-enabled`) — hiện tắt, không dùng nữa |
| Kiểm tra server sống | `GET /api/state?world=live` (có `players`, `sectQi`); trạng thái watchdog: `data/watchdog-status.json` |
| Bật giám sát | `BAT-GIAM-SAT-SERVER.cmd` → `scripts/start-watchdog.ps1` → `scripts/server-watchdog.mjs` (chạy ẩn, tự bật lại server) |
| Khởi động lại backend an toàn | dùng script `scripts/restart-*.ps1` (mẫu: `restart-claude-merge.ps1`): tạm dừng watchdog, giữ quà đang đến, xuất dữ liệu rồi mới tắt |
| Test | `node --test --test-concurrency=2 test/*.test.mjs` (lần gần nhất 509/509 đạt, 07/11 khuya), `npm run check`, web: `npm run test:web` |
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
- `data/` — dữ liệu thật: `live.json`, `demo.json`, `web/accounts.json`, log. **Không sửa tay.**

**Frontend (`public/`)**
- `index.html` — trang điều hành + overlay; `app.js` (luồng chính, lịch NPC đột phá), `scene.js` (vẽ sân khấu), `stage.js` (24 ghế), `motion.js`, `performance.js`, `crowd-policy.js` (giảm đồ họa khi đông).
- `social-ui.js` — tab Sự kiện.
- `heaven-strike.js`, `heaven-strike-audio.js` — Thiên Đạo giáng lôi (hình + âm tự tổng hợp). Server: `heavenStrike()` trong `engine.mjs`, `POST /api/heaven-strike`; khung điều khiển `renderHeavenPanel()` trong `app.js`. QA: `scripts/qa-heaven-strike.mjs` (server thử cổng 4399), `scripts/render-heaven-strike.mjs`.
- Chống tự thả tim: `heartGate()`/`HEART_GATE` trong `engine.mjs`, bật bằng `settings.heartGate` (server tự bật cho LIVE).
- Hàng hiệu ứng LIVE: `public/presentation.js` (ưu tiên; quà = 8), `enqueueReady`/`playNext`/`giftMayPreempt` trong `app.js`; hàng giọng `public/voice.js` (`fastVoiceFile` = câu dự phòng), TTS 1 câu/lúc trong `speech.mjs`.
- `sect-war.mjs` + `public/sect-war.js` — Chính Ma Đại Chiến (Codex làm, chưa commit). QA: `scripts/qa-gift-first.mjs`, `scripts/qa-ceremony.mjs`. `voice.js` (`VOICE_RATE`), `audio.js`, `impact-audio.js`.
- Top ngày/tuần (chỉ trang quản lý `#scene`): `period-tops.mjs` (mốc bộ đếm theo kỳ, giờ VN, tuần từ thứ Hai; lưu `w.periodStats`, không gửi xuống overlay), API `GET /api/period-tops?world=live`, giao diện `public/period-tops.js/.css`. 6 mục: tu vi, quà, tim (`p.heartsTotal`), câu đố (`p.quizSolved`), tỷ thí (huy chương), skin mới.
- Linh thú: `public/spirit-pets.js` (`SPIRIT_PETS` 5 con thường + `RARE_PETS` thần thú hiếm Lôi Oa/Văn Thú/Kỳ Lân 200 coin, `ALL_PETS`), `spirit-pets.mjs` (mỗi lượt Linh Thú Cốc chọn ngẫu nhiên 1 thần thú có ảnh, `w.petEvent.featured`), `spirit-pet-art.js` (`drawRareFx`: sét/huyết khí/lửa), `pet-cove.js`, `pet-arrival-fx.js`. Ảnh `public/assets/spirit-pets-v1/*.png` (3 ô, Codex image_gen; prompt trong `prompts.json`).
- Skin phi kiếm: `public/race-sword-skins.js` (4 skin; `race-cuu-thien` Cửu Thiên Lưu Ly Kiếm có `drawSwordSparkle` nháy), giải quà đua `RACE_GIFT_PRIZES` trong `sword-race.mjs` (top 1 = Cửu Thiên). Ảnh `public/assets/events-v1/sword-cuu-thien-v1.png`.
- Đột phá theo cảnh giới: lớp chung `qi-impact.js` (`setFxPalette`, `qiRemap`, `pushFxCamera`); từng cảnh giới `*-awakening.js`, `*-formation.js`, `*-audio.js`, `*-timeline.js` (luyen-khi, truc-co, kim-dan, nguyen-anh, hoa-than, chan-tien…). `ascension-stage.js` (thiên đài), `ritual-appearance.js` (biến thể mỗi lần đột phá; Luyện Khí–Kim Đan có thêm nền ảnh/lật/zoom/chỉnh màu/thời tiết/âm thanh ngẫu nhiên, né lựa chọn vừa dùng — tiếng nhấn ở `ritualVariant()` trong `audio.js`). So biến thể: `scripts/render-ritual-variety.mjs`.
- Đột phá mới (Claude 07/11): Thái Ất v2 `thai-at-awakening.js`, Đại La v2 `dai-la-awakening.js` (bản v1 ở `data/backups/`), Tiên Đế v1 `tien-de-awakening.js` (34 s, nền `assets/tien-de-v1/heaven-court.png`). Âm sinh từ `scripts/<tên>-score.txt` ghép với bộ máy trong `chan-tien-audio.js`. Lớp tăng âm cho cảnh giới ≥6: `public/ritual-boost-audio.js`. Render khung: `FRAMES=1,2.5 node scripts/render-tien-de.mjs <dir> 13` (không dùng biến `SECONDS`). Tiến độ ghi trong `skills/van-hai-dot-pha/SKILL.md`.
- Skin sự kiện khách: `tudo-ma-ton.js`, `khuy-niet.js` (Khuy Niết Lôi Tôn: 300c skin, 500c Tử Lôi Long; ảnh `assets/khuy-niet-v1/`, xem thử `/khuy-preview.html`, render `scripts/render-khuy.mjs`). Bảng sự kiện: `visitor-event.js`, `visitor-rewards.js`; màn biến hình `transform-fx.js`. Skin nạp tiền luôn có hiệu ứng kể cả sân đông (`premiumTargets` trong `scene.js`, tối đa 8 người).
- Ảnh: `public/assets/` (`divine-war-v1` = thần trang 14 cảnh giới nam/nữ, `realm-skins-v2`, `chan-tien-cinema-v2`, `worlds-v2`…). Danh mục: `public/assets/CHARACTERS.md`.
- Chú ý: file awakening cảnh giới ≥3 dùng xuống dòng CRLF.

**Khác**
- `web/` — bản web (README.md, HOSTING.md, `server.mjs`, `game-view.mjs`, `dungeon.mjs`…). Cloud: `web/cloud/server.mjs` (VPS), `agent.mjs` (máy LIVE), `play-sessions.mjs` (phiên web, tự trả về LIVE khi web im 45 s nếu LIVE xin / 2 phút), `live-transfers.mjs` (khóa bàn giao trong `live.json`; không cần `roilive` nếu 60 s không tương tác LIVE). `web/error-log.mjs` + `web/public/error-report.js` ghi lỗi vào `<data>/logs/web-errors.jsonl`. Chế độ thử: `WEB_CLOUD_TRIAL` trong `web/app.mjs`. Hướng dẫn deploy: `web/deploy/PRODUCTION.md`.
- `scripts/restart-cloud-sync.ps1` — restart LIVE + watchdog kèm secret; `scripts/xem-log-web.ps1` — gom log VPS + agent.
- `test/` — test Node. `scripts/` — QA (`qa-*.mjs`), render xem thử, restart. `render-*.mjs` ở gốc — xuất ảnh/clip review vào `output/`.
- Ghi chú theo chủ đề: các file `*.md` viết hoa ở gốc (vd. `LIVE-LATENCY-CROWD-2026-11-06.md`). **Giảm lag 07–08/11: `LIVE-LAG-2026-11-08.md`** (đo gì, đã sửa gì, vì sao không làm WebGL/delta, `/api/perf`, `diag` trong `/api/client-status`, script `prune-inactive.mjs`). **README chỉ ghi tới v18, code đã đi xa hơn nhiều; tin code và ghi chú mới hơn README.**
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
- Đồ họa LIVE luôn 1080 px, cánh luôn hiện; đông người chỉ bớt nền. Chữ tên không thu nhỏ (bị mờ).
- Thay đổi lớn: lên kế hoạch chi tiết trước, tính trường hợp vài trăm người cùng lúc.
- Đột phá: cảnh giới càng cao càng hoành tráng, có nhịp nguyên nhân → chuyển hóa → cao trào → biến hình. Làm từng cảnh giới cho chỉn chu.
- Bản web: mobile-first (~390 px), là game thật (joystick, nút chiêu), người LIVE không thấy hành động trên web.
- Đột phá: mỗi cảnh giới phải có **cơ chế và cấu trúc mới thật sự**, không chỉ đổi màu (user chê Đại La v1 "giống cảnh trước"); dồn dập, có tiếng bùm theo từng biến cố; mỗi cảnh chỉ dài hơn cảnh trước 1–2 s.
- Tông chủ: chỉ ai tặng **một món ≥2.000 coin** (không tính cộng dồn hay lịch sử).
- Không chạy lại lịch/heartbeat cũ (Thần Đế/Vương Lâm 03/11) từ lịch sử chat.
- **Xong việc là tự đẩy lên, không hỏi lại (07/11):** test đạt → commit → push nhánh → tạo **tag `prod-*` mới** và push để deploy web. Không di chuyển/xóa tag cũ, không force-push. Restart LIVE server: theo quy tắc "làm xong tự up lên LIVE" ở trên.

## 5. Trạng thái hiện tại

- Server LIVE chạy, watchdog "healthy" (PID 24832, restart an toàn 07/11 ~20:51 bằng `scripts/restart-master-single-gift.ps1`). Chạy theo code thư mục làm việc, gồm cả phần chưa commit.
- **Chưa commit (phiên Claude "đột phá 11–13, Khuy Niết, Tông chủ")**: `public/{thai-at,dai-la,tien-de}-awakening.js`, `public/{thai-at,dai-la,tien-de}-audio.js`, `public/ritual-boost-audio.js`, `public/khuy-niet.js`, `public/khuy-preview.*`, ảnh `assets/{tien-de-v1,khuy-niet-v1}/`, `master-rewards.mjs`, `public/honors.js`, sửa trong `engine.mjs`, `server.mjs`, `scene.js`, `audio.js`, `ascension-art.js`, `live-cinema.js`, `transform-fx.js`, `visitor-*.js`, `event-dashboard.js`, `patrons.js`, `speech-lines.mjs`; test `khuy-niet`, `master-rewards`, `breakthrough-spectacle`, `kim-tien`; script `scripts/{render-tien-de,render-khuy,render-boost-audio}.mjs`, `scripts/restart-{khuy-niet,master-single-gift}.ps1`. Đã chạy trên LIVE.
- Chờ user: duyệt Tiên Đế (realm 13) rồi làm realm 14; có thu hồi đồ của 5 người từng được Tông chủ theo luật cũ không (Nam nguyễn, 神Łaz❄️, Thế 77777, Vinh Trần, Evan Tea — đã gỡ danh hiệu, còn giữ đồ); có đổi bàn giao web thành "ưu tiên LIVE" không (Nam nguyễn hay mở web nên biến khỏi sân); trang quản lý gửi kèm số liệu cũ làm lùi tu vi khi sửa (chưa sửa).
- **Chưa commit (phiên Claude "top ngày/tuần, thần thú, kiếm")**: top ngày/tuần, 3 thần thú hiếm, biến thể đột phá Luyện Khí–Kim Đan, kiếm Cửu Thiên — file mới `period-tops.mjs`, `public/period-tops.*`, `test/period-tops.test.mjs`, ảnh `loi-oa/van-thu/ky-lan.png`, `sword-cuu-thien-v1.png`, `scripts/restart-spirit-beasts.ps1`, `restart-race-sword-v2.ps1`; file sửa xem mục 6. Đã chạy trên LIVE.
- Commit mới nhất `dcc947c` (đã push origin/main). Các commit Claude 07/11: `ff1b824`, `458f801`, `f88ee14`, `931d23b`, `dcc947c` — mỗi cái chỉ gồm phần Claude, tách khỏi việc dở của Codex bằng index tạm. **Chưa tạo tag `prod-*`** cho các commit này.
- Chưa commit (thuộc file Codex chưa từng commit, Claude không commit được): bảng vinh danh Chính–Ma + sửa chiều ranh giới (`sect-war.mjs`, `public/sect-war.js`, phần gọi trong `public/scene.js`, câu `warEnd` trong `speech-lines.mjs`). Codex commit khi xong tính năng Chính–Ma.
- Chờ user: nghe âm Thiên Đạo trên LIVE; ảnh chụp lỗi "top 3 tặng quà bị che bên phải" (Claude dựng lại ở 1080×1920 thì đủ 3 người, chưa tái hiện được); quyết có đổi thưởng Chính–Ma sang % tu vi cần không (hiện 300/90/150 tu vi — quá nhỏ với cảnh giới cao); duyệt skin thần v3, Chân Tiên cinematic v3.
- Việc chờ: chuyển dự án sang `C:\GAME\VanHaiTong` khi không LIVE.
- **Web (VPS):** prod chạy `8779e2c` (tag `prod-20261107-handoff`): chế độ thử (chỉ ải đầu, không thưởng), ghi log lỗi, tự bàn giao LIVE ↔ web; ~7.5k hồ sơ đồng bộ. Server LIVE đã có bản đọc secret từ file → hết 401. **Agent (PID từ 01:12) còn code cũ** → chiều "bình luận LIVE thì tự về" chỉ chạy sau khi restart agent (an toàn, không đụng LIVE).
- **Code cloud** nằm ở nhánh `claude/cloud-merge` (đã push; worktree `C:\GAME\_worktrees\cloud-merge`), **chưa gộp vào `main`**; trong thư mục chính các file cloud/web đã chép vào nhưng chưa commit (lẫn việc dở của Codex).
- Web còn thiếu: đổi khóa SSH quản trị (đã lộ trong chat); backup ngoài VPS; gia hạn VPS trước 09/11 23:59. Auto-mode chặn Claude push tag `prod-*` / tự sửa settings → user tự thêm `.claude/settings.local.json` (allow `Bash(git push origin prod-*)`, `Bash(git tag prod-*)`).

## 6. Nhật ký phiên (mới nhất ở trên, giữ tối đa 8 phiên; phiên cũ hơn chuyển sang `NHAT-KY-CU.md`)

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

### 07/11/2026 (chiều) — Quà hiện ngay, sửa giọng "ghi nhận", ẩn giới hạn, Chính–Ma
- Quà: thẻ quà hiện ngay lúc nhận; quà ưu tiên cao nhất và cắt ngang hiệu ứng thường (quà ≥99 coin/VIP cắt cả đột phá ≤ Hóa Thần); quà chờ >10 s thì bỏ màn diễn; giọng cảm ơn quá 30 s thì bỏ. Đo nhật ký: server nhận quà 1–3 s sau khi tặng, trễ nằm ở hàng hiệu ứng trên trang.
- Đua phi kiếm: tay đua tặng quà khi đang đua chỉ bứt tốc, không cộng tu vi; chữ + giọng chỉ báo "bứt tốc".
- Giọng "Tông môn đã ghi nhận…" khi không ai tặng = câu dự phòng khi VieNeu bận (chỉ 1 câu/lúc). Đã bỏ câu dự phòng đó; quà/sự kiện được xếp hàng TTS (tối đa 3) thay vì bị trả "bận".
- Ẩn mọi câu chữ giới hạn tu luyện (thông báo hết hạn mức, "10%", điểm còn lại, sổ tay lệnh); chặn đột phá/đan dùng lời tu tiên ("Đạo cơ đang lắng đọng…", "Kinh mạch đã no linh khí…"). Giới hạn vẫn chạy ngầm; bảng quản lý vẫn hiện số.
- Chính–Ma (file của Codex): bảng vinh danh kết trận vẽ cố định màn hình 20 s (thắng/thua, thưởng mỗi phe, top 3 + danh hiệu), giọng vinh danh người dẫn đầu; sửa ranh giới trên sân bị ngược chiều so với thanh điểm.
- Kiểm tra: mỗi commit chạy test trên bản sạch (485–507 đạt); QA Chrome headless trên server thử 4399: quà 199 coin cắt màn đột phá sau 0,6 s; vẽ thử bảng Chính–Ma. Chưa xem tận mắt ranh giới Chính–Ma trong trận thật.
- Bài học: 2 lần chèn `//` vào giữa dòng dài làm hỏng cú pháp file (`voice.js` trên LIVE ~1 phút). Từ đó sửa trên bản sao, `node --check` xong mới chép vào.
- Tiếp theo: lỗi top 3 tặng quà (chờ ảnh); thưởng Chính–Ma; tạo tag `prod-*` nếu cần deploy web.

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
