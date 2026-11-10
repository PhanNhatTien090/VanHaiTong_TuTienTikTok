import {giftMasterView} from './master-rewards.mjs';
import {createLiveTransfers} from './web/cloud/live-transfers.mjs';
import {authenticate} from './web/cloud/protocol.mjs';
import {raceEntryAnnouncement} from './sword-race.mjs';
import {createSectMaster} from './sect-master.mjs';
import {observeViewerCount} from './public/crowd-policy.js';
import {createAuditStorage} from './audit-storage.mjs';
import {auditRecord,repairVisitorHistory,visitorAuditView} from './visitor-audit.mjs';
import {installRuntimeLog} from './runtime-log.mjs';
import {mergeGiftPresentation} from './public/gift-combos.js';
import {startWar,stopWar,startAlchemy,stopAlchemy,startMaze,stopMaze,teasePair,controlLanternEvent} from './engine.mjs';
import {controlPetEvent} from './engine.mjs';
import {EventAnnouncementHistory,isEventAnnouncement} from './public/event-announcements.js';
import {SCENES} from './public/world-rotation.js';
import {GIFT_POLICY_VERSION,GIFT_TIERS} from './public/gift-rewards.js';
import {AssetCache} from './asset-cache.mjs';
import http from 'node:http';
import {createSpeech} from './speech.mjs';
import {namePlan,giftPlan,THANKS_PLAN,WAR_PUSH_PLANS,ADMIN_PLANS,nextMissingPart} from './voice-parts.mjs';
import {skinFor} from './public/cosmetics.js';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {WebSocket} from 'ws';
import {streamState,eventAllowedOnLive,isNPC,actorLabel} from './public/live-integrity.js';
import {priority as voicePriority} from './public/voice.js';
import {periodTopsView,backfillPeriodCoins,readGiftAudit} from './period-tops.mjs';
import {monitorEventLoopDelay,performance as perfHooks} from 'node:perf_hooks';
import {SKIN_GEAR} from './public/skin-gear.js';
import {applyMusicCommand} from './public/music-rotation.js';
// Đo độ trễ vòng sự kiện (server bị chặn bao lâu) để soi lag khi LIVE: GET /api/perf. Chỉ đọc, không đổi gameplay.
const loopDelay=monitorEventLoopDelay({resolution:20});loopDelay.enable();let lastElu=perfHooks.eventLoopUtilization();
function perfView(){const ms=n=>Math.round(n/1e4)/100,elu=perfHooks.eventLoopUtilization(lastElu);lastElu=perfHooks.eventLoopUtilization();const v={loopDelayMs:{p50:ms(loopDelay.percentile(50)),p99:ms(loopDelay.percentile(99)),max:ms(loopDelay.max)},busy:Math.round(elu.utilization*1000)/1000,clients:clients.size,heapMiB:Math.round(process.memoryUsage().heapUsed/1048576),at:Date.now()};loopDelay.reset();return v;}
import {startNextCompetition,engageNow,honorCeremony,adminGift,heavenStrike,puppetControl,createWorld,seedDemo,action,snapshot,ingest,tick,openBoss,blessing,markLiveSession,startOpportunity,adminEditPlayer,migrateSkinsV33,startFlowerEvent,setEventSettings,startVisitor,startTournament,stopTournament,prepareSocial,startRace,stopRace,startBondFestival,stopBondFestival,migrateDivineWardrobe,migrateSectMasters} from './engine.mjs';

