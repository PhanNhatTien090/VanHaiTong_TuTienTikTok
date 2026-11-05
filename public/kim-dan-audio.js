// Original liquid-gold, resonant metal and solar-release SFX; no external samples.
import {KIM_DAN_DURATION,KIM_DAN_DROPS,KIM_DAN_SEALS,KIM_DAN_BURST} from './kim-dan-timeline.js';
const buffers=new WeakMap();
function assets(c){
 if(buffers.has(c))return buffers.get(c);let seed=73519,low=0;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)|0;return seed/2147483648;};
 const noise=c.createBuffer(1,c.sampleRate*3,c.sampleRate),d=noise.getChannelData(0);for(let i=0;i<d.length;i++){low=.65*low+.35*random();d[i]=low*1.5;}
 const impulse=c.createBuffer(2,Math.ceil(c.sampleRate*1.25),c.sampleRate);for(let ch=0;ch<2;ch++){const a=impulse.getChannelData(ch);let filtered=0;for(let i=0;i<a.length;i++){filtered=.6*filtered+.4*random();a[i]=filtered*Math.exp(-i/a.length*7);}}
 const result={noise,impulse};buffers.set(c,result);return result;
}
export function kimDanMusicDuck(elapsed){
 const t=elapsed/1000,mix=(a,b,u)=>{u=Math.max(0,Math.min(1,u));return a+(b-a)*u*u*(3-2*u);};
 if(t<3.2)return .52;if(t<4.2)return mix(.52,.34,t-3.2);
 if(t<6)return .34;if(t<7)return mix(.34,.22,t-6);
 if(t<8.7)return .22;if(t<9.15)return mix(.22,.14,(t-8.7)/.45);
 return t<10.15?.14:mix(.14,1,(t-10.15)/1.65);
}
export function scheduleKimDanAudio(c,destination,elapsed=0,duration=11.8,strength=1,stem='mix'){
 const scale=duration/(KIM_DAN_DURATION/1000),now=c.currentTime,bank=assets(c),bus=c.createGain(),sources=[],graph=[bus];let active=0,stopped=false,timer;
 bus.gain.value=1.6*strength;
 if(c.createDynamicsCompressor){const limiter=c.createDynamicsCompressor();limiter.threshold.value=-7;limiter.knee.value=5;limiter.ratio.value=8;limiter.attack.value=.002;limiter.release.value=.18;bus.connect(limiter);limiter.connect(destination);graph.push(limiter);}else bus.connect(destination);
 let reverb=null;if(c.createConvolver){reverb=c.createConvolver();reverb.buffer=bank.impulse;const wet=c.createGain();wet.gain.value=.15;reverb.connect(wet);wet.connect(bus);graph.push(reverb,wet);}
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
  active++;o.onended=()=>{local.forEach(n=>n.disconnect?.());if(--active===0)release(stopped?0:1300);};o.start(start);o.stop(start+remaining+.03);sources.push(o);
 }
 voice('air',.1,3.6,.07,360,650,{noise:true,attack:.22,hold:.5});
 voice('air',.3,2.3,.07,98,110,{type:'triangle',attack:.15,hold:.3});
 voice('air',1.4,4.8,.16,450,1300,{noise:true,attack:.3,hold:.7});
 [2.3,3.4,4.5].forEach((at,i)=>voice('air',at,1.1,.09+i*.015,450+i*120,1000+i*180,{noise:true,attack:.14,hold:.45,pan:i%2?.22:-.22}));
 KIM_DAN_DROPS.forEach((at,i)=>{
  const f=240+i*12,pan=Math.sin(i*2.399)*.24;
  voice('liquid',at,.30,.10,f*1.4,f,{attack:.007,pan,transient:true});
  voice('liquid',at+.015,.38,.028,f*2.2,f*1.95,{attack:.009,pan,transient:true});
  voice('liquid',at,.12,.065,1000-i*35,280,{noise:true,filter:'bandpass',q:1.7,attack:.006,pan,transient:true});
 });
 [3.5,4.7,5.9].forEach((at,i)=>voice('condense',at,1.1,.075,110+i*22,110+i*22,{type:'triangle',attack:.12,hold:.25}));
 KIM_DAN_SEALS.forEach((at,i)=>{
  const f=[294,370,440][i],lock=at+.4;
  voice('seals',lock,.9,.12+i*.012,f,f*.998,{attack:.008,transient:true});
  voice('seals',lock+.01,.65,.033,f*2.76,f*2.75,{attack:.012,transient:true});
  voice('seals',lock,.55,.12,140+i*10,82,{type:'triangle',attack:.01,transient:true});
  voice('seals',lock,.15,.055,1400,680,{noise:true,filter:'bandpass',q:1.1,attack:.007,transient:true});
 });
 voice('condense',6.2,2.85,.08,98,146,{type:'triangle',attack:.18,hold:.65});
 voice('condense',7.95,1.08,.23,350,2100,{noise:true,attack:.16,hold:.7});
 voice('condense',8.2,.84,.1,392,196,{attack:.025,hold:.4});
 voice('pressure',9.05,.17,.09,140,65,{attack:.015,hold:.15});
 voice('burst',KIM_DAN_BURST,1.2,.34,155,43,{attack:.008,hold:.12,transient:true});
 voice('burst',KIM_DAN_BURST+.01,.76,.29,1800,130,{noise:true,attack:.009,hold:.14,transient:true});
 voice('burst',KIM_DAN_BURST+.035,1.05,.18,248,82,{type:'triangle',attack:.01,hold:.16,transient:true});
 voice('burst',KIM_DAN_BURST+.04,1.35,.085,294,293,{attack:.012,transient:true});
 voice('burst',KIM_DAN_BURST+.065,.20,.028,1175,880,{type:'triangle',attack:.009,transient:true});
 voice('corona',9.55,1.7,.11,650,220,{noise:true,attack:.14,hold:.38});
 voice('tail',9.58,1.45,.085,392,391,{transient:true});
 voice('tail',9.60,1.1,.025,1082,1080,{transient:true});
 voice('tail',10.45,1.1,.06,587,586,{transient:true});
 voice('tail',10.85,.85,.035,784,783,{transient:true});
 if(!active)dispose();
 return {endAt:now+Math.max(0,duration-elapsed)+1.25,stop(){if(stopped)return;stopped=true;const t=c.currentTime;bus.gain.cancelScheduledValues(t);bus.gain.setTargetAtTime(.0001,t,.012);for(const o of sources)try{o.stop(t+.05);}catch{}release(80);}};
}
