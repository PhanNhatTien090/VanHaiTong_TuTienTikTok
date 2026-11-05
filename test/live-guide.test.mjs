import {test} from 'node:test';
import assert from 'node:assert/strict';
import {commandCards,giftCards} from '../public/live-guide.js';
import {CATALOG,REALMS,DEFAULT_GIFTS} from '../engine.mjs';
const state={catalog:CATALOG,realms:REALMS,gifts:DEFAULT_GIFTS,feed:[]};
test('on-stream commands use actual catalog names, costs and realm requirements',()=>{
  const cards=commandCards(state);
  assert.ok(cards.some(c=>c.main==='học Thanh Tâm Quyết'&&c.detail.includes('35 linh thạch')));
  assert.ok(cards.some(c=>c.main==='rèn Thanh Ngọc Kiếm'&&c.detail.includes('60 linh thạch + 2 linh thảo')));
  assert.ok(cards.some(c=>c.main==='dùng Tụ Khí Đan'&&c.detail.includes('+65 tu vi')));
});
test('gift guide follows edited server rewards and does not invent a price for named gifts',()=>{
  const s=structuredClone(state);s.gifts[0].qi=19;s.gifts[1].min=7;
  s.feed=[{gift:'Hoa hồng',tier:s.gifts[0].name},{gift:'Quà không rõ',tier:'missing'}];
  const cards=giftCards(s);
  assert.ok(cards.some(c=>c.main==='Quà 1–6 coin → +19 tu vi'));
  assert.ok(cards.some(c=>c.main==='Hoa hồng → +19 tu vi / món'));
  assert.ok(!cards.some(c=>c.main.includes('Quà không rõ')));
  assert.ok(cards.some(c=>c.label.includes('TÍCH LŨY')&&c.main.includes('100 coin quà')));
});
