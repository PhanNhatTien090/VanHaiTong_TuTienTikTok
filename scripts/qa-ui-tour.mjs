// 19/11/2026: chụp TOÀN BỘ giao diện hiện tại để lên kế hoạch đổi mới — server THỬ (cổng 4399) với BẢN SAO dữ liệu LIVE,
// không kết nối TikFinity/web, không đụng LIVE. node scripts/qa-ui-tour.mjs → output/ui-tour/*.jpg
import {spawn} from 'node:child_process';import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';
const port=4399,base=`http://127.0.0.1:${port}`,out='output/ui-tour';await fs.mkdir(out,{recursive:true});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const post=async(p,b={})=>{try{return await(await fetch(base+p,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(b)})).json();}catch(e){return {err:String(e)};}};
const act=b=>post('/api/action?world=live',b);
async function server(){const data=await fs.mkdtemp(path.join(os.tmpdir(),'uitour-'));for(const f of ['demo.json','source-visual.json'])await fs.copyFile('data/'+f,path.join(data,f)).catch(()=>{});
 // bản sao LIVE "sạch": đóng sự kiện đang chạy, hoãn mọi sự kiện tự động → mỗi cảnh chỉ có đúng thứ cần chụp
 const w=JSON.parse(await fs.readFile('data/live.json','utf8')),now=Date.now(),far=now+3600e3;
 if(w.visitor){w.visitor.closedAt=now-1000;w.visitor.endsAt=Math.min(w.visitor.endsAt,now-1000);}
 for(const k of ['boss','miniEvent','opportunity','envelope'])if(w[k])delete w[k];
 for(const [k,v] of Object.entries(w))if(v&&typeof v==='object'&&!Array.isArray(v)&&k!=='visitor'){
  if(v.phase&&!['idle','closed','done','ended','finished'].includes(v.phase)){v.phase='idle';v.endsAt=now-1000;v.closedAt=now-1000;}
  else if(v.endsAt>now&&!v.closedAt){v.endsAt=now-1000;v.closedAt=now-1000;}}
 for(const k of ['nextBossAt','nextSmallAt','nextBigEventAt','nextVisitorAt','nextOpportunityAt','nextMiniAt'])w[k]=far;
 w.engagement&&(w.engagement.nextSmallAt=far);
 await fs.writeFile(path.join(data,'live.json'),JSON.stringify(w));
 const srv=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),VAN_HAI_DATA_DIR:data,VAN_HAI_TTS:'off',VAN_HAI_BRIDGE_AUTO:'0',VAN_HAI_WEB:'0',WEB_SYNC_SECRET:''},stdio:'ignore',windowsHide:true});
 for(let i=0;i<120;i++){try{await fetch(base+'/api/state?world=live');break;}catch{await pause(250);}}return srv;}
const prof=await fs.mkdtemp(path.join(os.tmpdir(),'uitour-ch-'));
const ch=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port=0','--no-first-run','--autoplay-policy=no-user-gesture-required','--mute-audio',`--user-data-dir=${prof}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
let dp;for(let i=0;i<100;i++){try{dp=Number((await fs.readFile(path.join(prof,'DevToolsActivePort'),'utf8')).split('\n')[0]);break;}catch{await pause(100)}}
const ts=await(await fetch(`http://127.0.0.1:${dp}/json/list`)).json();const ws=new WebSocket(ts.find(x=>x.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const pend=new Map();ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id&&pend.has(d.id)){pend.get(d.id)(d.result||{});pend.delete(d.id);}};
const send=(method,params={})=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}));});
const view=(w,h,s=2,mobile=false)=>send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:s,mobile});
const shot=async n=>{const r=await send('Page.captureScreenshot',{format:'jpeg',quality:82});if(r.data){await fs.writeFile(`${out}/${n}.jpg`,Buffer.from(r.data,'base64'));console.log('shot',n);}};
const overlay=`${base}/?overlay=1&world=live&stage=world&quality=high&qa=1`;
async function scene(name,setup,{wait=6000,url=overlay,shots=[[0,'']]}={}){
 const srv=await server();try{await view(540,960);await send('Page.navigate',{url});await pause(wait);
  if(setup)await setup();for(const [ms,suffix] of shots){await pause(ms);await shot(name+suffix);}}finally{srv.kill();await pause(600);}}
try{
 await send('Page.enable');
 // 1 sân thường đông người (dữ liệu LIVE)
 await scene('01-san-thuong',null,{shots:[[0,''],[9000,'-b']]});
 // 2 NGƯỜI MỚI vào LIVE lần đầu → gõ 1 → gõ 8
 await scene('02-nguoi-moi',async()=>{await act({type:'join',userId:'newbie-qa',name:'Người Mới Toanh'});},{shots:[[1200,'-vao'],[2500,'-vao-b']]});
 await scene('03-nguoi-moi-go-lenh',async()=>{await act({type:'join',userId:'newbie-qa',name:'Người Mới Toanh'});await pause(4000);await act({type:'cultivate',userId:'newbie-qa',name:'Người Mới Toanh'});},{shots:[[1500,'-go1']]});
 // 3 yêu thú
 await scene('04-yeu-thu',async()=>{console.log('boss',JSON.stringify(await post('/api/boss?world=live',{})).slice(0,80));},{shots:[[5000,'']]});
 // 4 sự kiện skin (Tiên Nhân Đài)
 await scene('05-su-kien-skin',async()=>{await post('/api/visitor-event?world=live',{kind:'bich-lan'});},{shots:[[4000,'']]});
 // 5 Lôi Đài
 await scene('06-loi-dai',async()=>{console.log('arena',JSON.stringify(await post('/api/arena?world=live',{minutes:8})).slice(0,80));},{shots:[[8000,'']]});
 // 6 cơ duyên
 await scene('07-co-duyen',async()=>{await post('/api/opportunity?world=live',{});},{shots:[[4000,'']]});
 // 7 trang điều hành (desktop)
 for(const [n,hash] of [['08-quan-ly-san','#scene'],['09-quan-ly-su-kien','#events'],['10-quan-ly-nguoi-choi','']]){
  const srv=await server();try{await view(1440,900,1);await send('Page.navigate',{url:`${base}/?world=live${hash}`});await pause(6000);await shot(n);}finally{srv.kill();await pause(600);}}
 // 8 bản web điện thoại (VPS thật, chỉ xem trang công khai)
 await view(390,844,2,true);await send('Page.navigate',{url:'https://vanhaitong.duckdns.org/'});await pause(7000);await shot('11-web-dien-thoai');
}finally{try{ws.close();}catch{}ch.kill();}
