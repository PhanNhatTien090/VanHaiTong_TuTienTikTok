import {test} from 'node:test';
import assert from 'node:assert/strict';
import {live2RecordAction} from '../live2-systems.mjs';
test('read-only Dao commands cannot inflate total interactions or trigger saves',()=>{
 const w={totalInteractions:100},p={interactions:9};
 assert.equal(live2RecordAction(w,p,['dao','ngo'],{ok:true}),false);
 assert.equal(live2RecordAction(w,p,['hoi'],{ok:true}),false);
 assert.equal(w.totalInteractions,100);
 assert.equal(live2RecordAction(w,p,['chien','hoi'],{ok:true}),true);
 assert.equal(w.totalInteractions,101);
 assert.equal(p.interactions,10);
 assert.equal(live2RecordAction(w,p,['chien','hoi'],{ok:false}),false);
});
