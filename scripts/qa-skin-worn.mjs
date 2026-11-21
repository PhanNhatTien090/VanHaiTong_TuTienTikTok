// 21/11/2026: QA skin KHI MẶC trên sân + tiên nhân lúc MỞ BÁN, server THỬ (cổng 4399, dữ liệu tạm) — không đụng LIVE.
// node scripts/qa-skin-worn.mjs [outDir] [visitorKind] → ảnh sân (nhịp bùng thật + ép bùng) + ảnh tiên nhân theo giây + lỗi
import {spawn} from 'node:child_process';import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import WebSocket from 'ws';
const port=4399,base=`http://127.0.0.1:${port}`,out=process.argv[2]||'output/skin-worn',vkind=process.argv[3]||'khuyniet';await fs.mkdir(out,{recursive:true});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const data=await fs.mkdtemp(path.join(os.tmpdir(),'skinworn-data-'));
const env={...process.env,PORT:String(port),VAN_HAI_DATA_DIR:data,VAN_HAI_TTS:'off',VAN_HAI_BRIDGE_AUTO:'0',VAN_HAI_WEB:'0'};
const start=()=>spawn(process.execPath,['server.mjs'],{env,stdio:'ignore',windowsHide:true});
const post=async(p,b)=>(await fetch(base+p,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(b)})).json();
const act=b=>post('/api/action?world=demo',b);
const up=async()=>{for(let i=0;i<120;i++){try{await fetch(base+'/api/state?world=demo');return;}catch{await pause(250);}}throw Error('server không lên');};
const WEAR=[['a','Tinh Hà','tinh-ha-kiem-de','tinh-ha-kiem'],['b','Bích Lân','bich-lan-doc-hau','van-co-xa-truong'],['c','Nữ Oa','nu-oa','bo-thien-linh-chau'],['d','U Minh','u-minh-ma-de','van-hon-phien']];
let srv=start(),ch;
try{
 await up();for(const [id,name] of WEAR)await act({type:'join',userId:id,name});
 await pause(4500);srv.kill();await pause(1500);
 const files=(await fs.readdir(data)).filter(f=>/demo.*\.json$/.test(f));const file=path.join(data,files.find(f=>f==='demo.json')||files[0]);
 const w=JSON.parse(await fs.readFile(file,'utf8'));
 for(const [id,,skin,gear] of WEAR){const p=w.players[id];p.rewardSkins=[skin];p.skinChoice=skin;p.skinGear=[gear];p.artifacts=[...(p.artifacts||[]),gear];p.equipped=gear;p.gender=id==='b'||id==='c'?'nu':'nam';}
 delete w.visitor;delete w.boss;delete w.miniEvent;w.nextBossAt=Date.now()+36e5;w.nextSmallAt=Date.now()+36e5;
 await fs.writeFile(file,JSON.stringify(w));
 srv=start();await up();
 const prof=await fs.mkdtemp(path.join(os.tmpdir(),'skinworn-ch-'));
 ch=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--mute-audio','--remote-debugging-port=0','--no-first-run',`--user-data-dir=${prof}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
 let dp;for(let i=0;i<80;i++){try{dp=Number((await fs.readFile(path.join(prof,'DevToolsActivePort'),'utf8')).split('\n')[0]);break;}catch{await pause(100)}}
 const ts=await(await fetch(`http://127.0.0.1:${dp}/json/list`)).json();const ws=new WebSocket(ts.find(x=>x.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.on('open',r));
 let id=0;const pend=new Map(),logs=[];const send=(m,p={})=>new Promise((res,rej)=>{const i=++id;pend.set(i,{res,rej});ws.send(JSON.stringify({id:i,method:m,params:p}));});
 ws.on('message',m=>{const d=JSON.parse(m);if(d.id&&pend.has(d.id)){const p=pend.get(d.id);pend.delete(d.id);d.error?p.rej(Error(d.error.message)):p.res(d.result);}if(d.method==='Runtime.exceptionThrown'){logs.push('EXC '+String(d.params.exceptionDetails.exception?.description||d.params.exceptionDetails.text).slice(0,300));}});
 await send('Runtime.enable');await send('Page.enable');await send('Emulation.setDeviceMetricsOverride',{width:540,height:960,deviceScaleFactor:2,mobile:false});
 const shot=async n=>{const r=await send('Page.captureScreenshot',{format:'jpeg',quality:86});await fs.writeFile(`${out}/${n}.jpg`,Buffer.from(r.data,'base64'));};
 const ev=async e=>(await send('Runtime.evaluate',{expression:e,returnByValue:true})).result?.value;
 await send('Page.navigate',{url:`${base}/?overlay=1&world=demo&stage=world&quality=${process.env.Q||'auto'}&qa=1`});await pause(8000);
 console.log('scene',await ev(`JSON.stringify({compact:__vhScene?.compact,crowded:__vhScene?.crowded,level:__vhScene?.budget?.level,prem:(__vhScene?.premiumTargets||[]).map(t=>t.player?.id)})`));
 for(let i=0;i<5;i++){await shot('san-'+i);await pause(8000);} // 40 s = đủ 1 vòng nhịp bùng của mỗi người
 await ev('__vhScene.alwaysSkinFx=true');await pause(800);await shot('san-ep-bung');await ev('__vhScene.alwaysSkinFx=false');
 console.log('visitor',JSON.stringify(await post('/api/visitor-event?world=demo',{kind:vkind})).slice(0,160));
 for(const s of [2,6,12,20,30]){await pause(s===2?2000:(s-[2,6,12,20,30][[2,6,12,20,30].indexOf(s)-1])*1000);await shot('tien-nhan-'+s+'s');}
 const perf=await send('Runtime.evaluate',{awaitPromise:true,returnByValue:true,expression:`new Promise(r=>{let n=0,t0=performance.now();const f=()=>{n++;if(performance.now()-t0<3000)requestAnimationFrame(f);else r(n/3);};requestAnimationFrame(f);})`});
 console.log('fps',perf.result?.value);console.log('logs',logs.slice(0,10).join('\n')||'(không lỗi)');
}finally{try{ch?.kill();}catch{}srv.kill();}
