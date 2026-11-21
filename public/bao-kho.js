// 18/11/2026 (chủ game): THIÊN CÔNG BẢO KHỐ trên overlay — kế hoạch docs/ghi-chu/PHAP-BAO-PLAN-2026-11-17.md mục 4 + 10.
// • Màn sự kiện (thay sân, nhẹ máy): tiêu đề + đồng hồ, bảng CƠ DUYÊN (ảnh quà → ngọn lửa, KHÔNG số %), lưới GIỚI HẠN 12 món,
//   trận pháp giữa màn với 3 thần khí bay, người vừa cầu đứng giữa trận, băng rôn từng lượt (≤3), "còn N lượt tới 4★/5★",
//   SĂN BẢO NHIỀU NHẤT cột phải. Không góc dưới trái, cách đáy ≥11%.
// • 4★: thẻ tím 2,5 s giữa màn (sân vẫn thấy). 5★: CHIẾU RIÊNG vàng 4,5 s (tín hiệu → tụ → nổ → vinh danh).
//   GIỚI HẠN: CHIẾU RIÊNG 8 s — điềm báo rung giật → chiếu chiếu (sao băng, sét, trận 3 tầng) → BÓNG ĐEN → BÙNG BÙNG BÙNG → hiện thân → truyền thế.
// • Server xếp lịch màn (phap-bao.mjs queueReveal). Biến thể theo mã lượt (màu sao băng, hướng máy, thứ tự sét, vị trí bóng).
// • Không shadowBlur/filter mỗi khung; bóng đen = ảnh món tô đen 1 lần (cache).
import {txt,drawCaster,drawCutInBand,cutVeil,giftImg,CUT_PHASE} from './skill-cutscene.js?v=20261118';
import {tmOn} from './ink-panel.js';
import {clamp,seg,out3,smooth,dot,fxCamera,punch,drawBurst,drawEmbers,drawVignette,drawLetterbox,drawImpactFrame,drawGhostSplit,hitStop,drawSkyBeams,drawCircle,drawZoomLines} from './cut-fx.js?v=20261118';
import {giftFor} from './gift-icons.js';
import {donorPortrait} from './gift-donor.js';
import {LIM} from './bao-limited-timing.js';
import {BAO_ITEMS,BAO_TIER,BAO_STAT_NAME,BAO_FLAMES,BAO_LIMITED_STOCK,baoItem,baoArt,baoStat} from './phap-bao-data.js';

const TAU=Math.PI*2,ease=k=>1-(1-clamp(k))**3;
const perf=()=>globalThis.performance?.now?.()??Date.now();
const hash=s=>{let h=2166136261;for(const ch of String(s))h=Math.imul(h^ch.charCodeAt(0),16777619);return h>>>0;};
const rnd=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};
const nowAt=(scene,t)=>(scene.stateServerNow||Date.now())+Math.min(2000,Math.max(0,t-(scene.stateReceivedAt||t)));
const short=(name,n=12)=>{const a=Array.from(String(name||'Đạo hữu').trim());return a.length>n?a.slice(0,n-1).join('')+'…':a.join('');};
const hasDoc=()=>typeof document!=='undefined';
export const P4=Object.freeze({main:'#b45cff',soft:'#ecd4ff',gold:'#ffe28a',deep:'#0e0420'});
export const P5=Object.freeze({main:'#ffb52e',soft:'#fff1b8',gold:'#ffffff',deep:'#1a0f02'});
export const P6=Object.freeze({main:'#ff5fb8',soft:'#ffd0ec',gold:'#ffd36b',deep:'#12030c'});
const METEOR=['#ff5fb8','#ffd36b','#9b6bff','#ff4a3d','#5fd8ff'];
const CARD_MS=2500,BANNER_MS=4200;

function canvas2(w,h){if(typeof OffscreenCanvas!=='undefined')return new OffscreenCanvas(w,h);if(hasDoc()){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}return null;}
function bz(scene){return scene.baoFx??={images:new Map(),seen:new Set(),id:null,banners:[],cards:[],last:null,bg:null,bgH:0,sil:new Map(),flame:null,giftArt:null};}
function img(h,src){if(!src||typeof Image==='undefined')return null;let g=h.images.get(src);if(!g){const im=new Image();im.decoding='async';g={im,ready:false};im.onload=()=>g.ready=true;im.src=src;h.images.set(src,g);}return g.ready?g.im:null;}
const itemImg=(h,id)=>img(h,baoArt(id));

/** Nhận state mới: lưu sự kiện, nạp ảnh, sinh băng rôn/thẻ 4★ cho lượt mới (không phát lại lượt cũ khi vừa mở overlay). */
export function syncBaoKho(scene,state){
 const e=state?.baoKho||null,h=bz(scene);scene.baoKhoStatus=e;if(state?.giftArt)h.giftArt=state.giftArt;
 if(hasDoc())document.body?.classList?.toggle('bao-kho',!!e);
 if(!e){h.id=null;return;}
 if(h.id!==e.id){h.id=e.id;h.seen=new Set((e.log||[]).map(r=>r.k));h.banners=[];h.cards=[];h.last=(e.log||[]).at(-1)||null;for(const it of BAO_ITEMS)itemImg(h,it.id);}
 const t=perf();
 for(const r of e.log||[]){if(h.seen.has(r.k))continue;h.seen.add(r.k);h.banners.push({...r,t0:t});if(r.t===4)h.cards.push({...r,t0:0});h.last=r;}
 if(h.banners.length>8)h.banners.splice(0,h.banners.length-8);
 if(h.cards.length>2)h.cards.splice(0,h.cards.length-2);
 if(h.seen.size>200)h.seen=new Set([...h.seen].slice(-60));
}

/** Màn chiếu đang chạy (hoặc null). */
export function findReveal(e,now){let best=null;for(const x of e?.reveals||[]){const age=now-x.at;if(age>=0&&age<x.ms&&(!best||x.at>best.x.at))best={x,age};}return best?{x:best.x,age:best.age,ms:best.x.ms,k:best.age/best.x.ms}:null;}

/** Hook đầu scene.drawFrame: true = đã vẽ cả màn (bỏ sân). */
export function baoCutFrame(scene,c,t,H){
 const e=scene.baoKhoStatus,cut=e?findReveal(e,nowAt(scene,t)):null,full=!!cut&&cut.k>=CUT_PHASE.wipeIn&&cut.k<CUT_PHASE.wipeOut;
 if(!!scene.baoCutOn!==!!cut){scene.baoCutOn=!!cut;if(hasDoc())document.body?.classList?.toggle('cutscene-on',!!cut);}
 if(cut||scene.baoVeilUsed){scene.baoVeilUsed=!!cut;cutVeil(cut,full);}
 if(cut&&cut.x.t>=6&&scene.onBaoLimitedAudio&&scene.baoAudioK!==e.id+":"+cut.x.k){scene.baoAudioK=e.id+":"+cut.x.k;scene.onBaoLimitedAudio(scene.baoAudioK,cut.age);} /* 21/11 tối: nhạc riêng màn GIỚI HẠN, bắt đầu từ giây 0 */
 if(!full)return false;
 try{if(cut.x.t>=6)drawLimitedReveal(scene,c,t,H,cut,e);else drawGoldReveal(scene,c,t,H,cut);}catch(err){console.warn('[bao-cut]',err);return false;}
 const sec=cut.age/1000,seen=scene.baoCutSeen??=new Set(),cue=(key,at,level)=>{const id=cut.x.k+':'+key;if(sec>=at&&sec<at+.6&&!seen.has(id)){seen.add(id);scene.onFeedbackSound?.('hit',level);}};
 if(cut.x.t>=6){if(!scene.onBaoLimitedAudio){LIM.tiers.forEach((b,i)=>cue('t'+i,b,i===2?2:1));LIM.hearts.forEach((b,i)=>cue('hb'+i,b,1));LIMITED_BOOMS.forEach((b,i)=>cue('b'+i,b,3));}}
 else cue('hit',1.8,3);
 if(seen.size>90)scene.baoCutSeen=new Set([...seen].slice(-30));
 return true;
}

