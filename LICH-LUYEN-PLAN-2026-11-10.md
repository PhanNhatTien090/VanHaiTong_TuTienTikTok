# LỊCH LUYỆN — kế hoạch game web riêng (bản 2, 10/11/2026)

Bản web tách thành hai phần:

1. **Hồ sơ LIVE**: xem và tùy chỉnh nhân vật LIVE (skin, pháp bảo, linh thú…). Không cày tu vi ở đây. Người chơi không dùng TikTok thì không thấy phần này.
2. **Lịch luyện**: game tu tiên **đánh tay** riêng của web. Bấm "Đi lịch luyện" thì tạo **phân thân**, chơi từ đầu: cảnh giới, chiêu, đồ, tông môn riêng.

Mục tiêu: dựng **nền cứng**. Sau này thêm class, cảnh giới, map, quái, chiêu, kỳ ngộ… chủ yếu bằng **thêm dữ liệu**, không sửa lõi.

## 0. Những điều chủ game đã chốt

| Điểm | Chốt |
|---|---|
| Kiểu đánh | **Đánh tay**: nút di chuyển + nút đánh + nút chiêu, như bí cảnh web hiện tại |
| Class lúc ra mắt | **3 đạo lộ** |
| Tên cảnh giới | **Theo LIVE**. Luyện Khí tầng 1 → tầng 9 → Viên Mãn; từ Trúc Cơ trở đi: Sơ kỳ → Trung kỳ → Hậu kỳ → Viên Mãn |
| Mùa giải | **6 tuần** |
| Người chơi không dùng TikTok | Chơi trọn vẹn, công bằng (mục 2.1) |

---

## 1. Học từ Quỷ Cốc Bát Hoang

Mình đã đọc **bảng cấu hình gốc** của bản cài trên máy (`C:\GAME\quycocbathoang\…\Mod\modFQA\配置修改教程\配置（只读）Json格式`, 743 bảng JSON chính thức cho người làm mod). Đây là cách họ làm, không phải đoán.

### 1.1 Họ làm gì

| Hệ thống | Cách Quỷ Cốc làm (số liệu từ bảng) | Lấy gì cho Lịch luyện |
|---|---|---|
| **Cảnh giới** (`RoleGrade`, 44 dòng) | 10 đại cảnh × Sơ/Trung/Hậu kỳ. Tu vi cần tăng khoảng 1,3–1,6 lần mỗi bậc. Lên đại cảnh tăng thọ nguyên, điểm thuộc tính | Bảng cảnh giới là dữ liệu; đường cong tăng đều |
| **Phẩm chất đột phá** | Trúc Cơ có 3 phẩm (Phàm/Địa/Thiên), Kim Đan 5 phẩm, Nguyên Anh 3 phẩm. Gom **càng nhiều vật phẩm đột phá** thì phẩm càng cao → **nhiều điểm thuộc tính** (Trúc Cơ: 12 → 16 → 20) và **nhiều lượt chọn mệnh cách** (1 → 2 → 3) | **Lõi đáng học nhất.** Đột phá không chỉ "đủ tu vi là lên" mà là một mục tiêu phải chuẩn bị |
| **Mệnh cách / khí vận** (`FateFeature` 201, `RoleCreateFeature` 1.148) | Mỗi lần đột phá đại cảnh chọn 1 trong vài **mệnh cách** ngẫu nhiên. Khí vận tiên thiên khi tạo nhân vật; khí vận hậu thiên có thời hạn, đến từ kỳ ngộ | Mỗi lần đột phá là một lần "viết lại vận mệnh"; hai người cùng class thành hai lối chơi |
| **Ô chiêu** | **Võ kỹ** (đánh chính), **Tuyệt kỹ** (đặc biệt), **Thân pháp** (lướt né), **Thần thông** (tối thượng, mở muộn), **Tâm pháp** (bị động); 5 ô vật phẩm chiến đấu (đan, phù) | Dùng đúng bộ khung này; vừa với 4–5 nút trên điện thoại |
| **Tiền tố bí tịch** (`BattleSkillPrefixValue` 1.657) | Mỗi cuốn bí tịch có **tiền tố ngẫu nhiên** theo phẩm, tỉ lệ khác nhau theo phẩm (11 phẩm), cần tư chất để mở. Cùng một chiêu mỗi cuốn mỗi khác | Vòng "săn bí tịch tốt" để lặp lại lâu không chán |
| **Linh căn** | 6 hệ: Hỏa, Thủy, Lôi, Phong, Thổ, Mộc. Tư chất vũ khí: Kiếm, Đao, Thương, Quyền, Chưởng, Chỉ | Linh căn quyết định Tâm pháp hợp; tư chất vũ khí thay bằng đạo lộ |
| **Đạo Tâm** (`TaoistHeart`, 21 loại) | Chọn một đạo tâm (Vô Danh, Ý Chí, Thuận Thiên, Thiện…). Mỗi đạo tâm có **luật cấm** (làm trái thì mất điểm), mở **nhóm mệnh cách riêng** khi đột phá; tăng bằng luận đạo, tỷ thí, song tu | Đạo Tâm ở Kim Đan: vừa là lựa chọn nhập vai, vừa là đường build |
| **Kỳ ngộ** (`WorldFortuitousEventBase` 830 + `FortuitousEvent` 776) | Hàng nghìn sự kiện ngẫu nhiên khi đi trên bản đồ, có lựa chọn và kết quả | Nội dung rẻ (chữ + lựa chọn), làm thế giới sống; thêm bằng dữ liệu |
| **Tông môn** | Bậc: Tân thủ → Ngoại môn → Đệ tử → Chân truyền → Trưởng lão → Đại trưởng lão → Tông chủ. **Lên chức bằng thách đấu người đang giữ chức**; nhiệm vụ tông (`SchoolTaskTypeBase` 241 loại) | Thang chức + thách đấu là cách giữ chân xã hội rất hay |
| **Kỹ nghệ** | Luyện đan (168 công thức), luyện khí, họa phù, phong thủy, hái thuốc, khai khoáng | Thêm dần sau, cùng một khung "nghề" |
| **Pháp bảo có khí linh** (`ArtifactSpriteTalent` 1.408) | Pháp bảo có linh, có thiên phú, có đối thoại | Ý tưởng cho pháp bảo cao cấp mùa sau |
| **Cách làm nội dung** | Mọi thứ là **bảng Excel → JSON** có ID số; chữ hiển thị tách riêng một bảng `LocalText` (Trung/Phồn/Anh) | Nội dung là dữ liệu; chữ tách bảng riêng để sau dịch tiếng Anh |
| **Chuỗi chiêu** | Chiêu → đòn → hiệu ứng → đạn bay/vệt (`BattleSkillBase → BattleSkillAttack → BattleSkillEffect → BattleMissile`) | Đúng mô hình "ghép khối" cho chiêu (mục 3.4) |

