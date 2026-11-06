// Gift choreography: arrive -> gather -> blossom/sword release -> floating embers.
// Uses the breakthrough energy renderer without changing rewards or the player model.
import {makeSurface} from './performance.js';
import {qiVariant,qiRemap,setFxPalette,drawQiInflow,drawQiCompression,drawQiImpact,drawQiAura} from './qi-impact.js';
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);};
export const TRIBUTE_TIERS=Object.freeze([
 {min:1,name:'Linh Hoa Tâm Ý',duration:2800,color:'#ff658d',soft:'#ffd9e8',size:62,petals:18,swords:0},
 {min:5,name:'Hoa Vũ Đồng Môn',duration:2800,color:'#ff80b5',soft:'#ffdcf0',size:62,petals:18,swords:0},
 {min:30,name:'Ngọc Liên Khai Hoa',duration:4400,color:'#63e6d0',soft:'#ddfff4',size:115,petals:26,swords:0},
 {min:99,name:'Kim Kiếm Tri Ân',duration:5800,color:'#ffc66d',soft:'#fff1ce',size:155,petals:30,swords:7},
 {min:199,name:'Thiên Hoa Kiếm Vũ',duration:6500,color:'#c7a1ff',soft:'#f5e6ff',size:190,petals:36,swords:12}
]);
export function tributeProfile(e){
 if(!e?.gift)return null;const coins=Number(e.coins),count=Math.max(1,Number(e.count)||1),value=coins*count;
 if(!Number.isFinite(value)||coins<=0||value<1)return null;
 return {...TRIBUTE_TIERS.findLast(q=>value>=q.min),value};
}
export function prepareGiftTribute(scene){
 if(scene.tributeRose||scene.tributeRoseLoading||typeof Image==='undefined')return;
 scene.tributeRoseLoading=true;const im=new Image();im.onload=()=>scene.tributeRose=im;im.onerror=()=>scene.tributeRoseLoading=false;im.src='/assets/gift-rose.webp';
}
const textureCache=new Map();
function bloomTexture(color,soft){
 const key=color+soft;if(textureCache.has(key))return textureCache.get(key);
 const im=makeSurface(320,220);if(!im)return null;const c=im.getContext('2d');c.translate(160,128);
 // Overlapping, shaded petals; soft veins instead of an outlined flower icon.
 for(let layer=0;layer<4;layer++){
  const n=12-layer*2,r=93-layer*20;
  for(let i=0;i<n;i++){
   const a=i*TAU/n+layer*.41;c.save();c.rotate(a);c.scale(1,.72);
   const g=c.createLinearGradient(0,5,0,-r);g.addColorStop(0,'#602945');g.addColorStop(.35,color);g.addColorStop(.83,color);g.addColorStop(1,soft);
   c.fillStyle=g;c.beginPath();c.moveTo(0,8);c.bezierCurveTo(-r*.52,-r*.15,-r*.56,-r*.64,-r*.05,-r);c.bezierCurveTo(r*.39,-r*.86,r*.63,-r*.14,0,8);c.fill();c.restore();
  }
 }
 const g=c.createRadialGradient(0,-2,0,0,-2,17);g.addColorStop(0,soft);g.addColorStop(.25,'#ffe6a3');g.addColorStop(1,color+'00');c.fillStyle=g;c.fillRect(-18,-20,36,36);
 textureCache.set(key,im);return im;
}
function petal(c,x,y,s,a,color,soft,alpha){
 c.save();c.globalAlpha*=alpha;c.translate(x,y);c.rotate(a);c.scale(s,s);
 const g=c.createLinearGradient(-6,-10,8,8);g.addColorStop(0,soft);g.addColorStop(.45,color);g.addColorStop(1,color+'25');c.fillStyle=g;
 c.beginPath();c.moveTo(0,10);c.bezierCurveTo(-15,0,-9,-14,3,-12);c.bezierCurveTo(16,-10,12,5,0,10);c.fill();c.restore();
}
function sword(c,x,y,size,a,alpha,color,image){
 c.save();c.globalAlpha*=alpha;c.translate(x,y);c.rotate(a);c.scale(size,size);
 if(image){c.drawImage(image,-24,-75,48,135);c.restore();return;}
 const g=c.createLinearGradient(-5,0,6,0);g.addColorStop(0,color);g.addColorStop(.5,'#fff6de');g.addColorStop(1,'#ba843d');c.fillStyle=g;
 c.beginPath();c.moveTo(0,-63);c.lineTo(5,-43);c.lineTo(3,16);c.lineTo(-3,16);c.lineTo(-5,-43);c.closePath();c.fill();c.fillStyle='#eab859';c.fillRect(-12,15,24,4);c.fillRect(-2,19,4,17);
 c.strokeStyle=color+'70';c.lineWidth=2;c.beginPath();c.moveTo(0,38);c.lineTo(0,100);c.stroke();c.restore();
}
export function drawGiftTribute(scene,c,e,t,k,p,H,layer='front'){
 const q=tributeProfile(e);if(!q||k<0||k>1)return false;
 const small=q.value<=10,impactAt=q.value>=500?.34:.46,v=qiVariant(e),phase=scene.motion===false?.53:k,clock=scene.motion===false?0:(t-e.start)*.001,
 fade=ease(phase/.09)*(1-ease((phase-.78)/.22)),open=ease((phase-.12)/.30),release=ease((phase-.46)/.28),
 x=p.x,y=p.y-45,scale=small?1:q.value>=500?1.1:.85,r=q.size,light=scene.presentation?.kind==='gift'?false:scene.budget?.level==='light',n=light?Math.ceil(q.petals*.6):q.petals;
 c.save();c.globalAlpha*=fade;
 if(layer==='back'){
  if(!small){const shade=c.createRadialGradient(x,y,70,x,y,r*4);shade.addColorStop(0,'#060e2000');shade.addColorStop(1,'#060e205c');c.fillStyle=shade;c.fillRect(0,0,900,H);}
  const halo=c.createRadialGradient(x,y,0,x,y,r*2.2);halo.addColorStop(0,q.color+'38');halo.addColorStop(.5,q.color+'12');halo.addColorStop(1,q.color+'00');c.fillStyle=halo;c.fillRect(x-r*2.2,y-r*2.2,r*4.4,r*4.4);
  if(q.value<500){const flower=bloomTexture(q.color,q.soft);if(flower){c.save();c.translate(x,p.y+12);c.scale(open*(1+release*.15),open*(small?.7:.52));c.globalAlpha*=1-release*.35;c.drawImage(flower,-r*1.45,-r*.77,r*2.9,r*2);c.restore();}}
  if(!small){
   setFxPalette({main:q.color,main2:q.color,soft:q.soft,gold:'#ffe0a0'});
   c.save();c.translate(x,y);c.scale(scale,scale);drawQiInflow(scene,c,qiRemap(phase,impactAt),{x:0,y:0},v.phase);drawQiAura(scene,c,qiRemap(phase,impactAt),{x:0,y:0},65);c.restore();
  }
 }
 // Petals rise from two drifting streams, orbit once, then peel outwards.
 for(let i=0;i<n;i++){
  const seed=(i*.618+v.phase)%1,a=i*2.399+v.phase*TAU+(v.flip?-1:1)*clock*.65,
  enter=ease((phase-seed*.18)/.34),out=ease((phase-.5-seed*.13)/.32),side=i%2?1:-1,
  rad=r*(.6+seed*.7)*(1+out*.9),xx=x+Math.cos(a)*rad*enter+side*(1-enter)*(small?75:240),
  yy=y+Math.sin(a)*rad*.48-(i%4)*r*.14+(1-enter)*(small?65:180)-out*(40+seed*120),
  front=Math.sin(a)>0;
  if(front!==(layer==='front'))continue;
  petal(c,xx,yy,(small?.6:.8+seed*.45)*(1-out*.55),a+clock*(seed-.5),q.color,q.soft,(1-out)*(.55+seed*.4));
 }
 if(q.swords&&q.value<500){
  const releaseSword=ease((phase-.48)/.32);
  for(let i=0;i<q.swords;i++){
   const a=i*TAU/q.swords+v.phase*TAU+(v.flip?-1:1)*clock*.22,front=Math.sin(a)>0;if(front!==(layer==='front'))continue;
   const radius=(r*.9+releaseSword*r*.6)*open,xx=x+Math.cos(a)*radius,yy=y-80+Math.sin(a)*radius*.42-releaseSword*210;
   sword(c,xx,yy,.48+q.size/550,a*.18*(1-releaseSword),open*(1-releaseSword),q.soft,scene.giftSpectacleArt?.formations?.[5]);
  }
 }
 if(layer==='front'&&small){
  const flower=scene.tributeRose||bloomTexture(q.color,q.soft),out=ease((phase-.67)/.3);
  if(flower){c.save();c.globalAlpha*=1-out;c.translate(x+52*(v.flip?-1:1),y-18-out*30);c.rotate(Math.sin(clock*1.5)*.08);c.scale(open*(1-out*.25),open*(1-out*.25));c.drawImage(flower,-r*1.15,-r*1.25,r*2.3,r*2.3);c.restore();}
 }
 if(layer==='front'&&!small){
  // Reuse the breakthrough compression / impact at a localized scale. Never a white screen.
  setFxPalette({main:q.color,main2:q.color,soft:q.soft,gold:'#ffe0a0'});
  const kq=qiRemap(phase,impactAt);c.save();c.translate(x,y);c.scale(scale,scale);
  drawQiCompression(c,kq,{x:0,y:0});drawQiImpact(scene,c,kq,H,{x:0,y:0},60,{flash:false,pillar:false});c.restore();
 }
 c.restore();return true;
}
