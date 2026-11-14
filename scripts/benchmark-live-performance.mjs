import {createServer} from 'node:http';
import {execFileSync,spawn} from 'node:child_process';
import {monitorEventLoopDelay} from 'node:perf_hooks';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {setTimeout as wait} from 'node:timers/promises';
import {createWorld,ensurePlayer,ingest,openBoss,snapshot} from '../engine.mjs';
import {REALM_NAMES} from '../public/progression.js';
import {SPECIAL_SKINS} from '../public/patrons.js';

const baseline='a5503e0';
const audioOnly=process.argv.includes('--audio');
const liveURL=process.env.VAN_HAI_LIVE_URL||'http://127.0.0.1:4317';
const sizes=[[1080,1920],[720,1280],[540,960]];
const scenarios=[
  ...[1,8,10,20,30,50,80,100].map(active=>({id:'crowd-'+active,active})),
  {id:'500-profiles',active:28,profiles:500},
  {id:'5-viewers-80-actors',active:80,viewers:5},
  {id:'80-viewers-10-actors',active:10,viewers:80},
  ...[[9,10],[19,20,21],[29,30,31],[49,50,51]].map(counts=>({id:'threshold-'+counts.join('-'),active:Math.max(...counts),counts})),
  {id:'independent-skins',active:50,skins:true},
  {id:'chat-burst',active:80,chat:true},
  {id:'boss-burst',active:50,boss:true,chat:true},
  {id:'large-gift',active:50,gift:true},
  {id:'solo-and-return',active:50,ritual:true},
  {id:'camera-zoom',active:50,zoom:true},
  {id:'hall-war',active:50,hallWar:true}
];
const matrix=[
  ...scenarios.map(scenario=>({scenario,size:sizes[0],fps:24})),
  {scenario:scenarios[5],size:sizes[0],fps:30},
  ...sizes.slice(1).map(size=>({scenario:scenarios[4],size,fps:24}))
];
if(process.argv.includes('--dry-run')){
  console.log(JSON.stringify({baseline,contenders:['baseline','working-tree'],matrix,stage:[50,100,300,500]},null,2));
  process.exit(0);
}

async function requireOffline(){
  const response=await fetch(liveURL+'/api/state?world=live',{signal:AbortSignal.timeout(1800)});
  if(!response.ok)throw Error('Không xác minh được trạng thái LIVE');
  const state=await response.json();
  if(state.liveSession?.active===true||state.connection?.roomLive===true)throw Error('Đang LIVE. Dừng benchmark.');
  if(state.liveSession?.active!==false&&state.connection?.roomLive!==false)throw Error('Trạng thái LIVE chưa xác định.');
}
await requireOffline();

const publicDir=path.resolve('public');
const changed=execFileSync('git',['diff','--name-only',baseline,'--','public'],{encoding:'utf8'}).trim().split(/\r?\n/).filter(Boolean);
const comparable=new Set(['public/scene.js','public/performance.js','public/stage.js','public/crowd-policy.js']);
const baselinePaths=audioOnly||process.argv.includes('--cinematic')?changed:changed.filter(file=>comparable.has(file));
const baselineFiles=new Map(baselinePaths.map(file=>['/'+file.slice(7),execFileSync('git',['show',baseline+':'+file],{maxBuffer:16*1024*1024})]));
const edge=process.env.VAN_HAI_BROWSER||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
await fs.access(edge);
const profile=await fs.mkdtemp(path.join(os.tmpdir(),'vh-perf-'));
const out=path.resolve('output/live-performance');
await fs.mkdir(out,{recursive:true});
let variant='baseline',browser,socket,guard,guardRunning=false,abortError;
const pending=new Map();
function abort(error){
  abortError=error;
  for(const {reject} of pending.values())reject(error);
  pending.clear();
  browser?.kill();
}
const mime={'.js':'text/javascript','.html':'text/html','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml'};
const server=createServer(async(req,res)=>{
  try{
    const route=new URL(req.url,'http://localhost').pathname;
    if(route==='/bench'){
      res.setHeader('Content-Type','text/html; charset=utf-8');
      res.end('<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><style>html,body,canvas{display:block;width:100%;height:100%;margin:0;overflow:hidden}</style><body class="overlay"><canvas id="sceneCanvas"></canvas>');
      return;
    }
    const file=path.resolve(publicDir,'.'+decodeURIComponent(route));
    if(!file.startsWith(publicDir+path.sep))throw Error('bad path');
    const contents=(variant==='baseline'&&baselineFiles.get(route))||await fs.readFile(file);
    res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');
    res.setHeader('Cache-Control','no-store');
    res.end(contents);
  }catch{res.writeHead(404);res.end();}
});
const delay=monitorEventLoopDelay({resolution:10});
const results=[],stageResults=[];
const stats=values=>{
  const sorted=[...values].sort((a,b)=>a-b);
  const q=p=>sorted.length?+sorted[Math.ceil(sorted.length*p)-1].toFixed(2):null;
  return {n:sorted.length,p50:q(.5),p95:q(.95),p99:q(.99)};
};

