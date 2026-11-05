import {test} from 'node:test';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
test('event tab HTTP controls, consent, LIVE isolation and origin checks',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'vanhai-social-http-')),child=spawn(process.execPath,['server.mjs'],{cwd:root,env:{...process.env,PORT:'0',VAN_HAI_DATA_DIR:dir,VAN_HAI_TTS:'',VAN_HAI_BRIDGE_AUTO:''},stdio:['ignore','pipe','pipe']});
 try{const url=await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(Error('Startup timeout')),10000);child.stdout.on('data',d=>{const m=String(d).match(/http:\/\/127\.0\.0\.1:\d+/);if(m){clearTimeout(timeout);resolve(m[0]);}});child.on('error',reject);});
 const post=async(p,b)=>{const r=await fetch(url+p,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)});return {status:r.status,data:await r.json()};};
 assert.equal((await post('/api/world-scene?world=live',{scene:'underwater'})).status,200);
 assert.equal((await(await fetch(url+'/api/state?world=live')).json()).environment.id,'underwater');
 assert.equal((await(await fetch(url+'/api/export?world=live')).json()).settings.sceneMode,'underwater');
 assert.notEqual((await(await fetch(url+'/api/state')).json()).environment.mode,'underwater');
 assert.equal((await post('/api/world-scene?world=live',{scene:'bad-map'})).status,400);
 assert.equal((await fetch(url+'/api/world-scene',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://example.org'},body:'{"scene":"cosmos"}'})).status,403);
 assert.equal((await post('/api/world-scene?world=live',{scene:'auto'})).status,200);
 const badBoss=await post('/api/boss?world=live',{species:'unknown'});assert.equal(badBoss.data.ok,false);assert.equal((await post('/api/boss?world=live',{species:'astral-tortoise'})).data.ok,true);const eliteLive=await(await fetch(url+'/api/state?world=live')).json();assert.equal(eliteLive.boss.species,'astral-tortoise');assert.equal(eliteLive.boss.encounter.id,'shield');
 assert.equal((await post('/api/social-control?world=live',{action:'start-bond-festival'})).status,400);await post('/api/social-control?world=live',{action:'stop-current',kind:'boss'}); assert.equal((await post('/api/social-control?world=live',{action:'start-bond-festival'})).status,200);let festivalLive=await(await fetch(url+'/api/state?world=live')).json();assert.equal(festivalLive.socialStatus.festival.active,true);assert.equal(festivalLive.bondFestival,undefined);assert.equal((await post('/api/social-control?world=live',{action:'stop-bond-festival'})).status,200);await post('/api/social-control?world=live',{action:'stop-current',kind:'boss'});assert.equal((await post('/api/boss?world=live',{species:'moon-fox'})).data.ok,true);const foxLive=await(await fetch(url+'/api/state?world=live')).json();assert.equal(foxLive.boss.species,'moon-fox');
 const html=await(await fetch(url)).text();assert.match(html,/id="eventsView"/);assert.match(html,/data-tab="events"/);assert.equal((await fetch(url+'/social-stage.js')).status,200);
 assert.equal((await post('/api/social-control',{action:'start-tournament'})).status,200);assert.equal((await post('/api/social-control',{action:'start-tournament'})).status,400);assert.equal((await post('/api/social-control',{action:'stop-tournament'})).status,200);
 for(const [id,name]of [['a','Thử A'],['b','Thử B']])await post('/api/action',{type:'join',userId:id,name});
 await post('/api/action',{type:'chat',userId:'a',text:'ketduyen Thử B'});let state=await(await fetch(url+'/api/state')).json();assert.equal(state.socialStatus.invites.length,1);assert.equal(state.socialStatus.bonds.length,0);
 await post('/api/action',{type:'chat',userId:'b',text:'dongy'});state=await(await fetch(url+'/api/state')).json();assert.equal(state.socialStatus.bonds.length,1);assert.equal(state.social,undefined);
 const live=await(await fetch(url+'/api/state?world=live')).json();assert.equal(live.socialStatus.bonds.length,0);assert.equal((await post('/api/action?world=live',{type:'chat',userId:'x',text:'dongy'})).status,403);
 await post('/api/social-control?world=live',{action:'stop-current',kind:'boss'});assert.equal((await post('/api/visitor-event?world=live',{kind:'shende'})).status,200);const god=await(await fetch(url+'/api/state?world=live')).json();assert.equal(god.visitor.kind,'shende');assert.match(god.catalog.find(i=>i.id==='shende-dao-seal').description,/300/);
 assert.equal((await fetch(url+'/api/social-control',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://example.org'},body:'{"action":"start-tournament"}'})).status,403);
 }finally{child.kill();}
});
