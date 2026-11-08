import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
import {createWorld} from '../../engine.mjs';import {createWebApp} from '../app.mjs';import {createErrorLog} from '../error-log.mjs';
const read=file=>fs.existsSync(file)?fs.readFileSync(file,'utf8').trim().split('\n').filter(Boolean).map(l=>JSON.parse(l)):[];

test('error log groups repeats within a minute and clips long fields',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'vh-errlog-'));let t=1_000_000;
  const log=createErrorLog(dir,{now:()=>t});
  assert.equal(log.record('server',{route:'GET /api/me',message:'boom',stack:'x'.repeat(5000)}),true);
  assert.equal(log.record('server',{route:'GET /api/me',message:'boom'}),false);
  assert.equal(log.record('server',{route:'GET /api/me',message:'boom'}),false);
  t+=61000;assert.equal(log.record('server',{route:'GET /api/me',message:'boom'}),true);
  const rows=read(log.file);assert.equal(rows.length,2);assert.equal(rows[0].stack.length,2000);assert.equal(rows[1].repeated,2);
  fs.rmSync(dir,{recursive:true,force:true});
});

test('browser errors are stored without passwords or IPs and are rate limited',async()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'vh-errlog-app-')),world=createWorld('live');
  const app=createWebApp({world,dataDir:dir,tikfinity:false,devTools:false,profileOnly:true});await new Promise(r=>app.server.listen(0,'127.0.0.1',r));
  const base='http://127.0.0.1:'+app.server.address().port;
  const post=body=>fetch(base+'/api/client-error',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  const r=await post({page:'/',message:'TypeError: x is undefined',source:'/web.js',line:12,col:3,stack:'at web.js:12',password:'secret123'});
  assert.equal(r.status,200);
  const rows=read(path.join(dir,'logs','web-errors.jsonl'));
  assert.equal(rows.length,1);assert.equal(rows[0].kind,'client');assert.equal(rows[0].line,12);
  assert.doesNotMatch(JSON.stringify(rows),/secret123|127\.0\.0\.1/);
  let limited=false;for(let i=0;i<25;i++)if((await post({message:'m'+i})).status===429)limited=true;
  assert.equal(limited,true);
  app.server.close();fs.rmSync(dir,{recursive:true,force:true});
});
