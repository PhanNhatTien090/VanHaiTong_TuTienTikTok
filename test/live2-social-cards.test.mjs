import {test} from 'node:test';
import assert from 'node:assert/strict';
import {live2Command} from '../live2-systems.mjs';
import {live2ExtraCommand} from '../live2-extensions.mjs';
import {inventoryDeckHTML} from '../public/inventory-multi.js';
const esc=s=>String(s).replace(/[&<>"]/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[x]));
const N=1800000000000;
test('Dao partner status reads canonical social.bonds and excludes ended ties',()=>{
 const a={id:'a',name:'A',realm:5},b={id:'b',name:'B',realm:5},c={id:'c',name:'C',realm:5};
 const w={mode:'demo',players:{a,b,c},social:{bonds:{one:{id:'one',a:'a',b:'b',level:2},old:{id:'old',a:'a',b:'c',endedAt:N-10}}}};
 const events=[],ctx={emit:(_w,_p,t,effect,at,extra)=>events.push({effect,...extra})};
 assert.equal(live2Command(w,a,['dao','lu'],N,ctx).ok,true);
 assert.equal(events[0].card.kind,'bond');
 assert.equal(events[0].card.partners.length,1);
 assert.equal(events[0].card.partners[0].name,'B');
 assert.equal(events[0].effect,'status');
 assert.match(inventoryDeckHTML({name:'A',card:events[0].card},esc),/vd-bond/);
});
test('mentor status is lightweight and does not grant extra resources',()=>{
 const p={id:'a',name:'A',realm:4,stones:100,live2:{masterId:'b',students:[]}},m={id:'b',name:'Sư Phụ',realm:8};
 const w={mode:'demo',players:{a:p,b:m}},events=[],ctx={emit:(_w,_p,t,effect,at,extra)=>events.push({effect,...extra})};
 assert.equal(live2ExtraCommand(w,p,['su','mon'],N,ctx).ok,true);
 assert.equal(events[0].card.kind,'mentor');
 assert.equal(events[0].effect,'status');
 assert.equal(p.stones,100);
 assert.match(inventoryDeckHTML({name:'A',card:events[0].card},esc),/vd-mentor/);
});
