import {giftSpectacleTier} from './gift-spectacle.js';
const TAU=Math.PI*2;
export const LUXURY_TIERS=Object.freeze([
 {min:199,name:'Vạn Kiếm Khai Thiên',color:'#9beaff',duration:6500},
 {min:999,name:'Thương Long Hộ Chủ',color:'#a2f0d1',duration:7500},
 {min:2999,name:'Long Phượng Trình Tường',color:'#ffcc88',duration:8500},
 {min:9999,name:'Thiên Môn Giáng Thế',color:'#ecd1ff',duration:9500}
]);
export function luxuryTier(e){
 const coins=Number(e.coins),count=Math.max(1,Number(e.count)||1);
 if(!Number.isFinite(coins)||coins<=0)return null;
 const value=coins*count;let tier=null;LUXURY_TIERS.forEach((t,i)=>{if(value>=t.min)tier={...t,level:i+1,value};});const cinematic=giftSpectacleTier(e);return tier&&cinematic?{...tier,name:cinematic.name,duration:cinematic.duration}:tier;
}
export function queueLuxury(queue,event){
 if(queue.some(e=>e.id===event.id))return;
 queue.push(event);queue.sort((a,b)=>(b.luxury?.value||0)-(a.luxury?.value||0));if(queue.length>4)queue.length=4;
}
export function drawLuxuryFx(c,e,t,k,p,H,quality='balanced',formation=null){
 const tier=e.luxury;if(!tier)return;
 const light=quality==='light',fade=Math.min(1,k/.14,(1-k)/.18),rise=1-(1-Math.min(1,k/.36))**3;
 const x=p.x,y=p.y-55,cy=Math.max(H*.30,y-210),color=tier.color;
 c.save();c.globalAlpha=Math.max(0,fade);c.fillStyle=tier.level>=4?'#21153938':'#071e3230';c.fillRect(0,0,900,H);
 // Wide, sparse geometry reads as spectacle without hundreds of particles or blur.
 const g=c.createLinearGradient(x-140,0,x+140,0);g.addColorStop(0,color+'00');g.addColorStop(.5,color+'48');g.addColorStop(1,color+'00');c.fillStyle=g;c.fillRect(x-140,cy-110,280,y-cy+150);
 c.strokeStyle=color;c.lineWidth=2;
 for(let j=0;j<3;j++){c.save();c.translate(x,y+48);c.rotate(Math.sin(t*.0004+j)*.08);c.beginPath();c.ellipse(0,0,(70+j*42)*rise,(20+j*10)*rise,0,0,TAU);c.stroke();c.restore();}
 if(formation){c.save();c.globalAlpha*=.72;c.translate(x,y+85);c.scale(1,.48);c.rotate(t*.00022);const size=(tier.level>=4?580:440)*rise;c.drawImage(formation,-size/2,-size/2,size,size);c.restore();}
 // Sword rain uses a bounded pool of repeated silhouettes; the art carries visual density.
 const rain=light?14:30;c.fillStyle=color;
 for(let i=0;i<rain;i++){const u=(k*2.2+i*.143)%1,xx=450+Math.sin(i*11.3)*330,yy=-100+u*(H*.72+100);c.save();c.translate(xx,yy);c.rotate(-.16);c.globalAlpha=fade*(.35+.5*u);c.fillRect(-1,-35,2,42);c.beginPath();c.moveTo(-3,7);c.lineTo(0,17);c.lineTo(3,7);c.closePath();c.fill();c.fillRect(-5,-20,10,1);c.restore();}
 const n=light?10:20;
 for(let i=0;i<n;i++){
  const a=i*TAU/n+t*.0003,r=(110+35*Math.sin(k*Math.PI))*rise,xx=x+Math.cos(a)*r,yy=y-50+Math.sin(a)*r*.55;
  c.save();c.translate(xx,yy);c.rotate(a+Math.PI*.5);c.fillStyle=i%2?color:'#fff0ba';c.beginPath();c.moveTo(-2,-26);c.lineTo(2,-26);c.lineTo(3,8);c.lineTo(0,18);c.lineTo(-3,8);c.closePath();c.fill();c.fillRect(-8,-17,16,2);c.restore();
 }
 if(tier.level>=2){
  const count=tier.level>=3?2:1;
  for(let side=0;side<count;side++){
   const sign=side?-1:1;c.strokeStyle=side?'#ffbd88':color;c.lineWidth=side?6:9;c.lineCap='round';c.beginPath();
   const steps=light?24:42;let hx=x,hy=cy;
   for(let i=0;i<=steps;i++){const u=i/steps,a=u*TAU*1.25+t*.0007*sign,r=(60+u*130)*rise;hx=x+Math.cos(a)*r*sign;hy=cy+Math.sin(a)*r*.48+u*75;i?c.lineTo(hx,hy):c.moveTo(hx,hy);}c.stroke();
   c.fillStyle=side?'#ffd7a0':'#c6fff0';c.beginPath();c.moveTo(hx-15,hy-10);c.lineTo(hx+10,hy-17);c.lineTo(hx+27,hy-1);c.lineTo(hx+6,hy+10);c.closePath();c.fill();
   c.lineWidth=2;c.beginPath();c.moveTo(hx,hy-11);c.lineTo(hx-6,hy-30);c.moveTo(hx+8,hy-12);c.lineTo(hx+17,hy-29);c.stroke();
   if(side){for(let j=0;j<5;j++){c.beginPath();c.moveTo(hx,hy);c.quadraticCurveTo(hx-70,hy-90-j*10,hx-130+j*18,hy-40+j*17);c.stroke();}}
  }
 }
 if(tier.level>=4){
  c.save();c.translate(x,cy-100);c.scale(rise,rise);c.strokeStyle='#f5deac';c.lineWidth=6;
  for(const side of [-1,1]){c.strokeRect(side*130-9,-110,18,210);c.strokeRect(side*130-20,96,40,12);}
  c.beginPath();c.moveTo(-165,-104);c.quadraticCurveTo(0,-190,165,-104);c.moveTo(-150,-92);c.lineTo(150,-92);c.stroke();
  c.lineWidth=2;for(let i=0;i<5;i++){c.beginPath();c.moveTo(-100+i*50,-85);c.lineTo(-70+i*35,72);c.stroke();}c.restore();
 }
 // A bounded number of rising sparks, no flashing/strobing or camera shake.
 for(let i=0;i<(light?8:18);i++){const u=(k*1.6+i*.137)%1;c.fillStyle=i%2?color:'#ffecb2';c.fillRect(x+Math.sin(i*7.1)*210,y+50-u*400,2,5);}
 c.restore();
}
