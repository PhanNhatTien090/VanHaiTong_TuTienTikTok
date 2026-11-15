import {test} from 'node:test';
import assert from 'node:assert/strict';
import {live2TribulationCommand} from '../live2-tribulation.mjs';
import {live2Command} from '../live2-systems.mjs';
const N=1800000000000;
test('Heaven help searches up to 16 open trials, never all historic users',()=>{
 const target={id:'a',name:'Hóa Thần A',realm:6,lastActive:N,live2:{path:'sword'}};
 const helper={id:'b',name:'B',realm:4,lastActive:N,stones:10};
 const players=new Proxy({a:target,b:helper},{ownKeys(){throw Error('Full player scan forbidden during Heaven help');}});
 const w={mode:'live',settings:{live2Enabled:true},players,live2Tribulations:[{id:'trial-1',targetId:'a',endsAt:N+60000,helpers:[],completed:false}]};
 const result=live2TribulationCommand(w,helper,['ho','kiep','Hóa','Thần','A'],N,{});
 assert.equal(result.ok,true);
 assert.equal(w.live2Tribulations[0].helpers.length,1);
 assert.equal(helper.stones,12);
});
test('ambiguous mentor names are rejected but exact player ID succeeds',()=>{
 const [master1,master2]=['master1','master2'].map(id=>({id,name:'Sư Phụ',realm:9,lastActive:N}));
 const learner={id:'l',name:'Tân Tu',realm:2,lastActive:N};
 const w={mode:'live',settings:{live2Enabled:true},players:{master1,master2,l:learner}};
 const ctx={emit:()=>{}};
 const amb=live2Command(w,learner,['xin','su','Sư','Phụ'],N,ctx);
 assert.equal(amb.ok,false);
 const exact=live2Command(w,learner,['xin','su','master2'],N+31000,ctx);
 assert.equal(exact.ok,true);
 assert.equal(master2.live2.mentorInvites[0].from,'l');
 assert.equal(master1.live2,undefined);
});
