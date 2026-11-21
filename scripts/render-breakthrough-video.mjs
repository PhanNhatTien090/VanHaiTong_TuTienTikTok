// Quay màn đột phá thành video MP4 có tiếng (đúng renderer + engine âm LIVE), để overlay phát video thay vì vẽ trực tiếp.
// Đồng hồ giả: performance.now/requestAnimationFrame do script điều khiển → mỗi khung đúng 1/30 s, máy chậm vẫn mượt.
// Chữ HUD (tên + cảnh giới) KHÔNG quay vào video — overlay vẫn hiện bằng DOM lên trên, kèm avatar.
// node scripts/render-breakthrough-video.mjs <realm> <nam|nu> <variantId> <out.mp4> [fps=30] [base=http://127.0.0.1:4317]
import {spawn} from 'node:child_process';import fs from 'node:fs/promises';import path from 'node:path';import WebSocket from 'ws';
const [realmArg,gender='nam',variant='v1',outArg,fpsArg='30',BASE='http://127.0.0.1:4317']=process.argv.slice(2);
if(!realmArg||!outArg){console.error('Cách dùng: node scripts/render-breakthrough-video.mjs <realm> <nam|nu> <variantId> <out.mp4>');process.exit(2);}
const realm=Number(realmArg),FPS=Number(fpsArg),W=1080,H=1920,out=path.resolve(outArg);await fs.mkdir(path.dirname(out),{recursive:true});
const tmp=await fs.mkdtemp(path.join(process.env.TEMP||path.dirname(out),'bt-video-'));
const chrome=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port=0','--no-first-run','--mute-audio','--hide-scrollbars',`--user-data-dir=${tmp}/profile`,'about:blank'],{windowsHide:true,stdio:'ignore'});
const pause=ms=>new Promise(r=>setTimeout(r,ms));let socket,ff;
const run=(cmd,args)=>new Promise((res,rej)=>{const p=spawn(cmd,args,{stdio:['ignore','ignore','pipe']});let err='';p.stderr.on('data',d=>err+=d);p.on('close',c=>c===0?res():rej(new Error(cmd+' '+c+': '+err.slice(-800))));});
// Đồng hồ giả, cài trước mọi script của trang.
const CLOCK=`(()=>{let now=1000;const q=[];let seq=0;performance.now=()=>now;
 window.requestAnimationFrame=cb=>{q.push([++seq,cb]);return seq;};window.cancelAnimationFrame=id=>{const i=q.findIndex(x=>x[0]===id);if(i>=0)q.splice(i,1);};
 window.__clock={get now(){return now;},step(ms){now+=ms;const run=q.splice(0);for(const [,cb] of run){try{cb(now);}catch(e){console.error(e);}}},pump(){const run=q.splice(0);for(const [,cb] of run){try{cb(now);}catch(e){console.error(e);}}}};})();`;
