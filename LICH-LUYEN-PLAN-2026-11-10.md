# LỊCH LUYỆN — kế hoạch game web riêng (10/11/2026)

Bản web tách thành hai phần:

1. **Hồ sơ LIVE**: xem và tùy chỉnh nhân vật LIVE (skin, pháp bảo, linh thú…). Không cày tu vi ở đây.
2. **Lịch luyện**: game tu tiên riêng của web. Người chơi bấm "Đi lịch luyện" thì tạo **phân thân**, chơi từ đầu, có cảnh giới, sức mạnh và trang bị riêng.

Mục tiêu của tài liệu này là dựng **nền cứng**: sau này thêm đạo lộ (class), cảnh giới, bản đồ, quái, đồ… chủ yếu bằng **thêm dữ liệu**, không phải sửa lõi.

---

## 1. Hiện trạng web và vấn đề

| Hiện trạng | Vấn đề cho game riêng |
|---|---|
| Web mượn nhân vật LIVE qua lại (`web/cloud/play-sessions.mjs`, `live-transfers.mjs`: `acquire → web → release`) | Phức tạp, dễ kẹt; mỗi lần deploy phải chờ bàn giao xong |
| Tu vi web cộng chung với LIVE; thưởng sự kiện LIVE đẩy tu vi rất nhanh | Người chơi chạm trần sớm, web không cân bằng được |
| Trận đánh do trình duyệt tự báo thắng (`finishTower` chỉ kiểm thời gian tối thiểu) | Có xếp hạng là có gian lận |
| Boss, vùng, tháp, vật liệu viết cứng trong `web/dungeon.mjs`, `web/progress.mjs` | Thêm class, map, cảnh giới phải sửa code rải rác |
| Dữ liệu web nằm trong `p.web` của hồ sơ LIVE (JSON trong bảng `players`) | Không truy vấn, xếp hạng, giao dịch an toàn được |

Giữ lại được: hạ tầng VPS + SQLite + deploy, tài khoản đăng nhập, giao diện PixiJS, đồ họa boss/linh thú, phần đánh bí cảnh (làm lớp hiển thị).

---

## 2. Ai sở hữu dữ liệu gì

| Dữ liệu | Chủ | Ghi chú |
|---|---|---|
| Nhân vật LIVE (cảnh giới, tu vi, skin sở hữu, linh thú, quà) | **Máy LIVE** | Web chỉ đọc qua đồng bộ như hiện tại |
| Lựa chọn trang phục của hồ sơ LIVE | Máy LIVE | Web gửi "yêu cầu đổi skin" nhỏ qua agent, không mượn cả nhân vật (giai đoạn 3) |
| **Phân thân** (cấp, cảnh giới web, đạo lộ, linh căn, trang bị, túi đồ, tiền tệ web, tông môn web) | **Server web** | Chỉ server web ghi. Không cần chuyển quyền |
| Tiên Ngọc (từ quà TikTok) | Tính từ LIVE, tiêu trên web | Giữ cách hiện tại: tổng coin quà − đã tiêu, có sổ cái |
| Danh hiệu lịch luyện hiện trên LIVE | Web tạo, LIVE hiển thị | Gửi một chiều qua agent; chỉ trang trí, không cộng sức mạnh LIVE |

Luật: **phân thân không bao giờ cộng tu vi cho LIVE, LIVE không cộng thẳng sức mạnh cho phân thân.** Ưu đãi cho người chơi LIVE lâu năm là **ưu đãi bản thể** (mục 5.3), có trần.

### 2.1 Hai kiểu người chơi — Lịch luyện phải trọn vẹn cho cả hai

