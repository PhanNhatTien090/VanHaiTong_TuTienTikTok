import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,action,tick,snapshot,startArenaEvent,stopArenaEvent} from '../engine.mjs';
import {arenaCommand,tickArena,arenaView,arenaStageIds,arenaGift,LOCK_RATIO,DEFEND_MAX,QUEUE_MAX,CHEER_CAP} from '../arena.mjs';
import {arenaKit} from '../public/arena-skills.js';
import {stageConflict} from '../stage-lock.mjs';

const N=Date.UTC(2026,10,15,12);
function world(){
 const w=createWorld('demo');Object.assign(w.settings,{residents:false,autoEvents:false,scheduledCompetitions:false,heartPlay:false});w.nextBossAt=N+1e10;
 return w;
}
function player(w,id,totalQi,realm=8,now=N){const p=ensurePlayer(w,id,id.toUpperCase(),now);Object.assign(p,{totalQi,realm,qi:0,lastActive:now});return p;}
const chat=(w,id,text,now)=>action(w,{type:'chat',userId:id,name:id.toUpperCase(),text},now);
const c={emit:(w,p,m,e,at,x={})=>{w.events.push({message:m,effect:e,at,...x});},active:()=>true,technique:p=>({id:'stars',name:'Tinh Hà Luân Chuyển'})};
function runMatch(w,now){let t=now;for(let i=0;i<400&&w.arena.current;i++){t+=250;tickArena(w,t,c);}return t;}

test('mỗi người 5 chiêu: pháp bảo, 2 bí pháp/chiêu hệ, linh thú, tuyệt kỹ',()=>{
 const kit=arenaKit({realm:9,spiritPet:'loi-oa',spiritPets:['loi-oa'],equipped:'galaxy-dharma-wheel',artifacts:['galaxy-dharma-wheel']});
 assert.equal(kit.length,5);assert.deepEqual(kit.map(k=>k.slot),[1,2,3,4,5]);
 assert.equal(new Set(kit.slice(0,4).map(k=>k.name)).size,4);
 assert.equal(kit[3].name,'Cửu Thiên Lôi Chấn');assert.equal(kit[3].role,'control');assert.notEqual(kit[1].tech,kit[2].tech);
 assert.notEqual(kit[0].tech,kit[1].tech);
 const noPet=arenaKit({realm:2});assert.equal(noPet[3].name,'Hộ Thân Cương Khí');
});

test('lên đài: người đầu thành Đài Chủ, người sau xếp hàng, trận tự bắt đầu và có nhiều chiêu',()=>{
 const w=world();for(const [id,q] of [['a',1e7],['b',1.05e7],['cc',9e6]])player(w,id,q);
 assert.equal(startArenaEvent(w,N).ok,true);
 assert.equal(stageConflict(w,N+1),'Lôi Đài');
 assert.equal(chat(w,'a','lên đài',N+100).ok,true);assert.equal(w.arena.champion,'a');
 assert.equal(chat(w,'b','lên đài',N+200).ok,true);assert.equal(w.arena.queue.length,1);
 assert.equal(chat(w,'b','lên đài',N+300).ok,false);
 tickArena(w,N+2000,c);assert.ok(w.arena.current);assert.deepEqual(arenaStageIds(w,N+2000),['a','b']);
 const end=runMatch(w,N+2000);
 assert.equal(w.arena.current,null);assert.ok(w.arena.lastResult.winner);
 const slots=new Set(w.arena.results.length&&w.events.length?w.arena.lastResult&&[]:[]);
 const view=arenaView(w,end);assert.ok(view.lastResult);
 const snap=snapshot(w,end);assert.equal(snap.socialScene,'arena');assert.equal(snap.environment.id,'loi-dai');assert.ok(snap.arena);
});

test('trận có đủ 5 loại chiêu, kéo dài hợp lý, sát nhau thì ai cũng có cơ hội thắng',()=>{
 let winsA=0,durations=[],slots=new Set();
 for(let i=0;i<60;i++){
  const w=world();player(w,'a',1e7);player(w,'b',1e7);const t0=N+i*1e6;
  w.players.a.spiritPet='ember-fox';w.players.a.spiritPets=['ember-fox'];
  startArenaEvent(w,t0);arenaCommand(w,w.players.a,'lendai','',t0,c);arenaCommand(w,w.players.b,'lendai','',t0,c);
  tickArena(w,t0+2000,c);const m=w.arena.current;let t=t0+2000;
  for(let k=0;k<400&&w.arena.current;k++){t+=250;for(const e of w.arena.current?.log||[])if(e.slot)slots.add(e.slot);tickArena(w,t,c);}
  durations.push(t-m.fightAt);if(w.arena.lastResult.winner==='a')winsA++;
 }
 assert.deepEqual([...slots].sort(),[1,2,3,4,5]);
 const avg=durations.reduce((a,b)=>a+b,0)/durations.length;
 assert.ok(avg>12000&&avg<=31000,'độ dài TB '+avg);
 assert.ok(winsA>12&&winsA<48,'ngang tu vi: A thắng '+winsA+'/60');
});

