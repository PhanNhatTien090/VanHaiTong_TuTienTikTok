import {test} from 'node:test';
import assert from 'node:assert/strict';
import {live2Command} from '../live2-systems.mjs';
const N=1_800_000_000_000;
function game(){
 const a={id:'a',name:'Hội Chủ',realm:8,lastActive:N,stones:100,artifacts:[]},b={id:'b',name:'Cố Vấn',realm:6,lastActive:N,stones:100,artifacts:[]};
 const w={mode:'live',settings:{live2Enabled:true},players:{a,b},social:{bonds:{k:{id:'k',a:'a',b:'b'}}}};
 const events=[],emit=(_w,_p,txt,fx,at,meta)=>events.push({txt,fx,meta});
 const cmd=(p,words)=>live2Command(w,p,words.split(' '),N,{emit});
 return {a,b,w,events,cmd};
}
test('guild leaders can transfer roles and then leave without orphaning the membership',()=>{
 const t=game();assert.equal(t.cmd(t.a,'lap hoi Tien Mon').ok,true);
 const code=t.a.live2.guildId;assert.equal(t.cmd(t.b,'vao hoi '+code).ok,true);
 assert.equal(t.cmd(t.a,'roi hoi').ok,false);
 assert.equal(t.cmd(t.a,'hoi nhuong Co Van').ok,true);
 assert.equal(t.w.live2World.guilds[code].leader,'b');
 assert.equal(t.cmd(t.a,'roi hoi').ok,true);
 assert.equal(t.w.live2World.guilds[code].leader,'b');
});
test('bond power is mutual, requires current LIVE bond and enforces pair cooldown',()=>{
 const t=game();t.w.boss={hp:100,endsAt:N+60000};
 assert.equal(t.cmd(t.a,'dong tam').ok,true);
 assert.equal(t.a.live2.bondSkillUntil,t.b.live2.bondSkillUntil);
 assert.equal(t.cmd(t.b,'dong tam').ok,false);
 assert.equal(t.events.at(-1).meta.bondPartnerId,'b');
});
