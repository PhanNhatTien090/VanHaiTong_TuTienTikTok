// V6 authored duel ultimates: real existing transparent in-game assets,
// deterministic staging and bounded draw work. Does NOT own damage or scores.
import {duelCastState} from './duel-combat.js';

const TAU=Math.PI*2;
const clamp=(n,min=0,max=1)=>Math.max(min,Math.min(max,n));
const ease=n=>1-(1-clamp(n))**3;
const mix=(a,b,k)=>a+(b-a)*k;

export const V6_ASSETS=Object.freeze({
 thunder:'/assets/god-forms-v1/thunder-dragon.png',
 thunderSeal:'/assets/v6/thunder-sigil.svg',
 flame:'/assets/god-forms-v1/phoenix-fire.png',
 azure:'/assets/god-forms-v1/jade-dragon.png',
 yinYang:'/assets/v6/taiji-seal.svg'
});
export const V6_SKILL_FAMILY=Object.freeze({
 thunder:'thunder',meteor:'thunder',sevenstars:'thunder',
 sword:'sword',slash:'sword',bamboo:'sword',flowersword:'sword',stararrow:'sword',
 flame:'flame',petal:'flame',
 dragon:'azure',vortex:'azure',
 celestial:'yinYang',lotus:'yinYang',stars:'yinYang',starmirror:'yinYang',bell:'yinYang',
 frost:'frost'
});
export function v6SkillFamily(id){return V6_SKILL_FAMILY[id]||null;}

export function v6Budget(scene){
 const pressed=!!(scene.budget?.pressured||scene.budget?.level==='light'||scene.heavyCrowd||(scene.fps>0&&scene.fps<18));
 return {pressed,bolts:pressed?3:8,blades:pressed?7:19,streamers:pressed?3:7,
  scale:pressed?.77:1,showSecondary:!pressed,flashes:!scene.reduceFlash};
}

// Preload ONLY images used by either fighter, well before their 19.8s ultimate.
// All other work is plain canvas primitives. Never instantiate images while drawing.
export function prewarmDuelV6(scene,match){
 if(!match?.id||scene.v6AssetMatch===match.id)return;
 scene.v6AssetMatch=match.id;
 scene.v6Assets={};scene.v6MissingAssets=new Set();
 if(typeof Image==='undefined')return;
 const ids=[match.a,match.b].map(id=>v6SkillFamily(match.techniques?.[id]?.id));
 const families=new Set(ids);if(families.has('thunder'))families.add('thunderSeal');
 for(const family of families){
  if(!V6_ASSETS[family])continue;
  const img=new Image();
  img.decoding='async';
  img.onload=()=>{if(scene.v6AssetMatch===match.id&&img.naturalWidth>0)scene.v6Assets[family]=img;};
  img.onerror=()=>{if(scene.v6AssetMatch===match.id)scene.v6MissingAssets??=new Set();scene.v6MissingAssets?.add(family);};
  img.src=V6_ASSETS[family];
 }
}

// One ultimate per side, both charged on the server match clock. The counter
// casts slightly later, but is still animated if rendering starts mid-match.
export function v6CounterProgress(match,now){
 if(!match?.startedAt)return -1;
 const cast=duelCastState(now-match.startedAt,0);
 if(!cast.ready||!cast.ultimate)return -1;
 const offset=.16;
 return (cast.k-offset)/(1-offset);
}

