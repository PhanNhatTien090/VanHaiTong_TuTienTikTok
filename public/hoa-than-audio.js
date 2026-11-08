import {qiVariant} from './qi-impact.js';
import {HT_TIMING as T,HT_STRIKES} from './hoa-than-formation.js';
// Original B-minor ritual motif resolving into D major. Synthetic thunder, strings and bronze.
const score=[],add=(at,len,level,from,to=from,kind='sine',pan=0,transient=false,tag='')=>score.push({at,len,level,from,to,kind,pan,transient,tag});
function drum(at,f=1,pan=0){add(at,.62,.18*f,125,38,'sine',pan,true,'drum');add(at,.095,.05*f,1800,220,'crack',pan,true,'drum-skin');}
function bell(at,root,f=1,pan=0){for(const [r,v,len]of [[1,.045,1.8],[2.76,.019,1.15],[4.1,.008,.6]])add(at,len,v*f,root*r,root*r*.998,'sine',pan,true,'seal-bell');}
function strings(at,len,notes,f=.02){notes.forEach((hz,i)=>{for(const d of [.997,1.003])add(at,len,f/(1+i*.35),hz*d,hz*d,'strings',(i%2?1:-1)*.24,false,'strings');});}
function pluck(at,hz,f=.04,pan=0){add(at,.85,f,hz,hz*.994,'triangle',pan,true,'zither');add(at,.25,f*.18,hz*3,hz*2.98,'sine',pan,true,'zither-harmonic');}
function thunder(at,f=1,pan=0){add(at,.075,.13*f,4200,600,'crack',pan,true,'lightning-crack');add(at+.075,1.1,.09*f,340,65,'thunder',pan,true,'thunder-roll');drum(at+.02,f*.7,pan);}
add(.015,1.1,.045,260,1200,'wind',-.3,false,'opening-wind');thunder(T.opening,1.05);
add(.3,3.7,.035,61.74,61.74,'triangle',0,false,'pedal');strings(.5,3.6,[123.47,146.83,185],.013);
const motif=[246.94,293.66,369.99,440,369.99,293.66,246.94,220];
for(let i=0;i<24;i++){const at=.65+i*.43;if(at>10.4)break;pluck(at,motif[i%8],i<8?.027:.034,(i%2?1:-1)*.3);if(i%4===0)drum(at,.38);}
add(2,2.4,.043,300,1800,'wind',.2,false,'soul-ascent');bell(2.03,246.94,.6);
for(let i=0;i<6;i++){const at=4.4+i*.32,pan=(i%2?1:-1)*.65;add(at,.12,.05,1450,230,'crack',pan,true,'seal-opening');bell(at+.055,[246.94,293.66,369.99,440,493.88,587.33][i],.9,pan);}
strings(4.4,3.1,[123.47,185,246.94],.018);add(4.4,3,.035,61.74,61.74,'triangle',0,false,'six-seal-pedal');
for(const [i,at]of HT_STRIKES.entries()){thunder(at,.7+i*.065,(i%2?1:-1)*.55);bell(at+.09,123.47*2**(i/12),.45,(i%2?1:-1)*.3);}
for(let i=0;i<3;i++)drum(10.6+i*.39,.65+i*.15);
strings(10.5,2.4,[146.83,185,220,293.66],.029);add(10.5,2.2,.055,73.42,73.42,'triangle',0,false,'authority-low');
for(let i=0;i<6;i++)pluck(10.65+i*.28,[293.66,369.99,440,587.33,739.99,880][i],.035,(i%2?1:-1)*.3);
for(let i=0;i<6;i++){const at=12.8+i*.09;add(at,.5,.045,2400,280,'wind',(i%2?1:-1)*.5,true,'seal-recall');bell(at+.42,369.99-i*12,.38);}
for(const [i,at]of [12.6,13.04,13.4,13.7,13.94,14.13].entries())drum(at,.35+i*.065);
add(13.1,1.25,.07,180,2200,'rise',0,false,'compression-riser');add(13.75,.5,.052,1600,130,'wind',0,false,'inhalation');
// Shared impact-audio adds bass/gong; these layers supply the fracture and lateral sea wave.
drum(T.impact,1.65);bell(T.impact+.015,73.42,1.4);
add(T.impact,.14,.16,4800,500,'crack',0,true,'release-crack');add(T.impact+.13,1.35,.075,850,120,'thunder',-.35,true,'release-wave');add(T.impact+.24,1.25,.06,700,95,'thunder',.35,true,'release-wave');
strings(T.reveal,2.85,[146.83,185,220,329.63],.028);add(T.reveal,2.65,.045,73.42,73.42,'triangle',0,false,'reveal-pedal');
for(const [i,hz]of [587.33,739.99,880,1174.66,987.77,880].entries())pluck(14.82+i*.31,hz,.041-i*.003,(i%2?1:-1)*.3);
bell(16.75,293.66,.7);add(16.3,1.3,.023,650,160,'wind',0,false,'release-breath');
export const HOA_THAN_SCORE=Object.freeze(score.sort((a,b)=>a.at-b.at).map(Object.freeze));
const banks=new WeakMap();
function noise(c){if(banks.has(c))return banks.get(c);const b=c.createBuffer(1,c.sampleRate*3,c.sampleRate),d=b.getChannelData(0);let seed=18716,low=0;for(let i=0;i<d.length;i++){seed=(Math.imul(seed,1664525)+1013904223)|0;const w=seed/2147483648;low=.9*low+.1*w;d[i]=low*.9+w*.18;}banks.set(c,b);return b;}
export function hoaThanMusicDuck(ms){const t=ms/1000;return t<12.8?.19:t<14.4?.075:t<16.2?.12:Math.min(1,.12+(t-16.2)/1.4*.88);}
export function scheduleHoaThanAudio(c,destination,elapsed=0,duration=T.duration,strength=1,event={}){
 const now=c.currentTime,pitch=qiVariant(event).pitch,scale=duration/T.duration,bus=c.createGain(),limiter=c.createDynamicsCompressor(),nodes=[bus,limiter],sources=[];let stopped=false,echo=null;
 bus.gain.value=strength;limiter.threshold.value=-10;limiter.knee.value=8;limiter.ratio.value=1;limiter.attack.value=.003;limiter.release.value=.22;bus.connect(limiter);limiter.connect(destination);
 if(c.createDelay){echo=c.createDelay(.4);const wet=c.createGain();echo.delayTime.value=.137;wet.gain.value=.14;echo.connect(wet);wet.connect(bus);nodes.push(echo,wet);}
 for(const cue of HOA_THAN_SCORE){const at=cue.at*scale,len=cue.len*scale,trim=Math.max(0,elapsed-at),remain=Math.min(len-trim,duration+.8-Math.max(at,elapsed));if(remain<=0||cue.transient&&trim>.08)continue;
  const start=now+Math.max(0,at-elapsed),noisy=['wind','thunder','crack','rise'].includes(cue.kind),source=noisy?c.createBufferSource():c.createOscillator(),g=c.createGain();let param;
  if(noisy){source.buffer=noise(c);source.loop=true;}else source.type=cue.kind==='strings'?'sawtooth':cue.kind;
  if(noisy||cue.kind==='strings'){const filter=c.createBiquadFilter();filter.type=noisy?'bandpass':'lowpass';if(filter.Q)filter.Q.value=cue.kind==='crack'?.9:.55;source.connect(filter);filter.connect(g);nodes.push(filter);if(noisy)param=filter.frequency;else{filter.frequency.value=1350;param=source.frequency;}}else{source.connect(g);param=source.frequency;}
  const pf=noisy?1:pitch;param.setValueAtTime(Math.max(25,Math.min(12000,(cue.from+(cue.to-cue.from)*trim/len)*pf)),start);param.exponentialRampToValueAtTime(Math.max(25,cue.to*pf),start+remain);
  const attack=cue.kind==='strings'?.38:cue.kind==='rise'?remain*.7:cue.kind==='wind'?.12:.004;
  g.gain.setValueAtTime(.0001,start);g.gain.linearRampToValueAtTime(cue.level,start+Math.min(attack,remain*.75));if(cue.kind==='strings'&&remain>.8)g.gain.linearRampToValueAtTime(cue.level*.85,start+remain*.74);g.gain.exponentialRampToValueAtTime(.0001,start+remain);
  if(cue.pan&&c.createStereoPanner){const pan=c.createStereoPanner();pan.pan.value=cue.pan;g.connect(pan);pan.connect(bus);nodes.push(pan);}else g.connect(bus);
  if(echo&&cue.kind!=='thunder'&&cue.kind!=='crack')g.connect(echo);
  source.start(start);source.stop(start+remain+.025);sources.push(source);nodes.push(source,g);
 }
 if(elapsed<14.28*scale){const at=now+14.28*scale-elapsed,hit=now+14.4*scale-elapsed;bus.gain.setValueAtTime(strength,at);bus.gain.linearRampToValueAtTime(strength*.22,hit-.012);bus.gain.setValueAtTime(strength,hit);}
 const cleanup=()=>nodes.forEach(n=>{try{n.disconnect();}catch{}}),timer=setTimeout(cleanup,Math.max(0,(duration-elapsed+1.4)*1000));timer.unref?.();
 return {endAt:now+Math.max(0,duration-elapsed)+1.4,stop(){if(stopped)return;stopped=true;clearTimeout(timer);for(const source of sources)try{source.stop();}catch{}cleanup();}};
}
