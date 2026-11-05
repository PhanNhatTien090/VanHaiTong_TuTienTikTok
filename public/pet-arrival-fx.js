import {petById,petPose} from './spirit-pets.js';
const TAU=Math.PI*2,clamp=v=>Math.max(0,Math.min(1,v)),ease=v=>1-(1-clamp(v))**3;
export function petArrivalProfile(e){
 if(!e?.petAward)return null;const pet=petById(e.petId);if(!pet)return null;
 const mythic=pet.id==='astral-dragon',vip=mythic||pet.id==='sun-phoenix';return {pet,vip,mythic,duration:mythic?7500:vip?6000:2600};
}
export function petArrivalPath(k,target,mythic=false,motion=true){
 const scale=target.scale||1.4,end={x:target.x+30*scale,y:target.y-8*scale},start={x:target.x+(mythic?-105:100),y:target.y-170};
 if(!motion)return {...start,size:mythic?260:210};
 const enter=ease(k/.32),leave=ease((k-.7)/.3),orbit=Math.max(0,Math.sin(clamp((k-.22)/.5)*Math.PI)),a=k*TAU*1.5;
 const x=start.x+(target.x-start.x)*enter+Math.cos(a)*orbit*70,y=start.y-Math.sin(enter*Math.PI)*45+Math.sin(a)*orbit*24;
 return {x:x+(end.x-x)*leave,y:y+(end.y-y)*leave,size:(mythic?260:210)*(1-leave)+(mythic?50:46)*scale*leave};
}
export function drawPetArrival(scene,c,e,t,target,H,layer){
 const profile=petArrivalProfile(e);if(!profile)return false;
 const k=clamp((t-e.start)/(e.duration||profile.duration)),motion=scene.motion!==false,light=scene.budget?.level==='light',pet=profile.pet,scale=target.scale||1.4;
 const alpha=Math.min(1,k*7,(1-k)*8),phase=motion?k:0.42,pulse=motion?1+Math.sin(k*30)*.035:1;
 const frames=scene.petArt?.get(pet.id),pose=petPose(motion?t:0,0,motion),path=petArrivalPath(k,target,profile.mythic,motion);
 c.save();c.globalAlpha=alpha;
 if(layer==='back'){
  const r=(profile.vip?95:48)*scale*pulse,cy=target.y+10;
  c.strokeStyle=pet.color;c.lineWidth=profile.mythic?2.2:1.5;
  for(let ring=0;ring<(profile.vip?3:1);ring++){c.save();c.translate(target.x,cy);c.scale(1,.3);c.rotate((ring%2?-1:1)*phase*TAU*.6);c.beginPath();c.ellipse(0,0,r+ring*11,r+ring*11,0,0,TAU);c.stroke();
   const n=profile.mythic?10:6;for(let i=0;i<n;i++){const a=i*TAU/n,x=Math.cos(a)*(r+ring*11),y=Math.sin(a)*(r+ring*11);c.fillStyle=pet.color;c.fillRect(x-2,y-2,4,4);}c.restore();}
  if(profile.vip){const glow=c.createRadialGradient(path.x,path.y,0,path.x,path.y,145);glow.addColorStop(0,pet.color+'70');glow.addColorStop(1,pet.color+'00');c.fillStyle=glow;c.fillRect(path.x-145,path.y-145,290,290);
   c.strokeStyle=pet.color+'b0';c.lineWidth=2;for(let i=0;i<3;i++){c.beginPath();const a=phase*TAU*(profile.mythic?2:-1)+i*TAU/3;c.arc(path.x,path.y,70+i*13,a,a+Math.PI*.7);c.stroke();}
  }
 }else if(layer==='front'){
  const n=profile.vip?(light?18:34):8;c.fillStyle=pet.color;
  for(let i=0;i<n;i++){const a=i*2.399+phase*TAU,r=25+((i*31+phase*160)%135),x=target.x+Math.cos(a)*r*scale,y=target.y-60-Math.sin(a)*r*.5*scale-phase*35;
   c.globalAlpha=alpha*(.3+.6*(1-(r-25)/135));c.save();c.translate(x,y);c.rotate(a);if(pet.id==='sun-phoenix'){c.beginPath();c.ellipse(0,0,2.4,9,0,0,TAU);c.fill();}else{c.fillRect(-1.5,-4,3,8);c.fillRect(-4,-1,8,2);}c.restore();}
  c.globalAlpha=alpha;
  if(frames?.[pose.frame]){c.save();c.translate(path.x,path.y);c.rotate(motion?Math.sin(phase*TAU*2)*.08:0);c.drawImage(frames[pose.frame],-path.size/2,-path.size/2,path.size,path.size);c.restore();}
 }
 c.restore();return true;
}
export function drawPetArrivalTitle(c,e,t,H,motion=true){
 const p=petArrivalProfile(e);if(!p?.vip)return;const k=clamp((t-e.start)/(e.duration||p.duration));if(k<.12||k>.84)return;
 c.save();c.globalAlpha=Math.min(1,(k-.12)*12,(.84-k)*10);c.translate(450,H*.29-(motion?Math.sin(k*Math.PI)*8:0));c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';
 c.font='600 35px Georgia';c.lineWidth=5;c.strokeStyle='#102033';c.strokeText(p.pet.name.toUpperCase(),0,0);c.fillStyle=p.pet.color;c.fillText(p.pet.name.toUpperCase(),0,0);
 c.font='600 20px Segoe UI';c.lineWidth=4;const name=Array.from(String(e.name||'Đạo hữu').normalize('NFC')).slice(0,26).join(''),line='ĐỒNG HÀNH CÙNG '+name;c.strokeText(line,0,35);c.fillStyle='#fff4d4';c.fillText(line,0,35);c.restore();
}
