import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {signature} from '../cloud/protocol.mjs';
import {createWorld,ensurePlayer,action,ingest,tick,currentParticipant} from '../../engine.mjs';
import {createLiveTransfers} from '../cloud/live-transfers.mjs';
import {createCloudServer} from '../cloud/server.mjs';
import {createSyncAgent} from '../cloud/agent.mjs';
import {authenticate,projectWorld} from '../cloud/protocol.mjs';
const secret='s'.repeat(64),id='9007199254740993';
const dir=()=>fs.mkdtempSync(path.join(os.tmpdir(),'vh-play-'));
const listen=s=>new Promise((resolve,reject)=>{s.once('error',reject);s.listen(0,'127.0.0.1',()=>resolve('http://127.0.0.1:'+s.address().port));});
const close=s=>new Promise(r=>s.close(r));
function world(){const w=createWorld('live');ensurePlayer(w,id,'Đạo hữu',Date.now());w.liveSession={active:true,startedAt:Date.now()-1000};return w;}
function client(base){let cookie='';return {get cookie(){return cookie;},set cookie(v){cookie=v;},async api(route,body){const r=await fetch(base()+route,{method:body===undefined?'GET':'POST',headers:{cookie,...(body===undefined?{}:{'Content-Type':'application/json'})},body:body===undefined?undefined:JSON.stringify(body)});if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];return {status:r.status,body:await r.json()};}};}
const acquire=(generation=1)=>({generation,id:'transfer-'+generation,playerId:id,kind:'acquire'});

test('exclusive LIVE lock: explicit exit, durable lock, automatic rewards, queued gifts, fencing and idempotent return',()=>{
 const w=world();let disk;const live=createLiveTransfers({world:w,save:()=>{disk=structuredClone(w);}});
 assert.equal(live.apply(acquire()).ok,false,'active LIVE player cannot log in');
 assert.equal(action(w,{userId:id,type:'chat',text:'roilive'}).leftLive,true);
 const cmd=acquire(2),result=live.apply(cmd);assert.equal(result.ok,true);assert.equal(disk.playTransfers[id].phase,'web');
 assert.equal(currentParticipant(w,w.players[id]),false);
 const before=structuredClone(w.players[id]);
 assert.equal(action(w,{userId:id,type:'cultivate'}).code,'PLAYING_WEB');
 tick(w,Date.now()+60000);assert.deepEqual(w.players[id],before);
 const gift={event:'gift',data:{userId:id,nickname:'Đạo hữu',diamondCount:1,giftId:5655,msgId:'gift-web-session',repeatCount:1,giftType:0}};
 assert.equal(ingest(w,gift).queuedGift,true);assert.equal(ingest(w,gift).queuedGift,true);assert.equal(w.playTransfers[id].gifts.length,1);
 assert.equal(w.players[id].giftCoins,before.giftCoins);
 const returned={...before,totalQi:before.totalQi+123,qi:before.qi+123};
 live.apply({...cmd,kind:'release',player:returned});
 assert.equal(w.players[id].giftCoins,1);assert.ok(w.players[id].totalQi>=returned.totalQi);
 const after=structuredClone(w.players[id]);
 live.apply({...cmd,kind:'release',player:before});assert.deepEqual(w.players[id],after,'lost ACK never reapplies old state or gift');
 assert.equal(live.apply(cmd).ok,false,'closed transfer cannot reacquire');
 assert.equal(live.apply(acquire(3)).ok,true);
 assert.throws(()=>live.apply(cmd),/Stale/);
 assert.throws(()=>live.apply({...cmd,kind:'release',player:before}),/Stale/);
});

test('failed disk write rolls back the LIVE lock and returned progress',()=>{
 const w=world();action(w,{userId:id,type:'chat',text:'roilive'});let fail=true;
 const live=createLiveTransfers({world:w,save:()=>{if(fail)throw Error('disk full');}});
 assert.throws(()=>live.apply(acquire()),/disk full/);assert.equal(w.playTransfers[id],undefined);
 fail=false;const r=live.apply(acquire());fail=true;
 assert.throws(()=>live.apply({...acquire(),kind:'release',player:{...r.player,totalQi:9999}}),/disk full/);
 assert.equal(w.playTransfers[id].phase,'web');assert.notEqual(w.players[id].totalQi,9999);
});

