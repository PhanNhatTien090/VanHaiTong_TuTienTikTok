# Đưa bản web Vân Hải Tông lên mạng

## Cách bản web chạy khi host

Bản web chạy **chung tiến trình với server LIVE** trên máy bạn, dùng **chung một file dữ liệu** `data/live.json`:

- Người chơi web vào đúng nhân vật TikTok của họ (sau khi liên kết), tiến trình hai bên luôn khớp.
- **Một chiều**: người xem LIVE không thấy gì từ web. Hành động web chạy trên "thế giới tạm cách ly" (`web/isolate.mjs`): không vào ký sự, không đọc giọng, không lên sân khấu, không kích hoạt sự kiện LIVE. Nhân vật chỉ có trên web không bao giờ hiện trên LIVE.
- Trang quản trị LIVE vẫn ở cổng **4317, chỉ máy này vào được**. Web ở cổng **4320** và chỉ có đường dẫn của web.
- Tài khoản web lưu ở `data/web/accounts.json`, tự sao lưu 30 phút một lần vào `data/web/backups/`.

**Lưu ý: máy bạn phải bật và server LIVE phải chạy thì web mới vào được.** Muốn web chạy cả khi tắt máy thì phải chuyển toàn bộ server lên VPS, để làm sau.

## Bước 1: bật bản web (làm lúc KHÔNG đang LIVE)

1. Tắt server web chạy thử nếu đang mở (cửa sổ `start-web.cmd`), vì nó cũng dùng cổng 4320.
2. Bấm đúp **`BAT-WEB.cmd`** (tạo file cờ `data/web-enabled`).
3. Khởi động lại server LIVE như bình thường (`start.cmd` hoặc để watchdog tự bật lại).
4. Mở `http://127.0.0.1:4320/` trên máy để kiểm tra. Cửa sổ server sẽ có dòng `Vân Hải Tông WEB (chung dữ liệu LIVE)`.

Tắt bản web: bấm **`TAT-WEB.cmd`** rồi khởi động lại server LIVE.

## Bước 2: đưa ra Internet (chọn MỘT cách)

### Cách A: Cloudflare Tunnel (khuyên dùng, miễn phí, không cần mở cổng modem)

1. Tải `cloudflared` cho Windows từ trang chính thức của Cloudflare (developers.cloudflare.com → Cloudflare Tunnel → Downloads).
2. **Thử nhanh, không cần tên miền** (mỗi lần chạy được một địa chỉ ngẫu nhiên `...trycloudflare.com`):
   ```
   cloudflared tunnel --url http://127.0.0.1:4320
   ```
3. **Chạy lâu dài với tên miền của bạn** (tên miền phải quản lý DNS trên Cloudflare):
   ```
   cloudflared tunnel login
   cloudflared tunnel create vanhai
   cloudflared tunnel route dns vanhai game.ten-mien-cua-ban.com
   cloudflared tunnel run --url http://127.0.0.1:4320 vanhai
   ```
   Có thể cài thành dịch vụ chạy nền: `cloudflared service install`.

Cloudflare tự lo HTTPS. Server đọc IP thật của người chơi từ header `CF-Connecting-IP`, dùng để giới hạn đăng nhập sai và chống spam.

### Cách B: VPS + đường hầm SSH (nếu đã thuê VPS)

Trên **máy bạn** (giữ cửa sổ này mở, hoặc dùng công cụ tự nối lại như `autossh`):
```
ssh -N -o ServerAliveInterval=30 -R 127.0.0.1:4320:127.0.0.1:4320 user@IP-VPS
```

Trên **VPS** cài nginx + chứng chỉ HTTPS (certbot), file cấu hình:
```nginx
server {
    server_name game.ten-mien-cua-ban.com;
    client_max_body_size 64k;
    location / {
        proxy_pass http://127.0.0.1:4320;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    listen 443 ssl; # certbot --nginx -d game.ten-mien-cua-ban.com sẽ tự điền phần chứng chỉ
}
```

## Kiểm tra sau khi host

- Mở địa chỉ web trên điện thoại (4G, không dùng wifi nhà) → đăng ký → "Tôi đã chơi trên LIVE" → gõ `lienket MÃ` trong LIVE → web tự chuyển sang nhân vật của bạn.
- Trong lúc đó trên LIVE **không** được thấy bất kỳ dòng nào từ web.
- `https://địa-chỉ/dev/players` phải báo "Không có quyền" (công cụ thử luôn tắt khi chạy thật).

## Biến môi trường (tùy chọn)

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `WEB_PORT` | 4320 | Cổng web |
| `WEB_HOST` | 127.0.0.1 | Chỉ nghe trên máy (tunnel/nginx nối vào). Không đổi thành 0.0.0.0. |
| `WEB_TRUST_PROXY` | bật | Đọc IP thật từ header của Cloudflare/nginx |
| `WEB_SECURE_COOKIE` | tự động | Cookie chỉ qua HTTPS khi người chơi vào bằng https |
| `WEB_TIKFINITY` | bật | Nghe bình luận `lienket` từ TikFinity (chỉ đọc) |
| `VAN_HAI_WEB` | theo file cờ | `1` = bật, `0` = tắt (thắng file cờ) |

## Chưa làm (để sau)

- Đăng nhập bằng Google: cần tên miền cố định và mã OAuth từ Google Cloud.
- Chạy toàn bộ trên VPS để web sống khi tắt máy.
