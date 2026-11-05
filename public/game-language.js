// Explicit fictional game mechanics, without consumption or real-world health claims.
export function gameText(value){return String(value??'')
 .replaceAll('Tụ Khí Đan','Tinh Thể Tụ Khí').replaceAll('Ngưng Thần Đan','Tinh Thể Ngưng Thần')
 .replaceAll('Đang hấp thu đan dược','Tinh thể đang hồi chiêu')
 .replaceAll('đan dược','tinh thể trong game').replaceAll('ĐAN DƯỢC','TINH THỂ GAME')
 .replaceAll('Dùng một viên nhận','Kích hoạt vật phẩm trong game nhận')
 .replaceAll('Luyện thành','Chế tạo thành').replace(/^Dùng /,'Kích hoạt ')
 .replaceAll('luyện đan','chế tạo tinh thể').replaceAll('Luyện đan','Chế tạo tinh thể');}
