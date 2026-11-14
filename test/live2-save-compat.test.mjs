import {test} from 'node:test';
import assert from 'node:assert/strict';
import {live2Command,live2Insight} from '../live2-systems.mjs';
const N=1_800_000_000_000;
test('partial older LIVE2 save loads without deleting insight or resetting relics',()=>{
 const p={id:'a',name:'Tiên A',realm:5,live2:{path:'sword',insight:42,refinements:{jade:2}}};
 const w={mode:'live',players:{a:p},settings:{live2Enabled:true}};
 const ctx={emit:()=>{}};
 assert.equal(live2Command(w,p,['dao','tu'],N,ctx).ok,true);
 assert.equal(p.live2.insight,42);
 assert.equal(p.live2.refinements.jade,2);
 assert.ok(p.live2.cooldowns);
 assert.ok(p.live2.daily);
});
test('old partial guild state can receive contribution with no loss of points',()=>{
 const p={id:'a',name:'Tiên A',realm:5,live2:{path:'sword',insight:15,guildId:'A'}};
 const w={mode:'live',players:{a:p},settings:{live2Enabled:true},live2World:{guilds:{A:{id:'A',name:'A',leader:'a',members:['a'],points:7}}}};
 const ctx={emit:()=>{}};
 const r=live2Insight(w,p,{type:'checkin'},{ok:true},N,ctx.emit);
 assert.equal(r,2);
 assert.equal(w.live2World.guilds.A.points,9);
 assert.equal(w.live2World.guilds.A.contributions.a,2);
});
