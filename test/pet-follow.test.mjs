import {test} from 'node:test';
import assert from 'node:assert/strict';
import {petFollowOffset,PET_WALK_MS} from '../public/spirit-pet-art.js';

test('thú đứng yên cạnh chủ là chính, chỉ đi ≤20% thời gian, mỗi lần đi 3 s',()=>{
 for(const id of ['a','user-12345','67468054155','x9']){
  let walk=0,n=0,prev=null,moves=0;
  for(let t=0;t<300000;t+=100){const o=petFollowOffset(id,'ember-fox',t,1.18);n++;if(o.walking)walk++;
   if(prev&&!o.walking&&!prev.walking)assert.equal(o.x,prev.x);
   if(prev&&o.walking&&!prev.walking)moves++;prev=o;
   assert.ok(Math.abs(o.x)<=36*1.18+1e-6&&o.y>=0);}
  assert.ok(walk/n<=.2,id+' đi quá nhiều: '+walk/n);
  assert.ok(moves>=10&&moves<=20,id+' số lần đi trong 5 phút: '+moves);
 }
 assert.equal(PET_WALK_MS,3000);
 const still=petFollowOffset('a','ember-fox',99999,1,false,false);assert.equal(still.walking,false);
});
