// 08/11/2026: ghép giọng làm sẵn cho lời cảm ơn quà (tên + "tặng <quà>! Đa tạ tâm ý!").
import {test} from 'node:test';import assert from 'node:assert/strict';
import {namePlan,giftPlan,THANKS_PLAN,WAR_PUSH_PLANS,nextMissingPart} from '../voice-parts.mjs';
import {VoiceQueue} from '../public/voice.js';
test('name and gift parts read cleanly and address by gender',()=>{
 assert.deepEqual(namePlan({name:'🐠༺Huy༻🐠',gender:'nu'}),[{voice:'tongsu',text:'Sư tỷ Huy'}]);
 assert.equal(namePlan({name:'An',gender:'nam'})[0].text,'Sư huynh An');assert.equal(namePlan({name:'An'})[0].text,'Đạo hữu An');
 assert.equal(giftPlan('Hoa hồng')[0].text,'tặng Hoa hồng! Đa tạ tâm ý!');assert.equal(namePlan({name:'🐠🐠'}),null);
});
test('warm order: generic thanks, then recently active givers, then gifts; skips residents and idle viewers',()=>{
 const now=1e10,w={players:{a:{id:'a',name:'An',lastRealInteractionAt:now-1000},b:{id:'b',name:'Bình',giftCoins:5,lastRealInteractionAt:now-5000},r:{id:'r',name:'NPC',resident:true,lastRealInteractionAt:now},old:{id:'old',name:'Cũ',lastRealInteractionAt:now-3600e3}},events:[{gift:'Kem',coins:1}]};
 const done=new Set(),cached=p=>done.has(JSON.stringify(p)),take=()=>{const p=nextMissingPart(w,cached,now);if(p)done.add(JSON.stringify(p));return p?.[0].text;};
 assert.equal(take(),THANKS_PLAN[0].text);assert.equal(take(),WAR_PUSH_PLANS.chinh[0].text);assert.equal(take(),WAR_PUSH_PLANS.ma[0].text);assert.equal(take(),'Đạo hữu Bình');assert.equal(take(),'Đạo hữu An');assert.equal(take(),'tặng Kem! Đa tạ tâm ý!');
 const rest=[];let t;while((t=take()))rest.push(t);assert.ok(!rest.some(x=>/NPC|Cũ/.test(x)));
});
test('gift thanks plays prebuilt parts at once when the full line is still being synthesised',async()=>{
 const old=globalThis.fetch;const asked=[];globalThis.fetch=async url=>{asked.push(String(url));if(String(url).startsWith('/api/speech'))return new Promise(()=>{});return {ok:true,blob:async()=>new Blob([String(url)])};};
 const played=[];const q=new VoiceQueue({world:'live',audio:{enabled:true,duck(){}},player:()=>null});q.giftWaitMs=20;q.play=async u=>{played.push(u);};
 try{q.queue=[{e:{id:'g',user:'u1',name:'An',gift:'Hoa hồng',coins:1,effect:'petal',text:'cảm ơn đạo hữu'},at:Date.now()}];await q.next();
  assert.equal(played.length,2,'name + gift parts');assert.ok(asked.some(u=>u.includes('kind=name')));assert.equal(q.lagStats().quick,1);}
 finally{q.stop();globalThis.fetch=old;}
});

test('Chính Ma: quà chỉ hô phản công / đẩy mạnh, không cảm ơn; không cho đột phá khi đại chiến',async()=>{
 const {speechPlan}=await import('../speech-lines.mjs');
 for(const coins of [1,20,199]){const plan=speechPlan({id:'w'+coins,user:'u',name:'An',gift:'Hoa hồng',coins,count:1,effect:'gift',text:'tặng Hoa hồng • cảm ơn đạo hữu',warGift:'ma',reward:{qi:100}});
  const text=plan.map(x=>x.text).join(' ');assert.doesNotMatch(text,/Đa tạ|tâm ý|nhận/);assert.match(text,/Ma Đạo/);}
 assert.doesNotMatch(WAR_PUSH_PLANS.chinh[0].text+WAR_PUSH_PLANS.ma[0].text,/Đa tạ/);
 const {createWorld,action,startWar,requiredQi,requiredStones}=await import('../engine.mjs');const N=Date.now();
 const w=createWorld('live');action(w,{type:'join',userId:'a',name:'An'},N);const p=w.players.a;p.qi=requiredQi(p)*2;p.stones=requiredStones(p)*2;
 assert.equal(startWar(w,N).ok!==false,true);const r=action(w,{type:'breakthrough',userId:'a'},N+1000);assert.equal(r.ok,false);assert.match(r.message,/Chính Ma/);assert.equal(p.realm,0);
});
