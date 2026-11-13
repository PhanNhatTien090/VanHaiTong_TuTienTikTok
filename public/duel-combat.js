import {portraitCanvas} from './linh-bai.js';
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x));
export const DUEL_CAST_MS=1150;
export function duelCastState(age){const elapsed=Math.max(0,age-650),turn=Math.floor(elapsed/DUEL_CAST_MS);return {turn,side:turn%2,k:elapsed%DUEL_CAST_MS/DUEL_CAST_MS,ultimate:turn%6===5,ready:age>=650};}
export function drawDuelImpact(c,orb,cast,tech,light=false){
 const k=cast.k;if(k<.34||k>.94)return;
 const u=(k-.34)/.6,fade=Math.sin(u*Math.PI),color=tech.color||'#a9eaff',power=cast.ultimate?1.7:1;
 c.save();c.globalAlpha=fade;c.strokeStyle=color;c.lineCap='round';
 for(let ring=0;ring<(cast.ultimate?3:2);ring++){
  const r=(28+u*95+ring*19)*power;c.lineWidth=(4-ring)*Math.max(.2,1-u);
  c.beginPath();c.ellipse(orb.x,orb.y,r,r*(ring%2?.35:.85),ring*.7+cast.turn,0,TAU);c.stroke();
 }
 const n=light?8:cast.ultimate?22:13;
 for(let i=0;i<n;i++){const a=i*2.399+cast.turn,reach=(30+u*(110+i%3*23))*power,x=orb.x+Math.cos(a)*reach,y=orb.y+Math.sin(a)*reach*.65;
  c.strokeStyle=i%3?color:'#fff5cf';c.lineWidth=i%3?2:4;c.beginPath();c.moveTo(x-Math.cos(a)*19,y-Math.sin(a)*14);c.lineTo(x,y);c.stroke();}
 c.fillStyle='#fff9df';c.globalAlpha=fade*.8;c.beginPath();c.arc(orb.x,orb.y,Math.max(2,23*(1-u))*power,0,TAU);c.fill();c.restore();
}
export function drawDuelCutIn(scene,c,actor,tech,k,H,{gift=false,avatar=null}={}){
 if(k<.02||k>.82)return;
 const alpha=clamp(Math.min(k/.12,(.82-k)/.14)),side=actor.x<450?1:-1;
 const y=H*.41,slide=scene.motion===false?0:side*(1-clamp(k/.17))**3*500;
 c.save();c.globalAlpha=alpha;c.translate(slide,y);
 const color=tech.color||'#c4b5ff',g=c.createLinearGradient(80,0,820,0);g.addColorStop(0,'#09162cf5');g.addColorStop(.55,color+'a6');g.addColorStop(1,'#09162cf5');
 c.fillStyle=g;c.strokeStyle=color;c.lineWidth=2;c.beginPath();c.moveTo(65,-65);c.lineTo(835,-93);c.lineTo(835,60);c.lineTo(65,88);c.closePath();c.fill();c.stroke();c.clip();
 for(let i=0;i<10;i++){const yy=-60+i*16,x=((i*113+(scene.motion===false?0:k*900))%780)+60;c.strokeStyle=i%3?color:'#ffffff';c.globalAlpha=alpha*(i%3?.3:.65);c.lineWidth=2;c.beginPath();c.moveTo(x,yy);c.lineTo(x+65,yy-2);c.stroke();}
 c.globalAlpha=alpha;
 const portrait=portraitCanvas(scene,actor.player);if(portrait)c.drawImage(portrait,side>0?78:630,-125,210,250);
 c.textAlign='center';c.textBaseline='middle';c.font='800 17px "Segoe UI",Arial,sans-serif';c.fillStyle='#ffffff';c.fillText(gift?'QUÀ TRỢ LỰC · TUYỆT KỸ':'TUYỆT KỸ · LIÊN CHIÊU',450,-42);
 c.font='900 28px "Segoe UI",Arial,sans-serif';c.strokeStyle='#07121d';c.lineWidth=5;c.strokeText(tech.name||'Vạn Kiếm Quy Tông',450,0,480);c.fillStyle='#fff7de';c.fillText(tech.name||'Vạn Kiếm Quy Tông',450,0,480);
 c.font='800 19px "Segoe UI",Arial,sans-serif';c.fillStyle='#ffffff';c.fillText(actor.player.name||'Đạo hữu',450,38,440);c.restore();
}
export function drawDuelGiftStrike(c,{x,y,toX,toY,k,color,power=1,light=false}){
 const u=clamp((k-.08)/.52);if(u<=0||u>=1)return;
 const headX=x+(toX-x)*(1-(1-u)**3),headY=y+(toY-y)*u-Math.sin(u*Math.PI)*70;
 c.save();c.globalAlpha=Math.sin(u*Math.PI);c.lineCap='round';
 for(let i=0;i<(light?4:8);i++){const offset=(i-3.5)*13*power;c.strokeStyle=i%3?color:'#fff7d4';c.lineWidth=(i%3?3:6)*power;
  c.beginPath();c.moveTo(x,y+offset);c.bezierCurveTo(x+(toX-x)*.35,y-70+offset,headX-(toX-x)*.15,headY+offset*.4,headX,headY);c.stroke();}
 c.strokeStyle='#fff5cd';c.lineWidth=4;c.beginPath();c.ellipse(headX,headY,22*power,55*power,.5,0,TAU);c.stroke();c.restore();
}
