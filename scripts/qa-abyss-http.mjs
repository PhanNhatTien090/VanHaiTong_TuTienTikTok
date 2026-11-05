import {spawn} from 'node:child_process';import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';
const data=path.resolve('output/abyss-boss-v1/http-qa');await fs.mkdir(data,{recursive:true});
const p=spawn(process.execPath,['server.mjs'],{cwd:process.cwd(),windowsHide:true,env:{...process.env,PORT:'0',VAN_HAI_DATA_DIR:data,VAN_HAI_TTS:'off'},stdio:['ignore','pipe','pipe']});
let log='',err='';p.stdout.on('data',d=>log+=d);p.stderr.on('data',d=>err+=d);
try{
 const port=await new Promise((resolve,reject)=>{const timer=setInterval(()=>{const m=log.match(/http:\/\/127\.0\.0\.1:(\d+)/);if(m){clearInterval(timer);resolve(Number(m[1]));}},50);setTimeout(()=>{clearInterval(timer);reject(Error('Server QA timeout: '+err));},15000).unref();});
 const base='http://127.0.0.1:'+port;
 const before=await(await fetch(base+'/api/state?world=demo')).json();assert.ok(before.bossCatalog.some(b=>b.species==='abyss-dragon'&&b.hpMultiplier===10));
 const response=await(await fetch(base+'/api/boss?world=demo',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({species:'abyss-dragon'})})).json();assert.equal(response.ok,true);
 const after=await(await fetch(base+'/api/state?world=demo')).json();assert.equal(after.boss.species,'abyss-dragon');assert.equal(after.boss.maxHp,(480+Math.min(after.players.length,40)*100)*10);assert.equal(after.boss.encounter.id,'charge');
 const second=await(await fetch(base+'/api/boss?world=demo',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({species:'abyss-dragon'})})).json();assert.equal(second.ok,false);
 const live=await(await fetch(base+'/api/state?world=live')).json();assert.equal(live.boss,null);
 const report={isolated:true,boss:after.boss.species,hp:after.boss.maxHp,duration:after.boss.endsAt-after.boss.startedAt,duplicateRejected:true,liveUntouched:true};await fs.writeFile('output/abyss-boss-v1/http-qa.json',JSON.stringify(report,null,2));console.log(report);
}finally{p.kill();}