| | Người chơi TikTok (có hồ sơ LIVE) | Người chơi **chỉ web** (không dùng TikTok) |
|---|---|---|
| Đăng ký | Tài khoản web + liên kết TikTok (như hiện tại) | Tài khoản web thường (đã có: `webOnly`) |
| Phần "Hồ sơ LIVE" | Có | **Ẩn**; chỉ có nút "Liên kết TikTok" (tùy chọn) |
| Lịch luyện | Chơi đầy đủ | **Chơi đầy đủ, không thiếu tính năng nào** |
| Ưu đãi bản thể | Có, trần +10% tu vi | Không có; bù bằng **Đạo Tâm** (mục 5.3) cùng trần |
| Tiên Ngọc | Từ quà TikTok + kiếm trong game | **Kiếm trong game** (thành tựu, mốc cảnh giới, tháp, mùa giải, đăng nhập 7 ngày) |
| Skin | Skin LIVE + skin phân thân | Skin phân thân (rơi, thành tựu, mùa giải, cửa hàng Tiên Ngọc) |
| Xếp hạng, tông môn, Luận Kiếm | Chung một máy chủ, chung bảng | Chung một máy chủ, chung bảng |

Nguyên tắc thiết kế:

- **Không có TikTok vẫn lên được đỉnh.** Mọi nội dung sức mạnh mở bằng chơi; TikTok chỉ cho thêm trang trí + tiện ích + chênh lệch nhỏ có trần.
- **Không tính năng nào gọi bắt buộc tới hồ sơ LIVE.** Mã Lịch luyện coi `live_player_id` là có thể rỗng; test chạy cả hai trường hợp.
- **Liên kết sau vẫn được.** Người chơi web liên kết TikTok về sau thì phân thân giữ nguyên, chỉ thêm skin LIVE + ưu đãi bản thể (không cộng dồn với Đạo Tâm, lấy cái cao hơn).
- **Lịch luyện chạy được khi máy LIVE tắt hoàn toàn**: người chơi chỉ web không bị ảnh hưởng.
- Đăng ký: tên tài khoản + mật khẩu như hiện tại; sau thêm đăng nhập Google để giảm quên mật khẩu (tùy chọn, giai đoạn 3). Chống tạo nhiều nick lấy quà tân thủ: giới hạn tạo tài khoản theo IP/ngày, quà tân thủ lớn mở dần theo ngày chơi.

---

## 3. Kiến trúc kỹ thuật

### 3.1 Thư mục và phân lớp

```
web/lich-luyen/
  content/            ← DỮ LIỆU: cảnh giới, đạo lộ, chiêu, đồ, quái, map, rơi đồ, nhiệm vụ…
    realms.js  paths.js  roots.js  skills.js  items.js  affixes.js
    monsters.js  maps.js  drops.js  quests.js  buildings.js  seasons.js
    index.js          ← gom + kiểm tra toàn bộ khi khởi động
  core/               ← LUẬT CHƠI THUẦN (không đọc ghi đĩa, không Date.now, không Math.random)
    stats.mjs  combat.mjs  rng.mjs  progression.mjs  loot.mjs
    economy.mjs  idle.mjs  formulas.mjs
  service/            ← giao tiếp DB + API
    db.mjs  migrations/  avatars.mjs  inventory.mjs  ledger.mjs
    battles.mjs  ranking.mjs  sect.mjs  mail.mjs  api.mjs
  sim/                ← công cụ cân bằng
    balance.mjs       ← giả lập người chơi 30–60 ngày
web/public/lich-luyen/ ← giao diện (chỉ hiển thị + gửi lệnh)
test/lich-luyen/      ← test
```

Ba nguyên tắc:

1. **Lõi thuần.** Mọi hàm trong `core/` nhận vào trạng thái + thời điểm + hạt giống ngẫu nhiên, trả ra kết quả. Nhờ vậy test được, giả lập cân bằng được, trận đánh tái lập được.
2. **Lõi không import `engine.mjs` (LIVE).** Hai game tiến hóa độc lập; sửa LIVE không làm vỡ web và ngược lại.
3. **Nội dung là dữ liệu.** Thêm đạo lộ, map, quái, cảnh giới = thêm mục trong `content/`. Lõi không có `if (path === 'kiem')`; khác biệt nằm ở dữ liệu (chỉ số, hệ số, chiêu, hiệu ứng).

