import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,ensurePlayer} from '../engine.mjs';
import {autoFestivalTease,AUTO_TEASE_MAX,AUTO_TEASE_FIRST} from '../tease.mjs';

test('16/11: lễ hội kết duyên tự chọc ghẹo tối đa 3 cặp nam–nữ, ưu tiên người chưa có đạo lữ, mỗi người 1 lần',()=>{
 const now=Date.UTC(2026,10,16,13),w=createWorld('demo');const ev=[];const c={emit:(...a)=>ev.push(a)};
 for(const [id,g] of [['m1','nam'],['m2','nam'],['m3','nam'],['m4','nam'],['f1','nu'],['f2','nu'],['f3','nu'],['x','']])Object.assign(ensurePlayer(w,id,id.toUpperCase(),now),{gender:g,lastActive:now});
 w.bondFestival={id:'bf',startedAt:now,endsAt:now+300000,pairs:{}};
 assert.equal(autoFestivalTease(w,now+1000,c),null,'chưa tới 20 s đầu');
 let t=now+AUTO_TEASE_FIRST,seen=[];
 for(;t<now+300000;t+=1000){for(const p of Object.values(w.players))p.lastActive=t;const r=autoFestivalTease(w,t,c);if(r?.ok)seen.push([w.tease.a,w.tease.b]);}
 assert.equal(seen.length,AUTO_TEASE_MAX);
 const ids=seen.flat();assert.equal(new Set(ids).size,ids.length,'mỗi người 1 lần');
 for(const [a,b] of seen){assert.equal(w.players[a].gender,'nam');assert.equal(w.players[b].gender,'nu');}
});
