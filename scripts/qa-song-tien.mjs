// 21/11/2026: QA Song Tiên + Hạ Giá trên server THỬ (cổng 4399, dữ liệu tạm) — không đụng LIVE.
// node scripts/qa-song-tien.mjs [outDir] → mỗi lượt: ảnh lúc mở, (lượt có SALE) ảnh 0,4 s / 1,2 s / 3 s sau khi hạ giá + bảng sự kiện.
import {spawn} from 'node:child_process';import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import WebSocket from 'ws';
import {songTienRound,buildRound} from '../public/visitor-rewards.js';
const port=4399,base=`http://127.0.0.1:${port}`,out=process.argv[2]||'output/song-tien';await fs.mkdir(out,{recursive:true});
const ROUNDS=(process.env.ROUNDS||'than-de-vuong-lam,hoa-than:30,nu-oa,hai-than:20').split(',');
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const data=await fs.mkdtemp(path.join(os.tmpdir(),'songtien-data-'));
const env={...process.env,PORT:String(port),VAN_HAI_DATA_DIR:data,VAN_HAI_TTS:'off',VAN_HAI_BRIDGE_AUTO:'0',VAN_HAI_WEB:'0'};
const start=()=>spawn(process.execPath,['server.mjs'],{env,stdio:'ignore',windowsHide:true});
const post=async(p,b)=>(await fetch(base+p,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(b)})).json();
const up=async()=>{for(let i=0;i<120;i++){try{await fetch(base+'/api/state?world=demo');return;}catch{await pause(250);}}throw Error('server không lên');};
let srv=start(),ch,file;
const prof=await fs.mkdtemp(path.join(os.tmpdir(),'songtien-ch-'));
try{
 await up();for(const id of 'abcdefgh')await post('/api/action?world=demo',{type:'join',userId:id,name:'Đạo hữu '+id});
 await pause(4500);srv.kill();await pause(1500);
 const files=(await fs.readdir(data)).filter(f=>/demo.*\.json$/.test(f));file=path.join(data,files.find(f=>f==='demo.json')||files[0]);
 ch=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--mute-audio','--remote-debugging-port=0','--no-first-run',`--user-data-dir=${prof}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
 let dp;for(let i=0;i<80;i++){try{dp=Number((await fs.readFile(path.join(prof,'DevToolsActivePort'),'utf8')).split('\n')[0]);break;}catch{await pause(100)}}
 const ts=await(await fetch(`http://127.0.0.1:${dp}/json/list`)).json();const ws=new WebSocket(ts.find(x=>x.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.on('open',r));
 let id=0;const pend=new Map(),logs=[];const send=(m,p={})=>new Promise((res,rej)=>{const i=++id;pend.set(i,{res,rej});ws.send(JSON.stringify({id:i,method:m,params:p}));});
 ws.on('message',m=>{const d=JSON.parse(m);if(d.id&&pend.has(d.id)){const p=pend.get(d.id);pend.delete(d.id);d.error?p.rej(Error(d.error.message)):p.res(d.result);}if(d.method==='Runtime.exceptionThrown')logs.push('EXC '+String(d.params.exceptionDetails.exception?.description||d.params.exceptionDetails.text).slice(0,300));});
 await send('Runtime.enable');await send('Page.enable');await send('Emulation.setDeviceMetricsOverride',{width:540,height:960,deviceScaleFactor:2,mobile:false});
 const shot=async n=>{const r=await send('Page.captureScreenshot',{format:'jpeg',quality:86});await fs.writeFile(`${out}/${n}.jpg`,Buffer.from(r.data,'base64'));};
 for(const spec of ROUNDS){const [rid,pct]=spec.split(':');
  const w=JSON.parse(await fs.readFile(file,'utf8')),now=Date.now(),b=buildRound(songTienRound(rid),w.giftArt||{});
  w.visitor={id:'visitor-qa-'+rid,kind:b.lineup[0].kind,lineup:b.lineup,round:b.round,...(b.bundle?{bundle:b.bundle}:{}),startedAt:now+12000,endsAt:now+12000+240000,players:{},points:0,goal:20,bag:[],completed:false};
  delete w.boss;delete w.miniEvent;w.nextBossAt=now+36e5;w.nextSmallAt=now+36e5;w.nextVisitorAt=now+36e5;w.nextAutoEventAt=now+36e5;w.nextBigEventAt=now+36e5;
  await fs.writeFile(file,JSON.stringify(w));srv=start();await up();
  await send('Page.navigate',{url:`${base}/?overlay=1&world=demo&stage=world&quality=auto&qa=1`});await pause(12000);await shot(rid+'-mo');
  if(pct){console.log(rid,'sale',JSON.stringify(await post('/api/visitor-sale?world=demo',{pct:Number(pct)})).slice(0,200));
   for(const [ms,n] of [[400,'sale-0s4'],[800,'sale-1s2'],[1800,'sale-3s']]){await pause(ms);await shot(rid+'-'+n);}}
  srv.kill();await pause(1500);
 }
 console.log('logs',logs.slice(0,10).join('\n')||'(không lỗi)');
}finally{try{ch?.kill();}catch{}try{srv.kill();}catch{}}
