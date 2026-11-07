import {drawEventGiftFx} from './event-gift-fx.js';
import {makeSurface} from './performance.js';
import {drawCombatTechnique} from './combat-techniques.js';
export function syncSocialStage(scene,state){
 scene.socialStage=state.socialStage||[];scene.socialStatus=state.socialStatus;scene.socialScene=state.socialScene;
 const kind=state.socialScene;document.body.classList.toggle('social-stage',!!kind);document.body.classList.toggle('social-podium',kind==='tournament'&&scene.socialStage.length===1);
 if(kind===scene.socialArtKind)return;scene.socialArtKind=kind;scene.socialArt=null;if(!kind)return;
 const image=new Image();image.onload=()=>{if(scene.socialArtKind!==kind)return;const size=scene.budget?.level==='light'?256:384,frames=[];for(let i=0;i<6;i++){const frame=makeSurface(size,size);if(!frame)continue;frame.getContext('2d').drawImage(image,i%3*image.naturalWidth/3,Math.floor(i/3)*image.naturalHeight/2,image.naturalWidth/3,image.naturalHeight/2,0,0,size,size);frames.push(frame);}scene.socialArt=frames;};image.src='/assets/events-v1/'+kind+'-effects.png';
}
export function socialTargets(scene,ordered,H){
 const pair=ordered.length===2,kind=scene.socialScene;
 return ordered.map((p,i)=>({id:p.id,player:p,x:pair?(kind==='bond'?315+i*270:225+i*450):450,y:H*(kind==='bond'?.57:.55),scale:pair?2.25:2.6,lift:0,baseY:H*.57}));
}
export function drawSocialStage(scene,c,t,layer,solo){
 if(solo||!scene.socialScene)return;const art=scene.socialArt,H=scene.height,s=scene.socialStatus,now=Date.now(),match=s?.tournament?.current,ceremony=s?.ceremony;
 const image=(n,x,y,w,h,a=1)=>{if(!art?.[n])return;c.save();c.globalAlpha=a;c.drawImage(art[n],x,y,w,h);c.restore();};
 if(scene.socialScene==='tournament'){
  // 05/11/2026: luận kiếm là so pháp lực, không đánh vào người. Mỗi bên phóng chiêu vào Linh Châu giữa đài;
  // bên linh áp cao hơn đẩy linh châu về phía đối phương. Đầu ván hai bên chắp tay "mời chỉ giáo", cuối ván người thua "đa tạ chỉ giáo".
  drawEventGiftFx(scene,c,t,layer,'duel');
  const bow=s?.tournament?.lastBow;
  if(match&&scene.targets.length===2){const age=now-match.startedAt,[L,R]=scene.targets,aura=match.aura||{},lead=((aura[L.id]||0)-(aura[R.id]||0))/100;
   const orb={x:450+Math.max(-1,Math.min(1,lead))*120,y:(L.y+R.y)/2-110};
   if(layer==='back'&&age<3000)scene.targets.forEach((p,i)=>image(i,p.x-90,p.y-240,180,260,Math.max(0,1-age/3000)));
   if(layer==='front'&&age>=0){
    for(const [p,i] of [[L,0],[R,1]]){const tech=match.techniques[p.id];beam(c,p.x,p.y-60,orb.x,orb.y,tech?.color||(i?'#c6a0ff':'#a6ecff'),.35+.25*Math.sin((scene.motion?t:0)*.006+i*2));}
    linhChau(c,orb.x,orb.y,scene.motion?t:0);
    const turn=Math.floor(age/4000),a=scene.targets[turn%2],technique=match.techniques[a.id],k=age%4000/4000;
    if(age>1800&&technique&&!scene.eventGiftQueue?.active?.fighter){scene.animator?.trigger({id:match.id+':'+turn,user:a.id,effect:'attack',technique},t);drawCombatTechnique(c,{technique,target:{x:orb.x,yRatio:orb.y/H}},scene.motion?t:0,k,a,H,{light:scene.budget?.level==='light',signatures:scene.signatureSprites,relics:scene.combatSprites});techName(c,a.x,a.y-235,technique,Math.min(1,k/.08,(1-k)/.2));}
    if(k>.6&&k<.95)image(3,orb.x-60,orb.y-60,120,120,Math.sin((k-.6)/.35*Math.PI)*.55);
    if(age<1800)for(const p of scene.targets)bubble(c,p.x,p.y-250,'Mời chỉ giáo',Math.min(1,age/250,(1800-age)/250));
   }
  }else if(bow?.until>now&&scene.targets.length===2&&layer==='front'){const k=Math.min(1,(now-bow.at)/250,(bow.until-now)/250);
   for(const p of scene.targets)bubble(c,p.x,p.y-250,p.id===bow.loser?'Đa tạ chỉ giáo':'Đã nhường',k);
  }else if(s?.tournament?.podiumUntil>now&&scene.targets[0]){const p=scene.targets[0];if(layer==='back')image(4,p.x-140,p.y-280,280,280,.7);else image(5,p.x+70,p.y-120,100,140);}
 }else if(ceremony&&scene.targets.length===2){const floor=H*.57,k=Math.max(0,Math.min(1,(now-ceremony.startedAt)/Math.max(1,ceremony.endsAt-ceremony.startedAt))),fade=Math.min(1,k*5,(1-k)*5);
  if(layer==='back'){image(0,190,floor-480,520,520,fade);image(3,210,floor-145,480,260,fade);c.save();c.translate(450,floor-150);c.rotate(scene.motion?Math.sin(t*.0004)*.12:0);image(4,-260,-260,520,520,fade*.4);c.restore();}
  else {if(ceremony.festivalId){for(let i=0;i<6;i++){const angle=(scene.motion?t*.00035:0)+i*Math.PI/3;image(1,450+Math.cos(angle)*235-22,floor-170+Math.sin(angle)*95-30,44,60,fade*.7);}}image(2,335,floor-160,230,130,fade*.8);if(k>.5)image(1,400,floor-245,100,140,fade);if(k>.75)image(5,365,floor+25,170,100,fade);}
 }
}

