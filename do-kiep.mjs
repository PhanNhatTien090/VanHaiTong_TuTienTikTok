// 20/11/2026 (chủ game duyệt ý 1): BÁCH NHÂN ĐỘ KIẾP — cả sân cùng chịu CỬU ĐẠO THIÊN LÔI (~2,5 phút, chiếm sân).
// Học từ chế độ "Bách Nhân Độ Kiếp" (game Tiên Ngộ) + luật bình luận: người xem làm gì → thấy/nhận lại gì NGAY → vì sao tặng đúng lúc đó.
//  • Ghi danh 25 s: ai đang có mặt tự vào; ai bình luận trong 4 đạo lôi đầu cũng vào. Mỗi người 2 hộ thể.
//  • Mỗi đạo: báo trước 3,5 s "⚡ <tên>" (8% → 35% người còn trụ, tối đa 40) → giáng. Bị nhắm gõ "ne" = 50% né.
//    Trúng lần 1 cháy xém (vẫn trụ), lần 2 hóa tro. Khiên đỡ 1 đòn.
//  • Quà = HỘ ĐẠO, ưu tiên che người ĐANG bị nhắm (khoảnh khắc "xém chết được cứu"):
//    1 xu Hộ Thân Phù (khiên mình; đã hóa tro → hồi sinh) · 10 Hồi Xuân (đầy hộ thể + khiên mình + che 2 người)
//    30 Thiên Cương Tán (khiên mình + che 6 người) · 99 PHẢN LÔI NGHỊCH THIÊN (cả sân khiên + đánh ngược mây kiếp, màn chiếu ngắn).
//  • Thưởng (nguồn 'reward' — KHÔNG nhân hệ số, cùng mức Mê Cung): còn trụ 1,5% tu vi cảnh giới + 20 đá; hóa tro 0,3% + 3 đá;
//    người che được nhiều người nhất (Hộ Đạo Chân Quân) thêm 3% + 50 đá + danh hiệu 1 giờ. Quà cộng tu vi gốc coin×100 như Bảo Khố.
// 20/11 tối (chủ game: "không ai hiểu, nhàm, không biết bị sét đánh thì bị gì") — làm lại nhịp: 7 đạo, báo trước 6 s (bình luận TikTok trễ 2–4 s),
// mỗi đạo GỌI TÊN người bị nhắm (giọng + cuộn đỏ), nhắm nhiều hơn (15% → 45%), ĐẠO CUỐI nhắm CẢ SÂN; trụ tới cuối có danh hiệu Độ Kiếp Tán Tiên.
export const DOKIEP=Object.freeze({registerMs:15000,waves:7,waveGapMs:10000,warnMs:6000,firstMs:3000,lives:3,dodge:.5,podiumMs:14000,maxShield:2,
 share:[.12,.15,.18,.22,.26,.32,1],maxTargets:60,maxPeople:600,lateJoinBefore:4,survivorTitle:'Độ Kiếp Tán Tiên',
 reward:{alive:.015,aliveStones:20,ash:.003,ashStones:3,mvp:.03,mvpStones:50},titleMs:3600000,qiPerCoin:100,
 gifts:[[99,'phan','Phản Lôi Nghịch Thiên',0],[30,'tan','Thiên Cương Tán',6],[10,'hoi','Hồi Xuân Đan',2],[1,'phu','Hộ Thân Phù',0]]});
export const DOKIEP_JOIN=['dokiep','kiep','vaokiep'],DOKIEP_DODGE=['ne','tranh','nelo','neloi'];
const real=p=>p&&!p.resident&&!p.puppet;
const fail=message=>({ok:false,message});
export const doKiepActive=w=>['registration','running'].includes(w.doKiep?.phase);
export const doKiepVisible=(w,now)=>doKiepActive(w)||w.doKiep?.podiumUntil>now;
const alive=e=>Object.entries(e.people).filter(([,m])=>m.hp>0);
const pending=e=>{const v=e.waves.at(-1);return v&&!v.done?v:null;};

export function startDoKiep(w,now,c){
 if(doKiepActive(w))return fail('Bách Nhân Độ Kiếp đang diễn ra.');
 const busy=c.stageConflict?.(w,now);if(busy)return fail('Đang có '+busy+' • chờ kết thúc.');
 w.doKiep={id:'kiep-'+now,phase:'registration',startedAt:now,regEndsAt:now+DOKIEP.registerMs,wave:0,nextAt:0,waves:[],people:{},guard:{},log:[],reversals:[],seq:0};
 c.emit(w,null,'BÁCH NHÂN ĐỘ KIẾP • sét gọi tên ai thì người đó gõ ne để né • trúng 3 lần hóa tro, mất thưởng • trụ đến cuối nhận tu vi + danh hiệu Độ Kiếp Tán Tiên','kiep',now,{kiepStart:true});
 return {ok:true};
}
export function stopDoKiep(w,now,c){const e=w.doKiep;if(!doKiepVisible(w,now))return fail('Không có Bách Nhân Độ Kiếp đang mở.');
 const was=e.phase;e.phase='cancelled';e.podiumUntil=0;if(was==='running'||was==='registration')c.emit(w,null,'Kiếp vân tan • Bách Nhân Độ Kiếp đã dừng','kiep',now,{kiepEnd:true});return {ok:true};}

