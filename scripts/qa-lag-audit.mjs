// 19/11/2026: soát LAG overlay — server THỬ (cổng 4399) + BẢN SAO dữ liệu LIVE, không đụng LIVE thật.
// Đo theo từng cảnh: thời gian JS mỗi khung (rAF callback), số drawImage/khung, và ẢNH NÀO GIẢI MÃ TO HƠN MỨC VẼ
// (độ phân giải gốc so với kích thước vẽ lớn nhất trên canvas 1080 px). CPU bóp 4× cho giống máy LIVE lúc bận.
// node scripts/qa-lag-audit.mjs [throttle=4] → output/lag-audit/report.json + ảnh chụp từng cảnh
import {spawn} from 'node:child_process';import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';
const port=4399,base=`http://127.0.0.1:${port}`,out='output/lag-audit',throttle=Number(process.argv[2]||4);await fs.mkdir(out,{recursive:true});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const post=async(p,b={})=>{try{return await(await fetch(base+p,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(b)})).json();}catch(e){return {err:String(e)};}};
const act=b=>post('/api/action?world=live',b);
async function server(){const data=await fs.mkdtemp(path.join(os.tmpdir(),'lagaudit-'));for(const f of ['demo.json','source-visual.json'])await fs.copyFile('data/'+f,path.join(data,f)).catch(()=>{});
 const w=JSON.parse(await fs.readFile('data/live.json','utf8')),now=Date.now(),far=now+3600e3;
 if(w.visitor){w.visitor.closedAt=now-1000;w.visitor.endsAt=Math.min(w.visitor.endsAt,now-1000);}
 for(const k of ['boss','miniEvent','opportunity','envelope'])if(w[k])delete w[k];
 for(const [k,v] of Object.entries(w))if(v&&typeof v==='object'&&!Array.isArray(v)&&k!=='visitor'){
  if(v.phase&&!['idle','closed','done','ended','finished'].includes(v.phase)){v.phase='idle';v.endsAt=now-1000;v.closedAt=now-1000;}
  else if(v.endsAt>now&&!v.closedAt){v.endsAt=now-1000;v.closedAt=now-1000;}}
 for(const k of ['nextBossAt','nextSmallAt','nextBigEventAt','nextVisitorAt','nextOpportunityAt','nextMiniAt'])w[k]=far;
 w.engagement&&(w.engagement.nextSmallAt=far);
 await fs.writeFile(path.join(data,'live.json'),JSON.stringify(w));
 const srv=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),VAN_HAI_DATA_DIR:data,VAN_HAI_TTS:'off',VAN_HAI_BRIDGE_AUTO:'0',VAN_HAI_WEB:'0',WEB_SYNC_SECRET:''},stdio:'ignore',windowsHide:true});
 for(let i=0;i<120;i++){try{await fetch(base+'/api/state?world=live');break;}catch{await pause(250);}}return srv;}