export function drawBondLinks(scene,c,t){
 if(scene.socialScene||scene.presentation?.until>t)return;const paired=new Set();
 const targets=new Map(scene.targets.map(p=>[p.id,p]));for(const a of scene.targets)for(const bond of (a.player.bondInfos||[a.player.bondInfo].filter(Boolean))){if(!bond||bond.level<1&&!a.player.bondFestivalWins||paired.has(bond.id))continue;const b=targets.get(bond.a===a.id?bond.b:bond.a);if(!b)continue;paired.add(bond.id);
 c.save();c.globalAlpha=.35;c.strokeStyle=bond.level>=3?'#ffe3a2':'#f0b5da';c.lineWidth=1.4;c.beginPath();c.moveTo(a.x,a.y);c.bezierCurveTo(a.x,a.y-40,b.x,b.y-40,b.x,b.y);c.stroke();
 if(bond.level>=2||a.player.bondFestivalWins)for(const p of [a,b])scene.drawFlyingSword(c,p.x,p.y+18,Math.PI/2,'#d4edf5');
 if(bond.level>=3)for(const p of [a,b]){c.beginPath();c.ellipse(p.x,p.y+15,37,10,0,0,Math.PI*2);c.stroke();}
 if(bond.level>=4)for(let i=0;i<4;i++){const u=(scene.motion?t*.00015:0)+i/4;c.fillStyle='#ffe4cb';c.fillRect(a.x+(b.x-a.x)*(u%1),a.y+(b.y-a.y)*(u%1)-18,2,2);}
 c.restore();}
}
// Linh Châu giữa đài: quả cầu sáng xoay, không có hình người.
function linhChau(c,x,y,t){c.save();const r=34+Math.sin(t*.004)*3,g=c.createRadialGradient(x,y,2,x,y,r*2.2);g.addColorStop(0,'#ffffff');g.addColorStop(.25,'#fff1c4e6');g.addColorStop(.6,'#9fe6ff66');g.addColorStop(1,'#9fe6ff00');c.fillStyle=g;c.beginPath();c.arc(x,y,r*2.2,0,Math.PI*2);c.fill();
 c.strokeStyle='#f6dd9a';c.lineWidth=2;for(let i=0;i<3;i++){c.globalAlpha=.55;c.beginPath();c.ellipse(x,y,r*1.25,r*.42,t*.0012+i*Math.PI/3,0,Math.PI*2);c.stroke();}c.restore();}
// Luồng linh lực từ đấu thủ tới linh châu.
function beam(c,x0,y0,x1,y1,color,a){c.save();c.globalAlpha=Math.max(0,a);c.lineCap='round';c.strokeStyle=color;c.lineWidth=10;c.shadowColor=color;c.shadowBlur=18;c.beginPath();c.moveTo(x0,y0);c.quadraticCurveTo((x0+x1)/2,Math.min(y0,y1)-50,x1,y1);c.stroke();c.lineWidth=3;c.strokeStyle='#ffffff';c.shadowBlur=0;c.stroke();c.restore();}
// Bong bóng lễ nghi trên đầu đấu thủ.
function bubble(c,x,y,text,a){if(a<=0)return;c.save();c.globalAlpha=Math.min(1,a);c.font='bold 30px "Segoe UI",Tahoma,sans-serif';c.textAlign='center';c.textBaseline='middle';const w=c.measureText(text).width+56,h=50;
 c.fillStyle='#102633e6';c.strokeStyle='#d3b778';c.lineWidth=2;c.beginPath();c.roundRect?c.roundRect(x-w/2,y-h/2,w,h,12):c.rect(x-w/2,y-h/2,w,h);c.fill();c.stroke();c.fillStyle='#f5e5be';c.fillText('🙏 '+text,x,y+1);c.restore();}
// Tên chiêu riêng (theo pháp bảo/cảnh giới) hiện trên đầu người đang ra chiêu; cường độ cao thêm sao.
function techName(c,x,y,tech,a){if(!tech?.name||a<=0)return;c.save();c.globalAlpha=a;c.font='bold 28px "Segoe UI",Tahoma,sans-serif';c.textAlign='center';c.textBaseline='middle';const label=tech.name+(tech.intensity>1?' '+'✦'.repeat(tech.intensity-1):'');
 c.lineWidth=6;c.strokeStyle='#0b1a26';c.shadowColor=tech.color||'#bfeaff';c.shadowBlur=14;c.strokeText(label,x,y,420);c.fillStyle=tech.color||'#bfeaff';c.fillText(label,x,y,420);c.restore();}
