import {drawRaceSword,raceSwordFor,RACE_SWORD_SKINS,drawSwordSparkle} from './race-sword-skins.js';
import {drawPrestigeSword,swordPrestige} from './sword-prestige.js';
import {makeSurface} from './performance.js';
// v88: đua phi kiếm "máy quay bám ĐOÀN CHÍNH".
// - Vị trí dọc theo khoảng cách tới trung vị của đoàn (nén log), không theo người dẫn đầu: một người bứt xa
//   không kéo cả đoàn xuống đáy; người bỏ xa bị kẹp ở mép trên kèm nhãn "bỏ xa +X".
// - Người về đích ngồi ở Tiên Môn, nhường đường bay cho người đang đua.
// - Tối đa 12 nhân vật đầy đủ (ưu tiên người vừa tặng quà), những người còn lại bay thành kiếm khí mini theo đúng hạng.
const TAU=Math.PI*2,clamp=v=>Math.max(0,Math.min(1,v)),VIFMT=new Intl.NumberFormat('vi-VN');
const rnd=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};
// FNV-1a + trộn bit: id liên tiếp (p1, p2…) vẫn rải đều bề ngang.
const hash=id=>{let h=2166136261;for(const ch of String(id||''))h=Math.imul(h^ch.codePointAt(0),16777619);h^=h>>>15;h=Math.imul(h,2246822507);h^=h>>>13;return h>>>0;};
const hexA=a=>Math.round(255*clamp(a)).toString(16).padStart(2,'0');
// Bố cục dọc (tỉ lệ chiều cao màn hình).
const CENTER=.6,UP=.36,DOWN=.86,SPAN=.36,SOFT=30,GATE_MIN=.245;
export const RACE_FULL_MAX=12,RACE_FULL_LIGHT=10,RACE_MINI_MAX=40,RACE_MINI_LIGHT=24;
const GIFT_MS=2800,GIFT_PRIORITY_MS=6000;
// Khoảng cách → độ lệch màn hình: gần thì tách rõ, xa thì nén (1000 trượng ≈ SPAN chiều cao).
export const raceGapY=(gap,H)=>Math.sign(gap)*Math.log1p(Math.abs(gap)/SOFT)/Math.log1p(1000/SOFT)*SPAN*H;
const fullCap=scene=>scene.budget?.level==='light'?RACE_FULL_LIGHT:RACE_FULL_MAX;
function glow(c,x,y,r,color,a){if(r<=1||a<=0)return;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color+hexA(a));g.addColorStop(1,color+'00');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
// bảng tên 2 dòng (tên to + hạng/quãng đường), viền theo màu kiếm của người đó
// below=true: đặt bảng dưới thanh kiếm (làn lẻ) để hai người bay sát nhau không đè bảng tên.
function raceTag(c,a,line2,{gold=false,color='#d7fbff',accent='#9fe7ff',below=false}={}){const s=Math.min(1.25,a.scale/1.5),y=below?a.y+(a.away>0?110:150)*s+46:a.y-175*s,name=Array.from(a.player.name||'Đạo hữu').slice(0,16).join('');
  c.font='800 21px Segoe UI';const w=Math.max(c.measureText(name).width,(c.font='bold 16px Segoe UI',c.measureText(line2).width))+26,x=Math.max(w/2+6,Math.min(894-w/2,a.x));
  c.fillStyle=gold?'#4a2f06ee':'#0a2439ee';c.strokeStyle=gold?'#ffd76a':accent;c.lineWidth=2;c.beginPath();c.roundRect(x-w/2,y-46,w,52,9);c.fill();c.stroke();
  c.textAlign='center';c.font='800 21px Segoe UI';c.lineWidth=4;c.strokeStyle='#020a12';c.strokeText(name,x,y-23);c.fillStyle=gold?'#ffe7a0':'#ffffff';c.fillText(name,x,y-23);
  c.font='bold 16px Segoe UI';c.fillStyle=color;c.fillText(line2,x,y-3);
  c.fillStyle=gold?'#ffd76a':accent;c.beginPath();if(below){c.moveTo(x-7,y-46);c.lineTo(x+7,y-46);c.lineTo(a.x,y-55);}else{c.moveTo(x-7,y+6);c.lineTo(x+7,y+6);c.lineTo(a.x,y+15);}c.closePath();c.fill();}
