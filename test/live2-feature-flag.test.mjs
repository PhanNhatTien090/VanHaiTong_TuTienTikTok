import {test} from 'node:test';
import assert from 'node:assert/strict';
import {live2Command,live2Insight,live2Enabled,live2CombatBonus} from '../live2-systems.mjs';
import {live2ExtraCommand,live2GuildWarView,live2Tick} from '../live2-extensions.mjs';
import {stageConflict} from '../stage-lock.mjs';
test('all new LIVE commands and bonuses are disabled unless explicitly enabled',()=>{
 const p={id:'u',name:'tu sĩ',realm:8,stones:100,herbs:20,artifacts:['a'],equipped:'a',lastActive:1e6};
 const w={mode:'live',settings:{},players:{u:p}};
 const emit=()=>{throw Error('should not emit')};
 assert.equal(live2Enabled(w),false);
 assert.equal(live2Command(w,p,['chon','dao','kiem'],1e6,{emit}),null);
 assert.equal(live2ExtraCommand(w,p,['che','dan','ho','mach'],1e6,{emit}),null);
 assert.equal(live2Insight(w,p,{type:'checkin'},{ok:true},1e6,emit),0);
 assert.equal(p.live2,undefined);
 p.live2={path:'sword',insight:140,skillUntil:1e6+100000};
 assert.ok(live2CombatBonus(p,1e6)>1); // caller must guard legacy combat math
 w.live2World={guildWar:{endsAt:1e6+100000,groups:[]}};
 assert.equal(live2GuildWarView(w,1e6),null);
 assert.equal(stageConflict(w,1e6),null);
 live2Tick(w,1e6,{emit});
 assert.equal(w.live2World.guildWar.cancelled,true);
});