// ───────────── MÀN SỰ KIỆN (18/11 tối, chủ game: "làm bài bản như kênh mẫu") ─────────────
// Nền vẽ (assets/bao-kho-v1/vault-bg.webp) + nhân vật dẫn Khí Linh; tiêu đề chữ có chân vàng; bảng khung vàng hai lớp có góc hoa văn;
// trận pháp dưới sàn (phối cảnh) + thần khí bay; băng rôn lượt cầu to giữa màn. Vẫn giữ luật: bảng CƠ DUYÊN là lửa (không %), không góc dưới trái.
const SERIF='"Noto Serif","Times New Roman",Georgia,serif';
const ART={bg:'/assets/bao-kho-v1/vault-bg.webp',guide:'/assets/bao-kho-v1/khi-linh.webp'};
function stx(c,s,x,y,size,fill,{width=7,align='center',max,stroke='#1a0d02',weight='900'}={}){c.font=weight+' '+size+'px '+SERIF;c.textAlign=align;c.textBaseline='middle';c.lineJoin='round';if(width){c.lineWidth=width;c.strokeStyle=stroke;c.strokeText(s,x,y,max);}c.fillStyle=fill;c.fillText(s,x,y,max);}
const goldText=(c,y,size)=>{const g=c.createLinearGradient(0,y-size*.6,0,y+size*.6);g.addColorStop(0,'#fff8dc');g.addColorStop(.45,'#ffd86b');g.addColorStop(.55,'#e0a12e');g.addColorStop(1,'#fff0b0');return g;};
function background(h,H){
 const im=img(h,ART.bg),key=H+'|'+(im?1:0);if(h.bg&&h.bgKey===key)return h.bg;const cv=canvas2(900,Math.ceil(H));if(!cv)return null;const c=cv.getContext('2d');
 if(im){const s=Math.max(900/im.naturalWidth,H/im.naturalHeight),w=im.naturalWidth*s,hh=im.naturalHeight*s;c.drawImage(im,(900-w)/2,(H-hh)/2,w,hh);}
 else{const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#07031a');g.addColorStop(.45,'#1a0b26');g.addColorStop(1,'#04020a');c.fillStyle=g;c.fillRect(0,0,900,H);
  const r=c.createRadialGradient(450,H*.45,20,450,H*.45,H*.55);r.addColorStop(0,'#ffcf6e44');r.addColorStop(1,'#00000000');c.fillStyle=r;c.fillRect(0,0,900,H);}
 // tối nhẹ trên/dưới + hai bên cho chữ nổi
 let g=c.createLinearGradient(0,0,0,H*.2);g.addColorStop(0,'#000000b0');g.addColorStop(1,'#00000000');c.fillStyle=g;c.fillRect(0,0,900,H*.2);
 g=c.createLinearGradient(0,H*.78,0,H);g.addColorStop(0,'#00000000');g.addColorStop(1,'#000000a0');c.fillStyle=g;c.fillRect(0,H*.78,900,H*.22);
 h.bg=cv;h.bgKey=key;return cv;
}
function flameSprite(h){
 if(h.flame)return h.flame;const cv=canvas2(28,38);if(!cv)return null;const c=cv.getContext('2d');
 const g=c.createLinearGradient(0,38,0,0);g.addColorStop(0,'#ff4a1c');g.addColorStop(.55,'#ffb52e');g.addColorStop(1,'#fff6c0');c.fillStyle=g;
 c.beginPath();c.moveTo(14,1);c.bezierCurveTo(24,14,27,22,24,29);c.bezierCurveTo(21,37,7,37,4,29);c.bezierCurveTo(1,22,6,15,14,1);c.fill();
 c.fillStyle='#fffbe0';c.beginPath();c.ellipse(14,28,5,7,0,0,TAU);c.fill();h.flame=cv;return cv;
}
const rr=(c,x,y,w,hh,r)=>{c.beginPath();if(c.roundRect)c.roundRect(x,y,w,hh,r);else c.rect(x,y,w,hh);};
/** Khung bảng vàng hai lớp + góc hoa văn + dải tiêu đề. */
function panel(c,x,y,w,hh,title,{col='#d9a84a',tcol='#ffe7a8',accent=null}={}){
 c.save();const g=c.createLinearGradient(0,y,0,y+hh);g.addColorStop(0,tmOn()?'#221a12ee':'#1a0e24e8');g.addColorStop(1,tmOn()?'#0f0b07e8':'#08040ee0');c.fillStyle=g;rr(c,x,y,w,hh,12);c.fill();
 c.strokeStyle=col;c.lineWidth=2.5;rr(c,x,y,w,hh,12);c.stroke();c.globalAlpha=.55;c.strokeStyle='#fff0c0';c.lineWidth=1;rr(c,x+6,y+6,w-12,hh-12,8);c.stroke();c.globalAlpha=1;
 c.fillStyle=col;for(const [cx,cy] of [[x,y],[x+w,y],[x,y+hh],[x+w,y+hh]]){c.save();c.translate(cx,cy);c.rotate(Math.PI/4);c.fillRect(-6,-6,12,12);c.restore();}
 if(title){const ty=y+26;stx(c,title,x+w/2,ty,24,accent||tcol,{width:5,max:w-60});c.font='900 24px '+SERIF;const tw=Math.min(w-60,c.measureText?.(title)?.width||120);
  c.strokeStyle=col;c.lineWidth=1.5;for(const s of [-1,1]){const x0=x+w/2+s*(tw/2+10),x1=x+w/2+s*(w/2-18);c.beginPath();c.moveTo(x0,ty);c.lineTo(x1,ty);c.stroke();c.save();c.translate(x0+s*2,ty);c.rotate(Math.PI/4);c.fillStyle=col;c.fillRect(-3,-3,6,6);c.restore();}
  c.globalAlpha=.4;c.beginPath();c.moveTo(x+14,y+46);c.lineTo(x+w-14,y+46);c.stroke();c.globalAlpha=1;}
 c.restore();
}
function ring(c,x,y,R,lw,a,col){if(a<=.01||R<=0)return;c.globalAlpha=Math.min(1,a);c.strokeStyle=col;c.lineWidth=lw;c.beginPath();c.arc(x,y,R,0,TAU);c.stroke();}
function rays(c,x,y,n,len,a,rot,col,w=10){if(a<=.01)return;c.save();c.globalCompositeOperation='lighter';c.translate(x,y);c.rotate(rot);for(let i=0;i<n;i++){c.rotate(TAU/n);const L=len*(.7+.3*rnd(i));const g=c.createLinearGradient(0,0,L,0);g.addColorStop(0,'#ffffff');g.addColorStop(.3,col);g.addColorStop(1,col+'00');c.globalAlpha=a;c.fillStyle=g;c.beginPath();c.moveTo(0,-w/2);c.lineTo(L,0);c.lineTo(0,w/2);c.fill();}c.restore();c.globalAlpha=1;}
/** Trận pháp đứng (nhìn thẳng). tier: số tầng hiện (0..3). */
function formation(c,x,y,R,t,a,col,spin=1,tiers=3){
 if(a<=.01)return;c.save();c.globalCompositeOperation='lighter';c.translate(x,y);
 for(let k=0;k<tiers;k++){const r=R*(1-k*.28),rot=t*.0004*spin*(k%2?-1.6:1)*(1+k*.4);c.save();c.rotate(rot);
  ring(c,0,0,r,3,a*.9,col);ring(c,0,0,r-14,1.5,a*.6,'#ffffff');
  for(let i=0;i<24;i++){const q=i/24*TAU;c.globalAlpha=a*.8;c.strokeStyle=col;c.lineWidth=i%3?2:4;c.beginPath();c.moveTo(Math.cos(q)*(r-14),Math.sin(q)*(r-14));c.lineTo(Math.cos(q)*(r-(i%3?24:34)),Math.sin(q)*(r-(i%3?24:34)));c.stroke();}
  const n=6+k*2;c.globalAlpha=a*.7;c.lineWidth=2;c.strokeStyle=k%2?'#ffffff':col;c.beginPath();for(let i=0;i<=n;i++){const px=Math.cos(i/n*TAU)*(r-40),py=Math.sin(i/n*TAU)*(r-40);if(i)c.lineTo(px,py);else c.moveTo(px,py);}c.stroke();
  c.restore();}
 c.restore();c.globalAlpha=1;
}
function drawItem(h,c,id,x,y,size,a=1,spin=0){
 const im=itemImg(h,id);c.save();c.globalAlpha=a;c.translate(x,y);if(spin)c.scale(Math.cos(spin)||.001,1);
 if(im)c.drawImage(im,-size/2,-size/2,size,size);else{c.globalCompositeOperation='lighter';dot(c,BAO_TIER[baoItem(id)?.tier]?.color||'#ffd36b',0,0,size*.4,a);}
 c.restore();c.globalAlpha=1;
}
function silhouette(h,id,col){
 const key=id+'|'+col;if(h.sil.has(key))return h.sil.get(key);const im=itemImg(h,id);if(!im)return null;
 const cv=canvas2(320,320);if(!cv)return null;const c=cv.getContext('2d');c.drawImage(im,0,0,320,320);c.globalCompositeOperation='source-in';c.fillStyle=col;c.fillRect(0,0,320,320);h.sil.set(key,cv);return cv;
}
function fmtClock(ms){const s=Math.max(0,Math.ceil(ms/1000));return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');}

/** Vẽ màn sự kiện thay sân. Trả số nhân vật đã vẽ. */
export function drawBaoKho(scene,c,t,H){
 const e=scene.baoKhoStatus;if(!e)return 0;const h=bz(scene),now=nowAt(scene,t),light=scene.budget?.level==='light';
 c.save();
 const pre=findReveal(e,now);if(pre&&pre.x.t>=6&&pre.k<CUT_PHASE.wipeIn&&scene.motion!==false){const u=pre.age/1000,a=22*Math.max(0,1-u*1.2),s=Math.floor(t/45);c.translate((rnd(s)-.5)*2*a,(rnd(s+77)-.5)*1.6*a);}
 const bg=background(h,H);if(bg)c.drawImage(bg,0,0,900,H);else{c.fillStyle='#07031a';c.fillRect(0,0,900,H);}
 const open=e.phase==='open',fx=450,fy=H*.758; /* trùng tâm trận pháp vẽ sẵn trong vault-bg */
 // TRẬN PHÁP DƯỚI SÀN (phối cảnh) + cột sáng giữa
 c.save();c.translate(fx,fy);c.scale(1,.3);formation(c,0,0,420,t,.55,'#ffcf5a',1,3);c.restore();
 c.save();c.globalCompositeOperation='lighter';const pg=c.createLinearGradient(fx-110,0,fx+110,0);pg.addColorStop(0,'#ffcf5a00');pg.addColorStop(.5,'#ffe9a855');pg.addColorStop(1,'#ffcf5a00');c.fillStyle=pg;c.fillRect(fx-110,H*.3,220,fy-H*.3);c.restore();
 dot(c,'#ffd36b',fx,fy,240,.2+.05*Math.sin(t*.002));c.globalAlpha=1;
 // 3 thần khí GIỚI HẠN bay vòng trên trận, đổi bộ mỗi 8 s
 const lim=BAO_ITEMS.filter(x=>x.tier===6),set=Math.floor(t/8000);
 for(let i=0;i<3;i++){const it=lim[(set*3+i)%lim.length],q=t*.0004+i*TAU/3,x=fx+Math.cos(q)*270,y=fy-120+Math.sin(q)*70,fade=Math.min(1,Math.min((t%8000)/600,(8000-t%8000)/600)),z=.75+.25*Math.sin(q);
  dot(c,'#ffcf5a',x,y,70*z,.3*fade);c.globalAlpha=1;drawItem(h,c,it.id,x,y+Math.sin(t*.003+i)*8,120*z,fade);}
 c.save();c.globalCompositeOperation='lighter';for(let i=0;i<(light?12:26);i++){const u=((t*.00012*(1+rnd(i)))+rnd(i+3))%1;dot(c,i%3?'#ffd36b':'#c79bff',fx+(rnd(i+5)-.5)*560,fy-u*560,5+rnd(i)*6,(1-u)*.7);}c.restore();
 const who=h.last&&scene.playerIndex?.get(h.last.u);let n=0;
 if(who){drawCaster(scene,c,who,fx,fy+10,2.6,t,false);n=1;}
 header(h,c,e,now,H,t);
 flames(h,c,H);
 limited(h,c,e,H,t);
 banners(scene,h,c,t,H,e,now);
 hunters(c,e,H);
 howTo(c,H);
 if(!open)summary(c,e,H,t);
 card(scene,h,c,t,H);
 if(pre&&pre.x.t>=6&&pre.k<CUT_PHASE.wipeIn){const a=.5+.5*Math.sin(pre.age*.05);c.globalAlpha=a;c.strokeStyle='#ff2a3a';c.lineWidth=26;c.strokeRect(0,0,900,H);c.globalAlpha=1;stx(c,'… thiên địa dị tượng …',450,H*.5,36,'#ffb0b0');}
 c.restore();c.globalAlpha=1;return n;
}
function header(h,c,e,now,H,t){
 const y=H*.085,open=e.phase==='open';
 stx(c,'THIÊN CÔNG BẢO KHỐ',405,y,60,goldText(c,y,60),{width:10,max:580});
 stx(c,open?'còn '+fmtClock(e.endsAt-now):'BẢO KHỐ KHÉP LẠI',430,y+60,40,open?'#fff2d0':'#ffd36b',{width:8});
 // nhân vật dẫn Khí Linh
 const g=img(h,ART.guide),gx=790,gy=y+40,s=190+4*Math.sin(t*.002);if(g){dot(c,'#ffd36b',gx,gy,110,.25);c.globalAlpha=1;c.drawImage(g,gx-s/2,gy-s/2-6,s,s);}
 c.save();rr(c,gx-74,gy+80,148,40,8);c.fillStyle='#120a18e8';c.fill();c.strokeStyle='#d9a84a';c.lineWidth=2;c.stroke();c.restore();
 stx(c,'KHÍ LINH',gx,gy+94,20,'#ffe7a8',{width:4});stx(c,'dẫn bảo',gx,gy+112,13,'#e8dcff',{width:3,weight:'700'});
 if(open){const yy=y+112,parts=[['gõ ',26,'#f2e6ff'],['cầu',40,'#ffd36b'],[' để cầu thần khí',26,'#f2e6ff']],w=parts.map(([s,z])=>{c.font='900 '+z+'px '+SERIF;return c.measureText?.(s)?.width||z*s.length*.5;});let x=430-w.reduce((a,b)=>a+b,0)/2;
  parts.forEach(([s,z,col],i)=>{stx(c,s,x,yy,z,col,{width:z>30?8:6,align:'left'});x+=w[i];});
  const r=h.last;if(r)stx(c,short(r.name)+' · còn '+Math.max(0,r.p4)+' lượt tới 4★ · '+Math.max(0,r.p5)+' lượt tới 5★',430,yy+40,18,'#e8dcff',{width:5,weight:'700',max:620});}
}
function flames(h,c,H){
 const rows=BAO_FLAMES.filter(r=>!r.each),x=22,y=H*.205,w=272,rowH=54;panel(c,x,y,w,62+rowH*rows.length,'CƠ DUYÊN');const fl=flameSprite(h);
 rows.forEach((r,i)=>{const yy=y+78+rowH*i;
  if(i){c.save();c.globalAlpha=.18;c.strokeStyle='#ffe7a8';c.beginPath();c.moveTo(x+18,yy-rowH/2);c.lineTo(x+w-18,yy-rowH/2);c.stroke();c.restore();}
  if(r.free)stx(c,'gõ “cầu”',x+62,yy,22,'#ffffff',{width:5});
  else{const g=giftFor(h.giftArt,r.min),im=g.url?giftImg(g.url):null;if(im)c.drawImage(im,x+40,yy-22,44,44);else stx(c,'quà',x+62,yy,20,'#ffffff',{width:5});}
  if(fl)for(let k=0;k<r.flames;k++)c.drawImage(fl,x+w-24-(r.flames-k)*30,yy-18,26,36);
  if(r.min>=99)stx(c,'không trượt',x+92,yy+17,12,'#ffe28a',{width:3,weight:'700',align:'left'}); /* 18/11: quà ≥99 chắc có đồ */
 });c.globalAlpha=1;
}
function limited(h,c,e,H,t){
 const list=e.limited||[],left=list.filter(x=>!x.owner).length,x=606,y=H*.205,w=272,cw=84,chh=98;
 panel(c,x,y,w,58+chh*4,'GIỚI HẠN · còn '+left+'/'+(list.length||BAO_LIMITED_STOCK),{col:'#e07ab8',accent:'#ffc0e4'});
 list.slice(0,12).forEach((it,i)=>{const col=i%3,row=Math.floor(i/3),px=x+10+col*cw+cw/2,py=y+60+row*chh+36;
  c.save();c.globalAlpha=.5;c.strokeStyle=it.owner?'#ffd36b':'#e07ab8';c.lineWidth=1.5;c.beginPath();c.arc(px,py,34,0,TAU);c.stroke();c.restore();
  if(it.owner){dot(c,'#ff8fd0',px,py,46,.4+.15*Math.sin(t*.004+i));c.globalAlpha=1;}
  drawItem(h,c,it.id,px,py,64,it.owner?1:.55);
  stx(c,it.owner?short(it.owner,8):'chưa có chủ',px,py+48,13,it.owner?'#ffe28a':'#c9bcd8',{width:3,weight:'700',max:cw-4});
 });
}
// 18/11 (chủ game: "pháp bảo coi với trang bị kiểu gì, không thấy hướng dẫn"): bảng ĐÃ NHẬN THẦN KHÍ dưới CƠ DUYÊN.
function howTo(c,H){const x=22,y=H*.41,w=300 /* 21/11: 272 → 300, hai cột chữ từng dính nhau ("trang bị + tênđeo làm…") */,rows=[['thần khí','xem đồ đã có'],['trang bị + tên','đeo làm bản mệnh'],['bản mệnh','món đang mang'],['Tháp · tỷ thí','tự tung thần thông']];
 panel(c,x,y,w,56+rows.length*22,'ĐÃ NHẬN THẦN KHÍ');rows.forEach(([k,v],i)=>{const yy=y+66+i*22;stx(c,k,x+18,yy,16,'#ffd36b',{width:4,align:'left',max:112});stx(c,v,x+w-16,yy,15,'#f2e6ff',{width:4,align:'right',weight:'700',max:140});});}
function hunters(c,e,H){
 const top=(e.top||[]).slice(0,5);if(!top.length)return;const x=452,y=H*.775,w=426,rowH=30;panel(c,x,y,w,58+rowH*top.length,'SĂN BẢO NHIỀU NHẤT');
 top.forEach((p,i)=>{const yy=y+70+i*rowH;stx(c,(i+1)+'. '+short(p.name,13),x+20,yy,19,i?'#ffffff':'#ffe28a',{width:4,align:'left',weight:'800',max:240});stx(c,p.items+' món · '+p.pulls+' lượt',x+w-18,yy,17,'#d9cff0',{width:4,align:'right',weight:'700'});});
}
function summary(c,e,H,t){
 const x=246,y=H*.3,w=408,hh=H*.3;panel(c,x,y,w,hh,'BẢO KHỐ KHÉP LẠI');
 (e.top||[]).slice(0,3).forEach((p,i)=>{stx(c,(i+1)+'. '+short(p.name,14),450,y+100+i*76,28,i?'#ffffff':'#ffe28a',{width:6,max:w-24});stx(c,p.items+' món · '+p.pulls+' lượt',450,y+132+i*76,20,'#d9cff0',{width:5,weight:'700',max:w-24});});
 const owners=(e.limited||[]).filter(x=>x.owner);if(owners.length){stx(c,'CHỦ NHÂN GIỚI HẠN',450,y+hh-62,20,'#ffb5df',{width:5});stx(c,owners.slice(-3).map(x=>short(x.owner,9)).join(' · '),450,y+hh-30,22,'#ffffff',{width:5,weight:'800',max:w-20});}
}
// 4★: thẻ tím 2,5 s giữa màn (xếp 2 thẻ).
function card(scene,h,c,t,H){
 const cd=h.cards[0];if(!cd)return;if(!cd.t0)cd.t0=t;const age=t-cd.t0;if(age>=CARD_MS){h.cards.shift();return;}
 const sec=age/1000,it=baoItem(cd.id);if(!it)return;const cx=450,cy=H*.42,P=P4,fly=seg(sec,2.1,2.5),out=ease(fly);
 const X=cx+(770-cx)*out,Y=cy+(H*.3-cy)*out,S=1-.75*out;
 c.save();
 if(sec<.25&&!scene.reduceFlash){c.globalAlpha=(1-sec/.25)*.55;c.fillStyle=P.main;c.fillRect(0,0,900,H);c.globalAlpha=1;}
 c.globalAlpha=.74*(1-fly);c.fillStyle='#05020a';c.fillRect(-60,-60,1020,H+120);c.globalAlpha=1; /* 18/11: tối cả màn như màn nhận của kênh mẫu */
 formation(c,X,Y+20,210*S,t,.9*(1-fly),P.main,-1,3);
 rays(c,X,Y,14,340*S*smooth(seg(sec,.15,.5)),(1-fly)*.8,t*.0008,P.main,12);
 dot(c,P.main,X,Y,140*S,.6*(1-fly));
 drawItem(h,c,it.id,X,Y,270*S*(.6+.4*ease(sec/.4)),1,sec<.6?(1-ease(sec/.6))*TAU:0);
 if(fly<1){const a=seg(sec,.35,.6)*(1-fly);c.globalAlpha=a;
  stx(c,'THẦN KHÍ TRUNG CẤP',cx,cy-250,44,'#e2c4ff',{width:9});
  stx(c,it.name+(cd.s>1?' · cấp '+cd.s:''),cx,cy+200,62,'#ecd2ff',{width:11,max:840});
  stx(c,short(cd.name,18)+' nhận thần khí',cx,cy+262,32,'#ffffff',{width:7,weight:'800',max:820});
  stx(c,Object.keys(it.stats).slice(0,2).map(k=>BAO_STAT_NAME[k]+' +'+baoStat(it.id,cd.s,k)+'%').join(' · '),cx,cy+306,24,'#e8dcff',{width:5,weight:'700'});stx(c,'gõ “thần khí” để xem',cx,cy+346,22,'#d9f2ff',{width:5,weight:'700'});
  c.globalAlpha=1;}
 c.restore();
}

// ───────────── 5★: CHIẾU RIÊNG VÀNG 4,5 s ─────────────
function meteor(c,x0,y0,x1,y1,u,col,w=10){if(u<=0||u>=1.4)return;const k=Math.min(1,u),hx=x0+(x1-x0)*k,hy=y0+(y1-y0)*k,tail=.35,tx=x0+(x1-x0)*Math.max(0,k-tail),ty=y0+(y1-y0)*Math.max(0,k-tail),a=u>1?1-(u-1)/.4:1;
 c.save();c.globalCompositeOperation='lighter';const g=c.createLinearGradient(tx,ty,hx,hy);g.addColorStop(0,col+'00');g.addColorStop(.8,col);g.addColorStop(1,'#ffffff');c.globalAlpha=a;c.strokeStyle=g;c.lineCap='round';c.lineWidth=w;c.beginPath();c.moveTo(tx,ty);c.lineTo(hx,hy);c.stroke();dot(c,'#ffffff',hx,hy,w*2.4,a);dot(c,col,hx,hy,w*5,a*.6);c.restore();c.globalAlpha=1;}
function spiral(c,x,y,a,t,P,light,n=140){if(a<=.01)return;c.save();c.globalCompositeOperation='lighter';const m=light?Math.round(n*.4):n;for(let i=0;i<m;i++){const u=((t*.0007*(1+rnd(i)*.6))+rnd(i+1))%1,r=(1-u)*(260+rnd(i+2)*200),q=rnd(i+3)*TAU+u*5;dot(c,i%4?P.main:'#ffffff',x+Math.cos(q)*r,y+Math.sin(q)*r*.8,3+rnd(i)*5,a*u);}c.restore();}
function statsLine(it,s){return Object.keys(it.stats).slice(0,3).map(k=>BAO_STAT_NAME[k]+' +'+baoStat(it.id,s,k)+'%').join(' · ');}

export function drawGoldReveal(scene,c,t,H,cut){
 const x=cut.x,it=baoItem(x.id);if(!it)return;const h=bz(scene),P=P5,sec=cut.age/1000,light=scene.budget?.level==='light',motion=scene.motion!==false,rf=scene.reduceFlash,V=hash(x.k+':'+x.id);
 const ix=450,iy=H*.42,hitSec=sec-1.8,HS=hitStop(hitSec,t,.1);t=HS.t;const boom=HS.sec;
 const charge=seg(sec,.6,1.8),zoom=motion?1+.1*smooth(charge)+punch(hitSec,.12):1,shake=!motion||HS.frozen?0:hitSec>0&&hitSec<.6?(1-hitSec/.6)*18:charge*3;
 fxCamera(c,ix,iy,zoom,shake,t);
 const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,P.deep);g.addColorStop(.55,'#050302');g.addColorStop(1,P.deep);c.fillStyle=g;c.fillRect(-200,-200,1300,H+400);
 // 1. TÍN HIỆU: sao băng vàng rạch chéo
 const dir=V&1?1:-1;meteor(c,dir>0?-80:980,H*.08,dir>0?980:-80,H*.5,sec/.6,'#ffd36b',12);
 // 2. TỤ
 drawSkyBeams(c,ix,H*.64,smooth(charge)*(1-seg(sec,2.4,3.2))*.9,t,P);
 drawCircle(c,ix,H*.64,330,smooth(seg(sec,.6,1))*(1-.6*seg(sec,3.5,4.4)),t,P,dir);
 formation(c,ix,iy,230,t,smooth(charge)*(1-seg(sec,2,2.6))*.9,P.main,dir,2);
 spiral(c,ix,iy,charge*(sec<1.85?1:0),t,P,light);
 drawZoomLines(c,ix,iy,charge*.7*(sec<1.8?1:0),t,P,light,H);
 // 3. NỔ
 if(hitSec>=0&&!HS.frozen){drawBurst(c,ix,iy,boom,P,H,{light,pillar:true,scale:1.3,ground:H*.64,seed:V%7,reduceFlash:rf});
  rays(c,ix,iy,18,520*out3(boom/.5),Math.exp(-boom*1.2),boom*.4,P.main,16);
  c.save();c.globalCompositeOperation='lighter';ring(c,ix,iy,out3(boom/.7)*520,10*(1-seg(boom,0,.7)),1-seg(boom,0,.7),P.soft);ring(c,ix,iy,out3(seg(boom,.15,.9))*700,6,1-seg(boom,.15,.9),P.main);c.restore();}
 // món đồ hiện thân, xoay chậm
 if(hitSec>=0){const u=ease(seg(boom,0,.5));dot(c,P.main,ix,iy,230,.55*u);dot(c,'#ffffff',ix,iy,110,.35*u);rays(c,ix,iy,12,300,.35*u,t*.0003,P.soft,8);drawItem(h,c,it.id,ix,iy+Math.sin(t*.003)*8,300*(.7+.3*u),u,Math.sin(t*.0012)*.5);}
 drawEmbers(c,H,seg(sec,1.9,2.4)*(1-seg(sec,4,4.5)),t,P,light);
 c.restore();c.globalAlpha=1;
 drawVignette(c,H,.35+.3*smooth(charge)*(hitSec<0?1:0),ix,iy);
 if(HS.frozen&&!rf)drawImpactFrame(c,H,ix,iy,hitSec/.1,P,V%13);
 if(!HS.frozen&&hitSec>=0&&motion)drawGhostSplit(c,1-clamp(boom/.35),16);
 drawCutInBand(scene,c,scene.playerIndex?.get(x.u),H,seg(sec,.75,1.75),P,dir,t,{label:short(x.name,22)});
 drawLetterbox(c,H,seg(sec,0,.4)*(1-seg(sec,3.6,4.2)));
 // 4. VINH DANH
 if(sec>=2.2){const u=sec-2.2,pop=1+.6*(1-ease(seg(u,0,.25)));c.save();c.translate(450,H*.15);c.scale(pop,pop);txt(c,'THẦN KHÍ CAO CẤP',0,0,52,'#fff1b8',{width:11,max:860});c.restore();
  const tg=c.createLinearGradient(0,H*.21-40,0,H*.21+40);tg.addColorStop(0,'#fffbe6');tg.addColorStop(.5,'#ffd34d');tg.addColorStop(1,'#ff9b2e');
  c.globalAlpha=seg(u,.1,.35);txt(c,it.name+(x.s>1?' · cấp '+x.s:''),450,H*.215,70,tg,{width:13,max:880});
  txt(c,short(x.name,22)+' nhận thần khí',450,H*.66,40,'#ffffff',{width:9,max:860});
  txt(c,statsLine(it,x.s),450,H*.71,26,'#ffe9a8',{width:6,weight:'800',max:860});txt(c,'gõ “thần khí” xem · “trang bị + tên” để đeo · tự tung thần thông ở Lôi Đài, Tháp, tỷ thí',450,H*.755,22,'#d9f2ff',{width:5,weight:'800',max:860});c.globalAlpha=1;} /* 18/11: hướng dẫn dùng */
 const o=seg(sec,4.15,4.5);if(o>0){c.globalAlpha=o;c.fillStyle='#000';c.fillRect(-60,-60,1020,H+120);c.globalAlpha=1;}
}

