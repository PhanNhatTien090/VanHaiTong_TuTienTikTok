// 12/11/2026: TIỂU CẢNH GIỚI — Sơ kỳ / Trung kỳ / Hậu kỳ / Viên Mãn trong mỗi cảnh giới. CHỈ HIỂN THỊ, không đổi cân bằng:
// tính theo tiến độ tu vi tới mốc đột phá của cảnh giới hiện tại. Muốn chỉ áp cho cảnh giới cuối thì tăng STAGE_FROM_REALM.
export const STAGE_FROM_REALM=1; // 1 = từ Luyện Khí
export const STAGES=['Sơ kỳ','Trung kỳ','Hậu kỳ','Viên Mãn'];
export function realmStage(realm,qi,need,lastRealm=false){
 if(lastRealm||(Number(realm)||0)<STAGE_FROM_REALM||!(need>0))return null;
 const r=(Number(qi)||0)/need;return r>=1?3:r>=2/3?2:r>=1/3?1:0;
}
export const stageName=i=>i==null?'':STAGES[i];
export const realmWithStage=(name,i)=>i==null?name:`${name} · ${STAGES[i]}`;
