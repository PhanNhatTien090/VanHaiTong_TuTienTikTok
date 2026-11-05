import {test} from 'node:test';import assert from 'node:assert/strict';
import {createWorld,action,tick} from '../engine.mjs';import {announcement} from '../speech.mjs';import {priority} from '../public/voice.js';import {vipTier,nameBadge} from '../public/vip.js';import {StageDirector} from '../public/stage.js';
test('first gift doubles rewards and greets a new Hộ Pháp; VIP tiers, returns and like goals are announced',()=>{
 const w=Object.assign(createWorld('live'),{settings:{bossInterval:240,engagementRewards:true}});let now=1e12;action(w,{type:'chat',userId:'a',name:'An',text:'nhapmon nu'},now);
 action(w,{type:'gift',userId:'a',name:'An',coins:1,giftName:'Rose',eventId:'1'},now+=1000);const f=w.events.findLast(e=>e.gift);assert.equal(f.firstGift,true);assert.match(announcement({...f,gender:'nu'}),/Tân Hộ Pháp/);assert.equal(priority(f),6);
 assert.equal(f.buff.mult,5);assert.equal(f.buff.minutes,20);action(w,{type:'gift',userId:'a',name:'An',coins:1,giftName:'Rose',eventId:'2'},now+=1000);assert.equal(w.events.findLast(e=>e.gift).firstGift,false);
 action(w,{type:'gift',userId:'a',name:'An',coins:100,eventId:'3'},now+=1000);assert.equal(w.events.findLast(e=>e.vipUp)?.vipUp,1);
 action(w,{type:'chat',userId:'a',name:'An',text:'tuvi'},now+=31*60000);assert.match(announcement(w.events.findLast(e=>e.vipReturn)),/Hộ Pháp Bạc An đã trở lại/);
 for(let i=0;i<3;i++)action(w,{type:'like',userId:'a',name:'An',count:400},now+=20000);const g=w.events.findLast(e=>e.likeGoal);assert.equal(g.likeGoal,1000);assert.equal(w.likeGoal.target,1200);
 assert.equal(vipTier(99),0);assert.equal(vipTier(300),2);assert.equal(vipTier(1000),3);assert.equal(nameBadge({giftCoins:10000}),'💎 ');assert.equal(nameBadge({realm:0,joinedAt:Date.now()}),'🌱 ');
});
test('tân thủ lệnh: newcomer who tries cultivation breaks through to Luyện Khí once',()=>{
 const w=Object.assign(createWorld('live'),{settings:{bossInterval:240,engagementRewards:true}});let now=1e12;action(w,{type:'chat',userId:'n',name:'N',text:'nhapmon'},now);action(w,{type:'cultivate',userId:'n'},now+1);
 for(let i=0;i<50;i++){action(w,{type:'chat',userId:'n',name:'N',text:'hello'},now+=5000);tick(w,now);}
 assert.equal(w.players.n.realm,1);assert.equal(w.events.filter(e=>e.starter).length,1);assert.match(announcement(w.events.find(e=>e.starter)),/Tân thủ lệnh/);
});
test('VIP and newcomers outrank idle regulars for a seat',()=>{const s=new StageDirector(2),t=1e6;const reg={id:'r',realm:3,giftCoins:0},vip={id:'v',realm:0,giftCoins:10000};assert.ok(s.score(vip,t)>s.score(reg,t));});