### 3.2 Hệ thống nội dung (content registry)

- Mỗi mục có **ID cố định** dạng chữ (`path.kiem-tu`, `realm.truc-co`, `map.thanh-van-son`). Không bao giờ đổi hay tái dùng ID; bỏ thì đánh dấu `retired`.
- `content/index.js` **kiểm tra khi khởi động và trong test**: ID trùng, tham chiếu hỏng (quái rơi món không tồn tại), số âm, đường cong không tăng dần, chiêu thiếu hiệu ứng. Sai thì server không chạy.
- **Hiệu ứng ghép từ khối nhỏ**, không viết code riêng cho từng chiêu:
  `damage`, `dot` (đốt/độc), `heal`, `shield`, `stun`, `buff`, `debuff`, `lifesteal`, `summon`, `cleanse`.
  Ví dụ chiêu: `{id:'skill.van-kiem-quy-tong', cost:30, cd:3, effects:[{type:'damage', scale:'atk', mult:2.2, hits:5, element:'kim'}]}`.
  Thêm class mới = ghép khối mới; khối thật sự mới mới phải code (và test).
- `contentVersion` lưu kèm mỗi bản ghi trận, để xem lại trận cũ đúng luật cũ.

### 3.3 Cơ sở dữ liệu (SQLite trên VPS, cùng file `web.sqlite`, bảng mới tiền tố `ll_`)

| Bảng | Nội dung chính |
|---|---|
| `ll_avatars` | `id`, `account_id`, `live_player_id`, `name`, `path`, `root`, `realm`, `sub_realm`, `level`, `exp`, `power` (cột để xếp hạng), `season`, `payload` JSON, `version`, `updated` |
| `ll_items` | từng món có thuộc tính riêng: `id`, `avatar_id`, `item_id`, `rarity`, `level`, `affixes` JSON, `slot`/`equipped` |
| `ll_stacks` | đồ chồng (vật liệu, đan): `avatar_id`, `item_id`, `count` |
| `ll_ledger` | **sổ cái mọi thay đổi tiền tệ**: `avatar_id`, `currency`, `delta`, `balance_after`, `reason`, `ref`, `at` |
| `ll_battles` | `id`, `avatar_id`, `kind`, `seed`, `content_version`, `input` JSON, `result` JSON, `at` (đủ để chạy lại kiểm tra) |
| `ll_pvp` | điểm Luận Kiếm theo mùa, bản chụp đội hình phòng thủ |
| `ll_sects`, `ll_sect_members` | tông môn web |
| `ll_mail` | thư + quà đính kèm, nhận đúng một lần |
| `ll_seasons`, `ll_rank_snapshots` | mùa giải, bảng xếp hạng chốt |
| `ll_meta` | phiên bản schema |

- **Migration đánh số** (`migrations/001-init.sql`, `002-…`). Server tự chạy migration chưa áp dụng, trong transaction, **sao lưu file DB trước**. Không bao giờ sửa migration đã chạy.
- Ghi theo **transaction + khóa lạc quan** (`version`): hai tab cùng bấm không nhân đôi phần thưởng.
- Payload JSON cho phần ít truy vấn; cột riêng cho phần cần xếp hạng/lọc.

### 3.4 Chỉ số (stat pipeline)

Một hàm duy nhất `computeStats(avatar, content)` → chỉ số cuối. Thứ tự cố định:

1. Gốc theo cảnh giới + tiểu cảnh + cấp
2. Hệ số đạo lộ (Kiếm tu nhiều công, Thể tu nhiều máu/thủ…)
3. Linh căn (hệ ngũ hành + tốc độ tu)
4. Trang bị: cộng thẳng → cộng % → bộ đồ
5. Công pháp bị động, linh thú, động phủ, tông môn, ưu đãi bản thể (có trần)
6. Chỉ số dẫn xuất: lực chiến (`power`) = công thức cố định để xếp hạng

