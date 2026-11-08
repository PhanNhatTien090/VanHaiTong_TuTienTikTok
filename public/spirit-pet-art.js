import {petById,petPose} from './spirit-pets.js';
import {makeSurface} from './performance.js';
// 07/11: Lôi Oa — tia sét gấp khúc nhỏ quanh thân (không phủ màn hình).
export function drawPetBolt(c,x0,y0,x1,y1,seed,color,width=1.6){let s=seed>>>0;const r=()=>((s=(s*1664525+1013904223)>>>0)/4294967296)-.5,n=6;c.save();c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.shadowColor=color;c.shadowBlur=8;c.beginPath();c.moveTo(x0,y0);for(let i=1;i<n;i++){const k=i/n,d=Math.hypot(x1-x0,y1-y0)*.18;c.lineTo(x0+(x1-x0)*k+r()*d,y0+(y1-y0)*k+r()*d);}c.lineTo(x1,y1);c.stroke();c.strokeStyle='#ffffff';c.lineWidth=width*.45;c.shadowBlur=0;c.stroke();c.restore();}
// Hiệu ứng riêng của thần thú: sét (Lôi Oa), huyết khí (Văn Thú), lửa (Kỳ Lân). Nhỏ, sát thân, không phủ màn hình.
export function drawRareFx(c,pet,size,t,seed,power=1){
 if(!pet?.fx)return;const TAU=Math.PI*2;
 if(pet.fx==='lightning'){const beat=Math.floor((t+seed%1600)/1600),k=((t+seed%1600)%1600)/1600;if(k<.16*power+.0){c.save();c.globalAlpha*=1-k/(.16*power||.16);const a=(beat*2.3)%TAU,r=size*.42;drawPetBolt(c,Math.cos(a)*r*.35,-size*.25+Math.sin(a)*r*.2,Math.cos(a)*r,-size*.12+Math.sin(a*1.7)*r*.45,beat+seed,'#b9a8ff',1.3*power);c.restore();}return;}
 const n=Math.round(7*power);c.save();
 for(let i=0;i<n;i++){const u=((t*.0007+i/n+(seed%97)/97)%1),a=i*2.4+seed;
  if(pet.fx==='blood'){const x=Math.cos(a+t*.002)*size*(.25+.25*u),y=-size*.3+Math.sin(a+t*.002)*size*.2-u*size*.25;c.globalAlpha=(1-u)*.7;c.fillStyle=i%2?'#ff2d55':'#b3002d';c.beginPath();c.arc(x,y,(1.6+2*(1-u))*power,0,TAU);c.fill();}
  else{const x=Math.sin(a)*size*.32,y=size*.15-u*size*.7,w=(4+3*(1-u))*power;c.globalAlpha=(1-u)*.85;const g=c.createRadialGradient(x,y,0,x,y,w*2);g.addColorStop(0,'#fff2b0');g.addColorStop(.4,'#ff9a2e');g.addColorStop(1,'#ff4b1f00');c.fillStyle=g;c.beginPath();c.ellipse(x,y,w,w*1.8,0,0,TAU);c.fill();}}
 c.restore();
}
export function slicePetFrames(image,id,make=makeSurface){
 const cuts=id==='astral-dragon'?[0,.292,.668,1]:[0,1/3,2/3,1],width=image.naturalWidth||image.width,height=image.naturalHeight||image.height;
 return cuts.slice(0,3).map((left,i)=>{const frame=make(160,160);if(!frame)return null;const sw=(cuts[i+1]-left)*width,s=Math.min(144/sw,144/height),ctx=frame.getContext('2d');ctx.drawImage(image,left*width,0,sw,height,(160-sw*s)/2,(160-height*s)/2,sw*s,height*s);
  // Normalize the pose silhouette once on load, avoiding large size jumps between generated poses.
  const bytes=ctx.getImageData(0,0,160,160).data;let x0=160,y0=160,x1=0,y1=0;
  for(let y=0;y<160;y++)for(let x=0;x<160;x++)if(bytes[(y*160+x)*4+3]>48){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
  if(x0>=x1)return frame;const out=make(160,160);if(!out)return frame;const w=x1-x0+5,h=y1-y0+5,fit=Math.min(144/w,144/h);out.getContext('2d').drawImage(frame,x0-2,y0-2,w,h,(160-w*fit)/2,(160-h*fit)/2,w*fit,h*fit);return out;
 });
}
export function loadPetArt(scene,players){
 scene.petArt??=new Map();if(typeof Image==='undefined')return;
 for(const p of players){const pet=petById(p.spiritPet);if(!pet||scene.petArt.has(pet.id))continue;
  const image=new Image();scene.petArt.set(pet.id,null);image.onload=()=>scene.petArt.set(pet.id,slicePetFrames(image,pet.id));image.onerror=()=>scene.petArt.delete(pet.id);image.src='/assets/spirit-pets-v1/'+pet.id+'.png';
 }
}
export function drawPet(scene,c,target,t){
 const p=target.player,pet=petById(p.spiritPet),frames=pet&&scene.petArt?.get(pet.id);if(!frames)return;
 let seed=0;for(const ch of p.id)seed=(seed*31+ch.charCodeAt(0))>>>0;
 const pose=petPose(t,seed%1000,scene.motion),scale=target.scale||1.4;
 // Small follower beside the feet: no full-screen halo, no additional stage actors.
 const flying=pet.id==='sun-phoenix'||pet.id==='astral-dragon'||!!pet.flying,grand=flying||pet.rare,x=target.x+scale*(30+pose.sway*.3),y=target.y+scale*(flying?-8:8)+pose.bob;
 const size=pet.size*scale,image=frames[pose.frame];if(!image)return;
 c.save();c.translate(x,y);c.rotate(pose.tilt);c.scale(1+Math.sin((scene.motion?t:0)*.003)*.025,1);
 if(grand){c.strokeStyle=pet.color+'80';c.lineWidth=1.2;c.beginPath();c.ellipse(0,size*.29,size*.34,size*.08,0,0,Math.PI*2);c.stroke();}
 c.drawImage(image,-size/2,-size*.65,size,size);
 const arrival=scene.petArrivals?.get(p.id),progress=arrival==null?2:(t-arrival)/1800;
 if(progress>=0&&progress<1){c.globalAlpha=1-progress;c.strokeStyle=pet.color;c.lineWidth=1.5;c.beginPath();c.ellipse(0,0,size*(.2+progress*.6),size*(.1+progress*.3),0,0,Math.PI*2);c.stroke();c.globalAlpha=1;}
 if(pet.rare&&scene.motion&&scene.budget?.level!=='light')drawRareFx(c,pet,size,t,seed);

 if(grand&&scene.motion){c.fillStyle=pet.color;for(let i=0;i<(scene.budget?.level==='light'?2:4);i++){const a=t*.0015+i*2.4;c.globalAlpha=.45+.3*Math.sin(a);c.fillRect(Math.cos(a)*size*.35,Math.sin(a*1.4)*size*.3-10,1.6,1.6);}}
 c.restore();
}
