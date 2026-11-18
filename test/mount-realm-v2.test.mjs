import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,action,tick,snapshot,startMountRealmEvent,stopMountRealmEvent} from '../engine.mjs';
import {REGISTER_MS,REALM_CUT} from '../mount-realm.mjs';
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
 const cutMs=REALM_CUT.ms.inferno;assert.ok(e.cuts?.length===1&&e.cuts[0].tier==='inferno','quà 199 có màn chiếu riêng');
 assert.ok(e.burn&&e.burn.at===t+10+cutMs&&e.burn.until===t+10+cutMs+BURN_MS,'18/11: lửa cháy sau màn chiếu');
 t+=cutMs;
 const spawnedBefore=e.spawned;for(let i=0;i<4;i++){t+=1000;tick(w,t);}
 assert.ok(e.members.a.dmg>before+50,'người tặng được tính sát thương');
 assert.ok(e.kills>0,'lửa thiêu chết yêu thú');
 t+=BURN_MS;tick(w,t);const dmg=e.members.a.dmg;t+=1000;tick(w,t);
 assert.ok(!e.burn||t>=e.burn.until,'hết lửa sau 6 s');
});

test('18/11: thẻ Linh Châu — quà vừa đủ mốc hiện thẻ ngay, nhận châu có thẻ, người giữ châu được nhắc khi có mặt (20 phút/lần)',async()=>{
 const {ORB_REMIND_MS}=await import('../mounts.mjs');
 const w=world();for(const id of ['a','b'])chat(w,id,'chao',NOW);
 assert.equal(startMountRealmEvent(w,NOW).ok,true);for(const id of ['a','b'])chat(w,id,'bicanh',NOW+1000);const t=NOW+REGISTER_MS+1000;tick(w,t);assert.equal(w.mountRealm.phase,'running');
 const cards=()=>w.events.filter(e=>e.orbCard);
 action(w,{type:'gift',userId:'a',name:'A',coins:200,count:1,eventId:'g1'},t+10);
 assert.equal(cards().length,0,'chưa đủ 300');
 action(w,{type:'gift',userId:'a',name:'A',coins:150,count:1,eventId:'g2'},t+20);
 let c=cards().at(-1);assert.equal(c?.orbCard.kind,'vip');assert.equal(c.orbCard.stage,'earned');
 action(w,{type:'gift',userId:'a',name:'A',coins:10,count:1,eventId:'g3'},t+30);
 assert.equal(cards().length,1,'không lặp khi chưa qua mốc mới');
 action(w,{type:'gift',userId:'a',name:'A',coins:700,count:1,eventId:'g4'},t+40);
 c=cards().at(-1);assert.equal(c.orbCard.kind,'divine');assert.equal(c.orbCard.stage,'earned');
 stopMountRealmEvent(w,t+60000);
 const {grantOrbs}=await import('../mounts.mjs');const out=[];grantOrbs(w,w.players.a,'divine',1,t+61000,(w2,p,text,type,at,extra)=>out.push(extra));grantOrbs(w,w.players.a,'common',1,t+61000,(w2,p,text,type,at,extra)=>out.push(extra));
 assert.deepEqual(out[0].orbCard,{kind:'divine',stage:'got',count:1},'nhận châu vàng có thẻ');assert.equal(out[1].orbCard,undefined,'châu xanh không có thẻ');
 // nhắc khi có mặt, 20 phút/lần, ẩn nếu đang truyền công
 const n0=cards().filter(e=>e.orbCard.stage==='remind').length;const t2=t+3*60000;
 chat(w,'a','chao',t2);chat(w,'a','chao',t2+1000);
 assert.equal(cards().filter(e=>e.orbCard.stage==='remind').length,n0+1);
 chat(w,'a','chao',t2+ORB_REMIND_MS+5000);assert.equal(cards().filter(e=>e.orbCard.stage==='remind').length,n0+2);
 w.players.a.mountChannel={kind:'divine',startedAt:t2,endsAt:t2+9e9};chat(w,'a','chao',t2+3*ORB_REMIND_MS);assert.equal(cards().filter(e=>e.orbCard.stage==='remind').length,n0+2,'đang truyền công thì không nhắc');
 chat(w,'b','chao',t2+3*ORB_REMIND_MS);assert.ok(!cards().some(e=>e.user==='b'&&e.orbCard.stage==='remind'),'không giữ châu tím/vàng thì không nhắc');
});

test('18/11: quà ≥99 trong Bí Cảnh → màn chiếu riêng theo mức (99/199/300), cách ≥6 s, hoãn giờ đợt quái; quà nhỏ không chiếu',()=>{
 const w=world();for(const id of ['a','b'])chat(w,id,'chao',NOW);
 startMountRealmEvent(w,NOW);for(const id of ['a','b'])chat(w,id,'bicanh',NOW+1000);
 const t=NOW+REGISTER_MS+10;tick(w,t);const e=w.mountRealm,ends0=e.waveEndsAt;
 action(w,{type:'gift',userId:'a',name:'A',coins:30,count:1,giftName:'X',eventId:'s1'},t+10);assert.equal((e.cuts||[]).length,0);
 action(w,{type:'gift',userId:'a',name:'A',coins:99,count:1,giftName:'X',eventId:'c1'},t+20);
 action(w,{type:'gift',userId:'b',name:'B',coins:300,count:1,giftName:'X',eventId:'c2'},t+30);
 assert.deepEqual(e.cuts.map(x=>x.tier),['ultimate','grand']);
 assert.ok(e.cuts[1].at>=e.cuts[0].at+e.cuts[0].ms+REALM_CUT.gap,'cách nhau ≥6 s');
 assert.equal(e.waveEndsAt,ends0+e.cuts[0].ms+e.cuts[1].ms,'giờ đợt quái hoãn đúng tổng thời gian chiếu (khoảng nghỉ giữa 2 màn sân vẫn chơi)');
 action(w,{type:'gift',userId:'a',name:'A',coins:199,count:1,giftName:'X',eventId:'c3'},t+40);assert.equal(e.cuts.length,2,'hàng chờ quá 10 s thì không chiếu thêm');
 assert.equal(snapshot(w,t+40).mountRealm.cuts.length,2);
});
