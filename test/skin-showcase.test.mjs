import test from 'node:test';
import assert from 'node:assert/strict';
import {pickSkinShow,withFullFx,SHOWCASE_EVERY,SHOWCASE_MS} from '../public/skin-showcase.js';
// 20/11 B: sân đông → mỗi 45 s đúng 1 người mặc skin xịn được 4 s đủ hiệu ứng; sân vắng không cần.
const P=(id,coins,prem=true)=>({id,player:{id,name:id,giftCoins:coins,skinChoice:prem?'tinh-ha-kiem-de':null,prem}});
const premium=p=>p.prem;
test('chỉ khi sân đông; 4 s đầu mỗi 45 s; lần lượt từng người, người tặng nhiều trước',()=>{
 const sc={heavyCrowd:true,targets:[P('a',10),P('b',500),P('c',50,false)]},t0=SHOWCASE_EVERY*100;
 assert.equal(pickSkinShow(sc,premium,t0+1000).id,'b'); // vòng chia hết → người tặng nhiều nhất trước
 const ids=[0,1,2,3].map(i=>pickSkinShow(sc,premium,t0+i*SHOWCASE_EVERY+500).id);assert.deepEqual(new Set(ids),new Set(['a','b']));assert.ok(!ids.includes('c'));
 assert.equal(pickSkinShow(sc,premium,t0+SHOWCASE_MS+10),null);
 assert.equal(pickSkinShow({...sc,heavyCrowd:false},premium,t0+500),null);
});
test('withFullFx tạm bỏ cờ đông người rồi trả lại nguyên trạng',()=>{
 const sc={crowded:true,heavyCrowd:true,minimalCrowd:true,budget:{level:'light'}};let seen;
 withFullFx(sc,()=>{seen={...sc,level:sc.budget.level};});
 assert.equal(seen.crowded,false);assert.equal(seen.minimalCrowd,false);assert.equal(seen.alwaysSkinFx,true);assert.equal(seen.level,'full');
 assert.equal(sc.crowded,true);assert.equal(sc.minimalCrowd,true);assert.equal(sc.budget.level,'light');assert.equal(sc.alwaysSkinFx,undefined);
});
