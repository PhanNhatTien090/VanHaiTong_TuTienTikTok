// Original synthesized gate chimes, thunder, effigy harmonics and a single release.
export function hoaThanMusicDuck(ms){const t=ms/1000;return t<4?.5:t<10?.28:t<14.4?.16:t<15.5?.12:Math.min(1,.12+(t-15.5)/2.1*.88);}
export function scheduleHoaThanAudio(c,destination,elapsed=0,duration=17.6,strength=1){
 const bus=c.createGain(),compressor=c.createDynamicsCompressor(),sources=[],nodes=[bus,compressor],scale=duration/17.6;
 bus.gain.value=strength;compressor.threshold.value=-12;compressor.ratio.value=6;bus.connect(compressor);compressor.connect(destination);
 const now=c.currentTime;let timer;
 function tone(at,len,f,end,volume,type='sine'){
  at*=scale;len*=scale;const trim=Math.max(0,elapsed-at);if(trim>=len||trim>.08&&len<1)return;
  const o=c.createOscillator(),g=c.createGain(),start=now+Math.max(0,at-elapsed),remain=len-trim;o.type=type;o.frequency.setValueAtTime(Math.max(24,f+(end-f)*trim/len),start);o.frequency.exponentialRampToValueAtTime(Math.max(24,end),start+remain);g.gain.setValueAtTime(.0001,start);g.gain.linearRampToValueAtTime(volume,start+Math.min(.08,remain*.1));g.gain.exponentialRampToValueAtTime(.0001,start+remain);o.connect(g);g.connect(bus);o.start(start);o.stop(start+remain+.03);sources.push(o);nodes.push(o,g);
 }
 tone(.1,4,65,98,.10,'triangle');tone(2,2.6,196,392,.08);tone(2.12,2.8,197,394,.045);
 for(let i=0;i<6;i++){const f=294*Math.pow(2,i/9);tone(4.4+i*.42,1.2,f,f*.999,.095);tone(7.6+i*.44,.65,110-i*6,36,.14,'triangle');tone(7.62+i*.44,.24,900,180,.025,'sawtooth');}
 for(const f of [147,220,294,440])tone(10.5,2.7,f,f*1.01,.035);
 tone(12.8,1.55,98,490,.08,'triangle');tone(14.4,1.8,85,28,.25,'triangle');tone(14.43,.8,600,120,.06,'sawtooth');
 [392,494,587,784].forEach((f,i)=>tone(14.65+i*.11,2.2,f,f*.999,.045));
 const cleanup=()=>nodes.forEach(n=>{try{n.disconnect();}catch{}});
 timer=setTimeout(cleanup,Math.max(0,(duration-elapsed+1)*1000));timer.unref?.();
 return {stop(){clearTimeout(timer);for(const s of sources){try{s.stop();}catch{}}cleanup();}};
}
