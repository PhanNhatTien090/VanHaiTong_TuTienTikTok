// Chân Tiên v4 — âm thanh tự tổng hợp: kiếp lôi, gió bão, ngũ linh căn (5 âm sắc), Tiên Môn (hợp xướng + kèn), phi thăng, thế giới tiên, rồng ngâm, tiên châu.
// La thứ → La trưởng khi hiện thân. Không phải ghi âm thật; cùng đồng hồ với hình (CT_TIMING). Gồm sẵn lớp ×2 (hợp xướng, kèn, sub, LOUD).
// Sinh bởi scripts/build-chan-tien-audio.cjs từ scripts/chan-tien-score.txt.
import {qiVariant} from './qi-impact.js';import {warmWave} from './warm-wave.js';
import {CT_TIMING as T,CT_WAVE1,CT_WAVE2} from './chan-tien-formation.js';
const score=[],add=(at,len,level,from,to=from,kind='sine',pan=0,transient=false,tag='')=>score.push({at,len,level,from,to,kind,pan,transient,tag});
const rnd=i=>{const v=Math.sin(i*91.7+12.3)*43758.5453;return v-Math.floor(v);};
function drum(at,f=1,pan=0){add(at,.6,.17*f,105,32,'sine',pan,true,'drum');add(at,.09,.045*f,1600,200,'crack',pan,true,'drum-skin');}
function strings(at,len,notes,f=.02){notes.forEach((hz,i)=>{for(const d of [.997,1.003])add(at,len,f/(1+i*.35),hz*d,hz*d,'strings',(i%2?1:-1)*.24,false,'strings');});}
function pluck(at,hz,f=.035,pan=0){add(at,.85,f,hz,hz*.994,'triangle',pan,true,'zither');add(at,.25,f*.18,hz*3,hz*2.98,'sine',pan,true,'zither-harmonic');}
function choir(at,len,notes,f=.03){notes.forEach((hz,i)=>{for(const d of [.995,1.005])add(at,len,f/(1+i*.3),hz*d,hz*d,'choir',(i%2?1:-1)*.3,false,'choir');});}
function brass(at,len,hz,f=.05){add(at,len,f,hz,hz,'brass',0,false,'brass');add(at,len,f*.6,hz*1.5,hz*1.5,'brass',0,false,'brass-fifth');}
function sub(at,f=.2,from=70,to=28,len=1.4){add(at,len,f,from,to,'sine',0,true,'sub-boom');}
function swellTo(at,len=1.2,f=.05){add(at-len,len,f,200,3000,'rise',0,false,'pre-swell');}
function thunder(at,f=1,pan=0){add(at,.08,.14*f,5000,600,'crack',pan,true,'bolt-crack');add(at+.06,1.5,.1*f,340,55,'thunder',pan,true,'bolt-roll');sub(at,.22*f,72,26,1.6);}
function bell(at,hz,f=.04,pan=0){for(const [r,v,len] of [[1,1,1.8],[2.76,.4,1],[5.4,.15,.45]])add(at,len,f*v,hz*r,hz*r*.998,'sine',pan,true,'bell');}
// Ngũ linh căn: 5 âm sắc theo hành (kim chuông, mộc gõ gỗ, thủy giọt nước, hỏa lửa tách, thổ đất dội)
const ELEMENT=[
 (at,p)=>bell(at,880,.05,p),
 (at,p)=>{add(at,.18,.08,330,300,'triangle',p,true,'wood');add(at+.1,.18,.05,392,360,'triangle',p,true,'wood');},
 (at,p)=>{for(let i=0;i<3;i++)add(at+i*.09,.25,.04,1400-i*200,500-i*60,'sine',p,true,'water-drop');},
 (at,p)=>{for(let i=0;i<6;i++)add(at+i*.05,.04,.04,3000+rnd(i)*2000,900,'crack',p,true,'fire-crackle');add(at,.8,.04,700,1600,'wind',p,true,'fire-whoosh');},
 (at,p)=>{add(at,.5,.12,90,50,'sine',p,true,'earth-thud');add(at,.12,.05,600,150,'crack',p,true,'earth-grit');}];
