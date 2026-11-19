// 19/11/2026: thách đấu Trưởng Lão luôn được (không cần top 10 Thiên Bảng, không chờ 30 phút sau thua, không miễn chiến 10 phút).
import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,action} from '../engine.mjs';
import {HALLS} from '../ngu-duong.mjs';
import {hallWeekAt} from '../hall-weekly.mjs';
const NOW=Date.parse('2026-11-19T20:00:00+07:00');
function setup(){
 const w=createWorld('demo');Object.assign(w.settings,{autoEvents:false,autoRandom:false,scheduledCompetitions:false,residents:false,nguDuong:true});w.nextBossAt=NOW+1e9;
 w.nguDuong={week:hallWeekAt(NOW),halls:HALLS.map(()=>({elder:null,since:NOW,disciples:[],offers:[],points:0})),members:{},queue:[],match:null};
 for(let i=0;i<14;i++){const p=ensurePlayer(w,'top'+i,'Top '+i,NOW-60000);p.totalQi=9e9-i;p.realm=8;}
 const elder=ensurePlayer(w,'e','Lão',NOW-60000);elder.totalQi=5e5;elder.realm=4;w.nguDuong.halls[0].elder='e';
 const c=ensurePlayer(w,'c','Tân',NOW-60000);c.totalQi=100;c.realm=1;
 return w;
}
test('người ngoài top 10, vừa thua, Trưởng Lão đang miễn chiến → vẫn thách đấu được',()=>{
 const w=setup(),c=w.players.c;c.hallDefeatUntil=NOW+20*60000;w.nguDuong.halls[0].guardUntil=NOW+9*60000;
 const r=action(w,{type:'chat',userId:'c',text:'thách đấu 1'},NOW);
 assert.equal(r.ok,true,r.message);
 assert.ok(w.nguDuong.match?.a==='c'||w.nguDuong.queue.some(q=>q.id==='c'),'phải vào trận hoặc hàng chờ (không bị loại âm thầm)');
});
test('Trưởng Lão không thách đấu ghế khác',()=>{
 const w=setup();w.nguDuong.halls[1].elder='c';
 assert.equal(action(w,{type:'chat',userId:'c',text:'thách đấu 1'},NOW).ok,false);
});
