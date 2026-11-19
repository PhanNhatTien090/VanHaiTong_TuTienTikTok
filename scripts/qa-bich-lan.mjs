// 19/11/2026: QA skin Bích Lân Độc Hậu trên server THỬ (cổng 4399, dữ liệu tạm) — không đụng LIVE. (bản sao qa-tinh-ha.mjs)
// node scripts/qa-tinh-ha.mjs → output/bich-lan/*.jpg (thẻ sự kiện, màn biến hình theo mốc, sân sau khi nhận skin) + FPS + lỗi
import {spawn} from 'node:child_process';import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import WebSocket from 'ws';
const port=Number(process.argv[2]||4399),base=`http://127.0.0.1:${port}`,out='output/bich-lan';await fs.mkdir(out,{recursive:true});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const data=await fs.mkdtemp(path.join(os.tmpdir(),'bichlan-data-'));
const srv=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),VAN_HAI_DATA_DIR:data,VAN_HAI_TTS:'off',VAN_HAI_BRIDGE_AUTO:'0',VAN_HAI_WEB:'0'},stdio:'ignore',windowsHide:true});
const post=async(p,b)=>(await fetch(base+p,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(b)})).json();
const act=b=>post('/api/action?world=demo',b);
let ch;
try{
 for(let i=0;i<80;i++){try{await fetch(base+'/api/state?world=demo');break;}catch{await pause(250);}}
 for(const [id,name] of [['a','Đế giang'],['b','Tuyền Xinh Gáii'],['c','Công Tài'],['d','Tuần Sơn'],['e','Mẹ em Gạo'],['f','Kiếm Khách']])await act({type:'join',userId:id,name});
 const prof=await fs.mkdtemp(path.join(os.tmpdir(),'bichlan-ch-'));
 ch=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port=0','--no-first-run',`--user-data-dir=${prof}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
 let dp;for(let i=0;i<80;i++){try{dp=Number((await fs.readFile(path.join(prof,'DevToolsActivePort'),'utf8')).split('\n')[0]);break;}catch{await pause(100)}}
 const ts=await(await fetch(`http://127.0.0.1:${dp}/json/list`)).json();const ws=new WebSocket(ts.find(x=>x.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.on('open',r));
 let id=0;const pend=new Map(),logs=[];const send=(m,p={})=>new Promise((res,rej)=>{const i=++id;pend.set(i,{res,rej});ws.send(JSON.stringify({id:i,method:m,params:p}));});
 ws.on('message',m=>{const d=JSON.parse(m);if(d.id&&pend.has(d.id)){const p=pend.get(d.id);pend.delete(d.id);d.error?p.rej(Error(d.error.message)):p.res(d.result);}if(d.method==='Runtime.exceptionThrown'){const t=String(d.params.exceptionDetails.exception?.description||'');if(!t.includes("reading 'stop'"))logs.push('EXC '+t.slice(0,300));}});
 await send('Runtime.enable');await send('Page.enable');await send('Emulation.setDeviceMetricsOverride',{width:540,height:960,deviceScaleFactor:2,mobile:false});
 const shot=async n=>{const r=await send('Page.captureScreenshot',{format:'jpeg',quality:84});await fs.writeFile(`${out}/${n}.jpg`,Buffer.from(r.data,'base64'));};
 await send('Page.navigate',{url:`${base}/?overlay=1&world=demo&stage=world&quality=high&qa=1`});await pause(6000);
 console.log('visitor',JSON.stringify(await post('/api/visitor-event?world=demo',{kind:'bich-lan'})).slice(0,200));await pause(3500);await shot('01-su-kien');
 console.log('gift',JSON.stringify(await act({type:'gift',userId:'a',name:'Đế giang',coins:500,count:1,giftName:'Vương miện',eventId:'g500'})).slice(0,300));
 for(const [ms,n] of [[1500,'02-bien-hinh-1s5'],[2000,'03-bien-hinh-3s5'],[1500,'04-bien-hinh-5s'],[2500,'05-bien-hinh-7s5'],[4000,'06-sau-bien-hinh']])
  {await pause(ms);await shot(n);}
 const perf=await send('Runtime.evaluate',{awaitPromise:true,returnByValue:true,expression:`new Promise(r=>{let n=0,t0=performance.now();const f=()=>{n++;if(performance.now()-t0<3000)requestAnimationFrame(f);else r(n/3);};requestAnimationFrame(f);})`});
 console.log('fps',perf.result?.value);
 const st=await (await fetch(base+'/api/state?world=demo')).json(),p=st.players.find(x=>x.id==='a');console.log('a',JSON.stringify({skin:p.skinChoice,skins:p.rewardSkins,arts:(p.artifacts||[]).filter(x=>x.includes('xa-truong'))}));
 console.log('logs',logs.slice(0,10).join('\n')||'(không lỗi)');
}finally{try{ch?.kill();}catch{}srv.kill();}
