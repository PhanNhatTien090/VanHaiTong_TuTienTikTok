const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x));
const seed=id=>Array.from(String(id||'')).reduce((n,ch)=>(n*31+ch.codePointAt(0))%997,0);
export function raceFlightPose(a,t,motion=true){
 const phase=motion?t*.003+seed(a.id):0,boost=motion&&a.boost&&!a.finished?1:0,kick=motion?clamp(a.kick||0):0;
 return {stand:1,mode:'flight',left:-.22-boost*.3,right:.32+boost*.22,
  lean:.05+boost*.12+kick*.13+(motion?Math.sin(phase*.45)*.035:0),
  lift:motion?Math.sin(phase)*2.5-boost*3-kick*9:0,
  cloth:motion?Math.sin(phase*1.8)*(3+boost*4):0,energy:.3+boost*.45};
}
export function drawRaceMotion(scene,c,t,layer){
 if(!scene.raceStatus?.active)return;
 const motion=scene.motion!==false,light=scene.budget?.level==='light',time=motion?t:0;
 const targets=(scene.targets||[]).slice(0,8);
 // Extra sword afterimages are restricted to the two strongest visible gift boosts.
 const featured=new Set(targets.filter(a=>a.gift).sort((a,b)=>b.gift.coins-a.gift.coins).slice(0,2).map(a=>a.id));
 c.save();
 for(const a of targets){
  const level=Math.min(4,Math.floor(Math.log2(1+(a.gift?.coins||0))/2)),color=a.gift?'#ffe49b':a.boost?'#8cfff0':'#9bdfff';
  const s=Math.min(1.4,(a.scale||1.5)/1.5),phase=time*.004+seed(a.id),power=a.boost?1:0;
  if(layer==='back'){
   // Braided wind ribbons continuously corkscrew behind the sword.
   const length=(a.finished?65:135+power*105+level*18)*s;
   c.lineWidth=(power?2.8:1.5)*s;c.strokeStyle=color;
   for(let side=-1;side<=1;side+=2){c.beginPath();const steps=light?7:12;
    for(let j=0;j<=steps;j++){const u=j/steps,x=a.x+side*(9+Math.sin(phase-u*7)*(9+power*8))*s*(1-u),y=a.y+35*s+u*length;j?c.lineTo(x,y):c.moveTo(x,y);}
    c.globalAlpha=power?.7:.28;c.stroke();
   }
   if(motion&&a.boost){
    for(let i=0;i<(light?2:4);i++){const u=(time*.0009+i/4)%1;c.globalAlpha=(1-u)*.55;c.lineWidth=2;c.beginPath();c.ellipse(a.x,a.y+25*s+u*110*s,(18+u*48)*s,(5+u*13)*s,0,0,TAU);c.stroke();}
   }
   if(motion&&featured.has(a.id)){
    // Receding sword silhouettes, animated rather than spawning persistent sprites.
    for(let i=0;i<Math.min(light?3:5,2+level);i++){
     const u=(time*.0007+i*.2)%1,x=a.x+Math.sin(phase*.5+i)*25*s,y=a.y+75*s+u*150*s;
     c.globalAlpha=(1-u)*.4;c.fillStyle=color;c.beginPath();c.moveTo(x,y-22*s);c.lineTo(x+4*s,y+8*s);c.lineTo(x,y+15*s);c.lineTo(x-4*s,y+8*s);c.closePath();c.fill();
    }
   }
  }else{
   const launch=a.launchAge!=null&&a.launchAge>=0&&a.launchAge<1800;
   const finish=a.finishAge!=null&&a.finishAge<2400;
   if(motion&&(launch||finish)){
    const u=clamp((finish?a.finishAge:a.launchAge)/(finish?2400:1800)),fade=Math.sin(u*Math.PI);
    c.strokeStyle=finish?'#ffdc72':'#c8faff';c.lineWidth=3;c.globalAlpha=fade;
    c.beginPath();c.ellipse(a.x,a.y-45*s,(30+u*95)*s,(18+u*40)*s,0,0,TAU);c.stroke();
    const count=light?7:12;for(let i=0;i<count;i++){const angle=i*TAU/count+u*.6,reach=(25+u*100)*s;c.fillStyle=c.strokeStyle;c.globalAlpha=fade*(1-u*.5);c.fillRect(a.x+Math.cos(angle)*reach,a.y-45*s+Math.sin(angle)*reach*.65,3,6);}
    if(finish){c.globalAlpha=fade;c.font='900 22px Segoe UI';c.textAlign='center';c.lineWidth=4;c.strokeStyle='#1d1933';c.strokeText('VỀ ĐÍCH',a.x,a.y+100*s);c.fillStyle='#ffe49b';c.fillText('VỀ ĐÍCH',a.x,a.y+100*s);}
   }
  }
 }
 c.restore();
}
