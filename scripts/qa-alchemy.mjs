// 08/11/2026: QA Khai Lò Cửu Chuyển — chạy trên server THỬ (cổng 4399, dữ liệu riêng, thế giới demo), không đụng LIVE.
// node scripts/qa-alchemy.mjs [port] [mode: good|boom]
import {spawn} from 'node:child_process';import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import WebSocket from 'ws';
const port=Number(process.argv[2]||4399),mode=process.argv[3]||'good',base=`http://127.0.0.1:${port}`,out='output/alchemy-'+mode;await fs.mkdir(out,{recursive:true});
const pause=ms=>new Promise(r=>setTimeout(r,ms));const profile=await fs.mkdtemp(path.join(os.tmpdir(),'alc-'));
const post=(p,b)=>fetch(base+p,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(b)}).then(r=>r.json());
const act=b=>post('/api/action?world=demo',b);const state=()=>fetch(base+'/api/state?world=demo').then(r=>r.json());
const users=Array.from({length:10},(_,i)=>({id:'qa'+i,name:['An Nhiên','Bảo Ngọc','Chí Thanh','Dạ Lan','Hoàng Long','Kim Chi','Lạc Thiên','Minh Châu','Ngọc Hà','Phong Vân'][i]}));
const ch=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port=0','--no-first-run','--autoplay-policy=no-user-gesture-required',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
let ws,id=0;const pending=new Map(),logs=[];
const send=(method,params={})=>new Promise((res,rej)=>{const i=++id;pending.set(i,{res,rej});ws.send(JSON.stringify({id:i,method,params}));setTimeout(()=>{if(pending.has(i)){pending.delete(i);rej(Error('timeout '+method));}},15000);});
try{let dp;for(let i=0;i<80;i++){try{dp=Number((await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0]);break;}catch{await pause(100)}}
 const ts=await(await fetch(`http://127.0.0.1:${dp}/json/list`)).json();ws=new WebSocket(ts.find(x=>x.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.on('open',r));
 ws.on('message',m=>{const d=JSON.parse(m);if(d.id&&pending.has(d.id)){const p=pending.get(d.id);pending.delete(d.id);d.error?p.rej(Error(d.error.message)):p.res(d.result);}if(d.method==='Runtime.exceptionThrown')logs.push('EXC '+JSON.stringify(d.params.exceptionDetails).slice(0,400));if(d.method==='Runtime.consoleAPICalled'&&d.params.type==='error')logs.push('ERR '+JSON.stringify(d.params.args).slice(0,300));});
 await send('Runtime.enable');await send('Page.enable');
 const shot=async name=>{console.log('shooting',name,new Date().toISOString());const r=await send('Page.captureScreenshot',{format:'jpeg',quality:78});await fs.writeFile(`${out}/${name}.jpg`,Buffer.from(r.data,'base64'));console.log('shot',name);};
 for(const u of users)await act({type:'chat',userId:u.id,name:u.name,text:'nhapmon'});
 await send('Emulation.setDeviceMetricsOverride',{width:540,height:960,deviceScaleFactor:2,mobile:false});
 await send('Page.navigate',{url:`${base}/?overlay=1&world=demo&stage=world&sound=0&voice=0&idle=1&quality=auto#tiktok.studio`});await pause(8000);
 for(const kind of ['boss','flowerEvent','visitor','opportunity'])await post('/api/social-control?world=demo',{action:'stop-current',kind});for(const a of ['stop-race','stop-war','stop-tournament','stop-bond-festival'])await post('/api/social-control?world=demo',{action:a});
 console.log('start',JSON.stringify(await post('/api/social-control?world=demo',{action:'start-alchemy'})));
 for(let i=0;i<90;i++){const a=(await state()).alchemy;if(a&&a.phase!=='queued')break;await pause(1000);}console.log('phase',(await state()).alchemy?.phase);
 for(const u of users.slice(0,4))await act({type:'like',userId:u.id,name:u.name,count:10});await pause(2500);await shot('01-opening');
 const t0=Date.now(),shots=new Set();let g=0;
 for(let step=0;step<400;step++){const s=(await state()).alchemy;if(!s)break;const el=(Date.now()-t0)/1000;
  if(s.phase==='finished'){await pause(3500);await shot('90-result');await pause(5000);await shot('91-result');break;}
  if(mode==='boom'){for(const u of users)await act({type:'like',userId:u.id,name:u.name,count:40});if(s.heat>85&&!shots.has('danger')){shots.add('danger');await shot('20-danger');}}
  else if(s.phase==='brewing'){const z=s.zone;const want=s.heat<z.c-2;if(want)for(const u of users.slice(0,1+Math.floor(Math.random()*3)))await act({type:'like',userId:u.id,name:u.name,count:10});
   if(s.quiz&&!shots.has('q'+s.round)&&Date.now()>=s.quiz.startsAt+1500){shots.add('q'+s.round);for(const u of users.slice(0,6))await act({type:'chat',userId:u.id,name:u.name,text:String(1+Math.floor(Math.random()*2))});await pause(600);await shot('3'+s.round+'-quiz');}
   if(s.incident&&!shots.has('i'+s.round)){shots.add('i'+s.round);await pause(500);await shot('4'+s.round+'-incident-'+s.incident.kind);if(s.incident.kind==='rat')for(const u of users.slice(0,6))await act({type:'chat',userId:u.id,name:u.name,text:'bat'});}
   if(s.round===1&&el>22&&!shots.has('rose')){shots.add('rose');await act({type:'gift',userId:'qa3',name:users[3].name,coins:1,count:1,giftName:'Rose',eventId:'qa-r'+Date.now()});await pause(700);await shot('50-rose');}
   if(s.round===2&&!shots.has('herb')&&el>50){shots.add('herb');await act({type:'gift',userId:'qa5',name:users[5].name,coins:10,count:1,eventId:'qa-h'+Date.now()});await pause(900);await shot('51-herb');}
   if(s.round===3&&!shots.has('fire')&&el>85){shots.add('fire');await act({type:'gift',userId:'qa7',name:users[7].name,coins:199,count:1,eventId:'qa-f'+Date.now()});await pause(900);await shot('52-fire');await pause(2500);await shot('53-locked');}
   if(!shots.has('brew'+s.round)&&el>(s.round*32-12)){shots.add('brew'+s.round);await shot('2'+s.round+'-brew');}}
  else if(s.phase==='tribulation'){for(const u of users)await act({type:'like',userId:u.id,name:u.name,count:40});if(!shots.has('trib')){shots.add('trib');await pause(1200);await shot('60-trib');}if(g++%3===0)await act({type:'gift',userId:'qa2',name:users[2].name,coins:1,count:1,eventId:'qa-s'+Date.now()});}
  await pause(mode==='boom'?600:900);}
 if(mode==='boom'){await pause(14000);await shot('95-soot');}
 const fin=(await state()).alchemy;console.log('final',JSON.stringify({phase:fin?.phase,result:fin?.result&&{grade:fin.result.grade,exploded:fin.result.exploded,trib:fin.result.trib}}));
 console.log(logs.length?logs.join('\n'):'no console errors');
}finally{ws?.close();ch.kill();}
