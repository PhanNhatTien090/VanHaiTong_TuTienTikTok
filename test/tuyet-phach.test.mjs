// 20/11/2026: Tuyết Phách Tiên Hậu — skin NỮ băng tuyết 500 coin (skin + Thiên Sương Phiến cùng lúc, tự mặc quạt).
import test from 'node:test';
import assert from 'node:assert/strict';
import {TUYET_PHACH_VISITOR,TINH_HA_VISITOR,signatureVisitor,COURT_VISITORS} from '../public/court-rewards.js';
import {creditVisitorGift,VISITOR_GIFT_REWARDS} from '../public/visitor-rewards.js';
import {VISITORS} from '../public/visitor-event.js';
import {signatureGearOf} from '../public/court-art.js';
import {isBlackGoldAward,presentationDuration} from '../public/presentation.js';
import {SKIN_GEAR,ownsGear} from '../public/skin-gear.js';
import {SIGNATURE_ULTS,signatureSkinOf} from '../public/signature-ults.js';
import {createWorld,action,ingest,startVisitor} from '../engine.mjs';
// 20/11: test luật sự kiện 1 vị (lượt nhiều vị kiểm ở visitor-lineup.test.mjs).
const singleVisitor=w=>{w.settings??={};w.settings.visitorLineup=false;return w;};

test('Tuyết Phách: một mốc 500 coin — 499 không nhận gì, đủ 500 nhận skin + Thiên Sương Phiến',()=>{
 const r=VISITOR_GIFT_REWARDS['tuyet-phach'];assert.equal(r.skinCoins,500);assert.equal(r.artifactCoins,500);assert.equal(r.artifact,'thien-suong-phien');
 assert.equal(VISITORS['tuyet-phach'].name,'Tuyết Phách Tiên Hậu');
 const p={id:'a',artifacts:[],rewardSkins:[]},w={visitor:{id:'v',kind:'tuyet-phach',startedAt:0,endsAt:10000}};
 let got=creditVisitorGift(w,p,499,100);assert.equal(p.rewardSkins.length,0);assert.deepEqual(got.items,[]);
 got=creditVisitorGift(w,p,1,200);assert.equal(p.skinChoice,TUYET_PHACH_VISITOR.skin);assert.deepEqual(got.items,[TUYET_PHACH_VISITOR.artifact]);
 assert.equal(signatureGearOf(p),TUYET_PHACH_VISITOR);assert.ok(SKIN_GEAR.includes('thien-suong-phien'));assert.equal(ownsGear(p,'thien-suong-phien'),true);
});
test('Tuyết Phách: biến hình ưu tiên cao 9 s, chiêu Lôi Đài riêng; Tinh Hà vẫn đứng đầu',()=>{
 assert.equal(signatureVisitor('tuyet-phach'),TUYET_PHACH_VISITOR);
 const e={id:'x',effect:'transform',transform:'tuyet-phach'};assert.equal(isBlackGoldAward(e),true);assert.equal(presentationDuration(e),9000);
 assert.equal(SIGNATURE_ULTS['tuyet-phach-tien-hau'].motif,'ice');assert.equal(signatureSkinOf({skinChoice:'tuyet-phach-tien-hau',rewardSkins:['tuyet-phach-tien-hau']}),'tuyet-phach-tien-hau');
 assert.equal(COURT_VISITORS[0],TINH_HA_VISITOR);assert.ok(COURT_VISITORS.includes(TUYET_PHACH_VISITOR));
});
test('Tuyết Phách qua engine thật: tặng 500 → mặc skin, tự mặc Thiên Sương Phiến, có màn biến hình',()=>{
 const N=Date.UTC(2026,10,19,5),w=createWorld('demo');action(w,{type:'join',userId:'n',name:'Nữ'},N-200000);
 w.players.n.artifacts.push('thien-kinh');startVisitor(singleVisitor(w),'tuyet-phach',N);
 ingest(w,{event:'gift',data:{userId:'n',nickname:'Nữ',diamondCount:500,repeatCount:1,repeatEnd:true,giftType:1,giftName:'Vương miện',msgId:'q'}},N+2000);
 const p=w.players.n;assert.equal(p.skinChoice,'tuyet-phach-tien-hau');assert.equal(p.equipped,'thien-suong-phien');
 assert.ok(w.events.some(e=>e.user==='n'&&e.effect==='transform'&&e.transform==='tuyet-phach'));
});
test('Tuyết Phách: phượng băng là linh vật — luôn vẽ ở lớp gear, không phụ thuộc nhịp bùng aura',async()=>{
 const {drawTuyetPhachGear,drawTuyetPhachAura}=await import('../public/tuyet-phach-fx.js');
 const phoenix={naturalWidth:400,naturalHeight:200},art={phoenix,halo:null,blade:null};
 const fake=()=>{const hits=[];const c=new Proxy({},{get:(o,k)=>k==='drawImage'?(im)=>hits.push(im):k in o?o[k]:(typeof k==='string'&&/^(create)/.test(k)?()=>({addColorStop(){}}):()=>{}),set:(o,k,v)=>(o[k]=v,true)});return {c,hits};};
 // phượng bay vòng: mỗi khung đúng 1 lớp (sau lưng HOẶC trước người) vẽ phượng — không bao giờ mất, không vẽ đôi.
 for(const t of [0,1000,3000,5000,7000,9000,11000,13000]){for(const stand of [0,1]){const b=fake(),f=fake();
  drawTuyetPhachGear(b.c,art,t,{stand},'back',{motion:true,light:true});drawTuyetPhachGear(f.c,art,t,{stand},'front',{motion:true,light:true});
  const n=b.hits.filter(x=>x===phoenix).length+f.hits.filter(x=>x===phoenix).length;assert.ok(n>0,'t='+t+' phải có phượng');
  assert.ok(!(b.hits.includes(phoenix)&&f.hits.includes(phoenix)),'t='+t+' không vẽ đôi');}}
 const s=fake(),s2=fake();drawTuyetPhachGear(s.c,art,0,{stand:1},'back',{motion:false});drawTuyetPhachGear(s2.c,art,0,{stand:1},'front',{motion:false});assert.ok(s.hits.includes(phoenix)||s2.hits.includes(phoenix),'đứng yên vẫn có phượng');
 const au=fake();drawTuyetPhachAura(au.c,1000,0,'back',{motion:false,light:true,art});assert.ok(!au.hits.includes(phoenix),'aura không vẽ phượng nữa (tránh vẽ đôi)');
});