// ───────────── GIỚI HẠN: CHIẾU RIÊNG 8 s ─────────────
const SIGNATURE={kiem:'orbit',chung:'freeze',kinh:'ghost',dinh:'flame',an:'seal',phien:'wind'};
function signatureFx(h,c,it,x,y,u,t,col,light){
 if(u<=.01)return;const kind=SIGNATURE[it.line]||'orbit';c.save();
 if(kind==='orbit'){for(let i=0;i<4;i++){const q=t*.0022+i*TAU/4;drawItem(h,c,it.id,x+Math.cos(q)*250,y+Math.sin(q)*110,110,u*.85);}}
 else if(kind==='ghost'){for(let i=0;i<5;i++){const q=i/5*TAU+t*.0005;c.globalCompositeOperation='lighter';drawItem(h,c,it.id,x+Math.cos(q)*240,y+Math.sin(q)*170,170,u*.35);}}
 else if(kind==='freeze'){c.globalCompositeOperation='lighter';for(let i=0;i<(light?40:110);i++)dot(c,i%3?'#bfe8ff':col,x+(rnd(i)-.5)*860,y+(rnd(i+4)-.5)*900,3+rnd(i+2)*5,u*.8);ring(c,x,y,300+Math.sin(t*.002)*8,3,u*.6,'#bfe8ff');}
 else if(kind==='flame'){c.globalCompositeOperation='lighter';for(let i=0;i<(light?30:80);i++){const v=((t*.0006*(1+rnd(i)))+rnd(i+1))%1;dot(c,i%2?'#ff7a2e':'#3fd0ff',x+(rnd(i+2)-.5)*360,y+180-v*520,8+rnd(i)*10,u*(1-v));}}
 else if(kind==='seal'){c.globalCompositeOperation='lighter';c.translate(x,y);c.rotate(t*.0006);c.strokeStyle=col;for(let i=0;i<3;i++){c.globalAlpha=u*(.8-i*.2);c.lineWidth=6-i*1.5;const s=230+i*50;c.strokeRect(-s/2,-s/2,s,s);c.rotate(Math.PI/4);}}
 else{c.globalCompositeOperation='lighter';c.lineCap='round';for(let i=0;i<10;i++){const q=t*.003+i*TAU/10,R=180+i*14;c.globalAlpha=u*.6;c.strokeStyle=i%2?col:'#ffffff';c.lineWidth=4;c.beginPath();c.arc(x,y,R,q,q+1.1);c.stroke();}}
 c.restore();c.globalAlpha=1;
}
function shards(c,x,y,u,col,seed){if(u<=0||u>=1)return;c.save();for(let i=0;i<14;i++){const q=rnd(seed+i)*TAU,d=out3(u)*(260+rnd(seed+i+40)*300),px=x+Math.cos(q)*d,py=y+Math.sin(q)*d,s=26+rnd(seed+i+9)*30;c.globalAlpha=1-u;c.translate(px,py);c.rotate(u*6*(i%2?1:-1));c.fillStyle='#050008';c.strokeStyle=col;c.lineWidth=3;c.beginPath();c.moveTo(0,-s);c.lineTo(s*.7,s*.6);c.lineTo(-s*.6,s*.4);c.closePath();c.fill();c.stroke();c.setTransform(c.getTransform?.()||c.currentTransform||new DOMMatrix());c.translate(-px,-py);}c.restore();c.globalAlpha=1;}
function lightning(c,x0,y0,x1,y1,a,col,seed){if(a<=.01)return;c.save();c.globalCompositeOperation='lighter';c.lineJoin='round';for(let pass=0;pass<2;pass++){c.globalAlpha=a*(pass?1:.5);c.strokeStyle=pass?'#ffffff':col;c.lineWidth=pass?3:10;c.beginPath();c.moveTo(x0,y0);const n=10;for(let i=1;i<=n;i++){const k=i/n;c.lineTo(x0+(x1-x0)*k+(i<n?(rnd(seed+i)-.5)*60:0),y0+(y1-y0)*k+(i<n?(rnd(seed+i+20)-.5)*60:0));}c.stroke();}c.restore();c.globalAlpha=1;}

