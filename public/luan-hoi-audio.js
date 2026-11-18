// 18/11/2026 — Âm thanh màn "Niết Bàn Luân Hồi" (khớp mốc LH trong luan-hoi-cinema.js). Tự tổng hợp, không file ngoài.
// Rê thứ trầm (hư không) → 6 tiếng chuông chùa đi xuống (Lục Đạo) → hồi tưởng: gió cuốn + vút qua từng cảnh giới, dây dâng →
// thân diệt: lửa tro lách tách, đồng ca rơi → IM LẶNG → trống dồn + gió dâng → NỔ GIÁNG → Rê trưởng (đồng ca + kèn) → chạm đất, CỒNG đóng dấu, 4 chuông nhỏ ân điển.
import {warmWave} from './warm-wave.js';
import {LH} from './luan-hoi-cinema.js';
const score=[],add=(at,len,level,from,to=from,kind='sine',pan=0,transient=false)=>score.push({at,len,level,from,to,kind,pan,transient});
function drum(at,f=1,pan=0){add(at,.7,.18*f,88,30,'sine',pan,true);add(at,.09,.05*f,1300,170,'crack',pan,true);}
function bell(at,hz,f=1,len=3.4,pan=0){[[1,1],[2.71,.32],[4.1,.18],[5.4,.08]].forEach(([r,g])=>add(at,len*(1.1-r*.12),.07*f*g,hz*r,hz*r*.998,'sine',pan,true));add(at,.05,.03*f,2600,900,'crack',pan,true);}
function chord(at,len,notes,f=.022,kind='strings'){notes.forEach((hz,i)=>{for(const d of [.996,1.004])add(at,len,f/(1+i*.3),hz*d,hz*d,kind,(i%2?1:-1)*.22);});}
// I — hư không, nhịp tim
add(0,9,.05,73.4,73.4,'choir');add(0,4.4,.035,110,110,'choir',.2);add(.2,4,.04,300,600,'wind',-.3);
LH.beats.forEach(b=>{drum(b,1.25);drum(b+.24,.7);});
// II — 6 chuông Lục Đạo, đi xuống Rê thứ
[293.7,261.6,220,196,174.6,146.8].forEach((hz,i)=>bell(LH.bells[i],hz,1.1,3.6,(i%2?.25:-.25)));
chord(4.4,4.8,[146.8,174.6,220],.016,'choir');
// III — hồi tưởng: gió dâng + vút qua tên cảnh giới (nhanh dần)
add(LH.recallFrom,5,.13,220,3200,'rise');chord(LH.recallFrom,5.2,[146.8,220,293.7,349.2],.034);add(LH.recallFrom,5,.05,73.4,146.8,'sine');
for(let i=0;i<16;i++){const at=LH.recallFrom+5*Math.pow(i/16,.75);add(at,.24,.09,900+i*90,260,'wind',(i%2?.5:-.5),true);}
// IV — thân diệt: tro lửa lách tách, đồng ca rơi
for(let i=0;i<22;i++)add(LH.dissolve+i*.1+((i*37)%7)*.02,.06,.055,2400,1200,'crack',((i*13)%9-4)/6,true);
add(LH.dissolve,2.4,.075,293.7,146.8,'choir');add(LH.dissolve,2.4,.07,500,160,'wind');
// V — trống dồn + dâng → NỔ
for(let i=0;i<10;i++)drum(LH.silence+.25+Math.pow(i/10,.6)*(LH.impact-LH.silence-.3),.5+i*.07);
add(LH.silence+.2,LH.impact-LH.silence-.2,.09,140,4200,'rise');
drum(LH.impact,2.6);add(LH.impact,2.6,.13,60,26,'sine',0,true);add(LH.impact,1.8,.1,900,90,'thunder',0,true);add(LH.impact,.25,.08,3600,400,'crack',0,true);
// VI — Rê trưởng huy hoàng
chord(LH.flash,7.5,[146.8,220,293.7,370],.026,'choir');chord(LH.flash+.2,7,[73.4,110,146.8],.02,'brass');
add(LH.descend,LH.land-LH.descend,.035,600,1800,'rise');
drum(LH.land,1.2);bell(LH.land,587.3,.9,3,0);
// cồng đóng dấu danh hiệu
drum(LH.stamp,2.2);bell(LH.stamp,98,2.2,4.5,0);add(LH.stamp,4,.05,49,49,'sine');
// VII — 4 ân điển
[880,987.8,1174.7,1318.5].forEach((hz,i)=>bell(LH.gifts+i*.45,hz,.55,1.8,(i-1.5)*.3));
// Phượng hoàng Niết Bàn: tiếng kêu (2 lớp lượn cao độ + hơi gió) và tiếng lao xuống
add(LH.cry,1.1,.07,820,1650,'triangle',-.1,true);add(LH.cry+.05,1.0,.045,1240,2300,'sine',.1,true);add(LH.cry+.55,.9,.05,1500,980,'triangle',0,true);add(LH.cry,1.3,.05,1800,5200,'wind',0,true);
add(LH.dive,LH.impact-LH.dive,.06,2600,500,'wind',0);export const LUAN_HOI_SCORE=Object.freeze(score.sort((a,b)=>a.at-b.at).map(Object.freeze));
export function luanHoiMusicDuck(ms){const t=ms/1000;return t<LH.end-1.5?.1:Math.min(1,.1+(t-(LH.end-1.5))/1.5*.9);}
const banks=new WeakMap();
function noise(c){if(banks.has(c))return banks.get(c);const b=c.createBuffer(1,c.sampleRate*3,c.sampleRate),d=b.getChannelData(0);let seed=52711,low=0;for(let i=0;i<d.length;i++){seed=(Math.imul(seed,1664525)+1013904223)|0;const w=seed/2147483648;low=.9*low+.1*w;d[i]=low*.9+w*.18;}banks.set(c,b);return b;}
/** Lên lịch cả bản nhạc từ giây `elapsed` (mở overlay giữa chừng vẫn khớp). Trả về hàm dừng. */
export function scheduleLuanHoiAudio(c,destination,elapsed=0,strength=1){
 const now=c.currentTime,duration=LH.duration,bus=c.createGain(),nodes=[bus],sources=[];let echo=null;
 bus.gain.value=strength;bus.connect(destination);
 if(c.createDelay){echo=c.createDelay(.8);const wet=c.createGain(),fb=c.createGain();echo.delayTime.value=.42;wet.gain.value=.2;fb.gain.value=.34;echo.connect(wet);wet.connect(bus);echo.connect(fb);fb.connect(echo);nodes.push(echo,wet,fb);}
 for(const cue of LUAN_HOI_SCORE){const at=cue.at,len=cue.len,trim=Math.max(0,elapsed-at),remain=Math.min(len-trim,duration+.8-Math.max(at,elapsed));if(remain<=0||cue.transient&&trim>.08)continue;
  const level=cue.level*1.3*(cue.kind==='crack'?.6:1),start=now+Math.max(0,at-elapsed),noisy=['wind','thunder','crack','rise'].includes(cue.kind),src=noisy?c.createBufferSource():c.createOscillator(),g=c.createGain();let param;
  if(noisy){src.buffer=noise(c);src.loop=true;}else if((cue.kind==='strings'||cue.kind==='choir')&&c.createPeriodicWave)src.setPeriodicWave(warmWave(c));else src.type=['strings','choir','brass'].includes(cue.kind)?'sawtooth':cue.kind;
  if(noisy||['strings','choir','brass'].includes(cue.kind)){const f=c.createBiquadFilter();f.type=noisy||cue.kind==='choir'?'bandpass':'lowpass';if(f.Q)f.Q.value=cue.kind==='crack'?.9:cue.kind==='choir'?1.4:.55;src.connect(f);f.connect(g);nodes.push(f);
   if(noisy)param=f.frequency;else{f.frequency.value=cue.kind==='choir'?760:cue.kind==='brass'?950:1300;param=src.frequency;}}else{src.connect(g);param=src.frequency;}
  const cap=cue.kind==='crack'?4200:12000;param.setValueAtTime(Math.max(25,Math.min(cap,cue.from+(cue.to-cue.from)*trim/len)),start);param.exponentialRampToValueAtTime(Math.max(25,Math.min(cap,cue.to)),start+remain);
  const attack=cue.kind==='choir'?.55:cue.kind==='brass'?.07:cue.kind==='strings'?.38:cue.kind==='rise'?remain*.7:cue.kind==='wind'?.08:cue.kind==='crack'?.007:.004;
  g.gain.setValueAtTime(.0001,start);g.gain.linearRampToValueAtTime(level,start+Math.min(attack,remain*.75));g.gain.exponentialRampToValueAtTime(.0001,start+remain);
  if(cue.pan&&c.createStereoPanner){const pn=c.createStereoPanner();pn.pan.value=cue.pan;g.connect(pn);pn.connect(bus);nodes.push(pn);}else g.connect(bus);
  if(echo&&cue.kind!=='thunder'&&cue.kind!=='crack')g.connect(echo);
  src.start(start);src.stop(start+remain+.025);sources.push(src);nodes.push(src,g);}
 // IM LẶNG trước cú giáng
 if(elapsed<LH.dark){const a=now+LH.dark-elapsed,b=now+LH.silence-elapsed,e=now+LH.silence+.5-elapsed;bus.gain.setValueAtTime(strength,a);bus.gain.linearRampToValueAtTime(strength*.05,b);bus.gain.linearRampToValueAtTime(strength,e);}
 const cleanup=()=>nodes.forEach(n=>{try{n.disconnect();}catch{}}),timer=setTimeout(cleanup,Math.max(0,(duration-elapsed+2)*1000));timer.unref?.();
 return ()=>{clearTimeout(timer);for(const s of sources){try{s.stop();}catch{}}cleanup();};
}