Mọi nguồn cộng chỉ số **khai báo `source`**, để giao diện hiện "chỉ số này từ đâu" và debug cân bằng. Danh sách chỉ số cố định từ đầu (thêm được, không đổi nghĩa): `hp, atk, def, spd, crit, critDmg, hit, dodge, elemAtk[5], elemRes[5], heal, shieldPow, cdr`.

### 3.5 Trận đánh: server quyết định

- **RNG có hạt giống** (`core/rng.mjs`, ví dụ mulberry32/xoshiro). Cùng trạng thái + cùng seed → cùng kết quả, chạy trên server hay máy nào cũng giống.
- **Mô phỏng trận theo nhịp (tick)** trên server: hai bên, hàng chờ hành động theo tốc độ, chiêu theo hồi chiêu và ưu tiên do người chơi cài. Server trả về **kết quả + nhật ký từng nhịp**; trình duyệt chỉ phát lại thành hoạt cảnh (dùng lại đồ họa bí cảnh hiện có).
- Hai kiểu chơi:
  - **Tự động** cho tháp, Luận Kiếm, Tâm Ma Kiếp, quét ải, tông môn chiến: server mô phỏng toàn bộ, không gian lận được.
  - **Thao tác tay** (joystick hiện tại) chỉ cho ải thường, là phần vui. Thưởng **có trần ngày** và kiểm tra hợp lý (sát thương/giây tối đa theo chỉ số server tính). Không dùng cho xếp hạng.
- Trận lưu `seed + input + contentVersion` để **chạy lại kiểm tra** khi nghi gian lận hoặc khi người chơi khiếu nại.

### 3.6 Kinh tế

- Tiền tệ khai báo trong `content/` (`linh-thach`, `tien-ngoc`, `cong-hien`, `vinh-du`, `tinh-thach-thap`…), mỗi loại ghi rõ **nguồn vào** và **chỗ tiêu**.
- **Mọi** thay đổi đi qua `ledger.mjs` (không ai sửa thẳng số dư) → soi gian lận và hoàn tác được.
- Trần ngày cho nguồn vào chính; giả lập cân bằng (`sim/balance.mjs`) phải cho thấy không có vòng lặp tạo tiền vô hạn.
- Tiên Ngọc chỉ mua **tiện ích + trang trí** (thể lực, lượt quét, skin phân thân, ô túi). Không bán thẳng cảnh giới hay đồ mạnh nhất.

### 3.7 Treo máy (offline)

Không chạy cron cho từng người. Lưu `lastTick`; khi người chơi mở game, tính bù `min(now − lastTick, trần giờ) × tốc độ`. Áp dụng cho tu luyện offline, động phủ sản xuất, thể lực hồi.

### 3.8 Thời gian, sự kiện, mùa giải

- Mọi luật thời gian dùng **giờ Việt Nam**, reset ngày 05:00, tuần từ thứ Hai (giống `period-tops.mjs`).
- Lịch sự kiện web là dữ liệu (`content/seasons.js` + bảng `ll_seasons`), bật/tắt từ trang quản lý.

### 3.9 Cầu nối LIVE

- **Vào web:** đồng bộ hiện có đã mang hồ sơ LIVE lên VPS. Phân thân đọc từ đó: skin/linh thú sở hữu, cảnh giới LIVE (tính ưu đãi bản thể), coin quà (Tiên Ngọc).
- **Ra LIVE (giai đoạn 3):** thêm loại tin nhỏ trong `web/cloud/protocol.mjs`: `title` (danh hiệu lịch luyện) và `cosmetic` (đổi skin đang mặc của hồ sơ LIVE). Agent chuyển về máy LIVE, LIVE tự áp dụng. Khi đó bỏ được cơ chế mượn cả nhân vật.
- Lịch luyện **chạy được khi máy LIVE tắt** (chỉ không cập nhật Tiên Ngọc mới).

