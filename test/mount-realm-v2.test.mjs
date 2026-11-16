import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,action,tick,startMountRealmEvent,stopMountRealmEvent} from '../engine.mjs';
import {REGISTER_MS} from '../mount-realm.mjs';
import {REALM_MAPS,realmLayout,giftTier,BURN_MS} from '../public/mount-realm-layout.js';

const NOW=Date.parse('2026-11-17T21:00:00+07:00');
function world(){const w=createWorld('live');Object.assign(w.settings,{autoEvents:false,residents:false});w.nextBossAt=NOW+864e5;w.nextSmallAt=NOW+864e5;return w;}
const chat=(w,id,text,at)=>action(w,{type:'chat',userId:id,name:id.toUpperCase(),text},at);

test('3 map khác bố cục, mỗi map 3 làn quái; lượt sau đổi map',()=>{
 assert.equal(REALM_MAPS.length,3);
 assert.equal(new Set(REALM_MAPS.map(m=>m.image)).size,3);
 assert.equal(new Set(REALM_MAPS.map(m=>m.arena.rx+':'+m.arena.ry+':'+m.arena.y)).size,3,'sân mỗi map một hình');
 for(const m of REALM_MAPS){assert.equal(m.waves.length,3);assert.equal(m.portals.length,6);for(const p of m.portals){assert.ok(p.x>=0&&p.x<=900&&p.y>0&&p.y<1600);}}
 assert.ok(REALM_MAPS.flatMap(m=>m.waves).filter(w=>w.art).length>=3,'có quái mới');
 const w=world();for(const id of ['a','b'])chat(w,id,'chao',NOW);
 const seen=[];let t=NOW;
 for(let i=0;i<4;i++){assert.equal(startMountRealmEvent(w,t).ok,true);seen.push(w.mountRealm.map);assert.ok(realmLayout(w.mountRealm));stopMountRealmEvent(w,t+1000);t+=60000;}
 for(let i=1;i<seen.length;i++)assert.notEqual(seen[i],seen[i-1],'không lặp map liền nhau');
});

test('quà ≥199 → HỎA THIÊU BÍ CẢNH: lửa phủ sàn 6 s đốt mọi yêu thú, công tính cho người tặng',()=>{
 assert.equal(giftTier(199).id,'inferno');assert.equal(giftTier(198).id,'ultimate');assert.ok(giftTier(300).burn);
 const w=world();for(const id of ['a','b','c'])chat(w,id,'chao',NOW);
 startMountRealmEvent(w,NOW);for(const id of ['a','b','c'])chat(w,id,'bicanh',NOW+1000);
 let t=NOW+REGISTER_MS+10;tick(w,t);assert.equal(w.mountRealm.phase,'running');
 for(let i=0;i<6;i++){t+=1000;tick(w,t);}
 const e=w.mountRealm,alive=()=>e.mobs.filter(m=>m.hp>0).length;assert.ok(alive()>0,'có yêu thú');
 const before=e.members.a.dmg;
 action(w,{type:'gift',userId:'a',name:'A',coins:199,count:1,giftName:'X',eventId:'burn1'},t+10);
 assert.ok(e.burn&&e.burn.until===t+10+BURN_MS);
 const spawnedBefore=e.spawned;for(let i=0;i<4;i++){t+=1000;tick(w,t);}
 assert.ok(e.members.a.dmg>before+50,'người tặng được tính sát thương');
 assert.ok(e.kills>0,'lửa thiêu chết yêu thú');
 t+=BURN_MS;tick(w,t);const dmg=e.members.a.dmg;t+=1000;tick(w,t);
 assert.ok(!e.burn||t>=e.burn.until,'hết lửa sau 6 s');
});
