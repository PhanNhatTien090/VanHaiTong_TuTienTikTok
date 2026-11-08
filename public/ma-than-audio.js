// Ma Thần v1 — Giáng Thế: gió máu + trăng mọc (dây trầm Rê thứ), nhật thực (chiêng ngược), 6 nhịp tim dung nham (trống trầm dồn),
// 9 xích ma phóng lên (rít + loảng xoảng kim loại), mặt quỷ hiện (đồng ca trầm dâng), mở mắt (chuông nghịch), GẦM (sấm + kèn gầm trượt xuống),
// 4 lôi đỏ, 9 tiếng xích đứt (nổ kim loại, mỗi tiếng cao dần), hắc kích rơi (vút dài) cắm đất (cú lớn), 12 mảnh giáp (gảy kim loại đi lên),
// giáp ốp (nổ), sừng mọc (kèn trầm dâng), mặt quỷ lao vào (gió hút), dung nham hút ngược, im lặng, NỔ, kèn Ma Thần Rê thứ.
// Sinh lại public/ma-than-audio.js bằng scripts/build-ma-than-audio.mjs (ghép score này với bộ máy cue của tien-de-audio.js).
import {qiVariant} from './qi-impact.js';import {warmWave} from './warm-wave.js';
import {MT as T,MT_BEATS,MT_CHAINS,MT_BOLTS,MT_SNAPS,MT_SHARDS} from './ma-than-awakening.js';
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
function chainRattle(at,pan=0,f=1){add(at-.25,.25,.05*f,500,3200,'wind',pan,true,'chain-whoosh');for(let i=0;i<5;i++){const t=at+i*.05;add(t,.12,.05*f,2200+rnd(i+at*10)*1800,1600,'crack',pan,true,'chain-link');add(t,.3,.018*f,1240+i*90,1200+i*90,'triangle',pan,true,'chain-ring');}}
// nền: gió máu + dây trầm Rê thứ (D2 A2 D3 F3)
add(.1,T.dark-.1,.03,48,48,'triangle',0,false,'pedal');add(.2,6,.05,200,700,'wind',-.4,false,'blood-wind');add(1.2,6,.04,240,600,'wind',.4,false,'blood-wind');
strings(.3,4.5,[73.42,110,146.83],.016);strings(4.6,6,[73.42,110,146.83,174.61],.018);
// 1. Trăng mọc + nhật thực (chiêng đảo, dâng)
add(T.moon,2.2,.05,120,480,'rise',0,false,'moon-rise');gong(T.eclipse+1.2,.9);add(T.eclipse,1.4,.04,900,160,'wind',0,false,'eclipse-hush');
// 2. Đất nứt dung nham + 6 nhịp tim
add(T.cracks,1.3,.08,1200,120,'thunder',0,true,'ground-crack');boom(T.cracks+.2,1.1,0,146.83);add(T.cracks+.3,4,.03,300,900,'wind',0,false,'lava-hiss');
MT_BEATS.forEach((at,i)=>heart(at,.8+i*.12));
// 3. 9 xích ma
MT_CHAINS.forEach((at,i)=>{const pan=(i%2?1:-1)*(.85-Math.floor(i/2)*.12);chainRattle(at,pan,1);boom(at+.2,.55,pan,[293.66,277.18,261.63,246.94,233.08,220,207.65,196,185][i]);});
strings(T.bound,3.4,[73.42,77.78,110,155.56],.02);add(T.bound,3.8,.03,180,260,'brass',0,false,'strain');
// 4. Mặt quỷ: đồng ca trầm dâng, mở mắt, GẦM, 4 lôi
choir(T.face,2.4,[73.42,110,146.83],.03);choir(T.face+2.2,1.2,[77.78,110,155.56],.034);add(T.eyes,.2,.06,3000,700,'crack',0,true,'eyes-open');bell(T.eyes,233.08,.05);bell(T.eyes+.02,246.94,.04);
add(T.roar-.6,.6,.05,200,2400,'rise',0,false,'roar-in');add(T.roar,2.2,.11,900,90,'thunder',0,true,'roar');add(T.roar,2,.09,140,55,'brass',0,true,'roar-growl');add(T.roar,1.8,.06,147,58,'sawtooth',0,true,'roar-saw');sub(T.roar,.3,60,22,2.4);
MT_BOLTS.forEach((at,i)=>{const pan=(i%2?1:-1)*.6;add(at,.16,.14,6000,700,'crack',pan,true,'bolt-crack');add(at+.05,1.3,.08,800,80,'thunder',pan,true,'bolt-thunder');sub(at,.16,70,28,1);});
// 5. 9 xích đứt (cao dần), dàn dây dồn lên
MT_SNAPS.forEach((at,i)=>{const pan=(i%2?1:-1)*.7;add(at-.12,.12,.05,1500,4000,'rise',pan,true,'snap-strain');boom(at,1+i*.08,pan,[220,233.08,246.94,261.63,277.18,293.66,311.13,329.63,349.23][i]);add(at,.14,.1,5200,900,'crack',pan,true,'snap');});
strings(T.snap,4.6,[73.42,110,146.83,174.61,220],.024);brass(MT_SNAPS[8],1.6,73.42,.07);
// 6. Hắc kích rơi → cắm đất
add(T.halberd,1.2,.07,4000,300,'wind',0,false,'halberd-fall');for(let i=0;i<4;i++)add(T.halberd+i*.28,.24,.04,600,2600,'wind',(i%2?1:-1)*.3,true,'halberd-spin');
boom(T.plant,2.2,0,110);gong(T.plant+.02,1.3);add(T.plant,1.6,.09,700,70,'thunder',0,true,'plant-wave');brass(T.plant+.1,2.2,55,.07);
// 7. 12 mảnh giáp bay lên (gảy kim loại đi lên Rê thứ hoà âm), giáp ốp
const up=[293.66,329.63,349.23,392,440,466.16,523.25,587.33,659.25,698.46,783.99,880];MT_SHARDS.forEach((at,i)=>{pluck(at,up[i],.04,(i/11-.5)*1.4);add(at-.15,.2,.025,400,1800,'wind',(i/11-.5)*1.2,true,'shard-rise');});
add(T.armor-.5,.5,.05,300,3000,'rise',0,false,'armor-in');boom(T.armor,1.6,0,146.83);choir(T.armor,2,[73.42,110,146.83,174.61],.034);
// 8. Sừng mọc (kèn trầm dâng)
brass(T.horns,1.7,55,.06,73.42);add(T.horns,1.7,.04,150,900,'rise',0,false,'horn-grow');boom(T.horned,1.5,0,110);bell(T.horned+.02,146.83,.05);
// 9. Mặt quỷ lao vào thân, dung nham hút ngược, im lặng
add(T.dive,1.3,.07,3600,200,'wind',0,false,'face-dive');add(T.dive,1.3,.05,110,40,'brass',0,false,'face-groan');boom(T.absorbed,1.8,0,73.42);gong(T.absorbed+.02,1.2);
add(T.converge,2.9,.05,180,2600,'rise',0,false,'converge');for(let i=0;i<8;i++)add(T.converge+i*.35,.4,.03,2600,300,'wind',(i/7-.5)*1.4,true,'lava-suck');
for(let i=0;i<6;i++){const at=T.converge+i*.48;heart(at,.6+i*.12);}add(T.dark-.3,.5,.05,2400,120,'wind',0,true,'light-suck');sub(T.dark+.2,.18);
// 10. NỔ
drum(T.impact,2);add(T.impact,.18,.17,6200,500,'crack',0,true,'release-crack');sub(T.impact,.32,80,22,2.6);gong(T.impact+.02,1.7);brass(T.impact,1.8,55,.08);
add(T.impact+.08,1.6,.07,900,100,'thunder',-.35,true,'release-wave');add(T.impact+.2,1.5,.06,760,90,'thunder',.35,true,'release-wave');for(let i=0;i<10;i++)add(T.impact+.1+i*.09,.3,.025,4000,1200,'crack',(rnd(i)-.5)*1.6,true,'glass-shard');
// 11. Kèn Ma Thần — Rê thứ uy nghiêm (không chuyển trưởng: ma đạo)
strings(T.reveal,3.6,[36.71,73.42,110,146.83,174.61],.028);choir(T.reveal,3.4,[73.42,110,146.83,174.61],.036);brass(T.reveal+.2,2.4,73.42,.06);brass(T.reveal+.9,1.8,110,.05);
for(const [i,hz]of [293.66,349.23,440,587.33,440,349.23].entries())pluck(T.reveal+.3+i*.32,hz,.04-i*.003,(i%2?1:-1)*.3);bell(T.reveal+2.4,146.83,.035);add(T.reveal+2.2,1.6,.024,600,150,'wind',0,false,'release-breath');
export const MA_THAN_SCORE=Object.freeze(score.sort((a,b)=>a.at-b.at).map(Object.freeze));
// Độ lớn ×1,9 theo yêu cầu chủ game 07/11; limiter cuối giữ đỉnh dưới ngưỡng vỡ tiếng.
const LOUD=1.9;
const banks=new WeakMap();
function noise(c){if(banks.has(c))return banks.get(c);const b=c.createBuffer(1,c.sampleRate*3,c.sampleRate),d=b.getChannelData(0);let seed=71313,low=0;for(let i=0;i<d.length;i++){seed=(Math.imul(seed,1664525)+1013904223)|0;const w=seed/2147483648;low=.9*low+.1*w;d[i]=low*.9+w*.18;}banks.set(c,b);return b;}
export function maThanMusicDuck(ms){const t=ms/1000;return t<T.impact?.08:t<42.2?.12:Math.min(1,.12+(t-42.2)/1.6*.88);}
export function scheduleMaThanAudio(c,destination,elapsed=0,duration=T.duration,strength=1,event={}){
 const now=c.currentTime,pitch=qiVariant(event).pitch,scale=duration/T.duration,bus=c.createGain(),limiter=c.createDynamicsCompressor(),nodes=[bus,limiter],sources=[];let stopped=false,echo=null;
 bus.gain.value=strength;limiter.threshold.value=-10;limiter.knee.value=8;limiter.ratio.value=1;limiter.attack.value=.003;limiter.release.value=.22;const ceiling=c.createDynamicsCompressor();ceiling.threshold.value=-6;ceiling.knee.value=0;ceiling.ratio.value=1;ceiling.attack.value=.001;ceiling.release.value=.12;nodes.push(ceiling);bus.connect(limiter);limiter.connect(ceiling);ceiling.connect(destination);
 // Vang thung lũng: trễ dài, phản hồi vừa.
 if(c.createDelay){echo=c.createDelay(.6);const wet=c.createGain(),fb=c.createGain();echo.delayTime.value=.34;wet.gain.value=.16;fb.gain.value=.28;echo.connect(wet);wet.connect(bus);echo.connect(fb);fb.connect(echo);nodes.push(echo,wet,fb);}
 for(const cue of MA_THAN_SCORE){const at=cue.at*scale,len=cue.len*scale,trim=Math.max(0,elapsed-at),remain=Math.min(len-trim,duration+.8-Math.max(at,elapsed));if(remain<=0||cue.transient&&trim>.08)continue;
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
