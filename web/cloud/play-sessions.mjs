import crypto from 'node:crypto';
import {digest} from './protocol.mjs';

const conflict=message=>({ok:false,code:'PLAY_SESSION_CONFLICT',message});
// idleMs: không có hoạt động web thì tự trả về LIVE. activeMs: LIVE xin lại nhân vật thì chỉ giữ ở web nếu vừa dùng web trong khoảng này (heartbeat 30 giây/lần khi đang mở trang).
export function createPlaySessions({store,world,notify=()=>{},idleMs=120000,activeMs=45000}) {
  const waiters=new Map();
  const read=id=>store.get('play:'+id);
  function release(record) {
    store.transfer({...record,phase:'release',dispatched:false,tokenHash:null,player:structuredClone(world.players[record.playerId])},world.players[record.playerId]);
    notify();
  }
  function sweep(now=Date.now()) {
    for(const r of store.transfers())if(r.phase==='web'&&now-r.lastUsed>=idleMs)release(r);
  }
  async function enter(user,token,now=Date.now()) {
    const p=world.players[user?.playerId];
    if(!p||p.webOnly)return {ok:true};
    sweep(now);
    let r=read(p.id);
    // No command has left the cloud yet: cancelling a queued return is safe.
    // This permits another web login while the LIVE machine/agent is off.
    if(r?.phase==='release'&&!r.dispatched&&r.userId===user.id){
      r={...r,phase:'web',player:undefined,lastUsed:now};store.transfer(r);
    }
    if(!r||r.phase==='live'||r.phase==='denied') {
      r={generation:(r?.generation||0)+1,id:crypto.randomUUID(),playerId:p.id,userId:user.id,phase:'acquire',lastUsed:now};store.transfer(r);
    }
    if(r.phase==='acquire') {
      // The agent relays the request. Never grant access from a stale mirror.
      await new Promise(resolve=>{
        const listeners=waiters.get(r.id)||new Set();waiters.set(r.id,listeners);
        const done=()=>{clearTimeout(timer);listeners.delete(done);if(!listeners.size)waiters.delete(r.id);resolve();};
        const timer=setTimeout(done,5000);listeners.add(done);
      });
      r=read(p.id);
    }
    if(r.phase==='denied')return conflict(r.message);
    if(r.phase!=='web')return conflict(r.phase==='release'?'Đang gửi tiến trình về LIVE. Chờ kết nối và thử lại.':'Chưa nhận xác nhận bàn giao từ máy LIVE. Kiểm tra agent rồi thử đăng nhập lại.');
    if(r.userId!==user.id || r.tokenHash&&r.tokenHash!==digest(token))return conflict('Nhân vật đang có phiên web khác. Hãy đăng xuất phiên đó hoặc chờ phiên hết hạn.');
    store.transfer({...r,tokenHash:digest(token),lastUsed:Date.now()});
    return {ok:true};
  }
  function logout(user,token) {
    const r=read(user?.playerId);
    if(r?.phase==='web'&&r.tokenHash===digest(token))release(r);
  }
  function controls(dispatch=false,wantsLive=[],now=Date.now()) {
    for(const id of wantsLive){const r=read(id);if(r?.phase==='web'&&now-r.lastUsed>=activeMs)release(r);}
    sweep(now);
    const records=store.transfers().filter(r=>['acquire','release'].includes(r.phase));
    if(dispatch)for(const r of records)if(r.phase==='release'&&!r.dispatched)store.transfer({...r,dispatched:true});
    return records.map(r=>({generation:r.generation,id:r.id,playerId:r.playerId,kind:r.phase,...(r.phase==='release'?{player:r.player}:{})}));
  }
  function ack(command,result) {
    const r=read(command.playerId);
    if(!r||r.id!==command.id)throw Error('Stale play acknowledgement');
    if(r.phase!==command.kind)return; // duplicate ACK after a response was lost
    if(command.kind==='acquire') {
      if(result.ok && result.player?.id!==r.playerId)throw Error('Player handoff mismatch');
      if(result.ok) {
        const player=structuredClone(result.player);
        world.players[r.playerId]=player;
        store.transfer({...r,phase:'web',lastUsed:Date.now()},player);
      }else store.transfer({...r,phase:'denied',message:result.message || 'Không thể rời LIVE.'});
    } else {
      if(!result.ok)throw Error(result.message || 'LIVE refused returned progress');
      store.transfer({...r,phase:'live',player:undefined,tokenHash:null});
    }
    for(const done of waiters.get(r.id)||[])done();notify();
  }
  function allowed(user,token){
    const p=world.players[user?.playerId];if(!p||p.webOnly)return true;
    const r=read(p.id);return r?.phase==='web'&&r.userId===user.id&&r.tokenHash===digest(token);
  }
  return {enter,logout,controls,ack,sweep,allowed};
}
