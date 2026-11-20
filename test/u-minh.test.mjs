// 21/11/2026: U Minh Ma Đế — skin NAM ma đạo 500 coin (skin + Vạn Hồn Phiên cùng lúc, tự mặc cờ).
import test from 'node:test';
import assert from 'node:assert/strict';
import {U_MINH_VISITOR,TINH_HA_VISITOR,signatureVisitor,COURT_VISITORS} from '../public/court-rewards.js';
import {creditVisitorGift,VISITOR_GIFT_REWARDS} from '../public/visitor-rewards.js';
import {VISITORS} from '../public/visitor-event.js';
import {signatureGearOf} from '../public/court-art.js';
import {isBlackGoldAward,presentationDuration} from '../public/presentation.js';
import {SKIN_GEAR,ownsGear} from '../public/skin-gear.js';
import {SIGNATURE_ULTS,signatureSkinOf} from '../public/signature-ults.js';
import {createWorld,ingest,action,startVisitor} from '../engine.mjs';
const singleVisitor=w=>{w.settings??={};w.settings.visitorLineup=false;return w;};

test('U Minh: một mốc 500 coin — 499 không nhận gì, đủ 500 nhận skin + Vạn Hồn Phiên',()=>{
 const r=VISITOR_GIFT_REWARDS['u-minh'];assert.equal(r.skinCoins,500);assert.equal(r.artifactCoins,500);assert.equal(r.artifact,'van-hon-phien');
 assert.equal(VISITORS['u-minh'].name,'U Minh Ma Đế');
 const p={id:'a',artifacts:[],rewardSkins:[]},w={visitor:{id:'v',kind:'u-minh',startedAt:0,endsAt:10000}};
 let got=creditVisitorGift(w,p,499,100);assert.equal(p.rewardSkins.length,0);assert.deepEqual(got.items,[]);
 got=creditVisitorGift(w,p,1,200);assert.equal(p.skinChoice,U_MINH_VISITOR.skin);assert.deepEqual(got.items,[U_MINH_VISITOR.artifact]);
 assert.equal(signatureGearOf(p),U_MINH_VISITOR);assert.ok(SKIN_GEAR.includes('van-hon-phien'));assert.equal(ownsGear(p,'van-hon-phien'),true);
});
test('U Minh: biến hình 9 s, chiêu Lôi Đài riêng, gõ "skin u minh" nhận diện; Tinh Hà vẫn đứng đầu',()=>{
 assert.equal(signatureVisitor('u-minh'),U_MINH_VISITOR);assert.ok(U_MINH_VISITOR.aliases.includes('u minh'));
 const e={id:'x',effect:'transform',transform:'u-minh'};assert.equal(isBlackGoldAward(e),true);assert.equal(presentationDuration(e),9000);
 assert.equal(SIGNATURE_ULTS['u-minh-ma-de'].name,'Vạn Hồn Phệ Thiên');assert.equal(signatureSkinOf({skinChoice:'u-minh-ma-de',rewardSkins:['u-minh-ma-de']}),'u-minh-ma-de');
 assert.equal(COURT_VISITORS[0],TINH_HA_VISITOR);assert.ok(COURT_VISITORS.includes(U_MINH_VISITOR));
});
test('U Minh qua engine thật: tặng 500 → mặc skin, tự mặc Vạn Hồn Phiên, có màn biến hình',()=>{
 const N=Date.UTC(2026,10,21,5),w=createWorld('demo');action(w,{type:'join',userId:'n',name:'Nữ'},N-200000);
 w.players.n.artifacts.push('thien-kinh');startVisitor(singleVisitor(w),'u-minh',N);
 ingest(w,{event:'gift',data:{userId:'n',nickname:'Nữ',diamondCount:500,repeatCount:1,repeatEnd:true,giftType:1,giftName:'Vương miện',msgId:'q'}},N+2000);
 const p=w.players.n;assert.equal(p.skinChoice,'u-minh-ma-de');assert.equal(p.equipped,'van-hon-phien');
 assert.ok(w.events.some(e=>e.user==='n'&&e.effect==='transform'&&e.transform==='u-minh'));
});
test('U Minh: Vạn Hồn Phiên là pháp bảo — luôn vẽ ở lớp gear (kể cả đứng yên), aura không vẽ',async()=>{
 const {drawUMinhGear,drawUMinhAura}=await import('../public/u-minh-fx.js');
 const flag={naturalWidth:400,naturalHeight:400},art={blade:flag,halo:null};
 const fake=()=>{const hits=[];const c=new Proxy({},{get:(o,k)=>k==='drawImage'?(im)=>hits.push(im):k in o?o[k]:(typeof k==='string'&&/^(create)/.test(k)?()=>({addColorStop(){}}):()=>{}),set:(o,k,v)=>(o[k]=v,true)});return {c,hits};};
 for(const [t,stand,motion] of [[1000,0,true],[7000,1,true],[0,1,false]]){const g=fake();drawUMinhGear(g.c,art,t,{stand},'front',{motion,light:true});assert.ok(g.hits.includes(flag),'t='+t+' phải có Vạn Hồn Phiên');}
 for(const layer of ['back','front']){const au=fake();drawUMinhAura(au.c,1000,0,layer,{motion:true,light:true});assert.ok(!au.hits.includes(flag));}
});
