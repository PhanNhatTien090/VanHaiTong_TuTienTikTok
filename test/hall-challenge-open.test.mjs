// 19/11/2026: thách đấu Trưởng Lão luôn được (không cần top 10 Thiên Bảng, không chờ 30 phút sau thua, không miễn chiến 10 phút).
import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,action,tick} from '../engine.mjs';
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
 assert.ok(w.arena?.hall?.challenger==='c'||w.nguDuong.match?.a==='c'||w.nguDuong.queue.some(q=>q.id==='c'),'phải vào trận hoặc hàng chờ (không bị loại âm thầm)');
});
// 21/11 tối (chủ game): thách đấu Trưởng Lão = lên Lôi Đài đánh thật; mỗi người 1 giờ mới thách lại.
function duel(w,from,until){let t=from;for(;t<until&&w.arena?.phase==='open';t+=1000)tick(w,t);tick(w,t+1000);return t+1000;}
test('thách đấu Trưởng Lão mở trận Lôi Đài; thắng thì lên ghế; 1 giờ mới thách lại',()=>{
 const w=setup(),c=w.players.c;c.totalQi=9e6;c.realm=6;w.nguDuong.halls[0].guardUntil=NOW+1e9; // người thách mạnh hơn nhiều (khóa thắng)
 assert.equal(action(w,{type:'chat',userId:'c',text:'thách đấu 1'},NOW).ok,true);
 assert.equal(w.arena?.phase,'open');assert.deepEqual([w.arena.hall.index,w.arena.hall.defender,w.arena.hall.challenger],[0,'e','c']);
 assert.equal(w.nguDuong.match,null,'không còn Vân Đài so tu vi');
 const end=duel(w,NOW+1000,NOW+5*60000);
 assert.equal(w.arena.hallResult?.winner,'c');assert.equal(w.nguDuong.halls[0].elder,'c','thắng thì ngồi ghế');
 // thua → chờ 1 giờ
 const w2=setup(),c2=w2.players.c;w2.nguDuong.halls[0].guardUntil=NOW+1e9;
 assert.equal(action(w2,{type:'chat',userId:'c',text:'thách đấu 1'},NOW).ok,true);
 const e2=duel(w2,NOW+1000,NOW+5*60000);
 assert.equal(w2.arena.hallResult?.winner,'e');assert.equal(w2.nguDuong.halls[0].elder,'e','Trưởng Lão giữ ghế');
 const again=action(w2,{type:'chat',userId:'c',text:'thách đấu 1'},e2+60000);
 assert.equal(again.ok,false);assert.match(again.message,/Thách đấu lại sau \d+ phút/);
 assert.equal(action(w2,{type:'chat',userId:'c',text:'thách đấu 1'},NOW+3600000+1000).ok,true,'đủ 1 giờ thì thách lại được');
 assert.ok(end>NOW);
});
test('Trưởng Lão vắng mặt: phân thân vẫn ra đài đánh, không bị xử thua ngay',()=>{
 const w=setup();w.nguDuong.halls[0].guardUntil=NOW+1e9;w.players.e.lastActive=NOW-6*3600000;w.players.e.lastRealInteractionAt=NOW-6*3600000;w.players.e.totalQi=9e9;w.players.e.realm=9;
 assert.equal(action(w,{type:'chat',userId:'c',text:'thách đấu 1'},NOW).ok,true);
 duel(w,NOW+1000,NOW+5*60000);
 assert.equal(w.arena.hallResult?.winner,'e');assert.equal(w.nguDuong.halls[0].elder,'e');
});
test('Trưởng Lão không thách đấu ghế khác',()=>{
 const w=setup();w.nguDuong.halls[1].elder='c';
 assert.equal(action(w,{type:'chat',userId:'c',text:'thách đấu 1'},NOW).ok,false);
});