test('cloud + agent: login excludes LIVE, stale mirrors cannot overwrite web, restart and lost return ACK are safe',async()=>{
 const data=dir(),agentData=dir();let w=world(),saved;
 let live=createLiveTransfers({world:w,save:()=>{saved=structuredClone(w);}}),loseReturn=false;
 const source=http.createServer(async(req,res)=>{
  if(req.url==='/internal/play-transfer'){
   const chunks=[];for await(const chunk of req)chunks.push(chunk);const raw=Buffer.concat(chunks);
   if(!authenticate(req,'/internal/play-transfer',raw,secret)){res.writeHead(401);res.end('{}');return;}
   try{const command=JSON.parse(raw);const result=live.apply(command);if(loseReturn&&command.kind==='release'){loseReturn=false;res.destroy();return;}res.end(JSON.stringify(result));}
   catch(e){res.writeHead(409);res.end(JSON.stringify({message:e.message}));}return;
  }res.end(JSON.stringify(w));
 });
 let cloud=createCloudServer({dataDir:data,secret,secureCookie:false,gameplay:true});let base=await listen(cloud.server);
 const local=await listen(source),config={url:base,secret,dataDir:agentData,sourceUrl:local+'/api/export?world=live',allowHttpLoopback:true,tikfinity:false};
 let agent=createSyncAgent(config),api=client(()=>base);
 async function loginWithRelay(){
  const pending=api.api('/api/login',{username:'playerone',password:'test-password'});
  for(let i=0;i<100&&!cloud.playSessions.controls().some(c=>c.kind==='acquire');i++)await new Promise(r=>setTimeout(r,10));
  await agent.once();return pending;
 }
 try{
  const user=cloud.accounts.register('playerone','test-password').user;cloud.accounts.setPlayer(user,id);cloud.accounts.save();await agent.once();
  let r=await loginWithRelay();assert.equal(r.status,409);assert.match(r.body.message,/roilive/);
  action(w,{userId:id,type:'chat',text:'roilive'});
  r=await loginWithRelay();assert.equal(r.status,200);assert.equal((await api.api('/api/site-status')).body.readOnly,false);
  assert.equal((await api.api('/api/act',{type:'cultivate'})).body.ok,true);
  const earned=cloud.world.players[id].totalQi;assert.ok(earned>0);assert.equal(w.players[id].totalQi,0);
  assert.equal(action(w,{userId:id,type:'cultivate'}).code,'PLAYING_WEB');
  // A full snapshot (including deletion) received late must preserve cloud-owned progress.
  const state=agent.state;cloud.store.apply({schema:1,agentId:state.agentId,id:'late-full',seq:state.seq+1,sourceAt:Date.now(),full:true,...projectWorld(w),players:[],deleted:[id]});
  assert.equal(cloud.store.loadWorld().players[id].totalQi,earned);
  // Recreate the agent checkpoint sequence after the direct stale-batch fixture.
  const checkpoint=path.join(agentData,'checkpoint.json'),cp=JSON.parse(fs.readFileSync(checkpoint));cp.seq++;fs.writeFileSync(checkpoint,JSON.stringify(cp));
  const cookie=api.cookie;await cloud.close();cloud=createCloudServer({dataDir:data,secret,secureCookie:false,gameplay:true});base=await listen(cloud.server);config.url=base;agent=createSyncAgent(config);
  api=client(()=>base);api.cookie=cookie;assert.equal((await api.api('/api/me')).body.player.totalQi,earned);
  w=saved;live=createLiveTransfers({world:w,save:()=>{saved=structuredClone(w);}});
  assert.equal(action(w,{userId:id,type:'cultivate'}).code,'PLAYING_WEB','local restart retains lock');
  const other=client(()=>base);assert.equal((await other.api('/api/login',{username:'playerone',password:'test-password'})).status,409);
  assert.equal((await api.api('/api/logout',{})).status,200);
  // With the agent off, a queued return has not reached LIVE; web can resume.
  assert.equal((await api.api('/api/login',{username:'playerone',password:'test-password'})).status,200);
  assert.equal((await api.api('/api/me')).body.player.totalQi,earned);
  assert.equal((await api.api('/api/logout',{})).status,200);loseReturn=true;
  await assert.rejects(()=>agent.once());assert.equal(w.players[id].totalQi,earned);
  // LIVE may continue after committing return, even when cloud has not seen its ACK.
  assert.equal(action(w,{userId:id,type:'cultivate'},Date.now()+20000).ok,true);
  const latest=w.players[id].totalQi;assert.ok(latest>earned);
  await agent.once();assert.equal(w.players[id].totalQi,latest);assert.equal(cloud.world.players[id].totalQi,latest);
 }finally{await cloud.close();await close(source);fs.rmSync(data,{recursive:true,force:true});fs.rmSync(agentData,{recursive:true,force:true});}
});

