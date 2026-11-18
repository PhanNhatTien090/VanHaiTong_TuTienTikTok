// 17/11/2026 (chủ game): CÁNH BẬC CAO 8.000 / 9.000 / 10.000 / 12.000 (mốc hạ 18/11) — ghép từ BỘ PHẬN RỜI, định kỳ BIẾN HÌNH:
//  swords  Vạn Kiếm Dực      — 14 phi kiếm bung ra, sáng lên, bay tứ tung quanh người rồi bay về xếp lại thành cánh.
//  demon   U Minh Quỷ Dực    — cánh hóa khói, tụ thành MẶT QUỶ bay vọt khỏi thân, gầm phun lửa, bay về hóa lại cánh.
//  lotus   Thanh Liên Dực    — cánh hoa tách ra xoáy lên đầu, nở thành ĐÓA SEN KHỔNG LỒ, rồi rơi về thành cánh.
//  heaven  Thiên Đạo Thần Hoàn — pháp luân bay lên đỉnh đầu quay lớn, kiếm quang thành KIẾM TRẬN xoay quanh người, rồi về chỗ.
// CHỐNG LAG (chủ game: "có thể hiện lúc đông người, làm cẩn thận"):
//  • Đứng yên = 1 ảnh/người: cánh ghép sẵn MỘT LẦN thành bitmap đúng cỡ hiển thị (cache theo bậc + cỡ).
//  • Mọi bộ phận thu nhỏ sẵn đúng cỡ (không dán ảnh to rồi thu nhỏ mỗi khung — vụ lag GPU 08/11).
//  • Biến hình: hàng chờ toàn sân — tối đa 2 người cùng lúc (sân ≥10 người: 1), mỗi người ≥45 s/lần;
//    sân ≥21 người (heavyCrowd), đồ họa nhẹ, tắt chuyển động, đang chiếu riêng/đột phá → chỉ ảnh tĩnh.
//  • Không shadowBlur/filter/gradient mỗi khung; quầng sáng = sprite vẽ sẵn + 'lighter'; hạt ≤ 20.
import {makeSurface} from './performance.js';
const TAU=Math.PI*2,clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),seg=(k,a,b)=>clamp((k-a)/(b-a)),smooth=k=>{k=clamp(k);return k*k*(3-2*k);},out3=k=>1-(1-clamp(k))**3;
const hash=s=>{let h=0;for(const ch of String(s))h=(Math.imul(h,31)+ch.charCodeAt(0))>>>0;return h;};
const rnd=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};
export const WING_BURST_MS=3600,WING_BURST_GAP=45000;
const BASE='/assets/wings-v2/';
export const WING_FX=Object.freeze({
 swords:{parts:['sword'],aspect:.667},
 demon:{parts:['wing-demon','demon-face'],aspect:.667},
 lotus:{parts:['lotus-wing','lotus-petal','lotus-big'],aspect:.667},
 heaven:{parts:['light-wing','light-blade','dharma-wheel'],aspect:.667},
});
// ---------- ảnh ----------
const IMG=new Map();
function img(name){if(typeof Image==='undefined')return null;let e=IMG.get(name);if(!e){const im=new Image();im.decoding='async';e={im,ok:false};im.onload=()=>{e.ok=true;};im.onerror=()=>{e.bad=true;};im.src=BASE+name+'.webp';IMG.set(name,e);}return e.ok?e.im:null;}
// Bản thu nhỏ sẵn: chiều rộng hiển thị ~px (logic 900) ×2 cho nét; gom cỡ theo nấc 8 px để cache ít.
const SIZED=new Map();
function sized(name,wPx){const im=img(name);if(!im)return null;const b=Math.max(8,Math.round(wPx/8)*8),key=name+'|'+b;let s=SIZED.get(key);if(s)return s;
 const W=b*2,H=Math.max(2,Math.round(W*im.naturalHeight/im.naturalWidth)),cv=makeSurface(W,H);if(!cv)return null;const x=cv.getContext('2d');x.imageSmoothingQuality='high';x.drawImage(im,0,0,W,H);
 s={cv,w:b,h:H/2};SIZED.set(key,s);if(SIZED.size>80)SIZED.delete(SIZED.keys().next().value);return s;}
