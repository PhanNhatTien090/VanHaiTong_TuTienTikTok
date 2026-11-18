// 18/11/2026 (chủ game): TRANG QUẢN LÝ — chỉnh vật phẩm mới cho người chơi: THẦN KHÍ (Bảo Khố), LINH CHÂU, TỌA KỸ.
// Gọi từ adminEditPlayer (engine.mjs). announce=true → có hiệu ứng + giọng (thẻ thần khí / thẻ Linh Châu / màn nở tọa kỹ); false → cấp lặng lẽ.
// Ném Error(message) khi dữ liệu sai — adminEditPlayer bắt và trả fail(message).
import {BAO_ITEMS,BAO_TIER,BAO_MAX_STARS,baoItem} from './public/phap-bao-data.js';
import {MOUNTS,MAX_STARS,mountById} from './public/mounts.js';
import {ensureMountState} from './mounts.mjs';
import {ORBS} from './public/mounts.js';

const stars=(v,max)=>{const n=Number(v);if(!Number.isInteger(n)||n<1||n>max)throw Error('Số sao phải từ 1 đến '+max+'.');return n;};
const bao=p=>(p.bao??={p4:0,p5:0,items:{},lim:null});
const season=w=>(w.baoSeason??={n:1,owners:{}});
const ORB_NAME={common:'Linh Châu xanh',vip:'Linh Châu tím',divine:'Linh Châu vàng'};

export function adminItems(w,p,patch,now,{announce=false,emit}={}){
 const changes=[],say=(text,type,extra)=>{if(announce&&emit)emit(w,p,text,type,now,extra);};
 // ---------- THẦN KHÍ ----------
 for(const row of [].concat(patch.addBao||[])){
  const it=baoItem(row?.id);if(!it)throw Error('Thần khí không tồn tại.');const s=stars(row.stars??1,BAO_MAX_STARS),b=bao(p);
  if(it.tier===6){const owner=season(w).owners[it.id];if(owner&&owner!==p.id)throw Error(it.name+' (GIỚI HẠN) đã có chủ: '+(w.players[owner]?.name||owner)+'. Gỡ ở người đó trước.');
   if(b.lim&&b.lim.id!==it.id&&b.items[b.lim.id])throw Error('Người này đã có thần khí GIỚI HẠN '+(baoItem(b.lim.id)?.name||'')+' (mỗi người 1 món/mùa).');
   season(w).owners[it.id]=p.id;b.lim={season:season(w).n,id:it.id};}
  const had=b.items[it.id];b.items[it.id]=s;changes.push((had?'đổi ':'trao thần khí ')+it.name+' ★'+s);
  say((it.tier===6?'THẦN KHÍ GIỚI HẠN • ':it.tier===5?'Thần khí cao cấp • ':'Thần khí • ')+p.name+' nhận '+it.name+' ★'+s+' • gõ thần khí để xem · trang bị + tên để đeo','bao-kho',
   {baoWin:{tier:it.tier,id:it.id,stars:s,item:it.name},orbCard:{kind:'bao',stage:'got',id:it.id,tier:it.tier,stars:s,item:it.name}});
 }
 for(const [id,v] of Object.entries(patch.baoStars||{})){const it=baoItem(id),b=bao(p);if(!it||!b.items[id])throw Error('Người này chưa có thần khí đó.');const s=stars(v,BAO_MAX_STARS);if(s!==b.items[id]){changes.push(it.name+' ★'+b.items[id]+' → ★'+s);b.items[id]=s;}}
 for(const id of [].concat(patch.removeBao||[])){const b=bao(p);if(!b.items[id])continue;delete b.items[id];if(b.ban===id)delete b.ban;
  if(b.lim?.id===id){b.lim=null;if(season(w).owners[id]===p.id)delete season(w).owners[id];}changes.push('gỡ thần khí '+(baoItem(id)?.name||id));}
 if(patch.baoBan!==undefined){const id=patch.baoBan||null,b=bao(p);if(id&&!b.items[id])throw Error('Chỉ đặt bản mệnh bằng thần khí người này đang có.');
  if((b.ban||null)!==id){if(id)b.ban=id;else delete b.ban;changes.push(id?'bản mệnh '+baoItem(id)?.name:'bản mệnh tự chọn món mạnh nhất');}}
 // ---------- LINH CHÂU ----------
 if(patch.mountOrbs&&typeof patch.mountOrbs==='object'){ensureMountState(p);
  for(const k of ['common','vip','divine']){if(patch.mountOrbs[k]===undefined)continue;const n=Number(patch.mountOrbs[k]);if(!Number.isInteger(n)||n<0||n>999)throw Error('Số Linh Châu 0 – 999.');
   const old=p.mountOrbs[k];if(n===old)continue;p.mountOrbs[k]=n;changes.push(ORB_NAME[k]+' '+old+' → '+n);
   if(n>old)say(p.name+' nhận '+(n-old>1?(n-old)+' ':'')+ORBS[k].name+' · gõ truyencong'+(k==='common'?'':' '+(k==='vip'?'vip':'than')),'mount',{mountOrb:k,orbCount:n-old,...(k!=='common'?{orbCard:{kind:k,stage:'got',count:n-old}}:{})});}}
 // ---------- TỌA KỸ ----------
 for(const row of [].concat(patch.addMount||[])){const m=mountById(row?.id);if(!m)throw Error('Tọa kỹ không tồn tại.');const s=stars(row.stars??1,MAX_STARS);ensureMountState(p);
  const had=p.mounts[m.id];p.mounts[m.id]={...(had||{}),stars:s,at:had?.at||now};changes.push((had?'đổi ':'trao tọa kỹ ')+m.name+' ★'+s);
  say('Tọa kỹ hiện thân • '+p.name+' nhận '+m.name+' '+s+'★','mount',{mountReveal:{id:m.id,tier:m.tier,orb:m.tier==='divine'?'divine':m.tier==='vip'?'vip':'common',stars:s,fresh:!had}});}
 for(const [id,v] of Object.entries(patch.mountStars||{})){const m=mountById(id);if(!m||!p.mounts?.[id])throw Error('Người này chưa có tọa kỹ đó.');const s=stars(v,MAX_STARS);if(s!==p.mounts[id].stars){changes.push(m.name+' '+p.mounts[id].stars+'★ → '+s+'★');p.mounts[id].stars=s;}}
 for(const id of [].concat(patch.removeMounts||[])){if(!p.mounts?.[id])continue;delete p.mounts[id];if(p.mount===id)p.mount=null;changes.push('gỡ tọa kỹ '+(mountById(id)?.name||id));}
 if(patch.mount!==undefined){const id=patch.mount||null;if(id&&!p.mounts?.[id])throw Error('Chỉ cưỡi được tọa kỹ người này đang có.');if((p.mount||null)!==id){p.mount=id;changes.push(id?'cưỡi '+mountById(id)?.name:'xuống tọa kỹ');}}
 return changes;
}
export {BAO_ITEMS,BAO_TIER,MOUNTS};
