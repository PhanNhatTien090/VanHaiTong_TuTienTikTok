import {test} from 'node:test';
import assert from 'node:assert/strict';
import {live2Command} from '../live2-systems.mjs';
const now=1e9;
function make(){
 const p={id:'owner',name:'Hội Chủ',realm:6,lastActive:now};
 const q={id:'member',name:'Thành Viên',realm:4,lastActive:now};
 const w={mode:'live',settings:{live2Enabled:true},players:{owner:p,member:q}},events=[],emit=(_w,_p,msg,effect,at,extra)=>events.push({msg,effect,at,extra});
 const call=(p,str)=>live2Command(w,p,str.split(' '),now,{emit});
 return {p,q,w,events,call};
}
test('guild hierarchy cannot override Ngu Duong',()=>{
 const t=make();
 assert.equal(t.call(t.p,'lap hoi Long Mon').ok,true);
 const id=t.p.live2.guildId;assert.equal(t.call(t.q,'vao hoi '+id).ok,true);
 assert.equal(t.call(t.q,'hoi pho Hoi Chu').ok,false);
 assert.equal(t.call(t.p,'hoi pho Thanh Vien').ok,true);
 const g=t.w.live2World.guilds[id];assert.equal(g.deputy,t.q.id);
 assert.equal(t.w.nguDuong,undefined);
});
test('building upgrades spend earned contributions once, preserving lifetime score',()=>{
 const t=make();t.call(t.p,'lap hoi Long Mon');
 const g=t.w.live2World.guilds[t.p.live2.guildId];g.points=20;
 assert.equal(t.call(t.p,'hoi xay').ok,true);
 assert.equal(g.buildings.hall,1);
 assert.equal(g.spentPoints,20);
 assert.equal(t.call(t.p,'hoi xay').ok,false);
 assert.equal(g.points,20);
});
