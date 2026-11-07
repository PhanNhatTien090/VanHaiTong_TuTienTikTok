# Giới hạn tiến triển thống nhất v4 · 05/11/2026

Đã thay chính sách v3 theo yêu cầu: người chơi8h/ngày vẫn có việc làm, nhưng không dùng nhiều đường thưởng để đẩy cảnh giới quá nhanh. Chỉ áp dụng LIVE thật/người thật từ current realm5 (Hóa Thần). Đường Phàm nhân→Hóa Thần giữ nguyên.

## Một ngân sách tu vi miễn phí

Mặc định900 điểm/ngày Việt Nam, làm mới0giờ. Mọi lượng tu vi miễn phí thực nhận quy đổi thành điểm theo suất vận công hiện tại: ceil(requiredQi/ASCENSION_PRACTICE_STEPS). Số điểm tính bằng phần trăm nguyên, làm tròn lên để không vượt trần. Vận công/tim/hái/đánh, điểm danh và chuỗi, đan dược, nhiệm vụ, hồng bao, câu đố, thưởng boss, thưởng sự kiện, cùng tu/hộ pháp, đạo lữ, phúc chung và thưởng tông môn đều dùng chung. Buff/trang bị có thể giúp nhận nhanh hơn, nhưng lượng tu vi tăng thêm cũng tiêu ngân sách tương ứng.

Khoản thưởng cuối vượt trần chỉ nhận phần tu vi còn trong hạn mức. Vật phẩm, linh thạch, linh thảo, huy chương, điểm Đồng môn, thành tích và quyền tham gia sự kiện giữ nguyên. Đan dược không bị tiêu nếu ngân sách còn lại không đủ nhận trọn tu vi của viên đó. Chạm trần có thông báo; hồ sơ/lệnh tuvi thể hiện phần còn lại. Không xóa hoặc trừ tu vi đã có.

Quà TikTok của cá nhân vẫn ghi đủ tu vi/coin lịch sử/đồ; không bị trần miễn phí cắt. Công cụ quản trị cấp thưởng/chỉnh dữ liệu trực tiếp vẫn là quyền quản trị chủ động, không phải đường farm cho người chơi. Giữ cách nhân thưởng cũ: phúc duyên chỉ nhân chơi tay; việc bổ sung timestamp cho kiểm tra ngày KHÔNG khiến quà/sự kiện vô tình được nhân thêm buff.

## Một lượt đại cảnh chung mỗi ngày

Từ Hóa Thần→Luyện Hư trở đi, tối đa1 lần đại cảnh/ngày Việt Nam, chung giữa dotpha, ban phúc tự động/thông thường và Cơ duyên. Tu vi đủ hoặc quà lớn vẫn phải chờ lượt ngày sau. Không tiêu tuvi/linhthạch/tiếnđộ Cơduyên khi bị chặn. Cảnh giới0..4 không chịu giới hạn này. Lưu dailyAscension cùng hồ sơ, giữ qua reload/reconnect/chuyển sinh. Áp dụng từ lúc nạp v4, không hạ cảnh giới hoặc truy thu những gì đã đạt trước đó. Có thể đổi settings.dailyRealmLimit (0 tắt) khi cần; mặc định1.

readyToBreak có context world/time tùy chọn; nội bộ engine dùng đủ context, snapshot xuất progressionReady, client thanh tuvi/thiênđài/nút độtphá dùng giá trị authoritative. Không hiện lời mời dotpha sai khi hết lượt.

## Cơ duyên giữ tiến độ dư

Chuyển phần chưa tiêu từ event.players(received-spent) hiện còn ghi nhận sang p.opportunityCredit.balance, dùng marker creditBankV2 để không nhập hai lần. Quà mới khi Cơ duyên đang mở cộng vào bank. Chỉ trừ đúng giá cảnh giới thực sự trao, không tiêu khi hết lượt ngày. Bank không hết hạn sau5phút và không bị xóa bởi sự kiện tiếp theo/chuyển sinh.

Mở sự kiện mới/ngày mới sẽ xử lý bank của người đang có mặt; người vào sau có thể gõ cơ duyên khi sự kiện mở để sử dụng mà không cần tặng thêm. Giữ nguyên bảng giá và idempotency quà. Sự kiện cũ đã bị xóa khỏi dữ liệu từ trước không thể khôi phục từ hư không; chỉ nhập phần chưa tiêu còn trong event được lưu. Đã kiểm legacy event hiện tại có phần chưa tiêu10 để đối chiếu sau nạp.

HUD và GIỌNG ĐỌC mở sự kiện đều nói từ Hóa Thần tối đa1 đại cảnh/ngày, tiến độ dư được giữ. Không đọc giá coin mới trong lời thông báo. Cơ duyên miễn phí của tiên nhân vẫn giữ luồng riêng; tu vi thưởng miễn phí của tiên nhân tính trần chung.

## Kiểm chứng và vận hành

Mô phỏng8h với vận công/hái/đánh: không vượt900×suất tuvi hiện tại ở cùng cảnh giới, vẫn nhận đồ và gây công lực. Kiểm chuỗi điểm danh, giữ đan dược, cùng tu/hộ pháp không lọt trần, quà cá nhân không bị cắt/nhân sai, dotpha+banphúc+Cơduyên cùng1 lượt, không tiêu tài nguyên khi bị chặn, bank qua ngày/hết sự kiện/JSON và không cần quà mới, legacy chỉ nhập1 lần, ID lạ không sửa prototype, chuyển sinh không resetledger, thanh tuvi không mời lệnh sai, lời thông báo có quy tắc mới và không đọc coin.

Sau kiểm tra đủ bộ LIVE/web/cú pháp, commit rồi nạp bằng scripts/restart-unified-progress.ps1 (bản export cả hai world, buffer quà và watchdog như các lượt trước). Runtime progressionPacingVersion4,22mốc,rebirthUnlock21. Không kích hoạt hành động giả trên LIVE. Đối chiếu đủ hồ sơ,realm,totalQi,coin,kho đồ,đạolữ và bank10 trước/sau, chờ buffer replay trước báo hoàn tất. Web vẫn profile-only. Tải lại nguồn overlay để nhận lời hướng dẫn và readiness mới.
