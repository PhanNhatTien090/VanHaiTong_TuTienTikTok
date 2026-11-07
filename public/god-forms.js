import {drawRealmPresenceV3} from './realm-presence-v3.js';
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
export function drawGodPresence(scene,c,a,t){return drawRealmPresenceV3(scene,c,a,t);}
export function drawGodAuras(scene,c,t,layer){if((scene.reducePresence??scene.crowded)||layer!=='back')return;for(const a of scene.targets||[])if(godFormFor(a.player,{aura:true}))drawGodPresence(scene,c,a,t);}
