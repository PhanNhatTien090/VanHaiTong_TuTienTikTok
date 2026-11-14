import {lateRealmBackdrop} from './late-ascension-art.js';
import {lateAscension} from './late-ascension-data.js';
import {REALM_NAMES} from './progression.js';
import {maThanActorImage} from './ma-than-awakening.js';
import {makeSurface} from './performance.js';
import {qiVariant,qiRemap,pushFxCamera,setFxPalette,drawQiImpact,drawQiMotes} from './qi-impact.js';

const TAU=Math.PI*2, clamp=v=>Math.max(0,Math.min(1,v));
const ease=v=>{v=clamp(v);return v*v*(3-2*v);};
const mix=(a,b,v)=>a+(b-a)*v;
const rand=i=>((Math.imul(i+32,1103515245)^Math.imul(i+81,370248451))>>>0)/4294967296;
const snapshots=new WeakMap();
const backdrops=new Map();
const shades=['#073038','#46202e','#2c1747','#47351c'];

function polygon(c,points,fill,stroke,width=1){
 c.beginPath();
 points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));
 c.closePath();
 if(fill){c.fillStyle=fill;c.fill();}
 if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}
}
function ring(c,x,y,r,ry,color,width,angle=0){
 if(r<=0||ry<=0)return;
 c.beginPath();c.ellipse(x,y,r,ry,angle,0,TAU);c.strokeStyle=color;c.lineWidth=width;c.stroke();
}
function line(c,x,y,X,Y,color,width=1){
 c.beginPath();c.moveTo(x,y);c.lineTo(X,Y);c.strokeStyle=color;c.lineWidth=width;c.stroke();
}
function flare(c,x,y,r,color){
 polygon(c,[[x-r,y],[x-3,y-3],[x,y-r],[x+3,y-3],[x+r,y],[x+3,y+3],[x,y+r],[x-3,y+3]],color);
}
function backdrop(H,index,color){
 const key=index+':'+Math.round(H);
 if(backdrops.has(key))return backdrops.get(key);
 const art=makeSurface(450,Math.ceil(H/2));if(!art)return null;
 const x=art.getContext('2d');x.scale(.5,.5);
 const bg=x.createLinearGradient(0,0,0,H);
 bg.addColorStop(0,'#030610');bg.addColorStop(.43,shades[index]);bg.addColorStop(1,'#02040c');
 x.fillStyle=bg;x.fillRect(0,0,900,H);
 const glow=x.createRadialGradient(450,H*.47,0,450,H*.47,H*.6);
 glow.addColorStop(0,color+'3b');glow.addColorStop(1,color+'00');
 x.fillStyle=glow;x.fillRect(0,0,900,H);
 for(let i=0;i<230;i++){
  const px=rand(i*4+index)*900,py=rand(i*4+1)*H,r=.6+rand(i*4+2)*2.7;
  x.fillStyle=i%3===0?color:'#dce8ff';x.globalAlpha=.14+rand(i*4+3)*.6;x.fillRect(px,py,r,r);
 }
 x.globalAlpha=1;
 for(let band=0;band<3;band++){
  const y=H*(.61+.07*band);
  const ridge=Array.from({length:25},(_,i)=>[i*40-30,y-rand(i+band*32+index*97)*(25+band*25)]);
  polygon(x,[...ridge,[930,H],[-30,H]],['#0a1422','#080e1b','#040812'][band],color+'26',2);
 }
 if(backdrops.size>=8)backdrops.delete(backdrops.keys().next().value);
 backdrops.set(key,art);return art;
}
function sceneState(spec,realm,H,age,motion,light,variant){
 const T=Math.max(0,age), beats=spec.beats, b=Math.max(0,beats.findLastIndex(([at])=>at<=T));
 const at=beats[b][0], end=beats[b+1]?.[0]??spec.duration/1000;
 const local=clamp((T-at)/(end-at)), after=T-spec.impact;
 return {T,b,local,H,realm,k:clamp(T*1000/spec.duration),motion,light,color:spec.color,feet:H*.665,core:H*.515,dir:variant.flip?-1:1,
  fold:ease((T-beats[6][0])/(spec.impact-beats[6][0]-.6)),arrival:ease(T/4),after,revealed:after>=.35};
}

