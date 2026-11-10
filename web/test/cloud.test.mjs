import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import http from 'node:http';
import {createWorld,ensurePlayer} from '../../engine.mjs';
import {createAccountStore} from '../accounts.mjs';
import {createCloudServer} from '../cloud/server.mjs';
import {openCloudStore} from '../cloud/store.mjs';
import {projectWorld,signature} from '../cloud/protocol.mjs';
import {createSyncAgent} from '../cloud/agent.mjs';

const secret=crypto.randomBytes(32).toString('hex');
const dir=()=>fs.mkdtempSync(path.join(os.tmpdir(),'vh-cloud-'));
const listen=server=>new Promise(resolve=>server.listen(0,'127.0.0.1',()=>resolve('http://127.0.0.1:'+server.address().port)));
function client(base){let cookie='';return async(route,body)=>{const r=await fetch(base+route,{method:body===undefined?'GET':'POST',headers:{cookie,...(body===undefined?{}:{'Content-Type':'application/json'})},body:body===undefined?undefined:JSON.stringify(body)});if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];return {status:r.status,body:await r.json()};};}
async function signed(base,route,body,signingSecret=secret){const raw=zlib.gzipSync(JSON.stringify(body)),at=String(Date.now());const r=await fetch(base+route,{method:'POST',headers:{'Content-Type':'application/json','Content-Encoding':'gzip','x-vh-time':at,'x-vh-signature':signature(signingSecret,'POST',route,at,raw)},body:raw});return {status:r.status,body:await r.json()};}
function fixture(){const w=createWorld('live');ensurePlayer(w,'9007199254740993','Đạo hữu thử',Date.now());ensurePlayer(w,'9007199254740994','Đạo lữ thử',Date.now());w.liveSession={active:true,startedAt:Date.now()};return w;}

test('cloud: signed sync is atomic, ordered, idempotent, preserves text IDs and blocks public admin/gameplay',async()=>{
 const data=dir(),cloud=createCloudServer({dataDir:data,secret,secureCookie:false}),base=await listen(cloud.server);
 try{
  const w=fixture(),projection=projectWorld(w),batch={schema:1,agentId:'test-agent',id:'first',seq:1,sourceAt:Date.now(),full:true,...projection,deleted:[]};
  assert.equal((await signed(base,'/internal/sync',batch,'x'.repeat(64))).status,401);
  assert.equal((await signed(base,'/internal/sync',batch)).body.ok,true);
  assert.equal((await signed(base,'/internal/sync',batch)).body.duplicate,true);
  assert.equal((await signed(base,'/internal/sync',{...batch,id:'gap',seq:3})).status,409);
  assert.equal((await signed(base,'/internal/sync',{...batch,players:[]})).status,409);
  const profile=await(await fetch(base+'/api/profile?id=9007199254740993')).json();assert.equal(profile.profile.id,'9007199254740993');
  for(const route of ['/admin/players','/admin.html','/dev/players'])assert.equal((await fetch(base+route)).status,403,route);
  assert.equal((await fetch(base+'/data/web.sqlite')).status,404);
  const api=client(base);assert.equal((await api('/api/session')).body.user,null);
  await api('/api/register',{username:'clouduser',password:'test-password'});const code=(await api('/api/link/start',{})).body.code;
  assert.equal((await signed(base,'/internal/link',{eventId:'comment-1',code,userId:'9007199254740993',name:'Đạo hữu thử',at:Date.now()})).body.ok,true);
  assert.equal((await signed(base,'/internal/link',{eventId:'comment-1',code,userId:'9007199254740993',at:0})).body.ok,true);
  assert.equal((await api('/api/me')).body.player.id,'9007199254740993');
  // Quản trị: chỉ cấp qua kênh ký; sau đó tài khoản đó mở được trang quản trị + xem hồ sơ (chỉ xem).
  assert.equal((await signed(base,'/internal/admin',{username:'clouduser',grant:true},'x'.repeat(64))).status,401);
  assert.equal((await signed(base,'/internal/admin',{username:'nobody',grant:true})).status,404);
  assert.equal((await signed(base,'/internal/admin',{username:'clouduser'})).body.admin,false);
  assert.equal((await signed(base,'/internal/admin',{username:'clouduser',grant:true})).body.admin,true);
  assert.equal((await api('/admin/players')).body.some(p=>p.id==='9007199254740994'),true);
  assert.equal((await api('/api/session')).body.admin,true);
  assert.equal((await api('/api/quan-tri/players')).status,200);
  assert.equal((await fetch(base+'/quan-tri.html')).status,403);
  assert.equal((await signed(base,'/internal/admin',{username:'clouduser',grant:false})).body.admin,false);
  assert.equal((await api('/admin/players')).status,403);
  const before=JSON.stringify(cloud.world);
  for(const route of ['/api/act','/api/retreat/start','/api/gift/claim','/api/dungeon/start'])assert.equal((await api(route,{})).status,403);
  assert.equal(JSON.stringify(cloud.world),before);
  const b=client(base);await b('/api/register',{username:'seconduser',password:'test-password'});const code2=(await b('/api/link/start',{})).body.code;
  assert.equal((await signed(base,'/internal/link',{eventId:'comment-2',code:code2,userId:'9007199254740993',at:Date.now()})).body.ok,false);
  assert.equal((await api('/api/me')).body.player.id,'9007199254740993');
  const meBefore=(await api('/api/me')).body.player;
  w.players['9007199254740993'].totalQi+=100;
  const p2=projectWorld(w),next={...batch,...p2,id:'second',seq:2,full:false};await signed(base,'/internal/sync',next);
  assert.equal((await api('/api/me')).body.player.totalQi,meBefore.totalQi+100);
 }finally{await cloud.close();fs.rmSync(data,{recursive:true,force:true});}
});