// 21/11 tối (chủ game: "bảng GIỚI HẠN không ngầu, không khác 5★; kéo dãn nổ, rung màn giật giật"): màn GIỚI HẠN 11 s.
// Khác hẳn 5★: rung GIẬT (lệch theo bước 45 ms + cắt lát ngang kiểu glitch) thay vì lắc mượt; 5 cú BÙNG dồn dập;
// bảng HIỆN THÂN riêng: nắng lăng kính xoay, 2 vòng phù văn ngược chiều, khung thẻ thần khí viền chạy sáng, sao 4 cánh lấp lánh,
// chữ cầu vồng chạy, ảnh đại diện chủ nhân viền vàng xoay, mưa bụi hồng-vàng. Âm thanh: bao-limited-audio.js (bám mốc LIM).
export {LIM};
export const LIMITED_BOOMS=LIM.booms;
const jolt=(sec,at,len)=>sec>=at&&sec<at+len?1-(sec-at)/len:0;
/** Biên độ rung giật (px) theo giây — 0 khi không rung. */
export function limitedJerk(sec){
 let a=0;for(const at of LIM.omen)a=Math.max(a,26*jolt(sec,at,.34));
 for(const at of LIM.tiers)a=Math.max(a,12*jolt(sec,at,.22));
 for(const at of LIM.hearts)a=Math.max(a,9*jolt(sec,at,.18));
 LIM.booms.forEach((at,i)=>{a=Math.max(a,(i===4?44:18+i*6)*jolt(sec,at,i===4?.7:.32));});
 if(sec>LIM.reveal+.8&&sec<LIM.fly){const u=(sec-LIM.reveal-.8)%1.1;a=Math.max(a,7*jolt(u,0,.16));}
 if(sec>=LIM.shadow&&sec<LIM.booms[0])a=Math.max(a,2.5);
 return a;
}
function jerkAt(t,amp){const s=Math.floor(t/45);return {x:(rnd(s)-.5)*2*amp,y:(rnd(s+77)-.5)*2*amp*.8,r:(rnd(s+191)-.5)*amp*.0016};}
/** Cắt lát ngang lệch (glitch) — chỉ lúc rung mạnh, tối đa 7 lát, sao chép chính canvas. */
function glitchSlices(c,amp,t,n){if(amp<10||!c.canvas)return;const cv=c.canvas,W=cv.width,Hc=cv.height,s=Math.floor(t/45);c.save();c.setTransform(1,0,0,1,0,0);
 try{for(let i=0;i<n;i++){const y=Math.floor(rnd(s*13+i)*Hc),h=Math.max(6,Math.floor((.01+rnd(s*7+i)*.05)*Hc)),dx=(rnd(s*3+i)-.5)*amp*2.4*(W/900);c.drawImage(cv,0,y,W,h,dx,y,W,h);
  if(i%3===0){c.globalCompositeOperation='lighter';c.globalAlpha=.25;c.fillStyle=i%2?'#ff2a6a':'#2ad8ff';c.fillRect(0,y,W,Math.max(2,h*.18));c.globalAlpha=1;c.globalCompositeOperation='source-over';}}}catch{}c.restore();}