// Gắn vào trang trước mọi script: ghi drawImage theo ảnh nguồn + đo thời gian rAF.
const HOOK=`(()=>{const P=CanvasRenderingContext2D.prototype,orig=P.drawImage,img=new Map(),A={frames:0,js:0,jsMax:0,draws:0,canvasDraws:0,slow:0};
window.__lag={img,A,reset(){img.clear();for(const k in A)A[k]=0;}};
P.drawImage=function(im,...a){try{A.draws++;if(im instanceof HTMLImageElement){const m=this.getTransform(),sx=Math.hypot(m.a,m.b),sy=Math.hypot(m.c,m.d);let dw,dh;
 if(a.length>=8){dw=a[6];dh=a[7];}else if(a.length>=4){dw=a[2];dh=a[3];}else{dw=im.naturalWidth;dh=im.naturalHeight;}
 const k=im.src.replace(location.origin,'').split('?')[0];let r=img.get(k);if(!r){r={nw:im.naturalWidth,nh:im.naturalHeight,maxW:0,maxH:0,n:0};img.set(k,r);}
 r.n++;r.maxW=Math.max(r.maxW,Math.abs(dw*sx));r.maxH=Math.max(r.maxH,Math.abs(dh*sy));}else A.canvasDraws++;}catch{}return orig.call(this,im,...a);};
const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=cb=>raf(t=>{const s=performance.now();try{cb(t);}finally{const d=performance.now()-s;A.js+=d;A.jsMax=Math.max(A.jsMax,d);if(d>16.7)A.slow++;}});
let last=0;const tick=t=>{A.frames++;raf(tick);};raf(tick);})();`;
const prof=await fs.mkdtemp(path.join(os.tmpdir(),'lagaudit-ch-'));
const ch=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port=0','--no-first-run','--autoplay-policy=no-user-gesture-required','--mute-audio',`--user-data-dir=${prof}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
let dp;for(let i=0;i<100;i++){try{dp=Number((await fs.readFile(path.join(prof,'DevToolsActivePort'),'utf8')).split('\n')[0]);break;}catch{await pause(100)}}
const ts=await(await fetch(`http://127.0.0.1:${dp}/json/list`)).json();const ws=new WebSocket(ts.find(x=>x.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const pend=new Map(),errs=[];ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id&&pend.has(d.id)){pend.get(d.id)(d.result||{});pend.delete(d.id);}if(d.method==='Runtime.exceptionThrown')errs.push(String(d.params.exceptionDetails.exception?.description||'').slice(0,200));};
const send=(method,params={})=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}));});
const ev=async e=>(await send('Runtime.evaluate',{expression:e,returnByValue:true,awaitPromise:true})).result?.value;
const shot=async n=>{const r=await send('Page.captureScreenshot',{format:'jpeg',quality:70});if(r.data)await fs.writeFile(`${out}/${n}.jpg`,Buffer.from(r.data,'base64'));};
const overlay=`${base}/?overlay=1&world=live&stage=world&quality=auto&qa=1`;
const report={throttle,scenes:{},images:{}};
async function scene(name,setup,{measure=12000,crowd=0}={}){
 const srv=await server();try{
  await send('Emulation.setCPUThrottlingRate',{rate:1});
  await send('Emulation.setDeviceMetricsOverride',{width:540,height:960,deviceScaleFactor:2,mobile:false});
  await send('Page.navigate',{url:overlay});await pause(5000);
  for(let i=0;i<crowd;i++)await act({type:'cultivate',userId:'crowd-'+i,name:'Đệ Tử '+(i+1)});
  if(setup)await setup();await pause(2500);
  await send('Emulation.setCPUThrottlingRate',{rate:throttle});await ev('__lag.reset()');await pause(measure);
  const r=await ev(`(()=>{const {A,img}=__lag;return {A:{...A},img:[...img].map(([k,v])=>[k,v])}})()`);
  await send('Emulation.setCPUThrottlingRate',{rate:1});await shot(name);
  const A=r.A,s={fps:+(A.frames/(measure/1000)).toFixed(1),jsPerFrame:+(A.js/Math.max(1,A.frames)).toFixed(2),jsMax:+A.jsMax.toFixed(1),slowFrames:A.slow,drawsPerFrame:Math.round(A.draws/Math.max(1,A.frames)),canvasDrawsPerFrame:Math.round(A.canvasDraws/Math.max(1,A.frames))};
  report.scenes[name]=s;console.log(name,JSON.stringify(s));
  for(const [k,v] of r.img){const o=report.images[k]||={nw:v.nw,nh:v.nh,maxW:0,maxH:0,scenes:[]};o.maxW=Math.max(o.maxW,v.maxW);o.maxH=Math.max(o.maxH,v.maxH);o.scenes.push(name);}
 }finally{srv.kill();await pause(600);}}
try{
 await send('Page.enable');await send('Runtime.enable');await send('Page.addScriptToEvaluateOnNewDocument',{source:HOOK});
 await scene('01-san-thuong',null);
 await scene('02-san-dong-45',null,{crowd:45});
 await scene('03-yeu-thu',async()=>{await post('/api/boss?world=live',{});await pause(3000);},{crowd:20});
 await scene('04-su-kien-skin',async()=>{await post('/api/visitor-event?world=live',{kind:'tinh-ha'});await pause(3000);await act({type:'gift',userId:'crowd-1',name:'Đệ Tử 2',coins:500,count:1,giftName:'Vương miện',eventId:'qa500'});},{crowd:15});
 await scene('05-loi-dai',async()=>{await post('/api/arena?world=live',{minutes:8});await pause(6000);},{crowd:15});
 await scene('06-co-duyen',async()=>{await post('/api/opportunity?world=live',{});},{crowd:15});
 await scene('07-thien-dao-giang-loi',async()=>{await post('/api/heaven-strike?world=live',{});},{crowd:15});
 await scene('08-linh-thu',async()=>{await post('/api/pet-event?world=live',{});await pause(3000);},{crowd:15});
}finally{try{ws.close();}catch{}ch.kill();}
report.errors=errs.slice(0,20);
// ảnh giải mã thừa: số điểm ảnh gốc / điểm ảnh cần (vẽ lớn nhất), chỉ ảnh ≥0,25 MP
report.oversized=Object.entries(report.images).map(([k,v])=>({src:k,nw:v.nw,nh:v.nh,maxW:Math.round(v.maxW),maxH:Math.round(v.maxH),mp:+(v.nw*v.nh/1e6).toFixed(2),ratio:+((v.nw*v.nh)/Math.max(1,v.maxW*v.maxH)).toFixed(1),scenes:[...new Set(v.scenes)].length}))
 .filter(x=>x.mp>=.25).sort((a,b)=>b.mp*(b.ratio>2?1:0)-a.mp*(a.ratio>2?1:0));
const decodedMP=Object.values(report.images).reduce((s,v)=>s+v.nw*v.nh/1e6,0);report.decodedMP=+decodedMP.toFixed(1);
await fs.writeFile(`${out}/report.json`,JSON.stringify(report,null,1));
console.log('ảnh dùng',Object.keys(report.images).length,'tổng MP giải mã',report.decodedMP,'lỗi',errs.length);
for(const x of report.oversized.slice(0,40))console.log(x.mp+'MP',x.nw+'x'+x.nh,'→ vẽ max',x.maxW+'x'+x.maxH,'×'+x.ratio,x.src);
