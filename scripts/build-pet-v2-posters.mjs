// 13 original Vân Hải Tông LIVE pet posters, rendered from the game's REAL sprites.
import fs from 'node:fs/promises';
import path from 'node:path';
import {existsSync} from 'node:fs';
import {createCanvas,loadImage,GlobalFonts} from '@napi-rs/canvas';
import {ALL_PETS} from '../public/spirit-pets.js';
import {petV2Skill} from '../public/pet-v2-catalog.js';
import {petV2AssetSpec} from '../public/pet-v2-art-manifest.js';
const W=1080,H=1920,TAU=2*Math.PI,OUT='public/assets/marketing/linh-thu-v2';
const gold='#f7d689',white='#fff6da',muted='#b5d3db',rankColor='#a2f0ee';
const copy={
 'jade-rabbit':['Hồi phục · hỗ trợ','Thỏ ngọc dẫn nguyệt quang, giúp chủ nhân hồi nguyên.'],
 'ember-fox':['Hỏa công · bộc phát','Hồ ly xích diễm hóa thành cửu hỏa hồ ảnh.'],
 'frost-tiger':['Băng hệ · khống chế','Băng phách ngưng kết, trấn áp đối thủ.'],
 'sun-phoenix':['Hỏa hệ · hỗ trợ','Kim vũ phượng rực sáng, hộ vệ chủ nhân.'],
 'astral-dragon':['Tinh hệ · tấn công','Thần long cuộn tinh hà, phóng long tức.'],
 'loi-oa':['Lôi hệ · khống chế','Lôi Oa triệu thiên lôi, chấn động linh lực.'],
 'van-thu':['Huyết hệ · hấp thụ','Văn Thú thu nạp huyết khí bằng huyền văn.'],
 'ky-lan':['Hỏa hệ · hộ pháp','Kỳ Lân dựng kết giới thánh thuẫn.'],
 'bach-nguyet-ho':['Băng nguyệt · ảo thuật','Cửu vĩ tung huyễn ảnh, khống chế đối phương.'],
 'ngoc-chau-long':['Thủy hệ · bảo hộ','Ngọc Châu Thiên Long nâng thủy triều hộ thân.'],
 'xich-ha-phuong':['Hỏa hệ · công kích','Thiên phượng thiêu đốt tà khí bằng xích hà.'],
 'tu-nguyet-lan':['Nguyệt hệ · hồi nguyên','Ngọc lân dựng tử nguyệt trận hỗ trợ.'],
 'hac-tinh-ho':['Tinh hệ · công kích','Hắc tinh hổ hội tụ sức mạnh phá không.']
};
const elements={moon:'Nguyệt',fire:'Hỏa',ice:'Băng',star:'Tinh',lightning:'Lôi',blood:'Huyết',water:'Thủy'};
const roles={support:'Hỗ trợ',attack:'Công kích',control:'Khống chế',defense:'Hộ pháp',drain:'Hấp thụ'};
for(const [p,name] of [
 ['/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf','VH'],
 ['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf','VHbold'],
 ['/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf','VHserif']
])if(existsSync(p))GlobalFonts.registerFromPath(p,name);
const F={body:'VH',bold:'VHbold',title:'VHserif'};
function rgba(hex,a){const s=hex.slice(1);return 'rgba('+[0,2,4].map(n=>parseInt(s.slice(n,n+2),16)).join(',')+','+a+')';}
function pathRounded(c,x,y,w,h,r){
 c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();
}
function panel(c,x,y,w,h,accent=gold){
 c.save();pathRounded(c,x,y,w,h,20);c.fillStyle='rgba(2,13,27,.84)';c.fill();
 c.strokeStyle=rgba(accent,.72);c.lineWidth=2;c.stroke();
 c.strokeStyle=rgba(gold,.84);c.beginPath();c.moveTo(x+24,y+3);c.lineTo(x+90,y+3);c.moveTo(x+w-24,y+h-3);c.lineTo(x+w-90,y+h-3);c.stroke();c.restore();
}
function label(c,t,x,y,size,color=white,font=F.bold,maxWidth=1020){
 c.save();c.textAlign='center';c.textBaseline='middle';c.font=size+'px "'+font+'"';
 c.fillStyle=color;c.fillText(t,x,y,maxWidth);c.restore();
}
function fitted(c,t,maxWidth,maxSize,minSize=32,font=F.title){
 for(let size=maxSize;size>=minSize;size-=2){c.font=size+'px "'+font+'"';if(c.measureText(t).width<=maxWidth)return size;}return minSize;
}
function glow(c,x,y,r,col){
 const g=c.createRadialGradient(x,y,0,x,y,r);
 g.addColorStop(0,rgba(col,.31));g.addColorStop(.56,rgba(col,.13));g.addColorStop(1,rgba(col,0));
 c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();
}
function line(c,y){
 const g=c.createLinearGradient(50,y,1030,y);g.addColorStop(0,'rgba(247,214,137,0)');g.addColorStop(.5,'rgba(247,214,137,.8)');g.addColorStop(1,'rgba(247,214,137,0)');
 c.fillStyle=g;c.fillRect(50,y,980,2);
}
function stars(c,seed){
 let x=seed>>>0;const rnd=()=>((x=Math.imul(x,1664525)+1013904223|0)>>>0)/4294967296;
 for(let i=0;i<155;i++){c.fillStyle=i%7?'rgba(183,222,237,.28)':rgba(gold,.56);c.beginPath();c.arc(24+rnd()*1032,15+rnd()*1880,1+rnd()*1.9,0,TAU);c.fill();}
}
function sigil(c,x,y,r,col){
 c.save();c.lineWidth=2.3;c.strokeStyle=rgba(col,.5);
 c.beginPath();c.ellipse(x,y,r,r*.27,-.04,0,TAU);c.stroke();
 c.beginPath();c.ellipse(x,y,r*.87,r*.18,.02,0,TAU);c.stroke();
 for(let i=0;i<12;i++){
  const a=i*TAU/12,X=x+Math.cos(a)*r,Y=y+Math.sin(a)*r*.27;
  c.fillStyle=i%3?rgba(col,.78):gold;c.beginPath();c.arc(X,Y,i%3?2.5:4.4,0,TAU);c.fill();
 }c.restore();
}
function cropFirst(im,id){
 const iw=im.width,ih=im.height,breaks=id==='astral-dragon'?[0,.292,.668,1]:[0,1/3,2/3,1];
 const sx=0,sw=Math.floor((breaks[1]-breaks[0])*iw);
 const cv=createCanvas(sw,ih),ctx=cv.getContext('2d');
 ctx.drawImage(im,sx,0,sw,ih,0,0,sw,ih);
 const d=ctx.getImageData(0,0,sw,ih).data;let x0=sw,y0=ih,x1=0,y1=0;
 const stride=Math.max(1,Math.floor(Math.min(sw,ih)/360));
 for(let y=0;y<ih;y+=stride)for(let x=0;x<sw;x+=stride){
  if(d[(y*sw+x)*4+3]>50){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
 }
 if(x0>=x1)return {sx:0,sy:0,sw,sh:ih};
 x0=Math.max(0,x0-12);y0=Math.max(0,y0-12);x1=Math.min(sw,x1+12);y1=Math.min(ih,y1+12);
 return {sx:x0,sy:y0,sw:x1-x0,sh:y1-y0};
}
function drawFitted(c,img,crop,x,y,maxW,maxH){
 const k=Math.min(maxW/crop.sw,maxH/crop.sh),w=crop.sw*k,h=crop.sh*k;
 c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
 c.drawImage(img,crop.sx,crop.sy,crop.sw,crop.sh,x-w/2,y-h/2,w,h);
}
async function readStage(pet,stage){
 if(stage===0)return {image:await loadImage('public/assets/spirit-pets-v1/'+pet.id+'.png'),spec:null};
 const spec=petV2AssetSpec(pet.id,stage);
 return {image:await loadImage('public'+spec.path),spec};
}
let backdrop=null;
try{backdrop=await loadImage('public/assets/maps-v3/pet-cove.png');}catch{}
await fs.mkdir(OUT,{recursive:true});
const manifest=[];
for(let i=0;i<ALL_PETS.length;i++){
 const pet=ALL_PETS[i],skill=petV2Skill(pet.id);if(!skill||!copy[pet.id])throw Error('Unrecognized pet '+pet.id);
 const cv=createCanvas(W,H),c=cv.getContext('2d'),color=pet.color;
 const bg=c.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#071323');bg.addColorStop(.45,'#0b2131');bg.addColorStop(1,'#020914');
 c.fillStyle=bg;c.fillRect(0,0,W,H);
 if(backdrop){
  const k=Math.max(W/backdrop.width,H/backdrop.height),ww=backdrop.width*k,hh=backdrop.height*k;
  c.globalAlpha=.27;c.drawImage(backdrop,(W-ww)/2,(H-hh)/2,ww,hh);c.globalAlpha=1;
 }
 const shade=c.createLinearGradient(0,0,0,H);
 shade.addColorStop(0,'rgba(0,4,17,.27)');shade.addColorStop(.45,'rgba(0,6,20,.42)');shade.addColorStop(1,'rgba(0,5,15,.91)');
 c.fillStyle=shade;c.fillRect(0,0,W,H);
 stars(c,pet.id.split('').reduce((v,ch)=>v*33+ch.charCodeAt(0),3));
 c.strokeStyle=rgba(gold,.5);c.lineWidth=3;pathRounded(c,16,18,1048,1884,20);c.stroke();
 panel(c,160,38,760,75,gold);
 label(c,'VÂN HẢI TÔNG  ·  TIKTOK LIVE',540,74,34,gold,F.title);
 label(c,'LINH THÚ 2.0',540,137,29,muted,F.bold);
 const head=pet.name.toUpperCase();label(c,head,540,211,fitted(c,head,995,84,40),gold,F.title);
 panel(c,284,254,512,56,color);
 label(c,pet.rank.toUpperCase()+'  ·  HỆ '+elements[skill.element].toUpperCase(),540,282,23,color,F.bold);
 glow(c,540,594,350,color);sigil(c,540,782,255,color);
 const hero=await readStage(pet,0),origCrop=cropFirst(hero.image,pet.id);
 drawFitted(c,hero.image,origCrop,540,561,820,537);
 label(c,copy[pet.id][0].toUpperCase(),540,854,29,white,F.bold);
 label(c,copy[pet.id][1],540,907,19,muted,F.body,1000);
 line(c,958);label(c,'LỘ TRÌNH TIẾN HÓA',540,991,31,gold,F.title);
 const stageNames=['Ấu Linh','Chiến Linh','Thánh Linh','Bản Mệnh'],levels=[1,10,20,30];
 const w=239,gap=20;
 for(let stage=0;stage<4;stage++){
  const x=32+stage*(w+gap),y=1020;
  panel(c,x,y,w,307,stage===3?gold:color);glow(c,x+w/2,y+135,106,color);
  const source=stage===0?hero:await readStage(pet,stage);
  const crop=stage===0?origCrop:{sx:0,sy:0,sw:source.spec.size,sh:source.spec.size};
  drawFitted(c,source.image,crop,x+w/2,y+136,220,218);
  label(c,stageNames[stage],x+w/2,y+252,22,white,F.bold,w-12);
  label(c,'CẤP '+levels[stage],x+w/2,y+282,18,color,F.bold);
 }
 line(c,1360);label(c,'TUYỆT KỸ LINH THÚ',540,1392,31,gold,F.title);
 panel(c,32,1430,1016,152,color);
 glow(c,140,1499,89,color);
 c.strokeStyle=rgba(color,.85);c.lineWidth=4;c.beginPath();c.arc(142,1504,53,.3,TAU-.3);c.stroke();
 label(c,'✦',142,1503,66,gold,F.title);
 const t=skill.name.toUpperCase();
 label(c,t,618,1482,fitted(c,t,772,44,25),gold,F.title,772);
 label(c,copy[pet.id][0]+'  ·  '+roles[skill.role],616,1541,23,muted,F.body,760);
 line(c,1604);label(c,'CÁCH CHƠI TRÊN LIVE',540,1636,31,gold,F.title);
 panel(c,32,1673,1016,103,gold);
 const detail=[['01','NHẬN THÚ','Từ Linh Thú Cốc'],['02','NUÔI DƯỠNG','Tăng cấp và thân thiết'],['03','TRỢ CHIẾN','Tỷ thí · boss · viễn chinh']];
 for(let k=0;k<3;k++){
  const x=42+k*336;
  if(k>0){c.strokeStyle=rgba(gold,.4);c.lineWidth=1;c.beginPath();c.moveTo(x-13,1694);c.lineTo(x-13,1757);c.stroke();}
  label(c,detail[k][0],x+35,1705,25,gold,F.title);
  label(c,detail[k][1],x+172,1707,22,white,F.bold,249);
  label(c,detail[k][2],x+172,1742,16,muted,F.body,303);
 }
 const commands=['thú','thú nuôi','thú kỹ','thú hành'];
 for(let k=0;k<4;k++){
  const x=48+k*252;panel(c,x,1800,228,54,k%2?gold:color);
  label(c,commands[k],x+114,1827,25,white,F.bold,216);
 }
 label(c,'GÕ LỆNH TRONG BÌNH LUẬN LIVE ĐỂ TƯƠNG TÁC',540,1884,16,muted,F.bold);
 const filename=String(i+1).padStart(2,'0')+'-'+pet.id+'.png';
 const buf=await cv.encode('png');
 await fs.writeFile(path.join(OUT,filename),buf);
 manifest.push({id:pet.id,name:pet.name,rank:pet.rank,skill:skill.name,filename,size:buf.length});
 console.log(String(i+1)+'/13 '+pet.name+' -> '+filename+' ('+Math.round(buf.length/1024)+' KiB)');
}
// One contact sheet for review, in addition to 13 standalone full-resolution posters.
const gallery=createCanvas(4*260+5*14,4*490+5*14),gc=gallery.getContext('2d');
gc.fillStyle='#071323';gc.fillRect(0,0,gallery.width,gallery.height);
for(let i=0;i<manifest.length;i++){
 const x=14+(i%4)*274,y=14+Math.floor(i/4)*504;
 const im=await loadImage(path.join(OUT,manifest[i].filename));
 gc.drawImage(im,x,y,260,462);
}
await fs.writeFile(path.join(OUT,'00-tong-hop-13-linh-thu.png'),await gallery.encode('png'));
// Small JPEG proof sheet for visual QA without decoding full-size 13 PNGs.
const proof=createCanvas(4*185+5*10,4*345+5*10),pc=proof.getContext('2d');
pc.fillStyle='#061320';pc.fillRect(0,0,proof.width,proof.height);
for(let i=0;i<manifest.length;i++){
 const img=await loadImage(path.join(OUT,manifest[i].filename));
 pc.drawImage(img,10+(i%4)*195,10+Math.floor(i/4)*355,185,329);
}
await fs.writeFile(path.join(OUT,'00-preview-qa.jpg'),await proof.encode('jpeg',78));
await fs.writeFile(path.join(OUT,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
if(manifest.length!==13||new Set(manifest.map(m=>m.id)).size!==13)throw Error('Missing or duplicated pet');
console.log('FINISHED: 13 originals + contact sheet');