// bảng QUÀ ĐUA — top 5 người tặng nhiều nhất trong lượt + phần thưởng từng hạng (gọn hơn bản v85)
const PRIZE_TXT=['Cửu Thiên +5.000','Tinh Hà +3.000','Băng Liên +1.500','800 tu vi','500 tu vi'];
const fit=(c,t,w)=>{if(c.measureText(t).width<=w)return t;let s=t;while(s.length>2&&c.measureText(s+'…').width>w)s=s.slice(0,-1);return s+'…';};
function drawRaceGiftBoard(c,e,H){const top=e.giftTop||[],w=380,x=900-w-12,y=H*.132,rowH=23,h=36+rowH*5;c.save();
  c.fillStyle='#1d1206d8';c.strokeStyle='#ffd76aaa';c.lineWidth=2;c.beginPath();c.roundRect(x,y,w,h,10);c.fill();c.stroke();
  c.textAlign='left';c.font='900 15px Segoe UI';c.fillStyle='#ffe7a0';c.fillText('QUÀ ĐUA · TOP 3 SKIN · TOP 5 TU VI',x+10,y+20);
  for(let i=0;i<5;i++){const t=top[i],ry=y+30+i*rowH+16;c.font='800 15px Segoe UI';c.fillStyle=i===0?'#ffd76a':i===1?'#d9c2ff':'#a9f1e0';
    const left=['①','②','③','④','⑤'][i]+' '+(t?Array.from(t.name||'').slice(0,10).join('')+' '+VIFMT.format(Number(t.coins))+'c':'còn trống');c.fillText(fit(c,left,180),x+10,ry);
    c.font='700 14px Segoe UI';c.fillStyle='#f3e2b8';c.textAlign='right';c.fillText(PRIZE_TXT[i],x+w-10,ry);c.textAlign='left';}
  c.restore();}
// dải luật một dòng ở đáy (thay bảng 96px cũ che mất đoàn đua)
function drawBoostLegend(c,H,reg){const h=46,y=H-h-14,x=24,w=852;c.save();c.fillStyle='#071a2bcc';c.strokeStyle='#ffd76a80';c.lineWidth=1.5;c.beginPath();c.roundRect(x,y,w,h,10);c.fill();c.stroke();
  c.textAlign='center';c.font='900 20px Segoe UI';c.fillStyle='#fff1ae';c.fillText(fit(c,reg?'⚡ GÕ bay ĐỂ GHI DANH · thả tim để bứt tốc khi đua':'❤ 50 tim +18 · danh +18 (hồi 10s) · quà mỗi coin +30 trượng',w-20),450,y+30);c.restore();}
const serverNow=(scene,t)=>scene.raceServerNow+Math.min(2000,t-scene.raceReceivedAt);
const dist=(r,now)=>Math.min(1000,Math.max(0,(Math.min(now,r.finishAt||now)-r.startedAt)/1000*r.speed+r.bonus));
const rankSort=now=>(a,b)=>(a.finishAt||Infinity)-(b.finishAt||Infinity)||dist(b,now)-dist(a,now)||a.at-b.at;
export function syncRace(scene,state){scene.raceStatus=state.raceStatus;scene.raceStage=state.raceStage||[];scene.raceReceivedAt=performance.now();scene.raceServerNow=state.serverNow;document.body.classList.toggle('sword-race',!!state.raceStatus?.active);}
// Người được vẽ đầy đủ: ai vừa tặng quà/bứt tốc (và có dữ liệu nhân vật) lên trước, rồi tới danh sách máy quay của server.
export function raceActorIds(scene,t){const e=scene.raceStatus;if(!e?.active)return [];const now=serverNow(scene,t),cap=fullCap(scene),index=scene.playerIndex,ids=[];
  const add=id=>{if(id&&!ids.includes(id)&&ids.length<cap&&(!index||index.has(id)))ids.push(id);};
  if(e.phase==='running')[...(e.racers||[])].filter(r=>!r.finishAt&&now-(r.giftAt||0)<GIFT_PRIORITY_MS).sort((a,b)=>(b.giftCoins||0)-(a.giftCoins||0)||(b.giftAt||0)-(a.giftAt||0)).slice(0,4).forEach(r=>add(r.id));
  for(const id of scene.raceStage||[])add(id);return ids;}
