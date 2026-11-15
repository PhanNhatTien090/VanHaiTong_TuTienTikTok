// Hỗn Độn Vĩnh Hằng v2 — Khai Thiên Định Luật: Đô thứ cổ (hỗn độn) → Đô trưởng huy hoàng (cảnh giới cuối).
// Chân trời nứt (sấm xa + nổ), hỗn độn khí (gió vàng + nổ), 14 thiên kính (chuông thủy tinh tăng dần),
// đường hầm vô tận (vút qua từng khung), trọng lực đảo (âm cao độ trượt xuống + nổ), 4 nhịp đá bay ngược,
// 8 thiên kính vỡ (thủy tinh + nổ), vỡ toàn bộ, 3 vòng xoáy vô cực, ∞ thành hình (cồng), 3 thiên luật (đục đá + nổ + đồng ca),
// luật nhập thể, tối ngắn, 2 nhịp tim, NỔ KHAI THIÊN (rìu chẻ + nổ lớn nhất), Đô trưởng + đồng ca + kèn.
// Sinh lại public/hon-don-audio.js bằng: node scripts/build-realm-audio.mjs hon-don
import {qiVariant} from './qi-impact.js';import {warmWave} from './warm-wave.js';
import {HD as T,HD_CRACK,HD_CHAOS,HD_PANES,HD_PASSES,HD_GRAVITY,HD_SHATTER,HD_SPIRAL,HD_LAWS,HD_BEATS} from './hon-don-awakening.js';
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
function chisel(at,f=1,pan=0){for(let i=0;i<5;i++)add(at+i*.11,.07,.06*f,3200+i*200,900,'crack',pan,true,'chisel');add(at,.6,.04*f,180,90,'triangle',pan,true,'stone-ring');}
function whoosh(at,f=1,pan=0){add(at,.45,.05*f,300,3600,'wind',pan,true,'pass-whoosh');}
const C=[130.81,146.83,155.56,174.61,196,207.65,233.08,261.63,293.66,311.13,349.23,392,415.3,466.16,523.25];
// nền: pedal Đô + gió hỗn độn
add(.1,T.dark-.1,.032,32.7,32.7,'triangle',0,false,'pedal');add(.3,12,.035,160,520,'wind',-.4,false,'chaos-wind');add(12,10,.03,140,480,'wind',.4,false,'chaos-wind');
strings(1,5,[65.41,98,130.81],.016);strings(6,7,[65.41,103.83,130.81,155.56],.019);strings(30,7,[65.41,98,130.81,155.56],.021);strings(39,7,[65.41,98,130.81,196],.022);
// 1. Chân trời nứt + hỗn độn khí
HD_CRACK.forEach((at,i)=>{const pan=[0,-.6,.6][i];boom(at,1.3+i*.25,pan,C[i]);add(at,1.6,.08,900,80,'thunder',pan,true,'horizon-thunder');glass(at+.05,C[12+i%3]*2,pan,.8);});
HD_CHAOS.forEach((at,i)=>{add(at-.2,1,.05,200,1400,'wind',(i-1)*.5,true,'chaos-surge');boom(at,1+i*.15,(i-1)*.4,C[i+3]);});
// 2. Thiên kính
HD_PANES.forEach((at,i)=>{const pan=Math.cos(i/14*Math.PI*2)*.7;bell(at+.35,C[i%15]*2,.026,pan);drum(at+.35,.5+i*.03,pan);if(i%3===0)sub(at+.35,.12,70,30,.8);});
// 3. Đường hầm vô tận
HD_PASSES.forEach((at,i)=>{whoosh(at-.3,1,(i%2?1:-1)*.5);boom(at,.7+i*.05,0,C[(i*2)%15]);});add(T.tunnel,8.4,.03,60,180,'sawtooth',0,false,'tunnel-drone');choir(T.tunnel+1,6,[130.81,155.56,196],.026);
// 4. Trọng lực đảo
add(T.flip,1.4,.06,1200,120,'triangle',0,true,'gravity-fall');boom(T.flip,1.8,0,65.41);boom(T.flip+1.4,1.6,0,98);gong(T.flip+1.42,1.1);
HD_GRAVITY.forEach((at,i)=>{add(at-.4,.4,.05,200,2400,'rise',(i%2?1:-1)*.5,true,'debris-lift');boom(at,1.1+i*.15,(i%2?1:-1)*.4,C[6-i]);rubble(at+.05,(i%2?1:-1)*.4,1);});
add(T.flipBack,.8,.06,120,1200,'triangle',0,true,'gravity-return');boom(T.flipBack+.8,1.8,0,65.41);
// 5. Thiên kính vỡ
HD_SHATTER.forEach((at,i)=>{const pan=(i%2?1:-1)*(.3+i*.06);boom(at,1.2+i*.08,pan,C[i+4]);for(let k=0;k<3;k++)glass(at+k*.05,C[14-i]*2*(1+k*.12),pan,1);rubble(at+.05,pan,.7);});
add(T.shatterAll-.6,.6,.06,500,5000,'rise',0,false,'shatter-strain');boom(T.shatterAll,1.9,0,65.41);gong(T.shatterAll+.02,1.1);for(let k=0;k<10;k++)glass(T.shatterAll+k*.06,1046.5+rnd(k)*900,(rnd(k+4)-.5)*1.6,.8);
// 6. Điểm vô cực
HD_SPIRAL.forEach((at,i)=>{add(at,1,.05,3000,300,'wind',(i%2?1:-1)*.5,true,'spiral-suck');boom(at,1+i*.2,0,C[i]);});
boom(T.infinity,1.6,0,65.41);gong(T.infinity+.02,1.2);choir(T.infinity,3,[130.81,155.56,196,261.63],.03);drum(45.1,.9);
// 7. Ba thiên luật
HD_LAWS.forEach((at,i)=>{chisel(at,1.2,(i-1)*.5);boom(at+.6,1.5+i*.15,(i-1)*.4,[65.41,73.42,98][i]);brass(at+.62,1.4,[65.41,77.78,98][i],.05);choir(at+.6,1.4,[130.81,155.56,196].map(h=>h*(1+i*.12)),.026);});
add(T.lawsIn-.4,.45,.06,3800,140,'wind',0,true,'laws-dive');boom(T.lawsIn,1.6,0,65.41);
add(T.dark-.2,.3,.05,2400,120,'wind',0,true,'light-suck');HD_BEATS.forEach((at,i)=>heart(at,.8+i*.2));
// 8. NỔ KHAI THIÊN
add(T.impact-.25,.25,.07,1200,7000,'rise',0,true,'axe-draw');add(T.impact,.2,.13,7000,500,'crack',0,true,'axe-split');drum(T.impact,1.8);sub(T.impact,.32,90,20,3.2);gong(T.impact+.02,1.5);brass(T.impact,2,65.41,.08);
add(T.impact+.08,1.8,.07,1000,100,'thunder',-.45,true,'release-wave');add(T.impact+.2,1.7,.06,800,90,'thunder',.45,true,'release-wave');
// 9. Hiện thân: Đô trưởng huy hoàng
strings(T.reveal,4.2,[32.7,65.41,98,130.81,164.81],.028);choir(T.reveal,4,[130.81,164.81,196,261.63],.036);brass(T.reveal+.2,2.6,65.41,.06);brass(T.reveal+1,2,98,.05);brass(T.reveal+1.8,1.8,130.81,.05);
for(const [i,hz]of [261.63,329.63,392,523.25,659.25,783.99].entries())pluck(T.reveal+.3+i*.3,hz,.04-i*.003,(i%2?1:-1)*.3);bell(T.reveal+2.4,261.63,.035);add(T.reveal+2.2,1.6,.024,600,150,'wind',0,false,'release-breath');
export const HON_DON_SCORE=Object.freeze(score.sort((a,b)=>a.at-b.at).map(Object.freeze));
// Mức cue dành khoảng trống cho các lớp cộng trên bus nghi thức.
const LOUD=1.32;
const banks=new WeakMap();
function noise(c){if(banks.has(c))return banks.get(c);const b=c.createBuffer(1,c.sampleRate*3,c.sampleRate),d=b.getChannelData(0);let seed=71313,low=0;for(let i=0;i<d.length;i++){seed=(Math.imul(seed,1664525)+1013904223)|0;const w=seed/2147483648;low=.9*low+.1*w;d[i]=low*.9+w*.18;}banks.set(c,b);return b;}
export function honDonMusicDuck(ms){const t=ms/1000;return t<T.impact?.08:t<T.impact+2.2?.12:Math.min(1,.12+(t-T.impact-2.2)/1.6*.88);}
export function scheduleHonDonAudio(c,destination,elapsed=0,duration=T.duration,strength=1,event={}){
 const now=c.currentTime,pitch=qiVariant(event).pitch,scale=duration/T.duration,bus=c.createGain(),nodes=[bus],sources=[];let stopped=false,echo=null;
 bus.gain.value=strength;bus.connect(destination);
 // Vang thung lũng: trễ dài, phản hồi vừa.
 if(c.createDelay){echo=c.createDelay(.6);const wet=c.createGain(),fb=c.createGain();echo.delayTime.value=.34;wet.gain.value=.16;fb.gain.value=.28;echo.connect(wet);wet.connect(bus);echo.connect(fb);fb.connect(echo);nodes.push(echo,wet,fb);}
 for(const cue of HON_DON_SCORE){const at=cue.at*scale,len=cue.len*scale,trim=Math.max(0,elapsed-at),remain=Math.min(len-trim,duration+.8-Math.max(at,elapsed));if(remain<=0||cue.transient&&trim>.08)continue;
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
