import {isEventAnnouncement} from './event-announcements.js';
// 4/11/2026: tốc độ đọc (1 = gốc). Trình duyệt giữ nguyên cao độ khi preservesPitch=true.
export const VOICE_RATE=1.8;
export const syntheticVoice=e=>!!(e.resident||e.actorKind==='npc'||e.simulated||e.autoRose||String(e.user||'').startsWith('puppet-'));
export const raceOpeningVoice=e=>!!(e.raceEntry||e.effect==='race'&&/^VÂN HẢI PHI KIẾM|^Phi kiếm xuất phát/.test(e.text||''));
export const realGiftVoice=e=>!!(e.gift&&Number(e.coins)>0&&!syntheticVoice(e));
export function fastVoiceFile(e){const kind=e.adminGift?null:realGiftVoice(e)?(e.eventRule||e.raceGift||e.warGift?null:'gift'):e.effect==='breakthrough'?'breakthrough':e.effect==='ready'?'ready':e.autoArrival||e.effect==='join'?null:e.effect==='attack'?'attack':e.effect==='gather'?'gather':e.effect==='learn'?'learn':['qi','petal','lotus','sword'].includes(e.effect)?'qi':null; /* 08/11: chào người vào không dùng câu dự phòng chung (bị lặp, nói cả với người cũ). 07/11: bỏ câu dự phòng 'Tông môn đã ghi nhận…' — nghe như cảm ơn quà khi không ai tặng */return kind?'/assets/voice-fast-v1/'+kind+'.mp3':null;}
// Tu tiên giả thường trú luôn xếp sau khách thật (0).
export const priority=e=>e.heavenStrike?7:syntheticVoice(e)?0:e.adminGift?5.5:e.ritualSkipped?3:raceOpeningVoice(e)?7:realGiftVoice(e)?6:e.autoArrival?5.5:e.engagementAction?3:isEventAnnouncement(e)?5:e.summary?2:e.ceremony?4:e.envelopeStart||e.quizStart||e.quizEnd||e.envelopeEnd||e.sectLevel||e.streak||e.tasksDone||e.envelopeLucky||e.raceGiftRank||e.vipReturn||e.vipUp||e.likeGoal||e.starter||e.firstGift?3:e.loyaltyAward||e.guide||e.adminGift||e.missing||e.effect==='join'?3:['visitor','breakthrough','dragon','skin','victory','ready','blessing','opportunity'].includes(e.effect)||String(e.text).includes('cảm ơn đạo hữu')?3:['join','title','status','hint','boss','lotus','sword'].includes(e.effect)||String(e.text).startsWith('Kết duyên')?2:1;

// 08/11/2026: GIẢM GIỌNG ĐỌC (chủ game: "đọc nhiều, lộn xộn, ồn quá"). Quà, Thiên Đạo, sự kiện lớn luôn đọc.
// Câu thường (tu luyện, hái, đánh, nhắc lệnh, chào…) giãn ra: cả sân tối đa 1 câu / 12 s, mỗi người 1 câu / 90 s;
// người chơi lâu (≥2 giờ, ≥400 lượt hoặc từ Chân Tiên) không nghe câu nhắc thường nữa.
// Đột phá: người từng tặng quà luôn được đọc; người chưa tặng chỉ đọc khi là người mới, tối đa 1 câu / 45 s.
// Đang chiếu màn đột phá: chỉ đọc quà + Thiên Đạo; thông báo sự kiện chờ màn xong; câu thường bỏ.
export const VOICE_CALM=Object.freeze({routineGapMs:12000,userRoutineGapMs:90000,breakthroughGapMs:45000,veteranActiveMs:2*3600e3,veteranInteractions:400,veteranRealm:8,ritualRetryMs:1500,arrivalGapMs:20000,arrivalRepeatMs:30*60000});
const VETERAN_SILENT=new Set(['qi','petal','lotus','sword','attack','gather','learn','hint','status','ready','join','title','boss','pill','guide']);
export const urgentVoice=e=>!!(e.heavenStrike||realGiftVoice(e));
export const veteranPlayer=p=>!!p&&((p.activeMs||0)>=VOICE_CALM.veteranActiveMs||(p.interactions||0)>=VOICE_CALM.veteranInteractions||(p.realm||0)>=VOICE_CALM.veteranRealm);
const breakthroughVoice=e=>e.effect==='breakthrough'||!!e.ritualSkipped;
const keepsDuringRitual=e=>isEventAnnouncement(e)||raceOpeningVoice(e)||!!e.ceremony;
/** 'play' | 'drop' | 'defer'. Thuần, để test được. */
export function voiceDecision(e,{now=Date.now(),player=null,ritualBusy=false,lastRoutineAt=-Infinity,lastUserRoutineAt=-Infinity,lastBreakthroughAt=-Infinity,lastArrivalAt=-Infinity}={}){
  if(urgentVoice(e))return 'play';
  if(ritualBusy)return keepsDuringRitual(e)?'defer':'drop';
  if(keepsDuringRitual(e))return 'play';
  const vet=veteranPlayer(player);
  if(breakthroughVoice(e)){
    if((player?.giftCoins||0)>0)return 'play';
    return !vet&&now-lastBreakthroughAt>=VOICE_CALM.breakthroughGapMs?'play':'drop';
  }
  if(e.autoArrival){ // 08/11: chào người vào — cả sân tối đa 1 câu / 20 s; người chơi lâu vào lại chỉ hiện bảng, không đọc.
    if(vet&&e.returning)return 'drop';
    return now-lastArrivalAt<VOICE_CALM.arrivalGapMs?'drop':'play';
  }
  const routine=priority(e)<=3;
  if(!routine)return 'play';
  if(vet&&(VETERAN_SILENT.has(e.effect)||e.guide))return 'drop';
  if(now-lastRoutineAt<VOICE_CALM.routineGapMs||e.user&&now-lastUserRoutineAt<VOICE_CALM.userRoutineGapMs)return 'drop';
  return 'play';
}

