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
import {TITLE_LIST,TITLE_BY_KEY} from './title-data.js';
import {skinFor} from './cosmetics.js';
const FAMILY='"Noto Serif","Times New Roman",Georgia,serif',FALLBACK_FAMILY='"Times New Roman",Georgia,serif';
const sizeOf=rank=>rank<=1?17:rank<=4?16:rank===5?15:13.5;
const fontOf=(rank,family)=>'900 '+sizeOf(rank)+'px '+family;
const RES=3; // bitmap 3× → nét trên LIVE 1080 px kể cả khi camera phóng
const HEAD_K=80,HEAD_GAP=5; // HEAD_GAP: khe giữa đỉnh tóc và chữ (đơn vị sprite)
// (cũ) đỉnh đầu ≈ chân − HEAD_K × scale (bitmap có lề 5 px → đáy chữ hạ thêm 4)
// 21/11 tối (bản 3, chủ game): danh hiệu = GHẾ HIẾM do server tính (titles.mjs → p.title {key,rank,group,sparkle,n,lh}); danh mục public/title-data.js.
// Không icon — mỗi danh hiệu 1 ẢNH CHỮ riêng Codex vẽ (public/assets/title-text/<key>.webp). Danh hiệu nạp CHỈ lấp lánh khi tổng quà ≥3.000 (sparkle).
// Ảnh chưa tải → vẽ tạm chữ theo màu nhóm. Server cũ (chưa có p.title) → không vẽ.
export const eventIcon=()=>null; // giữ tên export cũ (không còn icon)
const GOLD={fill:['#fffbe6','#ffe27a','#f2b632','#a8700f'],stroke:'#3b2300',glow:'#ffcc4d'};
const STYLE=Object.freeze({
 paid:{...GOLD,flashMs:4400,sparkle:true},
 luanhoi:{fill:['#f3e6ff','#c99bff','#9b5cff','#e2b54a'],stroke:'#1a0a2a',glow:'#b77bff'},
 evil:{fill:['#ffb3b3','#e01f1f','#7a0000','#2a0000'],stroke:'#000000',glow:'#ff2a2a'},
 love:{fill:['#fff0f6','#ffc2dc','#ff8fbf','#e0609a'],stroke:'#5a1030',glow:'#ffb3d1'},
 event:{fill:['#f2fffd','#9ff3ff','#3cc8e6','#127a9c'],stroke:'#03202c',glow:'#5fe0ff'},
 sect:{fill:['#fffaf0','#f3ead8','#f3ead8','#d8c9a8'],stroke:'#1b1813',glow:null},
});
const LIMIT=Object.freeze({busy:30,crowd:50});
export const SHORT=Object.freeze(Object.fromEntries(TITLE_LIST.map(t=>[t.key,t.name])));
const mk=(v,extra)=>{const d=TITLE_BY_KEY[v?.key];if(!d)return null;return {rank:d.rank,kind:d.group,key:d.key,text:d.name,paid:d.group==='paid'&&!!v.sparkle,n:v.n,...extra};};
/** Danh hiệu đang mặc của 1 người (server tính sẵn p.title) hoặc null. */
export function titleOf(p){if(!p||p.resident||p.puppet||!p.title)return null;return mk(p.title);}
/** Dòng Luân Hồi đi kèm khi đang mặc danh hiệu khác (p.title.lh) hoặc ngồi ghế chức vụ (seat). */
export function luanHoiExtra(p,now=Date.now(),seat=false){if(!p||p.resident||p.puppet||!(Number(p.reincarnations)>0))return null;
 if(!seat&&!p.title?.lh)return null;return mk({key:'luan-hoi',n:Number(p.reincarnations)},{extra:true});}
/** Có hiện không, theo độ đông sân: >50 người chỉ Tông Chủ/Thần Tài/Đại Gia, >30 thêm Luân Hồi/Nhà Giàu/ghế lớn. */
export const titleVisible=(t,count)=>!!t&&(count>LIMIT.crowd?t.rank<=2:count>LIMIT.busy?t.rank<=5:true); // 21/11 tối (chủ game): đông người thì tắt bớt danh hiệu cấp thấp là được

// ---- icon (ảnh Codex vẽ, tải 1 lần) ----
const icons=new Map();
function icon(name){if(!name||typeof Image==='undefined')return null;let im=icons.get(name);if(!im){im=new Image();im.decoding='async';im.src='/assets/title-icons/'+name+'.webp';icons.set(name,im);}return im.complete&&im.naturalWidth?im:null;}
let fontReady=false,fontAsked=false;
function fontOk(){if(fontReady)return true;if(typeof document==='undefined'||!document.fonts)return false;
 if(document.fonts.check(fontOf(0,FAMILY)))return fontReady=true;if(!fontAsked){fontAsked=true;document.fonts.load(fontOf(0,FAMILY)).then(()=>{fontReady=true;bitmaps.clear();}).catch(()=>{});}return false;}

