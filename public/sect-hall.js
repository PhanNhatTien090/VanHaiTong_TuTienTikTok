import {artworkCrop} from './courtyard-layout.js';
import {skinFor} from './cosmetics.js';
import {drawWings} from './boss-arena.js';
import {safeAvatar} from './honors.js';
import {masterTier,drawThroneBack,drawThroneFront,drawMasterPlate} from './master-throne.js'; // 12/11: ngai Tông Chủ
// 08/11: ảnh đại diện TikTok trên đầu 2 trưởng lão. Ảnh lỗi/hết hạn thì hiện chữ cái đầu, thử lại sau 60 s.
const AVATARS=new Map();
function avatarImage(url){if(!url||typeof Image==='undefined')return null;let e=AVATARS.get(url);if(e&&e.failed&&Date.now()<e.retry)return null;if(!e||e.failed){if(AVATARS.size>40)AVATARS.delete(AVATARS.keys().next().value);const img=new Image();img.referrerPolicy='no-referrer';img.decoding='async';e={img,ready:false,failed:false};img.onload=()=>{e.ready=true;};img.onerror=()=>{e.failed=true;e.retry=Date.now()+60000;};img.src=url;AVATARS.set(url,e);}return e.ready?e.img:null;}
function drawElderAvatar(c,p,i,y){const r=34,img=avatarImage(safeAvatar(p.avatar)),ring=i===0?'#ffd76a':'#cfe6ff';c.save();c.translate(0,y);
 c.shadowColor='#000a';c.shadowBlur=8;c.fillStyle='#183843';c.beginPath();c.arc(0,0,r+5,0,Math.PI*2);c.fill();c.shadowBlur=0;
 c.save();c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.clip();if(img)c.drawImage(img,-r,-r,r*2,r*2);else{c.fillStyle='#ffe7a0';c.font='900 30px Georgia';c.textAlign='center';c.textBaseline='middle';c.fillText(Array.from(p.name||'Đ')[0]||'Đ',0,2);}c.restore();
 c.lineWidth=4;c.strokeStyle=ring;c.beginPath();c.arc(0,0,r+2,0,Math.PI*2);c.stroke();c.restore();}
