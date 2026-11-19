// 17/11/2026: QA Nguyệt Hạ Tình Lâu trên server THỬ (cổng 4399, dữ liệu riêng, thế giới demo) — không đụng LIVE.
// node scripts/qa-love-tower.mjs [port] → output/love-tower/*.jpg (sân lễ có Tình Lâu, tờ khung hình Mật Thất/Đại Điển)
import {spawn} from 'node:child_process';import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import WebSocket from 'ws';
const port=Number(process.argv[2]||4399),base=`http://127.0.0.1:${port}`,out='output/love-tower';await fs.mkdir(out,{recursive:true});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const data=await fs.mkdtemp(path.join(os.tmpdir(),'love-data-'));
const srv=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),VAN_HAI_DATA_DIR:data,VAN_HAI_TTS:'off',VAN_HAI_BRIDGE_AUTO:'0',VAN_HAI_WEB:'0'},stdio:'ignore',windowsHide:true});
const post=async(p,b)=>(await fetch(base+p,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(b)})).json();
const act=b=>post('/api/action?world=demo',b);
let ch,profile;
try{
 for(let i=0;i<60;i++){try{await fetch(base+'/api/state?world=demo');break;}catch{await pause(250);}}
 const names=[['a','Mẹ em Gạo'],['b','Đế giang'],['c','Chan Bố Mày'],['d','Tuần Sơn'],['e','Hoa Đào'],['f','Kiếm Khách'],['g','Tiểu Long Nữ'],['h','Dương Quá'],['i','Linh Nhi'],['j','Tiêu Dao']];
 for(const [id,name] of names)await act({type:'join',userId:id,name});
 for(let i=0;i<names.length;i+=2){await act({type:'chat',userId:names[i][0],text:'ketduyen '+names[i+1][1]});await act({type:'chat',userId:names[i+1][0],text:'dongy'});}
 // lễ Tam Sinh của đôi mới chiếm sân → chờ xong mới mở lễ
 for(let i=0;i<90;i++){const st=await (await fetch(base+'/api/state?world=demo')).json();if(!st.social?.activeCeremony&&!(st.social?.ceremonies||[]).length)break;await pause(1000);}
 console.log('festival',await post('/api/social-control?world=demo',{action:'start-bond-festival'}));
 await act({type:'chat',userId:'i',text:'song tu'});await act({type:'chat',userId:'j',text:'song tu'});
 for(const id of ['a','c','e'])console.log('gift1',(await act({type:'gift',userId:id,coins:1,count:1,giftName:'Rose',eventId:'r'+id})).ok);
 console.log('gift30',(await act({type:'gift',userId:'g',coins:30,count:1,giftName:'Doughnut',eventId:'d1'})).ok);
 console.log('gift100',JSON.stringify(await act({type:'gift',userId:'c',coins:100,count:1,giftName:'Confetti',eventId:'c1'})).slice(0,400));
 const st=await (await fetch(base+'/api/state?world=demo')).json();console.log('love',JSON.stringify({active:st.loveTower?.active,rooms:st.loveTower?.rooms?.filter(Boolean).length,cuts:st.loveTower?.cuts?.map(c=>[c.tier,c.room,c.qi]),gardens:st.loveTower?.gardens?.length}));
 profile=await fs.mkdtemp(path.join(os.tmpdir(),'love-ch-'));
 ch=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port=0','--no-first-run','--autoplay-policy=no-user-gesture-required','--mute-audio',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
 let dp;for(let i=0;i<80;i++){try{dp=Number((await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0]);break;}catch{await pause(100)}}
 const ts=await(await fetch(`http://127.0.0.1:${dp}/json/list`)).json();const ws=new WebSocket(ts.find(x=>x.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.on('open',r));
 let id=0;const pending=new Map(),logs=[];const send=(method,params={})=>new Promise((res,rej)=>{const i=++id;pending.set(i,{res,rej});ws.send(JSON.stringify({id:i,method,params}));});
 ws.on('message',m=>{const d=JSON.parse(m);if(d.id&&pending.has(d.id)){const p=pending.get(d.id);pending.delete(d.id);d.error?p.rej(Error(d.error.message)):p.res(d.result);}if(d.method==='Runtime.exceptionThrown')logs.push('EXC '+d.params.exceptionDetails.exception?.description);if(d.method==='Runtime.consoleAPICalled'&&['error','warning'].includes(d.params.type))logs.push(d.params.type+' '+d.params.args.map(a=>a.value||a.description).join(' '));});
 await send('Runtime.enable');await send('Page.enable');
 await send('Emulation.setDeviceMetricsOverride',{width:540,height:960,deviceScaleFactor:2,mobile:false});
 const shot=async name=>{const r=await send('Page.captureScreenshot',{format:'jpeg',quality:82});await fs.writeFile(`${out}/${name}.jpg`,Buffer.from(r.data,'base64'));};
 await send('Page.navigate',{url:`${base}/?overlay=1&world=demo&stage=world&quality=high&qa=1`});await pause(7000);
 await shot('01-festival-live');await pause(3500);await shot('02-festival-live-b');
 // Tờ khung hình: vẽ trực tiếp màn chiếu ở các mốc k (không chờ giờ thật).
 const sheet=await send('Runtime.evaluate',{awaitPromise:true,returnByValue:true,expression:`(async()=>{const m=await import('/love-tower.js');const s=window.__vhScene;if(!s?.loveStatus?.cuts?.length)return {err:'no cuts',st:!!s?.loveStatus};
  const H=1600,out={};for(const cut of s.loveStatus.cuts.flatMap(x=>x.tier==='grand'?[0].map(q=>({...x,qi:q})):[x])){const ks=cut.tier==='grand'?[.08,.3,.45,.55,.64,.72,.8,.88,.95]:[.12,.25,.36,.45,.55,.62,.7,.8,.88];const cols=3,rows=3,cv=document.createElement('canvas');cv.width=900*cols/2;cv.height=H*rows/2;const g=cv.getContext('2d');
   for(let i=0;i<ks.length;i++){const one=document.createElement('canvas');one.width=900;one.height=H;const c=one.getContext('2d');m.drawLoveCut(s,c,performance.now()+i*300,H,cut,ks[i]);g.drawImage(one,(i%cols)*450,Math.floor(i/cols)*800,450,800);g.fillStyle='#fff';g.font='bold 22px sans-serif';g.fillText('k='+ks[i],(i%cols)*450+8,Math.floor(i/cols)*800+26);}
   out[cut.tier+'-'+cut.room+'-'+cut.qi]=cv.toDataURL('image/jpeg',.8);}return out;})()`});
 const v=sheet.result?.value||{};if(v.err)console.log('sheet',v);
 for(const [k,u] of Object.entries(v).filter(([,u])=>typeof u==='string'))await fs.writeFile(`${out}/sheet-${k}.jpg`,Buffer.from(u.split(',')[1],'base64'));
 // chờ màn chiếu thật để chắc hook chạy
 await pause(2000);await shot('03-cut-live');
 const perf=await send('Runtime.evaluate',{returnByValue:true,expression:`(()=>{const s=window.__vhScene;let n=0,t0=performance.now();return new Promise(r=>{const f=()=>{n++;if(performance.now()-t0<2000)requestAnimationFrame(f);else r({fps:n/2,cut:!!s?.cutFullActive});};requestAnimationFrame(f);});})()`,awaitPromise:true});
 console.log('perf',JSON.stringify(perf.result?.value));
 console.log('logs',logs.slice(0,12).join('\n'));
}finally{try{ch?.kill();}catch{}srv.kill();}
