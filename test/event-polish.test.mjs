import test from 'node:test';
import assert from 'node:assert/strict';
import {startMiniEvent,miniCommand,tickMiniEvent,miniView,smallEventConflict} from '../mini-events.mjs';
import {hallWarPlaces} from '../public/hall-war.js';
import {startHallWar,tickHallWar} from '../hall-war.mjs';
import {HALLS} from '../ngu-duong.mjs';
const N=1800000000000;
const miniCtx={emit(){},gain(w,p,q,s){p.stones=(p.stones||0)+s;return q;}};
test('star game closes promptly at twelve claims, presents a finite finale and preserves receipts across reload',()=>{
 let w={players:{}};startMiniEvent(w,'star',N,miniCtx);
 for(let i=0;i<12;i++){const p={id:'p'+i,name:'Đạo hữu '+i,stones:0};w.players[p.id]=p;assert.ok(miniCommand(w,p,'bat','sao',N+i+1,miniCtx).ok);}
 assert.ok(w.miniEvent.endsAt<N+2000);const end=w.miniEvent.endsAt;
 w=JSON.parse(JSON.stringify(w));tickMiniEvent(w,end,miniCtx);const v=miniView(w,end+1);
 assert.equal(v.phase,'finished');assert.equal(v.count,12);assert.equal(v.winners[0].name,'Đạo hữu 0');assert.equal(v.seed,undefined);assert.equal(v.claimed,undefined);
 assert.equal(smallEventConflict(w,end+1),'trò vui');assert.equal(miniCommand(w,w.players.p0,'bat','sao',end+1,miniCtx).ok,false);
 assert.equal(miniView(w,end+8000),null);assert.equal(smallEventConflict(w,end+8000),null);
});
test('minor game final honors actual luck, not equipment-inflated cultivation payout',()=>{
 const w={players:{},miniEvent:{id:'m',type:'rps',startedAt:N,endsAt:N+10,closedAt:N+10,resultUntil:N+8010,claimed:{a:{name:'An',at:N+1,qi:99999,outcome:'consolation'},b:{name:'Bình',at:N+2,qi:100,outcome:'win'}}}};
 assert.equal(miniView(w,N+20).winners[0].name,'Bình');
});
test('hall camps keep a contributor visible and rotate every other member without entering the comment area',()=>{
 const event={startedAt:N,battleStartedAt:N,teams:HALLS.map((h,index)=>({...h,index})),members:Array.from({length:50},(_,i)=>({id:'p'+i,index:i%5,score:100-i,joinedAt:i}))},seen=new Set();
 for(let n=0;n<10;n++){const places=hallWarPlaces(event,1600,N+n*8000);assert.equal(places.size,15);for(const p of places.values()){seen.add(p.id);assert.ok(p.x>0&&p.x<900&&p.y+85<1600*.74);}for(let i=0;i<5;i++)assert.ok(places.has('p'+i));}
 assert.equal(seen.size,50);
});
test('empty combat does not invent a champion, transferred players do not strike, and initiative rotates',()=>{
 const events=[],w={players:{a:{id:'a',name:'An',realm:3,totalQi:1000},b:{id:'b',name:'Bình',realm:3,totalQi:1000}},nguDuong:{members:{a:{index:0},b:{index:1}}}},ctx={active:()=>true,emit(w,p,text){events.push(text);},contribute(){},hallPoints(){},gain(){return 0;}};
 assert.ok(startHallWar(w,N,ctx).ok);tickHallWar(w,N+30000,ctx);assert.equal(w.hallWar.castCursor,1);
 w.playTransfers={a:{phase:'web'}};const before=w.hallWar.members.a.score;tickHallWar(w,N+31800,ctx);assert.equal(w.hallWar.members.a.score,before);assert.equal(w.hallWar.castCursor,2);
 w.hallWar.teams.forEach(t=>t.score=0);Object.values(w.hallWar.members).forEach(m=>m.score=0);tickHallWar(w,N+150000,ctx);
 assert.equal(w.hallWar.results.length,0);assert.equal(w.hallWar.rewards,undefined);assert.ok(events.at(-1).includes('chưa có chiến công'));
});
