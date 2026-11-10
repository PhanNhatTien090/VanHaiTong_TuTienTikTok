// 10/11/2026 (chủ game): HỘI GÕ ĐẦU — sự kiện vui ~3 phút. Trong lúc mở, gõ "go <tên | mã>" (hoặc "godau", "gõ đầu")
// thì nhân vật đi bộ tới gõ đầu người kia; "go" không tên = gõ một người ngẫu nhiên đang ở LIVE.
// Người bị gõ rơi ÍT linh thạch sang người gõ (1–3 viên/lần, tối đa BONK.maxLoss viên/người/lượt).
// Chống spam: người gõ chờ BONK.cooldownMs; người vừa bị gõ được "u đầu" BONK.immuneMs không bị gõ tiếp.
// Quà không đổi luật (giftEventRule không tính sự kiện này → quà mặc định như thường).
import {stageConflict} from './stage-lock.mjs';

export const BONK=Object.freeze({durationMs:180000,cooldownMs:15000,immuneMs:8000,minDrop:1,maxDrop:3,maxLoss:15,showMs:3000,podiumMs:8000});
export const BONK_COMMANDS=['go','godau'];
const norm=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d').replace(/Đ/g,'d').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const fail=message=>({ok:false,message});

export const bonkOpen=(w,now)=>!!w.bonkFest&&!w.bonkFest.closedAt&&now<w.bonkFest.endsAt;

export function startBonk(w,now,c){
 if(bonkOpen(w,now))return fail('Hội Gõ Đầu đang mở.');
 const busy=stageConflict(w,now);if(busy)return fail('Sân đang có '+busy+', để sau.');
 w.bonkFest={id:'bonk-'+now,startedAt:now,endsAt:now+BONK.durationMs,hits:[],count:{},taken:{},lost:{},seq:0};
 c.emit(w,null,'HỘI GÕ ĐẦU khai mạc 3 phút • gõ go kèm tên để đi gõ đầu đạo hữu • bị gõ rơi vài linh thạch','bonk',now,{bonkStart:true});
 return {ok:true,endsAt:w.bonkFest.endsAt};
}
export function stopBonk(w,now,c){if(!bonkOpen(w,now))return fail('Không có Hội Gõ Đầu đang mở.');w.bonkFest.endsAt=now;tickBonk(w,now,c);return {ok:true};}

export function tickBonk(w,now,c){
 const e=w.bonkFest;if(!e||e.closedAt||now<e.endsAt)return;
 e.closedAt=now;e.podiumUntil=now+BONK.podiumMs;
 const top=obj=>Object.entries(obj).sort((a,b)=>b[1]-a[1])[0];
 const [hid,hn]=top(e.count)||[],[vid,vn]=top(e.lost)||[];
 const hitter=hid&&w.players[hid],victim=vid&&w.players[vid];
 e.result={hitter:hitter?{id:hitter.id,name:hitter.name,n:hn}:null,victim:victim?{id:victim.id,name:victim.name,n:vn}:null,total:e.seq};
 const parts=[hitter&&`Thiết Thủ Vương ${hitter.name} gõ ${hn} lần`,victim&&`Đầu Sắt ${victim.name} bị gõ ${vn} lần`].filter(Boolean);
 c.emit(w,null,'Hội Gõ Đầu khép lại'+(parts.length?' • '+parts.join(' • '):''),'bonk',now,{bonkEnd:true,bonkHitter:hitter?.name||'',bonkVictim:victim?.name||''});
}

// Phần sau lệnh, giữ chữ gốc ("go Lam Ba", "gõ đầu Lam Ba", "godau @abc").
function targetText(text){
 const tokens=String(text||'').trim().split(/\s+/);const first=norm(tokens.shift()).replace(/ /g,'');
 if(first==='go'&&tokens.length&&norm(tokens[0])==='dau')tokens.shift();
 return tokens.join(' ').replace(/^@+/,'').trim();
}
function pickTarget(w,p,query,now,active){
 const pool=Object.values(w.players).filter(x=>x.id!==p.id&&!x.resident&&!x.puppet&&active(w,x,now));
 const q=norm(query);
 if(!q){const free=pool.filter(x=>!(w.bonkFest.immune?.[x.id]>now));const list=free.length?free:pool;return list.length?{target:list[Math.floor(Math.random()*list.length)]}:{error:'Chưa có ai khác ở LIVE để gõ.'};}
 const keys=x=>[norm(x.name),norm(x.socialCode),norm(x.handle)].filter(Boolean);
 let m=pool.filter(x=>keys(x).includes(q)||x.id===query.trim());
 if(!m.length&&q.length>=3)m=pool.filter(x=>keys(x).some(k=>k.startsWith(q)));
 if(!m.length)return {error:norm(p.name)===q||norm(p.socialCode)===q?'Không tự gõ đầu mình được.':`Không thấy ${query.slice(0,24)} đang ở LIVE • gõ go kèm tên hoặc mã`};
 if(m.length>1)return {error:'Trùng tên: '+m.slice(0,3).map(x=>x.name+' #'+(x.socialCode||'')).join(' · ')+' • gõ go kèm mã'};
 return {target:m[0]};
}

export function bonkCommand(w,p,cmd,text,now,c){
 if(!BONK_COMMANDS.includes(cmd)||!bonkOpen(w,now))return null;
 if(p.resident||p.puppet)return fail('Gõ đầu dành cho người xem thật.');
 const e=w.bonkFest;e.immune??={};e.next??={};
 if(e.next[p.id]>now)return fail(`Tay còn mỏi • gõ tiếp sau ${Math.ceil((e.next[p.id]-now)/1000)}s`);
 const r=pickTarget(w,p,targetText(text),now,c.active);if(r.error)return fail(r.error);
 const t=r.target;
 if(e.immune[t.id]>now)return fail(`${t.name} vừa bị gõ, đầu còn u • chờ ${Math.ceil((e.immune[t.id]-now)/1000)}s`);
 const room=Math.max(0,BONK.maxLoss-(e.taken[t.id]||0)),want=BONK.minDrop+Math.floor(Math.random()*(BONK.maxDrop-BONK.minDrop+1));
 const drop=Math.max(0,Math.min(want,room,Math.floor(t.stones||0)));
 t.stones-=drop;p.stones=(p.stones||0)+drop;
 e.taken[t.id]=(e.taken[t.id]||0)+drop;e.count[p.id]=(e.count[p.id]||0)+1;e.lost[t.id]=(e.lost[t.id]||0)+1;
 e.next[p.id]=now+BONK.cooldownMs;e.immune[t.id]=now+BONK.immuneMs;
 e.seq++;e.hits.push({id:e.id+':'+e.seq,a:p.id,b:t.id,an:p.name,bn:t.name,s:drop,at:now,v:Math.floor(Math.random()*4)});
 if(e.hits.length>40)e.hits.splice(0,e.hits.length-40);
 return {ok:true,bonk:t.id,stones:drop};
}

export function bonkView(w,now){
 const e=w.bonkFest;if(!e)return null;
 const open=bonkOpen(w,now);if(!open&&!(e.podiumUntil>now))return null;
 return {id:e.id,active:open,endsAt:e.endsAt,total:e.seq,hits:open?e.hits.filter(h=>now-h.at<BONK.showMs):[],result:open?null:e.result||null};
}
