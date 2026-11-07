import {drawRitualTint} from './ritual-appearance.js';
import {drawAscensionStageBackdrop} from './ascension-stage.js';
import {makeSurface} from './performance.js';
import {setFxPalette,qiVariant,qiCamera,drawQiEnvironment,drawQiVignette,drawQiInflow,drawQiCompression,drawQiImpact,drawQiAura,drawQiMotes} from './qi-impact.js';
import {trucCoV3State,drawTcSky,drawTcGroundVeins,drawTcShards,drawTcSigil,drawTcHalo} from './truc-co-formation.js';
import {TRUC_CO_DURATION,TRUC_CO_SWORDS,TRUC_CO_TIERS,TRUC_CO_BURST,TRUC_CO_REVEAL} from './truc-co-timeline.js';
const TAU=Math.PI*2,clamp=v=>Math.max(0,Math.min(1,v)),ease=v=>{v=clamp(v);return v*v*(3-2*v);};
const angles=[-2.75,-2.15,-1.4,-.7,.08,.82,1.6,2.4];
export function trucCoState(k,H=1600,motion=true){
 k=clamp(k);const seconds=k*TRUC_CO_DURATION/1000,feet=H*.64,ground=feet+70;
 const tiers=TRUC_CO_TIERS.map(at=>ease((seconds-at)/.55)),lift=tiers.reduce((a,b)=>a+b,0)*22;
 const burst=ease((seconds-TRUC_CO_BURST)/.10)*(1-ease((seconds-8.95)/.60));
 const swords=angles.map((a,i)=>{const z=Math.sin(a),front=z>=0,h=z<0?350+i%3*28:120+Math.abs(Math.cos(a))*95;
  return {id:i,x:450+Math.cos(a)*286,y:ground+z*69,z,front,height:h,rise:ease((seconds-TRUC_CO_SWORDS[i])/.43)};});
 return {k,seconds,feet,ground,tiers,lift,swords,open:ease(seconds/1.2),
  flow:ease((seconds-3.6)/.6)*(1-ease((seconds-8.55)/.25)),charge:ease((seconds-6.3)/2.1),
  compression:ease((seconds-8.4)/.25)*(1-ease((seconds-8.8)/.1)),
  burst:burst*(motion?1:.32),revealed:k>=TRUC_CO_REVEAL/(TRUC_CO_DURATION/1000),
  dissolve:ease((seconds-9.35)/.95),fade:1-ease((seconds-10.35)/.45),clock:motion?seconds:0};
}
function path(c,points,fill,stroke,width=1){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function glow(c,x,y,r,color,alpha=1,sy=1){if(r<=0||alpha<=0)return;c.save();c.translate(x,y);c.scale(1,sy);c.globalAlpha=clamp(alpha);const g=c.createRadialGradient(0,0,0,0,0,r);g.addColorStop(0,color);g.addColorStop(1,color.slice(0,7)+'00');c.fillStyle=g;c.fillRect(-r,-r,r*2,r*2);c.restore();}
function plateArt(c,r,ry){
 const pts=Array.from({length:8},(_,i)=>{const a=i*TAU/8+Math.PI/8;return [Math.cos(a)*r,Math.sin(a)*ry];});
 for(let i=0;i<8;i++){const a=pts[i],b=pts[(i+1)%8];if((a[1]+b[1])<0)continue;
  const g=c.createLinearGradient(0,a[1],0,a[1]+27);g.addColorStop(0,'#4c9e8a');g.addColorStop(.3,'#183e3b');g.addColorStop(1,'#092523');path(c,[a,b,[b[0],b[1]+22],[a[0],a[1]+22]],g,'#b5d7ac55');
 }
 const face=c.createLinearGradient(-r,-ry,r,ry);face.addColorStop(0,'#103c36');face.addColorStop(.4,'#438879');face.addColorStop(.65,'#1f5950');face.addColorStop(1,'#092d2e');path(c,pts,face,'#c4e9c7b0',2);
 path(c,pts.map(([x,y])=>[x*.92,y*.92]),null,'#d9c9919a',1.2);
 path(c,pts.map(([x,y])=>[x*.83,y*.83]),null,'#8aeec955',1);
 for(let i=0;i<8;i++){const a=i*TAU/8;const x=Math.cos(a)*r*.65,y=Math.sin(a)*ry*.65;c.strokeStyle='#dbe7b57a';c.lineWidth=1;c.beginPath();c.moveTo(x*.78,y*.78);c.lineTo(x*1.18,y*1.18);c.stroke();path(c,[[x-6,y],[x,y-3],[x+6,y],[x,y+3]],null,'#dbe7b57a');}
 c.save();c.scale(1,ry/r);c.strokeStyle='#b5e9be8a';c.lineWidth=1.4;c.beginPath();c.arc(0,0,r*.38,0,TAU);c.stroke();c.restore();
}
function platform(scene,c,s){
 const sizes=[[342,86],[279,68],[216,51]];
 for(let i=0;i<3;i++){const p=s.tiers[i];if(!p)continue;const [r,ry]=sizes[i];c.save();c.globalAlpha=p*s.fade;c.translate(450,s.ground-(i+1)*22+(1-p)*22);c.scale(.92+.08*p,.75+.25*p);
  const cache=scene.trucCoPlates??=[];let im=cache[i];if(!im){im=makeSurface(760,250);if(im){const a=im.getContext('2d');a.translate(380,110);plateArt(a,r,ry);cache[i]=im;}}
  if(im)c.drawImage(im,-380,-110);else plateArt(c,r,ry);c.restore();
  const lock=ease((s.seconds-TRUC_CO_TIERS[i]-.35)/.10)*(1-ease((s.seconds-TRUC_CO_TIERS[i]-.55)/.4));
  glow(c,450,s.ground-(i+1)*22,r+20,'#afffe69a',lock*.55,.24);
 }
}
function swordArt(c){
 const g=c.createLinearGradient(-16,0,16,0);g.addColorStop(0,'#0a322e');g.addColorStop(.24,'#3b8c70');g.addColorStop(.49,'#d9f7c5');g.addColorStop(.57,'#70cba1');g.addColorStop(1,'#103b36');
 path(c,[[0,-420],[16,-381],[12,-48],[-12,-48],[-16,-381]],g,'#b1edd28c',1.4);
 path(c,[[-5,-385],[0,-410],[4,-381],[2,-53],[-3,-53]],'#dbffe523');
 c.strokeStyle='#193e31';c.lineWidth=3;for(let j=0;j<5;j++){const y=-85-j*62;c.beginPath();c.moveTo(-12,y);c.quadraticCurveTo(0,y+5,12,y);c.stroke();c.strokeStyle='#caf4c6a0';c.lineWidth=1;c.beginPath();c.moveTo(-12,y-3);c.lineTo(12,y-3);c.stroke();c.strokeStyle='#193e31';c.lineWidth=3;}
 const guard=c.createLinearGradient(-30,0,30,0);guard.addColorStop(0,'#685232');guard.addColorStop(.5,'#f1daa1');guard.addColorStop(1,'#76633a');path(c,[[-32,-51],[-28,-57],[28,-57],[32,-51],[18,-44],[-18,-44]],guard,'#e7d8a18c');
 path(c,[[-5,-45],[5,-45],[6,-8],[0,0],[-6,-8]],'#21483c','#d4c48b9a');
}
function swords(scene,c,s,front){
 let art=scene.trucCoSword;if(!art){art=makeSurface(110,470);if(art){const a=art.getContext('2d');a.translate(55,445);swordArt(a);scene.trucCoSword=art;}}
 for(const sword of s.swords){if(sword.front!==front||!sword.rise||s.dissolve>=1)continue;
  const p=sword.rise,alpha=p*(1-s.dissolve)*s.fade;c.save();c.globalAlpha=alpha;c.translate(sword.x,sword.y+(1-p)*40);c.scale(1,sword.height/420*p);
  if(art)c.drawImage(art,-55,-445);else swordArt(c);
  c.globalCompositeOperation='screen';const traveling=(s.clock*.8+sword.id*.127)%1;
  c.strokeStyle='#c8ffe4';c.lineWidth=2;c.globalAlpha=alpha*s.flow*.8;c.beginPath();c.moveTo(-7,-55-traveling*350);c.lineTo(8,-55-traveling*350);c.stroke();c.restore();
  if(s.flow>0)glow(c,sword.x,sword.y-sword.height*p*.7,35,'#7eeccf75',alpha*s.flow*.4,1.6);
 }
}
function bezier(a,b,c,d,u){const v=1-u;return {x:v*v*v*a.x+3*v*v*u*b.x+3*v*u*u*c.x+u*u*u*d.x,y:v*v*v*a.y+3*v*v*u*b.y+3*v*u*u*c.y+u*u*u*d.y};}
export function trucCoStreamPoint(s,id,u){
 const p=s.swords[id],tip={x:p.x,y:p.y-p.height*p.rise+15},base={x:p.x,y:p.y-40},center={x:450,y:s.ground-s.lift};
 if(u<.5){const side=p.x<450?-1:1,start={x:450+side*(320+id%2*22),y:s.feet-330-id%3*60};return bezier(start,{x:start.x-side*15,y:start.y-100},{x:tip.x+side*100,y:tip.y-80},tip,u*2);}
 if(u<.76){const v=(u-.5)/.26;return {x:tip.x+(base.x-tip.x)*v+Math.sin(v*Math.PI*4+s.clock*2)*4*Math.sin(v*Math.PI),y:tip.y+(base.y-tip.y)*v};}
 return bezier(base,{x:base.x,y:base.y+35},{x:center.x+(base.x-center.x)*.2,y:center.y+30},center,(u-.76)/.24);
}
function streams(scene,c,s,front){
 if(s.flow<=0)return;const light=scene.budget?.level==='light',steps=light?18:30;
 c.save();c.globalCompositeOperation='screen';c.lineCap='round';c.lineJoin='round';
 for(const p of s.swords){if(p.front!==front)continue;const color=p.id%3?'#91eec9':'#e4d79d',head=(s.clock*.45+p.id*.173)%1,tail=Math.max(0,head-.33),pts=[];
  for(let j=0;j<=steps;j++)pts.push(trucCoStreamPoint(s,p.id,tail+(head-tail)*j/steps));
  for(const [width,alpha]of [[14,.03],[6,.12],[1.5,.7]]){c.strokeStyle=color;c.lineWidth=width;c.globalAlpha=s.flow*alpha*Math.sin(head*Math.PI);c.beginPath();pts.forEach((v,j)=>j?c.lineTo(v.x,v.y):c.moveTo(v.x,v.y));c.stroke();}
  c.strokeStyle='#b3f6cb';c.lineWidth=1;c.globalAlpha=s.flow*.22;c.beginPath();c.moveTo(p.x,p.y-30);c.quadraticCurveTo(p.x,s.ground+35,450,s.ground-s.lift);c.stroke();
 }c.restore();
}
function leaf(c,x,y,size,angle,color){c.save();c.translate(x,y);c.rotate(angle);c.fillStyle=color;c.beginPath();c.moveTo(-size,0);c.quadraticCurveTo(0,-size*.7,size,0);c.quadraticCurveTo(0,size*.23,-size,0);c.fill();c.restore();}
function atmosphere(scene,c,s,front){
 const light=scene.budget?.level==='light',n=light?14:30;c.save();
 for(let i=0;i<n;i++){if((i%2===0)!==front)continue;const u=(s.clock*.16+i*.618)%1,a=i*2.399+s.clock*.12,r=(1-u)*(290+i%4*25),release=s.dissolve;
  const x=450+Math.cos(a)*(r+release*180),y=s.ground-40-Math.sin(u*Math.PI)*(90+i%3*70)-release*90+Math.sin(a)*35;
  c.globalAlpha=s.open*s.fade*Math.sin(u*Math.PI)*(.25+s.flow*.45+release*.3);leaf(c,x,y,3+i%4,a+s.clock*.7,i%4?'#97d7ad':'#e3d4a0');
 }c.restore();
}
function foundation(scene,c,s){
 c.save();c.globalCompositeOperation='screen';
 glow(c,450,s.ground,420,'#67b89a65',s.open*.55*s.fade,.30);
 for(const p of s.swords){const on=s.open*(.2+s.charge*.55+s.compression*.25);c.globalAlpha=on*s.fade;c.strokeStyle=p.id%2?'#9cdfc8':'#d5cb96';c.lineWidth=1.2;c.beginPath();c.moveTo(p.x,p.y);c.quadraticCurveTo(450+(p.x-450)*.45,s.ground+35,450,s.ground);c.stroke();}
 c.globalAlpha=s.open*.32*s.fade;c.strokeStyle='#97d7c2';c.lineWidth=1;path(c,angles.map(a=>[450+Math.cos(a)*360,s.ground+Math.sin(a)*100]),null,'#7ab8a26b');
 for(let i=0;i<(scene.budget?.level==='light'?3:6);i++){const a=i*2.399+s.clock*.12;glow(c,450+Math.cos(a)*270,s.ground+Math.sin(a)*50,100,'#7eb79f35',s.open*s.fade*.5,.3);}
 c.restore();
}
function column(scene,c,s){
 const bloom=ease((s.seconds-8.8)/.18)*(1-ease((s.seconds-9.25)/.6));if(!bloom)return;
 let art=scene.trucCoColumn;if(!art){art=makeSurface(400,800);if(art){const a=art.getContext('2d'),g=a.createLinearGradient(0,0,400,0);g.addColorStop(0,'#77d7ae00');g.addColorStop(.25,'#9de9bc20');g.addColorStop(.5,'#e6ffcf9a');g.addColorStop(.75,'#9de9bc20');g.addColorStop(1,'#77d7ae00');a.fillStyle=g;a.fillRect(0,0,400,800);a.globalCompositeOperation='destination-in';const v=a.createLinearGradient(0,0,0,800);v.addColorStop(0,'#ffffff00');v.addColorStop(.5,'#ffffffff');v.addColorStop(1,'#ffffffff');a.fillStyle=v;a.fillRect(0,0,400,800);scene.trucCoColumn=art;}}
 c.save();c.globalCompositeOperation='screen';c.globalAlpha=bloom*(scene.motion===false?.32:.85)*s.fade;if(art)c.drawImage(art,450-130-bloom*40,s.ground-s.lift-670,260+bloom*80,700);c.restore();
}
function burst(c,s,motion){
 if(s.seconds<8.8)return;c.save();c.globalCompositeOperation='screen';const y=s.ground-s.lift;
 glow(c,450,y-90,190+s.burst*150,'#e8ffdaee',s.burst*.8,.9);
 for(let i=0;i<2;i++){const u=clamp((s.seconds-8.8-i*.11)/1.15);if(u<=0||u>=1)continue;c.globalAlpha=(1-u)*.8*(motion?1:.35);c.strokeStyle=i?'#dbd59e':'#b7f9d3';c.lineWidth=2+(1-u)*6;c.beginPath();c.ellipse(450,y,70+ease(u)*530,(70+ease(u)*530)*(i?.65:.26),0,0,TAU);c.stroke();}
 for(let i=0;i<16;i++){const u=clamp((s.seconds-8.88)/.8),a=i*2.399,r=90+ease(u)*280;c.globalAlpha=(1-u)*s.burst*.7;leaf(c,450+Math.cos(a)*r,y-80+Math.sin(a)*r*.7,7,a+s.clock,i%3?'#c2f8d0':'#f2e4b4');}c.restore();
}
function actor(scene,c,e,s,t){
 const live=scene.playerIndex?.get(e.user)||scene.players?.find(p=>p.id===e.user),to=e.visualTo||live,from=e.visualFrom||(to?{...to,realm:e.fromRealm??1}:null),p=s.revealed?to:from;if(!p)return;
 const y=s.feet-s.lift;scene.targets=[{id:e.user,player:p,x:450,y,scale:4.2}];const compact=scene.compact,ritual=scene.ritualDrawing;scene.compact=true;scene.ritualDrawing=true;
 c.save();try{const surface=scene.trucCoActor??=makeSurface(600,760);if(!surface){scene.drawPlayer(c,p,450,y,t);return;}
  const a=surface.getContext('2d');a.setTransform(1,0,0,1,0,0);a.clearRect(0,0,600,760);a.save();a.translate(-150,530-y);scene.drawPlayer(a,p,450,y,t);a.restore();c.drawImage(surface,150,y-530);
  const amount=Math.min(.4,s.charge*.12+s.burst*.2);if(amount>0){a.save();a.globalCompositeOperation='source-in';const g=a.createLinearGradient(0,600,0,180);g.addColorStop(0,'#e1fbc2');g.addColorStop(.5,'#b2fbd5');g.addColorStop(1,'#f2ffe4');a.fillStyle=g;a.fillRect(0,0,600,760);a.globalCompositeOperation='destination-in';a.drawImage(surface,0,0);a.drawImage(surface,0,0);a.restore();c.globalCompositeOperation='screen';c.globalAlpha=clamp(amount);c.drawImage(surface,150,y-530);}
 }finally{scene.compact=compact;scene.ritualDrawing=ritual;c.restore();}
}
// v3 (4/11/2026): ghép các lớp chung của Luyện Khí v4 (nền sân, camera, hạt khí, cú nổ, hào quang, mưa sáng, vignette)
// theo bảng màu ngọc bích + vàng; mốc nổ của lớp chung căn đúng TRUC_CO_BURST. Có biến thể theo mã sự kiện.
const TC_PALETTE={main:'#9dffc4',main2:'#c2f8d0',soft:'#e8ffd8',gold:'#f2e4b4'};
export function drawTrucCoAwakening(scene,c,e,t,H){
 const motion=scene.motion!==false,s=trucCoState((t-e.start)/e.duration,H,motion),color=scene.ritualAppearance?.palette.main2||'#b3efd0',v=qiVariant(e);
 const kb=TRUC_CO_BURST/(TRUC_CO_DURATION/1000),kq=s.k<kb?s.k*.70/kb:.70+(s.k-kb)*.30/(1-kb),body=s.feet-s.lift,origin={x:450,y:body-30};
 setFxPalette(TC_PALETTE);
 c.save();drawAscensionStageBackdrop(scene,c,H,{clock:t-e.start,ritual:true,color:scene.ritualAppearance?.palette.main2||'#a7f2e2',feet:s.feet});drawQiEnvironment(scene,c,kq,H,origin,true); // 4/11: thiên đài cả trên LIVE
 const v3=trucCoV3State(s.seconds),sv={...s,body};drawTcSky(scene,c,v3,H,v);drawRitualTint(scene,c,H); // v3 05/11: núi xa + linh mạch
 glow(c,450,s.feet-130,420,'#438c662c',s.open*.9);
 const zoom=1+(qiCamera(kq,motion&&scene.cameraEnabled!==false)-1)*v.zoom,fy=s.feet-150+v.dy;c.save();c.translate(450,fy);c.scale(zoom,zoom);c.translate(-450,-fy);if(v.flip){c.translate(900,0);c.scale(-1,1);}
 const shake=motion&&scene.cameraEnabled!==false?s.burst*7:0;c.translate(Math.sin(s.clock*95)*shake,Math.cos(s.clock*80)*shake*.6);
 drawTcGroundVeins(scene,c,v3,sv);drawTcShards(scene,c,v3,sv,false);
 foundation(scene,c,s);drawQiInflow(scene,c,kq,origin,v.phase);swords(scene,c,s,false);streams(scene,c,s,false);atmosphere(scene,c,s,false);platform(scene,c,s);drawTcSigil(scene,c,v3,sv,v);column(scene,c,s);drawQiAura(scene,c,kq,origin,body);drawTcHalo(scene,c,v3,sv,v);actor(scene,c,e,s,t-e.start);swords(scene,c,s,true);streams(scene,c,s,true);atmosphere(scene,c,s,true);drawTcShards(scene,c,v3,sv,true);drawQiCompression(c,kq,origin);burst(c,s,motion);drawQiImpact(scene,c,kq,H,origin,body);
 c.restore();drawQiMotes(scene,c,kq,H);drawQiVignette(c,kq,H);
 const ui={k:s.k,realm:2,phase:s.revealed?'reveal':s.seconds<3.6?'swords':s.seconds<6.3?'flow':s.seconds<8.4?'foundation':'compress',revealed:s.revealed,color,title:'Trúc Cơ',subtitle:'Ngọc Cơ Thành Đạo',name:String(e.name||'Đạo hữu').normalize('NFC'),label:'',detail:'',shake};
 if(scene.onRitualFrame)scene.onRitualFrame(ui);else{c.textAlign='center';c.fillStyle='#eaf2e5';c.font='600 25px Arial';c.fillText(ui.name,450,H*.19,700);if(s.revealed){c.font='700 40px Arial';c.fillStyle=color;c.fillText('TRÚC CƠ',450,H*.24,740);}}
 c.restore();return ui;
}
