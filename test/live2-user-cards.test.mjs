import {test} from 'node:test';
import assert from 'node:assert/strict';
import {live2Command} from '../live2-systems.mjs';
import {inventoryDeckHTML} from '../public/inventory-multi.js';
import {live2ExtraCommand} from '../live2-extensions.mjs';
const now=1e9;
const make=()=>{
 const p={id:'u',name:'Hàn Phong',realm:4,stones:1000,herbs:200};
 const w={mode:'live',settings:{live2Enabled:true},players:{u:p}},events=[];
 const ctx={emit:(_w,person,message,effect,at,extra)=>events.push({user:person?.id,name:person?.name,message,effect,at,...extra})};
 return {p,w,ctx,events};
};
test('Dao status uses existing multi-person inventory deck and escaped names',()=>{
 const {p,w,ctx,events}=make();
 assert.equal(live2Command(w,p,['dao','tu'],now,ctx).ok,true);
 const e=events.at(-1);
 assert.equal(e.card.kind,'dao');
 const html=inventoryDeckHTML(e,x=>String(x).replace(/[&<>"]/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[x])));
 assert.match(html,/CHỌN CON ĐƯỜNG TU/);
 assert.match(html,/Kiếm Đạo/);
 assert.ok(!html.includes('undefined'));
});
test('elixir crafting at storage limit charges nothing',()=>{
 const {p,w,ctx}=make();live2Command(w,p,['chon','dao','dan'],now,ctx);
 p.live2.elixirs={guard:30};const before=[p.stones,p.herbs];
 assert.equal(live2ExtraCommand(w,p,['che','dan','ho','mach'],now+2000,ctx).ok,false);
 assert.deepEqual([p.stones,p.herbs],before);
});
test('defense elixir never consumed in a boss-only fight',()=>{
 const {p,w,ctx}=make();live2Command(w,p,['chon','dao','dan'],now,ctx);
 p.live2.elixirs={guard:1};w.boss={hp:100,endsAt:now+50000};
 assert.equal(live2ExtraCommand(w,p,['dan','dung','ho','mach'],now+2000,ctx).ok,false);
 assert.equal(p.live2.elixirs.guard,1);
});
