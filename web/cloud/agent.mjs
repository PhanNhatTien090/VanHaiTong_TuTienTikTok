import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { WebSocket } from 'ws';
import { parseLinkComment } from '../accounts.mjs';
import { SCHEMA_VERSION, digest, projectWorld, signature, validId } from './protocol.mjs';

export function createSyncAgent(config) {
  const remote=new URL(config.url),source=new URL(config.sourceUrl || 'http://127.0.0.1:4317/api/export?world=live');
  const loopback=host=>['127.0.0.1','localhost','[::1]'].includes(host);
  if(remote.protocol!=='https:' && !(config.allowHttpLoopback && loopback(remote.hostname)))throw Error('Cloud URL must use HTTPS');
  if(!loopback(source.hostname))throw Error('Source export must stay on the LIVE machine loopback');
  if(typeof config.secret!=='string' || config.secret.length<48 || !path.isAbsolute(config.dataDir))throw Error('Invalid private agent config');
  fs.mkdirSync(config.dataDir,{recursive:true,mode:0o700});
  const file=path.join(config.dataDir,'checkpoint.json');
  let state=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{agentId:crypto.randomUUID(),seq:0,hashes:{},fullAt:0,links:[]};
  let stopped=false,timer=null,bridge=null,busy=false,failures=0,wantsLive=[];
  function save(){const tmp=file+'.tmp';fs.writeFileSync(tmp,JSON.stringify(state),{mode:0o600});fs.renameSync(tmp,file);}
  save();
  async function post(route,data){
    const body=zlib.gzipSync(Buffer.from(JSON.stringify(data))),at=String(Date.now()),url=new URL(route,remote);
    const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Content-Encoding':'gzip','X-VH-Time':at,'X-VH-Signature':signature(config.secret,'POST',url.pathname,at,body)},body,signal:AbortSignal.timeout(20000)});
    const result=await res.json();if(!res.ok)throw Error(`Cloud ${res.status}: ${result.message || 'request failed'}`);return result;
  }
  async function flushPending(){
    if(!state.pending)return;
    const result=await post('/internal/sync',state.pending.batch);
    if(!result.ok || result.seq!==state.pending.batch.seq)throw Error('Cloud acknowledgement mismatch');
    state.playSessions=result.playSessions===true;state.seq=state.pending.batch.seq;state.hashes=state.pending.hashes;state.fullAt=state.pending.fullAt;delete state.pending;save();
  }
  async function controls(){
    if(!state.playSessions)return;
    const response=await post('/internal/play/control',{agentId:state.agentId,wantsLive});
    for(const command of response.commands||[]){
      const raw=Buffer.from(JSON.stringify(command)),at=String(Date.now()),url=new URL('/internal/play-transfer',source);
      const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','X-VH-Time':at,'X-VH-Signature':signature(config.secret,'POST',url.pathname,at,raw)},body:raw,signal:AbortSignal.timeout(10000)});
      if(!res.ok)throw Error('Local play transfer failed: '+res.status);
      const result=await res.json();
      await post('/internal/play/ack',{agentId:state.agentId,command:{id:command.id,playerId:command.playerId,kind:command.kind},result});
    }
  }
  async function once(){
    if(busy)return;busy=true;
    try {
      await flushPending();
      await controls();
      const response=await fetch(source,{signal:AbortSignal.timeout(10000)});if(!response.ok)throw Error('Local LIVE export unavailable');
      const raw=await response.json();if(raw.mode!=='live')throw Error('Refusing to synchronize a non-LIVE world');
      wantsLive=Object.entries(raw.playTransfers||{}).filter(([,l])=>l?.phase==='web'&&Date.now()-(Number(l.wantsLiveAt)||0)<120000).map(([id])=>id).slice(0,500);
      const {players,meta}=projectWorld(raw),hashes=Object.fromEntries(players.map(p=>[p.id,digest(p)]));
      const deleted=Object.keys(state.hashes).filter(id=>!Object.hasOwn(hashes,id));
      if(deleted.length>Math.max(100,Object.keys(state.hashes).length*.2) && !config.allowLargeDeletion)throw Error('Large deletion blocked; verify the source world before allowing it');
      const full=!state.seq || Date.now()-state.fullAt>5*60000;
      const batch={schema:SCHEMA_VERSION,agentId:state.agentId,id:crypto.randomUUID(),seq:state.seq+1,sourceAt:Date.now(),full,players:full?players:players.filter(p=>state.hashes[p.id]!==hashes[p.id]),deleted,meta};
      state.pending={batch,hashes,fullAt:full?Date.now():state.fullAt};save();await flushPending();
      for(const link of [...state.links]){
        if(Date.now()-link.at<10*60000)await post('/internal/link',link);
        state.links=state.links.filter(x=>x.eventId!==link.eventId);save();
      }
      failures=0;return {seq:state.seq,profiles:players.length,changed:batch.players.length,full};
    }finally{busy=false;}
  }
  function observe(event){
    if(event.event!=='chat')return;
    const d=event.data || {},u=d.user || d,code=parseLinkComment(d.comment),userId=String(u.userId || u.id || d.userId || '');
    if(!code || !validId(userId))return;
    const eventId=digest(`${state.agentId}:${userId}:${code}`);
    if(state.links.some(x=>x.eventId===eventId))return;
    state.links=state.links.filter(x=>Date.now()-x.at<10*60000);
    if(state.links.length>=256)throw Error('Link queue is full');
    state.links.push({eventId,code,userId,name:String(u.nickname || d.nickname || '').slice(0,100),at:Date.now()});save();
  }
  function connect(){
    if(stopped || config.tikfinity===false)return;
    const url=new URL(config.bridgeUrl || 'ws://127.0.0.1:21213/');if(!loopback(url.hostname))throw Error('TikFinity bridge must stay on loopback');
    bridge=new WebSocket(url);
    bridge.on('message',raw=>{try{observe(JSON.parse(raw.toString()));}catch(e){console.error('[agent] Link queue:',e.message);}});
    bridge.on('error',()=>{});bridge.on('close',()=>{if(!stopped)setTimeout(connect,5000).unref();});
  }
  let nextSnapshot=0;
  async function cycle(){
    if(stopped)return;
    try{if(Date.now()>=nextSnapshot){const r=await once();nextSnapshot=Date.now()+10000;if(r?.full)console.log(`[agent] Synchronized ${r.profiles} profiles; sequence ${r.seq}`);}else await controls();failures=0;}
    catch(e){failures++;console.error('[agent]',e.message);}
    if(!stopped)timer=setTimeout(cycle,Math.min(60000,(state.playSessions?1000:10000)*2**Math.min(failures,6)) + Math.floor(Math.random()*1000));
  }
  return {once,observe,start(){connect();cycle();},stop(){stopped=true;clearTimeout(timer);bridge?.close();},get state(){return structuredClone(state);}};
}

if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  process.umask(0o077);
  const configFile=process.argv[process.argv.indexOf('--config')+1];
  if(!process.argv.includes('--config') || !configFile)throw Error('Use --config <private JSON file>');
  const agent=createSyncAgent(JSON.parse(fs.readFileSync(configFile,'utf8')));
  if(process.argv.includes('--once'))console.log(JSON.stringify(await agent.once()));else agent.start();
  for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>{agent.stop();process.exit(0);});
}