// 1. Sét khai mở + kiếp vân tụ
thunder(T.flash,1.3);add(.2,3.6,.05,180,500,'wind',0,false,'gale');add(.3,13.5,.032,55,55,'triangle',0,false,'storm-drone');strings(.5,3,[110,130.81,164.81],.014);
for(let i=0;i<8;i++)drum(.6+i*.42,.3+i*.03,(i%2?1:-1)*.2);
// 2. Đợt kiếp 1
CT_WAVE1.forEach((at,k)=>{swellTo(at,.6,.035);thunder(at,1,(k-1)*.5);drum(at,.8);});
// 3. Ngũ linh căn bay lên, biến hình, khóa ngũ giác
for(let i=0;i<5;i++){const at=T.roots+i*.25,p=(i/4-.5)*1.4;add(at,.9,.025,300,1500,'rise',p,true,'root-rise');ELEMENT[i](T.roots+1.4+i*.18,p);}
const motif=[220,261.63,329.63,392,329.63,261.63,220,196];for(let i=0;i<16;i++){const at=6.8+i*.45;if(at>14)break;pluck(at,motif[i%8],.03,(i%2?1:-1)*.3);}
choir(T.formed,1.6,[220,261.63,329.63],.03);brass(T.formed,1.2,110,.05);bell(T.formed,440,.05);
// 4. Đợt kiếp 2 (tím): ngũ giác hấp thụ
CT_WAVE2.forEach((at,k)=>{swellTo(at,.5,.04);thunder(at,1.2,(k-1)*.5);bell(at+.12,[523.25,587.33,659.25][k],.05);});
strings(10.6,3.4,[110,164.81,220,261.63],.022);
// 5. Đợt kiếp 3: tích lực, cột sét vàng, hợp nhất
add(T.charge,1.4,.07,120,2400,'rise',0,false,'column-charge');for(let i=0;i<10;i++)drum(T.charge+i*.13,.3+i*.05);thunder(T.column,1.8);brass(T.column,1.6,82.41,.09);
for(let i=0;i<5;i++)ELEMENT[i](T.merge+.4+i*.12,(i/4-.5)*.8);bell(T.merge+1.1,329.63,.06);
// 6. Tiên Môn mở: hợp xướng + kèn hiệu triệu
add(T.gate,1.2,.05,2600,600,'wind',0,false,'cloud-part');choir(T.gate,3,[220,277.18,329.63,440],.04);brass(T.gate+.4,2,110,.07);brass(T.gate+1.2,1.8,164.81,.06);
add(T.beam,1.2,.04,400,2400,'rise',0,false,'beam-descend');
// 7. Phi thăng xuyên mây
add(T.ascend,3,.06,200,3200,'rise',0,false,'ascension-rise');add(T.ascend,3,.05,300,1800,'wind',0,false,'ascension-wind');choir(T.ascend+.3,2.8,[277.18,329.63,440,554.37],.035);
for(let i=0;i<8;i++)add(T.ascend+.3+i*.33,.4,.03,2000,500,'wind',(i%2?1:-1)*.6,true,'cloud-pass');sub(T.through,.25,60,30,1.2);bell(T.through,880,.06);
// 8. Thế giới tiên: đàn sáng, rồng ngâm (tổng hợp, không phải tiếng rồng thật), tiên châu
strings(T.heaven,4.8,[220,277.18,329.63,440],.022);for(let i=0;i<10;i++)pluck(T.heaven+.4+i*.38,[440,554.37,659.25,880,659.25][i%5],.03,(i%2?1:-1)*.35);
add(T.dragon+.2,1.4,.06,180,90,'brass',-.3,true,'dragon-roar');add(T.dragon+.2,1.2,.04,900,300,'wind',-.3,true,'dragon-breath');
bell(T.pearl,1318.5,.05);add(T.pearl+1,1.9,.035,600,2600,'rise',0,false,'pearl-flight');
// 9. Nén + nổ
for(let i=0;i<10;i++)drum(26.4+i*.07,.3+i*.05);swellTo(T.impact,1.6,.08);sub(T.absorbed,.2);
drum(T.impact,1.7);add(T.impact,.18,.16,6200,500,'crack',0,true,'release-crack');sub(T.impact,.24,80,24,2.2);brass(T.impact,1.6,110,.065);
add(T.impact+.12,1.3,.07,850,110,'thunder',-.35,true,'release-wave');add(T.impact+.22,1.2,.06,700,95,'thunder',.35,true,'release-wave');
// 10. Hiện thân La trưởng
strings(T.reveal,3.2,[110,138.59,164.81,220,277.18],.028);choir(T.reveal,3,[220,277.18,329.63,440],.035);brass(T.reveal+.2,2.2,110,.05);
for(const [i,hz]of [554.37,659.25,880,1108.73,880,659.25].entries())pluck(27.8+i*.3,hz,.04-i*.003,(i%2?1:-1)*.3);bell(29.8,1760,.03);add(29.5,1.4,.022,650,160,'wind',0,false,'release-breath');
export const CHAN_TIEN_SCORE=Object.freeze(score.sort((a,b)=>a.at-b.at).map(Object.freeze));
// Độ lớn ×1,9 theo yêu cầu chủ game 07/11; limiter cuối giữ đỉnh dưới ngưỡng vỡ tiếng.
const LOUD=1.9;
const banks=new WeakMap();
function noise(c){if(banks.has(c))return banks.get(c);const b=c.createBuffer(1,c.sampleRate*3,c.sampleRate),d=b.getChannelData(0);let seed=31337,low=0;for(let i=0;i<d.length;i++){seed=(Math.imul(seed,1664525)+1013904223)|0;const w=seed/2147483648;low=.9*low+.1*w;d[i]=low*.9+w*.18;}banks.set(c,b);return b;}
export function chanTienMusicDuck(ms){const t=ms/1000;return t<T.gate?.18:t<T.impact?.08:t<29.6?.12:Math.min(1,.12+(t-29.6)/1.6*.88);}
export function scheduleChanTienAudio(c,destination,elapsed=0,duration=T.duration,strength=1,event={}){
 const now=c.currentTime,pitch=qiVariant(event).pitch,scale=duration/T.duration,bus=c.createGain(),limiter=c.createDynamicsCompressor(),nodes=[bus,limiter],sources=[];let stopped=false,echo=null;
 bus.gain.value=strength;limiter.threshold.value=-10;limiter.knee.value=8;limiter.ratio.value=1;limiter.attack.value=.003;limiter.release.value=.22;const ceiling=c.createDynamicsCompressor();ceiling.threshold.value=-6;ceiling.knee.value=0;ceiling.ratio.value=1;ceiling.attack.value=.001;ceiling.release.value=.12;nodes.push(ceiling);bus.connect(limiter);limiter.connect(ceiling);ceiling.connect(destination);
 // Vang thung lũng: trễ dài, phản hồi vừa.
 if(c.createDelay){echo=c.createDelay(.6);const wet=c.createGain(),fb=c.createGain();echo.delayTime.value=.34;wet.gain.value=.16;fb.gain.value=.28;echo.connect(wet);wet.connect(bus);echo.connect(fb);fb.connect(echo);nodes.push(echo,wet,fb);}
 for(const cue of CHAN_TIEN_SCORE){const at=cue.at*scale,len=cue.len*scale,trim=Math.max(0,elapsed-at),remain=Math.min(len-trim,duration+.8-Math.max(at,elapsed));if(remain<=0||cue.transient&&trim>.08)continue;
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
