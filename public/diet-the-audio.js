// Diệt Thế Chí Tôn v1 — Quy Hư: âm toàn cung (whole-tone) Đô cho hư vô, kết bằng quãng năm trống Đô–Sol (vũ trụ tái sinh).
// Điểm đen (sub sâu rồi lặng), hố đen 4 nhịp (sub hạ + gió hút), thấu kính (chuông thuỷ tinh), 5 hành tinh (đồng ca),
// mỗi hành tinh bị xé (nổ lớn + rạn đá lách tách), hư hỏa bén (gió lửa trầm), 8 cột lửa phun (nổ + gầm),
// vết nứt thành kiếm (thuỷ tinh rạn), 3 nhát chém xé màn (rạch sáng + sấm), 16 mảnh giáp ráp cánh (kim loại gảy),
// dang cánh (nổ + kèn), vành mảnh hành tinh (chuông) bén lửa, hố đen giáng xuống nhập thân (sub dài + trống dồn), 3 lượt xoá thế giới (quét nhiễu),
// tối, 2 nhịp tim, NỔ VỤ NỔ LỚN, kèn quãng năm Đô.
// Sinh lại public/diet-the-audio.js bằng: node scripts/build-realm-audio.mjs diet-the
import {qiVariant} from './qi-impact.js';import {warmWave} from './warm-wave.js';
import {DT as T,DT_PULSES,DT_TEARS,DT_PILLARS,DT_SLASHES,DT_PLATES,DT_FRAGS,DT_SWEEPS,DT_BEATS} from './diet-the-awakening.js';
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
const WT=[130.81,146.83,164.81,185,207.65,233.08,261.63];
// nền: pedal Đô thấp + gió vũ trụ
add(.1,T.dark-.1,.03,32.7,32.7,'triangle',0,false,'pedal');add(.4,8,.035,200,600,'wind',-.4,false,'cosmic-wind');add(2,8,.03,160,500,'wind',.4,false,'cosmic-wind');
strings(1.2,7,[65.41,92.5,130.81],.016);strings(8.2,7,[65.41,103.83,130.81,185],.018);
// 1. Điểm đen
sub(T.dot,.26,90,20,2.6);add(T.dot,.1,.08,4000,800,'crack',0,true,'dot-pop');bell(T.dot+.02,523.25,.03);
// 2. Hố đen 4 nhịp + thấu kính
DT_PULSES.forEach((at,i)=>{sub(at,.2+i*.03,70-i*6,22,1.6);drum(at,.9+i*.1);add(at,1.1,.05,3200-i*400,200,'wind',0,true,'hole-suck');bell(at,WT[i],.03);});add(T.hole,4.8,.03,40,80,'sawtooth',0,false,'hole-drone');
glass(T.lens,523.25,0,1.4);glass(T.lens+.08,739.99,.3,1);boom(T.lens,1.2,0,261.63);
// 3. 5 hành tinh bị xé
choir(T.planets,2.4,[130.81,164.81,207.65],.03);boom(T.planets,.9,0,164.81);DT_TEARS.forEach((at,i)=>{const pan=(i%2?1:-1)*.6;add(at-.6,.6,.04,200,1600,'rise',pan,false,'tidal');boom(at,1.3+i*.1,pan,WT[6-i]);add(at,1.2,.08,1400,120,'thunder',pan,true,'planet-break');rubble(at+.15,pan,1);});
gong(T.swallowed,1.3);add(T.swallowed,1,.05,2600,200,'wind',0,true,'swallow');
// 4. Hư hỏa + 8 cột
add(T.fire,3.6,.05,120,420,'wind',0,false,'void-fire');boom(T.fire,1.1,0,130.81);DT_PILLARS.forEach((at,i)=>{const pan=(i%2?1:-1)*(.4+Math.floor(i/2)*.12);add(at,.5,.05,300,2400,'wind',pan,true,'pillar-roar');boom(at+.05,.7+i*.05,pan,WT[i%7]);});strings(T.fire,4,[65.41,92.5,130.81,185],.022);
// 5. Kiếm nứt không gian + 3 nhát chém
add(T.crack,1.2,.04,900,5200,'rise',0,false,'crack-grow');for(let i=0;i<8;i++)glass(T.crack+i*.15,880+i*70,.4,.6);boom(T.sword,1.4,.4,261.63);brass(T.sword+.05,1.4,65.41,.05);
DT_SLASHES.forEach((at,i)=>{const pan=[-.6,.6,-.3][i];add(at-.12,.12,.06,1500,7000,'rise',pan,true,'slash-draw');add(at,.2,.16,7200,600,'crack',pan,true,'slash');sub(at,.26,80,24,1.6);drum(at,1.4,pan);add(at+.05,1.4,.08,1000,90,'thunder',pan,true,'slash-thunder');glass(at+.03,[1046.5,1174.66,1318.51][i],pan,1);});
strings(DT_SLASHES[0],4,[65.41,98,130.81,196],.024);
// 6. Cánh vỡ
const up=[261.63,293.66,329.63,369.99,415.3,466.16,523.25,587.33];DT_PLATES.forEach((at,i)=>{const pan=(i%2?1:-1)*.7;pluck(at+.3,up[Math.floor(i/2)],.034,pan);add(at+.3,.06,.04,3800,1200,'crack',pan,true,'plate-lock');if(i%4===3)drum(at+.3,.6,pan);});
add(T.spread-.5,.5,.06,300,3400,'rise',0,false,'spread-in');boom(T.spread,1.8,0,130.81);gong(T.spread+.02,1.2);brass(T.spread+.05,2,65.41,.06);brass(T.spread+.6,1.6,98,.05);
// 7. Vành mảnh hành tinh bén lửa
DT_FRAGS.forEach((at,i)=>{bell(at+.3,[523.25,587.33,659.25,739.99,830.61,932.33,1046.5,932.33,830.61,739.99][i],.026,(i/9-.5)*1.4);});boom(T.ignite,1.4,0,261.63);add(T.ignite,2.2,.05,200,600,'wind',0,false,'crown-fire');choir(T.ignite,2.4,[130.81,164.81,207.65,261.63],.032);
// 8. Hố đen giáng xuống nhập thân
add(T.descend,3.6,.07,4000,120,'wind',0,false,'descend');sub(T.descend,.2,50,20,3.8);add(T.descend,3.6,.04,80,30,'sawtooth',0,false,'descend-groan');for(let i=0;i<6;i++)drum(T.descend+i*.55,.5+i*.1);
boom(T.absorbed,2,0,65.41);gong(T.absorbed+.02,1.5);
// 9. 3 lượt xoá thế giới, tối, 2 nhịp tim
DT_SWEEPS.forEach((at,i)=>{add(at,.8,.07,600,7000,'wind',-.8,true,'erase-sweep');add(at,.8,.07,600,7000,'wind',.8,true,'erase-sweep');boom(at+.1,1.2+i*.15,0,WT[3-i]);add(at,.7,.05,3000,300,'thunder',0,true,'erase-rumble');});
add(DT_SWEEPS[0],3.4,.04,180,60,'strings',0,false,'void-chord');add(T.dark-.3,.5,.05,2400,120,'wind',0,true,'light-suck');DT_BEATS.forEach((at,i)=>heart(at,.8+i*.2));
// 10. NỔ VỤ NỔ LỚN
drum(T.impact,2.1);add(T.impact,.2,.17,7000,500,'crack',0,true,'release-crack');sub(T.impact,.34,90,20,3);gong(T.impact+.02,1.8);brass(T.impact,1.9,65.41,.08);
add(T.impact+.08,1.8,.07,1000,100,'thunder',-.35,true,'release-wave');add(T.impact+.2,1.7,.06,800,90,'thunder',.35,true,'release-wave');for(let i=0;i<12;i++)glass(T.impact+.12+i*.08,1046.5+rnd(i)*800,(rnd(i+3)-.5)*1.6,.7);
// 11. Kèn quãng năm Đô — vũ trụ tái sinh
strings(T.reveal,3.8,[32.7,65.41,98,130.81,196],.028);choir(T.reveal,3.6,[130.81,196,261.63,329.63],.036);brass(T.reveal+.2,2.4,65.41,.06);brass(T.reveal+1,1.8,98,.05);brass(T.reveal+1.8,1.6,130.81,.05);
for(const [i,hz]of [261.63,392,523.25,659.25,783.99,1046.5].entries())pluck(T.reveal+.3+i*.3,hz,.04-i*.003,(i%2?1:-1)*.3);bell(T.reveal+2.4,261.63,.035);add(T.reveal+2.2,1.6,.024,600,150,'wind',0,false,'release-breath');
export const DIET_THE_SCORE=Object.freeze(score.sort((a,b)=>a.at-b.at).map(Object.freeze));
// Độ lớn ×1,9 theo yêu cầu chủ game 07/11; limiter cuối giữ đỉnh dưới ngưỡng vỡ tiếng.
const LOUD=1.9;
const banks=new WeakMap();
function noise(c){if(banks.has(c))return banks.get(c);const b=c.createBuffer(1,c.sampleRate*3,c.sampleRate),d=b.getChannelData(0);let seed=71313,low=0;for(let i=0;i<d.length;i++){seed=(Math.imul(seed,1664525)+1013904223)|0;const w=seed/2147483648;low=.9*low+.1*w;d[i]=low*.9+w*.18;}banks.set(c,b);return b;}
export function dietTheMusicDuck(ms){const t=ms/1000;return t<T.impact?.08:t<T.impact+2.2?.12:Math.min(1,.12+(t-T.impact-2.2)/1.6*.88);}
export function scheduleDietTheAudio(c,destination,elapsed=0,duration=T.duration,strength=1,event={}){
 const now=c.currentTime,pitch=qiVariant(event).pitch,scale=duration/T.duration,bus=c.createGain(),limiter=c.createDynamicsCompressor(),nodes=[bus,limiter],sources=[];let stopped=false,echo=null;
 bus.gain.value=strength;limiter.threshold.value=-10;limiter.knee.value=8;limiter.ratio.value=1;limiter.attack.value=.003;limiter.release.value=.22;const ceiling=c.createDynamicsCompressor();ceiling.threshold.value=-6;ceiling.knee.value=0;ceiling.ratio.value=1;ceiling.attack.value=.001;ceiling.release.value=.12;nodes.push(ceiling);bus.connect(limiter);limiter.connect(ceiling);ceiling.connect(destination);
 // Vang thung lũng: trễ dài, phản hồi vừa.
 if(c.createDelay){echo=c.createDelay(.6);const wet=c.createGain(),fb=c.createGain();echo.delayTime.value=.34;wet.gain.value=.16;fb.gain.value=.28;echo.connect(wet);wet.connect(bus);echo.connect(fb);fb.connect(echo);nodes.push(echo,wet,fb);}
 for(const cue of DIET_THE_SCORE){const at=cue.at*scale,len=cue.len*scale,trim=Math.max(0,elapsed-at),remain=Math.min(len-trim,duration+.8-Math.max(at,elapsed));if(remain<=0||cue.transient&&trim>.08)continue;
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
