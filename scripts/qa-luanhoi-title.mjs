// 21/11: QA danh hiệu Luân Hồi đi kèm Tông Chủ/Kim Cương (cắt từ qa-luan-hoi.mjs) → output/luan-hoi-title/
// 18/11/2026: QA Luân Hồi trên server THỬ (cổng 4399, dữ liệu tạm, thế giới demo) — không đụng LIVE.
// node scripts/qa-luan-hoi.mjs [port] → output/luan-hoi/*.jpg (sân có hào quang + huy hiệu ☸, từng mốc màn Niết Bàn Luân Hồi, màn chiếu thật)
import {spawn} from 'node:child_process';import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import WebSocket from 'ws';
const port=Number(process.argv[2]||4399),base=`http://127.0.0.1:${port}`,out='output/luan-hoi-title';await fs.mkdir(out,{recursive:true});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const data=await fs.mkdtemp(path.join(os.tmpdir(),'luanhoi-data-'));
const env={...process.env,PORT:String(port),VAN_HAI_DATA_DIR:data,VAN_HAI_TTS:'off',VAN_HAI_BRIDGE_AUTO:'0',VAN_HAI_WEB:'0'};
const start=()=>spawn(process.execPath,['server.mjs'],{env,stdio:'ignore',windowsHide:true});
const up=async()=>{for(let i=0;i<80;i++){try{await fetch(base+'/api/state?world=demo');return;}catch{await pause(250);}}throw Error('server không lên');};
const post=async(p,b)=>(await fetch(base+p,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(b)})).json();
const act=b=>post('/api/action?world=demo',b);
let srv=start(),ch,profile;
try{
 await up();
 const names=[['a','Mẹ em Gạo'],['b','Đế giang'],['c','Tuyền Xinh Gáii'],['d','Công Tài'],['e','Tuần Sơn'],['f','Kiếm Khách'],['g','Tiểu Long Nữ'],['h','Dương Quá']];
 for(const [id,name] of names)await act({type:'join',userId:id,name});
 await pause(4500);srv.kill();await pause(800);
 const file=path.join(data,'demo.json'),w=JSON.parse(await fs.readFile(file,'utf8'));
 Object.assign(w.players.b,{realm:5,highestRealm:28,reincarnations:1,qi:0,stones:1e6,giftCoins:15493,sectMasterUnlocked:true,sectMasterGiftAt:Date.now(),sectMasterGiftCoins:2000,lastActive:Date.now()});Object.assign(w.players.a,{giftCoins:5000,reincarnations:2,highestRealm:27,lastActive:Date.now()});
 Object.assign(w.players.c,{realm:9,highestRealm:27,reincarnations:2,giftCoins:300,qi:1e12,stones:1e7,lastActive:Date.now()});
 Object.assign(w.players.d,{realm:4,highestRealm:26,reincarnations:5,lastActive:Date.now()});
 Object.assign(w.players.e,{realm:14,highestRealm:28,reincarnations:10,lastActive:Date.now()});
 w.settings={...w.settings,sceneMode:process.env.SCENE||w.settings?.sceneMode};for(const k of ['visitor','boss','miniEvent'])delete w[k];w.nextBossAt=Date.now()+36e5;w.nextSmallAt=Date.now()+36e5;
 await fs.writeFile(file,JSON.stringify(w));
 srv=start();await up();
 profile=await fs.mkdtemp(path.join(os.tmpdir(),'luanhoi-ch-'));
 ch=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port=0','--no-first-run','--autoplay-policy=no-user-gesture-required','--mute-audio',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
 let dp;for(let i=0;i<80;i++){try{dp=Number((await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0]);break;}catch{await pause(100)}}
 const ts=await(await fetch(`http://127.0.0.1:${dp}/json/list`)).json();const ws=new WebSocket(ts.find(x=>x.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.on('open',r));
 let id=0;const pending=new Map(),logs=[];const send=(method,params={})=>new Promise((res,rej)=>{const i=++id;pending.set(i,{res,rej});ws.send(JSON.stringify({id:i,method,params}));});
 ws.on('message',m=>{const d=JSON.parse(m);if(d.id&&pending.has(d.id)){const p=pending.get(d.id);pending.delete(d.id);d.error?p.rej(Error(d.error.message)):p.res(d.result);}if(d.method==='Runtime.exceptionThrown')logs.push('EXC '+d.params.exceptionDetails.exception?.description);if(d.method==='Runtime.consoleAPICalled'&&['error','warning'].includes(d.params.type))logs.push(d.params.type+' '+d.params.args.map(a=>a.value??a.description).join(' '));});
 await send('Runtime.enable');await send('Page.enable');
 await send('Emulation.setDeviceMetricsOverride',{width:540,height:960,deviceScaleFactor:2,mobile:false});
 const shot=async name=>{const r=await send('Page.captureScreenshot',{format:'jpeg',quality:84});await fs.writeFile(`${out}/${name}.jpg`,Buffer.from(r.data,'base64'));};
 const ev=async expr=>(await send('Runtime.evaluate',{awaitPromise:true,returnByValue:true,expression:expr})).result?.value;
 await send('Page.navigate',{url:`${base}/?overlay=1&world=demo&stage=world&quality=high&qa=1`});await pause(7000);
 await shot('01-san-thuong');
 // ép giờ để c/d/e đang BÙNG hào quang
 await ev(`(async()=>{const m=await import('/luan-hoi-fx.js?v=20261118');const real=Date.now.bind(Date);const base=real();let best=0,bestN=-1;for(let k=0;k<45000;k+=150){const n=['c','d','e'].filter(id=>m.luanBurst(id,base+k)>.8).length;if(n>bestN){bestN=n;best=k;}}window.__realNow=real;Date.now=()=>real()+best;return bestN;})()`);
 await shot('03-tong-chu-luan-hoi');
}finally{try{ch?.kill();}catch{}srv.kill();}
