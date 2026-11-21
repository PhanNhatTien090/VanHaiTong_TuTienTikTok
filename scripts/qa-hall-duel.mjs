// 21/11/2026 tối: soát THÁCH ĐẤU TRƯỞNG LÃO trên Lôi Đài — server THỬ (cổng PORT, mặc định 4393) với bản sao dữ liệu LIVE.
// Trưởng Lão Đường 1 = người VẮNG mặt (phân thân ra đánh) nếu ABSENT=1 (mặc định), người thách = người đang có mặt.
// node scripts/qa-hall-duel.mjs → output/qa-hall-duel/*.png (vào trận, giữa trận, kết quả) + lần gõ lại bị chặn 1 giờ.
import {spawn} from 'node:child_process';import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';
const port=Number(process.env.PORT||4393),base=`http://127.0.0.1:${port}`,out='output/qa-hall-duel';await fs.mkdir(out,{recursive:true});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
try{await fetch(base+'/api/state');console.error('cổng',port,'đang bận');process.exit(1);}catch{}
const data=await fs.mkdtemp(path.join(os.tmpdir(),'qahall-'));await fs.copyFile('data/source-visual.json',path.join(data,'source-visual.json')).catch(()=>{});
const w=JSON.parse(await fs.readFile('data/live.json','utf8')),now=Date.now(),far=now+3600e3;
for(const k of ['boss','miniEvent','opportunity','envelope','visitor','arena','quiz','tower'])delete w[k];
for(const [k,v] of Object.entries(w))if(v&&typeof v==='object'&&!Array.isArray(v)){if(v.phase&&!['idle','closed','done','ended','finished'].includes(v.phase)){v.phase='idle';v.endsAt=now-1000;v.closedAt=now-1000;}else if(v.endsAt>now&&!v.closedAt){v.endsAt=now-1000;v.closedAt=now-1000;}}
for(const k of ['nextBossAt','nextSmallAt','nextBigEventAt','nextVisitorAt','nextOpportunityAt','nextMiniAt'])w[k]=far;
w.liveSession={active:true,startedAt:now-3600e3};w.settings=Object.assign(w.settings||{},{autoEvents:false,bondEnabled:false});w.lastCeremonyAt=now;w.honorStageUntil=0;delete w.flowerEvent;
w.events=(w.events||[]).filter(e=>e.effect!=='breakthrough');
const real=Object.values(w.players).filter(p=>!p.resident&&!p.puppet&&p.realm>0).sort((a,b)=>(b.lastActive||0)-(a.lastActive||0));
const crowd=real.slice(0,Number(process.env.CROWD||20));crowd.forEach((p,i)=>{p.lastActive=now-i*4000;p.lastRealInteractionAt=now-i*4000;delete p.leftLiveAt;});
const challenger=crowd[1],elder=process.env.ABSENT==='0'?crowd[2]:real.find(p=>!crowd.includes(p)&&p.realm>=challenger.realm-2)||real[40];
if(process.env.ABSENT!=='0'){elder.lastActive=now-2*3600e3;elder.lastRealInteractionAt=now-2*3600e3;}
delete challenger.hallChallengeAt;
w.nguDuong.match=null;w.nguDuong.queue=[];const h=w.nguDuong.halls[0];h.elder=elder.id;h.since=now-3600e3;h.guardUntil=far;h.disciples=h.disciples.filter(id=>id!==elder.id&&id!==challenger.id);
for(const g of w.nguDuong.halls)if(g!==h&&(g.elder===elder.id||g.elder===challenger.id))g.elder=null;
console.log('Trưởng Lão',elder.name,'cảnh giới',elder.realm,process.env.ABSENT==='0'?'(có mặt)':'(VẮNG)','· người thách',challenger.name,'cảnh giới',challenger.realm);
w.mode='demo';await fs.writeFile(path.join(data,'live.json'),JSON.stringify({...w,mode:'live'}));await fs.writeFile(path.join(data,'demo.json'),JSON.stringify(w));
const srv=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),VAN_HAI_DATA_DIR:data,VAN_HAI_TTS:'off',VAN_HAI_BRIDGE_AUTO:'0',VAN_HAI_WEB:'0',WEB_SYNC_SECRET:''},stdio:'ignore',windowsHide:true});
for(let i=0;i<160;i++){try{await fetch(base+'/api/state?world=live');break;}catch{await pause(250);}}
const prof=await fs.mkdtemp(path.join(os.tmpdir(),'qahall-ch-'));
const ch=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port=0','--no-first-run','--mute-audio',`--user-data-dir=${prof}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
let dp;for(let i=0;i<100;i++){try{dp=Number((await fs.readFile(path.join(prof,'DevToolsActivePort'),'utf8')).split('\n')[0]);break;}catch{await pause(100)}}
const ts=await(await fetch(`http://127.0.0.1:${dp}/json/list`)).json();const ws=new WebSocket(ts.find(x=>x.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const pend=new Map();const errs=[];ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.method==='Runtime.exceptionThrown')errs.push(d.params.exceptionDetails.exception?.description?.slice(0,300));if(d.id&&pend.has(d.id)){pend.get(d.id)(d.result||{});pend.delete(d.id);}};
const send=(method,params={})=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}));});
const shot=async n=>{const r=await send('Page.captureScreenshot',{format:'jpeg',quality:80});if(r.data){await fs.writeFile(`${out}/${n}.jpg`,Buffer.from(r.data,'base64'));console.log('ảnh',`${out}/${n}.jpg`);}};
const chat=(p,text)=>fetch(base+'/api/action?world=demo',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({type:'chat',userId:p.id,name:p.name,text})}).then(r=>r.json());
const arena=async()=>{const s=await(await fetch(base+'/api/state?world=demo')).json();const a=s.arena;return a?`${a.phase} hall=${JSON.stringify(a.hall)} cur=${!!a.current} champ=${a.champion?.name} result=${a.lastResult?a.lastResult.winnerName:''}`:'không có arena';};
try{await send('Page.enable');await send('Runtime.enable');
 await send('Emulation.setDeviceMetricsOverride',{width:540,height:960,deviceScaleFactor:2,mobile:false});
 await send('Page.navigate',{url:`${base}/?overlay=1&world=demo&stage=world&quality=high&qa=1`});await pause(9000);
 console.log('gõ thách đấu 1 →',JSON.stringify(await chat(challenger,'thách đấu 1')).slice(0,160));
 await pause(1800);console.log('arena:',await arena());await shot('1-vao-tran');
 for(const p of crowd.slice(3,7))await chat(p,'trợ lực');
 await pause(9000);await shot('2-giua-tran');console.log('arena:',await arena());
 await pause(14000);await shot('3-giua-tran');
 for(let i=0;i<40;i++){const s=await arena();if(!s.includes('cur=true'))break;await pause(2000);}
 await pause(800);await shot('4-ket-qua');console.log('arena:',await arena());
 const st=await(await fetch(base+'/api/state?world=demo')).json();console.log('ghế Đường 1 sau trận:',st.players?.find?.(p=>p.id===w.nguDuong.halls[0].elder)?.name??'(xem nguDuong)',JSON.stringify(st.halls?.[0]?.elder||st.nguDuong?.halls?.[0]?.elder||'').slice(0,80));
 console.log('gõ lại ngay →',JSON.stringify(await chat(challenger,'thách đấu 1')).slice(0,160));
 console.log('LỖI JS:',errs.length?errs:'không');
}finally{try{ws.close();}catch{}ch.kill();srv.kill();}
