import {kimDanV2State,drawKdSky,drawKdCauldron,drawKdFire,drawKdTurns,drawKdBolts,drawKdRays} from './kim-dan-formation.js';
import {drawAscensionStageBackdrop} from './ascension-stage.js';
import {makeSurface} from './performance.js';
import {setFxPalette,qiVariant,qiRemap,pushFxCamera,drawQiEnvironment,drawQiVignette,drawQiInflow,drawQiCompression,drawQiImpact,drawQiAura,drawQiMotes} from './qi-impact.js';
const KD_PALETTE={main:'#ffd36e',main2:'#ffe7a8',soft:'#fff6dc',gold:'#ffb85c'};
import {KIM_DAN_DURATION,KIM_DAN_LIQUEFY,KIM_DAN_SEALS,KIM_DAN_ENTER,KIM_DAN_COMPRESS,KIM_DAN_BURST,KIM_DAN_REVEAL} from './kim-dan-timeline.js';
const TAU=Math.PI*2,clamp=v=>Math.max(0,Math.min(1,v)),ease=v=>{v=clamp(v);return v*v*(3-2*v);},mix=(a,b,u)=>a+(b-a)*u;
export function kimDanState(k,H=1600,motion=true){
 k=clamp(k);const seconds=k*KIM_DAN_DURATION/1000,feet=H*.64,ground=feet+66,hover=feet-470,belly=feet-35;
 const enter=ease((seconds-KIM_DAN_ENTER)/.85),form=ease((seconds-4.35)/1.8),compression=ease((seconds-KIM_DAN_COMPRESS)/.22)*(1-ease((seconds-KIM_DAN_BURST)/.12));
 const burst=ease((seconds-KIM_DAN_BURST)/.1)*(1-ease((seconds-9.58)/.66));
 const core={x:450,y:mix(hover,belly,enter),r:mix(70,22,enter)*(1-compression*.26),alpha:ease((seconds-4.25)/.8)*(1-ease((seconds-9.45)/.18))};
 const clock=motion?seconds:0;
 const drops=Array.from({length:9},(_,i)=>{const u=ease((seconds-KIM_DAN_LIQUEFY-i*.1)/1.25),a=i*TAU/9+clock*.35+u*2.3,r=(1-u)*(185+i%3*16);return {id:i,x:450+Math.cos(a)*r,y:hover+Math.sin(a)*r*.62,r:6+Math.sin(u*Math.PI)*7,z:Math.sin(a),alpha:ease((seconds-3.5)/.4)*(1-ease((u-.88)/.12)),u};});
 return {k,seconds,clock,feet,ground,hover,belly,core,drops,form,enter,compression,
  open:ease(seconds/1.35),flow:ease((seconds-1.4)/.65)*(1-ease((seconds-6.05)/.4)),
  seals:KIM_DAN_SEALS.map(at=>ease((seconds-at)/.55)),charge:ease((seconds-6.15)/2.9),
  burst:burst*(motion?1:.30),revealed:k>=KIM_DAN_REVEAL/(KIM_DAN_DURATION/1000),
  sun:ease((seconds-9.4)/.35)*(1-ease((seconds-11.1)/.7)),fade:1-ease((seconds-11.4)/.4)};
}
function glow(c,x,y,r,color,alpha=1,sy=1){if(r<=0||alpha<=0)return;c.save();c.translate(x,y);c.scale(1,sy);c.globalAlpha=clamp(alpha);const g=c.createRadialGradient(0,0,0,0,0,r);g.addColorStop(0,color);g.addColorStop(1,color.slice(0,7)+'00');c.fillStyle=g;c.fillRect(-r,-r,r*2,r*2);c.restore();}
function basinArt(c){
 c.fillStyle='#0c100e';c.beginPath();c.ellipse(0,14,355,98,0,0,TAU);c.fill();
 const g=c.createRadialGradient(-70,-15,10,0,0,365);g.addColorStop(0,'#8b7339');g.addColorStop(.3,'#464b2b');g.addColorStop(.75,'#20271c');g.addColorStop(1,'#151d18');c.fillStyle=g;c.beginPath();c.ellipse(0,0,355,93,0,0,TAU);c.fill();
 for(const [r,alpha]of [[355,'b0'],[340,'40'],[310,'65'],[246,'35']]){c.strokeStyle='#e4c37b'+alpha;c.lineWidth=r===355?2.4:1.1;c.beginPath();c.ellipse(0,0,r,r*.26,0,0,TAU);c.stroke();}
 for(let i=0;i<6;i++){const a=i*TAU/6;c.strokeStyle='#dbbf7955';c.lineWidth=1;c.beginPath();c.moveTo(Math.cos(a)*335,Math.sin(a)*86);c.bezierCurveTo(Math.cos(a+.5)*220,Math.sin(a+.5)*58,Math.cos(a+1.0)*145,Math.sin(a+1)*39,0,0);c.stroke();}
 for(let i=0;i<36;i++){const a=i*TAU/36;c.strokeStyle=i%3?'#af9c6245':'#f0d28b90';c.beginPath();c.moveTo(Math.cos(a)*322,Math.sin(a)*84);c.lineTo(Math.cos(a)*331,Math.sin(a)*86);c.stroke();}
}
function basin(scene,c,s){
 c.save();c.globalAlpha=s.open*s.fade;c.translate(450,s.ground);
 let art=scene.kimDanBasin;if(!art){art=makeSurface(800,260);if(art){const a=art.getContext('2d');a.translate(400,120);basinArt(a);scene.kimDanBasin=art;}}
 if(art)c.drawImage(art,-400,-120);else basinArt(c);
 c.globalCompositeOperation='screen';
 for(let i=0;i<3;i++){const u=(s.clock*.22+i/3)%1,r=60+u*290;c.globalAlpha=s.open*s.fade*(1-u)*(.18+s.form*.25+s.burst*.4);c.strokeStyle=i%2?'#f0cd80':'#9ce4bd';c.lineWidth=1.4;c.beginPath();c.ellipse(0,0,r,r*.26,0,0,TAU);c.stroke();}
 c.restore();glow(c,450,s.ground,430,'#c5a85c65',s.open*s.fade*(.3+s.charge*.25+s.burst*.4),.3);
}
function bezier(a,b,c,d,u){const v=1-u;return {x:v*v*v*a.x+3*v*v*u*b.x+3*v*u*u*c.x+u*u*u*d.x,y:v*v*v*a.y+3*v*v*u*b.y+3*v*u*u*c.y+u*u*u*d.y};}
export function kimDanStreamPoint(s,id,u){
 const a=id*TAU/6-.3,root={x:450+Math.cos(a)*350,y:s.ground+Math.sin(a)*80},end={x:450,y:s.hover};
 return bezier(root,{x:450+Math.cos(a+.6)*420,y:s.feet-170-Math.sin(a)*100},{x:450+Math.cos(a+1.3)*220,y:s.hover-60},end,u);
}
function flowingQi(scene,c,s,front){
 if(s.flow<=0)return;const light=scene.budget?.level==='light',steps=light?20:34;c.save();c.globalCompositeOperation='screen';c.lineCap='round';c.lineJoin='round';
 for(let id=0;id<6;id++){if((Math.sin(id*TAU/6-.3)>=0)!==front)continue;
  const head=(s.clock*.5+id*.167)%1,tail=Math.max(0,head-.38),pts=[];
  for(let j=0;j<=steps;j++)pts.push(kimDanStreamPoint(s,id,tail+(head-tail)*j/steps));
  const left=[],right=[];
  for(let j=0;j<pts.length;j++){const p=pts[j],a=pts[Math.max(0,j-1)],b=pts[Math.min(steps,j+1)],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,w=Math.sin(j/steps*Math.PI)*(3+s.form*4);left.push({x:p.x-dy/len*w,y:p.y+dx/len*w});right.push({x:p.x+dy/len*w,y:p.y-dx/len*w});}
  const tint=c.createLinearGradient(0,s.ground,0,s.hover);tint.addColorStop(0,'#71ba9255');tint.addColorStop(.5,'#d8b969');tint.addColorStop(1,'#ffe2a0');c.fillStyle=tint;c.globalAlpha=s.flow*Math.sin(head*Math.PI)*.13;c.beginPath();left.forEach((p,j)=>j?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));for(let j=right.length-1;j>=0;j--)c.lineTo(right[j].x,right[j].y);c.closePath();c.fill();
  for(const [width,alpha]of [[16,.02],[6,.09],[1.6,.55]]){const start=pts[0],end=pts.at(-1),g=c.createLinearGradient(start.x,start.y,end.x+(start.x===end.x?.01:0),end.y);g.addColorStop(0,'#74cfa3');g.addColorStop(.50,'#dec47d');g.addColorStop(1,'#fff0b5');c.strokeStyle=g;c.lineWidth=width;c.globalAlpha=s.flow*Math.sin(head*Math.PI)*alpha;c.beginPath();pts.forEach((p,j)=>j?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.stroke();}
  if(!light)for(let j=0;j<5;j++){const u=(head+j*.11)%1,p=kimDanStreamPoint(s,id,u);c.globalAlpha=Math.sin(u*Math.PI)*s.flow*.6;c.fillStyle=u<.45?'#b0e6b9':'#ffe4a0';c.beginPath();c.ellipse(p.x,p.y,2+j%2,4+j%3,-id*.2,0,TAU);c.fill();}
 }c.restore();
}
function goldArt(c){
 const g=c.createRadialGradient(-24,-30,2,0,0,78);g.addColorStop(0,'#fffce3');g.addColorStop(.14,'#fff0ac');g.addColorStop(.36,'#eebc4b');g.addColorStop(.64,'#bb751c');g.addColorStop(.86,'#795020');g.addColorStop(1,'#27271e');c.fillStyle=g;c.beginPath();c.arc(0,0,77,0,TAU);c.fill();
 c.strokeStyle='#fff5c69a';c.lineWidth=2;c.beginPath();c.ellipse(-12,-18,38,26,-.5,Math.PI*.93,Math.PI*1.8);c.stroke();
 c.fillStyle='#fffdeaa8';c.beginPath();c.ellipse(-24,-31,13,7,-.6,0,TAU);c.fill();
}
function orb(scene,c,p,form=1,clock=0,scale=1){
 if(p.alpha<=0||p.r<=0)return;let art=scene.kimDanGold;if(!art){art=makeSurface(180,180);if(art){const a=art.getContext('2d');a.translate(90,90);goldArt(a);scene.kimDanGold=art;}}
 c.save();c.globalAlpha=clamp(p.alpha);c.translate(p.x,p.y);const r=p.r*scale;
 c.save();c.beginPath();for(let i=0;i<=64;i++){const a=i*TAU/64,wave=(Math.sin(a*5+clock*2)+Math.sin(a*7-clock*1.4))*(1-form)*.055,rr=r*(1+wave);i?c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr):c.moveTo(Math.cos(a)*rr,Math.sin(a)*rr);}c.closePath();c.clip();
 if(art)c.drawImage(art,-r*1.17,-r*1.17,r*2.34,r*2.34);else{c.scale(r/77,r/77);goldArt(c);}c.restore();
 c.strokeStyle='#f3d0888a';c.lineWidth=1;c.beginPath();c.arc(0,0,r,0,TAU);c.stroke();c.restore();
}
function droplets(scene,c,s,front){
 for(const p of s.drops){if((p.z>=0)!==front||p.alpha<=0)continue;c.save();c.globalCompositeOperation='screen';glow(c,p.x,p.y,p.r*3.5,'#efcc7770',p.alpha*.6);c.strokeStyle='#e8c775';c.lineWidth=2;c.globalAlpha=p.alpha*.6;c.beginPath();c.moveTo(p.x,p.y);c.quadraticCurveTo(p.x+Math.sin(p.id*3)*13,p.y-12,p.x+Math.sin(p.id*3)*19,p.y-25);c.stroke();c.restore();orb(scene,c,p,.5,s.clock);}
}
function core(scene,c,s){
 const p=s.core;if(p.alpha<=0)return;c.save();c.globalCompositeOperation='screen';glow(c,p.x,p.y,90+s.form*40,'#edc76c88',p.alpha*(.3+s.charge*.4));c.restore();orb(scene,c,p,s.form,s.clock);
 c.save();c.globalCompositeOperation='screen';c.translate(p.x,p.y);
 for(let i=0;i<3;i++){const u=s.seals[i];if(!u)continue;const r=p.r*(1.25+i*.26),angle=(i-1)*.85+(s.clock*.14)*(i%2?1:-1);c.save();c.rotate(angle);c.globalAlpha=u*p.alpha*.85;c.strokeStyle=i===1?'#fff2b9':'#e7ba66';c.lineWidth=1.8;c.beginPath();c.ellipse(0,0,r,r*(.35+.20*i),0,-Math.PI*.5,-Math.PI*.5+TAU*u);c.stroke();
  for(let j=0;j<8;j++){if(j/8>u)continue;const a=j*TAU/8;c.fillStyle='#fff1b3';c.beginPath();c.arc(Math.cos(a)*r,Math.sin(a)*r*(.35+.20*i),1.8,0,TAU);c.fill();}c.restore();
 }c.restore();
}
function corona(scene,c,s){
 if(s.sun<=0)return;const motion=scene.motion!==false,light=scene.budget?.level==='light',x=450,y=s.feet-225,expand=ease((s.seconds-9.4)/.55),r=120+expand*140;
 c.save();c.globalCompositeOperation='screen';const reduced=motion?1:.35;
 glow(c,x,y,r*1.7,'#d18d3a85',s.sun*.8*reduced);glow(c,x,y,r,'#fbe5a35a',s.sun*.9*reduced);
 let sun=scene.kimDanSun;if(!sun){sun=makeSurface(800,800);if(sun){const a=sun.getContext('2d'),g=a.createRadialGradient(400,400,0,400,400,370);g.addColorStop(0,'#f5b83e08');g.addColorStop(.48,'#f6c74e10');g.addColorStop(.70,'#ffbf4880');g.addColorStop(.80,'#fff3cfee');g.addColorStop(.84,'#f3bc4ba0');g.addColorStop(.93,'#d6772435');g.addColorStop(1,'#d6772400');a.fillStyle=g;a.fillRect(0,0,800,800);scene.kimDanSun=sun;}}
 c.globalAlpha=s.sun*(.72+s.burst*.28)*reduced;if(sun)c.drawImage(sun,x-r*1.25,y-r*1.25,r*2.5,r*2.5);
 // Open fiery loops form a solar corona; the actor remains in front of its core.
 for(let i=0;i<(light?14:26);i++){const a=i*TAU/(light?14:26)+s.clock*.06,reach=r*(1.18+.22*Math.sin(i*13+s.clock)),inner=r*(.88+.05*Math.sin(i*7)),span=.13+.14*(.5+.5*Math.sin(i*17)),nx=Math.cos(a),ny=Math.sin(a);c.strokeStyle=i%3?'#f2bd58':'#fff0b7';c.globalAlpha=s.sun*(.42+s.burst*.4)*reduced;c.lineWidth=i%4?1.5:3.2;c.beginPath();c.moveTo(x+nx*inner,y+ny*inner);c.bezierCurveTo(x+Math.cos(a-.12)*reach,y+Math.sin(a-.12)*reach,x+Math.cos(a+span)*reach,y+Math.sin(a+span)*reach,x+Math.cos(a+span)*inner,y+Math.sin(a+span)*inner);c.stroke();}
 for(let i=0;i<2;i++){c.globalAlpha=s.sun*(.28+s.burst*.3)*reduced;c.lineWidth=i?1:2;c.strokeStyle=i?'#c08a42':'#ffeab0';c.beginPath();c.arc(x,y,r*(i?1.06:.85),0,TAU);c.stroke();}
 c.restore();
}
function sparks(scene,c,s,front){
 const light=scene.budget?.level==='light',n=light?20:46;c.save();c.globalCompositeOperation='screen';
 for(let i=0;i<n;i++){if((i%2===0)!==front)continue;const u=(s.clock*.19+i*.618)%1,a=i*2.399,release=ease((s.seconds-9.4)/1),r=(1-u)*(210+i%4*25)+release*80,x=450+Math.cos(a)*r,y=s.ground-u*(250+i%3*65)-release*80; c.globalAlpha=s.open*s.fade*Math.sin(u*Math.PI)*(.20+s.form*.35+s.burst*.3);c.fillStyle=i%3?'#ebca7e':'#a8d8b1';c.fillRect(x,y,1.3+i%2,1.8+i%3);}
 c.restore();
}
function discharge(c,s,motion){
 if(s.seconds<KIM_DAN_BURST)return;const fade=1-ease((s.seconds-9.9)/.8),x=450,y=s.belly;
 c.save();c.globalCompositeOperation='screen';glow(c,x,y,180+s.burst*170,'#fff0b6cf',s.burst*.8);
 for(let i=0;i<3;i++){const u=clamp((s.seconds-9.4-i*.12)/1.2);if(u<=0||u>=1)continue;const r=55+ease(u)*560;c.globalAlpha=(1-u)*.7*(motion?1:.32);c.strokeStyle=i===1?'#e4b765':'#fff0bb';c.lineWidth=2+(1-u)*(5-i);c.beginPath();c.ellipse(x,i===1?s.ground:y,r,r*(i===1?.26:.7),0,0,TAU);c.stroke();}
 for(let i=0;i<18;i++){const a=i*2.399,u=clamp((s.seconds-9.45)/.9),r=60+ease(u)*330;c.globalAlpha=fade*(1-u)*.6*(motion?1:.35);c.strokeStyle=i%3?'#e9c574':'#fff5cb';c.lineWidth=i%3?1:2;c.beginPath();c.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r*.7);c.lineTo(x+Math.cos(a)*(r+22),y+Math.sin(a)*(r+22)*.7);c.stroke();}c.restore();
}
function actor(scene,c,e,s,t){
 const live=scene.playerIndex?.get(e.user)||scene.players?.find(p=>p.id===e.user),to=e.visualTo||live,from=e.visualFrom||(to?{...to,realm:e.fromRealm??2}:null),p=s.revealed?to:from;if(!p)return;
 const y=s.feet;scene.targets=[{id:e.user,player:p,x:450,y,scale:4.2}];const compact=scene.compact,ritual=scene.ritualDrawing;scene.compact=true;scene.ritualDrawing=true;c.save();
 try{const surface=scene.kimDanActor??=makeSurface(600,760);if(!surface){scene.drawPlayer(c,p,450,y,t);return;}const a=surface.getContext('2d');a.setTransform(1,0,0,1,0,0);a.clearRect(0,0,600,760);a.save();a.translate(-150,530-y);scene.drawPlayer(a,p,450,y,t);a.restore();c.drawImage(surface,150,y-530);
  const amount=Math.min(.4,s.enter*.12+s.burst*.22);if(amount>0){a.save();a.globalCompositeOperation='source-in';const g=a.createLinearGradient(0,570,0,180);g.addColorStop(0,'#ffdc83');g.addColorStop(.5,'#fff0b9');g.addColorStop(1,'#f4e6b1');a.fillStyle=g;a.fillRect(0,0,600,760);a.globalCompositeOperation='destination-in';a.drawImage(surface,0,0);a.drawImage(surface,0,0);a.restore();c.globalCompositeOperation='screen';c.globalAlpha=clamp(amount);c.drawImage(surface,150,y-530);}
 }finally{scene.compact=compact;scene.ritualDrawing=ritual;c.restore();}
}
export function drawKimDanAwakening(scene,c,e,t,H){
 const motion=scene.motion!==false,s=kimDanState((t-e.start)/e.duration,H,motion),color=scene.ritualAppearance?.palette.main2||'#ffe09a';c.save();
 const bg=c.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#0c1116');bg.addColorStop(.52,'#222319');bg.addColorStop(1,'#0f1715');c.fillStyle=bg;c.fillRect(0,0,900,H);/* 4/11: thiên đài cả trên LIVE (<= Hóa Thần) */drawAscensionStageBackdrop(scene,c,H,{clock:t-e.start,ritual:true,color:scene.ritualAppearance?.palette.main2||'#ffe4aa',feet:s.feet});
 // 4/11 v2: lớp chung (tia nắng, camera, hạt khí, cú nổ, hào quang, mưa sáng, vignette) + biến thể chống lặp.
 const v=qiVariant(e),kq=qiRemap(s.k,KIM_DAN_BURST/(KIM_DAN_DURATION/1000)),origin={x:450,y:s.belly};setFxPalette(KD_PALETTE);drawQiEnvironment(scene,c,kq,H,origin,true);const v2=kimDanV2State(s.seconds);drawKdSky(scene,c,v2,H);/* v2 05/11: trời đổi sắc */pushFxCamera(scene,c,kq,v,s.feet);
 glow(c,450,s.hover,430,'#ad82342c',s.open*.8);const shake=motion&&scene.cameraEnabled!==false?s.burst*8:0;c.translate(Math.sin(s.clock*101)*shake,Math.cos(s.clock*83)*shake*.6);
 basin(scene,c,s);drawKdFire(scene,c,v2,s,false);drawKdCauldron(scene,c,v2,s);drawQiInflow(scene,c,kq,origin,v.phase);flowingQi(scene,c,s,false);sparks(scene,c,s,false);droplets(scene,c,s,false);corona(scene,c,s);
 if(s.core.alpha>0){c.save();c.globalCompositeOperation='screen';glow(c,s.core.x,s.core.y,s.core.r*2.8,'#ffd36e70',s.core.alpha*.75);glow(c,s.core.x,s.core.y,s.core.r*1.4,'#fff6dcaa',s.core.alpha*.5);c.restore();}
 drawQiAura(scene,c,kq,origin,s.feet);if(s.enter<.65)core(scene,c,s);actor(scene,c,e,s,t-e.start);flowingQi(scene,c,s,true);droplets(scene,c,s,true);if(s.enter>=.65)core(scene,c,s);drawKdTurns(scene,c,v2,s);drawKdBolts(scene,c,v2,s,H);drawKdFire(scene,c,v2,s,true);sparks(scene,c,s,true);discharge(c,s,motion);drawQiCompression(c,kq,origin);drawQiImpact(scene,c,kq,H,origin,s.feet);drawKdRays(scene,c,v2,s,H);
 if(s.revealed){c.save();c.globalCompositeOperation='screen';glow(c,450,s.belly,18,'#ffe7a880',(1-s.burst)*s.fade*.6);c.restore();}
 c.restore();drawQiMotes(scene,c,kq,H);drawQiVignette(c,kq,H);
 const ui={k:s.k,realm:3,phase:s.revealed?'reveal':s.seconds<3.8?'gather':s.seconds<6.15?'liquefy':s.seconds<8.2?'seal':s.seconds<9.05?'enter':'compress',revealed:s.revealed,color,title:'Kim Đan',subtitle:'Kim Đan Diệu Nhật',name:String(e.name||'Đạo hữu').normalize('NFC'),label:'',detail:'',shake};
 if(scene.onRitualFrame)scene.onRitualFrame(ui);else{c.textAlign='center';c.fillStyle='#f1ebd8';c.font='600 25px Arial';c.fillText(ui.name,450,H*.19,700);if(s.revealed){c.font='700 40px Arial';c.fillStyle=color;c.fillText('KIM ĐAN',450,H*.24,740);}}
 c.restore();return ui;
}
