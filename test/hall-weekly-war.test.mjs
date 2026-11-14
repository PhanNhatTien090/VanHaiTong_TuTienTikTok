import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,startHallWar,stopHallWar,action,tick,snapshot} from '../engine.mjs';
import {HALLS,editHall,editHallMember,tickHalls,hallBenefits,hallContribution} from '../ngu-duong.mjs';
import {hallWarPlaces} from '../public/hall-war.js';
import {sectHallTargets} from '../public/sect-hall.js';
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
 let w=setup();assert.equal(startHallWar(w,NOW).ok,true);assert.equal(stageConflict(w,NOW),'Ngũ Đường Giao Lưu');
 assert.equal(action(w,{type:'chat',userId:'c',text:'đường chiến'},NOW+1000).ok,true);
 assert.equal(action(w,{type:'chat',userId:'c',text:'vào đường 2'},NOW+2000).ok,false);
 assert.equal(action(w,{type:'chat',userId:'c',text:'rời đường'},NOW+2500).ok,false);
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
test('rời Đường xóa vai trò và lời mời, giữ điểm Đường và thời hạn đổi Đường',()=>{
 const w=setup(),s=w.nguDuong,h=s.halls[0];
 h.disciples.push('c');h.offers.push({id:'c',until:NOW+100000});h.points=12;
 s.queue.push({id:'c',index:1,queuedAt:NOW});
 assert.equal(action(w,{type:'chat',userId:'c',text:'rời đường'},NOW+1000).ok,true);
 assert.equal(s.members.c,undefined);
 assert.deepEqual([h.disciples,h.offers,s.queue],[[],[],[]]);
 assert.equal(h.points,12);
 assert.equal(hallBenefits(w,w.players.c,NOW+1000,'cultivate').rate,0);
 assert.equal(action(w,{type:'chat',userId:'c',text:'rời đường'},NOW+2000).ok,false);
 assert.match(action(w,{type:'chat',userId:'c',text:'vào đường 2'},NOW+3000).message,/Đổi Đường sau/);
 assert.equal(action(w,{type:'chat',userId:'c',text:'vào đường 1'},NOW+4000).ok,true);
 assert.equal(s.members.c.index,0);
});
test('Trưởng Lão rời Đường sau khi xử lý trận và không tự được bổ nhiệm lại',()=>{
 let w=setup();const s=w.nguDuong,h=s.halls[0];w.players.a.totalQi=1e6;
 s.match={a:'c',b:'a',index:0,endsAt:NOW+1000};h.guardUntil=NOW+60000;
 assert.equal(action(w,{type:'chat',userId:'a',text:'roiduong'},NOW+1000).ok,false);
 s.match=null;
 assert.equal(action(w,{type:'chat',userId:'a',text:'roiduong'},NOW+2000).ok,true);
 assert.equal(h.elder,null);assert.equal(h.guardUntil,0);
 w=JSON.parse(JSON.stringify(w));
 tickHalls(w,NOW+3000,{active:()=>true,busy:()=>true,emit:()=>{}},true);
 assert.equal(w.nguDuong.members.a,undefined);
 assert.ok(w.nguDuong.halls.every(hall=>hall.elder!=='a'));
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
test('new and deleted halls keep stable command numbers, combat camps and weekly rankings',()=>{
 let w=setup();
 assert.ok(editHall(w,{action:'delete',index:2},NOW).ok);
 assert.ok(editHall(w,{action:'add',name:'Vân Kiếm Đường'},NOW).ok);
 assert.ok(editHallMember(w,{index:5,id:'a',role:'elder'},NOW).ok);
 w=JSON.parse(JSON.stringify(w));
 const s=w.nguDuong;
 assert.equal(s.members.a.index,5);
 assert.equal(action(w,{type:'chat',userId:'c',text:'vào đường 3'},NOW+1000).ok,false);
 assert.ok(startHallWar(w,NOW+1000).ok);
 assert.equal(editHall(w,{action:'edit',index:5,name:'Vân Hải Kiếm Đường'},NOW+2000).ok,false);
 tick(w,NOW+31000);
 const team=w.hallWar.teams.find(t=>t.index===5);
 assert.equal(team.name,'Vân Kiếm Đường');
 assert.ok(team.score>0);
 const view=snapshot(w,NOW+31000);
 assert.ok(Number.isFinite(hallWarPlaces(view.hallWar,1600,NOW+31000).get('a').x));
 const [place]=sectHallTargets([{id:'a',sectHallIndex:5}],1600,view.halls.halls);
 assert.ok(place.x>0&&place.x<900);
 stopHallWar(w,NOW+32000);s.halls[5].points=20;
 const next=hallWeekStart(hallWeekAt(NOW+32000)+1);
 tickHalls(w,next,{active:()=>true,busy:()=>true,emit:()=>{}},true);
 assert.equal(s.weekHistory.at(-1).standings[0].index,5);
 assert.ok(s.weekHistory.at(-1).standings.every(h=>h.index!==2));
});
