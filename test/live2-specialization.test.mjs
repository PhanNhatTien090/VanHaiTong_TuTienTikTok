import {test} from 'node:test';
import assert from 'node:assert/strict';
import {live2CombatBonus,live2Command} from '../live2-systems.mjs';
test('Dao specializations differ without replacing legacy combat power',()=>{
 const p={id:'a',realm:3,artifacts:[],equipped:null,live2:{path:'sword',insight:140,skillUntil:100000}};
 const swordBoss=live2CombatBonus(p,1000,'boss');
 p.live2.path='body';
 const bodyBoss=live2CombatBonus(p,1000,'boss'),bodyTower=live2CombatBonus(p,1000,'tower');
 assert.notEqual(swordBoss,bodyBoss);assert.ok(bodyTower>bodyBoss);
 p.live2.path='beast';p.spiritPet='fox';
 assert.ok(live2CombatBonus(p,1000,'boss')>bodyBoss);
});
test('special Dao skill requires an unlocked skill tier',()=>{
 const p={id:'a',name:'A',realm:3,artifacts:[],equipped:null,live2:{path:'sword',insight:0,cooldowns:{}}};
 const w={mode:'live',settings:{live2Enabled:true},players:{a:p},boss:{hp:100,endsAt:50000}};
 const e=[],ctx={emit:(_w,_p,m)=>e.push(m)};
 assert.equal(live2Command(w,p,['dao','ky'],1000,ctx).ok,false);
 p.live2.insight=15;
 assert.equal(live2Command(w,p,['dao','ky'],1000,ctx).ok,true);
 assert.equal(e.length,1);
});
