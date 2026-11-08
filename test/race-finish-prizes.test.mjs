import {test} from 'node:test';import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,action,tick,startRace} from '../engine.mjs';
import {RACE_FINISH_PRIZES,RACE_FINISH_MIN} from '../sword-race.mjs';
import {speechPlan} from '../speech-lines.mjs';
const N=1800000000000;
function race(n){const w=createWorld('live');Object.assign(w.settings,{residents:false,autoEvents:false,blessingMinutes:0});w.nextBossAt=N+1e9;for(let i=0;i<n;i++)ensurePlayer(w,'p'+i,'Player '+i,N);
 assert.ok(startRace(w,N).ok);for(let i=0;i<n;i++)action(w,{type:'chat',text:'dua',userId:'p'+i,name:'p'+i},N+1+i);tick(w,N+45000);assert.equal(w.race.phase,'running');tick(w,w.race.endsAt+1);assert.equal(w.race.phase,'finished');return w;}
test('top 3 về đích nhận Hỏa Liên + kiếm Cửu Thiên / Hồ Lô / Tiên Hạc vĩnh viễn, có giọng đọc',()=>{
 const w=race(5),top=w.race.results.slice(0,3).map(r=>w.players[r.id]);
 assert.deepEqual(top.map(p=>p.raceMounts),[['lotus'],['gourd'],['crane']]);assert.ok(top[0].raceSwordSkins.includes('race-cuu-thien'));
 assert.equal(w.players[w.race.results[3].id].raceMounts,undefined);
 const e=w.events.find(e=>e.raceFinishRank===1);assert.match(e.text,/Hỏa Liên \+ Cửu Thiên Lưu Ly Kiếm vĩnh viễn/);assert.match(speechPlan(e).map(x=>x.text).join(' '),/về đích hạng nhất.*Hỏa Liên/);
 assert.equal(RACE_FINISH_PRIZES.length,3);
});
test('ít hơn 4 đấu thủ thì không trao vật cưỡi về đích',()=>{const w=race(RACE_FINISH_MIN-1);assert.ok(Object.values(w.players).every(p=>!p.raceMounts));});
