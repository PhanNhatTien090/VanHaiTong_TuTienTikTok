// Bộ khung chung cho nghi thức đột phá realm 14–21 (15/11/2026). Mỗi cảnh giới chỉ viết phần motif riêng (sky/back/front/over);
// khung lo: nền + ảnh, rung theo cú nhấn, camera, đá nền, hào quang chung, nhân vật (model LIVE gốc), nổ, tối + nhịp tim, chữ HUD.
import {drawScreenPulse} from './cinematic-feedback.js';
import {makeSurface} from './performance.js';
import {setFxPalette,qiVariant,qiRemap,pushFxCamera,drawQiCompression,drawQiImpact,drawQiAura,drawQiMotes} from './qi-impact.js';
import {maThanActorImage} from './ma-than-awakening.js';
import {ensureRealmSkinV2} from './realm-skins-v2.js';

export const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);},mix=(a,b,u)=>a+(b-a)*u;
export const back=x=>{x=clamp(x);const s=1.6;return 1+(s+1)*(x-1)**3+s*(x-1)**2;};
export const rnd=i=>{const v=Math.sin(i*127.7+71.3)*43758.5453;return v-Math.floor(v);};
export const pulse=(age,len)=>age>=0&&age<len?Math.exp(-age/len*5):0;
export function surface(w,h,draw){const s=makeSurface(Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));if(s)draw(s.getContext('2d'));return s;}
export function glowSprite(inner,mid,outer){return surface(128,128,c=>{const g=c.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,inner);g.addColorStop(.22,mid);g.addColorStop(1,outer);c.fillStyle=g;c.fillRect(0,0,128,128);});}
export function halo(c,im,x,y,w,h,a){if(!im||a<=.01)return;c.save();c.globalAlpha*=clamp(a);c.globalCompositeOperation='lighter';c.drawImage(im,x-w/2,y-h/2,w,h);c.restore();}
export function ring(c,x,y,r,col,w,a,ry=r,rot=0){if(a<=.01||r<1)return;c.save();c.globalCompositeOperation='lighter';c.globalAlpha=clamp(a);c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.ellipse(x,y,r,ry,rot,0,TAU);c.stroke();c.restore();}
const images=new Map();
export function art(src){if(!src||typeof Image==='undefined')return null;if(!images.has(src)){const im=new Image();im.decoding='async';im.src=src;images.set(src,im);}const im=images.get(src);return im.complete&&im.naturalWidth?im:null;}
export function hitPower(hits,T){let p=0;for(const [a,f] of hits){const age=T-a;if(age>=0&&age<.5)p=Math.max(p,Math.exp(-age*9)*f);}return p;}
// bóng pháp thân/hồn từ ảnh nhân vật thật (alpha³ + phủ màu + mờ chân)
export function ghostOf(im,color,alpha=.78){if(!im)return null;im._ghosts??=new Map();const key=color+alpha;if(im._ghosts.has(key))return im._ghosts.get(key);
 const g=surface(im.width,im.height,c=>{c.drawImage(im,0,0);c.globalCompositeOperation='destination-in';c.drawImage(c.canvas,0,0);c.drawImage(c.canvas,0,0);c.globalCompositeOperation='source-atop';c.fillStyle=color;c.globalAlpha=alpha;c.fillRect(0,0,im.width,im.height);
  c.globalCompositeOperation='destination-in';c.globalAlpha=1;const f=c.createLinearGradient(0,im.height*.55,0,im.height);f.addColorStop(0,'#000');f.addColorStop(1,'#0000');c.fillStyle=f;c.fillRect(0,0,im.width,im.height);});
 im._ghosts.set(key,g);return g;}
