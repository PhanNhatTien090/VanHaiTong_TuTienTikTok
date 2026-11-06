# Cập nhật production theo yêu cầu

Mục tiêu vận hành: người dùng nói **“cập nhật lên prod”**, trợ lý kiểm tra thay đổi,
đẩy đúng phiên bản lên Git private và kích hoạt GitHub Actions. Máy chạy Actions
kết nối VPS, chỉ truyền file thay đổi, sao lưu và chuyển mã. Người dùng không
phải tải/nén/upload thủ công trong các lần cập nhật sau khi thiết lập xong.

Trạng thái đã xác minh ngày 06/11/2026:

- URL: **https://vanhaitong.duckdns.org**. HTTPS và trang chờ hoạt động.
- GitHub Actions đã kết nối SSH tới VPS thành công bằng cấu hình người dùng
  đã thêm; không cần SSH trực tiếp từ môi trường chat.
- Mã game và dịch vụ đã cài sẵn từ commit
  `6f94588a56394d82fc9e41c70fb6ae376b295814`, nhánh `codex/cloudfly-setup`.
- Marker HTTPS `/game-setup-status.json` xác nhận `code_prepared:true`,
  `service_started:false`, `data_imported:false` và đúng SHA trên.
- **Game chưa mở chơi.** Service được giữ tắt bằng chốt systemd
  `/var/lib/van-hai-web/.migration-pending`; database chưa được khởi tạo.
- Workflow production đã có URL mặc định `https://vanhaitong.duckdns.org`;
  người dùng không cần thêm biến mới. Variable PROD_URL chỉ dùng để ghi đè
  khi chủ động đổi tên miền.
- Worktree thiết lập: `/workspace/cloudfly-setup-worktree`. Repo gốc vẫn giữ
  các thay đổi có sẵn; không reset nó hoặc triển khai nhầm HEAD cũ `fcaf8f5`.

## Dữ liệu LIVE còn thiếu

Người dùng hiện không có máy LIVE bên cạnh, chưa biết đường dẫn thư mục game;
người dùng xác nhận hiện không phát LIVE. Theo yêu cầu, dùng `C:\GAME` làm
đường dẫn tạm trong hướng dẫn, chưa coi là đường dẫn thật; người dùng sẽ xác
nhận khi về nhà. Không mở bản chơi thử dữ liệu riêng khi chưa được yêu cầu. Chưa có bản xuất tài khoản hoặc world
thật trong workspace. Có thể tiếp tục DNS/HTTPS và cài phần mềm, nhưng giữ
production cloud chưa khởi động cho đến khi nhập đúng dữ liệu lần đầu. Không
khởi tạo tài khoản production rỗng để bỏ qua bước di chuyển vì import chỉ một lần.
Nếu mở bản thử độc lập phải có lựa chọn rõ của người dùng, dùng thư mục dữ liệu
riêng và nói rõ tiến độ thử không tự nhập vào LIVE. Người dùng chọn để việc chuyển dữ liệu sau khi về nhà, không chọn bản thử riêng.

## Cấu hình một lần

Hoàn tất cài lần đầu theo README: Node 24, rsync, nginx, systemd service,
tài khoản được di chuyển trước lần khởi động đầu, agent LIVE, hostname cố định
và HTTPS. Gói cài thủ công vẫn có thể dùng cho lần đầu; từ lần cập nhật tiếp
theo dùng workflow `.github/workflows/deploy-production.yml`.

Trong GitHub repository → Settings → Secrets and variables → Actions:

| Loại | Tên | Nội dung |
| --- | --- | --- |
| Secret | `PROD_SSH_KEY` | Private Key của khóa CI riêng được VPS cấp quyền; không ghi vào Git hoặc chat |
| Variable | `PROD_HOST` | `103.82.26.70` |
| Variable tùy chọn | `PROD_URL` | Ghi đè URL mặc định `https://vanhaitong.duckdns.org` khi đổi tên miền |
| Variable | `PROD_KNOWN_HOSTS` | Dòng host key công cộng được lấy từ chính VPS qua phiên SSH đã tin cậy |

Nên tạo khóa CI riêng, không dùng lâu dài khóa quản trị đã gửi trong chat.
Workflow hiện triển khai bằng `root`; không cấp khóa này cho người ngoài.
Chỉ workflow/commit đã tin cậy của repository được chạy với quyền này.

Ví dụ lệnh lấy dòng host key công cộng trên VPS:

```bash
awk '{print "103.82.26.70 " $1 " " $2}' /etc/ssh/ssh_host_ed25519_key.pub
```

Workflow bật kiểm tra host key nghiêm ngặt; không thay bằng
`StrictHostKeyChecking=no`. Khi đổi VM/IP/host key, cập nhật các giá trị và
xác minh lại qua nhà cung cấp hoặc phiên quản trị tin cậy.

Mã workflow và các file phụ thuộc phải được commit/push lên repository trước
khi có thể dùng. Git push dry-run chưa chứng minh quyền thêm workflow, trạng
thái Actions hay quyền sử dụng secrets. Nếu GitHub từ chối quyền workflow,
giải quyết quyền tích hợp qua cấu hình được hỗ trợ; không trích xuất token.

