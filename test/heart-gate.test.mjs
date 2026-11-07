import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,action,heartGate,heartHeavy,HEART_GATE} from '../engine.mjs';
const N=Date.parse('2026-11-07T21:00:00+07:00');
function setup(){const w=createWorld('live');Object.assign(w.settings,{autoEvents:false,autoRandom:false,scheduledCompetitions:false,residents:false,heartGate:true});const p=ensurePlayer(w,'a','An',N);p.realm=6;return {w,p};}
test('a human burst passes in full; a sustained tool stream is clipped to ~3 hearts/second for events',()=>{
 const {p}=setup();assert.equal(heartGate(p,60,N),60); // thả dồn 60 tim
 const q=setup().p;let got=0;for(let s=0;s<300;s++)got+=heartGate(q,15,N+s*1000); // 15 tim/giây suốt 5 phút
 assert.ok(got<=HEART_GATE.burst+300*HEART_GATE.refillPerSec+1);assert.ok(got>=300*HEART_GATE.refillPerSec);assert.ok(heartHeavy(q));
});
test('heavy tappers cultivate from hearts every 30s instead of 10s, silently; normal tappers keep 10s',()=>{
 const {w,p}=setup();let t=N;for(let i=0;i<180;i++){t+=1000;action(w,{userId:'a',type:'like',count:12},t);} // 3 phút tự bấm
 assert.ok(heartHeavy(p));const before=w.feed.length,qi=p.qi;
 const r1=action(w,{userId:'a',type:'like',count:12},t+31000);assert.equal(r1.ok,true);
 const r2=action(w,{userId:'a',type:'like',count:12},t+43000);assert.equal(r2.ok,true);assert.ok(r2.xpCooldown>0||r2.throttled);
 assert.ok(!w.feed.slice(0,w.feed.length-before+2).some(e=>/hồi|giới hạn|chậm|công cụ/i.test(e.text)&&e.user==='a'&&e.effect==='status'));
 const n=setup();action(n.w,{userId:'a',type:'like',count:5},N);const r=action(n.w,{userId:'a',type:'like',count:5},N+11000);assert.equal(r.heartCultivated,true);
});