// Mốc tham chiếu của máy quay: trung vị quãng đường những người CHƯA về đích (làm mượt theo thời gian).
function packReference(scene,e,now,t){const open=(e.racers||[]).filter(r=>!r.finishAt).map(r=>dist(r,now)).sort((a,b)=>a-b);
  const goal=open.length?open[Math.floor((open.length-1)/2)]:Math.max(0,...(e.racers||[]).map(r=>dist(r,now)));
  const dt=Math.max(0,Math.min(100,t-(scene.raceRefAt??t))),k=scene.motion?1-Math.exp(-dt/400):1;scene.raceRefAt=t;
  scene.raceRef=scene.raceRef==null||Math.abs(goal-scene.raceRef)>400?goal:scene.raceRef+(goal-scene.raceRef)*k;return scene.raceRef;}
export const raceGateY=(ref,H)=>Math.max(H*GATE_MIN,H*CENTER-raceGapY(1000-ref,H));
export function raceTargets(scene,players,H,t){const e=scene.raceStatus,now=serverNow(scene,t),list=players.slice(0,fullCap(scene));
  const all=e.racers||[],byId=new Map(all.map(r=>[r.id,r])),lead=Math.max(0,...all.map(r=>dist(r,now))),reg=e.phase==='registration';
  const ref=reg?0:packReference(scene,e,now,t),gate=raceGateY(ref,H),ranks=[...all].sort(rankSort(now)),rankOf=new Map(ranks.map((r,i)=>[r.id,i+1]));
  scene.raceLead=lead;scene.raceRefNow=ref;scene.raceGate=gate;scene.raceRanks=ranks;scene.raceY??=new Map();scene.raceX??=new Map();
  const dt=Math.max(0,Math.min(100,t-(scene.raceFrameAt??t-16.67))),blend=scene.motion?1-Math.exp(-dt/150):1;scene.raceFrameAt=t;
  for(const map of [scene.raceY,scene.raceX,scene.raceSeen])if(map)for(const id of map.keys())if(!list.some(p=>p.id===id))map.delete(id);
  // Làn ngang: người đang bay chia đều bề ngang theo thứ tự ổn định; người về đích xếp hàng ở Tiên Môn theo thứ tự về.
  const flying=list.filter(p=>!byId.get(p.id)?.finishAt),landed=list.filter(p=>byId.get(p.id)?.finishAt).sort((a,b)=>rankOf.get(a.id)-rankOf.get(b.id));
  const n=Math.max(1,flying.length),scale=list.length>9?1:list.length>6?1.15:list.length>4?1.4:1.8;
  return list.map(p=>{const r=byId.get(p.id)||{},d=r.id?dist(r,now):0,boost=r.boostUntil>now,kick=r.lastBoostAt&&now-r.lastBoostAt<900?1-(now-r.lastBoostAt)/900:0,finished=!!r.finishAt;
    const lane=finished?landed.indexOf(p):flying.indexOf(p),i=list.indexOf(p);
    let goalX,goalY,sc=scale,away=0;
    if(reg){goalX=Math.max(70,Math.min(830,90+720*(i+.5)/Math.max(1,list.length)));goalY=H*(.56+(i%2?.06:0));}
    else if(finished){const m=Math.max(1,landed.length),gapX=Math.min(125,380/m);goalX=95+lane*gapX;// nửa trái: bảng quà đua chiếm góc phải trên
goalY=gate-12+(lane%2?10:0);sc=Math.min(scale,1);}
    else{goalX=Math.max(70,Math.min(830,90+720*(lane+.5)/n));const raw=H*CENTER-raceGapY(d-ref,H);goalY=Math.min(H*DOWN,Math.max(H*UP,raw))+(lane%2?H*.025:0);if(raw<H*UP)away=Math.round(d-ref);}
    goalX+=scene.motion&&!finished?Math.sin(t*.0013+i)*8:0;
    const oldX=scene.raceX.get(p.id)??goalX,x=oldX+(goalX-oldX)*blend;scene.raceX.set(p.id,x);if(reg){scene.raceSeen??=new Map();if(!scene.raceSeen.has(p.id))scene.raceSeen.set(p.id,t);}
    const prev=scene.raceY.get(p.id)??goalY,y=prev+(goalY-prev)*blend;scene.raceY.set(p.id,y);
    const arrive=reg?clamp((t-scene.raceSeen.get(p.id))/900):1,gk=r.giftAt?(now-r.giftAt)/GIFT_MS:2,gift=gk>=0&&gk<1&&r.giftTier?{k:gk,tier:Math.min(3,r.giftTier),coins:r.giftCoins||0,boost:r.giftUnits||r.giftTier}:null;
    return {id:p.id,player:p,x,y:y+(scene.motion&&!finished?Math.sin(t*.003+i)*6:0)-(1-arrive)*H*.25,scale:sc,lift:0,progress:d/1000,distance:d,boost,kick,finished,finishAt:r.finishAt,finishAge:finished?Math.max(0,now-r.finishAt):null,launchAge:e.startedAt?now-e.startedAt:null,baseY:H*.6,arrive,reg,slot:i+1,gift,rank:rankOf.get(p.id)||0,away,lane};});}