Người chơi khen nhiều nhất: **đột phá như viết lại vận mệnh, build đa dạng, kỳ ngộ ngẫu nhiên nên chơi lại không chán**. Chỗ bị chê: chiến đấu chưa hay, đột phá về sau lâu.

### 1.2 Không lấy

- **Thọ nguyên đếm ngược và chết là hết.** Hợp game chơi một mình, không hợp game online có mùa.
- **Thế giới NPC tự sống phức tạp.** Quá nặng cho VPS và cho một người làm; thay bằng kỳ ngộ + người chơi thật.
- **Tên, nhân vật, hình ảnh của Quỷ Cốc.** Chỉ học cách thiết kế; mọi tên và hình tự sáng tác.

---

## 2. Ai sở hữu dữ liệu gì

| Dữ liệu | Chủ | Ghi chú |
|---|---|---|
| Nhân vật LIVE | **Máy LIVE** | Web chỉ đọc qua đồng bộ |
| **Phân thân** và mọi thứ của Lịch luyện | **Server web** | Chỉ server web ghi; không mượn nhân vật qua lại |
| Tiên Ngọc từ quà TikTok | Tính từ LIVE, tiêu trên web | Có sổ cái |
| Danh hiệu lịch luyện hiện trên LIVE | Web tạo, LIVE hiển thị | Chỉ trang trí |

Luật: **phân thân không cộng tu vi cho LIVE; LIVE không cộng thẳng sức mạnh cho phân thân.**

### 2.1 Người chơi TikTok và người chơi chỉ web

| | Có TikTok | Chỉ web |
|---|---|---|
| Lịch luyện | Đầy đủ | **Đầy đủ** |
| Hồ sơ LIVE | Có | Ẩn; nút "Liên kết TikTok" tùy chọn |
| Ưu đãi | **Bản thể**: +1% tu vi mỗi 2 cảnh LIVE, tối đa +10% | **Đạo Nghiệp**: từ thành tựu, cùng trần +10% |
| Tiên Ngọc | Quà TikTok + kiếm trong game | Kiếm trong game (có trần tuần) |
| Skin | Skin LIVE + skin phân thân | Skin phân thân |
| Máy chủ, xếp hạng, tông môn | Chung | Chung |

- Không TikTok vẫn lên đỉnh được. TikTok chỉ thêm trang trí, tiện ích và chênh lệch nhỏ có trần.
- Có cả Bản thể lẫn Đạo Nghiệp thì lấy cái cao hơn, không cộng dồn.
- Mã Lịch luyện coi liên kết LIVE là **có thể rỗng**; test chạy cả hai kiểu tài khoản.
- Lịch luyện chạy được khi máy LIVE tắt.
- Chống nick ảo: giới hạn tạo tài khoản theo IP mỗi ngày; quà tân thủ mở dần theo ngày chơi.

---

## 3. Kiến trúc kỹ thuật

### 3.1 Thư mục