const root=path.dirname(fileURLToPath(import.meta.url));
const dataDir=process.env.VAN_HAI_DATA_DIR||path.join(root,'data');fs.mkdirSync(dataDir,{recursive:true});
const runtimeLog=installRuntimeLog(dataDir);
// Secret chuyển nhân vật với bản web: ưu tiên biến môi trường; thiếu thì đọc file cấu hình riêng của agent, để mọi script restart đều giữ được kết nối.
function webSyncSecret(){if(process.env.WEB_SYNC_SECRET)return process.env.WEB_SYNC_SECRET;try{const s=JSON.parse(fs.readFileSync(path.join(dataDir,'web-cloud-agent.json'),'utf8')).secret;return typeof s==='string'?s:'';}catch{return '';}}
const sectMaster=createSectMaster(dataDir);
const auditStorage=createAuditStorage(dataDir);
const synthesizeSpeech=createSpeech(root,dataDir);
// 4/11/2026: cùng một cách gắn tên/giới tính cho giọng đọc, để bản tạo sẵn và bản trang hỏi tới trùng cache.
function speechEventFor(mode,event){const owner=worlds[mode].players[event.user];return {...event,name:isNPC(owner)?actorLabel(owner):event.name||owner?.name||'',gender:owner?.gender??null};}
// Người xem mới vào: tạo sẵn câu chào ngay khi TikTok báo, để giọng phát cùng lúc nhân vật xuất hiện (trước đây chỉ tạo khi trang hỏi → trễ vài giây).
function prewarmArrival(playerId){try{const e=worlds.live.events.findLast(x=>x.user===playerId&&x.autoArrival);if(e&&eventAllowedOnLive(e,worlds.live.players))synthesizeSpeech(speechEventFor('live',e)).catch(()=>{});}catch{}}
function load(mode) {
  const file=path.join(dataDir,`${mode}.json`);
  if(!fs.existsSync(file))return mode==='demo'?seedDemo():createWorld('live');
  try{const w=JSON.parse(fs.readFileSync(file,'utf8'));if(w.version!==1||!w.players||!w.gifts)throw Error('Sai phiên bản dữ liệu');if((w.giftPolicyVersion||0)<GIFT_POLICY_VERSION){w.gifts=structuredClone(GIFT_TIERS);w.giftPolicyVersion=GIFT_POLICY_VERSION;}const fixed=migrateSkinsV33(w);if(fixed)console.log(`[${mode}] Bỏ tự mặc skin Tri ân cũ cho ${fixed} người.`);return w;}
  catch(e){throw Error(`Không thể đọc ${file}. Giữ nguyên file để phục hồi: ${e.message}`);}
}
// v54: chỉ cho MỘT máy chủ chạy. Nếu cổng đã có máy chủ Vân Hải Tông trả lời → thoát ngay, không đọc/ghi dữ liệu (tránh 2 máy chủ ghi đè live.json).
{const probePort=Number(process.env.PORT??4317);if(probePort){try{const r=await fetch(`http://127.0.0.1:${probePort}/api/state?world=demo`,{signal:AbortSignal.timeout(1500)});if(r.ok&&(await r.text()).includes('sectQi')){console.error(`Đã có máy chủ Vân Hải Tông đang chạy ở cổng ${probePort}. Không mở thêm máy chủ thứ hai để tránh ghi đè dữ liệu.`);process.exit(1);}}catch{}}}
const worlds={demo:load('demo'),live:load('live')};for(const w of Object.values(worlds)){prepareSocial(w);migrateDivineWardrobe(w);migrateSectMasters(w);}
(worlds.live.settings??={}).heartGate??=true; // 07/11/2026: chống tự thả tim (ngầm); đặt false trong settings để tắt
// 07/11: top ngày/tuần — lần đầu dựng lại coin quà trong tuần từ sổ quà.
for(const [mode,w] of Object.entries(worlds))if(!w.periodStats){try{console.log('Top ngày/tuần: dựng lại quà cho',backfillPeriodCoins(w,readGiftAudit(fs,path,dataDir,mode),Date.now()),'mục',mode);}catch(e){console.error('Top ngày/tuần backfill lỗi:',e.message);}}
// Giờ vàng tân thủ chỉ bật trên thế giới LIVE thật (tắt bằng settings.goldenHour=false trong live.json).
worlds.live.settings??={};worlds.live.settings.goldenHour??=true;
// Real, faster progression for the ascension stage; existing resources are preserved.
worlds.live.settings.ascensionShowcase??=true;
const visitorRecovery=path.join(dataDir,'visitor-history-recovery.json');
let recoveredVisitors=[];
if(fs.existsSync(visitorRecovery))recoveredVisitors=JSON.parse(fs.readFileSync(visitorRecovery,'utf8')).events||[];
for(const [mode,w]of Object.entries(worlds)){
 const repairs=repairVisitorHistory(w,Date.now(),mode==='live'?recoveredVisitors:[]);
 auditRecord(w,'audit-enabled',Date.now(),{recoveredEvents:mode==='live'?recoveredVisitors.length:0,repairs:repairs.length,thresholds:{vuonglam:{skin:200,artifact:300},hanlap:{skin:100,artifact:200}}});
 if(repairs.length)console.log(`[${mode}] Đối soát và bù ${repairs.length} lượt thưởng tiên nhân.`);
}
if(fs.existsSync(visitorRecovery))fs.renameSync(visitorRecovery,visitorRecovery+'.applied-'+Date.now());
function persistPlayTransfer(){
  persist(true);
  const fd=fs.openSync(path.join(dataDir,'live.json'),'r+');try{fs.fsyncSync(fd);}finally{fs.closeSync(fd);}
  if(process.platform!=='win32'){const dir=fs.openSync(dataDir,'r');try{fs.fsyncSync(dir);}finally{fs.closeSync(dir);}}
}
const liveTransfers=createLiveTransfers({world:worlds.live,save:persistPlayTransfer});
const voiceLatency=[]; // 08/11: đo thời gian tạo giọng (ms) và tuổi sự kiện khi client xin giọng
const clients=new Set(),clientStatus=new Map(),bridgeSamples=[];let bridge=null,retry=null,closing=false;
const connection={enabled:false,status:'disconnected',lastEvent:null,lastError:null,received:0,roomLive:null,lastViewerEvent:null};
// Chỉ ghi file khi thế giới thay đổi (hoặc 30 giây một lần cho lastActive).
// Lưu định kỳ (3 s) ghi đĩa ở nền để quà/lệnh không phải chờ ổ đĩa + Defender quét file ~8 MB.
// Lưu bắt buộc (force: thao tác quản trị, bàn giao, tắt máy) vẫn ghi đồng bộ như cũ.
// saveGen: bản ghi nền chỉ thay file nếu không có lần lưu nào mới hơn bắt đầu sau nó; kiểm tra + rename chạy liền nhau trên luồng chính nên không bao giờ đè bản mới.
const savedSig={},savedAt={},saveGen={},saving={},SAVE_LOCKED=['EPERM','EBUSY','EACCES'];
function persist(force=false){for(const [mode,w]of Object.entries(worlds)){auditStorage.flush(w,mode);const sig=`${w.events.at(-1)?.id}|${Object.keys(w.players).length}|${w.sectQi}|${w.boss?.hp}|${w.totalInteractions}`;if(!force&&(saving[mode]||sig===savedSig[mode]&&Date.now()-(savedAt[mode]||0)<30000))continue;const dest=path.join(dataDir,`${mode}.json`);const data=JSON.stringify(w),gen=saveGen[mode]=(saveGen[mode]||0)+1;
  if(force){const tmp=dest+'.tmp';try{fs.writeFileSync(tmp,data);fs.renameSync(tmp,dest);savedSig[mode]=sig;savedAt[mode]=Date.now();}catch(err){if(!SAVE_LOCKED.includes(err.code))throw err;console.error('[save] File temporarily locked; current progress retained in memory and save retried on next tick:',mode,err.code);}continue;}
  const tmp=dest+'.bg.tmp';saving[mode]=true;
  fs.promises.writeFile(tmp,data).then(()=>{if(saveGen[mode]!==gen){fs.rmSync(tmp,{force:true});return;}fs.renameSync(tmp,dest);savedSig[mode]=sig;savedAt[mode]=Date.now();}).catch(err=>{console.error(SAVE_LOCKED.includes(err.code)?'[save] File temporarily locked; current progress retained in memory and save retried on next tick:':'[save] Background save failed; retried on next tick:',mode,err.code||err.message);}).finally(()=>{saving[mode]=false;});}}
