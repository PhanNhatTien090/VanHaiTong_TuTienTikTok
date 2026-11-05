import {petById,petPose} from './spirit-pets.js';
import {makeSurface} from './performance.js';
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
 const flying=pet.id==='sun-phoenix'||pet.id==='astral-dragon',x=target.x+scale*(30+pose.sway*.3),y=target.y+scale*(flying?-8:8)+pose.bob;
 const size=pet.size*scale,image=frames[pose.frame];if(!image)return;
 c.save();c.translate(x,y);c.rotate(pose.tilt);c.scale(1+Math.sin((scene.motion?t:0)*.003)*.025,1);
 if(['sun-phoenix','astral-dragon'].includes(pet.id)){c.strokeStyle=pet.color+'80';c.lineWidth=1.2;c.beginPath();c.ellipse(0,size*.29,size*.34,size*.08,0,0,Math.PI*2);c.stroke();}
 c.drawImage(image,-size/2,-size*.65,size,size);
 const arrival=scene.petArrivals?.get(p.id),progress=arrival==null?2:(t-arrival)/1800;
 if(progress>=0&&progress<1){c.globalAlpha=1-progress;c.strokeStyle=pet.color;c.lineWidth=1.5;c.beginPath();c.ellipse(0,0,size*(.2+progress*.6),size*(.1+progress*.3),0,0,Math.PI*2);c.stroke();c.globalAlpha=1;}
 if(['sun-phoenix','astral-dragon'].includes(pet.id)&&scene.motion){c.fillStyle=pet.color;for(let i=0;i<(scene.budget?.level==='light'?2:4);i++){const a=t*.0015+i*2.4;c.globalAlpha=.45+.3*Math.sin(a);c.fillRect(Math.cos(a)*size*.35,Math.sin(a*1.4)*size*.3-10,1.6,1.6);}}
 c.restore();
}
