import {test} from 'node:test';import assert from 'node:assert/strict';
import {createCanvas} from '@napi-rs/canvas';
import {createWorld,ingest,action} from '../engine.mjs';
import {announcement} from '../speech.mjs';
import {actionPose} from '../public/character-animation.js';
import {EventAnnouncementHistory} from '../public/event-announcements.js';
import {noteEngagementReaction,drawEngagementReactions} from '../public/engagement-reactions.js';
const N=Date.parse('2026-11-02T16:00:00Z');
const packet=(event,id='one')=>({event,data:{user:{userId:'123',nickname:'An'},msgId:id}});
test('follow has an explicit wave, voice and one permanent reward across replay and restart',()=>{
 let w=createWorld();assert.equal(ingest(w,packet('follow'),N).ok,true);
 let p=w.players['123'];assert.equal(p.qi,0,'3/11: không thưởng follow');assert.equal(p.stones,30);assert.equal(p.giftCoins,0);
 const e=w.events.find(e=>e.engagementAction==='follow');assert.ok(e);assert.equal(actionPose(e),'wave');assert.doesNotMatch(announcement(e),/theo dõi|cảm ơn/i);
 w=JSON.parse(JSON.stringify(w));ingest(w,packet('follow'),N+1000);ingest(w,packet('follow','different'),N+10000);
 p=w.players['123'];assert.equal(p.qi,0);assert.equal(w.events.filter(e=>e.engagementAction).length,1);
 ingest(w,packet('follow','returning'),N+6*60000);assert.equal(p.qi,0);assert.equal(w.events.findLast(e=>e.engagementAction).rewarded,false);
});
test('share packets are accepted, have once-daily rewards and bounded repeat visuals, never counted as paid gifts',()=>{
 let w=createWorld();ingest(w,packet('share'),N);let p=w.players['123'];assert.equal(p.qi,0,'3/11: không thưởng share');assert.equal(p.stones,30);
 ingest(w,packet('share'),N+70000);assert.equal(w.events.filter(e=>e.engagementAction).length,1,'stable ID replay ignored');
 ingest(w,packet('share','two'),N+70001);assert.equal(p.qi,0);assert.equal(w.events.filter(e=>e.engagementAction).length,2);
 ingest(w,packet('share','spam'),N+70002);assert.equal(w.events.filter(e=>e.engagementAction).length,2);
 w=JSON.parse(JSON.stringify(w));ingest(w,packet('share','tomorrow'),N+2*3600000);
 p=w.players['123'];assert.equal(p.qi,0,'3/11: share không thưởng');assert.equal(p.giftCoins,0);
 assert.doesNotMatch(announcement(w.events.findLast(e=>e.engagementAction)),/chia sẻ|cảm ơn/i);
 assert.equal(w.auditOutbox.filter(e=>e.type==='engagement').length,3);
});
test('typed follow/share text and NPC events do not qualify for genuine engagement rewards',()=>{
 const w=createWorld();action(w,{type:'chat',userId:'a',text:'share'},N);assert.equal(w.players.a.shareRewardDay,undefined);
 w.players.a.puppet=true;const qi=w.players.a.qi;
 action(w,{type:'share',userId:'a'},N+1000);action(w,{type:'follow',userId:'a'},N+1001);assert.equal(w.players.a.qi,qi);
 assert.equal(w.events.filter(e=>e.engagementAction).length,0);
});
test('engagement receipts survive the normal event window; reaction drawings animate and are bounded',()=>{
 const w=createWorld();ingest(w,packet('share'),N);const e=w.events.find(e=>e.engagementAction),history=new EventAnnouncementHistory();history.remember([e],N+1);assert.equal(history.get(e.id,N+1000).id,e.id);
 const scene={motion:true,budget:{level:'light'},targets:[{id:e.user,x:200,y:300,scale:1.5}]};noteEngagementReaction(scene,e,0);
 const render=t=>{const c=createCanvas(400,500).getContext('2d');drawEngagementReactions(scene,c,t);return c.canvas.toBuffer('image/png');};
 assert.notDeepEqual(render(1000),render(1500));scene.motion=false;assert.deepEqual(render(1000),render(1500));
 for(let i=0;i<20;i++)noteEngagementReaction(scene,{...e,user:'p'+i},1000);assert.equal(scene.engagementReactions.size,8);
 drawEngagementReactions(scene,createCanvas(400,500).getContext('2d'),5000);assert.equal(scene.engagementReactions.size,0);
});
