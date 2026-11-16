// Vân Hải Lôi Đài — vẽ sân khấu (15/11/2026). Server quyết mọi con số; file này chỉ dựng hình theo nhật ký trận.
// Nhật ký phát chậm ARENA_DELAY_MS để mọi đòn (server tính mỗi giây) hiện đúng nhịp, không dồn cục.
import {TECHNIQUES,drawCombatTechnique} from './combat-techniques.js';
import {drawShockwave,drawAura,drawSeal} from './cinematic-vfx.js';
import {drawV7Variant,v7SkillSpec,prewarmVariantArt} from './ultimate-variants-v7.js';
import {drawDuelV6Ultimate,v6SkillFamily,prewarmDuelV6} from './duel-showcase-v6.js';
import {drawPetV2SkillSignature} from './pet-v2-skill-fx.js';
import {duelSoundPreset} from './duel-cinematic.js';
import {bannerPlan,bannerLane,drawSkillBannerLane,bannerLife} from './skill-banner.js?v=loi-dai-banner-20261116';
import {portraitCanvas} from './linh-bai.js';
import {drawQueueAvatars} from './queue-avatars.js';
import {drawArtSkill,loadSkillArt} from './arena-art-skills.js?v=loi-dai-v2-20261115';
import {arenaElement,drawElementTrail,drawElementImpact} from './arena-fx.js?v=loi-dai-fx-20261115';
import {findCut,cutFull,drawCutFull,drawCutEdges,prewarmCutArt} from './skill-cutscene.js?v=20261117';

export const ARENA_DELAY_MS=1100;
export const ARENA_LAYOUT=Object.freeze({floor:.355,leftX:262,rightX:638,soloX:450,fighterScale:2.05,hud:.392,rows:[.548,.628,.708],cols:8,guide:.752,audienceScale:.98});
const TAU=Math.PI*2,clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),ease=k=>1-(1-clamp(k))**3;
const DUR=Object.freeze({0:1700,1:950,2:1150,3:1150,4:1250,5:2600});
const ULT=5,PET=4,CD_TOTAL={2:6000,3:8000,4:10000};
const fmt=n=>Math.max(0,Math.round(n)).toLocaleString('vi-VN');
const techObj=(id,name,color)=>({...(TECHNIQUES[id]||TECHNIQUES.slash),id:TECHNIQUES[id]?id:'slash',name:name||TECHNIQUES[id]?.name,color:color||TECHNIQUES[id]?.color,intensity:2});

export function syncArena(scene,state){
 scene.arena=state.arena||null;
 if(!scene.arena)return;
 scene.arenaClockOffset=(state.serverNow||Date.now())-Date.now();
 scene.portraitFor??=p=>p&&scene.standingArt?.naturalWidth?portraitCanvas(scene,p):null;
 const m=scene.arena.current;
 if(m&&scene.arenaPrewarm!==m.id){
  scene.arenaPrewarm=m.id;
  // Ảnh tuyệt kỹ V6/V7 rasterize trước khi cần (bài học V7: không giải mã SVG lúc đang vẽ).
  const fake={id:'arena:'+m.id,a:m.a,b:m.b,techniques:Object.fromEntries([m.a,m.b].map(id=>[id,{id:m.fighters[id].kit[3].tech}]))};
  try{prewarmDuelV6(scene,fake);prewarmVariantArt(scene,fake);}catch{}
  // Ảnh bí pháp + ảnh quà trợ chiêu nạp trước khi cần.
  for(const id of [m.a,m.b])for(const k of m.fighters[id].kit)if(k.art)loadSkillArt(scene,k.art);
  for(const k of ['axe','sword-rain','fire-dragon'])loadSkillArt(scene,k);
  for(const id of [m.a,m.b])prewarmCutArt(state.players?.find?.(p=>p.id===id)?.skinChoice);
 }
}
/** Đấu thủ trên đài + khán giả ngồi các bậc thềm. */
export function arenaTargets(scene,actors,audience,H){
 const L=ARENA_LAYOUT,ids=new Set(actors.map(p=>p.id)),out=[];
 const pair=actors.length===2;
 actors.forEach((p,i)=>out.push({id:p.id,player:p,x:pair?(i?L.rightX:L.leftX):L.soloX,y:H*L.floor,baseY:H*L.floor,scale:L.fighterScale,lift:0,arenaFighter:true,facing:pair?(i?-1:1):1}));
 const seats=audience.filter(p=>!ids.has(p.id)).slice(0,L.rows.length*L.cols);
 seats.forEach((p,i)=>{const row=Math.floor(i/L.cols),inRow=Math.min(L.cols,seats.length-row*L.cols),col=i%L.cols,stagger=row%2?28:0;
  out.push({id:p.id,player:p,x:450+(col-(inRow-1)/2)*(800/L.cols)+stagger,y:H*L.rows[row],scale:L.audienceScale+row*.04,lift:0});});
 return out;
}
const serverNow=scene=>Date.now()+(scene.arenaClockOffset||0);
const shown=scene=>serverNow(scene)-ARENA_DELAY_MS;
function fighterHp(m,id,at){
 let hp=m.fighters[id].maxHp;
 for(const e of m.log){if(e.at>at)break;if(e.by===id&&e.hpBy!=null)hp=e.hpBy;if(e.to===id&&e.hpTo!=null)hp=e.hpTo;}
 return hp;
}
function text(c,s,x,y,{size=20,color='#fff',stroke='#071018',weight='900',align='center',max,width=5}={}){
 c.font=`${weight} ${size}px "Segoe UI",Arial,sans-serif`;c.textAlign=align;c.textBaseline='middle';c.lineJoin='round';
 if(stroke){c.lineWidth=width;c.strokeStyle=stroke;c.strokeText(s,x,y,max);}c.fillStyle=color;c.fillText(s,x,y,max);
}
function panel(c,x,y,w,h,fill='#06121fcc',stroke='#ffd98a66'){c.fillStyle=fill;c.fillRect(x,y,w,h);c.strokeStyle=stroke;c.lineWidth=1;c.strokeRect(x+.5,y+.5,w-1,h-1);}

