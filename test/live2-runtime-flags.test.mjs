import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,snapshot} from '../engine.mjs';
const N=1800000000000;
test('LIVE 2.0 never exposes inactive UI or applies a stale optional Boss Trial',()=>{
 const w=createWorld('live');
 const p=ensurePlayer(w,'preview-user','Đạo Kiếm',N);
 p.realm=5;
 p.live2={v:1,path:'sword',insight:40};
 w.boss={id:'x',name:'Yêu Thú',species:'storm-tiger',hp:100,maxHp:200,
  endsAt:N+90000,startedAt:N,damage:{},participants:{},live2Boss:{phase:'frenzy'}};
 w.settings.live2Enabled=false;
 let result=snapshot(w,N);
 let player=result.players.find(x=>x.id===p.id);
 assert.equal(player.live2Summary,null);
 assert.equal(result.boss.live2Boss,null);
 assert.equal(result.live2GuildWar,null);
 assert.equal(result.live2Trial.length,0);
 w.settings.live2Enabled=true;
 w.settings.live2BossTrialsEnabled=false;
 result=snapshot(w,N);
 player=result.players.find(x=>x.id===p.id);
 assert.equal(player.live2Summary.path,'sword');
 assert.equal(result.boss.live2Boss,null);
 assert.equal(p.live2.insight,40);
 assert.equal(w.version,1);
});
