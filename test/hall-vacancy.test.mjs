import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,ensurePlayer} from '../engine.mjs';
import {HALLS,tickHalls,hallView} from '../ngu-duong.mjs';
import {hallWeekAt} from '../hall-weekly.mjs';
const NOW=Date.parse('2026-11-15T21:30:00+07:00');
const ctx={active:()=>true,busy:()=>true,emit:()=>{}};
function setup(){
 const w=createWorld('live');Object.assign(w.settings,{autoEvents:false,residents:false,nguDuong:true});
 w.nguDuong={week:hallWeekAt(NOW),halls:HALLS.map(()=>({elder:null,since:NOW-1e6,disciples:[],offers:[],points:0})),members:{},queue:[],match:null};
 const mk=(id,index,qi)=>{const p=ensurePlayer(w,id,id.toUpperCase(),NOW);Object.assign(p,{totalQi:qi,realm:9,lastActive:NOW});if(index!=null)w.nguDuong.members[id]={index,joinedAt:NOW,points:0,weekPoints:0,week:hallWeekAt(NOW)};return p;};
 // Mọi Đường khác đều có Đường chủ để kiểm đúng Đường 1.
 HALLS.forEach((h,i)=>{if(i){mk('e'+i,i,9e9);w.nguDuong.halls[i].elder='e'+i;}});
 return {w,mk};
}
test('Đường chủ lên Tông chủ → Chân Truyền mạnh nhất của Đường lên thay (kể cả Chân Truyền do quản lý gán)',()=>{
 const {w,mk}=setup();
 const nam=mk('nam',0,5e10);Object.assign(nam,{sectMasterUnlocked:true,sectMasterGiftAt:NOW-1000});w.masterSeat={userId:'nam',pairs:{}};
 w.nguDuong.halls[0].elder='nam';
 mk('c1',0,2e9).hallAppointmentOptOut=true;mk('c2',0,3e9).hallAppointmentOptOut=true;w.nguDuong.halls[0].disciples=['c1','c2'];
 tickHalls(w,NOW,ctx,true);
 assert.equal(w.nguDuong.halls[0].elder,'c2');assert.ok(!w.nguDuong.halls[0].disciples.includes('c2'));
 assert.equal(hallView(w,NOW,()=>true).halls[0].elder.id,'c2');
});
test('không có Chân Truyền → Tông chủ cũ đang rảnh trấn giữ; không có nữa → đệ tử mạnh nhất',()=>{
 const {w,mk}=setup();
 const nam=mk('nam',0,5e10);Object.assign(nam,{sectMasterUnlocked:true,sectMasterGiftAt:NOW-1000});w.masterSeat={userId:'nam',pairs:{}};
 const hoang=mk('hoang',null,1e9);Object.assign(hoang,{sectMasterUnlocked:true,sectMasterGiftAt:NOW-3e8});
 mk('m1',0,8e8);
 tickHalls(w,NOW,ctx,true);assert.equal(w.nguDuong.halls[0].elder,'hoang');
 const {w:w2,mk:mk2}=setup();const n2=mk2('nam',0,5e10);Object.assign(n2,{sectMasterUnlocked:true,sectMasterGiftAt:NOW});w2.masterSeat={userId:'nam',pairs:{}};
 mk2('m1',0,8e8);mk2('m2',0,9e8);
 tickHalls(w2,NOW,ctx,true);assert.equal(w2.nguDuong.halls[0].elder,'m2');
});
