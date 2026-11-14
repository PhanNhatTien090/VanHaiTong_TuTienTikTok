// Five rotating guardian trials, layered over the existing 25-second Tower turn.
// Floors, guardian art, milestone rewards, and historic best-floor storage stay unchanged.
const RULES=Object.freeze([
 {id:'sword',name:'Vạn Kiếm Trận',hint:'Gõ phá trận để xuyên kiếm ảnh',command:'phatran',bonus:8},
 {id:'shield',name:'Huyền Giáp Trận',hint:'Gõ hộ pháp để phá kết giới',command:'hophap',bonus:8},
 {id:'beast',name:'Vạn Linh Trận',hint:'Gõ tâm linh nếu có thú đồng hành',command:'tamlinh',bonus:10},
 {id:'mind',name:'Luyện Tâm Trận',hint:'Gõ tâm tĩnh để vượt ảo cảnh',command:'tamtinh',bonus:9},
 {id:'storm',name:'Thiên Kiếp Trận',hint:'Gõ hộ pháp để vượt lôi kiếp',command:'hophap',bonus:9}
]);
export const towerRule=floor=>RULES[((Number(floor)||1)-1)%RULES.length];
export function towerRuleMultiplier(turn,p,now){
 const id=turn?.rule?.id;
 if(id==='shield')return now<(turn?.weakUntil||0)?1.1:.85;
 if(id==='beast')return p?.spiritPet?1.06:.96;
 if(id==='storm')return .93;
 return 1;
}
export function towerRuleAction(turn,p,cmd,now){
 const r=turn?.rule;
 if(!r||r.command!==cmd)return {ok:false,message:'Tầng này cần '+(r?.command||'đánh')+'.'};
 if(now-(turn.lastRuleAction||-Infinity)<10000)return {ok:false,message:'Đạo thuật hồi sau 10 giây.'};
 if(r.id==='beast'&&!p.spiritPet)return {ok:false,message:'Cần linh thú đồng hành; vẫn có thể gõ đánh bình thường.'};
 turn.lastRuleAction=now;
 if(r.id==='shield')turn.weakUntil=now+7000;
 return {ok:true,damage:r.bonus};
}
