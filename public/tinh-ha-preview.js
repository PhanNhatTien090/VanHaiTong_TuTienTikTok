// 19/11: xem thử skin cao cấp (Tinh Hà / Nhân Quả / Hắc Kim) trên cùng nền để so sánh.
// ?skin=tinh-ha|nhan-qua|hac-kim &mode=idle|reveal &k=0..1 &t=ms &pose=stand|seat &light=1 &map=url
import {drawTinhHaAura,drawTinhHaGear,drawTinhHaReveal} from './tinh-ha-fx.js?v=20261119';
import {drawKarmaAura,drawKarmaGear,drawKarmaReveal} from './karma-fx.js?v=karma-halo-v5';
import {drawBlackGoldAura,drawBlackGoldGear,drawBlackGoldReveal} from './black-gold-fx.js';
import {TINH_HA_VISITOR,KARMA_VISITOR,BLACK_GOLD_VISITOR} from './court-rewards.js';
const q=new URLSearchParams(location.search),mode=q.get('mode')||'idle',stand=q.get('pose')==='seat'?0:1,skin=q.get('skin')||'tinh-ha';
const SK={'tinh-ha':[TINH_HA_VISITOR,drawTinhHaAura,drawTinhHaGear,drawTinhHaReveal,.45],'nhan-qua':[KARMA_VISITOR,drawKarmaAura,drawKarmaGear,drawKarmaReveal,.45],'hac-kim':[BLACK_GOLD_VISITOR,drawBlackGoldAura,drawBlackGoldGear,drawBlackGoldReveal,.45]};
const [V,aura,gear,rev,REV]=SK[skin];
const load=src=>new Promise(r=>{if(!src)return r(null);const i=new Image();i.onload=()=>r(i);i.onerror=()=>r(null);i.src=src;});
const a=V.artwork||{};
const [bg,seated,standing,blade,halo]=await Promise.all([load(q.get('map')||'/assets/thien-khuyet/map.webp'),load(a.seated||'/assets/thien-khuyet/'+V.kind+'-seated.webp'),load(a.standing||'/assets/thien-khuyet/'+V.kind+'-standing.webp'),load(a.blade),load(a.halo)]);
const art={blade,halo},c=document.getElementById('c'),x=c.getContext('2d'),H=1600,target={x:450,y:1180,scale:4.6};
function body(){const img=stand?standing:seated;if(!img)return;const h=stand?125:91,w=h*img.naturalWidth/img.naturalHeight;x.save();x.translate(target.x,target.y);x.scale(target.scale,target.scale);x.drawImage(img,-w/2,25-h,w,h);x.restore();}
function frame(t,k){
 x.clearRect(0,0,900,H);if(bg){const s=Math.max(900/bg.naturalWidth,H/bg.naturalHeight);x.drawImage(bg,(900-bg.naturalWidth*s)/2,(H-bg.naturalHeight*s)/2,bg.naturalWidth*s,bg.naturalHeight*s);}
 const pose={stand},light=q.get('light')==='1';
 if(mode==='reveal'){rev(x,t,k,target,'back',REV,art,{pose,light,seed:q.get('seed')||'demo'});if(k>=REV)body();rev(x,t,k,target,'front',REV,art,{pose,light,seed:q.get('seed')||'demo'});}
 else{x.save();x.translate(target.x,target.y);x.scale(target.scale,target.scale);aura(x,t,stand,'back',{light});gear(x,art,t,pose,'back',{light});x.restore();
  body();x.save();x.translate(target.x,target.y);x.scale(target.scale,target.scale);gear(x,art,t,pose,'front',{light});aura(x,t,stand,'front',{light});x.restore();}
}
const fixedK=q.has('k')?Number(q.get('k')):null,fixedT=q.has('t')?Number(q.get('t')):null;
if(fixedK!==null||fixedT!==null){frame(fixedT??4000,fixedK??0);document.title='ready';}
else{const start=performance.now();const loop=now=>{const k=((now-start)%10000)/9000;frame(now,Math.min(k,1));requestAnimationFrame(loop);};requestAnimationFrame(loop);}
