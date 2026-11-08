// Đại Thừa v2 — âm thanh tự tổng hợp theo chất liệu: kiếm ngân/rút/vút, cồng triều tông, đá đạo bia, kiếm ý va chạm, tháp xoáy, kiếm quang rít.
// Rê thứ → Fa trưởng khi hiện thân. Không phải ghi âm thật; cùng đồng hồ với hình (DT_TIMING).
import {qiVariant} from './qi-impact.js';import {warmWave} from './warm-wave.js';
import {DT_TIMING as T,DT_BOWS,DT_STRIKES} from './dai-thua-formation.js';
const score=[],add=(at,len,level,from,to=from,kind='sine',pan=0,transient=false,tag='')=>score.push({at,len,level,from,to,kind,pan,transient,tag});
const rnd=i=>{const v=Math.sin(i*91.7+12.3)*43758.5453;return v-Math.floor(v);};
function drum(at,f=1,pan=0){add(at,.6,.17*f,110,34,'sine',pan,true,'drum');add(at,.09,.045*f,1600,200,'crack',pan,true,'drum-skin');}
function ring(at,hz,f=.035,pan=0){for(const [r,v,len] of [[1,1,1.4],[2.76,.45,.8],[5.4,.2,.35]])add(at,len,f*v,hz*r,hz*r*.997,'sine',pan,true,'sword-ring');add(at,.025,f*.8,7000,3000,'crack',pan,true,'sword-tick');}
function whoosh(at,f=.03,pan=0,up=true){add(at,.45,f,up?500:2600,up?2600:400,'wind',pan,true,'whoosh');}
function gong(at,hz,f=.07){for(const [r,v,len] of [[1,1,2.6],[1.48,.5,2],[2.3,.3,1.4]])add(at,len,f*v,hz*r,hz*r*.996,'sine',0,true,'gong');add(at,.12,f*.5,900,120,'crack',0,true,'gong-strike');}
function strings(at,len,notes,f=.02){notes.forEach((hz,i)=>{for(const d of [.997,1.003])add(at,len,f/(1+i*.35),hz*d,hz*d,'strings',(i%2?1:-1)*.24,false,'strings');});}
function pluck(at,hz,f=.035,pan=0){add(at,.85,f,hz,hz*.994,'triangle',pan,true,'zither');add(at,.25,f*.18,hz*3,hz*2.98,'sine',pan,true,'zither-harmonic');}
function thunder(at,f=1,pan=0){add(at,.07,.12*f,4200,600,'crack',pan,true,'clash-crack');add(at+.07,1,.08*f,320,60,'thunder',pan,true,'clash-roll');}
// 1. Thung lũng rung, kiếm ngân dậy
drum(T.quake,1.1);add(T.quake,2.6,.05,48,38,'triangle',0,false,'quake-rumble');add(T.quake,1.8,.03,180,90,'thunder',0,false,'quake-earth');
for(let i=0;i<10;i++)ring(.2+i*.07,[587.33,698.46,880,1046.5][i%4]*(1+rnd(i)*.02),.012,(rnd(i+3)-.5)*1.6);
// 2. Vạn kiếm rút khỏi núi theo từng đợt xa → gần
for(let i=0;i<26;i++){const at=T.rise+.15+i*.1+rnd(i+20)*.05,pan=(rnd(i+30)-.5)*1.6;add(at,.12,.025,4800,1600,'crack',pan,true,'sword-draw');if(i%3===0)whoosh(at+.05,.022,pan);}
add(.4,10,.03,73.42,73.42,'triangle',0,false,'valley-drone');strings(.6,2.4,[73.42,110,146.83],.012);
// 3. Sông kiếm vun vút + chủ đề Rê thứ
add(T.river,3.2,.04,600,1400,'wind',-.4,false,'river-rush');add(T.river+.4,3,.035,900,500,'wind',.4,false,'river-rush');
const motif=[293.66,349.23,440,523.25,440,349.23,293.66,261.63];for(let i=0;i<18;i++){const at=3+i*.42;if(at>10.6)break;pluck(at,motif[i%8],i<8?.024:.03,(i%2?1:-1)*.3);if(i%4===0)drum(at,.3);}
strings(T.river+.2,2.8,[146.83,220,293.66],.016);
// 4. Ba đợt triều tông: cồng + chuỗi kiếm ngân chạy dọc sông
DT_BOWS.forEach((at,k)=>{gong(at,[73.42,82.41,98][k],.075);for(let i=0;i<8;i++)ring(at+.08+i*.07,[587.33,659.25,698.46,783.99,880,987.77,1046.5,1174.66][i]*(k===2?1.06:1),.013,(i/7-.5)*1.4);});
strings(T.bow,3,[73.42,146.83,174.61,220],.022);
// 5. Đại Đạo trải ra, chín đạo bia trồi lên
add(T.road,1.6,.04,200,1800,'rise',0,false,'road-unroll');for(let i=0;i<9;i++){const at=T.road+.8+i*.18;add(at,.35,.06,95,60,'sine',(i%2?1:-1)*.5,true,'tablet-stone');add(at,.08,.03,700,200,'crack',(i%2?1:-1)*.5,true,'tablet-grind');}
strings(T.road+.5,2.5,[87.31,130.81,174.61,261.63],.02);
// 6. Ba kiếm ý: vút → va kim loại + sấm + kiếm ngân dội
DT_STRIKES.forEach((at,k)=>{const pan=k===1?.4:-.4;whoosh(at-.4,.06,pan,false);ring(at,233.08*2**(k/6),.06,pan);thunder(at,.8,pan);drum(at,.8,pan);});
// 7. Tháp kiếm xoáy dâng, nhịp dồn
add(T.tower,2.6,.05,300,2400,'rise',0,false,'tower-spiral');for(let i=0;i<12;i++)whoosh(T.tower+i*.22,.018,(i%2?1:-1)*.6);
for(const [i,at]of [16.2,16.7,17.1,17.45,17.75,18,18.2,18.4,18.6,18.75].entries())drum(at,.3+i*.05);
// 8. Kiếm quang rít khi lao vào đan điền
add(T.dive,.5,.05,3200,600,'sine',0,true,'dive-whistle');add(T.dive,.5,.035,2400,300,'wind',0,true,'dive-air');add(T.contract,1,.05,180,2200,'rise',0,false,'compression-riser');
// 9. Nổ (impact-audio dùng chung thêm bass/cồng)
drum(T.impact,1.7);add(T.impact,.18,.16,6200,500,'crack',0,true,'release-crack');for(let i=0;i<14;i++)ring(T.impact+.02+i*.03,[698.46,880,1046.5,1396.9][i%4]*(1+rnd(i+70)*.04),.02,(rnd(i+80)-.5)*1.6);
add(T.impact+.12,1.3,.07,850,110,'thunder',-.35,true,'release-wave');add(T.impact+.22,1.2,.06,700,95,'thunder',.35,true,'release-wave');gong(T.impact+.05,87.31,.09);
// 10. Hiện thân Fa trưởng + vạn kiếm cắm lại núi (tiếng ngân rải)
strings(T.reveal,3,[87.31,130.81,174.61,220,261.63],.028);add(T.reveal,2.8,.044,87.31,87.31,'triangle',0,false,'reveal-pedal');
for(const [i,hz]of [523.25,698.46,880,1046.5,880,698.46].entries())pluck(19.5+i*.3,hz,.04-i*.003,(i%2?1:-1)*.3);
for(let i=0;i<16;i++)ring(19.4+i*.06+rnd(i+90)*.04,[1046.5,1174.66,1396.9,1567.98][i%4],.009,(rnd(i+95)-.5)*1.8);add(21.2,1.4,.022,650,160,'wind',0,false,'release-breath');
// v2.1 (07/11): lớp bổ sung — hợp xướng, kèn đồng, sub-bass, tiếng dâng trước cú lớn.
function choir(at,len,notes,f=.03){notes.forEach((hz,i)=>{for(const d of [.995,1.005])add(at,len,f/(1+i*.3),hz*d,hz*d,'choir',(i%2?1:-1)*.3,false,'choir');});}
function brass(at,len,hz,f=.05){add(at,len,f,hz,hz,'brass',0,false,'brass');add(at,len,f*.6,hz*1.5,hz*1.5,'brass',0,false,'brass-fifth');}
function sub(at,f=.2,from=70,to=28,len=1.4){add(at,len,f,from,to,'sine',0,true,'sub-boom');}
function swellTo(at,len=1.2,f=.05){add(at-len,len,f,200,3000,'rise',0,false,'pre-swell');}
sub(T.quake,.3,60,25,2);for(let i=0;i<16;i++)drum(T.rise+i*.17,.4+(i%4===0?.3:0),(i%2?1:-1)*.3);
choir(T.river,3,[146.83,220,293.66],.03);add(T.river,3,.02,2400,3200,'wind',0,false,'river-shimmer');
DT_BOWS.forEach((b,k)=>{brass(b,1.2,[73.42,82.41,98][k],.07);sub(b,.2);});
brass(T.road,2.4,87.31,.06);choir(T.road+.4,2.6,[174.61,220,261.63,349.23],.032);
DT_STRIKES.forEach(at=>{swellTo(at,.45,.05);sub(at,.3);});
choir(T.tower,2.8,[146.83,174.61,220,293.66],.035);for(let i=0;i<14;i++)drum(15.2+i*.18,.3,(i%2?1:-1)*.3);
sub(T.absorbed,.2);swellTo(T.impact,1.5,.08);
sub(T.impact,.35,80,24,2.2);brass(T.impact,1.6,87.31,.09);choir(T.reveal,3,[174.61,220,261.63,349.23],.035);brass(T.reveal+.2,2.2,87.31,.05);
export const DAI_THUA_SCORE=Object.freeze(score.sort((a,b)=>a.at-b.at).map(Object.freeze));
// Độ lớn ×1,9 theo yêu cầu chủ game 07/11; limiter cuối giữ đỉnh dưới ngưỡng vỡ tiếng.
const LOUD=1.9;
const banks=new WeakMap();
function noise(c){if(banks.has(c))return banks.get(c);const b=c.createBuffer(1,c.sampleRate*3,c.sampleRate),d=b.getChannelData(0);let seed=77213,low=0;for(let i=0;i<d.length;i++){seed=(Math.imul(seed,1664525)+1013904223)|0;const w=seed/2147483648;low=.9*low+.1*w;d[i]=low*.9+w*.18;}banks.set(c,b);return b;}
export function daiThuaMusicDuck(ms){const t=ms/1000;return t<T.trial?.2:t<T.impact?.08:t<21?.12:Math.min(1,.12+(t-21)/1.6*.88);}
export function scheduleDaiThuaAudio(c,destination,elapsed=0,duration=T.duration,strength=1,event={}){
 const now=c.currentTime,pitch=qiVariant(event).pitch,scale=duration/T.duration,bus=c.createGain(),limiter=c.createDynamicsCompressor(),nodes=[bus,limiter],sources=[];let stopped=false,echo=null;
 bus.gain.value=strength;limiter.threshold.value=-10;limiter.knee.value=8;limiter.ratio.value=1;limiter.attack.value=.003;limiter.release.value=.22;const ceiling=c.createDynamicsCompressor();ceiling.threshold.value=-6;ceiling.knee.value=0;ceiling.ratio.value=1;ceiling.attack.value=.001;ceiling.release.value=.12;nodes.push(ceiling);bus.connect(limiter);limiter.connect(ceiling);ceiling.connect(destination);
 // Vang thung lũng: trễ dài, phản hồi vừa.
 if(c.createDelay){echo=c.createDelay(.6);const wet=c.createGain(),fb=c.createGain();echo.delayTime.value=.31;wet.gain.value=.16;fb.gain.value=.28;echo.connect(wet);wet.connect(bus);echo.connect(fb);fb.connect(echo);nodes.push(echo,wet,fb);}
 for(const cue of DAI_THUA_SCORE){const at=cue.at*scale,len=cue.len*scale,trim=Math.max(0,elapsed-at),remain=Math.min(len-trim,duration+.8-Math.max(at,elapsed));if(remain<=0||cue.transient&&trim>.08)continue;
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