function star4(c,x,y,r,a,col){if(a<=.02||r<=.5)return;c.save();c.globalCompositeOperation='lighter';c.globalAlpha=Math.min(1,a);c.fillStyle=col;c.translate(x,y);c.beginPath();
 for(let i=0;i<4;i++){const q=i*Math.PI/2;c.lineTo(Math.cos(q)*r,Math.sin(q)*r);c.lineTo(Math.cos(q+Math.PI/4)*r*.18,Math.sin(q+Math.PI/4)*r*.18);}c.closePath();c.fill();c.fillStyle='#ffffff';c.beginPath();c.arc(0,0,r*.16,0,TAU);c.fill();c.restore();}
function twinkles(c,n,x,y,w,hh,t,a,seed,cols){for(let i=0;i<n;i++){const ph=(t*.0016*(.6+rnd(seed+i)))+rnd(seed+i+3)*TAU,tw=Math.max(0,Math.sin(ph));star4(c,x+rnd(seed+i*7)*w,y+rnd(seed+i*11)*hh,(8+rnd(seed+i+5)*18)*tw,a*tw,cols[i%cols.length]);}}
/** Nắng lăng kính xoay (nan quạt nhiều màu, cộng sáng). */
function prism(c,x,y,R,a,t,n=16){if(a<=.01)return;c.save();c.globalCompositeOperation='lighter';c.translate(x,y);c.rotate(t*.00018);const cols=['#ff5fb8','#ffd36b','#9b6bff','#5fd8ff'];
 for(let i=0;i<n;i++){const q=i/n*TAU,w=TAU/n*.42,g=c.createRadialGradient(0,0,20,0,0,R);g.addColorStop(0,'#ffffff');g.addColorStop(.25,cols[i%4]);g.addColorStop(1,cols[i%4]+'00');c.globalAlpha=a*(.35+.25*Math.sin(t*.003+i));c.fillStyle=g;c.beginPath();c.moveTo(0,0);c.arc(0,0,R,q-w,q+w);c.closePath();c.fill();}c.restore();c.globalAlpha=1;}
