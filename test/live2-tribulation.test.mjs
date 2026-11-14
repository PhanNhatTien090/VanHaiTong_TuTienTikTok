import {test} from 'node:test';
import assert from 'node:assert/strict';
import {live2TribulationBegin,live2TribulationCommand,live2TribulationView,live2TribulationBonus,live2TribulationTick} from '../live2-tribulation.mjs';
const N=1000000000;
function game(){
 const mk=(id,realm=5)=>({id,name:id,realm,stones:50,lastActive:N,live2:{path:'sword',insight:50}});
 const [p,a,b,c]=[mk('p'),mk('a'),mk('b'),mk('c')];
 const w={mode:'live',settings:{live2Enabled:true},players:{p,a,b,c}};
 const seen=[],emit=(_w,pl,txt,effect,now,meta)=>seen.push({user:pl?.id,txt,effect,meta});
 return {p,a,b,c,w,emit,seen};
}
test('real breakthrough opens free opt-in assistance without changing realm or qi',()=>{
 const t=game(),realm=t.p.realm,stones=t.p.stones;
 const trial=live2TribulationBegin(t.w,t.p,N,t.emit);
 assert.ok(trial);assert.equal(t.p.realm,realm);assert.equal(t.p.stones,stones);
 assert.equal(live2TribulationBegin(t.w,t.p,N+1000,t.emit),null);
 assert.equal(live2TribulationView(t.w,N+1000)[0].helpers,0);
});
test('three unique real helpers activate bounded Heaven Resonance just once',()=>{
 const t=game();live2TribulationBegin(t.w,t.p,N,t.emit);
 for(const x of [t.a,t.b,t.c])assert.equal(live2TribulationCommand(t.w,x,['ho','kiep','p'],N+1000,t.emit).ok,true);
 assert.equal(t.p.live2.tribulationsCompleted,1);
 assert.equal(live2TribulationBonus(t.p,N+3000),1.02);
 assert.equal(live2TribulationBonus(t.p,N+900000),1);
 assert.equal(live2TribulationCommand(t.w,t.a,['ho','kiep','p'],N+2000,t.emit).ok,false);
 assert.equal(t.p.live2.tribulationsCompleted,1);
});
test('expired trials and puppet supporters are rejected without reward',()=>{
 const t=game();live2TribulationBegin(t.w,t.p,N,t.emit);
 t.c.puppet=true;
 assert.equal(live2TribulationCommand(t.w,t.c,['ho','kiep','p'],N+1000,t.emit),null);
 assert.equal(live2TribulationCommand(t.w,t.a,['ho','kiep','p'],N+90001,t.emit).ok,false);
 live2TribulationTick(t.w,N+200001);assert.equal(live2TribulationView(t.w,N+200001).length,0);
});
test('LIVE disabled never adds a trial',()=>{
 const t=game();t.w.settings.live2Enabled=false;
 assert.equal(live2TribulationBegin(t.w,t.p,N,t.emit),null);
 assert.equal(t.w.live2Tribulations,undefined);
});
