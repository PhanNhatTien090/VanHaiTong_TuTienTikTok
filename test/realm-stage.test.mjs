import test from 'node:test';import assert from 'node:assert/strict';
import {realmStage,realmWithStage} from '../public/realm-stage.js';
import {createWorld,action,requiredQi,snapshot} from '../engine.mjs';
test('stage by progress to the next realm; none for mortals or the last realm',()=>{
 assert.deepEqual([0,.33,.34,.66,.67,.99,1].map(f=>realmStage(5,f*900,900)),[0,0,1,1,2,2,3]);
 assert.equal(realmStage(0,10,100),null);assert.equal(realmStage(24,10,100,true),null);
 assert.equal(realmWithStage('Kim Đan',2),'Kim Đan · Hậu kỳ');assert.equal(realmWithStage('Tiên Đế',null),'Tiên Đế');
});
test('crossing a stage emits one light note and the snapshot carries realmStage',()=>{
 const w=createWorld('demo');Object.assign(w.settings,{residents:false,autoEvents:false});w.nextBossAt=1e15;let n=Date.UTC(2026,10,12,5);
 action(w,{type:'chat',userId:'a',name:'An',text:'nhapmon'},n);const p=w.players.a;p.realm=6;p.qi=Math.ceil(requiredQi(p)/3)-1;
 action(w,{type:'chat',userId:'a',name:'An',text:'tuluyen'},n+61000);
 assert.equal(w.events.filter(e=>e.stageUp!=null).length,1);assert.equal(snapshot(w,n+61000).players.find(x=>x.id==='a').realmStage,1);
});