### 3.10 Chống gian lận, giới hạn

- Giới hạn tần suất theo tài khoản + IP cho mọi API ghi.
- Mọi phần thưởng tính trên server; client không gửi số lượng thưởng.
- Báo cáo bất thường: tốc độ lên cấp, lực chiến tăng đột biến, tiền tệ ngoài đường cong giả lập → thêm vào `SOI-BAT-THUONG.md`.

### 3.11 Test và cân bằng

- Test đơn vị cho mọi hàm `core/`.
- **Test vàng cho trận đánh:** seed cố định → kết quả cố định; đổi công thức mà kết quả đổi thì test báo, người sửa phải xác nhận.
- **Kiểm tra nội dung** chạy trong test.
- **Giả lập cân bằng:** `node web/lich-luyen/sim/balance.mjs --days 60 --profile casual|active|whale` in ra đường cảnh giới theo ngày, tiền tệ tích lũy, ngày chạm trần. Mỗi lần thêm cảnh giới/nguồn thưởng phải chạy lại.
- Chạy chung `npm run test:web`; workflow deploy đã chạy test trước khi lên prod.

### 3.12 Công cụ vận hành

Trang quản lý thêm mục Lịch luyện: tra phân thân, xem sổ cái, gửi thư bù, bật/tắt sự kiện, chốt mùa, cờ tính năng (`LICH_LUYEN=0/1`, `LICH_LUYEN_BETA=accountIds`).

---

## 4. Thiết kế game

Tên riêng đều **tự sáng tác**. Không dùng nhân vật hay tên có chủ (Vương Lâm, Hàn Lập, Doraemon…) trong Lịch luyện.

### 4.1 Đường tu

- **Đại cảnh giới** × **4 tiểu cảnh** (Sơ kỳ → Trung kỳ → Hậu kỳ → Viên mãn) × **cấp** trong tiểu cảnh.
- Lên tiểu cảnh: đủ tu vi. Lên đại cảnh: đủ tu vi + vật phẩm đột phá + **vượt Tâm Ma Kiếp** (trận tự động, đánh với "tâm ma" là bản sao của chính mình mạnh hơn một chút; thua thì mất một ít tu vi, có lượt thử lại).
- Ra mắt với **6 đại cảnh** (Luyện Khí → Trúc Cơ → Kết Đan → Nguyên Anh → Hóa Thần → Luyện Hư). Danh sách là dữ liệu: mỗi mùa mở thêm 1–2 cảnh. Cảnh giới web **độc lập** với 24 cảnh giới LIVE.
- Đường cong tu vi kéo dài ra bằng tiểu cảnh và Tâm Ma Kiếp, không bằng cách thêm cảnh giới vô tận.

### 4.2 Đạo lộ (class)

Chọn khi tạo phân thân; đổi được (tốn vật phẩm, có thời gian chờ).

| Đạo lộ | Vai trò | Ra mắt |
|---|---|---|
| **Kiếm tu** | Sát thương đơn mục tiêu, bạo kích | Giai đoạn 1 |
| **Thể tu** | Máu, thủ, phản đòn, hút máu | Giai đoạn 1 |
| Pháp tu | Sát thương nguyên tố diện rộng, đốt | Giai đoạn 4 |
| Đan tu | Hồi máu, khiên, buff đồng đội (có ích trong tông môn chiến) | Giai đoạn 4 |
| Trận/Phù tu | Khống chế, debuff, triệu hồi | Sau |

Mỗi đạo lộ là dữ liệu: hệ số chỉ số, loại vũ khí, cây công pháp (khoảng 12–20 nút), 6–8 chiêu chủ động, 1 tuyệt kỹ. Mỗi đạo lộ có 2 nhánh trong cây (ví dụ Kiếm tu: Vạn Kiếm / Nhất Kiếm), để cùng class vẫn có cách chơi khác nhau.

