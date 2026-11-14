import {test} from 'node:test';
import assert from 'node:assert/strict';
import {commandWords,createWorld,action,requiredQi} from '../engine.mjs';
import {playerWing,WING_TIERS} from '../public/boss-arena.js';

test('accented, spaced and shouted commands are recognised',()=>{
  for(const [t,want] of [['đột phá','dotpha'],['ĐỘT PHÁ!!','dotpha'],['Đột Phá','dotpha'],['tu luyện','tuluyen'],['tu vi','tuvi'],['nhập môn nữ','nhapmon nu'],['điểm danh','diemdanh'],['Đánh','danh'],['luyện đan Tụ Khí Đan','luyendan tu khi dan'],['chào cả nhà','chao ca nha']])
    assert.equal(commandWords(t).join(' '),want,t);
});
test('wing commands hide, equip unlocked tiers and restore automatic selection',()=>{
  const w=createWorld('live'),chat=(text,at)=>action(w,{type:'chat',userId:'k',name:'Khánh Duy',text},at);
  chat('nhập môn nam',1000000);
  const p=w.players.k;p.giftCoins=5000;
  assert.equal(playerWing(p),WING_TIERS[6]);
  assert.equal(chat('hủy cánh',1001000).ok,true);
  assert.equal(playerWing(p),undefined);
  assert.equal(chat('cánh 8',1002000).ok,false);
  assert.equal(playerWing(p),undefined);
  assert.match(chat('cánh',1003000).message,/7\. Tử Nguyệt Điệp Dực/);
  assert.equal(chat('cánh 2',1004000).ok,true);
  assert.equal(playerWing(p),WING_TIERS[1]);
  assert.equal(chat('cánh tự động',1005000).ok,true);
  assert.equal(playerWing(p),WING_TIERS[6]);
  assert.equal(p.giftCoins,5000);
});
test('"đột phá" with enough qi actually breaks through',()=>{
  const w=createWorld('live');action(w,{type:'chat',userId:'k',name:'Khánh Duy',text:'nhập môn nam'},1e6);
  const p=w.players.k;p.qi=171;p.stones=99;
  assert.equal(action(w,{type:'chat',userId:'k',name:'Khánh Duy',text:'Đột phá'},1e6+1000).ok,true);
  assert.equal(p.realm,1);assert.equal(w.events.at(-1).effect==='breakthrough'||w.events.some(e=>e.effect==='breakthrough'),true);
  assert.ok(p.qi<requiredQi({realm:0}));
});