function drawHud(scene,c,m,H,t){
 const L=ARENA_LAYOUT,y=H*L.hud,at=shown(scene),realms=scene.lastState?.realms||[];
 const sides=[[m.a,20,1],[m.b,470,-1]];
 scene.arenaGhost??=new Map();
 for(const [id,x,dir] of sides){
  const f=m.fighters[id],hp=fighterHp(m,id,at),pct=clamp(hp/f.maxHp),w=410;
  const ghost=scene.arenaGhost.get(id)??pct,g2=ghost>pct?Math.max(pct,ghost-.006):pct;scene.arenaGhost.set(id,g2);
  panel(c,x,y,w,112);
  text(c,f.name,dir>0?x+10:x+w-10,y+16,{size:19,align:dir>0?'left':'right',max:250});
  text(c,realms[f.realm]||'',dir>0?x+w-10:x+10,y+16,{size:14,color:'#ffe2a4',align:dir>0?'right':'left',weight:'700',max:140,width:3});
  // Thanh máu: vệt đỏ trễ (máu vừa mất) + máu thật + khiên.
  const bx=x+10,by=y+30,bw=w-20,bh=18;
  c.fillStyle='#1b0d12';c.fillRect(bx,by,bw,bh);
  const fill=(k,col)=>{const ww=bw*k;c.fillStyle=col;dir>0?c.fillRect(bx,by,ww,bh):c.fillRect(bx+bw-ww,by,ww,bh);};
  fill(g2,'#ff5a4a');
  const grad=c.createLinearGradient(bx,0,bx+bw,0);grad.addColorStop(0,dir>0?'#5cf08f':'#2fd4a8');grad.addColorStop(1,dir>0?'#2fd4a8':'#5cf08f');fill(pct,grad);
  if(f.shield>0){c.fillStyle='#8fe6ff66';const sk=clamp(f.shield/f.maxHp);dir>0?c.fillRect(bx,by,bw*sk,5):c.fillRect(bx+bw-bw*sk,by,bw*sk,5);}
  c.strokeStyle='#ffffff55';c.strokeRect(bx+.5,by+.5,bw-1,bh-1);
  text(c,fmt(hp)+' / '+fmt(f.maxHp),bx+bw/2,by+bh/2+1,{size:13,weight:'800',width:3});
  // Nộ khí
  const rk=clamp(f.rage/100),ry=by+bh+4;c.fillStyle='#24180a';c.fillRect(bx,ry,bw,6);
  c.fillStyle=rk>=1?(Math.floor(t/180)%2?'#fff1b0':'#ffb43c'):'#ffb43c';dir>0?c.fillRect(bx,ry,bw*rk,6):c.fillRect(bx+bw-bw*rk,ry,bw*rk,6);
  // 4 ô chiêu
  for(const k of f.kit){
   const i=k.slot-1,cx=dir>0?bx+24+i*52:bx+bw-24-i*52,cy=y+86,r=20,ready=k.slot===ULT?f.rage>=100:!(f.cd[k.slot]>0);
   c.save();c.beginPath();c.arc(cx,cy,r,0,TAU);c.fillStyle='#0b1a29';c.fill();
   const g=c.createRadialGradient(cx,cy-6,2,cx,cy,r);g.addColorStop(0,'#ffffffcc');g.addColorStop(.35,k.color||'#9cf');g.addColorStop(1,'#0b1a29');c.globalAlpha=ready?1:.45;c.fillStyle=g;c.beginPath();c.arc(cx,cy,r-2,0,TAU);c.fill();c.globalAlpha=1;
   if(!ready&&k.slot!==ULT&&f.cd[k.slot]>0){const total=CD_TOTAL[k.slot]||8000,part=clamp(f.cd[k.slot]/total);c.fillStyle='#000a';c.beginPath();c.moveTo(cx,cy);c.arc(cx,cy,r-2,-Math.PI/2,-Math.PI/2+TAU*part);c.closePath();c.fill();}
   if(k.slot===ULT&&ready){c.strokeStyle='#ffe28a';c.lineWidth=2.5;c.globalAlpha=.6+.4*Math.sin(t*.012);c.beginPath();c.arc(cx,cy,r+2,0,TAU);c.stroke();c.globalAlpha=1;}
   c.restore();
   text(c,'SK'+k.slot,cx,cy+1,{size:12,weight:'900',width:3});
   text(c,'Lv'+k.lv,cx+(dir>0?14:-14),cy-17,{size:10,color:'#ffe2a4',weight:'800',width:3});
  }
  const chips=[f.stunned&&['CHOÁNG','#ffd36b'],f.poison&&['ĐỘC','#9dff7a'],f.weak&&['YẾU','#9fd1ff'],f.reflect&&['PHẢN','#ffb0e8'],f.shield>0&&['KHIÊN','#8fe6ff']].filter(Boolean);
  chips.forEach(([label,col],i)=>text(c,label,dir>0?x+w-30-i*50:x+30+i*50,y+86,{size:13,color:col,width:3}));
 }
 // Giữa: đồng hồ + tỉ lệ thắng
 const left=Math.max(0,Math.ceil((m.endsAt-serverNow(scene))/1000)),cx=450,cy=y+56;
 c.save();c.beginPath();c.arc(cx,cy,30,0,TAU);c.fillStyle='#071423ee';c.fill();c.strokeStyle='#ffd98a';c.lineWidth=2;c.stroke();c.restore();
 text(c,serverNow(scene)<m.fightAt?'VS':left+'s',cx,cy,{size:serverNow(scene)<m.fightAt?24:22,color:'#ffe9b0'});
 if(m.locked==null)text(c,'Tỉ lệ '+m.odds+'% · '+(100-m.odds)+'%',cx,y+102,{size:12,color:'#cfe9ff',weight:'700',width:3});
 else text(c,'Chênh tu vi lớn',cx,y+102,{size:12,color:'#ffcf8a',weight:'700',width:3});
}

