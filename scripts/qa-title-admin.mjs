// 21/11/2026 tối: soát tab DANH HIỆU trang quản lý — server THỬ (PORT, mặc định 4391) với bản sao dữ liệu LIVE.
// Mở /?world=live#titles, gán thử 1 danh hiệu qua form, chụp ảnh. node scripts/qa-title-admin.mjs → output/qa-title-admin/*.png
import {spawn} from 'node:child_process';import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';
const port=Number(process.env.PORT||4391),base=`http://127.0.0.1:${port}`,out='output/qa-title-admin';await fs.mkdir(out,{recursive:true});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
try{await fetch(base+'/api/state');console.error('cổng',port,'đang bận');process.exit(1);}catch{}
const data=await fs.mkdtemp(path.join(os.tmpdir(),'qatadm-'));
const w=JSON.parse(await fs.readFile('data/live.json','utf8'));await fs.writeFile(path.join(data,'live.json'),JSON.stringify(w));await fs.writeFile(path.join(data,'demo.json'),JSON.stringify({...w,mode:'demo'}));
const srv=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),VAN_HAI_DATA_DIR:data,VAN_HAI_TTS:'off',VAN_HAI_BRIDGE_AUTO:'0',VAN_HAI_WEB:'0',WEB_SYNC_SECRET:''},stdio:'ignore',windowsHide:true});
for(let i=0;i<160;i++){try{await fetch(base+'/api/state?world=live');break;}catch{await pause(250);}}
const prof=await fs.mkdtemp(path.join(os.tmpdir(),'qatadm-ch-'));
const ch=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port=0','--no-first-run','--mute-audio',`--user-data-dir=${prof}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
let dp;for(let i=0;i<100;i++){try{dp=Number((await fs.readFile(path.join(prof,'DevToolsActivePort'),'utf8')).split('\n')[0]);break;}catch{await pause(100)}}
const ts=await(await fetch(`http://127.0.0.1:${dp}/json/list`)).json();const ws=new WebSocket(ts.find(x=>x.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const pend=new Map();const errs=[];ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.method==='Runtime.exceptionThrown')errs.push(d.params.exceptionDetails.exception?.description?.slice(0,300));if(d.method==='Log.entryAdded'&&d.params.entry.level==='error')errs.push(d.params.entry.text.slice(0,200));if(d.id&&pend.has(d.id)){pend.get(d.id)(d.result||{});pend.delete(d.id);}};
const send=(method,params={})=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}));});
const shot=async(n,full=false)=>{const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:full});await fs.writeFile(`${out}/${n}.png`,Buffer.from(r.data,'base64'));console.log('ảnh',`${out}/${n}.png`);};
const ev=async e=>(await send('Runtime.evaluate',{expression:e,awaitPromise:true,returnByValue:true})).result?.value;
try{await send('Page.enable');await send('Runtime.enable');await send('Log.enable');
 await send('Emulation.setDeviceMetricsOverride',{width:1920,height:1080,deviceScaleFactor:1,mobile:false});
 await send('Page.navigate',{url:`${base}/?world=live#titles`});await pause(5000);
 await ev(`document.querySelector('[data-tab="titles"]').click()`);await pause(2500);
 console.log('dò:',await ev(`(()=>{const v=document.getElementById('titlesView'),a=document.getElementById('titleAdmin');const b=v.getBoundingClientRect();return 'view='+v.className+' rect='+[b.x,b.y,b.width,b.height].map(Math.round)+' adminHTML='+(a?.innerHTML.length)+' scrollY='+scrollY+' parent='+v.parentElement.className+' display='+getComputedStyle(v).display})()`));
 console.log('so sánh Ngũ Đường:',await ev(`(async()=>{document.querySelector('[data-tab=\"halls\"]').click();await new Promise(r=>setTimeout(r,800));const b=document.getElementById('hallsView').getBoundingClientRect();const kids=[...document.querySelector('.main-content').children].map(c=>(c.id||c.className).toString().slice(0,30)+':'+Math.round(c.getBoundingClientRect().height)+(getComputedStyle(c).display==='none'?'(ẩn)':'')).join(' | ');document.querySelector('[data-tab=\"titles\"]').click();await new Promise(r=>setTimeout(r,800));return 'halls y='+Math.round(b.y)+' || '+kids})()`));
 console.log('POST trực tiếp:',await ev(`fetch('/api/title-admin?world=live',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'grant',key:'lam-mom',who:'Đế giang',minutes:30})}).then(async r=>r.status+' '+(await r.text()).slice(0,200)).catch(e=>'lỗi '+e)`));
 console.log('dò form:',await ev(`(async()=>{const f=document.querySelector('#titleAdmin form');const m=document.querySelector('#titleAdmin .ta-msg');f.who.value='';f.querySelector('button[type=submit]').click();await new Promise(r=>setTimeout(r,300));const a=m.textContent;return 'trống→['+a+'] forms='+document.querySelectorAll('#titleAdmin form').length+' who='+typeof f.who+' key='+(f.key&&f.key.tagName)+' dur='+(f.dur&&f.dur.tagName);})()`));
 console.log('dò 2:',await ev(`(async()=>{const f=document.querySelector('#titleAdmin form');const e=new Event('submit',{cancelable:true});f.dispatchEvent(e);const same=document.querySelector('#titleAdmin .ta-msg');await new Promise(r=>setTimeout(r,200));const mods=[...document.scripts].map(s=>s.src.split('/').pop()).join(',');return 'prevented='+e.defaultPrevented+' msg=['+same.textContent+'] scripts='+mods;})()`));
 console.log('số thẻ:',await ev(`document.querySelectorAll('#titleAdmin .ta-card').length`));
 await ev(`document.getElementById('titleAdmin').scrollIntoView()`);await pause(400);await shot('1-tab');
 const who=process.env.WHO||'Đế giang';
 console.log('gán:',await ev(`(async()=>{const f=document.querySelector('#titleAdmin form');f.key.value='kiem-khoi';f.who.value=${JSON.stringify(who)};f.dur.value='60';f.requestSubmit();await new Promise(r=>setTimeout(r,4000));return document.querySelector('#titleAdmin .ta-msg').textContent;})()`));
 await ev(`document.querySelector('#titleAdmin .ta-filter').value='kiếm khôi';document.querySelector('#titleAdmin .ta-filter').dispatchEvent(new Event('input'))`);await pause(500);
 await ev(`document.getElementById('titleAdmin').scrollIntoView()`);await pause(400);await shot('2-sau-khi-gan');
 console.log('trùng tên:',await ev(`(async()=>{const f=document.querySelector('#titleAdmin form');f.who.value='a';f.requestSubmit();await new Promise(r=>setTimeout(r,1200));return document.querySelector('#titleAdmin .ta-msg').textContent+' | lựa chọn: '+document.querySelectorAll('#titleAdmin .ta-cands button').length;})()`));
 await shot('3-trung-ten');
 const st=await(await fetch(base+'/api/title-admin?world=live')).json();console.log('API: người giữ Kiếm Khôi =',st.titles.find(t=>t.key==='kiem-khoi').holders.map(h=>h.name+'('+h.source+')').join(', '));
 console.log('LỖI JS:',errs.length?errs:'không');
}finally{try{ws.close();}catch{}ch.kill();srv.kill();}