```
web/lich-luyen/
  content/                 DỮ LIỆU (thêm nội dung = sửa ở đây)
    realms.js              cảnh giới + tiểu cảnh + phẩm đột phá
    paths.js               đạo lộ (class)
    roots.js               linh căn
    skills/                chiêu theo đạo lộ + tâm pháp + thần thông
    prefixes.js            tiền tố bí tịch
    fates.js               mệnh cách, khí vận
    hearts.js              đạo tâm
    items.js affixes.js sets.js
    monsters.js            quái + AI hành vi
    maps/                  mỗi châu một file: nút bản đồ, ải, boss, điểm khai thác
    events/                kỳ ngộ (sự kiện có lựa chọn)
    quests.js buildings.js seasons.js
    text/vi.js             mọi câu chữ hiển thị (sau thêm en.js)
    balance/*.csv          bảng số liệu cân bằng (mở được bằng Excel)
    index.js               gom + kiểm tra toàn bộ
  core/                    LUẬT CHƠI THUẦN, chạy được cả trình duyệt lẫn server
    rng.mjs fixed.mjs      ngẫu nhiên có hạt giống, số học cố định
    sim/                   MÔ PHỎNG TRẬN ĐÁNH (mục 3.3)
    stats.mjs progression.mjs breakthrough.mjs loot.mjs
    prefixes.mjs fates.mjs events.mjs economy.mjs idle.mjs
  service/                 DB + API (chỉ server)
    db.mjs migrations/ avatars.mjs inventory.mjs ledger.mjs
    battles.mjs verify-worker.mjs ranking.mjs sect.mjs mail.mjs season.mjs api.mjs
  sim-tools/               công cụ cân bằng
web/public/lich-luyen/     giao diện: vẽ, âm thanh, nút bấm (dùng chung core/sim)
test/lich-luyen/
```

Nguyên tắc:

1. **`core/` thuần**: không đọc đĩa, không lấy giờ thật, không dùng `Math.random`. Cùng đầu vào → cùng kết quả.
2. **Không import `engine.mjs` (LIVE)**. Hai game độc lập.
3. **Không viết `if (class === 'kiem')` trong lõi.** Khác biệt giữa các class nằm ở dữ liệu.
4. **ID chữ cố định, không bao giờ đổi hay tái dùng** (`skill.kiem.luu-van`, `map.thanh-van-chau`). Bỏ thì đánh dấu `retired`.
5. **Mọi chữ hiển thị đi qua `text/`** (học `LocalText` của Quỷ Cốc), để sau dịch được.

### 3.2 Nội dung là dữ liệu + kiểm tra

- `content/index.js` kiểm tra khi khởi động và khi chạy test: ID trùng, tham chiếu hỏng, số âm, đường cong không tăng, chiêu thiếu hiệu ứng, kỳ ngộ có lựa chọn dẫn vào ngõ cụt. **Sai là server không chạy và test đỏ.**
- Số liệu cân bằng (tu vi từng bậc, chỉ số quái, tỉ lệ rơi) nằm trong **CSV**: chủ game mở Excel sửa được, như Quỷ Cốc dùng Excel.
- `contentVersion` (mã băm nội dung) lưu kèm mỗi trận, để kiểm tra lại trận cũ đúng luật cũ.

### 3.3 Trận đánh tay mà vẫn chống gian lận: mô phỏng tất định

Đây là phần quan trọng nhất của nền.

**Ý tưởng:** cùng một bộ mô phỏng trận (`core/sim/`) chạy **trong trình duyệt khi chơi** và **trên server khi kiểm tra**.

1. Bắt đầu ải: server cấp `seed`, `battleId`, chỉ số phân thân, `contentVersion`.
2. Người chơi đánh tay. Trình duyệt chạy mô phỏng **30 nhịp/giây cố định**, mỗi nhịp ghi **đầu vào**: hướng joystick (lượng tử 32 hướng) + các nút bấm. Đầu vào nén lại vài KB.
3. Hết trận: gửi **đầu vào**, không gửi "tôi thắng".
4. Server **chạy lại** mô phỏng với cùng seed + đầu vào → tự ra kết quả → phát thưởng. Kết quả khác trình duyệt báo = gian lận/lỗi → không thưởng, ghi log.

**Luật để mô phỏng tất định** (nguồn tham khảo ở cuối):

- Bước thời gian cố định; vẽ hình tách riêng (nội suy cho mượt 60 FPS).
- Vị trí, máu, sát thương dùng **số nguyên** (vị trí đơn vị 1/100 px). Không dùng `Math.sin/cos/random` trong mô phỏng: hướng lấy từ **bảng 32/64 hướng viết sẵn**, ngẫu nhiên từ `rng.mjs`.
- Duyệt thực thể theo thứ tự ID cố định. Không đọc giờ thật.
- **Test vàng**: trận ghi sẵn (seed + đầu vào) phải ra đúng kết quả đã lưu, chạy trên Node và trên trình duyệt (Chrome headless).

**Một bộ mô phỏng dùng cho mọi chế độ:**

| Chế độ | Người chơi điều khiển bằng | Kiểm tra |
|---|---|---|
| Ải, boss, bí cảnh | Tay (joystick + nút) | Server chạy lại đầu vào |
| Lôi kiếp, tâm ma | Tay | Server chạy lại |
| Quét nhanh (ải đã 3 sao) | AI | Server tự chạy |
| Luận Kiếm (PvP bất đồng bộ) | Tay, đấu với **AI điều khiển bản chụp** người khác | Server chạy lại |
| Tông môn chiến | AI cả hai bên | Server tự chạy |
| Tự động chiến đấu (tùy chọn, thưởng giảm) | AI | Server tự chạy |

