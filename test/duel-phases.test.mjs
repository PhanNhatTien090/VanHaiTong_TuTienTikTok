import test from 'node:test';import assert from 'node:assert/strict';
import {DUEL_PHASES,duelCastState,duelPhase} from '../public/duel-combat.js';
import {duelVisualState} from '../public/duel-feedback-v3.js';
import {DUEL_MS} from '../social-events.mjs';
const casts=(lead=0)=>{const seen=new Map();for(let t=0;t<DUEL_MS;t+=25){const c=duelCastState(t,lead);if(c.ready&&!seen.has(c.turn))seen.set(c.turn,{...c,t});}return [...seen.values()];};

test('V4 tỷ thí: đủ 7 pha theo thứ tự, phủ kín 25 s, kết thúc trước khi server chốt ván',()=>{
 assert.deepEqual(DUEL_PHASES.map(p=>p.id),['open','probe','charge','attack','guard','ultimate','finish']);
 for(let i=1;i<DUEL_PHASES.length;i++)assert.equal(DUEL_PHASES[i].from,DUEL_PHASES[i-1].to);
 assert.ok(DUEL_PHASES.find(p=>p.id==='ultimate').to<=DUEL_MS-1500,'tuyệt kỹ xong trước khi chốt ván');
 assert.equal(duelPhase(DUEL_MS-1).id,'finish');
});

test('V4 tỷ thí: mở trận và tụ khí không ra chiêu; chiêu không bị cắt ngang cuối pha',()=>{
 for(const t of [0,800,1400,6400,8000,8800,23400,24900])assert.equal(duelCastState(t).ready,false,'t='+t);
 for(const c of casts()){const p=DUEL_PHASES.find(x=>x.id===c.phase);const start=p.from+(c.turn%100)*p.period;assert.ok(start+p.period<=p.to+1,c.phase+' turn '+c.turn);}
});

test('V4 tỷ thí: thăm dò nhẹ, công kích đổi bên, phòng thủ + tuyệt kỹ do bên dẫn linh áp thật',()=>{
 const list=casts(12),by=id=>list.filter(c=>c.phase===id);
 assert.equal(by('probe').length,3);assert.ok(by('probe').every(c=>c.light&&!c.ultimate));
 assert.equal(by('attack').length,7);assert.deepEqual(by('attack').map(c=>c.side),[0,1,0,1,0,1,0]);
 assert.ok(by('guard').length>=2&&by('guard').every(c=>c.side===0&&c.guard));
 assert.equal(by('ultimate').length,1);assert.equal(by('ultimate')[0].side,0);
 assert.equal(casts(-12).find(c=>c.ultimate).side,1,'bên phải dẫn thì bên phải tung tuyệt kỹ');
 assert.equal(list.filter(c=>c.ultimate).length,1,'mỗi ván đúng 1 tuyệt kỹ');
});

test('V4 tỷ thí: thanh tụ khí đầy dần trong pha Tụ Khí, không có thanh máu giả',()=>{
 const T=1e12,m={startedAt:T,aura:{a:40},boosts:{a:1},lastBoost:{}};
 const a=duelVisualState(m,'a',T+6400),b=duelVisualState(m,'a',T+8800);
 assert.equal(a.phase,'charge');assert.ok(b.charge>a.charge&&b.charge<=1);
 assert.equal(duelVisualState(m,'a',T+500).charge,0);assert.equal('hp' in a,false);
});

test('V4 tỷ thí: góc hướng dẫn nhắc đấu thủ gõ kiem khi đang có ván trên đài',async()=>{
 const {simpleSteps}=await import('../public/simple-guide.js');
 const s={players:[],realms:Array(19),serverNow:1e12};
 assert.match(simpleSteps({...s,socialStatus:{tournament:{phase:'running',current:{a:'x',b:'y'}}}}).hint,/gõ kiem/);
 assert.match(simpleSteps({...s,socialStatus:{tournament:{phase:'registration'}}}).hint,/gõ tỷ thí/);
});

test('V4 hộ kiếp: kết giới đỡ đúng mốc nổ của cảnh giới, tên hộ pháp từ server, không có hộ pháp thì không vẽ',async()=>{
 const {guardianTribulationState,guardName,GUARD_MIN_REALM}=await import('../public/guardian-tribulation-v3.js');
 const {ascensionImpactRatio}=await import('../public/audio.js');
 for(const realm of [6,8,12,22]){const e={toRealm:realm,guardHelpers:['a','b']},at=ascensionImpactRatio(realm);
  const before=guardianTribulationState(e,at-.02),hit=guardianTribulationState(e,at+.005),after=guardianTribulationState(e,Math.min(1,at+.3));
  assert.ok(before.shield>.8,'realm '+realm+': kết giới dựng trước mốc nổ');assert.ok(hit.hit>.8,'realm '+realm+': đỡ đúng mốc nổ');assert.equal(after.energy,0,'realm '+realm+': tan sau đó');}
 assert.equal(guardianTribulationState({toRealm:GUARD_MIN_REALM,guardHelpers:[]},.7).active,false);
 assert.equal(guardName({playerIndex:new Map()},{guardHelpers:['x'],guardNames:['Lâm Phong']},0),'Lâm Phong');
 assert.equal(guardName({playerIndex:new Map([['x',{name:'Bạch Y'}]])},{guardHelpers:['x']},0),'Bạch Y');
});
