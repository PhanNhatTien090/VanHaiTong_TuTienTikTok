// 10/11/2026 (chủ game): CHỌC GHẸO — trang quản lý chọn 2 người bất kỳ, sân hiện dây tim nối 2 người + tim bay
// + tông sư trêu một câu (~9 s). Chỉ là trò vui trên màn hình: KHÔNG kết duyên, không đổi dữ liệu người chơi.
export const TEASE_MS=9000,TEASE_STYLES=4;
const norm=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d').replace(/Đ/g,'d').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const fail=message=>({ok:false,message});
// Nhận: id, "Tên #MÃ" (dạng ô gợi ý), mã, hoặc đúng tên.
export function findPlayer(w,query){
 const q=String(query||'').trim();if(!q)return [];if(w.players[q])return [w.players[q]];
 const all=Object.values(w.players).filter(p=>!p.resident&&!p.puppet),code=(q.match(/#\s*([A-Za-z0-9]+)\s*$/)||[])[1];
 if(code){const m=all.filter(p=>norm(p.socialCode)===norm(code));if(m.length)return m;}
 const n=norm(q.replace(/#\s*[A-Za-z0-9]+\s*$/,''));if(!n)return [];
 const exact=all.filter(p=>norm(p.name)===n||norm(p.socialCode)===n);return exact;
}
export function teasePair(w,aq,bq,now,c){
 const A=findPlayer(w,aq),B=findPlayer(w,bq),pick=(m,q)=>m.length===1?m[0]:fail(m.length?'Trùng tên "'+String(q).slice(0,20)+'": '+m.slice(0,3).map(p=>p.name+' #'+p.socialCode).join(' · ')+' • chọn từ danh sách gợi ý':'Không tìm thấy "'+String(q||'').slice(0,20)+'"');
 const a=pick(A,aq);if(a.ok===false)return a;const b=pick(B,bq);if(b.ok===false)return b;if(a.id===b.id)return fail('Chọn hai người khác nhau.');
 const style=Math.floor(Math.random()*TEASE_STYLES);
 w.tease={id:'tease-'+now,a:a.id,b:b.id,aName:a.name,bName:b.name,at:now,until:now+TEASE_MS,style};
 c.emit(w,null,`💘 ${a.name} ❤ ${b.name}`,'bond',now,{teasePair:[a.id,b.id],teaseNames:[a.name,b.name],teaseStyle:style});
 return {ok:true};
}

// 16/11 (chủ game): LỄ HỘI KẾT DUYÊN tự chạy chọc ghẹo cho 2–3 cặp nam–nữ đang có mặt, ưu tiên người CHƯA có đạo lữ,
// rồi người còn slot đạo lữ. Mỗi người tối đa 1 lần / lễ hội; không ghép 2 người đã là đạo lữ của nhau. Chỉ là trò vui trên màn.
import {activeBonds,bondAllowance,alreadyBonded} from './bond-relations.mjs';
export const AUTO_TEASE_MAX=3,AUTO_TEASE_FIRST=20000,AUTO_TEASE_GAP=30000,AUTO_TEASE_ACTIVE=5*60000;
export function autoFestivalTease(w,now,c){
 const f=w.bondFestival;if(!f||f.closedAt||now<f.startedAt||now>=f.endsAt)return null;
 if(w.tease&&now<w.tease.until)return null;
 f.autoTease??={count:0,nextAt:f.startedAt+AUTO_TEASE_FIRST,used:[]};const a=f.autoTease;
 if(a.count>=AUTO_TEASE_MAX||now<a.nextAt||f.endsAt-now<TEASE_MS)return null;
 const rank=p=>{const used=activeBonds(w,p.id).length;if(!used)return 0;let room=0;try{room=bondAllowance(w,p).remaining;}catch{}return room>0?1:2;};
 const pool=Object.values(w.players).filter(p=>!p.resident&&!p.puppet&&!p.webOnly&&!String(p.id).startsWith('puppet-')&&now-(p.lastActive||0)<=AUTO_TEASE_ACTIVE&&!a.used.includes(p.id)&&rank(p)<2&&w.playTransfers?.[p.id]?.phase!=='web')
  .sort((x,y)=>rank(x)-rank(y)||(y.lastActive||0)-(x.lastActive||0));
 const men=pool.filter(p=>p.gender==='nam'),women=pool.filter(p=>p.gender==='nu');
 for(const m of men)for(const g of women){if(alreadyBonded(w,m.id,g.id))continue;
  const r=teasePair(w,m.id,g.id,now,c);if(r.ok){a.count++;a.used.push(m.id,g.id);a.nextAt=now+TEASE_MS+AUTO_TEASE_GAP;return r;}}
 a.nextAt=now+15000;return null; // chưa đủ cặp nam–nữ → thử lại sau
}
