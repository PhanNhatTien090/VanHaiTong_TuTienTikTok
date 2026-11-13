import {makeSurface} from './performance.js';

const TAU=Math.PI*2, clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
const MOON={core:'#eaffff',light:'#8ef6ef',mid:'#36b6c8',dark:'#102843',gold:'#f6da9a'};
const FIRE={core:'#fff1bf',light:'#ffba60',mid:'#fa5241',dark:'#461429',gold:'#ffd182'};
const cache=new Map();

function ellipse(c,x,y,rx,ry,rotation=0){
 c.beginPath();c.ellipse(x,y,rx,ry,rotation,0,TAU);
}
function gem(c,x,y,r){
 c.beginPath();c.moveTo(x,y-r);c.lineTo(x+r*.46,y);c.lineTo(x,y+r);c.lineTo(x-r*.46,y);c.closePath();c.fill();
}
function petal(c,length,width){
 c.beginPath();c.moveTo(0,0);c.bezierCurveTo(-width*.85,-length*.27,-width,-length*.65,0,-length);
 c.bezierCurveTo(width,-length*.65,width*.85,-length*.27,0,0);c.closePath();
}
function paintedPetal(c,palette,length,width,fire=false){
 const g=c.createLinearGradient(0,0,0,-length);
 g.addColorStop(0,palette.dark);g.addColorStop(.43,palette.mid);g.addColorStop(.8,palette.light);g.addColorStop(1,palette.core);
 petal(c,length,width);c.fillStyle=g;c.fill();c.strokeStyle=palette.light;c.lineWidth=.85;c.stroke();
 c.beginPath();c.moveTo(0,-length*.12);c.quadraticCurveTo(fire?width*.3:0,-length*.54,0,-length*.92);
 c.strokeStyle=palette.core+'bb';c.lineWidth=.8;c.stroke();
 for(let j=0;j<4;j++){
  const y=-length*(.24+j*.14),w=width*(.48-j*.065);
  c.beginPath();c.moveTo(-w,y-7);c.quadraticCurveTo(0,y+2,w,y-7);c.strokeStyle=palette.gold+'93';c.lineWidth=.55;c.stroke();
 }
}
function sprite(key,paint){
 if(cache.has(key))return cache.get(key);
 const s=makeSurface(512,512);if(!s)return null;
 const c=s.getContext('2d');c.translate(256,256);c.scale(2,2);paint(c);cache.set(key,s);return s;
}
function moonDisc(c){
 const g=c.createRadialGradient(-18,-20,4,0,0,48);
 g.addColorStop(0,'#ffffef');g.addColorStop(.55,'#93e6e4');g.addColorStop(.90,'#369ab9');g.addColorStop(1,'#165279');
 ellipse(c,0,0,43,43);c.fillStyle=g;c.fill();
 c.globalCompositeOperation='destination-out';ellipse(c,14,-13,37,37);c.fill();
 c.globalCompositeOperation='source-over';c.strokeStyle=MOON.gold;c.lineWidth=1.1;
 for(const r of [51,57]){ellipse(c,0,0,r,r);c.stroke();}
 for(let i=0;i<12;i++){const a=i*TAU/12;c.fillStyle=i%3===0?MOON.core:MOON.gold;gem(c,Math.cos(a)*54,Math.sin(a)*54,i%3===0?3.1:1.7);}
}
function lotus(c){
 for(const [layer,len,width] of [[0,61,14],[1,49,13]]){
  for(let i=-3;i<=3;i++){
   c.save();c.translate(i*7,layer*6);c.rotate(i*(layer?.23:.29));paintedPetal(c,MOON,len-Math.abs(i)*5,width);c.restore();
  }
 }
}
function phoenixWing(c){
 for(let i=7;i>=0;i--){
  const u=i/7;
  c.save();c.translate(14+i*6,20-u*8);c.rotate(.37+u*.9);
  paintedPetal(c,FIRE,98-i*6,15-i*.65,true);c.restore();
 }
 for(let i=0;i<4;i++){
  c.save();c.translate(10+i*8,25);c.rotate(.85+i*.15);
  paintedPetal(c,FIRE,57-i*6,9,true);c.restore();
 }
}
function solarSeal(c){
 const glow=c.createRadialGradient(0,0,3,0,0,69);
 glow.addColorStop(0,'#ff863a64');glow.addColorStop(.65,'#ff412f36');glow.addColorStop(1,'#ff412f00');
 c.fillStyle=glow;c.fillRect(-70,-70,140,140);
 for(const r of [36,42,51]){ellipse(c,0,0,r,r);c.strokeStyle=r===42?FIRE.mid:FIRE.gold;c.lineWidth=r===42?2.8:1;c.stroke();}
 for(let i=0;i<16;i++){
  c.save();c.rotate(i*TAU/16);c.fillStyle=i%2?FIRE.light:FIRE.gold;gem(c,0,-54,i%2?4:8);c.restore();
 }
}
function paint(c,im,x,y,size,alpha=1){
 if(!im||alpha<=0)return;
 c.save();c.globalAlpha*=alpha;c.drawImage(im,x-size/2,y-size/2,size,size);c.restore();
}
function sigil(c,palette,clock,rx,y,light){
 c.save();c.translate(0,y);c.scale(1,.28);c.rotate(clock);
 for(const r of [rx,rx-6,rx-16]){ellipse(c,0,0,r,r);c.lineWidth=r===rx?2:1;c.strokeStyle=r===rx?palette.light:palette.gold+'a0';c.stroke();}
 const n=light?8:16;
 for(let i=0;i<n;i++){c.rotate(TAU/n);c.fillStyle=i%3?palette.light:palette.gold;gem(c,0,-rx+3,i%2?2.2:3.8);}
 c.restore();
}
function ribbon(c,color,edge,side,x,y,reach,drop,bend,alpha){
 c.save();c.globalAlpha*=alpha;c.translate(x,y);c.scale(side,1);
 c.beginPath();c.moveTo(0,0);c.bezierCurveTo(reach*.38,-drop*.8,reach*.7,bend,reach,drop);
 c.bezierCurveTo(reach*.76,bend+13,reach*.44,-drop*.32,0,6);c.closePath();
 c.fillStyle=color;c.fill();c.strokeStyle=edge;c.lineWidth=1.2;c.stroke();c.restore();
}
function motes(c,palette,t,count,width,height,fire,seed=0){
 c.save();c.globalCompositeOperation='screen';
 for(let i=0;i<count;i++){
  const u=(i*.618+t*(fire?.00049:.00031))%1,a=i*2.399+seed;
  const x=Math.sin(a+u*2)*width*(.46+.55*u),y=21-u*height,sz=1.5+(i%4)*.6;
  c.globalAlpha=Math.sin(u*Math.PI)*.8;c.fillStyle=i%3?palette.light:palette.core;
  if(fire){c.save();c.translate(x,y);c.rotate(Math.sin(a)*.65);c.fillRect(-sz*.38,0,sz*.76,sz*2.8);c.restore();}
  else gem(c,x,y,sz);
 }
 c.restore();
}

