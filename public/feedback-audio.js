// Original synthesized feedback sounds, prerendered once per AudioContext.
// One short AudioBufferSource per cue; never allocate oscillators on the impact frame.
const bank=new WeakMap();
const TAU=Math.PI*2;
const clamp=n=>Math.max(0,Math.min(1,n));
const notes={
 crystal:[880,1320,1760],
 heart:[523.25,659.25,783.99],
 stage:[196,392,587.33],
 reward:[392,587.33,784],
 hit:[95,190,760]
};
function makeSound(c,kind){
 const rate=24000,length=kind==='crystal'?.76:kind==='stage'?.95:kind==='reward'?.68:kind==='hit'?.32:.48;
 const buffer=c.createBuffer(1,Math.ceil(rate*length),rate),data=buffer.getChannelData(0),freq=notes[kind];
 let random=81357;
 for(let i=0;i<data.length;i++){
  const t=i/rate;
  random=(Math.imul(random,1664525)+1013904223)|0;
  const noise=random/2147483648;
  let v=0;
  if(kind==='crystal'){
   for(let j=0;j<3;j++){
    const a=t-j*.13;
    if(a>0){const env=Math.exp(-a*11)*(1-Math.exp(-a*800));
     v+=(Math.sin(TAU*freq[j]*a)+.29*Math.sin(TAU*freq[j]*2.02*a))*env*.22;}
   }
  }else if(kind==='heart'){
   for(let j=0;j<2;j++){const a=t-j*.16;if(a>=0)v+=Math.sin(TAU*(freq[j]*(.84+.27*Math.exp(-a*24)))*a)*Math.exp(-a*20)*.19;}
  }else if(kind==='hit'){
   v=Math.sin(TAU*(70+120*Math.exp(-t*24))*t)*Math.exp(-t*17)*.26 +noise*Math.exp(-t*48)*.09;
  }else{
   const fade=Math.exp(-t*(kind==='stage'?3.3:5.4));
   v=(Math.sin(TAU*freq[0]*t)*.12+Math.sin(TAU*freq[1]*t)*.08+
     Math.sin(TAU*freq[2]*t)*.05+noise*Math.exp(-t*60)*.026)*fade*(1-Math.exp(-t*240));
  }
  data[i]=v*Math.min(1,t*700,(length-t)*45);
 }
 return buffer;
}
export function prepareFeedbackAudio(c){
 if(bank.has(c))return bank.get(c);
 const samples=new Map(Object.keys(notes).map(kind=>[kind,makeSound(c,kind)]));
 bank.set(c,samples);return samples;
}
export function playFeedbackAudio(audio,kind,level=1){
 const c=audio.ctx;
 if(!audio.enabled||!c||c.state!=='running'||audio.sfx<=0)return false;
 const sounds=prepareFeedbackAudio(c);
 if(!sounds.has(kind))return false;
 const now=c.currentTime;
 audio.feedbackLast??=new Map();
 const last=audio.feedbackLast.get(kind)??-1e9;
 const cooldown=kind==='heart'?1.2:kind==='crystal'?.4:kind==='hit'?.35:.7;
 if(now-last<cooldown)return false;
 audio.feedbackLast.set(kind,now);
 const source=c.createBufferSource(),gain=c.createGain();
 source.buffer=sounds.get(kind);
 gain.gain.value=(kind==='hit'?.20:.22)*Math.max(.25,Math.min(1,Number(level)||.4))*(audio.ducked?.55:1);
 source.connect(gain);gain.connect(audio.fxBus);
 source.onended=()=>{source.disconnect();gain.disconnect();};
 source.start(now);
 return true;
}