// Mỗi giây chỉ gửi người đang hoạt động + top 100 bảng xếp hạng (không gửi cả 10.000 hồ sơ).
const payloadCache=new Map(),assets=new AssetCache();
const announcementHistory={demo:new EventAnnouncementHistory(),live:new EventAnnouncementHistory()};
function rememberAnnouncements(){for(const mode of ['demo','live'])announcementHistory[mode].remember(worlds[mode].events);}
// Top 100 cảnh giới/tu vi + top 3 tu vi + người dẫn đầu quà + danh hiệu + người đang lên đài.
function visibleTop(players,s){const top=new Set([...players].sort((a,b)=>b.realm-a.realm||b.totalQi-a.totalQi).slice(0,100).map(p=>p.id));for(const p of [...players].sort((a,b)=>b.totalQi-a.totalQi).slice(0,3))top.add(p.id);if(s.patronCurrent)top.add(s.patronCurrent);for(const h of s.honors||[])top.add(h.id);for(const id of [...(s.socialStage||[]),...(s.raceStage||[])])top.add(id);return top;}
function payload(mode,view='full'){
  announcementHistory[mode].remember(worlds[mode].events);
  const key=mode+':'+view,now=Date.now(),cached=payloadCache.get(key);if(cached&&now-cached.at<100)return cached.value;
  let value;
  if(view==='overlay'){
    const full=payload(mode),fields=['puppet','resident','id','name','gender','realm','giftCoins','qi','totalQi','stones','herbs','equipped','rewardSkins','skinChoice','skinChoiceSource','divineRoles','divineRoleChoice','divineRoleHidden','joinedAt','active','realmName','neededQi','neededStones','finalRealmEligible','progressionReady','isPatronLeader','avatar','honor','relicVariant','socialCode','bondId','bondIds','bondInfo','bondInfos','bondVip','bondMilestone','bondFestivalWins','tournamentTitle','spiritPet','companionPoints','raceSwordSkins','raceSwordChoice','raceMounts','sectMasterUnlocked','sectMasterGiftAt'];
    // Cảnh LIVE chỉ cần: người đang hoạt động (sân khấu) + top 10 (bảng xếp hạng nhỏ) + 30 sự kiện mới nhất.
    // Không gửi ký sự / top 100: gói nhỏ ~5 lần, trình duyệt trong LIVE Studio đỡ phải đọc JSON lớn liên tục.
    const top=new Set([...full.players].sort((a,b)=>b.realm-a.realm||b.totalQi-a.totalQi).slice(0,10).map(p=>p.id));
    for(const p of [...full.players].sort((a,b)=>b.totalQi-a.totalQi).slice(0,3))top.add(p.id);
    if(full.patronCurrent)top.add(full.patronCurrent);for(const h of full.honors||[])top.add(h.id);for(const id of [...(full.socialStage||[]),...(full.raceStage||[])])top.add(id);
    value={...full,players:full.players.filter(p=>p.active||top.has(p.id)).map(p=>({...Object.fromEntries(fields.map(k=>[k,p[k]])),skinGear:(p.artifacts||[]).filter(id=>SKIN_GEAR.includes(id))})),events:[...new Map([...full.events.slice(-30),...announcementHistory[mode].recent().slice(-16)].map(e=>[e.id,e])).values()].sort((a,b)=>a.at-b.at),feed:[],seen:undefined,giftCounts:undefined,adminLog:undefined};
  }else{
    // Chọn trước người sẽ gửi (đang hoạt động + top) để snapshot không phải dựng đủ ~8k hồ sơ mỗi 400 ms.
    let playerTotal=0;
    const s=snapshot(worlds[mode],Date.now(),{select:ctx=>{const list=ctx.players.filter(p=>!p.webOnly);playerTotal=list.length;const top=visibleTop(list,ctx);for(const p of list)if(p.active)top.add(p.id);return top;}});
    s.players=s.players.filter(p=>!p.webOnly); // nhân vật chỉ có trên web không bao giờ hiện trên LIVE
    const top=visibleTop(s.players,s);
    // Top tặng quà cho bảng TOP QUÀ trên cảnh: chỉ người đang có mặt trên LIVE (tương tác trong 5 phút gần nhất), xếp theo tổng coin quà.
    const giftEdited=new Set((s.adminLog||[]).filter(r=>r.changes?.some(c=>c.startsWith('coin quà '))).map(r=>r.id));
    const topGifters=s.players.filter(p=>!p.resident&&!p.puppet&&p.active&&p.giftCoins>0&&!giftEdited.has(p.id)).sort((a,b)=>(a.puppet?1:0)-(b.puppet?1:0)||b.giftCoins-a.giftCoins||a.joinedAt-b.joinedAt).slice(0,5).map(p=>({id:p.id,name:p.name,giftCoins:p.giftCoins,realmName:p.realmName,avatar:p.avatar||null}));
    value={...s,heartRulesVersion:1,playerCount:playerTotal,players:s.players.filter(p=>p.active||top.has(p.id)),topGifters,connection,sectMaster:mode==='live'?giftMasterView(s.players,sectMaster.view()):{enabled:false,active:false}};
  }
  value=streamState(value,mode);
  payloadCache.set(key,{at:now,value});return value;
}

