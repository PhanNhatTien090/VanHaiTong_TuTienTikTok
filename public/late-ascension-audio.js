import {lateAscension} from './late-ascension-data.js';
import {scheduleImpactLayers} from './impact-audio.js';

const midi=n=>440*2**((n-69)/12);
export function lateMusicDuck(realm,elapsed){
 const spec=lateAscension(realm),age=elapsed/1000-spec.impact;
 return age<0?.10:Math.min(.9,.10+age*.08);
}
export function scheduleLateAudio(ctx,out,elapsed,duration,realm){
 const spec=lateAscension(realm), scale=duration/(spec.duration/1000), start=ctx.currentTime-elapsed, nodes=[];
 const bus=ctx.createGain(), limiter=ctx.createDynamicsCompressor();
 limiter.threshold.value=-16;limiter.knee.value=6;limiter.ratio.value=12;
 limiter.attack.value=.002;limiter.release.value=.18;bus.connect(limiter);limiter.connect(out);
 const root=midi(spec.notes[0]), impact=spec.impact;
 function tone(at,length,freq,volume,{wave='sine',attack=.02,end=freq,transient=false}={}){
  const cue=at*scale, tail=Math.min(duration,cue+length*scale);
  if(tail<=elapsed||transient&&cue<elapsed||tail<=cue)return;
  const a=Math.max(ctx.currentTime,start+cue), b=start+tail, peak=Math.min(a+(b-a)*.6,a+attack);
  const o=ctx.createOscillator(),g=ctx.createGain();
  o.type=wave;o.frequency.setValueAtTime(freq,a);
  if(end!==freq)o.frequency.exponentialRampToValueAtTime(end,b);
  g.gain.setValueAtTime(.0001,a);g.gain.linearRampToValueAtTime(volume,peak);g.gain.exponentialRampToValueAtTime(.0001,b);
  o.connect(g);g.connect(bus);o.onended=()=>{o.disconnect();g.disconnect();};o.start(a);o.stop(b);nodes.push(o);
 }
 const index=realm-25, meter=[.84,.66,.48,.56][index], phrases=[[0,2,1,4,3],[0,1,3,2,1],[0,3,1,4,2],[0,2,3,4,1]][index];
 for(const [i,[at]] of spec.beats.slice(0,7).entries()){
  const n=spec.notes[phrases[i%phrases.length]];
  tone(at,Math.min(4.3,impact-at-.65),midi(n-12),.10,{wave:'triangle',attack:1.3});
  tone(at+.15,3.1,midi(n+7),.038,{wave:'sine',attack:.75});
  for(let j=0;j<3+index;j++){
   const when=at+j*meter;
   if(when>impact-.9)break;
   tone(when,.85,midi(spec.notes[phrases[(j+i)%phrases.length]]+12),.058,{wave:index===2?'triangle':'sine',transient:true});
  }
 }
 for(let at=impact-8,i=0;at<impact-.65;i++,at+=Math.max(.17,.55-i*.024)){
  tone(at,.28,112+i*1.5,.11+i*.004,{end:42,wave:'triangle',transient:true});
  if(i%2===0)tone(at+.065,.13,midi(spec.notes[i%5]+24),.022,{transient:true});
 }
 tone(impact-2.2,1.8,root,.10,{end:root*2.7,wave:'triangle',attack:1.6});
 const hits=scheduleImpactLayers(ctx,bus,{elapsed,at:impact,duration:spec.duration/1000,scale,root,pitch:1});
 for(let i=0;i<3+index;i++){
  tone(impact+i*.16,1.3,116+i*27,.18,{end:35+i*5,wave:'triangle',transient:true});
 }
 for(let i=0;i<spec.notes.length;i++){
  tone(impact+.35+i*.28,Math.min(5,duration-impact-1),midi(spec.notes[i]+12),.065,{wave:'triangle',attack:.25});
  tone(impact+.45+i*.43,1.8,midi(spec.notes[i]+24),.038,{transient:true});
 }
 return {endAt:start+duration,stop(){hits.stop();for(const o of nodes){try{o.stop();}catch{}}bus.disconnect();limiter.disconnect();}};
}
