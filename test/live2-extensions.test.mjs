import {test} from 'node:test';
import assert from 'node:assert/strict';
import {live2Command} from '../live2-systems.mjs';
import {live2ExtraCommand,live2Tick,live2GuildWarView,live2ExtraBonus,live2MentorActivity} from '../live2-extensions.mjs';
function game(){
 const n=1000000000,p={id:'u',name:'Tu sĩ A',realm:5,lastActive:n,stones:3000,herbs:100,artifacts:['a'],equipped:'a'},
 q={id:'v',name:'Tu sĩ B',realm:5,lastActive:n,stones:3000,herbs:100,artifacts:['b'],equipped:'b'},
 w={players:{u:p,v:q},settings:{},social:{bonds:{}},events:[]},events=[],ctx={emit:(_w,_p,msg,effect,at,extra)=>events.push({msg,effect,at,...extra})};
 const l=(pl,str,time=n)=>live2Command(w,pl,str.split(' '),time,ctx);
 const e=(pl,str,time=n)=>live2ExtraCommand(w,pl,str.split(' '),time,ctx);
 return {w,p,q,ctx,events,l,e,n};
}
test('new elixir recipes use existing stones/herbs and preserve old pills',()=>{
 const t=game();t.l(t.p,'chon dao dan');t.p.pills={'qi-pill':3};
 assert.equal(t.e(t.p,'che dan ho mach').ok,true);
 assert.equal(t.p.live2.elixirs.guard,1);
 assert.deepEqual(t.p.pills,{'qi-pill':3});
 assert.equal(t.e(t.p,'dan dung ho mach').ok,false);
 t.w.boss={hp:100,endsAt:t.n+100000};
 assert.equal(t.e(t.p,'dan dung ho mach').ok,true);
 assert.equal(live2ExtraBonus(t.p,t.n,'tower')>1,true);
 assert.equal(t.p.live2.elixirs.guard,0);
});
test('guild war needs real participation, is one-time rewarded and expires',()=>{
 const t=game();t.l(t.p,'lap hoi Tien Phong');t.l(t.q,'lap hoi Thanh Van');
 assert.equal(t.e(t.p,'hoi chien').ok,true);
 assert.equal(t.e(t.p,'chien hoi').ok,true);
 assert.equal(t.e(t.q,'chien hoi').ok,true);
 assert.ok(live2GuildWarView(t.w,t.n)?.active);
 const pStones=t.p.stones;live2Tick(t.w,t.n+90001,t.ctx);
 assert.ok(t.p.stones>=pStones+4);
 const after=t.p.stones;live2Tick(t.w,t.n+90002,t.ctx);assert.equal(t.p.stones,after);
});
test('mentor daily tasks grant rewards only once',()=>{
 const t=game();t.p.live2={masterId:'v'};
 for(let i=0;i<5;i++)live2MentorActivity(t.w,t.p,{type:'gather'},{ok:true},t.n+i*31000,t.ctx);
 assert.equal(t.p.live2.mentorQuest.count,3);
 assert.equal(t.p.stones,3004);
});
test('relic active bonus only while matching equipped item',()=>{
 const t=game();t.w.boss={hp:100,endsAt:t.n+100000};
 assert.equal(t.e(t.p,'phap an').ok,true);
 assert.equal(t.p.live2.relicActive.id,'a');
 assert.equal(t.e(t.p,'phap an',t.n+1000).ok,false);
});
