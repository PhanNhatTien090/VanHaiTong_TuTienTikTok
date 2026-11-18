// 18/11/2026 — MÀN CHIẾU RIÊNG "NIẾT BÀN LUÂN HỒI" (chuyển sinh). 26 s, bỏ cả sân (hook đầu scene.drawFrame).
// Chủ game: "làm chuyên nghiệp, cinematic, nghiêm túc — chuyển sinh xong mà chán là toang".
// Nhịp nguyên nhân → chuyển hóa → cao trào → biến hình (như màn đột phá), mỗi hồi một cơ chế riêng:
//  I   VIÊN MÃN (0–4,2)      hư không tối, thân Hỗn Độn lơ lửng, 2 nhịp tim, chữ "Hỗn Độn Vĩnh Hằng · Viên Mãn".
//  II  LUÂN HỒI MÔN (4,2–9)  Lục Đạo Luân Hồi Bàn từ trên hạ xuống sau lưng; 6 đạo sáng lần lượt theo 6 tiếng chuông.
//  III HỒI TƯỞNG (9–14)      28 cảnh giới đã đi qua bay NGƯỢC từ xa về (Hỗn Độn → Phàm nhân), nhanh dần; thân nứt vân vàng.
//  IV  THÂN DIỆT (14–16,9)   thân tan từ chân lên thành ~400 tro lửa bay lên bánh xe; tối dần; im lặng 0,5 s.
//  V   NIẾT BÀN (16,9–19)    bánh xe lật nằm ngang + xoay gấp → cột sáng giáng (impact frame đảo màu, hit-stop, rung) → lóe trắng.
//  VI  TRÙNG SINH (19–23,5)  thân mới (Phàm nhân, cùng skin) hạ xuống trong cột sáng; ấn ☸ in sau lưng; danh hiệu "NHẤT THẾ LUÂN HỒI" đóng dấu.
//  VII TRUYỀN THẾ (23,5–26)  4 ân điển hiện từng dòng; mở lại sân.
// Biến thể theo seed: chiều xoay, góc máy nghiêng, thứ tự sáng 6 đạo, màu tro. Màu theo bậc (luanHoiTier).
import {txt,drawCaster,cutVeil,CUT_PHASE} from './skill-cutscene.js?v=20261118';
import {clamp,seg,out3,smooth,dot,fxCamera,punch,drawBurst,drawVignette,drawLetterbox,drawImpactFrame,hitStop,drawZoomLines} from './cut-fx.js?v=20261118';
import {REALM_NAMES} from './progression.js';
import {makeSurface} from './performance.js';
import {LUAN_HOI,luanHoiTier,luanHoiTitle} from './luan-hoi-data.js';

const TAU=Math.PI*2,SERIF='"Noto Serif","Times New Roman",Georgia,serif';
export const LH=Object.freeze({duration:26,beats:[1.6,2.55],bells:[4.9,5.55,6.2,6.85,7.5,8.15],recallFrom:9,recallTo:14,dissolve:14,dark:16.4,silence:16.6,slam:17.35,phoenix:15.1,cry:15.75,dive:16.9,ghost:20.7,impact:17.9,flash:18.1,descend:19,land:20.6,stamp:21.15,gifts:22.2,end:26});
export const LUAN_HOI_MS=LH.duration*1000;
const GLYPH=['天','人','修羅','畜生','餓鬼','地獄'],GLYPH_VN=['Thiên','Nhân','A Tu La','Súc Sinh','Ngạ Quỷ','Địa Ngục'];
const perf=()=>globalThis.performance?.now?.()??Date.now();
const nowAt=(scene,t)=>(scene.stateServerNow||Date.now())+Math.min(2000,Math.max(0,t-(scene.stateReceivedAt||t)));
const rnd=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};
const hasDoc=()=>typeof document!=='undefined';
const easeIO=k=>{k=clamp(k);return k<.5?4*k*k*k:1-(-2*k+2)**3/2;};

function stx(c,s,x,y,size,fill,{width=7,align='center',max,stroke='#05030a',weight='900',spacing=0}={}){
 c.font=weight+' '+size+'px '+SERIF;c.textAlign=align;c.textBaseline='middle';c.lineJoin='round';
 if('letterSpacing' in c)c.letterSpacing=spacing+'px';
 if(width){c.lineWidth=width;c.strokeStyle=stroke;c.strokeText(s,x,y,max);}c.fillStyle=fill;c.fillText(s,x,y,max);
 if('letterSpacing' in c)c.letterSpacing='0px';}
const goldGrad=(c,y,size,P)=>{const g=c.createLinearGradient(0,y-size*.6,0,y+size*.6);g.addColorStop(0,'#ffffff');g.addColorStop(.42,P.soft);g.addColorStop(.58,P.main);g.addColorStop(1,'#ffffff');return g;};

