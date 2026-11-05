// Original Web Audio score, one clock, bounded graph and explicit interruption cleanup.
const banks=new WeakMap();
function noiseBank(c){if(banks.has(c))return banks.get(c);const b=c.createBuffer(1,c.sampleRate*2,c.sampleRate),data=b.getChannelData(0);let seed=749291,low=0;for(let i=0;i<data.length;i++){seed=(Math.imul(seed,1664525)+1013904223)|0;low=low*.7+(seed/2147483648)*.3;data[i]=low;}banks.set(c,b);return b;}
export function scheduleAscensionScore(c,destination,score,elapsed,duration,nativeDuration,strength=1){const scale=duration/nativeDuration,now=c.currentTime,bus=c.createGain(),limiter=c.createDynamicsCompressor(),nodes=[bus,limiter],sources=[];let timer,stopped=false;
 bus.gain.value=strength;limiter.threshold.value=-12;limiter.knee.value=8;limiter.ratio.value=6;limiter.attack.value=.004;limiter.release.value=.2;bus.connect(limiter);limiter.connect(destination);
 for(const cue of score){let [at,len,f,end,volume,kind='sine',pan=0]=cue;at*=scale;len*=scale;if(cue[7]&&elapsed>at+.08)continue;const trim=Math.max(0,elapsed-at);if(trim>=len||trim>.08&&len<1)continue;const start=now+Math.max(0,at-elapsed),remain=len-trim,noise=['wind','sword','impact'].includes(kind),o=noise?c.createBufferSource():c.createOscillator(),g=c.createGain();let frequency;
  if(noise){o.buffer=noiseBank(c);o.loop=true;const filter=c.createBiquadFilter();filter.type=kind==='sword'?'bandpass':'lowpass';filter.Q.value=kind==='sword'?3:.6;o.connect(filter);filter.connect(g);frequency=filter.frequency;nodes.push(filter);}else if(kind==='roar'){
   o.type='sawtooth';const throat=c.createBiquadFilter();throat.type='lowpass';throat.Q.value=5;throat.frequency.setValueAtTime(950,start);throat.frequency.exponentialRampToValueAtTime(220,start+remain);o.connect(throat);throat.connect(g);frequency=o.frequency;nodes.push(throat);
   const rumble=c.createOscillator(),depth=c.createGain();rumble.frequency.value=7.5;depth.gain.value=volume*.28;rumble.connect(depth);depth.connect(g.gain);rumble.start(start);rumble.stop(start+remain+.03);sources.push(rumble);nodes.push(rumble,depth);
  }else{o.type=kind;o.connect(g);frequency=o.frequency;}
  frequency.setValueAtTime(Math.max(24,f+(end-f)*trim/len),start);frequency.exponentialRampToValueAtTime(Math.max(24,end),start+remain);g.gain.setValueAtTime(.0001,start);g.gain.linearRampToValueAtTime(volume,start+Math.min(.12,remain*.12));
  if(kind==='wind'&&remain>1)g.gain.linearRampToValueAtTime(volume*.8,start+remain*.7);
  g.gain.exponentialRampToValueAtTime(.0001,start+remain);
  if(pan&&c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=pan;g.connect(p);p.connect(bus);nodes.push(p);}else g.connect(bus);
  o.start(start);o.stop(start+remain+.03);sources.push(o);nodes.push(o,g);
 }
 const cleanup=()=>nodes.forEach(n=>{try{n.disconnect();}catch{}});timer=setTimeout(cleanup,Math.max(0,(duration-elapsed+1)*1000));timer.unref?.();return {stop(){if(stopped)return;stopped=true;clearTimeout(timer);sources.forEach(s=>{try{s.stop();}catch{}});cleanup();}};
}