function baseAssets(scene,spec,H){scene.divineKit??={};const key=spec.realm+':'+H;if(scene.divineKit[key])return scene.divineKit[key];const [c0,c1,c2]=spec.sky;
 const deep=surface(450,H/2,c=>{c.scale(.5,.5);const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,c0);g.addColorStop(.48,c1);g.addColorStop(1,c2);c.fillStyle=g;c.fillRect(0,0,900,H);
  for(let i=0;i<260;i++){c.globalAlpha=.2+rnd(i+40+spec.realm)*.6;c.fillStyle=i%5?'#f4f0ff':spec.color;const r=rnd(i+90)*1.7+.4;c.fillRect(rnd(i+spec.realm*7)*900,rnd(i+400)*H*.62,r,r);}});
 const vignette=surface(450,H/2,c=>{c.scale(.5,.5);const g=c.createRadialGradient(450,H*.52,180,450,H*.52,H*.74);g.addColorStop(0,'#00000000');g.addColorStop(.6,'#00000000');g.addColorStop(1,'#000000e0');c.fillStyle=g;c.fillRect(0,0,900,H);});
 const ground=surface(900,320,c=>{c.translate(450,70);c.beginPath();c.moveTo(-300,0);c.bezierCurveTo(-230,-30,230,-30,300,0);
  const under=[[255,32],[208,66],[150,94],[92,146],[24,188],[-36,160],[-96,126],[-160,88],[-226,54],[-282,22]];for(const [x,y] of under)c.lineTo(x,y+(rnd(x+spec.realm)-.5)*12);c.closePath();
  const g=c.createLinearGradient(0,-30,0,190);g.addColorStop(0,spec.groundTop||'#4a4458');g.addColorStop(.25,'#16141e');g.addColorStop(1,'#050408');c.fillStyle=g;c.fill();c.strokeStyle=spec.color;c.globalAlpha=.7;c.lineWidth=2;c.stroke();
  c.save();c.scale(1,.24);c.globalAlpha=.45;c.strokeStyle=spec.color;c.lineWidth=2.5;for(let r=100;r<=240;r+=70){c.beginPath();c.arc(0,-40,r,0,TAU);c.stroke();}c.restore();});
 const out={deep,vignette,ground,glow:glowSprite('#ffffff',spec.glowMid||'#fff0d8c0',spec.color+'00'),warm:glowSprite('#ffffff','#ffe9c0c0','#ffc46a00')};scene.divineKit[key]=out;return out;}
const snapshots=new WeakMap();
function players(scene,e,realm){if(snapshots.has(e))return snapshots.get(e);const live=scene.playerIndex?.get(e.user)||scene.players?.find(p=>p.id===e.user)||{id:e.user,name:e.name,giftCoins:0};const pair={from:structuredClone(e.visualFrom||{...live,realm:realm-1}),to:structuredClone(e.visualTo||{...live,realm})};snapshots.set(e,pair);return pair;}
function bigBang(c,a,s,spec,T,light){const age=T-spec.impact;if(age<0||age>3.4)return;const n=light?50:120;c.save();c.globalCompositeOperation='lighter';
 for(let i=0;i<n;i++){const ang=rnd(i+70)*TAU,sp=300+rnd(i)*900,d=age*sp,x=450+Math.cos(ang)*d,y=s.belly+Math.sin(ang)*d,tail=Math.min(d,40+sp*.08);c.globalAlpha=clamp(1-age/3.4);c.strokeStyle=i%4===0?'#ffffff':i%2?spec.color:spec.accent;c.lineWidth=1.5+rnd(i+3)*2;c.beginPath();c.moveTo(x,y);c.lineTo(x-Math.cos(ang)*tail,y-Math.sin(ang)*tail);c.stroke();}c.restore();
 for(let i=0;i<10;i++){const u=clamp((age-i*.07)/1.8);if(u<=0||u>=1)continue;const r=60+ease(u)*1250;ring(c,450,s.belly,r,i%3===0?'#ffffff':i%2?spec.accent:spec.color,16*(1-u)+2,(1-u)*.9,r*.5);}
 halo(c,a.glow,450,s.belly,1500,1500,s.bang*.85);}
