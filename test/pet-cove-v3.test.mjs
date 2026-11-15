import {test} from 'node:test';
import assert from 'node:assert/strict';
import {petCoveRoam,PET_COVE_ROAM,PET_COVE_GUIDE,petCoveGuideStep} from '../public/pet-cove.js';
import {createWorld,ensurePlayer,controlPetEvent} from '../engine.mjs';
import {petV2Configure,petV2Command,petV2CovePhase} from '../pet-v2.mjs';

test('thú chạy luôn trong vùng trời Cốc, không xuống hàng người chơi, và có lúc quay đầu',()=>{
 const H=1600;
 for(let i=0;i<7;i++){let turns=0,last=0;
  for(let t=0;t<120000;t+=250){const p=petCoveRoam(i,t,H);
   assert.ok(p.x>=PET_COVE_ROAM.x0-1e-6&&p.x<=PET_COVE_ROAM.x1+1e-6);
   assert.ok(p.y>=H*PET_COVE_ROAM.y0-1e-6&&p.y<=H*PET_COVE_ROAM.y1+1e-6&&p.y<H*.6);
   const dir=Math.sign(p.vx);if(dir&&last&&dir!==last)turns++;if(dir)last=dir;}
  assert.ok(turns>=2,'thú '+i+' phải chạy qua lại');}
 const still=petCoveRoam(2,99999,H,false);assert.equal(still.vx,0);assert.deepEqual(petCoveRoam(2,0,H,false),still);
});

test('bảng lệnh sáng lần lượt đủ lệnh Linh Thú 2.0, không mồi thả tim',()=>{
 const cmds=PET_COVE_GUIDE.map(g=>g[0].split(' ')[1]);
 for(const c of ['duyên','nuôi','luyện','hành','hóa','xuất','kỹ'])assert.ok(cmds.includes(c),c);
 for(const g of PET_COVE_GUIDE)assert.doesNotMatch(g.join(' '),/tim|follow|chia sẻ|share/i);
 const seen=new Set();for(let t=0;t<2500*PET_COVE_GUIDE.length;t+=2500)seen.add(petCoveGuideStep(t).index);
 assert.equal(seen.size,PET_COVE_GUIDE.length);
});

test('màn Cốc nhận tiến độ hợp lực thú duyên từ server',()=>{
 const N=Date.UTC(2026,10,15,9),w=createWorld('demo');Object.assign(w.settings,{residents:false,autoEvents:false});
 petV2Configure(w,{enabled:true,coveV2:true});
 for(const id of ['a','b','c','d','e'])ensurePlayer(w,id,id,N).lastActive=N;
 controlPetEvent(w,'start',N,5);
 const before=petV2CovePhase(w,N+60000);assert.equal(before.joined,0);assert.equal(before.goal,2);
 petV2Command(w,w.players.a,'thu','duyen',N+60000,(w2,p,m,e,at,x={})=>w.events.push({message:m,...x}));
 const after=petV2CovePhase(w,N+61000);assert.equal(after.joined,1);assert.equal(after.goal,2);assert.equal(after.rewarded,false);
});
