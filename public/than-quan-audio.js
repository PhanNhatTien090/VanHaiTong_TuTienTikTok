// Thần Quân v2 — Lôi Cổ Chấn Thiên: Fa thứ dồn dập, trống trận là chủ đạo, sấm gần/xa, tiếng gầm lôi long (tổng hợp giả tưởng).
// Sinh lại public/than-quan-audio.js bằng: node scripts/build-realm-audio.mjs than-quan
import {qiVariant} from './qi-impact.js';import {warmWave} from './warm-wave.js';
import {TQ16 as T} from './than-quan-awakening.js';
const score=[],add=(at,len,level,from,to=from,kind='sine',pan=0,transient=false,tag='')=>score.push({at,len,level,from,to,kind,pan,transient,tag});
const rnd=i=>{const v=Math.sin(i*91.7+12.3)*43758.5453;return v-Math.floor(v);};
function drum(at,f=1,pan=0){add(at,.6,.17*f,90,30,'sine',pan,true,'drum');add(at,.09,.045*f,1400,180,'crack',pan,true,'drum-skin');}
function strings(at,len,notes,f=.02){notes.forEach((hz,i)=>{for(const d of [.997,1.003])add(at,len,f/(1+i*.35),hz*d,hz*d,'strings',(i%2?1:-1)*.24,false,'strings');});}
function pluck(at,hz,f=.035,pan=0){add(at,.7,f,hz,hz*.99,'triangle',pan,true,'metal-pluck');add(at,.22,f*.25,hz*2.76,hz*2.7,'sine',pan,true,'metal-harmonic');}
function choir(at,len,notes,f=.03){notes.forEach((hz,i)=>{for(const d of [.995,1.005])add(at,len,f/(1+i*.3),hz*d,hz*d,'choir',(i%2?1:-1)*.3,false,'choir');});}
function brass(at,len,hz,f=.05,to=hz){add(at,len,f,hz,to,'brass',0,false,'brass');add(at,len,f*.6,hz*1.5,to*1.5,'brass',0,false,'brass-fifth');}
function sub(at,f=.2,from=70,to=26,len=1.4){add(at,len,f,from,to,'sine',0,true,'sub-boom');}
function bell(at,hz,f=.04,pan=0){for(const [r,v,len] of [[1,1,1.6],[2.76,.4,.9],[5.4,.15,.4]])add(at,len,f*v,hz*r,hz*r*.998,'sine',pan,true,'bell');}
function boom(at,f=1,pan=0,metal=220){sub(at,.2*f,72,24,1.2);drum(at,.9*f,pan);add(at,.12,.1*f,4800,600,'crack',pan,true,'boom-crack');bell(at+.01,metal,.03*f,pan);}
function gong(at,f=1,pan=0){sub(at,.22*f,55,26,2.2);add(at,2.6,.07*f,98,92,'triangle',pan,true,'gong');add(at,2.1,.04*f,207,200,'sine',pan,true,'gong-hum');add(at,1.4,.03*f,370,358,'sine',pan,true,'gong-shimmer');drum(at,1*f,pan);}
function heart(at,f=1){add(at,.32,.2*f,62,34,'sine',0,true,'heart-lub');add(at+.2,.28,.15*f,58,32,'sine',0,true,'heart-dub');add(at,.08,.035*f,900,200,'crack',0,true,'heart-skin');}
function glass(at,hz,pan=0,f=1){for(const [r,v,len] of [[1,1,1.2],[2.32,.5,.8],[4.1,.25,.5]])add(at,len,.025*f*v,hz*r,hz*r*1.002,'sine',pan,true,'glass');add(at,.06,.04*f,7000,3000,'crack',pan,true,'glass-tick');}
function rubble(at,pan=0,f=1){for(let i=0;i<6;i++)add(at+i*.07+rnd(i+at*7)*.04,.1,.03*f,1800+rnd(i+at)*1600,500,'crack',Math.max(-1,Math.min(1,pan+(rnd(i)-.5)*.4)),true,'rubble');}
function roar(at,f=1,pan=0){add(at,1.6,.08*f,170,80,'sawtooth',pan,true,'roar-body');add(at,1.4,.06*f,700,200,'wind',pan,true,'roar-breath');sub(at,.18*f,60,26,1.6);}
function bigDrum(at,f=1,pan=0){drum(at,1.2*f,pan);sub(at,.12*f,80,32,.8);add(at,.06,.05*f,2600,700,'crack',pan,true,'drum-slap');}
const F=[174.61,196,207.65,233.08,261.63,277.18,311.13,349.23,392,415.3,466.16];
add(.1,T.impact-.7,.03,43.65,43.65,'triangle',0,false,'pedal');add(.3,10,.035,140,420,'wind',0,false,'storm-wind');strings(2.6,6,[87.31,130.81,174.61],.017);strings(19.5,6,[87.31,130.81,174.61,261.63],.02);
T.storm.forEach((at,i)=>{add(at,2,.08,700,70,'thunder',[-.5,.5,0][i],true,'far-thunder');sub(at,.14,55,24,1.6);});
T.drums.forEach((at,i)=>{const pan=Math.cos(i/12*Math.PI*2)*.7;add(at,.35,.03,300,1400,'wind',pan,true,'drum-fall');bigDrum(at+.35,.6+i*.03,pan);});
T.strikes.forEach((at,i)=>{const pan=Math.cos(i/12*Math.PI*2)*.7;bigDrum(at,1+i*.04,pan);add(at,.12,.12,6000,900,'crack',pan,true,'strike-crack');add(at+.03,1,.07,1500,120,'thunder',pan,true,'strike-thunder');});
T.dragon.forEach((at,i)=>{roar(at,1.1+i*.15,(i-1)*.5);boom(at,1.6+i*.2,0,F[i]);});
T.grid.forEach((at,i)=>{add(at,.5,.06,2000,7000,'rise',(i%2?1:-1)*.5,true,'grid-zap');boom(at,1+i*.1,0,F[i+3]);});for(let i=0;i<24;i++)drum(19.5+i*.25,.4+i*.015,(i%2?1:-1)*.3);
T.bolts.forEach((at,i)=>{add(at,.14,.14,7000,800,'crack',(rnd(i)-.5)*.8,true,'bolt-crack');add(at+.02,1.2,.08,1200,90,'thunder',(rnd(i+2)-.5)*.8,true,'bolt-thunder');boom(at,1.4+i*.06,0,F[(i*2)%11]/2);});
T.collapse.forEach((at,i)=>{add(at-.4,.4,.05,2400,300,'wind',0,true,'drums-suck');boom(at,1.5+i*.3,0,F[i]/2);gong(at+.02,1+i*.2);});
add(T.impact-.85,.5,.05,2400,120,'wind',0,true,'light-suck');heart(T.impact-.55,.8);heart(T.impact-.27,1);
drum(T.impact,1.8);add(T.impact,.2,.13,7000,500,'crack',0,true,'release-crack');sub(T.impact,.32,90,20,3);gong(T.impact+.02,1.5);brass(T.impact,1.9,87.31,.08);
add(T.impact+.08,1.8,.07,1000,100,'thunder',-.35,true,'release-wave');add(T.impact+.2,1.7,.06,800,90,'thunder',.35,true,'release-wave');
strings(T.reveal,3.6,[43.65,87.31,130.81,174.61,220],.028);choir(T.reveal,3.4,[174.61,220,261.63,349.23],.036);brass(T.reveal+.2,2.2,87.31,.06);brass(T.reveal+1,1.6,130.81,.05);
for(let i=0;i<6;i++)bigDrum(T.reveal+.4+i*.35,.5-i*.05,(i%2?1:-1)*.4);
export const THAN_QUAN_SCORE=Object.freeze(score.sort((a,b)=>a.at-b.at).map(Object.freeze));
// Mức cue dành khoảng trống cho các lớp cộng trên bus nghi thức.
const LOUD=1.32;
const banks=new WeakMap();
function noise(c){if(banks.has(c))return banks.get(c);const b=c.createBuffer(1,c.sampleRate*3,c.sampleRate),d=b.getChannelData(0);let seed=71313,low=0;for(let i=0;i<d.length;i++){seed=(Math.imul(seed,1664525)+1013904223)|0;const w=seed/2147483648;low=.9*low+.1*w;d[i]=low*.9+w*.18;}banks.set(c,b);return b;}
export function thanQuanMusicDuck(ms){const t=ms/1000;return t<T.impact?.08:t<T.impact+2.2?.12:Math.min(1,.12+(t-T.impact-2.2)/1.6*.88);}
export function scheduleThanQuanAudio(c,destination,elapsed=0,duration=T.duration,strength=1,event={}){
 const now=c.currentTime,pitch=qiVariant(event).pitch,scale=duration/T.duration,bus=c.createGain(),nodes=[bus],sources=[];let stopped=false,echo=null;
 bus.gain.value=strength;bus.connect(destination);
 // Vang thung lũng: trễ dài, phản hồi vừa.
 if(c.createDelay){echo=c.createDelay(.6);const wet=c.createGain(),fb=c.createGain();echo.delayTime.value=.34;wet.gain.value=.16;fb.gain.value=.28;echo.connect(wet);wet.connect(bus);echo.connect(fb);fb.connect(echo);nodes.push(echo,wet,fb);}
 for(const cue of THAN_QUAN_SCORE){const at=cue.at*scale,len=cue.len*scale,trim=Math.max(0,elapsed-at),remain=Math.min(len-trim,duration+.8-Math.max(at,elapsed));if(remain<=0||cue.transient&&trim>.08)continue;
  const level=cue.level*LOUD*(cue.kind==='crack'?.6:1),start=now+Math.max(0,at-elapsed),noisy=['wind','thunder','crack','rise'].includes(cue.kind),source=noisy?c.createBufferSource():c.createOscillator(),g=c.createGain();let param;
  if(noisy){source.buffer=noise(c);source.loop=true;}else if((cue.kind==='strings'||cue.kind==='choir')&&c.createPeriodicWave)source.setPeriodicWave(warmWave(c));else source.type=['strings','choir','brass'].includes(cue.kind)?'sawtooth':cue.kind;
  if(noisy||['strings','choir','brass'].includes(cue.kind)){const filter=c.createBiquadFilter();filter.type=noisy||cue.kind==='choir'?'bandpass':'lowpass';if(filter.Q)filter.Q.value=cue.kind==='crack'?.9:cue.kind==='choir'?1.4:.55;source.connect(filter);filter.connect(g);nodes.push(filter);if(noisy)param=filter.frequency;else{filter.frequency.value=cue.kind==='choir'?760:cue.kind==='brass'?950:1300;param=source.frequency;}}else if(cue.kind==='sawtooth'){const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=900;if(lp.Q)lp.Q.value=.5;source.connect(lp);lp.connect(g);nodes.push(lp);param=source.frequency;}else{source.connect(g);param=source.frequency;}
  const pf=noisy?1:pitch;param.setValueAtTime(Math.max(25,Math.min(cue.kind==='crack'?4200:12000,(cue.from+(cue.to-cue.from)*trim/len)*pf)),start);param.exponentialRampToValueAtTime(Math.max(25,Math.min(cue.kind==='crack'?4200:12000,cue.to*pf)),start+remain);
  const attack=cue.kind==='choir'?.55:cue.kind==='brass'?.07:cue.kind==='strings'?.38:cue.kind==='rise'?remain*.7:cue.kind==='wind'?.1:cue.kind==='crack'?.007:.004;
  g.gain.setValueAtTime(.0001,start);g.gain.linearRampToValueAtTime(level,start+Math.min(attack,remain*.75));if(['strings','choir','brass'].includes(cue.kind)&&remain>.8)g.gain.linearRampToValueAtTime(level*.85,start+remain*.74);g.gain.exponentialRampToValueAtTime(.0001,start+remain);
  if(cue.pan&&c.createStereoPanner){const pan=c.createStereoPanner();pan.pan.value=cue.pan;g.connect(pan);pan.connect(bus);nodes.push(pan);}else g.connect(bus);
  if(echo&&cue.kind!=='thunder'&&cue.kind!=='crack')g.connect(echo);
  source.start(start);source.stop(start+remain+.025);sources.push(source);nodes.push(source,g);
 }
 // Nền chìm 120 ms ngay trước nổ.
 if(elapsed<(T.impact-.12)*scale){const at=now+(T.impact-.12)*scale-elapsed,hit=now+T.impact*scale-elapsed;bus.gain.setValueAtTime(strength,at);bus.gain.linearRampToValueAtTime(strength*.22,hit-.012);bus.gain.setValueAtTime(strength,hit);}
 const cleanup=()=>nodes.forEach(n=>{try{n.disconnect();}catch{}}),timer=setTimeout(cleanup,Math.max(0,(duration-elapsed+2)*1000));timer.unref?.();
 return {endAt:now+Math.max(0,duration-elapsed)+2,stop(){if(stopped)return;stopped=true;clearTimeout(timer);for(const source of sources)try{source.stop();}catch{}cleanup();}};
}
