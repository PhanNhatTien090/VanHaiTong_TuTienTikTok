// Thái Ất v2 — âm thanh dày đặc theo từng biến cố: 8 cú đập Bát Quái, cá âm dương va nhau, rồng gầm, phượng kêu,
// 12 sét dồn, sóng va, rồng phượng lao vào, 8 cột sáng, 8 cú hút, hai nửa xuyên tâm, nổ. Trống trận dồn suốt cảnh.
// Rê thứ → Rê trưởng. Sinh từ scripts/thai-at-score.txt (bộ máy cue dùng chung, có lớp ×2: LOUD, hợp xướng, kèn, sub, limiter).
import {qiVariant} from './qi-impact.js';import {warmWave} from './warm-wave.js';
import {TA as T,TA_SLAMS,TA_STRIKES,TA_PILLARS,TA_ABSORB} from './thai-at-awakening.js';
const score=[],add=(at,len,level,from,to=from,kind='sine',pan=0,transient=false,tag='')=>score.push({at,len,level,from,to,kind,pan,transient,tag});
const rnd=i=>{const v=Math.sin(i*91.7+12.3)*43758.5453;return v-Math.floor(v);};
function drum(at,f=1,pan=0){add(at,.6,.17*f,100,32,'sine',pan,true,'drum');add(at,.09,.045*f,1600,200,'crack',pan,true,'drum-skin');}
function strings(at,len,notes,f=.02){notes.forEach((hz,i)=>{for(const d of [.997,1.003])add(at,len,f/(1+i*.35),hz*d,hz*d,'strings',(i%2?1:-1)*.24,false,'strings');});}
function pluck(at,hz,f=.035,pan=0){add(at,.85,f,hz,hz*.994,'triangle',pan,true,'zither');add(at,.25,f*.18,hz*3,hz*2.98,'sine',pan,true,'zither-harmonic');}
function choir(at,len,notes,f=.03){notes.forEach((hz,i)=>{for(const d of [.995,1.005])add(at,len,f/(1+i*.3),hz*d,hz*d,'choir',(i%2?1:-1)*.3,false,'choir');});}
function brass(at,len,hz,f=.05){add(at,len,f,hz,hz,'brass',0,false,'brass');add(at,len,f*.6,hz*1.5,hz*1.5,'brass',0,false,'brass-fifth');}
function sub(at,f=.2,from=70,to=28,len=1.4){add(at,len,f,from,to,'sine',0,true,'sub-boom');}
function swellTo(at,len=1.2,f=.05){add(at-len,len,f,200,3000,'rise',0,false,'pre-swell');}
function bell(at,hz,f=.04,pan=0){for(const [r,v,len] of [[1,1,1.8],[2.76,.4,1],[5.4,.15,.45]])add(at,len,f*v,hz*r,hz*r*.998,'sine',pan,true,'bell');}
// cú "bùm": trầm sâu + trống + nứt + kim loại
function boom(at,f=1,pan=0,metal=440){sub(at,.2*f,75,26,1.2);drum(at,.9*f,pan);add(at,.12,.1*f,5200,700,'crack',pan,true,'boom-crack');bell(at+.01,metal,.035*f,pan);}
function thunder(at,f=1,pan=0){add(at,.07,.12*f,5000,600,'crack',pan,true,'bolt-crack');add(at+.06,1.1,.08*f,340,55,'thunder',pan,true,'bolt-roll');}
function whoosh(at,f=.04,pan=0,up=true){add(at,.4,f,up?400:2600,up?2600:380,'wind',pan,true,'whoosh');}
// trống trận dồn suốt cảnh
for(let i=0;i<64;i++){const at=.4+i*.36;if(at>T.absorbed)break;drum(at,(i%4===0?.5:.28)+Math.min(.25,at/T.absorbed*.25),(i%2?1:-1)*.25);}
add(.2,25.6,.035,73.42,73.42,'triangle',0,false,'pedal');strings(.3,5,[73.42,110,146.83],.016);
// 1. Lưỡi vàng xẻ trời đất
boom(T.split,1.3,0,587.33);add(T.split,1,.06,300,3400,'wind',0,true,'split-sweep');
// 2. 8 mảnh Bát Quái đập vào vòng: vút → bùm, cao độ đi lên, trái/phải luân phiên
TA_SLAMS.forEach((at,i)=>{const pan=Math.sin(i*Math.PI/4)*.7;whoosh(at-.35,.045,pan,false);boom(at,1,pan,[293.66,329.63,349.23,392,440,493.88,523.25,587.33][i]);});
boom(T.ring,1.5,0,146.83);brass(T.ring,1.6,73.42,.07);choir(T.ring,2,[146.83,220,293.66],.03);
// 3. Cá âm dương va nhau → thái cực
whoosh(T.fishIn,.05,-.6,false);add(T.fishIn,1.2,.05,200,1800,'rise',.6,false,'fish-rise');boom(T.taiji,1.8,0,220);bell(T.taiji+.05,110,.08);strings(T.taiji,3,[146.83,220,293.66,349.23],.022);
// 4. Rồng vàng giáng (gầm) — phượng hoàng vút lên (kêu). Âm tổng hợp, không phải tiếng thú thật.
thunder(T.dragon,1,-.5);add(T.dragon,1.6,.09,170,70,'brass',-.4,true,'dragon-roar');add(T.dragon,1.4,.06,1200,250,'wind',-.4,true,'dragon-breath');sub(T.dragon,.24,60,28,1.6);
for(let i=0;i<3;i++){add(T.phoenix+i*.28,.5,.05,1300+i*200,2600+i*300,'sine',.5,true,'phoenix-cry');add(T.phoenix+i*.28,.5,.025,1950+i*300,3900+i*450,'triangle',.5,true,'phoenix-cry-hi');}add(T.phoenix,1.2,.05,300,2800,'rise',.5,false,'phoenix-rise');boom(T.phoenix,.9,.5,659.25);
for(let i=0;i<7;i++)whoosh(T.phoenix+1+i*.36,.035,(i%2?1:-1)*.8,i%2===0);
const motif=[293.66,349.23,392,440,523.25,440,392,349.23];for(let i=0;i<10;i++)pluck(T.dragon+.5+i*.4,motif[i%8]*2,.03,(i%2?1:-1)*.35);
// 5. 12 sét âm dương dồn dập
TA_STRIKES.forEach((at,i)=>thunder(at,.75,(i%2?1:-1)*.6));choir(T.storm,3,[73.42,77.78,110,116.54],.03);
// 6. Sóng vàng/tím va ở chân trời
add(T.waves,1.2,.07,180,2000,'wind',-.6,false,'gold-wave');add(T.waves,1.2,.07,160,1400,'wind',.6,false,'violet-wave');swellTo(T.crash,1.1,.06);boom(T.crash,2,0,110);add(T.crash,1.8,.1,900,90,'thunder',0,true,'wave-crash');
// 7. Rồng phượng lao vào thái cực, bùng cháy; 8 cột sáng
add(T.dive,1,.06,2600,300,'wind',-.6,true,'dragon-dive');add(T.dive+.1,1,.06,2800,350,'wind',.6,true,'phoenix-dive');add(T.dive,1,.06,150,70,'brass',0,true,'dive-roar');
boom(T.ignite,1.7,0,146.83);brass(T.ignite,2,73.42,.07);brass(T.ignite+.3,1.8,110,.06);choir(T.ignite,2.4,[146.83,220,293.66,440],.036);
TA_PILLARS.forEach((at,i)=>{boom(at,.55,(i/7-.5)*1.2,[587.33,659.25,698.46,783.99,880,987.77,1046.5,1174.66][i]);});
// 8. 8 mảnh bay vào người, nhịp nhanh dần
TA_ABSORB.forEach((at,i)=>{whoosh(at-.28,.04,(i%2?1:-1)*.5,false);boom(at,.7+i*.06,0,[1174.66,1046.5,987.77,880,783.99,698.46,659.25,587.33][i]);});
// 9. Hai nửa xuyên tâm → nổ
add(T.halves,1.25,.06,300,2600,'rise',-.7,false,'half-light');add(T.halves,1.25,.06,200,2000,'rise',.7,false,'half-dark');swellTo(T.impact,1.4,.08);sub(T.absorbed,.2);
drum(T.impact,1.7);add(T.impact,.18,.16,6200,500,'crack',0,true,'release-crack');sub(T.impact,.26,80,24,2.2);brass(T.impact,1.6,73.42,.065);
add(T.impact+.12,1.3,.07,850,110,'thunder',-.35,true,'release-wave');add(T.impact+.22,1.2,.06,700,95,'thunder',.35,true,'release-wave');add(T.impact+.3,1.2,.06,170,80,'brass',0,true,'final-roar');
// 10. Hiện thân Rê trưởng
strings(T.reveal,3.4,[73.42,146.83,185,220,293.66],.028);choir(T.reveal,3.2,[146.83,185,220,293.66],.034);brass(T.reveal+.2,2.2,73.42,.05);
for(const [i,hz]of [587.33,739.99,880,1174.66,880,739.99].entries())pluck(26.5+i*.3,hz,.04-i*.003,(i%2?1:-1)*.3);bell(28.4,1174.66,.03);add(28.2,1.4,.022,650,160,'wind',0,false,'release-breath');
export const THAI_AT_SCORE=Object.freeze(score.sort((a,b)=>a.at-b.at).map(Object.freeze));
// Độ lớn ×1,9 theo yêu cầu chủ game 07/11; limiter cuối giữ đỉnh dưới ngưỡng vỡ tiếng.
const LOUD=1.9;
const banks=new WeakMap();
function noise(c){if(banks.has(c))return banks.get(c);const b=c.createBuffer(1,c.sampleRate*3,c.sampleRate),d=b.getChannelData(0);let seed=55117,low=0;for(let i=0;i<d.length;i++){seed=(Math.imul(seed,1664525)+1013904223)|0;const w=seed/2147483648;low=.9*low+.1*w;d[i]=low*.9+w*.18;}banks.set(c,b);return b;}
export function thaiAtMusicDuck(ms){const t=ms/1000;return t<T.impact?.08:t<28.2?.12:Math.min(1,.12+(t-28.2)/1.6*.88);}
export function scheduleThaiAtAudio(c,destination,elapsed=0,duration=T.duration,strength=1,event={}){
 const now=c.currentTime,pitch=qiVariant(event).pitch,scale=duration/T.duration,bus=c.createGain(),limiter=c.createDynamicsCompressor(),nodes=[bus,limiter],sources=[];let stopped=false,echo=null;
 bus.gain.value=strength;limiter.threshold.value=-10;limiter.knee.value=8;limiter.ratio.value=1;limiter.attack.value=.003;limiter.release.value=.22;const ceiling=c.createDynamicsCompressor();ceiling.threshold.value=-6;ceiling.knee.value=0;ceiling.ratio.value=1;ceiling.attack.value=.001;ceiling.release.value=.12;nodes.push(ceiling);bus.connect(limiter);limiter.connect(ceiling);ceiling.connect(destination);
 // Vang thung lũng: trễ dài, phản hồi vừa.
 if(c.createDelay){echo=c.createDelay(.6);const wet=c.createGain(),fb=c.createGain();echo.delayTime.value=.34;wet.gain.value=.16;fb.gain.value=.28;echo.connect(wet);wet.connect(bus);echo.connect(fb);fb.connect(echo);nodes.push(echo,wet,fb);}
 for(const cue of THAI_AT_SCORE){const at=cue.at*scale,len=cue.len*scale,trim=Math.max(0,elapsed-at),remain=Math.min(len-trim,duration+.8-Math.max(at,elapsed));if(remain<=0||cue.transient&&trim>.08)continue;
  const level=cue.level*LOUD,start=now+Math.max(0,at-elapsed),noisy=['wind','thunder','crack','rise'].includes(cue.kind),source=noisy?c.createBufferSource():c.createOscillator(),g=c.createGain();let param;
  if(noisy){source.buffer=noise(c);source.loop=true;}else if((cue.kind==='strings'||cue.kind==='choir')&&c.createPeriodicWave)source.setPeriodicWave(warmWave(c));else source.type=['strings','choir','brass'].includes(cue.kind)?'sawtooth':cue.kind;
  if(noisy||['strings','choir','brass'].includes(cue.kind)){const filter=c.createBiquadFilter();filter.type=noisy||cue.kind==='choir'?'bandpass':'lowpass';if(filter.Q)filter.Q.value=cue.kind==='crack'?.9:cue.kind==='choir'?1.4:.55;source.connect(filter);filter.connect(g);nodes.push(filter);if(noisy)param=filter.frequency;else{filter.frequency.value=cue.kind==='choir'?760:cue.kind==='brass'?950:1300;param=source.frequency;}}else{source.connect(g);param=source.frequency;}
  const pf=noisy?1:pitch;param.setValueAtTime(Math.max(25,Math.min(12000,(cue.from+(cue.to-cue.from)*trim/len)*pf)),start);param.exponentialRampToValueAtTime(Math.max(25,cue.to*pf),start+remain);
  const attack=cue.kind==='choir'?.55:cue.kind==='brass'?.07:cue.kind==='strings'?.38:cue.kind==='rise'?remain*.7:cue.kind==='wind'?.1:.004;
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