function chart(c,s){
 const {T,b,local,H,color,fold,dir}=s, y=H*.34, x=450;
 const spin=dir*(T*.22+(b===3?Math.sin(local*Math.PI)*.6:0)), raise=ease((T-5)/6), join=ease((T-32)/7);
 c.save();c.globalAlpha*=.25+s.arrival*.75;
 for(let i=0;i<4;i++){
  const angle=spin+i*Math.PI/2;
  const cx=mix(x+Math.cos(angle)*(210+80*raise),450,fold),cy=mix(y+Math.sin(angle)*140,s.core,fold);
  const r=(45+raise*(95+i*5))*(1-fold*.94), ridge=[];
  for(let j=0;j<12;j++){
   const a=j*TAU/12+angle*.25;
   const q=r*(.55+rand(j+i*15)*.5);
   ridge.push([cx+Math.cos(a)*q,cy+Math.sin(a)*q*.65]);
  }
  polygon(c,ridge,'#0a2633',color,2);
  if(b>=2){
   for(let j=1;j<ridge.length-1;j+=2)line(c,cx,cy,...ridge[j],color+'87',1.4);
   if(b>=4)line(c,cx,cy,450,mix(H*.84,s.core,join),color+'84',1.7);
   flare(c,cx,cy,10*(1-fold)+3,'#e3fff4');
  }
 }
 if(b>=1){
  for(let i=1;i<=3;i++)ring(c,x,mix(y,s.core,fold),(100+i*95)*(1-fold*.92),(42+i*48)*(1-fold*.92),color+'91',2,spin*.17*i);
  for(let i=0;i<24;i++){
   const a=spin+i*TAU/24,r=350*(1-fold*.93);
   line(c,x+Math.cos(a)*(r-9),y+Math.sin(a)*(r-9)*.54,x+Math.cos(a)*r,y+Math.sin(a)*r*.54,color,2);
  }
 }
 c.restore();
}

function timeRiver(c,s){
 const {T,b,H,color,fold,core}=s;
 const freezeT=b===4?27:T, flowClock=T<27?T:T<34?27:61-T, bend=Math.sin(freezeT*.46), cross=ease((T-11)/8);
 for(let lane=-1;lane<=1;lane++){
  const x0=450+lane*315, fromY=H*.02, tailY=H*.94;
  for(let strand=-2;strand<=2;strand++){
   c.beginPath();c.moveTo(mix(x0+strand*15,450,fold),mix(fromY,core,fold));
   c.bezierCurveTo(x0+lane*100*bend,mix(H*.28,core,fold),mix(450+lane*(230-465*cross)+strand*30,450,fold),mix(H*.67,core,fold),mix(450-lane*350+strand*24,450,fold),mix(tailY,core,fold));
   c.strokeStyle=lane===0?'#fff0c892':color+(strand===0?'a3':'48');c.lineWidth=strand===0?4:1.5;c.stroke();
  }
  for(let i=0;i<(s.light?6:14);i++){
   const p=((i/14+flowClock*.09+10)%1),q=1-p;
   const x=q*q*q*x0+3*q*q*p*(x0+lane*100*bend)+3*q*p*p*(450+lane*(230-465*cross))+p*p*p*(450-lane*350);
   flare(c,mix(x,450,fold),mix(mix(fromY,tailY,p),core,fold),i%4?5:12,lane===0?'#fff3ce':color);
  }
 }
 const radius=(64+ease(T/15)*170)*(1-fold*.9);
 ring(c,450,core,radius,radius*.88,color+'ad',3);
 for(let i=0;i<12;i++){
  const angle=i*TAU/12, x=Math.cos(angle)*radius,y=Math.sin(angle)*radius*.88;
  line(c,450+x*.91,core+y*.91,450+x,core+y,'#ffddb1',3);
 }
 const hand=s.dir*flowClock*.6-Math.PI/2;
 line(c,450,core,450+Math.cos(hand)*radius*.84,core+Math.sin(hand)*radius*.74,'#fff1d4',4);
 if(b===4){c.fillStyle='#06081365';c.fillRect(0,0,900,H);}
}

function loom(c,s){
 const {T,b,local,H,color,fold,core}=s, height=H*.78, top=H*.075;
 const gap=(390-ease((T-35)/9)*50)*(1-fold*.96);
 const count=s.light?12:21;
 for(let i=0;i<count;i++){
  const pos=i/(count-1)*2-1, x=450+pos*gap;
  const twist=Math.sin(T*.9+i*.43)*65*(1-fold), broken=(b===3||b===4)&&i%3===0;
  c.beginPath();c.moveTo(x,mix(top,core,fold));
  c.quadraticCurveTo(x+twist,mix(H*.26,core,fold),x-twist*.4,mix(H*.43,core,fold));
  if(broken)c.moveTo(x+twist*.4,mix(H*(.48+.13*(1-local)),core,fold));
  c.quadraticCurveTo(x-twist,mix(H*.65,core,fold),x,mix(top+height,core,fold));
  c.strokeStyle=i%4?color+'94':'#f7e6ff';c.lineWidth=i%4?1.5:3;c.stroke();
 }
 if(b>=1){
  const rows=Math.min(24,Math.floor(Math.max(0,T-6)*.9));
  for(let i=0;i<rows;i++){
   const y=mix(top+height*i/24,core,fold);
   c.beginPath();c.moveTo(450-gap,y);
   for(let j=1;j<=12;j++)c.lineTo(450-gap+gap*j/6,y+(j%2?1:-1)*15*Math.sin(i*.4+T*.3)*(1-fold));
   c.strokeStyle=i%5?color+'4f':'#f3d8ff9c';c.lineWidth=i%5?1.3:2.5;c.stroke();
  }
  const phase=(T*.47)%2, travel=phase<1?phase:2-phase, sx=450+gap*(travel*2-1),sy=mix(top+(rows+.5)*height/25,core,fold);
  polygon(c,[[sx-42,sy],[sx,sy-10],[sx+42,sy],[sx,sy+10]],'#faf0ff',color,2);
 }
 if(b===3||b===4)for(let i=0;i<11;i++)flare(c,450+(rand(i)*2-1)*gap,H*.38+rand(i+40)*H*.23,4+11*Math.sin(local*Math.PI),color);
 if(b>=5)ring(c,450,core,gap,gap*.63,'#fff0ff',4);
}

