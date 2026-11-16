import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,ensurePlayer} from '../engine.mjs';
import {autoJoinIdle,activeHalls,AUTO_JOIN_MS} from '../ngu-duong.mjs';

test('16/11: chơi ≥1 giờ chưa vào Đường → tự vào Đường ít người nhất, cân đều; người mới/tự rời thì không',()=>{
 const now=Date.UTC(2026,10,16,12),w=createWorld('demo');
 const open=activeHalls(w).map(h=>h.index);assert.ok(open.length>=2);
 const mk=(id,ms,extra={})=>Object.assign(ensurePlayer(w,id,id,now),{activeMs:ms,lastActive:now},extra);
 for(let i=0;i<4;i++)mk('v'+i,2*AUTO_JOIN_MS);
 mk('new',10*60000);mk('left',3*AUTO_JOIN_MS,{hallDeparture:{at:now}});
 const out=autoJoinIdle(w,now);
 assert.deepEqual(out.map(x=>x.id).sort(),['v0','v1','v2','v3']);
 const per=new Map();for(const x of out)per.set(x.index,(per.get(x.index)||0)+1);
 assert.ok(Math.max(...per.values())-Math.min(...per.values())<=1,'cân đều giữa các Đường');
 assert.equal(w.nguDuong.members.new,undefined);assert.equal(w.nguDuong.members.left,undefined);
 assert.deepEqual(autoJoinIdle(w,now),[],'gọi lại không xếp ai nữa');
});