// Kiếm khí mini cho những người đang đua nhưng không được vẽ đầy đủ: vị trí theo đúng quãng đường, màu riêng theo người.
const MINI_COLORS=['#9fefff','#ffe3a0','#d9a3ff','#86ffe2','#ff9fb8','#a8c8ff','#ffc27a','#c8ff9a'];
// Vẽ sẵn: mỗi màu × (thường/bứt tốc) một ảnh kiếm + vệt; mỗi tên một ảnh chữ. Khung hình chỉ còn drawImage.
const MINI_W=24,MINI_TOP=26,MINI_H=MINI_TOP+96;
function paintMini(c,x,y,color,hot){const L=hot?90:48;const g=c.createLinearGradient(0,y,0,y+L);g.addColorStop(0,color+'cc');g.addColorStop(1,color+'00');c.strokeStyle=g;c.lineCap='round';c.lineWidth=hot?5:3;c.beginPath();c.moveTo(x,y+8);c.lineTo(x,y+L);c.stroke();
  c.fillStyle=color;c.strokeStyle='#06121e';c.lineWidth=1.5;c.beginPath();c.moveTo(x,y-22);c.lineTo(x+4.5,y+4);c.lineTo(x+9,y+7);c.lineTo(x+2.5,y+9);c.lineTo(x,y+17);c.lineTo(x-2.5,y+9);c.lineTo(x-9,y+7);c.lineTo(x-4.5,y+4);c.closePath();c.fill();c.stroke();}
function miniSprite(scene,factory,color,hot){const cache=scene.raceMiniSprites??=new Map(),key=color+(hot?'+':'');if(cache.has(key))return cache.get(key);const s=factory?.(MINI_W,MINI_H);if(s)paintMini(s.getContext('2d'),MINI_W/2,MINI_TOP,color,hot);cache.set(key,s||null);return s||null;}
function paintLabel(c,text,x,y,gift){c.font=(gift?'900 17px':'800 15px')+' Segoe UI';c.textAlign='center';c.lineWidth=4;c.strokeStyle='#04101c';c.strokeText(text,x,y);c.fillStyle=gift?'#ffe7a0':'#eafcff';c.fillText(text,x,y);}
function miniLabel(scene,factory,c,text,gift){const cache=scene.raceMiniLabels??=new Map(),key=(gift?'!':'')+text;let v=cache.get(key);if(v){cache.delete(key);cache.set(key,v);return v;}
  c.font=(gift?'900 17px':'800 15px')+' Segoe UI';const w=c.measureText(text).width,s=factory?.(Math.ceil(w)+12,26);if(s)paintLabel(s.getContext('2d'),text,s.width/2,20,gift);
  v={text,w,surface:s||null};cache.set(key,v);if(cache.size>128)cache.delete(cache.keys().next().value);return v;}
