// Video demo Tần Mục Hỏa Thần (offline): node scripts/render-viem-video.mjs <thư mục khung>
import fs from 'node:fs';import {createCanvas,loadImage} from '@napi-rs/canvas';
const R=process.cwd().split(String.fromCharCode(92)).join('/')+'/';
const {drawViemBody,drawViemAdornment,viemBurst,recolorToFire,fitFrame,VIEM_SKIN,VIEM_BLADES}=await import('file:///'+R+'public/viem-ton.js');
const {sliceTudoSkin}=await import('file:///'+R+'public/tudo-ma-ton.js');const {drawTransform,TRANSFORM_MS,REVEAL_AT}=await import('file:///'+R+'public/transform-fx.js');
const seat=await loadImage(R+'public/assets/viem-ton-v1/seat.png'),st=fitFrame(await loadImage(R+'public/assets/viem-ton-v1/stand.png'),createCanvas),skin=[st,st,seat,seat],bg=await loadImage(R+'public/assets/worlds-v2/jade-palace.png');
const scene={motion:true,budget:{level:'balanced'},viemSkinArt:skin,surfaceFactory:(w,h)=>createCanvas(w,h)};
const out=process.argv[2],FPS=24,DUR=22;const cv=createCanvas(540,960),c=cv.getContext('2d');
const seedOf=id=>{let h=2166136261;for(const ch of String(id))h=Math.imul(h^ch.codePointAt(0),16777619);return (h>>>0)%100000;};
const id='preview-viem',seed=seedOf(id);let tb=0;for(let t=5000;t<40000;t+=10)if(viemBurst(t,seed).burst>.05){tb=t;break;}const T0=tb-3500;
for(let f=0;f<FPS*DUR;f++){const s=f/FPS,t=T0+s*1000;
 // 0–8 s nam đứng, 8–11 màn giáng thế (nữ), 11–16 nữ đứng, 16–22 nam ngồi
 const seg=s<8?0:s<11?1:s<16?2:3,p={id,gender:'nam',skinChoice:VIEM_SKIN,rewardSkins:[VIEM_SKIN],equipped:VIEM_BLADES},stand=seg===3?0:1;
 c.setTransform(.6,0,0,.6,0,0);c.drawImage(bg,0,0,900,1600);c.fillStyle='#14040233';c.fillRect(0,0,900,1600);
 const k=seg===1?(s-8)/(TRANSFORM_MS/1000):-1,show=k<0||k>REVEAL_AT,pos={x:450,y:1210,scale:6.4},ev={transform:'viemton'};
 if(k>=0)drawTransform(c,ev,t,k,pos,1600,'back');const target={id,player:p,x:450,y:1210,scale:6.4,pose:{stand}};
 if(show){drawViemAdornment(scene,c,target,t,'back');c.save();c.translate(450,1210);c.scale(6.4,6.4);drawViemBody(scene,c,p,{stand},t);c.restore();drawViemAdornment(scene,c,target,t,'front');}
 if(k>=0)drawTransform(c,ev,t,k,pos,1600,'front');
 c.textAlign='center';c.fillStyle='#ffe6cc';c.font='bold 36px Arial';c.fillText('TẦN MỤC HỎA THẦN',450,140);c.font='22px Arial';c.fillText('DEMO · ảnh thật · 500c có Song Đao Liệt Diễm',450,185);
 fs.writeFileSync(`${out}/f${String(f).padStart(4,'0')}.png`,cv.toBuffer('image/png'));}
console.log('frames',FPS*DUR,'burst at',(tb-T0)/1000);
