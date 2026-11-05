// Isolated headless preview; no commands are sent to the LIVE world.
import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import WebSocket from 'ws';
const dir=path.resolve('output/hoa-than-v1');await fs.mkdir(dir,{recursive:true});
const profile=await fs.mkdtemp(path.join(dir,'chrome-'));
const chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port=0','--no-first-run','--no-default-browser-check','--autoplay-policy=no-user-gesture-required',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
const pause=ms=>new Promise(r=>setTimeout(r,ms));let socket;
try{
 let port;
 for(let i=0;i<100;i++){try{port=Number((await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0]);break;}catch{await pause(100);}}
 assert.ok(port,'Chrome debugging port');
 const targets=await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
 socket=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);
 await new Promise((r,j)=>{socket.once('open',r);socket.once('error',j);});
 let id=0;const pending=new Map(),errors=[];
 socket.on('message',data=>{const m=JSON.parse(data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);if(m.error)p.reject(Error(JSON.stringify(m.error)));else p.resolve(m.result);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text+': '+m.params.exceptionDetails.exception?.description);});
 const call=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
 const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 await call('Runtime.enable');await call('Page.enable');
 await call('Emulation.setDeviceMetricsOverride',{width:540,height:960,deviceScaleFactor:1,mobile:false});
 await call('Page.navigate',{url:'http://127.0.0.1:4317/cinema-preview.html?realm=5'});
 for(let i=0;i<100;i++){if(await evaluate("!!document.querySelector('#realm option')"))break;await pause(100);}
 await evaluate(`(async()=>{
  const {Scene}=await import('/scene.js'),{CultivationAudio}=await import('/audio.js');
  const frame=Scene.prototype.frame;Scene.prototype.frame=function(t){window.qaScene=this;return frame.call(this,t);};
  const ritual=CultivationAudio.prototype.ritual;CultivationAudio.prototype.ritual=function(...args){window.qaAudio=this;return ritual.apply(this,args);};
 })()`);

 await pause(800);
 await evaluate("document.querySelector('#sound').click();document.querySelector('#ritual').click()");
 await pause(600);assert.equal(await evaluate('qaAudio.enabled'),true);
 assert.equal(await evaluate('qaScene.effects.find(e=>e.effect==="breakthrough").duration'),17600);
 for(let i=0;i<40;i++){if(await evaluate('!!qaAudio.qiSession'))break;await pause(100);}
 assert.equal(await evaluate('!!qaAudio.qiSession'),true);
 await pause(17500);
 assert.equal(await evaluate('document.body.classList.contains("ritual-active")'),false);
 assert.equal(await evaluate('qaAudio.qiSession===null'),true);
 assert.deepEqual(errors,[]);
 await evaluate("document.querySelector('#sound').click()");
 assert.equal(await evaluate('qaAudio.enabled'),false);
 const report={isolated:true,duration:17600,audioStarted:true,naturalReturn:true,mute:true,errors};
 await fs.writeFile(path.join(dir,'qa.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{socket?.close();chrome.kill();}
