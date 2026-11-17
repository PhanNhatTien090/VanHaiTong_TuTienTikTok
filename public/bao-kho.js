// 18/11/2026 (chủ game): THIÊN CÔNG BẢO KHỐ trên overlay — kế hoạch PHAP-BAO-PLAN-2026-11-17.md mục 4 + 10.
// • Màn sự kiện (thay sân, nhẹ máy): tiêu đề + đồng hồ, bảng CƠ DUYÊN (ảnh quà → ngọn lửa, KHÔNG số %), lưới GIỚI HẠN 12 món,
//   trận pháp giữa màn với 3 thần khí bay, người vừa cầu đứng giữa trận, băng rôn từng lượt (≤3), "còn N lượt tới 4★/5★",
//   SĂN BẢO NHIỀU NHẤT cột phải. Không góc dưới trái, cách đáy ≥11%.
// • 4★: thẻ tím 2,5 s giữa màn (sân vẫn thấy). 5★: CHIẾU RIÊNG vàng 4,5 s (tín hiệu → tụ → nổ → vinh danh).
//   GIỚI HẠN: CHIẾU RIÊNG 8 s — điềm báo rung giật → chiếu chiếu (sao băng, sét, trận 3 tầng) → BÓNG ĐEN → BÙNG BÙNG BÙNG → hiện thân → truyền thế.
// • Server xếp lịch màn (phap-bao.mjs queueReveal). Biến thể theo mã lượt (màu sao băng, hướng máy, thứ tự sét, vị trí bóng).
// • Không shadowBlur/filter mỗi khung; bóng đen = ảnh món tô đen 1 lần (cache).
import {txt,drawCaster,drawCutInBand,cutVeil,giftImg,CUT_PHASE} from './skill-cutscene.js?v=20261118';
import {clamp,seg,out3,smooth,dot,fxCamera,punch,drawBurst,drawEmbers,drawVignette,drawLetterbox,drawImpactFrame,drawGhostSplit,hitStop,drawSkyBeams,drawCircle,drawZoomLines} from './cut-fx.js?v=20261118';
import {giftFor} from './gift-icons.js';
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
// Mốc nổ của màn GIỚI HẠN (giây) — test dùng.
export const LIMITED_BOOMS=Object.freeze([3.6,3.93,4.26]);

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
 if(h.banners.length>3)h.banners.splice(0,h.banners.length-3);
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
 if(!full)return false;
 try{if(cut.x.t>=6)drawLimitedReveal(scene,c,t,H,cut,e);else drawGoldReveal(scene,c,t,H,cut);}catch(err){console.warn('[bao-cut]',err);return false;}
 const sec=cut.age/1000,seen=scene.baoCutSeen??=new Set(),cue=(key,at,level)=>{const id=cut.x.k+':'+key;if(sec>=at&&sec<at+.6&&!seen.has(id)){seen.add(id);scene.onFeedbackSound?.('hit',level);}};
 if(cut.x.t>=6){cue('t1',.9,1);cue('t2',1.3,1);cue('t3',1.7,2);cue('hb1',2.5,1);cue('hb2',3.1,1);LIMITED_BOOMS.forEach((b,i)=>cue('b'+i,b,3));}
 else cue('hit',1.8,3);
 if(seen.size>90)scene.baoCutSeen=new Set([...seen].slice(-30));
 return true;
}

