// 21/11/2026 tối (chủ game: "ký hiệu bên trái là các Đường đúng không — để chữ Trung họ không biết mình ở Đường nào; cho mỗi Đường một màu,
// icon màu khác nhau cho dễ nhận"). Huy hiệu tròn bên trái thẻ tên = ĐƯỜNG của người đó: nền màu riêng của Đường + icon Codex vẽ
// (public/assets/hall-icons/<key>.webp, đề bài PROMPT.md cùng thư mục). Không thuộc Đường nào → không có huy hiệu.
// Màu ở đây đậm, tách bạch hơn màu nhạt cũ trong ngu-duong.mjs (2 màu xanh cũ gần giống nhau).
export const HALL_STYLE=Object.freeze({
 'truyen cong':{icon:'truyen-cong',color:'#22c79a',label:'Truyền Công'},
 'tang bao':{icon:'tang-bao',color:'#ffa318',label:'Tàng Bảo'},
 'dan dinh':{icon:'dan-dinh',color:'#9d55ff',label:'Đan Đỉnh'},
 'tuan son':{icon:'tuan-son',color:'#2f86ff',label:'Tuần Sơn'},
 'linh duoc':{icon:'linh-duoc',color:'#8ccc12',label:'Linh Dược'},
});
const TAU=Math.PI*2;
/** Đường của 1 người trên sân (từ p.sectHallIndex + danh sách Đường của scene) → {key,color,icon,...} hoặc null. */
export function hallOf(scene,p){const i=p?.sectHallIndex;if(i==null)return null;const h=(scene?.sectHalls||[]).find(x=>x.index===i);if(!h)return null;const st=HALL_STYLE[h.key];return st?{...st,key:h.key,name:h.name}:{icon:null,color:h.color||'#ccc',key:h.key,name:h.name,mark:h.mark};}
export const hallColor=h=>HALL_STYLE[h?.key]?.color||h?.color||'#ccc';
const icons=new Map();
// bộ đệm riêng khi nơi gọi không có BitmapCache (ghế Trưởng Lão)
const own=new Map(),ownCache={get(k,w,h,paint){let cv=own.get(k);if(cv)return cv;if(typeof document==='undefined')return null;cv=document.createElement('canvas');cv.width=w;cv.height=h;paint(cv.getContext('2d'));own.set(k,cv);if(own.size>60)own.delete(own.keys().next().value);return cv;}};
export function hallIcon(name){if(!name||typeof Image==='undefined')return null;let im=icons.get(name);if(!im){im=new Image();im.decoding='async';im.src='/assets/hall-icons/'+name+'.webp?v=1';icons.set(name,im);}return im.complete&&im.naturalWidth?im:null;}
/** Vẽ huy hiệu Đường tâm (x,y), bán kính r. cache = BitmapCache của scene (vẽ sẵn 2×). */
export function drawHallBadge(c,x,y,hall,cache,r=11){if(!hall)return;const im=hallIcon(hall.icon),key='hall:'+hall.key+':'+r+':'+!!im,S=(r*2+6)*2;
 const bm=(cache||ownCache).get(key,S,S,b=>{b.setTransform(2,0,0,2,0,0);const cx=r+3,cy=r+3;
  b.beginPath();b.arc(cx,cy,r,0,TAU);const g=b.createRadialGradient(cx,cy-r*.4,1,cx,cy,r);g.addColorStop(0,'#ffffff55');g.addColorStop(.35,hall.color);g.addColorStop(1,hall.color);b.fillStyle=g;b.fill();
  b.lineWidth=2;b.strokeStyle='#0b0f14';b.stroke();b.beginPath();b.arc(cx,cy,r-2.2,0,TAU);b.lineWidth=1;b.strokeStyle='#ffffffb0';b.stroke();
  if(im){b.save();b.shadowColor='#000c';b.shadowBlur=2;const s=r*1.55;b.drawImage(im,cx-s/2,cy-s/2,s,s);b.restore();}
  else{b.font='900 '+Math.round(r*1.1)+'px "Segoe UI",sans-serif';b.textAlign='center';b.textBaseline='middle';b.lineWidth=2.5;b.strokeStyle='#000';const ch=(hall.label||hall.name||'?').slice(0,1);b.strokeText(ch,cx,cy+.5);b.fillStyle='#fff';b.fillText(ch,cx,cy+.5);}});
 if(bm)c.drawImage(bm,x-r-3,y-r-3,r*2+6,r*2+6);}
