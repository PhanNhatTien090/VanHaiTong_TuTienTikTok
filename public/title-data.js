// 21/11/2026 tối (chủ game): danh hiệu phải HIẾM — mỗi danh hiệu là 1 "ghế" vài người GIÀNH nhau, không phải ai cũng có.
// Người chơi có thể giữ nhiều danh hiệu; gõ "danh hiệu" xem bảng có số, "danh hiệu N" để mặc (chưa chọn → tự đeo cái xịn nhất).
// Mỗi danh hiệu = 1 ẢNH CHỮ riêng Codex vẽ (public/assets/title-text/<key>.webp, đề bài PROMPT.md), không icon.
// group: paid (vàng kim) · luanhoi · evil (đen đỏ/tím) · love (hồng) · event · sect. rank nhỏ = ưu tiên cao khi tự đeo / khi sân đông.
// "how" hiện trên bảng danh hiệu — không ghi số coin (luật bảng quà).
export const TITLE_LIST=Object.freeze([
 {key:'tong-chu',name:'TÔNG CHỦ',group:'paid',rank:0,how:'Tặng Vương Miện, giữ ghế Tông Chủ'},
 {key:'than-tai',name:'THẦN TÀI',group:'paid',rank:1,how:'Top 1 tổng quà'},
 {key:'dai-gia',name:'ĐẠI GIA',group:'paid',rank:2,how:'Top 2–3 tổng quà'},
 {key:'luan-hoi',name:'LUÂN HỒI',group:'luanhoi',rank:3,how:'Đã chuyển sinh'},
 {key:'nha-giau',name:'NHÀ GIÀU',group:'paid',rank:4,how:'Top 4–10 tổng quà'},
 {key:'ma-dao-vuong',name:'MA ĐẠO VƯƠNG',group:'evil',rank:5,how:'Đứng đầu phe Ma trận Chính Ma gần nhất'},
 {key:'chinh-dao-minh-chu',name:'CHÍNH ĐẠO MINH CHỦ',group:'event',rank:5,how:'Đứng đầu phe Chính trận Chính Ma gần nhất'},
 {key:'loi-dai-ba-chu',name:'LÔI ĐÀI BÁ CHỦ',group:'event',rank:5,how:'Trụ đài tới cuối Lôi Đài gần nhất'},
 {key:'than-tien-quyen-lu',name:'THẦN TIÊN QUYẾN LỮ',group:'love',rank:6,how:'Cặp vừa làm Đại Điển ở Tình Lâu'},
 {key:'nu-khoi-tong-mon',name:'NỮ KHÔI TÔNG MÔN',group:'love',rank:6,how:'Nữ có nhiều đạo lữ nhất'},
 {key:'dao-hoa-vuong',name:'ĐÀO HOA VƯƠNG',group:'love',rank:6,how:'Nam có nhiều đạo lữ nhất'},
 {key:'phu-ho',name:'PHÚ HỘ',group:'paid',rank:7,how:'Đủ mốc quà Phú Hộ'},
 {key:'doc-vuong',name:'ĐỘC VƯƠNG',group:'evil',rank:8,how:'Hạng 2 phe Ma trận Chính Ma gần nhất'},
 {key:'chien-than',name:'CHIẾN THẦN',group:'event',rank:8,how:'Đứng đầu đánh boss nhiều lần nhất'},
 {key:'kiem-khoi',name:'KIẾM KHÔI',group:'event',rank:8,how:'Vô địch Luận Kiếm gần nhất'},
 {key:'than-luyen-dan',name:'THẦN LUYỆN ĐAN',group:'event',rank:8,how:'Top 1 Lò Đan gần nhất'},
 {key:'ho-dao-vuong',name:'HỘ ĐẠO VƯƠNG',group:'event',rank:8,how:'Hộ đạo nhiều nhất Độ Kiếp gần nhất'},
 {key:'vua-me-cung',name:'VUA MÊ CUNG',group:'event',rank:8,how:'Về nhất Mê Cung gần nhất'},
 {key:'ke-no-lo',name:'KẺ NỔ LÒ',group:'evil',rank:8,how:'Làm nổ Lò Đan gần nhất'},
 {key:'vua-go-dau',name:'VUA GÕ ĐẦU',group:'event',rank:8,how:'Gõ nhiều nhất Hội Gõ Đầu gần nhất'},
 {key:'dau-sat',name:'ĐẦU SẮT',group:'event',rank:8,how:'Bị gõ nhiều nhất Hội Gõ Đầu gần nhất'},
 {key:'chan-truyen',name:'CHÂN TRUYỀN',group:'sect',rank:9,how:'Top 3 tu vi tông môn'},
 {key:'cao-thu-tan-gai',name:'CAO THỦ TÁN GÁI',group:'love',rank:9,how:'Mời kết duyên nhiều nhất tuần'},
 {key:'lao-lang',name:'LÃO LÀNG',group:'sect',rank:10,how:'Tu luyện cùng tông môn lâu nhất'},
 {key:'lam-mom',name:'LẮM MỒM',group:'sect',rank:10,how:'Bình luận nhiều nhất tuần'},
]);
export const TITLE_BY_KEY=Object.freeze(Object.fromEntries(TITLE_LIST.map(t=>[t.key,t])));
export const TITLE_SPARKLE_COINS=3000; // danh hiệu nạp của người tổng quà ≥3.000 coin mới lấp lánh
export const PAID_MIN_COINS=300; // dưới 300 coin không có danh hiệu nạp
