// 16/11/2026 (chủ game): TỌA KỸ BÍ CẢNH — sự kiện phát Linh Châu. Màn nhẹ kiểu Ngũ Đường Giao Lưu (avatar tròn trên map).
// Tuyển 30 s (gõ "bicanh") → 3 làn yêu thú (70 s/làn) chui ra từ 6 cửa hang → Thú vương (90 s) → vinh danh 15 s.
// Avatar tự đánh yêu thú gần nhất; "danh"/"6" lao lên đánh mạnh (hồi 3,5 s). Quà = chiêu (GIFT_TIERS) + cộng dồn coin để nhận châu.
// Thưởng: ai góp đủ sát thương nhận 1 Linh Châu xanh; top 3 sát thương Thú vương thêm 1 châu xanh;
// tổng quà trong lượt ≥300 → 1 châu tím, ≥500 → 2 châu tím, ≥1.000 → 1 châu vàng (Thần).
// Luật LIVE: không nói "ngẫu nhiên/tỷ lệ", không hứa thưởng cho tim. Vài trăm người: lưới ô 160 px, fx ≤ 96, yêu thú sống ≤ 70.
import {stageConflict} from './stage-lock.mjs';
import {grantOrbs,mountBonus} from './mounts.mjs';
import {BOSS_POOL,giftTier,orbsForCoins,BURN_MS,REALM_MAPS,realmLayout} from './public/mount-realm-layout.js';
export const REGISTER_MS=30000,WAVE_MS=70000,BOSS_MS=90000,PODIUM_MS=15000;
export const MIN_DAMAGE=30,MANUAL_CD=3500,MAX_MOBS=70,RANGE=170;
const SPEED=72,MOB_SPEED=34,GRID=160,MAX_FX=96,CAST_MS=1800,HEARTS_PER_CAST=20;
const real=p=>p&&!p.resident&&!p.puppet&&!p.webOnly&&p.actorKind!=='npc';
const fail=message=>({ok:false,message});
const hash=s=>{let h=2166136261;for(const ch of String(s))h=Math.imul(h^ch.charCodeAt(0),16777619);return h>>>0;};
// 17/11: nhiều map — L = bố cục map của lượt đang chạy (đặt ở đầu mỗi hàm vào: tick/lệnh/quà/tim).
let L=REALM_MAPS[0];const use=e=>(L=realmLayout(e));
const clampX=x=>Math.max(L.bounds.x0,Math.min(L.bounds.x1,x)),clampY=y=>Math.max(L.bounds.y0,Math.min(L.bounds.y1,y));
export const mountRealmActive=w=>['registration','running','boss'].includes(w.mountRealm?.phase);
export const mountRealmVisible=(w,now)=>mountRealmActive(w)||w.mountRealm?.podiumUntil>now;
const power=p=>Math.max(7,Math.min(20,Math.log10(Math.max(0,p.totalQi||0)+10)*2))*(1+mountBonus(p,'arena'));