// spec: {realm,duration,impact,reveal,fade,title,subtitle,color,accent,sky:[3 màu],bg,bgAlpha,beats,hits,palette}
// layers: {assets(scene,H), sky(c,s), back(c,s), front(c,s), over(c,s)} — mọi hàm nhận s (trạng thái) đã có T, a (asset chung), x (asset riêng).
export function drawDivineRitual(scene,c,e,t,H,spec,layers){
 const k=clamp((t-e.start)/e.duration),T=k*spec.duration,feet=H*.73,motion=scene.motion!==false,v=qiVariant(e),light=scene.budget?.level==='light';
 const a=baseAssets(scene,spec,H),x=layers.assets?layers.assets(scene,H):null;
 const s={k,T,H,motion,clock:motion?T:0,feet,belly:feet-145,head:feet-338,dir:v.flip?-1:1,light,a,x,
  revealed:T>=spec.reveal,after:ease((T-spec.reveal)/1.3),fade:1-ease((T-spec.fade)/1.4),
  dark:ease((T-(spec.impact-.65))/.35)*(1-ease((T-spec.impact)/.12)),bang:pulse(T-spec.impact,1),hit:hitPower(spec.hits,T)*(motion?1:.3),reduceFlash:scene.reduceFlash};
 const kq=qiRemap(k,spec.impact/spec.duration),origin={x:450,y:s.belly};
 const {from,to}=players(scene,e,spec.realm),p=s.revealed?to:from;
 // Thần trang realm 14+ tải lười: tải sẵn trang phục mới từ đầu cảnh, và dựng lại ảnh nhân vật vài lần sau hiện thân
 // (bộ đệm chụp lúc ảnh chưa về sẽ thành hình nộm).
 const warm=e._divineWarm??={};if(!warm.to){warm.to=true;for(const q of [from,to])try{ensureRealmSkinV2(scene,q);const pad=surface(8,8,()=>{});if(pad)scene.drawPlayer?.(pad.getContext('2d'),q,4,8,0);}catch{}}
 for(const mark of [.4,1.5,3]){if(T>=mark&&!warm['f'+mark]&&!s.revealed){warm['f'+mark]=true;scene.maThanActor?.frames?.delete(from);}if(s.revealed&&T>=spec.reveal+mark&&!warm['r'+mark]){warm['r'+mark]=true;scene.maThanActor?.frames?.delete(to);}}
 const image=maThanActorImage(scene,p,e);s.image=image;
 c.save();setFxPalette(spec.palette);
 c.fillStyle=spec.sky[0];c.fillRect(0,0,900,H);if(a.deep)c.drawImage(a.deep,0,0,900,H);
 const bg=art(spec.bg);if(bg){c.save();const slide=motion?Math.sin(s.clock*.1)*14:0;c.globalAlpha=(spec.bgAlpha||.6)*mix(.6,1,ease(T/4));c.drawImage(bg,-30+slide,-30,960,H+60);c.restore();}
 layers.sky?.(c,s);
 drawScreenPulse(c,H,scene.reduceFlash,spec.color,s.hit*.06);
 pushFxCamera(scene,c,kq,v,feet);
 const shake=motion&&scene.cameraEnabled!==false?s.hit*15+s.bang*18:0;c.translate(Math.sin(T*79)*shake,Math.cos(T*67)*shake*.6);
 layers.back?.(c,s);
 if(a.ground&&!(T>=spec.impact&&T<spec.reveal+1)){c.save();c.globalAlpha=T>=spec.impact?ease((T-spec.reveal-.2)/1):1;c.drawImage(a.ground,0,feet-70,900,320);c.restore();}
 layers.ground?.(c,s);
 drawQiAura(scene,c,kq,origin,feet);drawQiImpact(scene,c,kq,H,origin,feet);
 bigBang(c,a,s,spec,T,light);
 if(image){c.save();c.globalAlpha=clamp(T/.15);c.drawImage(image,130,feet-590);c.restore();}else scene.drawPlayer?.(c,p,450,feet,0);
 layers.front?.(c,s);
 if(T>=spec.impact-.65&&T<spec.impact){ring(c,450,s.belly,14,spec.accent,3,.9);halo(c,a.glow,450,s.belly,90,90,.8);}
 if(s.revealed){const kk=s.after*s.fade;ring(c,450,s.belly,16,spec.accent,2,kk*.9,6);}
 drawQiCompression(c,kq,origin);
 c.restore();
 layers.over?.(c,s);
 if(s.dark>0){c.save();c.globalAlpha=s.dark*.88;c.fillStyle='#000';c.fillRect(0,0,900,H);c.restore();const beat=Math.max(pulse(T-spec.impact+.55,.25),pulse(T-spec.impact+.27,.25));ring(c,450,s.belly,14+beat*34,spec.accent,2+beat*3,s.dark*(.5+beat*.5));halo(c,a.glow,450,s.belly,60,60,s.dark);}
 drawScreenPulse(c,H,scene.reduceFlash,'#fffaf2',s.bang*.34);
 drawQiMotes(scene,c,kq,H);
 if(a.vignette)c.drawImage(a.vignette,0,0,900,H);
 c.restore();
 const b=Math.max(0,spec.beats.findLastIndex(([at])=>at<=T));
 const ui={k,realm:spec.realm,phase:s.revealed?'reveal':'gather',revealed:s.revealed,color:spec.color,title:spec.title,subtitle:spec.subtitle,name:String(e.name||'Đạo hữu').normalize('NFC'),label:spec.beats[b][1],detail:'',shake};
 if(scene.onRitualFrame)scene.onRitualFrame(ui);else{c.save();c.textAlign='center';c.font='600 26px Arial';c.fillStyle='#fffaf2';c.fillText(ui.name,450,H*.05);c.font='700 34px Arial';c.fillText(s.revealed?ui.title.toUpperCase():ui.label,450,H*.09);c.restore();}
 return ui;
}
// mật độ cú nhấn: khoảng trống lớn nhất trước nổ (dùng trong test)
export function maxHitGap(hits,impact){const at=hits.map(([a])=>a).filter(a=>a<=impact).sort((p,q)=>p-q);let g=0;for(let i=1;i<at.length;i++)g=Math.max(g,at[i]-at[i-1]);return g;}
