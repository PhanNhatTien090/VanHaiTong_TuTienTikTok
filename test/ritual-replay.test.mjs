import test from 'node:test';
import assert from 'node:assert/strict';
import {PresentationQueue} from '../public/presentation.js';

test('an interrupted breakthrough cannot restart from another snapshot, later gifts, or an event transition',()=>{
  const q=new PresentationQueue(),now=1000000;
  const original={id:'breakthrough-25',effect:'breakthrough',user:'cultivator',fromRealm:24,toRealm:25};
  assert.equal(q.push(original,now),true);
  assert.equal(q.take(now,()=>false),undefined);
  const playing=q.take(now+100);
  assert.equal(q.start(playing,now+100),true);
  assert.equal(q.push({...original},now+200),false);
  assert.equal(q.start(playing,now+200),false);
  assert.equal(q.take(now+300),undefined);
  const next={...original,id:'breakthrough-26',fromRealm:25,toRealm:26};
  assert.equal(q.push(next,now+400),true);
  assert.equal(q.start(q.take(now+500),now+500),true);
});
