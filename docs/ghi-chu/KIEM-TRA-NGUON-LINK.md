# Sửa kích thước nguồn Link TikTok LIVE Studio — 14/11/2026

## Nguyên nhân đã đo được

Nguồn LIVE Studio đang mở báo qua `/api/client-status`: `view.w=1080`, `view.h=1032`, `dpr=1`, user agent TTElectron. Đây là kích thước trang web thực nhận, khác với con số 1080×1920 được đặt ở phía ứng dụng/dự án.

Trong `public/visual-v3.css`, media query `min-aspect-ratio: 7/10` trước đây chứa:

```css
body.overlay .workspace { width: min(100vw, 56.25vh); margin: 0 auto; }
```

Ở viewport 1080×1032, media query này khớp và ép workspace còn 580,5×1032; có khoảng 249,75px trống mỗi bên. Quy tắc này vốn giữ bản xem trên trình duyệt rộng thành khung dọc, nhưng được áp dụng cả cho nguồn Link thật. Kiểm trình duyệt trước sửa đã tái hiện đúng số đo này. Không có giới hạn 375px/540px ở root của trang game; các khung 540px trong trang xem minh họa riêng không tham gia nguồn game.

Canvas khi đó vẫn được cấp backing 1080×1920 cố định bởi `renderDimensions()`. Backing nhiều pixel không làm container CSS rộng ra. Fit/Fill ở LIVE Studio chỉ biến đổi toàn bộ nguồn đã render, nên không giải quyết khoảng trống bên trong HTML.

## Sửa tại nguồn

- `public/style.css`: sửa khối overlay gốc, workspace bám bốn cạnh viewport, chiều rộng/cao 100%, bỏ phụ thuộc bố cục quản lý. Chuỗi main-content → sceneView → scene-shell phủ đầy root. Không dùng CSS zoom/transform scale.
- `public/visual-v3.css`: bỏ chính quy tắc ép chiều rộng theo vh; giữ các quy tắc chữ/HUD khác.
- `public/performance.js`: backing theo kích thước CSS × DPR, giới hạn rộng 1080px và tổng 2.073.600 pixel. Ví dụ DPR1: 540×960 → 540×960, 720×1280 → 720×1280, 1080×1920 → 1080×1920. DPR2 bị chặn tối đa 1080×1920, không tạo 2160×3840. Preview quản lý cũ có trần 720px riêng.
- `public/scene.js`: tiếp tục dùng thế giới rộng 900 đơn vị, chiều cao tính từ tỉ lệ CSS thực. Nền dùng cover crop hiện có, sprite dùng cùng tỉ lệ trên hai trục. Đồng bộ qua ResizeObserver, resize/visualViewport, thay đổi DPR; có kiểm DPR trong nhịp render cho Chromium nhúng không phát sự kiện resize. Xóa nền chuyển cảnh cũ nếu đổi tỉ lệ để không kéo ảnh cache sai khung.
- `public/app.js`, `public/index.html`: bổ sung số đo viewport/CSS/backing trong chẩn đoán nguồn và dòng trạng thái ở trang quản lý → Thiết lập → Link cảnh. Không hiện thông tin kỹ thuật trên sân LIVE.

Không thay gameplay, dữ liệu nhân vật, kỹ năng, luật quà, TikFinity, FPS budget hay hệ thống quyền sở hữu. Không cần khởi động lại máy chủ cho thay đổi HTML/CSS/JS tĩnh này.

## Kiểm tra đã thực hiện

`node --test test/performance.test.mjs`: 12 kiểm tra qua, gồm cấp backing theo DPR và trần pixel, actor cache, scheduler và hạ chất lượng khi GPU chậm.

`node scripts/qa-link-viewport.mjs`: chạy trình duyệt Edge headless với dữ liệu thử trong thư mục tạm, không dùng/ghi dữ liệu LIVE. Đổi kích thước liên tiếp trên cùng trang để kiểm cập nhật tự động, gồm cả chỉ đổi DPR. Đo mọi tầng container, backing, tỷ lệ biến đổi hai trục, tràn trang và các bảng chính. Kiểm không có zoom/transform trên chuỗi root và không có lỗi JavaScript.

| Viewport | DPR | Root/CSS game | Backing |
|---|---:|---|---|
| 1080×1920 | 1 | 1080×1920 | 1080×1920 |
| 720×1280 | 1 | 720×1280 | 720×1280 |
| 540×960 | 1 | 540×960 | 540×960 |
| 1080×1920 | 2 | 1080×1920 | 1080×1920 |
| 720×1280 | 2 | 720×1280 | 1080×1920 |
| 540×960 | 2 | 540×960 | 1080×1920 |
| 1080×1032, tái hiện nguồn đang mở | 1 | 1080×1032 | 1080×1032 |

Ảnh và số đo trước/sau ở `output/link-viewport/`; `before.json` và `after.json` ghi số đo từng tầng. Đã xem ảnh khung dọc và ảnh tái hiện trước/sau. Ở ba khung 9:16 không có dải trống do root, sprite giữ tỉ lệ, các bảng chính nằm trong khung.

## Cách xác nhận trong LIVE Studio

1. Làm mới nguồn Link để nạp bản sửa. Không dùng Fill để bù khoảng trống trong trang.
2. Mở trang quản lý, Thiết lập → Link cảnh: dòng “Trang nguồn báo…” phải hiện **1080×1920**, vùng game **1080×1920**, canvas tối đa **1080×1920**.
3. Nếu dòng này vẫn hiện **1080×1032**, trang nguồn thực tế chưa nhận chiều cao 1920. Đặt chiều rộng/cao ngay ở thuộc tính trang nguồn Link/Browser Source; chỉ đổi độ phân giải dự án không làm trang web nhận chiều cao đó. Bản sửa vẫn phủ đầy viewport 1080×1032, nhưng đó là một khung gần vuông, không phải 9:16; CSS không tự biến nó thành 9:16 mà đồng thời vừa không kéo méo vừa không cắt nội dung.
4. Khi trang nguồn đã đúng 9:16, đưa nguồn về vừa khung. Có thể mở link game trong trình duyệt và dùng DevTools kiểm `getBoundingClientRect()` của `.workspace`, `.scene-shell`, `#sceneCanvas` đều khớp viewport.

Nguồn đang mở chưa được xác nhận nạp lại bản mới hoặc đổi sang viewport 1080×1920 trong lần kiểm tra này; số đo browser độc lập bên trên là phần đã xác minh đầy đủ. Không triển khai VPS production.
