import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import net from 'node:net';import {spawn} from 'node:child_process';
test('isolated watchdog recovers a stopped child, logs exit code and prevents a duplicate supervisor',async()=>{
 const data=fs.mkdtempSync(path.join(os.tmpdir(),'van-hai-watchdog-')),probe=net.createServer();await new Promise(r=>probe.listen(0,'127.0.0.1',r));const port=probe.address().port;await new Promise(r=>probe.close(r));
 const env={...process.env,PORT:String(port),VAN_HAI_DATA_DIR:data,VAN_HAI_TTS:'off',VAN_HAI_WATCH_INTERVAL:'500',VAN_HAI_WATCH_RETRY:'300'},children=[];
 const launch=()=>{const p=spawn(process.execPath,['scripts/server-watchdog.mjs'],{cwd:process.cwd(),windowsHide:true,env,stdio:['ignore','pipe','pipe']});children.push(p);return p;};
 const read=()=>{try{return JSON.parse(fs.readFileSync(path.join(data,'watchdog-status.json'),'utf8'));}catch{return null;}};
 const until=async fn=>{for(let i=0;i<150;i++){const value=fn();if(value)return value;await new Promise(r=>setTimeout(r,100));}throw Error('Watchdog condition timed out');};
 const stop=pid=>{try{process.kill(pid,'SIGTERM');}catch{}};let serverPid;
 try{
  const first=launch(),one=await until(()=>{const s=read();return s?.state==='healthy'&&s.serverPid?s:null;});serverPid=one.serverPid;
  const second=launch(),exit=await new Promise(resolve=>second.on('exit',resolve));assert.equal(exit,0);assert.equal(read().watchdogPid,first.pid);
  stop(serverPid);const two=await until(()=>{const s=read();return s?.state==='healthy'&&s.serverPid&&s.serverPid!==one.serverPid?s:null;});serverPid=two.serverPid;assert.ok(two.restarts>=2);
  const logs=fs.readFileSync(path.join(data,'watchdog.jsonl'),'utf8').trim().split('\n').map(JSON.parse);assert.ok(logs.some(r=>r.type==='server-exit'&&r.serverPid===one.serverPid&&Object.hasOwn(r,'code')));
  const response=await fetch(`http://127.0.0.1:${port}/api/state?world=live`);assert.equal(response.status,200);
 }finally{for(const p of children)stop(p.pid);await new Promise(r=>setTimeout(r,150));stop(read()?.serverPid||serverPid);}
});
