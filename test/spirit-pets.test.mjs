import {test} from 'node:test';import assert from 'node:assert/strict';
import {createWorld,action,controlPetEvent,tick,snapshot} from '../engine.mjs';
import {SPIRIT_PETS,ALL_PETS,PREMIUM_PETS,petPose} from '../public/spirit-pets.js';
import {announcement} from '../speech.mjs';
const N=1800000000000;
function world(){const w=Object.assign(createWorld('live'),{settings:{bossInterval:240,engagementRewards:true}});Object.assign(w.settings,{autoEvents:false,blessingMinutes:0,ceremony:false,rarePets:false});w.nextBossAt=N+1e9;return w;}
const like=(w,n,t=N+1)=>action(w,{type:'like',userId:'a',name:'An',count:n},t);
const gift=(w,n,id='g',t=N+2)=>action(w,{type:'gift',userId:'a',name:'An',coins:n,eventId:id},t);
test('event hearts accumulate through XP cooldown, unlock once and survive reload',()=>{
 let w=world();controlPetEvent(w,'start',N);like(w,99);assert.equal(w.players.a.spiritPet,undefined);like(w,1,N+2);assert.equal(w.players.a.spiritPet,'jade-rabbit');
 w=JSON.parse(JSON.stringify(w));like(w,300,N+3);assert.equal(w.players.a.spiritPet,'ember-fox');assert.equal(w.events.filter(e=>e.petAward).length,2);like(w,1,N+4);assert.equal(w.events.filter(e=>e.petAward).length,2);
 like(w,5000,N+5);like(w,2599,N+6);assert.equal(w.players.a.spiritPet,'sun-phoenix');assert.equal(w.players.a.spiritPets.length,4);assert.equal(w.players.a.spiritPets.includes('astral-dragon'),false);
 assert.match(announcement(w.events.find(e=>e.petAward)),/Ngọc Thố/);
});
test('gifts count once, do not manufacture free rabbit and equip strongest new pet',()=>{
 const w=world();controlPetEvent(w,'start',N);gift(w,29);assert.equal(w.players.a.spiritPet,undefined);gift(w,1,'g2');assert.equal(w.players.a.spiritPet,undefined);gift(w,70,'g3');assert.equal(w.players.a.spiritPet,'sun-phoenix');
 gift(w,1000,'huge');assert.equal(w.players.a.spiritPet,w.petEvent.premium||'astral-dragon');const coins=w.players.a.petProgress.coins;assert.equal(gift(w,1000,'huge').duplicate,true);assert.equal(w.players.a.petProgress.coins,coins);assert.equal(w.players.a.spiritPets.includes('jade-rabbit'),false);
});
test('expired/reopened event resets progress, preserves ownership and never backfills old gifts',()=>{
 const w=world();gift(w,1000);controlPetEvent(w,'start',N+10,1);like(w,100,N+11);like(w,500,N+60010);assert.equal(w.players.a.petProgress.hearts,100);
 tick(w,N+60011);tick(w,N+60012);assert.equal(w.events.filter(e=>e.petEnd).length,1);assert.equal(snapshot(w,N+60012).petEvent.active,false);
 controlPetEvent(w,'start',N+70000);like(w,1,N+70001);assert.equal(w.players.a.petProgress.hearts,1);assert.equal(w.players.a.petProgress.coins,0);assert.deepEqual(w.players.a.spiritPets,['jade-rabbit']);
});
test('NPCs, puppets, simulated gifts and invalid input do not earn pets',()=>{
 const w=world();controlPetEvent(w,'start',N);action(w,{type:'join',userId:'a'},N+1);w.players.a.puppet=true;like(w,5000);assert.equal(w.players.a.petProgress,undefined);w.players.a.puppet=false;
 action(w,{type:'gift',userId:'a',coins:1000,eventId:'sim',simulated:true},N+2);assert.equal(w.players.a.petProgress,undefined);assert.equal(like(w,-1).ok,false);assert.equal(w.players.a.petProgress,undefined);
});
test('manual selection respects ownership and persists; unknown IDs cannot equip',()=>{
 let w=world();controlPetEvent(w,'start',N);like(w,400);const chat=(text,t)=>action(w,{type:'chat',userId:'a',text},t);
 assert.equal(chat('thu 5',N+10000).ok,false);assert.equal(w.players.a.spiritPet,'ember-fox');assert.equal(chat('thu 1',N+20000).ok,true);w=JSON.parse(JSON.stringify(w));assert.equal(w.players.a.spiritPet,'jade-rabbit');chat('thu an',N+30000);assert.equal(w.players.a.spiritPet,null);
 assert.notDeepEqual(petPose(1000),petPose(2000));assert.deepEqual(petPose(1000,0,false),petPose(9000,0,false));assert.equal(SPIRIT_PETS.length,5);
});
test('each pet cove draws a 200-coin pet and a separate 300-coin pet',()=>{
 const w=world();w.settings.rarePets=true;controlPetEvent(w,'start',N);const rare=w.petEvent.featured;assert.equal(ALL_PETS.find(p=>p.id===rare).coins,200);assert.ok(PREMIUM_PETS.some(p=>p.id===w.petEvent.premium));const slot=String(ALL_PETS.findIndex(p=>p.id===rare)+1);
 assert.ok(snapshot(w,N+1).petEvent.rules.some(p=>p.id===rare));
 gift(w,199);assert.equal(w.players.a.spiritPets.includes(rare),false);gift(w,1,'g2');
 assert.equal(w.players.a.spiritPet,rare);assert.equal(w.players.a.spiritPets.filter(id=>ALL_PETS.find(p=>p.id===id).coins===200).length,1);
 gift(w,100,'g3');assert.equal(w.players.a.spiritPet,w.petEvent.premium);
 assert.equal(action(w,{type:'chat',userId:'a',text:'thu '+slot},N+20000).ok,true);assert.equal(w.players.a.spiritPet,rare);
});
test('rare beasts can be switched off and never appear outside their own event',()=>{
 const w=world();controlPetEvent(w,'start',N);assert.equal(w.petEvent.featured,'astral-dragon');gift(w,1000);assert.equal(w.players.a.spiritPets.includes('loi-oa'),false);
});
test('quản lý gỡ linh thú: removePets gỡ đúng con, linh thú đang dẫn chuyển sang con còn lại',async()=>{
 const {createWorld,ensurePlayer,adminEditPlayer}=await import('../engine.mjs');const w=createWorld('live');const p=ensurePlayer(w,'u1','A',1e12);
 p.spiritPets=['jade-rabbit','loi-oa','van-thu','ky-lan'];p.spiritPet='van-thu';const r=adminEditPlayer(w,'u1',{removePets:['loi-oa','van-thu']},1e12);
 assert.equal(r.ok,true);assert.deepEqual(p.spiritPets,['jade-rabbit','ky-lan']);assert.equal(p.spiritPet,'ky-lan');
});
test('quản lý chọn linh thú: spiritPet cấp quyền nếu chưa có, null cất linh thú, id sai bị từ chối',async()=>{
 const {createWorld,ensurePlayer,adminEditPlayer}=await import('../engine.mjs');const w=createWorld('live');const p=ensurePlayer(w,'u1','A',1e12);
 p.spiritPets=['jade-rabbit'];p.spiritPet='jade-rabbit';
 let r=adminEditPlayer(w,'u1',{spiritPet:'ky-lan'},1e12);assert.equal(r.ok,true);assert.deepEqual(p.spiritPets,['jade-rabbit','ky-lan']);assert.equal(p.spiritPet,'ky-lan');
 r=adminEditPlayer(w,'u1',{spiritPet:'jade-rabbit'},1e12);assert.equal(p.spiritPet,'jade-rabbit');assert.equal(p.spiritPets.length,2);
 r=adminEditPlayer(w,'u1',{spiritPet:null},1e12);assert.equal(p.spiritPet,null);assert.equal(p.spiritPets.length,2);
 r=adminEditPlayer(w,'u1',{spiritPet:'khong-co'},1e12);assert.equal(r.ok,false);
});
