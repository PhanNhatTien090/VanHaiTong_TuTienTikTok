// Vĩnh Kiếp Đạo Quân v2 — Vạn Kiếp Nghịch Lưu: La thứ hòa âm (u hoài kiếp xưa), đổi sang La trưởng khi hiện thân.
// 3 xoáy thời không (hút gió + nổ), 3 thời hà đập đất (thác + nổ), 8 cặp mảnh ký ức va nhau (thủy tinh + bùm),
// 3 đợt sóng cát (sóng dâng + nổ), 6 bóng tiền kiếp (chuông ngược), Sa Lậu giáng (cồng lớn) → ĐÓNG BĂNG: mọi lớp tắt,
// chỉ còn 4 tiếng gợn băng; lật sa lậu (nổ kép) → tua ngược (âm đảo chiều cao độ đi lên + 6 nhịp), hợp quá khứ/vị lai (3 cú),
// cát rót (rít mảnh), xoáy khép, tối, 2 nhịp tim, NỔ phá kiếp, La trưởng + đồng ca.
// Sinh lại public/vinh-kiep-audio.js bằng: node scripts/build-realm-audio.mjs vinh-kiep
import {qiVariant} from './qi-impact.js';import {warmWave} from './warm-wave.js';
import {VK as T,VK_PULSES,VK_EMERGE,VK_VORTEX,VK_RIVERS,VK_CLASH,VK_SURGE,VK_GHOSTS,VK_TICKS,VK_REWIND,VK_MERGE,VK_BEATS} from './vinh-kiep-awakening.js';
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
function rewindTone(at,hz,f=1,pan=0){add(at,.7,.05*f,hz,hz*2.2,'triangle',pan,true,'rewind-tone');add(at,.7,.04*f,300,2600,'rise',pan,true,'rewind-air');}
function reverseBell(at,hz,f=.04,pan=0){add(at,.9,f,hz,hz,'sine',pan,false,'reverse-bell');add(at+.85,.08,f*.8,hz*2,hz*2,'sine',pan,true,'reverse-tip');}
const A=[110,123.47,130.81,146.83,164.81,174.61,207.65,220,246.94,261.63,329.63,415.3,440];
// nền: pedal La + gió kiếp (tắt hẳn khi đóng băng)
add(.1,T.freeze-.1,.032,55,55,'triangle',0,false,'pedal');add(.3,10,.035,220,620,'wind',-.4,false,'eon-wind');add(10,9,.03,180,520,'wind',.4,false,'eon-wind');
strings(1.2,6,[55,82.41,110],.016);strings(7.6,8,[55,87.31,110,164.81],.019);strings(19,7,[55,82.41,130.81,164.81],.021);
// 1. Xoáy thời không
VK_VORTEX.forEach((at,i)=>{const pan=[-.6,0,.6][i];add(at,1,.05,3600,300,'wind',pan,true,'vortex-suck');boom(at,1.2+i*.2,pan,A[i+3]);bell(at+.05,A[i+9],.03,pan);});
VK_PULSES.forEach((at,i)=>{boom(at,1.1+i*.2,(i?1:-1)*.4,A[5+i]);add(at,.9,.06,1400,120,'thunder',(i?1:-1)*.4,true,'vortex-bolt');add(at-.3,.3,.04,500,3000,'rise',0,true,'vortex-swell');});
// 2. Thời hà đập đất
VK_RIVERS.forEach((at,i)=>{const pan=[-.6,0,.6][i];add(at,.6,.05,300,2200,'rise',pan,true,'river-fall');boom(at+.55,1.4+i*.15,pan,A[i+1]);add(at+.55,4,.035,500,900,'wind',pan,false,'river-roar');rubble(at+.6,pan,.8);});
VK_EMERGE.forEach((at,i)=>{const pan=[-.5,0,.5][i];boom(at,1+i*.1,pan,A[i+6]);glass(at+.02,[659.25,739.99,830.61][i],pan,1);add(at,.5,.04,600,2600,'rise',pan,true,'shard-emerge');});
// 3. Mảnh ký ức va nhau
VK_CLASH.forEach((at,i)=>{const pan=(i%2?1:-1)*.5;add(at,.35,.04,800,4200,'rise',pan,true,'shard-rush');boom(at+.35,1+i*.08,pan,A[(i*2)%12]);glass(at+.36,[880,987.77,1046.5,1174.66][i%4],pan,1.1);});
for(let i=0;i<14;i++)drum(12+i*.4,.4+i*.02,(i%2?1:-1)*.2);
// 4. Kiếp cũ tràn bờ + bóng tiền kiếp
VK_SURGE.forEach((at,i)=>{add(at,1.1,.05,120,900,'wind',0,true,'surge-rise');boom(at+.6,1.4+i*.2,0,A[2-i]*2);add(at+.6,1.6,.06,900,90,'thunder',(i-1)*.4,true,'surge-crash');});
VK_GHOSTS.forEach((at,i)=>{reverseBell(at-.85,A[6+i%6],.032,(i%2?1:-1)*.6);drum(at,.8,(i%2?1:-1)*.4);});choir(24,3.2,[110,130.81,164.81],.03);
// 5. Sa Lậu giáng → đóng băng (gần như tĩnh lặng)
add(T.hourglass-.5,.55,.06,400,3800,'rise',0,false,'glass-fall');boom(T.hourglass+.25,1.7,0,55);gong(T.hourglass+.27,1.15);glass(T.hourglass+.3,1318.51,0,1.5);
VK_TICKS.forEach((at,i)=>{glass(at,[1760,1567.98,1396.91,1318.51][i],(i%2?1:-1)*.3,1.2);add(at,1,.03,40,40,'sine',0,true,'frozen-hum');});
// 6. Lật + tua ngược
boom(T.flip,1.8,0,110);add(T.flip,.8,.06,2200,300,'wind',0,true,'flip-swing');boom(T.flip+.8,1.4,0,82.41);
VK_REWIND.forEach((at,i)=>{rewindTone(at,A[i+1],1,(i%2?1:-1)*.4);drum(at,.9+i*.08);sub(at,.14,30,70,.6);});
add(T.flip+.4,7,.03,60,200,'sawtooth',0,false,'rewind-drone');strings(T.flip+.6,6.5,[55,82.41,110,164.81],.02);
// 7. Hợp quá khứ + vị lai, cát rót, xoáy khép
VK_MERGE.forEach((at,i)=>{add(at,.7,.05,300,3000,'rise',(i%2?1:-1)*.6,true,'merge-rush');boom(at+.7,1.3+i*.25,0,A[i]);choir(at+.7,1.6,[110,164.81,220].map(h=>h*(1+i*.12)),.026);});
add(T.pour,2.6,.03,3200,5200,'wind',0,false,'sand-hiss');boom(T.pour,1,0,220);
add(T.collapse-.4,.5,.05,4000,200,'wind',0,true,'vortex-close');boom(T.collapse,1.6,0,55);
add(T.dark-.3,.5,.05,2400,120,'wind',0,true,'light-suck');VK_BEATS.forEach((at,i)=>heart(at,.8+i*.2));
// 8. NỔ phá kiếp
drum(T.impact,1.8);add(T.impact,.2,.13,7000,500,'crack',0,true,'release-crack');sub(T.impact,.34,90,20,3);gong(T.impact+.02,1.8);brass(T.impact,1.9,55,.08);
add(T.impact+.08,1.8,.07,1000,100,'thunder',-.35,true,'release-wave');add(T.impact+.2,1.7,.06,800,90,'thunder',.35,true,'release-wave');for(let i=0;i<12;i++)glass(T.impact+.12+i*.08,1046.5+rnd(i)*800,(rnd(i+3)-.5)*1.6,.7);
// 9. Hiện thân: La trưởng
strings(T.reveal,3.8,[55,110,164.81,220,277.18],.028);choir(T.reveal,3.6,[220,277.18,329.63,440],.036);brass(T.reveal+.2,2.4,55,.06);brass(T.reveal+1,1.8,82.41,.05);
for(const [i,hz]of [220,277.18,329.63,440,554.37,659.25].entries())pluck(T.reveal+.3+i*.3,hz,.04-i*.003,(i%2?1:-1)*.3);bell(T.reveal+2.4,220,.035);add(T.reveal+2.2,1.6,.024,600,150,'wind',0,false,'release-breath');
export const VINH_KIEP_SCORE=Object.freeze(score.sort((a,b)=>a.at-b.at).map(Object.freeze));
// Mức cue dành khoảng trống cho các lớp cộng trên bus nghi thức.
const LOUD=1.32;
const banks=new WeakMap();
function noise(c){if(banks.has(c))return banks.get(c);const b=c.createBuffer(1,c.sampleRate*3,c.sampleRate),d=b.getChannelData(0);let seed=71313,low=0;for(let i=0;i<d.length;i++){seed=(Math.imul(seed,1664525)+1013904223)|0;const w=seed/2147483648;low=.9*low+.1*w;d[i]=low*.9+w*.18;}banks.set(c,b);return b;}
export function vinhKiepMusicDuck(ms){const t=ms/1000;return t<T.impact?.08:t<T.impact+2.2?.12:Math.min(1,.12+(t-T.impact-2.2)/1.6*.88);}
export function scheduleVinhKiepAudio(c,destination,elapsed=0,duration=T.duration,strength=1,event={}){
 const now=c.currentTime,pitch=qiVariant(event).pitch,scale=duration/T.duration,bus=c.createGain(),nodes=[bus],sources=[];let stopped=false,echo=null;
 bus.gain.value=strength;bus.connect(destination);
 // Vang thung lũng: trễ dài, phản hồi vừa.
 if(c.createDelay){echo=c.createDelay(.6);const wet=c.createGain(),fb=c.createGain();echo.delayTime.value=.34;wet.gain.value=.16;fb.gain.value=.28;echo.connect(wet);wet.connect(bus);echo.connect(fb);fb.connect(echo);nodes.push(echo,wet,fb);}
 for(const cue of VINH_KIEP_SCORE){const at=cue.at*scale,len=cue.len*scale,trim=Math.max(0,elapsed-at),remain=Math.min(len-trim,duration+.8-Math.max(at,elapsed));if(remain<=0||cue.transient&&trim>.08)continue;
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
