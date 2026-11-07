import {speechPlan} from '../speech-lines.mjs';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,action,requiredQi,requiredStones,startOpportunity,tick,snapshot,blessing} from '../engine.mjs';
import {ascensionPracticeReward} from '../public/ascension-pacing.js';
import {dailyPracticeView,dailyAscensionView} from '../daily-practice.mjs';
import {createCanvas} from '@napi-rs/canvas';
import {Scene} from '../public/scene.js';
import {addOpportunityCredit,preserveOpportunityCredit} from '../opportunity-progress.mjs';
const N=Date.parse('2026-11-05T01:00:00+07:00'),DAY=86400000;
function setup(realm=14){const w=createWorld('live');Object.assign(w.settings,{ascensionShowcase:true,autoEvents:false,autoRandom:false,scheduledCompetitions:false,residents:false,ceremony:false,blessingMinutes:0});w.nextBossAt=N+1e12;const p=ensurePlayer(w,'a','An',N);p.realm=realm;return {w,p};}
const act=(w,type,extra={},now=N)=>action(w,{userId:'a',type,...extra},now);
const unit=p=>Math.ceil(requiredQi(p)/ascensionPracticeReward(p.realm,'cultivate',requiredQi(p),requiredStones(p)).steps);

test('eight hours retain reduced progress after the shared full-rate budget without reaching unrestricted speed',()=>{
 const {w,p}=setup(18),ceiling=unit(p)*dailyPracticeView(w,p,N).limit;p.qi=0;p.totalQi=0;
 w.boss={id:'test',name:'Test',species:'tiger',hp:1e12,maxHp:1e12,endsAt:N+DAY,participants:{},damage:{}};
 for(let s=0;s<8*3600;s+=10){act(w,'cultivate',{},N+s*1000);if(s%30===0)act(w,'gather',{},N+s*1000+1);act(w,'attack',{},N+s*1000+2);}
 assert.equal(dailyPracticeView(w,p,N+8*3600000).exhausted,true);assert.ok(p.totalQi>ceiling&&p.totalQi<=ceiling*1.5);assert.equal(p.qi,p.totalQi);assert.ok(p.herbs>100);assert.ok(w.boss.hp<1e12);
});

// 07/11/2026: thưởng điểm danh chuỗi không trừ hạn mức ngày (trước đây 1 lần điểm danh 7 ngày tiêu ~80% hạn mức).
test('weekly checkin is exempt from the pool; ordinary rewards share it; capped pills remain owned',()=>{
 const {w,p}=setup();w.settings.dailyPracticeRealmBonus=0;w.settings.dailyPracticeLimit=2;p.lastCheckinDay='2026-11-04';p.checkinStreak=6;p.pills={'qi-pill':3};p.qi=0;p.totalQi=0;
 assert.equal(act(w,'checkin').ok,true);assert.equal(dailyPracticeView(w,p,N).exhausted,false);const full=setup();full.w.settings.dailyPracticeRealmBonus=0;full.w.settings.dailyPracticeLimit=0;full.p.lastCheckinDay='2026-11-04';full.p.checkinStreak=6;full.p.qi=0;full.p.totalQi=0;act(full.w,'checkin');assert.ok(p.qi>0&&p.qi===full.p.qi);assert.ok(p.artifacts.includes('nine-heaven-seal'));
 {const v=dailyPracticeView(w,p,N);p.dailyPractice={day:v.day,used:v.limit*100};assert.equal(dailyPracticeView(w,p,N).exhausted,true);}
 const qi=p.qi,stones=p.stones,herbs=p.herbs;
 assert.equal(act(w,'use',{itemId:'qi-pill'},N+1).ok,false);assert.equal(p.pills['qi-pill'],3);assert.equal(p.qi,qi);
 assert.equal(act(w,'gather',{},N+2).ok,true);assert.ok(p.qi>qi);assert.ok(p.stones>stones&&p.herbs>herbs);
});

test('mutual cultivation cannot bypass free qi cap but still grants partnership points and resources',()=>{
 const {w,p}=setup();const b=ensurePlayer(w,'b','Binh',N);b.realm=14;
 p.dailyPractice={day:'2026-11-05',used:dailyPracticeView(w,p,N).limit*100};b.dailyPractice={day:'2026-11-05',used:dailyPracticeView(w,b,N).limit*100};const before=p.qi;
 act(w,'chat',{text:'cungtu Binh'},N+10);assert.equal(action(w,{type:'chat',userId:'b',text:'cungtu An'},N+20).ok,true);
 for(let i=0;i<3;i++){act(w,'cultivate',{},N+1000+i*11000);action(w,{type:'cultivate',userId:'b'},N+1000+i*11000);}
 assert.ok(p.qi>before);assert.equal(p.companionPoints,1);assert.equal(b.companionPoints,1);assert.equal(w.events.filter(e=>e.togetherDone).length,1);
});

test('personal gift rewards remain full and do not receive an accidental buff multiplier',()=>{
 const a=setup(),b=setup();a.p.dailyPractice={day:'2026-11-05',used:dailyPracticeView(a.w,a.p,N).limit*100};for(const p of [a.p,b.p]){p.buffMult=12;p.buffUntil=N+3600000;}
 act(a.w,'gift',{coins:1,eventId:'paid-a'});act(b.w,'gift',{coins:1,eventId:'paid-b'});
 assert.ok(a.p.qi>0);assert.equal(a.p.qi,b.p.qi);assert.equal(a.p.giftCoins,1);assert.equal(a.p.dailyPractice.used,dailyPracticeView(a.w,a.p,N).limit*100);assert.equal(b.p.dailyPractice,undefined);
 const plain=setup();act(plain.w,'gift',{coins:1,eventId:'plain'});assert.equal(plain.p.qi,a.p.qi);
});