// Gộp gửi: dù TikTok bắn bao nhiêu tim/bình luận, mỗi trang nhận tối đa ~2,5 gói/giây (cách nhau ≥400 ms).
let broadcastTimer=null,broadcastDue=0,lastBroadcast=0;const BROADCAST_GAP=400,BROADCAST_URGENT_GAP=120;
// urgent (quà): gửi sau ~30 ms, cách lần trước ≥120 ms thay vì chờ nhịp gộp 400 ms; chỉ đổi thời điểm gửi.
function broadcast(urgent=false){rememberAnnouncements();payloadCache.clear();const since=Date.now()-lastBroadcast,wait=urgent?Math.max(30,BROADCAST_URGENT_GAP-since):Math.max(50,BROADCAST_GAP-since);if(broadcastTimer){if(!urgent||broadcastDue<=Date.now()+wait)return;clearTimeout(broadcastTimer);}broadcastDue=Date.now()+wait;broadcastTimer=setTimeout(()=>{broadcastTimer=null;lastBroadcast=Date.now();payloadCache.clear();const messages=new Map();for(const c of clients){if(c.res.writableLength>1024*1024){c.res.end();clients.delete(c);continue;}const key=c.mode+':'+c.view;if(!messages.has(key))messages.set(key,`data: ${JSON.stringify(payload(c.mode,c.view))}\n\n`);c.res.write(messages.get(key));}},wait);}

