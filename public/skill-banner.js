// Bảng chiêu 4 bậc cho Vân Hải Lôi Đài (15/11/2026) — thay "bảng chéo" cũ của Tỷ Thí (drawDuelCutIn).
// Chiêu càng mạnh bảng càng đẹp: 1 Phàm (dải nhỏ cạnh người) · 2 Linh (dải chéo 70% màn) · 3 Huyền/Địa (2 dải tràn viền + chân dung)
// · 4 Thiên (toàn màn, tối nền, khung vàng, chữ hệ khổng lồ). Bậc 4 tối đa 1 lần / 20 s, quá nhịp hạ xuống bậc 3 (chống "reproduced content").
// Mỗi bậc có nhiều bố cục, không lặp bố cục vừa dùng. Chỉ path/gradient/chữ, không shadowBlur; khung ảnh (Codex) dùng nếu đã nạp.
import {arenaElement,ARENA_ELEMENT_COLORS} from './arena-fx.js';
const TAU=Math.PI*2,clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),ease=k=>1-(1-clamp(k))**3;
export const BANNER_GLYPH=Object.freeze({lightning:'雷',fire:'火',ice:'冰',water:'水',flower:'花',star:'星',sword:'劍',soul:'魂',gold:'金'});
export const TIER_LABEL=Object.freeze({1:'PHÀM CẤP',2:'LINH CẤP',3:'HUYỀN CẤP',4:'THIÊN CẤP'});
export const TIER4_GAP_MS=20000;
const FRAME_FILE=Object.freeze({2:'banner-frame-jade',3:'banner-frame-violet',4:'banner-frame-gold'});

/** Bậc bảng của một đòn trong nhật ký trận. */
export function bannerTier(e){
 if(e.gift)return clamp(Math.round(e.tier||2),1,4);
 if(e.slot===5)return 4;
 if(e.slot===4)return 3;
 if(e.slot===2||e.slot===3)return clamp(Math.max(2,Math.round(e.tier||2)),2,4);
 return 1;
}
/** Chốt bậc + bố cục cho đòn (1 lần/đòn): bậc 4 giới hạn nhịp, bố cục không lặp lần trước. */
export function bannerPlan(scene,e,now){
 scene.bannerPlans??=new Map();const key=e.n+':'+(e.at||0);
 if(scene.bannerPlans.has(key))return scene.bannerPlans.get(key);
 let tier=bannerTier(e);
 if(tier===4){if(now-(scene.lastTier4At??-1e12)<TIER4_GAP_MS)tier=3;else scene.lastTier4At=now;}
 const layouts=tier===4?4:tier===3?3:2,last=scene.lastBannerLayout?.[tier];
 let layout=(e.n*7+(e.at||0))%layouts;if(layout===last)layout=(layout+1)%layouts;
 (scene.lastBannerLayout??={})[tier]=layout;
 const plan={tier,layout};scene.bannerPlans.set(key,plan);
 if(scene.bannerPlans.size>80)scene.bannerPlans.delete(scene.bannerPlans.keys().next().value);
 return plan;
}
function frameImage(scene,tier){
 const file=FRAME_FILE[tier];if(!file)return null;scene.bannerFrames??={};
 if(file in scene.bannerFrames)return scene.bannerFrames[file];
 scene.bannerFrames[file]=null;if(typeof Image==='undefined')return null;
 const im=new Image();im.onload=()=>{scene.bannerFrames[file]=im;};im.onerror=()=>{};im.src='/assets/skills-v1/'+file+'.webp';return null;
}
function txt(c,s,x,y,size,fill,{stroke='#06101a',width=6,align='center',weight='900',max}={}){
 c.font=`${weight} ${size}px "Segoe UI",Arial,sans-serif`;c.textAlign=align;c.textBaseline='middle';c.lineJoin='round';
 if(stroke){c.lineWidth=width;c.strokeStyle=stroke;c.strokeText(s,x,y,max);}c.fillStyle=fill;c.fillText(s,x,y,max);
}
function band(c,x0,y0,x1,y1,h,skew,fill,stroke){
 c.beginPath();c.moveTo(x0,y0-h/2+skew);c.lineTo(x1,y1-h/2-skew);c.lineTo(x1,y1+h/2-skew);c.lineTo(x0,y0+h/2+skew);c.closePath();
 c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke();}
}
function speedLines(c,x,y,w,h,k,color,n=10,seed=1){
 c.save();c.strokeStyle=color;c.lineWidth=2;
 for(let i=0;i<n;i++){const yy=y-h/2+((i*37+seed*13)%h),len=40+((i*53)%90),xx=x+((i*113+k*1400+seed*29)%w);c.globalAlpha=.25+.35*((i*7)%3)/2;c.beginPath();c.moveTo(xx,yy);c.lineTo(xx+len,yy-2);c.stroke();}
 c.restore();
}
function sweep(c,x,y,w,h,k,color){
 const sx=x+(w+300)*clamp((k-.08)/.5)-150,g=c.createLinearGradient(sx-80,0,sx+80,0);
 g.addColorStop(0,color+'00');g.addColorStop(.5,color+'99');g.addColorStop(1,color+'00');c.fillStyle=g;c.fillRect(sx-80,y-h/2,160,h);
}
function portrait(scene,actor){try{return scene.portraitFor?.(actor?.player)||null;}catch{return null;}}
const nameOf=(scene,id)=>scene.arena?.current?.fighters?.[id]?.name||scene.lastState?.players?.find(p=>p.id===id)?.name||'';