function mirrorWorld(c,s){
 const {T,b,local,H,color,fold,core,dir}=s, density=s.light?7:13, roll=b>=3?ease((T-21)/8)*Math.PI:0;
 for(let i=density-1;i>=0;i--){
  const p=i/(density-1), z=(1-p*.84)*(1-fold*.96), y=mix(H*(.35+p*.15),core,fold);
  const lean=Math.sin(T*.34+p*4)*.2+roll*p*dir, w=420*z, h=(400+p*110)*z;
  c.save();c.translate(450,y);c.rotate(lean);
  polygon(c,[[-w,-h*.68],[w*.82,-h],[w,h*.66],[-w*.82,h]],i%2?'#23213a90':'#4a361d62',color+'a0',Math.max(1,4*z));
  if(b>=1){
   polygon(c,[[-w,h*.48],[-w*.65,-h*.06],[-w*.35,h*.22],[0,-h*.37],[w*.28,h*.16],[w*.51,-h*.13],[w,h*.66]],'#0b1427aa','#fff5bd6c',1.7);
   const x=w*.46*Math.sin(T*.34+i*.4);
   flare(c,x,-h*.49,Math.max(2,23*z),i%2?'#fff6d4':color);
  }
  if(b>=4){
   for(let j=0;j<5;j++){
    const a=rand(i*7+j)*TAU,x=Math.cos(a)*w*.82,Y=Math.sin(a)*h*.77;
    line(c,0,0,x*.4+12,Y*.46,'#fff5d2',1.5);
    line(c,x*.4+12,Y*.46,x,Y,color,1.7);
   }
  }
  c.restore();
 }
 if(b>=6)for(let i=0;i<3;i++){
  const open=ease((T-47-i*1.1)/.95);
  if(open>0)ring(c,450,core,110+i*145,34+i*26,color,3,dir*(i-1)*open*.92);
 }
}
const motifs=[chart,timeRiver,loom,mirrorWorld];

function impact(c,s,index){
 if(s.after<0||s.after>5)return;
 const time=s.after,{core,H,color}=s;
 if(time<1.6){
  c.globalAlpha=(1-time/1.6)*.74;
  const span=45+ease(time/1.6)*680;
  if(index===0){
   for(let i=0;i<4;i++){
    const a=Math.PI/4+i*TAU/4,x=Math.cos(a)*span,y=Math.sin(a)*span;
    polygon(c,[[450,core],[450+x*.55-y*.12,core+y*.55+x*.12],[450+x,core+y],[450+x*.55+y*.12,core+y*.55-x*.12]],color+'31','#e4fff7',2);
   }
  }else if(index===1){
   for(let i=-1;i<=1;i++){
    const sweep=span*(1+Math.abs(i)*.2);
    c.beginPath();c.moveTo(450,core);c.bezierCurveTo(450+i*sweep,core-sweep*.45,450-i*sweep,core+sweep*.7,450+i*sweep,core+sweep);
    c.strokeStyle=i===0?'#fff6db':color;c.lineWidth=9*(1-time/1.6)+2;c.stroke();
   }
  }else if(index===2){
   for(let i=0;i<5;i++){
    const size=span*(1-i*.10);
    polygon(c,[[450,core-size],[450+size,core],[450,core+size],[450-size,core]],null,i%2?'#f6deff':color,3);
   }
  }else{
   for(let i=0;i<8;i++){
    const a=i*TAU/8+time*.45,x=Math.cos(a)*span,y=Math.sin(a)*span;
    polygon(c,[[450+x*.26,core+y*.26],[450+x*.71-y*.19,core+y*.71+x*.19],[450+x,core+y]],color+'5a','#fff1bb',3);
   }
  }
 }
 const waveCount=6+index*2;
 for(let i=0;i<waveCount;i++){
  const u=(time-i*.07)/(2.4+index*.28);
  if(u<=0||u>=1)continue;
  const radius=25+ease(u)*(830+i*45), y=core+(i%2?-1:1)*i*12;
  c.globalAlpha=(1-u)*.83;ring(c,450,y,radius,radius*(.19+i*.043),i%3?'#fff6dc':color,11*(1-u)+1,(i-4)*.10);
 }
 const particles=s.light?52:110+index*24;
 for(let i=0;i<particles;i++){
  const a=rand(i+100)*TAU,v=170+rand(i*7+3)*690,x=450+Math.cos(a)*v*time,y=core+Math.sin(a)*v*time;
  if(x<-20||x>920||y<0||y>H)continue;
  const length=Math.min(92,v*time*.56);
  c.globalAlpha=(1-time/5)*(.35+rand(i)*.6);
  line(c,x,y,x-Math.cos(a)*length,y-Math.sin(a)*length,i%4?color:'#fff5d4',i%5?1.5:4);
 }
 c.globalAlpha=1;
}

