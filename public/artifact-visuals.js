import {drawEventRelic} from './event-artifacts.js';
// Small code-drawn relics are sampled in the existing character bitmap cache.
export function drawRelic(c,id,t,motion=true){
 const kind=id==='vip-dragon-orb'?'orb':id==='vip-heaven-seal'?'seal':id==='spirit-vase'?'vase':id==='soul-bell'||id==='bell'||id==='tiger-bell'?'bell':id==='cosmic-cauldron'?'cauldron':null;
 if(!kind)return drawEventRelic(c,id,t,motion);
 const a=motion?t*.001:0,x=Math.cos(a)*32,y=-18+Math.sin(a)*9;
 const gold='#f3ce78',jade='#85f0d1',color=kind==='vase'?jade:gold;
 c.save();c.translate(x,y);c.rotate(Math.sin(a*1.4)*.10);c.lineWidth=1.2;
 c.strokeStyle=color;c.fillStyle=kind==='vase'?'#184f54':'#48364e';
 c.shadowColor=color;c.shadowBlur=5;
 if(kind==='orb'||kind==='seal'){
  c.fillStyle=kind==='orb'?'#3e647b':'#644b87';c.strokeStyle='#f8df98';c.lineWidth=1.4;
  if(kind==='orb'){c.beginPath();c.arc(0,0,12,0,Math.PI*2);c.fill();c.stroke();for(let i=0;i<2;i++){c.beginPath();c.ellipse(0,0,18,6,a*(i?1:-1),0,Math.PI*2);c.stroke();}}
  else{c.fillRect(-11,-8,22,18);c.strokeRect(-11,-8,22,18);c.fillStyle='#f8df98';c.fillRect(-14,10,28,4);c.beginPath();c.moveTo(-8,-8);c.lineTo(0,-19);c.lineTo(8,-8);c.closePath();c.fill();c.strokeRect(-5,-3,10,9);}
  for(let i=0;i<4;i++){const q=a+i*Math.PI/2;c.fillStyle='#b8f3ff';c.fillRect(Math.cos(q)*20,-10+Math.sin(q)*12,2,2);}
 }else if(kind==='vase'){
  c.beginPath();c.moveTo(-4,-16);c.lineTo(-4,-8);c.bezierCurveTo(-14,-5,-12,10,-5,12);c.lineTo(5,12);c.bezierCurveTo(12,10,14,-5,4,-8);c.lineTo(4,-16);c.closePath();c.fill();c.stroke();
  c.fillStyle=gold;c.fillRect(-5,-17,10,3);c.fillRect(-5,10,10,2);
  c.strokeStyle=jade;c.beginPath();c.ellipse(0,0,5,7,0,0,Math.PI*2);c.stroke();
  for(let i=0;i<3;i++){const f=(a*.55+i/3)%1;c.globalAlpha=(1-f)*.7;c.beginPath();c.arc(Math.sin(a+i)*4,-19-f*13,1.2,0,7);c.fill();}
 }else if(kind==='bell'){
  c.beginPath();c.arc(0,-13,3,Math.PI,0);c.stroke();
  c.beginPath();c.moveTo(-4,-12);c.quadraticCurveTo(-10,-9,-10,6);c.lineTo(-13,10);c.lineTo(13,10);c.lineTo(10,6);c.quadraticCurveTo(10,-9,4,-12);c.closePath();c.fill();c.stroke();
  c.fillStyle=gold;c.fillRect(-11,5,22,2);c.beginPath();c.arc(0,12,2,0,7);c.fill();
  for(let i=0;i<2;i++){const f=(a*.45+i*.5)%1;c.globalAlpha=(1-f)*.45;c.beginPath();c.ellipse(0,3,14+f*9,5+f*5,0,0,Math.PI*2);c.stroke();}
 }else{
  c.beginPath();c.ellipse(0,1,12,11,0,0,Math.PI);c.lineTo(-12,-5);c.quadraticCurveTo(0,-10,12,-5);c.closePath();c.fill();c.stroke();
  c.fillStyle=gold;c.fillRect(-13,-8,26,3);c.fillRect(-8,10,3,6);c.fillRect(5,10,3,6);
  for(const sign of [-1,1]){c.beginPath();c.ellipse(sign*14,-2,3,5,0,0,Math.PI*2);c.stroke();}
  c.strokeStyle='#86efff';for(let i=0;i<3;i++){c.beginPath();c.moveTo((i-1)*5,-9);c.quadraticCurveTo((i-1)*5+Math.sin(a*2+i)*4,-17,(i-1)*5,-22-Math.sin(a+i)*3);c.stroke();}
 }
 c.restore();return true;
}
