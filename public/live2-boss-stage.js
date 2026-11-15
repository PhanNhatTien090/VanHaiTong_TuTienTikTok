// Boss phase aura drawn around the existing real Boss sprite (not a replacement sprite).
// One boss per room: fixed vector paths, no shadows, texture uploads, new canvases, DOM or timers.
const TAU=Math.PI*2;
const COLOR=Object.freeze({gathering:'#c8a6ff',seal:'#7fe1fa',frenzy:'#ffc386'});
const clamp=x=>Math.max(0,Math.min(1,x));
export function drawLive2BossStage(c,boss,x,y,t,{light=false,motion=true,reducedFlash=false}={}){
 const v=boss?.live2Boss,id=v?.id;
 if(!c||!Object.hasOwn(COLOR,id))return false;
 const col=COLOR[id],clock=motion?t*.00027:0,open=!!v.exposed;
 c.save();
 try{
  c.translate(x,y);c.strokeStyle=col;c.lineCap='round';
  const base=light?74:107,pulse=motion?6*Math.sin(clock*4):0;
  c.globalAlpha=light?.42:.63;c.lineWidth=light?2:3.3;
  c.beginPath();c.ellipse(0,16,base+pulse,(base+pulse)*.41,0,0,TAU);c.stroke();
  if(!light){
   c.globalAlpha=.28;c.lineWidth=1.8;c.beginPath();
   c.ellipse(0,16,base+29,(base+29)*.45,0,0,TAU);c.stroke();
  }
  if(id==='gathering'){
   c.globalAlpha=light?.4:.57;c.lineWidth=light?2.2:3;
   for(let i=0;i<(light?3:5);i++){
    const a=i*TAU/(light?3:5)+(motion?clock*.43:0),rad=base*.93;
    c.beginPath();c.moveTo(Math.cos(a)*rad,-40+Math.sin(a)*rad*.35);
    c.lineTo(Math.cos(a+.15)*(rad+22),-65+Math.sin(a+.15)*rad*.4);c.stroke();
   }
  }else if(id==='seal'){
   c.globalAlpha=light?.52:.81;c.lineWidth=open?2:3.1;
   c.save();c.rotate(open?-.10:clock*.37);
   const n=light?4:6,r=base*.84;
   for(let i=0;i<n;i++){
    const a=TAU*i/n,b=TAU*(i+1)/n;
    c.beginPath();c.moveTo(Math.cos(a)*r,Math.sin(a)*r);
    c.lineTo(Math.cos(b)*r,Math.sin(b)*r);c.stroke();
   }
   c.restore();
   if(open&&!reducedFlash){
    c.globalAlpha=.32;c.lineWidth=light?2:3;
    for(let i=0;i<4;i++){
     const a=i*TAU/4+.2,rx=base*.62,ry=base*.77;
     c.beginPath();c.moveTo(Math.cos(a)*rx,Math.sin(a)*ry);
     c.lineTo(Math.cos(a+.15)*(rx+36),Math.sin(a+.15)*(ry+38));c.stroke();
    }
   }
  }else{
   // Frenzy: four jagged precomputed-looking bolts, fewer in light mode.
   c.globalAlpha=light?.55:reducedFlash?.55:.88;c.lineWidth=light?2.5:4;
   for(let i=0;i<(light?2:4);i++){
    const a=TAU*i/(light?2:4)+(motion?clock*.20:0),r=base*.74;
    const xx=Math.cos(a)*r,yy=Math.sin(a)*r*.75;
    c.beginPath();c.moveTo(xx,yy-18);
    c.lineTo(xx-12,yy+7);c.lineTo(xx+4,yy+10);
    c.lineTo(xx-8,yy+33);c.stroke();
   }
  }
 }finally{c.restore();}
 return true;
}
