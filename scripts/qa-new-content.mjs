// 08/11/2026: QA nhanh nội dung mới trên server THỬ (thế giới demo): đua cưỡi thú, map yêu thú, Chính–Ma nảy, lò đan.
// node scripts/qa-new-content.mjs [port] [race|boss|war|alchemy ...]
import {spawn} from 'node:child_process';import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import WebSocket from 'ws';
const port=Number(process.argv[2]||4411),parts=process.argv.slice(3).length?process.argv.slice(3):['race','boss','war','alchemy'],base=`http://127.0.0.1:${port}`,out='output/qa-new-content';await fs.mkdir(out,{recursive:true});
const pause=ms=>new Promise(r=>setTimeout(r,ms));const profile=await fs.mkdtemp(path.join(os.tmpdir(),'qnc-'));
const post=(p,b)=>fetch(base+p,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(b),signal:AbortSignal.timeout(8000)}).then(r=>r.json()).catch(e=>({err:e.message}));
const act=b=>post('/api/action?world=demo',b);const ctl=action=>post('/api/social-control?world=demo',{action});
const users=Array.from({length:10},(_,i)=>({id:'qa'+i,name:['An Nhiên','Bảo Ngọc','Chí Thanh','Dạ Lan','Hoàng Long','Kim Chi','Lạc Thiên','Minh Châu','Ngọc Hà','Phong Vân'][i]}));
const ch=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port=0','--no-first-run','--autoplay-policy=no-user-gesture-required',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
let ws,id=0;const pending=new Map(),logs=[];
const send=(method,params={})=>new Promise((res,rej)=>{const i=++id;pending.set(i,{res,rej});ws.send(JSON.stringify({id:i,method,params}));setTimeout(()=>{if(pending.has(i)){pending.delete(i);rej(Error('timeout '+method));}},20000);});
const clear=async()=>{for(const kind of ['boss','flowerEvent','visitor','opportunity'])await post('/api/social-control?world=demo',{action:'stop-current',kind});for(const a of ['stop-race','stop-war','stop-tournament','stop-bond-festival','stop-alchemy'])await ctl(a);};
try{let dp;for(let i=0;i<80;i++){try{dp=Number((await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0]);break;}catch{await pause(100)}}
 const ts=await(await fetch(`http://127.0.0.1:${dp}/json/list`)).json();ws=new WebSocket(ts.find(x=>x.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.on('open',r));
 ws.on('message',m=>{const d=JSON.parse(m);if(d.id&&pending.has(d.id)){const p=pending.get(d.id);pending.delete(d.id);d.error?p.rej(Error(d.error.message)):p.res(d.result);}if(d.method==='Runtime.exceptionThrown')logs.push('EXC '+JSON.stringify(d.params.exceptionDetails).slice(0,400));});
 await send('Runtime.enable');await send('Page.enable');
 const shot=async name=>{try{const r=await send('Page.captureScreenshot',{format:'jpeg',quality:75});await fs.writeFile(`${out}/${name}.jpg`,Buffer.from(r.data,'base64'));console.log('shot',name);}catch(e){console.log('shot fail',name,e.message);}};
 for(const u of users)await act({type:'chat',userId:u.id,name:u.name,text:'nhapmon'});
 await send('Emulation.setDeviceMetricsOverride',{width:540,height:960,deviceScaleFactor:1,mobile:false});
 await send('Page.navigate',{url:`${base}/?overlay=1&world=demo&stage=world&sound=0&voice=0&idle=1&quality=auto#tiktok.studio`});await pause(7000);
 if(parts.includes('race')){await clear();console.log('race',JSON.stringify(await ctl('start-race')));for(const u of users.slice(0,8))await act({type:'chat',userId:u.id,name:u.name,text:'bay'});await pause(4000);await shot('race-reg');
  const s=(await(await fetch(base+'/api/state?world=demo')).json()).raceStatus;const wait=Math.max(0,(s?.registrationEndsAt||Date.now())-Date.now())+5000;console.log('race wait',wait);await pause(Math.min(wait,60000));for(const u of users.slice(0,8))await act({type:'chat',userId:u.id,name:u.name,text:'danh'});await pause(1500);await shot('race-run');await pause(5000);await shot('race-run2');}
 if(parts.includes('boss')){for(const sp of ['storm-tiger','moon-fox','rebirth-phoenix']){await clear();console.log('boss',sp,JSON.stringify(await post('/api/boss?world=demo',{species:sp})));await pause(6000);await shot('boss-'+sp);}}
 if(parts.includes('war')){await clear();console.log('war',JSON.stringify(await ctl('start-war')));users.forEach((u,i)=>act({type:'chat',userId:u.id,name:u.name,text:i%2?'ma':'chinh'}));await pause(2000);
  const s=(await(await fetch(base+'/api/state?world=demo')).json()).sectWar;await pause(Math.max(0,(s?.registrationEndsAt||Date.now())-Date.now())+1500);
  for(let k=0;k<6;k++){const side=k%2;for(const u of users.filter((_,i)=>i%2===side))await act({type:'like',userId:u.id,name:u.name,count:40});if(k===2)await act({type:'gift',userId:'qa1',name:users[1].name,coins:10,count:1,eventId:'qw'+Date.now()});await pause(350);await shot('war-'+k);await pause(1200);}}
 if(parts.includes('alchemy')){await clear();console.log('alc',JSON.stringify(await ctl('start-alchemy')));for(const u of users)await act({type:'like',userId:u.id,name:u.name,count:10});await pause(13000);
  for(let k=0;k<4;k++){for(const u of users.slice(0,3))await act({type:'like',userId:u.id,name:u.name,count:40});await pause(2500);await shot('alc-'+k);}
  for(let k=0;k<4;k++){for(const u of users)await act({type:'like',userId:u.id,name:u.name,count:40});await pause(1200);}await shot('alc-hot');await act({type:'gift',userId:'qa4',name:users[4].name,coins:1,count:1,eventId:'qa-r'+Date.now()});await pause(700);await shot('alc-rose');}
 console.log(logs.length?logs.join('\n'):'no console errors');
}finally{ws?.close();ch.kill();}
