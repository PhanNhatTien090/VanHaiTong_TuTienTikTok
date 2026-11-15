import {test} from 'node:test';
import assert from 'node:assert/strict';
import {live2Command,live2GuildCard} from '../live2-systems.mjs';
import {inventoryDeckHTML} from '../public/inventory-multi.js';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
test('guild panel is part of existing 4-card queue and safely renders old guild names',()=>{
 const p={id:'a',name:'A',realm:5},w={mode:'demo',players:{a:p},live2World:{guilds:{G:{id:'G',leader:'a',name:'<img src=x onerror=alert(1)>',members:['a'],points:33}}}};
 const card=live2GuildCard(w,w.live2World.guilds.G),html=inventoryDeckHTML({user:'a',name:p.name,card},escape);
 assert.match(html,/vd-guild/);
 assert.ok(!html.includes('<img src=x onerror=alert(1)>'));
 assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
});
test('guild command uses unique member deck event rather than a cinematic',()=>{
 const w={mode:'demo',players:{a:{id:'a',name:'A',realm:5}}},p=w.players.a,events=[],ctx={emit:(_w,_p,message,effect,now,more)=>events.push({effect,...more})};
 assert.equal(live2Command(w,p,['hoi'],1800000000000,ctx).ok,true);
 assert.equal(events[0].effect,'status');
 assert.equal(events[0].card.kind,'guild');
});