const GLOW=new Map();
function glow(col){let g=GLOW.get(col);if(g!==undefined)return g;g=makeSurface(64,64);if(g){const x=g.getContext('2d'),r=x.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'#ffffff');r.addColorStop(.25,col);r.addColorStop(.6,col+'44');r.addColorStop(1,col+'00');x.fillStyle=r;x.fillRect(0,0,64,64);}GLOW.set(col,g);return g;}
function dot(c,col,x,y,r,a){const g=glow(col);if(!g||a<=.01)return;c.globalAlpha=Math.min(1,a);c.drawImage(g,x-r,y-r,r*2,r*2);}
function part(c,s,x,y,w,rot=0,a=1,ax=.5,ay=.5){if(!s||a<=.01)return;const h=w*s.h/s.w;c.globalAlpha=a;if(rot){c.save();c.translate(x,y);c.rotate(rot);c.drawImage(s.cv,-w*ax,-h*ay,w,h);c.restore();}else c.drawImage(s.cv,x-w*ax,y-h*ay,w,h);}

// ---------- bố cục tĩnh (toạ độ so với điểm neo cánh, đơn vị px logic; w = bề ngang cánh) ----------
function swordSlots(w){const out=[];for(const sd of [-1,1])for(let i=0;i<7;i++){const L=w*.5*(1-.06*Math.abs(i-2));out.push({sd,i,x:sd*w*.07,y:w*.02,rot:sd*(.38+i*.27),L});}return out;}
function petalSlots(w){const out=[];for(const sd of [-1,1])for(let i=0;i<5;i++)out.push({sd,i,x:sd*w*.08,y:w*.04,rot:sd*(.55+i*.38),L:w*.36});return out;}
function bladeSlots(w){const out=[];for(const sd of [-1,1])for(let i=0;i<3;i++)out.push({sd,i,x:sd*w*(.13+i*.075),y:w*.05+i*w*.02,rot:sd*(.06+i*.1),L:w*(.62-i*.1)});return out;}
// vẽ 1 bộ phận dựng đứng (mũi lên) gốc tại (x,y), xoay rot
function stem(c,s,x,y,L,rot,a){if(!s)return;const wd=L*s.w/s.h;c.globalAlpha=a;c.save();c.translate(x,y);c.rotate(rot);c.drawImage(s.cv,-wd/2,-L,wd,L);c.restore();}
const STATIC=new Map();
const partsReady=fx=>WING_FX[fx].parts.every(n=>img(n));
function staticWing(fx,w){const b=Math.round(w/8)*8,key=fx+'|'+b;let s=STATIC.get(key);if(s)return s;
 for(const n of WING_FX[fx].parts)img(n); // tải sẵn mọi bộ phận ngay khi cánh xuất hiện (lần biến hình đầu đã có ảnh)
 const W=b,H=Math.round(b*WING_FX[fx].aspect),pivotY=H*.55,cv=makeSurface(W*2,H*2);if(!cv)return null;const x=cv.getContext('2d');x.scale(2,2);x.translate(W/2,pivotY);
 let ok=true;
 if(fx==='swords'){const sw=sized('sword',b*.25);if(!sw)ok=false;else for(const p of swordSlots(b))stem(x,sw,p.x,p.y,p.L,p.rot,1);}
 else if(fx==='demon'){const im=sized('wing-demon',b);if(!im)ok=false;else part(x,im,0,0,b,0,1,.5,.55);}
 else if(fx==='lotus'){const im=sized('lotus-wing',b);if(!im)ok=false;else part(x,im,0,0,b,0,1,.5,.55);}
 else if(fx==='heaven'){const lw=sized('light-wing',b),bl=sized('light-blade',b*.22),wh=sized('dharma-wheel',b*.34);if(!lw||!bl||!wh)ok=false;else{part(x,lw,0,0,b,0,.7,.5,.55);for(const p of bladeSlots(b))stem(x,bl,p.x,p.y,p.L,p.rot,1);part(x,wh,0,-b*.12,b*.3,0,1);}}
 x.globalAlpha=1;if(!ok)return null;
 s={cv,w:W,h:H,pivotY};STATIC.set(key,s);if(STATIC.size>40)STATIC.delete(STATIC.keys().next().value);return s;}