### 4.3 Linh căn

Ngẫu nhiên khi tạo: 1–3 hệ trong Kim, Mộc, Thủy, Hỏa, Thổ; hiếm có biến dị Lôi, Băng, Phong. Ảnh hưởng tốc độ tu, sát thương hệ, kháng hệ. Đổi bằng "Tẩy Tủy Đan" (rơi hoặc mua bằng Tiên Ngọc, có giới hạn). Ít linh căn thì tu nhanh hơn (đơn linh căn hiếm, mạnh), đúng chất tu tiên.

### 4.4 Chiêu và công pháp

- 3 ô chiêu chủ động + 1 tuyệt kỹ + 2 ô bị động.
- Người chơi cài **thứ tự ưu tiên** cho trận tự động.
- Sách công pháp rơi từ map/tháp để mở nút trong cây.

### 4.5 Trang bị

- 6 ô: vũ khí, giáp, mũ, giày, ngọc bội, pháp bảo.
- Phẩm: Phàm → Linh → Huyền → Địa → Thiên → Tiên.
- Mỗi món có 1–4 thuộc tính phụ ngẫu nhiên từ bảng (`content/affixes.js`); có bộ đồ 2/4 món.
- Cường hóa +1 → +15 (đưa hệ +10 hiện tại vào đây), luyện hóa đồ thừa ra vật liệu (chỗ tiêu đồ).
- **Skin chỉ là trang trí.** Skin từ LIVE mặc được cho phân thân nhưng không cộng chỉ số.

### 4.6 Bản đồ

- Mỗi đại cảnh mở 1–2 **vùng**: Thanh Vân Sơn, Hắc Phong Lĩnh, Vạn Thú Lâm…
- Mỗi vùng có 10–15 ải, 1 boss vùng, điểm hái thảo/khai khoáng, quái riêng và bảng rơi.
- Ải qua 3 sao thì mở **quét nhanh**.
- Map là dữ liệu: nền, vị trí ải, quái, rơi đồ. Thêm map = ảnh nền + một mục dữ liệu.

### 4.7 Nội dung lặp lại cuối game

- **Tháp Trấn Yêu:** vô hạn tầng (công thức tăng dần), mỗi 10 tầng có boss cơ chế; xếp hạng theo tuần; thưởng mốc.
- **Luận Kiếm:** PvP bất đồng bộ, đánh với bản chụp đội hình người khác; điểm Elo; mùa 2 tuần; danh hiệu top hiện cả trên LIVE.
- **Boss thế giới:** nối với boss LIVE như hiện tại; xếp hạng sát thương.
- **Bí cảnh luân phiên:** mỗi tuần một luật đặc biệt (ví dụ "hỏa hệ ×2").

### 4.8 Động phủ

Công trình sản xuất khi offline: Linh Điền (thảo), Linh Mạch (linh thạch), Đan Phòng (luyện đan), Luyện Khí Thất (đồ), Tụ Linh Trận (tu vi offline). Nâng cấp bằng tài nguyên. Là lý do vào game mỗi ngày mà không ép cày.

### 4.9 Xã hội

- **Tông môn web** (giai đoạn 3): lập/gia nhập, cống hiến, cửa hàng tông, bí cảnh tông, **tông môn chiến tuần** (trận tự động theo đội hình).
- **Sư đồ:** sư phụ nhận thưởng khi đệ tử lên đại cảnh.
- **Đạo lữ:** dùng lại ý tưởng LIVE, cộng chỉ số nhỏ khi cùng đánh.

### 4.10 Mùa giải