/** Vẽ bảng chiêu. k: tiến độ đòn 0→1. A: vị trí người ra đòn (target). small: đang có bảng lớn khác → chỉ dải nhỏ. */
export function drawSkillBannerTier(scene,c,e,k,A,H,now=Date.now(),{small=false}={}){
 if(!A||e.stunned||e.dot)return;
 const plan=bannerPlan(scene,e,now),tier=small?1:plan.tier,layout=plan.layout,end=tier===1?.7:tier===2?.72:.78;if(k>end)return;
 const a=clamp(Math.min(k/(tier>=3?.08:.1),(end-k)/.14));if(a<=0)return;
 const el=arenaElement(e.skill?.tech),[main,core,deep]=ARENA_ELEMENT_COLORS[el]||ARENA_ELEMENT_COLORS.sword,color=e.skill?.color||main,glyph=BANNER_GLYPH[el]||'武';
 const left=A.x<450,dir=left?1:-1,name=e.skill?.name||'',who=nameOf(scene,e.by);
 const label=e.gift?(e.from?'TRỢ CHIÊU · '+e.from+' tặng':'TRỢ CHIÊU'):e.slot===5?'TUYỆT KỸ · '+TIER_LABEL[4]:e.slot===4?'LINH THÚ · '+TIER_LABEL[3]:e.slot===1?'':'SK'+e.slot+' · '+TIER_LABEL[tier];
 const light=scene.budget?.level==='light'||scene.heavyCrowd;
 c.save();c.globalAlpha=a;
 if(tier===1){
  // Dải nhỏ nghiêng ngay trên đầu người ra đòn.
  const slide=(1-ease(k/.12))*120*dir,x=A.x+slide,y=A.y-322,w=Math.min(360,40+name.length*15);
  const g=c.createLinearGradient(x-w/2,0,x+w/2,0);g.addColorStop(0,deep+'00');g.addColorStop(.2,deep+'e0');g.addColorStop(.8,color+'d0');g.addColorStop(1,color+'00');
  band(c,x-w/2,y,x+w/2,y,38,-4*dir,g,null);
  txt(c,name,x,y,24,'#ffffff',{width:5,max:w-20});
 }else if(tier===2){
  // Dải chéo 70% màn từ phía người ra đòn, có ô chữ hệ.
  const y=H*(layout?.205:.155),slide=(1-ease(k/.14))*600*dir,x0=left?-20+slide:270+slide,x1=x0+650,skew=layout?14:-14;
  const g=c.createLinearGradient(x0,0,x1,0);g.addColorStop(0,deep+'f0');g.addColorStop(.55,color+'d8');g.addColorStop(1,deep+'00');
  band(c,x0,y,x1,y,76,skew*dir,g,color);
  c.save();c.beginPath();c.rect(x0,y-50,650,100);c.clip();speedLines(c,x0,y,650,70,k,core,light?5:10,e.n);c.restore();
  const fr=frameImage(scene,2);if(fr)c.drawImage(fr,x0-10,y-62,670,124);
  const gx=left?x0+70:x1-90;c.beginPath();c.arc(gx,y,34,0,TAU);c.fillStyle='#071423ee';c.fill();c.strokeStyle=core;c.lineWidth=2.5;c.stroke();
  txt(c,glyph,gx,y+2,38,core,{width:4});
  txt(c,name,left?x0+370:x0+300,y-4,36,'#ffffff',{width:6,max:440});
  if(label)txt(c,label,left?x0+370:x0+300,y+28,15,'#ffe9b0',{width:4,weight:'800'});
 }else if(tier===3){
  // Hai dải tràn viền chéo ngược + chân dung + chữ hệ lớn mờ + ánh quét.
  const y=H*(.14+layout*.04),slide=(1-ease(k/.14))*900*dir,tilt=(layout%2?1:-1)*22;
  c.save();c.translate(slide,0);
  const g=c.createLinearGradient(0,0,900,0);g.addColorStop(0,deep+'f5');g.addColorStop(.5,color+'e6');g.addColorStop(1,deep+'f5');
  band(c,-40,y+16,940,y-16,58,0,deep+'cc',null);
  band(c,-40,y-tilt,940,y+tilt,120,0,g,core);
  c.save();c.beginPath();c.rect(-40,y-70,980,140);c.clip();
  c.globalAlpha=a*.16;txt(c,glyph,left?720:180,y+6,170,core,{stroke:null});c.globalAlpha=a;
  speedLines(c,0,y,900,110,k,core,light?6:14,e.n);sweep(c,0,y,900,120,k,'#ffffff');c.restore();
  const fr=frameImage(scene,3);if(fr)c.drawImage(fr,-30,y-86,960,172);
  const pic=portrait(scene,A);if(pic)c.drawImage(pic,left?40:650,y-120,190,230);
  const tx=left?560:340;
  txt(c,name,tx,y-6,46,'#fff6dc',{width:8,max:560});
  txt(c,(label||TIER_LABEL[3])+(who?' · '+who:''),tx,y+38,17,'#ffe9b0',{width:4,weight:'800',max:560});
  c.restore();
 }else{
  // Thiên cấp: toàn màn. Tối nền, 3 dải, khung vàng, chữ hệ khổng lồ, chữ tên chiêu lớn, nứt viền.
  c.save();c.globalAlpha=a*.38;c.fillStyle='#000';c.fillRect(0,0,900,H);c.restore();
  const cy=H*(layout===2?.2:.17),rot=[-.08,.08,0,-.04][layout],slide=(1-ease(k/.16))*1000*(layout%2?-1:1);
  c.save();c.translate(450,cy);c.rotate(rot);c.translate(-450+slide,-cy);
  c.globalAlpha=a*.22;txt(c,glyph,450,cy+10,300,core,{stroke:null});c.globalAlpha=a;
  const g=c.createLinearGradient(0,0,900,0);g.addColorStop(0,'#1a0d00f5');g.addColorStop(.25,deep+'ee');g.addColorStop(.5,'#ffd77a');g.addColorStop(.75,deep+'ee');g.addColorStop(1,'#1a0d00f5');
  band(c,-60,cy-84,960,cy-84,22,0,'#ffd77acc',null);
  band(c,-60,cy,960,cy,150,0,g,'#ffe9a8');
  band(c,-60,cy+86,960,cy+86,22,0,'#ffd77acc',null);
  c.save();c.beginPath();c.rect(-60,cy-75,1020,150);c.clip();speedLines(c,0,cy,900,140,k,'#fff4cf',light?8:18,e.n);sweep(c,0,cy,900,150,k,'#ffffff');c.restore();
  const fr=frameImage(scene,4);if(fr)c.drawImage(fr,-40,cy-108,980,216);
  const pic=portrait(scene,A);if(pic)c.drawImage(pic,layout%2?660:20,cy-150,220,270);
  // Tên chiêu: chữ vàng lớn, viền tối 2 lớp cho rõ sau khi TikTok nén video.
  c.font='900 62px "Segoe UI",Arial,sans-serif';c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';
  c.lineWidth=14;c.strokeStyle='#1a0a00';c.strokeText(name,450,cy-6,640);c.lineWidth=5;c.strokeStyle='#ffefb8';c.strokeText(name,450,cy-6,640);
  const tg=c.createLinearGradient(0,cy-40,0,cy+30);tg.addColorStop(0,'#fffbe6');tg.addColorStop(.5,'#ffd34d');tg.addColorStop(1,'#ff9b2e');c.fillStyle=tg;c.fillText(name,450,cy-6,640);
  txt(c,(label||'TUYỆT KỸ')+(who?' · '+who:''),450,cy+48,19,'#fff2cc',{width:5,weight:'800',max:640});
  c.restore();
  // Nứt viền: tia sáng từ 4 góc.
  if(!light&&k<.5){c.save();c.globalAlpha=a*(1-k/.5);c.strokeStyle='#fff3c4';c.lineWidth=2;
   for(const [x,y,s] of [[0,0,1],[900,0,-1],[0,H,1],[900,H,-1]])for(let i=0;i<3;i++){c.beginPath();c.moveTo(x,y);let px=x,py=y;for(let j=0;j<4;j++){px+=s*(30+((i*17+j*11)%40));py+=(y?-1:1)*(25+((i*29+j*7)%35));c.lineTo(px,py);}c.stroke();}
   c.restore();}
 }
 c.restore();
}

