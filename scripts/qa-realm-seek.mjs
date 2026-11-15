// Chụp nghi thức đột phá ở các giây chỉ định bằng Chrome ẩn (nhảy thẳng tới mốc, không chờ chạy hết). Không chạm LIVE.
// node scripts/qa-realm-seek.mjs <realm> <outDir> 1,5.5,12 [w=540]
import {spawn} from 'node:child_process';import fs from 'node:fs/promises';import path from 'node:path';import WebSocket from 'ws';
const [realm,outArg,list,wArg]=process.argv.slice(2);const dir=path.resolve(outArg);await fs.mkdir(dir,{recursive:true});
const secs=list.split(',').map(Number),W=Number(wArg||540),Hh=Math.round(W*16/9);
const profile=await fs.mkdtemp(path.join(process.env.TEMP||dir,'qa-chrome-'));
const chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port=0','--no-first-run','--mute-audio',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
const pause=ms=>new Promise(r=>setTimeout(r,ms));let socket;
try{let port;for(let i=0;i<100;i++){try{port=Number((await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0]);break;}catch{await pause(100);}}
 const t=await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();socket=new WebSocket(t.find(x=>x.type==='page').webSocketDebuggerUrl);await new Promise(r=>socket.once('open',r));
 let id=0;const pend=new Map(),errors=[];socket.on('message',d=>{const m=JSON.parse(d);if(m.id){pend.get(m.id)?.(m.result);pend.delete(m.id);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')errors.push(m.params.args.map(a=>a.value||a.description).join(' '));});
 const call=(method,params={})=>new Promise(r=>{pend.set(++id,r);socket.send(JSON.stringify({id,method,params}));});
 await call('Runtime.enable');await call('Page.enable');await call('Emulation.setDeviceMetricsOverride',{width:W,height:Hh,deviceScaleFactor:1,mobile:false});
 await call('Page.navigate',{url:`http://127.0.0.1:4317/ascension-preview.html?realm=${realm}&capture=1`});await pause(4500);
 await call('Runtime.evaluate',{expression:"document.querySelector('#ritual')?.click()"});await pause(2500);
 for(const sec of secs){
  await call('Runtime.evaluate',{expression:`(()=>{const e=window.__scene.effects.find(x=>x.effect==='breakthrough');if(!e)return 'none';e.start=performance.now()-${sec}*e.duration/(${realm}>=25?{25:52,26:54,27:56,28:58}[${realm}]:1)-0;return e.duration;})()`});
  await pause(350);const r=await call('Page.captureScreenshot',{format:'jpeg',quality:82});await fs.writeFile(path.join(dir,'s'+String(sec).padStart(5,'0')+'.jpg'),Buffer.from(r.data,'base64'));}
 console.log('errors',JSON.stringify(errors.slice(0,8)));
}finally{socket?.close();chrome.kill();await pause(400);await fs.rm(profile,{recursive:true,force:true}).catch(()=>{});}
