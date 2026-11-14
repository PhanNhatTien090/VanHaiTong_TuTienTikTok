// LIVE 2.0 Boss Trials — extra cooperative phases on top of the existing encounter clock.
// No damage to players, paid gates, stage override, or changes to legacy boss loot.
import {live2Enabled} from './live2-systems.mjs';
const PHASES=Object.freeze({
 gathering:{id:'gathering',name:'YÊU LỰC TỤ HỘI',hint:'Tấn công để ép yêu thú xuất kết giới',color:'#d8bdfa'},
 seal:{id:'seal',name:'HUYỀN ẤN PHONG MA',hint:'Ba người hợp lực hoặc năm đòn để phá ấn',color:'#94e6ff'},
 frenzy:{id:'frenzy',name:'THIÊN LÔI CUỒNG NỘ',hint:'Đánh đúng lúc để kết thúc trận',color:'#ffc078'}
});
const IDLE=Object.freeze({id:null,name:'',hint:'',mult:1});
const phaseId=b=>{if(!(b?.hp>0)||!Number.isFinite(b?.maxHp)||b.maxHp<=0)return null;const k=b.hp/b.maxHp;return k>.65?'gathering':k>.28?'seal':'frenzy';};
function emitBoss(w,b,now,emit,kind,name){
 if(typeof emit!=='function')return;
 emit(w,null,name,'daoPath',now,{live2:true,live2Kind:'boss',bossPhase:kind,bossName:b.name,daoPath:'demon'});
}
function updatePhase(w,b,now,emit){
 const id=phaseId(b);if(!id)return null;
 const s=b.live2Boss??={phase:null,phaseAt:now,windowAt:0,hits:0,seen:[],exposedUntil:0};
 if(s.phase!==id){
  s.phase=id;s.phaseAt=now;s.windowAt=now;s.hits=0;s.seen=[];s.exposedUntil=0;
  emitBoss(w,b,now,emit,id,PHASES[id].name+' • '+b.name);
 }
 return s;
}
export function live2BossOnHit(w,p,now,emit){
 if(!live2Enabled(w)||!p||p.resident||p.puppet||p.webOnly||!w?.boss?.hp)return 1;
 const b=w.boss,s=updatePhase(w,b,now,emit);if(!s)return 1;
 if(s.phase==='seal'&&s.exposedUntil<=now){
  if(now-s.windowAt>=8000){s.windowAt=now;s.seen=[];s.hits=0;}
  if(!s.seen.includes(p.id)&&s.seen.length<4)s.seen.push(p.id);
  s.hits=Math.min(5,s.hits+1);
  if(s.seen.length>=3||s.hits>=5){
   s.exposedUntil=now+8500;s.hits=0;s.seen=[];s.windowAt=now;
   emitBoss(w,b,now,emit,'seal-break','PHÁ VỠ KẾT GIỚI • Toàn tông công kích!');
  }
 }
 return live2BossMultiplier(b,now);
}
export function live2BossMultiplier(b,now){
 const s=b?.live2Boss;if(!s)return 1;
 if(s.phase==='seal')return s.exposedUntil>now?1.08:.88;
 if(s.phase==='frenzy')return 1.04;
 return 1;
}
export function live2BossTick(w,now,emit){
 if(!live2Enabled(w)||!w.boss||w.boss.hp<=0||w.boss.endsAt<=now)return;
 updatePhase(w,w.boss,now,emit);
}
export function live2BossView(b,now){
 const s=b?.live2Boss;if(!s?.phase||!Object.hasOwn(PHASES,s.phase))return null;
 const def=PHASES[s.phase],exposed=s.phase==='seal'&&s.exposedUntil>now;
 return {id:s.phase,name:exposed?'KẾT GIỚI TAN VỠ':def.name,
   hint:exposed?'Tung chiêu trong 8 giây':def.hint,
   color:def.color,exposed,until:exposed?s.exposedUntil:null,
   progress:s.phase==='seal'&&!exposed?Math.min(5,s.hits||0):null};
}
