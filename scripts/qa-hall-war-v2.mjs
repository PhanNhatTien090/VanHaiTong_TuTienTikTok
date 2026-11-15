// 15/11/2026: QA Ngũ Đường Giao Lưu v2 trên server THỬ riêng (dữ liệu tạm, không đụng LIVE).
// node scripts/qa-hall-war-v2.mjs [port] [số người] [full]  → output/qa-hall-war-v2-<n>/*.jpg (+ frames/ cho GIF)
import {spawn} from 'node:child_process';import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import WebSocket from 'ws';
const port=Number(process.argv[2]||4413),count=Number(process.argv[3]||12),full=process.argv[4]==='full',base=`http://127.0.0.1:${port}`,out=`output/qa-hall-war-v2-${count}`;
await fs.rm(out,{recursive:true,force:true});await fs.mkdir(out+'/frames',{recursive:true});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const data=await fs.mkdtemp(path.join(os.tmpdir(),'qa-hw2-data-')),profile=await fs.mkdtemp(path.join(os.tmpdir(),'qa-hw2-chrome-'));
const server=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),VAN_HAI_DATA_DIR:data,VAN_HAI_TTS:'off',WEB_PROFILE_ONLY:'1'},stdio:'ignore',windowsHide:true});
const post=(p,b)=>fetch(base+p,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(b),signal:AbortSignal.timeout(8000)}).then(r=>r.json()).catch(e=>({err:e.message}));
const act=b=>post('/api/action?world=demo',b);
const NAMES=['Thanh Vân','Bạch Nguyệt','Lâm Phong','Hải Lam','Mộc Thanh','Vương Lâm','Tiêu Viêm','Hàn Lập','Thu Phương','Cổ Hà','Tèo','duy_CN','Hlevi','Phương Nguyễn','Tiệm của Pu'];
const users=Array.from({length:count},(_,i)=>({id:'qa-'+i,name:NAMES[i%NAMES.length]+(i>=NAMES.length?' '+Math.floor(i/NAMES.length):''),hall:i%5+1}));
const all=async text=>{for(let i=0;i<users.length;i+=25)await Promise.all(users.slice(i,i+25).map(u=>act({type:'chat',userId:u.id,name:u.name,text})));};
let ch,ws,id=0;const pending=new Map(),logs=[];
const send=(method,params={})=>new Promise((res,rej)=>{const i=++id;pending.set(i,{res,rej});ws.send(JSON.stringify({id:i,method,params}));setTimeout(()=>{if(pending.has(i)){pending.delete(i);rej(Error('timeout '+method));}},20000);});
try{
 for(let i=0;i<60;i++){try{if((await fetch(base+'/api/state?world=demo')).ok)break;}catch{}await pause(250);}
 ch=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port=0','--no-first-run',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
 let dp;for(let i=0;i<80;i++){try{dp=Number((await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0]);break;}catch{await pause(100)}}
 const ts=await(await fetch(`http://127.0.0.1:${dp}/json/list`)).json();ws=new WebSocket(ts.find(x=>x.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.on('open',r));
 ws.on('message',m=>{const d=JSON.parse(m);if(d.id&&pending.has(d.id)){const p=pending.get(d.id);pending.delete(d.id);d.error?p.rej(Error(d.error.message)):p.res(d.result);}if(d.method==='Runtime.exceptionThrown')logs.push('EXC '+JSON.stringify(d.params.exceptionDetails).slice(0,500));if(d.method==='Runtime.consoleAPICalled'&&d.params.type==='error')logs.push('ERR '+JSON.stringify(d.params.args).slice(0,300));});
 await send('Runtime.enable');await send('Page.enable');
 const shot=async(name,dir=out)=>{const r=await send('Page.captureScreenshot',{format:'jpeg',quality:82});await fs.writeFile(`${dir}/${name}.jpg`,Buffer.from(r.data,'base64'));};
 for(const u of users){await act({type:'chat',userId:u.id,name:u.name,text:'nhapmon'});}
 for(const u of users){const r=await act({type:'chat',userId:u.id,name:u.name,text:'vao duong '+u.hall});if(!r.ok&&u.id==='qa-0')console.log('join',JSON.stringify(r));}
 await send('Emulation.setDeviceMetricsOverride',{width:540,height:960,deviceScaleFactor:1,mobile:false});
 await send('Page.navigate',{url:`${base}/?overlay=1&world=demo&stage=world&sound=0&voice=0&idle=1&quality=auto#tiktok.studio`});await pause(6000);
 console.log('start',JSON.stringify(await post('/api/social-control?world=demo',{action:'start-hall-war'})));
 await all('duongchien');await pause(2500);await shot('0-taphop');
 let state;for(;;){state=await(await fetch(base+'/api/state?world=demo')).json();if(state.hallWar?.phase==='running')break;if(!state.hallWar?.active){console.log('ended',state.hallWar?.phase);break;}await all('duongchien');await pause(4000);}
 const t0=Date.now();console.log('running with',state.hallWar.members.length,'members');
 const at=ms=>pause(Math.max(0,t0+ms-Date.now()));
 await at(5000);await shot('1-xuat-phat');
 await at(12000);await shot('2-giao-tranh');
 // khung liên tiếp để xem chuyển động
 for(let i=0;i<16;i++){await shot('f'+String(i).padStart(2,'0'),out+'/frames');await pause(150);}
 await all('duongchien');
 const g=users[0];
 await at(20000);await act({type:'chat',userId:users[1].id,name:users[1].name,text:'danh '+users[2].name});await act({type:'chat',userId:users[3].id,name:users[3].name,text:'6'});
 await act({type:'gift',userId:g.id,name:g.name,giftName:'Vương miện',coins:300,count:1,eventId:'qa-g1-'+Date.now()});
 await pause(700);await shot('3-dai-tuyet-chieu');await pause(500);await shot('3b-dai-tuyet-chieu');
 await at(26000);await act({type:'gift',userId:users[4].id,name:users[4].name,giftName:'Hoa',coins:99,count:1,eventId:'qa-g2-'+Date.now()});
 await pause(450);await shot('4-tuyet-chieu-99');
 await at(30000);await act({type:'gift',userId:users[2].id,name:users[2].name,giftName:'Hoa hồng',coins:1,count:1,eventId:'qa-g3-'+Date.now()});await pause(400);await shot('5-cuong-hoa');
 await all('duongchien');
 await at(33000);await act({type:'gift',userId:users[6%count].id,name:users[6%count].name,giftName:'Finger Heart',coins:5,count:2,eventId:'qa-g5-'+Date.now()});await pause(800);await shot('5b-phi-kiem-10');
 await at(37000);await act({type:'gift',userId:users[7%count].id,name:users[7%count].name,giftName:'Doughnut',coins:30,count:1,eventId:'qa-g6-'+Date.now()});await pause(650);await shot('5c-loi-kich-30');
 await at(41000);await act({type:'gift',userId:users[8%count].id,name:users[8%count].name,giftName:'Finger Heart',coins:5,count:1,eventId:'qa-g7-'+Date.now()});await pause(800);await shot('5d-hoi-xuan-5');
 await at(45000);await act({type:'gift',userId:users[5%count].id,name:users[5%count].name,giftName:'Vương miện',coins:300,count:1,eventId:'qa-g4-'+Date.now()});await pause(900);await shot('6-dai-tuyet-chieu-2');
 await at(60000);await shot('7-phut-1');
 const perf=await send('Runtime.evaluate',{expression:'JSON.stringify({budget:window.scene?.budget?.level})',returnByValue:true}).catch(()=>null);console.log('perf',perf?.result?.value);
 if(full){for(let s=70000;s<190000;s+=20000){await at(s);await all('duongchien');}await at(184000);await shot('8-vinh-danh');}
 const end=await(await fetch(base+'/api/state?world=demo')).json();
 console.log('teams',JSON.stringify(end.hallWar?.teams?.map(t=>[t.name,t.score,t.kills])));
 console.log(logs.length?logs.join('\n'):'no console errors');
}finally{ws?.close();ch?.kill();server.kill();await pause(500);await fs.rm(data,{recursive:true,force:true}).catch(()=>{});}
