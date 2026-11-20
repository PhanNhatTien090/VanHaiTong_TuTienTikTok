// 20/11/2026: soát HƯỚNG DẪN + độ rối màn hình: chụp sân thường mỗi 30 s trong 4,5 phút (đủ 1 vòng bảng thông tin 4 phút), người mới, gõ lệnh thiếu điều kiện;
// mỗi ảnh vẽ khung VÙNG GIAO DIỆN TIKTOK (ước lượng) để thấy cái gì bị bình luận/banner quà che — server THỬ (cổng 4399) với BẢN SAO dữ liệu LIVE,
// không kết nối TikFinity/web, không đụng LIVE. node scripts/qa-guide-tour.mjs → output/guide-tour/*.jpg
import {spawn} from 'node:child_process';import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';
const port=4399,base=`http://127.0.0.1:${port}`,out='output/guide-tour';await fs.mkdir(out,{recursive:true});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const post=async(p,b={})=>{try{return await(await fetch(base+p,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(b)})).json();}catch(e){return {err:String(e)};}};
const act=b=>post('/api/action?world=demo',b); // /api/action chỉ ghi được thế giới demo → demo = bản sao LIVE
async function server(){const data=await fs.mkdtemp(path.join(os.tmpdir(),'guidetour-'));for(const f of ['source-visual.json'])await fs.copyFile('data/'+f,path.join(data,f)).catch(()=>{});
 // bản sao LIVE "sạch": đóng sự kiện đang chạy, hoãn mọi sự kiện tự động → mỗi cảnh chỉ có đúng thứ cần chụp
 const w=JSON.parse(await fs.readFile('data/live.json','utf8')),now=Date.now(),far=now+3600e3;
 if(w.visitor){w.visitor.closedAt=now-1000;w.visitor.endsAt=Math.min(w.visitor.endsAt,now-1000);}
 for(const k of ['boss','miniEvent','opportunity','envelope'])if(w[k])delete w[k];
 for(const [k,v] of Object.entries(w))if(v&&typeof v==='object'&&!Array.isArray(v)&&k!=='visitor'){
  if(v.phase&&!['idle','closed','done','ended','finished'].includes(v.phase)){v.phase='idle';v.endsAt=now-1000;v.closedAt=now-1000;}
  else if(v.endsAt>now&&!v.closedAt){v.endsAt=now-1000;v.closedAt=now-1000;}}
 for(const k of ['nextBossAt','nextSmallAt','nextBigEventAt','nextVisitorAt','nextOpportunityAt','nextMiniAt'])w[k]=far;
 w.engagement&&(w.engagement.nextSmallAt=far);
 // giống lúc đang LIVE: phiên LIVE bật + ~25 người chơi thật (cảnh giới cao trước) đang có mặt
 w.liveSession={active:true,startedAt:now-3600e3};
 w.settings=Object.assign(w.settings||{},{autoEvents:false,bondEnabled:false}); // chụp sân thường: không cho sự kiện tự mở
 Object.values(w.players).filter(p=>!p.resident&&!p.puppet&&p.realm>0).sort((a,b)=>(b.lastActive||0)-(a.lastActive||0)).slice(0,Number(process.env.CROWD||25)).forEach((p,i)=>{p.lastActive=now-i*4000;p.lastRealInteractionAt=now-i*4000;delete p.leftLiveAt;});
 w.mode='demo';await fs.writeFile(path.join(data,'live.json'),JSON.stringify({...w,mode:'live'}));await fs.writeFile(path.join(data,'demo.json'),JSON.stringify(w));
 const srv=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),VAN_HAI_DATA_DIR:data,VAN_HAI_TTS:'off',VAN_HAI_BRIDGE_AUTO:'0',VAN_HAI_WEB:'0',WEB_SYNC_SECRET:''},stdio:'ignore',windowsHide:true});
 for(let i=0;i<120;i++){try{await fetch(base+'/api/state?world=live');break;}catch{await pause(250);}}return srv;}
