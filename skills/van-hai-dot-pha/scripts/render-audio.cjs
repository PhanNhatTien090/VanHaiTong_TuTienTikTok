// Xuất âm cue đột phá ra WAV bằng OfflineAudioContext trong Chromium + in đỉnh âm theo từng 0,5 s.
// Tham số thêm cho hàm cue (JSON, sau dur), ví dụ Trúc Cơ: ... scheduleTrucCoAudio 10.8 '[1,"mix",1]'
// Cần server đang chạy (mặc định http://127.0.0.1:4317, đổi bằng BASE=...). Không cần loa.
// node skills/van-hai-dot-pha/scripts/render-audio.cjs out.wav /qi-audio.js scheduleQiAudio 8.8
// Mục tiêu: peak < 1.0; đỉnh theo thời gian phải có hình vòng cung: mở > tích tụ thấp > dâng > NỔ cao nhất > dư âm.
// Xem phổ: ffmpeg -i out.wav -lavfi showspectrumpic=s=1200x400:legend=1 spectrum.png
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const [out,mod,fn,dur]=process.argv.slice(2);const b=await chromium.launch();const p=await b.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto((process.env.BASE||'http://127.0.0.1:4317')+'/ascension-preview.html?capture=1');
const r=await p.evaluate(async([mod,fn,dur,extra])=>{globalThis.__args=extra?JSON.parse(extra):null;const m=await import(mod);const sr=48000,len=Math.ceil((+dur+2.5)*sr),ctx=new OfflineAudioContext(2,len,sr);
 m[fn](ctx,ctx.destination,0,+dur,...(globalThis.__args||[1,1]));const buf=await ctx.startRendering();const L=buf.getChannelData(0),R=buf.getChannelData(1);
 let peak=0,sum=0;for(let i=0;i<L.length;i++){const v=Math.max(Math.abs(L[i]),Math.abs(R[i]));peak=Math.max(peak,v);sum+=L[i]*L[i];}
 const wav=new DataView(new ArrayBuffer(44+L.length*4));const w=(o,s)=>[...s].forEach((ch,i)=>wav.setUint8(o+i,ch.charCodeAt(0)));
 w(0,'RIFF');wav.setUint32(4,36+L.length*4,true);w(8,'WAVE');w(12,'fmt ');wav.setUint32(16,16,true);wav.setUint16(20,1,true);wav.setUint16(22,2,true);wav.setUint32(24,sr,true);wav.setUint32(28,sr*4,true);wav.setUint16(32,4,true);wav.setUint16(34,16,true);w(36,'data');wav.setUint32(40,L.length*4,true);
 for(let i=0;i<L.length;i++){wav.setInt16(44+i*4,Math.max(-1,Math.min(1,L[i]))*32767,true);wav.setInt16(46+i*4,Math.max(-1,Math.min(1,R[i]))*32767,true);}
 const bytes=new Uint8Array(wav.buffer);let bin='';for(let i=0;i<bytes.length;i+=0x8000)bin+=String.fromCharCode(...bytes.subarray(i,i+0x8000));
 const seg=[];for(let s=0;s<+dur+2.5;s+=.5){let pk=0;for(let i=Math.floor(s*sr);i<Math.min(L.length,(s+.5)*sr);i++)pk=Math.max(pk,Math.abs(L[i]));seg.push(pk.toFixed(2));}
 return {peak,rms:Math.sqrt(sum/L.length),seg:seg.join(' '),b64:btoa(bin)};},[mod,fn,dur,process.argv[6]]);
fs.writeFileSync(out,Buffer.from(r.b64,'base64'));console.log('peak',r.peak.toFixed(3),'rms',r.rms.toFixed(4));console.log('per 0.5s peak:',r.seg);await b.close();})();