function makeCanvas(w,h){if(typeof OffscreenCanvas!=='undefined')return new OffscreenCanvas(w,h);if(typeof document!=='undefined'){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}return null;}
const bitmaps=new Map();
function styleOf(t){return {...(STYLE[t.kind]||STYLE.sect),icon:null};}
// ---- ảnh chữ (Codex vẽ, tải 1 lần) ----
const arts=new Map();
function textArt(key){if(!key||typeof Image==='undefined')return null;let im=arts.get(key);if(!im){im=new Image();im.decoding='async';im.src='/assets/title-text/'+key+'.webp?v=2';arts.set(key,im);}return im.complete&&im.naturalWidth?im:null;}
const artH=rank=>rank<=2?27:rank<=4?25:23; // chiều cao ảnh chữ trên sân (px)
// Bitmap từ ẢNH CHỮ: icon trái + ảnh chữ (+ "×N" Luân Hồi từ lần 2); bản trắng cùng hình để quét vệt sáng.
function artPlaque(t,st,im,art){const ih=artH(t.rank),iw=Math.round(ih*art.naturalWidth/art.naturalHeight),iconS=im?Math.round(ih*1.05):0,gap=iconS?2:0,pad=4;
 const nTxt=t.n>=2?'×'+t.n:'',nFont='900 '+Math.round(ih*.62)+'px "Segoe UI",Arial,sans-serif';
 const probe=makeCanvas(4,4);if(!probe)return null;const pc=probe.getContext('2d');pc.font=nFont;const nw=nTxt?Math.ceil(pc.measureText(nTxt).width)+3:0;
 const W=pad*2+iconS+gap+iw+nw,H=Math.max(iconS,ih)+pad*2;
 const mkc=()=>{const cv=makeCanvas(Math.ceil(W*RES),Math.ceil(H*RES));const c=cv.getContext('2d');c.setTransform(RES,0,0,RES,0,0);c.imageSmoothingQuality='high';return [cv,c];};
 const draw=c=>{if(im){c.save();if(st.glow){c.shadowColor=st.glow;c.shadowBlur=5;}c.drawImage(im,pad,(H-iconS)/2,iconS,iconS);c.restore();}
  c.drawImage(art,pad+iconS+gap,(H-ih)/2,iw,ih);
  if(nTxt){c.font=nFont;c.textBaseline='middle';c.lineJoin='round';const x=pad+iconS+gap+iw+2,y=H/2+1;c.lineWidth=3.5;c.strokeStyle='#120a18';c.strokeText(nTxt,x,y);c.fillStyle='#d9a8ff';c.fillText(nTxt,x,y);}};
 const [cv,c]=mkc();draw(c);
 let shine=null;if(t.paid){const [sc,s]=mkc();draw(s);s.globalCompositeOperation='source-in';s.fillStyle='#ffffff';s.fillRect(0,0,W,H);shine=sc;}
 return {cv,shine,w:W,h:H,st,art:true};}