// ---------- hàng chờ biến hình toàn sân ----------
function burstOf(scene,id,t){
 const st=scene.wingBurst??={active:[],next:new Map()};st.active=st.active.filter(b=>t-b.start<WING_BURST_MS&&t>=b.start-50);
 const cur=st.active.find(b=>b.id===id);if(cur)return cur;
 if(scene.motion===false||scene.heavyCrowd||scene.minimalCrowd||scene.budget?.level==='light'||scene.cutFullActive||scene.raceStatus?.active)return null;
 if(scene.effects?.some?.(e=>e.effect==='breakthrough'))return null;
 const cap=scene.crowded?1:2;if(st.active.length>=cap)return null;
 let nx=st.next.get(id);if(nx==null){nx=t+6000+hash(id)%30000;st.next.set(id,nx);if(st.next.size>200)st.next.delete(st.next.keys().next().value);}
 if(t<nx)return null;const b={id,start:t};st.active.push(b);st.next.set(id,t+WING_BURST_GAP+hash(id)%8000);return b;}
export function forceWingBurst(scene,id,t){const st=scene.wingBurst??={active:[],next:new Map()};st.active=st.active.filter(b=>b.id!==id);const b={id,start:t};st.active.push(b);return b;}

/** Vẽ cánh bậc cao. (x,y) = điểm neo cánh (giữa lưng), w = bề ngang cánh. Trả true nếu đã vẽ. */
export function drawWingFx(scene,c,target,fx,t,x,y,w,alpha=.95){
 const S=staticWing(fx,w);if(!S)return false;
 const p=target.player,b=partsReady(fx)?burstOf(scene,p.id,t):null,k=b?(t-b.start)/WING_BURST_MS:-1;
 c.save();c.translate(x,y);
 if(k<0){c.globalAlpha=alpha;c.drawImage(S.cv,-S.w/2,-S.pivotY,S.w,S.h);c.restore();return true;}
 const seed=hash(p.id)+Math.floor(b.start);
 try{if(fx==='swords')burstSwords(c,w,k,t,seed,alpha,S);else if(fx==='demon')burstDemon(c,w,k,t,seed,alpha,S);else if(fx==='lotus')burstLotus(c,w,k,t,seed,alpha,S);else burstHeaven(c,w,k,t,seed,alpha,S);}
 finally{c.restore();c.globalAlpha=1;c.globalCompositeOperation='source-over';}
 return true;
}
// bitmap tĩnh mờ dần ra / hiện lại (dùng khi bộ phận rời đi)
function ghost(c,S,a){if(a<=.01)return;c.globalAlpha=a;c.drawImage(S.cv,-S.w/2,-S.pivotY,S.w,S.h);}

