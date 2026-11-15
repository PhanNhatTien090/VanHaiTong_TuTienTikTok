// QA Lôi Đài qua HTTP thật (server thử, dữ liệu tạm, world=demo). node scripts/qa-arena-http.mjs
import {spawn} from 'node:child_process';import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';
const data=path.resolve('output/arena-qa-data');await fs.rm(data,{recursive:true,force:true});await fs.mkdir(data,{recursive:true});
const p=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:'0',VAN_HAI_DATA_DIR:data,VAN_HAI_TTS:'off'},stdio:['ignore','pipe','pipe'],windowsHide:true});
let log='';p.stdout.on('data',d=>log+=d);p.stderr.on('data',d=>log+=d);
try{
 const port=await new Promise((ok,no)=>{const iv=setInterval(()=>{const m=log.match(/http:\/\/127\.0\.0\.1:(\d+)/);if(m){clearInterval(iv);ok(m[1]);}},50);setTimeout(()=>no(Error('timeout '+log)),15000);});
 const base='http://127.0.0.1:'+port,post=(u,b)=>fetch(base+u+'?world=demo',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)}).then(r=>r.json());
 const chat=(id,text)=>post('/api/action',{type:'chat',userId:id,name:id.toUpperCase(),text});
 for(const id of ['qa1','qa2'])await post('/api/action',{type:'join',userId:id,name:id.toUpperCase()});
 const start=await post('/api/arena',{action:'start'});assert.equal(start.ok,true,JSON.stringify(start));
 console.log('lên đài 1',JSON.stringify(await chat('qa1','lên đài')));console.log('lên đài 2',JSON.stringify(await chat('qa2','lên đài')));
 await new Promise(r=>setTimeout(r,4500));
 const raw=await fetch(base+'/api/state?world=demo').then(r=>r.text());const s=JSON.parse(raw);console.log('keys',Object.keys(s).slice(0,12).join(','),raw.slice(0,200));
 console.log('env',s.environment?.id,s.environment?.image,'scene',s.socialScene,'stage',s.socialStage,'arena',!!s.arena,'current',!!s.arena?.current,'log',s.arena?.current?.log?.length);
 const img=await fetch(base+s.environment.image);console.log('map',img.status,img.headers.get('content-type'));
 for(const f of ['/arena-stage.js?v=loi-dai-20261115','/arena-skills.js'])console.log(f,(await fetch(base+f)).status);
 assert.equal(s.socialScene,'arena');assert.ok(s.arena.current);
 console.log('stop',JSON.stringify(await post('/api/arena',{action:'stop'})));
}finally{p.kill();}
