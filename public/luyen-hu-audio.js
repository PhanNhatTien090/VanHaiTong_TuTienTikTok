// Luyện Hư v2 — âm thanh tự tổng hợp: kính nứt/vỡ, hư không trầm, gương khóa, xé rách, hư nhãn hút, tua ngược, nổ.
// Chủ đề Mi thứ → Sol trưởng khi hiện thân. Không phải ghi âm thật; cùng đồng hồ với hình (LH_TIMING).
import {qiVariant} from './qi-impact.js';import {warmWave} from './warm-wave.js';
import {LH_TIMING as T,LH_RIFTS} from './luyen-hu-formation.js';
const score=[],add=(at,len,level,from,to=from,kind='sine',pan=0,transient=false,tag='')=>score.push({at,len,level,from,to,kind,pan,transient,tag});
const rnd=i=>{const v=Math.sin(i*91.7+12.3)*43758.5453;return v-Math.floor(v);};
function drum(at,f=1,pan=0){add(at,.6,.17*f,118,36,'sine',pan,true,'drum');add(at,.09,.045*f,1700,220,'crack',pan,true,'drum-skin');}
function glass(at,hz,f=.04,pan=0){add(at,.55,f,hz,hz*.996,'sine',pan,true,'glass');add(at,.22,f*.5,hz*2.71,hz*2.7,'sine',pan,true,'glass-partial');add(at,.03,f*.6,6000,2600,'crack',pan,true,'glass-tick');}
function strings(at,len,notes,f=.02){notes.forEach((hz,i)=>{for(const d of [.997,1.003])add(at,len,f/(1+i*.35),hz*d,hz*d,'strings',(i%2?1:-1)*.24,false,'strings');});}
function pluck(at,hz,f=.035,pan=0){add(at,.85,f,hz,hz*.994,'triangle',pan,true,'zither');add(at,.25,f*.18,hz*3,hz*2.98,'sine',pan,true,'zither-harmonic');}
function thunder(at,f=1,pan=0){add(at,.07,.12*f,4200,600,'crack',pan,true,'void-crack');add(at+.07,1.1,.085*f,320,60,'thunder',pan,true,'void-roll');}
const PINGS=[2093,2349.3,2637,2960,3136,3520];
// 1. Vết nứt đầu tiên + mạng nứt lan
add(T.crack,.16,.14,5200,900,'crack',0,true,'first-crack');glass(T.crack,2637,.07);glass(T.crack+.02,3520,.045,.3);drum(T.crack,.8);
add(T.crack,2.2,.028,4200,900,'wind',0,false,'crack-hiss');
for(let i=0;i<14;i++){const at=.28+i*.15*(1-i*.025);glass(at,PINGS[i%6]*(1+(rnd(i)-.5)*.04),.018+rnd(i+5)*.012,(i%2?1:-1)*(.2+rnd(i+9)*.5));}
add(.3,10.4,.034,41.2,41.2,'triangle',0,false,'void-drone');strings(.45,2,[82.41,123.47,164.81],.012);
// 2. Thiên mạc vỡ
add(T.shatter,.2,.16,6000,700,'crack',0,true,'shatter');thunder(T.shatter,.8);drum(T.shatter,1);
for(let i=0;i<24;i++)glass(T.shatter+.02+i*.042,PINGS[(i*5)%6]*(.9+rnd(i+30)*.25),.034*(1-i/30),(rnd(i+40)-.5)*1.4);
add(T.shatter+.1,1.8,.04,2200,280,'wind',0,false,'void-open');strings(T.shatter+.2,2.4,[82.41,123.47,196],.016);
const motif=[329.63,392,493.88,587.33,493.88,392,329.63,293.66];
for(let i=0;i<18;i++){const at=2.6+i*.45;if(at>10.4)break;pluck(at,motif[i%8],i<8?.024:.031,(i%2?1:-1)*.3);if(i%4===0)drum(at,.32);}
// 3. Tám gương bay về vòm và khóa
for(let k=0;k<8;k++){const pan=(k/7-.5)*1.4;add(T.mirrors+k*.12,.9,.02,600,2400,'wind',pan,true,'mirror-flight');glass(T.mirrors+1.4+k*.12,[329.63,392,440,493.88,587.33,659.25,783.99,880][k]*2,.03,pan);}
strings(T.mirrors+1,1.8,[123.47,164.81,246.94],.016);
// 4. Phân thân bước ra khỏi gương
for(let k=0;k<8;k++){const pan=k<4?-.55:.55;add(T.clones+k*.26,.55,.022,300,1600,'rise',pan,true,'clone-emerge');glass(T.clones+k*.26+.45,987.77*2**(k/12),.016,pan);}
strings(T.clones,3,[82.41,164.81,196,246.94],.022);add(T.clones,3,.032,82.41,82.41,'triangle',0,false,'clone-pedal');
// 5. Bốn nhát rách hư không, mỗi nhát làm vỡ một cặp phân thân
LH_RIFTS.forEach((at,p)=>{const pan=p<2?-.6:.6;add(at,.5,.085,3500,180,'wind',pan,true,'rift-tear');thunder(at+.18,.7,pan);drum(at+.18,.6,pan);for(let i=0;i<8;i++)glass(at+.2+i*.04,PINGS[(i+p)%6]*.8,.022,pan*(.6+rnd(i+p*9)*.4));});
// 6. Hư nhãn: hút xuống, nhịp tim dồn
add(T.eye,1.9,.06,90,700,'rise',0,false,'void-eye-rise');add(T.eye,1.9,.055,55,33,'triangle',0,false,'eye-bend');strings(T.eye,1.8,[82.41,87.31,123.47],.02);
for(const [i,at]of [13,13.5,13.9,14.2,14.42].entries())drum(at,.32+i*.06);
// 7. Nghịch chuyển: tua ngược, chuỗi kính đi lên
add(T.rewind,1.5,.05,150,2600,'rise',0,false,'rewind-swell');for(let i=0;i<24;i++)glass(T.rewind+.1+i*.058,659.25*2**(i/12),.016+i*.0006,(i%2?1:-1)*.35);
strings(T.disk,1.2,[123.47,164.81,246.94,329.63],.02);
// 8. Hư Không Kính nhập thể, nén
add(T.enter,1,.05,164.81,164.81,'sine',0,false,'disk-bell');add(T.enter+.1,.9,.04,1800,130,'wind',0,false,'inhalation');
for(const [i,at]of [16.3,16.6,16.85,17,17.12].entries())drum(at,.35+i*.07);add(16.2,1,.06,180,2200,'rise',0,false,'compression-riser');
// 9. Nổ (impact-audio dùng chung thêm bass/cồng)
drum(T.impact,1.7);add(T.impact,.18,.16,6200,500,'crack',0,true,'release-crack');for(let i=0;i<20;i++)glass(T.impact+.02+i*.018,PINGS[i%6]*(1+rnd(i+70)*.3),.03*(1-i/24),(rnd(i+80)-.5)*1.6);
add(T.impact+.12,1.3,.07,850,110,'thunder',-.35,true,'release-wave');add(T.impact+.22,1.2,.06,700,95,'thunder',.35,true,'release-wave');add(T.impact,1.6,.05,82.41,82.41,'sine',0,true,'release-bell');
// 10. Hiện thân: Sol trưởng
strings(T.reveal,2.9,[98,123.47,146.83,196,246.94],.028);add(T.reveal,2.7,.044,98,98,'triangle',0,false,'reveal-pedal');
for(const [i,hz]of [587.33,783.99,987.77,1174.66,987.77,783.99].entries())pluck(17.75+i*.3,hz,.04-i*.003,(i%2?1:-1)*.3);
glass(19.6,1567.98,.03);add(19.3,1.4,.022,650,160,'wind',0,false,'release-breath');
// v2.1 (07/11): lớp bổ sung — hợp xướng, kèn đồng, sub-bass, tiếng dâng trước cú lớn.
function choir(at,len,notes,f=.03){notes.forEach((hz,i)=>{for(const d of [.995,1.005])add(at,len,f/(1+i*.3),hz*d,hz*d,'choir',(i%2?1:-1)*.3,false,'choir');});}
function brass(at,len,hz,f=.05){add(at,len,f,hz,hz,'brass',0,false,'brass');add(at,len,f*.6,hz*1.5,hz*1.5,'brass',0,false,'brass-fifth');}
function sub(at,f=.2,from=70,to=28,len=1.4){add(at,len,f,from,to,'sine',0,true,'sub-boom');}
function swellTo(at,len=1.2,f=.05){add(at-len,len,f,200,3000,'rise',0,false,'pre-swell');}
sub(T.crack,.22);swellTo(T.shatter,1.4,.05);sub(T.shatter,.26);choir(T.shatter+.3,4.5,[164.81,196,246.94],.03);
brass(T.mirrors+2.4,1.2,82.41,.06);choir(T.clones,3,[196,246.94,329.63],.028);brass(T.clones+2.2,1.5,98,.05);
LH_RIFTS.forEach(at=>{swellTo(at+.18,.5,.04);sub(at+.18,.22);});
choir(T.eye,1.9,[82.41,87.31,123.47,130.81],.035);for(let i=0;i<12;i++)drum(13+i*.13,.25+i*.03,(i%2?1:-1)*.25);
for(let i=0;i<20;i++)add(14.7+i*.075,.03,.03,7000,3000,'crack',(i%2?1:-1)*.4,true,'rewind-tick');brass(T.rewind+.3,1.4,123.47,.05);
sub(T.enter,.18);swellTo(T.impact,1.6,.08);for(let i=0;i<10;i++)drum(16.4+i*.07,.3+i*.05);
sub(T.impact,.35,80,24,2.2);brass(T.impact,1.6,82.41,.09);choir(T.reveal,3,[196,246.94,293.66,392],.035);brass(T.reveal+.2,2.2,98,.05);
export const LUYEN_HU_SCORE=Object.freeze(score.sort((a,b)=>a.at-b.at).map(Object.freeze));
// Độ lớn ×1,9 theo yêu cầu chủ game 07/11; limiter cuối giữ đỉnh dưới ngưỡng vỡ tiếng.
const LOUD=1.9;
const banks=new WeakMap();
function noise(c){if(banks.has(c))return banks.get(c);const b=c.createBuffer(1,c.sampleRate*3,c.sampleRate),d=b.getChannelData(0);let seed=40917,low=0;for(let i=0;i<d.length;i++){seed=(Math.imul(seed,1664525)+1013904223)|0;const w=seed/2147483648;low=.9*low+.1*w;d[i]=low*.9+w*.18;}banks.set(c,b);return b;}
export function luyenHuMusicDuck(ms){const t=ms/1000;return t<T.eye?.2:t<T.impact?.08:t<19.2?.12:Math.min(1,.12+(t-19.2)/1.6*.88);}
export function scheduleLuyenHuAudio(c,destination,elapsed=0,duration=T.duration,strength=1,event={}){
 const now=c.currentTime,pitch=qiVariant(event).pitch,scale=duration/T.duration,bus=c.createGain(),limiter=c.createDynamicsCompressor(),nodes=[bus,limiter],sources=[];let stopped=false,echo=null;
 bus.gain.value=strength;limiter.threshold.value=-10;limiter.knee.value=8;limiter.ratio.value=1;limiter.attack.value=.003;limiter.release.value=.22;const ceiling=c.createDynamicsCompressor();ceiling.threshold.value=-6;ceiling.knee.value=0;ceiling.ratio.value=1;ceiling.attack.value=.001;ceiling.release.value=.12;nodes.push(ceiling);bus.connect(limiter);limiter.connect(ceiling);ceiling.connect(destination);
 // Vang dài hơn Hóa Thần (không gian hư không rộng).
 if(c.createDelay){echo=c.createDelay(.6);const wet=c.createGain(),fb=c.createGain();echo.delayTime.value=.23;wet.gain.value=.16;fb.gain.value=.28;echo.connect(wet);wet.connect(bus);echo.connect(fb);fb.connect(echo);nodes.push(echo,wet,fb);}
 for(const cue of LUYEN_HU_SCORE){const at=cue.at*scale,len=cue.len*scale,trim=Math.max(0,elapsed-at),remain=Math.min(len-trim,duration+.8-Math.max(at,elapsed));if(remain<=0||cue.transient&&trim>.08)continue;
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
