// 07/11/2026: QA Thiên Đạo giáng lôi — chạy trên server THỬ (mặc định cổng 4399, dữ liệu riêng), không đụng LIVE.
// node scripts/qa-heaven-strike.mjs [port] [playerId]
import {spawn} from 'node:child_process';import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import WebSocket from 'ws';
const port=Number(process.argv[2]||4399),target=process.argv[3]||'7028432924999713793',base=`http://127.0.0.1:${port}`,out='output/heaven-strike';await fs.mkdir(out,{recursive:true});
const pause=ms=>new Promise(r=>setTimeout(r,ms));const profile=await fs.mkdtemp(path.join(os.tmpdir(),'hv-'));
const ch=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port=0','--no-first-run','--autoplay-policy=no-user-gesture-required',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
let ws,id=0;const pending=new Map(),logs=[];
const send=(method,params={})=>new Promise((res,rej)=>{const i=++id;pending.set(i,{res,rej});ws.send(JSON.stringify({id:i,method,params}));});
try{let dp;for(let i=0;i<80;i++){try{dp=Number((await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0]);break;}catch{await pause(100)}}
 const ts=await(await fetch(`http://127.0.0.1:${dp}/json/list`)).json();ws=new WebSocket(ts.find(x=>x.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.on('open',r));
 ws.on('message',m=>{const d=JSON.parse(m);if(d.id&&pending.has(d.id)){const p=pending.get(d.id);pending.delete(d.id);d.error?p.rej(Error(d.error.message)):p.res(d.result);}if(d.method==='Runtime.exceptionThrown')logs.push('EXC '+d.params.exceptionDetails.exception?.description);if(d.method==='Runtime.consoleAPICalled'&&d.params.type==='error')logs.push('ERR '+d.params.args.map(a=>a.value||a.description).join(' '));});
 await send('Runtime.enable');await send('Page.enable');
 const shot=async name=>{const r=await send('Page.captureScreenshot',{format:'jpeg',quality:80});await fs.writeFile(`${out}/${name}.jpg`,Buffer.from(r.data,'base64'));};
 // 1) Bảng điều khiển tab Sự kiện
 await send('Emulation.setDeviceMetricsOverride',{width:1400,height:1000,deviceScaleFactor:1,mobile:false});
 await send('Page.navigate',{url:`${base}/?world=live#events`});await pause(4000);
 await send('Runtime.evaluate',{expression:`document.querySelector('[data-tab=events]')?.click();document.getElementById('heavenPanel')?.scrollIntoView();`});await pause(1500);await shot('panel');
 // 2) Overlay LIVE 1080×1920
 await send('Emulation.setDeviceMetricsOverride',{width:540,height:960,deviceScaleFactor:2,mobile:false});
 await send('Page.navigate',{url:`${base}/?overlay=1&world=live&stage=world&sound=0&voice=0&idle=1&quality=auto#tiktok.studio`});await pause(9000);
 const r=await(await fetch(`${base}/api/heaven-strike?world=live`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id:target})})).json();console.log('strike',JSON.stringify(r));
 const t0=Date.now();for(const at of [600,1500,2300,2750,2900,3200,3800,5000,6800,9000]){const w=at-(Date.now()-t0);if(w>0)await pause(w);await shot('live-'+String(at).padStart(4,'0'));}
 await pause(1500);await shot('live-stunmark');
 console.log(logs.length?logs.join('\n'):'no console errors');
}finally{ws?.close();ch.kill();}
