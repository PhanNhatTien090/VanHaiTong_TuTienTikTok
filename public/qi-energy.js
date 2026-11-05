// Deterministic ground seal, rising mist and inward spiritual currents.
import {makeSurface} from './performance.js';
const TAU=Math.PI*2,clamp=v=>Math.max(0,Math.min(1,v)),ease=v=>{v=clamp(v);return v*v*(3-2*v);};
export function qiEnergyState(k,motion=true){
 const intake=ease((k-.22)/.19)*(1-ease((k-.85)/.03));
 const charge=ease((k-.55)/.32)*(1-ease((k-.88)/.07));
 const compression=ease((k-.85)/.025)*(1-ease((k-.88)/.008));
 const burst=k<.88?0:Math.exp(-(k-.885)*48)*ease((k-.88)/.005);
 return {intake,charge,compression,burst:Math.min(1,burst)*(motion?1:.35),wave:ease((k-.88)/.10),flow:motion?k*6+ease((k-.73)/.15)*1.3:0};
}
export function qiStreamPoint(k,index,u,origin,motion=true){
 const collapse=ease((k-.80)/.08),r=(1-u)**1.1*(390+index%3*22)*(1-collapse*.95);
 const phase=motion?k*1.6:0,a=index*TAU/6+u*TAU*.8+phase;
 const curl=Math.sin(u*TAU*2.5+index*1.7+phase*3)*(1-u)*38;
 return {x:origin.x+Math.cos(a)*r+curl,y:origin.y+Math.sin(a)*r*.63-(1-u)*(90+index%3*70),z:Math.sin(a)};
}
function seal(c){
 c.lineWidth=2;
 for(const [r,color]of [[345,'#d8c58d'],[330,'#67d9c5'],[279,'#709f94'],[250,'#89ffe1'],[169,'#d8c58d']]){c.strokeStyle=color;c.beginPath();c.arc(0,0,r,0,TAU);c.stroke();}
 for(let i=0;i<12;i++){
  c.save();c.rotate(i*TAU/12);c.strokeStyle=i%3?'#8ce9ce':'#f4dfa3';
  // Geometric seal marks, no textual labels.
  c.beginPath();c.moveTo(-10,-292);c.lineTo(0,-316);c.lineTo(10,-292);c.lineTo(0,-300);c.closePath();c.moveTo(-13,-284);c.lineTo(13,-284);c.stroke();
  c.beginPath();c.arc(0,0,264,-Math.PI/2-.09,-Math.PI/2+.09);c.stroke();
  for(let j=0;j<4;j++){c.beginPath();c.moveTo(-2+j*5,-335);c.lineTo(-2+j*5,-341);c.stroke();}c.restore();
 }
 c.strokeStyle='#8cdac4';c.lineWidth=1.5;
 for(let offset=0;offset<2;offset++){c.beginPath();for(let i=0;i<3;i++){const a=-Math.PI/2+(i*2+offset)*TAU/6;const x=Math.cos(a)*238,y=Math.sin(a)*238;i?c.lineTo(x,y):c.moveTo(x,y);}c.closePath();c.stroke();}
 for(let i=0;i<8;i++){c.save();c.rotate(i*TAU/8);c.beginPath();c.ellipse(0,-85,29,73,0,0,TAU);c.stroke();c.restore();}
}
export function drawQiGround(scene,c,k,s){
 const e=qiEnergyState(k,scene.motion!==false),open=ease((k-.025)/.21),fade=1-ease((k-.94)/.06);if(!open||!fade)return;
 const light=scene.budget?.level==='light',clock=scene.motion===false?0:k,level=open*fade;
 c.save();c.globalCompositeOperation='screen';const x=s.origin.x,y=s.feet+38;
 c.save();c.translate(x,y);c.scale(1,.30);const glow=c.createRadialGradient(0,0,20,0,0,440);glow.addColorStop(0,'#6effce60');glow.addColorStop(.6,'#42c5a72a');glow.addColorStop(1,'#318c8b00');c.globalAlpha=Math.min(1,level*(.65+e.charge*.5+e.burst));c.fillStyle=glow;c.fillRect(-440,-440,880,880);
 c.rotate(clock*.55);c.globalAlpha=Math.min(1,level*(.50+e.charge*.4+e.burst*.35));
 let plate=scene.qiGroundSeal;
 if(!plate){plate=makeSurface(760,760);if(plate){const p=plate.getContext('2d');p.translate(380,380);seal(p);scene.qiGroundSeal=plate;}}
 if(plate)c.drawImage(plate,-380,-380);else seal(c);c.restore();
 // Low, wide mist gives the floor depth.
 for(let i=0;i<(light?3:6);i++){const a=i*2.399+clock*.4,px=x+Math.cos(a)*(170+i*18),py=y+Math.sin(a)*35-15,r=85+i%3*25;c.save();c.translate(px,py);c.scale(1,.35);const fog=c.createRadialGradient(0,0,0,0,0,r);fog.addColorStop(0,'#85e5c638');fog.addColorStop(1,'#438d8c00');c.globalAlpha=level*(.6+e.intake*.4);c.fillStyle=fog;c.fillRect(-r,-r,r*2,r*2);c.restore();}
 for(let i=0;i<(light?8:18);i++){
  const u=(clock*2.5+i*.618)%1,a=i*2.399,base=x+Math.cos(a)*(190+i%4*25),height=80+u*200,px=base+(x-base)*u*u,py=y-height;
  c.globalAlpha=level*e.intake*Math.sin(u*Math.PI)*.75;c.strokeStyle=i%4?'#83f4d3':'#ffe7ae';c.lineWidth=i%3?1.1:2.5;c.beginPath();c.moveTo(px,py);c.quadraticCurveTo(px+Math.sin(a+clock*6)*12,py+18,px-(x-base)*.04,py+35);c.stroke();
 }c.restore();
}
function strokePath(c,points,layer,width,color,alpha){
 c.lineWidth=width;c.strokeStyle=color;c.globalAlpha=alpha;c.beginPath();let joined=false;
 for(const p of points){if((p.z<0?'back':'front')!==layer){joined=false;continue;}if(joined)c.lineTo(p.x,p.y);else c.moveTo(p.x,p.y);joined=true;}c.stroke();
}
function fillRibbon(c,points,layer,color,alpha){
 c.fillStyle=color;c.globalAlpha=alpha;let left=[],right=[];
 const flush=()=>{if(left.length>1){c.beginPath();left.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));for(let i=right.length-1;i>=0;i--)c.lineTo(right[i].x,right[i].y);c.closePath();c.fill();}left=[];right=[];};
 for(let j=0;j<points.length;j++){
  const p=points[j];if((p.z<0?'back':'front')!==layer){flush();continue;}
  const a=points[Math.max(0,j-1)],b=points[Math.min(points.length-1,j+1)],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,w=Math.sin(j/(points.length-1)*Math.PI)*7;
  left.push({x:p.x-dy/len*w,y:p.y+dx/len*w});right.push({x:p.x+dy/len*w,y:p.y-dx/len*w});
 }flush();
}
export function drawQiStreams(scene,c,k,s,layer){
 const e=qiEnergyState(k,scene.motion!==false);if(e.intake<=0)return;
 const light=scene.budget?.level==='light',n=light?3:6,steps=light?16:26,motion=scene.motion!==false;
 c.save();c.globalCompositeOperation='screen';c.lineCap='round';c.lineJoin='round';
 for(let i=0;i<n;i++){
  const id=light?i*2:i,color=i%3===0?'#fae4af':i%2?'#a1eaff':'#67ffc9';
  // Moving packets with long soft wakes, rather than static luminous hoops.
  for(let packet=0;packet<2;packet++){
   const head=(e.flow*.74+i*.173+packet*.5)%1,start=Math.max(0,head-.30),points=[];
   for(let j=0;j<=steps;j++){const u=start+(head-start)*j/steps;points.push(qiStreamPoint(k,id,u,s.origin,motion));}
   const alpha=e.intake*Math.sin(head*Math.PI);
   // Tapered translucent ribbons make the current read as a volume of qi.
   fillRibbon(c,points,layer,color,alpha*.13);
   strokePath(c,points,layer,18,color,alpha*.02);strokePath(c,points,layer,7,color,alpha*.06);strokePath(c,points,layer,2.2,color,alpha*.55);
   strokePath(c,points.slice(Math.floor(steps*.60)),layer,1.4,'#edfff8',alpha*.95);
   const p=points.at(-1);if((p.z<0?'back':'front')===layer){c.globalAlpha=alpha*.9;c.fillStyle='#eafff4';c.beginPath();c.ellipse(p.x,p.y,3.1,2.2,0,0,TAU);c.fill();}
   if(!light){const strand=points.map((p,j)=>({...p,x:p.x+Math.sin(j*.6+i)*5,y:p.y+Math.cos(j*.47+i)*4}));strokePath(c,strand,layer,1,color,alpha*.4);}
  }
  for(let j=0;j<(light?4:9);j++){
   const u=(e.flow*.9+j*.127+i*.13)%1,p=qiStreamPoint(k,id,u,s.origin,motion);if((p.z<0?'back':'front')!==layer)continue;
   c.globalAlpha=e.intake*Math.sin(u*Math.PI)*.7;c.fillStyle=color;c.fillRect(p.x+Math.sin(j*7)*10,p.y+Math.cos(j*5)*9,1.5+j%2,1.5+j%2);
  }
 }c.restore();
}
export function drawQiBurst(c,k,s,motion=true){
 const e=qiEnergyState(k,motion),x=s.origin.x,y=s.origin.y;
 c.save();c.globalCompositeOperation='screen';
 if(e.charge>0){const r=65+e.charge*85,g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'#e7fff5c0');g.addColorStop(.3,'#63ffc878');g.addColorStop(1,'#41ffc000');c.globalAlpha=e.charge*.7;c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
 if(e.burst>0){const r=240+e.wave*500,g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'#ffffff');g.addColorStop(.15,'#eafff5e0');g.addColorStop(.4,'#94ffdb85');g.addColorStop(1,'#65eec400');c.globalAlpha=e.burst*.95;c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);
  for(let i=0;i<22;i++){const a=i*2.399,r0=80+e.wave*150,r1=r0+70+(i%4)*28;c.strokeStyle=i%4?'#b9ffe6':'#ffe5a2';c.globalAlpha=e.burst*.65;c.lineWidth=i%3?1:2.5;c.beginPath();c.moveTo(x+Math.cos(a)*r0,y+Math.sin(a)*r0*.8);c.lineTo(x+Math.cos(a)*r1,y+Math.sin(a)*r1*.8);c.stroke();}
 }
 if(k>=.88&&k<.99){for(let i=0;i<2;i++){const u=ease((k-.88-i*.012)/(.10-i*.012)),r=60+u*570;c.globalAlpha=(1-u)*.65*(i?.35:1)*(motion?1:.35);c.strokeStyle=i?'#eddaa5':'#c4ffeb';c.lineWidth=2+7*(1-u);c.beginPath();c.ellipse(x,y,r,r*.7,0,0,TAU);c.stroke();}}
 c.restore();return e;
}