function line(c,x,y,x2,y2,color,width,alpha=1){
 c.globalAlpha=alpha;c.strokeStyle=color;c.lineWidth=width;c.beginPath();
 c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();
}
function ring(c,x,y,r,ry,color,width,alpha=1,rotation=0){
 c.globalAlpha=alpha;c.strokeStyle=color;c.lineWidth=width;c.beginPath();
 c.ellipse(x,y,r,ry,rotation,0,TAU);c.stroke();
}
function ray(c,x,y,r,a,span,color,width,alpha){
 const dx=Math.cos(a),dy=Math.sin(a);
 line(c,x+dx*r,y+dy*r*.72,x+dx*(r+span),y+dy*(r+span)*.72,color,width,alpha);
}
function sword(c,x,y,size,angle,color,alpha=1){
 c.save();c.translate(x,y);c.rotate(angle);c.globalAlpha=alpha;
 c.fillStyle=color;c.strokeStyle='#fff8dc';c.lineWidth=1;
 c.beginPath();c.moveTo(0,-size);c.lineTo(size*.13,-size*.23);
 c.lineTo(size*.08,size*.34);c.lineTo(0,size*.52);
 c.lineTo(-size*.08,size*.34);c.lineTo(-size*.13,-size*.23);c.closePath();c.fill();
 c.beginPath();c.moveTo(0,-size*.85);c.lineTo(0,size*.43);c.stroke();
 c.restore();
}
function crystal(c,x,y,size,a,alpha=1){
 c.save();c.translate(x,y);c.rotate(a);c.globalAlpha=alpha;
 c.fillStyle='#92edff';c.strokeStyle='#f8ffff';c.lineWidth=2;
 c.beginPath();c.moveTo(0,-size);c.lineTo(size*.33,-size*.12);
 c.lineTo(size*.2,size*.70);c.lineTo(0,size*.9);
 c.lineTo(-size*.2,size*.7);c.lineTo(-size*.33,-size*.12);c.closePath();
 c.fill();c.stroke();c.strokeStyle='#e5faff';c.lineWidth=1;
 c.beginPath();c.moveTo(0,-size);c.lineTo(0,size*.7);
 c.moveTo(-size*.33,-size*.12);c.lineTo(0,size*.10);c.lineTo(size*.33,-size*.12);c.stroke();
 c.restore();
}
function thunder(c,x0,y0,x1,y1,seed,color,width,alpha){
 // Two nested strokes from one stable seed. No allocations, randomness or filters.
 const dx=x1-x0,dy=y1-y0,cross=Math.hypot(dx,dy)||1;
 for(const [shade,w,a] of [[color,width,alpha],['#ffffff',Math.max(1,width*.24),alpha*.94]]){
  c.globalAlpha=a;c.strokeStyle=shade;c.lineWidth=w;c.beginPath();c.moveTo(x0,y0);
  for(let j=1;j<6;j++){
   const u=j/6,shift=Math.sin(seed*4.2+j*2.7)*Math.min(27,cross*.12)*(1-Math.abs(u-.5));
   c.lineTo(x0+dx*u-dy/cross*shift,y0+dy*u+dx/cross*shift);
  }
  c.lineTo(x1,y1);c.stroke();
 }
}
function apparition(c,img,x,y,w,h,alpha,flip=false){
 if(!(img?.naturalWidth||img?.width)||alpha<=0)return false;
 c.save();c.globalAlpha=alpha;c.translate(x,y);if(flip)c.scale(-1,1);
 c.drawImage(img,-w/2,-h/2,w,h);c.restore();return true;
}
function groundSeal(c,x,y,r,color,opacity,clock){
 ring(c,x,y,r,r*.30,color,3,opacity,-.1);
 ring(c,x,y,r*.72,r*.23,'#f6e8b8',1.4,opacity*.72,.24);
 for(let j=0;j<8;j++){
  const a=j*TAU/8+(clock||0),cs=Math.cos(a),sn=Math.sin(a);
  line(c,x+cs*r*.76,y+sn*r*.25,x+cs*r*.97,y+sn*r*.29,color,3,opacity*.9);
 }
}
function charge(scene,c,actor,tech,family,k,t,b,counter){
 const u=clamp(k/.56),pow=counter?.68:1;
 const x=actor.x,y=actor.y-150,r=(65+145*ease(u))*b.scale*pow;
 const color=family==='thunder'?'#b1a8ff':family==='flame'?'#ffc178':family==='azure'?'#7cf8de':family==='frost'?'#bdeeff':family==='yinYang'?'#f7e5b4':'#9ceeff';
 const clock=scene.motion===false?0:t*.00045;
 c.save();c.lineCap='round';
 // Negative-space rings stay readable over the bright arena.
 c.fillStyle='#080c24';c.globalAlpha=.23*u;
 c.beginPath();c.ellipse(x,y,r*.68,r*.55,0,0,TAU);c.fill();
 groundSeal(c,x,actor.y+12,r*.83,color,.36+.5*u,clock);
 if(family==='thunder'&&scene.v6Assets?.thunderSeal){
  const img=scene.v6Assets.thunderSeal,size=r*2.18;
  c.save();c.globalAlpha=.22+.48*u;c.translate(x,actor.y-42);
  c.rotate(clock*.35);c.drawImage(img,-size*.5,-size*.5,size,size);c.restore();
 }
 ring(c,x,y,r,r*.29,color,3.5,.29+.53*u,-.2);
 ring(c,x,y,r*.6,r*.60,'#f0f7ff',2,.24+.45*u,clock);
 if(family==='thunder'){
  const sprite=scene.v6Assets?.thunder;
  apparition(c,sprite,x,actor.y-315,r*1.48,r*2.05,.10+.45*u,actor.x>450);
  for(let i=0;i<b.bolts;i++){
   const a=i*TAU/b.bolts+clock,xx=x+Math.cos(a)*r,yy=y+Math.sin(a)*r*.8;
   thunder(c,xx,yy,x,y,i+2,color,b.pressed?3:5,.22+.65*u);
  }
 }else if(family==='sword'){
  const count=b.blades;
  for(let i=0;i<count;i++){
   const a=TAU*i/count-clock*.35,dist=r*(.77+(i%3)*.13);
   sword(c,x+Math.sin(a)*dist,y-50+Math.cos(a)*dist*.66,
    (11+14*u)*(counter?.7:1),-a,color,.25+.7*u);
  }
 }else if(family==='flame'){
  apparition(c,scene.v6Assets?.flame,x,actor.y-290,r*1.15,r*1.5,.10+.52*u,actor.x>450);
  for(let i=0;i<b.streamers;i++){
   const a=i*TAU/b.streamers+clock*.7,xx=x+Math.cos(a)*r*.9,yy=y+Math.sin(a)*r*.7;
   line(c,xx,yy,x+(xx-x)*.18,y-43+(yy-y)*.15,color,2+2*u,.34+.52*u);
  }
 }else if(family==='azure'){
  apparition(c,scene.v6Assets?.azure,x,actor.y-290,r*1.25,r*1.85,.1+.5*u,actor.x>450);
  for(let i=0;i<b.streamers;i++){
   const j=i*TAU/b.streamers+clock*.9;
   ring(c,x,y,60+i*12+u*r*.48,16+i*4+u*r*.20,color,2,.18+.35*u,j);
  }
 }else if(family==='yinYang'){
  const img=scene.v6Assets?.yinYang;
  if(img?.naturalWidth||img?.width){
   c.save();c.translate(x,y);c.rotate(clock);c.globalAlpha=.25+.55*u;c.drawImage(img,-r,-r,r*2,r*2);c.restore();
  }
  for(let i=0;i<4;i++){
   const a=i*Math.PI/2+clock,xx=x+Math.cos(a)*r*.77,yy=y+Math.sin(a)*r*.55;
   ring(c,xx,yy,12+u*7,12+u*7,i%2?'#e8cbff':'#dbffff',2,.42+.43*u);
  }
 }else if(family==='frost'){
  for(let i=0;i<b.blades;i++){
   const a=i*TAU/b.blades+clock*.6;
   const xx=x+Math.sin(a)*r*(.45+(i%3)*.15),yy=y+Math.cos(a)*r*.64;
   crystal(c,xx,yy,(13+u*20)*(i%2?.65:1),a,.24+.7*u);
  }
 }else return void c.restore();
 // The fully charged heart is always crisp even when reduced-flash is on.
 c.fillStyle='#fff6e0';c.globalAlpha=.26+.60*u;
 c.beginPath();c.arc(x,y,5+14*u*pow,0,TAU);c.fill();
 c.restore();
}
function travel(scene,c,actor,target,family,k,t,b,counter){
 const u=clamp((k-.56)/.40),progress=ease(clamp(u/.65)),pow=counter?.64:1;
 const sx=actor.x,sy=actor.y-215,tx=target.x,ty=target.y-30;
 const x=mix(sx,tx,progress),y=mix(sy,ty,progress)-Math.sin(Math.PI*progress)*(counter?40:105);
 const color=family==='thunder'?'#b4a6ff':family==='flame'?'#ffac6f':family==='azure'?'#6ef2d4':family==='frost'?'#b6f7ff':family==='yinYang'?'#f5e7be':'#9edbff';
 const fade=clamp((1-u)/.15);
 c.save();c.lineCap='round';c.lineJoin='round';
 if(family==='thunder'){
  const im=scene.v6Assets?.thunder;
  if(!apparition(c,im,x,y-130,270*b.scale*pow,445*b.scale*pow,fade*.98,actor.x>450)){
   // Asset failed to decode: still a unique forked lightning-dragon silhouette.
   for(let i=0;i<5;i++)thunder(c,sx,sy,x+i*13,y-30+i*9,i+3,color,7*b.scale*pow,fade*.8);
  }
  for(let j=0;j<b.bolts;j++){
   const a=j*TAU/b.bolts+t*.0003,
    dx=Math.cos(a)*(55+28*u)*b.scale*pow,dy=Math.sin(a)*(70+35*u)*b.scale*pow;
   thunder(c,x-dx,y-dy,x+dx,y+dy,j+12,color,3.5*b.scale,fade*.83);
  }
 }else if(family==='sword'){
  for(let i=0;i<b.blades;i++){
   const a=i*2.399,late=Math.max(0,progress-(i%4)*.085);
   const xx=mix(sx+Math.cos(a)*(65+i%5*13),tx,clamp(late)),
    yy=mix(sy-70+Math.sin(a)*(28+i%3*21),ty,clamp(late));
   sword(c,xx,yy,(22+i%3*6)*pow,Math.atan2(ty-sy,tx-sx)+Math.PI/2,
     i%3===0?'#fff4d6':color,fade);
   line(c,xx-(tx-sx)*.10,yy-(ty-sy)*.10,xx,yy,color,2*b.scale,fade*.48);
  }
  sword(c,x,y,105*b.scale*pow,Math.atan2(ty-sy,tx-sx)+Math.PI/2,'#f5f9ff',fade);
 }else if(family==='flame'){
  apparition(c,scene.v6Assets?.flame,x,y-100,315*b.scale*pow,370*b.scale*pow,fade*.96,actor.x>450);
  for(let i=0;i<b.streamers;i++){
   const a=i*TAU/b.streamers+u*3,rr=(24+i*12)*b.scale*pow;
   const px=x+Math.cos(a)*rr,py=y+Math.sin(a)*rr;
   line(c,sx+(px-sx)*.65,sy+(py-sy)*.65,px,py,i%2?'#ff744b':'#fff4bb',3*b.scale,fade*.7);
  }
 } else if(family==='azure'){
  apparition(c,scene.v6Assets?.azure,x,y-105,275*b.scale*pow,430*b.scale*pow,fade*.92,actor.x>450);
  for(let i=0;i<b.streamers;i++){
   const a=i*TAU/b.streamers+u*4,xx=x+Math.cos(a)*115*b.scale*pow,yy=y+Math.sin(a)*72*b.scale*pow;
   ring(c,xx,yy,25+i*5,6+i*2,color,2,fade*.51,a);
  }
 }else if(family==='yinYang'){
  const im=scene.v6Assets?.yinYang,sz=(160+u*220)*b.scale*pow;
  if(im?.naturalWidth||im?.width){
   c.save();c.translate(x,y);c.rotate(scene.motion===false?0:u*2.5);
   c.globalAlpha=fade*.91;c.drawImage(im,-sz*.5,-sz*.5,sz,sz);c.restore();
  }else{
   ring(c,x,y,sz*.45,sz*.45,color,6,fade);
   ring(c,x,y,sz*.27,sz*.27,'#f5f8ff',3,fade);
  }
 }else if(family==='frost'){
  crystal(c,x,y-40,165*b.scale*pow,Math.atan2(ty-sy,tx-sx)+Math.PI/2,fade);
  for(let i=0;i<b.blades;i++){
   const a=i*2.399,spread=(35+i%5*20)*b.scale*pow;
   crystal(c,x+Math.cos(a)*spread,y+Math.sin(a)*spread*.70,
    (14+i%3*9)*b.scale*pow,a,fade*.73);
  }

 }
 if(progress>.36){
  const v=clamp((progress-.36)/.64);
  const rr=(28+v*(counter?160:310))*b.scale;
  ring(c,tx,ty,rr,rr*.48,color,counter?3:6,(1-v)*fade);
  ring(c,tx,ty,rr*.85,rr*.35,'#fff6df',2,(1-v)*fade*.8);
  // Solid shards are more legible than heavy screen blur at 24fps.
  for(let j=0;j<(b.pressed?5:12);j++){
   const a=j*TAU/(b.pressed?5:12)+.3,reach=rr*(.58+(j%3)*.1);
   ray(c,tx,ty,reach,a,(40+24*(j%3))*(1-v*.4),j%2?color:'#fff4d3',3,fade*(1-v));
  }
 }
 c.restore();
}

export function drawDuelV6Ultimate(scene,c,t,actor,target,tech,k,{counter=false}={}){
 if(scene.cinematicV2===false||scene.v6Showcase===false||!actor||!target)return false;
 const family=v6SkillFamily(tech?.id);if(!family||k<0||k>1)return false;
 const b=v6Budget(scene);
 // One large hero draw and one smaller counter. On pressured hardware keep
 // only the counter ground-seal to avoid overdraw while retaining its timing.
 if(counter&&b.pressed){
  if(k<.56){
   c.save();groundSeal(c,actor.x,actor.y+8,75,'#a7d5ff',.43,0);c.restore();
  }
  return true;
 }
 const kSafe=scene.motion===false?(k<.56?.40:.83):k;
 if(kSafe<.56)charge(scene,c,actor,tech,family,kSafe,t,b,counter);
 else travel(scene,c,actor,target,family,kSafe,t,b,counter);
 return true;
}
