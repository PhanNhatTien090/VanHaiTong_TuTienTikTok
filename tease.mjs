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
