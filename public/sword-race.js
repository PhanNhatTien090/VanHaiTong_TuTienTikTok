import {drawRaceSword,raceSwordFor} from './race-sword-skins.js';
import {drawPrestigeSword,swordPrestige} from './sword-prestige.js';
// v62: đua phi kiếm "máy quay bám người dẫn đầu" — nền mây + vạch tốc độ trôi xuống liên tục, mốc trượng và cổng đích trôi theo
// quãng đường THẬT của người dẫn đầu; mỗi người xếp theo khoảng cách tới người dẫn đầu (phóng đại) nên thấy rõ vượt mặt.
// Bứt tốc (gõ danh / tangtoc / tặng quà): lao vọt lên, đuôi kiếm dài vàng, nón xung kích, chớp + chữ "BỨT TỐC".
const TAU=Math.PI*2,clamp=v=>Math.max(0,Math.min(1,v));
const rnd=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};
const hexA=a=>Math.round(255*clamp(a)).toString(16).padStart(2,'0');
const GAP=.0042,TOP=.41,BOTTOM=.86;// GAP: phần chiều cao màn hình cho mỗi đơn vị quãng đường cách người dẫn đầu
function glow(c,x,y,r,color,a){if(r<=1||a<=0)return;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color+hexA(a));g.addColorStop(1,color+'00');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
// v64: bảng tên 2 dòng (tên to + hạng/quãng đường), viền theo màu kiếm của người đó
function raceTag(c,a,line2,{gold=false,color='#d7fbff',accent='#9fe7ff'}={}){const s=Math.min(1.25,a.scale/1.5),y=a.y-175*s,name=Array.from(a.player.name||'Đạo hữu').slice(0,16).join('');
  c.font='800 21px Segoe UI';const w=Math.max(c.measureText(name).width,(c.font='bold 16px Segoe UI',c.measureText(line2).width))+26,x=Math.max(w/2+6,Math.min(894-w/2,a.x));
  c.fillStyle=gold?'#4a2f06ee':'#0a2439ee';c.strokeStyle=gold?'#ffd76a':accent;c.lineWidth=2;c.beginPath();c.roundRect(x-w/2,y-46,w,52,9);c.fill();c.stroke();
  c.textAlign='center';c.font='800 21px Segoe UI';c.lineWidth=4;c.strokeStyle='#020a12';c.strokeText(name,x,y-23);c.fillStyle=gold?'#ffe7a0':'#ffffff';c.fillText(name,x,y-23);
  c.font='bold 16px Segoe UI';c.fillStyle=color;c.fillText(line2,x,y-3);
  c.fillStyle=gold?'#ffd76a':accent;c.beginPath();c.moveTo(x-7,y+6);c.lineTo(x+7,y+6);c.lineTo(a.x,y+15);c.closePath();c.fill();}
const GIFT_MS=2800;
// v85: bảng QUÀ ĐUA — top 3 người tặng nhiều nhất trong lượt + phần thưởng từng hạng
const PRIZE_TXT=['Thương Long +5.000 tu vi','Tinh Hà +3.000 tu vi','Băng Liên +1.500 tu vi','800 tu vi','500 tu vi'];
const fit=(c,t,w)=>{if(c.measureText(t).width<=w)return t;let s=t;while(s.length>2&&c.measureText(s+'…').width>w)s=s.slice(0,-1);return s+'…';};
function drawRaceGiftBoard(c,e,H){const top=e.giftTop||[],w=410,x=900-w-12,y=H*.135,rowH=27,h=59+rowH*5;c.save();
  c.fillStyle='#1d1206e6';c.strokeStyle='#ffd76acc';c.lineWidth=2;c.beginPath();c.roundRect(x,y,w,h,11);c.fill();c.stroke();
  c.textAlign='left';c.font='900 16px Segoe UI';c.fillStyle='#ffe7a0';c.fillText('QUÀ ĐUA · TOP 3 SKIN · TOP 5 TU VI',x+10,y+22);
  for(let i=0;i<5;i++){const t=top[i],ry=y+34+i*rowH+18;c.font='800 15px Segoe UI';c.fillStyle=i===0?'#ffd76a':i===1?'#d9c2ff':'#a9f1e0';
    const left=['①','②','③','④','⑤'][i]+' '+(t?Array.from(t.name||'').slice(0,10).join('')+' '+Number(t.coins).toLocaleString('vi-VN')+'c':'còn trống');c.fillText(fit(c,left,170),x+10,ry);
    c.font='700 14px Segoe UI';c.fillStyle='#f3e2b8';c.textAlign='right';c.fillText('→ '+PRIZE_TXT[i],x+w-10,ry);c.textAlign='left';}
  c.font='600 14px Segoe UI';c.fillStyle='#bcdde9';c.fillText('Xếp theo quà trong lượt · skin giữ vĩnh viễn',x+10,y+h-10);
  c.restore();}
