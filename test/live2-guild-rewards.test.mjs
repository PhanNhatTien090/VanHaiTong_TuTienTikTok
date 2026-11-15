import {test} from 'node:test';
import assert from 'node:assert/strict';
import {live2Tick} from '../live2-extensions.mjs';
import {live2GuildCard} from '../live2-systems.mjs';
import {inventoryDeckHTML} from '../public/inventory-multi.js';
const N=1800000000000;
function game(){
 const a={id:'a',name:'A',realm:4,stones:30},b={id:'b',name:'B',realm:4,stones:30};
 const world={mode:'live',settings:{live2Enabled:true,live2GuildWarEnabled:true},players:{a,b},
  live2World:{guilds:{
   A:{id:'A',name:'Alpha',leader:'a',members:['a'],points:30,contributions:{a:30}},
   B:{id:'B',name:'Beta',leader:'b',members:['b'],points:25,contributions:{b:25}}},
   guildWar:{id:'war',endsAt:N+1000,groups:[
    {id:'A',name:'Alpha',score:40,byUser:{a:40}},
    {id:'B',name:'Beta',score:30,byUser:{b:30}}],lastHitAt:{},eligible:['a','b']}}};
 return {world,a,b,events:[],emit:(w,p,message,effect,now,meta)=>{}};
}
test('one guild-war settlement awards both groups exactly once, preserves lifetime contributions',()=>{
 const t=game(),g=t.world.live2World.guilds;
 live2Tick(t.world,N+1001,{emit:t.emit});
 assert.equal(g.A.points,40);assert.equal(g.B.points,29);
 assert.equal(g.A.warPoints,10);assert.equal(g.B.warPoints,4);
 assert.equal(g.A.wars,1);assert.equal(g.B.wars,1);
 assert.equal(g.A.wins,1);assert.equal(g.B.wins,0);
 assert.equal(g.A.contributions.a,30);
 assert.equal(t.a.stones,38);assert.equal(t.b.stones,34);
 const before=JSON.stringify({g,stones:[t.a.stones,t.b.stones]});
 live2Tick(t.world,N+2000,{emit:t.emit});
 assert.equal(JSON.stringify({g,stones:[t.a.stones,t.b.stones]}),before);
 const card=live2GuildCard(t.world,g.A);
 assert.equal(card.wins,1);
 assert.match(inventoryDeckHTML({name:'A',card},x=>x),/Hội Chiến: 1 thắng/);
});
test('disabling guild-war feature before settlement cancels all rewards and lifetime score changes',()=>{
 const t=game();t.world.settings.live2GuildWarEnabled=false;
 live2Tick(t.world,N+1001,{emit:t.emit});
 assert.equal(t.world.live2World.guildWar.cancelled,true);
 assert.equal(t.world.live2World.guilds.A.points,30);
 assert.equal(t.a.stones,30);
 assert.equal(t.world.live2World.guilds.A.wars,undefined);
});
