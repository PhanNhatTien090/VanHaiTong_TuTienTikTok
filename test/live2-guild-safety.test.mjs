import {test} from 'node:test';
import assert from 'node:assert/strict';
import {live2Command} from '../live2-systems.mjs';
import {live2ExtraCommand} from '../live2-extensions.mjs';
const now=1e9;
const players=(prefix)=>[0,1].map(i=>({id:prefix+i,name:prefix+i,realm:4,lastActive:now,artifacts:[],stones:100,herbs:30}));
test('LIVE guild war requires streamer opt in and 2 active members per side',()=>{
 const a=players('a'),b=players('b'),w={mode:'live',settings:{live2Enabled:true},players:Object.fromEntries([...a,...b].map(p=>[p.id,p]))};
 const ctx={emit:()=>{}},call=(p,word)=>live2Command(w,p,word.split(' '),now,ctx);
 const extra=(p,word)=>live2ExtraCommand(w,p,word.split(' '),now,ctx);
 assert.equal(call(a[0],'lap hoi Long Mon').ok,true);assert.equal(call(b[0],'lap hoi Thanh Van').ok,true);
 assert.equal(call(a[1],'vao hoi '+a[0].live2.guildId).ok,true);
 assert.equal(call(b[1],'vao hoi '+b[0].live2.guildId).ok,true);
 assert.equal(extra(a[0],'hoi chien').ok,false);
 w.settings.live2GuildWarEnabled=true;
 assert.equal(extra(a[0],'hoi chien').ok,true);
});
test('guild switching respects cooldown and capacity',()=>{
 const a=players('a'),w={mode:'demo',players:Object.fromEntries(a.map(p=>[p.id,p]))},ctx={emit:()=>{}};
 const call=(p,word,t)=>live2Command(w,p,word.split(' '),t,ctx);
 assert.equal(call(a[0],'lap hoi Long Mon',now).ok,true);
 assert.equal(call(a[0],'roi hoi',now+1000).ok,true);
 assert.equal(call(a[0],'lap hoi New Mon',now+2000).ok,false);
});
