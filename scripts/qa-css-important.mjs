// 21/11/2026 — Gỡ !important THỪA một cách có kiểm chứng (mục 4, docs/CAI-TIEN-2026-11-20.md).
// Cách làm: server THỬ 4391 (bản sao LIVE) + Chrome headless. Ở từng cảnh (sân thường, từng sự kiện, từng tab quản lý…),
// trong CÙNG một khoảnh khắc (đồng bộ, không nhường JS) áp bộ CSS gốc (A) rồi bộ CSS đã gỡ !important (B), so getComputedStyle
// của MỌI phần tử (+ ::before/::after). Lệch ở đâu → tìm khai báo !important đã gỡ mà áp vào đúng phần tử/thuộc tính đó → GIỮ lại. Lặp tới 0 lệch.
// Khai báo !important không khớp phần tử nào trong mọi cảnh → GIỮ (không kiểm được thì không đụng).
// node scripts/qa-css-important.mjs            → chạy đo, ghi output/css-important/result.json
// node scripts/qa-css-important.mjs --apply    → ghi thẳng vào public/*.css theo result.json
// LAYERS=1 → B còn gói mỗi file vào @layer theo thứ tự nạp (chỉ để ĐO xem gói lớp làm lệch bao nhiêu chỗ).
import {spawn} from 'node:child_process';import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';
import {parseCss,stripImportant} from './css-decls.mjs';
const out='output/css-important';await fs.mkdir(out,{recursive:true});
const html=await fs.readFile('public/index.html','utf8');
const FILES=[...html.matchAll(/href="\/([a-z0-9-]+\.css)[^"]*"/g)].map(m=>m[1]);FILES.push('tower-v2.css');
const SRC={},DECLS={};for(const f of FILES){SRC[f]=await fs.readFile('public/'+f,'utf8');DECLS[f]=parseCss(SRC[f]);}
const layerName=f=>'vh-'+f.replace(/\.css$/,'');
const buildB=strip=>FILES.map((f,k)=>{const t=stripImportant(SRC[f],DECLS[f],strip[f]);return process.env.LAYERS?(k===0?'@layer '+FILES.map(layerName).join(',')+';\n':'')+'@layer '+layerName(f)+'{\n'+t+'\n}':t;});
if(process.argv.includes('--apply')){
 const r=JSON.parse(await fs.readFile(out+'/result.json','utf8'));let n=0;
 const want=new Set(r.stripSigs||[]);const SIGA={};for(const f of FILES){const seen=new Map();SIGA[f]=DECLS[f].map(d=>{const b=[f,d.at,d.sel.replace(/s+/g,' '),d.prop,d.value.replace(/s+/g,' ')].join('|');const k=(seen.get(b)||0)+1;seen.set(b,k);return b+'|#'+k;});}
 const root=process.env.APPLY_TO||'public/';for(const f of FILES){const ix=new Set(DECLS[f].map((d,i)=>d.important&&want.has(SIGA[f][i])?i:-1).filter(i=>i>=0));if(!ix.size)continue;await fs.writeFile(root+f,stripImportant(SRC[f],DECLS[f],ix));n+=ix.size;}
 console.log('đã gỡ',n,'!important');process.exit(0);
}
// ---- danh sách khai báo !important gửi xuống trang
// Khóa = CHỮ KÝ NỘI DUNG (file|@media|selector|thuộc tính|giá trị|#lần) — phiên khác sửa CSS giữa chừng thì khóa vẫn đúng (21/11).
const SIG={};for(const f of FILES){const seen=new Map();SIG[f]=DECLS[f].map(d=>{const b=[f,d.at,d.sel.replace(/s+/g,' '),d.prop,d.value.replace(/s+/g,' ')].join('|');const n=(seen.get(b)||0)+1;seen.set(b,n);return b+'|#'+n;});}
const IMP=[];for(const f of FILES)DECLS[f].forEach((d,ix)=>{if(d.important)IMP.push({f,ix,sig:SIG[f][ix],sel:d.sel,prop:d.prop,value:d.value,at:d.at});});
const prev=process.env.KEEP_FROM?JSON.parse(await fs.readFile(process.env.KEEP_FROM,'utf8')):{};const keep=new Set(prev.keepList||[]),matched=new Set(prev.matchedList||[]); // cộng dồn qua nhiều lần chạy
const ONLY=process.env.ONLY?process.env.ONLY.split(','):null; // ONLY=lôi đài,linh thú → chỉ chạy các sự kiện này (sự kiện không có lệnh dừng chặn sự kiện sau)
const key=d=>d.sig;
const stripSet=()=>{const s={};for(const f of FILES)s[f]=new Set();for(const d of IMP)if(!keep.has(key(d)))s[d.f].add(d.ix);return s;};
// ---- server thử + Chrome (giống scripts/qa-guide-tour.mjs)
const port=Number(process.env.PORT||4391),base=`http://127.0.0.1:${port}`;const pause=ms=>new Promise(r=>setTimeout(r,ms));
const post=async(p,b={})=>{try{return await(await fetch(base+p,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(b)})).json();}catch(e){return {err:String(e)};}};
try{await fetch(base+'/api/state');console.error('cổng thử đang bận — đặt PORT khác');process.exit(1);}catch{}
const data=await fs.mkdtemp(path.join(os.tmpdir(),'cssimp-'));await fs.copyFile('data/source-visual.json',path.join(data,'source-visual.json')).catch(()=>{});
{const w=JSON.parse(await fs.readFile('data/live.json','utf8')),now=Date.now();for(const k of ['boss','miniEvent','opportunity','envelope','visitor','honorCeremony'])delete w[k]; // bản sao LIVE có thể đang mở sự kiện → đóng hết để từng sự kiện mở được
 const past=now-3600e3; // lùi hẳn 1 giờ: mưa hoa còn giữ sân 30 s sau khi đóng (stage-lock.mjs)
 for(const [k,v] of Object.entries(w))if(v&&typeof v==='object'&&!Array.isArray(v)){if(v.phase&&!['idle','closed','done','ended','finished'].includes(v.phase)){v.phase='idle';v.endsAt=past;v.closedAt=past;}else if(v.endsAt>past&&!v.closedAt||v.closedAt>past){v.endsAt=past;v.closedAt=past;}if(v.podiumUntil)v.podiumUntil=0;}
 delete w.flowerEvent;if(w.nguDuong)delete w.nguDuong.match;w.honorStageUntil=0;w.lastCeremonyAt=now; // đại điển vinh danh tự mở khi lâu chưa có → chặn sự kiện khác
 if(w.social)w.social.activeCeremony=null;
 w.liveSession={active:true,startedAt:now-3600e3};w.settings=Object.assign(w.settings||{},{autoEvents:false});
 Object.values(w.players).filter(p=>!p.resident&&!p.puppet&&p.realm>0).sort((a,b)=>(b.lastActive||0)-(a.lastActive||0)).slice(0,25).forEach((p,i)=>{p.lastActive=now-i*4000;p.lastRealInteractionAt=now-i*4000;delete p.leftLiveAt;});
 w.mode='demo';await fs.writeFile(path.join(data,'live.json'),JSON.stringify({...w,mode:'live'}));await fs.writeFile(path.join(data,'demo.json'),JSON.stringify(w));}
