// 05/11/2026: cảnh PHONG ẤN khi yêu thú bị hạ (3,6 s) — thay cho việc yêu thú biến mất tức thì.
// Kịch bản: trận ấn vàng mở quanh yêu thú → xích phù quấn lại, yêu thú mờ dần ánh vàng → thu nhỏ xoáy vào tâm
// → hóa một viên Phong Yêu Ấn sáng lóe → ấn bay về người đứng đầu công lực; chữ "YÊU THÚ ĐÃ BỊ PHONG ẤN".
// Không có máu/xác: yêu thú được phong ấn, không bị giết. Chỉ là hình ảnh; phần thưởng đã trao ở server.
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);},out=x=>1-(1-clamp(x))**3;
export const SEAL_MS=3600;
// Từ state: còn trong thời gian phong ấn và chưa có yêu thú mới → trả về "yêu thú đang bị phong ấn" để giữ màn đấu.
export function sealingBoss(state){
 const s=state?.bossSeal;if(!s||state.boss)return null;const now=state.serverNow||Date.now();if(now<s.at||now>=s.at+SEAL_MS)return null;
 return {id:s.id,species:s.species,name:s.name,startedAt:s.startedAt,hp:0,maxHp:1,sealing:true,seal:s,clockOffset:now-Date.now()};
}
export function sealProgress(boss){return boss?.sealing?clamp((Date.now()+(boss.clockOffset||0)-boss.seal.at)/SEAL_MS):1;}
function sealGlyph(c,r,a){
 // Viên ấn vuông bo góc, viền kép, chữ triện "封" vẽ bằng nét (không phụ thuộc font).
 c.save();c.globalAlpha=a;const g=c.createLinearGradient(-r,-r,r,r);g.addColorStop(0,'#fff3c8');g.addColorStop(.5,'#f0c25a');g.addColorStop(1,'#b8862e');c.fillStyle=g;
 c.beginPath();c.roundRect?c.roundRect(-r,-r,r*2,r*2,r*.22):c.rect(-r,-r,r*2,r*2);c.fill();c.strokeStyle='#7a4f14';c.lineWidth=r*.08;c.stroke();
 c.strokeStyle='#7a4f14';c.lineWidth=r*.04;c.strokeRect(-r*.78,-r*.78,r*1.56,r*1.56);
 c.lineWidth=r*.11;c.lineCap='round';const L=(x1,y1,x2,y2)=>{c.beginPath();c.moveTo(x1*r,y1*r);c.lineTo(x2*r,y2*r);c.stroke();};
 L(-.55,-.45,-.05,-.45);L(-.3,-.62,-.3,.55);L(-.55,.05,-.05,.05);L(-.55,.5,-.05,.5);L(.15,-.35,.6,-.35);L(.42,-.62,.42,.45);L(.42,.45,.28,.58);L(.2,-.05,.3,.08);
 c.restore();
}
export function drawBossSeal(scene,c,boss,H,bx,by,drawSprite){
 const k=sealProgress(boss),s=boss.seal,cx=bx,cy=by;if(k>=1)return;
 const open=out(k/.22),bind=ease((k-.12)/.25),shrink=ease((k-.35)/.3),flash=k>.62&&k<.8?Math.sin((k-.62)/.18*Math.PI):0,fly=ease((k-.78)/.2),fade=1-ease((k-.93)/.07);
 // 1. Yêu thú: thu nhỏ + xoáy về tâm, mờ dần trong ánh vàng.
 if(shrink<1){const sc=1-shrink*.9;c.save();c.globalAlpha=(1-shrink)*(1-bind*.35);c.translate(cx,cy);c.rotate(shrink*shrink*1.6);c.scale(sc,sc);c.translate(-cx,-cy);drawSprite();c.restore();
  if(bind>0){c.save();c.globalCompositeOperation='lighter';const g=c.createRadialGradient(cx,cy,10,cx,cy,260*(1-shrink*.8));g.addColorStop(0,'#fff1c4'+Math.round(bind*150).toString(16).padStart(2,'0'));g.addColorStop(1,'#f0c25a00');c.fillStyle=g;c.fillRect(cx-280,cy-280,560,560);c.restore();}}
 c.save();c.globalCompositeOperation='lighter';
 // 2. Trận ấn vàng: hai vòng phù văn quay ngược chiều, thu lại khi yêu thú thu nhỏ.
 const R=(250-shrink*170)*open;if(R>4&&fly<1){c.globalAlpha=fade*(1-fly)*.85;c.strokeStyle='#ffd978';c.lineWidth=3;c.beginPath();c.ellipse(cx,cy,R,R*.9,0,0,TAU);c.stroke();
  c.lineWidth=1.5;c.setLineDash([12,8]);c.beginPath();c.ellipse(cx,cy,R*.82,R*.74,k*4,0,TAU);c.stroke();c.setLineDash([]);
  for(let i=0;i<12;i++){const a=i*TAU/12+k*3,px=cx+Math.cos(a)*R*1.06,py=cy+Math.sin(a)*R*.96;c.save();c.translate(px,py);c.rotate(a+Math.PI/2);c.fillStyle='#ffe9a8';c.fillRect(-7,-2,14,4);c.fillRect(-2,-7,4,14);c.restore();}
  // 3. Xích phù: tám dải từ vòng trận quấn vào tâm.
  if(bind>0){c.lineWidth=4;for(let i=0;i<8;i++){const a=i*TAU/8+.2,len=bind;c.strokeStyle=i%2?'#ffd978':'#fff3c8';c.globalAlpha=fade*(1-fly)*.8;c.beginPath();const x0=cx+Math.cos(a)*R,y0=cy+Math.sin(a)*R*.9;c.moveTo(x0,y0);
   for(let q=1;q<=10;q++){const u=q/10*len,rr=R*(1-u),aa=a+u*1.2;c.lineTo(cx+Math.cos(aa)*rr+Math.sin(q*1.7)*6,cy+Math.sin(aa)*rr*.9);}c.stroke();}}}
 // 4. Lóe sáng khi hóa ấn.
 if(flash>0){c.globalAlpha=flash*.9;const g=c.createRadialGradient(cx,cy,0,cx,cy,220);g.addColorStop(0,'#ffffff');g.addColorStop(.3,'#ffe9a8aa');g.addColorStop(1,'#f0c25a00');c.fillStyle=g;c.fillRect(cx-220,cy-220,440,440);
  c.lineWidth=2;c.strokeStyle='#fff3c8';for(let i=0;i<16;i++){const a=i*TAU/16;c.globalAlpha=flash*.7;c.beginPath();c.moveTo(cx+Math.cos(a)*40,cy+Math.sin(a)*40);c.lineTo(cx+Math.cos(a)*(120+flash*120),cy+Math.sin(a)*(120+flash*120));c.stroke();}}
 c.restore();
 // 5. Viên Phong Yêu Ấn: hiện ở tâm rồi bay về người đứng đầu (nếu đang trên sân), hoặc bay lên.
 if(k>.6){const target=scene.targets?.find(t=>t.id===s.winnerId),tx=target?target.x:cx,ty=target?target.y-160:cy-260,px=cx+(tx-cx)*fly,py=cy+(ty-cy)*fly-Math.sin(fly*Math.PI)*120,r=46*(1-fly*.45);
  c.save();c.translate(px,py);c.rotate(Math.sin(k*20)*.08*(1-fly));sealGlyph(c,r,ease((k-.6)/.06)*fade);c.restore();}
 // 6. Chữ tuyên cáo.
 const ta=ease((k-.55)/.08)*fade;if(ta>0){c.save();c.textAlign='center';c.globalAlpha=ta;c.font='bold 46px Arial';c.lineWidth=7;c.strokeStyle='#2a1a08';const y=H*.40;
  c.strokeText('YÊU THÚ ĐÃ BỊ PHONG ẤN',450,y,820);c.fillStyle='#ffe2a0';c.fillText('YÊU THÚ ĐÃ BỊ PHONG ẤN',450,y,820);
  c.font='bold 28px Arial';const sub=(s.name||'Yêu thú')+(s.winnerName?' · Đệ nhất hàng yêu: '+s.winnerName:'');c.lineWidth=5;c.strokeText(sub,450,y+44,820);c.fillStyle='#fff6dc';c.fillText(sub,450,y+44,820);c.restore();}
}
