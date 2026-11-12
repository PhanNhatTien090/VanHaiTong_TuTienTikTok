// Ordered, readable regalia accents. No stacked rotating atlas circles over faces.
export const PRESENCE_STYLES=Object.freeze([
 ['#b8f2ed','feather'],['#a5ccff','star'],['#d0b8ff','shard'],['#f5d69a','sun'],['#efc5f6','lotus'],['#ffe9b1','crown'],
 ['#87e8cb','jade'],['#b5d9ff','star'],['#f4d082','dragon'],['#a8d9ff','star'],['#ffd7a1','sun'],['#c2a1f8','void'],['#a4e0c4','jade'],['#edc8ff','lotus'],
 ['#ff5a40','sun'],['#c48bff','void'],['#e6ebff','shard'],['#70f6df','jade'],['#ff916a','sun'],['#d5a1ff','star'],['#ffdb84','crown']
]);
export function drawRealmPresenceV3(scene,c,a,t){
 const p=a.player,r=Math.trunc(Number(p?.realm)||0);if((scene.reducePresence??scene.crowded)||p?.resident||r<8||r>=8+PRESENCE_STYLES.length)return false;
 const [color,motif]=PRESENCE_STYLES[r-8],phase=scene.motion===false?0:t*.001,scale=a.scale||1.6,light=scene.budget?.level==='light';
 // Accents stay beside shoulders and below feet; center column stays clear.
 const radius=Math.min(48,Math.max(23,(scene.targets||[]).reduce((v,b)=>b.id!==a.id&&Math.abs(b.y-a.y)<140*scale?Math.min(v,Math.abs(b.x-a.x)*.40/scale):v,48)));
 c.save();c.translate(a.x,a.y);c.scale(scale,scale);c.strokeStyle=color;c.fillStyle=color;c.lineWidth=1.1;
 c.globalAlpha=.28;c.beginPath();c.ellipse(0,29,radius*.7,5,0,0,Math.PI*2);c.stroke();
 for(const side of [-1,1]){
  const x=side*radius,y=-61+Math.sin(phase*1.6+side)*2;
  c.save();c.translate(x,y);c.globalAlpha=.62+.1*Math.sin(phase*1.3+side);
  if(motif==='star'){
   for(let i=0;i<3;i++){const sy=-23+i*23,sx=side*Math.sin(i*1.7)*5;c.beginPath();c.moveTo(sx,sy-5);c.lineTo(sx+3,sy);c.lineTo(sx,sy+5);c.lineTo(sx-3,sy);c.closePath();c.stroke();if(i<2){c.globalAlpha=.22;c.beginPath();c.moveTo(sx,sy+5);c.lineTo(side*Math.sin((i+1)*1.7)*5,sy+18);c.stroke();c.globalAlpha=.7;}}
  }else if(motif==='jade'){
   for(let i=0;i<3;i++){c.save();c.translate(side*i*2,-25+i*24);c.strokeRect(-3,-6,6,12);c.globalAlpha=.25;c.fillRect(-1,-4,2,8);c.restore();}
  }else if(motif==='sun'){
   for(let i=0;i<5;i++){const angle=-Math.PI*.5+side*(i*.18+.1),xx=Math.cos(angle)*25,yy=Math.sin(angle)*25;c.beginPath();c.moveTo(xx*.65,yy*.65);c.lineTo(xx,yy);c.stroke();}c.beginPath();c.moveTo(side*3,8);c.quadraticCurveTo(side*12,22,side*4,35);c.stroke();
  }else if(motif==='void'){
   for(let i=0;i<3;i++){c.beginPath();c.moveTo(-side*3,-30+i*26);c.lineTo(side*5,-23+i*26);c.lineTo(-side*1,-13+i*26);c.stroke();}
  }else if(motif==='lotus'){
   for(let i=0;i<3;i++){c.save();c.translate(side*i*2,-24+i*25);c.beginPath();c.moveTo(0,7);c.bezierCurveTo(-8,-2,-4,-9,0,-12);c.bezierCurveTo(4,-9,8,-2,0,7);c.stroke();c.restore();}
  }else if(motif==='dragon'){
   // Paired ascending dragon whiskers support the armor, never another sprite over it.
   c.beginPath();c.moveTo(-side*2,39);c.bezierCurveTo(side*9,20,-side*8,-6,side*4,-28);c.stroke();c.beginPath();c.moveTo(side*4,-28);c.lineTo(side*8,-34);c.moveTo(side*4,-28);c.lineTo(-side*2,-33);c.stroke();
  }else if(motif==='crown'){
   c.beginPath();c.moveTo(-6,-18);c.lineTo(-6,-32);c.lineTo(0,-24);c.lineTo(6,-36);c.lineTo(6,-18);c.closePath();c.stroke();
  }else{
   for(let i=0;i<3;i++){c.beginPath();c.moveTo(-side*3,-31+i*24);c.quadraticCurveTo(side*12,-27+i*24,side*2,-13+i*24);c.quadraticCurveTo(-side*5,-23+i*24,-side*3,-31+i*24);c.stroke();}
  }
  c.restore();
 }
 // A few ascending sparks travel in side lanes, never across the player's face.
 c.globalAlpha=.5;for(let i=0;i<(light?2:4);i++){const u=(phase*.20+i*.27)%1;c.fillRect((i%2?1:-1)*(radius-4),25-u*110,1.4,3);}
 c.restore();return true;
}