function drawMiniRacers(scene,c,e,H,now,t){if(e.phase!=='running')return;const shown=new Set(scene.targets.map(a=>a.id)),ref=scene.raceRefNow||0,light=scene.budget?.level==='light';
  const rest=(scene.raceRanks||[]).filter(r=>!r.finishAt&&!shown.has(r.id)),cap=light?RACE_MINI_LIGHT:RACE_MINI_MAX,minis=rest.slice(0,cap);
  c.save();c.lineCap='round';const labels=[],free=(x,y,w)=>!labels.some(b=>Math.abs(b.x-x)<(b.w+w)/2+4&&Math.abs(b.y-y)<20);
  const factory=scene.surfaceFactory||makeSurface;
  for(let i=0;i<minis.length;i++){const r=minis[i],h=hash(r.id),d=dist(r,now),color=MINI_COLORS[h%MINI_COLORS.length],gift=now-(r.giftAt||0)<GIFT_MS,hot=gift||r.boostUntil>now;
    const x=50+(h%997)/997*800+(scene.motion?Math.sin(t*.0011+h)*10:0),y=Math.min(H*(DOWN+.05),Math.max(H*UP,H*CENTER-raceGapY(d-ref,H)))+((h>>3)%9-4)*H*.004;
    if(gift)glow(c,x,y,46,'#ffe2a0',.55);
    const sprite=miniSprite(scene,factory,color,hot);if(sprite)c.drawImage(sprite,x-MINI_W/2,y-MINI_TOP);else paintMini(c,x,y,color,hot);
    if(i<20||gift){const label=miniLabel(scene,factory,c,Array.from(r.name||'Đạo hữu').slice(0,10).join(''),gift);
     if(gift||free(x,y+34,label.w)){labels.push({x,y:y+34,w:label.w});if(label.surface)c.drawImage(label.surface,Math.round(x-label.surface.width/2),Math.round(y+34-20));else paintLabel(c,label.text,x,y+34,gift);}}}
  const hidden=rest.length-minis.length;
  if(hidden>0){c.font='800 18px Segoe UI';c.textAlign='center';c.lineWidth=4;c.strokeStyle='#04101c';const msg='+'+hidden+' đạo hữu đang bay phía sau';c.strokeText(msg,450,H-76);c.fillStyle='#d8f4ff';c.fillText(msg,450,H-76);}
  c.restore();}
// v89: màn trao thưởng trong 12 giây sau khi đua xong — thẻ skin to cho top 3 quà, không còn khoảng chờ trống.
// Bảng thưởng phải khớp RACE_GIFT_PRIZES trong sword-race.mjs (server).
const PRIZE_VIEW=[{skin:'race-cuu-thien',qi:5000},{skin:'race-moon',qi:3000},{skin:'race-frost',qi:1500},{qi:800},{qi:500}];
const PODIUM_MS=12000;
function drawAwardSword(scene,c,skin,x,y,size,t){const art=scene.prestigeSwords?.[skin.cell],bob=scene.motion?Math.sin(t*.002+skin.cell)*6:0;c.save();c.translate(x,y+bob);
  glow(c,0,0,size*.55,skin.color,.45);
  if(art){c.drawImage(art,-size*.24,-size*.5,size*.48,size*.96);if(skin.sparkle)drawSwordSparkle(c,t,size*.96,scene.motion!==false,scene.budget?.level==='light');}else{c.fillStyle=skin.color;c.strokeStyle=skin.edge;c.lineWidth=2;c.beginPath();c.moveTo(0,-size*.48);c.lineTo(size*.05,size*.2);c.lineTo(0,size*.3);c.lineTo(-size*.05,size*.2);c.closePath();c.fill();c.stroke();c.fillStyle=skin.dark;c.fillRect(-size*.12,size*.2,size*.24,size*.04);}
  // vệt sáng quét dọc lưỡi kiếm
  if(scene.motion){const u=(t*.0006+skin.cell*.3)%1,yy=-size*.45+u*size*.8;c.globalCompositeOperation='screen';c.save();c.translate(0,yy);c.scale(1,2.2);const g=c.createRadialGradient(0,0,0,0,0,size*.07);g.addColorStop(0,'#ffffffcc');g.addColorStop(1,'#ffffff00');c.fillStyle=g;c.beginPath();c.arc(0,0,size*.07,0,Math.PI*2);c.fill();c.restore();}
  c.restore();}
