// 21/11/2026 (chủ game: "ai có danh hiệu gì thì hiện chữ danh hiệu lên đầu, phân loại cho đẹp — VIP hiện đẹp hơn các danh hiệu khác").
// 21/11 chiều (chủ game, bản 2): TỰ ĐEO danh hiệu xịn nhất đang có (mỗi người đúng 1 cái, loại cao nhất); BỎ NỀN BẢNG — chỉ còn CHỮ font khác
// (Noto Serif đậm, khác chữ tên Segoe UI) + icon nhỏ do Codex vẽ (public/assets/title-icons/*.webp, đề bài trong PROMPT.md cùng thư mục):
//  • danh hiệu NẠP (Tông Chủ, VIP Kim Cương/Vàng/Bạc, cung phụng): chữ VÀNG KIM phát sáng + lâu lâu LÓE một vệt sáng quét qua chữ + sao chớp;
//  • danh hiệu SỰ KIỆN (Mê Cung, Độ Kiếp, Lò Đan, Gõ Đầu, Kiếm Khôi…): chữ XANH NGỌC + icon của sự kiện (Gõ Đầu = búa…);
//  • Luân Hồi: màu theo bậc + bánh xe; chức vị cảnh giới: chữ giấy dó viền mực, không icon.
// Vị trí: SÁT ĐỈNH ĐẦU người đó (đỉnh đầu ≈ chân − 84 × scale, đo bằng mốc trên sân 21/11), vẽ SAU CÙNG nên không ai đè lên.
// Hai danh hiệu chồng nhau → người cao bậc hơn giữ chỗ, người kia nhích lên 1 dòng, vẫn chồng thì ẩn (không chồng chữ).
// Sân >30 người chỉ hiện 3 bậc đầu, >50 chỉ Tông Chủ + Kim Cương (giữ luật cũ). Chữ vẽ sẵn vào bitmap 3× (nét, không vẽ lại chữ mỗi khung).
// Thứ bậc (rank càng nhỏ càng cao): 0 master · 1 vip3 · 2 luanhoi · 3 vip2 · 4 vip1 · 5 feat (sự kiện) · 6 rank (chức vị)
import {vipTier} from './vip.js';
import {luanHoiTier,luanHoiTitle} from './luan-hoi-data.js';
import {REALM_NAMES} from './progression.js';
const FAMILY='"Noto Serif","Times New Roman",Georgia,serif',FALLBACK_FAMILY='"Times New Roman",Georgia,serif';
const sizeOf=rank=>rank<=1?17:rank<=4?16:rank===5?15:13.5;
const fontOf=(rank,family)=>'900 '+sizeOf(rank)+'px '+family;
const RES=3; // bitmap 3× → nét trên LIVE 1080 px kể cả khi camera phóng
const HEAD_K=80; // đỉnh đầu ≈ chân − HEAD_K × scale (bitmap có lề 5 px → đáy chữ hạ thêm 4)
/** Icon theo tên danh hiệu sự kiện. */
const EVENT_ICON=[[/thiết thủ|đầu sắt|gõ đầu/i,'hammer'],[/đan|lò|cứu lô/i,'cauldron'],[/độ kiếp|hộ đạo/i,'lightning'],[/mê cung/i,'compass'],[/kiếm|khôi|vô địch|quán quân/i,'sword']];
export const eventIcon=name=>EVENT_ICON.find(([re])=>re.test(String(name||'')))?.[1]||'sword';
const GOLD={fill:['#fffbe6','#ffe27a','#f2b632','#a8700f'],stroke:'#3b2300',glow:'#ffcc4d'};
const STYLE=Object.freeze({
 master:{...GOLD,glow:'#ff8a3c',icon:'crown',flashMs:3600,sparkle:true},
 vip3:{...GOLD,glow:'#bfeaff',icon:'diamond',flashMs:4400,sparkle:true},
 vip2:{...GOLD,icon:'ingot',flashMs:5600},
 vip1:{fill:['#fffdf0','#fbe9a8','#d9b45a','#9a7426'],stroke:'#2e2410',glow:'#f3dc94',icon:'silver-ingot',flashMs:7600},
 feat:{fill:['#f2fffd','#9ff3ff','#3cc8e6','#127a9c'],stroke:'#03202c',glow:'#5fe0ff'},
 rank:{fill:['#fffaf0','#f3ead8','#f3ead8','#d8c9a8'],stroke:'#1b1813',glow:null},
});
const LIMIT=Object.freeze({busy:30,crowd:50});
/** Danh hiệu xịn nhất đang có của 1 người (hoặc null). now = giờ server. */
export function titleOf(p,now=Date.now()){if(!p||p.resident||p.puppet)return null;
 const h=p.honor,v=vipTier(p.giftCoins),n=Number(p.reincarnations)||0,last=REALM_NAMES.length-1;
 if(h?.role==='sect-master'||h?.title==='TÔNG CHỦ')return {rank:0,kind:'master',text:'TÔNG CHỦ',paid:true};
 const patron=h&&['guardian','patron','patron2','patron3'].includes(h.role)?h.title:null;
 if(v===3)return {rank:1,kind:'vip3',text:patron||'VIP KIM CƯƠNG',paid:true};
 if(n>0){const tr=luanHoiTier(n);return {rank:2,kind:'luanhoi',text:luanHoiTitle(n).toUpperCase(),tier:tr};}
 if((Number(p.realm)||0)>=last&&Number(p.neededQi)>0){const pct=Math.min(100,Math.floor((Number(p.qi)||0)/Number(p.neededQi)*100));return {rank:2,kind:'luanhoi',text:pct>=100?'SẴN SÀNG LUÂN HỒI':'LUÂN HỒI · '+pct+'%',tier:{main:'#ffcc80',soft:'#fff1d6',deep:'#2a1a08'},pending:true};}
 if(v===2)return {rank:3,kind:'vip2',text:patron||'VIP VÀNG',paid:true};
 if(v===1)return {rank:4,kind:'vip1',text:patron||'VIP BẠC',paid:true};
 const fun=p.funTitle?.until>now?p.funTitle.name:null,ev=fun||p.tournamentTitle||(h?.role==='champion'?h.title:null);
 if(ev)return {rank:5,kind:'feat',text:String(ev).toUpperCase(),icon:eventIcon(ev)};
 if(h?.title)return {rank:6,kind:'rank',text:h.title};
 return null;}
