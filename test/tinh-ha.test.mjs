// 19/11/2026: Tinh Hà Kiếm Đế — skin sự kiện 500 coin (skin + Tinh Hà Kiếm cùng lúc).
import test from 'node:test';
import assert from 'node:assert/strict';
import {TINH_HA_VISITOR,KARMA_VISITOR,BLACK_GOLD_VISITOR,signatureVisitor,COURT_VISITORS} from '../public/court-rewards.js';
import {creditVisitorGift,VISITOR_GIFT_REWARDS} from '../public/visitor-rewards.js';
import {VISITORS} from '../public/visitor-event.js';
import {signatureGearOf} from '../public/court-art.js';
import {isBlackGoldAward,presentationDuration} from '../public/presentation.js';
import {SKIN_GEAR,ownsGear} from '../public/skin-gear.js';
import {SIGNATURE_ULTS,signatureSkinOf} from '../public/signature-ults.js';

test('Tinh Hà Kiếm Đế: một mốc 500 coin — dưới mốc không nhận gì, đủ mốc nhận skin + kiếm',()=>{
 const r=VISITOR_GIFT_REWARDS['tinh-ha'];assert.equal(r.skinCoins,500);assert.equal(r.artifactCoins,500);
 assert.equal(VISITORS['tinh-ha'].name,'Tinh Hà Kiếm Đế');
 const p={id:'a',artifacts:[],rewardSkins:[]},w={visitor:{id:'v',kind:'tinh-ha',startedAt:0,endsAt:10000}};
 let got=creditVisitorGift(w,p,499,100);assert.equal(p.rewardSkins.length,0);assert.deepEqual(got.items,[]);
 got=creditVisitorGift(w,p,1,200);assert.equal(p.skinChoice,TINH_HA_VISITOR.skin);assert.deepEqual(got.items,[TINH_HA_VISITOR.artifact]);
 assert.equal(signatureGearOf(p),TINH_HA_VISITOR);assert.ok(SKIN_GEAR.includes('tinh-ha-kiem'));assert.equal(ownsGear(p,'tinh-ha-kiem'),true);
});
test('Tinh Hà: màn biến hình ưu tiên cao, dài 9 s; có chiêu riêng Lôi Đài',()=>{
 assert.equal(signatureVisitor('tinh-ha'),TINH_HA_VISITOR);
 const e={id:'x',effect:'transform',transform:'tinh-ha'};assert.equal(isBlackGoldAward(e),true);assert.equal(presentationDuration(e),9000);
 assert.equal(presentationDuration({id:'k',effect:'transform',transform:'nhan-qua'}),8000);
 assert.equal(SIGNATURE_ULTS['tinh-ha-kiem-de'].motif,'stars');
 assert.equal(signatureSkinOf({skinChoice:'tinh-ha-kiem-de',rewardSkins:['tinh-ha-kiem-de']}),'tinh-ha-kiem-de');
});
test('Skin cũ giữ nguyên giá + Tinh Hà đứng đầu danh sách tiên nhân',()=>{
 assert.equal(VISITOR_GIFT_REWARDS['nhan-qua'].skinCoins,500);assert.equal(COURT_VISITORS[0],TINH_HA_VISITOR);
 const p={skinChoice:TINH_HA_VISITOR.skin,skinGear:[KARMA_VISITOR.artifact,TINH_HA_VISITOR.artifact,BLACK_GOLD_VISITOR.artifact]};
 assert.equal(signatureGearOf(p),TINH_HA_VISITOR);
});
