// 16/11/2026 (chủ game): MÀN NỞ TỌA KỸ — Linh Châu vỡ → tọa kỹ hiện thân. Bậc càng cao càng bùng nổ để người xem biết
// trúng VIP hay Thần: Thường = quầng sáng gọn; VIP = nổ tím + 10 tia + sóng; Thần = chớp vàng toàn màn + 16 tia + 2 sóng + rung.
// Luật LIVE: chớp toàn màn tối đa 1 lần / 60 s (Thần nở dồn thì bản sau không chớp); mỗi lần chọn 1 trong 3 kiểu xoay tia.
// Vẽ 1 màn một lúc (tối đa 3 màn chờ), chỉ gradient + đường thẳng → nhẹ cho GPU tích hợp.
import {drawMount} from './mount-fx.js';
import {mountById,MOUNT_TIERS,ORBS} from './mounts.js';
const TAU=Math.PI*2,clamp=v=>Math.max(0,Math.min(1,v)),ease=k=>1-(1-clamp(k))**3;
export const REVEAL_MS=Object.freeze({common:2400,vip:3400,divine:4800});
export const REVEAL_FLASH_GAP=60000;
const TITLE={common:'TỌA KỸ HIỆN THÂN',vip:'✦ TỌA KỸ VIP ✦',divine:'✦ THẦN TỌA KỸ ✦'};

export function addMountReveal(scene,e,t){
 const r=e?.mountReveal,m=r&&mountById(r.id);if(!m)return false;
 const tier=m.tier,full=tier==='divine'&&t-(scene.lastMountFlashAt??-1e12)>=REVEAL_FLASH_GAP;if(full)scene.lastMountFlashAt=t;
 let variant=Math.floor(Math.random()*3);if(variant===scene.lastMountRevealVariant)variant=(variant+1)%3;scene.lastMountRevealVariant=variant;
 const list=scene.mountReveals??=[];
 list.push({id:m.id,tier,orb:r.orb,stars:r.stars||0,fresh:!!r.fresh,who:e.name||'',mname:m.name,start:null,full,seed:String(e.id||'')+':'+m.id,variant,queued:t});
 while(list.length>3)list.shift();
 return true;
}
function glow(c,x,y,r,color,a){if(r<=0||a<=0)return;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'#ffffff');g.addColorStop(.25,color);g.addColorStop(1,color+'00');c.globalAlpha=a;c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
function text(c,s,x,y,size,fill,width=7,max=820){c.font=`900 ${size}px "Times New Roman","Segoe UI",serif`;c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';c.lineWidth=width;c.strokeStyle='#05070d';c.strokeText(s,x,y,max);c.fillStyle=fill;c.fillText(s,x,y,max);}

export function drawMountReveals(scene,c,t,H){
 const list=scene.mountReveals;if(!list?.length)return;
 const r=list[0];r.start??=t;
 const d=REVEAL_MS[r.tier]||2400,k=(t-r.start)/d;
 if(k>=1){list.shift();return;}
 const col=MOUNT_TIERS[r.tier]?.color||'#ffffff',x=450,y=H*.5,light=scene.budget?.level==='light'||scene.crowded;
 const fade=clamp(Math.min(k/.08,(1-k)/.15)),crack=clamp(k/.25),burst=clamp((k-.25)/.22),boom=r.tier==='divine'?1:r.tier==='vip'?.7:.4;
 c.save();
 // 1) tối màn cho tọa kỹ nổi lên
 c.globalAlpha=fade*(r.tier==='divine'?.62:r.tier==='vip'?.48:.28);c.fillStyle='#000';c.fillRect(-60,-60,1020,H+120);
 c.globalCompositeOperation='lighter';
 // 2) Linh Châu tụ sáng rồi nổ
 glow(c,x,y-70,50+crack*70+ease(burst)*420*boom,col,fade*(.45+.45*crack)*(1-burst*.4));
 // 3) tia sáng xoay (VIP/Thần)
 if(r.tier!=='common'&&burst>0){
  const n=light?(r.tier==='divine'?8:6):(r.tier==='divine'?16:10),len=(r.tier==='divine'?760:480)*ease(burst),spin=[.00025,-.0003,.00012][r.variant]*(t-r.start);
  c.globalAlpha=fade*(r.tier==='divine'?.55:.42);c.fillStyle=col;
  for(let i=0;i<n;i++){const a=spin+i*TAU/n,w=(i%2?.035:.06);c.beginPath();c.moveTo(x,y-70);c.lineTo(x+Math.cos(a-w)*len,y-70+Math.sin(a-w)*len);c.lineTo(x+Math.cos(a+w)*len,y-70+Math.sin(a+w)*len);c.closePath();c.fill();}
 }
 // 4) sóng xung kích
 c.globalCompositeOperation='source-over';
 for(const [delay,mul] of r.tier==='divine'?[[0,1],[.12,1.4]]:r.tier==='vip'?[[0,1]]:[]){const b=clamp((k-.25-delay)/.3);if(b<=0||b>=1)continue;c.globalAlpha=fade*(1-b);c.strokeStyle=b<.5?'#ffffff':col;c.lineWidth=6*(1-b)+2;c.beginPath();c.ellipse(x,y-70,b*420*mul*boom+30,(b*420*mul*boom+30)*.55,0,0,TAU);c.stroke();}
 // 5) chớp vàng toàn màn (Thần, ≤1 lần/60 s)
 if(r.full&&k>.25&&k<.37){c.globalAlpha=(1-(k-.25)/.12)*.8;c.fillStyle='#fff3c8';c.fillRect(-60,-60,1020,H+120);}
 // 6) tọa kỹ hiện thân
 const show=ease((k-.27)/.2);
 if(show>0){const s=(r.tier==='divine'?2.5:r.tier==='vip'?2.2:1.9)*(.75+.25*show);c.globalAlpha=fade*show;
  try{drawMount(c,r.id,x,y+150,{scale:s,t,lod:light?'light':'full',seed:r.seed});drawMount(c,r.id,x,y+150,{scale:s,t,lod:light?'light':'full',layer:'front',seed:r.seed});}catch{}}
 // 7) chữ: bậc + tên + người nhận
 if(k>.3){const a=fade*ease((k-.3)/.12),pop=1+.25*(1-ease((k-.3)/.15));c.globalAlpha=a;
  c.save();c.translate(x,H*.2);c.scale(pop,pop);text(c,TITLE[r.tier],0,0,r.tier==='divine'?64:r.tier==='vip'?54:40,r.tier==='common'?'#e6fbff':col,9);c.restore();
  text(c,r.mname+(r.stars?' · '+r.stars+'★':''),x,H*.2+60,34,'#ffffff',7);
  text(c,(r.who?r.who+' · ':'')+(ORBS[r.orb]?.name||'Linh Châu')+' vỡ',x,H*.2+100,22,'#e9f4ff',5);}
 c.restore();
 // tiếng nổ đúng lúc châu vỡ (VIP/Thần), 1 lần
 if(r.tier!=='common'&&!r.shook&&k>=.25){r.shook=true;scene.onSpectacleImpact?.();}
}
