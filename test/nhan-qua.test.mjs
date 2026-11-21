import test from 'node:test';
import assert from 'node:assert/strict';
import {BLACK_GOLD_VISITOR,KARMA_VISITOR,signatureVisitor} from '../public/court-rewards.js';
import {creditVisitorGift,VISITOR_GIFT_REWARDS} from '../public/visitor-rewards.js';
import {VISITORS} from '../public/visitor-event.js';
import {showsBlackGoldGear,signatureGearOf} from '../public/court-art.js';
import {isBlackGoldAward,presentationDuration} from '../public/presentation.js';

test('Nhân Quả Vương Lâm: chỉ một mốc 500 coin, nhận skin + thương cùng lúc', () => {
 const r=VISITOR_GIFT_REWARDS['nhan-qua'];
 assert.equal(r.skinCoins,500);assert.equal(r.artifactCoins,500);
 assert.equal(VISITORS['nhan-qua'].name,'Nhân Quả Vương Lâm');
 const p={id:'a',artifacts:[],rewardSkins:[]},w={visitor:{id:'v',kind:'nhan-qua',startedAt:0,endsAt:10000}};
 let got=creditVisitorGift(w,p,300,100);
 assert.deepEqual(got.skinNames,[]);assert.deepEqual(got.items,[]);assert.equal(p.rewardSkins.length,0);
 got=creditVisitorGift(w,p,199,200);
 assert.equal(p.rewardSkins.length,0,'499 coin vẫn chưa có gì');
 got=creditVisitorGift(w,p,1,300);
 assert.equal(p.skinChoice,KARMA_VISITOR.skin);
 assert.deepEqual(got.items,[KARMA_VISITOR.artifact]);
 assert.equal(showsBlackGoldGear(p),true);
 assert.equal(signatureGearOf(p),KARMA_VISITOR);
});

test('Nhân Quả: màn biến hình ưu tiên cao và dài hơn skin thường', () => {
 assert.equal(signatureVisitor('nhan-qua'),KARMA_VISITOR);
 const e={id:'x',effect:'transform',transform:'nhan-qua'};
 assert.equal(isBlackGoldAward(e),true);
 assert.equal(presentationDuration(e),8000);
 assert.equal(presentationDuration({id:'y',effect:'transform',transform:'xich-vu'}),6000);
});

test('Nhân Quả selects its own spear when both signature sets are owned',()=>{
 const p={skinChoice:KARMA_VISITOR.skin,equipped:BLACK_GOLD_VISITOR.artifact,
  skinGear:[BLACK_GOLD_VISITOR.artifact,KARMA_VISITOR.artifact]};
 assert.equal(signatureGearOf(p),KARMA_VISITOR);
 assert.equal(signatureGearOf({...p,skinChoice:BLACK_GOLD_VISITOR.skin}),BLACK_GOLD_VISITOR);
});

test('21/11 tối: Tiêu Viêm / Nguyệt Liên / Xích Vũ bán CẢ BỘ 400 (giá skin lẻ cũ 300 chỉ để bù người đã có skin)', () => {
 for(const kind of ['hac-kim','nguyet-lien','xich-vu']){
  assert.equal(VISITOR_GIFT_REWARDS[kind].skinCoins,400);assert.equal(VISITOR_GIFT_REWARDS[kind].artifactCoins,400);assert.equal(VISITOR_GIFT_REWARDS[kind].skinOnlyCoins,300);
 }
});