// ───────────── MÀN SỰ KIỆN ─────────────
function background(h,H){
 if(h.bg&&h.bgH===H)return h.bg;const cv=canvas2(900,Math.ceil(H));if(!cv)return null;const c=cv.getContext('2d');
 const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#07031a');g.addColorStop(.45,'#140726');g.addColorStop(1,'#04020a');c.fillStyle=g;c.fillRect(0,0,900,H);
 const r=c.createRadialGradient(450,H*.4,20,450,H*.4,H*.5);r.addColorStop(0,'#ffcf6e55');r.addColorStop(.35,'#b45cff22');r.addColorStop(1,'#00000000');c.fillStyle=r;c.fillRect(0,0,900,H);
 for(let i=0;i<140;i++){c.globalAlpha=.25+rnd(i)*.6;c.fillStyle=i%7?'#ffffff':'#ffd36b';const s=rnd(i+9)*2+.5;c.fillRect(rnd(i+1)*900,rnd(i+2)*H*.8,s,s);}
 // dãy núi mờ + cổng bảo khố
 c.globalAlpha=1;c.fillStyle='#0b0518';c.beginPath();c.moveTo(0,H*.66);for(let x=0;x<=900;x+=60)c.lineTo(x,H*.6-rnd(x)*H*.07);c.lineTo(900,H);c.lineTo(0,H);c.fill();
 c.strokeStyle='#ffd36b44';c.lineWidth=3;c.strokeRect(300,H*.17,300,H*.43);c.beginPath();c.moveTo(270,H*.17);c.lineTo(450,H*.13);c.lineTo(630,H*.17);c.stroke();
 h.bg=cv;h.bgH=H;return cv;
}
function flameSprite(h){
 if(h.flame)return h.flame;const cv=canvas2(28,38);if(!cv)return null;const c=cv.getContext('2d');
 const g=c.createLinearGradient(0,38,0,0);g.addColorStop(0,'#ff4a1c');g.addColorStop(.55,'#ffb52e');g.addColorStop(1,'#fff6c0');c.fillStyle=g;
 c.beginPath();c.moveTo(14,1);c.bezierCurveTo(24,14,27,22,24,29);c.bezierCurveTo(21,37,7,37,4,29);c.bezierCurveTo(1,22,6,15,14,1);c.fill();
 c.fillStyle='#fffbe0';c.beginPath();c.ellipse(14,28,5,7,0,0,TAU);c.fill();h.flame=cv;return cv;
}
function panel(c,x,y,w,hh,col='#ffd36b'){c.save();c.globalAlpha=.72;c.fillStyle='#090414';c.beginPath();c.roundRect?.(x,y,w,hh,14);if(!c.roundRect)c.rect(x,y,w,hh);c.fill();c.globalAlpha=.8;c.strokeStyle=col;c.lineWidth=2;c.stroke();c.restore();}
function ring(c,x,y,R,lw,a,col){if(a<=.01||R<=0)return;c.globalAlpha=Math.min(1,a);c.strokeStyle=col;c.lineWidth=lw;c.beginPath();c.arc(x,y,R,0,TAU);c.stroke();}
function rays(c,x,y,n,len,a,rot,col,w=10){if(a<=.01)return;c.save();c.globalCompositeOperation='lighter';c.translate(x,y);c.rotate(rot);for(let i=0;i<n;i++){c.rotate(TAU/n);const L=len*(.7+.3*rnd(i));const g=c.createLinearGradient(0,0,L,0);g.addColorStop(0,'#ffffff');g.addColorStop(.3,col);g.addColorStop(1,col+'00');c.globalAlpha=a;c.fillStyle=g;c.beginPath();c.moveTo(0,-w/2);c.lineTo(L,0);c.lineTo(0,w/2);c.fill();}c.restore();c.globalAlpha=1;}
/** Trận pháp đứng (nhìn thẳng). tier: số tầng hiện (0..3). */
function formation(c,x,y,R,t,a,col,spin=1,tiers=3){
 if(a<=.01)return;c.save();c.globalCompositeOperation='lighter';c.translate(x,y);
 for(let k=0;k<tiers;k++){const r=R*(1-k*.28),rot=t*.0004*spin*(k%2?-1.6:1)*(1+k*.4);c.save();c.rotate(rot);
  ring(c,0,0,r,3,a*.9,col);ring(c,0,0,r-14,1.5,a*.6,'#ffffff');
  for(let i=0;i<24;i++){const q=i/24*TAU;c.globalAlpha=a*.8;c.strokeStyle=col;c.lineWidth=i%3?2:4;c.beginPath();c.moveTo(Math.cos(q)*(r-14),Math.sin(q)*(r-14));c.lineTo(Math.cos(q)*(r-(i%3?24:34)),Math.sin(q)*(r-(i%3?24:34)));c.stroke();}
  const n=6+k*2;c.globalAlpha=a*.7;c.lineWidth=2;c.strokeStyle=k%2?'#ffffff':col;c.beginPath();for(let i=0;i<=n;i++){const q=i*2*TAU/n*(n%2?1:.5)+(i%2)*Math.PI/n;const px=Math.cos(i/n*TAU)*(r-40),py=Math.sin(i/n*TAU)*(r-40);if(i)c.lineTo(px,py);else c.moveTo(px,py);void q;}c.stroke();
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
function fmtClock(ms){const s=Math.max(0,Math.ceil(ms/1000));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');}

/** Vẽ màn sự kiện thay sân. Trả số nhân vật đã vẽ. */
export function drawBaoKho(scene,c,t,H){
 const e=scene.baoKhoStatus;if(!e)return 0;const h=bz(scene),now=nowAt(scene,t),light=scene.budget?.level==='light';
 c.save();
 // điềm báo GIỚI HẠN trong lúc màn che kéo vào: cả sân rung giật + viền đỏ chớp
 const pre=findReveal(e,now);if(pre&&pre.x.t>=6&&pre.k<CUT_PHASE.wipeIn&&scene.motion!==false){const u=pre.age/1000;c.translate(Math.sin(u*90)*16*(1-u),Math.cos(u*70)*10*(1-u));}
 const bg=background(h,H);if(bg)c.drawImage(bg,0,0,900,H);else{c.fillStyle='#07031a';c.fillRect(0,0,900,H);}
 const cx=450,cy=H*.4,open=e.phase==='open';
 dot(c,'#ffd36b',cx,cy,260,.18+.06*Math.sin(t*.002));
 formation(c,cx,cy,190,t,.75,'#ffd36b',1,3);
 // 3 thần khí GIỚI HẠN bay quanh trận, đổi bộ mỗi 8 s
 const lim=BAO_ITEMS.filter(x=>x.tier===6),set=Math.floor(t/8000);
 for(let i=0;i<3;i++){const it=lim[(set*3+i)%lim.length],q=t*.0005+i*TAU/3,fx=cx+Math.cos(q)*150,fy=cy+Math.sin(q)*70-20,fade=Math.min(1,Math.min((t%8000)/600,(8000-t%8000)/600));
  dot(c,'#ff8fd0',fx,fy,60,.3*fade);drawItem(h,c,it.id,fx,fy+Math.sin(t*.003+i)*8,92,fade);}
 // hạt bảo quang bốc lên
 c.save();c.globalCompositeOperation='lighter';for(let i=0;i<(light?10:20);i++){const u=((t*.00012*(1+rnd(i)))+rnd(i+3))%1;dot(c,i%3?'#ffd36b':'#c79bff',cx+(rnd(i+5)-.5)*360,cy+170-u*380,6+rnd(i)*6,(1-u)*.7);}c.restore();
 const who=h.last&&scene.playerIndex?.get(h.last.u);let n=0;
 if(who){drawCaster(scene,c,who,cx,H*.585,2.3,t,false);n=1;}
 header(c,e,now,H);
 flames(h,c,H);
 limited(h,c,e,H,t);
 banners(h,c,t,H);
 pity(h,c,H);
 hunters(c,e,H);
 if(!open)summary(c,e,H,t);
 card(scene,h,c,t,H);
 if(pre&&pre.x.t>=6&&pre.k<CUT_PHASE.wipeIn){const a=.5+.5*Math.sin(pre.age*.05);c.globalAlpha=a;c.strokeStyle='#ff2a3a';c.lineWidth=26;c.strokeRect(0,0,900,H);c.globalAlpha=1;txt(c,'… thiên địa dị tượng …',450,H*.5,34,'#ffb0b0',{width:7});}
 c.restore();c.globalAlpha=1;return n;
}
function header(c,e,now,H){
 const g=c.createLinearGradient(0,H*.05,0,H*.09);g.addColorStop(0,'#fffbe6');g.addColorStop(.5,'#ffd34d');g.addColorStop(1,'#ff9b3d');
 txt(c,'THIÊN CÔNG BẢO KHỐ',450,H*.065,58,g,{width:12,max:860});
 const open=e.phase==='open';
 txt(c,open?'còn '+fmtClock(e.endsAt-now)+' · '+(e.pulls||0)+' lượt cầu':'BẢO KHỐ KHÉP LẠI · '+(e.pulls||0)+' lượt cầu',450,H*.065+48,26,'#ffffff',{width:6,weight:'800'});
 if(open){const y=H*.065+92,parts=[['gõ ',26,'#e8dcff','800'],['cầu',40,'#ffd36b','900'],[' để cầu pháp bảo',26,'#e8dcff','800']],w=parts.map(([s,z,,wt])=>{c.font=wt+' '+z+'px "Segoe UI",Arial,sans-serif';return c.measureText?.(s)?.width||z*s.length*.5;});let x=450-w.reduce((a,b)=>a+b,0)/2;
  parts.forEach(([s,z,col,wt],i)=>{txt(c,s,x,y,z,col,{width:z>30?8:6,weight:wt,align:'left'});x+=w[i];});}
}
function flames(h,c,H){
 const x=14,y=H*.17,w=228,rowH=58;panel(c,x,y,w,40+rowH*BAO_FLAMES.filter(r=>!r.each).length);
 txt(c,'CƠ DUYÊN',x+w/2,y+22,26,'#ffd36b',{width:6});const fl=flameSprite(h);
 BAO_FLAMES.filter(r=>!r.each).forEach((r,i)=>{ /* mốc 999 cùng 5 lửa với 199 → không vẽ thêm dòng */const yy=y+48+rowH*i+rowH/2-6;
  if(r.free)txt(c,'cầu',x+44,yy,30,'#ffffff',{width:6});
  else{const g=giftFor(h.giftArt,r.min),im=g.url?giftImg(g.url):null;if(im)c.drawImage(im,x+16,yy-24,48,48);else txt(c,'quà',x+44,yy,22,'#ffffff',{width:5});}
  if(fl)for(let k=0;k<r.flames;k++){c.globalAlpha=1;c.drawImage(fl,x+82+k*29,yy-19,26,36);}
 });c.globalAlpha=1;
}
function limited(h,c,e,H,t){
 const list=e.limited||[],left=list.filter(x=>!x.owner).length,x=658,y=H*.17,w=228,cw=74,chh=92;
 panel(c,x,y,w,46+chh*4,'#ff8fd0');
 txt(c,'GIỚI HẠN · còn '+left+'/'+(list.length||BAO_LIMITED_STOCK),x+w/2,y+22,22,'#ffb5df',{width:6,max:w-12});
 list.slice(0,12).forEach((it,i)=>{const col=i%3,row=Math.floor(i/3),px=x+4+col*cw+cw/2,py=y+46+row*chh+34;
  if(it.owner){dot(c,'#ff8fd0',px,py,40,.35+.15*Math.sin(t*.004+i));}
  drawItem(h,c,it.id,px,py,62,it.owner?1:.5);
  if(it.owner)txt(c,short(it.owner,8),px,py+44,15,'#ffe28a',{width:4,weight:'800',max:cw-2}); /* món chưa có chủ: ảnh mờ, không ghi chữ (tiêu đề đã có "còn X/12") */
 });
}
function bannerText(r){if(!r.t)return {s:short(r.name)+' · TRƯỢT',col:'#cfc6e6'};const it=baoItem(r.id),T=BAO_TIER[r.t];return {s:short(r.name)+' · '+T.name+' '+(it?.name||'')+(r.s>1?' ★'+r.s:''),col:T.color};}
function banners(h,c,t,H){
 const live=h.banners.filter(b=>t-b.t0<BANNER_MS);live.slice(-3).forEach((b,i,arr)=>{const age=t-b.t0,slide=(1-ease(age/300))*500,a=1-seg(age,BANNER_MS-500,BANNER_MS),y=H*.625+(arr.length-1-i)*-48,{s,col}=bannerText(b);
  c.save();c.globalAlpha=a*.75;c.fillStyle=b.t?'#1b0a2c':'#0b0814';c.fillRect(170+slide,y-21,560,42);c.globalAlpha=a;c.fillStyle=col;c.fillRect(170+slide,y-21,6,42);txt(c,s,450+slide,y,b.t?26:22,col,{width:6,max:540,weight:b.t?'900':'800'});c.restore();});
}
function pity(h,c,H){const r=h.last;if(!r)return;txt(c,short(r.name)+' · còn '+Math.max(0,r.p4)+' lượt tới 4★ · '+Math.max(0,r.p5)+' lượt tới 5★',450,H*.69,22,'#e8dcff',{width:6,weight:'800',max:860});}
function hunters(c,e,H){
 const top=(e.top||[]).slice(0,5);if(!top.length)return;const x=470,y=H*.72,w=416,rowH=34;panel(c,x,y,w,46+rowH*top.length);
 txt(c,'SĂN BẢO NHIỀU NHẤT',x+w/2,y+22,22,'#ffd36b',{width:6});
 top.forEach((p,i)=>{const yy=y+56+i*rowH;txt(c,(i+1)+'. '+short(p.name,13),x+16,yy,20,i?'#ffffff':'#ffe28a',{width:5,align:'left',weight:'800',max:240});txt(c,p.items+' món · '+p.pulls+' lượt',x+w-14,yy,18,'#d9cff0',{width:5,align:'right',weight:'800'});});
}
function summary(c,e,H,t){
 const x=252,y=H*.24,w=396,hh=H*.3; /* nằm giữa 2 bảng bên, không đè */c.save();c.globalAlpha=.86;c.fillStyle='#08030f';c.fillRect(x,y,w,hh);c.globalAlpha=1;c.strokeStyle='#ffd36b';c.lineWidth=3;c.strokeRect(x,y,w,hh);c.restore();
 txt(c,'BẢO KHỐ KHÉP LẠI',450,y+44,38,'#ffd36b',{width:9,max:w-20});
 (e.top||[]).slice(0,3).forEach((p,i)=>{txt(c,(i+1)+'. '+short(p.name,14),450,y+104+i*76,28,i?'#ffffff':'#ffe28a',{width:6,weight:'800',max:w-24});txt(c,p.items+' món · '+p.pulls+' lượt',450,y+136+i*76,20,'#d9cff0',{width:5,weight:'800',max:w-24});});
 const owners=(e.limited||[]).filter(x=>x.owner);if(owners.length){txt(c,'CHỦ NHÂN GIỚI HẠN',450,y+hh-62,20,'#ffb5df',{width:5,weight:'900'});txt(c,owners.slice(-3).map(x=>short(x.owner,9)).join(' · '),450,y+hh-30,22,'#ffffff',{width:5,weight:'800',max:w-20});}
}
// 4★: thẻ tím 2,5 s giữa màn (xếp 2 thẻ).
function card(scene,h,c,t,H){
 const cd=h.cards[0];if(!cd)return;if(!cd.t0)cd.t0=t;const age=t-cd.t0;if(age>=CARD_MS){h.cards.shift();return;}
 const sec=age/1000,it=baoItem(cd.id);if(!it)return;const cx=450,cy=H*.42,P=P4,fly=seg(sec,2.1,2.5),out=ease(fly);
 const X=cx+(770-cx)*out,Y=cy+(H*.3-cy)*out,S=1-.75*out;
 c.save();
 if(sec<.25&&!scene.reduceFlash){c.globalAlpha=(1-sec/.25)*.55;c.fillStyle=P.main;c.fillRect(0,0,900,H);c.globalAlpha=1;}
 c.globalAlpha=.6*(1-fly);c.fillStyle='#000';c.fillRect(0,cy-210,900,420);c.globalAlpha=1;
 formation(c,X,Y+20,150*S,t,.9*(1-fly),P.main,-1,2);
 rays(c,X,Y,12,260*S*smooth(seg(sec,.15,.5)),(1-fly)*.8,t*.0008,P.main,12);
 dot(c,P.main,X,Y,140*S,.6*(1-fly));
 drawItem(h,c,it.id,X,Y,190*S*(.6+.4*ease(sec/.4)),1,sec<.6?(1-ease(sec/.6))*TAU:0);
 if(fly<1){const a=seg(sec,.35,.6)*(1-fly);c.globalAlpha=a;
  txt(c,'THẦN KHÍ TRUNG CẤP',cx,cy-175,28,P.soft,{width:7});
  txt(c,it.name+(cd.s>1?' ★'+cd.s:''),cx,cy+130,46,'#e6c8ff',{width:9,max:840});
  txt(c,short(cd.name,14)+' nhận',cx,cy+178,30,'#ffffff',{width:7,weight:'800'});
  txt(c,Object.keys(it.stats).slice(0,2).map(k=>BAO_STAT_NAME[k]+' +'+baoStat(it.id,cd.s,k)+'%').join(' · '),cx,cy-135,22,'#ffffff',{width:5,weight:'800'});
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
  c.globalAlpha=seg(u,.1,.35);txt(c,it.name+(x.s>1?' ★'+x.s:''),450,H*.215,70,tg,{width:13,max:880});
  txt(c,short(x.name,22)+' nhận thần khí',450,H*.66,40,'#ffffff',{width:9,max:860});
  txt(c,statsLine(it,x.s),450,H*.71,26,'#ffe9a8',{width:6,weight:'800',max:860});c.globalAlpha=1;}
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

export function drawLimitedReveal(scene,c,t,H,cut,e){
 const x=cut.x,it=baoItem(x.id);if(!it)return;const h=bz(scene),sec=cut.age/1000,light=scene.budget?.level==='light',motion=scene.motion!==false,rf=scene.reduceFlash;
 const V=hash(x.k+':'+x.id),col=METEOR[V%METEOR.length],P={...P6,main:col===P6.main?P6.main:col,soft:P6.soft,gold:P6.gold,deep:P6.deep},dir=V&2?1:-1;
 const ix=450+((V>>>4)%3-1)*30,iy=H*.43;
 // bùng gần nhất
 let bi=-1;for(let i=0;i<LIMITED_BOOMS.length;i++)if(sec>=LIMITED_BOOMS[i])bi=i;const bSec=bi>=0?sec-LIMITED_BOOMS[bi]:-1,HS=hitStop(bSec,t,.08);t=HS.t;const boom=HS.sec;
 const heart=Math.max(punch(sec-2.5,.06),punch(sec-3.1,.07));
 const zoom=motion?1+.05*smooth(seg(sec,.8,2.2))+.08*smooth(seg(sec,2.2,3.6))+heart+(bi>=0?punch(bSec,.06+bi*.04):0)-.1*smooth(seg(sec,6.8,8)):1;
 const shake=!motion||HS.frozen?0:sec<.9?14*(1-sec/.9):bi>=0&&bSec<.33?(1-bSec/.33)*(14+bi*8):sec>2.2&&sec<3.6?3:0;
 fxCamera(c,ix,iy,zoom,shake,t);
 const tilt=motion?((V>>>6)%3-1)*.03*smooth(seg(sec,.8,3.6))*(1-seg(sec,4.6,5.2)):0;if(tilt){c.translate(ix,iy);c.rotate(tilt);c.translate(-ix,-iy);}
 const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0a0006');g.addColorStop(.5,sec<4.26?'#020003':P.deep);g.addColorStop(1,'#0a0006');c.fillStyle=g;c.fillRect(-200,-200,1300,H+400);
 // 1. ĐIỀM BÁO (đầu màn): viền đỏ chớp
 if(sec<.9){const a=(.5+.5*Math.sin(sec*40))*(1-sec/.9);c.globalAlpha=a;c.strokeStyle='#ff2a3a';c.lineWidth=30;c.strokeRect(-10,-10,920,H+20);c.globalAlpha=1;txt(c,'… thiên địa dị tượng …',450,H*.5,34,'#ffb0b0',{width:7});}
 // 2. CHIẾU CHIẾU: sao băng + sét + trận 3 tầng
 if(sec>=.8&&sec<4.6){const n=light?5:7;for(let i=0;i<n;i++){const s0=.8+i*.18+rnd(V+i)*.1,u=(sec-s0)/.45,fromTop=(i+V)%2,xA=rnd(V+i*3)*900;
   if(fromTop)meteor(c,xA,-60,xA+(rnd(V+i+7)-.5)*400,H*.9,u,i%2?col:'#ffd36b',9);else meteor(c,dir>0?-80:980,H*(.1+rnd(V+i+5)*.6),dir>0?980:-80,H*(.1+rnd(V+i+6)*.6),u,i%2?col:'#ffffff',8);}
  for(let i=0;i<3;i++){const s0=1.0+((i+V)%3)*.45,a=sec>=s0&&sec<s0+.25?1-(sec-s0)/.25:0;lightning(c,-40,H*(.15+i*.12),940,H*(.2+i*.1),a,col,V+i*31);}}
 const tiers=sec<.9?0:sec<1.3?1:sec<1.7?2:3,fa=smooth(seg(sec,.85,1.2))*(1-seg(sec,4.3,4.8));
 if(tiers){formation(c,ix,iy,330,t,fa,col,dir,tiers);drawCircle(c,ix,H*.66,360,fa,t,P,dir);}
 drawSkyBeams(c,ix,H*.66,smooth(seg(sec,1.7,2.4))*(1-seg(sec,4.3,5))*.8,t,P);
 // 3. BÓNG ĐEN: hình món tô đen, viền sáng, khói đen cuộn
 const shadowA=smooth(seg(sec,2.2,2.7))*(sec<4.26?1:0);
 if(shadowA>0){const S=280+170*smooth(seg(sec,2.2,3.6))+heart*600,edge=silhouette(h,it.id,col),blk=silhouette(h,it.id,'#030006');
  c.save();for(let i=0;i<(light?16:34);i++){const q=t*.0011*(i%2?1:-1)+rnd(V+i)*TAU,r=S*.45+rnd(i+3)*120;c.globalAlpha=shadowA*.5;dot(c,'#000000',ix+Math.cos(q)*r,iy+Math.sin(q)*r*.7,50+rnd(i)*40,shadowA*.55);}c.restore();
  if(edge){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=shadowA*(.7+.3*Math.sin(t*.01));c.drawImage(edge,ix-S*.54,iy-S*.54,S*1.08,S*1.08);c.restore();}
  if(blk){c.globalAlpha=shadowA;c.drawImage(blk,ix-S/2,iy-S/2,S,S);c.globalAlpha=1;}else dot(c,'#000000',ix,iy,S*.45,shadowA);
  // vết nứt sáng sau mỗi cú bùng
  if(bi>=0){c.save();c.globalCompositeOperation='lighter';c.strokeStyle='#ffffff';c.lineWidth=3;for(let j=0;j<=bi;j++)for(let i=0;i<4;i++){const q=rnd(V+j*9+i)*TAU,L=S*(.25+rnd(V+i+j)*.25);c.globalAlpha=.9;c.beginPath();c.moveTo(ix,iy);c.lineTo(ix+Math.cos(q)*L*.5+(rnd(i+j)-.5)*20,iy+Math.sin(q)*L*.5);c.lineTo(ix+Math.cos(q)*L,iy+Math.sin(q)*L);c.stroke();}c.restore();c.globalAlpha=1;}}
 // 4. BÙNG – BÙNG – BÙNG
 if(bi>=0&&!HS.frozen){const sc=.8+bi*.35;drawBurst(c,ix,iy,boom,P,H,{light,pillar:bi===2,scale:sc,ground:H*.66,seed:V%7+bi,reduceFlash:rf});
  c.save();c.globalCompositeOperation='lighter';ring(c,ix,iy,out3(boom/.5)*(380+bi*180),12,1-seg(boom,0,.5),bi===2?'#ffffff':col);c.restore();
  if(bi===2){shards(c,ix,iy,seg(boom,0,1.1),col,V%50);rays(c,ix,iy,22,700*out3(boom/.5),Math.exp(-boom),boom*.3,col,18);}}
 // 5. HIỆN THÂN
 const showU=ease(seg(sec,4.26,4.8)),fly=ease(seg(sec,6.8,7.7));
 if(sec>=4.26){const X=ix+(770-ix)*fly,Y=iy+(H*.3-iy)*fly,S=(330+20*Math.sin(t*.002))*(1-.75*fly);
  dot(c,col,X,Y,300*(1-fly*.7),.5*showU);dot(c,'#ffd36b',X,Y,150*(1-fly*.7),.4*showU);rays(c,X,Y,16,380*(1-fly),.4*showU,t*.0004,P.soft,10);
  signatureFx(h,c,it,X,Y,showU*(1-seg(sec,6.6,7)),t,col,light);
  drawItem(h,c,it.id,X,Y+Math.sin(t*.003)*10,S*(.7+.3*showU),showU,Math.sin(t*.001)*.45);}
 drawEmbers(c,H,seg(sec,4.3,4.8)*(1-seg(sec,7,7.8)),t,P,light);
 c.restore();c.globalAlpha=1;
 drawVignette(c,H,sec<4.26?.55:.3,ix,iy);
 if(HS.frozen&&!rf)drawImpactFrame(c,H,ix,iy,bSec/.08,P,(V+bi)%13);
 if(!HS.frozen&&bi>=0&&bSec<.3&&motion)drawGhostSplit(c,1-clamp(bSec/.3),12+bi*6);
 drawCutInBand(scene,c,scene.playerIndex?.get(x.u),H,seg(sec,2.6,3.45),P,dir,t,{label:short(x.name,22)});
 drawLetterbox(c,H,seg(sec,.8,1.2)*(1-seg(sec,6.6,7.4)));
 // CHỮ
 if(sec>=1.2&&sec<4.26){c.globalAlpha=seg(sec,1.2,1.6)*(1-seg(sec,4,4.26));txt(c,'THẦN KHÍ GIỚI HẠN HIỆN THẾ',450,H*.15,40,'#ffb5df',{width:9,max:860});c.globalAlpha=1;}
 if(sec>=4.6&&sec<7.6){const u=sec-4.6,a=seg(u,0,.25)*(1-seg(sec,7.1,7.6)),pop=1+.5*(1-ease(seg(u,0,.25)));c.globalAlpha=a;
  c.save();c.translate(450,H*.12);c.scale(pop,pop);txt(c,'✦ THẦN KHÍ GIỚI HẠN ✦',0,0,44,'#ffd0ec',{width:10,max:860});c.restore();
  const tg=c.createLinearGradient(0,H*.19-50,0,H*.19+50);tg.addColorStop(0,'#fff6fb');tg.addColorStop(.45,'#ff8fd0');tg.addColorStop(1,'#ffd36b');
  txt(c,it.name,450,H*.195,78,tg,{width:15,max:880});
  txt(c,short(x.name,22)+' — CHỦ NHÂN DUY NHẤT',450,H*.68,40,'#ffffff',{width:9,max:870});
  const left=(e?.limited||[]).filter(q=>!q.owner).length;txt(c,statsLine(it,x.s)+' · còn '+left+'/'+((e?.limited||[]).length||BAO_LIMITED_STOCK),450,H*.73,24,'#ffe9a8',{width:6,weight:'800',max:860});c.globalAlpha=1;}
 const o=seg(sec,7.55,8);if(o>0){c.globalAlpha=o;c.fillStyle='#000';c.fillRect(-60,-60,1020,H+120);c.globalAlpha=1;}
}
