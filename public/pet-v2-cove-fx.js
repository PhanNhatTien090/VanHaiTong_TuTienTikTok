// Four animated Linh Thú Cốc phase layers. Always draws BEHIND original pet frames.
const TAU=Math.PI*2;
const COLOR=Object.freeze({opening:'#ffdca6',exploration:'#a6f2d0',community:'#d3b2ff',settlement:'#ffe8ad'});
export function drawPetV2CoveScene(scene,c,t,H,layer='back'){
 const phase=scene.petCovePhase?.phase,color=COLOR[phase];if(!color)return false;
 const light=scene.budget?.level==='light'||scene.minimalCrowd||scene.heavyCrowd,motion=scene.motion!==false;
 const seconds=motion?t*.001:0,progress=Math.max(0,Math.min(1,scene.petCovePhase.progress||0));
 const x=450,y=H*.395,r=Math.min(H*.15,165);
 c.save();c.strokeStyle=color;c.lineWidth=light?1.4:2;c.globalAlpha=.55;
 if(layer==='back'){
  for(let j=0;j<(light?1:phase==='community'?3:2);j++){
   c.beginPath();c.ellipse(x,y,r*(.95+j*.22),r*(.24+j*.07),seconds*.02*(j%2?-1:1),0,TAU);c.stroke();
  }
  if(phase==='opening'){
   c.globalAlpha=.3+.24*Math.sin(Math.PI*Math.min(1,progress/.05));
   c.lineWidth=light?4:7;c.beginPath();c.arc(x,y-H*.08,r*.83,Math.PI*1.07,Math.PI*1.93);c.stroke();
  }
  if(phase==='community'){
   c.lineWidth=light?1.4:2.2;
   for(let i=0;i<(light?3:6);i++){
    const a=TAU*i/6;c.globalAlpha=.2+.18*Math.sin(seconds*1.8+i)**2;
    c.beginPath();c.moveTo(x,y);
    c.quadraticCurveTo(x+Math.cos(a)*r*.8,y+Math.sin(a)*r*.4,x+Math.cos(a)*r*1.5,y+Math.sin(a)*r*.75);c.stroke();
   }
  }
  if(phase==='settlement'){
   c.globalAlpha=.6;c.lineWidth=2.3;c.beginPath();c.arc(x,y,r*.57,Math.PI*1.1,Math.PI*1.9);c.stroke();
  }
 }else if(layer==='front'&&motion){
  for(let i=0;i<(light?3:9);i++){
   const a=i*2.399+seconds*(phase==='community'?.6:.28),d=r*(.53+.45*((i*17%13)/13));
   c.globalAlpha=.12+.27*Math.sin(seconds*.8+i)**2;
   c.fillStyle=i%2?'#f5fff0':color;
   c.fillRect(x+Math.cos(a)*d,y+Math.sin(a)*d*.35,light?2:3,light?2:5);
  }
 }
 c.restore();return true;
}