function fixture(spec){
  const now=Date.now(),world=createWorld('demo');
  world.settings.residents=false;
  world.settings.sceneMode='thien-khuyet';
  const outfits=SPECIAL_SKINS.map(skin=>skin.id);
  for(let i=0;i<(spec.profiles||spec.active);i++){
    const p=ensurePlayer(world,'actor-'+i,'Đạo hữu '+(i+1),now,i%2?'nu':'nam');
    p.realm=i%12;
    if(spec.skins){
      p.realm=i%22;
      p.giftCoins=i*193;
      p.skinChoice=outfits[i%outfits.length];
      p.rewardSkins=[p.skinChoice];
      p.skinChoiceSource='manual';
    }
    if(i>=spec.active)p.lastActive=0;
  }
  if(spec.boss)openBoss(world,now,'storm-tiger');
  if(spec.chat)for(let i=0;i<20;i++)ingest(world,{event:'chat',data:{userId:'actor-'+i,uniqueId:'actor-'+i,nickname:'Đạo hữu '+(i+1),comment:spec.boss?'danh':'tu luyện'}},now+i);
  const selected={select:({players})=>new Set(players.filter(p=>p.active).map(p=>p.id))};
  const snapshotTimes=[],serializeTimes=[],saveEncodeTimes=[];
  let state,bytes=0,saveBytes=0;
  for(let i=0;i<12;i++){
    const start=performance.now();
    const s=snapshot(world,now+30,selected);
    snapshotTimes.push(performance.now()-start);
    const encode=performance.now();
    bytes=Buffer.byteLength(JSON.stringify(s));
    serializeTimes.push(performance.now()-encode);
    const saveStart=performance.now();
    saveBytes=Buffer.byteLength(JSON.stringify(world));
    saveEncodeTimes.push(performance.now()-saveStart);
    state=s;
  }
  state.mode='live'; // Exercise viewer-count policy against the synthetic world.
  state.connection={viewerCount:spec.viewers??spec.active,viewerCountAt:now};
  if(spec.hallWar){
    const names=['Truyền Công','Tàng Bảo','Đan Đỉnh','Tuần Sơn','Linh Dược'];
    const colors=['#63ddec','#ffc471','#e898f6','#80adeb','#b3e964'];
    state.hallWar={id:'bench-war',active:true,phase:'running',startedAt:now,battleStartedAt:now,endsAt:now+60000,
      teams:names.map((name,index)=>({index,name,color:colors[index],score:0,kills:0})),
      members:state.players.map((p,i)=>({id:p.id,name:p.name,index:i%5,score:i,joinedAt:now,hp:100,maxHp:100})),effects:[]};
  }
  return {state,serverProxy:{snapshot:stats(snapshotTimes),serialization:stats(serializeTimes),snapshotBytes:bytes,persistEncoding:stats(saveEncodeTimes),saveBytes}};
}

