import {artworkCrop} from './courtyard-layout.js';
import {tmOn} from './ink-panel.js';
import {skinFor} from './cosmetics.js';
import {drawWings} from './boss-arena.js';
import {safeAvatar} from './honors.js';
import {masterTier,drawThroneBack,drawThroneFront,drawMasterPlate} from './master-throne.js'; // 12/11: ngai Tông Chủ
import {drawCourtAdornment,showsBlackGoldGear} from './court-art.js?v=karma-halo-v5';
import {drawMount} from './mount-fx.js'; // 18/11: tọa kỹ Tông chủ phục cạnh ngai
// 08/11: ảnh đại diện TikTok trên đầu 2 trưởng lão. Ảnh lỗi/hết hạn thì hiện chữ cái đầu, thử lại sau 60 s.
const AVATARS=new Map(), SEATS=new Map();
function courtSeat(kind){
 if(typeof Image==='undefined')return null;
 // 19/11 Thủy Mặc: ngai/ghế → ĐỆM NGỒI (bồ đoàn) trên đài sen ngọc; anchor = điểm ngồi tính từ đỉnh ảnh.
 const tm=tmOn(),key=kind+(tm?'-tm':'');
 if(!SEATS.has(key)){const image=new Image();image.decoding='async';image.src='/assets/thien-khuyet/'+key+'.webp';if(tm){image.anchor=kind==='throne'?.40:.33;image.dyk=.15;image.wk=kind==='throne'?.62:.72;}SEATS.set(key,image);}
 const art=SEATS.get(key);return art.complete&&art.naturalWidth?art:null;
}
function paintSeat(c,art,x,y,w){
 const h=w*art.naturalHeight/art.naturalWidth;
 c.drawImage(art,x-w/2,y-h*(art.anchor??.79)+w*(art.dyk||0),w,h);
}
function avatarImage(url){if(!url||typeof Image==='undefined')return null;let e=AVATARS.get(url);if(e&&e.failed&&Date.now()<e.retry)return null;if(!e||e.failed){if(AVATARS.size>40)AVATARS.delete(AVATARS.keys().next().value);const img=new Image();img.referrerPolicy='no-referrer';img.decoding='async';e={img,ready:false,failed:false};img.onload=()=>{e.ready=true;};img.onerror=()=>{e.failed=true;e.retry=Date.now()+60000;};img.src=url;AVATARS.set(url,e);}return e.ready?e.img:null;}
function drawElderAvatar(c,p,i,y){const r=34,img=avatarImage(safeAvatar(p.avatar)),ring=i===0?'#ffd76a':'#cfe6ff';c.save();c.translate(0,y);
 c.shadowColor='#000a';c.shadowBlur=8;c.fillStyle='#183843';c.beginPath();c.arc(0,0,r+5,0,Math.PI*2);c.fill();c.shadowBlur=0;
 c.save();c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.clip();if(img)c.drawImage(img,-r,-r,r*2,r*2);else{c.fillStyle='#ffe7a0';c.font='900 30px Georgia';c.textAlign='center';c.textBaseline='middle';c.fillText(Array.from(p.name||'Đ')[0]||'Đ',0,2);}c.restore();
 c.lineWidth=4;c.strokeStyle=ring;c.beginPath();c.arc(0,0,r+2,0,Math.PI*2);c.stroke();c.restore();}
