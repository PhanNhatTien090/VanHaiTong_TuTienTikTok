import {nameBadge} from './vip.js';
// Cosmetics use received gift value, never the viewer's TikTok recharge balance.
export const SKINS=Object.freeze([
  {id:'jade',name:'Thanh Y',min:0,color:'#97d4bd',trim:'#e0cf9c',robe:'#6aaf9f',vfx:'Linh khí nhẹ',level:0},
  {id:'moon',name:'Nguyệt Bạch',min:100,color:'#b8eaff',trim:'#e9f5ff',robe:'#dceefa',vfx:'Nguyệt luân · ngân tinh',level:1},
  {id:'violet',name:'Tử Vân',min:500,color:'#cca8ff',trim:'#edcfff',robe:'#9673d4',vfx:'Tinh hoàn · phi kiếm',level:2},
  {id:'dragon',name:'Kim Long',min:2000,color:'#f4cf7a',trim:'#ffe6a8',robe:'#394c6c',vfx:'Long khí · kim kiếm',level:3},
  {id:'emperor',name:'Thiên Đế',min:10000,color:'#f6d9ff',trim:'#ffe5a7',robe:'#e8def5',vfx:'Thiên luân · thất tinh',level:4}
]);
export function skinFor(coins=0){const n=Number(coins);return [...SKINS].reverse().find(s=>Number.isFinite(n)&&n>=s.min)||SKINS[0];}
export function nextSkin(coins=0){return SKINS.find(s=>s.min>Math.max(0,Number(coins)||0))||null;}
export function layoutPlayers(players,height,floorY){
  const count=players.length,cols=count>24?8:count>6?6:4,rows=Math.ceil(count/cols);
  const scale=count<=4?2.15:count<=18?1.8:1.6;
  const rowGap=Math.ceil(scale*74+28); // 3/11: hàng trên dưới gần nhau hơn // 3/11: ngồi xích lại gần nhau hơn một chút
  return players.map((p,i)=>{const row=Math.floor(i/cols),col=i%cols,n=Math.min(cols,count-row*cols),spacing=n>6?98:count<=4?152:116;
    return {id:p.id,x:450+(col-(n-1)/2)*spacing,y:floorY+(row-(rows-1)/2)*rowGap,scale,player:p};
  });
}
// Allocate label rectangles after all world geometry and effects are rendered.
// 4/11/2026: tên hiện ĐỦ, giữ nguyên cỡ chữ (không thu nhỏ/ép dẹt — chữ nhỏ bị mờ trên LIVE).
// Tên dài hơn bề rộng khung thì xuống dòng (tối đa 3 dòng), ưu tiên ngắt ở dấu cách, từ quá dài thì ngắt theo ký tự.
export function wrapName(name,measure,max){
  const words=name.split(/(\s+)/).filter(Boolean),lines=[];let line='';
  const push=()=>{if(line.trim())lines.push(line.trim());line='';};
  for(const word of words){
    if(measure((line+word).trim())<=max){line+=word;continue;}
    if(line.trim())push();
    if(/^\s+$/.test(word))continue;
    if(measure(word)<=max){line=word;continue;}
    for(const ch of Array.from(word)){if(line&&measure(line+ch)>max)push();line+=ch;}
  }
  push();
  if(lines.length>3){const rest=lines.slice(2).join(' ');lines.length=2;lines.push(rest);} // hiếm: tên rất dài → dòng 3 gom phần còn lại
  return lines.length?lines:[name];
}
export function layoutLabels(targets,measure,width=900){
  const occupied=[],big=targets.length<=4,lineH=big?30:25,pad=14;
  // Bề rộng khung = khoảng cách tới người ngồi cạnh cùng hàng (không đè tên nhau), tối đa 220.
  const gap=t=>{let d=Infinity;for(const o of targets)if(o!==t&&Math.abs(o.y-t.y)<10)d=Math.min(d,Math.abs(o.x-t.x));return d;};
  return targets.map(t=>{const name=(t.player.puppet||t.player.resident?'NPC · ':'')+Array.from(String(t.player.name||'Đạo hữu').normalize('NFC').trim()).slice(0,40).join('');
    const cap=Math.max(70,Math.min(220,gap(t)-6)),full=measure(name);
    // Đo bằng đúng cỡ chữ khi vẽ. Vừa khung → một dòng. Một hàng ghế (≤4 người, không có hàng dưới) → xuống dòng.
    // Đông người: giữa các hàng chỉ đủ một dòng → chạy chữ (scroll) trong khung, giữ nguyên cỡ chữ, không che mặt hàng dưới.
    const fits=full+pad<=cap,lines=fits?[name]:big?wrapName(name,measure,cap-pad):[name],scroll=!fits&&!big;
    const w=scroll?cap:Math.min(cap,Math.max(...lines.map(l=>measure(l)))+pad),h=(big?34:25)+(lines.length-1)*lineH;
    let x=Math.max(8,Math.min(width-w-8,t.x-w/2)),y=t.y+t.scale*18+2; // khung tên sát chân hơn để các hàng xích lại
    for(let step=0;step<12;step++){if(!occupied.some(a=>x<a.x+a.w+3&&x+w+3>a.x&&y<a.y+a.h+3&&y+h+3>a.y))break;y+=h+3;}
    const box={id:t.id,x,y,w,h,name,lines,lineH,scroll,textW:full,player:t.player};occupied.push(box);return box;
  });
}

// Ảnh nhân vật theo giới tính tự khai. Sprite sheet: 0 nam Thanh Y · 1 nữ Nguyệt Bạch · 2 nam Tử Vân ·
// 3 nam Kim Long · 4 nữ Thiên Đế. Chưa khai giới tính → giữ ảnh đúng bậc bộ áo.
// Hiệu ứng (vòng sáng, phi kiếm, long khí…) vẫn theo bậc bộ áo, không đổi.
const CELLS={nu:[1,1,1,4,4],nam:[0,2,2,3,3]};
export const spriteCell=(level,gender)=>CELLS[gender]?.[level]??level;
// Chỉ dùng cho HÌNH: người chưa khai giới tính được gán nam/nữ cố định theo ID (tải lại trang vẫn giữ nguyên),
// để cảnh không toàn ảnh nam. Không đoán theo tên; xưng hô giọng đọc vẫn là "đạo hữu".
export function visualGender(p){
 if(p?.gender==='nam'||p?.gender==='nu')return p.gender;
 let n=0;for(const ch of String(p?.id??''))n=(Math.imul(n,31)+ch.charCodeAt(0))|0;
 return Math.abs(n)%2?'nu':'nam';
}
