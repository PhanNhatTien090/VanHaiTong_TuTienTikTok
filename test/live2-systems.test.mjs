import {test} from 'node:test';
import assert from 'node:assert/strict';
import {LIVE2_PATHS,live2Command,live2Insight,live2CombatBonus,live2PlayerView} from '../live2-systems.mjs';
const make=()=>{
 const p={id:'u',name:'Tiến',realm:2,stones:999,herbs:999,artifacts:['jade'],equipped:'jade',cooldowns:{},lastActive:10e6},
 w={mode:'live',players:{u:p},settings:{live2Enabled:true},social:{bonds:{}},events:[]},
 events=[],emit=(_w,_p,message,effect,now,extra)=>events.push({message,effect,now,...extra});
 return {p,w,events,ctx:{emit},call:(raw,now=10e6)=>live2Command(w,p,raw.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase().split(' '),now,{emit})};
};
test('cultivation path selection is safe and reversible only after cooldown',()=>{
 const a=make();assert.equal(a.call('chọn đạo kiếm').ok,true);
 assert.equal(a.p.live2.path,'sword');
 assert.equal(a.call('chọn đạo ma').ok,false);
 assert.equal(a.call('đổi đạo ma',10e6+7*86400000+1000).ok,true);
 assert.equal(a.call('đổi đạo ma xác nhận',10e6+7*86400000+2000).ok,true);
 assert.equal(a.p.live2.path,'demon');
});
test('insight is capped by day and cannot be farmed with duplicate events',()=>{
 const a=make();a.call('chọn đạo kiếm');
 for(let i=0;i<100;i++)live2Insight(a.w,a.p,{type:'cultivate'},{ok:true},10e6+i*60000,a.ctx.emit);
 assert.equal(a.p.live2.daily.earned,12);
 const before=a.p.live2.insight;
 live2Insight(a.w,a.p,{type:'cultivate'},{ok:true,duplicate:true},10e6+101*60000,a.ctx.emit);
 assert.equal(a.p.live2.insight,before);
});
test('guild preserves membership and only grants bounded contribution',()=>{
 const a=make();a.call('chọn đạo kiếm');
 assert.equal(a.call('lập hội Thanh Long').ok,true);
 const code=a.p.live2.guildId;
 assert.equal(a.w.live2World.guilds[code].members.length,1);
 live2Insight(a.w,a.p,{type:'checkin'},{ok:true},10e6+1000,a.ctx.emit);
 assert.ok(a.w.live2World.guilds[code].points<=2);
});
test('refining owned relic is capped; existing ownership remains',()=>{
 const a=make();a.call('chọn đạo kiếm');
 for(let i=0;i<3;i++)assert.equal(a.call('tinh luyen',10e6+i*1000).ok,true);
 assert.equal(a.call('tinh luyen',10e6+4000).ok,false);
 assert.deepEqual(a.p.artifacts,['jade']);
 assert.ok(live2CombatBonus(a.p,10e6+5000)<=1.12);
 assert.equal(live2PlayerView(a.p).path,'sword');
 assert.ok(LIVE2_PATHS.beast);
});
test('mentorship requires real mentor consent',()=>{
 const a=make();a.call('chọn đạo kiếm');
 const m={id:'m',name:'Thầy',realm:6,lastActive:10e6};a.w.players.m=m;
 assert.equal(a.call('xin sư Thầy').ok,true);
 assert.equal(live2Command(a.w,m,['nhan','do'],10e6,a.ctx).ok,true);
 assert.equal(a.p.live2.masterId,'m');
 assert.equal(a.call('truyền đạo').ok,true);
 assert.equal(a.call('xuất sư').ok,true);
 assert.equal(a.p.live2.masterId,null);
});