const srv=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port),VAN_HAI_DATA_DIR:data,VAN_HAI_TTS:'off',VAN_HAI_BRIDGE_AUTO:'0',VAN_HAI_WEB:'0',WEB_SYNC_SECRET:''},stdio:'ignore',windowsHide:true});
for(let i=0;i<160;i++){try{await fetch(base+'/api/state?world=live');break;}catch{await pause(250);}}
const prof=await fs.mkdtemp(path.join(os.tmpdir(),'cssimp-ch-'));
const ch=spawn('C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--remote-debugging-port=0','--no-first-run','--mute-audio',`--user-data-dir=${prof}`,'about:blank'],{windowsHide:true,stdio:'ignore'});
let dp;for(let i=0;i<100;i++){try{dp=Number((await fs.readFile(path.join(prof,'DevToolsActivePort'),'utf8')).split('\n')[0]);break;}catch{await pause(100)}}
const ts=await(await fetch(`http://127.0.0.1:${dp}/json/list`)).json();const ws=new WebSocket(ts.find(x=>x.type==='page').webSocketDebuggerUrl);await new Promise(r=>ws.onopen=r);
let id=0;const pend=new Map();ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.id&&pend.has(d.id)){pend.get(d.id)(d.result||{error:d.error});pend.delete(d.id);}};
const send=(method,params={})=>new Promise(r=>{const i=++id;pend.set(i,r);ws.send(JSON.stringify({id:i,method,params}));});
const ev=async(expr)=>{const r=await send('Runtime.evaluate',{expression:expr,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(JSON.stringify(r.exceptionDetails).slice(0,400));return r.result?.value;};
// ---- mã chạy trong trang
const PAGE=`(()=>{if(window.__css)return;const FILES=${JSON.stringify(FILES)};
 const mk=id=>{const s=document.createElement('style');s.id=id;s.dataset.cmp=1;document.head.appendChild(s);return s;};
 const A=mk('__cmpA'),B=mk('__cmpB'),T=mk('__cmpT');T.textContent='*,*::before,*::after{transition:none!important}';
 const own=l=>{const h=(l.getAttribute('href')||'').split('?')[0].replace(/^\\//,'');return FILES.includes(h);};
 const links=()=>[...document.querySelectorAll('link[rel=stylesheet]')].filter(own);
 const use=m=>{for(const l of links())l.disabled=true;A.sheet.disabled=m!=='A';B.sheet.disabled=m!=='B';};
 const lh=new Map();const longhands=(p,v)=>{const k=p+':'+v;if(lh.has(k))return lh.get(k);let r;if(p.startsWith('--'))r=[p];else{const s=document.createElement('div').style;s.setProperty(p,v);r=[...s];if(!r.length)r=[p];}lh.set(k,r);return r;};
 const PSE=/::?(before|after|placeholder|marker|selection|backdrop|-webkit-[a-z-]+)/g;
 const parts=sel=>{const r=[];let d=0,st=0;for(let i=0;i<sel.length;i++){const c=sel[i];if(c==='('||c==='[')d++;else if(c===')'||c===']')d--;else if(c===','&&!d){r.push(sel.slice(st,i));st=i+1;}}r.push(sel.slice(st));return r.map(s=>s.trim());};
 const pseOf=s=>{const m=s.match(/::?(before|after)\\b/);return m?'::'+m[1]:null;};
 const matchDecl=(el,pse,d)=>{if(d.at){const q=d.at.replace(/^@media\\s*/,'');if(d.at.startsWith('@media')&&!matchMedia(q).matches)return false;}
  for(const p of parts(d.sel)){if(pseOf(p)!==pse)continue;const base=p.replace(PSE,'')||'*';try{if(el.matches(base))return true;}catch{}}return false;};
 const snap=()=>{const els=[...document.querySelectorAll('html, body, body *')].filter(e=>!e.dataset?.cmp);const res=[];
  for(const el of els)for(const pse of [null,'::before','::after']){const cs=getComputedStyle(el,pse);if(pse&&(cs.content==='none'||cs.content==='normal'))continue;
   const o={};for(let i=0;i<cs.length;i++){const p=cs[i];o[p]=cs.getPropertyValue(p);}res.push([el,pse,o]);}return res;};
 window.__css={setB:t=>{A.textContent=window.__srcA;B.textContent=t;},
  run:(imp)=>{use('A');const a=snap();use('B');const b=snap();use('A');
   const diffs=[];
   const bi=new Map();for(const [el,pse,o] of b)bi.set(el,Object.assign(bi.get(el)||{},{[pse||'']:o}));
   for(const [el,pse,o] of a){const o2=bi.get(el)?.[pse||''];if(!o2){diffs.push([el,pse,'(pseudo)','có','không']);continue;}
    for(const p of new Set([...Object.keys(o),...Object.keys(o2)]))if(o[p]!==o2[p])diffs.push([el,pse,p,o[p],o2[p]]);}
   // khai báo !important nào khớp phần tử nào (để biết đã được KIỂM)
   const matched=[];const els=a.map(x=>[x[0],x[1]]);
   imp.forEach((d,k)=>{for(const [el,pse] of els)if(matchDecl(el,pse,d)){matched.push(k);break;}});
   const blame=new Set(),orphan=[];
   for(const [el,pse,p,va,vb] of diffs){let hit=false;imp.forEach((d,k)=>{if(!d.stripped)return;if(p!=='(pseudo)'&&!longhands(d.prop,d.value).includes(p))return;if(matchDecl(el,pse,d)){blame.add(k);hit=true;}});
    if(!hit&&orphan.length<40)orphan.push((el.id?'#'+el.id:el.tagName.toLowerCase()+'.'+[...el.classList].join('.'))+(pse||'')+' '+p+': '+va+' → '+vb);}
   return {nodes:a.length,diffs:diffs.length,blame:[...blame],matched,orphan};}};
})()`;
async function compare(label){
 let last=0;for(let round=0;round<12;round++){
  if(!await ev('!!window.__css')){await pause(5000);await ev('window.__srcA='+JSON.stringify(FILES.map(f=>SRC[f]).join(String.fromCharCode(10))));await ev(PAGE);console.log('  (trang tự nạp lại → gắn lại bộ so)');}
  const strip=stripSet();await ev(`window.__css.setB(${JSON.stringify(buildB(strip).join('\n'))})`);
  const imp=IMP.map(d=>({...d,stripped:!keep.has(key(d))}));
  const t0=Date.now();const r=await ev(`window.__css.run(${JSON.stringify(imp)})`);
  r.matched.forEach(k=>matched.add(key(IMP[k])));r.blame.forEach(k=>keep.add(key(IMP[k])));
  console.log(`[${label}] vòng ${round}: ${r.nodes} phần tử, ${r.diffs} lệch, giữ thêm ${r.blame.length}, (${Date.now()-t0} ms)`);
  if(r.orphan.length){console.log('  lệch không do !important đã gỡ:',r.orphan.slice(0,12).join('\n   '));orphans.push(...r.orphan.map(x=>label+' | '+x));}
  last=r.diffs;if(!r.diffs||!r.blame.length)return r.diffs;
 }
 return last;
}
const orphans=[];let fail=0;
async function load(url,w,h){await send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:false});await send('Page.navigate',{url});await pause(7000);
 await ev(`window.__srcA=${JSON.stringify(FILES.map(f=>SRC[f]).join('\n'))};`);await ev(PAGE);}
