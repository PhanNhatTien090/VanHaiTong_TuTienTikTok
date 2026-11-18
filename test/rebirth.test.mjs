import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,action,snapshot,requiredQi} from '../engine.mjs';
import {REBIRTH_UNLOCK_REALM} from '../public/progression.js';
const N=Date.parse('2026-11-05T18:00:00+07:00');
function setup(realm=REBIRTH_UNLOCK_REALM){const w=createWorld('live');w.settings.ascensionShowcase=true;const p=ensurePlayer(w,'a','A',N);Object.assign(p,{realm,qi:0,totalQi:999999,stones:400,herbs:30,giftCoins:300,artifacts:['jade'],manuals:['breath'],equipped:'jade',rewardSkins:['sea-dragon-heir'],skinChoice:'sea-dragon-heir',skinChoiceSource:'manual',bondId:'pair',bondIds:['pair'],dailyPractice:{day:'2026-11-05',used:90000},cooldowns:{cultivate:N}});p.qi=requiredQi(p);return {w,p};}
const chat=(w,text,at=N)=>action(w,{type:'chat',userId:'a',text},at);

test('rebirth opens only at the current final realm and requires an unexpired explicit confirmation',()=>{
 for(const realm of [18,19,20,21,22,23,24,25,26,27]){const {w,p}=setup(realm);assert.equal(chat(w,'chuyển sinh').ok,false);assert.equal(p.realm,realm);assert.equal(p.reincarnations,undefined);}
 const {w,p}=setup(REBIRTH_UNLOCK_REALM);assert.equal(chat(w,'chuyển sinh xác nhận').ok,false);assert.equal(p.realm,REBIRTH_UNLOCK_REALM);
 assert.equal(chat(w,'chuyển sinh',N+1).pending,true);assert.equal(p.realm,REBIRTH_UNLOCK_REALM);assert.equal(p.qi,requiredQi(p));
 assert.equal(chat(w,'chuyển sinh xác nhận',N+30001).ok,false);assert.equal(p.realm,REBIRTH_UNLOCK_REALM);
});

test('voluntary rebirth resets only current realm and qi, preserving ownership, relationships and daily quota across saves',()=>{
 const {w,p}=setup();const kept={};for(const k of ['totalQi','stones','herbs','giftCoins','artifacts','manuals','equipped','rewardSkins','skinChoice','skinChoiceSource','bondId','bondIds','dailyPractice','cooldowns'])kept[k]=structuredClone(p[k]);
 assert.equal(chat(w,'chuyển sinh').pending,true);const copy=JSON.parse(JSON.stringify(w)),q=copy.players.a;
 assert.equal(chat(copy,'chuyển sinh xác nhận',N+100).reborn,true);assert.equal(q.realm,0);assert.equal(q.qi,0);assert.equal(q.highestRealm,REBIRTH_UNLOCK_REALM);assert.equal(q.reincarnations,1);assert.equal(q.rebirthQiSpent,requiredQi({...q,realm:REBIRTH_UNLOCK_REALM}));
 for(const [k,v]of Object.entries(kept)){if(k==='cooldowns'){assert.equal(q.cooldowns.cultivate,v.cultivate);}else assert.deepEqual(q[k],v,k);}
 assert.equal(chat(copy,'chuyển sinh xác nhận',N+101).ok,false);assert.equal(q.reincarnations,1);
 assert.equal(snapshot(copy,N+100).players[0].rebirthEligible,false);assert.equal(copy.events.filter(e=>e.rebirth).length,1);
 const e=copy.events.find(e=>e.rebirth);assert.equal(e.visualFrom.realm,REBIRTH_UNLOCK_REALM);assert.equal(e.visualTo.realm,0);assert.equal(e.visualFrom.skinChoice,e.visualTo.skinChoice);
});

test('rebirth cannot change realm while taking part in an active contest',()=>{
 const {w,p}=setup();w.race={phase:'running',racers:[{id:p.id}]};assert.equal(chat(w,'chuyển sinh').ok,false);assert.equal(p.realm,REBIRTH_UNLOCK_REALM);
 delete w.race;w.tournament={phase:'running',participants:[p.id]};assert.equal(chat(w,'chuyển sinh').ok,false);assert.equal(p.realm,REBIRTH_UNLOCK_REALM);
});

test('rebirth requires a FULL final-realm qi bar (18/11)',()=>{
 const {w,p}=setup();const need=requiredQi(p);p.qi=need-1;
 const r=chat(w,'chuyển sinh');assert.equal(r.ok,false);assert.match(String(r.message||w.events.at(-1)?.text||''),/đầy tu vi/);
 assert.equal(snapshot(w,N).players[0].rebirthEligible,false);
 p.qi=need;assert.equal(snapshot(w,N).players[0].rebirthEligible,true);
 assert.equal(chat(w,'chuyển sinh',N+1).pending,true);assert.equal(chat(w,'chuyển sinh xác nhận',N+2).reborn,true);assert.equal(p.realm,0);
});

test('full final-realm bar announces "gõ chuyển sinh" once, not dotpha (18/11)',async()=>{
 const {speechPlan}=await import('../speech-lines.mjs');const {fastVoiceFile}=await import('../public/voice.js');
 const {w,p}=setup();p.qi=requiredQi(p)-1;p.readyRealm=REBIRTH_UNLOCK_REALM-1;
 action(w,{type:'heart',userId:'a',count:1},N+60000);p.qi=requiredQi(p);action(w,{type:'chat',userId:'a',text:'tuvi'},N+61000);
 const evs=w.events.filter(e=>e.effect==='ready'&&e.rebirthReady);assert.ok(evs.length<=1);
 const e={effect:'ready',user:'a',name:'A',text:'Đủ tu vi chuyển sinh • gõ chuyển sinh',rebirthReady:true};
 assert.match(JSON.stringify(speechPlan(e)),/chuyển sinh/);assert.doesNotMatch(JSON.stringify(speechPlan(e)),/đột phá/);assert.equal(fastVoiceFile(e),null);
});
