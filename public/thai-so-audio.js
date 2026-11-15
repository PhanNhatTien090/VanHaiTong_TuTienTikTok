// Thái Sơ Giới Chủ v2 — Vạn Lục Quy Đồ: ngũ cung Rê (đất, núi), trống trận đá, kết bằng hợp âm Rê trưởng mở.
// 3 địa chấn (sub + đá vỡ), 8 địa mạch (vút điện ngọc), 5 vòng la bàn khóa (chuông đồng + bùm), trục trời (nổ lớn + kèn),
// 4 lục địa trồi (gầm đất + đá rơi), 5 cú lệch trục (nổ + sấm), Địa Long gầm (gầm tổng hợp giả tưởng) + 3 vòng quấn,
// 12 kinh mạch (chuông ngọc), Thiên Đồ trải (gió giấy), 4 ấn đóng (trống + gỗ), 3 lần gấp, 4 lục địa nhập thể, rồng lao vào,
// tối, 2 nhịp tim, NỔ khai giới, hợp âm Rê trưởng + đồng ca.
// Sinh lại public/thai-so-audio.js bằng: node scripts/build-realm-audio.mjs thai-so
import {qiVariant} from './qi-impact.js';import {warmWave} from './warm-wave.js';
import {TS as T,TS_QUAKES,TS_VEINS,TS_RINGS,TS_LANDS,TS_TILTS,TS_COILS,TS_CHANNELS,TS_STAMPS,TS_FOLDS,TS_ABSORB,TS_BEATS} from './thai-so-awakening.js';
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
function roar(at,f=1,pan=0){add(at,1.8,.09*f,160,70,'sawtooth',pan,true,'roar-body');add(at,1.6,.07*f,600,180,'wind',pan,true,'roar-breath');add(at+.05,1.4,.05*f,240,95,'brass',pan,true,'roar-horn');sub(at,.22*f,60,24,1.8);}
function woodblock(at,f=1,pan=0){add(at,.08,.06*f,1100,900,'triangle',pan,true,'wood');add(at,.05,.05*f,2600,800,'crack',pan,true,'wood-click');}
const D=[146.83,164.81,185,220,246.94,293.66,329.63,369.99,440,493.88,587.33];
// nền: pedal Rê thấp + gió núi
add(.1,T.dark-.1,.032,36.71,36.71,'triangle',0,false,'pedal');add(.3,9,.035,180,520,'wind',-.4,false,'mountain-wind');add(9,10,.03,160,480,'wind',.4,false,'mountain-wind');
strings(2.2,6,[73.42,110,146.83],.016);strings(11,7,[73.42,110,146.83,220],.019);strings(26.2,6.5,[73.42,123.47,146.83,220],.02);
// 1. Địa chấn
TS_QUAKES.forEach((at,i)=>{boom(at,1.1+i*.25,(i-1)*.3,110);rubble(at+.05,(i-1)*.4,1.4);add(at,1.4,.07,900,90,'thunder',0,true,'quake-rumble');});
// 2. Địa mạch
TS_VEINS.forEach((at,i)=>{const pan=(i%2?1:-1)*.7;add(at,.5,.04,600,3600,'rise',pan,true,'vein-zip');pluck(at+.05,D[i%8+2],.034,pan);drum(at,.75+(i%2)*.2,pan);if(i%2)sub(at,.12,80,30,.8);});
// 3. La bàn 5 vòng + trục trời
TS_RINGS.forEach((at,i)=>{boom(at,.9+i*.12,0,D[i]);bell(at+.02,D[i+4],.035,(i%2?1:-1)*.3);woodblock(at,.8);});
add(T.axis-.7,.7,.06,300,4200,'rise',0,false,'axis-in');boom(T.axis,1.9,0,146.83);gong(T.axis+.02,1.3);brass(T.axis+.05,1.8,73.42,.06);choir(T.axis+.2,3,[146.83,220,293.66],.03);
// 4. Lục địa trồi
TS_LANDS.forEach((at,i)=>{const pan=[-.6,.6,-.5,.5][i];add(at-.8,.9,.05,90,240,'wind',pan,false,'land-rise');boom(at+.6,1.3+i*.12,pan,D[i+1]);rubble(at+.7,pan,1.2);add(at+.6,1.4,.06,700,80,'thunder',pan,true,'land-rumble');});
// 5. Lệch thiên trục
TS_TILTS.forEach((at,i)=>{const pan=(i%2?1:-1)*.5;boom(at,1.1+i*.15,pan,D[6-i]);add(at,1.2,.07,1300,110,'thunder',pan,true,'tilt-thunder');rubble(at+.1,pan,1);});
add(TS_TILTS[0],3.6,.03,220,90,'sawtooth',0,false,'tilt-groan');
// 6. Địa Long
add(T.dragon-.6,.6,.05,80,600,'rise',.5,false,'dragon-surge');roar(T.dragon+.9,1.15,.3);boom(T.dragon+.9,1.65,0,73.42);
TS_COILS.forEach((at,i)=>{boom(at,1+i*.2,(i%2?1:-1)*.5,D[i+2]);add(at,.7,.05,400,1800,'wind',(i%2?-1:1)*.6,true,'coil-whoosh');});roar(TS_COILS[2]+.2,.8,-.3);
for(let i=0;i<16;i++)drum(T.dragon+1.4+i*.27,.45+i*.02,(i%2?1:-1)*.2);
// 7. Kinh mạch
TS_CHANNELS.forEach((at,i)=>{bell(at+.45,D[(i*3)%11],.026,(i%2?1:-1)*.5);add(at,.45,.025,500,2400,'rise',(i%2?1:-1)*.5,true,'channel-flow');if(i%3===2)drum(at+.45,.6);});
// 8. Thiên Đồ + 4 ấn + 3 lần gấp
add(T.map,1.2,.05,300,2600,'wind',0,true,'scroll-unroll');boom(T.map+.3,1,0,220);
TS_STAMPS.forEach((at,i)=>{const pan=[-.5,.5,-.4,.4][i];boom(at,1.4+i*.1,pan,D[i]);woodblock(at,1.5,pan);bell(at+.03,D[i+5],.03,pan);});
TS_FOLDS.forEach((at,i)=>{boom(at,1+i*.25,0,D[3-i]);add(at,.3,.05,1800,400,'wind',0,true,'fold-snap');});
// 9. Lục địa nhập thể + rồng lao vào
TS_ABSORB.forEach((at,i)=>{add(at,.55,.05,2400,200,'wind',(i%2?1:-1)*.4,true,'absorb-rush');boom(at+.55,1.4+i*.2,0,D[3-i]/2);});
add(T.dragonIn-.3,.8,.06,3600,120,'wind',0,true,'dragon-dive');roar(T.dragonIn,.9,0);boom(T.dragonIn+.5,2,0,73.42);
add(T.dark-.3,.5,.05,2400,120,'wind',0,true,'light-suck');TS_BEATS.forEach((at,i)=>heart(at,.8+i*.2));
// 10. NỔ khai giới
drum(T.impact,1.8);add(T.impact,.2,.13,7000,500,'crack',0,true,'release-crack');sub(T.impact,.34,90,20,3);gong(T.impact+.02,1.8);brass(T.impact,1.9,73.42,.08);
add(T.impact+.08,1.8,.07,1000,100,'thunder',-.35,true,'release-wave');add(T.impact+.2,1.7,.06,800,90,'thunder',.35,true,'release-wave');rubble(T.impact+.1,-.5,1.6);rubble(T.impact+.18,.5,1.6);
// 11. Hiện thân: Rê trưởng
strings(T.reveal,3.8,[36.71,73.42,110,146.83,220],.028);choir(T.reveal,3.6,[146.83,185,220,293.66],.036);brass(T.reveal+.2,2.4,73.42,.06);brass(T.reveal+1,1.8,110,.05);
for(const [i,hz]of [293.66,369.99,440,587.33,739.99,880].entries())pluck(T.reveal+.3+i*.3,hz,.04-i*.003,(i%2?1:-1)*.3);bell(T.reveal+2.4,293.66,.035);add(T.reveal+2.2,1.6,.024,600,150,'wind',0,false,'release-breath');
export const THAI_SO_SCORE=Object.freeze(score.sort((a,b)=>a.at-b.at).map(Object.freeze));
// Mức cue dành khoảng trống cho các lớp cộng trên bus nghi thức.
const LOUD=1.32;
const banks=new WeakMap();
function noise(c){if(banks.has(c))return banks.get(c);const b=c.createBuffer(1,c.sampleRate*3,c.sampleRate),d=b.getChannelData(0);let seed=71313,low=0;for(let i=0;i<d.length;i++){seed=(Math.imul(seed,1664525)+1013904223)|0;const w=seed/2147483648;low=.9*low+.1*w;d[i]=low*.9+w*.18;}banks.set(c,b);return b;}
export function thaiSoMusicDuck(ms){const t=ms/1000;return t<T.impact?.08:t<T.impact+2.2?.12:Math.min(1,.12+(t-T.impact-2.2)/1.6*.88);}
export function scheduleThaiSoAudio(c,destination,elapsed=0,duration=T.duration,strength=1,event={}){
 const now=c.currentTime,pitch=qiVariant(event).pitch,scale=duration/T.duration,bus=c.createGain(),nodes=[bus],sources=[];let stopped=false,echo=null;
 bus.gain.value=strength;bus.connect(destination);
 // Vang thung lũng: trễ dài, phản hồi vừa.
 if(c.createDelay){echo=c.createDelay(.6);const wet=c.createGain(),fb=c.createGain();echo.delayTime.value=.34;wet.gain.value=.16;fb.gain.value=.28;echo.connect(wet);wet.connect(bus);echo.connect(fb);fb.connect(echo);nodes.push(echo,wet,fb);}
 for(const cue of THAI_SO_SCORE){const at=cue.at*scale,len=cue.len*scale,trim=Math.max(0,elapsed-at),remain=Math.min(len-trim,duration+.8-Math.max(at,elapsed));if(remain<=0||cue.transient&&trim>.08)continue;
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
