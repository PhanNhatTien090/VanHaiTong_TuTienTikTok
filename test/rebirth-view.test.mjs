import {test} from 'node:test';import assert from 'node:assert/strict';
import {rebirthTitle,rebirthMark,rebirthLeaders,rebirthCount} from '../public/rebirth-view.js';
import {createWorld,ensurePlayer,snapshot} from '../engine.mjs';
import {layoutLabels} from '../public/cosmetics.js';
test('07/11: rebirth titles, name mark and leaderboard are cosmetic and ordered by count',()=>{
 assert.equal(rebirthTitle(1),'Nhất Chuyển');assert.equal(rebirthTitle(2),'Nhị Chuyển');assert.equal(rebirthTitle(10),'Thập Chuyển');assert.equal(rebirthTitle(12),'Chuyển Sinh 12');assert.equal(rebirthTitle(0),'');
 assert.equal(rebirthMark({reincarnations:3}),'✦3 ');assert.equal(rebirthMark({}),'');assert.equal(rebirthCount({reincarnations:-2}),0);
 const N=Date.parse('2026-11-07T10:00:00+07:00'),w=createWorld('live');
 for(const [id,n,hr,q] of [['a',1,21,5],['b',3,21,1],['c',0,0,9],['d',1,21,7]]){const p=ensurePlayer(w,id,id.toUpperCase(),N);p.reincarnations=n;p.highestRealm=hr;p.totalQi=q;}
 const top=snapshot(w,N).rebirthTop;assert.deepEqual(top.map(p=>p.id),['b','d','a']);assert.equal(top[0].title,'Tam Chuyển');
 const [label]=layoutLabels([{id:'b',x:450,y:500,player:w.players.b}],s=>s.length*10);assert.match(label.name,/^✦3 B/);
});
