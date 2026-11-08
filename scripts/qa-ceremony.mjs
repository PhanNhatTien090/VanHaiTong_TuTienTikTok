// 07/11/2026: QA đại điển vinh danh — server THỬ (cổng 4399), thế giới live bản sao. Chụp màn đại điển ở khung 1080×1920.
import {spawn} from 'node:child_process';import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import WebSocket from 'ws';
const port=Number(process.argv[2]||4399),base=`http://127.0.0.1:${port}`,out='output/ceremony';await fs.mkdir(out,{recursive:true});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const profile=await fs.mkdtemp(path.join(os.tmpdir(),'cer-'));const ch=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port=0','--no-first-run',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
let ws,id=0;const pending=new Map(),logs=[];const send=(method,params={})=>new Promise((res,rej)=>{const i=++id;pending.set(i,{res,rej});ws.send(JSON.stringify({id:i,method,params}));});
try{let dp;for(let i=0;i<80;i++){try{dp=Number((await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0]);break;}catch{await pause(100)}}
 const ts=await(await fetch(`http://127.0.0.1:${dp}/json/list`)).json();ws=new WebSocket(ts.find(x=>x.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.on('open',r));
 ws.on('message',m=>{const d=JSON.parse(m);if(d.id&&pending.has(d.id)){const p=pending.get(d.id);pending.delete(d.id);d.error?p.rej(Error(d.error.message)):p.res(d.result);}if(d.method==='Runtime.exceptionThrown')logs.push('EXC '+d.params.exceptionDetails.exception?.description);});
 await send('Runtime.enable');await send('Page.enable');await send('Emulation.setDeviceMetricsOverride',{width:540,height:960,deviceScaleFactor:2,mobile:false});
 await send('Page.navigate',{url:`${base}/?overlay=1&world=live&stage=world&sound=0&voice=0&idle=0&quality=auto#tiktok.studio`});await pause(8000);
 const r=await(await fetch(base+'/api/ceremony?world=live',{method:'POST',headers:{'content-type':'application/json'},body:'{}'})).json();console.log('ceremony',JSON.stringify(r).slice(0,200));
 await pause(5500);const shot=await send('Page.captureScreenshot',{format:'png'});await fs.writeFile(out+'/ceremony.png',Buffer.from(shot.data,'base64'));
 const probe=await send('Runtime.evaluate',{returnByValue:true,expression:`JSON.stringify([...document.querySelectorAll('.cer-seat')].map(s=>{const r=s.getBoundingClientRect(),st=getComputedStyle(s);const top=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return {cls:s.className,x:Math.round(r.left),w:Math.round(r.width),y:Math.round(r.top),h:Math.round(r.height),op:st.opacity,vis:st.visibility,hitTop:top?(top.id||top.className||top.tagName):null}}))`});
 console.log(probe.result.value);console.log(logs.length?logs.join('\n'):'no console errors');
}finally{ws?.close();ch.kill();}