function drawCast(scene,c,m,e,k,H,t,targets){
 if(!e?.skill||e.stunned||e.dot||e.cut)return; // 17/11: đòn chiếu riêng vẽ ở skill-cutscene.js // đòn bị choáng / nhịp độc: không có hình chiêu
 const A=targets.get(e.by),B=targets.get(e.to);if(!A||!B)return;
 const light=scene.budget?.level==='light'||scene.heavyCrowd;
 // Biến thể mỗi đòn (chống "reproduced content"): lệch điểm trúng, cỡ, nghiêng.
 const seed=(e.n*2654435761>>>0)%1000/1000,jx=(seed-.5)*60,jy=((seed*7)%1-.5)*40,sc=.85+seed*.35;
 const self=e.target==='self',aim={x:(self?A.x:B.x)+jx*.5,y:(self?A.y:B.y)-150+jy};
 const tech=techObj(e.skill.tech,e.skill.name,e.skill.color);
 // Bí pháp / trợ chiêu có ảnh: dùng hình riêng (rìu, mưa kiếm, lốc, sóng, độc, gậy, rồng lửa, kim thân) + nổ theo hệ.
 if(e.skill.art&&drawArtSkill(scene,c,e.skill.art,k,A,B,H,{self,seed:e.n})){if(!self)drawElementImpact(c,arenaElement(tech.id),B.x,B.y-130,k,e.n,{power:e.gift||e.tier>=3?3:2,light});return;}
 if(e.slot===ULT){
  const ult=v7SkillSpec(tech.id)?drawV7Variant(scene,c,t,A,{x:B.x,y:B.y-120},tech,k):v6SkillFamily(tech.id)?drawDuelV6Ultimate(scene,c,t,A,{x:B.x,y:B.y-120},tech,k):false;
  if(!ult){const rk=clamp((k-.35)/.65);if(rk>0)drawCombatTechnique(c,{technique:tech,target:{x:aim.x,yRatio:aim.y/H}},scene.motion?t:0,rk,A,H,{light,signatures:scene.signatureSprites,relics:scene.combatSprites});}
  if(k<.45){drawAura(c,'gold',A.x,A.y-120,90+160*k,.25+.4*k);drawSeal(c,'gold',A.x,A.y+6,90+60*k,scene.motion?t*.001:0,.6);}
  drawElementImpact(c,arenaElement(tech.id),B.x,B.y-130,k,e.n,{power:3,light});
  return;
 }
 if(e.slot===PET&&e.skill.pet){
  const px=self?A.x:B.x,py=(self?A.y:B.y)-110;
  drawPetV2SkillSignature(c,e.skill.pet,px,py,170*sc,k,{motion:scene.motion!==false,light});
 }
 if(self){
  if(e.shield){c.save();c.globalAlpha=.75*Math.sin(Math.PI*clamp(k));c.strokeStyle='#8fe6ff';c.lineWidth=4;c.beginPath();c.ellipse(A.x,A.y-120,90,160,0,0,TAU);c.stroke();c.restore();drawSeal(c,'jade',A.x,A.y+8,95,scene.motion?t*.001:0,.55*Math.sin(Math.PI*clamp(k)));}
  if(e.heal){drawAura(c,'jade',A.x,A.y-110,80+60*k,.45*Math.sin(Math.PI*clamp(k)));}
  return;
 }
 // Lớp hệ chiêu: đường bay từ người ra đòn tới điểm trúng + nổ theo hệ.
 const el=arenaElement(tech.id);
 drawElementTrail(c,el,{x:A.x,y:A.y-170},aim,k,e.n,{light});
 drawElementImpact(c,el,aim.x,aim.y,k,e.n,{power:e.crit?2:1,light});
 c.save();c.translate(aim.x,aim.y);c.scale(sc,sc);c.rotate((seed-.5)*.25);c.translate(-aim.x,-aim.y);
 drawCombatTechnique(c,{technique:tech,target:{x:aim.x,yRatio:aim.y/H}},scene.motion?t:0,clamp(k),A,H,{light,signatures:scene.signatureSprites,relics:scene.combatSprites});
 c.restore();
 if(k>.55&&!light)drawShockwave(c,e.crit?'gold':'jade',B.x,B.y-90,(k-.55)*DUR[e.slot],{quality:'balanced',radius:e.crit?190:120,seed:e.n*.13,motion:scene.motion,flash:false,aspect:.6});
}
function drawNumbers(scene,c,e,k,targets){
 if(e.cut)return;
 const B=targets.get(e.to),A=targets.get(e.by);if(!B||!A||k<.55)return;
 const u=clamp((k-.55)/.45),y0=(B.y-235)-u*55,a=Math.min(1,(1-u)*2.2);
 c.save();c.globalAlpha=a;
 if(e.stunned){text(c,'BỊ CHOÁNG',A.x,A.y-300-u*40,{size:22,color:'#ffd36b'});c.restore();return;}
 if(e.dot){text(c,'-'+fmt(e.dmg),B.x+20,y0+30,{size:24,color:'#9dff7a',width:4});text(c,'ĐỘC',B.x+20,y0+2,{size:15,color:'#9dff7a',width:3});c.restore();return;}
 const tags=[e.counter&&'KHẮC HỆ',e.combo&&'LIÊN CHIÊU',e.burn&&'BỎNG',e.weaken&&'GIẢM CÔNG',e.knock&&'ĐẨY LÙI',e.broke&&'PHÁ KHIÊN',e.reflectOn&&'PHẢN ĐÒN'].filter(Boolean);
 if(tags.length)text(c,tags.join(' · '),B.x,y0+44,{size:17,color:'#ffe7a8',width:4,max:420});
 if(e.reflect)text(c,'PHẢN -'+fmt(e.reflect),A.x,A.y-270-u*40,{size:22,color:'#ffb0e8',width:4});
 if(e.dmg){const big=e.crit||e.slot===ULT||e.gift;text(c,'-'+fmt(e.dmg),B.x+((e.n%3)-1)*30,y0,{size:big?50:34,color:big?'#ffd54a':'#ffffff',width:big?7:5});
  if(big)text(c,e.slot===ULT?'TUYỆT KỸ':e.gift?'BẠO PHÁT':'BẠO KÍCH',B.x,y0-40,{size:20,color:'#ff9b3d'});}
 if(e.heal)text(c,'+'+fmt(e.heal),A.x,A.y-300-u*60,{size:30,color:'#7dffa8'});
 if(e.shield)text(c,'KHIÊN +'+fmt(e.shield),A.x,A.y-340-u*50,{size:22,color:'#9be8ff'});
 if(e.stun)text(c,'CHOÁNG',B.x,y0+40,{size:24,color:'#ffd36b'});
 c.restore();
}
function drawSkillBanner(scene,c,e,k,targets,H){
 const A=targets.get(e.by);if(!A||e.stunned)return;const a=Math.min(1,k/.1,(1-k)/.2);if(a<=0)return;
 if(e.slot===ULT||e.gift){
  // Cut-in tuyệt kỹ: dải ngang + tên lớn
  const y=H*.17,slide=ease(k/.2);c.save();c.globalAlpha=a*.92;
  const g=c.createLinearGradient(0,y-60,0,y+60);g.addColorStop(0,'#00000000');g.addColorStop(.3,'#1a0d00e0');g.addColorStop(.7,'#1a0d00e0');g.addColorStop(1,'#00000000');c.fillStyle=g;c.fillRect(0,y-60,900,120);
  c.restore();c.save();c.globalAlpha=a;
  text(c,e.skill.name,450+(1-slide)*(A.x<450?-500:500),y,{size:52,color:e.skill.color||'#ffe08a',width:8});
  text(c,(e.gift?'QUÀ · ':'TUYỆT KỸ · ')+(scene.arena.current?.fighters?.[e.by]?.name||''),450,y+44,{size:18,color:'#fff2cc',width:4});
  c.restore();return;
 }
 c.save();c.globalAlpha=a;text(c,'SK'+e.slot+' · '+e.skill.name,A.x,A.y-330,{size:22,color:e.skill.color||'#e9f6ff',width:5,max:380});c.restore();
}