test('normal breakthroughs, blessing and opportunities share a single high-realm daily allowance',()=>{
 const {w,p}=setup(5);p.qi=1e12;p.stones=1e6;
 assert.equal(act(w,'breakthrough').ok,true);assert.equal(p.realm,6);const q=p.qi,st=p.stones;
 assert.equal(act(w,'breakthrough',{},N+1).ok,false);assert.equal(p.qi,q);assert.equal(p.stones,st);assert.equal(snapshot(w,N+2).players[0].progressionReady,false);
 assert.equal(blessing(w,N+3,1).ok,false);assert.equal(startOpportunity(w,N+4).ok,true);
 assert.equal(act(w,'gift',{coins:100000,eventId:'banked'},N+5).ok,true);assert.equal(p.realm,6);assert.equal(p.opportunityCredit.balance,100000);
 assert.equal(act(w,'breakthrough',{},N+DAY).ok,true);assert.equal(p.realm,7);assert.equal(dailyAscensionView(w,p,N+DAY).used,1);
});

test('opportunity credit survives expiry and reload, is claimable next day without another gift',()=>{
 let {w,p}=setup(5);startOpportunity(w,N);act(w,'gift',{coins:10000,eventId:'once'},N+1);assert.equal(p.realm,6);const balance=10000-399;assert.equal(p.opportunityCredit.balance,balance);
 act(w,'gift',{coins:10000,eventId:'once'},N+2);assert.equal(p.opportunityCredit.balance,balance);
 tick(w,N+300001);w=JSON.parse(JSON.stringify(w));p=w.players.a;assert.equal(p.opportunityCredit.balance,balance);
 assert.equal(startOpportunity(w,N+DAY).ok,true);assert.equal(act(w,'chat',{text:'coduyen'},N+DAY+1).ok,true);assert.equal(p.realm,7);assert.equal(p.opportunityCredit.balance,balance-699);
 const kept=p.opportunityCredit.balance;act(w,'chat',{text:'coduyen'},N+DAY+16000);assert.equal(p.realm,7);assert.equal(p.opportunityCredit.balance,kept);
 tick(w,N+DAY+300001);assert.equal(p.opportunityCredit.balance,kept);
});

test('legacy unspent opportunity credit migrates exactly once across repeats and save/load',()=>{
 const {w,p}=setup();w.opportunity={id:'old',players:{a:{received:100,spent:40,breakthroughs:1}}};preserveOpportunityCredit(w,w.opportunity);preserveOpportunityCredit(w,w.opportunity);assert.equal(p.opportunityCredit.balance,60);
 const copy=JSON.parse(JSON.stringify(w));preserveOpportunityCredit(copy,copy.opportunity);assert.equal(copy.players.a.opportunityCredit.balance,60);
});

test('early onboarding stays fast while rebirth cannot refill the high-realm day ledger',()=>{
 const {w,p}=setup(0);p.qi=1e12;p.stones=1e6;
 for(let i=0;i<6;i++)assert.equal(act(w,'breakthrough',{},N+i).ok,true);assert.equal(p.realm,6);assert.equal(dailyAscensionView(w,p,N).used,1);
 assert.equal(act(w,'breakthrough',{},N+7).ok,false);
 p.realm=21;act(w,'chat',{text:'chuyensinh'},N+10);assert.equal(act(w,'chat',{text:'chuyensinh xac nhan'},N+11).reborn,true);assert.equal(p.realm,0);
 p.realm=5;assert.equal(dailyAscensionView(w,p,N+12).exhausted,true);
});


test('unusual opportunity participant IDs cannot mutate object prototypes',()=>{
 const {w}=setup();const p=ensurePlayer(w,'__proto__','Edge',N);const e={players:{}};addOpportunityCredit(p,e,30);addOpportunityCredit(p,e,20);
 assert.equal(p.opportunityCredit.balance,50);assert.equal(Object.hasOwn(e.players,p.id),true);assert.equal(e.players[p.id].received,50);assert.equal(Object.prototype.creditBankV2,undefined);
});

test('the live qi bar does not advertise dotpha after the shared daily allowance is spent',()=>{
 const {w,p}=setup(6);p.qi=requiredQi(p);p.stones=requiredStones(p);p.dailyAscension={day:'2026-11-05',used:1};
 const view=snapshot(w,N).players[0],scene=Object.create(Scene.prototype),c=createCanvas(900,800).getContext('2d'),labels=[];
 scene.realmCount=22;scene.targets=[{id:p.id,x:450,y:400,scale:1.5}];c.fillText=t=>labels.push(t);
 scene.drawQiBar(c,{player:view,x:400,y:440,w:100,h:30},1000);assert.equal(labels.includes('✦ Gõ đột phá'),false);assert.equal(view.progressionReady,false);
});


test('opportunity spoken opening explains the daily limit and retained credit without reading prices',()=>{
 const text=speechPlan({effect:'opportunity',opportunityStart:true}).map(x=>x.text).join(' ');
 assert.match(text,/Hóa Thần/);assert.match(text,/mỗi ngày tối đa một/);assert.match(text,/Tiến độ dư được giữ/);assert.doesNotMatch(text,/coin|\bxu\b/);
});