## Mỗi lần người dùng yêu cầu lên prod

1. Kiểm tra nhánh, diff và trạng thái worktree. Chỉ đưa các thay đổi thuộc bản
   được yêu cầu vào commit; không đẩy khóa, dữ liệu, local environment hoặc
   file vận hành riêng. Không reset/ghi đè thay đổi có sẵn.
2. Kiểm tra bản cập nhật, commit và push lên nhánh được chọn. Chưa tạo tag prod
   nếu người dùng chỉ yêu cầu sửa/preview.
3. Khi có yêu cầu triển khai, tạo tag mới `prod-<ngay-gio>-<sha-ngan>` trỏ đúng
   commit và push **tag đó**. Không force-push/di chuyển một tag đã triển khai.
4. Workflow chạy kiểm tra mã và test, dựng thư mục phát hành không nén, rồi
   dùng rsync checksum để chỉ gửi file khác. File không đổi được hard-link
   từ release đang chạy. Dependencies không đổi được dùng lại trên VPS.
5. VPS khóa các lần nâng cấp đồng thời, sao lưu SQLite, đổi symlink nguyên tử,
   khởi động lại service và kiểm tra HTTP. Lỗi khởi động/health sẽ dừng bản
   lỗi và khởi động lại mã cũ; database không bị phục hồi ngược tự động.
6. Kiểm tra HTTPS công khai: `/deploy-version.json` phải có `version` đúng
   full SHA đã đẩy, `/healthz` phải có `ok`, `cloud`, `ready` đều đúng. Không
   báo hoàn tất chỉ vì Git push/tag thành công. Nếu không đọc được Actions,
   vẫn phải xác minh bản đang phục vụ qua hai endpoint này.

Ví dụ kích hoạt sau khi commit đã được push (thay tag bằng tên mới thực tế):

```bash
git tag prod-20261106-150000-abcdef0 <full-commit-sha>
git push origin refs/tags/prod-20261106-150000-abcdef0
```

Cũng có thể chạy thủ công từ tab Actions → Deploy production web → Run
workflow trên ref muốn phát hành. Push main thông thường không tự triển khai.

## Giới hạn vận hành

- Luồng này triển khai **web trên VPS**. Cập nhật engine/agent/protocol trên
  máy LIVE cần phối hợp riêng, không tự khởi động lại máy LIVE đang phát.
- Nếu mã xử lý game/dependencies thay đổi và còn phiên nhân vật liên kết ở
  `acquire`, `web` hoặc `release`, script giữ bản cũ và báo tạm dừng cập nhật.
  Cho các phiên bàn giao hoàn tất với LIVE và agent online rồi chạy lại.
  Bản chỉ thay tài nguyên giao diện không cần chờ bàn giao nhân vật.
- Có gián đoạn ngắn khi restart; đây chưa phải rolling deployment không gián
  đoạn. Chưa đo thời gian chạy thực tế trên CloudFly; không hứa số giây cố định.
- Lỗi xác minh HTTPS/ready sau khi đổi bản làm workflow thất bại để điều tra;
  riêng bước kiểm tra ngoài này không tự đảo dữ liệu hay tự rollback mã.
- Sau thành công, dọn release CI cũ, giữ ít nhất 3 bản gần nhất, bản đang chạy
  và bản vừa thay thế. Không dọn database, snapshot hoặc bản cài thủ công.
- GitHub Actions sử dụng hạn mức của tài khoản/repository; cần xem usage nếu
  cập nhật nhiều hoặc bài test/build dài. Không giả định miễn phí không giới hạn.

Lệnh bootstrap Ubuntu trước đó vẫn dùng để chuẩn bị hệ điều hành. Chưa có
website production hoàn chỉnh chỉ từ việc cài Node/Nginx; vẫn cần dữ liệu thật,
DNS/HTTPS và kiểm thử đăng nhập, bàn giao LIVE–web trước khi gửi cho nhóm.

## Trang chờ và HTTPS trong lần chuẩn bị đầu

DNS và HTTPS đã xác minh: vanhaitong.duckdns.org → 103.82.26.70.
HTTPS được thiết lập qua workflow prepare-cloudfly.yml từ commit e530b43,
sau đó stage-cloudfly.yml đã cài mã bằng install.sh --defer-nginx.
Cấu hình proxy chờ tại /etc/nginx/sites-available/van-hai-web.pending;
site đang phục vụ vẫn là trang chờ có HTTPS.

Khi người dùng về nhà: xác nhận đường dẫn LIVE thật (C:\GAME chỉ là tạm),
sao lưu dữ liệu và nhập đúng tài khoản/world như README. File nhập phải
nằm trong thư mục riêng mà service user vanhai-web đọc được; không yêu cầu
service user đọc trực tiếp file dưới /root. Chưa khởi động service trước import.
Chỉ sau import thành công mới gỡ .migration-pending, kích hoạt service,
đổi từ cấu hình trang chờ sang proxy pending, và cài lại cấu hình TLS bằng
certbot --nginx với --reinstall --redirect. Ghép agent và xác minh dữ liệu/
bàn giao LIVE–web trước khi mở chơi. Không lùi database khi rollback mã.
Không thông báo game đã sẵn sàng chỉ vì trang chờ có HTTPS.