// bảng chú thích bứt tốc (dưới cùng)
function drawBoostLegend(c,H,reg){const y=H*.9,w=820,x=40,h=96;c.save();c.fillStyle='#071a2bd8';c.strokeStyle='#ffd76a90';c.lineWidth=2;c.beginPath();c.roundRect(x,y,w,h,12);c.fill();c.stroke();
  c.textAlign='center';c.font='900 20px Segoe UI';c.fillStyle='#ffe7a0';c.fillText(reg?'⚡ GÕ bay GHI DANH · THẢ TIM ĐỂ BỨT TỐC':'❤ NGỰ PHONG · mỗi 50 tim +18 trượng · không giới hạn lượt',450,y+26);
  c.font='bold 17px Segoe UI';c.fillStyle='#eafcff';c.fillText('danh: +18 trượng, hồi 10s · quà: mỗi coin +30 trượng · đến khi về đích',450,y+50);
  c.fillStyle='#ffe2a0';c.fillText('TOP 3 TẶNG QUÀ: SKIN PHI KIẾM · TOP 5: TU VI',450,y+76);c.restore();}
const serverNow=(scene,t)=>scene.raceServerNow+Math.min(2000,t-scene.raceReceivedAt);
const dist=(r,now)=>Math.min(1000,Math.max(0,(Math.min(now,r.finishAt||now)-r.startedAt)/1000*r.speed+r.bonus));
export function syncRace(scene,state){scene.raceStatus=state.raceStatus;scene.raceStage=state.raceStage||[];scene.raceReceivedAt=performance.now();scene.raceServerNow=state.serverNow;document.body.classList.toggle('sword-race',!!state.raceStatus?.active);}
export function raceTargets(scene,players,H,t){const e=scene.raceStatus,now=serverNow(scene,t),list=players.slice(0,8),n=Math.max(1,list.length);
  const ds=list.map(p=>{const r=e.racers?.find(r=>r.id===p.id);return r?dist(r,now):0;}),lead=Math.max(0,...(e.racers||[]).map(r=>dist(r,now)),...ds);
  scene.raceLead=lead;scene.raceY??=new Map();scene.raceX??=new Map();const dt=Math.max(0,Math.min(100,t-(scene.raceFrameAt??t-16.67))),blend=scene.motion?1-Math.exp(-dt/150):1;scene.raceFrameAt=t;for(const map of [scene.raceY,scene.raceX,scene.raceSeen])if(map)for(const id of map.keys())if(!list.some(p=>p.id===id))map.delete(id);
  return list.map((p,i)=>{const r=e.racers?.find(r=>r.id===p.id)||{},d=ds[i],boost=r.boostUntil>now,kick=r.lastBoostAt&&now-r.lastBoostAt<900?1-(now-r.lastBoostAt)/900:0;
    const lane=i,goalX=Math.max(70,Math.min(830,90+720*(lane%n+.5)/n))+(scene.motion?Math.sin(t*.0013+i)*8:0);
    const oldX=scene.raceX.get(p.id)??goalX,x=oldX+(goalX-oldX)*blend;scene.raceX.set(p.id,x);const reg=e.phase==='registration';if(reg){scene.raceSeen??=new Map();if(!scene.raceSeen.has(p.id))scene.raceSeen.set(p.id,t);}
    const goal=reg?H*(.56+(i%2?.06:0)):H*Math.min(BOTTOM,TOP+(lead-d)*GAP)+(i%2?H*.03:0),prev=scene.raceY.get(p.id)??goal,y=prev+(goal-prev)*blend;scene.raceY.set(p.id,y);
    const arrive=reg?clamp((t-scene.raceSeen.get(p.id))/900):1,gk=r.giftAt?(now-r.giftAt)/GIFT_MS:2,gift=gk>=0&&gk<1&&r.giftTier?{k:gk,tier:Math.min(3,r.giftTier),coins:r.giftCoins||0,boost:r.giftUnits||r.giftTier}:null;
    return {id:p.id,player:p,x,y:y+(scene.motion?Math.sin(t*.003+i)*6:0)-(1-arrive)*H*.25,scale:n>6?1.15:n>4?1.4:1.8,lift:0,progress:d/1000,distance:d,boost,kick,finished:!!r.finishAt,finishAt:r.finishAt,finishAge:r.finishAt?Math.max(0,now-r.finishAt):null,launchAge:e.startedAt?now-e.startedAt:null,baseY:H*.6,arrive,reg,slot:i+1,gift};});}