// ===== 15/11 tối (chủ game gửi ảnh mẫu): BẢNG CHÉO kiểu dải nghiêng tràn ngang, nhân vật tràn ra ngoài dải, tag ô chiêu,
// tên chiêu + cấp, tên người chơi; nhiều bảng xếp tầng (tối đa 3). Màu theo hệ; bậc càng cao dải càng dày, viền càng sáng.
export const LANE_Y=Object.freeze([.085,.2,.315]);
export const BANNER_MS=Object.freeze({1:1700,2:1900,3:2200,4:2600});
const SLOT_TAG=Object.freeze({0:'QUÀ TẶNG',1:'CHIÊU THƯỜNG',2:'BÍ PHÁP',3:'BÍ PHÁP',4:'LINH THÚ',5:'TUYỆT KỸ'});
const TIER_H=Object.freeze({1:118,2:132,3:148,4:172});
/** Chọn tầng trống cho bảng (giữ tầng suốt đời bảng). null = hết tầng. */
export function bannerLane(scene,e,now,active){
 scene.bannerLanes??=new Map();const key=e.n+':'+(e.at||0);
 if(scene.bannerLanes.has(key))return scene.bannerLanes.get(key);
 const used=new Set(active.map(k=>scene.bannerLanes.get(k)).filter(x=>x!=null));
 const lane=[0,1,2].find(i=>!used.has(i));if(lane==null)return null;
 scene.bannerLanes.set(key,lane);if(scene.bannerLanes.size>60)scene.bannerLanes.delete(scene.bannerLanes.keys().next().value);
 return lane;
}
function bolt2(c,x0,y0,x1,y1,seed,color,width){let s=seed>>>0||1;const r=()=>((s=(s*1664525+1013904223)>>>0)/4294967296)-.5;
 c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.beginPath();c.moveTo(x0,y0);for(let i=1;i<7;i++){const k=i/7;c.lineTo(x0+(x1-x0)*k+r()*30,y0+(y1-y0)*k+r()*26);}c.lineTo(x1,y1);c.stroke();}
