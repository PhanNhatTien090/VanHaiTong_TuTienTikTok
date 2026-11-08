// Chrome headless: /ascension-preview.html?realm=8, bấm #ritual, chụp ở các mốc. Không chạm LIVE.
import {spawn} from 'node:child_process';import fs from 'node:fs/promises';import path from 'node:path';import WebSocket from 'ws';
const dir=path.resolve('output/chan-tien-v4');await fs.mkdir(dir,{recursive:true});const profile=await fs.mkdtemp(path.join(dir,'chrome-'));
const chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port=0','--no-first-run','--mute-audio','--autoplay-policy=no-user-gesture-required',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
const pause=ms=>new Promise(r=>setTimeout(r,ms));let socket;
try{let port;for(let i=0;i<100;i++){try{port=Number((await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0]);break;}catch{await pause(100);}}
 const t=await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();socket=new WebSocket(t.find(x=>x.type==='page').webSocketDebuggerUrl);await new Promise(r=>socket.once('open',r));
 let id=0;const pend=new Map(),errors=[];socket.on('message',d=>{const m=JSON.parse(d);if(m.id){pend.get(m.id)?.(m.result);pend.delete(m.id);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')errors.push(m.params.args.map(a=>a.value||a.description).join(' '));});
 const call=(method,params={})=>new Promise(r=>{pend.set(++id,r);socket.send(JSON.stringify({id,method,params}));});
 await call('Runtime.enable');await call('Page.enable');await call('Emulation.setDeviceMetricsOverride',{width:540,height:960,deviceScaleFactor:2,mobile:false});
 await call('Page.navigate',{url:'http://127.0.0.1:4317/ascension-preview.html?realm=8&capture=1'});await pause(4000);
 await call('Runtime.evaluate',{expression:"document.querySelector('#ritual')?.click()"});const t0=Date.now();
 for(const sec of [3.7,10.9,15.5,18.4,24.5,29]){const wait=t0+sec*1000-Date.now();if(wait>0)await pause(wait);const r=await call('Page.captureScreenshot',{format:'jpeg',quality:80});await fs.writeFile(path.join(dir,'chrome-'+sec+'s.jpg'),Buffer.from(r.data,'base64'));}
 console.log('errors',JSON.stringify(errors));
}finally{socket?.close();chrome.kill();await pause(400);await fs.rm(profile,{recursive:true,force:true}).catch(()=>{});}
