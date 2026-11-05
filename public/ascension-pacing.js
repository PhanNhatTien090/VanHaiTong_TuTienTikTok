// Successful gameplay actions, never likes, gifts or arbitrary chat.
// 4/11/2026: từ Chân Tiên (8) trở lên chậm mạnh theo yêu cầu. Người chơi chăm (tu luyện 10s + hái 30s + đánh 4s) ≈ 14 lượt/phút
// → Chân Tiên ~8 phút, tăng dần tới Thần Vương ~25 phút. (Gốc: 10,11,…,18,20; lần chỉnh trước: 30…100 vẫn chỉ ~2 phút/cảnh giới.)
// 4/11 tối: thêm ×1,5 (user thấy vẫn nhanh) → Chân Tiên ~12 phút, Thần Vương ~35 phút chơi chăm. ≤ Đại Thừa giữ nguyên.
export const ASCENSION_PRACTICE_STEPS=Object.freeze([2,3,4,5,6,7,8,9,165,190,210,240,270,310,345,390,440,495]);
export function ascensionPracticeReward(realm,kind,neededQi,neededStones){
 const steps=ASCENSION_PRACTICE_STEPS[Math.max(0,Math.min(17,Number(realm)||0))],weight={cultivate:1,gather:1.4,attack:.35}[kind]||0;
 return {qi:Math.ceil(neededQi/steps*weight),stones:Math.ceil(neededStones/steps*weight),steps};
}
