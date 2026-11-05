import {test} from 'node:test';import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,action,tick,startTournament,stopTournament,snapshot,startVisitor,startFlowerEvent,openBoss,startOpportunity} from '../engine.mjs';
const NOW=1800000000000;
function world(){const w=createWorld('live');Object.assign(w.settings,{residents:false,autoEvents:false,blessingMinutes:0,bossInterval:240});w.nextBossAt=NOW+1e9;return w;}
function player(w,id,name=id){return ensurePlayer(w,id,name,NOW);}
function chat(w,id,text,at=NOW+100){return action(w,{userId:id,name:w.players[id]?.name||id,type:'chat',text},at);}
test('tournament register, fair capped strengths, boosts, finish and restart award idempotency',()=>{
 let w=world();for(let i=0;i<8;i++){const p=player(w,'p'+i);p.realm=i;p.manuals=i>3?['sword']:[];}assert.ok(startTournament(w,NOW).ok);
 for(let i=0;i<8;i++)assert.ok(chat(w,'p'+i,'tythi',NOW+10+i).ok);assert.equal(chat(w,'p0','tythi',NOW+100).duplicate,true);
 tick(w,NOW+90001);assert.equal(w.tournament.phase,'running');assert.ok(Object.values(w.tournament.fighters).every(p=>p.strength>=70&&p.strength<=160));{const f=w.tournament.fighters;for(let i=1;i<8;i++)assert.ok(f['p'+i].strength>=f['p'+(i-1)].strength,'tu vi/cảnh giới cao hơn → điểm gốc không thấp hơn');}
 tick(w,NOW+94000);const m=w.tournament.current;assert.ok(m);assert.ok(chat(w,m.a,'danh',NOW+94100).ok);assert.equal(chat(w,m.a,'danh',NOW+94200).ok,false);assert.ok(chat(w,m.a,'danh',NOW+99200).ok);assert.ok(chat(w,m.a,'danh',NOW+104300).ok);assert.equal(chat(w,m.a,'danh',NOW+109400).duplicate,true);
 w=JSON.parse(JSON.stringify(w));let at=NOW+120000;for(let i=0;i<80&&w.tournament.phase==='running';i++){tick(w,at);at+=5000;}
 assert.equal(w.tournament.phase,'finished');assert.equal(w.tournament.results.length,7);const p=w.players[w.tournament.winner];assert.equal(p.tournamentWins,1);assert.ok(p.artifacts.includes('tournament-laurel'));const medals=p.tournamentMedals;tick(w,at+1000);assert.equal(p.tournamentMedals,medals);assert.equal(p.tournamentWins,1);
});
test('registration expiry, odd bracket, waiting queue and explicit cancellation have no fake champion',()=>{
 const w=world();startTournament(w,NOW);player(w,'a');assert.ok(chat(w,'a','tythi').ok);assert.equal(chat(w,'late','tythi',NOW+90000).ok,false);tick(w,NOW+90001);assert.equal(w.tournament.phase,'cancelled');assert.equal(w.players.a.tournamentWins,undefined);
 startTournament(w,NOW+100000);for(let i=0;i<9;i++){player(w,'p'+i);chat(w,'p'+i,'tythi',NOW+100010+i);}tick(w,NOW+190001);assert.equal(w.tournament.participants.length,8);assert.equal(w.tournament.waiting.length,1);assert.ok(stopTournament(w,NOW+190002).ok);assert.equal(w.tournament.phase,'cancelled');assert.equal(w.tournament.winner,undefined);
});
test('mutual consent, duplicate names, recipient ownership and invitation expiry',()=>{
 const w=world();player(w,'a','Anh');player(w,'b','Bình');player(w,'c','Bình');assert.equal(chat(w,'a','ketduyen Bình').ok,false);assert.ok(chat(w,'a','ketduyen '+w.players.b.socialCode).ok);assert.equal(w.players.a.bondId,undefined);assert.equal(chat(w,'c','dongy').ok,false);
 assert.ok(chat(w,'b','dongy',NOW+200).ok);const id=w.players.a.bondId;assert.equal(w.players.b.bondId,id);assert.ok(w.players.a.artifacts.includes('bond-jade'));assert.equal(chat(w,'b','dongy',NOW+300).ok,false);assert.equal(Object.keys(w.social.bonds).length,1);
 player(w,'d','D');assert.ok(chat(w,'c','ketduyen D',NOW+1000).ok);assert.equal(chat(w,'d','dongy',NOW+121000).ok,false);tick(w,NOW+121001);assert.equal(w.social.invites.d,undefined);
});
test('reject cooldown, no donor forced acceptance, unilateral confirmed dissolution retains items',()=>{
 const w=world();player(w,'a','A');player(w,'b','B');chat(w,'a','ketduyen B');assert.ok(chat(w,'b','tuchoi',NOW+200).ok);assert.equal(chat(w,'a','ketduyen B',NOW+70000).ok,false);
 chat(w,'a','ketduyen B',NOW+601000);assert.equal(w.social.invites.b,undefined); // receiver is no longer active
 chat(w,'b','tuluyen',NOW+601001);assert.ok(chat(w,'a','ketduyen B',NOW+601002).ok);action(w,{userId:'a',type:'gift',coins:500,count:1,eventId:'gift'},NOW+601003);assert.equal(w.players.a.bondId,undefined);chat(w,'b','dongy',NOW+601004);
 const bond=w.players.a.bondId;assert.ok(bond);assert.equal(chat(w,'a','huyduyen xac nhan',NOW+601005).ok,false);chat(w,'a','huyduyen',NOW+601006);assert.ok(chat(w,'a','huyduyen xac nhan',NOW+601007).ok);assert.equal(w.players.a.bondId,null);assert.equal(w.players.b.bondId,null);assert.ok(w.social.bonds[bond].endedAt);assert.ok(w.players.a.artifacts.includes('bond-jade'));
});
test('ceremony queues behind tournament, daily activity rewards once and survives reload',()=>{
 let w=world();player(w,'a','A');player(w,'b','B');startTournament(w,NOW);chat(w,'a','ketduyen B');chat(w,'b','dongy',NOW+200);tick(w,NOW+300);assert.equal(w.social.activeCeremony,null);stopTournament(w,NOW+400);tick(w,NOW+401);assert.ok(w.social.activeCeremony);const state=snapshot(w,NOW+402);assert.equal(state.socialScene,'bond');assert.deepEqual(state.socialStage,['a','b']);
 action(w,{type:'cultivate',userId:'a'},NOW+500);action(w,{type:'cultivate',userId:'b'},NOW+501);const id=w.players.a.bondId;assert.equal(w.social.bonds[id].days,1);w=JSON.parse(JSON.stringify(w));action(w,{type:'gather',userId:'a'},NOW+700);action(w,{type:'gather',userId:'b'},NOW+701);assert.equal(w.social.bonds[id].days,1);tick(w,NOW+11000);assert.equal(w.social.activeCeremony,null);
});
test('event locks prevent boss, visitor, opportunity and sky events taking over tournament',()=>{
 const w=world();startTournament(w,NOW);assert.equal(openBoss(w,NOW+1).ok,false);assert.equal(startVisitor(w,'hanlap',NOW+1).ok,false);assert.equal(startFlowerEvent(w,NOW+1).ok,false);assert.equal(startOpportunity(w,NOW+1).ok,false);w.nextBossAt=NOW;tick(w,NOW+2);assert.equal(w.boss,null);
});
test('tỷ thí: tu vi cao hơn thì thắng, gõ trợ lực không lật được (Nam nguyễn 50,9 triệu vs Công Tài 17,3 triệu)',()=>{
 let w=world();const a=player(w,'strong','Mạnh'),b=player(w,'weak','Yếu');a.realm=15;b.realm=13;a.totalQi=50913263;b.totalQi=17260587;b.manuals=['sword'];
 assert.ok(startTournament(w,NOW).ok);assert.ok(chat(w,'strong','tythi',NOW+10).ok);assert.ok(chat(w,'weak','tythi',NOW+11).ok);
 tick(w,NOW+90001);tick(w,NOW+94000);const m=w.tournament.current;assert.ok(m);
 for(const at of [NOW+94100,NOW+99200,NOW+104300])assert.ok(chat(w,'weak','danh',at).ok); // yếu trợ lực tối đa, mạnh không trợ lực
 let at=NOW+120000;for(let i=0;i<20&&w.tournament.phase==='running';i++){tick(w,at);at+=5000;}
 assert.equal(w.tournament.winner,'strong');
});
test('tỷ thí: tu vi sát nhau (chênh dưới 3%) thì trợ lực quyết định',()=>{
 let w=world();const a=player(w,'a1','A'),b=player(w,'b1','B');a.totalQi=1000000;b.totalQi=990000;
 assert.ok(startTournament(w,NOW).ok);assert.ok(chat(w,'a1','tythi',NOW+10).ok);assert.ok(chat(w,'b1','tythi',NOW+11).ok);
 tick(w,NOW+90001);tick(w,NOW+94000);assert.ok(w.tournament.current);
 for(const at of [NOW+94100,NOW+99200,NOW+104300])assert.ok(chat(w,'b1','danh',at).ok);
 let at=NOW+120000;for(let i=0;i<20&&w.tournament.phase==='running';i++){tick(w,at);at+=5000;}
 assert.equal(w.tournament.winner,'b1');
});
