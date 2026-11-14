import {test} from 'node:test';
import assert from 'node:assert/strict';
import {live2BossOnHit,live2BossView,live2BossTick,live2BossMultiplier} from '../live2-boss.mjs';
function world(opt=true){
 const t=100000,b={id:'boss',name:'Lôi Hổ',maxHp:1000,hp:900,endsAt:t+90000,startedAt:t-1000};
 const w={mode:'live',settings:opt?{live2Enabled:true}:{},boss:b},calls=[];
 const emit=(_w,_p,msg,effect,at,extra)=>calls.push({msg,effect,at,...extra});
 return {t,w,b,calls,emit};
}
test('new phases do not alter existing Boss timing when opt-in off',()=>{
 const a=world(false),p={id:'a'};
 assert.equal(live2BossOnHit(a.w,p,a.t,a.emit),1);
 live2BossTick(a.w,a.t,a.emit);
 assert.equal(a.b.live2Boss,undefined);
 assert.equal(a.calls.length,0);
});
test('phases follow hp and announce once per threshold',()=>{
 const a=world(),p={id:'a'};
 live2BossTick(a.w,a.t,a.emit);live2BossTick(a.w,a.t+1,a.emit);
 assert.equal(a.calls.length,1);
 a.b.hp=550;live2BossTick(a.w,a.t+2,a.emit);live2BossTick(a.w,a.t+3,a.emit);
 assert.equal(a.calls.length,2);
 assert.equal(live2BossView(a.b,a.t+3).id,'seal');
 a.b.hp=200;live2BossTick(a.w,a.t+4,a.emit);assert.equal(a.calls.length,3);
 assert.equal(live2BossView(a.b,a.t+4).id,'frenzy');
});
test('three unique attackers break seal; solo can still break in five hits',()=>{
 const a=world();a.b.hp=500;
 for(const id of ['a','b','c'])live2BossOnHit(a.w,{id},a.t+100,a.emit);
 assert.equal(live2BossView(a.b,a.t+101).exposed,true);
 assert.equal(live2BossMultiplier(a.b,a.t+101),1.08);
 assert.equal(live2BossMultiplier(a.b,a.t+10000),.88);
 const solo=world();solo.b.hp=400;
 for(let i=0;i<5;i++)live2BossOnHit(solo.w,{id:'solo'},solo.t+i*1300,solo.emit);
 assert.equal(live2BossView(solo.b,solo.t+5400).exposed,true);
});
test('boss view omits raw attacker ids and remains bounded',()=>{
 const a=world();a.b.hp=500;
 for(let i=0;i<500;i++)live2BossOnHit(a.w,{id:'x'+i},a.t+i*50,a.emit);
 assert.ok(a.b.live2Boss.seen.length<=4);
 assert.ok(a.b.live2Boss.hits<=5);
 assert.ok(JSON.stringify(live2BossView(a.b,a.t+100)).length<360);
});