export function sectHallTargets(players,H,withHalls=false){
 const n=players.length,cols=n<=3?Math.max(1,n):n<=12?4:n<=24?6:8,rows=Math.ceil(n/cols);
 const scale=n<=3?2.9:n<=4?2.7:n<=8?2.35:n<=12?2.05:n<=24?1.5:1.05;
 const gap=withHalls?Math.min(190,H*.18/Math.max(1,rows-1)):rows<=3?Math.min(220,H*.125):Math.min(170,H*.30/Math.max(1,rows-1));
 const top=withHalls?H*.68:H*.66-(Math.max(0,rows-1)*gap)/2;
 const spacing=n<=4?180:n<=12?178:760/cols;
 return players.map((player,i)=>{const row=Math.floor(i/cols),count=Math.min(cols,n-row*cols);return {id:player.id,player,x:450+(i%cols-(count-1)/2)*spacing,y:top+row*gap,scale,lift:0};});
}
export function loadSectMasterArt(scene){if(scene.sectMasterArt||scene.sectMasterArtLoading||scene.sectMasterArtRetry>Date.now()||typeof Image==='undefined')return;scene.sectMasterArtLoading=true;let im=new Image();im.onload=()=>{scene.sectMasterArt=im;scene.sectMasterArtLoading=false;};im.onerror=()=>{scene.sectMasterArtLoading=false;scene.sectMasterArtRetry=Date.now()+15000;};im.src='/assets/sect-hall-v1/sect-master-throne-v2.png';}
export function masterSeatGeometry(H,art){const iw=art?.naturalWidth||art?.width||900,ih=art?.naturalHeight||art?.height||1600,crop=artworkCrop(iw,ih,H),scale=ih/crop.sh*H/1600,height=220*scale,seatY=(ih*.352-crop.sy)/crop.sh*H;return {x:(iw*.5-crop.sx)/crop.sw*900,y:seatY,top:seatY-height*.53,height};}
export function drawSectMaster(scene,c,t){
 if(scene.environment?.layout!=='sect'||scene.sectMaster?.enabled===false||scene.raceStatus?.active||scene.socialStage?.length||scene.presentation?.until>t)return false;
 const host=scene.sectMaster||{},now=(scene.stateServerNow||Date.now())+(t-(scene.stateReceivedAt??t)),speaking=host.active===true&&(!host.until||now<host.until);
 const seat=masterSeatGeometry(scene.height,scene.art),x=seat.x,y=seat.y,age=speaking?Math.max(0,now-host.at):Infinity,appear=1,motion=scene.motion!==false,nod=motion&&age<1800?Math.sin(age*.0035)*.018:0,breathe=motion?Math.sin(t*.0018)*1.2:0;
 const p={id:'resident:sect-master',name:'Tông chủ',resident:true,gender:'nam',realm:3,giftCoins:500,equipped:null};
 let throneTier=-1;loadSectMasterArt(scene);c.save();c.globalAlpha=appear;
 if(host.source==='gift'&&host.player){
  const height=seat.height,scale=height/120,tier=masterTier(host.player.giftCoins);throneTier=tier;
  drawThroneBack(c,x,y,height,tier,t,motion); // 12/11: ngai rồng vàng vẽ 1 lần (cache) + hiệu ứng theo cấp
  drawWings(scene,c,{id:host.player.id,player:host.player,x,y,scale},t);
  c.translate(x,y);c.scale(scale,scale);const compact=scene.compact,pose=scene.cinematicPose;scene.compact=true;scene.cinematicPose={stand:0,lean:0,lift:0};
  try{scene.drawCharacterBody(c,host.player,skinFor(host.player.giftCoins),t);}finally{scene.compact=compact;scene.cinematicPose=pose;}
 }
 else if(scene.sectMasterArt){const im=scene.sectMasterArt,w=seat.height*(im.naturalWidth||im.width)/(im.naturalHeight||im.height);c.translate(x,seat.top+seat.height*.35);c.rotate(nod*.25);c.scale(1,1+breathe*.0015);c.imageSmoothingQuality='high';c.drawImage(im,-w/2,-seat.height*.35,w,seat.height);}
 else{c.translate(x,y-42);c.scale(1.35,1.35);const old=scene.compact;scene.compact=true;try{scene.drawCharacterBody(c,p,skinFor(p.giftCoins),0);}finally{scene.compact=old;}}
 c.restore();
 if(throneTier>=0)drawThroneFront(c,x,y,seat.height,throneTier,t,motion,host.player.name||'Đạo hữu');
 c.save();if(throneTier>=0)drawMasterPlate(c,x,seat.top+seat.height+8,'',throneTier);else{c.textAlign='center';c.textBaseline='middle';c.font='700 19px Georgia';const label='TÔNG CHỦ',w=c.measureText(label).width+28;c.fillStyle='#102632ed';c.fillRect(x-w/2,seat.top+seat.height+8,w,28);c.strokeStyle='#c8ab68';c.strokeRect(x-w/2,seat.top+seat.height+8,w,28);c.fillStyle='#ffe0a0';c.fillText(label,x,seat.top+seat.height+22);}
 if(throneTier<0&&host.source==='gift'&&host.player){c.font='700 18px Georgia';c.fillStyle='#fff1c4';c.fillText(host.player.name||'Đạo hữu',x,seat.top+seat.height+49,300);}
 if(speaking&&age<12000){const raw=host.text||'Chư vị đạo hữu, cùng tu luyện!',words=raw.split(/\s+/),lines=[''];c.font='600 18px Georgia';for(const word of words){const at=lines.length-1,next=(lines[at]+' '+word).trim();if(c.measureText(next).width>270&&lines[at]){if(lines.length===2){lines[at]+='…';break;}lines.push(word);}else lines[at]=next;}const width=Math.min(310,Math.max(...lines.map(s=>c.measureText(s).width))+28),h=lines.length*25+18,by=y-190-h;c.fillStyle='#0b2332f0';c.fillRect(x-width/2,by,width,h);c.strokeStyle='#d9bd7777';c.strokeRect(x-width/2,by,width,h);c.fillStyle='#f8ecd0';lines.forEach((line,i)=>c.fillText(line,x,by+21+i*25));}
 c.restore();return true;
}

