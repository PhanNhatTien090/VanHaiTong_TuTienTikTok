// Every original species has a distinctive, deterministic casting motif.
// Rendered as simple paths over the corresponding animated V2 pet atlas.
// No external images, GPU shaders, full-screen repeated gradients or per-frame allocations.
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x));
export const PET_V2_MOTIFS=Object.freeze({
 'jade-rabbit':'crescent','ember-fox':'fox-tail','frost-tiger':'frost-claw',
 'sun-phoenix':'phoenix-plumes','astral-dragon':'star-coil','loi-oa':'thunder',
 'van-thu':'sanguine','ky-lan':'qilin-seal','bach-nguyet-ho':'nine-tails',
 'ngoc-chau-long':'tidal','xich-ha-phuong':'ember-wings','tu-nguyet-lan':'purple-moon',
 'hac-tinh-ho':'void-claw'
});
export function drawPetV2SkillSignature(c,id,x,y,size,k,{motion=true,light=false}={}){
 const motif=PET_V2_MOTIFS[id];if(!motif)return false;
 const p=motion?clamp(k):.55,beat=Math.sin(Math.PI*p),r=size*.64;
 c.save();c.translate(x,y);c.globalAlpha*=clamp(beat)*.78;c.lineWidth=light?2:3;
 c.lineCap='round';c.lineJoin='round';
 const arc=(cx,cy,rad,start,end,color,w=3)=>{
  c.strokeStyle=color;c.lineWidth=w;c.beginPath();c.arc(cx,cy,rad,start,end);c.stroke();
 };
 const poly=(pts,color,w=3)=>{
  c.strokeStyle=color;c.lineWidth=w;c.beginPath();
  pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));
  c.stroke();
 };
 const gem=(gx,gy,s,color)=>{
  c.fillStyle=color;c.beginPath();c.moveTo(gx,gy-s);c.lineTo(gx+s*.65,gy);c.lineTo(gx,gy+s);c.lineTo(gx-s*.65,gy);c.closePath();c.fill();
 };
 if(motif==='crescent'||motif==='purple-moon'){
  const col=motif==='purple-moon'?'#d7b5ff':'#a4ffe3';
  arc(0,0,r*.7,-2.15,2.1,col,4);
  arc(r*.13,0,r*.6,-2.15,2.1,'#fff6c9',1.3);
  for(let i=0;i<(light?2:5);i++)gem(Math.cos(i*TAU/5+p)*r*.8,Math.sin(i*TAU/5+p)*r*.65,5,col);
 }else if(motif==='fox-tail'||motif==='nine-tails'){
  const n=light?3:motif==='nine-tails'?9:5,col=motif==='nine-tails'?'#e1baff':'#ff9e64';
  for(let i=0;i<n;i++){
   const a=(i-(n-1)/2)*.22;
   c.save();c.rotate(a);
   poly([[-r*.23,r*.18],[-r*.48,-r*.08],[-r*.22,-r*.48],[r*.06,-r*.7]],col,light?2:2.3);
   c.restore();
  }
 }else if(motif==='frost-claw'||motif==='void-claw'){
  const col=motif==='void-claw'?'#b2a3ff':'#b5faff';
  for(let i=-1;i<=1;i++){
   const yy=i*r*.21;
   poly([[-r*.75,yy+r*.2],[0,yy-r*.32],[r*.83,yy-r*.6]],col,3);
   if(!light)gem(r*.83,yy-r*.6,7,'#ffffff');
  }
 }else if(motif==='phoenix-plumes'||motif==='ember-wings'){
  const col=motif==='ember-wings'?'#ff73c1':'#ffd27c';
  for(const side of [-1,1])for(let i=0;i<(light?2:4);i++){
   const rx=side*(r*.23+i*r*.16),ry=r*.25;
   poly([[0,ry],[rx,-r*.07],[side*(r*.45+i*r*.12),-r*(.3+i*.09)]],col,3);
  }
 }else if(motif==='star-coil'){
  c.strokeStyle='#cbb3ff';c.lineWidth=3;c.beginPath();
  for(let i=0;i<=20;i++){
   const a=i/20*TAU*1.7+p*1.2,q=r*(.07+i/20*.7);
   const xx=Math.cos(a)*q,yy=Math.sin(a)*q*.66;
   if(!i)c.moveTo(xx,yy);else c.lineTo(xx,yy);
  }c.stroke();
  for(let i=0;i<(light?3:6);i++)gem(Math.cos(i*2.4)*r*.71,Math.sin(i*2.4)*r*.52,3.7,'#fff3ff');
 }else if(motif==='thunder'){
  const n=light?2:5;
  for(let i=0;i<n;i++){
   const xx=(i-(n-1)/2)*r*.32;
   poly([[xx-r*.25,-r*.6],[xx+r*.13,-r*.18],[xx-r*.06,r*.07],[xx+r*.32,r*.54]],i%2?'#fff4fa':'#b1b6ff',3);
  }
 }else if(motif==='sanguine'){
  for(let i=0;i<(light?3:7);i++){
   const a=i*TAU/7+p*.7;
   const xx=Math.cos(a)*r*.63,yy=Math.sin(a)*r*.45;
   gem(xx,yy,9,'#ff6f9d');
   if(!light)arc(xx,yy,12,-1.1,1.7,'#ffc8d4',1.3);
  }
 }else if(motif==='qilin-seal'){
  c.strokeStyle='#ffe0a5';c.lineWidth=3;c.beginPath();
  for(let i=0;i<6;i++){
   const a=i*TAU/6-p*.2,x1=Math.cos(a)*r*.68,y1=Math.sin(a)*r*.65;
   if(i===0)c.moveTo(x1,y1);else c.lineTo(x1,y1);
  }c.closePath();c.stroke();
  for(let i=0;i<3;i++)arc(0,0,r*(.25+i*.1),i*.9,i*.9+2.2,'#fff2be',2);
 }else if(motif==='tidal'){
  for(let i=0;i<(light?2:5);i++){
   c.strokeStyle=i%2?'#e3ffda':'#9ad9ff';c.lineWidth=2.5;c.beginPath();
   c.ellipse(0,r*.2+i*3,r*(.4+i*.1),r*(.11+i*.025),-.1,0,TAU);c.stroke();
  }
 }
 c.restore();return true;
}
