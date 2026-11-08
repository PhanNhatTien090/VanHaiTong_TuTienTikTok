// Original lotus blooms, layered spirit harmonics and five-wave release. No samples.
import {NGUYEN_ANH_DURATION,NGUYEN_ANH_BLOOMS,NGUYEN_ANH_RESONANCE,NGUYEN_ANH_BURST} from './nguyen-anh-timeline.js';
const buffers=new WeakMap();
function assets(c){
 if(buffers.has(c))return buffers.get(c);let seed=184963,low=0;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)|0;return seed/2147483648;};
 const noise=c.createBuffer(1,c.sampleRate*3,c.sampleRate),d=noise.getChannelData(0);for(let i=0;i<d.length;i++){low=.65*low+.35*random();d[i]=low*1.5;}
 const impulse=c.createBuffer(2,Math.ceil(c.sampleRate*1.6),c.sampleRate);for(let ch=0;ch<2;ch++){const a=impulse.getChannelData(ch);let filtered=0;for(let i=0;i<a.length;i++){filtered=.6*filtered+.4*random();a[i]=filtered*Math.exp(-i/a.length*7);}}
 const result={noise,impulse};buffers.set(c,result);return result;
}
export function nguyenAnhMusicDuck(elapsed){
 const t=elapsed/1000,mix=(a,b,u)=>{u=Math.max(0,Math.min(1,u));return a+(b-a)*u*u*(3-2*u);};
 if(t<3)return .50;if(t<4)return mix(.50,.32,t-3);
 if(t<5.8)return .32;if(t<6.8)return mix(.32,.22,t-5.8);
 if(t<10)return .22;if(t<10.5)return mix(.22,.13,(t-10)/.5);
 return t<12.1?.13:mix(.13,1,(t-12.1)/2.3);
}
export function scheduleNguyenAnhAudio(c,destination,elapsed=0,duration=14.4,strength=1,stem='mix'){
 const scale=duration/(NGUYEN_ANH_DURATION/1000),now=c.currentTime,bank=assets(c),bus=c.createGain(),sources=[],graph=[bus];let active=0,stopped=false,timer;
 bus.gain.value=1.6*strength;
 if(c.createDynamicsCompressor){const limiter=c.createDynamicsCompressor();limiter.threshold.value=-7;limiter.knee.value=5;limiter.ratio.value=1;limiter.attack.value=.002;limiter.release.value=.18;bus.connect(limiter);limiter.connect(destination);graph.push(limiter);}else bus.connect(destination);
 let reverb=null;if(c.createConvolver){reverb=c.createConvolver();reverb.buffer=bank.impulse;const wet=c.createGain();wet.gain.value=.16;reverb.connect(wet);wet.connect(bus);graph.push(reverb,wet);}
 const dispose=()=>graph.forEach(n=>n.disconnect?.());
 const release=ms=>{clearTimeout(timer);timer=setTimeout(dispose,ms);timer.unref?.();};
 function voice(group,at,len,level,from,to,options={}){
  if(stem!=='mix'&&stem!==group)return;
  at*=scale;len*=scale;const trim=Math.max(0,elapsed-at);if(trim>=len||(options.transient&&trim>.08))return;
  const start=now+Math.max(0,at-elapsed),remaining=len-trim,o=options.noise?c.createBufferSource():c.createOscillator(),g=c.createGain(),local=[o,g];
  if(options.noise){o.buffer=bank.noise;o.loop=true;}else o.type=options.type||'sine';
  let frequency=o.frequency;if(options.noise){const f=c.createBiquadFilter();f.type=options.filter||'lowpass';f.Q.value=options.q??.7;o.connect(f);f.connect(g);frequency=f.frequency;local.push(f);}else o.connect(g);
  frequency.setValueAtTime(Math.max(25,from+(to-from)*trim/len),start);frequency.exponentialRampToValueAtTime(Math.max(25,to),start+remaining);
  const attack=Math.min(options.attack??.025,remaining*.15),hold=Math.max(attack,remaining*(options.hold??.08));
  g.gain.setValueAtTime(.0001,start);g.gain.linearRampToValueAtTime(level,start+attack);g.gain.linearRampToValueAtTime(level*.85,start+hold);g.gain.exponentialRampToValueAtTime(.0001,start+remaining);
  if(c.createStereoPanner&&options.pan){const p=c.createStereoPanner();p.pan.value=options.pan;g.connect(p);p.connect(bus);local.push(p);}else g.connect(bus);
  if(reverb&&!options.noise)g.connect(reverb);
  active++;o.onended=()=>{local.forEach(n=>n.disconnect?.());if(--active===0)release(stopped?0:1650);};o.start(start);o.stop(start+remaining+.03);sources.push(o);
 }
 voice('air',.1,3.7,.085,360,750,{noise:true,attack:.25,hold:.5});
 voice('air',.45,2.3,.08,73,98,{type:'triangle',attack:.17,hold:.3});
 voice('air',.75,1.4,.05,294,293);
 NGUYEN_ANH_BLOOMS.forEach((at,i)=>{
  const f=[392,494,587][i];
  voice('bloom',at,.9,.12,550+i*110,1000+i*130,{noise:true,attack:.10,hold:.22,pan:(i-1)*.2});
  voice('bloom',at+.12,1.05,.08,f,f*.998,{transient:true});
  voice('bloom',at+.14,.7,.019,f*2.7,f*2.69,{transient:true});
 });
 voice('flow',3.5,6.8,.16,480,1350,{noise:true,attack:.3,hold:.75});
 for(let i=0;i<8;i++)voice('flow',3.6+i*.78,.8,.10,500+i*60,1400+i*90,{noise:true,attack:.11,hold:.35,pan:i%2?.22:-.22});
 // Detuned pairs form a soft, wordless spirit resonance without sharp metallic highs.
 [146.83,220,293.66].forEach((f,i)=>{
  voice('spirit',5.8+i*.11,3.08,.052-i*.007,f,f*1.002,{type:'triangle',attack:.24,hold:.65,pan:(i-1)*.13});
  voice('spirit',5.85+i*.11,3.03,.035-i*.004,f*1.004,f*1.006,{attack:.28,hold:.65,pan:(1-i)*.13});
 });
 voice('spirit',5.8,3.0,.07,900,650,{noise:true,filter:'bandpass',q:.75,attack:.35,hold:.65});
 NGUYEN_ANH_RESONANCE.forEach((at,i)=>{
  const f=[294,370,440][i];voice('resonance',at,1.1,.095,f,f*.998,{attack:.02,transient:true});
  voice('resonance',at+.025,.7,.028,f*2,f*1.997,{transient:true});
  voice('resonance',at,.7,.075,140+i*10,82,{type:'triangle',attack:.02,transient:true});
 });
 voice('entry',8.8,1.58,.24,1700,350,{noise:true,attack:.13,hold:.67});
 voice('entry',8.8,1.58,.10,196,98,{attack:.08,hold:.55});
 voice('entry',9.0,1.38,.09,98,146,{type:'triangle',attack:.12,hold:.55});
 voice('pressure',10.4,.18,.12,190,70,{attack:.012,hold:.12});
 voice('pressure',10.4,.16,.07,750,200,{noise:true,attack:.01,hold:.12});
 voice('burst',NGUYEN_ANH_BURST,1.4,.35,160,43,{attack:.008,hold:.12,transient:true});
 voice('burst',NGUYEN_ANH_BURST+.01,.88,.30,2200,110,{noise:true,attack:.009,hold:.14,transient:true});
 voice('burst',NGUYEN_ANH_BURST+.035,1.2,.19,294,98,{type:'triangle',attack:.01,hold:.15,transient:true});
 voice('burst',NGUYEN_ANH_BURST+.04,1.0,.07,110,55,{attack:.012,transient:true});
 for(let i=0;i<5;i++){
  voice('waves',NGUYEN_ANH_BURST+i*.14,.6,.05-i*.006,950-i*70,260,{noise:true,attack:.02,hold:.12,pan:(i%2?.2:-.2),transient:true});
  voice('waves',NGUYEN_ANH_BURST+i*.14+.02,.8,.04-i*.004,294+i*37,293+i*37,{transient:true});
 }
 [11.25,12.15,13.0].forEach((at,i)=>voice('tail',at,1.15,.065-i*.01,[392,494,659][i],[391,493,658][i],{transient:true}));
 voice('tail',12.0,2.2,.08,1200,280,{noise:true,attack:.25,hold:.35});
 voice('tail',12.15,1.5,.04,146.83,146.6,{type:'triangle',attack:.1,hold:.25});
 if(!active)dispose();
 return {endAt:now+Math.max(0,duration-elapsed)+1.6,stop(){if(stopped)return;stopped=true;const t=c.currentTime;bus.gain.cancelScheduledValues(t);bus.gain.setTargetAtTime(.0001,t,.012);for(const o of sources)try{o.stop(t+.05);}catch{}release(80);}};
}
