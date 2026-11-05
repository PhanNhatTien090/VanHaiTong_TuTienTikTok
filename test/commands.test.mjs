import {test} from 'node:test';
import assert from 'node:assert/strict';
import {commandWords,createWorld,action,requiredQi} from '../engine.mjs';

test('accented, spaced and shouted commands are recognised',()=>{
  for(const [t,want] of [['đột phá','dotpha'],['ĐỘT PHÁ!!','dotpha'],['Đột Phá','dotpha'],['tu luyện','tuluyen'],['tu vi','tuvi'],['nhập môn nữ','nhapmon nu'],['điểm danh','diemdanh'],['Đánh','danh'],['luyện đan Tụ Khí Đan','luyendan tu khi dan'],['chào cả nhà','chao ca nha']])
    assert.equal(commandWords(t).join(' '),want,t);
});
test('"đột phá" with enough qi actually breaks through',()=>{
  const w=createWorld('live');action(w,{type:'chat',userId:'k',name:'Khánh Duy',text:'nhập môn nam'},1e6);
  const p=w.players.k;p.qi=171;p.stones=99;
  assert.equal(action(w,{type:'chat',userId:'k',name:'Khánh Duy',text:'Đột phá'},1e6+1000).ok,true);
  assert.equal(p.realm,1);assert.equal(w.events.at(-1).effect==='breakthrough'||w.events.some(e=>e.effect==='breakthrough'),true);
  assert.ok(p.qi<requiredQi({realm:0}));
});