// ===== 8.000 VẠN KIẾM: bung → bay tứ tung → về xếp cánh =====
function burstSwords(c,w,k,t,seed,alpha,S){
 const sw=sized('sword',w*.25);if(!sw){ghost(c,S,alpha);return;}
 const slots=swordSlots(w),mix=smooth(seg(k,0,.16))*(1-smooth(seg(k,.72,.95))),glowA=Math.sin(Math.PI*clamp(k/.95));
 for(const s of slots){const j=s.sd*7+s.i+seed%97,ph=rnd(j)*TAU,R=w*(.35+rnd(j+3)*.45),sp=(rnd(j+5)>.5?1:-1)*(2.2+rnd(j+7)*1.6),u=(t*.001*sp)+ph;
  const fxp=Math.cos(u)*R,fyp=-w*.25+Math.sin(u*1.3)*R*.55;
  const px=s.x+(fxp-s.x)*mix,py=s.y+(fyp-s.y)*mix,rot=s.rot+(u+Math.PI/2-s.rot)*mix;
  c.globalCompositeOperation='lighter';const tipx=px+Math.sin(rot)*s.L*.75,tipy=py-Math.cos(rot)*s.L*.75;dot(c,'#5dffb0',tipx,tipy,s.L*.32*(.5+glowA),.55*glowA);
  c.globalCompositeOperation='source-over';stem(c,sw,px,py,s.L,rot,alpha);}
 if(glowA>.05){c.globalCompositeOperation='lighter';for(let i=0;i<12;i++){const a=rnd(seed+i)*TAU+t*.002,r=w*(.2+rnd(i+seed)*.5);dot(c,i%3?'#7dffcf':'#ffffff',Math.cos(a)*r,-w*.25+Math.sin(a)*r*.5,4+rnd(i)*5,.7*glowA);}}
}
// ===== 10.000 QUỶ DỰC: khói → mặt quỷ bay ra gầm phun lửa → về hóa cánh =====
function burstDemon(c,w,k,t,seed,alpha,S){
 const face=sized('demon-face',w*.62);const wingA=1-smooth(seg(k,.04,.2))+smooth(seg(k,.82,.98));ghost(c,S,alpha*clamp(wingA));
 const smokeIn=Math.sin(Math.PI*seg(k,.02,.3)),smokeOut=Math.sin(Math.PI*seg(k,.72,.98)),smoke=Math.max(smokeIn,smokeOut);
 if(smoke>.02){for(let i=0;i<14;i++){const a=rnd(seed+i)*TAU,r=w*(.12+rnd(i+1)*.32)*(1-smoke*.4);c.globalCompositeOperation='source-over';dot(c,'#2a0006',Math.cos(a)*r,-w*.05+Math.sin(a)*r*.6,w*.14,.55*smoke);c.globalCompositeOperation='lighter';if(i%3===0)dot(c,'#ff3a1a',Math.cos(a)*r,-w*.05+Math.sin(a)*r*.6,w*.06,.6*smoke);}}
 const fly=seg(k,.18,.82);if(fly<=0||fly>=1||!face)return;
 const out=Math.sin(Math.PI*fly),fx=Math.sin(fly*TAU*1.5+seed)*w*.18*out,fy=-w*.1-w*.5*out,sc=(.45+.75*out)*(1+.06*Math.sin(t*.03)),roar=seg(fly,.42,.62)*(1-seg(fly,.62,.78));
 const fw=w*.62*sc,shake=roar>0?Math.sin(t*.09)*w*.02*roar:0;
 c.globalCompositeOperation='lighter';dot(c,'#ff2a10',fx,fy,fw*.75,.55*out);
 if(roar>0){for(let i=0;i<10;i++){const u=(t*.004+i*.1)%1,ang=Math.PI/2+(rnd(i+seed)-.5)*.7;dot(c,i%2?'#ffb02e':'#ff3a1a',fx+Math.cos(ang)*fw*.25*(1+u*2.4),fy+fw*.28+Math.sin(ang)*fw*.4*u*2.2,fw*.12*(1-u*.5),roar*(1-u));}}
 c.globalCompositeOperation='source-over';part(c,face,fx+shake,fy,fw,Math.sin(t*.004)*.08,alpha*clamp(out*1.6));
}
// ===== 12.000 THANH LIÊN: cánh hoa xoáy lên → đóa sen khổng lồ nở → rơi về =====
function burstLotus(c,w,k,t,seed,alpha,S){
 const pet=sized('lotus-petal',w*.2),big=sized('lotus-big',w*.95);const wingA=1-smooth(seg(k,0,.14))+smooth(seg(k,.84,.98));ghost(c,S,alpha*clamp(wingA));
 if(!pet)return;const top={x:0,y:-w*.5},slots=petalSlots(w);
 const go=smooth(seg(k,.04,.3)),back=smooth(seg(k,.68,.92)),bloom=smooth(seg(k,.24,.42))*(1-smooth(seg(k,.62,.8)));
 if(bloom>.02&&big){c.globalCompositeOperation='lighter';dot(c,'#ff9ad0',top.x,top.y,w*.7*bloom,.6*bloom);dot(c,'#ffe6a0',top.x,top.y,w*.3*bloom,.8*bloom);c.globalCompositeOperation='source-over';part(c,big,top.x,top.y,w*.95*bloom,Math.sin(t*.0015)*.06,alpha*bloom);}
 const vis=(1-bloom)*(k<.92?1:0);if(vis<=.02)return;
 for(const s of slots){const j=s.sd*5+s.i+seed%53,a0=s.i/5*TAU+s.sd,u=k*TAU*1.6+a0,r=w*.32*(1-go*.6+back*.6),
  sx=top.x+Math.cos(u)*r,sy=top.y+Math.sin(u)*r*.45,m=go*(1-back),px=s.x+(sx-s.x)*m,py=s.y+(sy-s.y)*m,rot=s.rot*(1-m)+u*m;
  c.globalCompositeOperation='lighter';dot(c,'#ff9ad0',px,py-s.L*.4,s.L*.3,.4*m);c.globalCompositeOperation='source-over';stem(c,pet,px,py,s.L,rot,alpha*vis);}
}
// ===== 12.000 THIÊN ĐẠO: pháp luân lên đỉnh đầu → kiếm trận xoay quanh người → về chỗ =====
function burstHeaven(c,w,k,t,seed,alpha,S){
 const lw=sized('light-wing',w),bl=sized('light-blade',w*.22),wh=sized('dharma-wheel',w*.6);if(!lw||!bl||!wh){ghost(c,S,alpha);return;}
 const lwA=.7*(1-smooth(seg(k,.06,.2))+smooth(seg(k,.82,.96)));part(c,lw,0,0,w,0,alpha*clamp(lwA),.5,.55);
 const up=smooth(seg(k,0,.22))*(1-smooth(seg(k,.78,.96))),wy=-w*.12-w*.62*up,ws=w*(.3+.32*up),spin=t*.0016*(1+up*2);
 c.globalCompositeOperation='lighter';dot(c,'#ffd36b',0,wy,ws*.9,.5*up+.15);
 const pill=Math.sin(Math.PI*seg(k,.38,.56));if(pill>.02){c.globalAlpha=pill*.75;const pw=w*.16;for(let i=0;i<14;i++){const d=i*w*.11,f=1-i/14;dot(c,'#fff3c4',0,wy-d,pw*(1.6-i*.05),.5*pill*f);if(i<8)dot(c,'#ffe08a',0,wy+d,pw*(1.5-i*.08),.4*pill*f);}}
 c.globalCompositeOperation='source-over';part(c,wh,0,wy,ws,spin,alpha);
 const slots=bladeSlots(w),orbit=smooth(seg(k,.14,.32))*(1-smooth(seg(k,.7,.9)));
 slots.forEach((s,i)=>{const a=i/slots.length*TAU+t*.0035,ox=Math.cos(a)*w*.62,oy=-w*.2+Math.sin(a)*w*.2,px=s.x+(ox-s.x)*orbit,py=s.y+(oy-s.y)*orbit,rot=s.rot*(1-orbit)+(Math.cos(a)*.35)*orbit,L=s.L*(1-orbit*.25);
  if(orbit>.05){c.globalCompositeOperation='lighter';dot(c,'#ffe08a',px,py-L*.5,L*.28,.5*orbit);c.globalCompositeOperation='source-over';}
  stem(c,bl,px,py,L,rot,alpha);});
}
export {burstOf as _burstOf}; // test