- Mỗi mùa 6–8 tuần. Đầu mùa: mở cảnh giới hoặc vùng mới, luật mùa mới.
- Cuối mùa: chốt bảng, phát danh hiệu/skin phân thân vĩnh viễn.
- **Không xóa phân thân.** Người mới vào giữa mùa có tăng tốc bắt kịp (tu vi ×2 dưới mức trung bình máy chủ) để không bị bỏ quá xa.

### 4.11 Thu nhập

Giữ đường quà TikTok → Tiên Ngọc. Người chơi chỉ web kiếm Tiên Ngọc trong game (ít hơn, có trần tuần), nên mọi thứ bán bằng Tiên Ngọc phải là thứ **không có cũng chơi tốt**. Chưa mở cổng nạp trực tiếp. Game online thu tiền thật ở Việt Nam có thể phải xin giấy phép (Nghị định 147/2024, cần kiểm tra) — làm rõ trước khi mở nạp.

---

## 5. Phân thân

### 5.1 Tạo

Bấm **"Đi lịch luyện"** trên web → chọn đạo lộ → quay linh căn (một lần quay lại miễn phí) → đặt tên phân thân (mặc định theo tên LIVE) → nhận gói tân thủ qua thư.

### 5.2 Một tài khoản một phân thân

Một tài khoản một phân thân cho mỗi mùa. Kiến trúc vẫn để `avatar_id` riêng, sau này mở thêm ô nếu cần.

### 5.3 Ưu đãi bản thể (cho người chơi LIVE lâu)

Theo cảnh giới LIVE cao nhất, **có trần**:

- Tu vi phân thân +1% mỗi 2 cảnh giới LIVE, tối đa +10%.
- Danh hiệu "Bản thể <cảnh giới>" hiện cạnh tên phân thân.
- Gói khởi đầu theo VIP (vật liệu, không phải đồ mạnh).

Đủ để người chơi lâu thấy được ghi nhận, không đủ để họ vào là đứng đầu.

**Đạo Tâm (cho người chơi chỉ web):** kiếm bằng thành tựu, mỗi mốc cộng tu vi phân thân, **cùng trần +10%** như ưu đãi bản thể. Ai có cả hai thì lấy cái cao hơn, không cộng dồn. Hai kiểu người chơi đứng trên cùng một vạch xuất phát về sức mạnh.

### 5.4 Dữ liệu web cũ

Những gì người chơi đã làm trên web (cường hóa, cấp linh thú web, tầng tháp, vật liệu trong `p.web`) đổi thành **gói quà đổi tương ứng** gửi vào thư phân thân. Hồ sơ LIVE giữ nguyên. Phần chơi cũ trên web tắt khi Lịch luyện mở, để không còn hai đường cày song song.

---

## 6. Lộ trình

Mỗi giai đoạn: chạy sau cờ tính năng → thử với vài tài khoản beta → mở cho tất cả. Thời gian là ước lượng.

### Giai đoạn 0 — Nền (khoảng 1–1,5 tuần, chưa có gì để chơi)

- Thư mục `web/lich-luyen/`; content registry + kiểm tra; 2 đạo lộ, 3 cảnh giới, 1 map **dữ liệu mẫu**
- Migration `001` + bảng `ll_*` + sao lưu trước migration
- `rng`, `stats`, `combat` (mô phỏng tick + nhật ký), `ledger`, `idle`
- Test đơn vị, test vàng trận đánh, giả lập cân bằng chạy được
- Cờ `LICH_LUYEN` (mặc định tắt trên prod)

**Xong khi:** giả lập 60 ngày ra đường cảnh giới hợp lý; cùng seed cho cùng trận; thêm một quái mới chỉ cần thêm dữ liệu.

### Giai đoạn 1 — Vòng chơi lõi (khoảng 2 tuần)

