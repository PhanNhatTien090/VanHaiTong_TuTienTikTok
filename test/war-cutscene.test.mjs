import {test} from 'node:test';import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,action,tick,startWar} from '../engine.mjs';
import {WAR,WAR_CUT,warGift,warView} from '../sect-war.mjs';
import {findWarCut} from '../public/war-cutscene.js';
import {CUT_PHASE} from '../public/skill-cutscene.js';
const N=1800000000000;
function battle(){const w=createWorld('live');Object.assign(w.settings,{residents:false,autoEvents:false,blessingMinutes:0});w.nextBossAt=N+1e9;for(let i=0;i<4;i++)ensurePlayer(w,'p'+i,'Người '+i,N);
 assert.ok(startWar(w,N).ok);action(w,{type:'chat',text:'chinh',userId:'p0'},N+10);action(w,{type:'chat',text:'ma',userId:'p1'},N+20);tick(w,N+WAR.registerMs);assert.equal(w.sectWar.phase,'running');return {w,t:N+WAR.registerMs};}
const c={gain:()=>0,emit:()=>{},active:()=>true};

test('Chính Ma: quà ≥30 coin được chiếu riêng, quà nhỏ thì không; giờ trận hoãn đúng thời gian chiếu',()=>{
 const {w,t}=battle(),e=w.sectWar,end0=e.endsAt;
 assert.equal(warGift(w,w.players.p0,10,t+1,c).cut,null);
 const r=warGift(w,w.players.p0,30,t+2,c);assert.ok(r.cut);assert.equal(r.cut.side,'chinh');assert.equal(r.cut.at,t+2);assert.equal(r.cut.ms,WAR_CUT.ms);assert.equal(r.cut.user,'p0');
 assert.equal(e.endsAt,end0+WAR_CUT.ms,'trận dài thêm đúng thời gian chiếu');
 const v=warView(w,t+3);assert.equal(v.cuts.length,1);assert.equal(v.cuts[0].name,'Người 0');
});

test('Chính Ma: màn sau cách màn trước ≥6 s; hàng chờ đã có 1 màn thì không chiếu (quà vẫn đẩy)',()=>{
 const {w,t}=battle(),e=w.sectWar;
 const a=warGift(w,w.players.p0,99,t+1,c).cut,b=warGift(w,w.players.p1,99,t+2,c).cut;
 assert.ok(b.at>=a.at+a.ms+WAR_CUT.gap);
 const r=warGift(w,w.players.p0,99,t+3,c);assert.equal(r.cut,null,'hàng chờ dài → bỏ chiếu');assert.ok(r.units>0,'quà vẫn được tính');
 assert.ok(e.endsAt<=t+WAR.battleMs+2*WAR_CUT.ms+WAR_CUT.gap+5,'không hoãn chồng');
});

test('client: findWarCut chỉ trả màn đang chiếu',()=>{
 const x={id:'x',at:1000,ms:3600};
 assert.equal(findWarCut({cuts:[x]},900),null);assert.ok(findWarCut({cuts:[x]},1000+3600*CUT_PHASE.cast));assert.equal(findWarCut({cuts:[x]},4700),null);
});
