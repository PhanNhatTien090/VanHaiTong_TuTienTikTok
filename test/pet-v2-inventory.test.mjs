import {test} from 'node:test';
import assert from 'node:assert/strict';
import {inventoryDeckHTML} from '../public/inventory-multi.js';
import {petThumbFrames} from '../public/spirit-pet-art.js';
test('LIVE pet inventory shows the evolved species thumbnail, skill, XP bar and original ownership',()=>{
 const card={kind:'pets',current:'Ngọc Thố',currentId:'jade-rabbit',total:13,
  currentGrowth:{id:'jade-rabbit',level:33,xp:40,xpNext:100,bond:60,stage:3,stageName:'Bản Mệnh',skill:'Nguyệt Linh Hồi Nguyên',resonance:true},
  owned:{items:[{id:'jade-rabbit',name:'Ngọc Thố',level:33,stage:3,stageName:'Bản Mệnh',skill:'Nguyệt Linh Hồi Nguyên',no:1,on:true}],more:0}
 };
 const html=inventoryDeckHTML({name:'Đạo hữu',card},s=>String(s).replace(/[&<>"]/g,'_'));
 assert.ok(html.includes('data-thumb="pet:jade-rabbit"'));
 assert.ok(html.includes('data-pet-stage="3"'));
 assert.ok(html.includes('Lv33'));
 assert.ok(html.includes('Nguyệt Linh Hồi Nguyên'));
 assert.ok(html.includes('XP 40/100'));
 assert.ok(html.includes('Pháp bảo cộng hưởng'));
 assert.ok(html.includes('Đã có 1/13'));
});
test('stage0 thumbnail compatibility stays intact when original pet has no growth data',()=>{
 const card={kind:'pets',current:'Ngọc Thố',total:13,owned:{items:[{id:'jade-rabbit',name:'Ngọc Thố',no:1,on:true}],more:0}};
 const html=inventoryDeckHTML({name:'Thử',card},String);
 assert.ok(html.includes('data-pet-stage="0"'));
 assert.equal(html.includes('vd-pet-progress'),false);
 // No browser during unit tests: the thumbnail decoder must degrade to a null promise safely.
 assert.equal(typeof petThumbFrames('jade-rabbit',3).then,'function');
});