async function browserRun(spec,state,fps,burst){
  const {Scene}=await import('/scene.js');
  const {StageDirector}=await import('/stage.js');
  const {FrameClock}=await import('/performance.js');
  const canvas=document.querySelector('canvas');
  const scene=new Scene(canvas,()=>{});
  scene.residents=false;
  scene.motion=true;
  const accepted=[],js=[],raf=[],stageTimes=[],updateTimes=[];
  const frame=scene.frame;
  const clock=new FrameClock(),ready=clock.ready.bind(clock);
  let recording=false,didDraw=false,lastRaf=null,peakCache=0;
  clock.ready=(t,target)=>{
    const draw=ready(t,target);
    if(recording&&draw){accepted.push(t);didDraw=true;}
    return draw;
  };
  scene.clock=clock;
  scene.frame=function(t){
    if(recording&&lastRaf!==null)raf.push(t-lastRaf);
    lastRaf=t;didDraw=false;
    const start=performance.now();
    frame.call(this,t);
    if(didDraw){js.push(performance.now()-start);peakCache=Math.max(peakCache,this.characterFrames.bytes);}
  };
  scene.stage=new StageDirector();
  const update=scene.stage.update.bind(scene.stage);
  scene.stage.update=(...args)=>{
    const start=performance.now(),result=update(...args);
    if(recording)stageTimes.push(performance.now()-start);
    return result;
  };
  const custom=()=>{
    scene.budget.config={...scene.budget.config,fps};
  };
  const apply=count=>{
    state.connection.viewerCountAt=Date.now();
    if(count!==undefined){state.players.forEach((p,i)=>p.active=i<count);state.connection.viewerCount=count;}
    const start=performance.now();
    scene.update(state,null);
    if(recording)updateTimes.push(performance.now()-start);
    custom();
  };
  apply();
  await Promise.race([
    Promise.all([scene.standingArt,scene.characterArt,scene.art].map(im=>im.decode().catch(()=>{}))),
    new Promise(resolve=>setTimeout(resolve,2500))
  ]);
  await new Promise(resolve=>setTimeout(resolve,1200));

  const chars=scene.characterFrames;
  let fallbackPaints=0,fallbackCalls=0,fallbackAllocations=0;
  const raster=chars.draw.bind(chars),factory=chars.factory;
  if(!chars.stats){
    chars.factory=(...args)=>{fallbackAllocations++;return factory(...args);};
    chars.draw=(c,id,key,paint,...rest)=>{
      fallbackCalls++;
      return raster(c,id,key,x=>{fallbackPaints++;paint(x);},...rest);
    };
  }
  const initial={...chars.stats};
  const ip=spec.active-1,actor='actor-'+ip;
  const dialogs=burst?.filter(e=>e.effect!=='join')||[];
  const start=performance.now();
  recording=true;
  if(!spec.counts)apply();
  const tasks=[];
  if(spec.counts)for(let i=0;i<16;i++)tasks.push(setTimeout(()=>apply(spec.counts[i%spec.counts.length]),i*250));
  if(spec.chat)tasks.push(setTimeout(()=>{
    for(let i=0;i<20;i++){
      const e=dialogs[i]||{id:'chat-'+i,user:'actor-'+i,effect:spec.boss?'attack':'practice',text:'Tu luyện'};
      scene.noteEvent(e);if(spec.boss)scene.addEffect(e);
    }
  },350));
  if(spec.gift)tasks.push(setTimeout(()=>{
    const e={id:'big-gift',user:actor,name:'Đạo hữu',effect:'gift',gift:true,coins:5000,count:1,kind:'cosmos'};
    scene.noteEvent(e);scene.addEffect(e);
  },450));
  if(spec.ritual){
    tasks.push(setTimeout(()=>{
      const player=state.players.find(p=>p.id===actor);
      const event={id:'ascension',user:actor,name:'Đạo hữu',effect:'breakthrough',fromRealm:0,toRealm:1,visualFrom:{...player,realm:0},visualTo:{...player,realm:1}};
      scene.noteEvent(event);scene.addEffect(event);
    },500));
    tasks.push(setTimeout(()=>scene.interruptPresentation(),3100));
  }
  if(spec.zoom)for(let i=0;i<8;i++)tasks.push(setTimeout(()=>{
    if(i%2)scene.focusUntil=0;else scene.focus(actor,450,2.1);
  },240+i*460));
  await new Promise(resolve=>setTimeout(resolve,4200));
  recording=false;scene.visible=false;
  tasks.forEach(clearTimeout);
  const rect=canvas.getBoundingClientRect(),style=getComputedStyle(canvas),transform=canvas.getContext('2d').getTransform();
  const cache=chars.stats
    ?Object.fromEntries(Object.entries(chars.stats).map(([key,value])=>[key,value-(initial[key]||0)]))
    :{hits:fallbackCalls-fallbackPaints,misses:fallbackPaints,repaints:fallbackPaints,allocations:fallbackAllocations};
  return {fps:accepted.length*1000/(performance.now()-start),intervals:accepted.slice(1).map((t,i)=>t-accepted[i]),js,raf,stageTimes,updateTimes,
    cache:{...cache,bytes:chars.bytes,peakBytes:peakCache},actors:scene.actorLoad,onStage:scene.onStageActors??scene.targets.length,
    visible:scene.visibleActors??null,layout:{w:rect.width,h:rect.height,bufferW:canvas.width,bufferH:canvas.height,transform:style.transform,uniformScale:Math.abs(Math.hypot(transform.a,transform.b)-Math.hypot(transform.c,transform.d))<.002}};
}

