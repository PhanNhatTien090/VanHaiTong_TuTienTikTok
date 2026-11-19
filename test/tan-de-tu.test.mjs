// 19/11/2026: Tân Đệ Tử — người mới thấy mình (6 ghế giữa sân) + bước kế trên đầu.
import test from 'node:test';
import assert from 'node:assert/strict';
import {isTanDeTu,tanDeTuIds,tanDeTuHint,TAN_DE_TU_MAX} from '../public/tan-de-tu.js';
import {stableTargets,plazaSlots} from '../public/live-cinema.js';
const NOW=1e12,H=1600;
const mk=(id,o={})=>({id,name:id,realm:3,joinedAt:NOW-86400000,qi:0,neededQi:100,stones:0,neededStones:0,...o});
test('chỉ người thật, cảnh giới 0–1, vào trong 15 phút; tối đa 6, mới nhất trước',()=>{
 assert.equal(isTanDeTu(mk('a',{realm:1,joinedAt:NOW-60000}),NOW),true);
 assert.equal(isTanDeTu(mk('a',{realm:2,joinedAt:NOW-60000}),NOW),false);
 assert.equal(isTanDeTu(mk('a',{realm:0,joinedAt:NOW-16*60000}),NOW),false);
 assert.equal(isTanDeTu(mk('a',{realm:0,joinedAt:NOW-1000,resident:true}),NOW),false);
 const ps=Array.from({length:9},(_,i)=>mk('n'+i,{realm:0,joinedAt:NOW-i*1000}));
 assert.deepEqual(tanDeTuIds(ps,NOW),['n0','n1','n2','n3','n4','n5']);assert.equal(TAN_DE_TU_MAX,6);
});
test('nhãn: nhập môn → tu luyện → đầy gõ 8 (chỉ lệnh gõ, không mồi tim/follow)',()=>{
 assert.equal(tanDeTuHint(mk('a',{realm:0})),'Gõ 1 · nhập môn');
 assert.equal(tanDeTuHint(mk('a',{realm:1,qi:10})),'Gõ 1 · tu luyện');
 assert.equal(tanDeTuHint(mk('a',{realm:1,qi:100})),'Đầy · gõ 8 đột phá');
 for(const s of ['Gõ 1 · nhập môn','Gõ 1 · tu luyện','Đầy · gõ 8 đột phá'])assert.doesNotMatch(s,/tim|follow|share|theo dõi/i);
});
test('người mới chiếm 6 ghế giữa sân, người cũ đang ngồi đó bị dời chứ không biến mất; người cũ còn lại giữ ghế',()=>{
 const seats=new Map(),old=Array.from({length:30},(_,i)=>mk('o'+i));
 stableTargets(seats,old,H);const before=new Map(seats);
 const news=[mk('n0',{realm:0,joinedAt:NOW-1000}),mk('n1',{realm:0,joinedAt:NOW-2000})];
 const all=[...old,...news],ids=new Set(tanDeTuIds(all,NOW));
 const out=stableTargets(seats,all,H,()=>false,undefined,()=>false,ids);
 const best=[...plazaSlots(H)].sort((a,b)=>a.rank-b.rank||a.i-b.i).map(s=>s.i).slice(0,2);
 assert.deepEqual(new Set([seats.get('n0'),seats.get('n1')]),new Set(best));
 assert.equal(out.length,32,'không ai bị mất chỗ');
 const moved=old.filter(p=>before.get(p.id)!==seats.get(p.id)).length;assert.ok(moved<=2,'chỉ người ở ghế giữ bị dời, dời '+moved);
 stableTargets(seats,all,H,()=>false,undefined,()=>false,ids);assert.equal(old.filter(p=>before.get(p.id)!==seats.get(p.id)).length,moved,'không xáo ghế liên tục');
});

test('nhiệm vụ tân thủ 3 ngày: bước kế tiếp đúng thứ tự, xong cả 3 hoặc quá 3 ngày thì thôi', async () => {
  const {tanThuQuest,tanThuIds,vnDay}=await import('../public/tan-de-tu.js');
  const now=Date.UTC(2026,10,19,10),today=vnDay(now),day=864e5;
  const p={id:'a',realm:1,joinedAt:now-day,day:null};
  assert.deepEqual(tanThuQuest(p,now,today),{done:0,total:3,next:'điểm danh',day:2});
  assert.equal(tanThuQuest({...p,day:today},now,today).next,'lên cảnh giới 2');
  assert.equal(tanThuQuest({...p,day:today,realm:2},now,today).next,'vào đường 1-5');
  assert.equal(tanThuQuest({...p,day:today,realm:2,sectHallIndex:0},now,today),null);
  assert.equal(tanThuQuest({...p,joinedAt:now-3*day},now,today),null);
  assert.equal(tanThuQuest({...p,resident:true},now,today),null);
  const many=Array.from({length:9},(_,i)=>({id:'p'+i,realm:0,joinedAt:now-i*1000}));
  assert.deepEqual(tanThuIds(many,new Set(['p0']),now),['p1','p2','p3']);
});
