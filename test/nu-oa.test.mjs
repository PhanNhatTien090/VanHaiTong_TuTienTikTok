// 21/11/2026: Nữ Oa — skin NỮ 500 coin (skin + Bổ Thiên Linh Châu cùng lúc, tự mặc châu). Thay bản Tuyết Phách (chưa ai mua).
import test from 'node:test';
import assert from 'node:assert/strict';
import {NU_OA_VISITOR,TINH_HA_VISITOR,signatureVisitor,COURT_VISITORS} from '../public/court-rewards.js';
import {creditVisitorGift,VISITOR_GIFT_REWARDS} from '../public/visitor-rewards.js';
import {VISITORS} from '../public/visitor-event.js';
import {signatureGearOf} from '../public/court-art.js';
import {isBlackGoldAward,presentationDuration} from '../public/presentation.js';
import {SKIN_GEAR,ownsGear} from '../public/skin-gear.js';
import {SIGNATURE_ULTS,signatureSkinOf} from '../public/signature-ults.js';
import {createWorld,ingest,action,startVisitor} from '../engine.mjs';
const singleVisitor=w=>{w.settings??={};w.settings.visitorLineup=false;return w;};

test('Nữ Oa: một mốc 500 coin — 499 không nhận gì, đủ 500 nhận skin + Linh Châu',()=>{
 const r=VISITOR_GIFT_REWARDS['nu-oa'];assert.equal(r.skinCoins,500);assert.equal(r.artifactCoins,500);assert.equal(r.artifact,'bo-thien-linh-chau');
 assert.equal(VISITORS['nu-oa'].name,'Nữ Oa');
 const p={id:'a',artifacts:[],rewardSkins:[]},w={visitor:{id:'v',kind:'nu-oa',startedAt:0,endsAt:10000}};
 let got=creditVisitorGift(w,p,499,100);assert.equal(p.rewardSkins.length,0);assert.deepEqual(got.items,[]);
 got=creditVisitorGift(w,p,1,200);assert.equal(p.skinChoice,NU_OA_VISITOR.skin);assert.deepEqual(got.items,[NU_OA_VISITOR.artifact]);
 assert.equal(signatureGearOf(p),NU_OA_VISITOR);assert.ok(SKIN_GEAR.includes('bo-thien-linh-chau'));assert.equal(ownsGear(p,'bo-thien-linh-chau'),true);
});
test('Nữ Oa: biến hình 9 s, chiêu Lôi Đài riêng, gõ "skin nu oa" nhận diện; Tinh Hà vẫn đứng đầu',()=>{
 assert.equal(signatureVisitor('nu-oa'),NU_OA_VISITOR);assert.ok(NU_OA_VISITOR.aliases.includes('nu oa'));
 const e={id:'x',effect:'transform',transform:'nu-oa'};assert.equal(isBlackGoldAward(e),true);assert.equal(presentationDuration(e),9000);
 assert.equal(SIGNATURE_ULTS['nu-oa'].name,'Ngũ Sắc Bổ Thiên');assert.equal(signatureSkinOf({skinChoice:'nu-oa',rewardSkins:['nu-oa']}),'nu-oa');
 assert.equal(COURT_VISITORS[0],TINH_HA_VISITOR);assert.ok(COURT_VISITORS.includes(NU_OA_VISITOR));
});
test('Nữ Oa qua engine thật: tặng 500 → mặc skin, tự mặc Linh Châu, có màn biến hình',()=>{
 const N=Date.UTC(2026,10,21,5),w=createWorld('demo');action(w,{type:'join',userId:'n',name:'Nữ'},N-200000);
 w.players.n.artifacts.push('thien-kinh');startVisitor(singleVisitor(w),'nu-oa',N);
 ingest(w,{event:'gift',data:{userId:'n',nickname:'Nữ',diamondCount:500,repeatCount:1,repeatEnd:true,giftType:1,giftName:'Vương miện',msgId:'q'}},N+2000);
 const p=w.players.n;assert.equal(p.skinChoice,'nu-oa');assert.equal(p.equipped,'bo-thien-linh-chau');
 assert.ok(w.events.some(e=>e.user==='n'&&e.effect==='transform'&&e.transform==='nu-oa'));
});
test('Nữ Oa: Linh Châu là pháp bảo — luôn vẽ ở lớp gear (kể cả đứng yên), aura không vẽ',async()=>{
 const {drawNuOaGear,drawNuOaAura}=await import('../public/nu-oa-fx.js');
 const orb={naturalWidth:400,naturalHeight:400},art={blade:orb,halo:null};
 const fake=()=>{const hits=[];const c=new Proxy({},{get:(o,k)=>k==='drawImage'?(im)=>hits.push(im):k in o?o[k]:(typeof k==='string'&&/^(create)/.test(k)?()=>({addColorStop(){}}):()=>{}),set:(o,k,v)=>(o[k]=v,true)});return {c,hits};};
 for(const [t,stand,motion] of [[1000,0,true],[7000,1,true],[0,1,false]]){const g=fake();drawNuOaGear(g.c,art,t,{stand},'front',{motion,light:true});assert.ok(g.hits.includes(orb),'t='+t+' phải có Linh Châu');}
 for(const layer of ['back','front']){const au=fake();drawNuOaAura(au.c,1000,0,layer,{motion:true,light:true});assert.ok(!au.hits.includes(orb));}
});
