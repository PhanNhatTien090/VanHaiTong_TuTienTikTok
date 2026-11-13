import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,startHallWar,stopHallWar,action,tick,snapshot} from '../engine.mjs';
import {HALLS,tickHalls,hallContribution} from '../ngu-duong.mjs';
import {hallWeekAt,hallWeekStart} from '../hall-weekly.mjs';
import {stageConflict} from '../stage-lock.mjs';
const NOW=Date.parse('2026-11-08T23:58:00+07:00');
function setup(){
 const w=createWorld('demo');Object.assign(w.settings,{autoEvents:false,autoRandom:false,scheduledCompetitions:false,residents:false,nguDuong:true});w.nextBossAt=NOW+1e9;
 w.nguDuong={week:hallWeekAt(NOW),halls:HALLS.map(()=>({elder:null,since:NOW,disciples:[],offers:[],points:0})),members:{},queue:[],match:null};
 for(const [id,index] of [['a',0],['b',1],['c',0],['d',1]]){const p=ensurePlayer(w,id,id,NOW);p.totalQi=100000;p.realm=3;w.nguDuong.members[id]={index,joinedAt:NOW,points:0,weekPoints:0,week:hallWeekAt(NOW)};}
 w.nguDuong.halls[0].elder='a';w.nguDuong.halls[1].elder='b';return w;
}
test('hall battle joins by real membership, resolves, saves history and never pays twice',()=>{
 let w=setup();assert.equal(startHallWar(w,NOW).ok,true);assert.equal(stageConflict(w,NOW),'Ngũ Đường Tranh Phong');
 assert.equal(action(w,{type:'chat',userId:'c',text:'đường chiến'},NOW+1000).ok,true);
 assert.equal(action(w,{type:'chat',userId:'c',text:'vào đường 2'},NOW+2000).ok,false);
 tick(w,NOW+31000);assert.equal(w.hallWar.phase,'running');
 assert.equal(action(w,{type:'chat',userId:'a',text:'6'},NOW+32000).ok,true);
 action(w,{type:'gift',userId:'a',name:'a',giftName:'Hoa',coins:300,count:1,eventId:'hall-gift'},NOW+33000);
 assert.ok(w.hallWar.members.a.boostUntil>NOW+33000);
 for(let i=1;i<=67;i++)tick(w,NOW+31000+i*1800);
 assert.equal(w.hallWar.phase,'finished');assert.ok(w.hallWar.results[0].score>0);assert.equal(w.hallWarHistory.length,1);
 assert.ok(w.nguDuong.halls[0].battlePoints>0);assert.ok(w.players.a.hallWarMedals>0);
 const medals=w.players.a.hallWarMedals;w=JSON.parse(JSON.stringify(w));tick(w,NOW+160000);assert.equal(w.players.a.hallWarMedals,medals);assert.equal(w.hallWarHistory.length,1);
 const view=snapshot(w,NOW+160000);assert.ok(Array.isArray(view.hallWar.members));assert.ok(view.halls.weekly.endsAt>view.halls.weekly.startsAt);
});
test('weekly settlement archives activity and pays active contributors once across reload',()=>{
 let w=setup();hallContribution(w,w.players.a,NOW,'cultivate');hallContribution(w,w.players.a,NOW+5000,'attack');hallContribution(w,w.players.b,NOW,'gather');
 const end=hallWeekStart(hallWeekAt(NOW)+1),date=new Date(end);assert.equal(date.getUTCDay(),0);assert.equal(date.getUTCHours(),17);
 const ctx={active:()=>true,busy:()=>true,emit:()=>{},gain:(w,p,q,s,h)=>{p.totalQi+=q;p.stones+=s;p.herbs+=h;return q;}};
 tickHalls(w,end+1,ctx,true);assert.equal(w.nguDuong.weekHistory.length,1);const history=w.nguDuong.weekHistory[0];
 assert.equal(history.standings[0].index,0);assert.equal(history.standings[0].activity.cultivate,1);assert.equal(history.rewarded,2);
 assert.equal(w.players.a.hallWeeklyClaims.length,1);assert.equal(w.players.c.hallWeeklyClaims,undefined);assert.equal(w.nguDuong.champion,0);
 const before=w.players.a.totalQi;w=JSON.parse(JSON.stringify(w));tickHalls(w,end+2000,ctx,true);assert.equal(w.players.a.totalQi,before);assert.equal(w.players.a.hallWeeklyClaims.length,1);
});
test('cancel and insufficient halls do not invent winners or rewards',()=>{
 const w=setup();for(const m of Object.values(w.nguDuong.members))m.index=0;
 assert.equal(startHallWar(w,NOW).ok,false);w.nguDuong.members.b.index=1;assert.equal(startHallWar(w,NOW).ok,true);
 assert.equal(stopHallWar(w,NOW+1000).ok,true);tick(w,NOW+40000);assert.equal(w.hallWar.phase,'cancelled');assert.equal(w.hallWarHistory,undefined);
});
