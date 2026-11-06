import {drawAscensionStageBackdrop} from './ascension-stage.js';
import {makeSurface} from './performance.js';
import {setFxPalette,qiVariant,qiRemap,pushFxCamera,drawQiEnvironment,drawQiVignette,drawQiInflow,drawQiCompression,drawQiImpact,drawQiAura,drawQiMotes} from './qi-impact.js';
const NA_PALETTE={main:'#c9a3ff',main2:'#e2ccff',soft:'#f4ecff',gold:'#b4dfff'};
import {prepareNguyenAnhArt} from './nguyen-anh-art.js';
import {NGUYEN_ANH_DURATION,NGUYEN_ANH_BLOOMS,NGUYEN_ANH_MANIFEST,NGUYEN_ANH_ENTER,NGUYEN_ANH_COMPRESS,NGUYEN_ANH_BURST,NGUYEN_ANH_REVEAL} from './nguyen-anh-timeline.js';
const TAU=Math.PI*2,clamp=v=>Math.max(0,Math.min(1,v)),ease=v=>{v=clamp(v);return v*v*(3-2*v);},mix=(a,b,u)=>a+(b-a)*u;
export const nguyenAnhBudget=light=>({petals:36,streams:light?12:24,motes:light?48:144,arcs:light?8:16,waves:5});
export function nguyenAnhState(k,H=1600,motion=true){
 k=clamp(k);const seconds=k*NGUYEN_ANH_DURATION/1000,clock=motion?seconds:0,feet=H*.64,ground=feet+70,hover=feet-460,belly=feet-35;
 const enter=ease((seconds-NGUYEN_ANH_ENTER)/1.6),manifest=ease((seconds-NGUYEN_ANH_MANIFEST)/1),compress=ease((seconds-NGUYEN_ANH_COMPRESS)/.23)*(1-ease((seconds-NGUYEN_ANH_BURST)/.14));
 const burst=ease((seconds-NGUYEN_ANH_BURST)/.12)*(1-ease((seconds-11.05)/.85));
 return {k,seconds,clock,feet,ground,hover,belly,enter,manifest,compress,
  soul:{x:450+(motion?Math.sin(enter*Math.PI)*Math.sin(enter*TAU)*28:0),y:mix(hover,belly,enter),size:mix(300,24,enter),alpha:manifest*(1-ease((enter-.85)/.15))},
  blooms:NGUYEN_ANH_BLOOMS.map(at=>ease((seconds-at)/1.0)),open:ease(seconds/1.3),
  flow:ease((seconds-3.35)/.7)*(1-ease((seconds-10.25)/.35)),aura:ease((seconds-2.4)/1.7),
  effigy:ease((seconds-7.6)/2.0)*(1-ease((seconds-13.4)/1)),burst:burst*(motion?1:.28),
  revealed:k>=NGUYEN_ANH_REVEAL/(NGUYEN_ANH_DURATION/1000),fade:1-ease((seconds-13.75)/.65)};
}
function glow(c,x,y,r,color,alpha=1,sy=1){if(r<=0||alpha<=0)return;c.save();c.translate(x,y);c.scale(1,sy);c.globalAlpha=clamp(alpha);const g=c.createRadialGradient(0,0,0,0,0,r);g.addColorStop(0,color);g.addColorStop(1,color.slice(0,7)+'00');c.fillStyle=g;c.fillRect(-r,-r,r*2,r*2);c.restore();}
function sprite(c,im,x,y,w,h,alpha=1,angle=0,sy=0,sh=1){if(!im||alpha<=0||w<=0||h<=0)return;c.save();c.globalAlpha=clamp(alpha);c.translate(x,y);c.rotate(angle);const iw=im.width||im.naturalWidth,ih=im.height||im.naturalHeight;c.drawImage(im,0,ih*sy,iw,ih*sh,-w/2,-h/2,w,h);c.restore();}
function assets(scene){return {lotus:scene.nguyenAnhArt?.lotus||scene.ascensionArt?.mid?.[2],halo:scene.nguyenAnhArt?.halo||scene.breakthroughSpectacle?.[5],groundWave:scene.nguyenAnhArt?.groundWave||scene.breakthroughSpectacle?.[4],burst:scene.nguyenAnhArt?.burst||scene.ascensionArt?.bursts?.[2]};}
function pool(c,s){
 c.save();const g=c.createRadialGradient(450,s.ground,10,450,s.ground,430);g.addColorStop(0,'#53638965');g.addColorStop(.55,'#28244b5a');g.addColorStop(1,'#101c3000');c.fillStyle=g;c.save();c.translate(0,s.ground*.68);c.scale(1,.32);c.fillRect(0,s.ground-440,900,880);c.restore();
 c.globalCompositeOperation='screen';for(let i=0;i<4;i++){const u=(s.clock*.18+i/4)%1,r=40+u*390;c.globalAlpha=s.open*s.fade*(1-u)*.45;c.strokeStyle=i%2?'#a6c7f3':'#cfb3e9';c.lineWidth=i?1:2;c.beginPath();c.ellipse(450,s.ground,r,r*.26,0,0,TAU);c.stroke();}
 glow(c,450,s.ground,440,'#9a94d05a',s.open*s.fade*.65,.28);c.restore();
}
function lotusPetals(scene,c,s,front){
 const rows=[{n:8,r:210,h:125,a:'#416c91',b:'#e3f7ff'},{n:12,r:285,h:155,a:'#3a5290',b:'#b9defd'},{n:16,r:365,h:185,a:'#4c326d',b:'#d5b6fa'}];
 c.save();for(let layer=2;layer>=0;layer--){const row=rows[layer],open=s.blooms[layer];if(!open)continue;
  const petals=Array.from({length:row.n},(_,i)=>{const a=i*TAU/row.n+layer*.22+s.clock*.025;return {a,z:Math.sin(a)};}).sort((a,b)=>a.z-b.z);
  for(const {a,z}of petals){if((z>=0)!==front)continue;const rad=row.r*open*(1-s.compress*.10),root={x:450+Math.cos(a)*45,y:s.ground+z*12},tip={x:450+Math.cos(a)*rad,y:s.ground+z*rad*.27-row.h*open*(.58-z*.32)},w=(25+layer*10)*open,nx=-Math.sin(a),ny=Math.cos(a)*.27;
   const g=c.createLinearGradient(root.x,root.y,tip.x,tip.y);g.addColorStop(0,row.a);g.addColorStop(.6,row.a+'c9');g.addColorStop(1,row.b);c.globalAlpha=s.fade*(front?.7:.8);c.fillStyle=g;c.strokeStyle=row.b+'99';c.lineWidth=1.1;c.beginPath();c.moveTo(root.x,root.y);c.bezierCurveTo(root.x+nx*w,root.y-50,tip.x+nx*w,tip.y+45,tip.x,tip.y);c.bezierCurveTo(tip.x-nx*w,tip.y+35,root.x-nx*w,root.y-25,root.x,root.y);c.fill();c.stroke();
   c.globalCompositeOperation='screen';c.strokeStyle=row.b+'66';c.lineWidth=.8;c.beginPath();c.moveTo(root.x,root.y);c.quadraticCurveTo((root.x+tip.x)/2,(root.y+tip.y)/2-18,tip.x,tip.y);c.stroke();c.globalCompositeOperation='source-over';
  }
 }c.restore();
}
function bezier(a,b,c,d,u){const v=1-u;return {x:v*v*v*a.x+3*v*v*u*b.x+3*v*u*u*c.x+u*u*u*d.x,y:v*v*v*a.y+3*v*v*u*b.y+3*v*u*u*c.y+u*u*u*d.y};}
export function nguyenAnhStreamPoint(s,id,u){
 const a=id*TAU/24,outer=340+(id%3)*32,root={x:450+Math.cos(a)*outer,y:s.ground+Math.sin(a)*outer*.3};
 const end={x:s.soul.x,y:s.soul.y+45*(1-s.enter)};
 return bezier(root,{x:450+Math.cos(a+.7)*(outer+45),y:s.feet-180+Math.sin(a)*100},{x:end.x+Math.cos(a+1.1)*210,y:end.y-140},end,u);
}
function ribbon(c,pts,color,alpha,width){
 if(alpha<=0)return;const left=[],right=[];for(let j=0;j<pts.length;j++){const p=pts[j],a=pts[Math.max(0,j-1)],b=pts[Math.min(pts.length-1,j+1)],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,w=Math.sin(j/(pts.length-1)*Math.PI)*width;left.push({x:p.x-dy/len*w,y:p.y+dx/len*w});right.push({x:p.x+dy/len*w,y:p.y-dx/len*w});}
 c.globalAlpha=alpha*.15;c.fillStyle=color;c.beginPath();left.forEach((p,j)=>j?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));for(let j=right.length-1;j>=0;j--)c.lineTo(right[j].x,right[j].y);c.closePath();c.fill();
 for(const [w,a]of [[15,.06],[1.6,.58]]){c.globalAlpha=alpha*a;c.lineWidth=w;c.strokeStyle=color;c.beginPath();pts.forEach((p,j)=>j?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.stroke();}
}
function streams(scene,c,s,front){
 if(!s.flow)return;const light=scene.budget?.level==='light',n=nguyenAnhBudget(light).streams,steps=light?18:28;c.save();c.globalCompositeOperation='screen';c.lineCap='round';c.lineJoin='round';
 for(let i=0;i<n;i++){const id=light?i*2:i;if((Math.sin(id*TAU/24)>=0)!==front)continue;const head=(s.clock*(.37+s.enter*.3)+id*.097)%1,tail=Math.max(0,head-.28),pts=[];for(let j=0;j<=steps;j++)pts.push(nguyenAnhStreamPoint(s,id,tail+(head-tail)*j/steps));ribbon(c,pts,id%3?'#b3d6ff':'#d8b6f7',s.flow*Math.sin(head*Math.PI)*(.55+s.manifest*.3),7+id%3*2);}
 c.restore();
}
function pollen(scene,c,s,front){
 const light=scene.budget?.level==='light',n=nguyenAnhBudget(light).motes;c.save();c.globalCompositeOperation='screen';
 for(let i=0;i<n;i++){if((i%2===0)!==front)continue;const u=(s.clock*(.12+i%3*.018)+i*.618)%1,a=i*2.399+s.clock*.12,r=(1-u)*(320+i%4*22),release=ease((s.seconds-10.75)/1.2),x=450+Math.cos(a)*(r+release*100),y=s.ground-u*(420+i%4*95)-release*80;
  c.globalAlpha=s.open*s.fade*Math.sin(u*Math.PI)*(.2+s.flow*.4+s.burst*.35);c.fillStyle=i%4?'#bbd8ff':'#f1d6ff';const size=1.2+i%3*.7;c.fillRect(x,y,size,size*(i%5===0?2.8:1));
 }c.restore();
}
function spirit(c,s,art){
 if(s.soul.alpha<=0)return;const p=s.soul;c.save();c.globalCompositeOperation='screen';glow(c,p.x,p.y,p.size*.65,'#b5cfff70',p.alpha*.6);
 sprite(c,art.lotus,p.x,p.y,p.size,p.size,p.alpha*.95);
 // Two faint time-offset impressions give depth without suggesting extra characters.
 if(s.clock&&s.enter<.9)for(const side of [-1,1])sprite(c,art.lotus,p.x+side*28*(1-s.enter),p.y+9,p.size*.94,p.size*.94,p.alpha*.10,side*.025);
 c.restore();
}
function lotusAssets(scene,c,s,art){
 let base=scene.nguyenAnhLotusBase;
 if(art.lotus&&scene.nguyenAnhLotusSource!==art.lotus){base=makeSurface(800,320);if(base){const a=base.getContext('2d'),iw=art.lotus.width||art.lotus.naturalWidth,ih=art.lotus.height||art.lotus.naturalHeight;a.drawImage(art.lotus,0,ih*.53,iw,ih*.47,0,0,800,320);a.globalCompositeOperation='destination-in';const fade=a.createLinearGradient(0,0,0,320);fade.addColorStop(0,'#ffffff00');fade.addColorStop(.22,'#ffffffff');fade.addColorStop(1,'#ffffffff');a.fillStyle=fade;a.fillRect(0,0,800,320);scene.nguyenAnhLotusBase=base;scene.nguyenAnhLotusSource=art.lotus;}}
 c.save();if(base)sprite(c,base,450,s.ground-20,860,340,s.blooms[1]*s.fade*.9);else sprite(c,art.lotus,450,s.ground-20,860,340,s.blooms[1]*s.fade*.9,0,.58,.42);c.globalCompositeOperation='screen';
 sprite(c,art.halo,450,s.feet-230,820,820,s.aura*s.fade*(.24+s.burst*.18),s.clock*.035);
 const bud=ease((s.seconds-3.9)/.9)*(1-ease((s.seconds-7.5)/1.2));if(base)sprite(c,base,450,s.hover+80,270,125,bud*.8);else sprite(c,art.lotus,450,s.hover+80,270,125,bud*.8,0,.58,.42);
 // The large existing spirit illustration becomes the guardian effigy behind the actor.
 sprite(c,art.lotus,450,s.feet-165,840+s.burst*80,840+s.burst*80,s.effigy*(.18+s.burst*.2),Math.sin(s.clock*.17)*.015);
 c.restore();
}
function rays(scene,c,s){
 if(s.effigy<=0)return;let beam=scene.nguyenAnhBeam;if(!beam){beam=makeSurface(320,1100);if(beam){const a=beam.getContext('2d'),g=a.createLinearGradient(0,0,320,0);g.addColorStop(0,'#c5d5ff00');g.addColorStop(.5,'#d7e9ff99');g.addColorStop(1,'#c5d5ff00');a.fillStyle=g;a.fillRect(0,0,320,1100);a.globalCompositeOperation='destination-in';const fade=a.createLinearGradient(0,0,0,1100);fade.addColorStop(0,'#ffffff00');fade.addColorStop(.6,'#ffffffff');fade.addColorStop(1,'#ffffffff');a.fillStyle=fade;a.fillRect(0,0,320,1100);scene.nguyenAnhBeam=beam;}}
 if(!beam)return;c.save();c.globalCompositeOperation='screen';const reduced=scene.motion===false?.35:1;c.globalAlpha=s.effigy*s.fade*(.09+s.burst*.3)*reduced;for(let i=-1;i<=1;i++){c.save();c.translate(450+i*150,s.ground);c.rotate(i*.08);c.drawImage(beam,-70-i%2*15,-1000,140+i%2*30,1050);c.restore();}c.restore();
}
function discharge(scene,c,s,art){
 if(s.seconds<NGUYEN_ANH_BURST)return;const motion=scene.motion!==false,light=scene.budget?.level==='light',reduce=motion?1:.28,x=450,y=s.feet-150;
 c.save();c.globalCompositeOperation='screen';const u=ease((s.seconds-10.75)/1.3);
 sprite(c,art.burst,x,y,420+u*830,420+u*830,(1-u)*s.burst*.75*reduce,s.clock*.025);
 glow(c,x,y,190+s.burst*220,'#e0e8ffb0',s.burst*.7);
 for(let i=0;i<5;i++){const v=clamp((s.seconds-NGUYEN_ANH_BURST-i*.14)/1.55);if(v<=0||v>=1)continue;const r=55+ease(v)*(520+i*35);c.globalAlpha=(1-v)*(.7-i*.07)*reduce;c.strokeStyle=i%2?'#d9b8f8':'#c0e1ff';c.lineWidth=2+(1-v)*(6-i*.8);c.beginPath();c.ellipse(x,i%2?s.ground:y,r,r*(i%2?.26:.72),0,0,TAU);c.stroke();}
 const wave=ease((s.seconds-10.8)/1.25);sprite(c,art.groundWave,450,s.ground,350+wave*850,160+wave*340,(1-wave)*.7*reduce);
 const n=nguyenAnhBudget(light).arcs;for(let i=0;i<n;i++){const a=i*TAU/n+s.clock*.025,r=190+s.burst*110;c.globalAlpha=s.burst*.6*reduce;c.strokeStyle=i%3?'#b7dcff':'#f4dcff';c.lineWidth=i%3?1.2:2.2;c.beginPath();c.moveTo(x+Math.cos(a)*r*.7,y+Math.sin(a)*r*.7);c.bezierCurveTo(x+Math.cos(a-.16)*r*1.3,y+Math.sin(a-.16)*r*1.3,x+Math.cos(a+.26)*r*1.2,y+Math.sin(a+.26)*r*1.2,x+Math.cos(a+.28)*r,y+Math.sin(a+.28)*r);c.stroke();}
 c.restore();
}
function actor(scene,c,e,s,t){
 const live=scene.playerIndex?.get(e.user)||scene.players?.find(p=>p.id===e.user),to=e.visualTo||live,from=e.visualFrom||(to?{...to,realm:e.fromRealm??3}:null),p=s.revealed?to:from;if(!p)return;
 scene.targets=[{id:e.user,player:p,x:450,y:s.feet,scale:4.2}];const compact=scene.compact,ritual=scene.ritualDrawing;scene.compact=true;scene.ritualDrawing=true;c.save();
 try{const im=scene.nguyenAnhActor??=makeSurface(600,760);if(!im){scene.drawPlayer(c,p,450,s.feet,t);return;}const a=im.getContext('2d');a.setTransform(1,0,0,1,0,0);a.clearRect(0,0,600,760);a.save();a.translate(-150,530-s.feet);scene.drawPlayer(a,p,450,s.feet,t);a.restore();c.drawImage(im,150,s.feet-530);
  const amount=Math.min(.4,s.enter*.13+s.burst*.22);if(amount>0){a.save();a.globalCompositeOperation='source-in';const g=a.createLinearGradient(0,560,0,180);g.addColorStop(0,'#d7baff');g.addColorStop(.45,'#b4dfff');g.addColorStop(1,'#f8efff');a.fillStyle=g;a.fillRect(0,0,600,760);a.globalCompositeOperation='destination-in';a.drawImage(a.canvas,0,0);a.drawImage(a.canvas,0,0);a.globalCompositeOperation='source-atop';a.strokeStyle='#f9f4ff';a.lineWidth=2;for(const side of [-1,1]){a.beginPath();a.moveTo(300,505);a.bezierCurveTo(300+side*35,440,300+side*60,360,300+side*18,240);a.stroke();}a.restore();c.globalCompositeOperation='screen';c.globalAlpha=clamp(amount);c.drawImage(im,150,s.feet-530);}
 }finally{scene.compact=compact;scene.ritualDrawing=ritual;c.restore();}
}
export function drawNguyenAnhAwakening(scene,c,e,t,H){
 prepareNguyenAnhArt(scene);const s=nguyenAnhState((t-e.start)/e.duration,H,scene.motion!==false),art=assets(scene),color=scene.ritualAppearance?.palette.main2||'#d9c2ff';c.save();
 const bg=c.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#070c1c');bg.addColorStop(.5,'#17213a');bg.addColorStop(1,'#11152b');c.fillStyle=bg;c.fillRect(0,0,900,H);/* 4/11: thiên đài cả trên LIVE (<= Hóa Thần) */drawAscensionStageBackdrop(scene,c,H,{clock:t-e.start,ritual:true,color:scene.ritualAppearance?.palette.main2||'#d0b6ff',feet:s.feet});
 // 4/11 v2: lớp chung + biến thể chống lặp; hoa sen gốc giữ nguyên.
 const v=qiVariant(e),kq=qiRemap(s.k,NGUYEN_ANH_BURST/(NGUYEN_ANH_DURATION/1000)),origin={x:450,y:s.belly};setFxPalette(NA_PALETTE);drawQiEnvironment(scene,c,kq,H,origin,true);pushFxCamera(scene,c,kq,v,s.feet);
 glow(c,450,s.hover,480,'#6777b835',s.open*.9);const shake=scene.motion!==false&&scene.cameraEnabled!==false?s.burst*10:0;c.translate(Math.sin(s.clock*93)*shake,Math.cos(s.clock*79)*shake*.55);
 pool(c,s);drawQiInflow(scene,c,kq,origin,v.phase);lotusPetals(scene,c,s,false);lotusAssets(scene,c,s,art);rays(scene,c,s);streams(scene,c,s,false);pollen(scene,c,s,false);if(s.enter<.65)spirit(c,s,art);drawQiAura(scene,c,kq,origin,s.feet);actor(scene,c,e,s,t-e.start);lotusPetals(scene,c,s,true);streams(scene,c,s,true);if(s.enter>=.65)spirit(c,s,art);pollen(scene,c,s,true);discharge(scene,c,s,art);drawQiCompression(c,kq,origin);drawQiImpact(scene,c,kq,H,origin,s.feet);
 c.restore();drawQiMotes(scene,c,kq,H);drawQiVignette(c,kq,H);
 const top=c.createLinearGradient(0,0,0,H*.30);top.addColorStop(0,'#050a14b0');top.addColorStop(1,'#050a1400');c.fillStyle=top;c.fillRect(0,0,900,H*.30);
 const ui={k:s.k,realm:4,phase:s.revealed?'reveal':s.seconds<3.35?'lotus':s.seconds<5.8?'gather':s.seconds<8.8?'manifest':s.seconds<10.4?'enter':'compress',revealed:s.revealed,color,title:'Nguyên Anh',subtitle:'Nguyên Thần Liên Sinh',name:String(e.name||'Đạo hữu').normalize('NFC'),label:'',detail:'',shake};
 if(scene.onRitualFrame)scene.onRitualFrame(ui);else{c.textAlign='center';c.fillStyle='#eeeafa';c.font='600 25px Arial';c.fillText(ui.name,450,H*.19,700);if(s.revealed){c.font='700 40px Arial';c.fillStyle=color;c.fillText('NGUYÊN ANH',450,H*.24,740);}}
 c.restore();return ui;
}
