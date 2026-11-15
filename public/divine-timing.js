// 15/11: thời lượng + mốc nổ riêng cho realm 14–21 (bậc thang giữa Tiên Đế 34 s và Ma Thần 46 s; mỗi cảnh dài hơn cảnh trước 1–1,5 s).
export const DIVINE_TIMING=Object.freeze({
 14:{duration:35.5,impact:30.5},15:{duration:37,impact:31.8},16:{duration:38.5,impact:33.1},17:{duration:40,impact:34.4},
 18:{duration:41,impact:35.4},19:{duration:42.5,impact:36.7},20:{duration:44,impact:38.0},21:{duration:45,impact:39.0}
});
export const divineTiming=realm=>{const t=DIVINE_TIMING[realm];return t?{...t,reveal:t.impact+.35,fade:t.duration-1.6}:null;};