/** 17/11: gọi đầu scene.drawFrame — đang chiếu riêng thì vẽ màn riêng THAY cả sân (trả true). */
export function arenaCutFrame(scene,c,t,H){
 const a=scene.socialScene==='arena'?scene.arena:null,m=a?.current;
 const cut=m?findCut(m.log,serverNow(scene)-ARENA_DELAY_MS):null,full=cutFull(cut),on=!!cut&&cut.age<cut.ms; // HTML ẩn suốt lúc chém vào → mở lại
 if(scene.cutsceneOn!==on){scene.cutsceneOn=on;document.body.classList.toggle('cutscene-on',on);}
 if(!full)return false;
 try{return drawCutFull(scene,c,t,H,cut,scene.playerIndex||new Map());}catch(err){console.warn('[cut]',err);return false;}
}
export function drawArena(scene,c,t,layer){
 const a=scene.arena,H=scene.height;if(!a)return;
 const now=serverNow(scene),at=now-ARENA_DELAY_MS,m=a.current;
 const targets=new Map((scene.targets||[]).filter(x=>x.arenaFighter).map(x=>[x.id,x]));
 if(layer==='back'){
  // Trận văn dưới chân đấu thủ + kết giới mờ quanh đài.
  for(const x of targets.values())drawSeal(c,x.facing<0?'dusk':'jade',x.x,x.y+6,70,scene.motion?t*.0006:0,.45);
  if(m){
   // Lùi người khi trúng đòn, lao tới khi ra chiêu (sửa vị trí trước khi vẽ nhân vật).
   for(const x of targets.values()){x.x=x.homeX??(x.homeX=x.x);}
   for(const e of m.log){const age=at-e.at,d=DUR[e.slot]||1000;if(age<0||age>d)continue;const k=age/d,A=targets.get(e.by),B=targets.get(e.to);
    if(A&&!e.stunned&&e.target!=='self'){const dir=B&&B.x>A.x?1:-1;A.x=A.homeX+dir*Math.sin(Math.PI*clamp(k/.6))*26;}
    if(B&&e.dmg&&k>.55&&k<.85){const dir=A&&A.x<B.x?1:-1;B.x=B.homeX+dir*Math.sin(Math.PI*(k-.55)/.3)*(e.crit?34:18);}}
  }
  return;
 }
 // ---- lớp trước ----
 text(c,a.master?'👑 TRANH GHẾ TÔNG CHỦ':'VÂN HẢI LÔI ĐÀI',450,H*.025,{size:28,color:a.master?'#ffd54a':'#ffe9b0',width:6});
 const left=Math.max(0,Math.ceil((a.endsAt-now)/1000));
 const head=a.phase==='open'?(a.champion?'ĐÀI CHỦ '+a.champion.name+(a.streak?' · giữ '+a.streak+'/'+a.defendMax:''):'ĐÀI TRỐNG · gõ lên đài')+' · còn '+Math.floor(left/60)+':'+String(left%60).padStart(2,'0'):'';
 if(head)text(c,head,450,H*.052,{size:17,color:'#cfe9ff',weight:'800',width:4,max:860});
 if(m){
  drawHud(scene,c,m,H,t);
  // Mỗi lúc chỉ 1 bảng lớn: bậc cao nhất, rồi đòn mới nhất; đòn khác cùng lúc chỉ hiện dải nhỏ.
  for(const e of m.log){const age=at-e.at,d=DUR[e.slot]||1000;if(age<0||age>d+900)continue;const k=clamp(age/d);
   if(age<=d)drawCast(scene,c,m,e,k,H,t,targets);
   // (số sát thương vẽ sau bảng chéo, xem dưới)
   // Âm thanh + rung: chỉ 1 lần mỗi đòn
   scene.arenaFxSeen??=new Set();
   if(!scene.arenaFxSeen.has(e.n+':'+m.id+':c')&&age<d*.3){scene.arenaFxSeen.add(e.n+':'+m.id+':c');if(!e.stunned)scene.onCombatSound?.('cast',e.skill?.tech||'slash');
    // Nhân vật trên sân làm động tác ra chiêu cùng lúc bảng chéo hiện.
    if(!e.stunned&&!e.dot&&!(e.gift&&e.target==='self')){const tk=techObj(e.skill?.tech,e.skill?.name,e.skill?.color);scene.animator?.trigger({id:'arena:'+m.id+':'+e.n,user:e.by,effect:'attack',technique:{...tk,pose:e.slot===1?'slash':'cast'}},t);}
    // Tuyệt kỹ/quà: thêm lớp âm điện ảnh (tụ lực → nổ) như màn tỷ thí V7.
    if(e.slot===ULT||e.gift){const tk={id:e.skill?.tech};scene.onCinematicSound?.('arena:'+m.id+':'+e.n,duelSoundPreset(tk),Math.max(0,d*.58-age)/1000,{priority:5,charge:true,gain:.5});}}
   if(!scene.arenaFxSeen.has(e.n+':'+m.id+':h')&&age>=d*.58&&age<d*.85&&(e.dmg||e.heal||e.shield)){scene.arenaFxSeen.add(e.n+':'+m.id+':h');scene.onFeedbackSound?.('hit',e.slot===ULT||e.gift?3:e.crit?2:1);
    if(e.slot===ULT||e.gift||e.crit){const B=targets.get(e.to);scene.duelImpact={at:Date.now(),preset:e.slot===ULT?'legendary':'minor',ultimate:e.slot===ULT,x:B?.x||450,y:(B?.y||H*.35)-120};}}
   if(scene.arenaFxSeen.size>200)scene.arenaFxSeen=new Set([...scene.arenaFxSeen].slice(-80));
  }
  // Bảng chéo xếp tầng (tối đa 3), mỗi đòn 1 bảng; sau đó mới vẽ số sát thương để luôn đọc được.
  const live=m.log.filter(e=>{const age=at-e.at;return age>=0&&!e.cut&&!e.stunned&&!e.dot&&!(e.gift&&e.target==='self')&&bannerPlan(scene,e,now).show&&age<=bannerLife(e);});
  const keys=live.map(e=>e.n+':'+(e.at||0));
  // 16/11 (chủ game): bảng chéo hiện thì màn tối sầm lại (vào nhanh, ra nhanh trước cú trúng).
  if(live.length){let dim=0;for(const e of live){const k=(at-e.at)/bannerLife(e);dim=Math.max(dim,clamp(Math.min(k/.12,(1-k)/.15)));}c.save();c.globalAlpha=.62*dim;c.fillStyle='#000';c.fillRect(-60,-60,1020,H+120);c.restore();}
  for(const e of live){const lane=bannerLane(scene,e,now,keys);if(lane!=null)drawSkillBannerLane(scene,c,e,at-e.at,targets.get(e.by),H,lane,now);}
  for(const e of m.log){const age=at-e.at,d=DUR[e.slot]||1000;if(age<0||age>d+900)continue;drawNumbers(scene,c,e,clamp(age/(d+900)),targets);}
  // Màn mở trận: VS
  if(now<m.fightAt){const k=clamp((now-m.startedAt)/(m.fightAt-m.startedAt)),a2=Math.min(1,k/.15,(1-k)/.15);c.save();c.globalAlpha=a2;
   text(c,'VS',450,H*.2,{size:90,color:'#ffcf5a',width:10});
   for(const [id,x] of [[m.a,250],[m.b,650]])text(c,m.fighters[id].name,x,H*.12,{size:30,color:'#fff',width:6,max:380});
   text(c,a.master?'TRANH GHẾ TÔNG CHỦ · AI THẮNG NGỒI GHẾ':m.kind==='throne'?'THÁCH ĐẤU ĐÀI CHỦ':'HẸN ĐẤU',450,H*.27,{size:22,color:'#ffe2a4',width:5});
   c.restore();
   for(const x of targets.values())text(c,'Mời chỉ giáo',x.x,x.y-310,{size:24,color:'#fff4d8',width:5});}
  // Cổ vũ gần đây
  const fans=(m.cheerNames||[]).filter(x=>now-x.at<4000);
  fans.forEach((f,i)=>text(c,'📣 '+f.name,f.side===m.a?120:780,H*.29+i*24,{size:15,color:f.side===m.a?'#9ff5df':'#e2c4ff',weight:'800',width:4,max:220}));
 }
 const r=a.lastResult;
 if(r&&!m&&now<r.until+ARENA_DELAY_MS){const k=clamp((now-r.at-ARENA_DELAY_MS*.5)/400);c.save();c.globalAlpha=k;
  text(c,r.ko?'K.O!':'THẮNG',450,H*.115,{size:r.ko?110:80,color:r.ko?'#ff5b4a':'#ffd54a',width:12});
  text(c,r.winnerName,450,H*.165,{size:34,color:'#fff',width:7});
  if(r.kind==='throne'&&a.streak>1)text(c,'GIỮ ĐÀI '+a.streak+' TRẬN',450,H*.198,{size:22,color:'#ffe2a4',width:5});
  c.restore();
  const W=targets.get(r.winner),Lo=targets.get(r.loser);
  if(W)drawAura(c,'gold',W.x,W.y-130,130,.35);if(Lo)text(c,'Đa tạ chỉ giáo',Lo.x+(Lo.x>450?50:-50),Lo.y-235,{size:22,color:'#e8f1ff',width:5}); /* 17/11: trước đè tên người thắng */
 }
 if(!m&&!(r&&now<r.until+ARENA_DELAY_MS)&&a.phase==='open'){
  const ch=a.champion&&targets.get(a.champion.id);
  if(ch){drawAura(c,'gold',ch.x,ch.y-130,120+10*Math.sin(t*.003),.28);text(c,'ĐÀI CHỦ',ch.x,ch.y-320,{size:26,color:'#ffd54a',width:6});}
  else text(c,'ĐÀI TRỐNG · gõ lên đài để làm Đài Chủ',450,H*.2,{size:28,color:'#ffe9b0',width:6,max:860});
 }
 if(a.phase==='closed'&&a.podiumUntil>now&&a.champion){const ch=targets.get(a.champion.id);text(c,a.master?'👑 TÔNG CHỦ':'LÔI ĐÀI BÁ CHỦ',450,H*.17,{size:56,color:'#ffd54a',width:9});text(c,a.champion.name,450,H*.23,{size:32,color:'#fff',width:6});if(ch)drawAura(c,'gold',ch.x,ch.y-130,170,.4);}
 // Hàng chờ (1 dòng) + bảng hướng dẫn (thay các bảng khác khi đang có Lôi Đài).
 const gy=H*(ARENA_LAYOUT.hud)+118;
 try{const cut=m&&findCut(m.log,at);if(cut&&!cutFull(cut))drawCutEdges(scene,c,t,H,cut,targets);}catch(err){console.warn('[cut]',err);}
 if(a.phase==='open'){
  // 16/11 (chủ game): hàng chờ = avatar tròn nhỏ, không tên; đánh xong người đầu hàng tự vào.
  panel(c,14,gy,a.queue.length?Math.min(872,124+a.queue.length*38):872,40,'#06121fd9','#ffd98a55');
  text(c,'HÀNG CHỜ',24,gy+20,{size:15,color:'#ffe2a4',weight:'800',align:'left',width:3});
  if(a.queue.length)drawQueueAvatars(c,a.queue,112,gy+20,15,8);else text(c,'trống · gõ lên đài',112,gy+20,{size:15,color:'#ffe2a4',weight:'800',align:'left',width:3});
  drawGuideBoards(scene,c,t,H);
 }
}
// 15/11 (chủ game): lúc đấu dẹp bảng khác, thay bằng bảng hướng dẫn. Trái: lệnh (cố định). Phải: xoay 8 s — quà trợ chiêu / cơ chế / 5 ô chiêu.
export const ARENA_GUIDES=Object.freeze([
 {title:'QUÀ TRỢ CHIÊU · gõ tặng + tên đấu thủ rồi tặng',rows:[['@rose','Linh Khí Quán Đỉnh · +nộ khí'],['@doughnut','Hồi Xuân Thuật · hồi máu'],['@paper-crane','Triệu Hồi Thần Thú · đánh 1 đòn'],['@money-gun','Pháp Bảo Bạo Phát + khiên'],['@crown','Thiên Giáng · tuyệt kỹ trời giáng']]},
 {title:'CƠ CHẾ ĐẤU',rows:[['Ngũ hành','Kim→Mộc→Thổ→Thủy→Hỏa→Kim · khắc +5%'],['Liên chiêu','2 bí pháp cùng hành liền nhau +10%'],['Hiệu ứng','độc · giảm công · đẩy lùi · phá khiên · phản đòn'],['Nộ khí','đầy → SK5 tuyệt kỹ (bảng toàn màn)'],['Tu vi','hơn ≥30% tổng tu vi thì thắng chắc']]},
 {title:'👑 GHẾ TÔNG CHỦ',rows:[['@crown','mở danh hiệu Tông chủ'],['Gặp nhau','2 Tông chủ cùng có mặt → đấu Lôi Đài ngay'],['Thắng','ngồi ghế Tông chủ'],['Đại lễ 5k','lên ghế ngay, không cần đấu'],['Vắng mặt','người có danh hiệu khác ngồi tạm']]},
 {title:'BÍ PHÁP CHIÊU THỨC · học để có chiêu mới',rows:[['bí pháp','xem 12 bí pháp + bí pháp đã có'],['học + tên','vd: học độc long vụ · trả linh thạch, linh thảo'],['chiêu đổi + tên','đưa bí pháp vào SK2'],['Phàm → Thiên','càng cao chiêu càng mạnh, bảng càng đẹp'],['Địa · Thiên','cần cảnh giới + đủ huy chương (không bị trừ)']]},
 {title:'5 Ô CHIÊU · gõ chiêu để xem',rows:[['SK1','pháp bảo đang đeo'],['SK2 · SK3','bí pháp chiêu thức (học bí pháp)'],['SK4','tuyệt kỹ linh thú đang theo'],['SK5','tuyệt kỹ · cần nộ khí đầy'],['Lv1–10','tăng theo số trận Lôi Đài']]}
]);
export const ARENA_COMMANDS=Object.freeze([['lên đài','làm Đài Chủ / xếp hàng'],['thách + tên','hẹn đấu · người kia gõ nhận'],['c1 – c5','đấu thủ chọn chiêu kế'],['cv1 · cv2','cổ vũ trái / phải'],['chiêu','xem bộ chiêu của mình'],['xuống đài','Đài Chủ rời đài']]);
export const MASTER_COMMANDS=Object.freeze([['cv1 · cv2','cổ vũ trái / phải'],['c1 – c5','đấu thủ chọn chiêu kế'],['tặng + tên','tặng hộ đấu thủ = quà trợ chiêu'],['Đại lễ 5k','đấu thủ tặng → thắng ngay, lên ghế'],['chiêu','xem bộ chiêu của mình'],['Thua','vẫn giữ danh hiệu và đồ Tông chủ']]);
export function arenaGuidePage(t){return ARENA_GUIDES[Math.floor(Math.max(0,t)/8000)%ARENA_GUIDES.length];}
// Ảnh quà thật (public/assets/gifts) — bảng quà không ghi số xu (luật 08/11).
const GIFT_NAME=Object.freeze({rose:'Hoa hồng',doughnut:'Bánh vòng','paper-crane':'Hạc giấy','money-gun':'Súng tiền',crown:'Vương miện'});
function giftIcon(scene,key){
 scene.arenaGiftIcons??={};if(key in scene.arenaGiftIcons)return scene.arenaGiftIcons[key];
 scene.arenaGiftIcons[key]=null;if(typeof Image==='undefined')return null;
 const im=new Image();im.onload=()=>{scene.arenaGiftIcons[key]=im;};im.src='/assets/gifts/'+key+'.png';return null;
}
function drawGuideBoards(scene,c,t,H){
 const top=H*ARENA_LAYOUT.guide,rowH=34,h=Math.min(H*.975-top,44+6*rowH),w=433;
 const board=(x,title,rows,accent)=>{panel(c,x,top,w,h,'#061220e6',accent+'99');c.fillStyle=accent+'33';c.fillRect(x,top,w,30);
  text(c,title,x+w/2,top+16,{size:16,color:'#ffe9b0',width:3,max:w-16});
  rows.forEach(([k,v],i)=>{const y=top+44+i*rowH;
   if(k[0]==='@'){const key=k.slice(1),im=giftIcon(scene,key);if(im)c.drawImage(im,x+12,y-15,30,30);else text(c,GIFT_NAME[key]||key,x+44,y,{size:13,color:'#ffe2a4',weight:'800',width:3,max:70});
    text(c,'→ '+v,x+86,y,{size:14,color:'#e9f3ee',weight:'700',align:'left',width:3,max:w-96});return;}
   c.font='800 15px "Segoe UI",Arial,sans-serif';const kw=Math.min(150,c.measureText(k).width+14);c.fillStyle='#0f3a3a';c.fillRect(x+8,y-12,kw,24);
   text(c,k,x+8+kw/2,y,{size:15,color:'#baffea',weight:'800',width:0,stroke:null,max:kw-4});text(c,v,x+16+kw,y,{size:14,color:'#e9f3ee',weight:'700',align:'left',width:3,max:w-kw-26});});};
 if(scene.arena?.master)board(14,'TRANH GHẾ TÔNG CHỦ · gõ vào bình luận',MASTER_COMMANDS,'#ffd27a');else board(14,'LỆNH LÔI ĐÀI · gõ vào bình luận',ARENA_COMMANDS,'#7fe3c4');
 const g=arenaGuidePage(scene.motion===false?0:t);board(453,g.title,g.rows,'#ffd27a');
}
