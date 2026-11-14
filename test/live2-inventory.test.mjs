import {test} from 'node:test';
import assert from 'node:assert/strict';
import {bagCard,inventoryText} from '../inventory.mjs';
test('legacy bag data remains visible alongside new elixirs and relic refinement',()=>{
 const p={stones:90,herbs:12,pills:{'qi-pill':2},artifacts:['relic'],equipped:'relic',manuals:[],live2:{path:'alchemy',insight:33,elixirs:{guard:1,fury:2},refinements:{relic:2}}};
 const c=bagCard(p,[{id:'qi-pill',name:'Tụ Khí Đan',type:'pill',icon:'pill'},{id:'relic',name:'Kiếm',type:'artifact',icon:'sword'}]);
 assert.equal(c.pills.items[0].n,2);
 assert.equal(c.live2Pills.items.reduce((sum,x)=>sum+x.n,0),3);
 assert.equal(c.artifacts.items[0].refinement,2);
 assert.equal(c.daoPath.name,'Đan Đạo');
 assert.match(inventoryText(c),/5 viên đan/);
 assert.equal(p.pills['qi-pill'],2);
});
