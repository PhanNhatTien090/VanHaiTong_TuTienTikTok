import {specialSkinFor} from './patrons.js';
import {visualGender} from './cosmetics.js';
import {loadSpiritBeasts,drawFlyingDragon} from './gift-spirit-beasts.js';
import {makeSurface} from './performance.js';
export function sliceGodAuraAtlas(im,factory=makeSurface,width=160){
 const frames=[],sw=(im.naturalWidth||im.width)/5,sh=im.naturalHeight||im.height;
 for(let i=0;i<5;i++){const f=factory(width,width*2);if(!f)continue;f.getContext('2d').drawImage(im,i*sw,0,sw,sh,3,3,width-6,width*2-6);frames.push(f);}return frames;
}
function loadGodAuraArt(scene){
 if(scene.godAuraArt||scene.godAuraLoading||scene.godAuraRetryAt>Date.now()||typeof Image==='undefined')return;
 scene.godAuraLoading=true;let im=new Image();im.onload=()=>{scene.godAuraArt=sliceGodAuraAtlas(im,makeSurface,scene.budget?.level==='light'?160:224);scene.godAuraLoading=false;im=null;};
 im.onerror=()=>{scene.godAuraLoading=false;scene.godAuraRetryAt=Date.now()+15000;};im.src='/assets/god-forms-v1/presence-auras-v1.png';
}
export const GOD_FORMS=Object.freeze([
 {name:'Thái Sơ Ngọc Thể',color:'#71ffe0',dragon:0},
 {name:'Cửu Thiên Tinh Thể',color:'#d4a1ff',dragon:1},
 {name:'Hồng Mông Lôi Thể',color:'#72ceff',dragon:1},
 {name:'Xích Diệm Thần Vương',color:'#ffab50',dragon:2},
 {name:'Vạn Giới Nhật Thần',color:'#ffe99a',dragon:2},
 {name:'Thần Tôn Thiên Quang',color:'#94fff0',dragon:0,bodyCell:4,hue:95},
 {name:'Thần Tổ Nguyên Thể',color:'#c9b4ff',dragon:1,bodyCell:2,hue:50},
 {name:'Hồng Mông Chí Tôn',color:'#fff1cf',dragon:2,bodyCell:4,hue:-15}
]);
export function godFormFor(p,{aura=false}={}){
 const rank=Math.trunc(Number(p.realm))-14;if(!Number.isInteger(rank)||p.resident||rank<0||rank>=GOD_FORMS.length)return null;
 if(!aura&&specialSkinFor(p)&&['manual','admin','visitor'].includes(p.skinChoiceSource))return null;
 return {...GOD_FORMS[rank],rank};
}
export function drawGodBody(scene,c,p,pose,t){
 const form=godFormFor(p);if(!form)return false;
 const art=scene.divineArt?.get(6),im=art?.frames[(visualGender(p)==='nu'?5:0)+(form.bodyCell??form.rank)],phase=scene.motion===false?0:t*.003;
 c.save();c.translate(0,(pose.lift||0)+(scene.motion===false?0:Math.sin(phase)*2));c.rotate((pose.lean||0)*.55);
 if(im){if(form.hue)c.filter='hue-rotate('+form.hue+'deg)';const bands=scene.budget?.level==='light'?4:7;
  for(let i=0;i<bands;i++){const wave=scene.motion===false?0:Math.sin(phase+i*.65)*.45;
   c.drawImage(im,0,i*im.height/bands,im.width,im.height/bands,-66+wave,-109+i*150/bands,132,150/bands+.4);}
  c.filter='none';
 }else{
  // An unclothed luminous divine silhouette while its PNG loads; no robe flash.
  c.fillStyle=form.color+'55';c.beginPath();c.ellipse(0,-66,13,24,0,0,Math.PI*2);c.fill();c.beginPath();c.arc(0,-98,8,0,Math.PI*2);c.fill();
  c.fillRect(-13,-42,10,62);c.fillRect(3,-42,10,62);
 }
 // Emissive channels breathe on the torso rather than using an oversized aura.
 c.globalCompositeOperation='screen';c.globalAlpha=.35+(scene.motion===false?.2:(.5+.5*Math.sin(phase+form.rank))*.5);c.strokeStyle=form.color;c.lineWidth=.8;
 for(const side of [-1,1]){c.beginPath();c.moveTo(0,-58);c.lineTo(side*11,-51);c.lineTo(side*7,-40);c.lineTo(side*12,-29);c.stroke();}
 c.beginPath();c.moveTo(0,-58);c.lineTo(0,-24);c.stroke();c.fillStyle=form.color;c.beginPath();c.arc(0,-45,2.2,0,Math.PI*2);c.fill();c.restore();return true;
}
export function godAuraRadius(scene,a){
 const form=godFormFor(a.player,{aura:true});if(!form)return 0;let radius=64+form.rank*4;const s=a.scale||1.6;
 for(const b of scene.targets||[])if(b.id!==a.id&&Math.abs(b.y-a.y)<180*s)radius=Math.min(radius,Math.hypot(b.x-a.x,(b.y-a.y)*.6)*.30/s);
 return Math.max(0,radius);
}
// This lightweight presence is ALWAYS drawn for every visible god, even while
// the more expensive dragon sprites rotate between players or are loading.
export function drawGodPresence(scene,c,a,t){
 const f=godFormFor(a.player,{aura:true});if(!f)return false;
 const phase=scene.motion===false?.7:t*.001,light=scene.budget?.level==='light',r=Math.max(18,Math.min(48,godAuraRadius(scene,a))),pulse=.65+.2*Math.sin(phase*2+f.rank);
 c.save();c.translate(a.x,a.y);c.scale(a.scale||1.6,a.scale||1.6);
 c.beginPath();c.rect(-r-4,-142,(r+4)*2,196);c.clip();
 loadGodAuraArt(scene);const aura=scene.godAuraArt?.[f.rank];
 if(aura){
  const motion=scene.motion!==false,w=Math.min(98,(r+3)*2),h=164+f.rank*4,bands=light?4:7;
  c.globalAlpha=.72+f.rank*.035+(motion?Math.sin(phase*1.6)*.07:0);
  for(let i=0;i<bands;i++){
   const wave=motion?Math.sin(phase*(1.1+f.rank*.1)-i*.85)*w*.018:0;
   c.drawImage(aura,0,i*aura.height/bands,aura.width,aura.height/bands,-w/2+wave,-44-h/2+i*h/bands,w,h/bands+.4);
  }
  c.globalAlpha=.75;c.fillStyle=f.color;
  for(let i=0;i<(light?3:6);i++){const angle=phase*(.45+f.rank*.07)+i*Math.PI*2/(light?3:6),x=Math.cos(angle)*w*.42,y=-44+Math.sin(angle)*h*.41;c.save();c.translate(x,y);c.rotate(angle+Math.PI/4);c.fillRect(-1.4,-1.4,2.8,2.8);c.restore();}
  c.restore();return true;
 }
 c.save();c.translate(0,-35);c.scale((r+2)/60,1);const glow=c.createRadialGradient(0,0,4,0,0,60);glow.addColorStop(0,f.color+'42');glow.addColorStop(1,f.color+'00');c.fillStyle=glow;c.fillRect(-60,-60,120,120);c.restore();
 c.strokeStyle=f.color;c.fillStyle=f.color;c.lineWidth=1.5;c.globalAlpha=pulse;
 // Each rank has a distinct, moving floor seal.
 const points=[3,4,6,8,12,14,16,18][f.rank],spin=phase*(.16+f.rank*.04);
 c.save();c.translate(0,31);c.scale(1,.28);c.rotate(spin);c.beginPath();
 for(let i=0;i<=points;i++){const angle=i/points*Math.PI*2,x=Math.cos(angle)*r*.9,y=Math.sin(angle)*r*.9;i?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();c.restore();
 if(f.rank===0){ // jade qi climbs in two braided rivers
  for(const side of [-1,1]){c.beginPath();for(let i=0;i<=8;i++){const u=i/8,x=side*(r*.65+Math.sin(phase*2-u*7)*5),y=28-u*126;i?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();}
 }else if(f.rank===1){ // stellar orbit with a linked constellation
  c.beginPath();for(let i=0;i<5;i++){const q=phase*.6+i*Math.PI*.4,x=Math.cos(q)*r*.85,y=-43+Math.sin(q)*54;i?c.lineTo(x,y):c.moveTo(x,y);c.fillRect(x-1.5,y-1.5,3,3);}c.stroke();
 }else if(f.rank===2){ // contained lightning crawls along the sides
  for(const side of [-1,1]){c.beginPath();for(let i=0;i<9;i++){const x=side*(r*.65+Math.sin(i*7+Math.floor(phase*8))*(i%2?6:2)),y=-99+i*16;i?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();}
 }else if(f.rank===3){ // rising crimson-gold tongues of flame
  for(let i=0;i<(light?5:8);i++){const u=(phase*.36+i*.19)%1,x=Math.sin(i*3.7)*r*.8,y=32-u*125;c.globalAlpha=(1-u)*pulse;c.beginPath();c.moveTo(x,y+13);c.quadraticCurveTo(x-10,y,x+Math.sin(phase*3+i)*5,y-18);c.quadraticCurveTo(x+10,y,x,y+13);c.fill();}
 }else if(f.rank===5){ // three linked celestial meridians
  for(let i=0;i<3;i++){const a=phase*.4+i*Math.PI/3;c.beginPath();c.ellipse(0,-48,r*.76,48,a,0,Math.PI*2);c.stroke();}
 }else if(f.rank===6){ // paired origin streams with moving knots
  for(const side of [-1,1]){c.beginPath();for(let i=0;i<=20;i++){const u=i/20,x=Math.sin(u*Math.PI*3+phase)*r*.68*side,y=30-u*134;i?c.lineTo(x,y):c.moveTo(x,y);if(i%5===0)c.fillRect(x-1,y-1,2,2);}c.stroke();}
 }else if(f.rank===7){ // axial crown and twelve ordered rays
  for(let i=0;i<12;i++){const a=i*Math.PI/6+phase*.16;c.beginPath();c.moveTo(Math.cos(a)*r*.45,-48+Math.sin(a)*38);c.lineTo(Math.cos(a)*r,-48+Math.sin(a)*73);c.stroke();}c.beginPath();c.ellipse(0,-48,r*.7,61,0,0,Math.PI*2);c.stroke();
 }else{ // solar crown, constant shafts and circling light motes
  for(const side of [-1,1]){c.globalAlpha=.42*pulse;c.lineWidth=3;c.beginPath();c.moveTo(side*r*.7,33);c.lineTo(side*r*.5,-102);c.stroke();}
  c.globalAlpha=pulse;c.lineWidth=1.5;for(let i=0;i<(light?8:12);i++){const q=spin+i*Math.PI*2/(light?8:12);c.beginPath();c.moveTo(Math.cos(q)*17,-84+Math.sin(q)*17);c.lineTo(Math.cos(q)*24,-84+Math.sin(q)*24);c.stroke();}
 }
 const count=light?3:5;c.globalAlpha=pulse;
 for(let i=0;i<count;i++){const u=(phase*(.22+f.rank*.025)+i/count)%1;c.fillRect(Math.sin(i*4.1+phase)*r*.85,30-u*132,1.8,3.6);}
 c.restore();return true;
}
export function drawGodAuras(scene,c,t,layer){
 if(layer==='back')for(const a of scene.targets||[])drawGodPresence(scene,c,a,t);
 const light=scene.budget?.level==='light',eligible=(scene.targets||[]).filter(a=>godFormFor(a.player,{aura:true})).sort((a,b)=>b.player.realm-a.player.realm);
 const cap=light?3:5,selected=eligible.slice(0,cap);if(eligible.length>cap){selected.splice(1);const rest=eligible.slice(1),offset=(scene.motion===false?0:Math.floor(t/8000)*(cap-1))%rest.length;for(let i=0;i<cap-1;i++)selected.push(rest[(offset+i)%rest.length]);}const phase=scene.motion===false?.2:t*.000075;
 for(const [i,a]of selected.entries()){
  const form=godFormFor(a.player,{aura:true}),radius=godAuraRadius(scene,a);if(radius<18)continue;
  loadSpiritBeasts(scene);const orbit=phase*(1+form.rank*.18)+i*.23;
  const front=Math.sin(orbit*Math.PI*3.4+.7)>0;if((layer==='front')!==front)continue;
  c.save();c.translate(a.x,a.y);c.scale(a.scale||1.6,a.scale||1.6);
  drawFlyingDragon(c,scene.spiritBeasts?.dragon,{x:0,y:-48,radius,phase:orbit,time:scene.motion===false?0:t,color:form.dragon,light:true,scale:.65,alpha:.87});
  if(!light&&form.rank===4)drawFlyingDragon(c,scene.spiritBeasts?.dragon,{x:0,y:-48,radius:radius*.8,phase:orbit+.4,time:scene.motion===false?0:t,color:0,side:-1,light:true,scale:.5,alpha:.65});
  c.restore();
 }
}
