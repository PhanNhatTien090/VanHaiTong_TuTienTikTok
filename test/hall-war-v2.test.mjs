import test from 'node:test';
import assert from 'node:assert/strict';
import {startHallWar,tickHallWar,hallWarCommand,hallWarGift,hallWarView,battleTick,RESPAWN_MS,BATTLE_MS} from '../hall-war.mjs';
import {CAMPS,ALTAR,BOUNDS,skillOf,giftTier} from '../public/hall-war-layout.js';
const N=1800000000000;
function world(list){
 const w={players:{},nguDuong:{members:{}}};
 for(const [id,index,name] of list){w.players[id]={id,name:name||id,realm:3,totalQi:100000};w.nguDuong.members[id]={index};}
 const events=[],ctx={active:()=>true,emit(w,p,text,kind,now,extra){events.push({text,extra,id:p?.id});},contribute(){},hallPoints(){},gain(){return 0;}};
 return {w,ctx,events};
}
function running(list){const s=world(list);assert.ok(startHallWar(s.w,N,s.ctx).ok);tickHallWar(s.w,N+30000,s.ctx);assert.equal(s.w.hallWar.phase,'running');return s;}
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
test('everyone spawns at their own camp, marches to the altar, and engages the nearest enemy that comes close',()=>{
 const {w,ctx}=world([['a',0],['b',1],['c',2]]);assert.ok(startHallWar(w,N,ctx).ok);const e=w.hallWar,a=e.members.a;
 assert.ok(dist(a,CAMPS[0])<80);assert.ok(dist(e.members.b,CAMPS[1])<80);assert.ok(dist(e.members.c,CAMPS[2])<80);
 const before={...a};tickHallWar(w,N+30000,ctx);
 assert.equal(a.target,null);assert.ok(dist(a,ALTAR)<dist(before,ALTAR));assert.ok(dist(a,before)>20&&dist(a,before)<=80);
 Object.assign(a,{x:450,y:700});Object.assign(e.members.b,{x:450+250,y:700});Object.assign(e.members.c,{x:450,y:700+280});
 battleTick(w,e,N+31000,ctx);assert.equal(a.target,'b');
});
test('casts only inside skill range, on the nearest enemy, and the server keeps everyone inside map bounds',()=>{
 const {w,ctx}=running([['a',0],['b',1],['c',1]]),e=w.hallWar;
 Object.assign(e.members.a,{x:400,y:800,nextCastAt:0});Object.assign(e.members.b,{x:400+skillOf(0).range-20,y:800,nextCastAt:N*2});Object.assign(e.members.c,{x:820,y:1400,nextCastAt:N*2});
 battleTick(w,e,N+31000,ctx);
 const fx=e.fx.filter(f=>f.from==='a');assert.equal(fx.length,1);assert.equal(fx[0].to,'b');assert.ok(e.members.b.hp<100);assert.equal(e.members.c.hp,100);
 for(let i=0;i<60;i++)battleTick(w,e,N+32000+i*1000,ctx);
 for(const m of Object.values(e.members)){assert.ok(m.x>=BOUNDS.x0&&m.x<=BOUNDS.x1);assert.ok(m.y>=BOUNDS.y0&&m.y<=BOUNDS.y1);}
});
test('knocked-out members return to their camp after the respawn delay and appear in the feed',()=>{
 const {w,ctx}=running([['a',0],['b',1]]),e=w.hallWar,b=e.members.b;
 Object.assign(e.members.a,{x:450,y:800,nextCastAt:0});Object.assign(b,{x:500,y:800,hp:1,nextCastAt:N*2});
 battleTick(w,e,N+31000,ctx);
 assert.equal(b.hp,0);assert.equal(b.respawnAt,N+31000+RESPAWN_MS);assert.equal(e.members.a.kills,1);
 assert.equal(e.feed.at(-1).from,'a');assert.equal(e.feed.at(-1).to,'b');
 const view=hallWarView(w,N+31000);assert.equal(view.feed.at(-1).fromName,'a');assert.ok(view.fx.some(f=>f.knockout));
 battleTick(w,e,N+31000+RESPAWN_MS,ctx);
 assert.equal(b.hp,100);assert.ok(dist(b,CAMPS[1])<80);assert.ok(b.shieldUntil>N+31000+RESPAWN_MS);
});
test('the hall holding the central altar alone gains points every beat',()=>{
 const {w,ctx}=running([['a',0],['b',1]]),e=w.hallWar;
 Object.assign(e.members.a,{x:ALTAR.x,y:ALTAR.y});Object.assign(e.members.b,{x:BOUNDS.x1,y:BOUNDS.y1});
 const before=e.teams[0].score;battleTick(w,e,N+31000,ctx);
 assert.equal(e.altar.index,0);assert.ok(e.teams[0].score>=before+10);
});
test('đánh @tên locks a named enemy even when someone else is nearer, and 6 dashes into range',()=>{
 const {w,ctx}=running([['a',0,'An'],['b',1,'Bình Minh'],['c',2,'Cường']]),e=w.hallWar;
 Object.assign(e.members.a,{x:450,y:800});Object.assign(e.members.c,{x:520,y:800,nextCastAt:N*2});Object.assign(e.members.b,{x:800,y:1300,nextCastAt:N*2});
 assert.equal(hallWarCommand(w,w.players.a,['danh','binh','minh'],N+30500,ctx).ok,true);
 assert.equal(e.members.a.lockId,'b');
 battleTick(w,e,N+31000,ctx);assert.equal(e.members.a.target,'b');
 assert.equal(hallWarCommand(w,w.players.a,['danh','khong','ai'],N+31200,ctx).ok,false);
 const before=dist(e.members.a,e.members.b);
 assert.equal(hallWarCommand(w,w.players.a,['duongchien'],N+31500,ctx).ok,true);
 assert.ok(dist(e.members.a,e.members.b)<=skillOf(0).range);assert.ok(dist(e.members.a,e.members.b)<before);
 assert.ok(e.fx.some(f=>f.from==='a'&&f.to==='b'&&f.manual));
 assert.equal(hallWarCommand(w,w.players.a,['duongchien'],N+32000,ctx).ok,false);
});
test('each gift tier grants its own assist skill: boost, heal, swords, thunder, hall ultimate, grand ultimate',()=>{
 assert.deepEqual([1,4,5,9,10,29,30,98,99,299,300,5000].map(v=>giftTier(v).id),['boost','boost','heal','heal','swords','swords','thunder','thunder','ultimate','ultimate','grand','grand']);
 const list=[['a',0]];for(let i=0;i<14;i++)list.push(['e'+i,1+i%4]);
 const {w,ctx}=running(list),e=w.hallWar;
 Object.assign(e.members.a,{x:450,y:800});for(let i=0;i<14;i++)Object.assign(e.members['e'+i],{x:450+((i%5)-2)*30,y:900+Math.floor(i/5)*30,shieldUntil:0});
 const small=hallWarGift(w,w.players.a,1,N+30400,ctx);assert.equal(small.assist,'boost');assert.ok(e.members.a.boostUntil>N+30400);assert.equal(e.fx.at(-1).assist,'boost');assert.equal(e.fx.at(-1).kind,'assist');
 const swords=hallWarGift(w,w.players.a,10,N+30500,ctx);assert.equal(swords.struck,true);
 const flying=e.fx.filter(f=>f.assist==='swords');assert.equal(flying.length,3);assert.equal(new Set(flying.map(f=>f.to)).size,3);
 const big=hallWarGift(w,w.players.a,300,N+30600,ctx);assert.equal(big.struck,true);
 const fx=e.fx.at(-1);assert.equal(fx.grand,true);assert.equal(1+(fx.hits?.length||0),11);
 const mid=hallWarGift(w,w.players.a,30,N+30700,ctx);assert.equal(mid.struck,true);assert.equal(e.fx.at(-1).assist,'thunder');assert.ok(1+(e.fx.at(-1).hits?.length||0)<=4);
 // Hồi Xuân Đan: người đang nghỉ được hồi sinh ngay tại trại, đầy máu + khiên.
 const down=e.members.e0;down.hp=0;down.respawnAt=N+40000;
 const heal=hallWarGift(w,w.players.e0,5,N+30800,ctx);assert.equal(heal.assist,'heal');assert.equal(down.hp,100);assert.ok(down.shieldUntil>N+30800);
 assert.equal(e.fx.at(-1).assist,'heal');
});
test('combo strikes from two hall-mates on the same target are flagged and crits appear',()=>{
 const {w,ctx}=running([['a',0],['a2',0],['b',1]]),e=w.hallWar;
 Object.assign(e.members.a,{x:450,y:800,nextCastAt:0});Object.assign(e.members.a2,{x:430,y:820,nextCastAt:0});Object.assign(e.members.b,{x:500,y:800,nextCastAt:N*2});
 let combos=0,crits=0;
 for(let i=0;i<40;i++){e.members.b.hp=100;e.members.a.nextCastAt=e.members.a2.nextCastAt=0;battleTick(w,e,N+31000+i*1000,ctx);}
 for(const f of e.fx){if(f.combo)combos++;if(f.crit)crits++;}
 assert.ok(combos>0);assert.ok(crits>0);
});
test('three hundred fighters resolve each beat quickly and the view stays compact',()=>{
 const list=[];for(let i=0;i<300;i++)list.push(['p'+i,i%5,'Tu sĩ '+i]);
 const {w,ctx}=running(list),e=w.hallWar;
 const t0=performance.now();for(let i=0;i<60;i++)tickHallWar(w,N+31000+i*1000,ctx);const per=(performance.now()-t0)/60;
 assert.ok(per<15,'beat '+per.toFixed(2)+' ms');
 assert.ok(e.fx.length<=96);
 const view=JSON.stringify(hallWarView(w,N+90000));assert.ok(view.length<160000,'view '+view.length);
 assert.ok(e.teams.reduce((n,t)=>n+t.kills,0)>0);
});
test('a full battle lasts three minutes then finishes once',()=>{
 const {w,ctx}=running([['a',0],['b',1]]);
 assert.equal(w.hallWar.endsAt-w.hallWar.battleStartedAt,BATTLE_MS);assert.equal(BATTLE_MS,180000);
 for(let i=1;i<=181;i++)tickHallWar(w,N+30000+i*1000,ctx);
 assert.equal(w.hallWar.phase,'finished');assert.equal(w.hallWarHistory.length,1);
});