function connect(){
  if(!connection.enabled||closing)return;
  connection.status='connecting';broadcast();
  bridge=new WebSocket(process.env.VAN_HAI_TIKFINITY_URL||'ws://127.0.0.1:21213/');
  bridge.on('open',()=>{connection.status='connected';connection.lastError=null;broadcast();});
  bridge.on('message',raw=>{
    try{const event=JSON.parse(raw.toString());if(event.event==='config')return;
      observeViewerCount(connection,event);sectMaster.observe(event);connection.received++;connection.lastEvent=Date.now();
      // Chẩn đoán: loại sự kiện gần đây + mẫu thô (rút gọn) để đối chiếu payload TikFinity.
      connection.types=[...(connection.types||[]),String(event.event)].slice(-15);bridgeSamples.push(JSON.stringify(event).slice(0,600));if(bridgeSamples.length>8)bridgeSamples.shift();if(event.event==='liveStatusChange'){connection.roomLive=event.data?.isLive===true;markLiveSession(worlds.live,connection.roomLive);}const result=ingest(worlds.live,event);if(result.queuedGift)persistPlayTransfer();if(result.autoArrival&&result.playerId)prewarmArrival(result.playerId);else prewarmSpeech();if(result.ok&&!result.ignored){connection.lastViewerEvent=Date.now();connection.lastError=null;}
      if(!result.ok)connection.lastError=result.message;
      broadcast(event.event==='gift');
    }catch(e){connection.lastError=`Không đọc được sự kiện: ${e.message}`;}
  });
  bridge.on('error',()=>{connection.lastError='Chưa kết nối được TikFinity Desktop tại cổng 21213. Kiểm tra app và Event API.';});
  bridge.on('close',()=>{bridge=null;connection.status=connection.enabled?'reconnecting':'disconnected';broadcast();if(connection.enabled&&!closing)retry=setTimeout(connect,5000);});
}
// Nhớ trạng thái kết nối TikFinity qua các lần khởi động lại (data/bridge.json).
const bridgeFile=path.join(dataDir,'bridge.json');
function setBridge(enabled,remember=true){if(remember)try{fs.writeFileSync(bridgeFile,JSON.stringify({enabled}));}catch{}connection.enabled=enabled;clearTimeout(retry);if(!enabled){if(bridge){bridge.removeAllListeners();bridge.on('error',()=>{});bridge.close();bridge=null;}connection.status='disconnected';broadcast();}else if(!bridge)connect();}
const mime={'.mp3':'audio/mpeg','.wav':'audio/wav','.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.ico':'image/x-icon','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg'};
function json(res,data,status=200){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));}
async function body(req){let text='';for await(const part of req){text+=part;if(text.length>32768)throw Error('Yêu cầu quá lớn.');}return JSON.parse(text||'{}');}
const server=http.createServer(async(req,res)=>{
  try{
    const host=req.headers.host||'';
    if(!/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)){json(res,{ok:false,message:'Chỉ truy cập từ máy này.'},403);return;}
    const url=new URL(req.url,`http://${host}`);const mode=url.searchParams.get('world')==='live'?'live':'demo';
    if(req.method==='POST'){
      if(req.headers.origin&&req.headers.origin!==`http://${host}`){json(res,{ok:false,message:'Origin không hợp lệ.'},403);return;}
      if(!String(req.headers['content-type']).startsWith('application/json')){json(res,{ok:false,message:'Cần JSON.'},415);return;}
    }
    if(url.pathname==='/internal/play-transfer'&&req.method==='POST'){
      const secret=webSyncSecret();
      const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>1024*1024){json(res,{ok:false},413);return;}chunks.push(chunk);}
      const raw=Buffer.concat(chunks);
      if(!secret||secret.length<48||!authenticate(req,url.pathname,raw,secret)){json(res,{ok:false},401);return;}
      const result=liveTransfers.apply(JSON.parse(raw.toString()));payloadCache.clear();broadcast();json(res,result);return;
    }
    if(url.pathname==='/api/voice-latency'){json(res,voiceLatency);return;}
    if(url.pathname==='/api/voice-part'){const kind=url.searchParams.get('kind'),p=kind==='name'?worlds[mode].players[url.searchParams.get('user')||'']:null,plan=kind==='name'?(p&&!p.resident&&!p.puppet?namePlan(p):null):kind==='gift'?giftPlan(url.searchParams.get('gift')):kind==='thanks'?THANKS_PLAN:kind==='war'?WAR_PUSH_PLANS[url.searchParams.get('side')]||null:kind==='admin'?ADMIN_PLANS[url.searchParams.get('combo')]||null:null,file=plan&&synthesizeSpeech.cached(plan);if(!file){json(res,{ok:false},404);return;}res.writeHead(200,{'Content-Type':'audio/mpeg','Cache-Control':'private, max-age=600'});fs.createReadStream(file).pipe(res);return;}
    if(url.pathname==='/api/speech'&&req.method==='GET'){
      const id=url.searchParams.get('id');
      let event=worlds[mode].events.find(e=>e.id===id)||announcementHistory[mode].get(id);
      if(!event){const intro=raceEntryAnnouncement(worlds[mode]);if(intro?.id===id)event=intro;}
      const ids=url.searchParams.get('ids')?.split(',');
      if(ids){if(ids.length>64||new Set(ids).size!==ids.length){json(res,{ok:false,message:'Combo không hợp lệ.'},400);return;}const rows=ids.map(id=>worlds[mode].events.find(e=>e.id===id)||announcementHistory[mode].get(id));if(rows.some(e=>!e?.gift)||rows.some(e=>e.user!==rows[0].user||e.gift!==rows[0].gift||e.coins!==rows[0].coins||!!e.simulated!==!!rows[0].simulated)){json(res,{ok:false,message:'Không đủ dữ liệu combo.'},404);return;}event=rows.reduce((a,b)=>a?mergeGiftPresentation(a,b):b,null);}
      // Câu tổng hợp khi đông (chỉ loại và số lượng được kiểm soát, không nhận chữ tự do).
      const summary=url.searchParams.get('summary');if(!event&&['joins','busy'].includes(summary))event={effect:'summary',kind:summary,count:Math.max(2,Math.min(999,Number(url.searchParams.get('n'))||2))};
      if(!event){const p=Object.values(worlds[mode].players).find(p=>'skin:'+p.id+':'+p.giftCoins===id);if(p)event={user:p.id,name:p.name,effect:'skin',text:skinFor(p.giftCoins).name};}
      if(!event){json(res,{ok:false,message:'Sự kiện không còn trong hàng đợi.'},404);return;}
      if(mode==='live'&&!eventAllowedOnLive(event,worlds[mode].players)){json(res,{ok:false,message:'DEMO event unavailable on LIVE.'},404);return;}
      event=speechEventFor(mode,event);
      // 08/11: không tốn máy đọc cho sự kiện đã cũ — đọc trễ là nói sai với màn hình.
      const voiceAge=Number.isFinite(event.at)?Date.now()-event.at:0,voiceLimit=event.adminGift?25000:event.heavenStrike?15000:event.gift&&Number(event.coins)>0?20000:isEventAnnouncement(event)?25000:10000;
      if(mode==='live'&&!ids&&voiceAge>voiceLimit){voiceLatency.push({at:Date.now(),age:voiceAge,stale:1});if(voiceLatency.length>60)voiceLatency.shift();json(res,{ok:false,message:'Sự kiện đã cũ, bỏ giọng đọc.'},410);return;}
      try{const t0=Date.now(),file=await synthesizeSpeech(event);voiceLatency.push({at:t0,age:voiceAge,synthMs:Date.now()-t0,gift:event.gift?1:0});if(voiceLatency.length>60)voiceLatency.shift();res.writeHead(200,{'Content-Type':'audio/mpeg','Cache-Control':'private, max-age=86400'});fs.createReadStream(file).pipe(res);}
      catch(e){json(res,{ok:false,message:e.message},503);}return;
    }
    if(url.pathname==='/api/client-status'&&req.method==='POST'){const b=await body(req);const id=String(b.id||'').slice(0,40);if(id){clientStatus.set(id,{...b,at:Date.now()});if(clientStatus.size>30)clientStatus.delete(clientStatus.keys().next().value);}json(res,{ok:true});return;}
    if(url.pathname==='/api/client-status'){json(res,[...clientStatus.values()].filter(s=>Date.now()-s.at<120000));return;}
    if(url.pathname==='/api/sect-master'&&req.method==='GET'){json(res,sectMaster.view());return;}
    if(url.pathname==='/api/sect-master'&&req.method==='POST'){try{const config=sectMaster.configure(await body(req));payloadCache.clear();broadcast();json(res,{ok:true,...config});}catch(e){json(res,{ok:false,message:e.message},400);}return;}
    if(url.pathname==='/api/bridge-samples'){json(res,bridgeSamples);return;}
    if(url.pathname==='/api/period-tops'){json(res,periodTopsView(worlds[mode],Date.now(),Math.min(50,Math.max(3,Number(url.searchParams.get('limit'))||10))));return;} // 07/11: top ngày / tuần (chỉ trang quản lý)
    if(url.pathname==='/api/perf'){json(res,perfView());return;}
    if(url.pathname==='/api/state'){json(res,payload(mode));return;}
    if(url.pathname==='/api/events'){
      res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive'});
      const view=url.searchParams.get('view')==='overlay'?'overlay':'full';const client={res,mode,view};clients.add(client);res.write(`data: ${JSON.stringify(payload(mode,view))}\n\n`);req.on('close',()=>clients.delete(client));return;
    }
    if(url.pathname==='/api/action'&&req.method==='POST'){
      if(mode!=='demo'){json(res,{ok:false,message:'Bộ mô phỏng chỉ ghi vào thế giới thử nghiệm.'},403);return;}
      const b=await body(req);const result=action(worlds.demo,b);broadcast();json(res,result);return;
    }
    // Người điều hành chỉnh tay một người (cả demo lẫn LIVE). Chỉ nhận từ máy này (kiểm tra host/origin ở trên).
    if(url.pathname==='/api/social-control'&&req.method==='POST'){
      const b=await body(req),w=worlds[mode],now=Date.now();let result;
      if(b.action==='start-next-competition')result=startNextCompetition(w,now);
      else if(b.action==='start-bond-festival')result=startBondFestival(w,now);
      else if(b.action==='stop-bond-festival')result=stopBondFestival(w,now);
      else if(b.action==='start-race')result=startRace(w,now);
      else if(b.action==='stop-race')result=stopRace(w,now);
      else if(b.action==='start-war')result=startWar(w,now);
      else if(b.action==='stop-war')result=stopWar(w,now);
      else if(b.action==='start-alchemy')result=startAlchemy(w,now);
      else if(b.action==='stop-alchemy')result=stopAlchemy(w,now);
      else if(b.action==='tease-pair')result=teasePair(w,b.a,b.b,now); // 10/11: chọc ghẹo 2 người (chỉ hiệu ứng)
      else if(b.action==='start-maze')result=startMaze(w,now);
      else if(b.action==='stop-maze')result=stopMaze(w,now);
      else if(b.action==='start-tournament')result=startTournament(w,now);
      else if(b.action==='stop-tournament')result=stopTournament(w,now);
      else if(b.action==='bond-enabled'&&typeof b.enabled==='boolean'){w.settings.bondEnabled=b.enabled;result={ok:true};}
      else if(b.action==='stop-current'&&['boss','flowerEvent','visitor','opportunity'].includes(b.kind)){
        if(b.kind==='boss'){w.boss=null;w.nextBossAt=now+240000;}else if(w[b.kind])w[b.kind].endsAt=now;
        tick(w,now);result={ok:true};
      }else result={ok:false,message:'Thao tác sự kiện không hợp lệ.'};
      if(result.ok)persist(true);payloadCache.clear();broadcast();json(res,result,result.ok?200:400);return;
    }
    if(url.pathname==='/api/engage'&&req.method==='POST'){const b=await body(req);const result=engageNow(worlds[mode],b.kind,Date.now());if(result.ok){persist(true);broadcast();}json(res,result,result.ok?200:400);return;}
    if(url.pathname==='/api/ceremony'&&req.method==='POST'){const result=honorCeremony(worlds[mode],Date.now(),true);if(result.ok){persist(true);broadcast();}json(res,result,result.ok?200:400);return;}
    if(url.pathname==='/api/heaven-strike'&&req.method==='POST'){const b=await body(req);const result=heavenStrike(worlds[mode],b.id,Date.now());if(result.ok){persist(true);broadcast();}json(res,result,result.ok?200:400);return;}
    if(url.pathname==='/api/admin-gift'&&req.method==='POST'){const b=await body(req);const result=adminGift(worlds[mode],b.id,b.combo,Date.now(),b.custom);if(result.ok){persist(true);broadcast();}json(res,result,result.ok?200:400);return;}
    if(url.pathname==='/api/puppet'&&req.method==='POST'){const b=await body(req);const result=puppetControl(worlds[mode],b,Date.now());if(result.ok&&b.op!=='list'){persist(true);broadcast();}json(res,result,result.ok?200:400);return;}
    if(url.pathname==='/api/player'&&req.method==='POST'){const b=await body(req);const patch={...(b.patch||{})};if(b.base&&typeof b.base==='object')for(const k of Object.keys(patch))if(Object.hasOwn(b.base,k)&&patch[k]===b.base[k])delete patch[k];/* 08/11: bỏ ô không đổi so với lúc mở form */const result=adminEditPlayer(worlds[mode],b.id,patch,Date.now(),{announce:b.announce===true});if(result.ok){persist(true);broadcast();}json(res,result,result.ok?200:400);return;}
    if(url.pathname==='/api/lantern-event'&&req.method==='POST'){const b=await body(req);const r=controlLanternEvent(worlds[mode],b.action,Date.now());if(r.ok){persist(true);payloadCache.clear();broadcast();}json(res,r,r.ok?200:400);return;}
    if(url.pathname==='/api/pet-event'&&req.method==='POST'){const b=await body(req);const r=controlPetEvent(worlds[mode],b.action,Date.now(),b.minutes??5);if(r.ok){persist(true);payloadCache.clear();broadcast();}json(res,r,r.ok?200:400);return;}
    if(url.pathname==='/api/flower-event'&&req.method==='POST'){const b=await body(req);const result=startFlowerEvent(worlds[mode],Date.now(),b.minutes,b.kind||'flower');if(result.ok)persist(true);broadcast();json(res,result,result.ok?200:400);return;}
    if(url.pathname==='/api/world-scene'&&req.method==='POST'){const b=await body(req);if(b.scene!=='auto'&&!SCENES.some(s=>s.id===b.scene)){json(res,{ok:false,message:'Cảnh không hợp lệ.'},400);return;}worlds[mode].settings.sceneMode=b.scene;persist(true);payloadCache.clear();broadcast();json(res,{ok:true,scene:b.scene});return;}
    // 09/11: nhạc nền LIVE — 'auto' (tự đổi mỗi 30 phút), số thứ tự (giữ cố định), 'next' (bài kế).
    if(url.pathname==='/api/music'&&req.method==='POST'){const b=await body(req),w=worlds[mode],next=applyMusicCommand(w.settings?.music,b.cmd,Date.now());if(!next){json(res,{ok:false,message:'Bài nhạc không hợp lệ.'},400);return;}w.settings??={};w.settings.music=next;persist(true);payloadCache.clear();broadcast();json(res,{ok:true,music:next});return;}
    if(url.pathname==='/api/event-settings'&&req.method==='POST'){const b=await body(req);const result=setEventSettings(worlds[mode],b);if(result.ok)persist(true);broadcast();json(res,result,result.ok?200:400);return;}
    if(url.pathname==='/api/blessing'&&req.method==='POST'){const b=await body(req);const result=blessing(worlds[mode],Date.now(),Number(b.count)||3);broadcast();json(res,result);return;}
    if(url.pathname==='/api/opportunity'&&req.method==='POST'){const result=startOpportunity(worlds[mode]);persist(true);broadcast();json(res,result);return;}
    if(url.pathname==='/api/boss'&&req.method==='POST') {const b=await body(req);const result=openBoss(worlds[mode],Date.now(),b.species||null);if(result.ok)persist(true);broadcast();json(res,result);return;}
    if(url.pathname==='/api/bridge'&&req.method==='POST'){const b=await body(req);setBridge(b.enabled===true);json(res,{ok:true,connection});return;}
    if(url.pathname==='/api/gifts'&&req.method==='POST'){
      const b=await body(req);if(!Array.isArray(b.gifts)||b.gifts.length!==worlds[mode].gifts.length)throw Error('Số mốc quà không khớp cấu hình server.');
      const old=worlds[mode].gifts;const gifts=old.map((g,i)=>{
        const n=b.gifts[i];for(const key of ['min','qi','stones','herbs'])if(!Number.isSafeInteger(n[key])||n[key]<(key==='min'?1:0)||n[key]>(key==='min'?100000:10000000))throw Error('Giá trị cấu hình không hợp lệ.');
        return {...g,min:n.min,qi:n.qi,stones:n.stones,herbs:n.herbs};
      });if(gifts[0].min!==1||gifts.some((g,i)=>i&&g.min<=gifts[i-1].min))throw Error('Mốc đầu phải là 1; các mốc tiếp theo tăng dần.');
      worlds[mode].gifts=gifts;persist();broadcast();json(res,{ok:true});return;
    }
    if(url.pathname==='/api/visitor-event'&&req.method==='POST'){const b=await body(req);const r=startVisitor(worlds[mode],b.kind);persist(true);broadcast();json(res,r,r.ok?200:400);return;}
    if(url.pathname==='/api/visitor-audit'&&req.method==='GET'){json(res,{...visitorAuditView(worlds[mode],url.searchParams.get('event')),today:auditStorage.today()});return;}
    if(url.pathname==='/api/gift-audit-log'&&req.method==='GET'){
      const date=url.searchParams.get('date')||auditStorage.today(),file=auditStorage.file(mode,date);
      if(!file||!fs.existsSync(file)){json(res,{ok:false,message:'Chưa có nhật ký ngày này.'},404);return;}
      res.writeHead(200,{'Content-Type':'application/x-ndjson; charset=utf-8','Content-Disposition':`attachment; filename="gifts-${mode}-${date}.jsonl"`,'Cache-Control':'no-store'});fs.createReadStream(file).pipe(res);return;
    }
    if(url.pathname==='/api/export'){res.setHeader('Content-Disposition',`attachment; filename="van-hai-${mode}.json"`);json(res,worlds[mode]);return;}
    if(url.pathname.startsWith('/api/')){json(res,{ok:false,message:'Không có API này.'},404);return;}
    if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);res.end();return;}
    const relative=decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname);
    const file=path.resolve(root,'public','.'+relative);const publicRoot=path.join(root,'public')+path.sep;
    if(!file.startsWith(publicRoot)){res.writeHead(403);res.end();return;}
    if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('Không tìm thấy.');return;}
    const asset=assets.get(file);if(!asset){res.writeHead(404);res.end();return;}
    const headers={'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','ETag':asset.etag,'X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://*.tiktokcdn.com https://*.tiktokcdn-us.com https://*.tiktokcdn-eu.com https://*.ibytedtos.com https://*.byteoversea.com; media-src 'self' blob:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'self'"};
    if(req.headers['if-none-match']===asset.etag){res.writeHead(304,headers);res.end();return;}
    res.writeHead(200,{...headers,'Content-Length':asset.body.length});res.end(req.method==='HEAD'?undefined:asset.body);

  }catch(e){json(res,{ok:false,message:e.message},400);}
});
if(process.env.VAN_HAI_RECOVERY_FILE){
  const recoveryFile=process.env.VAN_HAI_RECOVERY_FILE;let tries=0;
  const recoveryTimer=setInterval(()=>{
    if(++tries>60){clearInterval(recoveryTimer);return;}
    if(!fs.existsSync(recoveryFile))return;
    try{const rows=JSON.parse(fs.readFileSync(recoveryFile,'utf8'));for(const event of rows.slice(-1000))if(event.event==='gift')ingest(worlds.live,event);fs.renameSync(recoveryFile,recoveryFile+'.replayed');persist(true);broadcast();clearInterval(recoveryTimer);console.log('Đã đối soát quà qua thời gian khởi động lại.');}catch(e){console.error('Chưa đối soát được quà:',e.message);}
  },1000);recoveryTimer.unref();
}
// 4/11/2026: tạo sẵn giọng cho sự kiện quan trọng (quà, sự kiện, đột phá…) ngay khi xảy ra → trang hỏi tới là có file, giọng đến trước chữ.
const prewarmed=new Set(),bootAt=Date.now();
// 08/11: chỉ tạo sẵn câu chắc chắn được đọc (quà thật, Thiên Đạo, thông báo sự kiện) và còn mới; câu thường/đột phá trang có thể bỏ → không tốn máy.
// Máy rảnh thì làm mảnh ghép (tên người đang có mặt, câu cảm ơn quà) để lời cảm ơn quà phát ngay.
const surelySpoken=e=>(e.gift&&Number(e.coins)>0&&!e.simulated&&!e.autoRose)||e.heavenStrike||isEventAnnouncement(e);
function prewarmSpeech(){try{if(synthesizeSpeech.busy)return;const now=Date.now();for(const e of worlds.live.events.slice(-15).sort((a,b)=>voicePriority(b)-voicePriority(a))){if(!e?.id||prewarmed.has(e.id))continue;prewarmed.add(e.id);if(prewarmed.size>600)prewarmed.delete(prewarmed.values().next().value);if((e.at||0)<bootAt||now-(e.at||0)>10000||!surelySpoken(e)||!eventAllowedOnLive(e,worlds.live.players))continue;synthesizeSpeech(speechEventFor('live',e)).catch(()=>{});return;}
  if(now-synthesizeSpeech.lastForegroundAt<15000)return;const part=nextMissingPart(worlds.live,plan=>!!synthesizeSpeech.cached(plan),now);if(part)synthesizeSpeech.prewarmPart(part).catch(()=>{});}catch{}}
