// 20/11/2026 — THIÊN ĐỊA DỊ TƯỢNG: ai gõ "chuyển sinh" (đang chờ xác nhận; 21/11: 2 phút, gõ lại = xác nhận) → cả sân thấy điềm báo:
// dải giấy dó "THIÊN ĐỊA DỊ TƯỢNG · <tên> sắp Luân Hồi lần N" + nén nhang cháy đếm ngược, trời sẫm mực, dưới chân người đó xoáy mực + vòng son.
// Server: w.luanHoiOmen={pid,name,n,at,until} (engine.mjs, lệnh chuyensinh). Không chạy khi đang chiếu màn Luân Hồi. Chỉ vài nét vẽ / khung.
import {paperBanner,INK,SEAL,PAPER} from './luan-hoi-ink.js?v=20261120b';
const TAU=Math.PI*2;
const nowOf=(scene,t)=>(scene.stateServerNow||Date.now())+Math.min(2000,Math.max(0,t-(scene.stateReceivedAt||t)));
export function omenActive(scene,t){const o=scene.luanHoiOmen;if(!o||scene.luanHoiOn)return null;const now=nowOf(scene,t);if(now<o.at||now>=o.until)return null;return {o,now,left:(o.until-now)/1000,age:(now-o.at)/1000};}

