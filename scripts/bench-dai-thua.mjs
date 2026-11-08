// So chi phí vẽ Đại Thừa cũ/mới (CPU Node canvas 540×960, 90 khung trải đều). Không phải FPS trình duyệt.
import {createCanvas,loadImage} from '@napi-rs/canvas';
globalThis.document={createElement:()=>createCanvas(1,1)};
const actor=createCanvas(640,760);{const c=actor.getContext('2d');c.fillStyle='#c33';c.fillRect(250,100,140,480);}
const valley=await loadImage('public/assets/dai-thua-v2/sword-valley.png'),{sliceRitualSwords}=await import('../public/dai-thua-awakening.js'),swords=sliceRitualSwords(await loadImage('public/assets/events-v1/prestige-swords-v1.png'),createCanvas);
for(const [label,file] of [['cũ','../public/__old-dai-thua.js'],['mới','../public/dai-thua-awakening.js']]){
 const m=await import(file),p={id:'a',realm:6},e={id:'x',user:'a',name:'A',start:0,duration:22800,visualFrom:p,visualTo:{...p,realm:7}};
 const scene={players:[p],motion:true,cameraEnabled:true,budget:{level:'balanced'},daiThuaWorldArt:valley,ritualSwords:swords,drawPlayer:(c)=>c.drawImage(actor,130,500)};
 const cv=createCanvas(540,960),c=cv.getContext('2d');c.scale(.6,.6);m.drawDaiThuaAwakening(scene,c,e,0,1600);
 const times=[];for(let i=0;i<90;i++){const t=i/89*22700;const t0=performance.now();c.save();m.drawDaiThuaAwakening(scene,c,e,t,1600);c.restore();times.push(performance.now()-t0);}
 times.sort((a,b)=>a-b);console.log(label,'median',times[45].toFixed(2),'ms · P95',times[85].toFixed(2),'ms');}
