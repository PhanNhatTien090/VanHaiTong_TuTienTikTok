import {test} from 'node:test';
import assert from 'node:assert/strict';
import {dailyPracticeView,creditDailyPractice,practiceDay} from '../daily-practice.mjs';
import {createWorld,ensurePlayer,action,requiredQi,requiredStones,snapshot,REALMS} from '../engine.mjs';
import {MAX_REALM,REBIRTH_UNLOCK_REALM} from '../public/progression.js';
import {ASCENSION_PRACTICE_STEPS} from '../public/ascension-pacing.js';
import {ascensionProfile} from '../public/ascension-art.js';
import {godFormFor} from '../public/god-forms.js';
import {realmDivineLook} from '../public/divine-wardrobe.js';
const N=Date.parse('2026-11-05T12:00:00+07:00');
function setup(realm=5){const w=createWorld('live');w.settings.ascensionShowcase=true;const p=ensurePlayer(w,'a','A',N);p.realm=realm;return {w,p};}

test('daily practice shares an exact budget across actions and resets only at Vietnam midnight',()=>{
 const {w,p}=setup();w.settings.dailyPracticeLimit=2;
 assert.equal(creditDailyPractice(w,p,100,'cultivate',N).amount,100);
 assert.equal(creditDailyPractice(w,p,140,'gather',N).amount,100);
 assert.equal(dailyPracticeView(w,p,N).used,2);assert.equal(creditDailyPractice(w,p,35,'attack',N).amount,0);
 const midnight=Date.parse('2026-11-06T00:00:00+07:00');assert.equal(practiceDay(midnight-1),'2026-11-05');assert.equal(practiceDay(midnight),'2026-11-06');
 assert.equal(dailyPracticeView(w,p,midnight-1).remaining,0);assert.equal(dailyPracticeView(w,p,midnight).remaining,2);assert.equal(creditDailyPractice(w,p,35,'attack',midnight).amount,35);
 assert.equal(dailyPracticeView(w,p,midnight).used,.35);
 const copy=JSON.parse(JSON.stringify(w));assert.equal(dailyPracticeView(copy,copy.players.a,midnight).used,.35);
 p.realm=6;assert.equal(dailyPracticeView(w,p,midnight).used,.35,'a realm change must not refresh the daily budget');
});

test('daily ceiling leaves early realms, demo, NPCs and personal gift rewards unchanged',()=>{
 const {w,p}=setup(4);w.settings.dailyPracticeLimit=1;
 for(let i=0;i<3;i++)assert.equal(creditDailyPractice(w,p,100,'cultivate',N).amount,100);assert.equal(p.dailyPractice,undefined);
 p.realm=5;creditDailyPractice(w,p,100,'cultivate',N);assert.equal(creditDailyPractice(w,p,100,'cultivate',N).amount,0);
 assert.equal(creditDailyPractice(w,p,100,'gift',N).amount,100);
 w.mode='demo';assert.equal(creditDailyPractice(w,p,100,'cultivate',N).amount,100);w.mode='live';p.puppet=true;assert.equal(creditDailyPractice(w,p,100,'cultivate',N).amount,100);
 p.puppet=false;w.settings.dailyPracticeLimit=0;assert.equal(creditDailyPractice(w,p,100,'cultivate',N).amount,100);
});

test('capped players keep combat, items and gift rewards; snapshot cannot refresh or mutate their ledger',()=>{
 const {w,p}=setup();w.settings.dailyPracticeLimit=1;
 action(w,{type:'cultivate',userId:p.id},N);const q=p.qi,st=p.stones,herbs=p.herbs;
 action(w,{type:'gather',userId:p.id},N+1);assert.equal(p.qi,q);assert.ok(p.herbs>herbs);assert.ok(p.stones>st);
 w.boss={id:'test',name:'Test',species:'tiger',hp:1e9,maxHp:1e9,endsAt:N+1e9,participants:{},damage:{}};
 const hp=w.boss.hp;assert.equal(action(w,{type:'attack',userId:p.id},N+2).ok,true);assert.ok(w.boss.hp<hp);assert.equal(p.qi,q);
 const ledger=JSON.stringify(p.dailyPractice);action(w,{type:'gift',userId:p.id,coins:1,count:1,eventId:'gift-after-cap'},N+3);assert.ok(p.qi>q);assert.equal(p.giftCoins,1);assert.equal(JSON.stringify(p.dailyPractice),ledger);
 const before=JSON.stringify(p);const view=snapshot(w,N+5).players.find(x=>x.id===p.id);assert.equal(view.dailyPracticeStatus.exhausted,true);assert.equal(JSON.stringify(p.dailyPractice),ledger);assert.equal(p.realm,5);
 const parsed=JSON.parse(before);assert.equal(p.qi,parsed.qi);assert.equal(w.events.filter(x=>x.dailyPracticeCap).length,1);
});

test('three post-Than-De realms persist and are the only path to the rebirth unlock',()=>{
 const {w,p}=setup(18);assert.equal(MAX_REALM,21);assert.equal(REBIRTH_UNLOCK_REALM,21);assert.equal(REALMS.length,22);
 assert.deepEqual(REALMS.slice(19),['Thần Tôn','Thần Tổ','Hồng Mông Chí Tôn']);
 assert.deepEqual(ASCENSION_PRACTICE_STEPS.slice(18),[7000,10000,15000]);
 for(let r=19;r<=21;r++){
  assert.equal(snapshot(w,N).players[0].rebirthEligible,false);p.qi=requiredQi(p);p.stones=requiredStones(p);
  assert.equal(action(w,{type:'breakthrough',userId:p.id},N+r*86400000).ok,true);assert.equal(p.realm,r);assert.ok(ascensionProfile(r).duration>ascensionProfile(r-1).duration);
  assert.equal(realmDivineLook(p).realm,r);assert.equal(godFormFor(p).rank,r-14);
 }
 const view=snapshot(w,N+30).players[0];assert.equal(view.rebirthEligible,true);assert.equal(view.realmName,'Hồng Mông Chí Tôn');
 const saved=JSON.parse(JSON.stringify(w));assert.equal(saved.players.a.realm,21);assert.equal(action(w,{type:'breakthrough',userId:p.id},N+31).ok,false);
});
