import {test} from 'node:test';import assert from 'node:assert/strict';
import {createWorld,startVisitor,action,ingest} from '../engine.mjs';
import {visitorSkinCell,VISITOR_GIFT_REWARDS} from '../public/visitor-rewards.js';
const now=1800000000000;
function gift(w,value,id,at=now+100){return action(w,{type:'gift',userId:'p',name:'P',coins:value,count:1,eventId:id},at);}
for(const kind of ['hanlap','vuonglam'])test(kind+' configured cumulative skin/artifact milestones persist and do not collide with free claims',()=>{
 const w=createWorld('live');startVisitor(w,kind,now);const r=VISITOR_GIFT_REWARDS[kind];
 gift(w,r.skinCoins-1,'1');assert.ok(!w.players.p.rewardSkins?.includes(r.skin));gift(w,1,'2');
 assert.ok(w.players.p.rewardSkins.includes(r.skin));assert.equal(w.players.p.skinChoice,r.skin);assert.equal(visitorSkinCell(w.players.p),r.cell);
 gift(w,r.artifactCoins-r.skinCoins-1,'3');assert.ok(!w.players.p.artifacts.includes(r.artifact));gift(w,1,'4');
 assert.equal(w.players.p.artifacts.filter(id=>id===r.artifact).length,1);assert.equal(w.players.p.equipped,r.artifact);
 assert.equal(w.events.find(e=>e.visitorTechnique===kind).reward.itemNames.includes(r.artifactName),true);
 const restored=JSON.parse(JSON.stringify(w));gift(restored,1,'4');assert.equal(restored.visitor.giftProgress.p.coins,r.artifactCoins);
 action(restored,{type:'chat',text:'coduyen',userId:'p'},now+1000);assert.ok(restored.visitor.players.p);
 gift(restored,500,'5',now+1500);assert.equal(restored.players.p.artifacts.filter(id=>id===r.artifact).length,1);
});
test('one 500 gift awards both and patron grant cannot overwrite the new visitor skin',()=>{
 const w=createWorld('live');w.liveSession={active:true,startedAt:now};startVisitor(w,'hanlap',now);gift(w,500,'one');
 assert.equal(w.players.p.skinChoice,'hanlap-avatar');assert.equal(visitorSkinCell(w.players.p),1);
 assert.ok(w.players.p.giftHistory.at(-1).reward.itemNames.includes('Skin Hàn Lập'));
});
test('gift deltas count once, expire at exact boundary and reset for the next visitor',()=>{
 const w=createWorld('live');startVisitor(w,'hanlap',now);
 const e={event:'gift',data:{userId:'p',nickname:'P',diamondCount:1,giftType:1,groupId:'g',giftId:1,repeatCount:99,msgId:'a'}};
 ingest(w,e,now+100);ingest(w,{...e,data:{...e.data,repeatCount:100,msgId:'b'}},now+200);ingest(w,{...e,data:{...e.data,repeatCount:100,msgId:'c',repeatEnd:true}},now+300);
 assert.equal(w.visitor.giftProgress.p.coins,100);gift(w,400,'outside',now+180000);assert.ok(!w.players.p.artifacts.includes('hanlap-bamboo-swords'));
 startVisitor(w,'vuonglam',now+180001);gift(w,100,'new',now+180002);assert.equal(w.visitor.giftProgress.p.coins,100);assert.ok(!w.players.p.rewardSkins.includes('vuonglam-avatar'));gift(w,100,'new-2',now+180003);assert.ok(w.players.p.rewardSkins.includes('vuonglam-avatar'));assert.ok(!w.players.p.artifacts.includes('vuonglam-soul-banner'));
});
