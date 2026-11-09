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
import {scheduleTienDeAudio,tienDeMusicDuck} from './tien-de-audio.js';import {scheduleMaThanAudio,maThanMusicDuck} from './ma-than-audio.js';import {scheduleThienMaAudio,thienMaMusicDuck} from './thien-ma-audio.js';import {scheduleDietTheAudio,dietTheMusicDuck} from './diet-the-audio.js';
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
import {breakthroughRealm} from './breakthrough-fx.js';
// Original procedural audio: no external samples, music service, or credentials.
// 08/11: bo đỉnh mềm cuối chuỗi — dưới 0,8 giữ nguyên, trên đó uốn dần tới 0,98: không bao giờ cắt cứng (tiếng rẹt).
export function softClipCurve(n=4096){const a=new Float32Array(n);for(let i=0;i<n;i++){const x=i/(n-1)*2-1,m=Math.abs(x);a[i]=Math.sign(x)*(m<=.8?m:.8+.18*Math.tanh((m-.8)/.18));}return a;}
function softClipper(c){if(!c.createWaveShaper)return c.createGain();const w=c.createWaveShaper();w.curve=softClipCurve();w.oversample='4x';return w;}
// 08/11 tối: 3 bản nhạc nền tu tiên, chuẩn hóa -19 LUFS (to hơn bản cũ -23 LUFS ~4 dB). Nguồn + giấy phép: public/assets/AUDIO.md.
export const BGM_TRACKS=Object.freeze(['/assets/bgm-tu-tien-1.mp3','/assets/bgm-tu-tien-2.mp3','/assets/bgm-tu-tien-3.mp3']);
export class CultivationAudio {
  constructor(){this.enabled=false;this.ctx=null;this.volume=.3;this.ambient=.45;this.sfx=.75;this.voices=[];this.last={};this.timer=null;this.drone=[];this.ducked=false;this.music=null;}
  async enable(on){
    if(!on){for(const cue of this.battleVoices||[])cue.stop();this.battleVoices=[];this.ritual(null);this.enabled=false;clearTimeout(this.timer);this.timer=null;this.music?.pause();if(this.ctx)await this.ctx.suspend();return;}
    if(!this.ctx)this.init();
    const resume=this.ctx.resume();let timer;
    try{await Promise.race([resume,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Bấm nút âm thanh để cho phép phát.')),1500);})]);}finally{clearTimeout(timer);}
    if(this.ctx.state!=='running')throw Error('Âm thanh đang bị chặn.');
    this.enabled=true;this.sync();
    if(typeof Audio!=='undefined'){
      if(!this.music){this.track=Math.floor(Math.random()*BGM_TRACKS.length);this.music=new Audio(BGM_TRACKS[this.track]);this.music.loop=false;this.music.preload='auto';this.music.onended=()=>this.nextTrack();}
      this.sync();let musicTimer;try{await Promise.race([this.music.play(),new Promise((_,reject)=>{musicTimer=setTimeout(()=>reject(Error('Nhạc nền chưa phát được. Bấm thử âm lại.')),4000);})]);}catch(err){this.enabled=false;this.music.pause();await this.ctx.suspend();throw err;}finally{clearTimeout(musicTimer);}
    }else if(!this.timer)this.schedule();
  }
  // 08/11 tối: hết bài thì sang bài kế (vòng lặp danh sách).
  nextTrack(){if(!this.music)return;this.track=((this.track||0)+1)%BGM_TRACKS.length;this.music.src=BGM_TRACKS[this.track];this.sync();if(this.enabled)this.music.play()?.catch?.(()=>{});}
  init(){const C=globalThis.AudioContext||globalThis.webkitAudioContext;this.ctx=new C();const c=this.ctx;
    this.master=c.createGain();this.ambBus=c.createGain();this.fxBus=c.createGain();this.limiter=c.createDynamicsCompressor();
    this.limiter.threshold.value=-14;this.limiter.knee.value=12;this.limiter.ratio.value=4;this.limiter.attack.value=.01;this.limiter.release.value=.4;
    // 08/11: chống rè — chỉ còn 1 tầng nén chung (các màn đột phá bỏ nén riêng) + trần an toàn chỉ chạm ở đỉnh hiếm.
    this.ceiling=c.createDynamicsCompressor();this.ceiling.threshold.value=-1.5;this.ceiling.knee.value=1;this.ceiling.ratio.value=20;this.ceiling.attack.value=.002;this.ceiling.release.value=.15;
    this.ambBus.connect(this.master);this.fxBus.connect(this.master);this.master.connect(this.limiter);this.limiter.connect(this.ceiling);this.softClip=softClipper(c);this.ceiling.connect(this.softClip);this.softClip.connect(c.destination);
    // A quiet fifth drone with a slow breath envelope, kept below event sounds.
    for(const f of (typeof Audio==='undefined'?[110,164.81,220]:[])){const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.value=f;g.gain.value=.018;o.connect(g);g.connect(this.ambBus);o.start();this.drone.push({o,g});}
    const lfo=c.createOscillator(),depth=c.createGain();lfo.frequency.value=.095;depth.gain.value=.008;lfo.connect(depth);for(const {g}of this.drone)depth.connect(g.gain);lfo.start();
    // Filtered wind, with no bright sustained hiss.
    const buf=c.createBuffer(1,c.sampleRate*4,c.sampleRate),d=buf.getChannelData(0);let low=0;for(let i=0;i<d.length;i++){low=.985*low+.015*(Math.random()*2-1);d[i]=low;}
    const noise=c.createBufferSource();noise.buffer=buf;noise.loop=true;const filter=c.createBiquadFilter(),gain=c.createGain();filter.type='lowpass';filter.frequency.value=650;gain.gain.value=typeof Audio==='undefined'?.14:.025;noise.connect(filter);filter.connect(gain);gain.connect(this.ambBus);noise.start();this.sync();
  }
  sync(){if(this.music)this.music.volume=this.volume*this.ambient*Math.min(this.ducked?.28:1,this.qiSession?(this.qiSession.duck??.22):1);if(!this.ctx)return;const t=this.ctx.currentTime;this.master.gain.setTargetAtTime(this.volume,t,.08);this.ambBus.gain.setTargetAtTime(this.ambient,t,.3);this.fxBus.gain.setTargetAtTime(this.sfx,t,.08);}
  ritual(event,elapsed=0){
    if(!event||!this.enabled||this.ctx?.state!=='running'){
      if(this.qiSession){this.qiSession.audio.stop();this.qiSession=null;this.sync();}return;
    }
    const realm=breakthroughRealm(event),duck=realm===24?dietTheMusicDuck(elapsed):realm===23?thienMaMusicDuck(elapsed):realm===22?maThanMusicDuck(elapsed):realm===13?tienDeMusicDuck(elapsed):realm===12?daiLaMusicDuck(elapsed):realm===11?thaiAtMusicDuck(elapsed):realm===10?kimTienMusicDuck(elapsed):realm===9?huyenTienMusicDuck(elapsed):realm===8?chanTienMusicDuck(elapsed):realm===7?daiThuaMusicDuck(elapsed):realm===6?luyenHuMusicDuck(elapsed):realm===5?hoaThanMusicDuck(elapsed):realm===4?nguyenAnhMusicDuck(elapsed):realm===3?kimDanMusicDuck(elapsed):realm===2?trucCoMusicDuck(elapsed):.22;
    if(this.qiSession?.event===event){if(Math.abs((this.qiSession.duck??.22)-duck)>.008){this.qiSession.duck=duck;this.sync();}return;}
    this.qiSession?.audio.stop();
    const variant=this.ritualVariant(event,realm,elapsed),boost=realm>=6?createRitualBoostBus(this.ctx,this.fxBus,realm):null,out=variant?.input||boost?.input||this.fxBus;
    const schedule=realm===24?scheduleDietTheAudio:realm===23?scheduleThienMaAudio:realm===22?scheduleMaThanAudio:realm===13?scheduleTienDeAudio:realm===12?scheduleDaiLaAudio:realm===11?scheduleThaiAtAudio:realm===10?scheduleKimTienAudio:realm===9?scheduleHuyenTienAudio:realm===8?scheduleChanTienAudio:realm===7?scheduleDaiThuaAudio:realm===6?scheduleLuyenHuAudio:realm===5?scheduleHoaThanAudio:realm===4?scheduleNguyenAnhAudio:realm===3?scheduleKimDanAudio:realm===2?scheduleTrucCoAudio:scheduleQiAudio;
    const baseCue=(schedule===scheduleHuyenTienAudio||schedule===scheduleKimTienAudio||schedule===scheduleHoaThanAudio||schedule===scheduleLuyenHuAudio||schedule===scheduleDaiThuaAudio||schedule===scheduleChanTienAudio||schedule===scheduleThaiAtAudio||schedule===scheduleDaiLaAudio||schedule===scheduleTienDeAudio||schedule===scheduleMaThanAudio||schedule===scheduleThienMaAudio||schedule===scheduleDietTheAudio)?schedule(this.ctx,out,elapsed/1000,event.duration/1000,1,event):schedule===scheduleQiAudio?schedule(this.ctx,out,elapsed/1000,event.duration/1000,1,qiVariant(event).pitch):schedule===scheduleTrucCoAudio?schedule(this.ctx,out,elapsed/1000,event.duration/1000,1,'mix',qiVariant(event).pitch):schedule(this.ctx,out,elapsed/1000,event.duration/1000);const hit=IMPACT_LAYERS[realm],extra=hit?scheduleImpactLayers(this.ctx,out,{elapsed:elapsed/1000,at:hit[0],duration:hit[1],scale:(event.duration/1000)/hit[1],pitch:qiVariant(event).pitch,root:hit[2]}):null;const layer=boost?scheduleRitualBoostLayer(this.ctx,out,{realm,elapsed:elapsed/1000,duration:event.duration/1000}):null;const cue0=extra?{stop(){baseCue.stop();extra.stop();},endAt:Math.max(baseCue.endAt||0,extra.endAt||0)}:baseCue;const cue=boost?{stop(){cue0.stop();layer?.stop();boost.stop();},endAt:Math.max(cue0.endAt||0,layer?.endAt||0)}:cue0;this.qiSession={event,duck,audio:variant?{stop(){cue.stop();variant.stop();},endAt:cue.endAt}:cue};this.sync();
  }
  // 07/11: biến thể âm thanh cho Phàm nhân → Kim Đan: to hơn (×1,25–1,7), đổi âm sắc, lệch cao độ, thêm 1 tiếng nhấn
  // ngẫu nhiên (chiêng / chuông / trống / khánh / sấm) đúng lúc nổ. Mỗi lần đột phá nghe khác nhau.
  ritualVariant(event,realm,elapsed=0){
    if(realm>3||!this.ctx)return null;const a=ritualAppearance(event)?.audio;if(!a)return null;
    const c=this.ctx,now=c.currentTime,input=c.createGain(),tone=c.createBiquadFilter?.(),out=c.createGain(),comp=c.createDynamicsCompressor?.();
    input.gain.value=1;if(tone){tone.type=a.tone==='bright'?'highshelf':a.tone==='air'?'peaking':'lowshelf';tone.frequency.value=a.tone==='bright'?3200:a.tone==='air'?6500:a.tone==='deep'?140:320;if(tone.Q)tone.Q.value=.8;tone.gain.value=a.tone==='deep'?7:a.tone==='warm'?4:5;}
    if(comp){comp.threshold.value=-14;comp.knee.value=8;comp.ratio.value=3;comp.attack.value=.004;comp.release.value=.25;}out.gain.value=a.gain;
    const chain=[input,tone,comp,out].filter(Boolean);chain.forEach((n,i)=>i&&chain[i-1].connect(n));out.connect(this.fxBus);
    const at=now+(event.duration/1000)*(EARLY_IMPACT[realm]||.7)-elapsed/1000,f=[98,110,123.5,130.8,146.8][Math.abs(a.detune/100+2)%5]*2**(a.detune/1200),nodes=[];
    let timer=null,stopped=false;
    // Tiếng nhấn chỉ được lên lịch ~0,3 s trước lúc nổ, nên dừng sớm (tắt tiếng / cắt cảnh) thì không còn nguồn âm treo.
    const accent=at=>{const g=c.createGain();g.gain.value=a.gain*.9;g.connect(this.fxBus);nodes.push(g);
      if(a.accent==='gong'){[1,1.48,2.02,2.74].forEach((r,i)=>this.note(f*r,at,3.6-i*.6,.11/(1+i*1.5),g,'sine'));this.note(f/2,at,2.2,.12,g,'triangle');}
      else if(a.accent==='bell')this.bell(f*4,at,.12,g);
      else if(a.accent==='chime'){for(let i=0;i<5;i++)this.note(f*[6,8,9,12,16][i],at+i*.07,1.6,.05,g,'sine');}
      else if(a.accent==='drum'){const o=c.createOscillator(),dg=c.createGain();o.frequency.setValueAtTime(130,at);o.frequency.exponentialRampToValueAtTime(42,at+.35);dg.gain.setValueAtTime(0,at);dg.gain.linearRampToValueAtTime(.42,at+.01);dg.gain.exponentialRampToValueAtTime(.0001,at+.7);o.connect(dg);dg.connect(g);o.start(at);o.stop(at+.75);this.note(f/2,at+.18,.6,.12,g,'sine');}
      else{const len=Math.ceil(c.sampleRate*2.2),b=c.createBuffer(1,len,c.sampleRate),d=b.getChannelData(0);let low=0;for(let i=0;i<len;i++){low=.92*low+.08*(Math.random()*2-1);d[i]=low*4*Math.exp(-i/len*4)*(i<c.sampleRate*.02?i/(c.sampleRate*.02):1);}const src=c.createBufferSource(),lp=c.createBiquadFilter(),tg=c.createGain();src.buffer=b;lp.type='lowpass';lp.frequency.value=900;tg.gain.value=.55;src.connect(lp);lp.connect(tg);tg.connect(g);src.start(at);}};
    if(at>now+.05)timer=setTimeout(()=>{if(!stopped&&this.ctx===c)accent(Math.max(c.currentTime+.02,c.currentTime+.3));},Math.max(0,(at-now-.3)*1000));
    return {input,stop:()=>{stopped=true;clearTimeout(timer);const t=c.currentTime;out.gain.setTargetAtTime(0,t,.08);for(const n of nodes)n.gain.setTargetAtTime(0,t,.08);setTimeout(()=>{try{input.disconnect();out.disconnect();for(const n of nodes)n.disconnect();}catch{}},900);}};
  }
  duck(on){this.ducked=on;this.sync();}
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
  war(kind,side,strength=1){
    if(!this.enabled||this.ctx?.state!=='running'||this.sfx<=0)return;const now=this.ctx.currentTime,key='war:'+kind+':'+side;if(now-(this.last[key]??-100)<(kind==='clash'?.25:kind==='strike'?.12:.2))return;this.last[key]=now;
    try{playWarSound(this.ctx,this.fxBus,kind,side,strength);}catch{}
  }
  combat(kind,variant){
    if(!this.enabled||this.ctx?.state!=='running'||this.sfx<=0)return;
    const now=this.ctx.currentTime,cd=kind==='cast'?.24:kind==='hit'?.32:.6,key='battle:'+kind;
    if(now-(this.last[key]??-100)<cd)return;
    this.battleVoices=(this.battleVoices||[]).filter(v=>v.until>now);
    const important=kind.startsWith('boss-');if(this.battleVoices.length>=(important?5:3))return;
    this.last[key]=now;const cue=scheduleBattleSound(this.ctx,this.fxBus,kind,kind==='cast'?combatVoice(variant):variant,this.ducked?.48:1);
    this.battleVoices.push({...cue,until:now+1.4});
  }
  play(type){if(!this.enabled||!this.ctx)return;const c=this.ctx,t=c.currentTime;
    const cooldown=['qi','petal','attack'].includes(type)?1.3:.25;if(t-(this.last[type]??-100)<cooldown)return;
    this.voices=this.voices.filter(v=>v>t);if(this.voices.length>=6)return;this.voices.push(t+1);this.last[type]=t;
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
  destroy(){for(const cue of this.battleVoices||[])cue.stop();this.battleVoices=[];this.ritual(null);this.music?.pause();clearTimeout(this.timer);this.ctx?.close();this.enabled=false;}
}
