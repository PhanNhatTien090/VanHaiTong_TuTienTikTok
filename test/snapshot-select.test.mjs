import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,snapshot} from '../engine.mjs';

// snapshot(w,now,{select}) chỉ dựng hồ sơ cho người được chọn, nhưng danh hiệu/thần vị
// vẫn xếp trên toàn bộ người chơi: phần được chọn phải giống hệt snapshot đầy đủ.
const now=1800000000000;
test('snapshot select keeps chosen profiles, honors and divine roles identical to full snapshot',()=>{
 const w=Object.assign(createWorld('live'),{settings:{bossInterval:240,engagementRewards:true}});
 w.liveSession={active:true,startedAt:0};
 for(let i=0;i<400;i++){const p=ensurePlayer(w,'p'+i,'P'+i,now-5000);Object.assign(p,{realm:i%14,totalQi:i*1000,giftCoins:(i*37)%900,activeMs:i*9000,bossWins:i%5,contribution:i,lastActive:i%3?now-1000:now-3600000,lastRealInteractionAt:now-1000});}
 w.players.p7.webOnly=true;
 const full=snapshot(w,now);
 const chosen=new Set(['p1','p2','p399','p7','p250']);
 let seen=null;
 const part=snapshot(w,now,{select:ctx=>{seen=ctx;return chosen;}});
 assert.equal(seen.players.length,400);
 assert.deepEqual(part.honors,full.honors);
 assert.deepEqual(part.players.map(p=>p.id).sort(),[...chosen].sort());
 for(const p of part.players)assert.deepEqual(p,full.players.find(f=>f.id===p.id));
 assert.equal(seen.players.find(p=>p.id==='p1').active,full.players.find(p=>p.id==='p1').active);
});
