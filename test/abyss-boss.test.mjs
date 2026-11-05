import test from 'node:test';import assert from 'node:assert/strict';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {createWorld,ensurePlayer,openBoss,action,tick,residentStrike,snapshot} from '../engine.mjs';
import {ABYSS_BOSS,ABYSS_SECT_REWARD,abyssPhase,drawAbyssBoss,drawAbyssRetaliation,drawAbyssHealth} from '../public/abyss-boss.js';
const N=1800000000000;
const world=()=>{const w=createWorld('live');Object.assign(w.settings,{residents:false,autoEvents:false,goldenHour:false,ascensionShowcase:false});w.nextBossAt=N+1e9;return w;};
test('Ma Long has exactly ten times ordinary HP for the same population and a five-minute encounter',()=>{
 for(const count of [0,1,12,45]){
  const a=world(),b=world();for(let i=0;i<count;i++){ensurePlayer(a,'p'+i,'P',N);ensurePlayer(b,'p'+i,'P',N);}
  assert.equal(openBoss(a,N,'thunder-tiger').ok,true);assert.equal(openBoss(b,N,'abyss-dragon').ok,true);
  assert.equal(b.boss.maxHp,a.boss.maxHp*10);assert.equal(b.boss.hp,b.boss.maxHp);assert.equal(b.boss.endsAt-N,300000);assert.equal(snapshot(b,N).boss.encounter.id,'charge');
 }
});
test('kill pays all real members, including offline non-fighters, exactly once; NPCs and web-only profiles do not receive guild loot',()=>{
 const w=world(),a=ensurePlayer(w,'a','A',N),offline=ensurePlayer(w,'offline','B',N-1e9),npc=ensurePlayer(w,'npc','NPC',N),puppet=ensurePlayer(w,'fake','Fake',N),web=ensurePlayer(w,'web','Web',N);
 npc.resident=true;puppet.puppet=true;web.webOnly=true;for(const p of [a,offline,npc,puppet,web]){p.manuals=[];p.equipped=null;}
 const before=new Map(Object.values(w.players).map(p=>[p.id,{qi:p.qi,stones:p.stones,herbs:p.herbs}]));
 openBoss(w,N,'abyss-dragon');w.boss.hp=1;action(w,{type:'attack',userId:'a',name:'A'},N+1000);
 assert.equal(w.boss,null);assert.equal(w.lastBossResult.sectReward.members,2);
 assert.equal(offline.stones-before.get('offline').stones,ABYSS_SECT_REWARD.stones);assert.equal(offline.qi-before.get('offline').qi,500);assert.equal(offline.herbs-before.get('offline').herbs,15);
 for(const p of [npc,puppet,web])assert.equal(p.stones,before.get(p.id).stones);
 const restored=JSON.parse(JSON.stringify(w)),stones=restored.players.offline.stones;
 assert.equal(action(restored,{type:'attack',userId:'a'},N+5000).ok,false);assert.equal(restored.players.offline.stones,stones);
 assert.equal(w.events.filter(e=>e.sectBossReward).length,1);
});
test('timeout gives no guild loot; an NPC finishing a real fight still pays the guild',()=>{
 const w=world(),a=ensurePlayer(w,'a','A',N);openBoss(w,N,'abyss-dragon');const stones=a.stones;tick(w,N+300001);assert.equal(w.boss,null);assert.equal(a.stones,stones);assert.equal(w.events.some(e=>e.sectBossReward),false);
 const b=world(),p=ensurePlayer(b,'p','P',N);openBoss(b,N,'abyss-dragon');action(b,{type:'attack',userId:'p'},N+1000);b.boss.hp=1;b.settings.residents=true;residentStrike(b,N+6000,()=>0);assert.equal(b.boss,null);assert.equal(b.lastBossResult.sectReward.members,1);assert.ok(p.stones>=200);
});
test('windup, strike, opening and rage share the server clock, render real alpha artwork, and keep HP readable',async()=>{
 const art=await loadImage('public/assets/abyss-dragon-v1/abyss-dragon.png'),c=createCanvas(540,960).getContext('2d'),b={...ABYSS_BOSS,startedAt:N,endsAt:N+300000,hp:100,maxHp:100};
 assert.equal(abyssPhase(b,N+1000).id,'charge');assert.equal(abyssPhase(b,N+4500).id,'strike');assert.equal(abyssPhase(b,N+6500).id,'exposed');b.hp=25;assert.equal(abyssPhase(b,N+3000).enraged,true);assert.equal(abyssPhase(b,N+3000).period,9000);
 const pixels=createCanvas(art.width,art.height),q=pixels.getContext('2d');q.drawImage(art,0,0);assert.equal(q.getImageData(0,0,1,1).data[3],0);
 for(const ms of [1000,3500,4500,6500,8500]){c.setTransform(.6,0,0,.6,0,0);assert.equal(drawAbyssBoss(c,b,N+ms,450,512,art),true);for(const layer of ['back','front'])drawAbyssRetaliation({motion:true,targets:[{x:450,y:1000}],budget:{level:'light'}},c,b,N+ms,1600,layer);drawAbyssHealth(c,b,N+ms,1600);assert.equal(c.globalAlpha,1);assert.equal(c.globalCompositeOperation,'source-over');}
});
