// 19/11/2026: Bích Lân Độc Hậu — skin NỮ độc tu 500 coin (skin + Vạn Cổ Xà Trượng cùng lúc, tự mặc trượng).
import test from 'node:test';
import assert from 'node:assert/strict';
import {BICH_LAN_VISITOR,TINH_HA_VISITOR,signatureVisitor,COURT_VISITORS} from '../public/court-rewards.js';
import {creditVisitorGift,VISITOR_GIFT_REWARDS} from '../public/visitor-rewards.js';
import {VISITORS} from '../public/visitor-event.js';
import {signatureGearOf} from '../public/court-art.js';
import {isBlackGoldAward,presentationDuration} from '../public/presentation.js';
import {SKIN_GEAR,ownsGear} from '../public/skin-gear.js';
import {SIGNATURE_ULTS,signatureSkinOf} from '../public/signature-ults.js';
import {createWorld,action,ingest,startVisitor} from '../engine.mjs';

test('Bích Lân: một mốc 500 coin — 499 không nhận gì, đủ 500 nhận skin + Xà Trượng',()=>{
 const r=VISITOR_GIFT_REWARDS['bich-lan'];assert.equal(r.skinCoins,500);assert.equal(r.artifactCoins,500);assert.equal(r.artifact,'van-co-xa-truong');
 assert.equal(VISITORS['bich-lan'].name,'Bích Lân Độc Hậu');
 const p={id:'a',artifacts:[],rewardSkins:[]},w={visitor:{id:'v',kind:'bich-lan',startedAt:0,endsAt:10000}};
 let got=creditVisitorGift(w,p,499,100);assert.equal(p.rewardSkins.length,0);assert.deepEqual(got.items,[]);
 got=creditVisitorGift(w,p,1,200);assert.equal(p.skinChoice,BICH_LAN_VISITOR.skin);assert.deepEqual(got.items,[BICH_LAN_VISITOR.artifact]);
 assert.equal(signatureGearOf(p),BICH_LAN_VISITOR);assert.ok(SKIN_GEAR.includes('van-co-xa-truong'));assert.equal(ownsGear(p,'van-co-xa-truong'),true);
});
test('Bích Lân: biến hình ưu tiên cao 9 s, chiêu Lôi Đài riêng; Tinh Hà vẫn đứng đầu',()=>{
 assert.equal(signatureVisitor('bich-lan'),BICH_LAN_VISITOR);
 const e={id:'x',effect:'transform',transform:'bich-lan'};assert.equal(isBlackGoldAward(e),true);assert.equal(presentationDuration(e),9000);
 assert.equal(SIGNATURE_ULTS['bich-lan-doc-hau'].motif,'venom');assert.equal(signatureSkinOf({skinChoice:'bich-lan-doc-hau',rewardSkins:['bich-lan-doc-hau']}),'bich-lan-doc-hau');
 assert.equal(COURT_VISITORS[0],TINH_HA_VISITOR);assert.ok(COURT_VISITORS.includes(BICH_LAN_VISITOR));
});
test('Bích Lân qua engine thật: tặng 500 → mặc skin, tự mặc Xà Trượng, có màn biến hình',()=>{
 const N=Date.UTC(2026,10,19,5),w=createWorld('demo');action(w,{type:'join',userId:'n',name:'Nữ'},N-200000);
 w.players.n.artifacts.push('thien-kinh');startVisitor(w,'bich-lan',N);
 ingest(w,{event:'gift',data:{userId:'n',nickname:'Nữ',diamondCount:500,repeatCount:1,repeatEnd:true,giftType:1,giftName:'Vương miện',msgId:'q'}},N+2000);
 const p=w.players.n;assert.equal(p.skinChoice,'bich-lan-doc-hau');assert.equal(p.equipped,'van-co-xa-truong');
 assert.ok(w.events.some(e=>e.user==='n'&&e.effect==='transform'&&e.transform==='bich-lan'));
});
