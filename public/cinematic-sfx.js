
const RATE=24000;
export const CINEMATIC_SOUND={
  void:{root:98,body:[1,1.49,2.71],sub:.26,crack:.18,tail:1.32},
  gold:{root:147,body:[1,2,3.02],sub:.21,crack:.13,tail:1.18},
  resonance:{root:196,body:[1,1.5,2],sub:0,crack:.035,tail:.85},
  dawn:{root:131,body:[1,1.5,2.02],sub:.16,crack:.10,tail:.76},
  dusk:{root:73,body:[1,1.41,2.18],sub:.18,crack:.12,tail:.8},
  jade:{root:294,body:[1,1.5,2.41],sub:0,crack:.025,tail:.42}
};
const layers=['charge','sub','crack','body','tail'];
const bank=new WeakMap();
const TAU=Math.PI*2;
const fade=(t,length)=>Math.max(0,Math.min(1,t/.007,(length-t)/.035));
const tone=(hz,t)=>Math.sin(TAU*hz*t);
function voiceSamples(c,preset,layer){
  const {root,body,sub,crack,tail}=CINEMATIC_SOUND[preset];
  const length={charge:.86,sub:.24,crack:.065,body:tail*.72,tail}[layer];
  const out=c.createBuffer(1,Math.ceil(RATE*length),RATE);
  const data=out.getChannelData(0);
  let seed=31077,low=0,band=0;
  for(let i=0;i<data.length;i++){
    const t=i/RATE,u=t/length;
    seed=(Math.imul(seed,1664525)+1013904223)|0;
    const white=seed/2147483648;
    low+=.08*(white-low);band+=.39*(white-band);
    let value;
    switch(layer){
      case 'charge':
        value=(tone(root*(.76+.52*u),t)*.063+(band-low)*.16)*u*u;
        break;
      case 'sub':
        value=sub*tone(52+53/(1+t*20),t)*Math.exp(-t*14);
        break;
      case 'crack':
        value=crack*(band-low+tone(root*7.3,t)*.33)*Math.exp(-t*46);
        break;
      case 'body':
        value=0;
        for(let j=0;j<body.length;j++)value+=tone(root*body[j],t)*Math.exp(-t*(5+j*2))/(1+j);
        value*=.117;
        break;
      case 'tail':
        value=(tone(root*body[1],t)*.066+tone(root*body[2]*1.003,t)*.031+low*.025)*Math.exp(-t*3.3)*Math.min(1,t/.08);
        break;
    }
    data[i]=value*fade(t,length);
  }
  return out;
}

export function prepareCinematicAudio(c){
  if(bank.has(c))return bank.get(c);
  const byPreset=new Map();
  for(const preset of Object.keys(CINEMATIC_SOUND)){
    byPreset.set(preset,layers.map(layer=>voiceSamples(c,preset,layer)));
  }
  bank.set(c,byPreset);
  return byPreset;
}

export class CinematicSfx{
  constructor(context,destination){
    this.context=context;
    this.destination=destination;
    this.buffers=prepareCinematicAudio(context);
    this.active=new Map();
    this.seen=new Set();
  }
  schedule(id,preset,delay,{gain=1,priority=1,enabled={},charge=true}={}){
    if(this.seen.has(id)||!this.buffers.has(preset)||!Number.isFinite(delay)||delay<-.12)return false;
    if(this.active.size>=3){
      let weakest;
      for(const voice of this.active.values())if(!weakest||voice.priority<weakest.priority)weakest=voice;
      if(weakest.priority>=priority)return false;
      weakest.stop();
    }
    this.seen.add(id);
    if(this.seen.size>192)this.seen.delete(this.seen.values().next().value);
    const c=this.context,now=c.currentTime,hit=now+delay;
    const output=c.createGain();
    output.gain.value=gain;
    output.connect(this.destination);
    const sources=new Set();
    const dispose=()=>{this.active.delete(id);output.disconnect();};
    this.buffers.get(preset).forEach((buffer,i)=>{
      const layer=layers[i];
      if(enabled[layer]===false||(i===0&&!charge)||(i===1&&!CINEMATIC_SOUND[preset].sub))return;
      const length=buffer.getChannelData(0).length/RATE;
      const start=i===0?hit-length-.095:i===4?hit+.12:hit;
      const offset=Math.max(0,now-start);
      if(offset>=length||(i===2&&offset>.04))return;
      const source=c.createBufferSource();
      source.buffer=buffer;
      source.connect(output);
      sources.add(source);
      source.onended=()=>{
        sources.delete(source);source.disconnect();
        if(!sources.size)dispose();
      };
      source.start(Math.max(now,start),offset);
    });
    if(!sources.size){dispose();this.seen.delete(id);return false;}
    this.active.set(id,{priority,sources,stop(){
      for(const source of sources){source.onended=null;source.stop();source.disconnect();}
      sources.clear();dispose();
    }});
    return true;
  }
  cancel(id){this.active.get(id)?.stop();}
  clear({replay=false}={}){
    for(const voice of this.active.values())voice.stop();
    if(replay)this.seen.clear();
  }
  get sourceCount(){
    let count=0;
    for(const voice of this.active.values())count+=voice.sources.size;
    return count;
  }
}
