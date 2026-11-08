// Chụp màn trao thưởng đua (dữ liệu giả, không chạm LIVE): node scripts/qa-race-awards.mjs
import {spawn} from 'node:child_process';import fs from 'node:fs/promises';import path from 'node:path';import WebSocket from 'ws';
const dir=path.resolve('output/race-v4');await fs.mkdir(dir,{recursive:true});const profile=await fs.mkdtemp(path.join(dir,'chrome-'));
const chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port=0','--no-first-run','--mute-audio',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
const pause=ms=>new Promise(r=>setTimeout(r,ms));let socket;
try{let port;for(let i=0;i<100;i++){try{port=Number((await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0]);break;}catch{await pause(100);}}
 const t=await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();socket=new WebSocket(t.find(x=>x.type==='page').webSocketDebuggerUrl);await new Promise(r=>socket.once('open',r));
 let id=0;const pend=new Map(),errors=[];socket.on('message',d=>{const m=JSON.parse(d);if(m.id){pend.get(m.id)?.(m.result);pend.delete(m.id);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);});
 const call=(method,params={})=>new Promise(r=>{pend.set(++id,r);socket.send(JSON.stringify({id,method,params}));});
 await call('Runtime.enable');await call('Page.enable');await call('Emulation.setDeviceMetricsOverride',{width:540,height:960,deviceScaleFactor:2,mobile:false});
 await call('Page.navigate',{url:'http://127.0.0.1:4317/race-preview.html?n=60'});await pause(4000);
 await call('Runtime.evaluate',{expression:"document.querySelector('#tools').classList.add('hide');raceFinish()"});
 for(const [ms,name] of [[700,'awards-early'],[2600,'awards-full']]){await pause(ms);const r=await call('Page.captureScreenshot',{format:'png'});await fs.writeFile(path.join(dir,'chrome-'+name+'.png'),Buffer.from(r.data,'base64'));}
 console.log('errors',JSON.stringify(errors));
}finally{socket?.close();chrome.kill();await pause(400);await fs.rm(profile,{recursive:true,force:true}).catch(()=>{});}
