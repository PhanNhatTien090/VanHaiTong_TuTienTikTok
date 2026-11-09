import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createCanvas} from '@napi-rs/canvas';
import {smallGift,shouldFocusEvent,ritualState,crowdTargets,drawRitual} from '../public/live-cinema.js';
import {Scene} from '../public/scene.js';
import {PresentationQueue} from '../public/presentation.js';

test('gift threshold uses combo total and normal arrivals never move the camera',()=>{
 const gift={user:'a',gift:'Rose',coins:1,count:10};assert.equal(smallGift(gift),true);assert.equal(shouldFocusEvent(gift),true);
 assert.equal(shouldFocusEvent({...gift,count:11}),true);assert.equal(shouldFocusEvent({user:'a',autoArrival:true,effect:'join'}),false);
 const s=Object.create(Scene.prototype);Object.assign(s,{zoom:1.3,motion:true,cameraEnabled:true,focusUntil:0,targets:[],height:1600,camera:{s:1.8,x:-200,y:-400}});
 assert.deepEqual(s.moveCamera(100),{s:1,x:0,y:0});assert.deepEqual(s.moveCamera(100000),{s:1,x:0,y:0});
});
test('queued ascensions coalesce appearance and waiting viewers eventually precede a new VIP',()=>{
 const q=new PresentationQueue();q.push({id:'a1',user:'a',effect:'breakthrough',fromRealm:1,toRealm:2,visualFrom:{realm:1}},1000);
 q.push({id:'a2',user:'a',effect:'breakthrough',fromRealm:2,toRealm:3,visualFrom:{realm:2}},1100);
 assert.equal(q.items.length,1);assert.equal(q.items[0].fromRealm,1);assert.equal(q.items[0].toRealm,3);assert.equal(q.items[0].visualFrom.realm,1);
 q.push({id:'vip',user:'b',coins:9999,gift:'Gift',effect:'dragon'},14000);assert.equal(q.take(14001).id,'a2');
});
test('ritual uses old skin before the burst, new skin after it, with reduced-motion shake disabled',()=>{
 const e={effect:'breakthrough',user:'a',name:'Đạo hữu',start:0,duration:26000,fromRealm:8,toRealm:9,visualFrom:{id:'a',realm:8},visualTo:{id:'a',realm:9}};
 const before=JSON.stringify(e),seen=[],scene={motion:true,budget:{level:'light'},drawPlayer:(c,p)=>seen.push(p.realm),drawFlyingSword(){},players:[]},c=createCanvas(900,1600).getContext('2d');
 for(const sec of [0,4,8,15,18.54,18.55,22,25.9])drawRitual(scene,c,e,sec*1000,1600);
 assert.deepEqual(seen,[8,8,8,8,8,9,9,9]);assert.equal(JSON.stringify(e),before);
 assert.equal(ritualState({...e,toRealm:10,duration:8000},5680,false).shake,0);assert.ok(ritualState({...e,toRealm:10,duration:8000},5680,true).shake>0);
});
test('sixty-player plaza stays within the frame without mutating player data',()=>{
 const people=Array.from({length:60},(_,i)=>({id:String(i)})),original=JSON.stringify(people),targets=crowdTargets(people,1600);
 assert.equal(targets.length,60);assert.equal(new Set(targets.map(x=>x.id)).size,60);
 for(const t of targets){assert.ok(t.x-60*t.scale>0&&t.x+60*t.scale<900);assert.ok(t.y-115*t.scale>160&&t.y+40*t.scale<1400);}
 assert.equal(JSON.stringify(people),original);
});
test('small gifts receive their own solo but cannot replace an active breakthrough',()=>{
 const s=Object.create(Scene.prototype);Object.assign(s,{effects:[],motion:false,budget:{level:'light',config:{effects:2}}});
 s.addEffect({id:'rose',user:'a',gift:'Rose',coins:1,effect:'petal'});assert.equal(s.presentation.id,'a');assert.equal(s.presentation.kind,'gift');
 s.addEffect({id:'break',user:'b',effect:'breakthrough',toRealm:2});
 for(let i=0;i<20;i++)s.addEffect({id:'r'+i,user:'a',gift:'Rose',coins:1,effect:'petal'});
 assert.equal(s.presentation.id,'b');assert.equal(s.effects[0].id,'break');assert.equal(s.effects.length,1);
});
test('plaza rows are balanced (no lone last row) and share one column pitch',()=>{
 for(const n of [5,7,9,13,17,25,33,45]){const t=crowdTargets(Array.from({length:n},(_,i)=>({id:String(i)})),1600,1000);
  const rows=new Map();for(const a of t)rows.set(a.y,(rows.get(a.y)||0)+1);const counts=[...rows.values()];
  assert.ok(Math.max(...counts)-Math.min(...counts)<=1,n+': '+counts);
  for(const a of t)assert.ok(a.x-60*a.scale>0&&a.x+60*a.scale<900);}
});
