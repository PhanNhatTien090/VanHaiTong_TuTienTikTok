// 10/11/2026: ÂM THANH HỘI GÕ ĐẦU — tự tổng hợp bằng WebAudio (không file), kiểu hoạt hình vui nhộn.
// Một cú gõ = bước chân lon ton → huýt sáo kéo lên lúc giơ búa → BỐP/CỐC/PẶC/BỘP (4 kiểu theo variant) + lò xo "boing"
// → sao lấp lánh → linh thạch leng keng (mỗi viên một tiếng) → bước chân chạy về. Mỗi cú lệch cao độ ngẫu nhiên ±8%.
// Mở hội: kèn kazoo + trống gỗ + huýt sáo. Khép hội: "ta-đa" + kèn "oa oa" trêu người bị gõ nhiều nhất.
const rnd=(a,b)=>a+Math.random()*(b-a);
function env(c,at,peak,attack,decay){const g=c.createGain();g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(peak,at+attack);g.gain.exponentialRampToValueAtTime(.0001,at+attack+decay);return g;}
function tone(c,bus,type,f0,f1,at,dur,peak,attack=.005){const o=c.createOscillator(),g=env(c,at,peak,attack,dur);o.type=type;o.frequency.setValueAtTime(f0,at);if(f1&&f1!==f0)o.frequency.exponentialRampToValueAtTime(f1,at+dur);o.connect(g);g.connect(bus);o.start(at);o.stop(at+attack+dur+.05);return o;}
function noise(c,bus,at,dur,peak,type,freq,q=1,freq1){const n=Math.ceil(c.sampleRate*(dur+.05)),b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;
 const s=c.createBufferSource(),f=c.createBiquadFilter(),g=env(c,at,peak,.002,dur);s.buffer=b;f.type=type;f.frequency.setValueAtTime(freq,at);if(freq1)f.frequency.exponentialRampToValueAtTime(freq1,at+dur);f.Q.value=q;s.connect(f);f.connect(g);g.connect(bus);s.start(at);s.stop(at+dur+.05);}
// lò xo "boing": sine có rung (LFO) và trượt cao độ
function boing(c,bus,at,f0,f1,dur,peak){const o=c.createOscillator(),l=c.createOscillator(),lg=c.createGain(),g=env(c,at,peak,.004,dur);o.type='sine';o.frequency.setValueAtTime(f0,at);o.frequency.exponentialRampToValueAtTime(f1,at+dur);
 l.frequency.setValueAtTime(18,at);l.frequency.linearRampToValueAtTime(7,at+dur);lg.gain.setValueAtTime(f0*.09,at);lg.gain.exponentialRampToValueAtTime(f1*.02,at+dur);l.connect(lg);lg.connect(o.frequency);o.connect(g);g.connect(bus);o.start(at);l.start(at);o.stop(at+dur+.05);l.stop(at+dur+.05);}
// bước chân lon ton: tiếng "tíc" gỗ nhỏ xen kẽ cao/thấp
function steps(c,bus,at,until,k,light=1){let i=0;for(let t=at;t<until-.05;t+=.15+rnd(-.015,.015),i++){const f=(i%2?880:700)*k;tone(c,bus,'triangle',f,f*.7,t,.05,.07*light);noise(c,bus,t,.03,.05*light,'bandpass',2600*k,3);}}
function slide(c,bus,at,f0,f1,dur,peak){const o=c.createOscillator(),l=c.createOscillator(),lg=c.createGain(),g=env(c,at,peak,.03,dur);o.type='sine';o.frequency.setValueAtTime(f0,at);o.frequency.exponentialRampToValueAtTime(f1,at+dur);l.frequency.value=6;lg.gain.value=f0*.015;l.connect(lg);lg.connect(o.frequency);o.connect(g);g.connect(bus);o.start(at);l.start(at);o.stop(at+dur+.06);l.stop(at+dur+.06);}
function sparkle(c,bus,at,k){[1568,2093,2637,3136,2637].forEach((f,i)=>tone(c,bus,'sine',f*k,f*k,at+i*.06,.22,.035));}
function clink(c,bus,at,k){const f=rnd(2300,3100)*k;tone(c,bus,'triangle',f,f*.98,at,.16,.06);tone(c,bus,'sine',f*2.76,f*2.7,at,.08,.025);}
function kazoo(c,bus,at,f,dur,peak){const o=c.createOscillator(),fl=c.createBiquadFilter(),g=env(c,at,peak,.02,dur);o.type='sawtooth';o.frequency.setValueAtTime(f*.97,at);o.frequency.linearRampToValueAtTime(f,at+.04);fl.type='bandpass';fl.frequency.value=1100;fl.Q.value=1.6;o.connect(fl);fl.connect(g);g.connect(bus);o.start(at);o.stop(at+dur+.05);}
function wood(c,bus,at,f,peak=.12){tone(c,bus,'triangle',f,f*.6,at,.07,peak);noise(c,bus,at,.04,peak*.6,'bandpass',f*2.2,4);}

