import test from 'node:test';import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,action,ingest,currentParticipant} from '../../engine.mjs';
import {createLiveTransfers,LIVE_RECENT_MS} from '../cloud/live-transfers.mjs';
import {createPlaySessions} from '../cloud/play-sessions.mjs';
// Bàn giao tự động: không cần đăng xuất web hay gõ roilive khi người chơi không còn ở bên kia.
const id='7000000000000000001';
function liveWorld(now){const w=createWorld('live');ensurePlayer(w,id,'Đạo hữu',now);w.liveSession={active:true,startedAt:now-1000};return w;}
function memoryStore(){const m=new Map();return {get:k=>m.get(k),transfer(r){m.set('play:'+r.playerId,structuredClone(r));},transfers:()=>[...m.entries()].filter(([k])=>k.startsWith('play:')).map(([,v])=>structuredClone(v))};}

test('LIVE hands a character to web without roilive once the viewer has been quiet for a minute',()=>{
  const now=Date.now(),w=liveWorld(now),live=createLiveTransfers({world:w,save:()=>{}});
  action(w,{userId:id,type:'chat',text:'xin chao'},now);
  assert.equal(currentParticipant(w,w.players[id],now+1000),true);
  const early=live.apply({generation:1,id:'transfer-1',playerId:id,kind:'acquire'},now+1000);
  assert.equal(early.ok,false);assert.match(early.message,/roilive/);
  const later=live.apply({generation:2,id:'transfer-2',playerId:id,kind:'acquire'},now+LIVE_RECENT_MS+1000);
  assert.equal(later.ok,true);assert.equal(w.playTransfers[id].phase,'web');
  assert.equal(currentParticipant(w,w.players[id],now+LIVE_RECENT_MS+2000),false,'character leaves the LIVE stage while on web');
});

test('viewer activity on LIVE asks for the character back and the cloud releases only idle web sessions',()=>{
  const now=Date.now(),w=liveWorld(now),live=createLiveTransfers({world:w,save:()=>{}});
  assert.equal(live.apply({generation:1,id:'transfer-1',playerId:id,kind:'acquire'},now).ok,true);
  const r=ingest(w,{event:'chat',data:{userId:id,nickname:'Đạo hữu',comment:'diemdanh'}},now+5000);
  assert.equal(r.code,'PLAYING_WEB');assert.equal(w.playTransfers[id].wantsLiveAt,now+5000);
  // Phía cloud: phiên web vừa dùng thì giữ, phiên đã im 45 giây thì trả về LIVE.
  const cloudWorld={players:{[id]:structuredClone(w.players[id])}},store=memoryStore();
  const sessions=createPlaySessions({store,world:cloudWorld,activeMs:45000,idleMs:10*60000});
  store.transfer({generation:1,id:'transfer-1',playerId:id,userId:1,phase:'web',lastUsed:now});
  assert.deepEqual(sessions.controls(true,[id],now+10000),[],'active web player keeps the character');
  assert.equal(store.get('play:'+id).phase,'web');
  const commands=sessions.controls(true,[id],now+46000);
  assert.equal(commands.length,1);assert.equal(commands[0].kind,'release');assert.equal(store.get('play:'+id).phase,'release');
  assert.equal(live.apply(commands[0],now+47000).ok,true);assert.equal(w.playTransfers[id].phase,'live');
  assert.equal(w.playTransfers[id].wantsLiveAt,undefined);
});

test('quản trị: mượn nhân vật cả khi người đó vừa tương tác (force), thao tác xong trả về LIVE ngay',async()=>{
  const now=Date.now(),w=liveWorld(now),live=createLiveTransfers({world:w,save:()=>{}});
  action(w,{userId:id,type:'chat',text:'xin chao'},now);
  assert.equal(live.apply({generation:1,id:'t-normal',playerId:id,kind:'acquire'},now+1000).ok,false,'người thường vẫn phải chờ');
  const cloudWorld={players:{[id]:structuredClone(w.players[id])}},store=memoryStore();
  const sessions=createPlaySessions({store,world:cloudWorld});
  const admin={id:'qt-u1',playerId:id,admin:true};
  const entering=sessions.enter(admin,'tok',now+2000,{force:true});
  const [cmd]=sessions.controls(true,[],now+2000);
  assert.equal(cmd.kind,'acquire');assert.equal(cmd.force,true);
  const got=live.apply({...cmd,generation:cmd.generation+1},now+2000);// thế hệ mới hơn bản bị từ chối ở trên
  assert.equal(got.ok,true,'LIVE nhả cho quản trị');
  store.transfer({...store.get('play:'+id),generation:cmd.generation+1});
  sessions.ack({...cmd},{ok:true,player:got.player});
  assert.equal((await entering).ok,true);
  sessions.releaseFor(id,'qt-u1');
  assert.equal(store.get('play:'+id).phase,'release','trả về ngay, không giữ');
});

test('quản trị mượn rồi trả: người chơi vẫn hiện trên LIVE (không bị coi là rời sân); người chơi tự sang web thì vẫn rời sân',()=>{
  const now=Date.now(),w=liveWorld(now),live=createLiveTransfers({world:w,save:()=>{}});
  action(w,{userId:id,type:'chat',text:'xin chao'},now);
  assert.equal(currentParticipant(w,w.players[id],now+1000),true);
  const got=live.apply({generation:1,id:'adm-1',playerId:id,kind:'acquire',force:true},now+1000);assert.equal(got.ok,true);
  ingest(w,{event:'chat',data:{userId:id,nickname:'Đạo hữu',comment:'van o day'}},now+2000);// tương tác lúc đang bị mượn
  assert.equal(live.apply({generation:1,id:'adm-1',playerId:id,kind:'release',player:{...got.player,stones:(got.player.stones||0)+5}},now+3000).ok,true);
  assert.equal(currentParticipant(w,w.players[id],now+4000),true,'vẫn hiện sau khi quản trị trả');
  assert.equal(w.players[id].stones,(got.player.stones||0)+5,'giữ thay đổi của quản trị');
  // người chơi tự sang web (không force) → trả về coi như đã rời sân
  const own=live.apply({generation:2,id:'own-1',playerId:id,kind:'acquire'},now+LIVE_RECENT_MS+5000);assert.equal(own.ok,true);
  live.apply({generation:2,id:'own-1',playerId:id,kind:'release',player:own.player},now+LIVE_RECENT_MS+6000);
  assert.equal(currentParticipant(w,w.players[id],now+LIVE_RECENT_MS+7000),false);
});
