import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,action,openBoss,snapshot} from '../engine.mjs';
import {live2TribulationBegin} from '../live2-tribulation.mjs';
const N=1_800_000_000_000;
function game(){
 const w=createWorld('live');
 Object.assign(w.settings,{live2Enabled:true,residents:false,autoEvents:false,bossInterval:999999});
 const p=ensurePlayer(w,'u','Vân Lâm',N),q=ensurePlayer(w,'q','Mộc Thanh',N);
 p.realm=q.realm=5;p.stones=1000;p.herbs=150;p.artifacts.push('jade');p.equipped='jade';
 const cmd=(p,text,time=N)=>action(w,{type:'chat',userId:p.id,name:p.name,text},time);
 return {w,p,q,cmd};
}
test('TikTok comment router sends path, guild and elixir commands to LIVE 2.0 without touching old inventory',()=>{
 const t=game();
 assert.equal(t.cmd(t.p,'chọn đạo kiếm').ok,true);
 assert.equal(t.p.live2.path,'sword');
 assert.equal(t.cmd(t.p,'lập hội Vân Môn').ok,true);
 assert.ok(t.p.live2.guildId);
 assert.equal(t.cmd(t.p,'chế đan hộ mạch').ok,true);
 assert.equal(t.p.live2.elixirs.guard,1);
 assert.equal(t.cmd(t.p,'đan phương').ok,true);
 const card=t.cmd(t.p,'đạo tu');assert.equal(card.ok,true);
 assert.ok(t.w.feed.some(e=>e.card?.kind==='dao'));
 assert.equal(t.p.equipped,'jade');
 assert.ok(t.p.artifacts.includes('jade'));
});
test('legacy game outputs remain unchanged with LIVE 2.0 disabled',()=>{
 const w=createWorld('live');w.settings.residents=false;
 const p=ensurePlayer(w,'u','Người Thử',N);p.realm=5;
 const l=action(w,{type:'chat',userId:'u',name:p.name,text:'chọn đạo kiếm'},N);
 assert.equal(p.live2,undefined);
 assert.ok(!l.ok||!p.live2?.path);
 const s=snapshot(w,N);
 assert.equal(s.live2Trial.length,0);
 assert.ok(!s.live2GuildWar);
 assert.equal(w.version,1);
});
test('tribulation help is free, idempotent, routes in chat and keeps realm/qi',()=>{
 const t=game();t.cmd(t.p,'chọn đạo kiếm');t.cmd(t.q,'chọn đạo thể');
 const before=t.p.realm,qi=t.p.qi;
 live2TribulationBegin(t.w,t.p,N+1000,()=>{});
 const help=t.cmd(t.q,'hộ kiếp Vân Lâm',N+2000);
 assert.equal(help.ok,true);
 assert.equal(t.p.realm,before);assert.equal(t.p.qi,qi);
 assert.equal(t.cmd(t.q,'hộ kiếp Vân Lâm',N+3000).ok,false);
});
test('BOSS new mechanics cannot change old damage without separate flag',()=>{
 const t=game();t.cmd(t.p,'chọn đạo kiếm');
 t.w.settings.live2Enabled=false;
 assert.equal(openBoss(t.w,N,'thunder-tiger').ok,true);
 const oldHp=t.w.boss.hp;
 const out=action(t.w,{type:'attack',userId:t.p.id,name:t.p.name},N+4000);
 assert.equal(out.ok,true);
 assert.ok(t.w.boss.hp<oldHp);
 assert.equal(t.w.boss.live2Boss,undefined);
});
