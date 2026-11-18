// 09/11/2026: cân lại thưởng sự kiện — pháp bảo chỉ tính một nửa cho thưởng sự kiện, lò đan giảm nhẹ, ai tặng quà trong lò được nhân thêm.
import test from 'node:test';
import assert from 'node:assert/strict';
import {ALC,alchemyGiftMult} from '../alchemy.mjs';
import {EVENT_GEAR_SHARE,createWorld,ensurePlayer,action} from '../engine.mjs';

test('thưởng lò đan giảm nhẹ: 0,7% tu vi cần mỗi phẩm', () => {
  assert.equal(ALC.reward.pct, .007);
});

test('tặng quà trong lò đan được nhân thưởng theo tổng coin', () => {
  assert.equal(alchemyGiftMult(0), 1);
  assert.equal(alchemyGiftMult(undefined), 1);
  assert.equal(alchemyGiftMult(1), 1.5);
  assert.equal(alchemyGiftMult(4), 1.5);
  assert.equal(alchemyGiftMult(5), 2);
  assert.equal(alchemyGiftMult(98), 2);
  assert.equal(alchemyGiftMult(99), 3);
  assert.equal(alchemyGiftMult(5000), 3);
});

// 18/11 tối (chủ game, luật chung): hệ số pháp bảo/công pháp chỉ nhân khi TỰ TU LUYỆN; quà + thưởng sự kiện = số gốc.
test('hệ số pháp bảo chỉ nhân khi chơi tay, không nhân vào quà/sự kiện', () => {
  assert.equal(EVENT_GEAR_SHARE, 0);
  const N=Date.parse('2026-11-18T13:00:00Z');
  const run=(gear,input)=>{const w=createWorld('demo');Object.assign(w.settings,{residents:false,autoEvents:false,heartPlay:false});w.nextBossAt=N+1e10;
    const p=ensurePlayer(w,'x','X',N);Object.assign(p,{realm:5,qi:0,totalQi:0,lastActive:N});if(gear){p.artifacts=[gear];p.equipped=gear;}
    action(w,{userId:'x',name:'X',...input},N+1000);return p.totalQi;};
  const gift={type:'gift',coins:10,count:1,giftName:'Rosa',eventId:'g1'},cult={type:'chat',text:'tu luyện'};
  assert.equal(run('nguyet-bach-phien',gift),run(null,gift),'quà: có pháp bảo cũng như không');
  assert.ok(run('nguyet-bach-phien',cult)>run(null,cult)*1.3,'tu luyện: pháp bảo vẫn nhân');
});
