import {createErrorLog} from '../error-log.mjs';
import {createPlaySessions} from './play-sessions.mjs';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { createAccountStore } from '../accounts.mjs';
import { createWebApp } from '../app.mjs';
import { snapshot } from '../../engine.mjs';
import { authenticate } from './protocol.mjs';
import { openCloudStore } from './store.mjs';

export function createCloudServer({ dataDir, secret, secureCookie = true, trustProxy = true, gameplay = false, errorLog = createErrorLog(dataDir) }) {
  if (typeof secret !== 'string' || secret.length < 48) throw Error('WEB_SYNC_SECRET must contain at least 48 characters');
  const store = openCloudStore(dataDir), world = store.loadWorld();
  const accounts = createAccountStore(null,{read:()=>store.get('accounts') || {},write:data=>store.saveLocal(world,data)});
  let sync = store.get('sync'), version = sync?.seq || 0, app;
  const clients = new Map();
  const status = () => ({ cloud:true,stream:true,readOnly:!gameplay,ready:!!sync,profiles:sync?.profiles || 0,lastSyncAt:sync?.receivedAt || null,liveConnected:!!sync && Date.now()-sync.receivedAt<60000 && world.liveSession?.active===true,revision:version });
  const writeJson = (res,code,data) => {res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
  function notify() {
    version++;
    for (const [res,user] of clients) {
      const token = res.vhToken;
      if (!accounts.userForSession(token) || res.writableLength > 65536) {res.end();clients.delete(res);continue;}
      res.write(`id: ${version}\nevent: change\ndata: ${JSON.stringify({revision:version,lastSyncAt:sync?.receivedAt || null})}\n\n`);
    }
  }
  const playSessions=gameplay?createPlaySessions({store,world,notify}):null;
  const updates = {subscribe(req,res,user) {
    if (clients.size>=100 || [...clients.values()].filter(u=>u.id===user.id).length>=5) return writeJson(res,429,{ok:false,message:'Đã mở quá nhiều cửa sổ.'});
    res.writeHead(200,{'Content-Type':'text/event-stream; charset=utf-8','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','X-Accel-Buffering':'no'});
    res.vhToken = String(req.headers.cookie || '').split(';').map(s=>s.trim()).find(s=>s.startsWith('vh_session='))?.slice(11);
    res.write(`retry: 5000\nevent: change\ndata: ${JSON.stringify({revision:version,lastSyncAt:sync?.receivedAt || null})}\n\n`);
    clients.set(res,user);req.on('close',()=>clients.delete(res));
  }};
  async function handleInternal(req,res,url) {
    if (req.method!=='POST' || !['/internal/sync','/internal/link','/internal/play/control','/internal/play/ack'].includes(url.pathname)) return writeJson(res,404,{ok:false});
    const chunks=[];let length=0;
    for await (const chunk of req) {length+=chunk.length;if(length>4*1024*1024)return writeJson(res,413,{ok:false});chunks.push(chunk);}
    const raw=Buffer.concat(chunks);
    if (!authenticate(req,url.pathname,raw,secret)) return writeJson(res,401,{ok:false});
    try {
      const decoded=req.headers['content-encoding']==='gzip'?zlib.gunzipSync(raw,{maxOutputLength:24*1024*1024}):raw;
      const body=JSON.parse(decoded.toString('utf8'));
      if(url.pathname.startsWith('/internal/play/')){
        if(!playSessions)return writeJson(res,404,{ok:false});
        if(body.agentId!==store.get('sync')?.agentId)return writeJson(res,409,{ok:false,message:'Agent not paired'});
        if(url.pathname.endsWith('/ack')){playSessions.ack(body.command,body.result);return writeJson(res,200,{ok:true});}
        return writeJson(res,200,{ok:true,commands:playSessions.controls(true,Array.isArray(body.wantsLive)?body.wantsLive.filter(id=>typeof id==='string').slice(0,500):[])});
      }
      if(url.pathname==='/internal/link') {
        if(!body.eventId || typeof body.eventId!=='string' || body.eventId.length>128)return writeJson(res,400,{ok:false});
        const saved=store.get('link:'+body.eventId);if(saved)return writeJson(res,200,saved);
        if(!Number.isFinite(body.at) || Math.abs(Date.now()-body.at)>10*60000)return writeJson(res,400,{ok:false,message:'Bình luận liên kết đã quá hạn.'});
        const result=store.withLinkEvent(body,()=>app.completeLink(body.code,{userId:body.userId,name:String(body.name || '').slice(0,100)},Date.now()));
        if(result.ok)notify();
        return writeJson(res,200,result);
      }
      if(!store.get('accounts'))return writeJson(res,503,{ok:false,message:'Initialize account store before syncing'});
      const result=store.apply(body);
      if(!result.duplicate){const fresh=store.loadWorld();for(const key of Object.keys(world))delete world[key];Object.assign(world,fresh);sync=result;app.invalidate();if(result.changed)notify();}
      return writeJson(res,200,{ok:true,seq:result.seq,duplicate:!!result.duplicate,playSessions:gameplay});
    } catch(e) {errorLog.record('sync',{message:e.message});return writeJson(res,409,{ok:false,message:e.message});}
  }
  app=createWebApp({world,dataDir,accountStore:accounts,profileOnly:!gameplay,playSessions,publicOnly:true,devTools:false,tikfinity:false,secureCookie,trustProxy,handleInternal,errorLog,updates,siteStatus:status,onChange:notify,markDirty:()=>store.saveLocal(world),limits:{requestsPerIp:1800,authPerIp:60},liveState:()=>status().liveConnected?snapshot(structuredClone(world)):{players:[],feed:[],events:[],boss:null}});
  // Prevent public registration before private migration; import via CLI while stopped.
  if(!store.get('accounts'))store.put('accounts',{users:{},sessions:{},links:{},nextId:1});
  const heartbeat=setInterval(()=>{for(const [res] of clients){if(!accounts.userForSession(res.vhToken)||res.writableLength>65536){res.end();clients.delete(res);}else res.write(': heartbeat\n\n');}},20000);heartbeat.unref();
  const saver=setInterval(()=>accounts.save(),3000);saver.unref();
  const backupTimer=setInterval(()=>{try{accounts.save();store.backup();}catch(e){console.error('[cloud] Backup failed:',e.message);errorLog.record('backup',{message:e.message});}},30*60000);backupTimer.unref();
  return { ...app,store,world,status,notify,playSessions,async close(){clearInterval(heartbeat);clearInterval(saver);clearInterval(backupTimer);for(const [res]of clients)res.end();accounts.save();await new Promise(resolve=>app.server.close(resolve));store.close();} };
}

const direct=process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url);
if(direct){
  process.umask(0o077);
  const dataDir=process.env.WEB_CLOUD_DATA_DIR;
  if(!dataDir || !path.isAbsolute(dataDir))throw Error('Set WEB_CLOUD_DATA_DIR to an absolute persistent directory');
  const errorLog=createErrorLog(dataDir);errorLog.installProcessHooks('cloud');
  const cloud=createCloudServer({dataDir,secret:process.env.WEB_SYNC_SECRET,gameplay:process.env.WEB_CLOUD_GAMEPLAY==='1',errorLog});
  cloud.server.listen(Number(process.env.WEB_PORT || 4320),'127.0.0.1',()=>console.log('[cloud] Player web ready on loopback; gameplay '+(process.env.WEB_CLOUD_GAMEPLAY==='1'?'exclusive sessions':'locked')));
  cloud.server.on('error',async e=>{console.error(e.message);await cloud.close();process.exitCode=1;});
  for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>cloud.close().then(()=>process.exit(0)));
}
