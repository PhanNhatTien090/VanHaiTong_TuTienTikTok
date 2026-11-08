// 08/11/2026: Đua phi kiếm — vật cưỡi (Vân Chu, Hồ Lô, Tiên Hạc, Kim Lý, Hỏa Liên, Cửu Vĩ Hồ) thay cho thanh kiếm để mỗi lượt đua nhìn khác nhau.
// Mỗi lượt đua mỗi người được rút một vật cưỡi (cố định trong lượt, theo id lượt + id người); ~20% vẫn bay kiếm thường.
// Người có skin kiếm giải thưởng (race-sword-skins) luôn giữ kiếm của mình. Chỉ là hình — không đổi tốc độ.
// Ảnh: /assets/race-mounts-v1/mounts-{a,b}.png (3 ô/tấm, nền trong suốt, Codex image_gen). Ô được tự cắt sát theo alpha khi tải.
export const RACE_MOUNTS=Object.freeze([
 {id:'boat',name:'Vân Chu',sheet:'a',cell:0,deck:.5,width:230,trail:'#ffffff'},
 {id:'gourd',name:'Hồ Lô',sheet:'a',cell:1,deck:.3,width:200,trail:'#9bff8a'},
 {id:'crane',name:'Tiên Hạc',sheet:'a',cell:2,deck:.42,width:250,trail:'#e8f6ff'},
 {id:'koi',name:'Kim Lý',sheet:'b',cell:0,deck:.4,width:220,trail:'#ffd36b'},
 {id:'lotus',name:'Hỏa Liên',sheet:'b',cell:1,deck:.42,width:200,trail:'#ff9ad5'},
 {id:'fox',name:'Cửu Vĩ Hồ',sheet:'b',cell:2,deck:.42,width:240,trail:'#8fd8ff'}]);
const SHEETS={a:'/assets/race-mounts-v1/mounts-a.png',b:'/assets/race-mounts-v1/mounts-b.png'};
const hash=s=>{let h=2166136261;for(const ch of String(s||''))h=Math.imul(h^ch.codePointAt(0),16777619);return h>>>0;};
function trim(img,cell){
 const cw=Math.floor(img.naturalWidth/3),ch=img.naturalHeight,x0=cell*cw,full={x:x0,y:0,w:cw,h:ch};
 try{const cv=document.createElement('canvas');cv.width=cw;cv.height=ch;const g=cv.getContext('2d',{willReadFrequently:true});g.drawImage(img,x0,0,cw,ch,0,0,cw,ch);const d=g.getImageData(0,0,cw,ch).data;
  let minX=cw,minY=ch,maxX=0,maxY=0;for(let y=0;y<ch;y+=3)for(let x=0;x<cw;x+=3){if(d[(y*cw+x)*4+3]>40){if(x<minX)minX=x;if(x>maxX)maxX=x;if(y<minY)minY=y;if(y>maxY)maxY=y;}}
  return maxX>minX&&maxY>minY?{x:x0+minX,y:minY,w:maxX-minX+3,h:maxY-minY+3}:full;}catch{return full;}
}
function sheets(scene){
 if(scene.raceMountArt)return scene.raceMountArt;const art=scene.raceMountArt={};
 if(typeof Image==='undefined')return art;
 for(const [k,src] of Object.entries(SHEETS)){const img=new Image();img.decoding='async';img.onload=()=>{art[k]={img,rects:[0,1,2].map(i=>trim(img,i))};};img.src=src;}
 return art;
}
// 08/11: chỉ người đã đoạt top quà đua mới có vật cưỡi (p.raceMounts). Có nhiều con thì cưỡi con đẹp nhất theo MOUNT_RANK.
export const MOUNT_RANK=Object.freeze(['fox','koi','lotus','crane','gourd','boat']);
export function raceMountFor(scene,player){
 if(!player)return null;const own=player.raceMounts||[],id=MOUNT_RANK.find(m=>own.includes(m))||own[0];if(!id)return null;const m=RACE_MOUNTS.find(x=>x.id===id);if(!m)return null;const art=sheets(scene);return art[m.sheet]?m:null;
}
export function drawRaceMount(scene,c,a,t,m){
 const art=sheets(scene)[m.sheet];if(!art)return false;const r=art.rects[m.cell],s=(a.scale||1.5)/1.5,w=m.width*s,h=w*r.h/r.w,seed=hash(a.id)%1000,motion=scene.motion!==false;
 const bob=motion?Math.sin(t*.004+seed)*4*s:0,tilt=motion?Math.sin(t*.0023+seed)*.05:0,feet=a.y+26*s;
 c.save();
 // vệt bay phía dưới (đang bay lên)
 if(motion){c.globalCompositeOperation='lighter';for(let i=0;i<7;i++){const u=((t*.0016+i/7+seed/1000)%1);c.globalAlpha=(1-u)*.45;c.fillStyle=m.trail;c.beginPath();c.arc(a.x+(((seed*(i+3))%40)-20)*s,feet+h*(1-m.deck)+u*90*s,(9-u*6)*s,0,Math.PI*2);c.fill();}c.globalCompositeOperation='source-over';c.globalAlpha=1;}
 c.translate(a.x,feet+bob);c.rotate(tilt);c.drawImage(art.img,r.x,r.y,r.w,r.h,-w/2,-h*m.deck,w,h);
 c.restore();return true;
}
