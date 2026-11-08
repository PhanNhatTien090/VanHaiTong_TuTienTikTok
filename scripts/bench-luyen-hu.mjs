// So chi phí vẽ Luyện Hư cũ/mới (CPU Node canvas 540×960, 90 khung trải đều). Không phải FPS trình duyệt.
import {createCanvas,loadImage} from '@napi-rs/canvas';
globalThis.document={createElement:()=>createCanvas(1,1)};
const actor=createCanvas(640,760);{const c=actor.getContext('2d');c.fillStyle='#c33';c.fillRect(250,100,140,480);}
const [world,cosmos]=await Promise.all(['jade-palace','cosmos'].map(n=>loadImage('public/assets/worlds-v2/'+n+'.png')));
for(const [label,file] of [['cũ','../public/__old-luyen-hu.js'],['mới','../public/luyen-hu-awakening.js']]){
 const m=await import(file),p={id:'a',realm:5},e={id:'x',user:'a',name:'A',start:0,duration:20800,visualFrom:p,visualTo:{...p,realm:6}};
 const scene={players:[p],motion:true,cameraEnabled:true,budget:{level:'balanced'},luyenHuWorldArt:world,luyenHuVoidArt:cosmos,drawPlayer:(c)=>c.drawImage(actor,130,500)};
 const cv=createCanvas(540,960),c=cv.getContext('2d');c.scale(.6,.6);m.drawLuyenHuAwakening(scene,c,e,0,1600);
 const times=[];for(let i=0;i<90;i++){const t=i/89*20700;const t0=performance.now();c.save();m.drawLuyenHuAwakening(scene,c,e,t,1600);c.restore();times.push(performance.now()-t0);}
 times.sort((a,b)=>a-b);console.log(label,'median',times[45].toFixed(2),'ms · P95',times[85].toFixed(2),'ms');}
