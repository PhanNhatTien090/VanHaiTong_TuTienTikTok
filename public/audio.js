import {BGM_LIST,musicIndex} from './music-rotation.js?v=context-music-20261114';
import {playBonkSound} from './bonk-audio.js';
import {playWarSound} from './sect-war-audio.js';
import {playAlchemySound} from './alchemy-audio.js';
import {scheduleKimTienAudio,kimTienMusicDuck} from './kim-tien-audio.js';
import {scheduleHuyenTienAudio,huyenTienMusicDuck} from './huyen-tien-audio.js';
import {scheduleBattleSound,combatVoice} from './battle-audio.js';
import {scheduleDaiThuaAudio,daiThuaMusicDuck} from './dai-thua-audio.js';
import {scheduleChanTienAudio,chanTienMusicDuck} from './chan-tien-audio.js';
import {scheduleLuyenHuAudio,luyenHuMusicDuck} from './luyen-hu-audio.js';
import {scheduleThaiAtAudio,thaiAtMusicDuck} from './thai-at-audio.js';
import {scheduleDaiLaAudio,daiLaMusicDuck} from './dai-la-audio.js';
import {lateMusicDuck,scheduleLateAudio} from './late-ascension-audio.js';
import {scheduleTienDeAudio,tienDeMusicDuck} from './tien-de-audio.js';import {scheduleMaThanAudio,maThanMusicDuck} from './ma-than-audio.js';import {scheduleThienMaAudio,thienMaMusicDuck} from './thien-ma-audio.js';import {scheduleDietTheAudio,dietTheMusicDuck} from './diet-the-audio.js';
import {CinematicSfx} from './cinematic-sfx.js';
import {prepareFeedbackAudio,playFeedbackAudio} from './feedback-audio.js';
import {LH_TIMING} from './luyen-hu-formation.js';
import {createRitualBoostBus,scheduleRitualBoostLayer} from './ritual-boost-audio.js';
import {scheduleHoaThanAudio,hoaThanMusicDuck} from './hoa-than-audio.js';
import {scheduleQiAudio} from './qi-audio.js';
import {ritualAppearance} from './ritual-appearance.js';
// 07/11: mốc nổ (tỉ lệ thời lượng) của 3 cảnh giới đầu, để tiếng nhấn ngẫu nhiên rơi đúng lúc nổ.
const EARLY_IMPACT={1:.70,2:8.8/10.8,3:9.4/11.8};
import {qiVariant} from './qi-impact.js';
import {scheduleImpactLayers} from './impact-audio.js';
// 4/11/2026: lớp nổ chung chồng lên cue gốc: [giây nổ, thời lượng cue, nốt gốc]
const IMPACT_LAYERS={3:[9.4,11.8,174.6],4:[10.75,14.4,146.8],5:[14.4,17.6,110],6:[17.25,20.8,98],7:[19,22.8,87.31],8:[27.35,31.6,82.41],11:[26,30,65.41],12:[28,32,61.74],13:[30,34,55]};
import {scheduleTrucCoAudio,trucCoMusicDuck} from './truc-co-audio.js';
import {scheduleKimDanAudio,kimDanMusicDuck} from './kim-dan-audio.js';
import {scheduleNguyenAnhAudio,nguyenAnhMusicDuck} from './nguyen-anh-audio.js';
import {lateAscension} from './late-ascension-data.js';
import {breakthroughRealm} from './breakthrough-fx.js';
// Original procedural audio: no external samples, music service, or credentials.
// 08/11: bo đỉnh mềm cuối chuỗi — dưới 0,8 giữ nguyên, trên đó uốn dần tới 0,98: không bao giờ cắt cứng (tiếng rẹt).
export function softClipCurve(n=4096){const a=new Float32Array(n);for(let i=0;i<n;i++){const x=i/(n-1)*2-1,m=Math.abs(x);a[i]=Math.sign(x)*(m<=.8?m:.8+.18*Math.tanh((m-.8)/.18));}return a;}
function softClipper(c){if(!c.createWaveShaper)return c.createGain();const w=c.createWaveShaper();w.curve=softClipCurve();w.oversample='2x';return w;}
// 08/11 tối: 3 bản nhạc nền tu tiên, chuẩn hóa -19 LUFS (to hơn bản cũ -23 LUFS ~4 dB). Nguồn + giấy phép: public/assets/AUDIO.md.
// 09/11: 8 bài; mỗi bài lặp tới lúc đổi (tự đổi mỗi 30 phút hoặc theo trang quản lý) — xem music-rotation.js.
// 10/11 (chủ game): nhạc nền to hơn ~4 dB, chỉ nhạc nền (không đụng tiếng hiệu ứng).
export const MUSIC_GAIN=1.6;
export function ascensionImpactRatio(realm){
  if(EARLY_IMPACT[realm])return EARLY_IMPACT[realm];
  if(IMPACT_LAYERS[realm])return IMPACT_LAYERS[realm][0]/IMPACT_LAYERS[realm][1];
  if(realm===9)return 18.1/26;
  if(realm===10)return 20.2/28;
  const late=realm>=25?lateAscension(realm):null;
  return late?late.impact*1000/late.duration:.7;
}
const REALM_CUES={
  2:scheduleTrucCoAudio,3:scheduleKimDanAudio,4:scheduleNguyenAnhAudio,5:scheduleHoaThanAudio,
  6:scheduleLuyenHuAudio,7:scheduleDaiThuaAudio,8:scheduleChanTienAudio,9:scheduleHuyenTienAudio,
  10:scheduleKimTienAudio,11:scheduleThaiAtAudio,12:scheduleDaiLaAudio,13:scheduleTienDeAudio,
  22:scheduleMaThanAudio,23:scheduleThienMaAudio,24:scheduleDietTheAudio
};
export const BGM_TRACKS=Object.freeze(BGM_LIST.map(t=>t.src));
const divineNotes=[
  [146.83,174.61,220,293.66],[130.81,164.81,196,261.63],
  [123.47,146.83,185,246.94],[110,130.81,164.81,220],
  [103.83,123.47,155.56,207.65],[98,146.83,196,246.94],
  [92.5,123.47,138.59,185],[82.41,110,164.81,220]
];