export const isCourtTransform=kind=>kind==='nguyet-lien'||kind==='xich-vu';

export function drawCourtAuraLayer(c,kind,t,stand,layer,{motion=true,light=false,seed=0}={}){
 const moon=kind==='nguyet-lien',palette=moon?MOON:FIRE,clock=motion?t+seed:0;
 const swell=motion?Math.sin(clock*.002):0;
 const phase=motion?(clock%9500)/9500:0,pulse=Math.sin(Math.PI*clamp((phase-.76)/.24))**2;
 const head=-51-stand*25;
 if(layer==='back'){
  sigil(c,palette,clock*.00048,moon?54:60,25,light);
  if(moon){
   paint(c,sprite('moon',moonDisc),0,head-13,211+5*swell,.84);
   const fan=sprite('lotus',lotus);
   for(const side of [-1,1]){
    c.save();c.translate(side*(29+4*swell),head+53);c.rotate(side*(.64+swell*.12));
    paint(c,fan,0,0,180,.78);c.restore();
   }
  }else{
   paint(c,sprite('sun',solarSeal),0,head-6,215+10*pulse,.88);
   const wing=sprite('phoenix',phoenixWing);
   for(const side of [-1,1]){
    c.save();c.translate(side*10,head+31);c.scale(side,1);c.rotate(swell*.08-pulse*.16);
    paint(c,wing,0,0,243+18*pulse,.93);c.restore();
   }
  }
 }else{
  for(const side of [-1,1]){
   ribbon(c,palette.mid+'58',palette.light+'bb',side,side*20,15,42+8*pulse,8+4*swell,-26+swell*6,.72);
   if(!light)ribbon(c,palette.light+'2f',palette.gold+'8f',side,side*26,-2,40+9*pulse,-18+swell*5,-31-swell*8,.72);
  }
  if(pulse>.02){
   c.save();c.globalAlpha*=pulse*.65;ellipse(c,0,24,65+25*pulse,11+8*pulse);
   c.strokeStyle=palette.core;c.lineWidth=1.4;c.stroke();c.restore();
  }
  motes(c,palette,clock,light?6:17,moon?65:87,moon?121:145,!moon,seed);
 }
}