const sc=(action,b={})=>post('/api/social-control?world=demo',{action,...b});
try{
 await send('Page.enable');await send('Runtime.enable');await send('Page.setBypassCSP',{enabled:true});
 // ---- OVERLAY
 for(const ui of process.env.SKIP_EXTRA?['']:['', '&ui=old']){
  await load(`${base}/?overlay=1&world=demo&stage=world&quality=high&qa=1${ui}`,540,960);
  const L=s=>s+(ui?' (ui=old)':'');
  fail+=await compare(L('sân thường'));
  await post('/api/action?world=demo',{type:'join',userId:'cssqa',name:'Người Thử CSS'});await post('/api/action?world=demo',{type:'chat',userId:'cssqa',name:'Người Thử CSS',text:'rèn'});await pause(2000);fail+=await compare(L('người mới + gõ rèn'));
  const EV=[['boss',()=>post('/api/boss?world=demo',{}),null],
   ['lôi đài',()=>post('/api/arena?world=demo',{minutes:5}),()=>post('/api/arena?world=demo',{action:'stop'})],
   ['linh thú',()=>post('/api/pet-event?world=demo',{action:'start'}),()=>post('/api/pet-event?world=demo',{action:'stop'})],
   ['hoa',()=>post('/api/flower-event?world=demo',{minutes:3}),null],['đèn',()=>post('/api/lantern-event?world=demo',{action:'start'}),()=>post('/api/lantern-event?world=demo',{action:'stop'})],
   ['cơ duyên',()=>post('/api/opportunity?world=demo'),null],
   ...['bond-festival','race','mount-realm','bao-kho','hall-war','war','alchemy','maze','dokiep','bonk','tower','tournament'].map(n=>[n,()=>sc('start-'+n),()=>sc('stop-'+n)]),['vinh danh',()=>post('/api/ceremony?world=demo'),null],['visitor',()=>post('/api/visitor-event?world=demo',{kind:'tinh-ha'}),null]];
  for(const [n,start,stop] of (ONLY?EV.filter(e=>ONLY.includes(e[0])&&(!ui||[EV[0][0],EV.at(-1)[0]].includes(e[0]))):ui?[EV[0],EV[1],EV.at(-1)]:EV)){const r=await start();await pause(6500);
   await post('/api/action?world=demo',{type:'gift',userId:'cssqa',name:'Người Thử CSS',gift:'Rose',coins:1,count:1});await pause(1500);
   fail+=await compare(L('sự kiện '+n+(r?.ok===false?' (không mở được: '+(r.message||'').slice(0,40)+')':'')));
   if(stop)await stop();await sc('stop-current');await pause(1500);}
 }
 // ---- TRANG QUẢN LÝ (máy tính + điện thoại)
 for(const [w,h] of process.env.SKIP_EXTRA?[]:[[1440,900],[390,844]]){
  await load(`${base}/?world=demo`,w,h);
  for(const t of ['scene','events','halls','puppets','rules','settings','skins']){await ev(`document.querySelector('[data-tab="${t}"]')?.click()`);await pause(1500);fail+=await compare(`quản lý ${w}px #${t}`);}
 }
}finally{try{ws.close();}catch{}ch.kill();srv.kill();}
const strip={};for(const f of FILES)strip[f]=[...stripSet()[f]].filter(ix=>matched.has(SIG[f][ix]));const stripSigs=FILES.flatMap(f=>strip[f].map(ix=>SIG[f][ix]));
const total=IMP.length,removable=Object.values(strip).reduce((s,a)=>s+a.length,0);
const perFile=Object.fromEntries(FILES.map(f=>[f,{co:DECLS[f].filter(d=>d.important).length,go:strip[f].length}]));
await fs.writeFile(out+'/result.json',JSON.stringify({at:new Date().toISOString(),layers:!!process.env.LAYERS,total,removable,keep:keep.size,untested:total-matched.size,lechConLai:fail,perFile,strip,orphans,keepList:[...keep],matchedList:[...matched],stripSigs},null,1));
console.log(`\nTổng ${total} !important · gỡ được ${removable} · giữ vì cần ${keep.size} · giữ vì không có cảnh kiểm ${total-matched.size} · lệch còn lại ${fail}`);
console.table(perFile);
