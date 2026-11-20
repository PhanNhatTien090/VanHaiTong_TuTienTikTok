// 09/11: pháp bảo đi kèm skin nạp tiền — ai SỞ HỮU thì luôn hiện, không cần đang mặc skin hay đang trang bị.
// Server gửi kèm p.skinGear (chỉ các id dưới đây) cho overlay vì overlay không nhận danh sách artifacts đầy đủ.
export const SKIN_GEAR=Object.freeze(['phan-thien-song-dao','khuy-niet-tu-loi-long','tudo-huyet-dao','hac-kim-hoa-dao','nhan-qua-xich-long-thuong','tinh-ha-kiem','van-co-xa-truong','thien-suong-phien']);
export const ownsGear=(p,id)=>!!p&&(p.equipped===id||!!p.skinGear?.includes?.(id)||!!p.artifacts?.includes?.(id));