export function drawCourtTransformation(c,kind,t,k,p,H,layer,reveal){
 const moon=kind==='nguyet-lien',palette=moon?MOON:FIRE,scale=Math.min(2.65,(p.scale||1.6)/1.52);
 const alpha=Math.min(1,k/.10,(1-k)/.15),age=k-reveal,build=smooth(k/reveal),open=smooth(age/.29),x=p.x,y=p.y;
 c.save();c.globalAlpha*=alpha;
 if(layer==='back'){
  c.fillStyle=palette.dark+'ba';c.fillRect(0,0,900,H);
  c.save();c.globalCompositeOperation='screen';
  if(moon){
   paint(c,sprite('moon',moonDisc),x,y-H*.28,520+120*build,.34);
   for(const side of [-1,1]){
    const R=275+open*65,cy=y-H*.09;
    c.beginPath();c.moveTo(x+side*65,cy-H*.22);
    c.bezierCurveTo(x+side*R,cy-H*.12,x+side*R,cy+H*.13,x+side*55,cy+H*.19);
    c.strokeStyle=palette.light+'77';c.lineWidth=5*(.5+build);c.stroke();
   }
  }else{
   for(const side of [-1,1]){
    const reach=220+130*open,base=y+H*.14,fireTop=base-H*(.18+.32*build);
    const g=c.createLinearGradient(0,fireTop,0,base);
    g.addColorStop(0,palette.mid+'00');g.addColorStop(.66,palette.mid+'62');g.addColorStop(1,palette.gold+'1a');
    c.fillStyle=g;c.beginPath();c.moveTo(x+side*80,base);
    c.bezierCurveTo(x+side*115,base-H*.24,x+side*reach,base-H*.21,x+side*(reach+24),fireTop);
    c.bezierCurveTo(x+side*(reach+64),base-H*.12,x+side*200,base-H*.03,x+side*80,base);c.fill();
   }
  }
  c.restore();
  c.translate(x,y);c.scale(scale,scale);
  sigil(c,palette,t*.0006,59+build*19,23,false);
  if(moon){
   paint(c,sprite('moon',moonDisc),0,-128+build*38,125+111*build,.94);
   for(let i=0;i<7;i++){
    c.save();c.translate((i-3)*(16+open*11),18);c.rotate((i-3)*(.39+open*.09));
    paint(c,sprite('lotus',lotus),0,0,(155+open*48)*(.72+build*.28),.76);c.restore();
   }
  }else{
   paint(c,sprite('sun',solarSeal),0,-98,175+88*build,.95);
   for(const side of [-1,1]){
    c.save();c.translate(side*(12+open*36),-42);c.scale(side,1);c.rotate((1-build)*.45-open*.21);
    paint(c,sprite('phoenix',phoenixWing),0,0,172+build*77+open*31,.95);c.restore();
   }
   for(const side of [-1,1])ribbon(c,FIRE.mid+'8a',FIRE.gold,side,0,22,100+open*32,-38,-74,.9);
  }
  c.restore();return;
 }
 c.save();c.translate(x,y);c.scale(scale,scale);
 const compression=Math.max(0,1-Math.abs(age+.05)/.14);
 if(compression>0){
  c.save();c.globalCompositeOperation='screen';c.globalAlpha*=compression*.75;
  const g=c.createRadialGradient(0,-40,0,0,-40,64);
  g.addColorStop(0,palette.core);g.addColorStop(.34,palette.light+'95');g.addColorStop(1,palette.light+'00');
  c.fillStyle=g;c.fillRect(-65,-105,130,130);c.restore();
 }
 if(age>=0&&age<.36){
  for(let i=0;i<(moon?3:5);i++){
   const u=clamp((age-i*.024)/.28);if(!u||u===1)continue;
   c.save();c.globalAlpha*=(1-u)*.88;c.strokeStyle=i%2?palette.gold:palette.core;c.lineWidth=(1-u)*3+1;
   ellipse(c,0,10-u*25,24+u*143,9+u*(moon?33:63),moon?0:(i-2)*.1);c.stroke();c.restore();
  }
 }
 motes(c,palette,t,30,88+open*61,158+open*48,!moon);
 c.restore();
 c.restore();
}

export function drawCourtTransformTitle(c,kind,k,H,reveal){
 if(k<=0||k>=1)return;
 const moon=kind==='nguyet-lien',palette=moon?MOON:FIRE,age=k-reveal;
 const titleAlpha=age>=0?smooth(age/.07)*(1-smooth((k-.85)/.15)):smooth(k/.10)*(1-smooth((k-.33)/.12));
 if(titleAlpha<=0)return;
 c.save();c.globalAlpha*=titleAlpha;
 c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';
 const title=age>=0?(moon?'NGUYỆT LIÊN TIÊN CƠ':'XÍCH VŨ NỮ ĐẾ'):(moon?'MINH NGUYỆT KHAI LIÊN':'XÍCH PHƯỢNG TRIỀU THIÊN');
 const y=H*.205;
 c.strokeStyle=palette.gold+'a0';c.lineWidth=1.4;
 for(const dir of [-1,1]){
  c.beginPath();c.moveTo(450+dir*9,y+45);c.lineTo(450+dir*181,y+45);c.stroke();
  c.fillStyle=palette.gold;gem(c,450+dir*188,y+45,3.5);
 }
 c.font='800 '+(age>=0?64:43)+'px Georgia';c.lineWidth=9;c.strokeStyle=palette.dark;c.strokeText(title,450,y,770);
 c.fillStyle=palette.core;c.fillText(title,450,y,770);c.restore();
}