function join(w,e,p,now){if(!real(p))return null;let m=e.people[p.id];if(m)return m;
 if(Object.keys(e.people).length>=DOKIEP.maxPeople)return null;
 if(e.phase==='running'&&e.wave>=DOKIEP.lateJoinBefore)return null;
 m=e.people[p.id]={name:p.name,hp:DOKIEP.lives,shield:0,hits:0,at:now};return m;}

/** Chat. undefined = không phải lệnh của Độ Kiếp (vẫn tự ghi danh người đang bình luận). */
export function doKiepCommand(w,p,cmd,now,c){
 const e=w.doKiep;if(!e||!doKiepActive(w)||!real(p))return;
 const had=!!e.people[p.id],m=join(w,e,p,now);
 if(DOKIEP_JOIN.includes(cmd)){if(!m)return fail('Kiếp vân đã khép • chờ lượt sau.');return {ok:true,kiep:true,duplicate:had};}
 if(DOKIEP_DODGE.includes(cmd)){const v=pending(e);if(!m||m.hp<=0)return {ok:true,kiep:true,ignored:true};
  if(!v||!v.targets.includes(p.id))return {ok:true,kiep:true,ignored:true}; // né khi không bị nhắm: không phạt, không báo
  m.dodge=v.n;return {ok:true,kiep:true,dodge:true};}
 return undefined;
}
function pick(e,v,list,n){const out=[];const pri=list.filter(([id,m])=>v&&v.targets.includes(id)&&!(m.shield>0)),rest=list.filter(x=>!pri.includes(x));
 for(const pool of [pri,rest]){for(const x of pool.sort(()=>Math.random()-.5)){if(out.length>=n)return out;out.push(x);}}return out;}
/** Quà trong lúc Độ Kiếp (tuyến 'kiep'). Trả {text,kind,saved} hoặc null. */
export function doKiepGift(w,p,unitCoins,count,now,c){
 const e=w.doKiep;if(!e||!doKiepActive(w)||!real(p)||!(unitCoins>0))return null;
 const coins=unitCoins*Math.max(1,count||1),[,kind,name,others]=DOKIEP.gifts.find(([min])=>coins>=min);
 let m=e.people[p.id];if(!m){m=e.people[p.id]={name:p.name,hp:DOKIEP.lives,shield:0,hits:0,at:now,late:true};} // tặng quà thì luôn được vào (kể cả muộn)
 const v=pending(e),revived=m.hp<=0;
 if(kind==='hoi'||revived)m.hp=kind==='hoi'?DOKIEP.lives:Math.max(1,m.hp);
 m.shield=Math.min(DOKIEP.maxShield,(m.shield||0)+1);
 let saved=[];
 if(kind==='phan'){for(const [id,o] of alive(e))if(id!==p.id){o.shield=Math.max(1,o.shield||0);saved.push(id);}
  e.reversals.push({id:p.id,name:p.name,at:now});if(e.reversals.length>6)e.reversals.shift();}
 else if(others)saved=pick(e,v,alive(e).filter(([id])=>id!==p.id),others).map(([id,o])=>{o.shield=Math.min(DOKIEP.maxShield,(o.shield||0)+1);return id;});
 if(saved.length)e.guard[p.id]=(e.guard[p.id]||0)+saved.length;
 (e.log??=[]).push({k:++e.seq,u:p.id,name:p.name,kind,saved:saved.slice(0,8),n:saved.length,revived,at:now});if(e.log.length>14)e.log.shift();
 const qi=c.gain?.(w,p,coins*DOKIEP.qiPerCoin,0,0,now)||0;
 const text=kind==='phan'?'thi triển PHẢN LÔI NGHỊCH THIÊN • cả tông được hộ thể':name+(revived?' • trùng sinh từ tro':'')+(saved.length?' • che '+saved.length+' đạo hữu':' • khiên hộ thân');
 return {kind,name,text,saved:saved.length,revived,qi};
}

