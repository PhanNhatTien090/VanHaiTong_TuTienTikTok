import test from 'node:test';import assert from 'node:assert/strict';
import {createCanvas} from '@napi-rs/canvas';
import {createWorld,action,CATALOG,snapshot,migrateSectMasters} from '../engine.mjs';
import {giftMasterView} from '../master-rewards.mjs';import {ALL_PETS} from '../public/spirit-pets.js';import {RACE_SWORD_SKINS} from '../public/race-sword-skins.js';
import {drawSectMaster} from '../public/sect-hall.js';
const now=Date.now();
test('TÔNG CHỦ chỉ mở bằng MỘT món ≥2000 coin; cộng dồn hay combo nhiều món nhỏ không tính; phát lại không cộng hai lần',()=>{
 const w=createWorld('live'),send=(coins,id,count=1)=>action(w,{type:'gift',userId:'p',name:'P',coins,count,giftName:'Rose',eventId:id},now);
 send(1999,'a');send(1999,'b');send(100,'c',30);const p=w.players.p;assert.ok(!p.sectMasterUnlocked,'cộng dồn 7000 vẫn chưa được');
 const realm=p.realm,qi=p.qi;send(2000,'d');assert.equal(p.sectMasterUnlocked,true);assert.ok(p.sectMasterGiftAt);assert.equal(p.sectMasterGiftCoins,2000);
 assert.ok(CATALOG.filter(i=>i.type==='artifact').every(i=>p.artifacts.includes(i.id)));assert.ok(CATALOG.filter(i=>i.type==='manual').every(i=>p.manuals.includes(i.id)));assert.equal(p.spiritPets.length,ALL_PETS.length);assert.equal(p.raceSwordSkins.length,RACE_SWORD_SKINS.length);assert.equal(p.realm,realm);assert.ok(p.qi>=qi);
 const before=JSON.stringify(p);send(2000,'d');assert.equal(JSON.stringify(p),before);assert.equal(new Set(p.artifacts).size,p.artifacts.length);
 const copy=JSON.parse(JSON.stringify(w));assert.equal(copy.players.p.sectMasterUnlocked,true);
});
test('danh hiệu mở theo lịch sử/cộng dồn bị gỡ (giữ đồ); người tặng món ≥2000 gần nhất ngồi ghế Tông chủ',()=>{
 const w=createWorld('live');for(const id of ['old','a','b'])action(w,{type:'join',userId:id,name:id},now);
 Object.assign(w.players.old,{giftCoins:9000,sectMasterUnlocked:true,sectMasterUnlockedAt:1,artifacts:['x']});
 assert.equal(migrateSectMasters(w),1);assert.ok(!w.players.old.sectMasterUnlocked);assert.deepEqual(w.players.old.artifacts,['x']);assert.equal(migrateSectMasters(w),0);
 action(w,{type:'gift',userId:'a',name:'a',coins:5000,count:1,giftName:'Lion',eventId:'g1'},now);action(w,{type:'gift',userId:'b',name:'b',coins:2000,count:1,giftName:'X',eventId:'g2'},now+1000);
 let view=snapshot(w,now+1000);let host=giftMasterView(view.players);assert.equal(host.userId,'b');assert.equal(host.source,'gift');assert.equal(view.players.find(p=>p.id==='b').honor.title,'TÔNG CHỦ');assert.notEqual(view.players.find(p=>p.id==='old').honor?.title,'TÔNG CHỦ');
 Object.assign(w.players.old,{sectMasterUnlocked:true,sectMasterUnlockedAt:1});view=snapshot(w,now+1500);assert.notEqual(view.players.find(p=>p.id==='old').honor?.title,'TÔNG CHỦ','cờ cũ quay về từ web không có tác dụng');assert.equal(giftMasterView(view.players).userId,'b');
 action(w,{type:'gift',userId:'a',name:'a',coins:2000,count:1,giftName:'X',eventId:'g3'},now+2000);view=snapshot(w,now+2000);assert.equal(giftMasterView(view.players).userId,'a');
});
test('throne uses the winning real player body, then restores renderer pose',()=>{
 const player={id:'p',name:'P',giftCoins:2000,realm:5},seen=[],scene={height:1600,environment:{layout:'sect'},stateServerNow:now,stateReceivedAt:0,sectMaster:{enabled:true,source:'gift',player},motion:false,drawCharacterBody(c,p){seen.push(p.id);assert.equal(this.cinematicPose.stand,0);}};assert.equal(drawSectMaster(scene,createCanvas(900,1600).getContext('2d'),100),true);assert.deepEqual(seen,['p']);assert.equal(scene.cinematicPose,undefined);assert.equal(scene.compact,undefined);
});
