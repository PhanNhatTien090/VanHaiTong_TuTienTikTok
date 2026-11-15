import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,ensurePlayer} from '../engine.mjs';
import {tickArena} from '../arena.mjs';
import {seatGift,tickSeat,ensureSeatOwner,seatState,SEAT_REMATCH_MS} from '../master-seat.mjs';
import {giftMasterView} from '../master-rewards.mjs';

const N=Date.UTC(2026,10,15,15);
function setup(){
 const w=createWorld('live');Object.assign(w.settings,{residents:false,autoEvents:false,scheduledCompetitions:false});w.nextBossAt=N+1e10;
 const here=new Set();const c={emit:(w2,p,m,e,at,x={})=>w.events.push({text:m,effect:e,at,...x}),active:(w2,p)=>here.has(p.id),technique:()=>({id:'sword',name:'x'})};
 const mk=(id,at,q=1e7)=>Object.assign(ensurePlayer(w,id,id.toUpperCase(),N),{totalQi:q,realm:9,lastActive:N,sectMasterUnlocked:true,sectMasterGiftAt:at,sectMasterGiftCoins:2000});
 return {w,c,here,mk};
}
function runDuel(w,c,t){for(let i=0;i<400&&(w.arena?.phase==='open');i++){t+=250;tickArena(w,t,c);tickSeat(w,t,c);}return t;}

test('chủ ghế ban đầu = người tặng ≥2.000 gần nhất (giữ đúng ghế hiện tại khi chuyển luật)',()=>{
 const {w,mk}=setup();mk('hoang',N-3e8);mk('nam',N-1e6);
 assert.equal(ensureSeatOwner(w,N),'nam');
});

test('Tông chủ cũ quay lại → lập tức đấu Lôi Đài; ai thắng ngồi ghế; 3 giờ sau mới đấu lại',()=>{
 const {w,c,here,mk}=setup();mk('hoang',N-3e8,1e7);mk('nam',N-1e6,1e7*1.5);here.add('nam');
 tickSeat(w,N,c);assert.equal(w.arena,undefined);
 here.add('hoang');tickSeat(w,N+1000,c);
 assert.equal(w.arena?.master,true);assert.equal(w.arena.champion,'nam');assert.deepEqual(w.arena.queue.map(q=>q.id),['hoang']);
 const t=runDuel(w,c,N+1000);
 assert.equal(w.arena.phase,'closed');assert.equal(seatState(w).userId,'nam'); // hơn 30% tu vi → thắng chắc
 assert.equal(w.players.nam.arenaTitle,undefined,'trận tranh ghế không trao Bá Chủ');
 tickSeat(w,t+60000,c);assert.equal(w.arena.phase,'closed');assert.equal(seatState(w).pending,null);
 tickSeat(w,t+SEAT_REMATCH_MS+1000,c);assert.equal(w.arena.phase,'open');
});

test('người thách thắng thì lên ghế; ghế hiển thị theo chủ ghế khi có mặt',()=>{
 const {w,c,here,mk}=setup();mk('hoang',N-3e8,1e7*1.5);mk('nam',N-1e6,1e7);here.add('nam');here.add('hoang');
 tickSeat(w,N,c);runDuel(w,c,N);
 assert.equal(seatState(w).userId,'hoang');
 const players=['nam','hoang'].map(id=>({...w.players[id],active:true}));
 assert.equal(giftMasterView(players,{},seatState(w).userId).userId,'hoang');
 assert.equal(giftMasterView(players,{},null).userId,'nam');
});

test('tặng một món ≥5.000: lên ghế ngay không đấu; đang đấu thì thắng luôn',()=>{
 const {w,c,here,mk}=setup();mk('hoang',N-3e8,1e7);mk('nam',N-1e6,1e7*1.5);here.add('nam');here.add('hoang');
 tickSeat(w,N,c);tickArena(w,N+3000,c);assert.ok(w.arena.current);
 assert.equal(seatGift(w,w.players.hoang,5000,N+5000,c),'buyout');
 assert.equal(seatState(w).userId,'hoang');
 runDuel(w,c,N+5000);assert.equal(w.arena.phase,'closed');assert.equal(w.arena.lastResult.winner,'hoang');assert.equal(seatState(w).userId,'hoang');
});

test('tặng 2.000 khi chủ ghế vắng → ngồi ghế luôn; chủ ghế có mặt → xếp trận tranh ghế',()=>{
 const {w,c,here,mk}=setup();mk('hoang',N-3e8);here.add('nam');
 mk('nam',N);assert.equal(seatGift(w,w.players.nam,2000,N,c),'seat');assert.equal(seatState(w).userId,'nam');
 const {w:w2,c:c2,here:h2,mk:mk2}=setup();mk2('nam',N-1e6);h2.add('nam');ensureSeatOwner(w2,N);
 mk2('long',N);h2.add('long');assert.equal(seatGift(w2,w2.players.long,2000,N,c2),'duel');
 tickSeat(w2,N+10,c2);assert.equal(w2.arena?.master,true);
});