**Chi phí:** trận 3 phút = 5.400 nhịp × vài chục thực thể → khoảng vài chục ms trên server. Chạy kiểm tra trong **worker thread** + hàng đợi để không làm lag API. Giới hạn số trận mỗi phút mỗi người. Đo trên VPS ở giai đoạn 0.

### 3.4 Chiêu thức ghép khối (theo chuỗi chiêu của Quỷ Cốc)

```
Chiêu (skill)  → thời gian vận, hồi chiêu, linh lực, nút
  └ Đòn (action) theo dòng thời gian: lướt, vung, bắn, đặt trận…
      └ Vùng trúng (hitbox) / Đạn bay (missile): hình dạng, tốc độ, xuyên, nảy
          └ Hiệu ứng (effect): sát thương, đốt, độc, choáng, đẩy lùi, hút máu, khiên, hồi máu, buff, debuff, triệu hồi
              └ Trạng thái (status): thời gian, cộng dồn, tick
```

- Thêm chiêu mới = ghép khối trong `content/skills/`. Khối thật sự mới mới phải viết code + test.
- **Tiền tố bí tịch** gắn vào bất kỳ tầng nào: "+1 đạn bay", "trúng thì đốt", "lướt để lại kiếm khí", "hồi chiêu −15%".
- Hiệu ứng hình và âm thanh là **lớp vẽ riêng**, tra theo ID, không nằm trong mô phỏng.

### 3.5 Chỉ số

Một hàm `computeStats(avatar)`, thứ tự cố định:

1. Gốc theo cảnh giới + tiểu cảnh
2. **Phẩm đột phá**
3. Đạo lộ
4. Linh căn
5. Trang bị: cộng thẳng → cộng % → bộ đồ
6. Tâm pháp
7. Mệnh cách, đạo tâm
8. Động phủ, tông môn
9. Bản thể / Đạo Nghiệp (có trần)

Mọi nguồn ghi `source` để giao diện hiện "chỉ số từ đâu".

Bộ chỉ số cố định từ đầu: `hp, mp (linh lực), atk, def, spd (tốc di chuyển), crit, critDmg, dodge, cdr, elemAtk[6], elemRes[6], healPow, shieldPow`.

### 3.6 Cơ sở dữ liệu (SQLite trên VPS, bảng tiền tố `ll_`)

| Bảng | Nội dung |
|---|---|
| `ll_avatars` | phân thân: tài khoản, liên kết LIVE (có thể rỗng), đạo lộ, linh căn, cảnh giới, tiểu cảnh, `power`, mùa, payload, `version` |
| `ll_items` | đồ có thuộc tính riêng (trang bị, bí tịch kèm tiền tố) |
| `ll_stacks` | đồ chồng (vật liệu, đan, phù) |
| `ll_ledger` | sổ cái mọi thay đổi tiền tệ: ai, bao nhiêu, vì sao, lúc nào |
| `ll_battles` | seed, contentVersion, đầu vào nén, kết quả, trạng thái kiểm tra |
| `ll_breakthroughs` | lịch sử đột phá: phẩm, mệnh cách đã chọn |
| `ll_events_seen` | kỳ ngộ đã gặp (tránh lặp, chuỗi kỳ ngộ) |
| `ll_pvp`, `ll_sects`, `ll_sect_members`, `ll_mail`, `ll_seasons`, `ll_rank_snapshots`, `ll_meta` | |

- **Migration đánh số**, tự sao lưu DB trước khi chạy, không sửa migration đã chạy.
- Ghi bằng transaction + `version` (khóa lạc quan): hai tab cùng bấm không nhân đôi thưởng.

### 3.7 Kinh tế, offline, thời gian

- Tiền tệ khai báo trong dữ liệu, mỗi loại có nguồn vào và chỗ tiêu. Mọi thay đổi đi qua `ledger`. Có trần ngày.
- **Offline (bế quan, động phủ):** không chạy cron; khi mở game thì tính bù theo thời gian, có trần giờ.
- Giờ Việt Nam, reset 05:00, tuần từ thứ Hai.

### 3.8 Cầu nối LIVE

- **Vào:** đồng bộ có sẵn → cảnh giới LIVE (ưu đãi bản thể), skin sở hữu, coin quà (Tiên Ngọc).
- **Ra (giai đoạn 4):** tin nhỏ `title` và `cosmetic` qua agent → danh hiệu lịch luyện hiện trên LIVE, đổi skin hồ sơ LIVE không cần mượn nhân vật. Khi đó **gỡ cơ chế mượn nhân vật cũ**.
- **Sự kiện chéo:** LIVE mở boss thì web có boss tương ứng (đang có); quà LIVE không cộng sức mạnh web.

### 3.9 Cân bằng, test, vận hành

- **Giả lập người chơi** `sim-tools/balance.mjs --days 42 --profile casual|active|whale|webonly`: đường cảnh giới theo ngày, tiền tệ, ngày chạm trần mùa. Bắt buộc chạy trước khi mở cảnh giới hoặc thưởng mới.
- **Giả lập trận**: cho AI của 3 class đánh nhau và đánh từng ải hàng nghìn lần → tỉ lệ thắng, thời gian hạ boss. Phát hiện class lệch.
- Test đơn vị cho `core/`; test vàng cho mô phỏng; kiểm tra nội dung; test cả tài khoản TikTok lẫn chỉ web.
- Trang quản lý: tra phân thân, sổ cái, trận nghi gian lận (chạy lại xem), gửi thư bù, cờ tính năng, chốt mùa.
- Cờ: `LICH_LUYEN=0/1`, `LICH_LUYEN_BETA=<tài khoản>`.