/** Cảnh chiếu đang chạy theo state.luanHoiCut (hoặc null). */
export function findLuanHoi(cut,now){if(!cut)return null;const age=now-cut.at,ms=cut.ms||LUAN_HOI_MS;if(age<0||age>=ms)return null;
 // ánh xạ sang thang k của cutVeil: vào 0,7 s, ra 0,9 s cuối.
 const k=age<700?age/700*CUT_PHASE.wipeIn:age>ms-900?CUT_PHASE.wipeOut+(age-(ms-900))/900*(1-CUT_PHASE.wipeOut):.5;
 return {x:cut,age,ms,k,sec:age/1000};}

function lh(scene){return scene.luanHoiFx??={layer:null,embers:null,seen:new Set()};}
function playerFor(scene,cut){const all=scene.realPlayers||scene.players||[];const p=all.find(q=>q.id===cut.pid);
 return p||{id:cut.pid,name:cut.name||'Đạo hữu',realm:0,giftCoins:0,manuals:[],artifacts:[]};}

/** Hook đầu scene.drawFrame: true = đã vẽ cả màn. */
export function luanHoiCutFrame(scene,c,t,H){
 const cut=findLuanHoi(scene.luanHoiCut,nowAt(scene,t)),full=!!cut&&cut.k>=CUT_PHASE.wipeIn&&cut.k<CUT_PHASE.wipeOut;
 if(!!scene.luanHoiOn!==!!cut){scene.luanHoiOn=!!cut;if(hasDoc())document.body?.classList?.toggle('cutscene-on',!!cut);if(cut)scene.onLuanHoiAudio?.(cut.x,cut.age);}
 if(cut||scene.luanHoiVeil){scene.luanHoiVeil=!!cut;cutVeil(cut,full);}
 if(!full)return false;
 try{drawLuanHoi(scene,c,t,H,cut);}catch(err){console.warn('[luan-hoi]',err);return false;}
 return true;
}

