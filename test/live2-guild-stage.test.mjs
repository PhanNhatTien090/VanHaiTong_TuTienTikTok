import {test} from 'node:test';
import assert from 'node:assert/strict';
import {guildWarActorIds,guildWarTargets,drawGuildWarFloor,drawGuildWarClash} from '../public/live2-guild-stage.js';
const mock=()=>{
 const groups=[{id:'A',roster:['a0','a1','a2','a3','a4']},{id:'B',roster:['b0','b1','b2','b3','b4']}];
 const index=new Map([...groups.flatMap(g=>g.roster)].map(id=>[id,{id,name:id}]));
 return {war:{active:true,groups},index};
};
test('guild stage has at most eight original characters and never edits roster',()=>{
 const {war,index}=mock(),ids=guildWarActorIds(war);
 assert.equal(ids.length,8);
 assert.equal(war.groups[0].roster.length,5);
 const actors=guildWarTargets(war,index,1600);
 assert.equal(actors.length,8);
 assert.ok(actors.every(a=>a.x>=0&&a.x<=900&&a.baseY<=1600));
 assert.ok(actors.filter(a=>a.guildSide===0).every(a=>a.x<450));
 assert.ok(actors.filter(a=>a.guildSide===1).every(a=>a.x>450));
 assert.equal(guildWarTargets(war,index,1600,{light:true}).length,4);
});
test('no new characters or visual allocations when war is not active',()=>{
 const {war,index}=mock();war.active=false;
 assert.deepEqual(guildWarActorIds(war),[]);
 assert.deepEqual(guildWarTargets(war,index,1600),[]);
 assert.equal(drawGuildWarFloor(null,war,0,1600),false);
});
test('guild floor always restores global drawing state',()=>{
 const {war}=mock();let save=0,restore=0;
 const c={save:()=>save++,restore:()=>restore++,beginPath:()=>{},translate:()=>{},ellipse:()=>{},stroke:()=>{},moveTo:()=>{},lineTo:()=>{}};
 for(let i=0;i<150;i++)drawGuildWarFloor(c,war,i*16,1600,{light:i%3===0});
 assert.equal(save,restore);
});

test('one guild clash stays under 1 second, restores canvas state and reduces flash under light mode',()=>{
 let saves=0,restores=0,strokes=0,fill=0;
 const c={save:()=>saves++,restore:()=>restores++,stroke:()=>strokes++,fill:()=>fill++,
  beginPath:()=>{},moveTo:()=>{},lineTo:()=>{},quadraticCurveTo:()=>{},ellipse:()=>{}};
 const p={at:1000,side:0};
 assert.equal(drawGuildWarClash(c,p,500,1600),false);
 assert.equal(drawGuildWarClash(c,p,1500,1600,{light:true,reducedFlash:true,motion:false}),true);
 assert.equal(drawGuildWarClash(c,p,1900,1600,{light:false}),true);
 assert.equal(drawGuildWarClash(c,p,2001,1600),false);
 assert.equal(saves,restores);
 assert.ok(strokes>=2);
 assert.equal(fill,0);
});
