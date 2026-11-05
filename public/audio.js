import {scheduleKimTienAudio,kimTienMusicDuck} from './kim-tien-audio.js';
import {scheduleHuyenTienAudio,huyenTienMusicDuck} from './huyen-tien-audio.js';
import {scheduleBattleSound,combatVoice} from './battle-audio.js';
import {scheduleDaiThuaAudio,daiThuaMusicDuck} from './dai-thua-audio.js';
import {scheduleChanTienAudio,chanTienMusicDuck} from './chan-tien-audio.js';
import {scheduleLuyenHuAudio,luyenHuMusicDuck} from './luyen-hu-audio.js';
import {scheduleHoaThanAudio,hoaThanMusicDuck} from './hoa-than-audio.js';
import {scheduleQiAudio} from './qi-audio.js';
import {qiVariant} from './qi-impact.js';
import {scheduleImpactLayers} from './impact-audio.js';
// 4/11/2026: lớp nổ chung chồng lên cue gốc: [giây nổ, thời lượng cue, nốt gốc]
const IMPACT_LAYERS={3:[9.4,11.8,174.6],4:[10.75,14.4,146.8],5:[14.4,17.6,110]};
import {scheduleTrucCoAudio,trucCoMusicDuck} from './truc-co-audio.js';
import {scheduleKimDanAudio,kimDanMusicDuck} from './kim-dan-audio.js';
import {scheduleNguyenAnhAudio,nguyenAnhMusicDuck} from './nguyen-anh-audio.js';
import {breakthroughRealm} from './breakthrough-fx.js';
// Original procedural audio: no external samples, music service, or credentials.
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
      if(!this.music){this.music=new Audio('/assets/bgm-theme-c.mp3');this.music.loop=true;this.music.preload='auto';}
      this.sync();let musicTimer;try{await Promise.race([this.music.play(),new Promise((_,reject)=>{musicTimer=setTimeout(()=>reject(Error('Nhạc nền chưa phát được. Bấm thử âm lại.')),4000);})]);}catch(err){this.enabled=false;this.music.pause();await this.ctx.suspend();throw err;}finally{clearTimeout(musicTimer);}
    }else if(!this.timer)this.schedule();
  }
  init(){const C=globalThis.AudioContext||globalThis.webkitAudioContext;this.ctx=new C();const c=this.ctx;
    this.master=c.createGain();this.ambBus=c.createGain();this.fxBus=c.createGain();this.limiter=c.createDynamicsCompressor();
    this.limiter.threshold.value=-14;this.limiter.knee.value=12;this.limiter.ratio.value=4;this.limiter.attack.value=.01;this.limiter.release.value=.4;
    this.ambBus.connect(this.master);this.fxBus.connect(this.master);this.master.connect(this.limiter);this.limiter.connect(c.destination);
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
    const realm=breakthroughRealm(event),duck=realm===10?kimTienMusicDuck(elapsed):realm===9?huyenTienMusicDuck(elapsed):realm===8?chanTienMusicDuck(elapsed):realm===7?daiThuaMusicDuck(elapsed):realm===6?luyenHuMusicDuck(elapsed):realm===5?hoaThanMusicDuck(elapsed):realm===4?nguyenAnhMusicDuck(elapsed):realm===3?kimDanMusicDuck(elapsed):realm===2?trucCoMusicDuck(elapsed):.22;
    if(this.qiSession?.event===event){if(Math.abs((this.qiSession.duck??.22)-duck)>.008){this.qiSession.duck=duck;this.sync();}return;}
    this.qiSession?.audio.stop();
    const schedule=realm===10?scheduleKimTienAudio:realm===9?scheduleHuyenTienAudio:realm===8?scheduleChanTienAudio:realm===7?scheduleDaiThuaAudio:realm===6?scheduleLuyenHuAudio:realm===5?scheduleHoaThanAudio:realm===4?scheduleNguyenAnhAudio:realm===3?scheduleKimDanAudio:realm===2?scheduleTrucCoAudio:scheduleQiAudio;
    const baseCue=(schedule===scheduleHuyenTienAudio||schedule===scheduleKimTienAudio)?schedule(this.ctx,this.fxBus,elapsed/1000,event.duration/1000,1,event):schedule===scheduleQiAudio?schedule(this.ctx,this.fxBus,elapsed/1000,event.duration/1000,1,qiVariant(event).pitch):schedule===scheduleTrucCoAudio?schedule(this.ctx,this.fxBus,elapsed/1000,event.duration/1000,1,'mix',qiVariant(event).pitch):schedule(this.ctx,this.fxBus,elapsed/1000,event.duration/1000);const hit=IMPACT_LAYERS[realm],extra=hit?scheduleImpactLayers(this.ctx,this.fxBus,{elapsed:elapsed/1000,at:hit[0],duration:hit[1],scale:(event.duration/1000)/hit[1],pitch:qiVariant(event).pitch,root:hit[2]}):null;this.qiSession={event,duck,audio:extra?{stop(){baseCue.stop();extra.stop();},endAt:Math.max(baseCue.endAt||0,extra.endAt||0)}:baseCue};this.sync();
  }
  duck(on){this.ducked=on;this.sync();}
  set(kind,value){this[kind]=Math.max(0,Math.min(1,Number(value)||0));this.sync();}
  note(f,at,duration=.8,gain=.06,bus=this.fxBus,kind='sine'){
    const c=this.ctx,o=c.createOscillator(),g=c.createGain();o.type=kind;o.frequency.value=f;o.connect(g);g.connect(bus);g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(gain,at+.025);g.gain.exponentialRampToValueAtTime(.0001,at+duration);o.start(at);o.stop(at+duration+.03);
  }
  bell(f,at,gain=.07,bus=this.fxBus){[1,2.71,4.1].forEach((ratio,i)=>this.note(f*ratio,at,2.7-i*.6,gain/(1+i*4),bus));}
  wind(at,duration=.5,gain=.07){const c=this.ctx;const b=c.createBuffer(1,Math.ceil(c.sampleRate*duration),c.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.sin(i/d.length*Math.PI);const o=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();o.buffer=b;f.type='lowpass';f.frequency.setValueAtTime(1500,at);f.frequency.exponentialRampToValueAtTime(160,at+duration);g.gain.value=gain;o.connect(f);f.connect(g);g.connect(this.fxBus);o.start(at);}
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