function drawRaceAwards(scene,c,e,H,now,t){const age=now-((e.podiumUntil||now)-PODIUM_MS),left=Math.max(0,Math.ceil(((e.podiumUntil||now)-now)/1000)),top=e.giftTop||[];c.save();
  c.fillStyle='#030a14'+hexA(Math.min(.62,age/600*.62));c.fillRect(0,0,900,H);
  c.textAlign='center';c.lineWidth=7;c.strokeStyle='#1d1206';c.font='900 42px Segoe UI';c.fillStyle='#ffe7a0';c.strokeText('TRAO THƯỞNG PHI KIẾM',450,H*.12);c.fillText('TRAO THƯỞNG PHI KIẾM',450,H*.12);
  c.font='bold 20px Segoe UI';c.lineWidth=4;c.strokeStyle='#04101c';const sub=top.length?'Top 3 tặng quà nhận skin phi kiếm vĩnh viễn':'Lượt này chưa ai tặng quà · tặng quà để nhận skin phi kiếm';c.strokeText(sub,450,H*.12+32);c.fillStyle='#eafcff';c.fillText(sub,450,H*.12+32);
  // 08/11: 3 thẻ gom vào vùng an toàn 14–86% bề ngang — trên điện thoại cột nút TikTok bên phải che mất thẻ hạng 3.
  const slots=[{rank:1,x:450,y:H*.40,k:1,at:1300},{rank:2,x:222,y:H*.44,k:.78,at:800},{rank:3,x:678,y:H*.44,k:.78,at:300}];
  for(const sl of slots){const winner=top[sl.rank-1],pz=PRIZE_VIEW[sl.rank-1],skin=RACE_SWORD_SKINS.find(s=>s.id===pz.skin),u=clamp((age-sl.at)/650);if(!winner||!skin||u<=0)continue;
    const e2=1-(1-u)**3,w=250*sl.k,h=430*sl.k,x=sl.x,y=sl.y-(1-e2)*120;c.save();c.globalAlpha=e2;
    c.fillStyle='#0a1a2ce8';c.strokeStyle=sl.rank===1?'#ffd76a':skin.color;c.lineWidth=sl.rank===1?4:3;c.beginPath();c.roundRect(x-w/2,y-h/2,w,h,16);c.fill();c.stroke();
    c.font='900 '+Math.round(22*sl.k)+'px Segoe UI';c.fillStyle=sl.rank===1?'#ffd76a':'#d9f6ff';c.fillText((sl.rank===1?'👑 ':'')+'HẠNG '+sl.rank,x,y-h/2+34*sl.k);
    drawAwardSword(scene,c,skin,x,y-18*sl.k,230*sl.k,t);
    c.font='900 '+Math.round(24*sl.k)+'px Segoe UI';c.lineWidth=4;c.strokeStyle='#04101c';const nm=fit(c,winner.name||'Đạo hữu',w-20);c.strokeText(nm,x,y+h/2-74*sl.k);c.fillStyle='#ffffff';c.fillText(nm,x,y+h/2-74*sl.k);
    c.font='800 '+Math.round(18*sl.k)+'px Segoe UI';c.fillStyle=skin.color;c.fillText(skin.name,x,y+h/2-46*sl.k);
    c.font='700 '+Math.round(16*sl.k)+'px Segoe UI';c.fillStyle='#ffe2a0';c.fillText('+'+VIFMT.format(pz.qi)+' tu vi',x,y+h/2-20*sl.k);c.restore();}
  // hạng 4–5 quà + Kiếm Vương + đếm ngược
  let y=H*.66;c.font='800 20px Segoe UI';c.lineWidth=4;c.strokeStyle='#04101c';
  for(let i=3;i<5;i++){const w=top[i];if(!w||age<1900)continue;const line=['④','⑤'][i-3]+' '+Array.from(w.name||'').slice(0,14).join('')+' · +'+VIFMT.format(PRIZE_VIEW[i].qi)+' tu vi';c.strokeText(line,450,y);c.fillStyle='#d9f6ff';c.fillText(line,450,y);y+=30;}
  const champ=(e.results||[])[0];if(champ&&age>2200){y+=14;c.font='900 26px Segoe UI';const line='⚔ VÂN HẢI KIẾM VƯƠNG · '+Array.from(champ.name||'').slice(0,16).join('');c.strokeText(line,450,y);c.fillStyle='#ffd76a';c.fillText(line,450,y);y+=30;
    c.font='700 18px Segoe UI';const rest=(e.results||[]).slice(1,5).map((r,i)=>(i+2)+'. '+Array.from(r.name||'').slice(0,10).join('')).join('   ');c.strokeText(rest,450,y);c.fillStyle='#eafcff';c.fillText(rest,450,y);}
  if(e.repeat!==false){c.font='bold 20px Segoe UI';const nx='Lượt đua mới sau '+left+' giây · gõ bay để ghi danh';c.strokeText(nx,450,H-40);c.fillStyle='#fff1ae';c.fillText(nx,450,H-40);}
  c.restore();}
