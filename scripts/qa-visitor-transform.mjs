// 21/11/2026 tối: soát "mua skin trong lượt Song Tiên → biến hình NGAY" (trước bị hoãn tới hết sự kiện nếu không phải vị đầu / Thiên Khuyết).
// Server THỬ (PORT, mặc định 4390) với bản sao dữ liệu LIVE. ROUND=ta-ton (mặc định), BUY=khuyniet, COINS=400.
// node scripts/qa-visitor-transform.mjs → output/qa-visitor-transform/*.png + scene.presentation lúc mua.
import {spawn} from 'node:child_process';import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';
import {songTienRound} from '../public/visitor-rewards.js';
const port=Number(process.env.PORT||4390),base=`http://127.0.0.1:${port}`,out='output/qa-visitor-transform';await fs.mkdir(out,{recursive:true});
const ROUND=process.env.ROUND||'ta-ton',BUY=process.env.BUY||'khuyniet',COINS=Number(process.env.COINS||400);
const pause=ms=>new Promise(r=>setTimeout(r,ms));
try{await fetch(base+'/api/state');console.error('cổng',port,'đang bận');process.exit(1);}catch{}
const data=await fs.mkdtemp(path.join(os.tmpdir(),'qavt-'));await fs.copyFile('data/source-visual.json',path.join(data,'source-visual.json')).catch(()=>{});
const w=JSON.parse(await fs.readFile('data/live.json','utf8')),now=Date.now(),far=now+3600e3;
for(const k of ['boss','miniEvent','opportunity','envelope','visitor','arena','quiz','tower','petEvent'])delete w[k];
for(const [k,v] of Object.entries(w))if(v&&typeof v==='object'&&!Array.isArray(v)){if(v.phase&&!['idle','closed','done','ended','finished'].includes(v.phase)){v.phase='idle';v.endsAt=now-1000;v.closedAt=now-1000;}else if(v.endsAt>now&&!v.closedAt){v.endsAt=now-1000;v.closedAt=now-1000;}}
for(const k of ['nextBossAt','nextSmallAt','nextBigEventAt','nextVisitorAt','nextOpportunityAt','nextMiniAt'])w[k]=far;
w.liveSession={active:true,startedAt:now-3600e3};w.settings=Object.assign(w.settings||{},{autoEvents:false,bondEnabled:false});w.lastCeremonyAt=now;w.honorStageUntil=0;delete w.flowerEvent;if(w.nguDuong)w.nguDuong.match=null;
w.events=(w.events||[]).filter(e=>e.effect!=='breakthrough');w.nextVisitorRound=ROUND;
const crowd=Object.values(w.players).filter(p=>!p.resident&&!p.puppet&&p.realm>0).sort((a,b)=>(b.lastActive||0)-(a.lastActive||0)).slice(0,14);
crowd.forEach((p,i)=>{p.lastActive=now-i*4000;p.lastRealInteractionAt=now-i*4000;delete p.leftLiveAt;});
const VR=(await import('../public/visitor-rewards.js')).VISITOR_GIFT_REWARDS;
const buyer=crowd.find(p=>!(p.rewardSkins||[]).includes(VR[BUY].skin))||crowd[0];buyer.skinWallet={coins:0};
w.mode='demo';await fs.writeFile(path.join(data,'live.json'),JSON.stringify({...w,mode:'live'}));await fs.writeFile(path.join(data,'demo.json'),JSON.stringify(w));
const srv=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),VAN_HAI_DATA_DIR:data,VAN_HAI_TTS:'off',VAN_HAI_BRIDGE_AUTO:'0',VAN_HAI_WEB:'0',WEB_SYNC_SECRET:''},stdio:'ignore',windowsHide:true});
for(let i=0;i<160;i++){try{await fetch(base+'/api/state?world=demo');break;}catch{await pause(250);}}
const prof=await fs.mkdtemp(path.join(os.tmpdir(),'qavt-ch-'));
const ch=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port=0','--no-first-run','--mute-audio',`--user-data-dir=${prof}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
let dp;for(let i=0;i<100;i++){try{dp=Number((await fs.readFile(path.join(prof,'DevToolsActivePort'),'utf8')).split('\n')[0]);break;}catch{await pause(100)}}
const ts=await(await fetch(`http://127.0.0.1:${dp}/json/list`)).json();const ws=new WebSocket(ts.find(x=>x.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const pend=new Map();const errs=[];ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.method==='Runtime.exceptionThrown')errs.push(d.params.exceptionDetails.exception?.description?.slice(0,300));if(d.id&&pend.has(d.id)){pend.get(d.id)(d.result||{});pend.delete(d.id);}};
const send=(method,params={})=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}));});
const shot=async n=>{const r=await send('Page.captureScreenshot',{format:'jpeg',quality:80});if(r.data){await fs.writeFile(`${out}/${n}.jpg`,Buffer.from(r.data,'base64'));console.log('ảnh',`${out}/${n}.jpg`);}};
const ev=async e=>(await send('Runtime.evaluate',{expression:e,returnByValue:true})).result?.value;
const P=(u,b)=>fetch(base+u,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(b)}).then(r=>r.json());
try{await send('Page.enable');await send('Runtime.enable');
 await send('Emulation.setDeviceMetricsOverride',{width:540,height:960,deviceScaleFactor:2,mobile:false});
 await send('Page.navigate',{url:`${base}/?overlay=1&world=demo&stage=world&quality=high&qa=1`});await pause(9000);
 const r=songTienRound(ROUND);console.log('mở lượt',ROUND,JSON.stringify(await P('/api/visitor-event?world=demo',{kind:r.kinds[0]})).slice(0,120));
 await pause(6000);const st=await(await fetch(base+'/api/state?world=demo')).json();console.log('lượt đang mở:',st.visitor?.round,(st.visitor?.lineup||[]).map(s=>s.kind+':'+s.price).join(','));
 await shot('1-luot-mo');
 console.log('người mua',buyer.name,'tặng',COINS,'→',JSON.stringify(await P('/api/action?world=demo',{type:'gift',userId:buyer.id,name:buyer.name,coins:COINS,count:1,giftName:'Rose',eventId:'qa-'+Date.now()})).slice(0,120));
 const probe=`(()=>{const s=window.__vhScene;return JSON.stringify({pres:s?.presentation?.kind||null,who:s?.presentation?.id||null,transforming:!!s?.transforming})})()`;
 for(const ms of [1200,2500,4000]){await pause(ms===1200?1200:1300);console.log('sau',ms,'ms:',await ev(probe));if(ms===2500)await shot('2-sau-khi-mua');}
 const st2=await(await fetch(base+'/api/state?world=demo')).json();console.log('sự kiện còn mở:',!!st2.visitor&&!st2.visitor.closedAt,'· người mua có skin:',(st2.players.find(p=>p.id===buyer.id)?.skinChoice)||'?');
 console.log('LỖI JS:',errs.length?errs:'không');
}finally{try{ws.close();}catch{}ch.kill();srv.kill();}
