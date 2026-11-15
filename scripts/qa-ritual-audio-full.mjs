// Quét âm đột phá bằng ĐÚNG engine LIVE (CultivationAudio.scheduleRitual) trong OfflineAudioContext, Chrome ẩn.
// Đo tín hiệu thô trước nén/soft-clip (master 0,66 như LIVE): cửa sổ 50 ms nào > ngưỡng là chỗ dễ rè.
// node scripts/qa-ritual-audio-full.mjs [realms=1-28] [ids=preview-a,preview-b] [wavDir]
import {spawn} from 'node:child_process';import fs from 'node:fs/promises';import path from 'node:path';import WebSocket from 'ws';
const [rArg='1-28',idArg='preview-a,preview-b,preview-c',wavDir='']=process.argv.slice(2);
const realms=rArg.includes('-')?(([a,b])=>Array.from({length:b-a+1},(_,i)=>a+i))(rArg.split('-').map(Number)):rArg.split(',').map(Number);
const profile=await fs.mkdtemp(path.join(process.env.TEMP||'.','qa-audio-'));
const chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port=0','--no-first-run','--mute-audio',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
const pause=ms=>new Promise(r=>setTimeout(r,ms));let socket;
try{let port;for(let i=0;i<100;i++){try{port=Number((await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0]);break;}catch{await pause(100);}}
 const t=await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();socket=new WebSocket(t.find(x=>x.type==='page').webSocketDebuggerUrl);await new Promise(r=>socket.once('open',r));
 let id=0;const pend=new Map();socket.on('message',d=>{const m=JSON.parse(d);if(m.id){pend.get(m.id)?.(m);pend.delete(m.id);}});
 const call=(method,params={})=>new Promise(r=>{pend.set(++id,r);socket.send(JSON.stringify({id,method,params}));});
 await call('Page.enable');await call('Page.navigate',{url:'http://127.0.0.1:4317/ascension-preview.html?capture=1'});await pause(3000);
 for(const realm of realms)for(const eid of idArg.split(',')){
  const res=await call('Runtime.evaluate',{awaitPromise:true,returnByValue:true,expression:`(async()=>{
   const {CultivationAudio}=await import('/audio.js');const {breakthroughDuration}=await import('/breakthrough-fx.js');
   const realm=${realm},ev={id:'${eid}',user:'p1',name:'A',effect:'breakthrough',fromRealm:realm-1,toRealm:realm};ev.duration=breakthroughDuration(ev);
   const sr=44100,dur=ev.duration/1000,len=Math.ceil((dur+3)*sr),ctx=new OfflineAudioContext(2,len,sr);
   const a=new CultivationAudio();a.init(ctx);a.enabled=true;a.master.gain.value=.66;a.fxBus.gain.value=1;a.ambBus.gain.value=0;
   if(!${!!process.env.FULL}){a.master.disconnect();a.master.connect(ctx.destination);} // mặc định: tín hiệu thô; FULL=1: đúng chuỗi phát LIVE
   a.scheduleRitual(ev,realm,0);
   const buf=await ctx.startRendering(),L=buf.getChannelData(0),R=buf.getChannelData(1),W=Math.round(sr*.05),win=[];
   let peak=0;for(let s=0;s<L.length;s+=W){let pk=0,e=0,d=0;for(let i=s;i<Math.min(L.length,s+W);i++){const v=Math.max(Math.abs(L[i]),Math.abs(R[i]));pk=Math.max(pk,v);e+=L[i]*L[i];if(i>s){const df=L[i]-L[i-1];d+=df*df;}}peak=Math.max(peak,pk);win.push([+(s/sr).toFixed(2),+pk.toFixed(3),e>1e-9?+(d/e).toFixed(4):0]);}
   const hot=win.filter(w=>w[1]>.56),over=win.filter(w=>w[1]>.85),hf=win.filter(w=>w[2]>.25&&w[1]>.08);
   let b64='';if(${!!wavDir}){const wav=new DataView(new ArrayBuffer(44+L.length*4)),w=(o,s)=>[...s].forEach((ch,i)=>wav.setUint8(o+i,ch.charCodeAt(0)));w(0,'RIFF');wav.setUint32(4,36+L.length*4,true);w(8,'WAVE');w(12,'fmt ');wav.setUint32(16,16,true);wav.setUint16(20,1,true);wav.setUint16(22,2,true);wav.setUint32(24,sr,true);wav.setUint32(28,sr*4,true);wav.setUint16(32,4,true);wav.setUint16(34,16,true);w(36,'data');wav.setUint32(40,L.length*4,true);
    for(let i=0;i<L.length;i++){wav.setInt16(44+i*4,Math.max(-1,Math.min(1,L[i]))*32767,true);wav.setInt16(46+i*4,Math.max(-1,Math.min(1,R[i]))*32767,true);}const bytes=new Uint8Array(wav.buffer);let bin='';for(let i=0;i<bytes.length;i+=0x8000)bin+=String.fromCharCode(...bytes.subarray(i,i+0x8000));b64=btoa(bin);}
   const spans=xs=>{const out=[];for(const w of xs){const l=out.at(-1);if(l&&w[0]-l[1]<=.11){l[1]=w[0];l[2]=Math.max(l[2],w[1]);}else out.push([w[0],w[0],w[1]]);}return out.map(([a,b,p])=>a.toFixed(1)+(b>a?'-'+b.toFixed(1):'')+'s('+p.toFixed(2)+')').slice(0,8).join(' ');};
   return {dur,peak,hot:hot.length,over:over.length,overAt:spans(over),hotAt:spans(hot),hfAt:spans(hf),b64};})()`});
  const r=res.result?.result?.value;if(!r){console.log(realm,eid,'ERR',JSON.stringify(res.result?.exceptionDetails?.exception?.description||res).slice(0,300));continue;}
  console.log(`r${realm} ${eid} dur=${r.dur}s peak=${r.peak.toFixed(2)} >0.56:${r.hot*50}ms >0.85:${r.over*50}ms | quá tải: ${r.overAt||'-'} | nóng: ${r.hotAt||'-'} | HF: ${r.hfAt||'-'}`);
  if(wavDir&&r.b64){await fs.mkdir(wavDir,{recursive:true});await fs.writeFile(path.join(wavDir,`r${realm}-${eid}.wav`),Buffer.from(r.b64,'base64'));}
 }
}finally{socket?.close();chrome.kill();await pause(400);await fs.rm(profile,{recursive:true,force:true}).catch(()=>{});}
