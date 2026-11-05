import {createWorld,ensurePlayer,startRace,action,tick} from '../engine.mjs';
import {spawn} from 'node:child_process';import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';
const data=path.resolve('output/race-v3/http-qa');await fs.mkdir(data,{recursive:true});
const N=Date.now(),world=createWorld('demo');Object.assign(world.settings,{autoEvents:false,residents:false,ceremony:false});world.nextBossAt=N+1e9;for(const id of ['qa-a','qa-b'])ensurePlayer(world,id,id,N);startRace(world,N-45001);world.race.registrationEndsAt=N;for(const id of ['qa-a','qa-b'])action(world,{type:'chat',userId:id,text:'bay'},N-1);tick(world,N);await fs.writeFile(path.join(data,'demo.json'),JSON.stringify(world));
const p=spawn(process.execPath,['server.mjs'],{cwd:process.cwd(),windowsHide:true,env:{...process.env,PORT:'0',VAN_HAI_DATA_DIR:data,VAN_HAI_TTS:'off'},stdio:['ignore','pipe','pipe']});
let log='',err='';p.stdout.on('data',d=>log+=d);p.stderr.on('data',d=>err+=d);
try{
 const port=await new Promise((resolve,reject)=>{const timer=setInterval(()=>{const m=log.match(/http:\/\/127\.0\.0\.1:(\d+)/);if(m){clearInterval(timer);resolve(Number(m[1]));}},50);setTimeout(()=>{clearInterval(timer);reject(Error('Server QA timeout: '+err));},15000).unref();});
 const base='http://127.0.0.1:'+port;
 const input={type:'gift',userId:'qa-a',name:'QA',coins:1,eventId:'isolated-one-coin'};
 const post=async()=>await(await fetch(base+'/api/action?world=demo',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)})).json();
 assert.equal((await post()).ok,true);await post();
 const state=await(await fetch(base+'/api/state?world=demo')).json();const racer=state.raceStatus.racers.find(r=>r.id==='qa-a');assert.equal(racer.giftDist,30);assert.equal(racer.giftUnits,30);
 for(const file of ['/race-preview.html','/race-preview.js','/race-sword-skins.js'])assert.equal((await fetch(base+file)).status,200);
 console.log('Isolated HTTP: 1 coin = +30, duplicate ignored, preview and sword assets served.');
}finally{p.kill();}