/** Vòng phù văn: vòng kép + vạch chia + 12 ô ấn hình thoi. */
function runeRing(c,x,y,R,a,rot,col){if(a<=.01)return;c.save();c.globalCompositeOperation='lighter';c.translate(x,y);c.rotate(rot);c.globalAlpha=a;c.strokeStyle=col;c.lineWidth=4;c.beginPath();c.arc(0,0,R,0,TAU);c.stroke();c.lineWidth=1.5;c.beginPath();c.arc(0,0,R-16,0,TAU);c.stroke();
 for(let i=0;i<72;i++){const q=i/72*TAU,L=i%6?6:14;c.beginPath();c.moveTo(Math.cos(q)*(R-16),Math.sin(q)*(R-16));c.lineTo(Math.cos(q)*(R-16+L),Math.sin(q)*(R-16+L));c.stroke();}
 for(let i=0;i<12;i++){c.save();c.rotate(i/12*TAU);c.translate(R+14,0);c.rotate(Math.PI/4);c.fillStyle=i%2?col:'#ffffff';c.fillRect(-6,-6,12,12);c.restore();}c.restore();c.globalAlpha=1;}
/** Khung thẻ thần khí: viền vàng kép, góc hoa văn, 1 vệt sáng chạy quanh viền. */
function relicFrame(c,cx,cy,w,hh,a,t,col){if(a<=.01)return;const x=cx-w/2,y=cy-hh/2;c.save();c.globalAlpha=a*.5;const bg=c.createLinearGradient(0,y,0,y+hh);bg.addColorStop(0,'#2a0620');bg.addColorStop(.5,'#0a0210');bg.addColorStop(1,'#2a0620');c.fillStyle=bg;rr(c,x,y,w,hh,26);c.fill();
 c.globalAlpha=a;const eg=c.createLinearGradient(x,y,x+w,y+hh);eg.addColorStop(0,'#fff3c4');eg.addColorStop(.35,'#ffb52e');eg.addColorStop(.65,col);eg.addColorStop(1,'#fff3c4');c.strokeStyle=eg;c.lineWidth=6;rr(c,x,y,w,hh,26);c.stroke();c.lineWidth=2;c.strokeStyle='#ffe7a8';rr(c,x+12,y+12,w-24,hh-24,18);c.stroke();
 for(const [px,py] of [[x,y],[x+w,y],[x,y+hh],[x+w,y+hh]]){c.save();c.translate(px,py);c.rotate(Math.PI/4);c.fillStyle='#ffd36b';c.fillRect(-13,-13,26,26);c.fillStyle=col;c.fillRect(-7,-7,14,14);c.restore();star4(c,px,py,34*(.7+.3*Math.sin(t*.006+px)),a,'#fff3c4');}
 const per=2*(w+hh),u=(t*.6)%per,pt=d=>{d=((d%per)+per)%per;if(d<w)return [x+d,y];d-=w;if(d<hh)return [x+w,y+d];d-=hh;if(d<w)return [x+w-d,y+hh];d-=w;return [x,y+hh-d];};
 for(let k=0;k<2;k++)for(let i=0;i<14;i++){const [px,py]=pt(u+k*per/2-i*10);dot(c,i?col:'#ffffff',px,py,18-i,a*(1-i/14));}c.restore();c.globalAlpha=1;}
function portrait(c,player,name,x,y,r,a,t,col){if(a<=.01)return;const im=player?.avatar?donorPortrait(player.avatar):null;c.save();c.globalAlpha=a;dot(c,col,x,y,r*2.2,a*.6);c.globalAlpha=a;
 c.save();c.beginPath();c.arc(x,y,r,0,TAU);c.clip();c.fillStyle='#2a0a24';c.fillRect(x-r,y-r,r*2,r*2);if(im){const s=Math.min(im.naturalWidth,im.naturalHeight);c.drawImage(im,(im.naturalWidth-s)/2,(im.naturalHeight-s)/2,s,s,x-r,y-r,r*2,r*2);}else txt(c,Array.from(String(name||'Đ'))[0]||'Đ',x,y,r,'#fff3c4',{width:4});c.restore();
 c.lineWidth=5;c.strokeStyle='#ffd36b';c.beginPath();c.arc(x,y,r+3,0,TAU);c.stroke();c.lineWidth=2;c.strokeStyle=col;c.beginPath();c.arc(x,y,r+10,t*.004,t*.004+Math.PI*1.3);c.stroke();c.beginPath();c.arc(x,y,r+10,t*.004+Math.PI,t*.004+Math.PI*1.6);c.stroke();
 for(let i=0;i<4;i++){const q=t*.004+i*Math.PI/2;star4(c,x+Math.cos(q)*(r+10),y+Math.sin(q)*(r+10),12,a,'#ffffff');}c.restore();c.globalAlpha=1;}
/** Chữ cầu vồng chạy + vệt sáng quét. */
function rainbowText(c,s,x,y,size,t,a,{width=12,max=880}={}){c.save();c.globalAlpha=a;const w=Math.min(max,size*Array.from(s).length*.62),sh=(t*.25)%w,g=c.createLinearGradient(x-w/2-sh,0,x+w*1.5-sh,0);
 ['#ff8fd0','#ffd36b','#fff6fb','#b58bff','#ff8fd0','#ffd36b'].forEach((col,i,arr)=>g.addColorStop(i/(arr.length-1),col));txt(c,s,x,y,size,g,{width,max,stroke:'#2a0018'});
 const sw=((t*.0009)%1.6)-.3;if(sw>0&&sw<1){const bx=x-w/2+sw*w,bg=c.createLinearGradient(bx-60,0,bx+60,0);bg.addColorStop(0,'#ffffff00');bg.addColorStop(.5,'#ffffffcc');bg.addColorStop(1,'#ffffff00');c.globalCompositeOperation='lighter';txt(c,s,x,y,size,bg,{width:0,max});}c.restore();c.globalAlpha=1;}