// The server's active flag is the existing recent-LIVE-activity signal, not an exact viewer roster.
export function sectElders(players,hostId){return players.filter(p=>p.active&&!p.resident&&!p.puppet&&!p.webOnly&&p.id!==hostId).slice().sort((a,b)=>(Number(b.realm)||0)-(Number(a.realm)||0)||(Number(b.totalQi)||0)-(Number(a.totalQi)||0)||String(a.id).localeCompare(String(b.id))).slice(0,2);}
const hallX=index=>96+index*177;
export function seatSectElders(targets,elders,H){const ids=new Set(elders.map(p=>p.id));return [...targets.filter(a=>!ids.has(a.id)),...elders.map((player,i)=>({id:player.id,player,x:player.hallIndex==null?(i===0?260:640):hallX(player.hallIndex),y:H*(player.hallIndex==null?.435:.463),scale:player.hallIndex==null?1.9:1.12,lift:0,sectElder:i+1}))];}
export function drawSectCourt(scene,c,t){
 if(scene.environment?.layout!=='sect'||scene.raceStatus?.active||scene.socialStage?.length||scene.presentation?.until>t)return;
 const y=scene.height*.435;
 if(scene.sectHalls){
  const y=scene.height*.463, active=new Set(scene.sectElders.map(p=>p.id));
  for(const hall of scene.sectHalls){
   c.save();c.translate(hallX(hall.index),y);
   c.fillStyle='#102b32';c.strokeStyle=hall.color;c.lineWidth=2;
   c.beginPath();c.moveTo(-45,0);c.lineTo(-36,-60);c.lineTo(36,-60);c.lineTo(45,0);c.closePath();c.fill();c.stroke();
   c.fillStyle=hall.color;c.textAlign='center';c.font='700 32px Georgia';
   if(!active.has(hall.elder?.id))c.fillText(hall.mark,0,-16);
   c.fillStyle=hall.color;c.beginPath();c.moveTo(-60,-65);c.lineTo(-43,-65);c.lineTo(-48,-39);c.lineTo(-55,-42);c.closePath();c.fill();
   c.fillStyle='#092028';c.fillRect(-83,16,166,51);c.strokeRect(-83,16,166,51);
   c.fillStyle=hall.color;c.font='700 19px Georgia';c.fillText('TRƯỞNG LÃO',0,36,154);
   c.fillStyle='#f7e8c6';c.font='700 16px Georgia';c.fillText(hall.name,0,56,156);
   c.font='700 17px Georgia';c.fillStyle='#e9d7b0';c.fillText(hall.elder?.name||'Ghế trống',0,88,156);
   c.restore();
  }
 }
 if(!scene.sectHalls)for(const [i,p]of (scene.sectElders||[]).entries()){
  const x=i===0?260:640;c.save();c.translate(x,y);c.fillStyle='#122e35e8';c.strokeStyle='#bda466';c.lineWidth=2;
  c.beginPath();c.moveTo(-44,-5);c.lineTo(-44,-70);c.quadraticCurveTo(0,-98,44,-70);c.lineTo(44,-5);c.closePath();c.fill();c.stroke();
  c.fillStyle='#25444b';c.fillRect(-50,0,100,15);c.strokeRect(-50,0,100,15);c.fillStyle='#bda466';c.fillRect(-45,15,6,15);c.fillRect(39,15,6,15);
  // nhãn chữ cũ ở -115 bị tóc nhân vật che (lòi mảnh chữ); chức vị đã hiện dưới chân nên bỏ.
  drawElderAvatar(c,p,i,-178);c.restore();
 }
 drawSectMaster(scene,c,t);
}