function scheduleDivineCue(c,destination,elapsed,duration,realm){
  const now=c.currentTime,hit=duration*.70,notes=divineNotes[realm-14],sources=[];
  function tone(at,length,frequency,volume,wave,attack=.03,end=frequency){
    const offset=Math.max(0,elapsed-at),remaining=length-offset;
    if(remaining<=0)return;
    const start=now+Math.max(0,at-elapsed),finish=start+remaining;
    const source=c.createOscillator(),gain=c.createGain();
    source.type=wave;
    source.frequency.setValueAtTime(frequency,start);
    if(end!==frequency)source.frequency.exponentialRampToValueAtTime(end,finish);
    gain.gain.setValueAtTime(.0001,start);
    gain.gain.linearRampToValueAtTime(volume,start+Math.min(attack,remaining*.6));
    gain.gain.exponentialRampToValueAtTime(.0001,finish);
    source.connect(gain);gain.connect(destination);
    source.onended=()=>{source.disconnect();gain.disconnect();};
    source.start(start);source.stop(finish);
    sources.push(source);
  }
  for(let i=0;i<4;i++){
    tone(duration*(.12+i*.123),1.45,notes[i],.055,'sine',.15);
    tone(duration*(.155+i*.123),2,notes[i]/2,.042,'triangle',.5);
  }
  for(let i=0;i<5;i++)tone(hit-2+i*.33,.22,155+i*13,.053,'triangle',.02,60);
  if(elapsed<hit+.08)tone(hit,.62,notes[0],.17,'triangle',.012,43);
  for(let i=0;i<4;i++)tone(hit+.20+i*.21,2.8,notes[i]*2,.052,'sine',.14);
  return {endAt:now+Math.max(0,duration-elapsed),stop(){
    for(const source of sources)try{source.stop();}catch{}
  }};
}

