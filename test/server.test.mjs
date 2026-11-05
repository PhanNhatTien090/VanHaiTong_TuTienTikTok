import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {WebSocketServer} from 'ws';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
async function launch(dataDir,extraEnv={}){const child=spawn(process.execPath,['server.mjs'],{cwd:root,env:{...process.env,PORT:'0',VAN_HAI_DATA_DIR:dataDir,...extraEnv},stdio:['ignore','pipe','pipe']});const url=await new Promise((resolve,reject)=>{let out='';const timer=setTimeout(()=>reject(Error('Server startup timeout')),10000);child.stdout.on('data',d=>{out+=d;const m=out.match(/http:\/\/127\.0\.0\.1:\d+/);if(m){clearTimeout(timer);resolve(m[0]);}});child.on('error',reject);child.on('exit',code=>{if(code)reject(Error('Server exited '+code));});});return {child,url};}
test('HTTP simulator, LIVE isolation, gift settings and persisted restart',async()=>{const dir=await mkdtemp(path.join(tmpdir(),'van-hai-test-'));let server=await launch(dir);const post=async(route,body)=>{const r=await fetch(server.url+route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});return {status:r.status,data:await r.json()};};try{
  const page=await fetch(server.url);assert.equal(page.status,200);assert.match(await page.text(),/Vân Hải Tông/);
  assert.equal((await fetch(server.url+'/engine.mjs')).status,404);
  assert.equal((await fetch(server.url+'/visitor-audit.html')).status,200);
  const audit=await(await fetch(server.url+'/api/visitor-audit?world=live')).json();assert.ok(Array.isArray(audit.events));
  assert.equal((await fetch(server.url+'/api/gift-audit-log?world=live&date='+audit.today)).status,200);
  assert.equal((await fetch(server.url+'/api/gift-audit-log?world=live&date=../../live.json')).status,404);
  const asset=await fetch(server.url+'/performance.js');const etag=asset.headers.get('etag');assert.ok(etag);assert.equal((await fetch(server.url+'/performance.js',{headers:{'If-None-Match':etag}})).status,304);
  assert.equal((await fetch(server.url+'/api/speech?id=not-an-event&text=arbitrary')).status,404);
  const music=await fetch(server.url+'/assets/meditation-loop.wav',{method:'HEAD'});assert.equal(music.headers.get('content-type'),'audio/wav');
  assert.match(page.headers.get('content-security-policy'),/media-src 'self' blob:/);
  const data={type:'cultivate',userId:'integration',name:'Integration'};assert.equal((await post('/api/action',data)).data.ok,true);
  assert.equal((await post('/api/action?world=live',data)).status,403);
  const w=await (await fetch(server.url+'/api/state')).json();assert.equal(w.players.find(p=>p.id==='integration').qi,27);
  const live=await(await fetch(server.url+'/api/state?world=live')).json();assert.equal(live.players.length,0);
  const invalid=structuredClone(w.gifts);invalid[0].min=5;assert.equal((await post('/api/gifts',{gifts:invalid})).status,400);
  const good=structuredClone(w.gifts);good[0].qi=14;assert.equal((await post('/api/gifts',{gifts:good})).data.ok,true);
  const hostile=await fetch(server.url+'/api/action',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://example.org'},body:JSON.stringify(data)});assert.equal(hostile.status,403);
  const stored=JSON.parse(await readFile(path.join(dir,'demo.json'),'utf8'));assert.equal(stored.players.integration.qi,27);
  server.child.kill();await new Promise(r=>server.child.once('exit',r));server=await launch(dir);const restored=await(await fetch(server.url+'/api/state')).json();assert.equal(restored.players.find(p=>p.id==='integration').qi,27);assert.equal(restored.gifts[0].qi,14);
}finally{server.child.kill();}});
test('TikFinity WebSocket bridge routes real-shaped events only to LIVE',async()=>{const dir=await mkdtemp(path.join(tmpdir(),'van-hai-bridge-'));const ws=new WebSocketServer({host:'127.0.0.1',port:0});await new Promise(r=>ws.once('listening',r));const server=await launch(dir,{VAN_HAI_TIKFINITY_URL:`ws://127.0.0.1:${ws.address().port}/`});try{
  const masterConfig=await fetch(server.url+'/api/sect-master',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'host',enabled:true})});assert.equal(masterConfig.status,200);
  const socketReady=new Promise(r=>ws.once('connection',r));
  await fetch(server.url+'/api/bridge',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({enabled:true})});
  const socket=await socketReady;
  socket.send(JSON.stringify({event:'chat',data:{userId:'live-user',uniqueId:'host',nickname:'Khách LIVE',comment:'nhapmon'}}));
  socket.send(JSON.stringify({event:'gift',data:{userId:'live-user',nickname:'Khách LIVE',diamondCount:5,giftType:1,groupId:'c',giftId:1,repeatCount:1,msgId:'m1'}}));
  socket.send(JSON.stringify({event:'gift',data:{userId:'live-user',nickname:'Khách LIVE',diamondCount:5,giftType:1,groupId:'c',giftId:1,repeatCount:3,msgId:'m2'}}));
  socket.send(JSON.stringify({event:'gift',data:{userId:'live-user',nickname:'Khách LIVE',diamondCount:5,giftType:1,groupId:'c',giftId:1,repeatCount:3,msgId:'m3',repeatEnd:true}}));
  let live;for(let i=0;i<30;i++){live=await(await fetch(server.url+'/api/state?world=live')).json();if(live.players[0]?.qi===210)break;await new Promise(r=>setTimeout(r,20));}
  assert.equal(live.players[0].name,'Khách LIVE');assert.equal(live.players[0].qi,210);assert.equal(live.players[0].giftCoins,15);assert.equal(live.connection.status,'connected');assert.equal(live.sectMaster.active,true);assert.equal(live.sectMaster.username,'host');assert.equal(live.sectMaster.text,'nhapmon');
  socket.send(JSON.stringify({event:'follow',data:{user:{userId:'live-user',nickname:'Khách LIVE'},msgId:'follow-one'}}));
  socket.send(JSON.stringify({event:'share',data:{userId:'live-user',nickname:'Khách LIVE',msgId:'share-one'}}));
  for(let i=0;i<30;i++){live=await(await fetch(server.url+'/api/state?world=live')).json();if(live.players[0]?.shareEvents===1)break;await new Promise(r=>setTimeout(r,20));}
  assert.equal(live.players[0].followed,true);assert.equal(live.players[0].shareEvents,1);assert.equal(live.players[0].qi,210); // 3/11: follow+share không còn thưởng (−35)assert.equal(live.players[0].giftCoins,15);
  assert.deepEqual(live.events.filter(e=>e.engagementAction).map(e=>e.engagementAction),['follow','share']);
  const demo=await(await fetch(server.url+'/api/state')).json();assert.equal(demo.players.some(p=>p.id==='live-user'),false);
}finally{for(const c of ws.clients)c.terminate();await new Promise(r=>ws.close(r));server.child.kill();}});
