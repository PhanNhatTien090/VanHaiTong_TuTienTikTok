
const RATE=24000;
export const CINEMATIC_SOUND={
  void:{root:98,body:[1,1.49,2.71],sub:.26,crack:.18,tail:1.32},
  gold:{root:147,body:[1,2,3.02],sub:.21,crack:.13,tail:1.18},
  resonance:{root:196,body:[1,1.5,2],sub:0,crack:.035,tail:.85},
  dawn:{root:131,body:[1,1.5,2.02],sub:.16,crack:.10,tail:.76},
  dusk:{root:73,body:[1,1.41,2.18],sub:.18,crack:.12,tail:.8},
  jade:{root:294,body:[1,1.5,2.41],sub:0,crack:.025,tail:.42},
  storm:{root:92,body:[1,1.49,3.18],sub:.23,crack:.22,tail:1.04},
  flame:{root:131,body:[1,1.88,2.99],sub:.20,crack:.15,tail:1.06},
  blade:{root:196,body:[1,2.01,3.65],sub:.12,crack:.27,tail:.82},
  healing:{root:294,body:[1,1.5,2.99],sub:0,crack:.045,tail:1.06},
  tide:{root:110,body:[1,1.35,1.98],sub:.20,crack:.08,tail:1.15},
  crystal:{root:330,body:[1,1.50,2.96],sub:.02,crack:.22,tail:.95},
  'void-blade':{root:71,body:[1,1.414,2.7],sub:.19,crack:.27,tail:1.22},
  starlight:{root:185,body:[1,1.5,2.76],sub:.13,crack:.16,tail:1.28},
  blossom:{root:260,body:[1,1.33,2.0],sub:.09,crack:.11,tail:1.04},
  'holy-bell':{root:196,body:[1,2.0,3.0],sub:.17,crack:.09,tail:1.43},
  meteor:{root:87,body:[1,1.499,2.35],sub:.29,crack:.26,tail:1.37},
  fracture:{root:62,body:[1,1.94,3.24],sub:.20,crack:.33,tail:.52}
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
    // Give key dramatic moments a real timbral identity, not just pitch-shifted
    // sine waves. Still renders ONCE into a 24k mono buffer, never in the hit frame.
    if(preset==='fracture'){
      if(layer==='charge')value+=.13*(band-low)*u*u;
      else if(layer==='sub')value+=.10*tone(42+22*Math.exp(-t*9),t)*Math.exp(-t*12);
      else if(layer==='crack'){
        const burst=Math.exp(-t*51)+.42*Math.exp(-Math.max(0,t-.018)*125)*(t>=.018);
        value=(band-low)*.31*burst+tone(1700-350*u,t)*.11*Math.exp(-t*42);
      }else if(layer==='body'){
        value=.075*tone(677,t)*Math.exp(-t*11)+.054*tone(1023.4,t)*Math.exp(-t*13)+
          .062*(band-low)*Math.exp(-t*9);
      }else if(layer==='tail')value+=.051*tone(1432.7,t)*Math.exp(-t*7)+
        .038*tone(2131,t)*Math.exp(-t*8);
    }else if(preset==='storm'&&layer==='body'){
      value+=.12*low*Math.exp(-t*5)+.08*tone(67-12*u,t)*Math.exp(-t*6);
    }else if(preset==='meteor'&&layer==='body'){
      value+=.115*(band-low)*Math.exp(-t*8)+.075*tone(52+25/(1+t*25),t)*Math.exp(-t*4);
    }else if(preset==='holy-bell'&&(layer==='body'||layer==='tail')){
      value+=.068*tone(root*2.397,t)*Math.exp(-t*4)+.037*tone(root*3.958,t)*Math.exp(-t*6);
    }else if(preset==='void-blade'&&layer==='charge'){
      value+=.077*tone(root*(1.6-.86*u),t)*u*u;
    }
    const sample=value*fade(t,length);
    data[i]=Math.max(-.78,Math.min(.78,sample));
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
