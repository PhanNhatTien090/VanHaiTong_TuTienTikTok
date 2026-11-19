// 19/11/2026: QA "ba phút đầu của người mới" — server THỬ (cổng 4399) + bản sao LIVE (45 người có mặt) + TikFinity GIẢ (ws 21299).
// Kịch bản: người mới vào phòng → 2 người nữa vào liền → người đầu bình luận "chào mọi người" → nhập môn (cảnh giới 1).
// node scripts/qa-newbie.mjs → output/newbie/f/*.jpg (khung hình) + output/newbie/newbie.mp4 (nếu có ffmpeg). Không đụng LIVE.
import {spawn,spawnSync} from 'node:child_process';import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import {WebSocketServer} from 'ws';
const port=4399,base=`http://127.0.0.1:${port}`,out='output/newbie';await fs.rm(out,{recursive:true,force:true});await fs.mkdir(out+'/f',{recursive:true});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const fake=new WebSocketServer({port:21299});const clients=new Set();fake.on('connection',ws=>clients.add(ws));
const tik=e=>{for(const ws of clients)ws.send(JSON.stringify(e));};
const member=(id,name)=>tik({event:'member',data:{userId:id,nickname:name,uniqueId:'qa'+id,actionId:1}});
const chat=(id,name,text)=>tik({event:'chat',data:{userId:id,nickname:name,uniqueId:'qa'+id,comment:text,msgId:'m'+id+Date.now()}});
const data=await fs.mkdtemp(path.join(os.tmpdir(),'qanewbie-'));for(const f of ['demo.json','source-visual.json'])await fs.copyFile('data/'+f,path.join(data,f)).catch(()=>{});
{const w=JSON.parse(await fs.readFile('data/live.json','utf8')),now=Date.now(),far=now+3600e3;
 if(w.visitor){w.visitor.closedAt=now-1000;w.visitor.endsAt=Math.min(w.visitor.endsAt,now-1000);}
 for(const k of ['boss','miniEvent','opportunity','envelope'])delete w[k];
 for(const [k,v] of Object.entries(w))if(v&&typeof v==='object'&&!Array.isArray(v)&&k!=='visitor'){if(v.phase&&!['idle','closed','done','ended','finished'].includes(v.phase)){v.phase='idle';v.endsAt=now-1000;v.closedAt=now-1000;}else if(v.endsAt>now&&!v.closedAt){v.endsAt=now-1000;v.closedAt=now-1000;}}
 for(const k of ['nextBossAt','nextSmallAt','nextBigEventAt','nextVisitorAt','nextOpportunityAt','nextMiniAt'])w[k]=far;if(w.engagement)w.engagement.nextSmallAt=far;
 Object.values(w.players).filter(p=>!p.resident&&!p.puppet&&!p.webOnly).sort((a,b)=>(b.lastActive||0)-(a.lastActive||0)).slice(0,45).forEach((p,i)=>{p.lastActive=now-i*2000;p.lastRealInteractionAt=now-i*2000;delete p.leftLiveAt;});
 w.playTransfers={};w.liveSession={...(w.liveSession||{}),active:true,startedAt:now-3600e3};
 for(const id of ['qa1','qa2','qa3'])delete w.players[id];
 await fs.writeFile(path.join(data,'live.json'),JSON.stringify(w));}
const srv=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),VAN_HAI_DATA_DIR:data,VAN_HAI_TTS:'off',VAN_HAI_WEB:'0',WEB_SYNC_SECRET:'',VAN_HAI_TIKFINITY_URL:'ws://127.0.0.1:21299/'},stdio:'ignore',windowsHide:true});
const prof=await fs.mkdtemp(path.join(os.tmpdir(),'qanewbie-ch-'));
const ch=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port=0','--no-first-run',`--user-data-dir=${prof}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
try{
 for(let i=0;i<120;i++){try{await fetch(base+'/api/state?world=live');break;}catch{await pause(250);}}
 await fetch(base+'/api/bridge?world=live',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({enabled:true})});
 for(let i=0;i<40&&!clients.size;i++)await pause(250);console.log('tikfinity giả nối:',clients.size>0);
 let dp;for(let i=0;i<100;i++){try{dp=Number((await fs.readFile(path.join(prof,'DevToolsActivePort'),'utf8')).split('\n')[0]);break;}catch{await pause(100)}}
 const ts=await(await fetch(`http://127.0.0.1:${dp}/json/list`)).json();const ws=new WebSocket(ts.find(x=>x.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
 let id=0;const pend=new Map(),errs=[];ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id&&pend.has(d.id)){pend.get(d.id)(d.result||{});pend.delete(d.id);}if(d.method==='Runtime.exceptionThrown')errs.push(String(d.params.exceptionDetails.exception?.description||'').slice(0,200));};
 const send=(method,params={})=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}));});
 await send('Runtime.enable');await send('Emulation.setDeviceMetricsOverride',{width:540,height:960,deviceScaleFactor:2,mobile:false});
 await send('Page.navigate',{url:`${base}/?overlay=1&world=live&stage=world&quality=high&qa=1`});await pause(12000);
 let n=0,t0=Date.now();const shot=async()=>{const r=await send('Page.captureScreenshot',{format:'jpeg',quality:80});if(r.data)await fs.writeFile(`${out}/f/${String(n++).padStart(4,'0')}.jpg`,Buffer.from(r.data,'base64'));};
 const plan=[[800,()=>member('qa1','Hoa Sơn Tiểu Muội')],[2200,()=>member('qa2','Gió Bắc')],[2700,()=>member('qa3','Tiểu Long Nữ 2k7')],[8000,()=>chat('qa1','Hoa Sơn Tiểu Muội','chào mọi người')]];
 while(Date.now()-t0<(+process.env.QA_SECS||20)*1000){const el=Date.now()-t0;while(plan.length&&el>=plan[0][0])plan.shift()[1]();await shot();}
 const secs=(Date.now()-t0)/1000;console.log('khung',n,'fps',(n/secs).toFixed(1));
 const st=await(await fetch(base+'/api/state?world=live')).json();const p=st.players.find(x=>x.id==='qa1');console.log('qa1 realm',p?.realm,'lỗi',errs.length?errs.join(' | '):'(không lỗi)');
 const ff=spawnSync('ffmpeg',['-y','-loglevel','error','-framerate',(n/secs).toFixed(2),'-i',`${out}/f/%04d.jpg`,'-c:v','libx264','-pix_fmt','yuv420p','-crf','23','-movflags','+faststart',`${out}/newbie.mp4`]);console.log('video',ff.status===0?out+'/newbie.mp4':'(không có ffmpeg)');
 ws.close();
}finally{ch.kill();srv.kill();fake.close();}
