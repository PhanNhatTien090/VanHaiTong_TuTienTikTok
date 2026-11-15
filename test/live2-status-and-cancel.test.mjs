import {test} from 'node:test';
import assert from 'node:assert/strict';
import {live2Tick,live2GuildWarView} from '../live2-extensions.mjs';
import {live2Command} from '../live2-systems.mjs';
import {live2ExtraCommand} from '../live2-extensions.mjs';
import {stageConflict} from '../stage-lock.mjs';
const N=1800000000000;
function make(){
 const p={id:'a',name:'A',realm:5,stones:100,lastActive:N,artifacts:[],live2:{guildId:'A'}};
 const q={id:'b',name:'B',realm:5,stones:100,lastActive:N,artifacts:[],live2:{guildId:'B'}};
 const w={mode:'live',settings:{live2Enabled:true,live2GuildWarEnabled:true},players:{a:p,b:q},
  live2World:{guilds:{A:{id:'A',name:'A',leader:'a',members:['a'],points:0},B:{id:'B',name:'B',leader:'b',members:['b'],points:0}},
   guildWar:{id:'war',endsAt:N+90000,groups:[{id:'A',name:'A',score:2,byUser:{a:2}},{id:'B',name:'B',score:1,byUser:{b:1}}],eligible:['a','b'],lastHitAt:{}}}};
 const events=[],ctx={emit:(_w,_p,message,effect,time,extra)=>events.push({message,effect,time,extra})};
 return {w,p,q,events,ctx};
}
test('disable guild-war flag cancels without awarding rewards or locking stage',()=>{
 const {w,p,q,events,ctx}=make();
 assert.equal(live2GuildWarView(w,N).active,true);
 assert.equal(stageConflict(w,N),'Hội Chiến');
 w.settings.live2GuildWarEnabled=false;live2Tick(w,N+10,ctx);
 assert.equal(live2GuildWarView(w,N+10),null);
 assert.equal(stageConflict(w,N+10),null);
 assert.equal(w.live2World.guildWar.cancelled,true);
 assert.equal(p.stones,100);assert.equal(q.stones,100);
 assert.equal(events.length,0);
 w.settings.live2GuildWarEnabled=true;live2Tick(w,N+100000,ctx);
 assert.equal(live2GuildWarView(w,N+100000),null);
 assert.equal(p.stones,100);
});
test('information commands do not emit flashy Dao-path events',()=>{
 const {w,p,events,ctx}=make();delete p.live2;delete w.live2World;
 const a=live2Command(w,p,['dao','tu'],N,ctx);
 const b=live2ExtraCommand(w,p,['dan','phuong'],N+1000,ctx);
 assert.equal(a.ok,true);assert.equal(b.ok,true);
 assert.equal(events.length,2);
 assert.deepEqual(events.map(x=>x.effect),['status','status']);
 assert.equal(events[0].extra.card.kind,'dao');
});
