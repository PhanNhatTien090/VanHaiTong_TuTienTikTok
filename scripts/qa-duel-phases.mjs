// 15/11/2026 V4: QA nhịp trận Luận Kiếm trên server THỬ riêng (dữ liệu tạm, không đụng LIVE).
// node scripts/qa-duel-phases.mjs [port]  → output/qa-duel-phases/<pha>.jpg
import {spawn} from 'node:child_process';import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import WebSocket from 'ws';
const port=Number(process.argv[2]||4412),base=`http://127.0.0.1:${port}`,out='output/qa-duel-phases';await fs.mkdir(out,{recursive:true});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const data=await fs.mkdtemp(path.join(os.tmpdir(),'qa-duel-data-')),profile=await fs.mkdtemp(path.join(os.tmpdir(),'qa-duel-chrome-'));
const server=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),VAN_HAI_DATA_DIR:data,VAN_HAI_TTS:'off',WEB_PROFILE_ONLY:'1'},stdio:'ignore',windowsHide:true});
const post=(p,b)=>fetch(base+p,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(b),signal:AbortSignal.timeout(8000)}).then(r=>r.json()).catch(e=>({err:e.message}));
const act=b=>post('/api/action?world=demo',b);
const users=[{id:'qa-l',name:'Thanh Vân'},{id:'qa-r',name:'Bạch Nguyệt'}];
let ch,ws,id=0;const pending=new Map(),logs=[];
const send=(method,params={})=>new Promise((res,rej)=>{const i=++id;pending.set(i,{res,rej});ws.send(JSON.stringify({id:i,method,params}));setTimeout(()=>{if(pending.has(i)){pending.delete(i);rej(Error('timeout '+method));}},20000);});
try{
 for(let i=0;i<60;i++){try{if((await fetch(base+'/api/state?world=demo')).ok)break;}catch{}await pause(250);}
 ch=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port=0','--no-first-run',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
 let dp;for(let i=0;i<80;i++){try{dp=Number((await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0]);break;}catch{await pause(100)}}
 const ts=await(await fetch(`http://127.0.0.1:${dp}/json/list`)).json();ws=new WebSocket(ts.find(x=>x.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.on('open',r));
 ws.on('message',m=>{const d=JSON.parse(m);if(d.id&&pending.has(d.id)){const p=pending.get(d.id);pending.delete(d.id);d.error?p.rej(Error(d.error.message)):p.res(d.result);}if(d.method==='Runtime.exceptionThrown')logs.push('EXC '+JSON.stringify(d.params.exceptionDetails).slice(0,400));});
 await send('Runtime.enable');await send('Page.enable');
 const shot=async name=>{const r=await send('Page.captureScreenshot',{format:'jpeg',quality:80});await fs.writeFile(`${out}/${name}.jpg`,Buffer.from(r.data,'base64'));console.log('shot',name);};
 for(const u of users)await act({type:'chat',userId:u.id,name:u.name,text:'nhapmon'});
 await send('Emulation.setDeviceMetricsOverride',{width:540,height:960,deviceScaleFactor:1,mobile:false});
 await send('Page.navigate',{url:`${base}/?overlay=1&world=demo&stage=world&sound=0&voice=0&idle=1&quality=auto#tiktok.studio`});await pause(6000);
 console.log('start',JSON.stringify(await post('/api/social-control?world=demo',{action:'start-tournament'})));
 for(const u of users)await act({type:'chat',userId:u.id,name:u.name,text:'tythi'});
 // giữ 2 người "đang hoạt động" trong 90 s ghi danh
 let state;for(;;){state=(await(await fetch(base+'/api/state?world=demo')).json());const t=state.socialStatus?.tournament;if(t?.current)break;if(t&&!['registration','running'].includes(t.phase)){console.log('tournament ended early',t.phase);break;}for(const u of users)await act({type:'chat',userId:u.id,name:u.name,text:'tuvi'});await pause(4000);}
 const m=state.socialStatus?.tournament?.current;if(!m)throw Error('no duel');
 const startedAt=m.startedAt,serverNow=state.serverNow,skew=Date.now()-serverNow;
 const marks=[['1-thamdo',3300],['2-tukhi',8200],['3-congkich',12900],['4-phongthu',18000],['5-tuyetky',20600],['6-tuyetky-va',21300],['7-ketthuc',24000]];
 for(const [name,at] of marks){const wait=startedAt+skew+at-Date.now();if(wait>0)await pause(wait);await shot(name);}
 if(marks.length)await act({type:'chat',userId:'qa-r',name:'Bạch Nguyệt',text:'kiem'});
 console.log(logs.length?logs.join('\n'):'no console errors');
}finally{ws?.close();ch?.kill();server.kill();await pause(500);await fs.rm(data,{recursive:true,force:true}).catch(()=>{});}