export function sectHallTargets(players,H,withHalls=false,newIds=null){
 const halls=Array.isArray(withHalls)?withHalls:withHalls?Array.from({length:5},(_,index)=>({index})):[];
 if(halls.length){
  const cols=halls.length,columns=new Map(halls.map((h,i)=>[h.index,i]));
  const groups=halls.map(()=>[]),visitors=[];
  for(const player of players){
   if(columns.has(player.sectHallIndex))groups[columns.get(player.sectHallIndex)].push(player);
   else visitors.push(player);
  }
  // Keep feet and nameplates above the bottom 30% occupied by LIVE comments.
  const rows=Math.max(2,...groups.map(g=>g.length),Math.ceil(players.length/cols));
  const top=H*(tmOn()?.568:.54),bottom=H*(tmOn()?.69:.675),step=(bottom-top)/(rows-1); // 19/11 Thủy Mặc: chừa chỗ thẻ Trưởng Lão
  const scale=Math.min(Math.max(.62,Math.min(1.2,step/90)),5.6/cols) /* 15/11: người to hơn ~15% */,targets=[],occupied=new Set();
  // 15/11: hàng so le trái/phải trong mỗi cột → tên hàng trên không đè lên đầu người hàng dưới.
  const sway=row=>(row%2?1:-1)*(885/Math.max(5,cols))*.2;
  for(const [index,members] of groups.entries()){
   members.sort((a,b)=>(a.sectHallDiscipleRank??999)-(b.sectHallDiscipleRank??999)||(a.joinedAt||0)-(b.joinedAt||0)||String(a.id).localeCompare(String(b.id)));
   members.forEach((player,row)=>{
    occupied.add(row*cols+index);
    targets.push({id:player.id,player,x:hallX(index,cols)+sway(row),y:top+row*step,scale,lift:0});
   });
  }
  // Scatter visitors into free places around the columns, never into the comment area.
  const seed=id=>{let h=2166136261;for(const ch of String(id))h=Math.imul(h^ch.charCodeAt(0),16777619);return (h>>>0)/4294967296;};
  const free=Array.from({length:rows*cols},(_,i)=>i).filter(i=>!occupied.has(i));
  free.sort((a,b)=>seed('seat:'+a)-seed('seat:'+b));
  visitors.sort((a,b)=>seed(a.id)-seed(b.id));
  // 19/11 Tân Đệ Tử: người mới (chưa có Đường) lấy ô HÀNG TRƯỚC gần GIỮA (vẫn trên vùng bình luận), không rơi lên hàng sát bảng Trưởng Lão.
  if(newIds?.size){const mid=(cols-1)/2,front=[...free].sort((a,b)=>Math.floor(b/cols)-Math.floor(a/cols)||Math.abs(a%cols-mid)-Math.abs(b%cols-mid)||a-b);
   const fresh=visitors.filter(p=>newIds.has(p.id)),picked=front.slice(0,fresh.length);
   for(let k=free.length-1;k>=0;k--)if(picked.includes(free[k]))free.splice(k,1);free.unshift(...picked);
   visitors.sort((a,b)=>(newIds.has(b.id)?1:0)-(newIds.has(a.id)?1:0));}
  visitors.forEach((player,i)=>{
   const slot=free[i],row=Math.floor(slot/cols),col=slot%cols;
   const x=hallX(col,cols)+sway(row)+(seed(player.id+':x')-.5)*Math.min(14,70/cols);
   const y=Math.max(top,Math.min(bottom,top+row*step+(seed(player.id+':y')-.5)*Math.min(H*.015,step*.2)));
   targets.push({id:player.id,player,x,y,scale:scale*.92,lift:0});
  });
  return targets;
 }
 const n=players.length,cols=n<=3?Math.max(1,n):n<=12?4:n<=24?6:8,rows=Math.ceil(n/cols);
 const scale=n<=3?2.9:n<=4?2.7:n<=8?2.35:n<=12?2.05:n<=24?1.5:1.05;
 const gap=withHalls?Math.min(190,H*.18/Math.max(1,rows-1)):rows<=3?Math.min(220,H*.125):Math.min(170,H*.30/Math.max(1,rows-1));
 const top=withHalls?H*.68:H*.66-(Math.max(0,rows-1)*gap)/2;
 const spacing=n<=4?180:n<=12?178:760/cols;
 return players.map((player,i)=>{const row=Math.floor(i/cols),count=Math.min(cols,n-row*cols);return {id:player.id,player,x:450+(i%cols-(count-1)/2)*spacing,y:top+row*gap,scale,lift:0};});
}
export function loadSectMasterArt(scene){if(scene.sectMasterArt||scene.sectMasterArtLoading||scene.sectMasterArtRetry>Date.now()||typeof Image==='undefined')return;scene.sectMasterArtLoading=true;let im=new Image();im.onload=()=>{scene.sectMasterArt=im;scene.sectMasterArtLoading=false;};im.onerror=()=>{scene.sectMasterArtLoading=false;scene.sectMasterArtRetry=Date.now()+15000;};im.src='/assets/sect-hall-v1/sect-master-throne-v2.png';}
export function masterSeatGeometry(H,art){const iw=art?.naturalWidth||art?.width||900,ih=art?.naturalHeight||art?.height||1600,crop=artworkCrop(iw,ih,H),scale=ih/crop.sh*H/1600,height=176*scale,seatY=(ih*.318-crop.sy)/crop.sh*H;return {x:(iw*.5-crop.sx)/crop.sw*900,y:seatY,top:seatY-height*.53,height};}
export function sectCourtVisible(scene){
 return scene.environment?.layout==='sect'&&!scene.hallWarStatus?.active&&!scene.raceStatus?.active&&!scene.warStatus?.active&&!scene.alcStatus?.active&&!scene.mazeStatus&&!scene.socialScene&&!scene.socialStage?.length&&!scene.bonkFest?.active;
}
// 16/11 (chủ game): đạo lữ Tông chủ ngồi ngay cạnh, thấp hơn ngai một chút; nhãn nhỏ ĐẠO LỮ + tên.
function drawConsort(scene,c,p,x,y,scale,t){
 const target={id:p.id,player:p,x,y,scale};drawWings(scene,c,target,t);
 const compact=scene.compact,pose=scene.cinematicPose;scene.compact=true;scene.cinematicPose={stand:0,lean:0,lift:0};
 try{c.save();c.translate(x,y);c.scale(scale,scale);scene.drawCharacterBody(c,p,skinFor(p.giftCoins),t);c.restore();}finally{scene.compact=compact;scene.cinematicPose=pose;}
 c.save();c.textAlign='center';c.textBaseline='middle';c.font='800 13px "Segoe UI",Arial,sans-serif';const label='ĐẠO LỮ TÔNG CHỦ',w=c.measureText(label).width+20;
 c.fillStyle='#3a0f2aee';c.beginPath();c.roundRect?c.roundRect(x-w/2,y+14,w,22,11):c.rect(x-w/2,y+14,w,22);c.fill();c.strokeStyle='#ffb3dc';c.lineWidth=1.5;c.stroke();c.fillStyle='#ffd6ee';c.fillText(label,x,y+25);
 c.font='800 15px "Segoe UI",Arial,sans-serif';c.lineWidth=3;c.strokeStyle='#05070d';c.strokeText(p.name||'Đạo hữu',x,y+48,200);c.fillStyle='#fff1f8';c.fillText(p.name||'Đạo hữu',x,y+48,200);c.restore();
}
export function drawSectMaster(scene,c,t){
 if(!sectCourtVisible(scene)||scene.sectMaster?.enabled===false||scene.presentation?.until>t)return false;
 const host=scene.sectMaster||{},now=(scene.stateServerNow||Date.now())+(t-(scene.stateReceivedAt??t)),speaking=host.active===true&&(!host.until||now<host.until);
 const seat=masterSeatGeometry(scene.height,scene.art),x=seat.x,y=seat.y,age=speaking?Math.max(0,now-host.at):Infinity,appear=1,motion=scene.motion!==false,nod=motion&&age<1800?Math.sin(age*.0035)*.018:0,breathe=motion?Math.sin(t*.0018)*1.2:0;
 const throne=courtSeat('throne');
 const p={id:'resident:sect-master',name:'Tông chủ',resident:true,gender:'nam',realm:3,giftCoins:500,equipped:null};
 let throneTier=-1;loadSectMasterArt(scene);c.save();c.globalAlpha=appear;
 if(host.player){
  const height=seat.height,scale=height/120,tier=masterTier(host.player.giftCoins);throneTier=tier;
  if(throne)paintSeat(c,throne,x,y,height*1.85*(throne.wk||1));else drawThroneBack(c,x,y,height,tier,t,motion); // 12/11: ngai rồng vàng vẽ 1 lần (cache) + hiệu ứng theo cấp
  const target={id:host.player.id,player:host.player,x,y,scale};
  drawWings(scene,c,target,t);
  const compact=scene.compact,pose=scene.cinematicPose;scene.compact=true;scene.cinematicPose={stand:0,lean:0,lift:0};
  try{
   const blackGold=showsBlackGoldGear(host.player);
   if(blackGold)drawCourtAdornment(scene,c,target,t,'back');
   c.save();
   try{c.translate(x,y);c.scale(scale,scale);scene.drawCharacterBody(c,host.player,skinFor(host.player.giftCoins),t);}finally{c.restore();}
   if(blackGold)drawCourtAdornment(scene,c,target,t,'front');
  }finally{scene.compact=compact;scene.cinematicPose=pose;}
 }
 else if(throne){paintSeat(c,throne,x,y,seat.height*1.85);}
 else if(scene.sectMasterArt){const im=scene.sectMasterArt,w=seat.height*(im.naturalWidth||im.width)/(im.naturalHeight||im.height);c.translate(x,seat.top+seat.height*.35);c.rotate(nod*.25);c.scale(1,1+breathe*.0015);c.imageSmoothingQuality='high';c.drawImage(im,-w/2,-seat.height*.35,w,seat.height);}
 else{c.translate(x,y-42);c.scale(1.35,1.35);const old=scene.compact;scene.compact=true;try{scene.drawCharacterBody(c,p,skinFor(p.giftCoins),0);}finally{scene.compact=old;}}
 c.restore();
 if(throneTier>=0)drawThroneFront(c,x,y,seat.height,throneTier,t,motion,host.player.name||'Đạo hữu');

 // 18/11 (chủ game: "tọa kỹ 17 đâu ko thấy"): Tông chủ ngồi ngai nên không cưỡi được → tọa kỹ đang chọn phục bên trái ngai
 // (đạo lữ đứng bên phải). Vẽ cả lúc truyền công; sân >50 người chỉ còn hình (lod 'off').
 if(host.player?.mount&&host.player.mounts?.[host.player.mount]){const ms=seat.height/120*.95,lod=(scene.targets?.length||0)>50?'off':'light',o={scale:ms,t:motion?t:0,lod,seed:host.player.id,flip:false};const mx=x-seat.height*1.2,my=y+seat.height*.32;if(drawMount(c,host.player.mount,mx,my,o))drawMount(c,host.player.mount,mx,my,{...o,layer:'front'});}
 if(host.player&&host.consort)drawConsort(scene,c,host.consort,x+seat.height*1.12,y+seat.height*.3,seat.height/120*.82,t);
 c.save();if(throneTier>=0)drawMasterPlate(c,x,seat.top+seat.height+8,'',throneTier);else{c.textAlign='center';c.textBaseline='middle';c.font='800 16px "Segoe UI",Arial,sans-serif';const label='TÔNG CHỦ',w=c.measureText(label).width+28;c.fillStyle='#102632ed';c.fillRect(x-w/2,seat.top+seat.height+8,w,28);c.strokeStyle='#c8ab68';c.strokeRect(x-w/2,seat.top+seat.height+8,w,28);c.fillStyle='#ffe0a0';c.fillText(label,x,seat.top+seat.height+22);}
 if(throneTier<0&&host.player){c.font='800 15px "Segoe UI",Arial,sans-serif';c.fillStyle='#fff1c4';c.fillText(host.player.name||'Đạo hữu',x,seat.top+seat.height+49,300);}
 if(speaking&&age<12000){const raw=host.text||'Chư vị đạo hữu, cùng tu luyện!',words=raw.split(/\s+/),lines=[''];c.font='700 15px "Segoe UI",Arial,sans-serif';for(const word of words){const at=lines.length-1,next=(lines[at]+' '+word).trim();if(c.measureText(next).width>270&&lines[at]){if(lines.length===2){lines[at]+='…';break;}lines.push(word);}else lines[at]=next;}const width=Math.min(310,Math.max(...lines.map(s=>c.measureText(s).width))+28),h=lines.length*25+18,by=y-190-h;c.fillStyle='#0b2332f0';c.fillRect(x-width/2,by,width,h);c.strokeStyle='#d9bd7777';c.strokeRect(x-width/2,by,width,h);c.fillStyle='#f8ecd0';lines.forEach((line,i)=>c.fillText(line,x,by+21+i*25));}
 c.restore();return true;
}

