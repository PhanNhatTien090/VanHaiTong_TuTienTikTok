// Heaven Trial of the player who just broke through, illustrated at their actual spot.
// Draws behind the original character and never changes the 90s assistance logic.
const TAU=Math.PI*2;
export function drawLive2HeavenStage(c,trial,x,y,t,{light=false,motion=true,reducedFlash=false}={}){
 if(!c||!trial||trial.completed||!Number.isFinite(x)||!Number.isFinite(y))return false;
 const help=Math.max(0,Math.min(3,Number(trial.helpers)||0)),r=light?55:75;
 const angle=motion?t*.00038:0;
 c.save();
 try{
  c.translate(x,y);c.strokeStyle=help>=3?'#ffe5b0':'#a9d9ff';c.lineWidth=light?2.5:3.2;
  c.globalAlpha=light?.40:reducedFlash?.46:.66;
  c.beginPath();c.ellipse(0,-8,r,r*.34,0,0,TAU);c.stroke();
  if(!light){
   c.globalAlpha*=.63;c.beginPath();c.ellipse(0,-8,r+23,(r+23)*.34,0,0,TAU);c.stroke();
  }
  // Three fixed ascending talismans correspond to the number of helpers, no particles.
  for(let i=0;i<3;i++){
   const phi=angle+i*TAU/3,xx=Math.cos(phi)*(r*.95),yy=-26+Math.sin(phi)*r*.24;
   const filled=i<help;c.strokeStyle=filled?'#ffe5a8':'#9dc6f5';
   c.globalAlpha=filled?.92:.48;c.lineWidth=filled?3:1.8;
   c.beginPath();c.moveTo(xx,yy-15);c.lineTo(xx+10,yy);c.lineTo(xx,yy+15);c.lineTo(xx-10,yy);c.closePath();c.stroke();
  }
 }finally{c.restore();}
 return true;
}
