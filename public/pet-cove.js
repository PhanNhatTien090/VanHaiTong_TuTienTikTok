import {SPIRIT_PETS,eventPets,petRequirement,petPose} from './spirit-pets.js';
import {drawPetBolt,drawRareFx,petArtFrame,premiumPetPose} from './spirit-pet-art.js?v=drawn-pets-20261114';
import {loadPetArt} from './spirit-pet-art.js?v=drawn-pets-20261114';
export const PET_COVE_MAP={id:'pet-cove',name:'Linh Thú Cốc',image:'/assets/maps-v3/pet-cove.png',ambience:'jade',floorY:.76,layout:'ground'};
export function petCoveOn(scene,now=Date.now()){
 return !!(scene.petEvent?.active&&scene.petEvent.endsAt>now&&!scene.boss&&!scene.raceStatus?.active&&!scene.socialScene&&!scene.socialStage?.length);
}
export function petCoveTargets(players,H){
 const cols=players.length>24?8:players.length>12?6:players.length>5?5:Math.max(1,players.length),rows=Math.max(1,Math.ceil(players.length/cols));
 return players.map((player,i)=>{const row=Math.floor(i/cols),count=Math.min(cols,players.length-row*cols);return {id:player.id,player,x:90+(i%cols+.5)*(720/count),y:H*(.67+(rows===1?0:row/(rows-1)*.20)),scale:players.length>30?.9:1.18,lift:0};});
}
// 07/11: lượt có thần thú hiếm → 2 hàng × 3 con; thần thú đứng cuối hàng dưới, to nhất.
export function petCoveSpots(H,featured=null,premium=null){const pets=eventPets(featured,premium),six=pets.length>5;return pets.map((pet,i)=>({pet,x:i<3||six?165+(i%3)*285:300+(i-3)*300,y:H*(i<3?.27:.47),size:pet.rare?155:i===4?145:125}));}
export function drawPetCove(scene,c,t,H){
 if(!petCoveOn(scene))return;const featured=scene.petEvent.featured||null,premium=scene.petEvent.premium||null;loadPetArt(scene,eventPets(featured,premium).map(p=>({spiritPet:p.id})));
 const seconds=Math.max(0,Math.ceil((scene.petEvent.endsAt-Date.now())/1000));
 c.save();
 const shade=c.createLinearGradient(0,0,0,H*.60);shade.addColorStop(0,'#041323c9');shade.addColorStop(.7,'#071b3666');shade.addColorStop(1,'#071b3600');c.fillStyle=shade;c.fillRect(0,0,900,H*.60);
 c.textAlign='center';c.fillStyle='#e9f8e5';c.font='bold 32px Arial';c.fillText('LINH THÚ CỐC',450,H*.105);c.font='20px Arial';c.fillStyle='#99dccf';c.fillText(`BẮT LINH THÚ · ${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`,450,H*.128);
 for(const [i,spot] of petCoveSpots(H,featured,premium).entries()){
  const {pet,x,y,size}=spot,pose=premiumPetPose(pet.id,t,i*193,scene.motion)||petPose(t,i*193,scene.motion),im=petArtFrame(scene.petArt?.get(pet.id),t,i*193,scene.motion);
  // Requirement is directly ABOVE each animal, never hidden in a rotating table.
  const w=pet.rare?262:i===4?(featured?262:280):250,top=y-125;
  if(pet.rare){c.fillStyle='#ffe28a';c.font='bold 15px Arial';c.fillText(pet.coins===300?'THIÊN LINH THÚ · 300 COIN':'THẦN THÚ · 200 COIN',x,top-9,w);}
  c.fillStyle=pet.rare?'#2a1550f0':i===4?'#291b40e8':'#0a2838e8';c.fillRect(x-w/2,top,w,53);c.strokeStyle=pet.color+'80';c.lineWidth=1;c.strokeRect(x-w/2,top,w,53);
  c.fillStyle=pet.color;c.font='bold 19px Arial';c.fillText(pet.name,x,top+21,w-10);c.fillStyle='#fff1d0';c.font='bold 18px Arial';c.fillText(petRequirement(pet),x,top+44,w-8);
  c.save();c.translate(x+pose.sway*.6,y+pose.bob);c.rotate(pose.tilt*.4);
  const g=c.createRadialGradient(0,18,0,0,18,size*.62);g.addColorStop(0,pet.color+'35');g.addColorStop(1,pet.color+'00');c.fillStyle=g;c.fillRect(-size*.65,-size*.55,size*1.3,size*1.3);
  if(pet.fx==='lightning'&&scene.motion){const beat=Math.floor(t/900),k=(t%900)/900;if(k<.22){c.globalAlpha=1-k/.22;drawPetBolt(c,(beat%3-1)*40,-size*.62,(beat%2?-1:1)*size*.12,-size*.2,beat,'#c4b5ff',2.2);c.globalAlpha=1;}}else if(pet.fx&&scene.motion)drawRareFx(c,pet,size,t,i*131,1.6);
  if(im)c.drawImage(im,-size/2,-size*.52,size,size);
  c.restore();
 }
 c.fillStyle='#0c243bca';c.fillRect(110,H*.578,680,41);c.font='bold 21px Arial';c.fillStyle='#ffffff';c.fillText('Đủ mốc tự nhận · Gõ thú xem tiến độ · Linh thú giữ vĩnh viễn',450,H*.578+27,660);
 c.restore();
}