export function drawLateAwakening(scene,c,e,t,H,realm){
 const spec=lateAscension(realm),index=realm-25,v=qiVariant(e);
 const s=sceneState(spec,realm,H,(t-e.start)/e.duration*spec.duration/1000,scene.motion!==false,scene.budget?.level==='light',v);
 const origin={x:450,y:s.core}, kq=qiRemap(s.k,spec.impact*1000/spec.duration);
 if(!snapshots.has(e)){
  const p=scene.playerIndex?.get(e.user)||{id:e.user,name:e.name,giftCoins:0};
  snapshots.set(e,{from:{...(e.visualFrom||p),realm:e.fromRealm??realm-1},to:{...(e.visualTo||p),realm}});
 }
 const pair=snapshots.get(e), p=s.revealed?pair.to:pair.from;
 const image=maThanActorImage(scene,p,e), sky=backdrop(H,index,s.color);
 c.save();
 c.fillStyle='#050916';c.fillRect(0,0,900,H);
 if(sky)c.drawImage(sky,0,0,900,H);
 const painted=lateRealmBackdrop(realm);
 if(painted){
  const slide=s.motion?Math.sin(s.T*.16)*20:0;
  c.globalAlpha=.56+s.arrival*.20;
  c.drawImage(painted,-30+slide,-24,960,H+50);
  c.globalAlpha=1;
  c.fillStyle='#04081642';c.fillRect(0,0,900,H);
 }
 setFxPalette({main:s.color,main2:s.color,soft:'#f6edff',gold:'#ffe5a2'});
 pushFxCamera(scene,c,kq,v,s.feet);
 const shake=s.motion&&scene.cameraEnabled!==false&&s.after>=0?Math.exp(-s.after*5)*(13+index*3):0;
 c.translate(Math.sin(s.T*65)*shake,Math.cos(s.T*51)*shake*.45);
 c.save();
 c.globalAlpha=s.revealed?Math.max(.17,1-s.after*.45):1;
 motifs[index](c,s);
 c.restore();
 for(let i=0;i<3;i++){
  const r=(125+i*74)*(1-s.fold*.65)+Math.sin(s.T+i)*8;
  ring(c,450,s.feet+36,r,r*.21,s.color+'81',2,s.dir*.05*i);
 }
 if(s.fold>.72&&!s.revealed){
  c.fillStyle='#030611b2';c.fillRect(0,0,900,H);
  flare(c,450,s.core,7+(1-s.fold)*44,s.color);
 }
 drawQiImpact(scene,c,kq,H,origin,s.feet,{flash:false,pillar:false});
 impact(c,s,index);
 if(image)c.drawImage(image,130,s.feet-590);
 else scene.drawPlayer?.(c,p,450,s.feet,0);
 if(s.revealed){
  const r=125+index*20;
  for(let i=0;i<index+2;i++)ring(c,450,s.feet-330,r+i*21,r*.53+i*12,s.color+'99',2,s.dir*(s.T*.1+i));
 }
 c.restore();
 c.restore();
 if(!scene.reduceFlash&&s.after>=0&&s.after<.26){c.save();c.globalAlpha=(1-s.after/.26)*.45;c.fillStyle='#fff3db';c.fillRect(0,0,900,H);c.restore();}
 drawQiMotes(scene,c,kq,H);
 const ui={realm,k:s.k,revealed:s.revealed,phase:s.revealed?'reveal':'gather',color:spec.color,title:REALM_NAMES[realm],subtitle:spec.title,name:e.name,label:spec.beats[s.b][1],detail:'',shake};
 if(scene.onRitualFrame)scene.onRitualFrame(ui);
 else{c.save();c.textAlign='center';c.fillStyle=s.color;c.font='700 32px Georgia';c.fillText(s.revealed?ui.title:ui.label,450,H*.1,780);c.restore();}
 return ui;
}
