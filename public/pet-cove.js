import {SPIRIT_PETS,petRequirement,petPose} from './spirit-pets.js';
import {loadPetArt} from './spirit-pet-art.js';
export const PET_COVE_MAP={id:'pet-cove',name:'Linh Thú Cốc',image:'/assets/arena-v1/boss-arena.png',ambience:'jade',floorY:.76,layout:'ground'};
export function petCoveOn(scene,now=Date.now()){
 return !!(scene.petEvent?.active&&scene.petEvent.endsAt>now&&!scene.boss&&!scene.raceStatus?.active&&!scene.socialScene&&!scene.socialStage?.length);
}
export function petCoveTargets(players,H){
 const cols=players.length>24?8:players.length>12?6:players.length>5?5:Math.max(1,players.length),rows=Math.max(1,Math.ceil(players.length/cols));
 return players.map((player,i)=>{const row=Math.floor(i/cols),count=Math.min(cols,players.length-row*cols);return {id:player.id,player,x:90+(i%cols+.5)*(720/count),y:H*(.67+(rows===1?0:row/(rows-1)*.20)),scale:players.length>30?.9:1.18,lift:0};});
}
export function petCoveSpots(H){return SPIRIT_PETS.map((pet,i)=>({pet,x:i<3?165+i*285:300+(i-3)*300,y:H*(i<3?.27:.47),size:i===4?145:125}));}
export function drawPetCove(scene,c,t,H){
 if(!petCoveOn(scene))return;loadPetArt(scene,SPIRIT_PETS.map(p=>({spiritPet:p.id})));
 const seconds=Math.max(0,Math.ceil((scene.petEvent.endsAt-Date.now())/1000));
 c.save();
 const shade=c.createLinearGradient(0,0,0,H*.60);shade.addColorStop(0,'#041323c9');shade.addColorStop(.7,'#071b3666');shade.addColorStop(1,'#071b3600');c.fillStyle=shade;c.fillRect(0,0,900,H*.60);
 c.textAlign='center';c.fillStyle='#e9f8e5';c.font='bold 32px Arial';c.fillText('LINH THÚ CỐC',450,H*.07);c.font='20px Arial';c.fillStyle='#99dccf';c.fillText(`BẮT LINH THÚ · ${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`,450,H*.10);
 for(const [i,spot] of petCoveSpots(H).entries()){
  const {pet,x,y,size}=spot,pose=petPose(t,i*193,scene.motion),im=scene.petArt?.get(pet.id)?.[pose.frame];
  // Requirement is directly ABOVE each animal, never hidden in a rotating table.
  const w=i===4?280:250,top=y-125;
  c.fillStyle=i===4?'#291b40e8':'#0a2838e8';c.fillRect(x-w/2,top,w,53);c.strokeStyle=pet.color+'80';c.lineWidth=1;c.strokeRect(x-w/2,top,w,53);
  c.fillStyle=pet.color;c.font='bold 19px Arial';c.fillText(pet.name,x,top+21,w-10);c.fillStyle='#fff1d0';c.font='bold 18px Arial';c.fillText(petRequirement(pet),x,top+44,w-8);
  c.save();c.translate(x,y+pose.bob);c.rotate(pose.tilt*.4);
  const g=c.createRadialGradient(0,18,0,0,18,size*.62);g.addColorStop(0,pet.color+'35');g.addColorStop(1,pet.color+'00');c.fillStyle=g;c.fillRect(-size*.65,-size*.55,size*1.3,size*1.3);
  if(im)c.drawImage(im,-size/2,-size*.52,size,size);
  c.restore();
 }
 c.fillStyle='#0c243bca';c.fillRect(110,H*.578,680,41);c.font='bold 21px Arial';c.fillStyle='#ffffff';c.fillText('Đủ mốc tự nhận · Gõ thú xem tiến độ · Linh thú giữ vĩnh viễn',450,H*.578+27,660);
 c.restore();
}