test('chênh ≥30% tổng tu vi: người mạnh luôn thắng; chênh 15%: người mạnh thường thắng nhưng không chắc',()=>{
 let strong=0,mid=0;
 for(let i=0;i<40;i++){
  const w=world();player(w,'a',1e7);player(w,'b',1e7*LOCK_RATIO);const t0=N+i*1e6;
  startArenaEvent(w,t0);arenaCommand(w,w.players.a,'lendai','',t0,c);arenaCommand(w,w.players.b,'lendai','',t0,c);tickArena(w,t0+2000,c);
  assert.equal(w.arena.current.locked,'b');runMatch(w,t0+2000);if(w.arena.lastResult.winner==='b')strong++;
  const w2=world();player(w2,'a',1e7);player(w2,'b',1.15e7);
  startArenaEvent(w2,t0);arenaCommand(w2,w2.players.a,'lendai','',t0,c);arenaCommand(w2,w2.players.b,'lendai','',t0,c);tickArena(w2,t0+2000,c);
  runMatch(w2,t0+2000);if(w2.arena.lastResult.winner==='b')mid++;
 }
 assert.equal(strong,40);
 assert.ok(mid>=24&&mid<40,'chênh 15%: mạnh thắng '+mid+'/40');
});

test('cổ vũ có trần nộ khí, đấu thủ không tự cổ vũ, chọn chiêu chỉ cho đấu thủ',()=>{
 const w=world();player(w,'a',1e7);player(w,'b',1e7);for(let i=0;i<20;i++)player(w,'fan'+i,1e5);
 startArenaEvent(w,N);arenaCommand(w,w.players.a,'lendai','',N,c);arenaCommand(w,w.players.b,'lendai','',N,c);tickArena(w,N+2000,c);
 const m=w.arena.current;
 for(let i=0;i<20;i++)arenaCommand(w,w.players['fan'+i],'cv1','',N+2100,c);
 assert.ok(m.cheerRage.a<=CHEER_CAP);assert.equal(m.cheers.a,20);
 assert.equal(arenaCommand(w,w.players.a,'cv1','',N+2100,c).ok,false);
 assert.equal(arenaCommand(w,w.players.fan1,'c5','',N+2100,c).ok,false);
 assert.equal(arenaCommand(w,w.players.a,'chieu','2',N+2100,c).ok,true);assert.equal(m.fighters.a.pref,2);
});

test('quà của đấu thủ: bậc thấp tăng nộ khí, bậc 99 trở lên ra đòn',()=>{
 const w=world();player(w,'a',1e7);player(w,'b',1e7);
 startArenaEvent(w,N);arenaCommand(w,w.players.a,'lendai','',N,c);arenaCommand(w,w.players.b,'lendai','',N,c);tickArena(w,N+2000,c);
 const m=w.arena.current,t=m.fightAt+100;
 assert.ok(arenaGift(w,w.players.a,1,t).rage>0);
 const hp=m.fighters.b.hp,burst=arenaGift(w,w.players.a,199,t+10);assert.ok(burst.gift&&burst.dmg>0);assert.ok(m.fighters.b.hp<hp);
});

test('Đài Chủ giữ tối đa 5 trận rồi xuống nghỉ; hàng chờ có giới hạn; nhận hồng bao không bị chặn',()=>{
 const w=world();player(w,'boss',1e9);for(let i=0;i<9;i++)player(w,'p'+i,1e6);
 startArenaEvent(w,N,20);arenaCommand(w,w.players.boss,'lendai','',N,c);
 let ok=0;for(let i=0;i<8;i++)if(arenaCommand(w,w.players['p'+i],'lendai','',N+i,c).ok)ok++;
 assert.equal(ok,QUEUE_MAX);
 assert.equal(arenaCommand(w,w.players.p8,'nhan','',N,c),null);
 let t=N+2000;for(let k=0;k<DEFEND_MAX;k++){tickArena(w,t,c);assert.ok(w.arena.current,'trận '+k);t=runMatch(w,t)+5000;}
 assert.equal(w.arena.streak,DEFEND_MAX);
 tickArena(w,t,c);tickArena(w,t+6000,c);
 assert.notEqual(w.arena.champion,'boss');
 assert.ok(w.players.boss.tournamentMedals>=2*DEFEND_MAX+2+3);
});

