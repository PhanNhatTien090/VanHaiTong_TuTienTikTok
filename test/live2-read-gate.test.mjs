import {test} from 'node:test';
import assert from 'node:assert/strict';
import {live2AllowRead} from '../live2-read-gate.mjs';
import {live2Command} from '../live2-systems.mjs';
import {live2ExtraCommand} from '../live2-extensions.mjs';
test('repeated status calls produce only two lightweight events, not 200',()=>{
 const N=1800000000000,p={id:'u',name:'Hàn Phong',realm:4};
 const w={mode:'live',settings:{live2Enabled:true},players:{u:p}};
 const events=[],emit=(_w,_p,msg,effect)=>events.push({msg,effect});
 for(let n=0;n<100;n++){
  assert.equal(live2Command(w,p,['dao','tu'],N+n*40,{emit}).ok,true);
  assert.equal(live2ExtraCommand(w,p,['dan','phuong'],N+n*40,{emit}).ok,true);
 }
 assert.equal(events.length,2);
 assert.deepEqual(events.map(e=>e.effect),['status','status']);
 live2Command(w,p,['dao','tu'],N+10000,{emit});
 assert.equal(events.length,3);
});
test('each read key has its own cooldown and does not block game mutations',()=>{
 const p={};
 assert.equal(live2AllowRead(p,'dao',1000),true);
 assert.equal(live2AllowRead(p,'dao',1001),false);
 assert.equal(live2AllowRead(p,'guild',1001),true);
 assert.equal(live2AllowRead(p,'dao',9001),true);
 assert.equal(Object.keys(p.cooldowns).length,2);
});