/** Có hiện không, theo độ đông sân. Chức vị theo cảnh giới (rank 6) gần như ai cũng có → chỉ hiện khi sân vắng (≤10). */
export const titleVisible=(t,count)=>!!t&&(count>LIMIT.crowd?t.rank<=1:count>LIMIT.busy?t.rank<=2:count>10?t.rank<=5:true);

// ---- icon (ảnh Codex vẽ, tải 1 lần) ----
const icons=new Map();
function icon(name){if(!name||typeof Image==='undefined')return null;let im=icons.get(name);if(!im){im=new Image();im.decoding='async';im.src='/assets/title-icons/'+name+'.webp';icons.set(name,im);}return im.complete&&im.naturalWidth?im:null;}
let fontReady=false,fontAsked=false;
function fontOk(){if(fontReady)return true;if(typeof document==='undefined'||!document.fonts)return false;
 if(document.fonts.check(fontOf(0,FAMILY)))return fontReady=true;if(!fontAsked){fontAsked=true;document.fonts.load(fontOf(0,FAMILY)).then(()=>{fontReady=true;bitmaps.clear();}).catch(()=>{});}return false;}

function makeCanvas(w,h){if(typeof OffscreenCanvas!=='undefined')return new OffscreenCanvas(w,h);if(typeof document!=='undefined'){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}return null;}
const bitmaps=new Map();
function styleOf(t){if(t.kind!=='luanhoi')return {...STYLE[t.kind],icon:t.icon||STYLE[t.kind].icon};
 return {fill:[t.tier.soft,t.tier.main,t.tier.main,t.tier.deep==='#2a1a08'?'#a8700f':t.tier.main],stroke:'#120a18',glow:t.tier.main,icon:'wheel'};}