function startWave(w,e,now,c){const list=alive(e);if(!list.length)return finish(w,e,now,c);
 const n=e.wave+1,share=DOKIEP.share[n-1]??.35,count=Math.max(1,Math.min(DOKIEP.maxTargets,list.length,Math.ceil(list.length*share)));
 const targets=list.map(([id])=>id).sort(()=>Math.random()-.5).slice(0,count);
 e.wave=n;e.waves.push({n,warnAt:now,strikeAt:now+DOKIEP.warnMs,targets,res:{}});if(e.waves.length>DOKIEP.waves)e.waves.shift();
 const names=targets.slice(0,4).map(id=>e.people[id]?.name||w.players[id]?.name||'').filter(Boolean),final=n===DOKIEP.waves;
 c.emit(w,null,(final?'TỬ TIÊU THẦN LÔI • cả sân bị nhắm':'⚡ Đạo lôi '+n+' nhắm '+names.join(', ')+(count>names.length?' và '+(count-names.length)+' đạo hữu':''))+' • gõ ne để né','kiep',now,{kiepWave:n,kiepFinal:final,kiepNames:names,kiepCount:count});
}
function strike(w,e,v,now,c){
 for(const id of v.targets){const m=e.people[id];if(!m||m.hp<=0){v.res[id]='gone';continue;}
  if(m.shield>0){m.shield--;v.res[id]='shield';continue;}
  if(m.dodge===v.n&&Math.random()<DOKIEP.dodge){v.res[id]='dodge';continue;}
  m.hp--;m.hits++;v.res[id]=m.hp<=0?'ash':'burn';if(m.hp<=0)m.ashAt=now;}
 v.done=true;
 {const by=k=>v.targets.filter(id=>v.res[id]===k).map(id=>e.people[id]?.name||'');e.last={n:v.n,at:now,dodge:by('dodge'),shield:by('shield'),burn:by('burn'),ash:by('ash')};}
 if(v.n>=DOKIEP.waves||!alive(e).length)return finish(w,e,now,c);
 e.nextAt=now+DOKIEP.waveGapMs-DOKIEP.warnMs;
}
function finish(w,e,now,c){if(e.phase==='finished')return;e.phase='finished';e.finishedAt=now;e.podiumUntil=now+DOKIEP.podiumMs;const R=DOKIEP.reward;
 const ids=Object.keys(e.people),survivors=ids.filter(id=>e.people[id].hp>0);
 const mvpId=Object.entries(e.guard).sort((a,b)=>b[1]-a[1])[0]?.[0]||null;
 for(const id of ids){const p=w.players[id];if(!real(p))continue;const m=e.people[id],ok=m.hp>0;if(ok&&id!==mvpId)p.funTitle={name:DOKIEP.survivorTitle,until:now+DOKIEP.titleMs};
  m.qi=c.gain(w,p,Math.max(10,Math.round((c.requiredQi?.(p)||300)*(ok?R.alive:R.ash))),ok?R.aliveStones:R.ashStones,0,now);}
 if(mvpId&&w.players[mvpId]){const p=w.players[mvpId];c.gain(w,p,Math.max(20,Math.round((c.requiredQi?.(p)||300)*R.mvp)),R.mvpStones,0,now);p.funTitle={name:'Hộ Đạo Chân Quân',until:now+DOKIEP.titleMs};}
 e.result={total:ids.length,survivors:survivors.length,mvp:mvpId?{id:mvpId,name:w.players[mvpId]?.name||'',n:e.guard[mvpId]}:null};
 c.emit(w,null,'ĐỘ KIẾP '+(survivors.length?'THÀNH CÔNG':'THẤT BẠI')+' • '+survivors.length+'/'+ids.length+' đạo hữu trụ qua cửu đạo thiên lôi'+(e.result.mvp?' • Hộ Đạo Chân Quân: '+e.result.mvp.name:''),'kiep',now,{kiepEnd:true,kiepResult:e.result});
}
export function tickDoKiep(w,now,c){
 const e=w.doKiep;if(!e||!doKiepActive(w))return;
 if(e.phase==='registration'){if(now<e.regEndsAt)return;
  for(const p of Object.values(w.players))if(real(p)&&c.active?.(w,p,now))join(w,e,p,now);
  if(!Object.keys(e.people).length){e.phase='finished';e.podiumUntil=now+4000;e.result={total:0,survivors:0,mvp:null};c.emit(w,null,'Kiếp vân tan • chưa có đạo hữu nào độ kiếp','kiep',now,{kiepEnd:true});return;}
  e.phase='running';e.nextAt=now+DOKIEP.firstMs;return;}
 const v=pending(e);
 if(v){if(now>=v.strikeAt)strike(w,e,v,now,c);return;}
 if(now>=e.nextAt)startWave(w,e,now,c);
}
/** Gói gọn cho overlay (không gửi cả bảng người khi đông): người trên sân lấy theo id. */
export function doKiepView(w,now){const e=w.doKiep;if(!e||!doKiepVisible(w,now))return null;
 const ppl={};for(const [id,m] of Object.entries(e.people))ppl[id]=[m.hp,m.shield||0,m.ashAt||0];
 const list=Object.values(e.people);
 return {id:e.id,phase:e.phase,startedAt:e.startedAt,regEndsAt:e.regEndsAt,wave:e.wave,waves:DOKIEP.waves,podiumUntil:e.podiumUntil||0,
  wv:e.waves.slice(-2).map(v=>({n:v.n,warnAt:v.warnAt,strikeAt:v.strikeAt,targets:v.targets,names:v.targets.slice(0,4).map(id=>e.people[id]?.name||''),res:v.res,done:!!v.done})),
  ppl,last:e.last||null,total:list.length,alive:list.filter(m=>m.hp>0).length,log:(e.log||[]).slice(-6),reversals:e.reversals||[],result:e.result||null,
  guard:Object.entries(e.guard).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([id,n])=>({id,name:w.players[id]?.name||'',n}))};}