export class CultivationAudio {
  constructor(){this.enabled=false;this.ctx=null;this.volume=.45;this.ambient=.6;this.sfx=.85;this.voices=[];this.last={};this.timer=null;this.drone=[];this.ducked=false;this.music=null;}
  async enable(on){
    if(!on){this.cinematic?.clear();clearInterval(this.trackFadeTimer);this.pendingTrack=null;this.transitionGain=1;for(const cue of this.battleVoices||[])cue.stop();this.battleVoices=[];this.ritual(null);this.enabled=false;clearTimeout(this.timer);this.timer=null;this.music?.pause();if(this.ctx)await this.ctx.suspend();return;}
    if(!this.ctx)this.init();
    const resume=this.ctx.resume();let timer;
    try{await Promise.race([resume,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Bấm nút âm thanh để cho phép phát.')),1500);})]);}finally{clearTimeout(timer);}
    if(this.ctx.state!=='running')throw Error('Âm thanh đang bị chặn.');
    this.enabled=true;this.sync();
    if(typeof Audio!=='undefined'){
      if(!this.music){this.track=this.wantTrack??musicIndex(null,Date.now());this.music=new Audio(BGM_TRACKS[this.track]);this.music.loop=true;this.music.preload='auto';}
      this.sync();let musicTimer;try{await Promise.race([this.music.play(),new Promise((_,reject)=>{musicTimer=setTimeout(()=>reject(Object.assign(Error('Nhạc nền chưa phát được. Bấm thử âm lại.'),{slowLoad:true})),4000);})]);}catch(err){if(!err?.slowLoad){this.enabled=false;this.music.pause();await this.ctx.suspend();throw err;}this.retryMusic();}finally{clearTimeout(musicTimer);} /* 10/11: bị chặn tự phát thì báo; chỉ nhạc tải chậm thì giữ hiệu ứng/giọng và thử phát nhạc lại sau */
    }else if(!this.timer)this.schedule();
  }
  // 10/11: tự giữ tiếng — nhạc nền bị dừng ngoài ý muốn / AudioContext bị treo thì tự phát lại khi vẫn đang bật.
  retryMusic(){clearTimeout(this.musicRetry);this.musicRetry=setTimeout(()=>{if(this.enabled&&this.music?.paused)this.music.play()?.catch?.(()=>this.retryMusic());},3000);}
  keepAlive(){if(!this.enabled)return;if(this.ducked&&Date.now()>(this.duckUntil||0))this.duck(false);if(this.ctx&&this.ctx.state!=='running'&&this.ctx.state!=='closed')this.ctx.resume().catch(()=>{});if(this.music?.paused)this.music.play()?.catch?.(()=>{});}
  // 08/11 tối: hết bài thì sang bài kế (vòng lặp danh sách).
  setTrack(i){
    if(!Number.isInteger(i)||i<0||i>=BGM_TRACKS.length)return;this.wantTrack=i;
    if(!this.music||this.pendingTrack===i)return;
    clearInterval(this.trackFadeTimer);this.pendingTrack=null;
    if(this.track===i){this.transitionGain=1;this.sync();return;}
    if(!this.enabled){this.track=i;this.music.src=BGM_TRACKS[i];this.music.loop=true;this.transitionGain=1;this.sync();return;}
    const started=Date.now(),initial=this.transitionGain??1;this.pendingTrack=i;let swapped=false;
    this.trackFadeTimer=setInterval(()=>{
      const age=Date.now()-started;
      if(age<240)this.transitionGain=initial*(1-age/240);
      else{
        if(!swapped){swapped=true;this.track=i;this.music.src=BGM_TRACKS[i];this.music.loop=true;if(this.enabled)this.music.play()?.catch?.(()=>this.retryMusic());}
        this.transitionGain=Math.min(1,(age-240)/700);
      }
      this.sync();
      if(age>=940){clearInterval(this.trackFadeTimer);this.trackFadeTimer=null;this.pendingTrack=null;this.transitionGain=1;this.sync();}
    },40);
  }

  init(context=null){const C=globalThis.AudioContext||globalThis.webkitAudioContext;this.ctx=context||new C();const c=this.ctx;
    this.master=c.createGain();this.ambBus=c.createGain();this.fxBus=c.createGain();this.limiter=c.createDynamicsCompressor();
    this.limiter.threshold.value=-15;this.limiter.knee.value=9;this.limiter.ratio.value=3;this.limiter.attack.value=.004;this.limiter.release.value=.25;
    // 08/11: chống rè — chỉ còn 1 tầng nén chung (các màn đột phá bỏ nén riêng) + trần an toàn chỉ chạm ở đỉnh hiếm.
    this.ceiling=c.createDynamicsCompressor();this.ceiling.threshold.value=-5;this.ceiling.knee.value=1;this.ceiling.ratio.value=18;this.ceiling.attack.value=.001;this.ceiling.release.value=.12;
    this.ambBus.connect(this.master);this.fxBus.connect(this.master);this.master.connect(this.limiter);this.limiter.connect(this.ceiling);this.softClip=softClipper(c);this.ceiling.connect(this.softClip);this.softClip.connect(c.destination);
    this.cinematic=new CinematicSfx(c,this.fxBus);prepareFeedbackAudio(c);
    // A quiet fifth drone with a slow breath envelope, kept below event sounds.
    for(const f of (typeof Audio==='undefined'?[110,164.81,220]:[])){const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=f;g.gain.value=.018;o.connect(g);g.connect(this.ambBus);o.start();this.drone.push({o,g});}
    const lfo=c.createOscillator(),depth=c.createGain();lfo.frequency.value=.095;depth.gain.value=.008;lfo.connect(depth);for(const {g}of this.drone)depth.connect(g.gain);lfo.start();
    // Filtered wind, with no bright sustained hiss.
    const buf=c.createBuffer(1,c.sampleRate*4,c.sampleRate),d=buf.getChannelData(0);let low=0;for(let i=0;i<d.length;i++){low=.985*low+.015*(Math.random()*2-1);d[i]=low;}
    const noise=c.createBufferSource();noise.buffer=buf;noise.loop=true;const filter=c.createBiquadFilter(),gain=c.createGain();filter.type='lowpass';filter.frequency.value=650;gain.gain.value=typeof Audio==='undefined'?.14:.025;noise.connect(filter);filter.connect(gain);gain.connect(this.ambBus);noise.start();this.sync();
  }
  sync(){if(this.music)this.music.volume=Math.min(1,this.volume*this.ambient*MUSIC_GAIN*(this.transitionGain??1)*Math.min(this.ducked?.55:1,this.qiSession?(this.qiSession.duck??.22):1));if(!this.ctx)return;const t=this.ctx.currentTime;this.master.gain.setTargetAtTime(this.volume,t,.08);this.ambBus.gain.setTargetAtTime(this.ambient,t,.3);this.fxBus.gain.setTargetAtTime(this.sfx,t,.08);}
  ritual(event,elapsed=0){
    if(!event||!this.enabled||this.ctx?.state!=='running'){
      if(this.qiSession){this.qiSession.audio.stop();this.qiSession=null;this.sync();}return;
    }
    const realm=breakthroughRealm(event),duck=realm>=25?lateMusicDuck(realm,elapsed):realm===24?dietTheMusicDuck(elapsed):realm===23?thienMaMusicDuck(elapsed):realm===22?maThanMusicDuck(elapsed):realm===13?tienDeMusicDuck(elapsed):realm===12?daiLaMusicDuck(elapsed):realm===11?thaiAtMusicDuck(elapsed):realm===10?kimTienMusicDuck(elapsed):realm===9?huyenTienMusicDuck(elapsed):realm===8?chanTienMusicDuck(elapsed):realm===7?daiThuaMusicDuck(elapsed):realm===6?luyenHuMusicDuck(elapsed):realm===5?hoaThanMusicDuck(elapsed):realm===4?nguyenAnhMusicDuck(elapsed):realm===3?kimDanMusicDuck(elapsed):realm===2?trucCoMusicDuck(elapsed):.22;
    if(this.qiSession?.event===event){if(Math.abs((this.qiSession.duck??.22)-duck)>.008){this.qiSession.duck=duck;this.sync();}return;}
    this.qiSession?.audio.stop();
    this.qiSession={event,duck,audio:this.scheduleRitual(event,realm,elapsed)};this.sync();
  }
  scheduleRitual(event,realm,elapsed=0,{base=true,impact=true,boost=true,variant=true,upgrade=true,cinematicLayers}={}){
    const c=this.ctx,seconds=elapsed/1000,duration=event.duration/1000;
    const output=c.createGain();
    output.connect(this.fxBus);
    const appearance=variant?this.ritualVariant(event,realm,elapsed,output):null;
    const revised=upgrade&&realm===6;
    const enhancement=boost&&!revised&&realm>=6&&realm<25?createRitualBoostBus(c,output,realm):null;
    const schedule=REALM_CUES[realm]||scheduleQiAudio;
    const baseOut=appearance?.input||output, cues=[];
    if(base){
      const cue=realm>=14&&realm<=21?scheduleDivineCue(c,baseOut,seconds,duration,realm)
        :realm>=25?scheduleLateAudio(c,baseOut,seconds,duration,realm)
        :schedule===scheduleQiAudio?schedule(c,baseOut,seconds,duration,1,qiVariant(event).pitch)
        :schedule===scheduleTrucCoAudio?schedule(c,baseOut,seconds,duration,1,'mix',qiVariant(event).pitch)
        :schedule===scheduleKimDanAudio||schedule===scheduleNguyenAnhAudio?schedule(c,baseOut,seconds,duration)
        :schedule(c,baseOut,seconds,duration,1,event,revised);
      cues.push(cue);
    }
    const hit=IMPACT_LAYERS[realm];
    if(impact&&revised){
      const id='ritual:'+event.id;
      const delay=(LH_TIMING.impact/LH_TIMING.duration)*duration-seconds;
      if(this.cinematic.schedule(id,'void',delay,{priority:10,gain:this.ducked?.62:.9,enabled:cinematicLayers})){
        cues.push({stop:()=>this.cinematic.cancel(id)});
      }
    }
    if(impact&&hit&&!revised)cues.push(scheduleImpactLayers(c,output,{
      elapsed:seconds,at:hit[0],duration:hit[1],scale:duration/hit[1],
      pitch:qiVariant(event).pitch,root:hit[2],level:realm>=6?.53:.72
    }));
    if(enhancement)cues.push(scheduleRitualBoostLayer(c,enhancement.input,{
      realm,elapsed:seconds,duration,impactBody:!hit
    }));
    let stopping=false,disposed=false;
    const dispose=()=>{
      if(disposed)return;
      disposed=true;
      appearance?.stop();
      for(const cue of cues)cue?.stop();
      enhancement?.stop();
      output.disconnect();
    };
    const tail=setTimeout(dispose,Math.max(0,(duration-seconds+3.5)*1000));
    tail.unref?.();
    return {endAt:c.currentTime+Math.max(0,duration-seconds),stop(){
      if(stopping||disposed)return;
      stopping=true;clearTimeout(tail);
      const t=c.currentTime;
      output.gain.setTargetAtTime(.0001,t,.008);
      const timer=setTimeout(dispose,50);
      timer.unref?.();
    }};
  }
  // 07/11: biến thể âm thanh cho Phàm nhân → Kim Đan: to hơn (×1,25–1,7), đổi âm sắc, lệch cao độ, thêm 1 tiếng nhấn
  // ngẫu nhiên (chiêng / chuông / trống / khánh / sấm) đúng lúc nổ. Mỗi lần đột phá nghe khác nhau.
  ritualVariant(event,realm,elapsed=0,destination=this.fxBus){
    if(realm>3||!this.ctx)return null;const a=ritualAppearance(event)?.audio;if(!a)return null;
    const c=this.ctx,now=c.currentTime,input=c.createGain(),tone=c.createBiquadFilter?.(),out=c.createGain();
    input.gain.value=1;if(tone){tone.type=a.tone==='bright'?'highshelf':a.tone==='air'?'peaking':'lowshelf';tone.frequency.value=a.tone==='bright'?3200:a.tone==='air'?6500:a.tone==='deep'?140:320;if(tone.Q)tone.Q.value=.8;tone.gain.value=a.tone==='deep'?3:a.tone==='warm'?2:2.5;}
    out.gain.value=Math.min(1.18,.80+.22*a.gain);
    const chain=[input,tone,out].filter(Boolean);chain.forEach((n,i)=>i&&chain[i-1].connect(n));out.connect(destination);
    const at=now+(event.duration/1000)*(EARLY_IMPACT[realm]||.7)-elapsed/1000,f=[98,110,123.5,130.8,146.8][Math.abs(a.detune/100+2)%5]*2**(a.detune/1200),nodes=[];
    let timer=null,stopped=false;
    // Tiếng nhấn chỉ được lên lịch ~0,3 s trước lúc nổ, nên dừng sớm (tắt tiếng / cắt cảnh) thì không còn nguồn âm treo.
    const accent=at=>{const g=c.createGain();g.gain.value=.56+.16*a.gain;g.connect(destination);nodes.push(g);
      if(a.accent==='gong'){[1,1.48,2.02,2.74].forEach((r,i)=>this.note(f*r,at,3.6-i*.6,.11/(1+i*1.5),g,'sine'));this.note(f/2,at,2.2,.12,g,'triangle');}
      else if(a.accent==='bell')this.bell(f*4,at,.12,g);
      else if(a.accent==='chime'){for(let i=0;i<5;i++)this.note(f*[6,8,9,12,16][i],at+i*.07,1.6,.05,g,'sine');}
      else if(a.accent==='drum'){const o=c.createOscillator(),dg=c.createGain();o.frequency.setValueAtTime(130,at);o.frequency.exponentialRampToValueAtTime(42,at+.35);dg.gain.setValueAtTime(0,at);dg.gain.linearRampToValueAtTime(.42,at+.01);dg.gain.exponentialRampToValueAtTime(.0001,at+.7);o.connect(dg);dg.connect(g);o.start(at);o.stop(at+.75);this.note(f/2,at+.18,.6,.12,g,'sine');}
      else{const len=Math.ceil(c.sampleRate*2.2),b=c.createBuffer(1,len,c.sampleRate),d=b.getChannelData(0);let low=0;for(let i=0;i<len;i++){low=.92*low+.08*(Math.random()*2-1);d[i]=low*4*Math.exp(-i/len*4)*(i<c.sampleRate*.02?i/(c.sampleRate*.02):1);}const src=c.createBufferSource(),lp=c.createBiquadFilter(),tg=c.createGain();src.buffer=b;lp.type='lowpass';lp.frequency.value=900;tg.gain.value=.55;src.connect(lp);lp.connect(tg);tg.connect(g);src.start(at);}};
    if(at>now+.05){
      if(typeof c.startRendering==='function')accent(at);
      else timer=setTimeout(()=>{if(!stopped&&this.ctx===c&&c.currentTime<at+.08)accent(Math.max(c.currentTime+.015,at));},Math.max(0,(at-now-.3)*1000));
    }
    return {input,stop:()=>{stopped=true;clearTimeout(timer);const t=c.currentTime;out.gain.setTargetAtTime(0,t,.08);for(const n of nodes)n.gain.setTargetAtTime(0,t,.08);setTimeout(()=>{try{for(const n of chain)n.disconnect();for(const n of nodes)n.disconnect();}catch{}},900);}};
  }
  duck(on){this.ducked=on;this.duckUntil=on?Date.now()+20000:0;this.sync();}
  set(kind,value){this[kind]=Math.max(0,Math.min(1,Number(value)||0));this.sync();}
  note(f,at,duration=.8,gain=.06,bus=this.fxBus,kind='sine'){
    const c=this.ctx,o=c.createOscillator(),g=c.createGain();o.type=kind;o.frequency.value=f;o.connect(g);g.connect(bus);g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(gain,at+.025);g.gain.exponentialRampToValueAtTime(.0001,at+duration);o.start(at);o.stop(at+duration+.03);
  }
  bell(f,at,gain=.07,bus=this.fxBus){[1,2.71,4.1].forEach((ratio,i)=>this.note(f*ratio,at,2.7-i*.6,gain/(1+i*4),bus));}
  wind(at,duration=.5,gain=.07){const c=this.ctx;const b=c.createBuffer(1,Math.ceil(c.sampleRate*duration),c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.sin(i/d.length*Math.PI);const o=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();o.buffer=b;f.type='lowpass';f.frequency.setValueAtTime(1500,at);f.frequency.exponentialRampToValueAtTime(160,at+duration);g.gain.value=gain;o.connect(f);f.connect(g);g.connect(this.fxBus);o.start(at);}
  alchemy(kind,strength=1){
    if(!this.enabled||this.ctx?.state!=='running'||this.sfx<=0)return;const now=this.ctx.currentTime,key='alc:'+kind;if(now-(this.last[key]??-100)<(kind==='bubble'?.15:.2))return;this.last[key]=now;
    try{playAlchemySound(this.ctx,this.fxBus,kind,strength);}catch{}
  }
  feedback(kind,level=1){return playFeedbackAudio(this,kind,level);}
  cinematicCue(id,preset,delay=0,options={}){
    if(!this.enabled||this.ctx?.state!=='running'||this.sfx<=0)return;
    this.cinematic.schedule(id,preset,delay,{...options,gain:(options.gain??.82)*(this.ducked?.63:1)});
  }
  war(kind,side,strength=1){
    if(!this.enabled||this.ctx?.state!=='running'||this.sfx<=0)return;const now=this.ctx.currentTime,key='war:'+kind+':'+side;if(now-(this.last[key]??-100)<(kind==='clash'?.25:kind==='strike'?.12:.2))return;this.last[key]=now;
    try{playWarSound(this.ctx,this.fxBus,kind,side,strength);}catch{}
  }
  // 10/11: Hội Gõ Đầu — tối đa 3 chuỗi tiếng gõ trong 1 giây (đông người gõ cùng lúc không thành mớ ồn).
  bonk(kind,o={}){
    if(!this.enabled||this.ctx?.state!=='running'||this.sfx<=0)return;const now=this.ctx.currentTime;
    if(kind==='hit'){this.bonkTimes=(this.bonkTimes||[]).filter(x=>now-x<1);if(this.bonkTimes.length>=3)return;this.bonkTimes.push(now);}
    else if(now-(this.last['bonk:'+kind]??-100)<2)return;this.last['bonk:'+kind]=now;
    try{playBonkSound(this.ctx,this.fxBus,kind,o);}catch{}
  }
  combat(kind,variant){
    if(!this.enabled||this.ctx?.state!=='running'||this.sfx<=0)return;
    const now=this.ctx.currentTime,cd=kind==='cast'?.24:kind==='hit'?.32:.6,key='battle:'+kind;
    if(now-(this.last[key]??-100)<cd)return;
    this.battleVoices=(this.battleVoices||[]).filter(v=>v.until>now);
    const important=kind.startsWith('boss-');if(this.battleVoices.length>=(important?5:3))return;
    this.last[key]=now;const cue=scheduleBattleSound(this.ctx,this.fxBus,kind,kind==='cast'?combatVoice(variant):variant,this.ducked?.72:1);
    this.battleVoices.push({...cue,until:now+1.4});
  }
  voiceLoad(){
    const now=this.ctx?.currentTime??0;
    return {activeCues:this.voices.filter(until=>until>now).length,
      battleCues:(this.battleVoices||[]).filter(cue=>cue.until>now).length,ritual:!!this.qiSession,cinematicSources:this.cinematic?.sourceCount??0};
  }
  eventGift(kind,context){
    if(kind==='dragon'){this.play(kind,true);return;}
    const voices={race:'sword',duel:'sword',war:'sword',hallwar:'sword',hall:'sword',
      pet:'pet',alchemy:'alchemy-gift',maze:'maze-gift',tower:'tower-gift',
      visitor:'lotus',flower:'petal',bond:'petal',bonk:'lotus',honor:'victory'};
    this.play(voices[context]||kind,true);
  }
  play(type,priority=false){
    if(!this.enabled||this.ctx?.state!=='running'||this.sfx<=0)return;
    if(this.qiSession&&!priority&&['join','qi','petal','lotus','attack','breakthrough'].includes(type))return;
    const c=this.ctx,t=c.currentTime;
    const cooldown=['qi','petal','attack'].includes(type)?1.3:.25;if(t-(this.last[type]??-100)<cooldown)return;
    this.voices=this.voices.filter(v=>v>t);if(this.voices.length>=(priority?7:5))return;this.voices.push(t+1);this.last[type]=t;
    if(['breakthrough','dragon','victory','skin'].includes(type)){this.ambBus.gain.cancelScheduledValues(t);this.ambBus.gain.setTargetAtTime(this.ambient*.35,t,.08);this.ambBus.gain.setTargetAtTime(this.ambient,t+2,.8);}
    if(type==='impact'){this.wind(t,.65,.11);this.note(65.4,t,.65,.10);this.note(98,t+.06,.8,.06);this.bell(196,t+.12,.035);}
    else if(type==='ascension-charge'){this.wind(t,1.4,.065);[130.81,196,261.63,392].forEach((f,i)=>this.note(f,t+i*.23,1.5,.035));}
    else if(type==='ascension-echo'){this.wind(t,.8,.07);this.note(82.41,t,.9,.065);this.bell(293.66,t+.12,.03);}
    else if(type==='ascension-rush'){this.wind(t,.8,.07);this.note(146.83,t,.5,.045);this.note(293.66,t+.12,.6,.025);}
    else if(type==='ascension-screen-impact'){this.wind(t,.3,.095);this.note(55,t,.8,.08);this.note(82.41,t+.05,.65,.045);[1046.5,1568,2093].forEach((f,i)=>this.note(f,t+.05+i*.035,.16,.012,undefined,'triangle'));}
    else if(type==='qi-form'){this.note(261.63,t,1.5,.025);this.note(392,t+.2,1.4,.016);}
    else if(type==='qi-divide'){[523.25,659.25,783.99].forEach((f,i)=>this.note(f,t+i*.09,.8,.022));}
    else if(type==='qi-orbit'){this.wind(t,1.3,.022);[392,440,523.25].forEach((f,i)=>this.note(f,t+i*.3,1,.014));}
    else if(type==='qi-return'){this.note(523.25,t,.7,.02);this.note(392,t+.12,.8,.023);this.note(261.63,t+.26,1,.028);}
    else if(type==='qi-complete'){this.bell(392,t,.034);this.note(523.25,t+.15,1.3,.025);}
    else if(type==='qi'){this.note(261.63,t,1.4,.045);this.note(392,t+.14,1.4,.025);}
    else if(type==='alchemy-gift'){this.note(155.56,t,.54,.065,undefined,'triangle');this.wind(t+.04,.35,.035);this.bell(466.16,t+.13,.038);}
    else if(type==='maze-portal'){this.wind(t,.33,.056);this.note(246.94,t+.06,.62,.051);this.bell(739.99,t+.19,.043);}
    else if(type==='maze-gift'){this.note(329.63,t,.6,.04);this.note(220,t+.15,.9,.037);this.bell(659.25,t+.24,.025);}
    else if(type==='tower-clear'||type==='tower-milestone'){
      this.bell(196,t,.07);
      this.note(392,t+.12,.7,.038);
      if(type==='tower-milestone'){this.note(523.25,t+.25,1.05,.045);this.bell(783.99,t+.34,.034);}
    }
    else if(type==='tower-gift'){this.bell(196,t,.066);this.note(293.66,t+.12,.8,.04);this.note(440,t+.25,1.2,.027);}
    else if(type==='pet'){[523.25,659.25,783.99].forEach((f,i)=>this.note(f,t+i*.12,.9,.035));}
    else if(type==='petal'){this.note(523.25,t,.65,.035);this.note(659.25,t+.13,.8,.025);}
    else if(type==='attack'||type==='sword'){this.wind(t,.42,.09);this.note(type==='attack'?196:293.66,t+.08,.5,.04);}
    else if(type==='boss'){this.bell(130.81,t,.085);this.wind(t,.9,.05);}
    else if(type==='dragon'){this.wind(t,1.5,.08);[146.83,220,293.66,440].forEach((f,i)=>this.bell(f,t+i*.17,.045));}
    else if(type==='breakthrough'||type==='skin'){this.wind(t,.75,.06);[261.63,329.63,392,523.25,783.99].forEach((f,i)=>this.note(f,t+i*.14,1.9,.055));this.bell(196,t+.65,.055);}
    else if(type==='victory'){[261.63,329.63,392,523.25].forEach((f,i)=>this.note(f,t+i*.16,1.5,.06));}
    else{this.bell(type==='lotus'?220:293.66,t,.06);}
  }
  schedule(){if(!this.enabled){this.timer=null;return;}const t=this.ctx.currentTime;const steps=[0,7,12,7,4,2,7,4];const n=this.step||0;const f=220*2**(steps[n%steps.length]/12);this.note(f,t+.2,3.4,.032,this.ambBus);if(n%4===0)this.bell(146.83,t,.027,this.ambBus);this.step=n+1;this.timer=setTimeout(()=>this.schedule(),4500);}
  destroy(){this.cinematic?.clear();for(const cue of this.battleVoices||[])cue.stop();this.battleVoices=[];this.ritual(null);this.music?.pause();clearTimeout(this.timer);this.ctx?.close();this.enabled=false;}
}
