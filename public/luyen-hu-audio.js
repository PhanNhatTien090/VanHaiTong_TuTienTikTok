// Original synthesized spatial gate chimes, serpent flight, eight-seal formation and void fusion.
export function luyenHuMusicDuck(ms){const t=ms/1000;return t<5.2?.48:t<12.6?.27:t<17.2?.15:t<18.2?.11:Math.min(1,.11+(t-18.2)/2.6*.89);}
export function scheduleLuyenHuAudio(c,destination,elapsed=0,duration=20.8,strength=1){
 const bus=c.createGain(),compressor=c.createDynamicsCompressor(),sources=[],nodes=[bus,compressor],scale=duration/20.8;
 bus.gain.value=strength;compressor.threshold.value=-12;compressor.ratio.value=6;bus.connect(compressor);compressor.connect(destination);
 const now=c.currentTime;let timer;
 function tone(at,len,f,end,volume,type='sine'){
  at*=scale;len*=scale;const trim=Math.max(0,elapsed-at);if(trim>=len||trim>.08&&len<1)return;
  const o=c.createOscillator(),g=c.createGain(),start=now+Math.max(0,at-elapsed),remain=len-trim;o.type=type;o.frequency.setValueAtTime(Math.max(24,f+(end-f)*trim/len),start);o.frequency.exponentialRampToValueAtTime(Math.max(24,end),start+remain);g.gain.setValueAtTime(.0001,start);g.gain.linearRampToValueAtTime(volume,start+Math.min(.08,remain*.1));g.gain.exponentialRampToValueAtTime(.0001,start+remain);o.connect(g);g.connect(bus);o.start(start);o.stop(start+remain+.03);sources.push(o);nodes.push(o,g);
 }
 tone(.1,3,54,70,.12,'triangle');tone(2.2,3,110,220,.075);
 for(let i=0;i<8;i++){tone(2.4+i*.28,.9,220*Math.pow(2,i/12),220*Math.pow(2,i/12),.07);}
 tone(5.2,3.8,82,164,.10,'triangle');tone(5.3,2,550,220,.024,'sawtooth');
 for(let i=0;i<8;i++)tone(9.6+i*.18,.8,330*Math.pow(2,i/12),330*Math.pow(2,i/12),.055);[147,185,220].forEach((f,i)=>tone(10.4+i*.2,2.5,f,f*.998,.055));
 tone(12.6,3.2,110,550,.08,'triangle');tone(13.2,2.8,111,553,.04);
 tone(16,1.2,294,55,.07);tone(17.2,2.1,95,26,.28,'triangle');tone(17.23,.8,780,130,.065,'sawtooth');
 [330,392,494,659,784].forEach((f,i)=>tone(17.55+i*.13,2.5,f,f*.999,.045));
 const cleanup=()=>nodes.forEach(n=>{try{n.disconnect();}catch{}});
 timer=setTimeout(cleanup,Math.max(0,(duration-elapsed+1)*1000));timer.unref?.();
 return {stop(){clearTimeout(timer);for(const s of sources){try{s.stop();}catch{}}cleanup();}};
}