// Bitmap: chữ (gradient + viền tối + quầng sáng) và icon bên trái; kèm bản "chữ trắng" để quét vệt sáng đúng hình chữ.
function plaque(t){const ok=fontOk(),st=styleOf(t),im=icon(st.icon),key=t.kind+'|'+t.text+'|'+(t.tier?.main||'')+'|'+st.icon+'|'+ok+'|'+!!im;let b=bitmaps.get(key);if(b)return b;
 const probe=makeCanvas(4,4);if(!probe)return null;const font=fontOf(t.rank,ok?FAMILY:FALLBACK_FAMILY);const pc=probe.getContext('2d');pc.font=font;
 const fs=sizeOf(t.rank),iconS=st.icon?Math.round(fs*1.55):0,gap=iconS?3:0,tw=Math.ceil(pc.measureText(t.text).width),pad=5;
 const W=pad*2+iconS+gap+tw,H=Math.max(iconS,Math.ceil(fs*1.35))+pad*2;
 const mk=()=>{const cv=makeCanvas(Math.ceil(W*RES),Math.ceil(H*RES));const c=cv.getContext('2d');c.setTransform(RES,0,0,RES,0,0);c.font=font;c.textAlign='left';c.textBaseline='middle';c.lineJoin='round';return [cv,c];};
 const tx=pad+iconS+gap,ty=H/2+.5;
 const [cv,c]=mk();
 if(st.glow){c.save();c.shadowColor=st.glow;c.shadowBlur=t.paid?7:4;c.fillStyle=st.glow;c.globalAlpha=t.paid?.75:.5;c.fillText(t.text,tx,ty);c.restore();}
 c.lineWidth=t.paid?3.4:3;c.strokeStyle=st.stroke;c.strokeText(t.text,tx,ty);
 const g=c.createLinearGradient(0,ty-fs*.6,0,ty+fs*.55);g.addColorStop(0,st.fill[0]);g.addColorStop(.38,st.fill[1]);g.addColorStop(.62,st.fill[2]);g.addColorStop(1,st.fill[3]);
 c.fillStyle=g;c.fillText(t.text,tx,ty);
 if(t.paid){c.save();c.globalAlpha=.55;c.lineWidth=.6;c.strokeStyle='#fffbe6';c.strokeText(t.text,tx,ty-.4);c.restore();} // mép trên kim loại
 if(im){c.save();if(st.glow){c.shadowColor=st.glow;c.shadowBlur=5;}c.drawImage(im,pad,(H-iconS)/2,iconS,iconS);c.restore();}
 let shine=null;if(t.paid){const [sc,s]=mk();s.fillStyle='#ffffff';s.fillText(t.text,tx,ty);if(im)s.drawImage(im,pad,(H-iconS)/2,iconS,iconS);shine=sc;}
 b={cv,shine,w:W,h:H,st,iconX:pad+iconS/2};
 bitmaps.set(key,b);if(bitmaps.size>220)bitmaps.delete(bitmaps.keys().next().value); // khóa gồm trạng thái font + icon → tải xong tự dựng lại
 return b;}

