import test from 'node:test';import assert from 'node:assert/strict';
import {createCanvas} from '@napi-rs/canvas';
import {createWorld,action,CATALOG,snapshot,migrateSectMasters} from '../engine.mjs';
import {giftMasterView} from '../master-rewards.mjs';
import {drawSectMaster} from '../public/sect-hall.js';
const now=Date.now();
test('cumulative real gifts unlock every permanent item exactly at 2000; replay never unlocks or credits twice',()=>{
 const w=createWorld('live'),send=(coins,id)=>action(w,{type:'gift',userId:'p',name:'P',coins,giftName:'Rose',eventId:id},now);
 send(1999,'a');const p=w.players.p;assert.ok(!p.sectMasterUnlocked);const realm=p.realm,qi=p.qi;send(1,'b');assert.equal(p.sectMasterUnlocked,true);assert.ok(CATALOG.filter(i=>i.type==='artifact').every(i=>p.artifacts.includes(i.id)));assert.ok(CATALOG.filter(i=>i.type==='manual').every(i=>p.manuals.includes(i.id)));assert.equal(p.spiritPets.length,5);assert.equal(p.raceSwordSkins.length,3);assert.equal(p.realm,realm);assert.ok(p.qi>=qi);const before=JSON.stringify(p);send(1,'b');assert.equal(JSON.stringify(p),before);assert.equal(migrateSectMasters(w),0);assert.equal(new Set(p.artifacts).size,p.artifacts.length);
 const copy=JSON.parse(JSON.stringify(w));assert.equal(copy.players.p.sectMasterUnlocked,true);
});
test('historical qualifying donors unlock on migration; simulated and admin-adjusted balances do not',()=>{
 const w=createWorld('live');for(const id of ['a','fake','edited'])action(w,{type:'join',userId:id,name:id},now);w.players.a.giftCoins=2000;w.players.fake.giftCoins=9999;w.players.fake.puppet=true;w.players.edited.giftCoins=9999;w.adminLog=[{id:'edited',changes:['coin quà 9999']}];assert.equal(migrateSectMasters(w),1);assert.equal(w.players.a.sectMasterUnlocked,true);assert.ok(!w.players.fake.sectMasterUnlocked);assert.ok(!w.players.edited.sectMasterUnlocked);
 const view=snapshot(w,now);const host=giftMasterView(view.players);assert.equal(host.userId,'a');assert.equal(host.source,'gift');assert.equal(view.players.find(p=>p.id==='a').honor.title,'TÔNG CHỦ');
});
test('throne uses the winning real player body, then restores renderer pose',()=>{
 const player={id:'p',name:'P',giftCoins:2000,realm:5},seen=[],scene={height:1600,environment:{layout:'sect'},stateServerNow:now,stateReceivedAt:0,sectMaster:{enabled:true,source:'gift',player},motion:false,drawCharacterBody(c,p){seen.push(p.id);assert.equal(this.cinematicPose.stand,0);}};assert.equal(drawSectMaster(scene,createCanvas(900,1600).getContext('2d'),100),true);assert.deepEqual(seen,['p']);assert.equal(scene.cinematicPose,undefined);assert.equal(scene.compact,undefined);
});
