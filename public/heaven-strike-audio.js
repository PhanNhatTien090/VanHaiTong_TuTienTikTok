// 07/11/2026: âm thanh THIÊN ĐẠO GIÁNG LÔI — tự tổng hợp bằng WebAudio, không dùng mẫu ngoài.
// Sấm rền xa (tụ mây) → rít điện + lách tách (khóa mục tiêu) → nứt sét + nổ trầm + vang dội (mỗi đạo lôi) → lách tách dư điện, sấm lùi xa.
// Cao độ, thời điểm lách tách, số đạo lôi theo seed của lần đánh → không lần nào giống hệt.
import {STRIKE_AT,HEAVEN_STRIKE_MS} from './heaven-strike.js';

const buffers=new WeakMap();
function whiteNoise(c){if(buffers.has(c))return buffers.get(c);const b=c.createBuffer(1,c.sampleRate*2,c.sampleRate),d=b.getChannelData(0);let s=77291;for(let i=0;i<d.length;i++){s=(Math.imul(s,1664525)+1013904223)|0;d[i]=s/2147483648;}buffers.set(c,b);return b;}
function rng(seed){let a=(Number(seed)>>>0)||1;return()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};}
function distortion(c,amount=18){const n=1024,curve=new Float32Array(n);for(let i=0;i<n;i++){const x=i/(n-1)*2-1;curve[i]=(1+amount)*x/(1+amount*Math.abs(x));}const w=c.createWaveShaper();w.curve=curve;w.oversample='2x';return w;}

export function scheduleHeavenStrikeAudio(c,destination,profile,{level=1}={}){
 if(!c||!destination||!profile)return {stop(){}};
 const t0=c.currentTime+.05,pitch=profile.pitch||1,r=rng(profile.seed*7+3),nodes=[],graph=[];
 const bus=c.createGain();bus.gain.value=.9*level;const comp=c.createDynamicsCompressor();comp.threshold.value=-10;comp.knee.value=8;comp.ratio.value=5;comp.attack.value=.002;comp.release.value=.25;bus.connect(comp);comp.connect(destination);graph.push(bus,comp);
 const env=(g,at,peak,attack,decay,hold=0)=>{g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(Math.max(.0002,peak),at+attack);if(hold)g.gain.setValueAtTime(Math.max(.0002,peak),at+attack+hold);g.gain.exponentialRampToValueAtTime(.0001,at+attack+hold+decay);};
 function noise(at,dur,{type='lowpass',from=800,to=200,q=.7,peak=.5,attack=.01,hold=0,decay}={}){const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=whiteNoise(c);s.loop=true;s.playbackRate.value=.9+r()*.2;f.type=type;f.Q.value=q;f.frequency.setValueAtTime(from,at);f.frequency.exponentialRampToValueAtTime(Math.max(30,to),at+dur);s.connect(f);f.connect(g);g.connect(bus);env(g,at,peak,attack,decay??dur,hold);s.start(at,r()*1.5);s.stop(at+attack+hold+(decay??dur)+.05);nodes.push(s);graph.push(f,g);}
 function osc(at,dur,{kind='sine',from=100,to=40,peak=.4,attack=.005,hold=0,drive=0}={}){const o=c.createOscillator(),g=c.createGain();o.type=kind;o.frequency.setValueAtTime(from*pitch,at);o.frequency.exponentialRampToValueAtTime(Math.max(18,to*pitch),at+dur);if(drive){const w=distortion(c,drive);o.connect(w);w.connect(g);graph.push(w);}else o.connect(g);g.connect(bus);env(g,at,peak,attack,dur,hold);o.start(at);o.stop(at+attack+hold+dur+.05);nodes.push(o);graph.push(g);}
 // Sấm rền xa: nhiều đợt cuộn trầm.
 function roll(at,dur,peak){noise(at,dur,{from:520,to:110,peak:peak*.6,attack:.25,decay:dur});for(let i=0;i<4;i++)noise(at+r()*dur*.6,.6+r()*.8,{from:380+r()*300,to:90,peak:peak*(.4+r()*.5),attack:.04+r()*.08,decay:.5+r()*.8});}
 roll(t0+.15,2.2,.32);roll(t0+1.1,1.8,.38);
 // Gió bão nền suốt cảnh.
 noise(t0,HEAVEN_STRIKE_MS/1000-.4,{type:'bandpass',from:420,to:900,q:.6,peak:.07,attack:1.2,hold:3,decay:2.2});
 // Tụ lực: hạ âm dâng + rít điện lên cao.
 osc(t0+.3,STRIKE_AT-.3,{from:34,to:52,peak:.22,attack:1.6});
 const whineAt=t0+1.5,whineLen=STRIKE_AT-1.5;{const o=c.createOscillator(),f=c.createBiquadFilter(),g=c.createGain();o.type='sawtooth';o.frequency.setValueAtTime(70*pitch,whineAt);o.frequency.exponentialRampToValueAtTime(980*pitch,whineAt+whineLen);f.type='bandpass';f.Q.value=5;f.frequency.setValueAtTime(240,whineAt);f.frequency.exponentialRampToValueAtTime(2600,whineAt+whineLen);o.connect(f);f.connect(g);g.connect(bus);g.gain.setValueAtTime(.0001,whineAt);g.gain.exponentialRampToValueAtTime(.09,whineAt+whineLen-.02);g.gain.exponentialRampToValueAtTime(.0001,whineAt+whineLen+.03);o.start(whineAt);o.stop(whineAt+whineLen+.08);nodes.push(o);graph.push(f,g);}
 // Lách tách tĩnh điện, dày dần tới cú đánh.
 for(let i=0;i<22;i++){const k=Math.pow(r(),.55),at=t0+1.4+k*(STRIKE_AT-1.45);noise(at,.03+r()*.04,{type:'highpass',from:2600+r()*3000,to:1800,peak:.12+k*.22,attack:.002,decay:.03+r()*.05});}
 // Mỗi đạo lôi: nứt chói + nổ trầm méo + thân sấm + vang dội.
 for(const b of profile.bolts){const at=t0+b.at,m=b.main?1:.7;
  noise(at,.14,{type:'highpass',from:5200,to:1400,peak:.95*m,attack:.002,decay:.16});
  osc(at,.09,{kind:'square',from:1500,to:160,peak:.22*m,attack:.001});
  osc(at+.01,1.9,{from:120,to:26,peak:.95*m,attack:.006,drive:14});
  noise(at+.02,2.6,{from:1400,to:90,peak:.75*m,attack:.012,decay:2.8});
  noise(at+.05,3.8,{type:'bandpass',from:520,to:160,q:1.1,peak:.28*m,attack:.08,decay:3.8});
  for(let i=0;i<3;i++)noise(at+.25+r()*.9,.6+r()*.6,{from:700,to:120,peak:.3*m*(1-i*.25),attack:.03,decay:.7+r()*.7});}
 // Dư điện lách tách sau cú đánh, thưa dần.
 for(let i=0;i<16;i++){const k=r(),at=t0+STRIKE_AT+.6+k*k*3.6;noise(at,.03,{type:'highpass',from:3400+r()*2400,to:2000,peak:.1*(1-k*.7),attack:.002,decay:.04+r()*.05});}
 roll(t0+STRIKE_AT+2.1,2.4,.2);
 let done=false;const stop=()=>{if(done)return;done=true;for(const n of nodes){try{n.stop();}catch{}}setTimeout(()=>graph.forEach(n=>n.disconnect?.()),300);};
 setTimeout(()=>{done=true;graph.forEach(n=>n.disconnect?.());},HEAVEN_STRIKE_MS+3500);
 return {stop};}
