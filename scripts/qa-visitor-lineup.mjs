// 20/11/2026: QA sự kiện skin TAM TIÊN (3 vị/lượt, mỗi vị 1 loại quà) trên server THỬ 4399 — không đụng LIVE.
// node scripts/qa-visitor-lineup.mjs → output/visitor-lineup/*.jpg + FPS + lỗi
import {spawn} from 'node:child_process';import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import WebSocket from 'ws';
const port=Number(process.argv[2]||4399),base=`http://127.0.0.1:${port}`,out='output/visitor-lineup';await fs.mkdir(out,{recursive:true});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const data=await fs.mkdtemp(path.join(os.tmpdir(),'lineup-data-'));
// có ảnh quà thật của kênh (giftArt) thì mới ghép được vị trùng giá → chép bản LIVE làm demo (chỉ đọc LIVE).
if(process.env.COPYLIVE)await fs.copyFile('data/live.json',path.join(data,'demo.json'));
const srv=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),VAN_HAI_DATA_DIR:data,VAN_HAI_TTS:'off',VAN_HAI_BRIDGE_AUTO:'0',VAN_HAI_WEB:'0'},stdio:'ignore',windowsHide:true});
const post=async(p,b)=>(await fetch(base+p,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(b)})).json();
const act=b=>post('/api/action?world=demo',b);
let ch;
try{
 for(let i=0;i<80;i++){try{await fetch(base+'/api/state?world=demo');break;}catch{await pause(250);}}
 const prof=await fs.mkdtemp(path.join(os.tmpdir(),'lineup-ch-'));
 ch=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--mute-audio','--remote-debugging-port=0','--no-first-run',`--user-data-dir=${prof}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
 let dp;for(let i=0;i<80;i++){try{dp=Number((await fs.readFile(path.join(prof,'DevToolsActivePort'),'utf8')).split('\n')[0]);break;}catch{await pause(100)}}
 const ts=await(await fetch(`http://127.0.0.1:${dp}/json/list`)).json();const ws=new WebSocket(ts.find(x=>x.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.on('open',r));
 let id=0;const pend=new Map(),logs=[];const send=(m,p={})=>new Promise((res,rej)=>{const i=++id;pend.set(i,{res,rej});ws.send(JSON.stringify({id:i,method:m,params:p}));});
 ws.on('message',m=>{const d=JSON.parse(m);if(d.id&&pend.has(d.id)){const p=pend.get(d.id);pend.delete(d.id);d.error?p.rej(Error(d.error.message)):p.res(d.result);}if(d.method==='Runtime.exceptionThrown'){const t=String(d.params.exceptionDetails.exception?.description||'');if(!t.includes("reading 'stop'"))logs.push('EXC '+t.slice(0,300));}});
 await send('Runtime.enable');await send('Page.enable');await send('Emulation.setDeviceMetricsOverride',{width:540,height:960,deviceScaleFactor:2,mobile:false});
 const shot=async n=>{const r=await send('Page.captureScreenshot',{format:'jpeg',quality:84});await fs.writeFile(`${out}/${n}.jpg`,Buffer.from(r.data,'base64'));};
 const fps=async()=>(await send('Runtime.evaluate',{awaitPromise:true,returnByValue:true,expression:`new Promise(r=>{let n=0,t0=performance.now();const f=()=>{n++;if(performance.now()-t0<3000)requestAnimationFrame(f);else r(n/3);};requestAnimationFrame(f);})`})).result?.value;
 await send('Page.navigate',{url:`${base}/?overlay=1&world=demo&stage=world&quality=high&qa=1`});await pause(6000);
 let g=0;
 for(const kind of process.argv.slice(3).length?process.argv.slice(3):['tinh-ha','khuyniet','hanlap']){
  // WANTNAMED=1: bốc lại tới khi lượt có vị trùng giá (gắn món riêng)
  let lineup=[];for(let tries=0;tries<12;tries++){const r=await post('/api/visitor-event?world=demo',{kind});if(!r.ok){console.log(kind,'start',r.message);await pause(1500);continue;}
   lineup=(await (await fetch(base+'/api/state?world=demo')).json()).visitor?.lineup||[];if(!process.env.WANTNAMED||lineup.some(s=>s.giftName))break;
   await post('/api/social-control?world=demo',{action:'stop-current',kind:'visitor'});await pause(2500);}
  console.log(kind,'lineup',JSON.stringify(lineup.map(s=>[s.kind,s.price,s.giftName||'(đủ coin)'])));
  await pause(4500);await shot(kind+'-1-tam-tien');console.log(' fps',await fps());
  if(!process.env.NOGIFT){const named=lineup.find(s=>s.giftName),open=lineup.find(s=>!s.giftName);
   if(named){const r=await act({type:'gift',userId:'qa1',name:'QA Một',coins:named.price,count:1,giftName:named.giftName,eventId:'g'+(++g)});console.log(' tặng đúng món',named.giftName,'→',named.kind,r.ok);}
   if(open){const r=await act({type:'gift',userId:'qa2',name:'QA Hai',coins:1,count:open.price,giftName:'Rose',eventId:'g'+(++g)});console.log(' tặng Rose ×'+open.price,'→',open.kind,r.ok);}
   await pause(3500);await shot(kind+'-2-bien-hinh');
   const st2=await (await fetch(base+'/api/state?world=demo')).json();for(const ev of (st2.events||[]).filter(x=>x.effect==='transform'&&/^qa/.test(x.user||'')))console.log('  biến hình',ev.user,ev.transform,ev.text);}
  await post('/api/social-control?world=demo',{action:'stop-current',kind:'visitor'});await pause(9000);
 }
 console.log('logs',logs.slice(0,10).join('\n')||'(không lỗi)');
}finally{try{ch?.kill();}catch{}srv.kill();}
