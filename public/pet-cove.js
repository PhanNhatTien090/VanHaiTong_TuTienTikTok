import {eventPets,petRequirement,petPose} from './spirit-pets.js';
import {rimmed} from './rim-light.js?v=20261119';
import {tmOn,INK_FILL} from './ink-panel.js';
import {giftFor} from './gift-icons.js';
import {giftImg} from './skill-cutscene.js?v=20261118';
import {drawPetV2CoveScene} from './pet-v2-cove-fx.js';
import {drawPetBolt,drawRareFx,petArtFrame,premiumPetPose,PET_FACES_RIGHT as FACES_RIGHT} from './spirit-pet-art.js?v=drawn-pets-20261114';
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
export function petCoveSpots(H,featured=null,premium=null){const pets=eventPets(featured,premium),six=pets.length>5;return pets.map((pet,i)=>({pet,x:i<3||six?165+(i%3)*285:300+(i-3)*300,y:H*(i<3?.32:.515),size:Math.min(H*.095,pet.rare?155:i===4?145:125)}));}

// 15/11 (v3): thú chạy tự do khắp vùng trời Linh Thú Cốc; bảng mốc gọn thành 1 hàng có ảnh;
// thẻ "Cách nuôi linh thú" xoay từng bước để người xem biết chơi Linh Thú 2.0.
export const PET_COVE_ROAM={x0:95,x1:805,y0:.33,y1:.57};
// 15/11 (user: "họ không biết lệnh gì làm gì"): bảng lệnh cố định, lời thường dễ hiểu, sáng lần lượt từng dòng.
export const PET_COVE_GUIDE=Object.freeze([
 ['thú','xem thú của mình'],
 ['thú duyên','nhận thức ăn miễn phí'],
 ['thú nuôi','cho thú ăn · thú lên cấp'],
 ['thú luyện','luyện thú · mỗi ngày 1 lần'],
 ['thú hành hoa','thú đi thám hiểm · mang Linh Ấn về'],
 ['thú hóa','tiến hóa ở cấp 10 · 20 · 30'],
 ['thú xuất','thú ra chiêu khi đánh boss'],
 ['thú kỹ','xem cấp và chiêu của thú']
]);
const GUIDE_MS=2500;
export function petCoveGuideStep(t){const n=PET_COVE_GUIDE.length,i=Math.floor(Math.max(0,t)/GUIDE_MS)%n;return {index:i,count:n,command:PET_COVE_GUIDE[i][0],text:PET_COVE_GUIDE[i][1],k:(Math.max(0,t)%GUIDE_MS)/GUIDE_MS};}
const roamX=(i,s)=>{const w=(2*Math.PI)/(19+i*2.7),ph=i*1.93;return .5+.5*Math.sin(w*s+ph)*(.72+.28*Math.sin(w*.41*s+i));};
const roamY=(i,s)=>{const w=(2*Math.PI)/(13+i*1.9),ph=i*2.71;return .5+.5*Math.sin(w*s+ph);};
/** Vị trí thú lúc t (ms). Hàm thuần: cùng t → cùng chỗ, nên mọi máy xem giống nhau, không cần lưu trạng thái. */
export const PET_COVE_MOVE_MS=4500;
export function petCoveRoam(i,t,H,motion=true){
 // 15/11 (chủ game): thú có lúc đứng nghỉ — mỗi con chạy ~4,5 s rồi đứng 6–9 s (lệch nhịp nhau); đồng hồ đường đi chỉ chạy khi đang chạy.
 const cycle=PET_COVE_MOVE_MS+6000+(i*1300)%3000,off=(i*2711)%cycle,u=motion===false?0:Math.max(0,t+off),phase=u%cycle,moving=motion!==false&&phase<PET_COVE_MOVE_MS;
 const s=motion===false?i*3.1:(Math.floor(u/cycle)*PET_COVE_MOVE_MS+Math.min(phase,PET_COVE_MOVE_MS))/1000+i*7.3;
 const r=PET_COVE_ROAM,x=r.x0+(r.x1-r.x0)*roamX(i,s),y=H*(r.y0+(r.y1-r.y0)*roamY(i,s));
 // Hướng mặt: theo hướng đang chạy (đứng nghỉ thì giữ hướng lần chạy kế tiếp).
 const vx=motion===false?0:r.x0+(r.x1-r.x0)*roamX(i,s+.12)-x;
 return {x,y,vx,moving,depth:(y/H-r.y0)/(r.y1-r.y0)};
}
const short=p=>p.hearts>0?(Number(p.hearts).toLocaleString('vi-VN')+' tim'+(p.coins>0?' / '+p.coins+' coin':'')):(p.coins+' coin');
function fitText(c,text,x,y,max){c.fillText(text,x,y,max);}
function drawLegend(scene,c,pets,t,H){
 const n=pets.length,gap=6,left=14,w=(872-gap*(n-1))/n,top=H*.12,h=H*.066;
 for(const [i,pet] of pets.entries()){
  const x=left+i*(w+gap),cx=x+w/2;
  c.fillStyle=pet.rare?'#26124bf0':'#082636ee';c.fillRect(x,top,w,h);
  c.strokeStyle=pet.color+(pet.rare?'cc':'88');c.lineWidth=pet.rare?1.6:1;c.strokeRect(x+.5,top+.5,w-1,h-1);
  const im=petArtFrame(scene.petArt?.get(pet.id),0,0,false),th=h*.56;
  if(im)c.drawImage(im,cx-th/2,top+2,th,th);
  if(pet.rare){c.fillStyle='#ffe28a';c.font='bold 11px Arial';c.textAlign='right';c.fillText(pet.coins===300?'THIÊN LINH':'THẦN THÚ',x+w-4,top+13,w*.5);c.textAlign='center';}
  c.fillStyle=pet.color;c.font='bold 15px Arial';fitText(c,pet.name,cx,top+h*.74,w-8);
  // 17/11: luật bảng quà — ảnh quà thật thay "N coin".
  c.fillStyle='#fff1d0';c.font='bold 14px Arial';{const hearts=pet.hearts>0?Number(pet.hearts).toLocaleString('vi-VN')+' tim':'',g=pet.coins>0?giftFor(scene.lastState?.giftArt,pet.coins):null,gi=g&&giftImg(g.url),y=top+h*.92,isz=20;
   const txt=hearts+(g?(hearts?' / ':''):''),tw=c.measureText(txt).width,iw=g?(gi?isz:c.measureText(g.name+(g.count>1?' ×'+g.count:'')).width):0,x0=cx-(tw+iw)/2;
   c.textAlign='left';if(txt)c.fillText(txt,x0,y,w-8);if(g){if(gi){c.save();c.fillStyle='#fff3d0';c.globalAlpha=.85;c.beginPath();c.arc(x0+tw+isz/2,y-isz*.3,isz*.62,0,Math.PI*2);c.fill();c.restore();c.drawImage(gi,x0+tw,y-isz*.8,isz,isz);}else c.fillText(g.name,x0+tw,y,w-8-tw);if(gi&&g.count>1)c.fillText('×'+g.count,x0+tw+isz,y);}c.textAlign='center';}
 }
}
function drawGuide(scene,c,t,H){
 if(!scene.petV2Settings?.enabled)return;
 const lit=scene.motion===false?-1:petCoveGuideStep(t).index,x=14,w=872,top=H*.193,head=28,rowH=31,h=head+rowH*4+8,colW=w/2;
 c.fillStyle=tmOn()?INK_FILL:'#071b2aeb';c.fillRect(x,top,w,h);c.strokeStyle='#ffd98a88';c.lineWidth=1;c.strokeRect(x+.5,top+.5,w-1,h-1);
 c.fillStyle='#3a2a0cf0';c.fillRect(x,top,w,head);
 c.textAlign='center';c.fillStyle='#ffe2a4';c.font='bold 17px Arial';c.fillText('NUÔI LINH THÚ · GÕ LỆNH VÀO BÌNH LUẬN',450,top+20,w-20);
 for(const [i,[cmd,text]] of PET_COVE_GUIDE.entries()){
  const col=i<4?0:1,row=i%4,cx=x+col*colW,cy=top+head+4+row*rowH;
  if(i===lit){c.fillStyle='#ffd98a26';c.fillRect(cx+3,cy,colW-6,rowH-3);c.strokeStyle='#ffd98acc';c.strokeRect(cx+3.5,cy+.5,colW-7,rowH-4);}
  c.font='bold 17px Arial';const pw=Math.min(150,c.measureText(cmd).width+16);
  c.fillStyle='#0f3a3a';c.fillRect(cx+9,cy+3,pw,rowH-9);c.textAlign='center';c.fillStyle='#baffea';c.fillText(cmd,cx+9+pw/2,cy+rowH*.62,pw-6);
  c.textAlign='left';c.font=(i===lit?'bold ':'')+'16px Arial';c.fillStyle=i===lit?'#fff3cf':'#e3efe9';c.fillText('→ '+text,cx+17+pw,cy+rowH*.62,colW-pw-28);
 }
 c.textAlign='center';
}
function drawRoamer(scene,c,pet,i,t,H){
 const at=petCoveRoam(i,t,H,scene.motion),seed=i*193,pose=premiumPetPose(pet.id,t,seed,scene.motion)||petPose(t,seed,scene.motion),im=petArtFrame(scene.petArt?.get(pet.id),t,seed,scene.motion);
 const base=Math.min(H*.1,pet.rare?156:pet.coins>=100?142:128),size=base*(.86+.2*at.depth);
 const right=at.vx>0,flip=FACES_RIGHT.has(pet.id)?!right:right;
 const flying=pet.flying||pet.id==='sun-phoenix'||pet.id==='astral-dragon',hop=flying||!at.moving?0:Math.abs(Math.sin((scene.motion===false?0:t)*.006+i))*size*.07;
 c.save();c.translate(at.x+pose.sway*.4,at.y+pose.bob-hop);
 // Bóng dưới chân để thấy thú đang chạy chứ không trôi.
 c.fillStyle='#00000033';c.beginPath();c.ellipse(0,size*.42+hop,size*(.3-hop/size),size*.06,0,0,Math.PI*2);c.fill();
 const g=c.createRadialGradient(0,0,0,0,0,size*.6);g.addColorStop(0,pet.color+'30');g.addColorStop(1,pet.color+'00');c.fillStyle=g;c.fillRect(-size*.6,-size*.6,size*1.2,size*1.2);
 if(pet.fx==='lightning'&&scene.motion){const beat=Math.floor(t/900),k=(t%900)/900;if(k<.22){c.globalAlpha=1-k/.22;drawPetBolt(c,(beat%3-1)*36,-size*.6,(beat%2?-1:1)*size*.12,-size*.2,beat,'#c4b5ff',2.2);c.globalAlpha=1;}}else if(pet.fx&&scene.motion)drawRareFx(c,pet,size,t,i*131,1.4);
 c.save();c.rotate(pose.tilt*.4);if(flip)c.scale(-1,1);if(im){const rim=rimmed(im,['#fffbe8','#ffd98a'],6),k=rim===im?0:size*rim.rimPad/im.naturalWidth;c.drawImage(rim,-size/2-k,-size*.55-k,size+2*k,size+2*k);}c.restore();
 c.restore();
 return {x:at.x,y:at.y+size*.47-hop+pose.bob};
}
// Tên nhỏ dưới chân, vẽ trên cùng để không bị thú khác che: người xem nối được thú đang chạy với bảng mốc phía trên.
function drawRoamerName(c,pet,at){
 c.font='bold 15px Arial';c.textAlign='center';const tw=Math.min(170,c.measureText(pet.name).width)+14;
 c.fillStyle=tmOn()?INK_FILL:'#04121ccc';c.fillRect(at.x-tw/2,at.y,tw,20);c.fillStyle=pet.color;c.fillText(pet.name,at.x,at.y+15,160);
}
export function drawPetCove(scene,c,t,H){
 if(!petCoveOn(scene))return;const featured=scene.petEvent.featured||null,premium=scene.petEvent.premium||null,pets=eventPets(featured,premium);loadPetArt(scene,pets.map(p=>({spiritPet:p.id})));
 const seconds=Math.max(0,Math.ceil((scene.petEvent.endsAt-Date.now())/1000));
 c.save();
 const shade=c.createLinearGradient(0,0,0,H*.60);shade.addColorStop(0,'#041323c9');shade.addColorStop(.7,'#071b3666');shade.addColorStop(1,'#071b3600');c.fillStyle=shade;c.fillRect(0,0,900,H*.60);
 drawPetV2CoveScene(scene,c,t,H,'back');
 c.textAlign='center';c.fillStyle='#e9f8e5';c.font='bold 30px Arial';c.fillText('LINH THÚ CỐC',450,H*.088);
 const ph=scene.petCovePhase,phaseName=ph?.phase?({opening:'THIÊN MÔN KHAI MỞ',exploration:'TÌM LINH DUYÊN',community:'CỘNG ĐỒNG LINH THÚ',settlement:'TỔNG KẾT LINH CỐC'})[ph.phase]:'';
 const coop=ph&&Number.isFinite(ph.goal)&&ph.goal>0?` · HỢP LỰC ${Math.min(ph.joined||0,ph.goal)}/${ph.goal}${ph.rewarded?' ✓':''}`:'';
 const clock=`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`+(phaseName?' · ':''),tail=phaseName+coop;
 c.font='bold 18px Arial';const wa=c.measureText(clock).width,wb=c.measureText(tail).width,x0=450-(wa+wb)/2;
 c.textAlign='left';c.fillStyle='#99dccf';c.fillText(clock,x0,H*.11);c.fillStyle='#ffe39e';c.fillText(tail,x0+wa,H*.11);c.textAlign='center';
 drawLegend(scene,c,pets,t,H);
 drawGuide(scene,c,t,H);
 // Vẽ theo chiều sâu: con ở thấp hơn (gần hơn) vẽ sau.
 const order=pets.map((pet,i)=>({pet,i,y:petCoveRoam(i,t,H,scene.motion).y})).sort((a,b)=>a.y-b.y);
 const names=order.map(({pet,i})=>[pet,drawRoamer(scene,c,pet,i,t,H)]);for(const [pet,at] of names)drawRoamerName(c,pet,at);
 drawPetV2CoveScene(scene,c,t,H,'front');
 c.restore();
}