export function drawLimitedReveal(scene,c,t,H,cut,e){
 const x=cut.x,it=baoItem(x.id);if(!it)return;const h=bz(scene),sec=cut.age/1000,light=scene.budget?.level==='light',motion=scene.motion!==false,rf=scene.reduceFlash;
 const V=hash(x.k+':'+x.id),col=METEOR[V%METEOR.length],P={...P6,main:col},dir=V&2?1:-1,player=scene.playerIndex?.get(x.u)||(x.av?{avatar:x.av}:null);
 const ix=450+((V>>>4)%3-1)*30,iy=H*.43,T=LIM;
 let bi=-1;for(let i=0;i<T.booms.length;i++)if(sec>=T.booms[i])bi=i;const bSec=bi>=0?sec-T.booms[bi]:-1,HS=hitStop(bSec,t,bi===4?.12:.07);t=HS.t;const boom=HS.sec;
 const heart=Math.max(...T.hearts.map((b,i)=>punch(sec-b,.05+i*.02)));
 const zoom=motion?1+.05*smooth(seg(sec,1.2,3))+.1*smooth(seg(sec,3,5))+heart+(bi>=0?punch(bSec,.05+bi*.025):0)-.1*smooth(seg(sec,T.fly,T.end)):1;
 const amp=motion&&!HS.frozen?limitedJerk(sec):0,J=jerkAt(t,amp);
 c.save();if(amp){c.translate(450+J.x,H/2+J.y);c.rotate(J.r);c.translate(-450,-H/2);}
 fxCamera(c,ix,iy,zoom,0,t);
 const tilt=motion?((V>>>6)%3-1)*.03*smooth(seg(sec,1,4.6))*(1-seg(sec,5,5.8)):0;if(tilt){c.translate(ix,iy);c.rotate(tilt);c.translate(-ix,-iy);}
 const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0a0006');g.addColorStop(.5,sec<T.booms[4]?'#020003':'#2a0420');g.addColorStop(1,'#0a0006');c.fillStyle=g;c.fillRect(-200,-200,1300,H+400);
 // 1. ĐIỀM BÁO: 3 cú giật + viền đỏ chớp + vết nứt trời
 if(sec<1.4){const a=(.5+.5*Math.sin(sec*40))*(1-seg(sec,1,1.4));c.globalAlpha=a;c.strokeStyle='#ff2a3a';c.lineWidth=34;c.strokeRect(-10,-10,920,H+20);c.globalAlpha=1;
  T.omen.forEach((at,j)=>{if(sec<at)return;const u=1-seg(sec,at+.5,1.4);lightning(c,rnd(V+j)*900,-20,rnd(V+j+9)*900,H*(.35+rnd(V+j+4)*.4),u*.9,'#ff3a4a',V+j*17);
   if(sec<at+.07&&!rf){c.globalAlpha=.45;c.fillStyle=j%2?'#ffffff':'#ff1a3a';c.fillRect(-60,-60,1020,H+120);c.globalAlpha=1;}});
  txt(c,'… thiên địa dị tượng …',450,H*.5,38,'#ffb0b0',{width:8});}
 // 2. CHIẾU CHIẾU: sao băng + sét + trận 3 tầng
 if(sec>=1.1&&sec<6){const n=light?6:10;for(let i=0;i<n;i++){const s0=1.1+i*.2+rnd(V+i)*.12,u=(sec-s0)/.45,fromTop=(i+V)%2,xA=rnd(V+i*3)*900;
   if(fromTop)meteor(c,xA,-60,xA+(rnd(V+i+7)-.5)*400,H*.9,u,i%2?col:'#ffd36b',10);else meteor(c,dir>0?-80:980,H*(.1+rnd(V+i+5)*.6),dir>0?980:-80,H*(.1+rnd(V+i+6)*.6),u,i%2?col:'#ffffff',9);}
  for(let i=0;i<4;i++){const s0=1.35+((i+V)%4)*.42,a=sec>=s0&&sec<s0+.25?1-(sec-s0)/.25:0;lightning(c,-40,H*(.12+i*.1),940,H*(.18+i*.09),a,col,V+i*31);}}
 const tiers=sec<T.tiers[0]?0:sec<T.tiers[1]?1:sec<T.tiers[2]?2:3,fa=smooth(seg(sec,1.35,1.7))*(1-seg(sec,5.6,6.2));
 if(tiers){formation(c,ix,iy,330,t,fa,col,dir,tiers);drawCircle(c,ix,H*.66,360,fa,t,P,dir);}
 drawSkyBeams(c,ix,H*.66,smooth(seg(sec,2.4,3.2))*(1-seg(sec,5.6,6.4))*.8,t,P);
 spiral(c,ix,iy,seg(sec,3,4.9)*(sec<5?1:0),t,P,light,170);
 // 3. BÓNG ĐEN: hình món tô đen, viền sáng, khói đen cuộn, tim đập
 const shadowA=smooth(seg(sec,T.shadow,T.shadow+.5))*(sec<T.booms[4]?1:0);
 if(shadowA>0){const S=280+190*smooth(seg(sec,T.shadow,5))+heart*700,edge=silhouette(h,it.id,col),blk=silhouette(h,it.id,'#030006');
  c.save();for(let i=0;i<(light?16:36);i++){const q=t*.0011*(i%2?1:-1)+rnd(V+i)*TAU,r=S*.45+rnd(i+3)*130;dot(c,'#000000',ix+Math.cos(q)*r,iy+Math.sin(q)*r*.7,50+rnd(i)*40,shadowA*.55);}c.restore();
  if(edge){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=shadowA*(.7+.3*Math.sin(t*.01));c.drawImage(edge,ix-S*.55,iy-S*.55,S*1.1,S*1.1);c.restore();}
  if(blk){c.globalAlpha=shadowA;c.drawImage(blk,ix-S/2,iy-S/2,S,S);c.globalAlpha=1;}else dot(c,'#000000',ix,iy,S*.45,shadowA);
  if(bi>=0){c.save();c.globalCompositeOperation='lighter';c.strokeStyle='#ffffff';c.lineWidth=3;for(let j=0;j<=Math.min(bi,3);j++)for(let i=0;i<5;i++){const q=rnd(V+j*9+i)*TAU,L=S*(.25+rnd(V+i+j)*.3);c.globalAlpha=.9;c.beginPath();c.moveTo(ix,iy);c.lineTo(ix+Math.cos(q)*L*.5+(rnd(i+j)-.5)*20,iy+Math.sin(q)*L*.5);c.lineTo(ix+Math.cos(q)*L,iy+Math.sin(q)*L);c.stroke();}c.restore();c.globalAlpha=1;}}
 // 4. BÙNG ×5 — cú cuối phá vỡ bóng đen
 if(bi>=0&&!HS.frozen&&boom<2.2){const sc=.75+bi*.22+(bi===4?.35:0);drawBurst(c,ix,iy,boom,P,H,{light,pillar:bi>=3,flash:bi%2===0,scale:sc,ground:H*.66,seed:V%7+bi,reduceFlash:rf});
  c.save();c.globalCompositeOperation='lighter';ring(c,ix,iy,out3(boom/.5)*(360+bi*150),12+bi*2,1-seg(boom,0,.5),bi%2?'#ffffff':col);if(bi===4)ring(c,ix,iy,out3(seg(boom,.1,.9))*900,8,1-seg(boom,.1,.9),'#ffd36b');c.restore();
  if(bi===4){shards(c,ix,iy,seg(boom,0,1.1),col,V%50);rays(c,ix,iy,26,760*out3(boom/.5),Math.exp(-boom),boom*.3,col,20);}}
 // 5. HIỆN THÂN — bảng GIỚI HẠN riêng
 const showU=ease(seg(sec,T.reveal,T.reveal+.6)),fly=ease(seg(sec,T.fly,T.fly+.8)),stay=1-fly;
 if(sec>=T.reveal){const X=ix+(770-ix)*fly,Y=iy+(H*.3-iy)*fly,S=(380+22*Math.sin(t*.002))*(1-.75*fly),pulse=((sec-T.reveal)%1.1);
  prism(c,X,Y,760*stay,showU*stay*.75,t,light?10:18);
  runeRing(c,X,Y,250,showU*stay*.85,t*.0005,'#ffd36b');runeRing(c,X,Y,315,showU*stay*.6,-t*.00035,col);
  relicFrame(c,X,Y,470*stay+1,520*stay+1,showU*stay,t,col);
  ring(c,X,Y,S*.5+out3(pulse/.9)*380,6,(1-pulse/.9)*showU*stay,'#fff3c4');c.globalAlpha=1;
  dot(c,col,X,Y,300*(1-fly*.7),.55*showU);dot(c,'#ffd36b',X,Y,160*(1-fly*.7),.45*showU);rays(c,X,Y,18,420*stay,.45*showU,t*.0004,P.soft,11);
  signatureFx(h,c,it,X,Y,showU*(1-seg(sec,9.5,9.9)),t,col,light);
  drawItem(h,c,it.id,X,Y+Math.sin(t*.003)*10,S*(.7+.3*showU),showU,Math.sin(t*.001)*.45);
  twinkles(c,light?14:34,40,H*.08,820,H*.8,t,showU*stay,V,['#ffffff','#ffd36b','#ff8fd0','#b58bff']);}
 drawEmbers(c,H,seg(sec,T.reveal,T.reveal+.5)*(1-seg(sec,10,10.8)),t,P,light);
 if(sec>=T.reveal&&sec<10.8){c.save();c.globalCompositeOperation='lighter';for(let i=0;i<(light?24:60);i++){const u=((t*.00016*(1+rnd(i)))+rnd(i+11))%1;dot(c,i%2?'#ff8fd0':'#ffd36b',rnd(i+21)*900+Math.sin(t*.001+i)*30,u*H,4+rnd(i)*5,(1-seg(sec,10,10.8))*.8);}c.restore();}
 c.restore();c.globalAlpha=1;
 drawVignette(c,H,sec<T.booms[4]?.55:.28,ix,iy);
 if(HS.frozen&&!rf&&bi%2===0)drawImpactFrame(c,H,ix,iy,bSec/(bi===4?.12:.07),P,(V+bi)%13);
 if(!HS.frozen&&bi>=0&&bSec<.3&&motion)drawGhostSplit(c,1-clamp(bSec/.3),12+bi*5);
 if(amp&&!light)glitchSlices(c,amp,t,amp>30?7:4);
 drawCutInBand(scene,c,scene.playerIndex?.get(x.u),H,seg(sec,3.6,4.45),P,dir,t,{label:short(x.name,22)});
 drawLetterbox(c,H,seg(sec,1.1,1.5)*(1-seg(sec,9.4,10.2)));
 // CHỮ
 if(sec>=1.5&&sec<T.booms[4]){c.globalAlpha=seg(sec,1.5,1.9)*(1-seg(sec,T.booms[4]-.3,T.booms[4]));txt(c,'THẦN KHÍ GIỚI HẠN HIỆN THẾ',450+(amp?J.x*.5:0),H*.15,42,'#ffb5df',{width:9,max:860});c.globalAlpha=1;}
 if(sec>=T.reveal+.2&&sec<T.fly+.6){const u=sec-T.reveal-.2,a=seg(u,0,.25)*(1-seg(sec,T.fly,T.fly+.6)),pop=1+.6*(1-ease(seg(u,0,.25)));
  c.save();c.globalAlpha=a;c.translate(450,H*.1);c.scale(pop,pop);rainbowText(c,'✦ THẦN KHÍ GIỚI HẠN ✦',0,0,46,t,a,{width:10,max:860});c.restore();
  // dải lụa đỏ "ĐỘC NHẤT"
  c.save();c.globalAlpha=a;const ry=H*.145,rw=420;const rg=c.createLinearGradient(450-rw/2,0,450+rw/2,0);rg.addColorStop(0,'#7a0018');rg.addColorStop(.5,'#d4143a');rg.addColorStop(1,'#7a0018');c.fillStyle=rg;c.beginPath();c.moveTo(450-rw/2-26,ry-20);c.lineTo(450+rw/2+26,ry-20);c.lineTo(450+rw/2+8,ry);c.lineTo(450+rw/2+26,ry+20);c.lineTo(450-rw/2-26,ry+20);c.lineTo(450-rw/2-8,ry);c.closePath();c.fill();c.strokeStyle='#ffd36b';c.lineWidth=2;c.stroke();
  txt(c,'ĐỘC NHẤT · CHỈ MỘT CHỦ NHÂN',450,ry+1,22,'#ffffff',{width:4,stroke:'#3a0008'});c.restore();
  const ny=H*.205;c.save();c.translate(450,ny);rainbowText(c,it.name,0,0,84,t+400,a,{width:15,max:880});c.restore();
  const oy=H*.675,nm=short(x.name,20);c.font='900 44px "Segoe UI",Arial,sans-serif';const nw=Math.min(520,c.measureText?.(nm)?.width||300),ox=450-(nw+130)/2+52;portrait(c,player,x.name,ox,oy,52,a,t,col);
  c.globalAlpha=a;txt(c,nm,ox+78,oy-14,44,'#ffffff',{width:9,max:520,stroke:'#2a0018',align:'left'});txt(c,'CHỦ NHÂN DUY NHẤT',ox+78,oy+30,26,'#ffd36b',{width:6,max:520,align:'left'});
  const left=(e?.limited||[]).filter(q=>!q.owner).length;txt(c,statsLine(it,x.s)+' · còn '+left+'/'+((e?.limited||[]).length||BAO_LIMITED_STOCK),450,H*.74,25,'#ffe9a8',{width:6,weight:'800',max:860});
  txt(c,'gõ “thần khí” xem · “trang bị + tên” để đeo · tự tung thần thông ở Lôi Đài, Tháp, tỷ thí · có màn chiêu riêng',450,H*.78,22,'#d9f2ff',{width:5,weight:'800',max:870});c.globalAlpha=1;}
 const o=seg(sec,10.55,11);if(o>0){c.globalAlpha=o;c.fillStyle='#000';c.fillRect(-60,-60,1020,H+120);c.globalAlpha=1;}
}

