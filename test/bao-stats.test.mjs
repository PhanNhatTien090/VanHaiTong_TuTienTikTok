// 18/11 tối (chủ game "thêm mấy chỉ số này vào game"): chỉ số thần khí bản mệnh có tác dụng thật.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,action,startArenaEvent} from '../engine.mjs';
import {tickArena} from '../arena.mjs';
import {baoBonus,baoBanMenh,BAO_STAT_CAP} from '../public/phap-bao-data.js';

const N=Date.UTC(2026,10,18,12);
const c={emit:(w,p,m,e,at,x={})=>{w.events.push({message:m,effect:e,at,...x});},active:()=>true,technique:()=>({id:'stars',name:'Tinh Hà Luân Chuyển'})};
function setup(itemsA,itemsB,t0=N){
 const w=createWorld('demo');Object.assign(w.settings,{residents:false,autoEvents:false,scheduledCompetitions:false,heartPlay:false});w.nextBossAt=t0+1e10;
 for(const [id,q] of [['a',1e7],['b',1e7]]){const p=ensurePlayer(w,id,id.toUpperCase(),t0);Object.assign(p,{totalQi:q,realm:8,qi:0,lastActive:t0});}
 if(itemsA)w.players.a.bao={p4:0,p5:0,items:itemsA,lim:null};
 if(itemsB)w.players.b.bao={p4:0,p5:0,items:itemsB,lim:null};
 assert.equal(startArenaEvent(w,t0).ok,true);
 for(const id of ['a','b'])action(w,{type:'chat',userId:id,name:id.toUpperCase(),text:'lên đài'},t0+10);
 return w;
}
function run(w,t0=N){let t=t0+20,log=[],m;for(let i=0;i<1200;i++){t+=250;tickArena(w,t,c);if(w.arena.current){m=w.arena.current;for(const e of m.log)if(!log.some(x=>x.n===e.n))log.push(e);}else if(m)break;}return {log,m};}

test('baoBonus: chỉ số theo sao (★5 = ×1,8), không có thần khí = 0',()=>{
 const b1=baoBonus(baoBanMenh({bao:{items:{'L01-tru-tien':1}}}));
 assert.deepEqual(b1,{atk:.16,crit:.12,critDmg:.3,res:0,qi:0});
 const b5=baoBonus(baoBanMenh({bao:{items:{'L01-tru-tien':5}}}));
 assert.ok(Math.abs(b5.atk-.288)<1e-9&&Math.abs(b5.critDmg-.54)<1e-9);
 assert.deepEqual(baoBonus(null),{atk:0,crit:0,critDmg:0,res:0,qi:0});
 assert.deepEqual(baoBonus(baoBanMenh({})),{atk:0,crit:0,critDmg:0,res:0,qi:0});
});

test('Lôi Đài: Công làm đòn thường mạnh hơn đúng tỷ lệ; thần thông bản mệnh không cộng thêm',()=>{
 const first=on=>{const w=setup({'L12-huyet-hai-dao':1},null);let t=N+20,hit=null,proc=null,zeroed=false;
  for(let i=0;i<1200&&!(hit&&proc);i++){t+=250;tickArena(w,t,c);const m=w.arena.current;if(!m)continue;
   if(!zeroed){zeroed=true;assert.ok(Math.abs(m.fighters.a.bs.atk-.18)<1e-9);if(!on)m.fighters.a.bs={atk:0,crit:0,critDmg:0,res:0,qi:0};}
   for(const e of m.log){if(e.by!=='a'||!(e.dmg>0))continue;if(e.bao&&!proc)proc=e;if(!e.bao&&!e.crit&&!hit&&!e.resisted)hit=e;}}
  return {hit,proc};};
 const off=first(false),on=first(true);
 assert.ok(off.hit&&on.hit,'có đòn thường');
 const r=on.hit.dmg/off.hit.dmg;assert.ok(r>1.15&&r<1.21,'Công +18% → ×'+r.toFixed(3));
 assert.equal(on.proc.dmg,off.proc.dmg,'thần thông không nhân Công/ST bạo kích');
});

test('Lôi Đài: Kháng bạo giảm sát thương chí mạng nhận vào, có trần',()=>{
 assert.ok(BAO_STAT_CAP.res<=.4&&BAO_STAT_CAP.crit<=.5);
 const w=setup(null,{'L02-hon-don-chung':5});const {m}=run(w);
 assert.ok(Math.abs(m.fighters.b.bs.res-.324)<1e-9,'Hỗn Độn Chung ★5: Kháng bạo 32,4%');
});

test('Tu vi: +% khi chơi tay (tu luyện), không có thần khí thì như cũ',()=>{
 const gainOf=items=>{const w=createWorld('demo');Object.assign(w.settings,{residents:false,autoEvents:false,heartPlay:false});w.nextBossAt=N+1e10;
  const p=ensurePlayer(w,'x','X',N);Object.assign(p,{realm:3,qi:0,totalQi:0,lastActive:N});if(items)p.bao={p4:0,p5:0,items,lim:null};
  const before=p.totalQi;action(w,{type:'chat',userId:'x',name:'X',text:'tu luyện'},N+1000);return p.totalQi-before;};
 const plain=gainOf(null),withQi=gainOf({'L10-hong-mong-binh':5}); // Tu vi 6% ★5 → +10,8%
 assert.ok(plain>0,'tu luyện có cộng');
 assert.ok(withQi>plain&&withQi<=Math.ceil(plain*1.12)+1,`${withQi} vs ${plain}`);
});