// 4 kiểu cú gõ (khớp chữ BỐP / CỐC / PẶC / BỘP trên màn hình)
const HITS=[
 (c,b,t,k)=>{wood(c,b,t,520*k,.2);noise(c,b,t,.08,.12,'lowpass',900*k);boing(c,b,t+.04,420*k,150*k,.55,.12);},             // BỐP: gỗ + lò xo rơi
 (c,b,t,k)=>{wood(c,b,t,900*k,.17);wood(c,b,t+.11,760*k,.13);tone(c,b,'sine',1300*k,1300*k,t+.2,.25,.04);},                 // CỐC: gõ quả dừa 2 lần
 (c,b,t,k)=>{noise(c,b,t,.09,.22,'highpass',1800*k,.7);tone(c,b,'square',300*k,120*k,t,.08,.05);slide(c,b,t+.08,900*k,1500*k,.22,.05);}, // PẶC: tát giòn + chíp
 (c,b,t,k)=>{tone(c,b,'sine',140*k,55*k,t,.25,.24);noise(c,b,t,.12,.12,'lowpass',500*k);boing(c,b,t+.06,160*k,460*k,.5,.1);},  // BỘP: thịch trầm + lò xo bật lên
];

export const BONK_GAIN=1.5; /* to hơn ~3,5 dB so với hiệu ứng thường để nghe rõ trên nền nhạc */
export function playBonkSound(c,bus,kind,o={}){
 const now=c.currentTime,out=c.createGain();out.gain.value=BONK_GAIN;out.connect(bus);bus=out;
 if(kind==='hit'){const k=rnd(.92,1.08),impact=now+Math.max(.05,o.delay??1),walk=o.walk!==false;
  if(walk)steps(c,bus,now,impact-.32,k);
  slide(c,bus,impact-.3,500*k,1250*k,.26,.045);                // giơ búa: huýt sáo kéo lên
  HITS[(o.variant||0)%HITS.length](c,bus,impact,k);
  sparkle(c,bus,impact+.12,k);
  for(let i=0;i<Math.min(3,o.stones||0);i++)clink(c,bus,impact+.2+i*.1,k);
  if(walk)steps(c,bus,impact+.42,impact+1.45,k*1.08,.8);       // chạy về, nhanh và nhẹ hơn
  return;}
 if(kind==='start'){const n=[523.25,659.25,783.99,1046.5];n.forEach((f,i)=>kazoo(c,bus,now+i*.14,f,i===3?.45:.12,.07));[0,.14,.28,.42,.5].forEach((d,i)=>wood(c,bus,now+d,i%2?700:520,.12));slide(c,bus,now+.65,450,1400,.35,.05);boing(c,bus,now+1.05,500,160,.5,.09);return;}
 if(kind==='end'){[[783.99,0,.12],[1046.5,.14,.5]].forEach(([f,d,l])=>kazoo(c,bus,now+d,f,l,.08));wood(c,bus,now,600,.12);wood(c,bus,now+.14,800,.14);
  [[392,.9,.32],[370,1.25,.32],[349.23,1.6,.32],[329.63,1.95,.8]].forEach(([f,d,l])=>{kazoo(c,bus,now+d,f,l,.065);});return;}  // "oa oa oa oaaa" trêu Đầu Sắt
}
