import {test} from 'node:test';
import assert from 'node:assert/strict';
import {live2Command,live2RecordAction} from '../live2-systems.mjs';
const N=1800000000000;
test('guild ID allocation never overwrites an existing guild in a partial save',()=>{
 const a={id:'a',name:'A',realm:5},b={id:'b',name:'B',realm:5};
 const first={id:'001',name:'Bang Cũ',leader:'a',members:['a'],points:113,contributions:{a:113}};
 const w={mode:'live',settings:{live2Enabled:true},players:{a,b},
  live2World:{guilds:{'001':first},nextGuildId:1}},ctx={emit:()=>{}};
 const result=live2Command(w,b,['lap','hoi','Bang Moi'],N,ctx);
 assert.equal(result.ok,true);
 assert.equal(w.live2World.guilds['001'],first);
 assert.equal(w.live2World.guilds['001'].points,113);
 assert.equal(w.live2World.guilds['002'].leader,'b');
});
test('officer appointment, demotion and leadership transfer are persistence-worthy actions',()=>{
 for(const words of [['hoi','pho','B'],['hoi','truong','lao','B'],['hoi','nhuong','B'],['hoi','giang','B']]){
  const p={interactions:0},w={totalInteractions:0};
  assert.equal(live2RecordAction(w,p,words,{ok:true}),true,words.join(' '));
  assert.equal(p.interactions,1);
  assert.equal(w.totalInteractions,1);
 }
});
