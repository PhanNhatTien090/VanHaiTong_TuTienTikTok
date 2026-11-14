// Tiên Đế v1 — Đăng Cơ: 3 tiếng gõ cổng gỗ đồng + cổng kẽo kẹt mở, 9 tiếng đá đặt bậc, 8 cột sáng giáng, 6 làn hô bái,
// Cửu Đỉnh (chiêng đồng trầm + lửa phụt), thánh chỉ trải (gió), 4 chữ đóng, ngọc tỷ đóng ấn (cú lớn nhất trước nổ),
// ngai trồi (kèn), 12 tia (gảy cung La trưởng đi lên), mũ miện (chuông rơi), VẠN TUẾ ×3, hút sáng, nổ, kèn đăng quang.
// La thứ → La trưởng. Sinh từ scripts/tien-de-score.txt (bộ máy cue dùng chung có lớp ×2).
import {qiVariant} from './qi-impact.js';import {warmWave} from './warm-wave.js';
import {TD as T,TD_KNOCKS,TD_STEPS,TD_LANDS,TD_BOWS,TD_TRIPODS,TD_WORDS,TD_RAYS,TD_CHEERS,TD_SUCK} from './tien-de-awakening.js';
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
function boom(at,f=1,pan=0,metal=440){sub(at,.2*f,75,26,1.2);drum(at,.9*f,pan);add(at,.12,.1*f,5200,700,'crack',pan,true,'boom-crack');bell(at+.01,metal,.035*f,pan);}
function gong(at,f=1,pan=0){sub(at,.22*f,60,30,2);add(at,2.4,.07*f,110,104,'triangle',pan,true,'gong');add(at,2,.04*f,233,226,'sine',pan,true,'gong-hum');add(at,1.4,.03*f,413,401,'sine',pan,true,'gong-shimmer');drum(at,1*f,pan);}
function shout(at,f=1){choir(at,.42,[110,138.59,164.81,220],.05*f);add(at,.4,.08*f,140,110,'brass',0,true,'shout');drum(at,1.2*f);}
// trống đại lễ dồn suốt cảnh
for(let i=0;i<90;i++){const at=.4+i*.33;if(at>T.dark)break;drum(at,(i%4===0?.55:.28)+Math.min(.25,at/T.dark*.25),(i%2?1:-1)*.25);}
add(.2,29,.034,55,55,'triangle',0,false,'pedal');strings(.3,3.2,[110,130.81,164.81],.016);
// 1. Gõ cổng 3 lần, cổng mở
TD_KNOCKS.forEach((at,i)=>{boom(at,1.3,0,[220,196,164.81][i]);add(at,.25,.12,180,90,'triangle',0,true,'door-wood');add(at+.02,.8,.05,620,580,'sine',0,true,'door-metal');});
add(T.open,1,.07,70,160,'sawtooth',0,false,'gate-creak');add(T.open,1.1,.07,200,3200,'rise',0,false,'gate-light');boom(T.open+.9,1.6,0,329.63);brass(T.open+.9,2,110,.07);choir(T.open+.9,2.2,[110,164.81,220,277.18],.034);
// 2. 9 bậc thềm ngọc đặt xuống, trái/phải luân phiên
TD_STEPS.forEach((at,i)=>{const pan=(i%2?1:-1)*.6;add(at-.28,.28,.04,400,2400,'wind',pan,true,'step-whoosh');boom(at,.85,pan,[220,246.94,277.18,293.66,329.63,369.99,415.3,440,493.88][i]);add(at,.1,.1,900,300,'crack',pan,true,'stone');});
// 3. Thiên binh giáng: 8 cột sáng; 6 làn hô bái
TD_LANDS.forEach((at,i)=>{add(at-.3,.3,.05,800,3600,'rise',(i%2?1:-1)*.6,true,'beam-fall');boom(at,.7,(i%2?1:-1)*.6,659.25);add(at,.15,.05,3000,1200,'crack',(i%2?1:-1)*.6,true,'armor');});
TD_BOWS.forEach((at,i)=>shout(at,i>3?1.3:.8));brass(TD_BOWS[4],1.6,55,.07);
// 4. Cửu Đỉnh: chiêng đồng + lửa phụt
TD_TRIPODS.forEach((at,i)=>{const pan=(i%2?1:-1)*(.8-i*.08);add(at-.35,.35,.04,2600,500,'wind',pan,true,'tripod-fall');gong(at,1,pan);add(at+.08,.8,.06,300,1600,'wind',pan,true,'fire-burst');});
// 5. Thánh chỉ trải + 4 chữ
add(T.edict,1,.07,300,2600,'wind',0,false,'scroll-unroll');strings(T.edict,3.4,[110,164.81,220,261.63],.022);
TD_WORDS.forEach((at,i)=>{boom(at,1,(i%2?1:-1)*.4,[440,523.25,587.33,659.25][i]);pluck(at+.05,[880,1046.5,1174.66,1318.5][i],.04);});
// 6. Ngọc tỷ giáng → đóng ấn
add(T.seal,1.1,.05,100,60,'brass',0,false,'seal-descend');swellTo(T.stamp,1.1,.08);add(T.stamp-.12,.12,.06,3000,300,'wind',0,true,'seal-drop');
boom(T.stamp,2.2,0,164.81);gong(T.stamp+.02,1.4);add(T.stamp,1.6,.09,900,90,'thunder',0,true,'seal-wave');add(T.dissolve,1.6,.04,4000,800,'wind',0,true,'glyph-rain');for(let i=0;i<8;i++)bell(T.dissolve+i*.12,1318.5*2**(-i/12),.018,(rnd(i)-.5)*1.4);
// 7. Ngai trồi + 12 tia (La trưởng đi lên)
add(T.throne,1.2,.06,60,140,'brass',0,false,'throne-rise');boom(T.throne+1,1.4,0,220);brass(T.throne+1,2.4,55,.07);choir(T.throne+1,2.6,[110,138.59,164.81,220],.034);
const up=[440,493.88,554.37,659.25,739.99,880,987.77,1108.73,1318.5,1479.98,1760,1975.53];TD_RAYS.forEach((at,i)=>{pluck(at,up[i],.04,(i/11-.5)*1.4);if(i%3===2)boom(at,.6,(i/11-.5)*1.2,up[i]/2);});
// 8. Mũ miện rơi xuống
add(T.crown,1.2,.05,3000,600,'wind',0,false,'crown-fall');for(let i=0;i<6;i++)bell(T.crown+i*.18,1760*2**(-i/7),.02,(i%2?1:-1)*.5);boom(T.crowned,1.6,0,880);bell(T.crowned+.02,440,.07);
// 9. VẠN TUẾ ×3, Cửu Đỉnh bùng, hút sáng
TD_CHEERS.forEach((at,i)=>shout(at,1.1+i*.25));gong(T.kowtow,1.2);TD_SUCK.forEach((at,i)=>add(at,.45,.035,2400,300,'wind',(i/8-.5)*1.4,true,'flame-suck'));
add(T.converge,.7,.06,180,2600,'rise',0,false,'converge');add(T.dark-.3,.5,.05,2400,120,'wind',0,true,'light-suck');sub(T.absorbed,.2);
// 10. Nổ
drum(T.impact,1.9);add(T.impact,.18,.17,6200,500,'crack',0,true,'release-crack');sub(T.impact,.3,80,24,2.5);gong(T.impact+.02,1.6);brass(T.impact,1.8,55,.075);
add(T.impact+.12,1.4,.07,850,110,'thunder',-.35,true,'release-wave');add(T.impact+.22,1.3,.06,700,95,'thunder',.35,true,'release-wave');
// 11. Kèn đăng quang La trưởng
strings(T.reveal,3.4,[55,110,138.59,164.81,220],.028);choir(T.reveal,3.2,[110,138.59,164.81,220],.036);brass(T.reveal+.2,2.4,55,.055);brass(T.reveal+.9,1.8,110,.045);
for(const [i,hz]of [440,554.37,659.25,880,659.25,554.37].entries())pluck(30.5+i*.3,hz,.04-i*.003,(i%2?1:-1)*.3);bell(32.4,880,.03);add(32.2,1.4,.022,650,160,'wind',0,false,'release-breath');
export const TIEN_DE_SCORE=Object.freeze(score.sort((a,b)=>a.at-b.at).map(Object.freeze));
// Mức cue dành khoảng trống cho các lớp cộng trên bus nghi thức.
const LOUD=1.32;
const banks=new WeakMap();
function noise(c){if(banks.has(c))return banks.get(c);const b=c.createBuffer(1,c.sampleRate*3,c.sampleRate),d=b.getChannelData(0);let seed=71313,low=0;for(let i=0;i<d.length;i++){seed=(Math.imul(seed,1664525)+1013904223)|0;const w=seed/2147483648;low=.9*low+.1*w;d[i]=low*.9+w*.18;}banks.set(c,b);return b;}
export function tienDeMusicDuck(ms){const t=ms/1000;return t<T.impact?.08:t<32.2?.12:Math.min(1,.12+(t-32.2)/1.6*.88);}
export function scheduleTienDeAudio(c,destination,elapsed=0,duration=T.duration,strength=1,event={}){
 const now=c.currentTime,pitch=qiVariant(event).pitch,scale=duration/T.duration,bus=c.createGain(),nodes=[bus],sources=[];let stopped=false,echo=null;
 bus.gain.value=strength;bus.connect(destination);
 // Vang thung lũng: trễ dài, phản hồi vừa.
 if(c.createDelay){echo=c.createDelay(.6);const wet=c.createGain(),fb=c.createGain();echo.delayTime.value=.34;wet.gain.value=.16;fb.gain.value=.28;echo.connect(wet);wet.connect(bus);echo.connect(fb);fb.connect(echo);nodes.push(echo,wet,fb);}
 for(const cue of TIEN_DE_SCORE){const at=cue.at*scale,len=cue.len*scale,trim=Math.max(0,elapsed-at),remain=Math.min(len-trim,duration+.8-Math.max(at,elapsed));if(remain<=0||cue.transient&&trim>.08)continue;
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