/** Vẽ 1 bảng chéo. age: ms từ lúc ra chiêu. A: người ra đòn (target có player). */
export function drawSkillBannerLane(scene,c,e,age,A,H,lane,now=Date.now()){
 if(!A||e.stunned||e.dot)return;
 const {tier}=bannerPlan(scene,e,now),life=BANNER_MS[tier]||1800,k=age/life;if(k<0||k>1)return;
 const el=arenaElement(e.skill?.tech),[main,core,deep]=ARENA_ELEMENT_COLORS[el]||ARENA_ELEMENT_COLORS.sword;
 const gold=tier===4,edge=gold?'#ffe7a0':core,mid=gold?'#e8a92a':main,dark=gold?'#2a1300':deep;
 const left=A.x<450,dir=left?1:-1,h=TIER_H[tier]||128,cy=H*LANE_Y[lane],slope=(lane%2?1:-1)*.07;
 const inK=ease(clamp(k/.12)),outK=clamp((k-.85)/.15),slide=(1-inK)*-900*dir+outK*700*dir,alpha=clamp(Math.min(k/.06,(1-k)/.12));
 const lv=scene.arena?.current?.fighters?.[e.by]?.kit?.[Math.max(0,(e.slot||1)-1)]?.lv;
 const title=(e.skill?.name||'').toUpperCase()+(lv&&e.slot?' LV'+lv:'')+(e.crit&&e.slot&&e.slot<5?' · BẠO KÍCH!':'');
 const who=scene.arena?.current?.fighters?.[e.by]?.name||'',tag=(e.slot?'SK'+e.slot+' · ':'')+SLOT_TAG[e.slot||0];
 c.save();c.globalAlpha=alpha;c.translate(slide,0);
 // Dải nghiêng: mép dưới thấp bên trái, cao bên phải (hoặc ngược lại theo tầng).
 const yL=cy-slope*450,yR=cy+slope*450,path=()=>{c.beginPath();c.moveTo(-40,yL-h/2);c.lineTo(940,yR-h/2);c.lineTo(940,yR+h/2);c.lineTo(-40,yL+h/2);c.closePath();};
 const g=c.createLinearGradient(0,0,900,0);
 if(left){g.addColorStop(0,dark+'f2');g.addColorStop(.35,mid+'f0');g.addColorStop(.7,dark+'f0');g.addColorStop(1,'#05070df0');}
 else{g.addColorStop(0,'#05070df0');g.addColorStop(.3,dark+'f0');g.addColorStop(.65,mid+'f0');g.addColorStop(1,dark+'f2');}
 path();c.fillStyle=g;c.fill();
 // Vệt sáng + sét/hạt theo hệ bên trong dải.
 c.save();path();c.clip();
 c.globalAlpha=alpha*.55;c.strokeStyle=edge;c.lineWidth=2;
 for(let i=0;i<(tier>=3?14:9);i++){const yy=cy-h/2+((i*41+e.n*13)%h),xx=((i*137+age*1.1+e.n*29)%1100)-100,len=60+((i*53)%140);c.beginPath();c.moveTo(xx,yy+slope*(xx-450));c.lineTo(xx+len,yy+slope*(xx+len-450));c.stroke();}
 c.globalAlpha=alpha*.8;
 if(el==='lightning'||tier>=3)for(let i=0;i<(tier>=3?3:2);i++){const bx=left?560+i*120:340-i*120;bolt2(c,bx,cy-h/2-10,bx+(i%2?40:-30),cy+h/2+10,e.n*7+i+Math.floor(age/90),i%2?core:'#ffffff',i%2?2:3);}
 const sx=(left?0:900)+dir*((age*1.4)%1300)-dir*200,sg=c.createLinearGradient(sx-90,0,sx+90,0);sg.addColorStop(0,'#ffffff00');sg.addColorStop(.5,'#ffffff55');sg.addColorStop(1,'#ffffff00');c.globalAlpha=alpha;c.fillStyle=sg;c.fillRect(sx-90,cy-h,180,h*2);
 c.restore();
 // Viền sáng 2 mép.
 c.globalAlpha=alpha;for(const [off,w,col] of [[-h/2,4,edge],[-h/2-6,1.5,'#ffffff'],[h/2,4,edge],[h/2+6,1.5,'#ffffff']]){c.strokeStyle=col;c.lineWidth=w;c.beginPath();c.moveTo(-40,yL+off);c.lineTo(940,yR+off);c.stroke();}
 if(gold){const fr=frameImage(scene,4);if(fr)c.drawImage(fr,-30,cy-h*.78,960,h*1.56);}
 // Nhân vật tràn ra ngoài dải, nghiêng như đang ra chiêu.
 const pic=portrait(scene,A),px=left?150:750;
 if(pic){const ph=h*1.75,pw=ph*pic.width/pic.height,lean=dir*-.07+Math.sin(age*.012)*.015;c.save();c.translate(px,cy+h*.38);c.rotate(lean);if(!left)c.scale(-1,1);c.drawImage(pic,-pw/2,-ph,pw,ph);c.restore();}
 else{c.globalAlpha=alpha*.35;txt(c,BANNER_GLYPH[el]||'武',px,cy+4,h*.9,edge,{stroke:null});c.globalAlpha=alpha;}
 // Tag ô chiêu.
 const tx=left?560:340,ty=cy-h*.3+slope*(tx-450);
 c.font='900 15px "Segoe UI",Arial,sans-serif';const tw=c.measureText(tag).width+22;
 c.fillStyle='#071423ee';c.strokeStyle=edge;c.lineWidth=1.5;c.beginPath();c.roundRect?c.roundRect(tx-tw/2,ty-12,tw,24,12):c.rect(tx-tw/2,ty-12,tw,24);c.fill();c.stroke();
 txt(c,tag,tx,ty+1,14,edge,{stroke:null,weight:'900'});
 // Tên chiêu (chữ chân phương đậm, viền tối dày cho rõ khi bị nén video) + tên người.
 const fy=cy+4+slope*(tx-450),size=tier===4?44:tier===3?40:36;
 c.font=`900 ${size}px "Times New Roman","Segoe UI",serif`;c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';
 c.lineWidth=9;c.strokeStyle='#05070d';c.strokeText(title,tx,fy,560);
 if(gold){const tg=c.createLinearGradient(0,fy-size/2,0,fy+size/2);tg.addColorStop(0,'#fffbe6');tg.addColorStop(.55,'#ffd34d');tg.addColorStop(1,'#ff9b2e');c.fillStyle=tg;}else c.fillStyle='#ffffff';
 c.fillText(title,tx,fy,560);
 if(who)txt(c,'— '+who+(e.from?' · '+e.from+' tặng':'')+' —',tx,fy+size*.78,17,gold?'#ffe9b0':edge,{width:4,weight:'800',max:520});
 c.restore();
}
