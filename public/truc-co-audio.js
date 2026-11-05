// Original procedural bamboo, jade and foundation SFX; no external samples.
import {TRUC_CO_DURATION,TRUC_CO_SWORDS,TRUC_CO_TIERS,TRUC_CO_BURST} from './truc-co-timeline.js';
const buffers=new WeakMap();
function assets(c){
 if(buffers.has(c))return buffers.get(c);let seed=29411,low=0;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)|0;return seed/2147483648;};
 const noise=c.createBuffer(1,c.sampleRate*3,c.sampleRate),d=noise.getChannelData(0);for(let i=0;i<d.length;i++){low=.65*low+.35*random();d[i]=low*1.5;}
 const impulse=c.createBuffer(2,Math.ceil(c.sampleRate*.95),c.sampleRate);for(let ch=0;ch<2;ch++){const a=impulse.getChannelData(ch);let filtered=0;for(let i=0;i<a.length;i++){filtered=.6*filtered+.4*random();a[i]=filtered*Math.exp(-i/a.length*7);}}
 const result={noise,impulse};buffers.set(c,result);return result;
}
export function trucCoMusicDuck(elapsed){
 const t=elapsed/1000,mix=(a,b,u)=>{u=Math.max(0,Math.min(1,u));return a+(b-a)*u*u*(3-2*u);};
 if(t<3.2)return .55;if(t<4)return mix(.55,.36,(t-3.2)/.8);
 if(t<5.8)return .36;if(t<6.8)return mix(.36,.24,t-5.8);
 if(t<8.1)return .24;if(t<8.6)return mix(.24,.16,(t-8.1)/.5);
 return t<9.5?.16:mix(.16,1,(t-9.5)/1.3);
}
export function scheduleTrucCoAudio(c,destination,elapsed=0,duration=10.8,strength=1,stem='mix',pitch=1){
 const scale=duration/(TRUC_CO_DURATION/1000),now=c.currentTime,bank=assets(c),bus=c.createGain(),sources=[],graph=[bus];let active=0,stopped=false,timer;
 bus.gain.value=1.55*strength;
 if(c.createDynamicsCompressor){const limiter=c.createDynamicsCompressor();limiter.threshold.value=-7;limiter.knee.value=5;limiter.ratio.value=8;limiter.attack.value=.002;limiter.release.value=.18;bus.connect(limiter);limiter.connect(destination);graph.push(limiter);}else bus.connect(destination);
 let reverb=null;if(c.createConvolver){reverb=c.createConvolver();reverb.buffer=bank.impulse;const wet=c.createGain();wet.gain.value=.12;reverb.connect(wet);wet.connect(bus);graph.push(reverb,wet);}
 const dispose=()=>graph.forEach(n=>n.disconnect?.());
 const release=ms=>{clearTimeout(timer);timer=setTimeout(dispose,ms);timer.unref?.();};
 function voice(group,at,len,level,from,to,options={}){
  if(stem!=='mix'&&stem!==group)return;
  if(!options.noise&&!options.fixed){from*=pitch;to*=pitch;}
  at*=scale;len*=scale;const trim=Math.max(0,elapsed-at);if(trim>=len||(options.transient&&trim>.08))return;
  const start=now+Math.max(0,at-elapsed),remaining=len-trim,o=options.noise?c.createBufferSource():c.createOscillator(),g=c.createGain(),local=[o,g];
  if(options.noise){o.buffer=bank.noise;o.loop=true;}else o.type=options.type||'sine';
  let frequency=o.frequency;if(options.noise){const f=c.createBiquadFilter();f.type=options.filter||'lowpass';f.Q.value=options.q??.7;o.connect(f);f.connect(g);frequency=f.frequency;local.push(f);}else o.connect(g);
  frequency.setValueAtTime(Math.max(25,from+(to-from)*trim/len),start);frequency.exponentialRampToValueAtTime(Math.max(25,to),start+remaining);
  const attack=Math.min(options.attack??.025,remaining*.15),hold=Math.max(attack,remaining*(options.hold??.08));
  g.gain.setValueAtTime(.0001,start);g.gain.linearRampToValueAtTime(level,start+attack);g.gain.linearRampToValueAtTime(level*.85,start+hold);g.gain.exponentialRampToValueAtTime(.0001,start+remaining);
  if(c.createStereoPanner&&options.pan){const p=c.createStereoPanner();p.pan.value=options.pan;g.connect(p);p.connect(bus);local.push(p);}else g.connect(bus);
  if(reverb&&!options.noise)g.connect(reverb);
  active++;o.onended=()=>{local.forEach(n=>n.disconnect?.());if(--active===0)release(stopped?0:1000);};o.start(start);o.stop(start+remaining+.03);sources.push(o);
 }
 voice('air',.1,3.7,.07,400,650,{noise:true,attack:.25,hold:.45});
 voice('air',.3,2.3,.065,98,110,{type:'triangle',attack:.15,hold:.3});
 voice('air',.65,1.3,.05,392,390);
 const pitches=[440,508,587,659,740,831,932,1046],pans=[-.25,-.17,.05,.22,.27,.18,0,-.21];
 TRUC_CO_SWORDS.forEach((at,i)=>{
  const f=pitches[i],pan=pans[i],transient=true;
  voice('swords',at,.27,.13,f,f*.965,{attack:.006,pan,transient});
  voice('swords',at+.008,.19,.035,f*2.36,f*2.31,{attack:.008,pan,transient});
  voice('swords',at,.13,.08,1050-i*38,480,{noise:true,filter:'bandpass',q:1.2,attack:.006,pan,transient});
  voice('swords',at+.04,.49,.04,f*1.5,f*1.498,{pan,transient});
 });
 voice('air',3.65,4.90,.18,480,1550,{noise:true,attack:.24,hold:.76});
 voice('air',4.15,4.15,.075,73,146,{type:'triangle',attack:.2,hold:.65});
 [4.1,5.2,6.3].forEach((at,i)=>voice('air',at,.9,.08+i*.015,470+i*85,950+i*120,{noise:true,attack:.11,hold:.4,pan:i%2?.2:-.2}));
 TRUC_CO_TIERS.forEach((at,i)=>{
  const lock=at+.45;
  voice('tiers',lock,.65,.18+i*.025,160-i*18,64-i*3,{type:'triangle',attack:.009,hold:.12,transient:true});
  voice('tiers',lock+.015,.48,.14+i*.015,800,170,{noise:true,attack:.012,transient:true});
  voice('tiers',lock+.025,.8,.075+i*.01,294+i*49,293+i*49,{transient:true});
 });
 voice('pressure',8.40,.22,.11,180,80,{attack:.015,hold:.2});
 voice('pressure',8.42,.18,.08,650,180,{noise:true,attack:.015,hold:.15});
 voice('burst',TRUC_CO_BURST,1.12,.32,140,46,{attack:.008,hold:.10,transient:true});
 voice('burst',TRUC_CO_BURST+.01,.67,.30,1700,120,{noise:true,attack:.009,hold:.12,transient:true});
 voice('burst',TRUC_CO_BURST+.035,.93,.16,220,82,{type:'triangle',attack:.01,hold:.14,transient:true});
 voice('burst',8.95,1.10,.08,440,439,{transient:true});
 voice('tail',9.38,1.08,.065,587,586,{transient:true});
 voice('tail',9.72,.9,.04,880,879,{transient:true});
 voice('tail',9.4,1.3,.065,1100,280,{noise:true,attack:.18,hold:.25});
 // 4/11/2026 v3: bồi lớp — âm dâng cắt đúng mốc nổ, nền chìm một nhịp, bass hạ sâu, cồng, lấp lánh, hợp âm đọng.
 function swell(group,at,len,level,from,to,noise){
  if(stem!=='mix'&&stem!==group)return;at*=scale;len*=scale;if(elapsed>=at+len-.05)return;const end=now+at+len-elapsed,start=now+Math.max(0,at-elapsed),o=noise?c.createBufferSource():c.createOscillator(),g=c.createGain(),local=[o,g];let fr;
  if(noise){o.buffer=bank.noise;o.loop=true;const f=c.createBiquadFilter();f.type='bandpass';f.Q.value=1.3;o.connect(f);f.connect(g);fr=f.frequency;local.push(f);}else{o.type='sine';o.connect(g);fr=o.frequency;from*=pitch;to*=pitch;}
  const u=Math.max(0,elapsed-at)/len;fr.setValueAtTime(from*(to/from)**u,start);fr.exponentialRampToValueAtTime(to,end);
  g.gain.setValueAtTime(.0001+level*u*u,start);g.gain.exponentialRampToValueAtTime(Math.max(.0002,level*.35),start+(end-start)*.7);g.gain.linearRampToValueAtTime(level,end-.01);g.gain.linearRampToValueAtTime(.0001,end+.02);
  g.connect(bus);if(reverb)g.connect(reverb);active++;o.onended=()=>{local.forEach(n=>n.disconnect?.());if(--active===0)release(stopped?0:1000);};o.start(start);o.stop(end+.05);sources.push(o);
 }
 const B=TRUC_CO_BURST;
 swell('pressure',B-1.35,1.35,.15,500,6500,true);
 swell('pressure',B-1.1,1.1,.045,247,988,false);
 if(stem==='mix'&&elapsed<(B-.2)*scale){const t0=now+(B-.2)*scale-elapsed,t1=now+B*scale-elapsed;bus.gain.setValueAtTime(1.55*strength,t0);bus.gain.linearRampToValueAtTime(.5*strength,t1-.012);bus.gain.linearRampToValueAtTime(1.55*strength,t1);}
 voice('burst',B,1.8,.34,110,32,{attack:.004,hold:.12,transient:true,fixed:true});
 [1,1.48,2.05,2.76].forEach((r,i)=>voice('burst',B+.012,3.2-i*.4,[.07,.05,.035,.022][i],130.8*r,130.8*r*.997,{attack:.004,hold:.02,transient:true}));
 [1568,2093,2637,3136].forEach((f,i)=>voice('burst',B+.06+i*.03,2.3-i*.25,.016,f,f*1.003,{attack:.06,hold:.25,transient:true}));
 voice('burst',B+.04,1.5,.055,9000,2500,{noise:true,filter:'highpass',attack:.02,hold:.15,transient:true});
 [146.8,185,220,293.7].forEach((f,i)=>voice('tail',B+.2,2.2,.026-i*.003,f,f*1.001,{attack:.4,hold:.55,transient:true}));
 // v3 (05/11/2026) — lớp điện ảnh cho "Linh Mạch Định Cơ" (nhóm 'cine', chỉ phát ở bản mix).
 const cv=(at,len,level,from,to,o={})=>voice('cine',at,len,level,from,to,{...o,transient:true}); // lỡ mốc thì bỏ, không phát nửa chừng
 const drum=(at,level,f0=130,f1=38,len=1.1)=>{cv(at,len,level,f0,f1,{attack:.003,hold:.05,fixed:true,transient:true});cv(at,.2,level*.5,2400,280,{noise:true,attack:.002,hold:.04,transient:true});};
 const strings=(at,len,notes,level,attack=.8)=>notes.forEach((f,i)=>{for(const d of [.997,1.004])cv(at,len,level/(i+1.4),f*d,f*d,{type:'sawtooth',attack,hold:.75});});
 const gong=(at,f0,level)=>[1,1.48,2.05,2.76,3.6].forEach((r,i)=>cv(at,3.4-i*.45,level*[1,.7,.5,.32,.2][i],f0*r,f0*r*.997,{attack:.004,hold:.02,transient:true}));
 // 0–1,6 s địa mạch thức tỉnh: đất rền + trống trầm + cồng thấp; chuông vàng theo mạch trên sống núi.
 cv(0,1.8,.07,60,240,{noise:true,filter:'lowpass',q:.6,attack:.5,hold:.6});
 drum(.05,.26,95,34,1.6);gong(.05,87.3,.07);
 [1174.7,1318.5,1568,1760].forEach((f,i)=>cv(.6+i*.22,.9,.016,f,f*1.002,{attack:.005,hold:.04,pan:i%2?.3:-.3}));
 // 2,4–8,6 s thiên ấn giáng: kèn trầm (sawtooth thấp) trượt lên + dàn dây Rê thứ dày dần.
 cv(2.4,6.0,.028,55,73.4,{type:'sawtooth',attack:1.4,hold:.85});
 strings(2.6,6.0,[146.8,174.6,220],.017,1.6);strings(5.2,3.4,[293.7,349.2,440],.012,1.2);
 // 3,6–8,6 s nạp mạch: nhịp tim trống dồn dần (khoảng cách .8 → .28 s).
 {let t=3.65,gap=.8,i=0;while(t<8.55){drum(t,.07+i*.005,92,40,.5);drum(t+.15,.055,88,40,.32);t+=gap;gap=Math.max(.28,gap*.88);i++;}}
 // Ba lần định cơ: trống lớn + cồng khi vòng ấn chạm tầng đài.
 TRUC_CO_TIERS.forEach((at,i)=>{drum(at+.47,.09+i*.02,125-i*8,36,1.0);gong(at+.48,110+i*16.5,.016+i*.004);});
 // Nổ: trống lớn ba lớp (sóng đất), tiếng đá vỡ, đá rơi lách cách sau đó.
 drum(B,.3,150,32,1.9);drum(B+.24,.17,130,38,1.1);drum(B+.52,.09,120,40,.8);
 cv(B+.01,1.0,.13,1400,260,{noise:true,filter:'bandpass',q:.9,attack:.004,hold:.08,transient:true});
 for(let i=0;i<9;i++){const t=B+.35+i*.13+((i*37)%7)*.02;cv(t,.12,.035,2600-i*120,900,{noise:true,filter:'bandpass',q:3,attack:.002,hold:.05,pan:((i*53)%9-4)/6,transient:true});}
 // Hiện thân: dàn dây Rê trưởng add9 nở + sáo (sine + bồi âm nhẹ) một câu ngắn ngũ cung đi lên.
 strings(B+.15,2.0,[146.8,185,220,329.6],.026,.35);
 [[587.3,.0,.45],[659.3,.42,.4],[880,.8,.6],[740,1.36,.35],[880,1.68,.9]].forEach(([f,d,l])=>{cv(B+.25+d,l+.25,.03,f,f*1.003,{attack:.06,hold:.6});cv(B+.25+d,l+.2,.008,f*2,f*2.006,{attack:.08,hold:.5});});
 if(!active)dispose();
 return {endAt:now+Math.max(0,duration-elapsed)+1,stop(){if(stopped)return;stopped=true;const t=c.currentTime;bus.gain.cancelScheduledValues(t);bus.gain.setTargetAtTime(.0001,t,.012);for(const o of sources)try{o.stop(t+.05);}catch{}release(80);}};
}
