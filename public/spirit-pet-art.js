import {petById,petPose} from './spirit-pets.js';
import {makeSurface} from './performance.js';
import {PET_V2_ART_APPROVED,petV2AssetSpec} from './pet-v2-art-manifest.js';
import {drawPetV2Adornment} from './pet-v2-fx.js';
import {PREMIUM_PET_ATLAS,PREMIUM_PET_PERIODS,petArtFrame,premiumPetPose} from './premium-pet-motion.js?v=drawn-v2';
export {petArtFrame,premiumPetPose} from './premium-pet-motion.js?v=drawn-v2';
// 07/11: Lôi Oa — tia sét gấp khúc nhỏ quanh thân (không phủ màn hình).
export function drawPetBolt(c,x0,y0,x1,y1,seed,color,width=1.6){let s=seed>>>0;const r=()=>((s=(s*1664525+1013904223)>>>0)/4294967296)-.5,n=6;c.save();c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.shadowColor=color;c.shadowBlur=8;c.beginPath();c.moveTo(x0,y0);for(let i=1;i<n;i++){const k=i/n,d=Math.hypot(x1-x0,y1-y0)*.18;c.lineTo(x0+(x1-x0)*k+r()*d,y0+(y1-y0)*k+r()*d);}c.lineTo(x1,y1);c.stroke();c.strokeStyle='#ffffff';c.lineWidth=width*.45;c.shadowBlur=0;c.stroke();c.restore();}
// Hiệu ứng riêng của thần thú: sét (Lôi Oa), huyết khí (Văn Thú), lửa (Kỳ Lân). Nhỏ, sát thân, không phủ màn hình.
export function drawRareFx(c,pet,size,t,seed,power=1){
 if(!pet?.fx)return;const TAU=Math.PI*2;
 if(pet.fx==='lightning'){const beat=Math.floor((t+seed%1600)/1600),k=((t+seed%1600)%1600)/1600;if(k<.16*power+.0){c.save();c.globalAlpha*=1-k/(.16*power||.16);const a=(beat*2.3)%TAU,r=size*.42;drawPetBolt(c,Math.cos(a)*r*.35,-size*.25+Math.sin(a)*r*.2,Math.cos(a)*r,-size*.12+Math.sin(a*1.7)*r*.45,beat+seed,'#b9a8ff',1.3*power);c.restore();}return;}
 if(pet.coins===300){
  const color=pet.color,r=size*.48,n=Math.round(9*power);
  c.save();c.globalCompositeOperation='screen';
  for(let i=0;i<n;i++){
   const u=(t*.0007+i/n+seed%97/97)%1,a=i*2.399+t*.0016,x=Math.cos(a)*r*(.6+u*.5),y=Math.sin(a)*r*.62-u*size*.26;
   c.globalAlpha=Math.sin(u*Math.PI)*.85;c.fillStyle=color;c.strokeStyle=color;c.lineWidth=1.2;
   const s=(2.2+power*2)*(1-u);
   if(pet.fx==='pearl'){c.beginPath();c.arc(x,y,s+1,0,TAU);c.stroke();}
   else if(pet.fx==='moon'){c.beginPath();c.arc(x,y,s+2,a,a+Math.PI*1.4);c.stroke();}
   else if(pet.fx==='flame'){c.beginPath();c.moveTo(x,y+s);c.quadraticCurveTo(x-5*s,y,x,y-5*s);c.quadraticCurveTo(x+3*s,y,x,y+s);c.fill();}
   else{c.beginPath();c.moveTo(x,y-s*2);c.lineTo(x+s*.35,y);c.lineTo(x,y+s*2);c.lineTo(x-s*.35,y);c.closePath();c.fill();}
  }
  for(let j=0;j<2;j++){
   const wave=t*.0025+j*Math.PI,flow=Math.sin(wave),spread=size*(.28+j*.1);
   c.globalAlpha=.35;c.strokeStyle=j?'#fff4d8':color;c.lineWidth=(j?1:2)*Math.min(1.5,power);
   c.beginPath();c.moveTo(-spread,size*.06);
   c.bezierCurveTo(-spread*.5,size*(-.15+flow*.12),spread*.2,size*(.28-flow*.1),spread,size*.04);c.stroke();
  }
  c.globalAlpha=.32+.16*Math.sin(t*.004);c.strokeStyle=color;c.lineWidth=1.4;
  c.beginPath();c.ellipse(0,size*.18,r,r*.28,-.1,0,TAU);c.stroke();
  c.restore();return;
 }
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
const PET_FRAME_CACHE=new Map();
export function slicePremiumPetFrames(image,id,make=makeSurface){
 const a=PREMIUM_PET_ATLAS;
 if(image.width!==a.size*a.columns||image.height!==a.size*Math.ceil(a.frames/a.columns))throw Error('Invalid premium pet atlas: '+id);
 const frames=Array.from({length:a.frames},(_,i)=>{
  const frame=make(a.size,a.size);frame.getContext('2d').drawImage(image,(i%a.columns)*a.size,Math.floor(i/a.columns)*a.size,a.size,a.size,0,0,a.size,a.size);return frame;
 });
 frames.period=PREMIUM_PET_PERIODS[id];return frames;
}
function fetchPetFrames(id,animated=!!PREMIUM_PET_PERIODS[id]){
 return new Promise((resolve,reject)=>{
  const image=new Image();image.decoding='async';
  image.onload=()=>{try{resolve(animated?slicePremiumPetFrames(image,id):slicePetFrames(image,id));}catch(e){reject(e);}};
  image.onerror=()=>animated?fetchPetFrames(id,false).then(resolve,reject):reject(Error('Pet artwork unavailable: '+id));
  image.src='/assets/spirit-pets-v1/'+(animated?'animated/'+id+'-'+PREMIUM_PET_ATLAS.version+'.webp':id+'.png');
 });
}
// 15/11: ảnh nhỏ cho bảng xem linh thú — dùng chung cache khung với sân khấu.
const PET_V2_THUMB_CACHE=new Map();
export function petThumbFrames(id,stage=0){
 if(typeof Image==='undefined'||!petById(id))return Promise.resolve(null);
 const base=()=>{
  if(!PET_FRAME_CACHE.has(id))PET_FRAME_CACHE.set(id,fetchPetFrames(id).catch(e=>{PET_FRAME_CACHE.delete(id);throw e;}));
  return PET_FRAME_CACHE.get(id);
 };
 if(!PET_V2_ART_APPROVED||!Number.isInteger(stage)||stage<1||stage>3)return base();
 const spec=petV2AssetSpec(id,stage);if(!spec)return base();
 const key=id+':'+stage;if(PET_V2_THUMB_CACHE.has(key))return PET_V2_THUMB_CACHE.get(key);
 const result=new Promise((resolve)=>{
  const im=new Image();im.decoding='async';
  im.onload=()=>{
   if(im.width!==spec.cols*spec.size||im.height!==spec.rows*spec.size){base().then(resolve).catch(()=>resolve(null));return;}
   const f=makeSurface(spec.size,spec.size);
   if(!f){base().then(resolve).catch(()=>resolve(null));return;}
   f.getContext('2d').drawImage(im,0,0,spec.size,spec.size,0,0,spec.size,spec.size);
   resolve([f]);
  };
  im.onerror=()=>base().then(resolve).catch(()=>resolve(null));
  im.src=spec.path;
 });
 PET_V2_THUMB_CACHE.set(key,result);
 while(PET_V2_THUMB_CACHE.size>16)PET_V2_THUMB_CACHE.delete(PET_V2_THUMB_CACHE.keys().next().value);
 return result;
}
// Evolved animation loads lazily; never replaces any of the thirteen original pose atlases.
// Absent/unapproved stage artwork immediately falls back to all original moving frames.
// Unlike legacy astral-dragon.png (three unequal cropped source columns), each
// generated V2 stage atlas has equal-size 160px cells. Never use slicePetFrames
// here: it would break the original dragon's separate proportions.
export function slicePetEvolutionFrames(image,spec,make=makeSurface){
 if(!spec||image.width!==spec.cols*spec.size||image.height!==spec.rows*spec.size)throw Error('Invalid evolution atlas dimensions');
 const frames=Array.from({length:spec.frames},(_,i)=>{
  const f=make(spec.size,spec.size);if(!f)throw Error('Could not allocate evolved pet frame');
  f.getContext('2d').drawImage(image,(i%spec.cols)*spec.size,Math.floor(i/spec.cols)*spec.size,spec.size,spec.size,0,0,spec.size,spec.size);
  return f;
 });
 if(spec.frames===8)frames.period=PREMIUM_PET_PERIODS[spec.id];
 return frames;
}
const PET_V2_FRAME_CACHE=new Map(),PET_V2_BAD_ASSETS=new Set();
const PET_V2_CACHE_LIMIT=8*1024*1024, PET_V2_MAX_LOADING=2;
const petV2Key=(id,stage)=>id+':stage'+stage;
const petV2LoadQueue=[];let petV2ActiveLoads=0;
function pumpPetV2Loads(){
 while(petV2ActiveLoads<PET_V2_MAX_LOADING&&petV2LoadQueue.length){
  const task=petV2LoadQueue.shift();
  petV2ActiveLoads++;
  const finish=(value,error)=>{petV2ActiveLoads--;if(error)task.reject(error);else task.resolve(value);pumpPetV2Loads();};
  const im=new Image();im.decoding='async';
  im.onload=()=>{try{
   const {spec,id}=task;
   if(im.width!==spec.cols*spec.size||im.height!==spec.rows*spec.size)throw Error('Evolved atlas dimensions invalid');
   const frames=slicePetEvolutionFrames(im,spec);
   if(frames.length!==spec.frames||frames.some(f=>!f))throw Error('Evolved atlas frame coverage invalid');
   finish(frames,null);
  }catch(err){finish(null,err);}};
  im.onerror=()=>finish(null,Error('Evolved atlas unavailable: '+task.key));
  im.src=task.spec.path;
 }
}
function requestPetV2Frames(spec,id,key){
 return new Promise((resolve,reject)=>{petV2LoadQueue.push({spec,id,key,resolve,reject});pumpPetV2Loads();});
}
export function petV2FramesFor(scene,p){
 const id=p?.spiritPet;
 const stage=Math.max(0,Math.min(3,Math.floor(p?.petView?.stage||0)));
 return (PET_V2_ART_APPROVED&&scene.petV2Settings?.evolutionArt===true&&stage&&scene.petArt?.get(petV2Key(id,stage)))||scene.petArt?.get(id)||null;
}
function loadPetEvolution(scene,id,stage){
 if(!PET_V2_ART_APPROVED||scene.petV2Settings?.evolutionArt!==true||!stage||typeof Image==='undefined')return;
 const spec=petV2AssetSpec(id,stage);
 if(!spec)return;
 const key=petV2Key(id,stage);
 if(scene.petArt.has(key)||PET_V2_BAD_ASSETS.has(key))return;
 scene.petArt.set(key,null);
 if(!PET_V2_FRAME_CACHE.has(key)){
  const job=requestPetV2Frames(spec,id,key);
  PET_V2_FRAME_CACHE.set(key,job);
 }
 PET_V2_FRAME_CACHE.get(key).then(frames=>{
  if(!scene.petArt||!scene.petArt.has(key))return;
  const bytes=frames.reduce((n,f)=>n+f.width*f.height*4,0);
  // Keep a hard limit for evictable evolved art; base sprite cache remains untouched.
  if(!scene.petV2FrameLru)scene.petV2FrameLru=new Map();
  scene.petV2FrameLru.set(key,bytes);
  while([...scene.petV2FrameLru.values()].reduce((a,b)=>a+b,0)>PET_V2_CACHE_LIMIT&&scene.petV2FrameLru.size>1){
   const oldest=scene.petV2FrameLru.keys().next().value;
   scene.petV2FrameLru.delete(oldest);scene.petArt.delete(oldest);PET_V2_FRAME_CACHE.delete(oldest);
  }
  scene.petArt.set(key,frames);
 }).catch(()=>{PET_V2_BAD_ASSETS.add(key);scene.petArt?.delete(key);PET_V2_FRAME_CACHE.delete(key);});
}

export function loadPetArt(scene,players){
 scene.petArt??=new Map();if(typeof Image==='undefined')return;
 for(const p of players){const pet=petById(p.spiritPet);if(!pet)continue;
  if(PET_V2_ART_APPROVED&&p.petView?.stage>0)loadPetEvolution(scene,pet.id,p.petView.stage);
  if(scene.petArt.has(pet.id))continue;
  scene.petArt.set(pet.id,null);
  if(!PET_FRAME_CACHE.has(pet.id))PET_FRAME_CACHE.set(pet.id,fetchPetFrames(pet.id).catch(e=>{PET_FRAME_CACHE.delete(pet.id);throw e;}));
  PET_FRAME_CACHE.get(pet.id).then(frames=>scene.petArt.set(pet.id,frames)).catch(()=>scene.petArt.delete(pet.id));
 }
}
// Ảnh gốc phần lớn nhìn sang TRÁI; các con dưới đây nhìn sang PHẢI.
export const PET_FACES_RIGHT=new Set(['sun-phoenix','hac-tinh-ho','xich-ha-phuong']);
/** Vị trí thú so với chân chủ lúc t. Hàm thuần theo id người chơi → mỗi thú lệch nhịp, mọi máy xem giống nhau.
 * 15/11 (chủ game: "lâu lâu mới đi"): thú đứng yên một bên chân chủ ~15–25 s, rồi đi 3 s sang bên kia (qua phía trước) và đứng lại. */
export const PET_WALK_MS=3000;
export function petFollowOffset(playerId='',petId='',t=0,scale=1,flying=false,motion=true){
 let seed=0;for(const ch of String(playerId))seed=(seed*31+ch.charCodeAt(0))>>>0;
 const cycle=15000+seed%10000,offset=seed%cycle,LEFT=Math.PI*.86,RIGHT=Math.PI*.14;
 let a,walking=false,dir=0;
 if(motion===false)a=seed%2?LEFT:RIGHT;
 else{const n=Math.floor((t+offset)/cycle),u=(t+offset)%cycle,from=(n+seed)%2?LEFT:RIGHT,to=from===LEFT?RIGHT:LEFT,start=cycle-PET_WALK_MS;
  if(u<start)a=from;else{const p=(u-start)/PET_WALK_MS,e=p*p*(3-2*p);a=from+(to-from)*e;walking=true;dir=to<from?1:-1;}}
 const rx=(flying?40:36)*scale,ry=(flying?12:11)*scale,x=Math.cos(a)*rx,y=(flying?-26*scale:9*scale)+Math.sin(a)*ry;
 // Đang đi: nhìn theo hướng đi. Đứng yên: quay mặt về phía chủ.
 const right=walking?dir>0:x<0;
 return {x,y,walking,flip:PET_FACES_RIGHT.has(petId)?!right:right,behind:false};
}
export function drawPet(scene,c,target,t){
 const p=target.player,pet=petById(p.spiritPet),frames=pet&&petV2FramesFor(scene,p);if(!frames)return;
 let seed=0;for(const ch of p.id)seed=(seed*31+ch.charCodeAt(0))>>>0;
 const pose=premiumPetPose(pet.id,t,seed%1000,scene.motion)||petPose(t,seed%1000,scene.motion),scale=target.scale||1.4;
 // Small follower beside the feet: no full-screen halo, no additional stage actors.
 const flying=pet.id==='sun-phoenix'||pet.id==='astral-dragon'||!!pet.flying,grand=flying||pet.rare;
 // 15/11 (chủ game: linh thú là chủ chốt): thú đi quanh chủ — thú chạy đi chạy lại nửa vòng trước chân, thú bay lượn vòng quanh vai.
 const at=petFollowOffset(p.id,pet.id,t,scale,flying,scene.motion),x=target.x+at.x+pose.sway*.3*scale,y=target.y+at.y+pose.bob;
 const size=pet.size*scale*1.2,image=petArtFrame(frames,t,seed%1000,scene.motion);if(!image)return;
 c.save();c.translate(x,y);c.rotate(pose.tilt);c.scale(1+Math.sin((scene.motion?t:0)*.003)*(pet.coins===300?.012:.025),1);
 if(grand){c.strokeStyle=pet.color+'80';c.lineWidth=1.2;c.beginPath();c.ellipse(0,size*.29,size*.34,size*.08,0,0,Math.PI*2);c.stroke();}
 if(at.behind)c.globalAlpha=.78;c.save();if(at.flip)c.scale(-1,1);c.drawImage(image,-size/2,-size*.65,size,size);c.restore();c.globalAlpha=1;
 if(!scene.petV2Settings?.evolutionArt||!scene.petArt?.get(petV2Key(p.spiritPet,p.petView?.stage)))drawPetV2Adornment(c,pet,p.petView,t,size,{motion:scene.motion,light:scene.budget?.level==='light'||scene.heavyCrowd});
 const arrival=scene.petArrivals?.get(p.id),progress=arrival==null?2:(t-arrival)/1800;
 if(progress>=0&&progress<1){c.globalAlpha=1-progress;c.strokeStyle=pet.color;c.lineWidth=1.5;c.beginPath();c.ellipse(0,0,size*(.2+progress*.6),size*(.1+progress*.3),0,0,Math.PI*2);c.stroke();c.globalAlpha=1;}
 const petLight=scene.budget?.level==='light'||scene.budget?.crowded||scene.budget?.pressured; // 15/11: sân đông/FPS thấp → chỉ hình thú
 if(pet.rare&&scene.motion&&!petLight)drawRareFx(c,pet,size,t,seed);

 if(grand&&scene.motion&&!petLight){c.fillStyle=pet.color;for(let i=0;i<(scene.budget?.level==='light'?2:4);i++){const a=t*.0015+i*2.4;c.globalAlpha=.45+.3*Math.sin(a);c.fillRect(Math.cos(a)*size*.35,Math.sin(a*1.4)*size*.3-10,1.6,1.6);}}
 c.restore();
}
