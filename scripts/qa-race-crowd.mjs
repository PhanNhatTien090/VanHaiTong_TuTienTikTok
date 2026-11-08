// Chrome headless trên /race-preview.html (dữ liệu giả, không chạm LIVE): đo ms/khung theo số người và chụp ảnh khi tặng quà.
// node scripts/qa-race-crowd.mjs → output/race-v4/chrome-*.png + chrome-qa.json
import {spawn} from 'node:child_process';import fs from 'node:fs/promises';import path from 'node:path';import WebSocket from 'ws';
const dir=path.resolve('output/race-v4');await fs.mkdir(dir,{recursive:true});const profile=await fs.mkdtemp(path.join(dir,'chrome-'));
const chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port=0','--no-first-run','--no-default-browser-check','--mute-audio',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
const pause=ms=>new Promise(r=>setTimeout(r,ms));let socket;const report={};
try{
 let port;for(let i=0;i<100;i++){try{port=Number((await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0]);break;}catch{await pause(100);}}
 const targets=await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();socket=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);await new Promise((r,j)=>{socket.once('open',r);socket.once('error',j);});
 let id=0;const pending=new Map(),errors=[];
 socket.on('message',data=>{const m=JSON.parse(data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')errors.push(m.params.args.map(a=>a.value||a.description).join(' '));});
 const call=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
 const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 const shot=async name=>{const r=await call('Page.captureScreenshot',{format:'png'});await fs.writeFile(path.join(dir,'chrome-'+name+'.png'),Buffer.from(r.data,'base64'));};
 await call('Runtime.enable');await call('Page.enable');await call('Emulation.setDeviceMetricsOverride',{width:540,height:960,deviceScaleFactor:2,mobile:false});
 await call('Page.navigate',{url:'http://127.0.0.1:4317/race-preview.html?n=12'});
 for(let i=0;i<100;i++){if(await evaluate('!!window.raceScene?.targets?.length'))break;await pause(100);}
 await evaluate("document.querySelector('#tools').classList.add('hide')");
 for(const n of [12,60,200]){await evaluate(`raceBuild(${n})`);await pause(3500);await evaluate('raceScene.frameCosts=[]');await pause(3000);
  report['n'+n]=await evaluate('({avg:+(raceScene.frameCosts.reduce((a,b)=>a+b,0)/raceScene.frameCosts.length).toFixed(2),max:Math.max(...raceScene.frameCosts),full:raceScene.targets.length,width:raceScene.canvas.width,level:raceScene.budget?.level})');await shot('n'+n);}
 await evaluate('raceGift(300)');await pause(900);await shot('gift300');report.gift300=await evaluate('raceScene.targets.filter(a=>a.gift).map(a=>({name:a.player.name,y:Math.round(a.y),rank:a.rank}))');
 await pause(4000);await evaluate('raceGift(3000)');await pause(1200);await shot('gift3000');report.gift3000=await evaluate('raceScene.targets.filter(a=>a.gift||a.finished).map(a=>({name:a.player.name,y:Math.round(a.y),finished:a.finished}))');
 report.errors=errors;
}finally{socket?.close();chrome.kill();await pause(500);await fs.rm(profile,{recursive:true,force:true}).catch(()=>{});}
await fs.writeFile(path.join(dir,'chrome-qa.json'),JSON.stringify(report,null,1));console.log(JSON.stringify(report,null,1));
