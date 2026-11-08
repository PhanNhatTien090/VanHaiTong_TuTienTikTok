import test from 'node:test';import assert from 'node:assert/strict';
import {createWorld,ingest,action,snapshot} from '../engine.mjs';import {EventAnnouncementHistory} from '../public/event-announcements.js';import {announcement} from '../speech.mjs';
const NOW=1793629000000;
test('a real per-viewer member arrival joins, welcomes and speaks their name without awarding progression',()=>{
 const w=createWorld('live'),before=w.totalInteractions||0;
 assert.equal(ingest(w,{event:'member',data:{actionId:1,userId:'123',nickname:'Thanh An'}},NOW).autoArrival,true);
 const p=w.players['123'];assert.equal(p.name,'Thanh An');assert.equal(p.gender,null);assert.equal(p.qi,0);assert.equal(p.giftCoins,0);assert.equal(w.totalInteractions||0,before);assert.equal(p.intro,undefined);
 const events=w.events.filter(e=>e.user===p.id&&e.effect==='join');assert.equal(events.length,1);assert.equal(events[0].autoArrival,true);assert.equal(events[0].newcomerWelcome,true);assert.match(announcement(events[0]),/Thanh An/);assert.ok(snapshot(w,NOW+100).players.find(x=>x.id===p.id)?.active);
 const history=new EventAnnouncementHistory();history.remember(w.events,NOW);assert.equal(history.get(events[0].id,NOW)?.autoArrival,true);
 const at=p.lastActive;assert.equal(ingest(w,{event:'member',data:{user:{id:123,nickname:'Thanh An'}}},NOW+1000).duplicate,true);assert.equal(p.lastActive,at);
});
test('no anonymous counters, exits, or profile guesses; returning players keep gender, skin and resources',()=>{
 const w=createWorld('live');assert.equal(ingest(w,{event:'roomUser',data:{viewerCount:200}},NOW).ignored,true);assert.equal(Object.keys(w.players).length,0);
 assert.equal(ingest(w,{event:'member',data:{userId:'a',actionId:2}},NOW).ignored,true);assert.equal(ingest(w,{event:'member',data:{nickname:'No ID'}},NOW).ok,false);
 action(w,{type:'chat',userId:'a',name:'Mai',text:'nhapmon nu'},NOW);w.players.a.skinChoice='hanlap-avatar';w.players.a.giftCoins=123;
 const state={gender:w.players.a.gender,skin:w.players.a.skinChoice,qi:w.players.a.qi};
 const r=ingest(w,{event:'member',data:{user:{id:'a',nickname:'Mai',gender:1}}},NOW+600001);assert.equal(r.autoArrival,true);
 assert.equal(w.players.a.gender,state.gender);assert.equal(w.players.a.skinChoice,state.skin);assert.equal(w.players.a.qi,state.qi);assert.equal(w.players.a.giftCoins,123);
 action(w,{type:'chat',userId:'a',text:'nhapmon'},NOW+600002);assert.equal(w.players.a.gender,'nu');
 assert.equal(ingest(w,{event:'member',data:{userId:'a'}},NOW+600003).duplicate,true);
});

test('arrival-only actors retire after 20 seconds; interaction keeps a seat and reentry is not blocked for ten minutes',()=>{
 const w=createWorld('live'),member={event:'member',data:{userId:'fresh',nickname:'Fresh'}};ingest(w,member,NOW);
 assert.equal(snapshot(w,NOW+19999).players.find(p=>p.id==='fresh').active,true);
 assert.equal(snapshot(w,NOW+20000).players.find(p=>p.id==='fresh').active,false);
 assert.equal(ingest(w,member,NOW+95000).autoArrival,true);
 action(w,{type:'like',userId:'fresh',count:1},NOW+96000);
 assert.equal(snapshot(w,NOW+190000).players.find(p=>p.id==='fresh').active,true);
 assert.equal(w.players.fresh.gender,null);
});