/** Vẽ 1 danh hiệu, tâm ngang x, đáy chữ ở y. */
export function drawTitlePlaque(c,t,x,y,ms,seed=0,light=false){const b=plaque(t);if(!b)return;const W=b.w,H=b.h,x0=x-W/2,y0=y-H;
 c.drawImage(b.cv,x0,y0,W,H);
 if(light||!b.shine)return;
 // LÓE SÁNG: mỗi flashMs một lần (lệch pha theo người), vệt sáng chéo quét qua chữ trong 520 ms, cuối vệt bật 1 ngôi sao chớp.
 const per=b.st.flashMs||6000,ph=((ms+seed*911)%per),dur=640;if(ph>dur+300)return;
 const k=Math.min(1,ph/dur),sx=x0-16+(W+32)*k,band=22,s=Math.sin(Math.min(1,ph/dur)*Math.PI);
 if(ph<=dur){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=.32*s;c.drawImage(b.shine,x0,y0,W,H); // cả chữ bừng lên
  c.beginPath();c.moveTo(sx-band,y0+H);c.lineTo(sx-band+10,y0);c.lineTo(sx+band+10,y0);c.lineTo(sx+band,y0+H);c.closePath();c.clip();
  c.globalAlpha=1;c.drawImage(b.shine,x0,y0,W,H);c.globalAlpha=.6;c.drawImage(b.shine,x0,y0,W,H);c.restore();} // vệt quét sáng chói
 if(b.st.sparkle||ph>dur*.7){const f=Math.max(0,1-Math.abs(ph-dur)/300),px=x0+W-6,py=y0+H*.3,r=(b.st.sparkle?10:7)*f;if(r>.4){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=f;c.fillStyle='#fffbe6';
  c.beginPath();c.moveTo(px,py-r*1.9);c.lineTo(px+r*.32,py);c.lineTo(px,py+r*1.9);c.lineTo(px-r*.32,py);c.closePath();c.fill();
  c.beginPath();c.moveTo(px-r*1.9,py);c.lineTo(px,py+r*.32);c.lineTo(px+r*1.9,py);c.lineTo(px,py-r*.32);c.closePath();c.fill();
  c.globalAlpha=f*.5;c.beginPath();c.arc(px,py,r*.9,0,Math.PI*2);c.fill();c.restore();}}
}

/** Xếp chỗ: người cao bậc giữ chỗ sát đầu; chồng nhau thì nhích lên 1 dòng, vẫn chồng thì ẩn. Thuần (test được). */
export function layoutTitles(items){const placed=[];const sorted=[...items].sort((a,b)=>a.rank-b.rank||a.y-b.y);
 const hit=(x0,y0,w,h)=>placed.some(p=>x0<p.x0+p.w&&x0+w>p.x0&&y0<p.y0+p.h&&y0+h>p.y0);
 for(const it of sorted){for(const dy of [0,-(it.h-4)]){const x0=it.x-it.w/2+2,y0=it.y+dy-it.h+3,w=it.w-4,h=it.h-6;if(!hit(x0,y0,w,h)){placed.push({...it,y:it.y+dy,x0,y0,w,h});break;}}}
 return placed;}

/** Vẽ cho cả sân: gọi SAU CÙNG (sau người, tên, hiệu ứng). targets: [{id,x,y,scale,player}] (y = chân). */
export function drawTitlePlaques(scene,c,t,nowMs){const list=scene.targets||[];if(!list.length||scene.bareCrowd&&list.length>80)return;
 const count=list.length,light=scene.budget?.level==='light';
 const elders=new Set((scene.sectElders||[]).map(e=>e?.id||e?.player?.id||e?.userId).filter(Boolean)),master=scene.sectMaster?.userId; // ghế Trưởng Lão/Tông Chủ đã có bảng chức vụ riêng
 const items=[];
 for(const a of list){const p=a.player;if(!p||elders.has(a.id)||a.id===master)continue;const tt=titleOf(p,nowMs);if(!titleVisible(tt,count))continue;
  const b=plaque(tt);if(!b)continue;items.push({tt,id:a.id,rank:tt.rank,x:a.x,y:a.y-(a.scale||1)*HEAD_K+4,w:b.w,h:b.h});}
 for(const it of layoutTitles(items))drawTitlePlaque(c,it.tt,it.x,it.y,t,(String(it.id).length*7+String(it.id).charCodeAt(0))%17,light);
}
