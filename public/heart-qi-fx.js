// 17/11 (chủ game): tim vận công không chỉ hiện chữ — tim bay vào người, hóa linh khí, nổi số "+X tu vi".
// Nhẹ: 6 tim (3 khi máy yếu) dán từ sprite cache, 1 quầng gradient, 1 dòng chữ. Chỉ chạy 1,6 s mỗi lần vận công.
import {makeSurface} from './performance.js';
const TAU=Math.PI*2,clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
export const HEART_QI_MS=1600;
let heartSprite;
function sprite(){
  if(heartSprite!==undefined)return heartSprite;
  const s=makeSurface(48,48);heartSprite=s||null;if(!s)return null;
  const c=s.getContext('2d');c.translate(24,25);
  const g=c.createLinearGradient(-14,-18,12,18);g.addColorStop(0,'#fff0f6');g.addColorStop(.35,'#ff8fc4');g.addColorStop(1,'#e2408a');
  c.shadowColor='#ff7fbf';c.shadowBlur=8;
  c.beginPath();c.moveTo(0,17);c.bezierCurveTo(-8,11,-19,0,-17,-9);c.bezierCurveTo(-15,-18,-5,-19,0,-11);c.bezierCurveTo(6,-20,16,-18,17,-9);c.bezierCurveTo(19,0,7,11,0,17);c.closePath();
  c.fillStyle=g;c.fill();c.shadowBlur=0;c.fillStyle='#ffffffb0';c.beginPath();c.ellipse(-8,-9,4,2,-.6,0,TAU);c.fill();
  return s;
}
// Tim từ dưới/hai bên bay vòng vào ngực trong 55% đầu, rồi bùng linh khí + số tu vi nổi lên.
export function heartQiPlan(k,light=false){
  const n=light?3:6,hearts=[];
  for(let i=0;i<n;i++){
    const delay=i*.05,local=clamp((k-delay)/.5),side=i%2?1:-1;
    if(local<=0||local>=1)continue;
    const e=1-(1-local)**2;
    hearts.push({i,side,x:side*(70+i*9)*(1-e)+Math.sin(local*Math.PI)*side*18,y:(95-i*6)*(1-e)-e*8,scale:.62+.4*(1-e),alpha:Math.min(1,local*4)*(1-clamp((local-.82)/.18))});
  }
  const burst=clamp((k-.45)/.25),text=clamp((k-.4)/.6);
  return {hearts,burst:burst>0&&burst<1?Math.sin(burst*Math.PI):0,text,textAlpha:text>0?Math.min(1,text*5)*(1-clamp((text-.75)/.25)):0,textRise:text*42};
}
export function drawHeartQi(c,e,k,p,{light=false}={}){
  const plan=heartQiPlan(k,light),img=sprite(),cx=p.x,cy=p.y-55;
  c.save();
  for(const h of plan.hearts){
    c.globalAlpha=h.alpha;const s=32*h.scale;
    if(img)c.drawImage(img,cx+h.x-s/2,cy+h.y-s/2,s,s);
  }
  if(plan.burst>0){
    const r=26+plan.burst*44,g=c.createRadialGradient(cx,cy,0,cx,cy,r);
    g.addColorStop(0,'#fffbe0e0');g.addColorStop(.35,'#9ff5d0a0');g.addColorStop(1,'#56e0b000');
    c.globalAlpha=plan.burst;c.fillStyle=g;c.beginPath();c.arc(cx,cy,r,0,TAU);c.fill();
    if(!light){c.strokeStyle='#c8ffe8';c.lineWidth=2;c.globalAlpha=plan.burst*.7;c.beginPath();c.arc(cx,cy,r*.9,0,TAU);c.stroke();}
  }
  const q=Number(e.qiGain)||0;
  if(q>0&&plan.textAlpha>0){
    const label='+'+q.toLocaleString('vi-VN')+' tu vi',y=cy-48-plan.textRise;
    c.globalAlpha=plan.textAlpha;c.font='800 17px "Segoe UI",Arial,sans-serif';c.textAlign='center';c.textBaseline='middle';
    c.lineJoin='round';c.lineWidth=4;c.strokeStyle='#000000d0';c.strokeText(label,cx,y);
    c.fillStyle='#ffe58a';c.fillText(label,cx,y);
  }
  c.restore();
}
