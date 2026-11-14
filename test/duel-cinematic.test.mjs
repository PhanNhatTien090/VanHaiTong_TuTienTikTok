import test from 'node:test';
import assert from 'node:assert/strict';
import {createCanvas} from '@napi-rs/canvas';
import {duelCutinPlan,duelChargingPose,drawDuelCinematic,drawDuelCharge,drawDuelRelease,DUEL_RELEASE_AT} from '../public/duel-cinematic.js';
import {EventGiftQueue} from '../public/event-gift-fx.js';
import {duelCastState} from '../public/duel-combat.js';

const T=1800000000000;
const match=()=>({id:'duel-cinematic',a:'a',b:'b',startedAt:T,endsAt:T+25000,
 aura:{a:85,b:60},boosts:{a:0,b:0},names:{a:'Tu sĩ A',b:'Tu sĩ B'},
 techniques:{a:{id:'flame',name:'Xích Hỏa Kiếm Trận',color:'#ff924c'},b:{id:'thunder',name:'Tử Điện Thiên Lôi',color:'#aa99ff'}}});
const gift=(id,value,start=100)=>({id,mode:'duel',user:id,name:'Đạo hữu '+id,value,start,profile:{duration:4000,color:'#ffda88',name:'Long Phượng Giáng Thế'},fighter:false});
test('cut-in only during charge: release begins after the diagonal panel has gone',()=>{
 const m=match();
 const start=duelCutinPlan(m,T+19801,[],1000);
 assert.equal(start.length,1);
 assert.equal(start[0].title,'Xích Hỏa Kiếm Trận');
 assert.equal(start[0].ultimate,true);
 assert.equal(duelCutinPlan(m,T+19800+3500*DUEL_RELEASE_AT+1,[],1000).length,0);
 assert.equal(duelChargingPose(m,{id:'a'},T+19850)?.mode,'cast');
 assert.equal(duelChargingPose(m,{id:'b'},T+19850),null);
 assert.equal(duelChargingPose(m,{id:'a'},T+22000),null);
});
test('two donors and a fighter can share one frame without creating phantom combat data',()=>{
 const m=match(),g=[gift('donor',2000),gift('spectator',1000)];
 const cues=duelCutinPlan(m,T+20000,g,200);
 assert.equal(cues.length,3);
 assert.equal(cues.filter(x=>x.kind==='gift').length,2);
 assert.equal(cues.filter(x=>x.kind==='cast').length,1);
 assert.equal(cues.some(x=>'damage' in x||'hp' in x),false);
 assert.equal(duelCutinPlan(m,T+20000,g,200,true).length,1);
 assert.equal(duelCutinPlan(m,T+20000,g,200).length<=3,true);
});
test('donor event queue can activate two large gifts without replaying them',()=>{
 const q=new EventGiftQueue();q.sync('duel:1',[{id:'g1',value:2000,at:T,mode:'duel'},{id:'g2',value:1000,at:T,mode:'duel'}],T);
 assert.equal(q.sampleAll(50,2).length,2);
 assert.equal(q.sampleAll(60,2).length,2);
 assert.equal(q.pending.length,0);
 q.sync('duel:2',[],T+100);
 assert.equal(q.activeRows.length,0);
 assert.equal(q.active,null);
});
test('large duel gift combo merges visually but keeps exact authoritative shield totals',()=>{
 const q=new EventGiftQueue(),ward=n=>({kind:'shield-break',target:'b',source:'a',amount:n});
 q.sync('duel:merge',[{id:'m1',user:'a',mode:'duel',gift:'Phoenix',comboKey:'series',value:500,at:T,wardEffect:ward(15000)}],T);
 assert.equal(q.sample(0),null);
 q.sync('duel:merge',[{id:'m2',user:'a',mode:'duel',gift:'Phoenix',comboKey:'series',comboFinal:true,value:500,at:T+10,wardEffect:ward(8000)}],T+10);
 assert.equal(q.pending.length,1);
 const entry=q.sample(100);
 assert.equal(entry.value,1000);
 assert.equal(entry.wardEffects[0].amount,23000);
 assert.equal(q.sampleAll(120,2).length,1);
});
test('charge pose and release drawing stay bounded and respect low-motion and flash settings',()=>{
 const screen=createCanvas(900,1600),c=screen.getContext('2d');
 const scene={budget:{level:'light'},motion:false,reduceFlash:true,targets:[{id:'a',x:225,y:1248},{id:'b',x:675,y:1248}],canvas:screen,cinematicV2:true,
  socialScene:'tournament',socialStatus:{tournament:{current:match()}},eventGiftQueue:{activeRows:[]}};
 const a=scene.targets[0],b=scene.targets[1],tech=match().techniques.a;
 c.clearRect(0,0,900,1600);
 drawDuelCharge(scene,c,a,tech,.20,50,{ultimate:true,light:true});
 drawDuelRelease(scene,c,a,{x:450,y:1000},tech,.73,{ultimate:true,light:true});
 const img=c.getImageData(225,1010,100,100).data;
 assert.ok([...img].some(v=>v!==0));
 const first=drawDuelCinematic(scene,c,100,1600,T+20000);
 assert.equal(first,1);
 const img2=c.getImageData(100,515,700,40).data;
 assert.ok([...img2].some(v=>v!==0));
 assert.equal(drawDuelCinematic({...scene,cinematicV2:false},c,100,1600,T+20000),0);
});
test('server duel phases keep their cadence: VFX never changes the winner or score',()=>{
 const before=match(),snapshot=JSON.stringify(before);
 const cast=duelCastState(19800+100,25);
 assert.equal(cast.ultimate,true);
 duelCutinPlan(before,T+19900,[gift('donor',2000)],200);
 assert.equal(JSON.stringify(before),snapshot);
 assert.ok(DUEL_RELEASE_AT>.5&&DUEL_RELEASE_AT<.7);
});