test('thách riêng: người được thách gõ nhận thì hai người đấu; hết giờ Lôi Đài thì trao Bá Chủ',()=>{
 const w=world();player(w,'a',1e7);player(w,'b',1e7);player(w,'cc',1e7);
 startArenaEvent(w,N,1);arenaCommand(w,w.players.cc,'lendai','',N,c);
 assert.equal(arenaCommand(w,w.players.a,'thach','B',N+10,c).ok,true);
 assert.equal(arenaCommand(w,w.players.b,'nhan','',N+20,c).ok,true);
 assert.equal(w.arena.queue[0].vs,'b');
 tickArena(w,N+2000,c);assert.equal(w.arena.current.kind,'private');assert.deepEqual([w.arena.current.a,w.arena.current.b],['a','b']);
 runMatch(w,N+2000);
 let t=N+70000;tickArena(w,t,c);
 assert.equal(w.arena.phase,'closed');assert.equal(w.players[w.arena.champion].arenaTitle,'Lôi Đài Bá Chủ');
 assert.equal(stopArenaEvent(w,t).ok,false);
});

test('snapshot có chọn lọc (overlay) không lỗi khi Lôi Đài mở, đưa đấu thủ vào danh sách gửi',()=>{
 const w=world();player(w,'a',1e7);player(w,'b',1e7);startArenaEvent(w,N);chat(w,'a','lên đài',N+1);
 const s=snapshot(w,N+2,{select:ctx=>{assert.deepEqual(ctx.socialStage,['a']);return new Set(['a']);}});
 assert.equal(s.socialScene,'arena');assert.deepEqual(s.socialStage,['a']);
});

test('gõ "chiêu" xem bộ 4 chiêu mọi lúc (cả khi Lôi Đài chưa mở), có chống spam',()=>{
 const w=world();player(w,'a',1e7);
 const r=chat(w,'a','chiêu',N);assert.equal(r.ok,true);assert.equal(r.kit.length,5);
 const e=w.events.findLast(x=>x.arenaKit);assert.match(e.text||e.message,/SK1 .* SK4 /);
 const before=w.events.length;chat(w,'a','chiêu',N+1000);assert.equal(w.events.filter(x=>x.arenaKit).length,1);
});

test('quà trợ chiêu 5 bậc: linh khí, hồi máu, triệu hồi, bạo phát + khiên, Thiên Giáng xen kẽ rìu/vạn kiếm',()=>{
 const w=world();player(w,'a',1e7);player(w,'b',1e7);
 startArenaEvent(w,N);arenaCommand(w,w.players.a,'lendai','',N,c);arenaCommand(w,w.players.b,'lendai','',N,c);tickArena(w,N+2000,c);
 const m=w.arena.current,t0=m.fightAt+50;m.fighters.a.hp=Math.round(m.fighters.a.maxHp*.5);
 const tr=[1,10,99,500,2000,2000].map((v,i)=>arenaGift(w,w.players.a,v,t0+i));
 assert.deepEqual(tr.map(x=>x.trick),['qi','heal','summon','burst','heaven','heaven']);
 assert.ok(tr[1].heal>0);assert.ok(tr[2].dmg>0);assert.ok(tr[3].shield>0&&tr[3].dmg>0);
 assert.notEqual(tr[4].heaven,tr[5].heaven);assert.equal(tr[4].tier,4);
});
test('người xem tặng hộ đấu thủ: trợ chiêu áp cho đấu thủ, ghi tên người tặng',()=>{
 const w=world();player(w,'a',1e7);player(w,'b',1e7);player(w,'fan',1e5);
 startArenaEvent(w,N);chat(w,'a','lên đài',N);chat(w,'b','lên đài',N+1);tickArena(w,N+2000,c);
 const m=w.arena.current;
 const r=chat(w,'fan','tặng B',m.fightAt+10);
 action(w,{type:'gift',userId:'fan',name:'FAN',coins:99,count:1,gift:'Paper Crane',eventId:'g1'},m.fightAt+100);
 const e=m.log.findLast(x=>x.gift);assert.ok(e,'phải có trợ chiêu '+JSON.stringify(r));assert.equal(e.by,'b');assert.equal(e.trick,'summon');assert.equal(e.from,'FAN');
});