async function renderAudioSample(realm,seed){
  const {CultivationAudio}=await import('/audio.js');
  const {breakthroughDuration}=await import('/breakthrough-fx.js');
  const event={id:seed+'-'+realm,user:'benchmark',toRealm:realm,effect:'breakthrough'};
  event.duration=breakthroughDuration(event);
  const rate=44100;
  const context=new OfflineAudioContext(2,Math.ceil((event.duration/1000+2)*rate),rate);
  const audio=new CultivationAudio();
  // Keep baseline and new implementation on the same real mix graph.
  const old=globalThis.AudioContext;
  if(!audio.scheduleRitual)globalThis.AudioContext=function(){return context;};
  try{audio.init(context);}finally{globalThis.AudioContext=old;}
  audio.volume=.85;audio.sfx=1;audio.ambient=0;audio.sync();audio.enabled=true;
  if(audio.scheduleRitual)audio.scheduleRitual(event,realm,0);
  else{
    const originalTimer=globalThis.setTimeout,accentTimers=[];
    // The old trigger checks the realtime state. The offline graph is ready to
    // receive scheduled sources before rendering, even though its native state is suspended.
    Object.defineProperty(context,'state',{configurable:true,value:'running'});
    globalThis.setTimeout=(callback,ms,...args)=>{
      if(realm<=3&&ms>=1000&&ms<event.duration*.90){accentTimers.push([callback,ms]);return 0;}
      return originalTimer(callback,ms,...args);
    };
    try{audio.ritual(event,0);}
    finally{delete context.state;globalThis.setTimeout=originalTimer;}
    for(const [callback,ms] of accentTimers){
      context.suspend(ms/1000).then(()=>{callback();return context.resume();});
    }
  }
  const buffer=await context.startRendering();
  let peak=0,squares=0,near=0,invalid=0,peakAt=0,maxJump=0;
  for(let channel=0;channel<buffer.numberOfChannels;channel++){
    const data=buffer.getChannelData(channel);
    let previous=0;
    for(let i=0;i<data.length;i++){
      const v=data[i];
      if(!Number.isFinite(v)){invalid++;continue;}
      const magnitude=Math.abs(v);
      if(magnitude>peak){peak=magnitude;peakAt=i/rate;}
      if(magnitude>=.95)near++;
      squares+=v*v;
      maxJump=Math.max(maxJump,Math.abs(v-previous));
      previous=v;
    }
  }
  const db=x=>20*Math.log10(Math.max(1e-10,x));
  return {realm,peakDb:db(peak),rmsDb:db(Math.sqrt(squares/(buffer.length*buffer.numberOfChannels))),
    nearSamples:near,peakAt,maxJump,invalid};
}

