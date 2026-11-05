// Isolated headless preview; no commands are sent to the LIVE world.
import {spawn} from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import WebSocket from 'ws';
const dir=path.resolve('output/truc-co-v2');await fs.mkdir(dir,{recursive:true});
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
 await call('Page.navigate',{url:'http://127.0.0.1:4317/cinema-preview.html?realm=2'});
 for(let i=0;i<100;i++){if(await evaluate("!!document.querySelector('#realm option')"))break;await pause(100);}
 await evaluate(`(async()=>{
  const {Scene}=await import('/scene.js'),{CultivationAudio}=await import('/audio.js');
  const frame=Scene.prototype.frame;Scene.prototype.frame=function(t){window.qaScene=this;return frame.call(this,t);};
  const ritual=CultivationAudio.prototype.ritual;CultivationAudio.prototype.ritual=function(...args){window.qaAudio=this;return ritual.apply(this,args);};
 })()`);
 await pause(800);
 await evaluate("document.querySelector('#sound').click();document.querySelector('#trucCoReplay').click()");await pause(700);
 assert.equal(await evaluate('qaAudio.enabled'),true);
 const shots=[];
 for(const [name,k]of [['swords',2.8/10.8],['intake',5.2/10.8],['foundation',7.9/10.8],['compression',8.65/10.8],['burst',8.97/10.8],['settle',10.15/10.8]]){
  const text=await evaluate(`(async()=>{
   const {drawRitual}=await import('/live-cinema.js');
   const scene=qaScene,e=scene.effects.find(e=>e.effect==='breakthrough');
   scene.visible=false;const c=scene.ctx,H=scene.height;
   c.setTransform(scene.canvas.width/900,0,0,scene.canvas.height/H,0,0);
   drawRitual(scene,c,e,e.start+e.duration*${k},H);
   return document.querySelector('.ritual-hud').innerText;
  })()`);
  assert.match(text,/Mộc Miên/);assert.ok(!/Ngưng|linh châu|chu thiên|thành công/i.test(text));
  const shot=await call('Page.captureScreenshot',{format:'png'});await fs.writeFile(path.join(dir,name+'.png'),Buffer.from(shot.data,'base64'));shots.push({name,text});
 }
 await evaluate("qaScene.visible=true;document.querySelector('#trucCoReplay').click()");await pause(400);
 const first=await evaluate('window.qaSession=qaAudio.qiSession;!!qaSession');assert.ok(first);
 await evaluate("document.querySelector('#trucCoReplay').click()");await pause(400);
 assert.equal(await evaluate('qaAudio.qiSession!==qaSession'),true);
 await evaluate('qaAudio.duck(true);document.querySelector("#crowd").click()');await pause(200);
 assert.equal(await evaluate('qaAudio.qiSession===null&&qaAudio.music.volume===qaAudio.volume*qaAudio.ambient*.28'),true);
 await evaluate('qaAudio.duck(false);document.querySelector("#trucCoReplay").click()');await pause(300);
 await evaluate('document.querySelector("#sound").click()');await pause(200);
 assert.equal(await evaluate('!qaAudio.enabled&&qaAudio.qiSession===null'),true);
 await evaluate('document.querySelector("#sound").click();document.querySelector("#trucCoReplay").click()');await pause(300);
 await evaluate('Object.defineProperty(document,"hidden",{configurable:true,value:true});document.dispatchEvent(new Event("visibilitychange"))');
 assert.equal(await evaluate('!qaScene.visible&&qaAudio.qiSession===null'),true);
 await evaluate('Object.defineProperty(document,"hidden",{configurable:true,value:false});document.dispatchEvent(new Event("visibilitychange"));qaScene.setQuality("light");qaScene.motion=false;document.querySelector("#trucCoReplay").click()');await pause(500);
 assert.equal(await evaluate('qaScene.visible&&qaAudio.qiSession!==null'),true);
 await evaluate('document.querySelector("#crowd").click()');
 // Exercise one complete run at real speed, including cleanup and return to plaza.
 await evaluate('qaScene.setQuality("balanced");qaScene.motion=true;document.querySelector("#trucCoReplay").click()');
 await pause(600);assert.equal(await evaluate('qaAudio.qiSession?.event.toRealm===2'),true);
 await pause(10800);
 assert.equal(await evaluate('qaAudio.qiSession===null&&!document.body.classList.contains("ritual-active")&&document.querySelector(".ritual-hud").hidden'),true);
 const performanceReport=await evaluate(`(async()=>{
  const {drawRitual}=await import('/live-cinema.js'),scene=qaScene,report={};scene.visible=false;
  for(const mode of ['balanced','light']){
   scene.setQuality(mode);const c=scene.ctx,H=scene.height,p=scene.players[1],e={user:p.id,name:p.name,toRealm:2,fromRealm:1,visualFrom:{...p,realm:1},visualTo:{...p,realm:2},start:0,duration:10800},costs=[];
   for(let i=0;i<35;i++){c.setTransform(scene.canvas.width/900,0,0,scene.canvas.height/H,0,0);const start=performance.now();drawRitual(scene,c,e,1000+i*270,H);costs.push(performance.now()-start);}
   costs.sort((a,b)=>a-b);report[mode]={p50:costs[17],p95:costs[33]};
  }scene.visible=true;document.querySelector('#crowd').click();return report;
 })()`);
 // Render actual Web Audio samples, independent of the sound device.
 const rendered=await evaluate(`(async()=>{
  const {scheduleTrucCoAudio}=await import('/truc-co-audio.js');
  const c=new OfflineAudioContext(2,48000*12,48000);scheduleTrucCoAudio(c,c.destination);
  const b=await c.startRendering(),left=b.getChannelData(0),right=b.getChannelData(1);
  let peak=0,sum=0;for(let i=0;i<left.length;i++){peak=Math.max(peak,Math.abs(left[i]),Math.abs(right[i]));sum+=left[i]*left[i];}
  const a=new ArrayBuffer(44+left.length*4),v=new DataView(a);let p=0;
  const s=t=>{for(const x of t)v.setUint8(p++,x.charCodeAt(0));};
  s('RIFF');v.setUint32(p,a.byteLength-8,true);p+=4;s('WAVEfmt ');v.setUint32(p,16,true);p+=4;v.setUint16(p,1,true);p+=2;v.setUint16(p,2,true);p+=2;v.setUint32(p,48000,true);p+=4;v.setUint32(p,192000,true);p+=4;v.setUint16(p,4,true);p+=2;v.setUint16(p,16,true);p+=2;s('data');v.setUint32(p,left.length*4,true);p+=4;
  for(let i=0;i<left.length;i++)for(const d of [left,right]){v.setInt16(p,Math.max(-1,Math.min(1,d[i]))*32767,true);p+=2;}
  let binary='';const bytes=new Uint8Array(a);for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
  return {peak,rms:Math.sqrt(sum/left.length),wav:btoa(binary)};
 })()`);
 assert.ok(rendered.peak>.01&&rendered.peak<1,'SFX has signal and headroom: '+rendered.peak);
 await fs.writeFile(path.join(dir,'truc-co-ritual-sfx.wav'),Buffer.from(rendered.wav,'base64'));
 assert.deepEqual(errors,[]);
 const report={shots,peak:rendered.peak,rms:rendered.rms,performance:performanceReport,errors,checked:['preview rendering','minimal text','audio enable/mute','consecutive replays','voice duck overlap','visibility interruption/resume','Light/reduced motion','full 10.8-second run and natural return','OfflineAudioContext signal/headroom'],listening:'Not assessed by ear'};
 await fs.writeFile(path.join(dir,'qa.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{socket?.close();chrome.kill();}
