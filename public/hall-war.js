import {drawGiftDonor,donorPortrait} from './gift-donor.js';
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x));
export function syncHallWar(scene,state){
 scene.hallWarStatus=state.hallWar||null;
 document.body.classList.toggle('hall-war',!!scene.hallWarStatus?.active);
 if(scene.hallWarStatus?.active)for(const p of scene.hallWarStatus.members||[])donorPortrait(p.avatar);
}
export function hallWarPlaces(event,H){
 const places=new Map();
 for(const team of event.teams||[]){
  const members=(event.members||[]).filter(p=>p.index===team.index).sort((a,b)=>a.joinedAt-b.joinedAt||a.id.localeCompare(b.id));
  for(const [i,p] of members.slice(0,6).entries())places.set(p.id,{...p,x:90+team.index*180+(i%2?19:-19),y:H*(.30+i*.058),color:team.color});
 }
 return places;
}
function text(c,s,x,y,size,color='#fff',width){c.font='800 '+size+'px "Segoe UI",Arial,sans-serif';c.fillStyle=color;c.lineWidth=4;c.strokeStyle='#07111c';c.textAlign='center';c.textBaseline='middle';c.strokeText(s,x,y,width);c.fillText(s,x,y,width);}
export function drawHallWar(scene,c,t,H){
 const e=scene.hallWarStatus;if(!e?.active)return;
 c.setTransform(scene.canvas.width/900,0,0,scene.canvas.height/H,0,0);
 if(scene.background)c.drawImage(scene.background,0,0,900,H);else{c.fillStyle='#091a2e';c.fillRect(0,0,900,H);}
 const shade=c.createLinearGradient(0,0,0,H);shade.addColorStop(0,'#041326e8');shade.addColorStop(.6,'#07162b80');shade.addColorStop(1,'#061126c0');c.fillStyle=shade;c.fillRect(0,0,900,H);
 const now=(scene.stateServerNow||Date.now())+Math.min(2000,t-(scene.stateReceivedAt||t)),remaining=Math.max(0,Math.ceil(((e.phase==='registration'?e.registrationEndsAt:e.phase==='finished'?e.podiumUntil:e.endsAt)-now)/1000));
 text(c,'NGŨ ĐƯỜNG TRANH PHONG',450,H*.055,34,'#ffe3a0');
 text(c,(e.phase==='registration'?'TẬP HỢP':e.phase==='finished'?'KẾT QUẢ':'GIAO CHIẾN')+' · '+Math.floor(remaining/60)+':'+String(remaining%60).padStart(2,'0'),450,H*.09,23,'#d7f5ff');
 for(const team of e.teams||[]){
  const x=10+team.index*180,count=(e.members||[]).filter(p=>p.index===team.index).length;
  c.fillStyle='#061625ed';c.strokeStyle=team.color;c.lineWidth=2;c.beginPath();c.roundRect(x,H*.12,160,92,10);c.fill();c.stroke();
  text(c,team.name.replace(' Đường',''),x+80,H*.12+20,18,team.color,148);
  text(c,Math.round(team.score).toLocaleString('vi-VN'),x+80,H*.12+49,27,'#ffffff');text(c,count+' đồng môn',x+80,H*.12+76,15,'#d3e7ed');
 }
 const places=hallWarPlaces(e,H),light=scene.budget?.level==='light',moving=scene.motion!==false;
 // A restrained rotating arena seal below the combat, no full-screen flashes.
 c.save();c.translate(450,H*.50);c.scale(1,.42);c.rotate(moving?t*.00012:0);c.strokeStyle='#aecfff45';c.lineWidth=3;
 for(let i=0;i<3;i++){c.beginPath();c.arc(0,0,170+i*28,0,TAU);c.stroke();}c.restore();
 for(const p of places.values()){
  c.save();if(p.hp<=0)c.globalAlpha=.38;
  drawGiftDonor(c,p,p.x,p.y,{color:p.color,radius:25,width:136});
  c.fillStyle='#07121f';c.fillRect(p.x-52,p.y+58,104,5);c.fillStyle=p.color;c.fillRect(p.x-52,p.y+58,104*clamp(p.hp/100),5);
  text(c,p.hp<=0?'Hồi trận':Math.round(p.score)+' chiến công',p.x,p.y+75,14,p.hp<=0?'#cfd8e2':p.color,140);c.restore();
 }
 if(moving)for(const fx of (e.fx||[]).slice(-(light?7:15))){
  const from=places.get(fx.from),to=places.get(fx.to);if(!from||!to)continue;
  const age=now-fx.at,k=age/(fx.ultimate?1800:1150);if(k<0||k>1)continue;
  const u=clamp(k/.65),xx=from.x+(to.x-from.x)*u,yy=from.y+(to.y-from.y)*u-Math.sin(u*Math.PI)*(fx.ultimate?85:35),color=from.color;
  c.save();c.globalAlpha=Math.sin(k*Math.PI);c.lineCap='round';c.strokeStyle=color;c.lineWidth=fx.ultimate?7:3;
  c.beginPath();c.moveTo(from.x,from.y);c.quadraticCurveTo((from.x+xx)/2,Math.min(from.y,yy)-40,xx,yy);c.stroke();
  c.strokeStyle='#fff5d8';c.lineWidth=1.5;c.stroke();
  if(fx.ultimate){for(let i=0;i<3;i++){c.beginPath();c.arc(xx,yy,14+i*9,k*TAU+i,k*TAU+i+Math.PI*1.3);c.stroke();}}
  if(k>.55){const hit=(k-.55)/.45;c.strokeStyle=color;c.lineWidth=3;c.beginPath();c.ellipse(to.x,to.y,15+hit*(fx.ultimate?90:48),12+hit*42,0,0,TAU);c.stroke();text(c,'−'+fx.damage,to.x,to.y-35-hit*42,fx.ultimate?27:20,'#ffe39a');}
  c.restore();
 }
 if(e.phase==='finished'){
  c.fillStyle='#04101de8';c.fillRect(60,H*.29,780,H*.36);
  text(c,'VINH DANH NGŨ ĐƯỜNG',450,H*.33,31,'#ffe39b');
  for(const [i,team] of (e.results||[]).slice(0,3).entries()){
   const y=H*.39+i*H*.065;text(c,'HẠNG '+(i+1)+' · '+team.name,450,y,25,team.color,740);
   text(c,Math.round(team.score).toLocaleString('vi-VN')+' chiến công · +'+[80,50,30][i]+' điểm tuần',450,y+30,19,'#fff4d1');
  }
  text(c,'Quà đã trao · kết quả lưu trong lịch sử Đường',450,H*.62,19,'#d9ffdf',730);
 }
 const guideY=H*.735;c.fillStyle='#071725f2';c.strokeStyle='#b9d7c9';c.lineWidth=1;c.beginPath();c.roundRect(130,guideY-34,640,90,10);c.fill();c.stroke();
 text(c,'Gõ 6 / đường chiến · Gõ đánh để tung liên chiêu',450,guideY-8,21,'#ffffff',610);
 text(c,'Quà trợ lực đúng Đường · hồi trận sau 5 giây',450,guideY+24,19,'#ffe6a0',610);
}