export function drawRace(scene,c,t,layer){const e=scene.raceStatus;if(!e?.active)return;const H=scene.height,now=serverNow(scene,t),running=e.phase==='running',moving=running&&scene.motion,light=scene.budget?.level==='light';
 const lead=scene.raceLead||0,anyBoost=scene.targets.some(a=>a.boost),speed=moving?(anyBoost?1.7:1):0;
 c.save();
 if(layer==='back'){
  // trời phủ nhẹ màu xanh để vạch tốc độ nổi
  const sky=c.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#0b2a4a55');sky.addColorStop(1,'#0b2a4a00');c.fillStyle=sky;c.fillRect(0,0,900,H);
  // mây lớn trôi xuống (2 lớp thị sai)
  c.globalCompositeOperation='screen';
  for(let i=0;i<(light?6:10);i++){const sp=i%2?.32:.2,y=((rnd(i)*H+t*sp*speed)%(H+400))-200,x=rnd(i+5)*900;glow(c,x,y,120+rnd(i+2)*120,'#e8f6ff',.28+(i%2)*.1);}
  // vạch tốc độ
  c.strokeStyle='#eafcff';c.lineCap='round';
  for(let i=0;i<(light?18:34);i++){const sp=.6+rnd(i)*.9,L=(50+rnd(i+3)*110)*(anyBoost?1.6:1),y=((rnd(i+7)*H+t*sp*speed)%(H+L))-L,x=rnd(i+9)*900;c.globalAlpha=(.3+rnd(i+1)*.45)*(running?1:.4);c.lineWidth=1.5+rnd(i+4)*2.5;c.beginPath();c.moveTo(x,y);c.lineTo(x,y+L);c.stroke();}
  c.globalAlpha=1;c.globalCompositeOperation='source-over';
  // mốc trượng + cổng đích trôi theo quãng đường thật
  const unitPx=H*GAP,step=50;c.font='bold 18px Segoe UI';c.textAlign='left';
  for(let m=Math.ceil((lead-60)/step)*step;m<=Math.min(1000,lead+(H*TOP)/unitPx+step);m+=step){if(m<=0)continue;const y=H*TOP-(m-lead)*unitPx;if(y<-40||y>H+40)continue;
    if(m===1000){glow(c,450,y,320,'#ffd76a',.35);c.strokeStyle='#ffe7a0';c.lineWidth=6;c.beginPath();c.ellipse(450,y,400,46,0,0,TAU);c.stroke();c.lineWidth=2;c.beginPath();c.ellipse(450,y,360,38,0,0,TAU);c.stroke();
      c.fillStyle='#ffe7a0';c.font='bold 30px Segoe UI';c.textAlign='center';c.fillText('⛩ ĐÍCH · TIÊN MÔN',450,y-56);c.font='bold 18px Segoe UI';c.textAlign='left';}
    else{c.strokeStyle=m%250===0?'#fbe6adb0':'#d8f4ff55';c.lineWidth=m%250===0?3:1.5;c.setLineDash([18,14]);c.beginPath();c.moveTo(20,y);c.lineTo(880,y);c.stroke();c.setLineDash([]);
      c.fillStyle=m%250===0?'#fbe6ad':'#d8f4ffb0';c.fillText(m+' trượng',24,y-8);}}
  // A single mount sword per racer; no orbiting relics, halos, gift beasts or shock rings.
  for(const a of scene.targets){const skin=raceSwordFor(a.player);if(skin)drawRaceSword(scene,c,a,t);else{const v=swordPrestige(a.player);drawPrestigeSword(scene,c,v.cell,a.x,a.y+32*(a.scale/1.5),160*(a.scale/1.5),Math.PI/2,v.color);}}
 }else{
  // Small textual feedback keeps gifts readable without covering racers.
  for(const a of scene.targets)if(a.kick>0){c.save();c.font='900 18px Segoe UI';c.textAlign='center';c.fillStyle='#ffe7a0';c.strokeStyle='#09263d';c.lineWidth=4;const text=a.gift?'BỨT TỐC +'+a.gift.boost:'BỨT TỐC';c.strokeText(text,a.x,a.y+75);c.fillText(text,a.x,a.y+75);c.restore();}
  // v63: lúc tuyển — người ghi danh giáng xuống vạch xuất phát + bảng chờ
  if(e.phase==='registration'){
   for(const a of scene.targets){const s=a.scale/1.5;
    if(a.arrive<1){const k=a.arrive;c.save();c.globalCompositeOperation='screen';const g=c.createLinearGradient(0,0,0,a.y);g.addColorStop(0,'#9fe7ff00');g.addColorStop(1,'#bff3ff'+hexA(.7*(1-k)));c.fillStyle=g;c.fillRect(a.x-30*s,0,60*s,a.y+20);glow(c,a.x,a.y-40*s,140*s,'#d8fbff',.8*(1-k));c.restore();
     c.strokeStyle='#e8fbff';c.globalAlpha=1-k;c.lineWidth=3;c.beginPath();c.ellipse(a.x,a.y+20*s,30+k*120,(30+k*120)*.3,0,0,TAU);c.stroke();c.globalAlpha=1;}
    raceTag(c,a,'Làn '+a.slot+' · sẵn sàng',{accent:swordPrestige(a.player).color});}
   const left=Math.max(0,Math.ceil(((e.registrationEndsAt||now)-now)/1000)),total=(e.entries||[]).length;
   c.strokeStyle='#fbe6ad';c.lineWidth=4;c.setLineDash([22,12]);c.beginPath();c.moveTo(30,H*.68);c.lineTo(870,H*.68);c.stroke();c.setLineDash([]);
   c.font='900 30px Segoe UI';c.textAlign='center';c.lineWidth=6;c.strokeStyle='#0a2439';const msg=total?'VẠCH XUẤT PHÁT · còn '+left+' giây':'GÕ bay ĐỂ LÊN ĐƯỜNG ĐUA · '+left+' giây';c.strokeText(msg,450,H*.72);c.fillStyle='#ffe7a0';c.fillText(msg,450,H*.72);
   c.font='bold 18px Segoe UI';c.lineWidth=4;const sub=total+' người đã ghi danh'+' · tất cả cùng đua · máy quay luân phiên';c.strokeText(sub,450,H*.72+30);c.fillStyle='#eafcff';c.fillText(sub,450,H*.72+30);
   drawBoostLegend(c,H,true);drawRaceGiftBoard(c,e,H);c.restore();return;}
  // bảng thứ hạng trên đầu
  const ranks=[...(e.racers||[])].sort((a,b)=>(a.finishAt||Infinity)-(b.finishAt||Infinity)||dist(b,now)-dist(a,now)||a.at-b.at);
  for(const a of scene.targets){const rank=ranks.findIndex(r=>r.id===a.id)+1;
    raceTag(c,a,(rank===1?'👑 Hạng 1':'Hạng '+rank)+' · '+Math.round(a.distance)+' trượng'+(a.finished?' ✓':a.boost?' ⚡':''),{gold:rank===1,color:a.boost?'#ffe2a0':'#d7fbff',accent:swordPrestige(a.player).color});}
  if(e.phase==='finished'){drawRaceGiftBoard(c,e,H);c.save();c.fillStyle='#08243aee';c.strokeStyle='#92e6ff';c.lineWidth=2;c.beginPath();c.roundRect(20,H*.15,340,188,12);c.fill();c.stroke();c.textAlign='left';c.font='900 20px Segoe UI';c.fillStyle='#ffe7a0';c.fillText('BẢNG VỀ ĐÍCH · TOP 5 TU VI',32,H*.15+28);for(let i=0;i<Math.min(5,(e.results||[]).length);i++){c.font='700 17px Segoe UI';c.fillStyle='#effaff';c.fillText((i+1)+'. '+fit(c,e.results[i].name||'Đạo hữu',250),32,H*.15+60+i*26);}c.restore();}
  // vạch tiến độ người dẫn đầu (trên cùng)
  if(running){drawBoostLegend(c,H,false);drawRaceGiftBoard(c,e,H);}
  if(running){const k=clamp(lead/1000);c.fillStyle='#0a2439c0';c.beginPath();c.roundRect(150,H*.115,600,12,6);c.fill();const g=c.createLinearGradient(150,0,750,0);g.addColorStop(0,'#9fe7ff');g.addColorStop(1,'#ffe7a0');c.fillStyle=g;c.beginPath();c.roundRect(150,H*.115,600*k,12,6);c.fill();
    c.font='bold 15px Segoe UI';c.textAlign='center';c.fillStyle='#eafcff';c.fillText('Dẫn đầu '+Math.round(lead)+' / 1000 trượng',450,H*.115-8);}
 }
 c.restore();}