// The server's active flag is the existing recent-LIVE-activity signal, not an exact viewer roster.
export function sectElders(players,hostId){return players.filter(p=>p.active&&!p.resident&&!p.puppet&&!p.webOnly&&p.id!==hostId).slice().sort((a,b)=>(Number(b.realm)||0)-(Number(a.realm)||0)||(Number(b.totalQi)||0)-(Number(a.totalQi)||0)||String(a.id).localeCompare(String(b.id))).slice(0,2);}
const hallX=(column,count=5)=>450+(column-(count-1)/2)*(885/Math.max(5,count));
export function seatSectElders(targets,elders,H,halls){
 const ids=new Set(elders.map(p=>p.id)),count=halls?.length||5;
 return [...targets.filter(a=>!ids.has(a.id)),...elders.map((player,i)=>({id:player.id,player,x:player.hallIndex==null?(i===0?260:640):hallX(halls?halls.findIndex(h=>h.index===player.hallIndex):player.hallIndex,count),y:H*(player.hallIndex==null?.435:.463),scale:player.hallIndex==null?1.9:1.42*Math.min(1,5/count),lift:0,sectElder:i+1}))];
}
export function drawSectCourt(scene,c,t){
 if(!sectCourtVisible(scene)||scene.presentation?.until>t)return;
 const y=scene.height*.435;
 if(scene.sectHalls){
  const y=scene.height*.463, active=new Set(scene.sectElders.map(p=>p.id));
  const count=scene.sectHalls.length,scale=Math.min(1,5/count);
  for(const [column,hall] of scene.sectHalls.entries()){
   c.save();c.translate(hallX(column,count),y);c.scale(scale,scale);
   if(tmOn()){ // 19/11 Thủy Mặc: đệm ngồi dưới Trưởng Lão; MỘT bảng giấy dưới đệm: "TRƯỞNG LÃO · tên Đường" + tên người ngồi (không chồng lên đệm Tông chủ)
    const cushion=courtSeat('elder');if(cushion)paintSeat(c,cushion,0,92,140);
    if(!active.has(hall.elder?.id)){c.textAlign='center';c.fillStyle=hall.color;c.font='700 30px "Noto Serif",Georgia,serif';c.fillText(hall.mark,0,70);}
    const short=String(hall.name||'').replace(/ Đường$/,''),who=hall.elder?.name||'Ghế trống';
    // thẻ giấy treo trước đệm (gọn, không lấn hàng người phía dưới)
    c.fillStyle='rgba(243,234,216,.96)';c.strokeStyle='#1b1813';c.lineWidth=1.2;c.beginPath();c.roundRect(-70,96,140,20,2);c.fill();c.stroke();c.fillStyle=hall.color;c.fillRect(-70,96,5,20);
    c.textAlign='center';c.fillStyle='#b3261e';c.font='900 11px "Noto Serif",Georgia,serif';c.fillText('TRƯỞNG LÃO · '+short.toUpperCase(),3,110,128);
    c.font='800 13px "Segoe UI",Arial,sans-serif';c.lineWidth=3;c.strokeStyle='#1b1813dd';c.strokeText(who,0,131,150);c.fillStyle='#fff3d6';c.fillText(who,0,131,150);
    c.restore();continue;
   }
   const elder=courtSeat('elder');if(elder)paintSeat(c,elder,0,0,150*(elder.wk||1));
   c.fillStyle='#102b32';c.strokeStyle=hall.color;c.lineWidth=2;
   c.beginPath();c.moveTo(-45,0);c.lineTo(-36,-60);c.lineTo(36,-60);c.lineTo(45,0);c.closePath();if(!elder){c.fill();c.stroke();}
   c.fillStyle=hall.color;c.textAlign='center';c.font='700 32px Georgia';
   if(!active.has(hall.elder?.id))c.fillText(hall.mark,0,-16);
   c.fillStyle=hall.color;c.beginPath();c.moveTo(-60,-65);c.lineTo(-43,-65);c.lineTo(-48,-39);c.lineTo(-55,-42);c.closePath();c.fill();
   const tm=tmOn();c.fillStyle=tm?'rgba(243,234,216,.95)':'#092028';if(tm){c.strokeStyle='#1b1813';c.lineWidth=1.5;}c.beginPath();c.roundRect(-83,16,166,51,tm?3:8);c.fill();c.stroke();if(tm){c.fillStyle=hall.color;c.fillRect(-83,16,6,51);}
   c.fillStyle=tm?'#b3261e':hall.color;c.font=(tm?'900 15px "Noto Serif",Georgia,serif':'800 15px "Segoe UI",Arial,sans-serif');c.fillText('TRƯỞNG LÃO',0,36,154);
   c.fillStyle=tm?'#1b1813':'#f7e8c6';c.font='700 14px "Segoe UI",Arial,sans-serif';c.fillText(hall.name,0,56,156);
   c.font='800 15px "Segoe UI",Arial,sans-serif';c.fillStyle='#e9d7b0';c.fillText(hall.elder?.name||'Ghế trống',0,88,156);
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
