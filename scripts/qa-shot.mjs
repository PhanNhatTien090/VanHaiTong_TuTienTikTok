// 19/11/2026: công cụ QA chung cho đại tu giao diện Thủy Mặc — server THỬ (cổng 4399) + bản sao LIVE (N người có mặt, sự kiện đóng)
// + TikFinity giả (ws 21299). Không đụng LIVE.
// node scripts/qa-shot.mjs <tên> [kịch bản.json]   kịch bản: {"people":45,"url":"&ui=old","wait":9000,"steps":[[ms,"post","/api/boss?world=live",{}],[ms,"member","id","Tên"],[ms,"chat","id","Tên","nội dung"],[ms,"shot","hau-to"],[ms,"eval","js"]]}
// → output/qa-shot/<tên>-<hậu tố>.jpg ; in lỗi JS trên trang.
import {spawn} from 'node:child_process';import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import {WebSocketServer} from 'ws';
const [name='shot',file]=process.argv.slice(2);const plan=file?JSON.parse(await fs.readFile(file,'utf8')):{};
const port=4399,base=`http://127.0.0.1:${port}`,out='output/qa-shot';await fs.mkdir(out,{recursive:true});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const fake=new WebSocketServer({port:21299});const clients=new Set();fake.on('connection',ws=>clients.add(ws));const tik=e=>{for(const ws of clients)ws.send(JSON.stringify(e));};
const data=await fs.mkdtemp(path.join(os.tmpdir(),'qashot-'));for(const f of ['demo.json','source-visual.json'])await fs.copyFile('data/'+f,path.join(data,f)).catch(()=>{});
{const w=JSON.parse(await fs.readFile('data/live.json','utf8')),now=Date.now(),far=now+3600e3;
 if(w.visitor){w.visitor.closedAt=now-1000;w.visitor.endsAt=Math.min(w.visitor.endsAt,now-1000);}
 for(const k of ['boss','miniEvent','opportunity','envelope'])delete w[k];
 for(const [k,v] of Object.entries(w))if(v&&typeof v==='object'&&!Array.isArray(v)&&k!=='visitor'){if(v.phase&&!['idle','closed','done','ended','finished'].includes(v.phase)){v.phase='idle';v.endsAt=now-1000;v.closedAt=now-1000;}else if(v.endsAt>now&&!v.closedAt){v.endsAt=now-1000;v.closedAt=now-1000;}}
 for(const k of ['nextBossAt','nextSmallAt','nextBigEventAt','nextVisitorAt','nextOpportunityAt','nextMiniAt','nextBlessingAt','nextAutoEventAt'])w[k]=far;if(w.engagement)w.engagement.nextSmallAt=far;w.settings={...(w.settings||{}),bigEvents:false};w.lastCeremonyAt=now;w.honorStageUntil=0;
 const all=Object.values(w.players).filter(p=>!p.resident&&!p.puppet&&!p.webOnly).sort((a,b)=>(b.lastActive||0)-(a.lastActive||0));
 all.forEach((p,i)=>{if(i<(plan.people??45)){p.lastActive=now-i*2000;p.lastRealInteractionAt=now-i*2000;delete p.leftLiveAt;}else{p.lastActive=0;p.leftLiveAt=now-1;}});
 w.playTransfers={};w.liveSession={...(w.liveSession||{}),active:true,startedAt:now-3600e3};
 await fs.writeFile(path.join(data,'live.json'),JSON.stringify(w));}
const srv=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),VAN_HAI_DATA_DIR:data,VAN_HAI_TTS:'off',VAN_HAI_WEB:'0',WEB_SYNC_SECRET:'',VAN_HAI_TIKFINITY_URL:'ws://127.0.0.1:21299/'},stdio:'ignore',windowsHide:true});
const prof=await fs.mkdtemp(path.join(os.tmpdir(),'qashot-ch-'));
const ch=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port=0','--no-first-run',`--user-data-dir=${prof}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
const post=async(p,b={})=>{try{return await(await fetch(base+p,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(b)})).json();}catch(e){return {err:String(e)};}};
try{
 for(let i=0;i<120;i++){try{await fetch(base+'/api/state?world=live');break;}catch{await pause(250);}}
 await post('/api/bridge?world=live',{enabled:true});for(let i=0;i<40&&!clients.size;i++)await pause(250);
 let dp;for(let i=0;i<100;i++){try{dp=Number((await fs.readFile(path.join(prof,'DevToolsActivePort'),'utf8')).split('\n')[0]);break;}catch{await pause(100)}}
 const ts=await(await fetch(`http://127.0.0.1:${dp}/json/list`)).json();const ws=new WebSocket(ts.find(x=>x.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
 let id=0;const pend=new Map(),errs=[];ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id&&pend.has(d.id)){pend.get(d.id)(d.result||{});pend.delete(d.id);}if(d.method==='Runtime.exceptionThrown')errs.push(String(d.params.exceptionDetails.exception?.description||d.params.exceptionDetails.text||'').slice(0,240));};
 const send=(method,params={})=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}));});
 await send('Runtime.enable');await send('Emulation.setDeviceMetricsOverride',{width:plan.width||540,height:plan.height||960,deviceScaleFactor:2,mobile:false});
 await send('Page.navigate',{url:plan.page?base+plan.page:`${base}/?overlay=1&world=live&stage=world&quality=high&qa=1${plan.url||''}`});await pause(plan.wait??9000);
 const t0=Date.now();
 for(const [ms,kind,...a] of plan.steps||[[0,'shot','']]){const wait=t0+ms-Date.now();if(wait>0)await pause(wait);
  if(kind==='shot'){const r=await send('Page.captureScreenshot',{format:'jpeg',quality:84});if(r.data){const f=`${out}/${name}${a[0]?'-'+a[0]:''}.jpg`;await fs.writeFile(f,Buffer.from(r.data,'base64'));console.log('shot',f);}}
  else if(kind==='post')console.log(kind,a[0],JSON.stringify(await post(a[0],a[1]||{})).slice(0,120));
  else if(kind==='member')tik({event:'member',data:{userId:a[0],nickname:a[1],uniqueId:'qa'+a[0],actionId:1}});
  else if(kind==='chat')tik({event:'chat',data:{userId:a[0],nickname:a[1],uniqueId:'qa'+a[0],comment:a[2],msgId:'m'+a[0]+Date.now()}});
  else if(kind==='gift')tik({event:'gift',data:{userId:a[0],nickname:a[1],uniqueId:'qa'+a[0],diamondCount:a[2],repeatCount:1,repeatEnd:true,giftType:1,giftName:a[3]||'Rose',msgId:'g'+a[0]+Date.now()}});
  else if(kind==='eval'){const r=await send('Runtime.evaluate',{returnByValue:true,awaitPromise:true,expression:a[0]});console.log('eval',JSON.stringify(r.result?.value??r.exceptionDetails?.text).slice(0,3000));}}
 const fps=await send('Runtime.evaluate',{awaitPromise:true,returnByValue:true,expression:`new Promise(r=>{let n=0,t=performance.now();const f=()=>{n++;if(performance.now()-t<2000)requestAnimationFrame(f);else r(n/2)};requestAnimationFrame(f)})`});
 console.log('fps',fps.result?.value,'| lỗi JS:',errs.length?'\n'+errs.join('\n'):'không');ws.close();
}finally{ch.kill();srv.kill();fake.close();}