---

## 4. Thiết kế game

Mọi tên riêng **tự sáng tác**.

### 4.1 Cảnh giới (tên theo LIVE)

| Đại cảnh | Tiểu cảnh | Đột phá đại cảnh |
|---|---|---|
| Phàm nhân | (phần hướng dẫn, khoảng 10 phút) | Khai linh căn |
| **Luyện Khí** | **Tầng 1 → Tầng 9 → Viên Mãn** (10 bậc) | → Trúc Cơ |
| **Trúc Cơ** | Sơ kỳ → Trung kỳ → Hậu kỳ → Viên Mãn | **Phẩm Trúc Cơ**: Phàm / Địa / Thiên |
| **Kim Đan** | như trên | **Phẩm Kim Đan**: Ngũ → Tứ → Tam → Nhị → Nhất phẩm + **Lôi kiếp** (đánh tay: né sét) |
| **Nguyên Anh** | như trên | Phẩm Nguyên Anh + **Tâm ma** (đánh với bản sao chính mình) |
| Hóa Thần → … → Diệt Thế Chí Tôn | như trên | Mỗi đại cảnh một thử thách riêng (dữ liệu) |

- Đủ tu vi thì lên tiểu cảnh. Lên **đại cảnh** cần: tu vi Viên Mãn + **Đột phá đan** + **vật phẩm đột phá** gom từ map/boss/kỳ ngộ. Gom càng nhiều loại thì **phẩm càng cao** → nhiều điểm thuộc tính + nhiều lượt chọn mệnh cách. Học từ bảng `RoleGrade`: Trúc Cơ Phàm/Địa/Thiên cho 12/16/20 điểm và 1/2/3 lần chọn mệnh cách.
- Người chơi có thể **đột phá sớm với phẩm thấp** hoặc **chờ gom đủ để lấy phẩm cao**. Đây là lựa chọn thật, không có đáp án đúng duy nhất.
- Mỗi lần đột phá đại cảnh: **chọn 1 trong 3 mệnh cách** (số lượt theo phẩm). Mệnh cách có phẩm, có nhóm theo đạo lộ và đạo tâm.
- Đường cong tu vi: mỗi bậc khoảng ×1,35, đại cảnh nhảy lớn hơn. Số thật nằm trong CSV và được kiểm bằng giả lập.
- **Mở theo mùa** (mỗi mùa 6 tuần):
  - Mùa 1: Luyện Khí → Kim Đan
  - Mùa 2: Nguyên Anh, Hóa Thần
  - Mùa 3: Luyện Hư, Đại Thừa
  - …
  Đủ đường cho nhiều năm, vì LIVE có 24 cảnh giới.

### 4.2 Ba đạo lộ ra mắt

| Đạo lộ | Vũ khí | Lối đánh tay | Hai nhánh |
|---|---|---|---|
| **Kiếm tu** | Kiếm | Tầm trung, combo nhanh, bạo kích; kiếm khí bay | **Phi Kiếm** (điều khiển kiếm bay, đánh từ xa an toàn) / **Kiếm Ý** (áp sát, chém liên hoàn, bạo kích lớn) |
| **Thể tu** | Quyền / chưởng | Cận chiến, trâu, phản đòn, hút máu, đẩy lùi | **Kim Cương** (thủ, phản đòn, khiên) / **Cuồng Huyết** (máu càng ít đánh càng đau) |
| **Pháp tu** | Pháp khí / phù | Đánh xa, diện rộng, nguyên tố, khống chế | **Ngũ Hành** (đổi hệ theo linh căn, đốt/đóng băng) / **Phù Trận** (đặt trận, triệu hồi, khống chế vùng) |

- Mỗi đạo lộ khi ra mắt: **6 võ kỹ, 4 tuyệt kỹ, 3 thân pháp, 2 thần thông, 6 tâm pháp**. Phần lớn ghép từ khối có sẵn.
- **Đổi đạo lộ được** (tốn "Chuyển Mạch Đan", chờ 7 ngày); đồ và cảnh giới giữ nguyên.
- Đạo lộ thứ 4–5 (Đan tu hỗ trợ, Quỷ tu triệu hồi…) thêm theo mùa bằng dữ liệu + bộ khối.

### 4.3 Ô chiêu và nút bấm (theo Quỷ Cốc, vừa điện thoại)

| Ô | Nút | Mở ở |
|---|---|---|
| **Võ kỹ** | Nút đánh (giữ để đánh liên tục) | Từ đầu |
| **Tuyệt kỹ** | Nút chiêu 1 (giữ để vận lực) | Luyện Khí tầng 3 |
| **Thân pháp** | Nút lướt (có khung bất tử ngắn) | Từ đầu |
| **Thần thông** | Nút lớn, hồi chiêu dài, tốn linh lực | Kim Đan |
| **Tâm pháp ×3** | Bị động | Trúc Cơ mở ô 2, Kim Đan mở ô 3 |
| **Vật phẩm ×3** | Nút nhỏ (đan hồi máu/linh lực, phù) | Từ đầu |