test('cloud: account import keeps legacy password, ownership, web-only characters and survives restart/backup',async()=>{
 const data=dir(),w=fixture(),legacy=createAccountStore(null),user=legacy.register('olduser','unchanged-password').user;legacy.setPlayer(user,'9007199254740993');
 const persisted={users:{olduser:user},sessions:{},links:{},nextId:2};
 let store=openCloudStore(data);store.importAccounts(persisted,w);store.close();
 let cloud=createCloudServer({dataDir:data,secret,secureCookie:false}),base=await listen(cloud.server);
 try{
  const projection=projectWorld(w);await signed(base,'/internal/sync',{schema:1,agentId:'agent',id:'initial',seq:1,sourceAt:Date.now(),full:true,...projection,deleted:[]});
  const api=client(base);assert.equal((await api('/api/login',{username:'olduser',password:'unchanged-password'})).status,200);
  const other=client(base);await other('/api/register',{username:'webonly',password:'web-password'});const created=await other('/api/character',{name:'Tu sĩ web',gender:'nam'});assert.equal(created.body.player.id,'web-u2');
  await signed(base,'/internal/sync',{schema:1,agentId:'agent',id:'fullagain',seq:2,sourceAt:Date.now(),full:true,...projection,deleted:[]});
  assert.equal((await other('/api/me')).body.player.id,'web-u2');
  const file=cloud.store.backup();assert.ok(fs.statSync(file).size>0);
 }finally{await cloud.close();}
 cloud=createCloudServer({dataDir:data,secret,secureCookie:false});base=await listen(cloud.server);
 try{const api=client(base);assert.equal((await api('/api/login',{username:'olduser',password:'unchanged-password'})).body.player.id,'9007199254740993');assert.equal(cloud.store.get('accounts').users.olduser.hash,user.hash);}
 finally{await cloud.close();fs.rmSync(data,{recursive:true,force:true});}
});

test('agent: bootstrap and restart resume, update deltas, keep LIVE immutable and forward verified comment IDs',async()=>{
 const data=dir(),agentData=dir(),w=fixture(),cloud=createCloudServer({dataDir:data,secret,secureCookie:false}),remote=await listen(cloud.server);
 const source=http.createServer((req,res)=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(w));}),local=await listen(source);
 const config={url:remote,secret,dataDir:agentData,sourceUrl:local+'/api/export?world=live',allowHttpLoopback:true,tikfinity:false};
 try{
  let agent=createSyncAgent(config);const before=JSON.stringify(w);assert.equal((await agent.once()).profiles,2);assert.equal(JSON.stringify(w),before);
  const api=client(remote);await api('/api/register',{username:'linked',password:'test-password'});const code=(await api('/api/link/start',{})).body.code;
  agent.observe({event:'chat',data:{comment:'lienket '+code,user:{userId:'9007199254740993',nickname:'Đạo hữu thử'}}});
  agent=createSyncAgent(config);w.players['9007199254740993'].totalQi=888;
  assert.equal((await agent.once()).changed,1);assert.equal((await api('/api/me')).body.player.totalQi,888);
  assert.equal(agent.state.links.length,0);
  const stateBefore=JSON.stringify(agent.state);await assert.rejects(async()=>{const bad=createSyncAgent({...config,secret:'wrong'.repeat(16)});await bad.once();});
  assert.equal((await api('/api/me')).body.player.totalQi,888);assert.ok(stateBefore.length>0);
 }finally{await cloud.close();await new Promise(r=>source.close(r));fs.rmSync(data,{recursive:true,force:true});fs.rmSync(agentData,{recursive:true,force:true});}
});
