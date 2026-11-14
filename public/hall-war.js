import {drawGiftDonor,donorPortrait} from './gift-donor.js';
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x));
const MARKS=['功','寶','丹','山','藥'],SKILLS=['THIÊN CÔNG KIẾM TRẬN','VẠN BẢO TỀ XUẤT','TỬ LIÊN ĐAN HỎA','THIÊN SƠN TRẤN ẤN','THẦN MỘC LINH TRIỀU'];
const CAMPS=[[165,.345],[735,.345],[155,.53],[745,.53],[450,.655]];
const nowAt=(scene,t)=>(scene.stateServerNow||Date.now())+Math.min(2000,Math.max(0,t-(scene.stateReceivedAt||t)));
export function syncHallWar(scene,state){
 const next=state.hallWar||null;if(scene.hallWarStatus?.id!==next?.id){scene.hallWarHeard=new Set();scene.hallWarLastBeat=-1;}
 scene.hallWarStatus=next;document.body.classList.toggle('hall-war',!!next?.active);document.body.classList.toggle('hall-war-podium',!!next?.active&&next.phase==='finished');
 if(next?.active)for(const p of next.members||[])donorPortrait(p.avatar);
}
export function hallWarPlaces(event,H,now=event.battleStartedAt||event.startedAt||0){
 const places=new Map(),rotation=Math.floor(Math.max(0,now-(event.battleStartedAt||event.startedAt||now))/8000);
 for(const team of event.teams||[]){
  const members=(event.members||[]).filter(p=>p.index===team.index).sort((a,b)=>b.score-a.score||a.joinedAt-b.joinedAt||a.id.localeCompare(b.id));
  // The leading contributor stays visible; every other participant rotates through the two side slots.
  const others=members.slice(1),offset=others.length?rotation*2%others.length:0;
  const shown=[members[0],...Array.from({length:Math.min(2,others.length)},(_,i)=>others[(offset+i)%others.length])].filter(Boolean),[cx,cy]=CAMPS[team.index];
  shown.forEach((p,i)=>places.set(p.id,{...p,x:cx+(i-(shown.length-1)/2)*84,y:H*cy+14,color:team.color}));
 }
 return places;
}
function text(c,s,x,y,size,color='#fff',width=850){c.font='800 '+size+'px "Segoe UI",Arial,sans-serif';c.fillStyle=color;c.lineWidth=4;c.strokeStyle='#07111c';c.textAlign='center';c.textBaseline='middle';c.strokeText(s,x,y,width);c.fillText(s,x,y,width);}
function box(c,x,y,w,h,color,fill='#061625e8',r=10){c.fillStyle=fill;c.strokeStyle=color;c.lineWidth=1.5;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();c.stroke();}
function sigil(c,x,y,r,color,mark,angle=0){
 c.save();c.translate(x,y);c.rotate(angle);c.strokeStyle=color;c.lineWidth=1.5;
 c.beginPath();c.arc(0,0,r,0,TAU);c.stroke();c.beginPath();c.arc(0,0,r*.77,.1,5.2);c.stroke();
 for(let i=0;i<8;i++){const a=i*TAU/8;c.beginPath();c.moveTo(Math.cos(a)*r*.85,Math.sin(a)*r*.85);c.lineTo(Math.cos(a)*r*1.09,Math.sin(a)*r*1.09);c.stroke();}
 c.rotate(-angle);if(mark)text(c,mark,0,0,r*.9,color);c.restore();
}
function shard(c,index,x,y,r,angle,color){
 c.save();c.translate(x,y);c.rotate(angle);c.fillStyle=color;c.strokeStyle='#fff6d5';c.lineWidth=1;c.beginPath();
 if(index===0){c.moveTo(0,-r*1.6);c.lineTo(r*.22,r*.7);c.lineTo(0,r);c.lineTo(-r*.22,r*.7);c.closePath();c.fill();c.stroke();}
 else if(index===1){c.moveTo(0,-r);c.lineTo(r*.65,0);c.lineTo(0,r);c.lineTo(-r*.65,0);c.closePath();c.fill();c.stroke();}
 else if(index===2){for(let i=0;i<5;i++){c.save();c.rotate(i*TAU/5);c.beginPath();c.ellipse(0,-r*.45,r*.25,r*.65,0,0,TAU);c.fill();c.restore();}}
 else if(index===3){c.fillRect(-r*.6,-r*.7,r*1.2,r*1.4);c.strokeRect(-r*.45,-r*.5,r*.9,r);}
 else{c.moveTo(0,-r);c.quadraticCurveTo(r,0,0,r);c.quadraticCurveTo(-r*.6,0,0,-r);c.fill();c.beginPath();c.moveTo(0,-r*.7);c.lineTo(0,r*.7);c.stroke();}
 c.restore();
}
function spell(c,from,to,fx,k,light,motion){
 const big=fx.ultimate,color=from.color,wind=clamp(k/.22),flight=clamp((k-.15)/.5),hit=clamp((k-.6)/.4),lift=big?110:50;
 c.save();c.globalAlpha=Math.min(1,k/.07,(1-k)/.13);c.lineCap='round';
 if(k<.32){sigil(c,from.x,from.y,20+wind*(big?34:13),color,'',k*4);for(let i=0;i<(big?5:3);i++)shard(c,fx.index,from.x+(i-1)*(big?14:9),from.y-30-wind*20,7,k+i*.3,color);}
 if(k>.15&&k<.78){
  const x=from.x+(to.x-from.x)*flight,y=from.y+(to.y-from.y)*flight-Math.sin(flight*Math.PI)*lift;
  c.strokeStyle=color;c.lineWidth=big?8:3;c.beginPath();c.moveTo(from.x,from.y);c.quadraticCurveTo((from.x+x)/2,Math.min(from.y,y)-30,x,y);c.stroke();
  c.strokeStyle='#fff6d5';c.lineWidth=big?2:1;c.stroke();
  const angle=Math.atan2(to.y-from.y,to.x-from.x)+Math.PI/2;
  shard(c,fx.index,x,y,big?22:12,angle,color);
  if(big&&!light)for(let i=0;i<4;i++)shard(c,fx.index,x+(i%2?1:-1)*(15+i*7),y+12+i*6,9,angle,color);
 }
 if(k>.6){
  c.globalAlpha*=1-hit;sigil(c,to.x,to.y,16+hit*(big?90:42),color,big?MARKS[fx.index]:'',hit);
  const n=light?6:big?14:8;
  for(let i=0;i<n;i++){const a=i*2.399+fx.index,d=hit*(big?100:52);shard(c,fx.index,to.x+Math.cos(a)*d,to.y+Math.sin(a)*d*.65,Math.max(1,(big?10:6)*(1-hit)),a+hit,color);}
  text(c,fx.knockout?'PHÁ TRẬN':'−'+fx.damage,to.x,to.y-38-hit*35,fx.knockout?24:big?27:21,fx.knockout?'#ffe29d':'#fff3cd',190);
 }
 if(big&&k<.5)text(c,SKILLS[fx.index],from.x,from.y-35,14,color,160);
 c.restore();
}
function podium(c,e,H){
 box(c,55,H*.305,790,H*.375,'#dec987','#061222f5',18);
 text(c,e.results?.length?'VINH DANH NGŨ ĐƯỜNG':'CHƯA CÓ CHIẾN CÔNG',450,H*.34,31,'#ffe5a8');
 const order=[1,0,2],positions=[{x:180,y:.455},{x:450,y:.42},{x:720,y:.455}];
 for(let slot=0;slot<3;slot++){
  const rank=order[slot],team=e.results?.[rank];if(!team)continue;const pos=positions[slot],x=pos.x,y=H*pos.y;
  box(c,x-108,y-42,216,rank===0?210:190,team.color,rank===0?'#604518a0':'#142840c9');
  sigil(c,x,y-12,rank===0?42:30,team.color,MARKS[team.index]);
  text(c,'HẠNG '+(rank+1),x,y+42,19,'#fff0bb');text(c,team.name.replace(' Đường',''),x,y+70,21,team.color,200);
  text(c,Math.round(team.score).toLocaleString('vi-VN')+' chiến công',x,y+99,16,'#fff',200);
  text(c,'+'+[80,50,30][rank]+' điểm tuần',x,y+124,16,'#e2f6ed',200);
 }
 if(e.results?.length&&e.mvp?.[0]?.score>0){const m=e.mvp[0];text(c,'CHIẾN THẦN · '+m.name+' · '+m.score+' công',450,H*.615,21,'#ffe7a8',730);}
 text(c,e.rewardCount?e.rewardCount+' đồng môn đã nhận quà · kết quả lưu vào bảng tuần':'Không phát thưởng khi chưa có đóng góp',450,H*.66,18,'#c9e6e6',740);
}
export function drawHallWar(scene,c,t,H){
 const e=scene.hallWarStatus;if(!e?.active)return;
 c.setTransform(scene.canvas.width/900,0,0,scene.canvas.height/H,0,0);
 if(scene.background)c.drawImage(scene.background,0,0,900,H);else{c.fillStyle='#091a2e';c.fillRect(0,0,900,H);}
 const shade=c.createLinearGradient(0,0,0,H);shade.addColorStop(0,'#041326e6');shade.addColorStop(.6,'#07162b6b');shade.addColorStop(1,'#061126d9');c.fillStyle=shade;c.fillRect(0,0,900,H);
 const now=nowAt(scene,t),light=scene.budget?.level==='light',moving=scene.motion!==false,done=e.phase==='finished',registration=e.phase==='registration',end=registration?e.registrationEndsAt:done?e.podiumUntil:e.endsAt,remaining=Math.max(0,Math.ceil((end-now)/1000));
 text(c,'NGŨ ĐƯỜNG TRANH PHONG',450,H*.042,33,'#ffe3a0');
 text(c,(registration?'TẬP HỢP ĐỒNG MÔN':done?'LỄ VINH DANH':'NGŨ HÀNH GIAO CHIẾN')+' · '+Math.floor(remaining/60)+':'+String(remaining%60).padStart(2,'0'),450,H*.074,20,'#d7f5ff');
 const ranked=[...(e.teams||[])].sort((a,b)=>b.score-a.score||b.kills-a.kills||a.index-b.index),leader=ranked[0]?.score>0?ranked[0].index:-1;
 for(const team of e.teams||[]){
  const x=10+team.index*180,count=(e.members||[]).filter(p=>p.index===team.index).length;
  box(c,x,H*.103,160,92,team.index===leader?'#ffe2a0':team.color,team.index===leader?'#51401de8':'#061625e8');
  text(c,team.name.replace(' Đường',''),x+80,H*.103+18,18,team.color,149);
  text(c,Math.round(team.score).toLocaleString('vi-VN'),x+80,H*.103+46,27,'#ffffff');text(c,count+' người · '+team.kills+' hạ trận',x+80,H*.103+74,14,'#d3e7ed',149);
 }
 const elapsed=registration?clamp((now-e.startedAt)/30000):clamp((now-e.battleStartedAt)/120000);
 c.fillStyle='#fff2';c.fillRect(110,H*.177,680,4);c.fillStyle=done?'#ffda83':'#8edbd1';c.fillRect(110,H*.177,680*(1-elapsed),4);
 // Five colored gates surround one arena; backgrounds remain cached, no blur filters.
 const center={x:450,y:H*.47};
 c.save();c.translate(center.x,center.y);c.scale(1,.65);c.rotate(moving?t*.00008:0);sigil(c,0,0,170,'#bfe0ff42','',0);
 for(let i=0;i<5;i++){const a=i*TAU/5-Math.PI/2,b=a+TAU*2/5;c.strokeStyle=e.teams[i]?.color+'55';c.beginPath();c.moveTo(Math.cos(a)*160,Math.sin(a)*160);c.lineTo(Math.cos(b)*160,Math.sin(b)*160);c.stroke();}c.restore();
 const places=hallWarPlaces(e,H,now);
 if(!done)for(const team of e.teams||[]){
  const [cx,cy]=CAMPS[team.index],members=(e.members||[]).filter(p=>p.index===team.index),active=members.filter(p=>p.hp>0).length;
  c.save();c.globalAlpha=members.length?1:.45;
  c.strokeStyle=team.color+'60';c.lineWidth=2;c.beginPath();c.ellipse(cx,H*cy+80,135,34,0,0,TAU);c.stroke();
  box(c,cx-124,H*cy-60,248,32,team.color,'#071725dd',8);text(c,team.name,cx,H*cy-44,19,team.color,230);
  if(!members.length)text(c,'Chờ đồng môn tập hợp',cx,H*cy+22,16,'#d5e3e9',230);
  for(const p of places.values())if(p.index===team.index){
   c.save();if(p.hp<=0)c.globalAlpha*=.42;
   const words=p.name.trim().split(/\s+/),nickname=words.length>1?Array.from(words[0])[0]+'·'+words.slice(-2).join(' '):p.name;
   drawGiftDonor(c,{...p,name:nickname},p.x,p.y,{color:p.color,radius:25,width:82,nameSize:14});
   c.fillStyle='#07121f';c.fillRect(p.x-35,p.y+52,70,5);c.fillStyle=p.color;c.fillRect(p.x-35,p.y+52,70*clamp(p.hp/100),5);
   const wait=Math.max(1,Math.ceil(((p.respawnAt||now)-now)/1000));text(c,p.hp<=0?'Hồi '+wait+'s':Math.round(p.score)+' công',p.x,p.y+69,13,p.hp<=0?'#cfd8e2':p.color,84);
   if(p.shieldUntil>now)sigil(c,p.x,p.y,32,'#efffce','',moving?t*.001:0);c.restore();
  }
  text(c,members.length>3?active+' / '+members.length+' đang giao chiến · luân phiên hiện tên':registration?'Gõ 6 để tập hợp cùng Đường':active+' / '+members.length+' đang giao chiến',cx,H*cy+112,13,'#d5e3e9',270);c.restore();
 }
 if(!done)for(const fx of (e.fx||[]).slice(-(light?6:12))){
  const from=places.get(fx.from)||(()=>{const p=e.members.find(p=>p.id===fx.from);return p?{x:CAMPS[p.index][0],y:H*CAMPS[p.index][1],color:e.teams[p.index].color}:null;})(),to=places.get(fx.to)||(()=>{const p=e.members.find(p=>p.id===fx.to);return p?{x:CAMPS[p.index][0],y:H*CAMPS[p.index][1]}:null;})();
  if(!from||!to)continue;const k=(now-fx.at)/(fx.ultimate?1750:1100);if(k<0||k>1)continue;
  if(!scene.hallWarHeard?.has(fx.id)&&k<.4){scene.hallWarHeard??=new Set();scene.hallWarHeard.add(fx.id);if(scene.hallWarHeard.size>80)scene.hallWarHeard.delete(scene.hallWarHeard.values().next().value);if(t-(scene.hallWarLastSound||0)>220){scene.onCombatSound?.(fx.ultimate?'impact':'cast',['sword','bell','flame','thunder','lotus'][fx.index]);scene.hallWarLastSound=t;}}
  spell(c,from,to,fx,moving?k:.72,light,moving);
 }
 if(registration){box(c,270,H*.465,360,108,'#e8cf91','#071725ed');text(c,'TRẬN PHÁP ĐANG HỘI TỤ',450,H*.465+25,21,'#ffe6a0',340);text(c,'Gõ 6 / đường chiến',450,H*.465+55,25,'#fff');text(c,'Tự vào đúng Đường đã gia nhập',450,H*.465+84,16,'#d3eced',340);}
 if(done)podium(c,e,H);
 const guideY=H*.79;box(c,145,guideY-29,610,78,'#b9d7c9','#071725f2');
 text(c,done?'TRẬN ĐÃ KHÉP · KẾT QUẢ ĐÃ LƯU':registration?'Gõ 6 để tập hợp · trận dài 2 phút':'Gõ 6 / đánh · liên chiêu hồi 3,5 giây',450,guideY-7,20,'#ffffff',585);
 text(c,done?'Top 3 Đường nhận điểm tuần · quà theo đóng góp':'Quà trợ lực đúng Đường · phá trận hồi sau 5 giây',450,guideY+21,16,'#ffe6a0',585);
 return done?0:places.size;
}
