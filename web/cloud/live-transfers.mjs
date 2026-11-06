import {currentParticipant, ingest} from '../../engine.mjs';
import {validId} from './protocol.mjs';

// The durable lock lives in live.json, alongside the player. It never expires
// locally: timeout is not evidence that the cloud has stopped accepting writes.
export function createLiveTransfers({world, save}) {
  world.playTransfers ??= {};
  function apply(command,now=Date.now()){
    const before=structuredClone(world);
    try{return execute(command,now);}catch(error){for(const key of Object.keys(world))delete world[key];Object.assign(world,before);throw error;}
  }
  function execute(command, now) {
    const {id,playerId,kind,generation}=command || {};
    if(!Number.isSafeInteger(generation)||generation<1||!validId(id)||!validId(playerId)||!['acquire','release'].includes(kind))throw Error('Invalid play transfer');
    const old=world.playTransfers[playerId];
    if(old&&generation<old.generation || old&&generation===old.generation&&old.id!==id)throw Error('Stale play transfer generation');
    if(kind==='acquire') {
      if(old?.id===id) {
        if(old.phase==='web')return {ok:true,id,player:old.player};
        return {ok:false,id,message:old.message || 'Bàn giao này đã kết thúc.'};
      }
      if(old?.phase==='web')return {ok:false,id,message:'Nhân vật đang có một phiên web khác.'};
      const p=world.players[playerId];
      let message;
      if(!p||p.resident||p.puppet)message='Không tìm thấy nhân vật hợp lệ trên LIVE.';
      else if(currentParticipant(world,p,now))message='Nhân vật đang ở LIVE. Gõ roilive trong bình luận LIVE rồi đăng nhập lại.';
      if(message){world.playTransfers[playerId]={id,generation,phase:'denied',message};save();return {ok:false,id,message};}
      world.playTransfers[playerId]={id,generation,phase:'web',player:structuredClone(p),gifts:[]};
      save(); // Do not acknowledge ownership before its lock reaches disk.
      return {ok:true,id,player:structuredClone(p)};
    }
    if(old?.id!==id)throw Error('Play transfer fencing mismatch');
    if(old.phase==='live')return {ok:true,id}; // ACK loss/retry must never reapply old progress.
    if(old.phase!=='web'||command.player?.id!==playerId)throw Error('Invalid player return');
    const p=structuredClone(command.player);
    p.lastActive=0;p.leftLiveAt=now;delete p.lastAutoArrivalAt;
    world.players[playerId]=p;
    const gifts=old.gifts || [];
    world.playTransfers[playerId]={id,generation,phase:'live'};
    for(const gift of gifts)ingest(world,gift,now);
    // Buffered gifts grant their rewards, but do not put an absent player on stage.
    p.lastActive=0;p.leftLiveAt=now;
    save();
    return {ok:true,id};
  }
  return {apply};
}
