import {makeSurface} from './performance.js';
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x));
export function breakthroughPower(realm){const r=Math.max(1,Math.min(18,Number(realm)||1));return {realm:r,tier:r>=14?5:r>=10?4:r>=6?3:r>=3?2:1,radius:190+r*9,rays:8+r,streams:10+r,shockwaves:1+Math.floor((r-1)/5),shake:2+r*.38,dragon:r>=6,phoenix:r>=10,cosmos:r>=14};}
export function sliceSpectacle(im,factory=makeSurface,size=448){const w=im.naturalWidth||im.width,h=im.naturalHeight||im.height,frames=[];for(let i=0;i<6;i++){const c=factory(size,size);if(!c)continue;const ctx=c.getContext('2d');ctx.imageSmoothingQuality='high';ctx.drawImage(im,i%3*w/3,Math.floor(i/3)*h/2,w/3,h/2,8,8,size-16,size-16);frames.push(c);}return frames;}
export function prepareBreakthroughSpectacle(scene){if(scene.breakthroughSpectacle||scene.breakthroughSpectacleLoading||scene.breakthroughSpectacleRetry>Date.now()||typeof Image==='undefined')return;scene.breakthroughSpectacleLoading=true;let im=new Image();im.onload=()=>{scene.breakthroughSpectacle=sliceSpectacle(im);scene.breakthroughSpectacleLoading=false;im=null;};im.onerror=()=>{scene.breakthroughSpectacleLoading=false;scene.breakthroughSpectacleRetry=Date.now()+15000;};im.src='/assets/breakthrough-v3/celestial-spectacle.png';}
function sprite(c,im,x,y,size,alpha,angle=0,sy=1){if(!im||alpha<=0)return;c.save();c.globalAlpha*=clamp(alpha);c.translate(x,y);c.rotate(angle);c.scale(1,sy);c.drawImage(im,-size/2,-size/2,size,size);c.restore();}
function phoenix(c,im,x,y,size,alpha,clock,motion){if(!im||alpha<=0)return;const flap=motion?Math.sin(clock*.005)*.10:0,w=im.width||im.naturalWidth,h=im.height||im.naturalHeight;c.save();c.globalAlpha*=clamp(alpha);c.translate(x,y);c.scale(size/w,size/h);for(const side of [-1,1]){c.save();c.rotate(side*flap);const sx=side<0?0:w*2/3;c.drawImage(im,sx,0,w/3,h,sx-w/2,-h/2,w/3,h);c.restore();}c.drawImage(im,w/3,0,w/3,h,-w/6,-h/2,w/3,h);c.restore();}
export function drawBreakthroughSpectacle(scene,c,{k,realm,color},clock,H,layer='back'){
 const p=breakthroughPower(realm),art=scene.breakthroughSpectacle||[],motion=scene.motion!==false,light=scene.budget?.level==='light',time=motion?clock:0,x=450,y=H*.62-210,open=clamp((k-.25)/.30),fade=clamp((1-k)/.08),charge=clamp((k-.50)/.20),release=clamp((k-.70)/.10),radius=p.radius;
 c.save();c.globalAlpha*=fade;
 if(layer==='back'){
  const size=(radius*2+80)*(.6+.4*open),spin=time*.00012*(1+realm*.025);
  sprite(c,art[0],x,y,size,open*(.23+p.tier*.055),spin);
  if(p.tier>=2)sprite(c,art[3],x,y-20,size*1.25,charge*(.18+p.tier*.04),-spin*.45);
  if(p.cosmos)sprite(c,art[5],x,y,size*1.47,open*.5,spin*.6);
  if(p.dragon){const orbit=spin*1.5,dx=Math.cos(orbit)*65,dy=Math.sin(orbit)*35;sprite(c,art[1],x+dx,y+dy,size*(.98+realm*.007),open*(.52+charge*.2),-spin*.8);}
  if(p.phoenix)phoenix(c,art[2],x,y-90-Math.sin(time*.001)*18,size*.94,clamp((k-.44)/.10)*.72*(1-clamp((k-.49)/.12)),time,motion);
  if(k>.50&&k<.71){const n=Math.min(light?20:32,p.streams);c.strokeStyle=color;c.lineWidth=2+charge;for(let i=0;i<n;i++){const a=i*TAU/n+time*.0002,u=(time*.00055+i/n)%1,r=(1-u)*(radius+80),r2=Math.max(0,r-35-charge*35);c.globalAlpha=fade*Math.sin(u*Math.PI)*(.4+charge*.45);c.beginPath();c.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r*.8);c.lineTo(x+Math.cos(a+.04)*r2,y+Math.sin(a+.04)*r2*.8);c.stroke();}}
  if(k>.57&&k<.80){const bloom=clamp((k-.57)/.14)*(1-release*.8),g=c.createRadialGradient(x,y,5,x,y,radius*(.6+charge));g.addColorStop(0,'#fff4d3'+Math.round(bloom*150).toString(16).padStart(2,'0'));g.addColorStop(.25,color+'45');g.addColorStop(1,color+'00');c.globalAlpha=fade;c.fillStyle=g;c.fillRect(x-radius*1.6,y-radius*1.6,radius*3.2,radius*3.2);}
 }else{
  // Separated expanding rings, one primary flash, no rapid full-screen strobing.
  for(let i=0;i<p.shockwaves;i++){const start=.69+i*.034,u=(k-start)/.15;if(u<0||u>1)continue;const size=150+u*(660+realm*12);sprite(c,art[4],x,H*.62+15,size,(1-u)*(.65+i*.05),i*.15,.72);c.globalAlpha=fade*(1-u);c.strokeStyle=i%2?'#fff3cc':color;c.lineWidth=5*(1-u)+1;c.beginPath();c.ellipse(x,y,50+u*(410+realm*8),50+u*(410+realm*8),0,0,TAU);c.stroke();}
  if(k>.70&&k<.91){const u=(k-.70)/.21,n=Math.min(light?24:40,p.rays);c.globalAlpha=fade*(1-u);c.strokeStyle=color;c.lineWidth=2;for(let i=0;i<n;i++){const a=i*2.399,r=55+u*(radius+110);c.beginPath();c.moveTo(x+Math.cos(a)*r,y+Math.sin(a)*r*.8);c.lineTo(x+Math.cos(a)*(r+12+realm),y+Math.sin(a)*(r+12+realm)*.8);c.stroke();}}
 }
 c.restore();return p;
}