try{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const origin='http://127.0.0.1:'+server.address().port;
  browser=spawn(edge,['--headless=new','--remote-debugging-port=0','--no-first-run','--mute-audio','--user-data-dir='+profile,'about:blank'],{windowsHide:true,stdio:'ignore'});
  browser.once('error',abort);
  guard=setInterval(async()=>{
    if(guardRunning)return;
    guardRunning=true;
    try{await requireOffline();}catch(error){abort(error);}finally{guardRunning=false;}
  },5000);
  let port;
  for(let i=0;i<100&&!port;i++){
    if(abortError)throw abortError;
    try{port=(await fs.readFile(path.join(profile,'DevToolsActivePort'),'utf8')).split('\n')[0].trim();}
    catch{await wait(100);}
  }
  if(!port)throw Error('Không tìm thấy cổng DevTools');
  const pages=await (await fetch('http://127.0.0.1:'+port+'/json/list')).json();
  socket=new WebSocket(pages.find(page=>page.type==='page').webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject;});
  let id=0,errorCount=0;
  socket.onclose=()=>abort(abortError||Error('Disconnected from benchmark browser'));
  socket.onmessage=({data})=>{
    const message=JSON.parse(data),request=pending.get(message.id);
    if(message.method==='Runtime.exceptionThrown'){errorCount++;console.error(message.params.exceptionDetails.text);}
    if(!request)return;
    pending.delete(message.id);
    if(message.error)request.reject(Error(JSON.stringify(message.error)));
    else request.resolve(message.result);
  };
  const cdp=(method,params={})=>new Promise((resolve,reject)=>{
    if(abortError){reject(abortError);return;}
    pending.set(++id,{resolve,reject});
    socket.send(JSON.stringify({id,method,params}));
  });
  const evaluate=async expression=>{
    const reply=await cdp('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});
    if(reply.exceptionDetails)throw Error(reply.exceptionDetails.exception?.description||reply.exceptionDetails.text);
    return reply.result.value;
  };
  async function navigate(url){
    await cdp('Page.navigate',{url});
    for(let i=0;i<50;i++){
      try{if(await evaluate('location.href==='+JSON.stringify(url)+'&&!!document.querySelector("canvas")'))return;}
      catch(error){if(abortError)throw abortError;}
      await wait(80);
    }
    throw Error('Trang benchmark chưa tải');
  }
  await cdp('Runtime.enable');
  await cdp('Page.enable');
  const renderer=await evaluate(`(()=>{
    const gl=document.createElement('canvas').getContext('webgl');
    const info=gl?.getExtension('WEBGL_debug_renderer_info');
    const name=info?gl.getParameter(info.UNMASKED_RENDERER_WEBGL):null;
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
    return name;
  })()`);
  if(audioOnly){
    const audioRows=[];
    for(let realm=1;realm<REALM_NAMES.length;realm++){
      // The original overlay uses short frame-driven sounds for these realms.
      const liveProcedural=realm>=14&&realm<=21;
      for(variant of ['baseline','working-tree']){
        if(liveProcedural&&variant==='baseline')continue;
        await requireOffline();
        await navigate(origin+'/bench?run=audio-'+realm+'-'+variant);
        const result=await evaluate('('+renderAudioSample.toString()+')('+realm+',"perf-audio")');
        assert.equal(result.invalid,0);
        audioRows.push({...result,name:REALM_NAMES[realm],variant,liveProcedural});
        await fs.writeFile(path.join(out,'audio-peaks.json'),JSON.stringify({baseline,renderer,audioRows},null,2));
      }
    }
    assert.equal(errorCount,0);
  }else{
  for(const row of matrix){
    const [width,height]=row.size;
    await cdp('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
    await requireOffline();
    const {state,serverProxy}=fixture(row.scenario);
    for(variant of ['baseline','working-tree']){
      await requireOffline();
      const url=origin+'/bench?run='+encodeURIComponent(row.scenario.id+'-'+width+'-'+row.fps+'-'+variant);
      await navigate(url);
      const events=state.events?.slice(-25)||[];
      delay.reset();delay.enable();
      const result=await evaluate('('+browserRun.toString()+')('+[row.scenario,state,row.fps,events].map(x=>JSON.stringify(x)).join(',')+')');
      delay.disable();
      const hostLoopP99=+(delay.percentile(99)/1e6).toFixed(2);
      assert.deepEqual([result.layout.w,result.layout.h,result.layout.bufferW,result.layout.bufferH],[width,height,width,height]);
      assert.equal(result.layout.transform,'none');
      assert.ok(result.layout.uniformScale);
      const entry={id:row.scenario.id,variant,width,height,fpsCap:row.fps,fps:+result.fps.toFixed(2),
        frameInterval:stats(result.intervals),js:stats(result.js),raf:stats(result.raf),stage:stats(result.stageTimes),sceneUpdate:stats(result.updateTimes),
        cache:result.cache,actors:result.actors,onStage:result.onStage,visible:result.visible,serverProxy,hostLoopP99};
      results.push(entry);console.log(JSON.stringify(entry));
      if(row.scenario.id==='crowd-30'||row.scenario.gift||row.scenario.ritual){
        const shot=await cdp('Page.captureScreenshot',{format:'png'});
        await fs.writeFile(path.join(out,row.scenario.id+'-'+variant+'-'+width+'.png'),Buffer.from(shot.data,'base64'));
      }
      await fs.writeFile(path.join(out,'matrix.json'),JSON.stringify({baseline,renderer,errorCount,results},null,2));
    }
  }
  const moduleStage=await import('../public/stage.js');
  const baselineStage=execFileSync('git',['show',baseline+':public/stage.js'],{encoding:'utf8'});
  const vipURL=new URL('../public/vip.js',import.meta.url).href;
  const source=baselineStage.replace("'./vip.js'",JSON.stringify(vipURL));
  const oldStage=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
  for(const n of [50,100,300,500]){
    for(const [name,klass] of [['baseline',oldStage.StageDirector],['working-tree',moduleStage.StageDirector]]){
      await requireOffline();
      const stage=new klass(50),players=Array.from({length:n},(_,i)=>({id:'p'+i,realm:i%18,giftCoins:(i*137)%22000,joinedAt:i}));
      const idle=[],bursty=[];
      for(let i=0;i<240;i++){
        const t=50000+i*250;
        if(i>=120)for(let k=0;k<20;k++)stage.note({user:'p'+((i*7+k)%n),gift:k%7===0},t);
        const start=performance.now();
        stage.update(players,[],t);
        (i<120?idle:bursty).push(performance.now()-start);
      }
      stageResults.push({n,variant:name,idle:stats(idle),burst:stats(bursty)});
    }
  }
  assert.equal(errorCount,0);
  await fs.writeFile(path.join(out,'matrix.json'),JSON.stringify({baseline,renderer,errorCount,results,stageResults},null,2));
  }
}finally{
  clearInterval(guard);
  if(socket)socket.onclose=null;
  socket?.close();
  browser?.kill();
  server.close();
}