// ───────────── vẽ ─────────────
function background(c,H,P,sec,tilt){
 const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#03010a');g.addColorStop(.45,P.deep);g.addColorStop(.75,'#1a0a0a');g.addColorStop(1,'#020005');c.fillStyle=g;c.fillRect(-60,-60,1020,H+120);
 // tinh vân xa trôi chậm
 c.save();c.globalCompositeOperation='lighter';for(let i=0;i<5;i++){const x=450+Math.cos(i*1.7+sec*.04)*320,y=H*(.25+.12*i)+Math.sin(sec*.05+i)*30,r=260+i*40,gr=c.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,P.main+'1c');gr.addColorStop(1,P.main+'00');c.fillStyle=gr;c.fillRect(x-r,y-r,r*2,r*2);}
 for(let i=0;i<90;i++){const x=(rnd(i)*1000+tilt*i*.3)%960-30,y=rnd(i+40)*H,tw=.3+.7*Math.abs(Math.sin(sec*1.3+i));dot(c,i%5?'#fff6e0':P.main,x,y,.8+rnd(i+9)*1.6,.3*tw);}
 for(let i=0;i<5;i++){const x=180+i*135+Math.sin(sec*.2+i)*30,w=40+rnd(i+3)*60,gr=c.createLinearGradient(x,0,x+w*.6,H*.8);gr.addColorStop(0,P.main+'22');gr.addColorStop(1,P.main+'00');c.fillStyle=gr;c.beginPath();c.moveTo(x-w*.2,-40);c.lineTo(x+w,-40);c.lineTo(x+w*2.2,H*.85);c.lineTo(x+w*.6,H*.85);c.closePath();c.fill();}
 c.restore();
}
function wheel(c,x,y,R,rot,P,a,flat,lit,sec,light){
 if(a<=.01)return;c.save();c.translate(x,y);c.scale(1,flat);c.globalAlpha=a;c.globalCompositeOperation='lighter';
 // đĩa nền
 c.globalCompositeOperation='source-over';c.fillStyle='#05020c';c.globalAlpha=a*.62;c.beginPath();c.arc(0,0,R,0,TAU);c.fill();c.globalAlpha=a;c.globalCompositeOperation='lighter';
 const g=c.createRadialGradient(0,0,R*.3,0,0,R*1.08);g.addColorStop(0,P.main+'00');g.addColorStop(.85,P.main+'14');g.addColorStop(1,P.main+'40');c.fillStyle=g;c.beginPath();c.arc(0,0,R*1.08,0,TAU);c.fill();
 c.strokeStyle=P.soft;c.lineWidth=4;c.beginPath();c.arc(0,0,R,0,TAU);c.stroke();
 c.lineWidth=1.5;c.beginPath();c.arc(0,0,R*.93,0,TAU);c.stroke();c.beginPath();c.arc(0,0,R*.36,0,TAU);c.stroke();c.beginPath();c.arc(0,0,R*.3,0,TAU);c.stroke();
 // 6 nan + 6 ô đạo
 for(let i=0;i<6;i++){const q=rot+i*TAU/6,on=lit[i]||0;
  c.strokeStyle=P.main;c.lineWidth=2.5;c.beginPath();c.moveTo(Math.cos(q)*R*.36,Math.sin(q)*R*.36);c.lineTo(Math.cos(q)*R*.93,Math.sin(q)*R*.93);c.stroke();
  if(on>0){const q0=q,q1=q+TAU/6,sg=c.createRadialGradient(0,0,R*.37,0,0,R*.92);sg.addColorStop(0,(P.fire||P.main)+'00');sg.addColorStop(1,P.fire||P.main);c.fillStyle=sg;c.globalAlpha=a*on*.3;c.beginPath();c.arc(0,0,R*.92,q0,q1);c.arc(0,0,R*.37,q1,q0,true);c.closePath();c.fill();c.globalAlpha=a;}
  const qm=q+TAU/12,gx=Math.cos(qm)*R*.66,gy=Math.sin(qm)*R*.66;c.save();c.translate(gx,gy);c.scale(1,1/flat);c.rotate(qm+Math.PI/2);
  c.font='900 '+Math.round(R*(GLYPH[i].length>1?.1:.15))+'px '+SERIF;c.textAlign='center';c.textBaseline='middle';c.fillStyle=on>0?P.gold:P.main;c.globalAlpha=a*(.3+.7*on);c.fillText(GLYPH[i],0,0);c.restore();c.globalAlpha=a;}
 // vạch chia độ vòng ngoài
 if(!light){c.strokeStyle=P.main;c.lineWidth=1.2;for(let i=0;i<72;i++){const q=-rot*.5+i*TAU/72,r1=R*.95,r2=R*(i%6?.98:1.03);c.beginPath();c.moveTo(Math.cos(q)*r1,Math.sin(q)*r1);c.lineTo(Math.cos(q)*r2,Math.sin(q)*r2);c.stroke();}}
 // trục giữa
 const hub=c.createRadialGradient(0,0,0,0,0,R*.3);hub.addColorStop(0,'#ffffff');hub.addColorStop(.3,P.accentSoft||P.soft);hub.addColorStop(1,(P.accent||P.main)+'00');c.fillStyle=hub;c.globalAlpha=a*(.5+.5*Math.sin(sec*2.2)**2);c.beginPath();c.arc(0,0,R*.3,0,TAU);c.fill();
 c.restore();
}
/** HỒI I: lốc khí Hỗn Độn xoáy quanh thân (dải xoắn vàng–tím) + vòng xung nhịp tim. */
function chaosSwirl(c,cx,feet,scale,sec,P,a,light){if(a<=.01)return;c.save();c.globalCompositeOperation='lighter';
 const top=feet-scale*150,n=light?3:5;
 for(let k=0;k<n;k++){const ph=sec*(1.1+k*.17)+k*1.3,col=k%2?P.main:'#b48cff';c.strokeStyle=col;c.lineWidth=2.2-k*.25;c.globalAlpha=a*(.5-k*.06);c.beginPath();
  for(let i=0;i<=60;i++){const u=i/60,y=feet-u*(feet-top)*1.05,r=scale*(26+20*Math.sin(u*Math.PI))*(1+.08*k),q=ph+u*7.5,x=cx+Math.cos(q)*r;const z=Math.sin(q);if(i)c.lineTo(x,y+z*scale*5);else c.moveTo(x,y+z*scale*5);}c.stroke();}
 for(let i=0;i<(light?24:60);i++){const u=((sec*.18+rnd(i))%1),q=sec*1.6+i*2.4,r=scale*(18+40*rnd(i+5))*(1-u*.4);dot(c,i%3?P.main:'#c9a6ff',cx+Math.cos(q)*r,feet-u*scale*150,1.4+rnd(i+1)*2.4,a*.8*Math.sin(u*Math.PI));}
 for(const b of LH.beats){const u=seg(sec,b,b+.9);if(u<=0||u>=1)continue;c.globalAlpha=a*(1-u)*.9;c.strokeStyle=P.soft;c.lineWidth=4*(1-u)+1;c.beginPath();c.ellipse(cx,feet,60+u*360,(60+u*360)*.24,0,0,TAU);c.stroke();}
 c.restore();}
/** Phượng hoàng lửa (Niết Bàn): kết từ tro, giang cánh, lao xuống. Hình dựng bằng hạt theo đường cong (không cần ảnh). */
const PHX=(()=>{const pts=[];
 // thân + đầu + mỏ
 for(let i=0;i<40;i++){const u=i/39;pts.push([0,-1+u*1.25,1.6-u*.6,'b']);}
 for(let i=0;i<10;i++){const u=i/9;pts.push([Math.sin(u*Math.PI)*.12-.02,-1.08-u*.1,1.3,'h']);}
 // mào 3 cọng
 for(let k=0;k<3;k++)for(let i=0;i<8;i++){const u=i/7;pts.push([-.05-u*.22-k*.05,-1.15-u*.22+k*.06,1-u*.5,'c']);}
 // cánh (mép trên cong + lông vũ rủ)
 for(const sd of [-1,1]){for(let i=0;i<46;i++){const u=i/45;pts.push([sd*u*1.42,-.5-Math.sin(u*Math.PI*.62)*.62-u*.12,1.4-u*.5,'w'+(sd>0?'r':'l'),u]);}
  for(let f=0;f<9;f++){const u=.2+f/9*.8,bx=sd*u*1.42,by=-.5-Math.sin(u*Math.PI*.62)*.62-u*.12,len=.55-u*.25;for(let i=1;i<10;i++){const v=i/9;pts.push([bx-sd*v*.1,by+v*len,1.1-v*.6,'w'+(sd>0?'r':'l'),u]);}}}
 // đuôi 3 dải dài uốn
 for(let k=-1;k<=1;k++)for(let i=0;i<34;i++){const u=i/33;pts.push([k*.18*u+Math.sin(u*4+k)*.12*u,.25+u*1.35,1.3-u*.9,'t']);}
 return pts;})();