Máy tính: WASD + chuột + phím số. Điện thoại: joystick trái + cụm nút phải, như `battle.js` hiện tại.

### 4.4 Bí tịch và tiền tố (vòng build)

- Chiêu học từ **bí tịch**. Bí tịch có **phẩm** (Phàm → Linh → Huyền → Địa → Thiên → Tiên) và **1–5 tiền tố ngẫu nhiên** theo phẩm.
- **Ngộ đạo:** dùng điểm ngộ đạo (từ tu luyện, kỳ ngộ) để **mở dần** tiền tố trên cuốn đang dùng. Cuốn tốt cần đầu tư.
- Tiền tố có điều kiện linh căn/đạo lộ (như `basRequire` của Quỷ Cốc): "Hỏa linh căn ≥ 60 mới mở 'trúng thì đốt'".
- **Dung hợp bí tịch** (mùa 2): hai cuốn cùng chiêu → giữ tiền tố chọn lọc.
- Cùng một chiêu nhưng mỗi cuốn mỗi khác → lý do đi săn lặp lại.

### 4.5 Linh căn, khí vận, đạo tâm

- **Linh căn** (khi tạo phân thân): 6 hệ Hỏa, Thủy, Lôi, Phong, Thổ, Mộc với điểm tư chất. Đơn linh căn hiếm (tu nhanh, mạnh một hệ), ngũ linh căn tu chậm nhưng dùng được mọi tâm pháp. Đổi bằng Tẩy Tủy Đan (hiếm).
- **Khí vận tiên thiên:** khi tạo, rút 6 thẻ, chọn 3, mỗi thẻ có điểm; được rút lại 1 lần. Ví dụ "Kiếm Cốt" (+tốc đánh kiếm), "Phúc Tinh" (+rơi đồ), "Bệnh Nhược" (điểm âm đổi lấy điểm cho thẻ khác).
- **Khí vận hậu thiên:** từ kỳ ngộ, **có thời hạn** (vài ngày thật), như "Được cao nhân chỉ điểm: tu vi +15% trong 3 ngày".
- **Đạo Tâm** (chọn khi lên Kim Đan, 6 loại ra mắt): mỗi loại có **một luật cấm** và mở **nhóm mệnh cách riêng**.
  - Ví dụ: "Sát Phạt": thắng Luận Kiếm thì tăng đạo tâm; thua 5 trận liền thì giảm.
  - Ví dụ: "Thanh Tĩnh": bế quan thì tăng; vào tông môn chiến thì giảm.
  - Đạo tâm đầy thì lần đột phá sau có mệnh cách phẩm cao. Vừa nhập vai, vừa là build.

### 4.6 Thế giới và bản đồ

- Mỗi đại cảnh mở một **châu** (học 10 vùng của Quỷ Cốc): Thanh Vân Châu (Luyện Khí), Lạc Hà Châu (Trúc Cơ), Xích Viêm Châu (Kim Đan)…
- Bản đồ châu là **đồ thị nút**: ải (đánh tay), boss châu, điểm khai thác (hái thuốc/khoáng), thành (chợ, nhiệm vụ), động phủ, **nút kỳ ngộ ngẫu nhiên** đổi mỗi ngày.
- Mỗi châu: 12–15 ải, 1 boss châu (cơ chế riêng), 2–3 quái tinh anh, bảng rơi riêng, **vật phẩm đột phá riêng** (lý do quay lại châu cũ để lấy phẩm cao).
- Thêm châu = ảnh nền + một file `maps/<châu>.js`.

### 4.7 Kỳ ngộ (thế giới sống bằng dữ liệu)

- Kỳ ngộ là **sự kiện chữ có lựa chọn**, có điều kiện (cảnh giới, linh căn, đạo tâm, đã gặp kỳ ngộ X), kết quả (đồ, tu vi, khí vận hậu thiên, mở ải ẩn, đánh một trận), và **chuỗi** nhiều bước.
- Viết bằng ngôn ngữ dữ liệu đơn giản, kiểm tra tự động: không có nhánh cụt, không thưởng vượt trần.
- Ra mắt khoảng **40 kỳ ngộ**, mỗi mùa thêm khoảng 30. Viết chữ là việc Claude/Codex làm nhanh, ảnh dùng lại.

### 4.8 Trang bị

- Ô: vũ khí (theo đạo lộ), giáp, mũ, giày, nhẫn, ngọc bội, **pháp bảo** (có chiêu riêng).
- Phẩm Phàm → Tiên; 1–4 thuộc tính phụ; bộ 2/4 món; cường hóa +1 → +15; luyện hóa đồ thừa.
- **Skin chỉ trang trí**; skin LIVE mặc được cho phân thân.

### 4.9 Nội dung lặp lại

- **Tháp Trấn Yêu:** đánh tay, vô hạn tầng, mỗi 10 tầng có boss cơ chế; xếp hạng tuần.
- **Luận Kiếm:** đấu bản chụp người khác (AI điều khiển); điểm Elo; mùa 2 tuần (3 mùa nhỏ trong một mùa lớn).
- **Bí cảnh tuần:** luật xoay vòng ("Hỏa ×2", "không được lướt", "quái nổ khi chết").
- **Boss thế giới:** nối boss LIVE, xếp hạng sát thương.