setInterval(()=>{tick(worlds.demo);tick(worlds.live);prewarmSpeech();broadcast();},1000).unref();
setInterval(persist,3000).unref();
// v54: sao lưu tự động thế giới LIVE mỗi 30 phút vào data/backups, giữ 48 bản mới nhất (~24 giờ).
function backupLive(){try{persist(true);const dir=path.join(dataDir,'backups');fs.mkdirSync(dir,{recursive:true});const d=new Date(),pad=n=>String(n).padStart(2,'0');
  fs.copyFileSync(path.join(dataDir,'live.json'),path.join(dir,`live-${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}.json`));
  const files=fs.readdirSync(dir).filter(f=>/^live-d{8}-d{4}.json$/.test(f)).sort();for(const f of files.slice(0,Math.max(0,files.length-48)))fs.rmSync(path.join(dir,f),{force:true});}catch(e){console.error('Sao lưu tự động lỗi:',e.message);}}
if(!process.env.VAN_HAI_DATA_DIR){setTimeout(backupLive,60000).unref();setInterval(backupLive,30*60000).unref();}
function shutdown(){closing=true;synthesizeSpeech.stop();clearTimeout(retry);setBridge(false,false);persist(true);for(const c of clients)c.res.end();server.close(()=>process.exit(0));setTimeout(()=>process.exit(0),2000).unref();}
process.on('SIGINT',()=>{runtimeLog.reason('SIGINT');shutdown();});process.on('SIGTERM',()=>{runtimeLog.reason('SIGTERM');shutdown();});
// Bản web chạy chung dữ liệu: CHỈ bật khi có file data/web-enabled (BAT-WEB.cmd) hoặc VAN_HAI_WEB=1. Mặc định tắt, LIVE không đổi.
if(process.env.VAN_HAI_WEB==='1'||(process.env.VAN_HAI_WEB!=='0'&&fs.existsSync(path.join(dataDir,'web-enabled'))))import('./web/embed.mjs').then(m=>m.mountWeb({world:worlds.live,persist,dataDir})).catch(e=>console.error('[web] Không bật được bản web:',e.message));
const port=Number(process.env.PORT??4317);
server.listen(port,'127.0.0.1',()=>{persist();if(!process.env.VAN_HAI_DATA_DIR||process.env.VAN_HAI_BRIDGE_AUTO){try{if(JSON.parse(fs.readFileSync(bridgeFile,'utf8')).enabled===true)setBridge(true);}catch{}}if(!process.env.VAN_HAI_DATA_DIR||process.env.VAN_HAI_TTS)synthesizeSpeech.warm();const actual=server.address().port;console.log(`Vân Hải Tông: http://127.0.0.1:${actual}\nOBS 1080×1920: http://127.0.0.1:${actual}/?overlay=1&world=live`);});
server.on('error',e=>{console.error(e.message);process.exit(1);});
