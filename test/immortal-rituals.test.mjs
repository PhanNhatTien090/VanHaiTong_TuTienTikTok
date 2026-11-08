import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {daiThuaState,sliceRitualSwords,drawDaiThuaAwakening} from '../public/dai-thua-awakening.js';
import {DT_TIMING as DT,DT_BOWS,DT_STRIKES,daiThuaFormationState,dtSwordPose,dtSwordCount,dtSwordHome} from '../public/dai-thua-formation.js';
import {DAI_THUA_SCORE,daiThuaMusicDuck} from '../public/dai-thua-audio.js';
import {chanTienState,drawChanTienAwakening} from '../public/chan-tien-awakening.js';
import {breakthroughDuration} from '../public/breakthrough-fx.js';
test('Đại Thừa v2: 22,8 s, nhịp nhân quả đúng thứ tự, đổi skin sau nổ',()=>{
 const at=t=>daiThuaFormationState(t,1600,true);
 assert.equal(breakthroughDuration({toRealm:7}),22800);assert.equal(daiThuaState(19.29/22.8).revealed,false);assert.equal(daiThuaState(19.31/22.8).revealed,true);
 assert.ok(DT.absorbed<DT.impact&&DT.impact<DT.reveal);assert.ok(at(1).quake>0);assert.equal(at(2.9).river,0);assert.ok(at(5).river>.99);
 assert.ok(at(7).bow>.99&&at(10).bow===0);assert.ok(at(11).road>.99);assert.ok(at(12).tablets.every(x=>x>.99),'9 đạo bia đứng đủ trước nhát kiếm ý đầu');assert.ok(at(17).tower>.99);assert.ok(at(18.85).dive>.99);
 assert.equal(at(18.99).blast,0);assert.ok(at(20).blast>0);assert.equal(at(22.8).fade,0);assert.deepEqual(at(9),at(9));
});
test('vạn kiếm: rút khỏi núi rồi chuyển động liên tục qua mọi mốc, hội tụ khi nhập thể, rơi về đúng chỗ cũ',()=>{
 const st=t=>daiThuaFormationState(t,1600,true),n=dtSwordCount(true);
 for(let i=0;i<n;i++){assert.equal(dtSwordPose(i,n,st(.2),{}).alpha,0,'kiếm nằm trong ảnh nền trước khi rút');}
 for(const t of [3,6,9,15,17.8])for(let i=0;i<n;i+=7){const a=dtSwordPose(i,n,st(t-1e-4),{}),b=dtSwordPose(i,n,st(t+1e-4),{});assert.ok(Math.hypot(a.x-b.x,a.y-b.y)<2,'liền mạch tại '+t);}
 for(let i=0;i<n;i++){const p=dtSwordPose(i,n,st(18.5),{});assert.ok(p.alpha<.01||Math.abs(p.x-450)<80);}
 for(let i=0;i<n;i+=2){const h=dtSwordHome(i,1600),p=dtSwordPose(i,n,st(21),{});assert.ok(Math.hypot(p.x-h.x,p.y-h.y)<1);}
});
test('âm Đại Thừa: 3 cồng triều tông, 3 va chạm kiếm ý, nổ đúng mốc, cue đột ngột là transient',()=>{
 for(const b of DT_BOWS)assert.ok(DAI_THUA_SCORE.some(c=>c.tag==='gong'&&c.at===b));for(const s of DT_STRIKES)assert.ok(DAI_THUA_SCORE.some(c=>c.tag==='clash-crack'&&c.at===s));
 assert.ok(DAI_THUA_SCORE.some(c=>c.tag==='release-crack'&&c.at===DT.impact&&c.transient));for(const c of DAI_THUA_SCORE){assert.ok(c.at>=0&&c.at<DT.duration);if(c.kind==='crack')assert.equal(c.transient,true,c.tag);}
 assert.ok(daiThuaMusicDuck(18500)<daiThuaMusicDuck(4000));assert.equal(daiThuaMusicDuck(24000),1);
});
test('Chân Tiên v4: 31,6 s, 3 đợt kiếp, ngũ linh căn, Tiên Môn, phi thăng, tiên châu nhập thể rồi mới đổi skin',async()=>{
 const {CT_TIMING:CT,CT_WAVE1,CT_WAVE2,chanTienFormationState,ctBoltAt,rootSlot}=await import('../public/chan-tien-formation.js');const at=t=>chanTienFormationState(t,1600,true);
 assert.equal(breakthroughDuration({toRealm:8}),31600);assert.equal(chanTienState(27.59/31.6).revealed,false);assert.equal(chanTienState(27.61/31.6).revealed,true);
 assert.ok(CT.absorbed<CT.impact&&CT.impact<CT.reveal);for(const w of [...CT_WAVE1,...CT_WAVE2,CT.column])assert.ok(ctBoltAt(w+.02).p>.5,'sét tại '+w);
 assert.equal(at(6.9).rootsRise[0],0);assert.ok(at(9.2).rootsRise.every(x=>x>.99));assert.ok(at(10.5).morph>.99);assert.ok(at(17).merge>.99);
 assert.ok(at(18.5).gate>.99);assert.ok(at(19).beam>.99);assert.ok(at(21.9).climb>.9);assert.ok(at(23.5).heaven>.99);
 assert.ok(Math.abs(at(CT.absorbed-.01).pearlTravel-1)<.02,'tiên châu tới đan điền trước nổ');assert.equal(at(31.6).fade,0);assert.equal(chanTienState(.6,1600,false).motion,false);
 for(let i=0;i<5;i++){const p=rootSlot(i,at(10));assert.ok(p.x>200&&p.x<700&&p.y>0);}
});
test('both rituals preserve the event and draw the old and new outfits at the correct milestones',async()=>{
 const previous=globalThis.document;globalThis.document={createElement:()=>createCanvas(1,1)};
 try{
 const art=sliceRitualSwords(await loadImage('public/assets/events-v1/prestige-swords-v1.png'),createCanvas);
 for(const [realm,duration,draw,times,expected]of [[7,22800,drawDaiThuaAwakening,[1,7,14,19.29,19.31,22],[6,7]],[8,31600,drawChanTienAwakening,[1,9,23,27.59,27.61,31],[7,8]]]){
  const p={id:'a',realm:realm-1},e={id:'x',user:'a',name:'A',start:0,duration,visualFrom:p,visualTo:{...p,realm}},before=JSON.stringify(e),seen=[],c=createCanvas(900,1600).getContext('2d'),scene={players:[p],budget:{level:'light'},motion:false,cameraEnabled:true,ritualSwords:art,drawPlayer:(c,p)=>seen.push(p.realm)};
  for(const t of times){const ui=draw(scene,c,e,t*1000,1600);assert.equal(ui.realm,realm);assert.equal(ui.shake,0);assert.equal(c.globalCompositeOperation,'source-over');}
  assert.deepEqual([...new Set(seen)],expected);assert.equal(JSON.stringify(e),before);assert.ok((realm===7?scene.daiThuaActor:scene.chanTienActor).frames.size<=2);
 }
 }finally{globalThis.document=previous;}
});
