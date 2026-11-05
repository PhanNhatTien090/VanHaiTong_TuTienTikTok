import {test} from 'node:test';
import assert from 'node:assert/strict';
import {StageDirector,SEATS,MIN_STAY} from '../public/stage.js';
const mk=n=>Array.from({length:n},(_,i)=>({id:'v'+i,name:'V'+i,realm:0,giftCoins:0}));
const residents=[{id:'resident:a',resident:true},{id:'resident:b',resident:true},{id:'resident:c',resident:true}];

test('few viewers: everyone seated plus residents; many viewers: residents leave, seats capped',()=>{
  const d=new StageDirector();assert.equal(d.update(mk(4),residents,0).length,7);
  const d2=new StageDirector();const seated=d2.update(mk(300),residents,0);
  assert.equal(seated.length,SEATS);assert.ok(seated.every(p=>!p.resident));
});

test('a viewer who comments gets a seat within about a second, then keeps it for the minimum stay',()=>{
  const d=new StageDirector();const players=mk(300);let t=0;d.update(players,[],t);
  t=MIN_STAY+1000;d.update(players,[],t);
  d.note({user:'v250',text:'tuluyen'},t);const after=d.update(players,[],t+500).map(p=>p.id);
  assert.ok(after.includes('v250'),'commenter seated');
  for(let i=0;i<30;i++)d.note({user:'v'+(200+i)},t+600);
  d.update(players,[],t+1100);assert.ok(d.update(players,[],t+1200).map(p=>p.id).includes('v250'),'not kicked by the next wave');
});

test('seat changes are rate-limited even under a flood of comments',()=>{
  const d=new StageDirector();const players=mk(400);let t=0;d.update(players,[],t);t=MIN_STAY*2;d.update(players,[],t);
  const before=new Set(d.order);for(let i=100;i<400;i++)d.note({user:'v'+i},t);
  let changed=0;for(let k=1;k<=10;k++){d.update(players,[],t+k*100);}
  changed=d.order.filter(id=>!before.has(id)).length;
  assert.ok(changed<=SEATS&&changed<=2*1+2,`changed ${changed} seats in 1s`);
});

test('required players (effects / selected) are always on stage; seat order is stable',()=>{
  const d=new StageDirector();const players=mk(100);d.update(players,[],0);const order=[...d.order];
  const got=d.update(players,[],100,new Set(['v99'])).map(p=>p.id);assert.ok(got.includes('v99'));
  assert.equal(got.filter((id,i)=>id===order[i]).length,SEATS-1,'only one seat changed');
});

test('người mới 🌱 ngồi giữa hàng TRÊN CÙNG, không ai bị đẩy khỏi sân khấu (4/11)', async () => {
  const { StageDirector } = await import('../public/stage.js');
  const now = Date.now();
  const old = Array.from({ length: 9 }, (_, i) => ({ id: 'cu' + i, realm: 5, joinedAt: now - 86400000 }));
  const moi = { id: 'moi', realm: 0, joinedAt: now - 60000 };
  const st = new StageDirector(16);
  st.update(old, [], 1000);
  const order = st.update([...old, moi], [], 2000).map(p => p.id);
  assert.equal(order.length, 10);
  assert.ok(old.every(p => order.includes(p.id)));
  // 10 người → 6 cột → hàng trên cùng là vị trí 0..5, giữa là 2 hoặc 3.
  assert.ok([2, 3].includes(order.indexOf('moi')), 'vị trí ' + order.indexOf('moi'));
  // NPC luôn ở ghế cuối, người mới không bị đổi xuống chung với NPC.
  const st2 = new StageDirector(16), npc = { id: 'resident:ty', resident: true, realm: 3, joinedAt: 1 };
  st2.update([...old, npc], [], 1000);
  const o2 = st2.update([...old, npc, moi], [], 2000).map(p => p.id);
  assert.equal(o2.at(-1), 'resident:ty');assert.ok(o2.indexOf('moi') < 6, 'vị trí ' + o2.indexOf('moi'));
});

test('nhân vật thường trú và tu sĩ giả luôn xếp dưới chót, sau tất cả người thật', async () => {
  const { StageDirector } = await import('../public/stage.js');
  const now = Date.now();
  const real = Array.from({ length: 4 }, (_, i) => ({ id: 'that' + i, realm: 3, joinedAt: now - 86400000 }));
  const puppet = { id: 'gia', realm: 9, puppet: true, joinedAt: now - 86400000 };
  const residents = [{ id: 'resident:tyteo', resident: true, realm: 0 }, { id: 'resident:hai', resident: true, realm: 0 }];
  const st = new StageDirector(16);
  const order = st.update([...real, puppet], residents, 1000).map(p => p.id);
  const fakeIdx = ['gia', 'resident:tyteo', 'resident:hai'].filter(id => order.includes(id)).map(id => order.indexOf(id));
  const realIdx = real.map(p => order.indexOf(p.id));
  assert.ok(Math.min(...fakeIdx) > Math.max(...realIdx), JSON.stringify(order));
});
