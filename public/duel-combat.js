import {portraitCanvas} from './linh-bai.js';
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x));
export const DUEL_CAST_MS=1150;
// V4 (15/11): trận Luận Kiếm 25 s có nhịp thay vì vòng lặp đổi bên đều đều.
// Mở trận → Thăm dò (chiêu nhẹ, chậm) → Tụ khí (không ra chiêu) → Công kích (liên chiêu) → Phòng thủ
// (bên đang kém linh áp dựng kết giới, bên dẫn đánh vào kết giới) → Tuyệt kỹ (bên dẫn, theo linh áp THẬT của server) → Kết thúc.
// Chỉ là trình diễn: thắng thua vẫn do decide() ở server (tổng tu vi ≥3% hoặc điểm + trợ lực).
export const DUEL_PHASES=Object.freeze([
 {id:'open',from:0,to:1500},
 {id:'probe',from:1500,to:6300,period:1600,label:'THĂM DÒ'},
 {id:'charge',from:6300,to:8900,label:'TỤ KHÍ'},
 {id:'attack',from:8900,to:17000,period:DUEL_CAST_MS,label:'CÔNG KÍCH'},
 {id:'guard',from:17000,to:19800,period:1400,label:'PHÒNG THỦ'},
 {id:'ultimate',from:19800,to:23300,period:3500,label:'TUYỆT KỸ'},
 {id:'finish',from:23300,to:Infinity}
]);
export const duelPhase=age=>DUEL_PHASES.find(p=>age>=p.from&&age<p.to)||DUEL_PHASES[0];
// lead = linh áp trái − linh áp phải (server). leader 0 = bên trái.
export function duelCastState(age,lead=0){
 const phase=duelPhase(Math.max(0,age)),index=DUEL_PHASES.indexOf(phase),local=Math.max(0,age-phase.from),span=phase.to-phase.from;
 const leader=lead>=0?0:1,phaseK=Number.isFinite(span)?Math.min(1,local/span):1;
 if(!phase.period)return {phase:phase.id,label:phase.label||'',phaseK,leader,turn:index*100,side:leader,k:0,ultimate:false,ready:false};
 const n=Math.floor(local/phase.period),k=local%phase.period/phase.period,fits=(n+1)*phase.period<=span+1;
 const side=phase.id==='guard'||phase.id==='ultimate'?leader:n%2;
 return {phase:phase.id,label:phase.label,phaseK,leader,turn:index*100+n,side,k,ultimate:phase.id==='ultimate',light:phase.id==='probe',guard:phase.id==='guard',ready:fits,period:phase.period};
}
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