// Bitmap: chữ (gradient + viền tối + quầng sáng) và icon bên trái; kèm bản "chữ trắng" để quét vệt sáng đúng hình chữ.
function plaque(t){const ok=fontOk(),st=styleOf(t),im=icon(st.icon),art=textArt(t.key),key=t.kind+'|'+t.text+'|'+(t.n||0)+'|'+(t.tier?.main||'')+'|'+st.icon+'|'+ok+'|'+!!im+'|'+!!art;let b=bitmaps.get(key);if(b)return b;
 if(art){b=artPlaque(t,st,im,art);if(b){bitmaps.set(key,b);if(bitmaps.size>220)bitmaps.delete(bitmaps.keys().next().value);}return b;}
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
 if(ph<=dur){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=(b.art?.16:.32)*s;c.drawImage(b.shine,x0,y0,W,H); // cả chữ bừng lên
  c.beginPath();c.moveTo(sx-band,y0+H);c.lineTo(sx-band+10,y0);c.lineTo(sx+band+10,y0);c.lineTo(sx+band,y0+H);c.closePath();c.clip();
  if(b.art){c.globalAlpha=.42;c.drawImage(b.shine,x0,y0,W,H);}else{c.globalAlpha=1;c.drawImage(b.shine,x0,y0,W,H);c.globalAlpha=.6;c.drawImage(b.shine,x0,y0,W,H);}c.restore();} // ảnh chữ: vệt nhẹ để chữ vẫn đọc được // vệt quét sáng chói
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

// 21/11 tối (chủ game: "người bị danh hiệu che đầu, người thì cao quá, người thì ở giữa người"): trước đặt cố định chân − 80×scale cho mọi hình.
// Nay ĐO đỉnh đầu thật: vẽ riêng THÂN người (không VFX/pháp bảo/cánh) ra bitmap nhỏ một lần cho mỗi kiểu hình, quét alpha cột giữa (±18 đơn vị,
// tránh pháp bảo hai bên) → khoảng cách chân→đỉnh đầu (đơn vị sprite). Lưu theo khóa hình dạng; ảnh chưa tải xong thì dùng tạm HEAD_K, đo lại sau.
const heads=new Map(),HS=2,HW=200,HH=340,HOX=100,HOY=280;let headBudget=0,headFrame=0;
const headKey=p=>[p.realm,p.gender,p.skinChoice,p.skinChoiceSource,p.divineRoleChoice,p.divineRoleHidden,(p.divineRoles||[]).join(),(p.rewardSkins||[]).length,skinFor(p.giftCoins)?.level,p.relicVariant,p.mountChannel?1:0].join('|');
export function headUnits(scene,p,frame=0){if(!scene?.drawCharacterBody||typeof document==='undefined')return HEAD_K;
 const k=headKey(p);const v=heads.get(k);if(v&&v.ok)return v.h;if(v&&frame-v.frame<90)return v.h; // chưa đo được (ảnh chưa tải) → thử lại sau ~1,5 s
 if(headFrame!==frame){headFrame=frame;headBudget=3;}if(headBudget<=0)return v?.h??HEAD_K;headBudget--; // tối đa 3 lần đo / khung
 const cv=makeCanvas(HW,HH);const c=cv?.getContext('2d',{willReadFrequently:true});if(!c)return HEAD_K;
 const saved={compact:scene.compact,characterFrames:scene.characterFrames,cinematicPose:scene.cinematicPose,huyenRitualPose:scene.huyenRitualPose,raceStatus:scene.raceStatus,motion:scene.motion};
 let h=null;
 try{Object.assign(scene,{compact:true,characterFrames:null,cinematicPose:null,huyenRitualPose:null,raceStatus:null,motion:false});
  c.translate(HOX,HOY);c.scale(HS,HS);scene.drawCharacterBody(c,p,skinFor(p.giftCoins),0);
  const x0=HOX-18*HS,w=36*HS,d=c.getImageData(x0,0,w,HOY).data;
  for(let y=0;y<HOY&&h==null;y++){let n=0;for(let x=0;x<w;x++)if(d[(y*w+x)*4+3]>60&&++n>=3){h=(HOY-y)/HS;break;}}
 }catch{}finally{Object.assign(scene,saved);}
 const ok=h!=null&&h>20&&h<135;const val={h:ok?h:HEAD_K,ok,frame};heads.set(k,val);if(heads.size>600)heads.delete(heads.keys().next().value);return val.h;}
/** Vẽ cho cả sân: gọi SAU CÙNG (sau người, tên, hiệu ứng). targets: [{id,x,y,scale,player}] (y = chân). */
let frameNo=0;
export function drawTitlePlaques(scene,c,t,nowMs){frameNo++;const list=scene.targets||[];if(!list.length||scene.bareCrowd&&list.length>80)return;
 const count=list.length,light=scene.budget?.level==='light';
 const elders=new Set((scene.sectElders||[]).map(e=>e?.id||e?.player?.id||e?.userId).filter(Boolean)),master=scene.sectMaster?.userId; // ghế Trưởng Lão/Tông Chủ đã có bảng chức vụ riêng
 const items=[];
 for(const a of list){const p=a.player;if(!p)continue;const seat=elders.has(a.id)||a.id===master,head=a.y-(a.titleLift||0)-(a.scale||1)*(headUnits(scene,p,frameNo)+HEAD_GAP)+4;if(globalThis.__titleDebug&&p.title){c.save();c.fillStyle='lime';c.fillRect(a.x-14,a.y-1,28,2);c.fillStyle='red';c.fillRect(a.x-14,head-5,28,2);c.restore();}
  // 21/11: Luân Hồi đi KÈM danh hiệu nạp (Tông Chủ/Kim Cương che mất — Tông chủ Đế giang chuyển sinh mà không thấy). Ghế Tông Chủ/Trưởng Lão chỉ hiện dòng Luân Hồi.
  // 21/11 tối: Trưởng Lão cũng hiện danh hiệu (trước bỏ vì ghế có bảng chức vụ — người xem tưởng không mang được)
  const lh=luanHoiExtra(p,nowMs,seat),tt=titleOf(p,nowMs);let y=head;
  if(titleVisible(tt,count)){const b=plaque(tt);if(b){items.push({tt,id:a.id,rank:tt.rank,x:a.x,y,w:b.w,h:b.h});y-=b.h-4;}}
  if(lh&&tt?.key!=='luan-hoi'&&titleVisible(lh,count)){const b=plaque(lh);if(b)items.push({tt:lh,id:a.id+'#lh',rank:lh.rank,x:a.x,y,w:b.w,h:b.h});}}
 const SW=scene.width||900;for(const it of items)it.x=Math.max(it.w/2+4,Math.min(SW-it.w/2-4,it.x)); // 21/11: người sát mép → chữ không bị cắt
 for(const it of layoutTitles(items))drawTitlePlaque(c,it.tt,it.x,it.y,t,(String(it.id).length*7+String(it.id).charCodeAt(0))%17,light);
}