### 4.10 Động phủ và nghề

- Động phủ: Linh Điền (thảo), Linh Mạch (linh thạch), Tụ Linh Trận (tu vi offline), Đan Phòng, Luyện Khí Thất.
- Nghề (học Quỷ Cốc, thêm dần): Luyện đan (mùa 1, công thức là dữ liệu), Luyện khí (mùa 2), Họa phù (mùa 2), Phong thủy (bày trận động phủ, mùa 3).

### 4.11 Tông môn (người chơi)

- Lập/gia nhập; **thang chức theo Quỷ Cốc**: Tân thủ → Ngoại môn → Đệ tử → Chân truyền → Trưởng lão → Đại trưởng lão → Tông chủ.
- **Lên chức bằng thách đấu** người đang giữ chức (đánh tay với bản chụp của họ); chức có giới hạn số người.
- Cống hiến, cửa hàng tông, nhiệm vụ tông, bí cảnh tông.
- **Tông môn chiến** mỗi tuần (AI cả hai bên, xem lại được).
- Sư đồ, đạo lữ (cộng nhỏ khi cùng đánh boss).

### 4.12 Mùa giải 6 tuần

| Tuần | Nhịp |
|---|---|
| 1 | Mở mùa: cảnh giới/châu mới, sự kiện LIVE "Tu Tiên Giới khai mở" |
| 2 | Luận Kiếm mùa nhỏ 1 chốt |
| 3 | Sự kiện giữa mùa (kỳ ngộ đặc biệt, boss giới hạn) |
| 4 | Luận Kiếm mùa nhỏ 2 chốt |
| 5 | Tông môn chiến lớn |
| 6 | Luận Kiếm mùa nhỏ 3 + chốt mùa: danh hiệu, skin, khung vĩnh viễn |

- **Không xóa phân thân.** Người vào muộn có **tăng tốc bắt kịp** (tu vi ×2 khi dưới mức giữa của máy chủ).
- Trần cảnh giới của mùa giữ mọi người không bỏ nhau quá xa; mùa sau mở trần mới.

### 4.13 Thu nhập

Quà TikTok → Tiên Ngọc; người chỉ web kiếm Tiên Ngọc trong game. Tiên Ngọc chỉ mua **trang trí + tiện ích** (thể lực, lượt quét, ô túi, đổi tên, skin phân thân). Chưa mở nạp trực tiếp; game thu tiền thật ở Việt Nam có thể cần giấy phép (Nghị định 147/2024, cần kiểm tra trước).

---

## 5. Phân thân

- **Tạo:** "Đi lịch luyện" → phần Phàm nhân hướng dẫn khoảng 10 phút (đánh thử 3 class rồi mới chọn) → chọn đạo lộ → khai linh căn → rút khí vận → đặt tên.
- Mỗi tài khoản **một phân thân** (kiến trúc vẫn cho mở thêm ô về sau).
- **Ưu đãi bản thể / Đạo Nghiệp:** như mục 2.1.
- **Dữ liệu web cũ** (cường hóa, cấp linh thú web, tầng tháp, vật liệu trong `p.web`) → đổi thành gói quà vào thư phân thân. Phần chơi cũ tắt khi Lịch luyện mở. Hồ sơ LIVE giữ nguyên.

---

## 6. Lộ trình

Mỗi giai đoạn chạy sau cờ tính năng, thử với vài tài khoản beta, rồi mới mở. Thời gian là ước lượng cho một người cùng AI.

### Giai đoạn 0 — Nền (khoảng 2 tuần, chưa có gì cho người chơi)

- Khung thư mục, `content/index.js` + kiểm tra, `text/vi.js`, CSV cân bằng
- `rng`, `fixed`, **mô phỏng trận tất định** (di chuyển, va chạm, hitbox, đạn bay, hiệu ứng, trạng thái), bảng hướng
- Ghi/nén đầu vào; server chạy lại trong worker; **test vàng Node + Chrome headless**
- `computeStats`, `ledger`, migration `001`, cờ tính năng
- Một ải mẫu: Kiếm tu + 2 loại quái, đánh tay trên trình duyệt, server xác nhận thưởng
- Đo chi phí kiểm tra trận trên VPS thật

**Xong khi:** đánh tay một ải trên điện thoại, server chạy lại ra đúng kết quả; sửa một số đầu vào thì server phát hiện; thêm quái mới chỉ cần dữ liệu.

### Giai đoạn 1 — Vòng chơi lõi (khoảng 3 tuần)

- Tạo phân thân, phần hướng dẫn Phàm nhân, **3 đạo lộ** (bộ chiêu đầu, mỗi đạo lộ 1 nhánh trước), linh căn, khí vận tiên thiên
- Luyện Khí tầng 1 → Viên Mãn → Trúc Cơ (phẩm Phàm/Địa/Thiên, mệnh cách)
- Thanh Vân Châu + Lạc Hà Châu, boss châu, vật phẩm đột phá
- Bí tịch + tiền tố + ngộ đạo, trang bị cơ bản, bế quan offline
- 20 kỳ ngộ, nhiệm vụ ngày, thư, gói đổi dữ liệu web cũ
- Giả lập cân bằng 42 ngày cho 4 kiểu người chơi

