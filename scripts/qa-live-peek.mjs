// 21/11: CHỈ XEM overlay LIVE thật (không tiếng, không gửi lệnh) → output/live-peek/*.jpg + vị trí Tông Chủ/danh hiệu
import {spawn} from 'node:child_process';import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import WebSocket from 'ws';
const out='output/live-peek';await fs.mkdir(out,{recursive:true});const pause=ms=>new Promise(r=>setTimeout(r,ms));
const profile=await fs.mkdtemp(path.join(os.tmpdir(),'peek-ch-'));
const ch=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port=0','--no-first-run','--mute-audio',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true});
try{
 let dp;for(let i=0;i<80;i++){try{dp=Number((await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0]);break;}catch{await pause(100)}}
 const ts=await(await fetch(`http://127.0.0.1:${dp}/json/list`)).json();const ws=new WebSocket(ts.find(x=>x.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.on('open',r));
 let id=0;const pending=new Map();const send=(method,params={})=>new Promise((res,rej)=>{const i=++id;pending.set(i,{res,rej});ws.send(JSON.stringify({id:i,method,params}));});
 ws.on('message',m=>{const d=JSON.parse(m);if(d.id&&pending.has(d.id)){const p=pending.get(d.id);pending.delete(d.id);d.error?p.rej(Error(d.error.message)):p.res(d.result);}});
 await send('Runtime.enable');await send('Page.enable');await send('Emulation.setDeviceMetricsOverride',{width:540,height:960,deviceScaleFactor:2,mobile:false});
 const ev=async expr=>(await send('Runtime.evaluate',{awaitPromise:true,returnByValue:true,expression:expr})).result?.value;
 await send('Page.navigate',{url:'http://127.0.0.1:4317/?overlay=1&world=live&stage=world&quality=auto&qa=1'});await pause(9000);
 for(const n of ['a','b']){const r=await send('Page.captureScreenshot',{format:'jpeg',quality:84});await fs.writeFile(`${out}/${n}.jpg`,Buffer.from(r.data,'base64'));await pause(3000);}
 console.log(await ev(`(()=>{const s=window.__vhScene;const m=s?.sectMaster;const T=(s?.targets||[]).map(a=>a.player?.name+':'+a.player?.reincarnations).filter(x=>!x.endsWith(':undefined'));return JSON.stringify({master:m?.userId,masterReinc:m?.player?.reincarnations,inTargets:(s?.targets||[]).some(a=>a.id===m?.userId),n:s?.targets?.length,reborn:T,layout:s?.environment?.layout})})()`));
}finally{ch.kill();}