// ───────────── DÒNG THÔNG BÁO TRÚNG (21/11 tối, chủ game) ─────────────
// 4★ dòng thường (tím) · 5★ dòng VÀNG có vệt sáng quét · GIỚI HẠN dòng LẤP LÁNH (cầu vồng chạy + sao 4 cánh). Ảnh đại diện + tên + "cầu được" + ảnh thần khí.
// Dòng 5★/GIỚI HẠN chờ màn chiếu riêng của nó xong mới hiện (không bị màn chiếu che mất).
export const LINE_MS=Object.freeze({0:2600,4:5200,5:7500,6:10000});
const LINE_H={0:46,4:66,5:74,6:86};
function lineAvatar(scene,b){return b.av||scene.playerIndex?.get(b.u)?.avatar||null;}
function drawWinLine(scene,h,c,b,x,y,w,a,t){
 const tier=b.t||0,hh=LINE_H[tier]||46,it=b.id?baoItem(b.id):null,r=hh/2;
 c.save();c.globalAlpha=a;
 if(tier===0){c.globalAlpha=a*.85;c.fillStyle='#120a1ce0';rr(c,x,y-r,w,hh,r);c.fill();c.strokeStyle='#7f7396';c.lineWidth=2;rr(c,x,y-r,w,hh,r);c.stroke();c.globalAlpha=a;
  txt(c,short(b.name,14)+' · TRƯỢT',x+w/2,y,24,'#e6dcf4',{width:5,max:w-30});c.restore();return;}
 const bg=c.createLinearGradient(x,0,x+w,0);
 if(tier===4){bg.addColorStop(0,'#2a0f4af0');bg.addColorStop(.5,'#160826f0');bg.addColorStop(1,'#2a0f4af0');}
 else if(tier===5){bg.addColorStop(0,'#4a2a02f4');bg.addColorStop(.5,'#8a5a0af4');bg.addColorStop(1,'#4a2a02f4');}
 else{const sh=(t*.0004)%1;['#5a0a3a','#7a3a08','#3a0a6a','#5a0a3a','#7a3a08'].forEach((col,i,arr)=>bg.addColorStop(((i/(arr.length-1))+sh)%1,col+'f4'));}
 c.fillStyle=bg;rr(c,x,y-r,w,hh,r);c.fill();
 if(tier>=5){c.save();rr(c,x,y-r,w,hh,r);c.clip();const sp=tier===6?.0011:.0007,sw=((t*sp+rnd(b.k||1))%1.5)-.25,bx=x+sw*w,sg=c.createLinearGradient(bx-80,0,bx+80,0);sg.addColorStop(0,'#ffffff00');sg.addColorStop(.5,tier===6?'#ffffffaa':'#fff3c499');sg.addColorStop(1,'#ffffff00');c.globalCompositeOperation='lighter';c.fillStyle=sg;c.fillRect(x,y-r,w,hh);c.restore();}
 const edge=tier===4?'#b45cff':tier===5?'#ffd36b':null;
 if(edge){c.strokeStyle=edge;c.lineWidth=tier===5?4:2.5;rr(c,x,y-r,w,hh,r);c.stroke();}
 else{const eg=c.createLinearGradient(x,0,x+w,0),sh=(t*.0006)%1;['#ff8fd0','#ffd36b','#b58bff','#5fd8ff','#ff8fd0'].forEach((col,i,arr)=>eg.addColorStop(((i/(arr.length-1))+sh)%1,col));c.strokeStyle=eg;c.lineWidth=5;rr(c,x,y-r,w,hh,r);c.stroke();c.strokeStyle='#ffffff88';c.lineWidth=1.5;rr(c,x+5,y-r+5,w-10,hh-10,r-5);c.stroke();}
 // ảnh đại diện
 const ar=r-7,ax=x+r,im=donorPortrait(lineAvatar(scene,b));c.save();c.beginPath();c.arc(ax,y,ar,0,TAU);c.clip();c.fillStyle='#2a1838';c.fillRect(ax-ar,y-ar,ar*2,ar*2);
 if(im){const s=Math.min(im.naturalWidth,im.naturalHeight);c.drawImage(im,(im.naturalWidth-s)/2,(im.naturalHeight-s)/2,s,s,ax-ar,y-ar,ar*2,ar*2);}else txt(c,Array.from(String(b.name||'Đ'))[0]||'Đ',ax,y,ar,'#ffffff',{width:3});c.restore();
 c.strokeStyle=tier===6?'#fff3c4':edge;c.lineWidth=3;c.beginPath();c.arc(ax,y,ar+1,0,TAU);c.stroke();
 // ảnh thần khí bên phải
 const ix=x+w-r-4;if(tier>=5)dot(c,tier===6?'#ff8fd0':'#ffd36b',ix,y,hh*.85,.55+.2*Math.sin(t*.006));c.globalAlpha=a;if(it)drawItem(h,c,it.id,ix,y,hh*1.05,a);c.globalAlpha=a;
 // chữ
 const tx=x+hh+8,tw=w-hh*2-12,nameCol=tier===4?'#ffffff':tier===5?'#fff6d8':'#ffffff',itemCol=tier===4?'#e2c4ff':tier===5?'#ffd34d':null;
 const tag=tier===4?'★4':tier===5?'★5':'✦ GIỚI HẠN',label=short(b.name,tier===6?16:13)+' cầu được';
 txt(c,label,tx,y-hh*.2,tier===6?24:21,nameCol,{width:5,align:'left',max:tw,stroke:tier===6?'#3a0024':'#05060c'});
 const nm=(it?.name||'')+(b.s>1?' · cấp '+b.s:''),fs=tier===6?32:tier===5?29:26;
 if(tier===6){c.save();c.translate(0,0);const g2=c.createLinearGradient(tx,0,tx+tw,0),sh=(t*.0005)%1;['#ff8fd0','#ffd36b','#fff6fb','#b58bff','#ff8fd0'].forEach((col,i,arr)=>g2.addColorStop(((i/(arr.length-1))+sh)%1,col));txt(c,tag+' '+nm,tx,y+hh*.2,fs,g2,{width:7,align:'left',max:tw,stroke:'#2a0018'});c.restore();}
 else txt(c,tag+' '+nm,tx,y+hh*.2,fs,itemCol,{width:6,align:'left',max:tw});
 c.restore();c.globalAlpha=1;
 if(tier===6)twinkles(c,9,x-10,y-r-14,w+20,hh+28,t,a,(b.k||1)*31,['#ffffff','#ffd36b','#ff8fd0']);
 else if(tier===5)twinkles(c,4,x,y-r-6,w,hh+12,t,a*.8,(b.k||1)*17,['#fff3c4','#ffffff']);
}
/** Danh sách dòng: mới nhất ở trên, trượt vào từ phải; 5★/GIỚI HẠN đợi màn chiếu xong. */
function banners(scene,h,c,t,H,e,now){
 const ready=[];for(const b of h.banners){if(!b.shown){const rv=b.t>=5?(e?.reveals||[]).find(x=>x.k===b.k):null;if(rv&&now<rv.at+rv.ms)continue;b.shown=t;}if(t-b.shown<(LINE_MS[b.t||0]||LINE_MS[0]))ready.push(b);}
 h.banners=h.banners.filter(b=>!b.shown||t-b.shown<(LINE_MS[b.t||0]||LINE_MS[0]));if(h.banners.length>8)h.banners.splice(0,h.banners.length-8);
 const live=ready.slice(-4);let y=H*.515;const w=600,x0=450-w/2;
 for(let i=live.length-1;i>=0;i--){const b=live[i],age=t-b.shown,ms=LINE_MS[b.t||0]||LINE_MS[0],slide=(1-ease(age/340))*620,a=Math.min(1,age/180)*(1-seg(age,ms-500,ms)),hh=LINE_H[b.t||0]||46;
  y+=hh/2;let gx=x0+slide;if(b.t===6&&age<400&&scene.motion!==false)gx+=(rnd(Math.floor(t/45))-.5)*14*(1-age/400);
  drawWinLine(scene,h,c,b,gx,y,w,a,t);y+=hh/2+12;}
}