// 08/11/2026: CHỐNG GIỌNG TRỄ. Giọng đọc chậm sẽ nói điều không còn trên màn hình (TikTok có thể cảnh báo nội dung sai).
// Câu nào tính từ lúc nhận sự kiện đã quá hạn thì bỏ hẳn, kể cả khi giọng vừa tạo xong.
export function voiceMaxAgeMs(e){return e.adminGift?25000:e.heavenStrike?10000:realGiftVoice(e)?12000:raceOpeningVoice(e)?12000:isEventAnnouncement(e)?12000:e.autoArrival?6000:e.ceremony?15000:7000;}

export class VoiceQueue {
  constructor({world,audio,onStart=()=>{},onStatus=()=>{},player=()=>null,calm=true}){this.world=world;this.audio=audio;this.player=player;this.calm=calm;this.calmLast={routine:-Infinity,breakthrough:-Infinity,arrival:-Infinity,users:new Map()};this.onStart=onStart;this.onStatus=onStatus;this.enabled=true;this.volume=1;this.queue=[];this.current=null;this.running=false;this.last=new Map();this.generation=0;this.announced=new Set();this.prepared=new Map();}
  add(e){
    if(!this.enabled||!this.audio.enabled)return;
    // 4/11/2026: mỗi sự kiện chỉ vào hàng giọng một lần (giờ được thêm ngay khi nhận, trước khi hình hiện).
    if(e.id){this.handled??=new Set();if(this.handled.has(e.id))return;this.handled.add(e.id);if(this.handled.size>400)this.handled.delete(this.handled.values().next().value);}
    if(e.resident&&(!e.file||this.queue.length))return;
    if(!e.resident&&syntheticVoice(e)&&(this.running||this.queue.length))return;
    if(e.id&&(isEventAnnouncement(e)||realGiftVoice(e)||e.autoArrival)){if(this.announced.has(e.id))return;this.announced.add(e.id);if(this.announced.size>256)this.announced.delete(this.announced.values().next().value);}
    const now=Date.now(),key=(e.user||'sect')+':'+e.effect;
    if(this.calm&&!syntheticVoice(e)){
      const users=this.calmLast.users,decision=voiceDecision(e,{now,player:e.user?this.player(e.user):null,ritualBusy:this.ritualBusy(e),lastRoutineAt:this.calmLast.routine,lastUserRoutineAt:users.get(e.user)??-Infinity,lastBreakthroughAt:this.calmLast.breakthrough,lastArrivalAt:this.calmLast.arrival});
      if(decision==='drop')return;
      if(decision==='play'&&!urgentVoice(e)&&!keepsDuringRitual(e)){if(e.autoArrival)this.calmLast.arrival=now;else if(breakthroughVoice(e))this.calmLast.breakthrough=now;else if(priority(e)<=3){this.calmLast.routine=now;if(e.user){users.set(e.user,now);if(users.size>600)users.delete(users.keys().next().value);}}}
    }
    if(priority(e)<=1&&now-(this.last.get(key)||0)<6500)return;
    if(priority(e)<=1&&this.queue.length>=3)return; // v54: hàng chờ đã dồn → bỏ câu thường, để quà/đột phá/sự kiện được đọc kịp
    // Only the newest routine response waits. A crowded LIVE must not narrate
    // four old cultivations before acknowledging the current action.
    if(priority(e)<=2)this.queue=this.queue.filter(x=>priority(x.e)>2);
    this.last.set(key,now);if(this.last.size>500)this.last=new Map([...this.last].slice(-200));
    if(this.queue.some(x=>x.e.id===e.id))return;
    if(e.autoArrival){
      this.queue=this.queue.filter(x=>!x.e.autoArrival||now-x.at<8000);
      // Bound spoken entrances to three; gifts remain highest priority.
      if(this.queue.filter(x=>x.e.autoArrival).length>=3)return;
    }
    this.queue.push({e,at:now});
    if(this.queue.length>6){const min=Math.min(...this.queue.map(x=>priority(x.e)));this.queue.splice(this.queue.findIndex(x=>priority(x.e)===min),1);}
    this.prunePrepared();
    // Tạo sẵn tối đa hai câu kế tiếp, kể cả hành động thường.
    this.prepareQueued();
    // Hành động thật nhường chỗ khỏi lời nền; quà/sự kiện mới ngắt câu thường.
    if(!syntheticVoice(e)&&this.running&&((this.activePriority??9)===0||priority(e)>2&&(this.activePriority??9)<=2||realGiftVoice(e)&&(this.activePriority??9)<6)){this.cancelPreparation?.();this.cancelPlayback?.();} // 07/11: quà cắt câu thường/đột phá để cảm ơn đúng lúc
    this.next();
  }
  // Mảnh ghép làm sẵn cho lời cảm ơn quà; thiếu tên thì null (dùng đường cũ).
  giftParts(e){const base=`/api/voice-part?world=${this.world}`,get=q=>fetch(base+q,{signal:AbortSignal.timeout(1200)}).then(r=>r.ok?r.blob():null).catch(()=>null);
    if(!e.user||e.eventRule&&!e.warGift||e.raceGift)return Promise.resolve(null);
    if(e.adminGift)return Promise.all([get('&kind=name&user='+encodeURIComponent(e.user)),get('&kind=admin&combo='+encodeURIComponent(e.adminGift))]).then(([n,g])=>n&&g?[n,g]:null); // 08/11 tối: tông chủ ban lễ // 08/11 tối: quà trong sự kiện đọc đúng luật sự kiện, không ghép câu quà chung
    // 08/11 tối: quà trong Chính Ma → "<tên> phản công! <phe> đẩy mạnh!" (không cảm ơn).
    const second=e.warGift?get('&kind=war&side='+encodeURIComponent(e.warGift)):get('&kind=gift&gift='+encodeURIComponent(e.gift||'')).then(b=>b||get('&kind=thanks'));
    return Promise.all([get('&kind=name&user='+encodeURIComponent(e.user)),second]).then(([n,g])=>n&&g?[n,g]:null);}
  // Đo độ trễ thật: từ lúc nhận sự kiện tới lúc bắt đầu đọc; gửi lên trạng thái client để kiểm tra trên LIVE.
  noteLag(e,ms,dropped){const row={k:realGiftVoice(e)?'gift':e.autoArrival?'arrival':isEventAnnouncement(e)?'event':e.heavenStrike?'heaven':'other',ms:Math.round(ms),d:dropped?1:0,at:Date.now()};(this.lags??=[]).push(row);if(this.lags.length>40)this.lags.shift();if(dropped)this.staleDropped=(this.staleDropped||0)+1;}
  lagStats(){const quick=this.quickParts||0,rows=(this.lags||[]).filter(r=>!r.d).map(r=>r.ms).sort((a,b)=>a-b),q=f=>rows.length?rows[Math.min(rows.length-1,Math.floor(rows.length*f))]:null;return {n:rows.length,p50:q(.5),p90:q(.9),max:rows.at(-1)??null,stale:this.staleDropped||0,quick,last:(this.lags||[]).slice(-8)};}
  // Màn đột phá đang chiếu (không tính lời của chính màn đó).
  ritualBusy(e){const session=this.audio?.qiSession;return !!(this.calm&&session&&session.event?.id!==e?.id);}
  prepareQueued(){
    if(!this.enabled||!this.audio.enabled)return;
    const waiting=[...this.queue].sort((a,b)=>priority(b.e)-priority(a.e)||a.at-b.at);
    for(const {e} of waiting){
      if(e.file||syntheticVoice(e)||this.prepared.has(e.id))continue;
      if((this.preparing||0)>=2||this.prepared.size>=2)break;
      this.prepare(e).catch(()=>{});
    }
  }
  prepare(e){
    if(this.prepared.has(e.id))return this.prepared.get(e.id);
    const query=e.sourceIds?.length>1?`ids=${encodeURIComponent(e.sourceIds.join(','))}`:e.summary?`summary=${encodeURIComponent(e.summary)}&n=${Number(e.count)||0}`:`id=${encodeURIComponent(e.id)}`;
    this.preparing=(this.preparing||0)+1;
    const job=(async()=>{const response=await fetch(`/api/speech?world=${this.world}&${query}`,{signal:AbortSignal.timeout(realGiftVoice(e)||isEventAnnouncement(e)?45000:20000)});if(!response.ok)throw Error(`Không tạo được giọng đọc (${response.status}).`);return response.blob();})().finally(()=>{this.preparing=Math.max(0,(this.preparing||1)-1);});
    this.prepared.set(e.id,job);return job;
  }
  prunePrepared(){const keep=new Set(this.queue.map(x=>x.e.id));if(this.activeVoiceId)keep.add(this.activeVoiceId);for(const id of this.prepared.keys())if(!keep.has(id))this.prepared.delete(id);}
  async next(){
    if(this.running||!this.enabled||!this.audio.enabled)return;
    this.queue=this.queue.filter(x=>Date.now()-x.at<(x.e.autoArrival?8000:realGiftVoice(x.e)?30000:isEventAnnouncement(x.e)?75000:priority(x.e)<=1?5000:25000));if(!this.queue.length)return;
    this.queue.sort((a,b)=>priority(b.e)-priority(a.e)||a.at-b.at);
    if(this.queue.some(x=>this.ritualBusy(x.e))){const i=this.queue.findIndex(x=>urgentVoice(x.e)||!this.ritualBusy(x.e));if(i<0){clearTimeout(this.ritualRetry);this.ritualRetry=setTimeout(()=>this.next(),VOICE_CALM.ritualRetryMs);this.ritualRetry.unref?.();return;}if(i>0)this.queue.unshift(...this.queue.splice(i,1));}
    const {e,at:receivedAt}=this.queue.shift(),generation=this.generation;this.running=true;this.activeVoiceId=e.id;this.activePriority=priority(e);let url=null;
    try{
      if(e.file){await this.play(e.file,e,generation);return;}
      this.onStatus('Đang chuẩn bị giọng đọc…');
      const pending=this.prepare(e);this.prepareQueued();
      const fallback=fastVoiceFile(e),quick=realGiftVoice(e)||e.adminGift?this.giftParts(e):null;let timer;const interrupted=new Promise((_,reject)=>{this.cancelPreparation=()=>reject(Object.assign(Error('Voice superseded'),{name:'AbortError'}));});
      let blob;try{blob=await Promise.race([pending,interrupted,...(fallback||e.autoArrival||quick?[new Promise(resolve=>{timer=setTimeout(()=>resolve(null),e.autoArrival?(this.arrivalWaitMs??1500):quick?(this.giftWaitMs??Math.min(700,this.prepareWaitMs??700)):(this.prepareWaitMs??1200));})]:[])]);}catch(err){if(err.name==='AbortError')throw err;if(!fallback)throw err;blob=null;}finally{clearTimeout(timer);this.cancelPreparation=null;}
      if(generation!==this.generation)return;
      // 08/11: câu cảm ơn đầy đủ chưa kịp → ghép mảnh làm sẵn "Sư huynh <tên>" + "tặng <quà>! Tu vi tăng mạnh!" (vẫn giọng tông sư).
      if(!blob&&quick){let pt;const parts=await Promise.race([quick,new Promise(r=>{pt=setTimeout(()=>r(null),this.partsWaitMs??Math.min(400,this.prepareWaitMs??400));})]);clearTimeout(pt);if(generation!==this.generation)return;if(parts){if(Number.isFinite(receivedAt)&&Date.now()-receivedAt>voiceMaxAgeMs(e)){this.noteLag(e,Date.now()-receivedAt,true);return;}this.noteLag(e,Date.now()-(receivedAt??Date.now()),false);this.quickParts=(this.quickParts||0)+1;for(const part of parts){const u=URL.createObjectURL(part);try{await this.play(u,e,generation);}finally{URL.revokeObjectURL(u);}if(generation!==this.generation)return;}return;}}
      if(!blob){if(!fallback)return;if(Number.isFinite(receivedAt)&&Date.now()-receivedAt>voiceMaxAgeMs(e)){this.noteLag(e,Date.now()-receivedAt,true);return;} /* 08/11: lời chào chưa kịp tạo trong 1,5 s thì bỏ, không chắn hàng giọng */await this.play(fallback,{...e,voiceFallback:true},generation);return;}
      if(Number.isFinite(receivedAt)&&Date.now()-receivedAt>voiceMaxAgeMs(e)){this.noteLag(e,Date.now()-receivedAt,true);return;}
      this.noteLag(e,Date.now()-(receivedAt??Date.now()),false);url=URL.createObjectURL(blob);await this.play(url,e,generation);
    }catch(err){if(generation===this.generation&&err.name!=='AbortError'){this.onStatus(err.name==='NotAllowedError'?'Bấm ♫ hoặc Thử âm để mở giọng đọc.':err.message);if(isEventAnnouncement(e)&&err.name!=='NotAllowedError'&&(e.voiceRetries||0)<2){await new Promise(r=>setTimeout(r,1200));if(generation===this.generation)this.queue.unshift({e:{...e,voiceRetries:(e.voiceRetries||0)+1},at:Date.now()});}}}
    finally{if(url)URL.revokeObjectURL(url);if(generation===this.generation){this.prepared.delete(e.id);this.activeVoiceId=null;this.running=false;this.current=null;this.audio.duck(false);this.prunePrepared();this.next();}}
  }
  async play(url,e,generation=this.generation){
    const clip=new Audio(url);this.current=clip;clip.volume=this.clipVolume();clip.preload='auto';clip.preservesPitch=true;clip.playbackRate=VOICE_RATE; // 4/11: đọc nhanh 1,8× giữ cao độ
    let finish;const ended=new Promise(resolve=>finish=resolve);let timer;
    clip.onended=clip.onerror=()=>finish();this.cancelPlayback=()=>{clip.pause();finish();};
    this.audio.duck(true);
    try{
      await clip.play();if(generation!==this.generation){clip.pause();return;}
      this.onStatus('Giọng Việt đang hoạt động');this.onStart(e,Math.min(12000,(Number.isFinite(clip.duration)?clip.duration:5)*1000/VOICE_RATE));
      timer=setTimeout(()=>{clip.pause();finish();},15000);await ended;
    }finally{clearTimeout(timer);clip.pause();if(this.current===clip)this.current=null;if(generation===this.generation)this.audio.duck(false);}
  }
  /** Lời tông sư lúc vắng: chỉ phát khi không có gì đang đọc/chờ đọc. */
  async idle(line){
    if(this.running||this.queue.length||!this.enabled||!this.audio.enabled)return false;
    const generation=this.generation;this.running=true;this.activePriority=0;
    try{await this.play(line.file,{name:'Tông sư',text:line.text,user:line.user},generation);return true;}
    catch{return false;}
    finally{if(generation===this.generation){this.running=false;this.next();}}
  }
  // Giọng phải rõ hơn nhạc nền: âm lượng tổng 30% (mặc định) → giọng 90%.
  clipVolume(){return Math.min(1,(this.audio.volume??1)*3)*this.volume;}
  setVolume(v){this.volume=Math.max(0,Math.min(1,v));if(this.current)this.current.volume=this.clipVolume();}
  stop(){this.generation++;this.queue=[];this.prepared.clear();this.activeVoiceId=null;this.cancelPreparation?.();this.cancelPlayback?.();this.current=null;this.running=false;this.audio.duck(false);}
  async sample(){this.stop();const generation=this.generation;this.running=true;try{await this.play('/assets/voice-welcome.mp3',{name:'Vân Hải Tông',text:'Chào mừng đạo hữu · gõ nhapmon để tu luyện'},generation);}finally{if(generation===this.generation){this.running=false;this.next();}}}
}