function enroll(w,p,now){
 const e=w.mountRealm;use(e);if(!real(p)||w.playTransfers?.[p.id]?.phase==='web')return null;const ARENA=L.arena;
 if(!Object.hasOwn(e.members,p.id)){
  const h=hash(p.id),a=(h%360)*Math.PI/180,r=(h>>>9)%100/100;
  Object.defineProperty(e.members,p.id,{value:{id:p.id,x:Math.round(ARENA.x+Math.cos(a)*ARENA.rx*.85*Math.sqrt(r)),y:Math.round(ARENA.y+Math.sin(a)*ARENA.ry*.85*Math.sqrt(r)),dmg:0,bossDmg:0,coins:0,hearts:0,nextCastAt:now+800+h%900,lastManual:0,boostUntil:0,joinedAt:now},enumerable:true,writable:true,configurable:true});
 }
 return e.members[p.id];
}
export function startMountRealm(w,now,ctx){
 if(mountRealmActive(w))return fail('Tọa Kỹ Bí Cảnh đang mở.');
 const busy=stageConflict(w,now);if(busy)return fail('Đang có '+busy+' • chờ kết thúc.');
 const boss=BOSS_POOL.filter(id=>id!==w.lastRealmBoss);const pick=boss[hash(now)%boss.length];w.lastRealmBoss=pick;
 const maps=REALM_MAPS.filter(m=>m.id!==w.lastRealmMap),map=maps[hash('map'+now)%maps.length].id;w.lastRealmMap=map;
 w.mountRealm={id:'realm-'+now,phase:'registration',startedAt:now,registrationEndsAt:now+REGISTER_MS,members:{},mobs:[],boss:null,bossMount:pick,map,wave:-1,spawned:0,quota:0,fx:[],seq:0};
 ctx.emit(w,null,'TỌA KỸ BÍ CẢNH MỞ CỬA • gõ bicanh để vào · đánh yêu thú nhặt Linh Châu','mount-realm',now,{realmStart:true});
 return {ok:true};
}
export function stopMountRealm(w,now,ctx){
 if(!mountRealmVisible(w,now))return fail('Chưa mở Tọa Kỹ Bí Cảnh.');
 w.mountRealm.phase='cancelled';w.mountRealm.podiumUntil=0;ctx.emit(w,null,'Tọa Kỹ Bí Cảnh đã đóng','mount-realm',now,{realmEnd:true,cancelled:true});return {ok:true};
}
function grid(list){const g=new Map();for(const m of list){const k=Math.floor(m.x/GRID)+':'+Math.floor(m.y/GRID);let c=g.get(k);if(!c)g.set(k,c=[]);c.push(m);}return g;}
function nearest(g,m,maxRing=8){
 const cx=Math.floor(m.x/GRID),cy=Math.floor(m.y/GRID);let best=null,bd=Infinity;
 for(let r=0;r<=maxRing;r++){
  for(let dx=-r;dx<=r;dx++)for(let dy=-r;dy<=r;dy++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;for(const o of g.get((cx+dx)+':'+(cy+dy))||[]){if(o.hp<=0)continue;const d=Math.hypot(o.x-m.x,o.y-m.y);if(d<bd){bd=d;best=o;}}}
  if(best&&bd<=r*GRID)break;
 }
 return best?{target:best,dist:bd}:null;
}
function around(list,x,y,radius){return list.filter(o=>o.hp>0&&Math.hypot(o.x-x,o.y-y)<=radius).sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y));}
function pushFx(e,fx){e.fx.push(fx);if(e.fx.length>MAX_FX)e.fx.splice(0,e.fx.length-MAX_FX);}
function step(m,tx,ty,speed){const d=Math.hypot(tx-m.x,ty-m.y);if(d<1)return;const k=Math.min(1,speed/d);m.x=Math.round(clampX(m.x+(tx-m.x)*k));m.y=Math.round(clampY(m.y+(ty-m.y)*k));}
function strike(e,member,target,amount,now,kind){
 const dmg=Math.max(1,Math.round(Math.min(target.hp,amount)));target.hp-=dmg;member.dmg+=dmg;if(target===e.boss)member.bossDmg+=dmg;
 if(target.hp<=0&&target!==e.boss)e.kills=(e.kills||0)+1;
 return dmg;
}
// Một đòn (value>0 = quà → đánh lan).
function cast(w,e,member,target,now,{manual=false,value=0}={}){
 const p=w.players[member.id];if(!p)return;
 const tier=value>0?giftTier(value):null,base=power(p)*(manual?1.5:1)*(member.boostUntil>now?1.5:1)*(tier?1+Math.log10(value+1)*.5:1);
 const pool=e.boss&&e.boss.hp>0?[e.boss]:e.mobs;
 const victims=tier?.spread?[target,...around(pool,target.x,target.y,tier.radius).filter(o=>o!==target).slice(0,tier.spread)]:[target];
 let total=0;for(const v of victims)total+=strike(e,member,v,base*(v===target?1:.7),now);
 pushFx(e,{id:e.id+':'+(e.seq++),from:member.id,at:now,x1:member.x,y1:member.y,x2:target.x,y2:target.y,damage:total,boss:target===e.boss||undefined,manual:manual||undefined,assist:tier?.id,hits:victims.length>1?victims.slice(1).map(v=>[v.x,v.y]):undefined});
 member.nextCastAt=now+CAST_MS*(member.boostUntil>now?.7:1);
}
function spawnMobs(e,now){
 use(e);const wave=L.waves[e.wave];if(!wave||e.spawned>=e.quota)return;
 const alive=e.mobs.filter(m=>m.hp>0).length,room=MAX_MOBS-alive;if(room<=0)return;
 const n=Math.min(room,6,e.quota-e.spawned),hp=Math.round(wave.hp*(1+Object.keys(e.members).length/40));
 for(let i=0;i<n;i++){const s=e.spawned++,door=L.portals[(hash(e.id+':'+s)%L.portals.length)];e.mobs.push({id:e.wave+':'+s,x:door.x,y:door.y,hp,maxHp:hp,wave:e.wave});}
}
function nextWave(w,e,now,ctx){
 use(e);e.wave++;e.mobs=[];e.spawned=0;
 if(e.wave<L.waves.length){const n=Object.keys(e.members).length;e.quota=Math.max(8,Math.min(160,Math.round(8+n*1.4)));e.waveEndsAt=now+WAVE_MS;
  ctx.emit(w,null,'Làn yêu thú thứ '+(e.wave+1)+' • '+L.waves[e.wave].name,'mount-realm',now,{realmWave:e.wave});return;}
 const n=Object.keys(e.members).length;e.phase='boss';e.waveEndsAt=now+BOSS_MS;
 const hp=Math.max(900,Math.round(n*160));e.boss={id:'boss',x:L.arena.x,y:L.arena.y-40,hp,maxHp:hp,mount:e.bossMount};
 ctx.emit(w,null,'THÚ VƯƠNG XUẤT HIỆN • hợp lực thu phục','mount-realm',now,{realmBoss:e.bossMount});
}
function battleTick(w,e,now,ctx){
 if(e.phase==='running')spawnMobs(e,now);
 burnTick(w,e,now);
 // Yêu thú tản ra khắp sân (mỗi con một điểm dừng riêng), không dồn một cục ở giữa.
 for(const m of e.mobs)if(m.hp>0){const h=hash(m.id),a=(h%360)*Math.PI/180,r=.25+.6*Math.sqrt((h>>>9)%1000/1000);step(m,L.arena.x+Math.cos(a)*L.arena.rx*r,L.arena.y+Math.sin(a)*L.arena.ry*r,MOB_SPEED);}
 e.mobs=e.mobs.filter(m=>m.hp>0);
 const targets=e.boss&&e.boss.hp>0?[e.boss]:e.mobs,g=grid(targets);
 const roster=Object.values(e.members).filter(m=>{const p=w.players[m.id];return real(p)&&w.playTransfers?.[m.id]?.phase!=='web'&&ctx.active(w,p,now);});
 for(const m of roster){
  const found=nearest(g,m);if(!found)continue;
  if(found.dist<=RANGE){if(now>=m.nextCastAt)cast(w,e,m,found.target,now);}
  else{const a=(hash(m.id)%360)*Math.PI/180,o=found.target===e.boss?RANGE*.8:RANGE*.55;step(m,found.target.x+Math.cos(a)*o,found.target.y+Math.sin(a)*o*.6,SPEED*(m.boostUntil>now?1.4:1));}
 }
 spread(roster);
}
// 17/11: lửa thiêu sàn — mỗi giây đốt MỌI yêu thú đang sống (~3 nhịp là cháy rụi làn thường), Thú vương mất ít hơn. Công tính cho người tặng.
function burnTick(w,e,now){
 const b=e.burn;if(!b||now>=b.until)return;const m=e.members[b.by],p=m&&w.players[m.id];if(!p)return;
 for(const mob of e.mobs)if(mob.hp>0)strike(e,m,mob,mob.maxHp*.36,now);
 if(e.boss&&e.boss.hp>0)strike(e,m,e.boss,Math.max(power(p)*4,e.boss.maxHp*.012),now);
}
// Giãn cách avatar (chỉ xét ô lưới + ô kề) → vây quanh mục tiêu thành vòng, không chồng lên nhau.
const SPACING=36;
function spread(list){
 const g=grid(list);
 for(const [key,cell] of g){const [cx,cy]=key.split(':').map(Number);
  for(const m of cell)for(let dx=0;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){if(dx===0&&dy<0)continue;let seen=0;for(const o of g.get((cx+dx)+':'+(cy+dy))||[]){if(++seen>14)break; /* ô quá đông: chỉ đẩy 14 người gần, giữ nhịp < 25 ms */
   if(o===m||(dx===0&&dy===0&&o.id<=m.id))continue;const d=Math.hypot(o.x-m.x,o.y-m.y);if(d>=SPACING)continue;
   const push=(SPACING-d)/2,ang=d>.5?Math.atan2(o.y-m.y,o.x-m.x):(hash(m.id+o.id)%360)*Math.PI/180;
   m.x=Math.round(clampX(m.x-Math.cos(ang)*push));m.y=Math.round(clampY(m.y-Math.sin(ang)*push));o.x=Math.round(clampX(o.x+Math.cos(ang)*push));o.y=Math.round(clampY(o.y+Math.sin(ang)*push));}}}
}
export function tickMountRealm(w,now,ctx){
 const e=w.mountRealm;if(!e||!mountRealmActive(w))return;use(e);
 if(e.phase==='registration'){if(now<e.registrationEndsAt)return;
  if(!Object.keys(e.members).length){e.phase='cancelled';ctx.emit(w,null,'Tọa Kỹ Bí Cảnh khép lại • chưa có đạo hữu vào','mount-realm',now,{realmEnd:true});return;}
  e.phase='running';e.battleStartedAt=now;nextWave(w,e,now,ctx);return;}
 if(now-(e.tickAt||0)<1000)return;e.tickAt=now;
 battleTick(w,e,now,ctx);
 if(e.phase==='running'&&(now>=e.waveEndsAt||e.spawned>=e.quota&&!e.mobs.length))nextWave(w,e,now,ctx);
 else if(e.phase==='boss'&&(e.boss.hp<=0||now>=e.waveEndsAt))finish(w,now,ctx);
}
function finish(w,now,ctx){
 const e=w.mountRealm;e.phase='finished';e.podiumUntil=now+PODIUM_MS;e.endsAt=now;if(e.awarded)return;e.awarded=true;
 const tamed=e.boss?.hp<=0,members=Object.values(e.members),top=members.filter(m=>m.bossDmg>0).sort((a,b)=>b.bossDmg-a.bossDmg||(a.id<b.id?-1:1)).slice(0,3);
 const rows=[];let common=0;
 for(const m of members){
  const p=w.players[m.id];if(!real(p)||w.playTransfers?.[p.id]?.phase==='web')continue;
  const extra=top.includes(m)?1:0,base=m.dmg>=MIN_DAMAGE?1:0,gift=orbsForCoins(m.coins);
  const got={common:base+extra,vip:gift.vip,divine:gift.divine};
  if(got.common)common+=grantOrbs(w,p,'common',got.common,now,ctx.emit,{silent:true});
  if(got.vip)grantOrbs(w,p,'vip',got.vip,now,ctx.emit);
  if(got.divine)grantOrbs(w,p,'divine',got.divine,now,ctx.emit);
  if(got.common||got.vip||got.divine)rows.push({id:p.id,name:p.name,dmg:m.dmg,bossDmg:m.bossDmg,...got});
 }
 e.results={rows:rows.slice(0,150).map(r=>({id:r.id,common:r.common,vip:r.vip,divine:r.divine})),tamed,top:top.map(m=>({id:m.id,name:w.players[m.id]?.name,bossDmg:m.bossDmg})),mvp:members.sort((a,b)=>b.dmg-a.dmg).slice(0,5).map(m=>({id:m.id,name:w.players[m.id]?.name,dmg:m.dmg})),rewarded:rows.length,commonOrbs:common};
 for(const [i,t] of top.entries()){const p=w.players[t.id];if(p)ctx.emit(w,p,'Bí Cảnh hạng '+(i+1)+' sát thương Thú vương • nhận thêm Linh Châu xanh','mount-realm',now,{realmTop:i+1});}
 ctx.emit(w,null,'TỌA KỸ BÍ CẢNH KHÉP LẠI • '+(tamed?'Thú vương bị thu phục · ':'')+rows.length+' đạo hữu nhận Linh Châu · gõ truyencong','mount-realm',now,{realmEnd:true,realmTamed:tamed});
 ctx.audit?.(w,'mount-realm',now,{id:e.id,members:members.length,rewarded:rows.length,rows:rows.slice(0,300)});
}
export function mountRealmCommand(w,p,cmd,now,ctx){
 const e=w.mountRealm;if(e)use(e);const join=cmd==='bicanh',attack=(cmd==='danh'||cmd==='6')&&['running','boss'].includes(e?.phase);
 if(!join&&!attack)return null;
 if(!mountRealmActive(w))return join?fail('Tọa Kỹ Bí Cảnh chưa mở.'):null;
 const m=enroll(w,p,now);if(!m)return fail('Chỉ đệ tử đang ở LIVE mới vào được Bí Cảnh.');
 if(join&&!attack)return {ok:true,message:'Đã vào Bí Cảnh.'};
 if(now-m.lastManual<MANUAL_CD)return fail('Chiêu đang hồi.');
 m.lastManual=now;
 const targets=e.boss&&e.boss.hp>0?[e.boss]:e.mobs,found=nearest(grid(targets),m,40);
 if(found){if(found.dist>RANGE){step(m,found.target.x,found.target.y,found.dist-RANGE*.8);m.dashAt=now;}cast(w,e,m,found.target,now,{manual:true});}
 return {ok:true};
}
export function mountRealmGift(w,p,value,now,ctx){
 const e=w.mountRealm;if(!mountRealmActive(w)||value<1)return null;use(e);
 const m=enroll(w,p,now);if(!m)return null;
 m.coins+=value;m.boostUntil=Math.max(m.boostUntil,now+Math.min(16000,4000+Math.sqrt(value)*500));
 const tier=giftTier(value);(e.gifts??=[]).push({id:e.id+':g'+(e.seq++),user:p.id,at:now,value,tier:tier.id,name:tier.name});if(e.gifts.length>24)e.gifts.splice(0,e.gifts.length-24);
 if(['running','boss'].includes(e.phase)){const targets=e.boss&&e.boss.hp>0?[e.boss]:e.mobs,found=nearest(grid(targets),m,40);if(found)cast(w,e,m,found.target,now,{value});
  if(tier.burn)e.burn={by:m.id,at:now,until:Math.max(now,e.burn?.until||0)+BURN_MS}; // 17/11: HỎA THIÊU — lửa phủ cả sàn, quà nối tiếp thì cộng dồn thời gian
 }
 return {tier:tier.id,name:tier.name,coins:m.coins};
}
// Tim tự vào bí cảnh và tích thành đòn đánh (không hứa thưởng gì cho tim).
export function mountRealmHearts(w,p,count,now){
 const e=w.mountRealm;if(!['running','boss'].includes(e?.phase)||count<1)return 0;use(e);
 const m=enroll(w,p,now);if(!m)return 0;m.hearts+=count;
 if(m.hearts<HEARTS_PER_CAST||now-(m.heartCastAt||0)<2000)return 0;
 m.hearts-=HEARTS_PER_CAST;m.heartCastAt=now;
 const targets=e.boss&&e.boss.hp>0?[e.boss]:e.mobs,found=nearest(grid(targets),m,40);if(found&&found.dist<=RANGE*1.5)cast(w,e,m,found.target,now);
 return 1;
}
// Gửi xuống overlay: gọn (không gửi coin từng người).
export function mountRealmView(w,now){
 const e=w.mountRealm;if(!e||!mountRealmVisible(w,now))return null;
 const members=Object.values(e.members);
 return {id:e.id,map:e.map||REALM_MAPS[0].id,phase:e.phase,active:mountRealmActive(w),registrationEndsAt:e.registrationEndsAt,waveEndsAt:e.waveEndsAt,wave:e.wave,bossMount:e.bossMount,podiumUntil:e.podiumUntil,
  boss:e.boss?{x:e.boss.x,y:e.boss.y,hp:e.boss.hp,maxHp:e.boss.maxHp,mount:e.boss.mount}:null,
  mobs:e.mobs.map(m=>[m.x,m.y,m.wave,Math.round(m.hp/m.maxHp*100)]),
  members:members.map(m=>({id:m.id,name:w.players[m.id]?.name,avatar:w.players[m.id]?.avatar,x:m.x,y:m.y,boost:m.boostUntil>now||undefined,dash:now-(m.dashAt||0)<800||undefined})),
  top:members.filter(m=>m.dmg>0).sort((a,b)=>b.dmg-a.dmg).slice(0,5).map(m=>({id:m.id,name:w.players[m.id]?.name,dmg:m.dmg})),
  burn:e.burn&&now<e.burn.until?{at:e.burn.at,until:e.burn.until,name:w.players[e.burn.by]?.name}:null,
  fx:e.fx.filter(f=>now-f.at<1600),gifts:(e.gifts||[]).filter(g=>now-g.at<5000).map(g=>({...g,userName:w.players[g.user]?.name})),results:e.results||null,count:members.length};
}
