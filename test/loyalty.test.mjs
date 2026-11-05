import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,awardLoyalty,action,markLiveSession} from '../engine.mjs';
const min=60000,start=1000000;
test('returning after hours grants one small milestone per check, no stones and no premium skins',()=>{
 const w=createWorld('live'),p=ensurePlayer(w,'a','A',start);
 p.lastActive=start+90*min;p.activeMs=90*min;
 const result=awardLoyalty(w,p.lastActive);
 assert.equal(result.length,1);assert.deepEqual(result[0].items,['spirit-vase']);
 assert.equal(p.qi,60);assert.equal(p.stones,30);assert.equal(p.herbs,6);
 assert.equal(p.equipped,'spirit-vase');assert.equal(p.loyaltyRewards.length,1);
 assert.deepEqual(p.rewardSkins,[]);assert.equal(p.skinChoice,undefined);
 // Không đủ để nhảy cảnh giới ngay (Luyện Khí cần 120 tu vi + 20 linh thạch từ tài nguyên khác).
 assert.ok(p.qi<120);
 const restored=JSON.parse(JSON.stringify(w));
 assert.deepEqual(awardLoyalty(restored,p.lastActive+1000),[]);
 const next=awardLoyalty(restored,p.lastActive+5001);assert.deepEqual(next[0].items,['soul-bell']);
 assert.deepEqual(awardLoyalty(restored,p.lastActive+10002)[0].items,['cosmic-cauldron']);
 assert.equal(restored.players.a.loyaltyRewards.length,3);assert.equal(restored.players.a.stones,30);
});
test('existing relic holders are not re-credited and keep previously granted skins',()=>{
 const w=createWorld('live'),p=ensurePlayer(w,'a','A',start),now=start+90*min;
 p.lastActive=now;p.artifacts=['spirit-vase','soul-bell','cosmic-cauldron'];
 p.loyaltyRewards=p.artifacts.map(item=>({item,at:now-10000}));p.equipped='cosmic-cauldron';
 p.rewardSkins=['crimson-phoenix'];p.skinChoice='crimson-phoenix';
 const before=[p.qi,p.stones,p.herbs];
 assert.deepEqual(awardLoyalty(w,now),[]);
 assert.deepEqual([p.qi,p.stones,p.herbs],before);assert.deepEqual(p.rewardSkins,['crimson-phoenix']);
});
test('inactive, resident, previous-session and not-yet-due profiles get no rewards',()=>{
 const w=createWorld('live'),now=start+100*min;
 const absent=ensurePlayer(w,'absent','Absent',start);
 const resident=ensurePlayer(w,'npc','NPC',start);resident.resident=true;resident.lastActive=now;
 const recent=ensurePlayer(w,'new','New',now-29*min);recent.lastActive=now;
 const old=ensurePlayer(w,'old','Old',start);old.lastActive=now-1000;
 markLiveSession(w,true,now);markLiveSession(w,false,now+1);markLiveSession(w,true,now+2);
 recent.lastActive=now+3;resident.lastActive=now+3;
 assert.deepEqual(awardLoyalty(w,now+4),[]);
 assert.deepEqual(absent.artifacts,[]);assert.deepEqual(old.artifacts,[]);assert.deepEqual(recent.artifacts,[]);
});
test('30 and 60 minute rewards progress independently; free crafting is blocked',()=>{
 const w=createWorld(),p=ensurePlayer(w,'a','A',start);
 p.lastActive=start+30*min;p.activeMs=30*min;assert.equal(awardLoyalty(w,p.lastActive)[0].items[0],'spirit-vase');
 const qi=p.qi;p.lastActive=start+60*min;p.activeMs=60*min;
 assert.deepEqual(awardLoyalty(w,p.lastActive)[0].items,['soul-bell']);
 assert.equal(p.qi-qi,144);assert.equal(p.artifacts.length,2);
 assert.equal(action(w,{type:'craft',userId:'a',itemId:'cosmic-cauldron'},p.lastActive+1).ok,false);
 assert.equal(action(w,{type:'chat',userId:'a',text:'trangbi Tu Linh Binh'},p.lastActive+2).ok,true);
 assert.equal(p.equipped,'spirit-vase');
});
test('large batches are bounded and do not duplicate at later ticks',()=>{
 const w=createWorld(),now=start+31*min;
 for(let i=0;i<8;i++){const q=ensurePlayer(w,String(i),String(i),start);q.lastActive=now;q.activeMs=31*min;}
 assert.equal(awardLoyalty(w,now).length,3);assert.equal(awardLoyalty(w,now+1000).length,0);
 assert.equal(awardLoyalty(w,now+5000).length,3);assert.equal(awardLoyalty(w,now+10000).length,2);
});
test('a profile created hours ago but only active a few minutes gets nothing; tick accumulates real activity',async()=>{
 const {tick}=await import('../engine.mjs');
 const w=createWorld('live'),p=ensurePlayer(w,'r','R',start);let now=start+5*60*min;p.lastActive=now;
 assert.deepEqual(awardLoyalty(w,now),[],'old join time alone is not enough');
 w.nextBossAt=now+1e12;w.settings.blessingMinutes=0;
 for(let i=0;i<31*60;i++){now+=1000;p.lastActive=now;tick(w,now);}
 assert.ok(p.activeMs>=30*min);assert.ok(p.artifacts.includes('spirit-vase'));assert.ok(!p.artifacts.includes('soul-bell'));
});
