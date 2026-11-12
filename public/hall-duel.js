import {drawWings} from './boss-arena.js';
const colors=['#83e8d9','#ffc98c'];

function drawStrike(c,x,y,phase,dir,color){
 const reach=180+phase*170;
 c.save();c.translate(x,y);c.scale(dir,1);c.globalAlpha=Math.sin(phase*Math.PI);
 c.beginPath();c.moveTo(-28,38);c.quadraticCurveTo(reach*.58,-101,reach,-23);
 c.quadraticCurveTo(reach*.56,-63,18,47);c.closePath();
 c.fillStyle=color+'66';c.fill();c.strokeStyle=color;c.lineWidth=4;c.stroke();c.restore();
}

export function drawHallDuel(scene,c,match,players,t,H){
 const now=scene.stateServerNow+(t-scene.stateReceivedAt), age=Math.max(0,(now-match.startedAt)/1000);
 const phase=age%3.5/3.5, turn=Math.floor(age/3.5)%2, attack=scene.motion===false?0:Math.sin(Math.PI*phase)**5;
 const y=H*.735, use=[match.a,match.b].map((p,i)=>{
  const player=players.get(p.id)||{...p,giftCoins:0};
  return {id:p.id,player,x:(i?625:275)+(i?-1:1)*attack*(turn===i?148:-16),y:y-attack*(turn===i?65:14),scale:2.13};
 });
 const canvas=scene.canvas;
 c.setTransform(canvas.width/900,0,0,canvas.height/H,0,0);
 c.drawImage(scene.background,0,0,900,H);c.fillStyle='#030e21a9';c.fillRect(0,0,900,H);
 c.save();c.translate(450,y+48);c.scale(1,.20);
 for(let i=0;i<3;i++){
  c.beginPath();c.arc(0,0,278+i*44,0,Math.PI*2);c.lineWidth=3+i;
  c.strokeStyle=i%2?'#f3bc7475':'#79e4d593';c.stroke();
 }
 c.restore();
 if(attack>0)drawStrike(c,use[turn].x,y-146,phase,turn?-1:1,colors[turn]);
 const previous={targets:scene.targets,compact:scene.compact,cinematicPose:scene.cinematicPose};
 scene.targets=use;scene.compact=true;
 try{
  for(const [i,target] of use.entries()){
   scene.cinematicPose={stand:1,mode:'hall-duel',lift:0,lean:(i?-1:1)*attack*.12};
   drawWings(scene,c,target,t);scene.drawPlayer(c,target.player,target.x,target.y,t);
  }
 }finally{Object.assign(scene,previous);}
 if(attack>.64){
  const size=23+attack*52;c.beginPath();c.arc(450,y-150,size,0,Math.PI*2);
  c.strokeStyle='#ffebbe';c.lineWidth=4*(1-attack*.4);c.stroke();
 }
}