function phoenix(c,cx,cy,size,open,a,P,sec,light,dive=0){if(a<=.01)return;c.save();c.globalCompositeOperation='lighter';
 // quầng lửa sau lưng
 const gr=c.createRadialGradient(cx,cy,0,cx,cy,size*1.8);gr.addColorStop(0,'#ffcf7a'+'66');gr.addColorStop(.4,(P.fire||'#ff5a1f')+'33');gr.addColorStop(1,'#ff5a1f00');c.globalAlpha=a;c.fillStyle=gr;c.fillRect(cx-size*1.8,cy-size*1.8,size*3.6,size*3.6);
 // thân cánh + đuôi tô lửa đặc (cho ra hình con chim, hạt chỉ là lớp viền lấp lánh)
 const wingPt=(sd,u)=>{const flap=Math.sin(sec*5.5)*.18*(1-dive);let x=sd*u*1.42,y=-.5-Math.sin(u*Math.PI*.62)*.62-u*.12;y=y-(open-1)*u*.5+flap*u-dive*u*.6;x=x*(.35+.65*open)*(1-dive*.75);return [cx+x*size,cy+y*size*(1+dive*.4)];};
 for(const sd of [-1,1]){c.beginPath();const [sx,sy]=wingPt(sd,0);c.moveTo(sx,sy);for(let i=1;i<=20;i++){const [x,y]=wingPt(sd,i/20);c.lineTo(x,y);}
  for(let i=20;i>=3;i--){const u=i/20,[x,y]=wingPt(sd,u),len=(.55-u*.25)*size;c.quadraticCurveTo(x-sd*.06*size,y+len*.7,x-sd*.12*size,y+len*(i%2?1:.75));}
  c.closePath();const wg=c.createLinearGradient(cx,cy-size,cx+sd*size*1.6,cy+size*.3);wg.addColorStop(0,'#fff1c0');wg.addColorStop(.4,P.main);wg.addColorStop(1,(P.fire||'#ff5a1f')+'99');c.globalAlpha=a*.5;c.fillStyle=wg;c.fill();}
 c.beginPath();c.moveTo(cx-.1*size,cy-.2*size);for(let i=0;i<=16;i++){const u=i/16;c.lineTo(cx+(-.1-.3*u+Math.sin(u*4)*.1)*size,cy+(.25+u*1.35)*size*(1+dive*.4));}for(let i=16;i>=0;i--){const u=i/16;c.lineTo(cx+(.1+.3*u+Math.sin(u*4+1)*.1)*size,cy+(.25+u*1.35)*size*(1+dive*.4));}c.closePath();
 const tg=c.createLinearGradient(0,cy,0,cy+1.6*size);tg.addColorStop(0,'#ffd27acc');tg.addColorStop(1,(P.fire||'#ff5a1f')+'00');c.globalAlpha=a*.5;c.fillStyle=tg;c.fill();
 {const bg=c.createLinearGradient(0,cy-1.15*size,0,cy+.4*size);bg.addColorStop(0,'#ffffff');bg.addColorStop(.3,'#ffe6a0');bg.addColorStop(1,(P.fire||'#ff5a1f')+'00');c.beginPath();c.moveTo(cx,cy-1.18*size);c.quadraticCurveTo(cx+.13*size,cy-.6*size,cx+.05*size,cy+.4*size);c.lineTo(cx-.05*size,cy+.4*size);c.quadraticCurveTo(cx-.13*size,cy-.6*size,cx,cy-1.18*size);c.globalAlpha=a*.7;c.fillStyle=bg;c.fill();}
 const step=light?2:1;
 for(let i=0;i<PHX.length;i+=step){const [x0,y0,w,kind,u=0]=PHX[i];let x=x0,y=y0;
  if(kind==='wl'||kind==='wr'){const sd=kind==='wr'?1:-1;const flap=Math.sin(sec*5.5)*.18*(1-dive);y=y0-(open-1)*u*.5+flap*u;x=x0*(.35+.65*open)*(1-dive*.75);y-=dive*u*.6;}
  if(kind==='t'){x+=Math.sin(sec*3+y0*3)*.06;}
  const jx=(rnd(i+Math.floor(sec*20))-.5)*.035,jy=(rnd(i*3+Math.floor(sec*20))-.5)*.035;
  const px=cx+(x+jx)*size,py=cy+(y+jy)*size*(1+dive*.4),r=(1.6+w*2.6)*(size/220);
  dot(c,kind==='h'||kind==='c'?'#ffffff':i%3?(P.fire||'#ff5a1f'):P.main,px,py,r*2.2,a*.35);dot(c,i%4?'#ffe6a8':'#ffffff',px,py,r,a*.95);}
 // mắt
 dot(c,'#ffffff',cx+.03*size,cy-1.1*size,5*(size/220),a);
 c.restore();}