export function drawRace(scene,c,t,layer){const e=scene.raceStatus;if(!e?.active)return;const H=scene.height,now=serverNow(scene,t),running=e.phase==='running',moving=running&&scene.motion,light=scene.budget?.level==='light';
 const lead=scene.raceLead||0,ref=scene.raceRefNow||0,anyBoost=scene.targets.some(a=>a.boost),speed=moving?(anyBoost?1.7:1):0;
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
  if(e.phase!=='registration'){
   // mốc trượng theo cùng phép nén với đoàn đua; gần đoàn mỗi 50 trượng, xa đoàn chỉ mốc 250
   c.font='bold 18px Segoe UI';c.textAlign='left';
   for(let m=Math.max(50,Math.floor((ref-500)/50)*50);m<1000;m+=50){const far=Math.abs(m-ref)>100;if(far?m%250:m%100)continue;const y=H*CENTER-raceGapY(m-ref,H);if(y<H*.3||y>H*.88)continue;
    c.strokeStyle=m%250===0?'#fbe6adb0':'#d8f4ff55';c.lineWidth=m%250===0?3:1.5;c.setLineDash([18,14]);c.beginPath();c.moveTo(20,y);c.lineTo(880,y);c.stroke();c.setLineDash([]);
    c.fillStyle=m%250===0?'#fbe6ad':'#d8f4ffb0';c.fillText(m+' trượng',24,y-8);}
   // Tiên Môn (đích) luôn trong khung, người về đích ngồi ở đây
   const gy=scene.raceGate??raceGateY(ref,H);glow(c,450,gy,300,'#ffd76a',.3);c.strokeStyle='#ffe7a0';c.lineWidth=6;c.beginPath();c.ellipse(450,gy,400,44,0,0,TAU);c.stroke();c.lineWidth=2;c.beginPath();c.ellipse(450,gy,360,36,0,0,TAU);c.stroke();
   c.fillStyle='#ffe7a0';c.font='bold 26px Segoe UI';c.textAlign='center';c.lineWidth=5;c.strokeStyle='#2a1a04';c.strokeText('⛩ ĐÍCH · TIÊN MÔN',450,gy+76);c.fillText('⛩ ĐÍCH · TIÊN MÔN',450,gy+76);
   drawMiniRacers(scene,c,e,H,now,t);
  }
  // Một thanh phi kiếm cho mỗi người được vẽ đầy đủ; không pháp bảo bay quanh, hào quang hay vòng xung kích.
  // 08/11: skin/vật cưỡi mới CHỈ dành cho người đã đoạt top 1–3 (raceSwordSkins); người thường bay kiếm mặc định, không rút ngẫu nhiên vật cưỡi.
  for(const a of scene.targets){const skin=raceSwordFor(a.player);if(skin)drawRaceSword(scene,c,a,t);else{const v=swordPrestige(a.player);drawPrestigeSword(scene,c,v.cell,a.x,a.y+32*(a.scale/1.5),160*(a.scale/1.5),Math.PI/2,v.color);}}
 }else{
  // Small textual feedback keeps gifts readable without covering racers.
  for(const a of scene.targets)if(a.kick>0){c.save();c.font='900 18px Segoe UI';c.textAlign='center';c.fillStyle='#ffe7a0';c.strokeStyle='#09263d';c.lineWidth=4;const text=a.gift?'BỨT TỐC +'+a.gift.boost:'BỨT TỐC';c.strokeText(text,a.x,a.y+75);c.fillText(text,a.x,a.y+75);c.restore();}
  // lúc tuyển — người ghi danh giáng xuống vạch xuất phát + bảng chờ
  if(e.phase==='registration'){
   for(const a of scene.targets){const s=a.scale/1.5;
    if(a.arrive<1){const k=a.arrive;c.save();c.globalCompositeOperation='screen';const g=c.createLinearGradient(0,0,0,a.y);g.addColorStop(0,'#9fe7ff00');g.addColorStop(1,'#bff3ff'+hexA(.7*(1-k)));c.fillStyle=g;c.fillRect(a.x-30*s,0,60*s,a.y+20);glow(c,a.x,a.y-40*s,140*s,'#d8fbff',.8*(1-k));c.restore();
     c.strokeStyle='#e8fbff';c.globalAlpha=1-k;c.lineWidth=3;c.beginPath();c.ellipse(a.x,a.y+20*s,30+k*120,(30+k*120)*.3,0,0,TAU);c.stroke();c.globalAlpha=1;}
    raceTag(c,a,'Làn '+a.slot+' · sẵn sàng',{accent:swordPrestige(a.player).color});}
   const left=Math.max(0,Math.ceil(((e.registrationEndsAt||now)-now)/1000)),total=(e.entries||[]).length;
   c.strokeStyle='#fbe6ad';c.lineWidth=4;c.setLineDash([22,12]);c.beginPath();c.moveTo(30,H*.68);c.lineTo(870,H*.68);c.stroke();c.setLineDash([]);
   c.font='900 30px Segoe UI';c.textAlign='center';c.lineWidth=6;c.strokeStyle='#0a2439';const msg=total?'VẠCH XUẤT PHÁT · còn '+left+' giây':'GÕ bay ĐỂ LÊN ĐƯỜNG ĐUA · '+left+' giây';c.strokeText(msg,450,H*.72);c.fillStyle='#ffe7a0';c.fillText(msg,450,H*.72);
   c.font='bold 18px Segoe UI';c.lineWidth=4;const sub=total+' người đã ghi danh · tất cả cùng đua';c.strokeText(sub,450,H*.72+30);c.fillStyle='#eafcff';c.fillText(sub,450,H*.72+30);
   drawBoostLegend(c,H,true);drawRaceGiftBoard(c,e,H);c.restore();return;}
  // bảng tên: hạng thật trong toàn bộ đoàn, nhãn "bỏ xa" khi bị kẹp ở mép trên
  for(const a of scene.targets){const rank=a.rank||0,line=a.finished?'✓ Về đích hạng '+rank:(rank===1?'👑 Hạng 1':'Hạng '+rank)+' · '+(a.away>0?'bỏ xa +'+VIFMT.format(a.away):Math.round(a.distance)+' trượng')+(a.boost?' ⚡':'');
    raceTag(c,a,line,{gold:rank===1,color:a.boost||a.away>0?'#ffe2a0':'#d7fbff',accent:swordPrestige(a.player).color,below:!a.finished&&a.lane%2===1});}
  if(e.phase==='finished'){drawRaceAwards(scene,c,e,H,now,t);c.restore();return;}
  if(running){drawBoostLegend(c,H,false);drawRaceGiftBoard(c,e,H);
   // vạch tiến độ người dẫn đầu + số người đang đua
   const k=clamp(lead/1000),count=(e.racers||[]).length,done=(e.racers||[]).filter(r=>r.finishAt).length;c.fillStyle='#0a2439c0';c.beginPath();c.roundRect(24,H*.112,460,12,6);c.fill();const g=c.createLinearGradient(24,0,484,0);g.addColorStop(0,'#9fe7ff');g.addColorStop(1,'#ffe7a0');c.fillStyle=g;c.beginPath();c.roundRect(24,H*.112,460*k,12,6);c.fill();
   c.font='bold 16px Segoe UI';c.textAlign='left';c.lineWidth=4;c.strokeStyle='#04101c';const info='Dẫn đầu '+Math.round(lead)+'/1000 · '+count+' người đua'+(done?' · '+done+' về đích':'');c.strokeText(info,24,H*.112-8);c.fillStyle='#eafcff';c.fillText(info,24,H*.112-8);}
 }
 c.restore();}
