// Xem thử lớp nổ dùng chung (impact-debris.js): đòn đánh boss, tuyệt kỹ, nổ màn chiếu (cut-fx drawBurst), đòn Lôi Đài.
// ?k=hit1|hit3|burst|arena&t=giây → vẽ đứng tại một thời điểm (để chụp). Không chạm LIVE.
import {drawDebris,drawScreenFlash} from './impact-debris.js?v=20261120';
import {drawBurst,PALETTES} from './cut-fx.js';
import {drawElementImpact} from './arena-fx.js';
import {cameraImpulse,scaleImpulse} from './cinematic-feedback.js';
const cv=document.querySelector('#c'),c=cv.getContext('2d'),params=new URLSearchParams(location.search);
const bg=new Image();bg.src='/assets/arena-v1/loi-dai-night.webp';const boss=new Image();boss.src='/assets/abyss-dragon-v1/abyss-dragon.webp';
let kind=params.get('k')||'hit3',start=performance.now();const fixed=params.has('t')?Number(params.get('t')):null;
const scene={motion:true,cameraEnabled:true,shakeLevel:'low',budget:{level:'balanced'}};
for(const b of document.querySelectorAll('[data-k]'))b.onclick=()=>{kind=b.dataset.k;start=performance.now();};
function frame(now,forced=null){const sec=forced??fixed??((now-start)/1000-.3);
 const sev=kind==='hit3'?3:kind==='hit1'?1:2,j=kind.startsWith('hit')?scaleImpulse(cameraImpulse(scene,['minor','medium','major','legendary'][sev],sec*1000,.4,false),2.2):{x:0,y:0};
 c.setTransform(1,0,0,1,0,0);c.fillStyle='#050a12';c.fillRect(0,0,900,1600);c.translate(j.x,j.y);
 if(bg.complete&&bg.naturalWidth)c.drawImage(bg,-20,-20,940,1640);
 const bx=450,by=600;if(boss.complete&&boss.naturalWidth){const w=520,h=w*boss.naturalHeight/boss.naturalWidth;c.drawImage(boss,bx-w/2,by-h*.55,w,h);}
 if(kind==='hit1'||kind==='hit3'){drawDebris(c,bx,by,sec,{floor:by+(120+30*sev)*1.1,seed:7.3,power:sev,color:sev>=3?'#a6d9ff':'#ffb36b',hot:'#fff6d8',scale:1.1*(1.25+.3*sev)});if(sev>=3)drawScreenFlash(c,900,1600,sec);}
 else if(kind==='burst')drawBurst(c,bx,by,sec,PALETTES.crimson,1600,{scale:1,ground:by+260,seed:3});
 else drawElementImpact(c,'fire',bx,by,.55+.45*Math.min(1,sec/1.05),11,{power:2});
 if(fixed==null&&forced==null)requestAnimationFrame(frame);}
window.__render=(k,sec)=>{kind=k;frame(0,sec);};
const go=()=>requestAnimationFrame(frame);let n=0;for(const im of [bg,boss])im.onload=im.onerror=()=>{if(++n===2)go();};
window.__ready=()=>n>=2;