try{
 let port;for(let i=0;i<150;i++){try{port=Number((await fs.readFile(path.join(tmp,'profile','DevToolsActivePort'),'utf8')).split('\n')[0]);break;}catch{await pause(100);}}
 const t=await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();socket=new WebSocket(t.find(x=>x.type==='page').webSocketDebuggerUrl,{maxPayload:256*1024*1024});await new Promise(r=>socket.once('open',r));
 let id=0;const pend=new Map(),errors=[];socket.on('message',d=>{const m=JSON.parse(d);if(m.id){pend.get(m.id)?.(m);pend.delete(m.id);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.exception?.description||m.params.exceptionDetails.text);if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')errors.push(m.params.args.map(a=>a.value||a.description).join(' ').slice(0,300));});
 const call=(method,params={})=>new Promise(r=>{pend.set(++id,r);socket.send(JSON.stringify({id,method,params}));});
 const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.result?.exceptionDetails)throw new Error(r.result.exceptionDetails.exception?.description||r.result.exceptionDetails.text);return r.result?.result?.value;};
 await call('Runtime.enable');await call('Page.enable');await call('Emulation.setDeviceMetricsOverride',{width:W,height:H,deviceScaleFactor:1,mobile:false});
 await call('Page.addScriptToEvaluateOnNewDocument',{source:CLOCK});
 await call('Page.navigate',{url:`${BASE}/ascension-preview.html?realm=${realm}&capture=1`});
 // Cho ảnh nạp xong (đồng hồ giả đứng yên → bơm vài khung cho scene dựng cache).
 for(let i=0;i<40;i++){await pause(150);await evaluate('window.__clock&&window.__clock.step(33)');}
 const info=await evaluate(`(async()=>{
  const s=window.__scene;if(!s)throw new Error('không có __scene');
  const st=document.createElement('style');st.textContent='.ritual-hud,.preview-tools{display:none!important}';document.head.appendChild(st);
  const {breakthroughDuration}=await import('/breakthrough-fx.js');const {REALM_NAMES}=await import('/progression.js');
  const r=${realm},p={id:'video:${gender}',name:'',gender:'${gender}',active:true,joinedAt:1,realm:r-1,realmName:REALM_NAMES[r-1],giftCoins:0,qi:220,neededQi:360,stones:45,neededStones:70,finalRealmEligible:true};
  s.update({players:[p],serverNow:Date.now(),settings:{ascensionShowcase:true},realms:REALM_NAMES,boss:null},p.id);
  window.__sounds=[];const t0={v:0};s.onRitualAudio=()=>{};s.onRitualSound=kind=>window.__sounds.push([kind,(performance.now()-window.__t0)/1000]);
  const e={id:'video:${variant}',user:p.id,name:'',effect:'breakthrough',fromRealm:r-1,toRealm:r,visualFrom:{...p,realm:r-1},visualTo:{...p,realm:r}};
  e.duration=breakthroughDuration(e);window.__t0=performance.now();s.noteEvent(e);s.addEffect(e);window.__ev=e;
  const live=s.effects.find(x=>x.effect==='breakthrough');if(live)live.start=window.__t0;
  return {duration:e.duration,started:!!live};})()`);
 if(!info?.started)throw new Error('không bắt đầu được nghi thức: '+JSON.stringify(info));
 const total=Math.ceil(info.duration/1000*FPS)+Math.round(FPS*.5); // +0,5 s đuôi (dư âm)
 ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','medium','-crf','21','-pix_fmt','yuv420p','-movflags','+faststart',`${tmp}/video.mp4`],{stdio:['pipe','ignore','pipe']});
 let ffErr='';ff.stderr.on('data',d=>ffErr+=d);const ffDone=new Promise((res,rej)=>ff.on('close',c=>c===0?res():rej(new Error('ffmpeg '+c+' '+ffErr.slice(-500)))));
 const started=Date.now();
 for(let i=0;i<total;i++){
  await evaluate(`window.__clock.step(${i===0?0:1000/FPS})`);
  const r=await call('Page.captureScreenshot',{format:'jpeg',quality:94,clip:{x:0,y:0,width:W,height:H,scale:1}});
  const buf=Buffer.from(r.result.data,'base64');if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));
  if(i%90===0)process.stdout.write(`\r khung ${i}/${total} (${((Date.now()-started)/1000).toFixed(0)} s)`);
 }
 ff.stdin.end();await ffDone;process.stdout.write('\n');
 const sounds=await evaluate('window.__sounds');
 // Âm: đúng engine LIVE (CultivationAudio) trong OfflineAudioContext, cả lớp biến thể theo id + tiếng một phát scene gọi.
 const wav=await evaluate(`(async()=>{
  const {CultivationAudio}=await import('/audio.js?v=prerender-20261120');const e=window.__ev,sr=48000,dur=${total/FPS},ctx=new OfflineAudioContext(2,Math.ceil((dur+.05)*sr),sr);
  const a=new CultivationAudio();a.init(ctx);a.enabled=true;if(a.ambBus)a.ambBus.gain.value=0;
  a.scheduleRitual(e,${realm},0);
  const map=k=>k.startsWith('qi-')?k:k==='gather'?'qi':k==='reveal'?'victory':k==='surge'?'ascension-charge':k==='echo'?'ascension-echo':k==='rush'?'ascension-rush':k==='screen-impact'?'ascension-screen-impact':'impact';
  const quantum=128/sr;for(const [k,at] of ${JSON.stringify(sounds)}){const when=Math.max(quantum,Math.round(at/quantum)*quantum);ctx.suspend(when).then(()=>{try{a.play(map(k));}catch(err){console.error(String(err));}ctx.resume();});}
  const buf=await ctx.startRendering(),L=buf.getChannelData(0),R=buf.getChannelData(1);let peak=0;
  const dv=new DataView(new ArrayBuffer(44+L.length*4)),w=(o,s)=>[...s].forEach((ch,i)=>dv.setUint8(o+i,ch.charCodeAt(0)));w(0,'RIFF');dv.setUint32(4,36+L.length*4,true);w(8,'WAVE');w(12,'fmt ');dv.setUint32(16,16,true);dv.setUint16(20,1,true);dv.setUint16(22,2,true);dv.setUint32(24,sr,true);dv.setUint32(28,sr*4,true);dv.setUint16(32,4,true);dv.setUint16(34,16,true);w(36,'data');dv.setUint32(40,L.length*4,true);
  for(let i=0;i<L.length;i++){peak=Math.max(peak,Math.abs(L[i]),Math.abs(R[i]));dv.setInt16(44+i*4,Math.max(-1,Math.min(1,L[i]))*32767,true);dv.setInt16(46+i*4,Math.max(-1,Math.min(1,R[i]))*32767,true);}
  const bytes=new Uint8Array(dv.buffer);let bin='';for(let i=0;i<bytes.length;i+=0x8000)bin+=String.fromCharCode(...bytes.subarray(i,i+0x8000));return {b64:btoa(bin),peak};})()`);
 await fs.writeFile(`${tmp}/audio.wav`,Buffer.from(wav.b64,'base64'));
 await run('ffmpeg',['-y','-loglevel','error','-i',`${tmp}/video.mp4`,'-i',`${tmp}/audio.wav`,'-c:v','copy','-c:a','aac','-b:a','160k','-shortest','-movflags','+faststart',out]);
 const st=await fs.stat(out);
 console.log(JSON.stringify({out,realm,gender,variant,durationMs:info.duration,frames:total,sounds:sounds.length,audioPeak:+wav.peak.toFixed(3),mb:+(st.size/1048576).toFixed(1),renderS:Math.round((Date.now()-started)/1000),errors:errors.slice(0,6)}));
}finally{try{ff?.stdin?.end();}catch{}socket?.close();chrome.kill();await pause(500);await fs.rm(tmp,{recursive:true,force:true}).catch(()=>{});}