- Tạo phân thân, Kiếm tu + Thể tu, linh căn
- Tu luyện online/offline, 3 đại cảnh × 4 tiểu cảnh, Tâm Ma Kiếp
- 2 vùng map; trang bị 6 ô + phẩm + thuộc tính phụ + cường hóa
- Ải thao tác tay (dùng lại `battle.js` làm lớp hiển thị) + quét nhanh
- Nhiệm vụ ngày, thư, gói đổi dữ liệu web cũ
- Giao diện: nút "Đi lịch luyện", màn phân thân, túi đồ, bản đồ

**Xong khi:** người chơi mới chơi được khoảng 1 tuần không hết việc; không API nào cho client tự báo thưởng; **một tài khoản chỉ web (không TikTok) chơi trọn vòng lõi** và test tự động chạy cả hai kiểu tài khoản.

### Giai đoạn 2 — Lặp lại (khoảng 1,5–2 tuần)

Tháp Trấn Yêu (server mô phỏng), Luận Kiếm bất đồng bộ + mùa 2 tuần, động phủ (3 công trình), cảnh giới 4–6, vùng 3–4, bảng xếp hạng.

### Giai đoạn 3 — Xã hội và cầu nối LIVE (khoảng 2 tuần)

Tông môn web + tông môn chiến tuần, sư đồ, tin `title`/`cosmetic` qua agent (danh hiệu lên LIVE, đổi skin hồ sơ không cần mượn nhân vật), gỡ cơ chế mượn nhân vật cũ.

### Giai đoạn 4 — Mùa 1 và mở rộng

Pháp tu + Đan tu, bí cảnh luân phiên, chốt mùa và thưởng, sự kiện LIVE "Tu Tiên Giới khai mở".

---

## 7. Rủi ro

| Rủi ro | Giảm thiểu |
|---|---|
| Người chơi cũ thấy "phải chơi lại" | Hồ sơ LIVE giữ nguyên; ưu đãi bản thể; gói đổi dữ liệu web; giải thích "phân thân" trên LIVE |
| Cân bằng sai làm hết nội dung sớm lần nữa | Giả lập cân bằng bắt buộc trước khi mở cảnh giới/thưởng mới; trần ngày |
| VPS yếu (gói 1 vCPU) khi mô phỏng nhiều trận | Trận nhỏ (vài nghìn tick, vài ms); giới hạn tần suất; đo `/api/perf` trước mỗi giai đoạn |
| Đổi schema làm hỏng dữ liệu | Migration đánh số + sao lưu tự động + test migration trên bản sao DB prod |
| Nội dung (ảnh) chậm vì Codex hết hạn mức | Giai đoạn 0–1 dùng lại ảnh có sẵn; ảnh là dữ liệu, thay sau không đổi code |
| Người chơi chỉ web thấy thiệt so với người có TikTok | Đạo Tâm cùng trần với ưu đãi bản thể; TikTok chỉ thêm trang trí + tiện ích; Tiên Ngọc kiếm được trong game |
| Nick ảo lấy quà tân thủ | Giới hạn đăng ký theo IP/ngày; quà tân thủ mở dần theo ngày chơi |
| Hai game cùng phát triển làm chậm LIVE | Lõi tách khỏi `engine.mjs`; sửa LIVE không chạm web và ngược lại |

---

## 8. Cần chủ game chốt

1. **Trận đánh:** tự động là chính (server quyết định) + ải thao tác tay cho vui. Đề xuất: **đồng ý**.
2. **Ra mắt mấy đạo lộ:** 2 (Kiếm tu, Thể tu). Đề xuất: **2**, thêm dần theo mùa.
3. **Tên cảnh giới web:** dùng 6 cảnh quen thuộc (Luyện Khí → Luyện Hư) hay bộ tên riêng.
4. **Dữ liệu web cũ:** đổi thành gói quà rồi tắt phần chơi cũ. Đề xuất: **đồng ý**.
5. **Độ dài mùa:** 6 hay 8 tuần.
6. **Người chơi chỉ web:** chung máy chủ, chung bảng xếp hạng với người chơi TikTok. Đề xuất: **chung**.
