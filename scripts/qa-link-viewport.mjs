import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createWorld,ensurePlayer} from '../engine.mjs';
import {COURT_VISITORS} from '../public/court-rewards.js';
const out=path.resolve('output/link-viewport'),data=await fs.mkdtemp(path.join(os.tmpdir(),'vh-court-')),profile=await fs.mkdtemp(path.join(os.tmpdir(),'vh-edge-'));
const now=Date.now(),w=createWorld('demo');
Object.assign(w.settings,{autoEvents:false,autoRandom:false,scheduledCompetitions:false,residents:false,sceneMode:'thien-khuyet'});w.nextBossAt=now+1e9;
w.settings.nguDuong=true;
w.nguDuong={week:Math.floor((now+7*3600000+3*86400000)/(7*86400000)),halls:Array.from({length:5},(_,i)=>({elder:'p'+i,since:now,disciples:['p'+(i+5)],offers:[],points:0})),members:{},queue:[],match:null};
for(let i=0;i<17;i++){
 const p=ensurePlayer(w,'p'+i,i<5?'Trưởng Lão '+(i+1):'Đệ Tử '+(i-4),now);
 Object.assign(p,{realm:i<5?13:3,totalQi:9000-i*200,giftCoins:0});
 if(i<15)w.nguDuong.members[p.id]={index:i%5,joinedAt:now,points:0,weekPoints:0,week:w.nguDuong.week};
}
await fs.mkdir(out,{recursive:true});
await fs.writeFile(path.join(data,'demo.json'),JSON.stringify(w));
const server=spawn(process.execPath,['server.mjs'],{windowsHide:true,stdio:['ignore','pipe','pipe'],env:{...process.env,PORT:'0',VAN_HAI_DATA_DIR:data,VAN_HAI_TTS:'',VAN_HAI_BRIDGE_AUTO:'',VAN_HAI_RECOVERY_FILE:''}});
const pause=ms=>new Promise(r=>setTimeout(r,ms));let chrome,socket;
try{
 const url=await new Promise((resolve,reject)=>{let buf='';server.stdout.on('data',d=>{buf+=d;const m=buf.match(/http:\/\/127\.0\.0\.1:\d+/);if(m)resolve(m[0]);});server.stderr.on('data',d=>process.stderr.write(d));server.once('exit',code=>reject(Error('server '+code)));setTimeout(()=>reject(Error('server timeout')),10000).unref();});
 const post=(route,body)=>fetch(url+'/api/'+route+'?world=demo',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}).then(r=>r.json());
 chrome=spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',['--headless=new','--remote-debugging-port=0','--disable-gpu','--no-sandbox','--mute-audio','--no-first-run','--user-data-dir='+profile,'about:blank'],{windowsHide:true,stdio:'ignore'});
 let port;for(let i=0;i<100;i++){try{port=(await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0].trim();if(/^\d+$/.test(port)&&Number(port)>1024)break;await pause(100);}catch{await pause(100);}}
 const tabs=await(await fetch('http://127.0.0.1:'+port+'/json/list')).json();const tab=tabs.find(t=>t.type==='page'&&!t.url.startsWith('chrome-extension:'));
 socket=new WebSocket(tab.webSocketDebuggerUrl);await new Promise((r,j)=>{socket.onopen=r;socket.onerror=j;});
 let id=0;const pending=new Map(),errors=[];
 socket.onmessage=({data})=>{const m=JSON.parse(data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);};
 const call=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
 const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);return r.result.value;};
 const wait=async expression=>{for(let i=0;i<100;i++){if(await evaluate(expression))return;await pause(100);}throw Error('Timeout: '+expression+' '+JSON.stringify(errors));};
 const shot=async name=>{const r=await call('Page.captureScreenshot',{format:'png'});await fs.writeFile(path.join(out,name+'.png'),Buffer.from(r.data,'base64'));};
 await call('Runtime.enable');await call('Page.enable');await call('Emulation.setDeviceMetricsOverride',{width:540,height:960,deviceScaleFactor:1,mobile:false});
 await call('Page.navigate',{url:url+'/?overlay=1&world=demo&sound=0&zoom=1&quality=auto'});
 await wait("Number(document.querySelector('#sceneCount')?.textContent)>0");await pause(700);
 const baseline=process.argv.includes('--baseline'),results=[];
 for(const [width,height,dpr] of [[1080,1032,1],[1080,1920,1],[720,1280,1],[540,960,1],...(baseline?[]:[[540,960,2],[720,1280,2],[1080,1920,2]])]){
  await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:dpr,mobile:false});await pause(250);
  const row=await evaluate(`(()=>{const box=q=>{const e=document.querySelector(q),r=e.getBoundingClientRect(),s=getComputedStyle(e);return {x:r.x,y:r.y,width:r.width,height:r.height,maxWidth:s.maxWidth,transform:s.transform,zoom:s.zoom,aspect:s.aspectRatio}};const canvas=document.querySelector('#sceneCanvas'),matrix=canvas.getContext('2d').getTransform();return {viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},workspace:box('.workspace'),main:box('.main-content'),view:box('#sceneView'),shell:box('.scene-shell'),canvas:box('#sceneCanvas'),backing:{width:canvas.width,height:canvas.height},matrix:{a:matrix.a,d:matrix.d},scrollWidth:document.documentElement.scrollWidth,meta:document.querySelector('meta[name=viewport]').content,panels:['#phoneHudLeft','#giftRanks','#lowerRightGuide'].map(q=>{const e=document.querySelector(q);return e&&!e.hidden&&getComputedStyle(e).display!=='none'?{selector:q,...box(q)}:null}).filter(Boolean)};})()`);
  if(!baseline){for(const key of ['workspace','main','view','shell','canvas']){assert.ok(Math.abs(row[key].width-width)<1,key+' width '+JSON.stringify(row));assert.ok(Math.abs(row[key].height-height)<1,key+' height');assert.ok(Math.abs(row[key].x)<1&&Math.abs(row[key].y)<1,key+' origin');assert.equal(row[key].transform,'none');assert.ok(['1','normal'].includes(row[key].zoom));}
   assert.ok(row.backing.width*row.backing.height<=1080*1920);assert.ok(row.backing.width<=1080);assert.ok(row.backing.width<=Math.ceil(width*dpr));if(width/height===9/16)assert.equal(row.backing.width,Math.min(width*dpr,1080),'DPR-only resize updates raster');assert.ok(Math.abs(row.backing.width/row.backing.height-width/height)<.002);assert.ok(row.scrollWidth<=width);assert.ok(Math.abs(row.matrix.a*width/row.backing.width-row.matrix.d*height/row.backing.height)<.002,'world scales equally on both axes');
   for(const p of row.panels){assert.ok(p.x>=-1&&p.x+p.width<=width+1,p.selector+' fits horizontally');assert.ok(p.y>=-1&&p.y+p.height<=height+1,p.selector+' fits vertically');}
  }
  results.push(row);if(dpr===1)await shot((baseline?'before-':'after-')+width+'x'+height);
 }
 await fs.writeFile(path.join(out,baseline?'before.json':'after.json'),JSON.stringify({results,errors},null,2));assert.deepEqual(errors,[]);console.log(JSON.stringify(results.map(r=>({viewport:r.viewport,shell:r.shell.width+'x'+r.shell.height,backing:r.backing})),null,2));
}finally{socket?.close();chrome?.kill();server.kill();}
