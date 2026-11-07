// 07/11/2026: QA "quà hiện ngay lúc tặng" — server THỬ (cổng 4399, dữ liệu riêng), thế giới demo.
// Cho 1 người đột phá cảnh giới thấp, 2,5 s sau gửi quà lớn → kỳ vọng thẻ quà + màn quà hiện ngay (cắt màn đột phá).
import {spawn} from 'node:child_process';import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import WebSocket from 'ws';
const port=Number(process.argv[2]||4399),coins=Number(process.argv[3]||199),base=`http://127.0.0.1:${port}`,out='output/gift-first';await fs.mkdir(out,{recursive:true});
const pause=ms=>new Promise(r=>setTimeout(r,ms));const post=(p,b)=>fetch(base+p,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(b)}).then(r=>r.json());
const profile=await fs.mkdtemp(path.join(os.tmpdir(),'gf-'));const ch=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port=0','--no-first-run',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
let ws,id=0;const pending=new Map(),logs=[];const send=(method,params={})=>new Promise((res,rej)=>{const i=++id;pending.set(i,{res,rej});ws.send(JSON.stringify({id:i,method,params}));});
try{let dp;for(let i=0;i<80;i++){try{dp=Number((await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split(String.fromCharCode(10))[0]);break;}catch{await pause(100)}}
 const ts=await(await fetch(`http://127.0.0.1:${dp}/json/list`)).json();ws=new WebSocket(ts.find(x=>x.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.on('open',r));
 ws.on('message',m=>{const d=JSON.parse(m);if(d.id&&pending.has(d.id)){const p=pending.get(d.id);pending.delete(d.id);d.error?p.rej(Error(d.error.message)):p.res(d.result);}if(d.method==='Runtime.exceptionThrown')logs.push('EXC '+d.params.exceptionDetails.exception?.description);});
 await send('Runtime.enable');await send('Page.enable');await send('Emulation.setDeviceMetricsOverride',{width:540,height:960,deviceScaleFactor:1,mobile:false});
 const shot=async name=>{const r=await send('Page.captureScreenshot',{format:'jpeg',quality:75});await fs.writeFile(`${out}/${name}.jpg`,Buffer.from(r.data,'base64'));};
 const probe=async()=>{const r=await send('Runtime.evaluate',{returnByValue:true,expression:`JSON.stringify({spot:document.querySelector('#spotlight.visible')?.innerText?.split(String.fromCharCode(10)).join(' | ')||'',receipt:document.querySelector('#giftReceipt')?.hidden===false?document.querySelector('#giftReceipt').innerText.split(String.fromCharCode(10))[0]:''})`});return r.result?.value??JSON.stringify(r.exceptionDetails?.exception?.description||r).slice(0,200);};
 await send('Page.navigate',{url:`${base}/?overlay=1&world=demo&stage=world&sound=0&voice=0&idle=0&quality=auto`});await pause(8000);
 const uid='qa-bt-'+Date.now();await post('/api/action?world=demo',{type:'join',userId:uid,name:'QA Đột Phá'});
 const filled=await post('/api/admin-gift?world=demo',{id:uid,combo:'breakthrough'});const bt=await post('/api/action?world=demo',{type:'breakthrough',userId:uid,name:'QA Đột Phá'});console.log('breakthrough',bt.ok,filled.ok);
 await pause(Number(process.argv[4]||2500));console.log('before gift',JSON.stringify(await probe()));await shot('1-breakthrough');
 const t0=Date.now();const g=await post('/api/action?world=demo',{type:'gift',userId:'qa-gift-'+t0,name:'QA Người Tặng',coins,giftName:'Vũ trụ',eventId:'qa'+t0});console.log('gift ok',g.ok);
 for(const ms of [600,1200,2000,3500]){await pause(ms-(Date.now()-t0));const p=await probe();console.log('t+'+ms+'ms',JSON.stringify(p));await shot('2-gift-'+ms);}
 console.log(logs.length?logs.join('\n'):'no console errors');
}finally{ws?.close();ch.kill();}