const prof=await fs.mkdtemp(path.join(os.tmpdir(),'guidetour-ch-'));
const ch=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port=0','--no-first-run','--autoplay-policy=no-user-gesture-required','--mute-audio',`--user-data-dir=${prof}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
let dp;for(let i=0;i<100;i++){try{dp=Number((await fs.readFile(path.join(prof,'DevToolsActivePort'),'utf8')).split('\n')[0]);break;}catch{await pause(100)}}
const ts=await(await fetch(`http://127.0.0.1:${dp}/json/list`)).json();const ws=new WebSocket(ts.find(x=>x.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const pend=new Map();ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id&&pend.has(d.id)){pend.get(d.id)(d.result||{});pend.delete(d.id);}};
const send=(method,params={})=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}));});
const view=(w,h,s=2,mobile=false)=>send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:s,mobile});
const shot=async n=>{const r=await send('Page.captureScreenshot',{format:'jpeg',quality:82});if(r.data){await fs.writeFile(`${out}/${n}.jpg`,Buffer.from(r.data,'base64'));console.log('shot',n);}};
const overlay=`${base}/?overlay=1&world=demo&stage=world&quality=high&qa=1`;
// Vùng TikTok LIVE dọc (ước lượng theo app điện thoại; % chiều cao/rộng): thanh trên, banner quà bên trái, bình luận, thanh dưới.
const ZONES=[['thanh trên',0,0,100,8],['banner quà',0,42,62,56],['bình luận',0,57,74,89],['thanh dưới',0,90,100,100]];
const zoneJs=on=>`(()=>{document.getElementById('qaZones')?.remove();if(!${on})return;const d=document.createElement('div');d.id='qaZones';d.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:99999';
 d.innerHTML=${JSON.stringify(ZONES)}.map(([n,x1,y1,x2,y2])=>'<div style="position:absolute;left:'+x1+'%;top:'+y1+'%;width:'+(x2-x1)+'%;height:'+(y2-y1)+'%;border:3px dashed rgba(255,40,40,.95);background:rgba(255,0,0,.10);font:700 13px Segoe UI;color:#ff3b3b;text-shadow:0 0 3px #000">'+n+'</div>').join('');document.body.appendChild(d);})()`;
const shotZ=async n=>{await send('Runtime.evaluate',{expression:zoneJs(true)});await shot(n);await send('Runtime.evaluate',{expression:zoneJs(false)});};
const txt=async()=>(await send('Runtime.evaluate',{returnByValue:true,expression:`[...document.querySelectorAll('.scene-shell :is(aside,section,div)[id]')].filter(e=>e.offsetParent&&getComputedStyle(e).visibility!=='hidden'&&e.innerText.trim()&&e.getBoundingClientRect().height>20).map(e=>{const r=e.getBoundingClientRect();return e.id+' @'+Math.round(r.left)+','+Math.round(r.top)+' '+Math.round(r.width)+'x'+Math.round(r.height)+' | '+e.innerText.replace(/\s+/g,' ').slice(0,140)}).join('\n')`})).result?.value;
try{
 await send('Page.enable');await send('Runtime.enable');
 const srv=await server();try{await view(540,960);await send('Page.navigate',{url:overlay});await pause(7000);
  if(process.env.ALIGN){const want=Number(process.env.ALIGN)>1?Number(process.env.ALIGN):24000,c=Date.now()%40000;await pause((want-c+40000)%40000);} // ALIGN=1: chụp đúng lúc cuộn đang ở Sổ lệnh (giây 20–32 mỗi vòng 40 s)
  for(let i=0;i<(process.env.QUICK?1:Number(process.env.SHOTS||10));i++){await shotZ('01-san-'+String(i*30).padStart(3,'0')+'s');if(i===0||i===5)console.log('--- bảng đang hiện @'+i*30+'s\n'+await txt());await pause(Number(process.env.EVERY||30000));}
  // người mới vào + gõ lệnh thiếu điều kiện
  await act({type:'join',userId:'newbie-qa',name:'Người Mới Toanh'});await pause(2500);await shotZ('02-nguoi-moi-vao');
  await act({type:'chat',userId:'newbie-qa',name:'Người Mới Toanh',text:'rèn'});await pause(2000);await shotZ('03-go-ren-thieu-tien');console.log('--- sau khi gõ rèn\n'+await txt());
  await act({type:'chat',userId:'newbie-qa',name:'Người Mới Toanh',text:'8'});await pause(2000);await shotZ('04-go-8-chua-du');
 }finally{srv.kill();}
}finally{try{ws.close();}catch{}ch.kill();}
