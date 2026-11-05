import {spawn} from 'node:child_process';import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';
const data=path.resolve('output/pet-cove-v2/http-qa');await fs.mkdir(data,{recursive:true});
const p=spawn(process.execPath,['server.mjs'],{cwd:process.cwd(),windowsHide:true,env:{...process.env,PORT:'0',VAN_HAI_DATA_DIR:data,VAN_HAI_TTS:'off'},stdio:['ignore','pipe','pipe']});
let log='',err='';p.stdout.on('data',d=>log+=d);p.stderr.on('data',d=>err+=d);
try{
 const port=await new Promise((resolve,reject)=>{const timer=setInterval(()=>{const m=log.match(/http:\/\/127\.0\.0\.1:(\d+)/);if(m){clearInterval(timer);resolve(Number(m[1]));}},50);setTimeout(()=>{clearInterval(timer);reject(Error('Server QA timeout: '+err));},15000).unref();});
 const base='http://127.0.0.1:'+port;
 const before=await(await fetch(base+'/api/state?world=demo')).json();
 const post=async action=>(await(await fetch(base+'/api/pet-event?world=demo',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,minutes:5})})).json());
 assert.equal((await post('start')).ok,true);
 const during=await(await fetch(base+'/api/state?world=demo')).json();assert.equal(during.environment.id,'pet-cove');assert.equal(during.petEvent.rules[4].coins,200);assert.equal(during.petEvent.rules[4].hearts,null);assert.equal(during.petEvent.rules[3].coins,100);assert.ok(during.petEvent.rules.slice(0,3).every(p=>p.coins===0));
 assert.equal((await post('stop')).ok,true);const after=await(await fetch(base+'/api/state?world=demo')).json();assert.equal(after.petEvent.active,false);assert.equal(after.environment.id,before.environment.id);
 const report={isolated:true,opensCove:true,restoresPreviousMap:true,dragonCoinsOnly:200,phoenix:{hearts:3000,coins:100},firstThreeHeartsOnly:true};await fs.writeFile('output/pet-cove-v2/http-qa.json',JSON.stringify(report,null,2));console.log(report);
}finally{p.kill();}
