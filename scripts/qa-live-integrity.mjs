// Disposable data, server and browser. Does not connect to the production LIVE world.
import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import WebSocket from 'ws';
import {createWorld,action,puppetControl} from '../engine.mjs';
const dir=path.resolve('output/live-integrity-v1');await fs.mkdir(dir,{recursive:true});
const dataDir=await fs.mkdtemp(path.join(dir,'run-')),profile=await fs.mkdtemp(path.join(dir,'chrome-'));
const now=Date.now(),w=createWorld('demo');
Object.assign(w.settings,{autoEvents:false,ceremony:false,blessingMinutes:0,envelope:false,quiz:false});w.nextBossAt=now+1e9;
for(const [id,name]of [['one','An Nhiên'],['two','Mộc Miên']])action(w,{type:'join',userId:id,name},now);
action(w,{type:'gift',userId:'one',coins:1,count:1,giftName:'Rose',eventId:'real-fixture'},now+1);
const npc=puppetControl(w,{op:'create',name:'Linh Đồng',realm:2},now+2);
puppetControl(w,{op:'act',id:npc.id,type:'gift',coins:1000,count:1,giftName:'Rose'},now+3);
const simulated=w.events.findLast(e=>e.user===npc.id&&e.gift);
w.events.push({id:'old-simulation',at:now,user:'two',name:'Mộc Miên',gift:'Rose',effect:'petal',simulated:true});
w.mode='live';await fs.writeFile(path.join(dataDir,'live.json'),JSON.stringify(w));
const server=spawn(process.execPath,['server.mjs'],{windowsHide:true,stdio:['ignore','pipe','pipe'],env:{...process.env,PORT:'0',VAN_HAI_DATA_DIR:dataDir,VAN_HAI_WEB:'0',VAN_HAI_TTS:'',VAN_HAI_BRIDGE_AUTO:'',VAN_HAI_RECOVERY_FILE:''}});
let chrome,socket;const pause=ms=>new Promise(r=>setTimeout(r,ms));
try{
 const url=await new Promise((resolve,reject)=>{let out='';const timer=setTimeout(()=>reject(Error('Server startup timeout')),10000);server.stdout.on('data',d=>{out+=d;const m=out.match(/http:\/\/127\.0\.0\.1:\d+/);if(m){clearTimeout(timer);resolve(m[0]);}});server.once('error',reject);});
 const full=await(await fetch(url+'/api/state?world=live')).json();
 assert.ok(full.events.some(e=>e.user==='one'&&e.gift));assert.ok(!full.events.some(e=>e.id===simulated.id||e.simulated));
 const stream=await fetch(url+'/api/events?world=live&view=overlay'),reader=stream.body.getReader();let frame='';
 while(!frame.includes('\n\n'))frame+=new TextDecoder().decode((await reader.read()).value);await reader.cancel();
 const overlay=JSON.parse(frame.slice(6,frame.indexOf('\n\n')));assert.equal(overlay.players.find(p=>p.id===npc.id).puppet,true);
 assert.equal((await fetch(url+'/api/speech?world=live&id='+simulated.id)).status,404);
 const blocked=await fetch(url+'/api/puppet?world=live',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({op:'create',name:'Test'})});assert.equal(blocked.status,400);
 chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port=0','--no-first-run','--no-default-browser-check',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
 let port;for(let i=0;i<100;i++){try{port=Number((await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0]);break;}catch{await pause(100);}}
 assert.ok(port);const targets=await(await fetch(`http://127.0.0.1:${port}/json/list`)).json();socket=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise((r,j)=>{socket.once('open',r);socket.once('error',j);});
 let id=0;const pending=new Map(),errors=[];
 socket.on('message',data=>{const m=JSON.parse(data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);});
 const call=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
 const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 await call('Runtime.enable');await call('Page.enable');await call('Emulation.setDeviceMetricsOverride',{width:540,height:960,deviceScaleFactor:1,mobile:false});
 await call('Page.navigate',{url:url+'/?overlay=1&world=live&stage=world&quality=balanced&sound=0'});
 for(let i=0;i<100;i++){if(await evaluate("document.querySelector('#statPlayers')?.textContent==='2'"))break;await pause(100);}
 assert.equal(await evaluate("document.querySelector('#statPlayers').textContent"),'2','receive must update actual app state');
 assert.equal(await evaluate("document.querySelector('#worldBadge').textContent"),'LIVE');
 assert.match(await evaluate("document.querySelector('.live-disclosure').textContent"),/NPC/);
 assert.equal(await evaluate("document.querySelector('#likeGoal').dataset.context"),'voluntary');
 assert.match(await evaluate("document.querySelector('#giftBoard').innerText"),/tự nguyện/);
 await pause(1800);const portrait=await call('Page.captureScreenshot',{format:'png'});await fs.writeFile(path.join(dir,'portrait.png'),Buffer.from(portrait.data,'base64'));
 await call('Page.navigate',{url:url+'/?world=live#puppets'});await pause(2000);
 await evaluate("document.querySelector('[data-tab=puppets]').click()");await pause(500);
 assert.match(await evaluate("document.querySelector('#puppetPanel').textContent"),/chỉ dùng ở DEMO/);
 assert.equal(await evaluate("document.querySelector('#pzCreate')"),null);
 assert.deepEqual(errors,[]);
 const result={isolated:true,receivedState:true,playerCount:2,npcCount:1,overlayMetadata:true,historicalSimulationsFiltered:true,simulatedSpeechBlocked:true,liveSimulationRejected:true,liveMetricsVoluntary:true,errors,portrait:'portrait.png'};
 await fs.writeFile(path.join(dir,'qa.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}finally{socket?.close();chrome?.kill();server.kill();}