/** Lớp sau lưng: xoáy mực + vòng son dưới chân người sắp chuyển sinh. */
export function drawOmenVortex(scene,c,t){const s=omenActive(scene,t);if(!s)return;const a=(scene.targets||[]).find(x=>x.id===s.o.pid||x.player?.id===s.o.pid);if(!a)return;
 const k=Math.min(1,s.age/1.2),sc=a.scale||1,R=sc*44*(1+.15*Math.sin(t*.004)),fy=a.y+sc*3,rot=t*.0022;
 c.save();c.translate(a.x,fy);c.scale(1,.32);
 for(let i=0;i<5;i++){c.globalAlpha=k*(.5-i*.08);c.strokeStyle=INK;c.lineWidth=sc*(4-i*.5);c.beginPath();c.arc(0,0,R*(1-i*.15),rot*(1+i*.3)+i,rot*(1+i*.3)+i+TAU*.7);c.stroke();}
 c.globalAlpha=k*.85;c.strokeStyle=SEAL;c.lineWidth=sc*2.2;c.setLineDash([sc*10,sc*6]);c.lineDashOffset=-t*.03;c.beginPath();c.arc(0,0,R*1.18,0,TAU);c.stroke();c.setLineDash([]);
 c.restore();
 // vệt mực bốc lên quanh thân
 c.save();for(let i=0;i<8;i++){const u=((t*.0005+i/8)%1),x=a.x+Math.sin(i*2.1+t*.002)*sc*22,y=fy-u*sc*90,r=sc*(5+u*9);const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(14,12,10,.5)');g.addColorStop(1,'rgba(14,12,10,0)');c.globalAlpha=k*(1-u);c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}c.restore();}

/** Lớp trước: trời sẫm mực + dải giấy dó + nén nhang đếm ngược. */
// Lúc dị tượng (≤2 phút): trời đất biến sắc — tạm mờ Thiên Bảng, bảng Tặng quà, lệnh bài 1·8·6 để cuộn giấy không đè lên bảng nào.
let styled=false,on=false;
function hudClass(v){if(typeof document==='undefined'||on===v)return;on=v;
 if(!styled){styled=true;const st=document.createElement('style');st.textContent='body.overlay :is(#liveRanks,#giftBoard,.tm-tokens){transition:opacity .45s}body.overlay.lh-omen :is(#liveRanks,#giftBoard,.tm-tokens){opacity:0!important;pointer-events:none}';document.head?.appendChild(st);}
 document.body?.classList?.toggle('lh-omen',v);}
// 21/11: khung chờ xác nhận dài 2 phút → chỉ 30 s đầu là dị tượng đầy đủ (ẩn bảng); sau đó thu gọn 1 dòng, trả lại Thiên Bảng + bảng Tặng quà.
export const OMEN_FULL_S=30;
export function drawLuanHoiOmen(scene,c,t,H){const s=omenActive(scene,t);hudClass(!!s&&s.age<OMEN_FULL_S);if(!s)return;c.save();if(scene.screenT)c.setTransform(scene.screenT);try{omenHud(c,t,H,s);}finally{c.restore();}}
function omenCompact(c,t,H,s){const {o,left,age}=s,k=Math.min(1,(age-OMEN_FULL_S)/.8)*Math.min(1,left/.4);if(k<=0)return;
 const y=H*.36,line='☸ '+String(o.name||'Đạo hữu').slice(0,18)+' chờ LUÂN HỒI · gõ "CHUYỂN SINH" lần nữa · '+Math.ceil(left)+'s';
 c.save();c.globalAlpha=k*(.85+.15*Math.sin(t*.005));c.font='900 22px "Segoe UI",Arial,sans-serif';c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';c.lineWidth=6;c.strokeStyle=INK;c.strokeText(line,450,y,860);c.fillStyle='#ffe7a8';c.fillText(line,450,y,860);c.restore();}
function omenHud(c,t,H,s){if(s.age>=OMEN_FULL_S)return omenCompact(c,t,H,s);const {o,left,age}=s,k=Math.min(1,age/.8)*Math.min(1,left/.4,(OMEN_FULL_S-age)/.8);
 // trời sẫm (mép trên mực loang xuống)
 c.save();const g=c.createLinearGradient(0,0,0,H*.45);g.addColorStop(0,'rgba(10,9,8,.55)');g.addColorStop(1,'rgba(10,9,8,0)');c.globalAlpha=k;c.fillStyle=g;c.fillRect(-60,-60,1020,H*.45+60);c.restore();
 const y=H*.15;paperBanner(c,'THIÊN ĐỊA DỊ TƯỢNG',String(o.name||'Đạo hữu').slice(0,22)+' sắp LUÂN HỒI lần '+(o.n||1),450,y,40,k,Math.min(1,age/.7),Number(String(o.pid).slice(-4))||5);
 // nén nhang: thân đỏ son ngắn dần, đầu đỏ hồng, khói mực cuộn lên
 const total=Math.max(1,(o.until-o.at)/1000),frac=Math.max(0,left/total),ix=740,base=y+64,L=120*frac+6;
 c.save();c.globalAlpha=k;c.fillStyle='#3a2a1c';c.fillRect(ix-14,base,28,10);c.fillStyle=SEAL;c.fillRect(ix-2,base-L,4,L);
 c.fillStyle='#ff6a3a';c.beginPath();c.arc(ix,base-L,3.2+Math.sin(t*.02),0,TAU);c.fill();
 for(let i=0;i<6;i++){const u=((t*.0006+i/6)%1),sx=ix+Math.sin(u*8+i)*10*u,sy=base-L-u*70,r=4+u*10,sg=c.createRadialGradient(sx,sy,0,sx,sy,r);sg.addColorStop(0,'rgba(220,214,200,.45)');sg.addColorStop(1,'rgba(220,214,200,0)');c.globalAlpha=k*(1-u);c.fillStyle=sg;c.fillRect(sx-r,sy-r,r*2,r*2);}
 c.globalAlpha=k;c.font='900 22px "Segoe UI",Arial,sans-serif';c.textAlign='center';c.textBaseline='middle';c.lineWidth=5;c.strokeStyle=INK;const sec=String(Math.ceil(left))+'s';c.strokeText(sec,ix,base+26);c.fillStyle=PAPER;c.fillText(sec,ix,base+26);
 // 21/11: nhắc cách xác nhận — trước đó người chơi gõ "chuyển sinh" mãi mà không biết phải gõ lại
 const hint='GÕ "CHUYỂN SINH" LẦN NỮA ĐỂ BẮT ĐẦU';c.font='900 26px "Segoe UI",Arial,sans-serif';c.lineWidth=6;c.globalAlpha=k*(.82+.18*Math.sin(t*.006));c.strokeText(hint,450,base+64);c.fillStyle='#ffe7a8';c.fillText(hint,450,base+64);
 c.restore();}
