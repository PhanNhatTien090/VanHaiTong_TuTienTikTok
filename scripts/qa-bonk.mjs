// 10/11/2026: QA Hội Gõ Đầu — tự bật server THỬ (cổng 4399, dữ liệu tạm riêng, thế giới demo), không đụng LIVE.
// node scripts/qa-bonk.mjs [port]  → ảnh trong output/bonk/
import {spawn} from 'node:child_process';import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import WebSocket from 'ws';
const port=Number(process.argv[2]||4399),base=`http://127.0.0.1:${port}`,out='output/bonk'+(process.env.HAMMER_COINS?'-h'+process.env.HAMMER_COINS:'');await fs.mkdir(out,{recursive:true});
const pause=ms=>new Promise(r=>setTimeout(r,ms));const data=await fs.mkdtemp(path.join(os.tmpdir(),'bonk-data-')),profile=await fs.mkdtemp(path.join(os.tmpdir(),'bonk-'));
const srv=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),VAN_HAI_DATA_DIR:data},stdio:'ignore',windowsHide:true});
const post=(p,b)=>fetch(base+p,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(b)}).then(r=>r.json());
const act=b=>post('/api/action?world=demo',b);
const users=Array.from({length:8},(_,i)=>({id:'qa'+i,name:['An Nhiên','Bảo Ngọc','Chí Thanh','Dạ Lan','Hoàng Long','Kim Chi','Lạc Thiên','Minh Châu'][i]}));
let ch,ws,id=0;const pending=new Map(),logs=[];
const send=(method,params={})=>new Promise((res,rej)=>{const i=++id;pending.set(i,{res,rej});ws.send(JSON.stringify({id:i,method,params}));setTimeout(()=>{if(pending.has(i)){pending.delete(i);rej(Error('timeout '+method));}},15000);});
try{for(let i=0;i<60;i++){try{if((await fetch(base+'/api/state?world=demo')).ok)break;}catch{}await pause(500);}
 ch=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port=0','--no-first-run','--mute-audio',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
 let dp;for(let i=0;i<80;i++){try{dp=Number((await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0]);break;}catch{await pause(100)}}
 const ts=await(await fetch(`http://127.0.0.1:${dp}/json/list`)).json();ws=new WebSocket(ts.find(x=>x.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.on('open',r));
 ws.on('message',m=>{const d=JSON.parse(m);if(d.id&&pending.has(d.id)){const p=pending.get(d.id);pending.delete(d.id);d.error?p.rej(Error(d.error.message)):p.res(d.result);}if(d.method==='Runtime.exceptionThrown')logs.push('EXC '+JSON.stringify(d.params.exceptionDetails).slice(0,400));if(d.method==='Runtime.consoleAPICalled'&&d.params.type==='error')logs.push('ERR '+JSON.stringify(d.params.args).slice(0,300));});
 await send('Runtime.enable');await send('Page.enable');
 const shot=async name=>{const r=await send('Page.captureScreenshot',{format:'jpeg',quality:80});await fs.writeFile(`${out}/${name}.jpg`,Buffer.from(r.data,'base64'));console.log('shot',name);};
 for(const u of users)await act({type:'chat',userId:u.id,name:u.name,text:'nhapmon'});
 await send('Emulation.setDeviceMetricsOverride',{width:540,height:960,deviceScaleFactor:2,mobile:false});
 await send('Page.navigate',{url:`${base}/?overlay=1&world=demo&stage=world&sound=0&voice=0&idle=1&quality=auto#tiktok.studio`});await pause(8000);
 for(const kind of ['boss','flowerEvent','visitor','opportunity'])await post('/api/social-control?world=demo',{action:'stop-current',kind});
 console.log('start',JSON.stringify(await post('/api/social-control?world=demo',{action:'start-bonk'})));
 for(const u of users)await act({type:'chat',userId:u.id,name:u.name,text:'tuluyen'});await pause(4000);await shot('00-open');
 const tier=Number(process.env.HAMMER_COINS||0);if(tier)console.log('gift',JSON.stringify(await act({type:'gift',userId:'qa0',name:users[0].name,coins:tier,count:1,eventId:'qa-h'+Date.now()})));await pause(tier?2500:0);
 console.log('hit',JSON.stringify(await act({type:'chat',userId:'qa0',name:users[0].name,text:'go Hoàng Long'})));
 const t0=Date.now();for(const ms of [450,950,1300,1550,2100,2700]){await pause(Math.max(0,t0+ms-Date.now()));await shot('1-'+String(ms).padStart(4,'0'));}
 await act({type:'chat',userId:'qa2',name:users[2].name,text:'gõ đầu kim chi'});await act({type:'chat',userId:'qa6',name:users[6].name,text:'go'});await pause(1400);await shot('2-double');
 await pause(3000);console.log('stop',JSON.stringify(await post('/api/social-control?world=demo',{action:'stop-bonk'})));await pause(2500);await shot('3-result');
 console.log(logs.length?logs.join('\n'):'no console errors');
}finally{ws?.close();ch?.kill();srv.kill();}
