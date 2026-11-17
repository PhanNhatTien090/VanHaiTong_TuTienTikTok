import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,action,adminGift,requiredQi,ADMIN_COMBOS} from '../engine.mjs';
import {speechPlan} from '../speech-lines.mjs';
const N=Date.parse('2026-11-17T14:00:00Z');

test('Tông chủ ban đan dược: tên đan, chữ và giọng đọc đúng % tu vi thực nhận', () => {
  assert.deepEqual([ADMIN_COMBOS.small.name,ADMIN_COMBOS.medium.name,ADMIN_COMBOS.large.name],['Tụ Khí Đan','Ngưng Nguyên Đan','Cửu Chuyển Kim Đan']);
  for(const [combo,lo,hi] of [['small',10,30],['medium',30,90],['large',60,180]]){
    const w=createWorld('live');w.settings.residents=false;action(w,{type:'join',userId:'a',name:'An'},N);const p=w.players.a;p.realm=12;p.qi=0;
    const need=requiredQi(p),r=adminGift(w,'a',combo,N+1000);assert.equal(r.ok,true);
    const e=w.events.findLast(x=>x.adminGift===combo);
    assert.equal(e.qiPct,Math.max(1,Math.round(r.qi/need*100)));assert.ok(e.qiPct>=lo&&e.qiPct<=hi,combo+' '+e.qiPct);
    assert.match(e.text,new RegExp('tu vi \\+'+e.qiPct+'%'));
    const line=speechPlan(e).map(s=>s.text).join(' ');
    assert.match(line,new RegExp(ADMIN_COMBOS[combo].name));assert.match(line,/tu vi tăng .+ phần trăm/);assert.doesNotMatch(line,/cảm ơn|đa tạ/i);
  }
});

test('Đột Phá Đan vẫn đọc "gõ đột phá", không đọc %', () => {
  const w=createWorld('live');action(w,{type:'join',userId:'a',name:'An'},N);w.players.a.realm=6;w.players.a.qi=0;
  adminGift(w,'a','breakthrough',N+1000);const e=w.events.findLast(x=>x.adminGift==='breakthrough');
  assert.equal(e.pill,false);assert.match(speechPlan(e).map(s=>s.text).join(' '),/đột phá/);
});
