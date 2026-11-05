import {qiVariant} from './qi-impact.js';
import {KIM_TIEN_TIMELINE as T,KIM_TRIALS} from './kim-tien-timeline.js';
// New score and material model: copper/stone/fire, in F minor resolving to F major.
const score=[],add=(at,len,f,end,vol,kind='sine',pan=0,transient=false)=>score.push([at,len,f,end,vol,kind,pan,transient]);
function drum(at,force=1){add(at,.48,105,32,.22*force,'sine',0,true);add(at,.12,800,95,.075*force,'crack',0,true);}
function copper(at,root=174.61,force=1,pan=0){for(const [ratio,vol,len]of [[1,.075,1.1],[2.76,.033,.6],[5.4,.012,.24]])add(at,len,root*ratio,root*ratio*.985,vol*force,'sine',pan,true);add(at,.11,2300,600,.045*force,'crack',pan,true);}
add(.01,1.3,100,600,.08,'wind');drum(.12,1.1);add(.14,.65,1500,120,.11,'crack',0,true);
for(let i=0;i<8;i++){const at=1.25+i*.105;add(at,.22,300,1900,.065,'wind',(i%2?1:-1)*.6,true);copper(at+.12,155.56+i*3,.6,(i%2?1:-1)*.4);}
for(let i=0;i<8;i++){const at=4.2+i*.07;copper(at,130.81+i*5,.9,(i%2?1:-1)*.45);}
add(4.6,6.8,1200,180,.075,'fire');
for(const [i,at]of KIM_TRIALS.entries()){drum(at,1.35);copper(at+.015,87.31,1.5);add(at,.18,5200,500,.12,'crack',i%2?.4:-.4,true);add(at+.05,.85,850,80,.11,'fire',0,true);}
add(10.2,3.5,1800,280,.055,'fire');for(let i=0;i<6;i++)add(10.35+i*.35,.6,400,1500,.045,'wind',(i%2?1:-1)*.45);
drum(13.5,1.1);for(let i=0;i<10;i++)add(13.5+i*.04,.21,3400+i*120,400,.06,'crack',Math.sin(i*2.4)*.7,true);
for(let i=0;i<8;i++){const at=15.3+i*.045;add(at,.22,500,2700,.055,'wind',Math.sin(i)*.65,true);copper(at+.12,261.63+i*5,.5);}
copper(16.4,261.63,1.2);add(16.4,1.8,110,1800,.065,'wind');add(18.4,1.2,1200,160,.12,'wind');copper(19.6,130.81,.65);
for(let i=0;i<4;i++)drum(18.9+i*.25,.5+i*.12);
drum(T.impactAt,1.8);add(T.impactAt,.24,5300,160,.2,'crack',0,true);add(T.impactAt+.04,1.5,550,55,.16,'fire',0,true);copper(T.impactAt+.02,87.31,2);
for(let i=0;i<8;i++)copper(21+i*.09,349.23+i*6,.35,(i%2?1:-1)*.35);
// Original interlocking motif: sustained low fifths, brisk plucks and a short rising answer.
for(let i=0;i<34;i++){const at=.65+i*.5,f=[174.61,207.65,261.63,233.08,174.61,155.56,207.65,261.63][i%8];add(at,.37,f,f,.035,'triangle',(i%2?1:-1)*.22);if(i%2===0)add(at,.65,f/2,f/2,.04,'triangle');}
for(const at of [1.25,3.25,4.2,6.25,10.2,12.2,15.3,16.4])drum(at,.6);
for(let i=0;i<4;i++){const at=17.3+i*.42;add(at,.55,[261.63,311.13,349.23,415.3][i],[261.63,311.13,349.23,415.3][i],.05,'triangle');}
for(const [i,f]of [174.61,220,261.63,349.23].entries()){add(T.revealAt+i*.045,4.8,f,f,.055,'sine',(i-1.5)*.2);add(T.revealAt+i*.045,3.2,f*2,f*2,.018,'triangle');}
for(let i=0;i<10;i++){const f=[349.23,440,523.25,698.46,523.25][i%5];add(21.1+i*.42,.6,f,f,.045,'triangle',(i%2?1:-1)*.3);}
add(25.4,2.6,650,100,.06,'wind');add(25.5,2.5,174.61,174.61,.04,'sine');
export const KIM_TIEN_SCORE=Object.freeze(score.sort((a,b)=>a[0]-b[0]).map(Object.freeze));
const banks=new WeakMap();
function bank(c){if(banks.has(c))return banks.get(c);const b=c.createBuffer(1,c.sampleRate*2,c.sampleRate),d=b.getChannelData(0);let seed=38191,low=0;for(let i=0;i<d.length;i++){seed=(Math.imul(seed,1664525)+1013904223)|0;const white=seed/2147483648;low=low*.84+white*.16;d[i]=low*.7+white*.25;}banks.set(c,b);return b;}
export function kimTienMusicDuck(ms){const s=ms/1000;return s<19.6?.13:s<20.2?.045:s<24?.1:Math.min(1,.1+(s-24)/4*.9);}
export function scheduleKimTienAudio(c,destination,elapsed=0,duration=28,strength=1,event={}){const nodes=[],sources=[],now=c.currentTime,pitch=qiVariant(event).pitch,bus=c.createGain(),limiter=c.createDynamicsCompressor();bus.gain.value=strength;limiter.threshold.value=-10;limiter.knee.value=8;limiter.ratio.value=7;limiter.attack.value=.003;limiter.release.value=.19;bus.connect(limiter);limiter.connect(destination);nodes.push(bus,limiter);
 // Sparse stereo early echoes emulate bronze chamber reflections, not a wash over the attack.
 let echo;if(c.createDelay){echo=c.createDelay(.5);const wet=c.createGain();echo.delayTime.value=.117;wet.gain.value=.16;limiter.connect(echo);echo.connect(wet);wet.connect(destination);nodes.push(echo,wet);}
 for(const [at,len,f,end,vol,kind,pan,transient]of KIM_TIEN_SCORE){if(at>=duration||transient&&elapsed>at+.08)continue;const trim=Math.max(0,elapsed-at),remain=Math.min(len-trim,duration-Math.max(at,elapsed));if(remain<=0||len<1&&trim>.08)continue;const start=now+Math.max(0,at-elapsed),noise=['fire','crack','wind'].includes(kind),source=noise?c.createBufferSource():c.createOscillator(),gain=c.createGain();let freq;
 if(noise){source.buffer=bank(c);source.loop=true;const filter=c.createBiquadFilter();filter.type=kind==='crack'?'bandpass':'lowpass';filter.Q.value=kind==='crack'?1.4:.65;source.connect(filter);filter.connect(gain);freq=filter.frequency;nodes.push(filter);}else{source.type=kind;source.connect(gain);freq=source.frequency;}
 freq.setValueAtTime(Math.max(25,(f+(end-f)*trim/len)*pitch),start);freq.exponentialRampToValueAtTime(Math.max(25,end*pitch),start+remain);gain.gain.setValueAtTime(.0001,start);const attack=noise?.006:kind==='sine'?.008:.018;gain.gain.linearRampToValueAtTime(vol,start+Math.min(remain*.12,attack));if(kind==='fire'&&remain>1)gain.gain.linearRampToValueAtTime(vol*.75,start+remain*.75);gain.gain.exponentialRampToValueAtTime(.0001,start+remain);
 if(pan&&c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=pan;gain.connect(p);p.connect(bus);nodes.push(p);}else gain.connect(bus);source.start(start);source.stop(start+remain+.02);sources.push(source);nodes.push(source,gain);}
 const cleanup=()=>nodes.forEach(n=>{try{n.disconnect();}catch{}});let stopped=false,timer=setTimeout(cleanup,Math.max(0,(duration-elapsed+1)*1000));timer.unref?.();return {stop(){if(stopped)return;stopped=true;clearTimeout(timer);for(const source of sources){try{source.stop();}catch{}}cleanup();}};}