**Xong khi:** tài khoản TikTok và tài khoản chỉ web đều chơi trọn Luyện Khí → Trúc Cơ; 3 class qua boss châu với tỉ lệ thắng lệch nhau không quá 15%; không API nào nhận "tôi thắng" từ client.

### Giai đoạn 2 — Kim Đan và lặp lại (khoảng 2–3 tuần) → **mở Mùa 1**

- Kim Đan (5 phẩm, **Lôi kiếp** đánh tay), thần thông, Đạo Tâm, nhánh thứ 2 của mỗi đạo lộ
- Xích Viêm Châu, Tháp Trấn Yêu, Luận Kiếm, động phủ, luyện đan
- Thêm 20 kỳ ngộ, bảng xếp hạng, chốt mùa

### Giai đoạn 3 — Tông môn (khoảng 2 tuần, giữa Mùa 1)

Tông môn + thang chức thách đấu, tông môn chiến tuần, sư đồ, đạo lữ.

### Giai đoạn 4 — Cầu nối LIVE + chuẩn bị Mùa 2

Danh hiệu lên LIVE, đổi skin hồ sơ không mượn nhân vật (gỡ cơ chế cũ), Nguyên Anh + Tâm ma, Hóa Thần, châu mới, luyện khí, họa phù, dung hợp bí tịch.

---

## 7. Rủi ro

| Rủi ro | Giảm thiểu |
|---|---|
| Mô phỏng trình duyệt và server lệch nhau (trận đúng bị từ chối) | Chỉ số nguyên + bảng hướng + RNG riêng; test vàng hai môi trường; khi lệch thì **ghi log và cho thưởng tối thiểu**, không phạt người chơi, rồi sửa |
| Đánh tay trên điện thoại yếu bị giật | Mô phỏng tách khỏi vẽ; hạ chất lượng hình như `crowd-policy.js`; giới hạn thực thể mỗi trận |
| VPS 1 vCPU quá tải khi kiểm tra trận | Worker + hàng đợi; đo ở giai đoạn 0; trận dài có trần; nâng gói nếu cần |
| Hết nội dung sớm lần nữa | Trần cảnh giới theo mùa; giả lập cân bằng bắt buộc; kỳ ngộ + tiền tố cho chiều sâu ngang |
| 3 class lệch sức mạnh | Giả lập trận hàng nghìn lần mỗi lần đổi số; chỉnh bằng CSV |
| Người chơi cũ thấy "phải chơi lại" | Hồ sơ LIVE giữ nguyên; ưu đãi bản thể; gói đổi dữ liệu web; giải thích "phân thân" trên LIVE |
| Người chỉ web thấy thiệt | Đạo Nghiệp cùng trần; Tiên Ngọc kiếm được trong game |
| Thiếu ảnh (Codex hết hạn mức) | Giai đoạn 0–1 dùng lại ảnh có sẵn; ảnh tra theo ID, thay sau không sửa code |
| Làm game web làm chậm LIVE | Hai lõi tách hẳn |

---

## 8. Việc còn cần chủ game chốt (không chặn giai đoạn 0)

1. Tên 3 châu đầu và tên 2 nhánh mỗi đạo lộ (mình đề xuất ở trên, có thể đổi).
2. Phần hướng dẫn Phàm nhân có cho **đánh thử cả 3 class** trước khi chọn không. Đề xuất: **có**.
3. Có **tự động chiến đấu** (thưởng giảm còn 70%) cho người bận không. Đề xuất: **có, chỉ ở ải đã 3 sao**.

---

## Nguồn

- Bảng cấu hình chính thức Quỷ Cốc Bát Hoang trên máy: `RoleGrade`, `FateFeature`, `RoleCreateFeature`, `BattleSkillPrefixValue`, `BattleSkillBase/Attack/Effect/Missile`, `TaoistHeart`, `WorldFortuitousEventBase`, `FortuitousEvent`, `SchoolTaskTypeBase`, `MakePillFormula`, `ArtifactSpriteTalent`, `LocalText`.
- Đánh giá Tale of Immortal: https://gamegeeker.com/games/tale-of-immortal-1468810/review?market=US · https://vaporlens.app/app/1468810/鬼谷八荒_tale_of_immortal/stats · https://rpghq.org/forums/viewtopic.php?p=13501
- Mô phỏng tất định / chạy lại đầu vào chống gian lận: https://media.gdcvault.com/gdc2024/Slides/GDC+slide+presentations/Pollard_Bradley_CrossPlatformDeterminism+2024-03-26+09.34.19.pdf · https://doc.photonengine.com/quantum/v2/manual/cheat-protection · https://bugnet.io/blog/how-to-make-a-game-simulation-deterministic-for-replays · https://forums.unrealengine.com/t/is-there-a-way-to-repeat-the-event-on-the-exact-same-timing/425586
- Game cùng dòng (bản 1 kế hoạch): Tiên Nghịch Mobile, Nghịch Thủy Hàn, Nhất Niệm Tiêu Dao, Idle Xanxia, xiuzhen idle.