test('idle web session freezes before return; dispatched return cannot be cancelled by an old cookie',async()=>{
 const data=dir();const cloud=createCloudServer({dataDir:data,secret,secureCookie:false,gameplay:true}),base=await listen(cloud.server);
 try{
  const w=world();w.players[id].lastActive=0;cloud.world.players[id]=w.players[id];
  const user=cloud.accounts.register('idleplayer','test-password').user;cloud.accounts.setPlayer(user,id);const token=cloud.accounts.createSession(user);cloud.accounts.save();
  cloud.store.transfer({id:'idle-transfer',generation:1,playerId:id,userId:user.id,phase:'web',lastUsed:Date.now()},w.players[id]);
  const api=client(()=>base);api.cookie='vh_session='+token;
  assert.equal((await api.api('/api/play/heartbeat',{})).status,200);
  const record=cloud.store.get('play:'+id);assert.ok(record.tokenHash);
  cloud.store.transfer({...record,lastUsed:Date.now()-120001});
  const controls=cloud.playSessions.controls(true);assert.equal(controls[0].kind,'release');
  const before=cloud.world.players[id].totalQi;
  const blocked=await api.api('/api/act',{type:'cultivate'});assert.equal(blocked.status,409);assert.equal(cloud.world.players[id].totalQi,before);
  assert.equal((await api.api('/api/login',{username:'idleplayer',password:'test-password'})).status,409);
  cloud.playSessions.ack(controls[0],{ok:true});
  assert.equal(cloud.store.get('play:'+id).phase,'live');
 }finally{await cloud.close();fs.rmSync(data,{recursive:true,force:true});}
});


test('actual LIVE server requires signed transfers and persists locks across restart',async()=>{
 const data=dir(),w=world();action(w,{userId:id,type:'chat',text:'roilive'});fs.writeFileSync(path.join(data,'live.json'),JSON.stringify(w));
 let child;
 async function launch(){
  child=spawn(process.execPath,['server.mjs'],{cwd:new URL('../..',import.meta.url),env:{...process.env,PORT:'0',VAN_HAI_DATA_DIR:data,VAN_HAI_WEB:'0',WEB_SYNC_SECRET:secret},stdio:['ignore','pipe','pipe']});
  let output='';return await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(Error('LIVE startup timed out: '+output)),10000);
   child.once('exit',code=>{clearTimeout(timer);reject(Error('LIVE exited '+code+': '+output));});
   child.stderr.on('data',chunk=>{output+=chunk;});
   child.stdout.on('data',chunk=>{output+=chunk;const match=output.match(/http:\/\/127\.0\.0\.1:\d+/);if(match){clearTimeout(timer);resolve(match[0]);}});
  });
 }
 async function stop(){const exited=once(child,'exit');child.kill();await exited;}
 async function send(base,command,signed=true){const raw=Buffer.from(JSON.stringify(command)),at=String(Date.now());const response=await fetch(base+'/internal/play-transfer',{method:'POST',headers:{'Content-Type':'application/json',...(signed?{'X-VH-Time':at,'X-VH-Signature':signature(secret,'POST','/internal/play-transfer',at,raw)}:{})},body:raw});return {status:response.status,body:await response.json()};}
 try{
  let base=await launch();assert.equal((await send(base,acquire(),false)).status,401);
  const result=await send(base,acquire());assert.equal(result.body.ok,true);
  assert.equal(JSON.parse(fs.readFileSync(path.join(data,'live.json'))).playTransfers[id].phase,'web');
  await stop();base=await launch();
  const retry=await send(base,acquire());assert.deepEqual(retry.body.player,result.body.player);
  const player={...result.body.player,totalQi:321,qi:321};assert.equal((await send(base,{...acquire(),kind:'release',player})).body.ok,true);
  const exported=await(await fetch(base+'/api/export?world=live')).json();assert.equal(exported.players[id].totalQi,321);
 }finally{if(child&&child.exitCode===null)await stop();fs.rmSync(data,{recursive:true,force:true});}
});