/** Thân người vẽ ra lớp riêng (để tan từ chân lên). */
function bodyLayer(scene,h,p,H,t,scale,k=1){
 const W=900,key=H+'|'+k;if(!h.layer||h.layerKey!==key){h.layer=makeSurface(Math.ceil(W*k),Math.ceil(H*k));h.layerKey=key;}const cv=h.layer;if(!cv)return null;const x=cv.getContext('2d');x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,cv.width,cv.height);x.setTransform(k,0,0,k,0,0);
 drawCaster(scene,x,p,450,H*.64,scale,t,false);return cv;}

function drawLuanHoi(scene,c,t,H,cut){
 const h=lh(scene),e=cut.x,seed=Number(e.seed)||1,v={spin:seed&1?1:-1,tilt:((seed>>>1)%5-2)*.012,order:[0,1,2,3,4,5].sort((a,b)=>rnd(seed+a)-rnd(seed+b))};
 const n=Math.max(1,e.n||1),tier=luanHoiTier(n)||{main:'#ffcc80',soft:'#fff1d6',deep:'#2a1600'},P={main:'#ffb547',soft:'#ffe9b0',deep:'#120a1e',gold:'#fff3c8',fire:'#ff5a1f',accent:tier.main,accentSoft:tier.soft};
 const light=scene.budget?.level==='light';
 let sec=cut.sec;const hs=hitStop(sec-LH.impact,t,.12);if(sec>=LH.impact&&hs.frozen)sec=LH.impact+.001;
 const p=playerFor(scene,e),from={...p,realm:Number(e.fromRealm)||REALM_NAMES.length-1},to={...p,realm:0};
 const cx=450,feet=H*.64;
 // camera: đẩy chậm vào suốt hồi I–III, giật ở nhịp tim + cú giáng, kéo ra lúc trùng sinh
 const push=1+.06*easeIO(seg(sec,0,9))+.08*easeIO(seg(sec,9,16.4))-.12*easeIO(seg(sec,18.2,21));
 const shake=(sec>LH.slam&&sec<LH.impact+1.4?(1-seg(sec,LH.impact,LH.impact+1.4))*22:0)+LH.beats.reduce((s,b)=>s+punch(sec-b,.9)*16,0);
 c.save();c.fillStyle='#000';c.fillRect(-60,-60,1020,H+120);
 c.translate(cx,H*.5);c.rotate(v.tilt*smooth(seg(sec,0,8)));c.translate(-cx,-H*.5);
 fxCamera(c,cx,H*.5,push+punch(sec-LH.impact,.08),shake,t);
 background(c,H,P,sec,v.tilt*100);

 // ── Bánh xe Luân Hồi (II → V)
 const wIn=out3(seg(sec,4.2,6)),wOut=1-seg(sec,LH.flash,LH.flash+.25),wy=H*(.38-.25*(1-wIn)),R=330+40*seg(sec,9,14);
 const flatK=easeIO(seg(sec,LH.slam-.6,LH.slam+.2)),flat=1-.72*flatK,wyy=wy+(feet-wy)*flatK;
 const spinSpeed=.12+.5*seg(sec,9,14)+3.2*seg(sec,LH.slam-.6,LH.impact);const rot=v.spin*(sec*spinSpeed);
 const lit=[0,0,0,0,0,0];LH.bells.forEach((b,i)=>{lit[v.order[i]]=sec>=b?Math.min(1,.6+.4*Math.exp(-(sec-b)*3)):0;});
 if(sec>=9)for(let i=0;i<6;i++)lit[i]=Math.max(lit[i],.55+.45*Math.sin(sec*6+i));
 wheel(c,cx,wyy,R,rot,P,wIn*wOut*(sec>16.3&&sec<LH.slam-.6?.5:1)*(1-.55*seg(sec,LH.phoenix,LH.cry)*(1-seg(sec,LH.dive,LH.slam))),flat,lit,sec,light);

 // ── HỒI I: thân Hỗn Độn + hào quang
 const bodyA=1-seg(sec,LH.dissolve,LH.dark),scale=4.5;
 if(sec<LH.dark){
  // cột khí sau lưng
  c.save();c.globalCompositeOperation='lighter';const aura=(.45+.25*Math.sin(sec*3))*bodyA*(sec<LH.dissolve?1:.6);
  const ag=c.createRadialGradient(cx,feet-170,10,cx,feet-170,280);ag.addColorStop(0,P.soft+'88');ag.addColorStop(.5,P.main+'33');ag.addColorStop(1,P.main+'00');c.globalAlpha=aura;c.fillStyle=ag;c.fillRect(cx-300,feet-470,600,600);c.restore();
  chaosSwirl(c,cx,feet,scale,sec,P,seg(sec,.2,1.4)*(1-seg(sec,LH.dissolve-.4,LH.dissolve+.6)),light);
  const dk=Math.min(2.5,Math.max(1,Math.hypot((c.getTransform?.().a)||1,(c.getTransform?.().b)||0)/(push||1))),lay=bodyLayer(scene,h,from,H,t,scale,dk); // vẽ đúng độ phân giải màn (không mờ)
  if(lay){
   const top=feet-scale*185,bot=feet+10,cut0=bot-(bot-top)*easeIO(seg(sec,LH.dissolve,LH.dark-.2)); // phần dưới cut0 đã tan
   c.save();c.beginPath();c.rect(0,0,900,cut0);c.clip();
   const float=Math.sin(sec*1.4)*6*(1-seg(sec,9,14));c.drawImage(lay,0,float-H*.0,900,H);c.restore();
   // vân nứt vàng (hồi III)
   const crack=seg(sec,10.5,14);if(crack>0){c.save();c.globalCompositeOperation='lighter';c.strokeStyle=P.soft;c.lineCap='round';
    for(let i=0;i<9;i++){const u=seg(crack,i/12,i/12+.4);if(u<=0)continue;let x=cx+(rnd(seed+i)-.5)*60,y=feet-scale*(30+rnd(i+5)*95);c.globalAlpha=.9*u*bodyA;c.lineWidth=2.4;c.beginPath();c.moveTo(x,y);
     for(let k=0;k<5*u;k++){x+=(rnd(i*7+k)-.5)*34;y+=(rnd(i*3+k)-.5)*30;c.lineTo(x,y);}c.stroke();}c.restore();}
   // viền tan: dải sáng + tro
   if(sec>=LH.dissolve&&cut0>top+8){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=bodyA;const gl=c.createLinearGradient(0,cut0-16,0,cut0+6);gl.addColorStop(0,P.main+'00');gl.addColorStop(.7,P.soft+'cc');gl.addColorStop(1,'#ffffff00');c.fillStyle=gl;c.fillRect(cx-170,cut0-16,340,22);c.restore();}
  }
 }
 // ── PHƯỢNG HOÀNG NIẾT BÀN: kết từ tro trên trục bánh xe → giang cánh + kêu → (tối, im) → lao thẳng xuống thành cột sáng
 if(sec>=LH.phoenix&&sec<LH.impact+.05){const form=easeIO(seg(sec,LH.phoenix,LH.cry)),open=.25+.75*easeIO(seg(sec,LH.cry-.3,LH.cry+.5)),dive=easeIO(seg(sec,LH.dive,LH.impact)),
   size=215*(.55+.45*form)*(1+.25*seg(sec,LH.cry,LH.cry+.3)-.5*dive),cy=wy-60+(feet-60-(wy-60))*dive*dive,
   a=form*(sec>LH.dark&&sec<LH.dive?.35:1)*(1-seg(sec,LH.impact-.08,LH.impact));
  phoenix(c,cx,cy,size,open,a,P,sec,light,dive);
  if(sec>=LH.cry&&sec<LH.cry+1)drawZoomLines(c,cx,cy-size*.6,(1-seg(sec,LH.cry,LH.cry+1))*.7,t,P,light,H);}
 // ── tro lửa (IV): bay lên về trục bánh xe
 const ember=seg(sec,LH.dissolve,LH.slam);if(ember>0&&ember<1){c.save();c.globalCompositeOperation='lighter';const N=light?160:400;
  for(let i=0;i<N;i++){const born=rnd(i+seed)*.75,u=seg(ember,born,born+.45);if(u<=0||u>=1)continue;
   const sx=cx+(rnd(i*3)-.5)*170,sy=feet-rnd(i*5)*scale*130,tx=cx+Math.cos(i)*R*.15,ty=wy;const k=out3(u),x=sx+(tx-sx)*k+Math.sin(u*9+i)*24*(1-k),y=sy+(ty-sy)*k;
   dot(c,i%5===0?'#ffffff':i%2?P.fire:P.main,x,y,2+rnd(i+2)*4.2,(1-u)*.95);}c.restore();}

 // ── HỒI III: 28 cảnh giới bay ngược
 const recall=seg(sec,LH.recallFrom,LH.recallTo);
 if(recall>0&&recall<1){const top=Number(e.fromRealm)||REALM_NAMES.length-1;c.save();
  for(let r=top;r>=0;r--){const idx=top-r,start=Math.pow(idx/(top+1),.75)*.86,u=seg(recall,start,start+.16);if(u<=0||u>=1)continue;
   const ang=idx*2.39996+seed,dist=.18+u*u*1.25,zx=cx+Math.cos(ang)*430*dist,zy=wy+Math.sin(ang)*600*dist*.75,sz=14+84*u*u,a=Math.min(1,u*5)*(1-u)**.5;
   c.globalAlpha=a;stx(c,REALM_NAMES[r],zx,zy,sz,r===top?P.gold:'#ffffff',{width:Math.max(2,sz*.12),weight:'700',spacing:sz*.06});}
  c.globalAlpha=1;drawZoomLines(c,cx,H*.42,.55*Math.sin(recall*Math.PI),t,P,light,H);c.restore();}

 // ── HỒI V: giáng — cột sáng + nổ
 if(sec>=LH.slam&&sec<LH.descend+1.2){const u=seg(sec,LH.slam,LH.impact),fade=1-seg(sec,LH.flash+.4,LH.descend+1.2);c.save();c.globalCompositeOperation='lighter';
  const W=60+220*u*u,gl=c.createLinearGradient(cx-W,0,cx+W,0);gl.addColorStop(0,P.main+'00');gl.addColorStop(.42,P.main+'aa');gl.addColorStop(.5,'#ffffff');gl.addColorStop(.58,P.main+'aa');gl.addColorStop(1,P.main+'00');
  c.globalAlpha=fade;c.fillStyle=gl;c.fillRect(cx-W,-60,W*2,feet+60);c.restore();}
 if(sec>=LH.impact)drawBurst(c,cx,feet,sec-LH.impact,P,H,{light,pillar:true,flash:true,scale:1.35,ground:feet,seed});
 // trận ấn ☸ dưới chân sau cú giáng
 const sealA=seg(sec,LH.impact,LH.impact+.6)*(1-seg(sec,LH.end-1.2,LH.end-.3));
 if(sealA>0)wheel(c,cx,feet+8,250,-rot*.15,P,sealA*.85,.28,[1,1,1,1,1,1].map((_,i)=>.4+.3*Math.sin(sec*3+i)),sec,light);

 // ── TIỀN THÂN HỘ ĐẠO: bóng khổng lồ của hình dạng kiếp trước, mờ vàng, đứng sau người vừa trùng sinh
 {const ga=seg(sec,LH.ghost,LH.ghost+1.2)*(1-seg(sec,LH.end-1.4,LH.end-.4));if(ga>0){const gk=Math.min(2.5,Math.max(1,Math.hypot((c.getTransform?.().a)||1,(c.getTransform?.().b)||0))),gl=bodyLayer(scene,h,from,H,t,scale,gk);
  if(gl){const gs=1.75,rise=(1-out3(seg(sec,LH.ghost,LH.ghost+1.6)))*60;c.save();c.globalAlpha=ga*.3;c.globalCompositeOperation='lighter';c.translate(cx,feet+rise);c.scale(gs,gs);c.translate(-cx,-feet);c.filter&&!light?c.filter='sepia(1) saturate(3) hue-rotate(-12deg) brightness(1.3)':0;c.drawImage(gl,0,0,900,H);c.filter='none';c.restore();}}}
 // ── HỒI VI: thân mới hạ xuống
 if(sec>=LH.descend-.3){const d=easeIO(seg(sec,LH.descend,LH.land)),y=feet-(1-d)*H*.42,a=seg(sec,LH.descend-.3,LH.descend+.4);
  c.save();c.globalCompositeOperation='lighter';const halo=c.createRadialGradient(cx,y-scale*60,10,cx,y-scale*60,260);halo.addColorStop(0,'#ffffffaa');halo.addColorStop(.4,P.soft+'55');halo.addColorStop(1,P.main+'00');c.globalAlpha=a*(1-.5*seg(sec,LH.land,LH.land+1.5));c.fillStyle=halo;c.fillRect(cx-280,y-scale*60-280,560,560);c.restore();
  // ấn ☸ lớn sau lưng
  const sa=seg(sec,LH.land-.2,LH.land+.5);if(sa>0){c.save();c.globalCompositeOperation='lighter';c.globalAlpha=sa*.9;const ry=feet-scale*70;
   wheel(c,cx,ry,190+10*Math.sin(sec*2),rot*.2,P,sa*.8,1,[1,1,1,1,1,1],sec,light);c.restore();}
  c.save();c.globalAlpha=a;drawCaster(scene,c,to,cx,y,scale,t,false);c.restore();
  if(sec>=LH.land)drawBurst(c,cx,feet,sec-LH.land,P,H,{light:true,pillar:false,flash:false,scale:.6,ground:feet,seed:seed+1});}

 // tro bay lên lơ thơ suốt hồi VI–VII
 if(sec>LH.land){c.save();c.globalCompositeOperation='lighter';for(let i=0;i<(light?30:70);i++){const u=((sec*.12+rnd(i+seed))%1),x=cx+(rnd(i*9)-.5)*700,y=feet+40-u*H*.75;dot(c,i%3?P.main:'#ffffff',x,y,1+rnd(i)*2.2,.6*(1-u)*seg(sec,LH.land,LH.land+1));}c.restore();}
 c.restore();c.restore(); // camera (fxCamera tự save 1 lớp) + lớp nền

 // ───── chữ (không theo camera) ─────
 const T1=seg(sec,.6,1.4)*(1-seg(sec,3.6,4.2));
 if(T1>0){c.globalAlpha=T1;stx(c,REALM_NAMES[Number(e.fromRealm)||REALM_NAMES.length-1].toUpperCase(),450,H*.14,40,goldGrad(c,H*.14,40,P),{width:6,spacing:8});stx(c,'— VIÊN MÃN —',450,H*.14+50,24,'#ffffff',{width:5,weight:'700',spacing:10});c.globalAlpha=1;}
 const T2=seg(sec,5,5.6)*(1-seg(sec,8.6,9.2));
 if(T2>0){c.globalAlpha=T2;stx(c,'LỤC ĐẠO LUÂN HỒI',450,H*.8,44,goldGrad(c,H*.8,44,P),{width:7,spacing:10});
  const lastBell=LH.bells.reduce((m,b,i)=>sec>=b?i:m,-1);if(lastBell>=0){const k=v.order[lastBell];stx(c,GLYPH_VN[k]+' đạo',450,H*.8+52,24,P.soft,{width:5,weight:'700',spacing:6});}c.globalAlpha=1;}
 const T3=seg(sec,9.4,10)*(1-seg(sec,13.4,14));
 if(T3>0){c.globalAlpha=T3;stx(c,'TIỀN KIẾP HỒI TƯỞNG',450,H*.8,36,'#ffffff',{width:6,spacing:8});c.globalAlpha=1;}
 const T4=seg(sec,14.4,14.9)*(1-seg(sec,LH.cry-.2,LH.cry+.2));
 if(T4>0){c.globalAlpha=T4;stx(c,'Thân diệt · Đạo tồn',450,H*.8,38,P.soft,{width:6,weight:'700',spacing:6});c.globalAlpha=1;}
 const T5=seg(sec,LH.cry,LH.cry+.35)*(1-seg(sec,LH.dark-.2,LH.dark));
 if(T5>0){c.globalAlpha=T5;stx(c,'PHƯỢNG HOÀNG NIẾT BÀN',450,H*.8,46,goldGrad(c,H*.8,46,P),{width:7,spacing:8});c.globalAlpha=1;}
 // danh hiệu đóng dấu
 if(sec>=LH.stamp){const u=seg(sec,LH.stamp,LH.stamp+.28),sz=72*(1+1.4*(1-out3(u))),a=Math.min(1,u*2)*(1-seg(sec,LH.end-.8,LH.end-.2));const ty=H*.15;
  c.save();c.globalAlpha=a;stx(c,luanHoiTitle(n).toUpperCase(),450,ty,Math.min(sz,150),goldGrad(c,ty,sz,P),{width:9,spacing:6,max:860});
  stx(c,String(p.name||e.name||''),450,ty+70,32,'#ffffff',{width:6,weight:'800',max:760});
  c.globalCompositeOperation='lighter';c.globalAlpha=a*.7*(1-u);c.strokeStyle=P.accent||P.soft;c.lineWidth=3;c.beginPath();c.ellipse(450,ty,300*u+40,60*u+10,0,0,TAU);c.stroke();c.restore();}
 // ân điển
 if(sec>=LH.gifts){const rows=[['Luân Hồi tâm pháp','tu luyện +'+Math.round(Math.min(LUAN_HOI.handQiMax,n*LUAN_HOI.handQiPer)*100)+'%'],['Luân Hồi Ấn','đánh như '+REALM_NAMES[Math.floor((Number(e.fromRealm)||28)*LUAN_HOI.keepRealm)]],['Ký ức tiền kiếp','cảnh giới cũ chỉ cần '+Math.round(LUAN_HOI.pastLifeCost*100)+'% tu vi'],['Đạo Quả','+1 điểm · gõ daoqua']];
  const y0=H*.77;rows.forEach(([a,b],i)=>{const u=seg(sec,LH.gifts+i*.45,LH.gifts+i*.45+.4),al=out3(u)*(1-seg(sec,LH.end-.8,LH.end-.2));if(al<=0)return;const y=y0+i*42,dx=(1-out3(u))*40;
   c.globalAlpha=al;stx(c,'✦ '+a,438-dx,y,27,P.soft,{width:6,weight:'800',align:'right'});stx(c,b,462+dx,y,27,'#ffffff',{width:6,weight:'700',align:'left',max:420});});c.globalAlpha=1;}

 // khung điện ảnh
 drawVignette(c,H,.75,450,H*.5);
 drawLetterbox(c,H,seg(sec,0,1.2)*(1-seg(sec,LH.end-1,LH.end)),.075);
 if(sec>=LH.impact&&sec<LH.impact+.32)drawImpactFrame(c,H,cx,feet,seg(sec,LH.impact,LH.impact+.32),P,seed);
 // lóe trắng + màn tối im lặng
 const flash=sec>=LH.flash?Math.max(0,1-(sec-LH.flash)/.5)*.9:0;if(flash>0){c.fillStyle='#fff1d2';c.globalAlpha=flash;c.fillRect(-60,-60,1020,H+120);c.globalAlpha=1;}
 const dark=seg(sec,LH.dark,LH.silence)*(1-seg(sec,LH.silence+.55,LH.slam));if(dark>0){c.fillStyle='#000';c.globalAlpha=dark*.85;c.fillRect(-60,-60,1020,H+120);c.globalAlpha=1;}
}
/** QA: vẽ đúng giây `sec` của màn (không chờ giờ thật). */
export const drawLuanHoiFrame=(scene,c,t,H,cut,sec)=>drawLuanHoi(scene,c,t,H,{x:cut,age:sec*1000,ms:LUAN_HOI_MS,k:.5,sec});
