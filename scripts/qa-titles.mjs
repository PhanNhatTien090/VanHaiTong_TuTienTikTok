// 21/11/2026: soát DANH HIỆU trên sân — server THỬ (cổng PORT, mặc định 4394) với bản sao dữ liệu LIVE, không đụng LIVE.
// Gán sẵn đủ loại danh hiệu cho người đang có mặt (Tông Chủ, VIP 3/2/1, danh hiệu sự kiện từng loại) rồi chụp sân thường
// (ảnh toàn cảnh + ảnh phóng to từng người có danh hiệu). node scripts/qa-titles.mjs → output/qa-titles/*.png
// CROWD=25 (số người có mặt), SHOTS=3 (số ảnh cách nhau 1,7 s để thấy chớp sáng).
import {spawn} from 'node:child_process';import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';
const port=Number(process.env.PORT||4394),base=`http://127.0.0.1:${port}`,out='output/qa-titles';await fs.mkdir(out,{recursive:true});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
try{await fetch(base+'/api/state');console.error('cổng',port,'đang bận');process.exit(1);}catch{}
const data=await fs.mkdtemp(path.join(os.tmpdir(),'qatitle-'));await fs.copyFile('data/source-visual.json',path.join(data,'source-visual.json')).catch(()=>{});
const w=JSON.parse(await fs.readFile('data/live.json','utf8')),now=Date.now(),far=now+3600e3;
for(const k of ['boss','miniEvent','opportunity','envelope','visitor'])delete w[k];
for(const [k,v] of Object.entries(w))if(v&&typeof v==='object'&&!Array.isArray(v)){if(v.phase&&!['idle','closed','done','ended','finished'].includes(v.phase)){v.phase='idle';v.endsAt=now-1000;v.closedAt=now-1000;}else if(v.endsAt>now&&!v.closedAt){v.endsAt=now-1000;v.closedAt=now-1000;}}
for(const k of ['nextBossAt','nextSmallAt','nextBigEventAt','nextVisitorAt','nextOpportunityAt','nextMiniAt'])w[k]=far;w.engagement&&(w.engagement.nextSmallAt=far);
w.liveSession={active:true,startedAt:now-3600e3};w.settings=Object.assign(w.settings||{},{autoEvents:false,bondEnabled:false});w.lastCeremonyAt=now;w.honorStageUntil=0;delete w.flowerEvent;if(w.nguDuong)delete w.nguDuong.match; // đại điển tự mở / dở sự kiện sẽ chặn EVENT
const crowd=Object.values(w.players).filter(p=>!p.resident&&!p.puppet&&p.realm>0).sort((a,b)=>(b.lastActive||0)-(a.lastActive||0)).slice(0,Number(process.env.CROWD||25));
crowd.forEach((p,i)=>{p.lastActive=now-i*4000;p.lastRealInteractionAt=now-i*4000;delete p.leftLiveAt;});
// mẫu danh hiệu sự kiện cho người KHÔNG VIP (VIP luôn thắng danh hiệu sự kiện)
const FUN=(process.env.FUN||'Đan Tặc • Kẻ Nổ Lò|Hộ Đạo Chân Quân|Mê Cung Chi Chủ|Thiết Thủ Vương|Đầu Sắt|Băng Tâm Cứu Lô').split('|');
let k=0;for(const p of crowd){if((p.giftCoins||0)>=100)continue;if(k<FUN.length){p.funTitle={name:FUN[k++],until:far};}}
w.mode='demo';await fs.writeFile(path.join(data,'live.json'),JSON.stringify({...w,mode:'live'}));await fs.writeFile(path.join(data,'demo.json'),JSON.stringify(w));
const srv=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),VAN_HAI_DATA_DIR:data,VAN_HAI_TTS:'off',VAN_HAI_BRIDGE_AUTO:'0',VAN_HAI_WEB:'0',WEB_SYNC_SECRET:''},stdio:'ignore',windowsHide:true});
for(let i=0;i<160;i++){try{await fetch(base+'/api/state?world=live');break;}catch{await pause(250);}}
const prof=await fs.mkdtemp(path.join(os.tmpdir(),'qatitle-ch-'));
const ch=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port=0','--no-first-run','--mute-audio',`--user-data-dir=${prof}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
let dp;for(let i=0;i<100;i++){try{dp=Number((await fs.readFile(path.join(prof,'DevToolsActivePort'),'utf8')).split('\n')[0]);break;}catch{await pause(100)}}
const ts=await(await fetch(`http://127.0.0.1:${dp}/json/list`)).json();const ws=new WebSocket(ts.find(x=>x.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const pend=new Map();const errs=[];ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.method==='Runtime.exceptionThrown')errs.push(d.params.exceptionDetails.exception?.description?.slice(0,300));if(d.id&&pend.has(d.id)){pend.get(d.id)(d.result||{});pend.delete(d.id);}};
const send=(method,params={})=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}));});
const shot=async(n,clip)=>{const r=await send('Page.captureScreenshot',{format:'png',...(clip?{clip:{...clip,scale:1}}:{})});if(r.data){await fs.writeFile(`${out}/${n}.png`,Buffer.from(r.data,'base64'));console.log('ảnh',`${out}/${n}.png`);}};
try{await send('Page.enable');await send('Runtime.enable');
 await send('Emulation.setDeviceMetricsOverride',{width:540,height:960,deviceScaleFactor:2,mobile:false});
 await send('Page.navigate',{url:`${base}/?overlay=1&world=demo&stage=world&quality=high&qa=1`});await pause(9000);
 // EVENT=sc:start-tower | visitor:tinh-ha | arena | boss | pet — mở 1 sự kiện trước khi chụp (soát giao diện từng sự kiện)
 if(process.env.EVENT){const [k,v]=process.env.EVENT.split(':');const P=(p,b={})=>fetch(base+p,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(b)}).then(r=>r.json()).catch(e=>({err:String(e)}));
  const r=k==='sc'?await P('/api/social-control?world=demo',{action:v}):k==='visitor'?await P('/api/visitor-event?world=demo',{kind:v}):k==='arena'?await P('/api/arena?world=demo',{minutes:5}):k==='boss'?await P('/api/boss?world=demo',{}):k==='pet'?await P('/api/pet-event?world=demo',{action:'start'}):k==='flower'?await P('/api/flower-event?world=demo',{minutes:3}):{err:'EVENT lạ'};
  console.log('mở',process.env.EVENT,JSON.stringify(r).slice(0,120));await pause(Number(process.env.EVENT_WAIT||8000));
  for(const id of crowd.slice(0,6).map(p=>p.id))await P('/api/action?world=demo',{type:'chat',userId:id,name:'x',text:'1'});await pause(1500);}
 // RECTS="#giftBoard;.tw2-panel": in khung các phần tử theo selector
 if(process.env.RECTS){const r=await send('Runtime.evaluate',{returnByValue:true,expression:`${JSON.stringify(process.env.RECTS)}.split(";").map(q=>[...document.querySelectorAll(q)].slice(0,3).map(el=>{const b=el.getBoundingClientRect();return q+" "+(el.id||el.className.toString().slice(0,40))+" ["+Math.round(b.left)+","+Math.round(b.top)+" "+Math.round(b.width)+"x"+Math.round(b.height)+"] hidden="+el.hidden}).join(" | ")||q+" (không có)").join(" ### ")`});console.log(r.result?.value??JSON.stringify(r).slice(0,200));}
 // PROBE="x,y;x,y" (px CSS): in phần tử + khung tại từng điểm (tìm đúng bảng bị đè)
 if(process.env.PROBE){const r=await send('Runtime.evaluate',{returnByValue:true,expression:`${JSON.stringify(process.env.PROBE)}.split(';').map(p=>{const [x,y]=p.split(',').map(Number);const out=[];for(const el of document.elementsFromPoint(x,y).slice(0,4)){const b=el.getBoundingClientRect();out.push((el.id?'#'+el.id:el.tagName.toLowerCase())+'.'+[...el.classList].slice(0,3).join('.')+' ['+Math.round(b.left)+','+Math.round(b.top)+' '+Math.round(b.width)+'x'+Math.round(b.height)+'] z='+getComputedStyle(el).zIndex);}return p+' → '+out.join(' | ');}).join(' ### ')`});console.log(r.result?.value??JSON.stringify(r.exceptionDetails||r).slice(0,300));}
 for(let i=0;i<Number(process.env.SHOTS||3);i++){await shot('san-'+i);await pause(Number(process.env.EVERY||1700));}
 // ảnh phóng to vùng giữa sân (nơi đông người)
 await shot('zoom-giua',{x:60,y:330,width:420,height:330});
 // FLASH=x,y,w,h (px CSS): chụp cận 14 khung cách 250 ms để xem chữ vàng lóe sáng
 if(process.env.FLASH){const [x,y,width,height]=process.env.FLASH.split(',').map(Number);for(let i=0;i<14;i++){const r=await send('Page.captureScreenshot',{format:'png',clip:{x,y,width,height,scale:2}});await fs.writeFile(`${out}/flash-${String(i).padStart(2,'0')}.png`,Buffer.from(r.data,'base64'));await pause(250);}console.log('ảnh cận lóe sáng: '+out+'/flash-*.png');}
 // STRIP=1: vẽ thẳng từng pha lóe sáng của mọi loại danh hiệu ra 1 ảnh (không phụ thuộc lúc chụp)
 if(process.env.STRIP){const r=await send('Runtime.evaluate',{awaitPromise:true,returnByValue:true,expression:`(async()=>{const m=await import('/title-plaques.js');await document.fonts.load('900 17px "Noto Serif"');await new Promise(r=>setTimeout(r,800));
  const PAID={'tong-chu':['master',0],'dai-gia':['vip3',1],'than-tai':['vip3',1],'nha-giau':['vip2',3],'phu-ho':['vip1',4]},LH=['luan-hoi','sap-luan-hoi','chi-ton'],EV=['ke-no-lo','cuu-lo','than-luyen-dan','vuot-kiep','ho-dao-vuong','vua-me-cung','kiem-khoi','chien-than','vua-go-dau','dau-sat'];
  const T=Object.entries(m.SHORT).map(([key,text])=>PAID[key]?{rank:PAID[key][1],kind:PAID[key][0],key,text,paid:true}:LH.includes(key)?{rank:2,kind:'luanhoi',key,text,n:key==='luan-hoi'?3:0,tier:{main:'#b77bff',soft:'#ead8ff',deep:'#2a0e4a'}}:EV.includes(key)?{rank:5,kind:'feat',key,text,icon:m.eventIcon(text)}:{rank:6,kind:'rank',key,text});
  await new Promise(r=>setTimeout(r,200));
  for(const t of T)m.drawTitlePlaque(document.createElement('canvas').getContext('2d'),t,0,0,0);await new Promise(r=>setTimeout(r,600));
  const P=[9999,250,560],cv=document.createElement('canvas');cv.width=P.length*190*2;cv.height=T.length*34*2;const c=cv.getContext('2d');c.scale(2,2);c.fillStyle='#8fa3bf';c.fillRect(0,0,cv.width,cv.height);
  T.forEach((t,i)=>P.forEach((p,j)=>m.drawTitlePlaque(c,t,95+j*190,30+i*34,p,0,false)));return cv.toDataURL('image/png');})()`});
  await fs.writeFile(out+'/strip.png',Buffer.from(String(r.result?.value||'').split(',')[1]||'','base64'));console.log('dải pha: '+out+'/strip.png',r.exceptionDetails?JSON.stringify(r.exceptionDetails).slice(0,300):'');}
 // CMD=cánh: người có coin cao nhất trên sân gõ lệnh → chụp 3 ảnh (0,8 s · 2 s · 4 s) + trạng thái khung thẻ
 if(process.env.CMD){
  if(process.env.DEBUG_DECK){await send('Debugger.enable');ws.addEventListener('message',m=>{const d=JSON.parse(m.data);if(d.method==='Runtime.consoleAPICalled'&&String(d.params.args?.[0]?.value||'').startsWith('DBG'))console.log(d.params.args.map(x=>x.value??x.description).join(' ').slice(0,300));});
   for(const [re,line,cond] of [['app\.js',436,"console.log('DBG enqueue',e?.effect,e?.user,!!e?.card,e?.card?.kind),false"],['inventory-multi\.js',120,"console.log('DBG show',event?.card?.kind,!!this.container,this.cards.length),false"]])console.log('bp',JSON.stringify((await send('Debugger.setBreakpointByUrl',{urlRegex:re,lineNumber:line,condition:cond})).locations||'').slice(0,120));}
  const who=crowd.slice().sort((a,b)=>(b.giftCoins||0)-(a.giftCoins||0))[0];const r=await(await fetch(base+'/api/action?world=demo',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({type:'chat',userId:who.id,name:who.name,text:process.env.CMD})})).json();console.log('gõ',process.env.CMD,'bởi',who.name,'→',JSON.stringify(r).slice(0,200));
  {const st=await(await fetch(base+'/api/state?world=demo&view=overlay')).json();const ev=(st.events||[]).filter(e=>e.user===who.id).slice(-1)[0];console.log('luồng overlay: sự kiện cuối của người gõ =',ev?JSON.stringify({effect:ev.effect,text:(ev.text||'').slice(0,40),card:ev.card?ev.card.kind:null}):'không có');}
  await send('Runtime.evaluate',{expression:`window.__deckLog=[];`});
  for(const [i,ms] of [[0,800],[1,1200],[2,2000]]){await pause(ms);await shot('cmd-'+i);}
  const d=await send('Runtime.evaluate',{returnByValue:true,expression:`(()=>{const b=document.getElementById('inventoryDeck');if(!b)return 'không có #inventoryDeck';const cs=getComputedStyle(b);return 'deck: hidden='+b.hidden+' display='+cs.display+' vis='+cs.visibility+' op='+cs.opacity+' rect='+JSON.stringify(b.getBoundingClientRect())+' cards='+b.children.length+' html='+b.innerHTML.slice(0,200)})()`});console.log(d.result?.value);}
 // vị trí người có danh hiệu (qa=1 → window.__vhScene)
 const r=await send('Runtime.evaluate',{returnByValue:true,expression:`(()=>{const s=window.__vhScene;if(!s)return 'không có __vhScene';return (s.targets||[]).filter(a=>a.player&&(a.player.giftCoins>=100||a.player.funTitle||a.player.honor?.title)).slice(0,14).map(a=>a.player.name+' @'+Math.round(a.x)+','+Math.round(a.y)+' vip:'+(a.player.giftCoins||0)+' fun:'+(a.player.funTitle?.name||'')+' honor:'+(a.player.honor?.title||'')).join('\\n')})()`});
 console.log(r.result?.value);console.log('LỖI JS:',errs.length?errs:'không');
}finally{try{ws.close();}catch{}ch.kill();srv.kill();}
