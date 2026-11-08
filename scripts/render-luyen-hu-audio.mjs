// Xuất âm Luyện Hư v2 (cue riêng + lớp nổ chung) bằng OfflineAudioContext trong Chrome headless → WAV + đo đỉnh.
// node scripts/render-luyen-hu-audio.mjs output/luyen-hu-v2/cue.wav
import {spawn} from 'node:child_process';import fs from 'node:fs/promises';import path from 'node:path';import WebSocket from 'ws';
const out=process.argv[2]||'output/luyen-hu-v2/cue.wav';const dir=path.resolve('output');const profile=await fs.mkdtemp(path.join(dir,'chrome-'));
const chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port=0','--no-first-run','--mute-audio',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
const pause=ms=>new Promise(r=>setTimeout(r,ms));let socket;
try{let port;for(let i=0;i<100;i++){try{port=Number((await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0]);break;}catch{await pause(100);}}
 const t=await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();socket=new WebSocket(t.find(x=>x.type==='page').webSocketDebuggerUrl);await new Promise(r=>socket.once('open',r));
 let id=0;const pend=new Map();socket.on('message',d=>{const m=JSON.parse(d);if(m.id){pend.get(m.id)?.(m);pend.delete(m.id);}});
 const call=(method,params={})=>new Promise(r=>{pend.set(++id,r);socket.send(JSON.stringify({id,method,params}));});
 await call('Page.enable');await call('Page.navigate',{url:'http://127.0.0.1:4317/ascension-preview.html?capture=1'});await pause(3000);
 const res=await call('Runtime.evaluate',{awaitPromise:true,returnByValue:true,expression:`(async()=>{
  const m=await import('/luyen-hu-audio.js'),imp=await import('/impact-audio.js');const sr=48000,dur=20.8,len=Math.ceil((dur+2.5)*sr),ctx=new OfflineAudioContext(2,len,sr),master=ctx.createGain();master.gain.value=.8;master.connect(ctx.destination);
  m.scheduleLuyenHuAudio(ctx,master,0,dur,1,{id:'preview-a',user:'p1'});imp.scheduleImpactLayers(ctx,master,{elapsed:0,at:17.25,duration:20.8,scale:1,pitch:1,root:98});
  const buf=await ctx.startRendering(),L=buf.getChannelData(0),R=buf.getChannelData(1);let peak=0,sum=0,bad=0;for(let i=0;i<L.length;i++){if(!Number.isFinite(L[i])||!Number.isFinite(R[i]))bad++;const v=Math.max(Math.abs(L[i]),Math.abs(R[i]));peak=Math.max(peak,v);sum+=L[i]*L[i];}
  const seg=[];for(let s=0;s<dur+2.5;s+=.5){let pk=0;for(let i=Math.floor(s*sr);i<Math.min(L.length,(s+.5)*sr);i++)pk=Math.max(pk,Math.abs(L[i]));seg.push(pk.toFixed(2));}
  const wav=new DataView(new ArrayBuffer(44+L.length*4)),w=(o,s)=>[...s].forEach((ch,i)=>wav.setUint8(o+i,ch.charCodeAt(0)));w(0,'RIFF');wav.setUint32(4,36+L.length*4,true);w(8,'WAVE');w(12,'fmt ');wav.setUint32(16,16,true);wav.setUint16(20,1,true);wav.setUint16(22,2,true);wav.setUint32(24,sr,true);wav.setUint32(28,sr*4,true);wav.setUint16(32,4,true);wav.setUint16(34,16,true);w(36,'data');wav.setUint32(40,L.length*4,true);
  for(let i=0;i<L.length;i++){wav.setInt16(44+i*4,Math.max(-1,Math.min(1,L[i]))*32767,true);wav.setInt16(46+i*4,Math.max(-1,Math.min(1,R[i]))*32767,true);}
  const bytes=new Uint8Array(wav.buffer);let bin='';for(let i=0;i<bytes.length;i+=0x8000)bin+=String.fromCharCode(...bytes.subarray(i,i+0x8000));
  return {peak,rms:Math.sqrt(sum/L.length),bad,seg:seg.join(' '),b64:btoa(bin)};})()`});
 const r=res.result?.result?.value;if(!r)throw Error(JSON.stringify(res.result?.exceptionDetails||res).slice(0,600));
 await fs.mkdir(path.dirname(out),{recursive:true});await fs.writeFile(out,Buffer.from(r.b64,'base64'));console.log('peak',r.peak.toFixed(3),'rms',r.rms.toFixed(4),'NaN',r.bad);console.log('đỉnh mỗi 0,5s:',r.seg);
}finally{socket?.close();chrome.kill();await pause(400);await fs.rm(profile,{recursive:true,force:true}).catch(()=>{});}
