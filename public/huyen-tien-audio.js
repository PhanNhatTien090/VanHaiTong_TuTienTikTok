import {scheduleAscensionScore} from './ascension-score.js';import {qiVariant} from './qi-impact.js';
import {HX_ACTION_TIMELINE as T,hxRealTime,HUYEN_TIEN_TIMELINE as REAL} from './huyen-tien-timeline.js';
// Synthesized material layers, one absolute clock: crack / metal attack / body / air / score.
const thunder=(at,force=1)=>[[at,.19,6500,700,.16*force,'impact',-.3,true],[at+.015,.65,90,30,.22*force,'triangle',0,true],[at+.08,1.05,700,85,.13*force,'wind',.35,true]];
const slash=(at,pan=0,force=1)=>[[at,.17,5300,1100,.105*force,'sword',pan,true],[at+.015,.12,1568,740,.045*force,'triangle',pan,true],[at+.018,.09,2665,2450,.018*force,'sine',pan,true],[at+.08,.3,3600,450,.065*force,'sword',-pan*.6,true]];
const actionScore=[
 [.01,1.1,320,1800,.08,'wind'],...thunder(.18),...thunder(1.02,.7),[1.1,1.6,147,73.4,.07,'triangle'],[1.3,1.4,1200,200,.09,'wind'],...thunder(2.65,.65),
 ...Array.from({length:12},(_,i)=>slash(3.05+i*.095,i%2?.6:-.6,.85)).flat(),
 ...Array.from({length:18},(_,i)=>slash(4.8+i*.34,Math.sin(i*2.4)*.7,i%3===0?1:.65)).flat(),
 ...Array.from({length:6},(_,i)=>slash(11.1+i*.13,(i%2?1:-1)*.5,1.15)).flat(),
 ...[6.4,7.5,8.6].flatMap(at=>[...thunder(at,.8),[at+.025,.45,2350,230,.11,'impact',0,true],[at+.04,.8,392,196,.055,'triangle',0,true]]),...thunder(11.12,.8),[12.25,.8,147,36,.2,'triangle',0,true],[12.45,2.5,98,147,.07,'triangle'],
 ...thunder(13.2,.65),...thunder(14.72,.65),...thunder(16.05,.7),
 ...[17,18.1,19.2].flatMap((at,i)=>[...slash(at,i%2?.7:-.7,1.5),[at+.12,.6,1700,130,.15,'impact',0,true],[at+.13,.8,82.4,32,.17,'triangle',0,true]]),
 ...thunder(21.08,.9),...thunder(22.05,.8),...thunder(23.05,.85),
 [23.4,.6,900,4300,.13,'wind'],...slash(23.82,0,1.3),...thunder(24.05,.8),
 ...Array.from({length:6},(_,i)=>slash(24.08+i*.025,(i%2?1:-1)*.6,.45)).flat(),
 ...thunder(25.12,.6),...thunder(26.22,.6),
 ...Array.from({length:6},(_,i)=>slash(26.4+i*.13,(i%2?1:-1)*.4,.85)).flat(),
 [27.45,.62,1700,80,.13,'wind'],[27.7,.42,98,40,.08,'triangle'],
 ...thunder(T.impactAt,1.15),[T.impactAt,.65,2800,170,.18,'impact',.3,true],
 // An original repeating motif develops across the storm, forge, trial and coronation.
 ...Array.from({length:12},(_,i)=>{const f=[196,293.66,246.94,392,293.66,493.88][i%6];return [3+i*.63,.45,f,f,.043,'triangle',i%2?.2:-.2];}),
 ...Array.from({length:8},(_,i)=>[12.5+i*.5,.7,[196,246.94,293.66,392][i%4],[196,246.94,293.66,392][i%4],.045,'triangle']),
 ...Array.from({length:8},(_,i)=>[20.8+i*.65,.5,[147,196,220,293.66][i%4],[147,196,220,293.66][i%4],.043,'triangle']),
 ...[196,246.94,293.66,392,493.88].map((f,i)=>[T.revealAt+i*.08,3.2,f,f,.05,'sine',(i-2)*.15]),
 ...Array.from({length:8},(_,i)=>[29.2+i*.4,.8,[392,493.88,587.33,783.99][i%4],[392,493.88,587.33,783.99][i%4],.045,'triangle',(i%2?1:-1)*.25]),
 [33,2.8,600,120,.055,'wind'],[33.2,2.6,196,196,.04,'sine']
];
// Compress only pauses in the action score; short material transients keep their attack lengths.
const material=actionScore.map(([at,len,...rest])=>[hxRealTime(at),Math.min(len,26-hxRealTime(at)),...rest]);
const cinematic=[];
// Low strings in fifths, an accelerating ostinato and deep drum accents support the action.
for(let i=0;i<30;i++){const at=.25+i*.56,f=[98,146.83,123.47,196,146.83,110][i%6];cinematic.push([at,.44,f,f,.034,'triangle',(i%2?1:-1)*.2],[at,.38,f*2,f*2,.012,'sawtooth',(i%2?-1:1)*.28]);}
for(const at of [.12,1.8,3.6,4.6,5.45,6.1,7.05,8,9.1,10.6,11.7,12.8,15,15.6,17.5,18.1])cinematic.push([at,.48,110,35,.22,'sine',0,true],[at,.16,950,90,.11,'impact',0,true]);
for(let i=0;i<6;i++){const at=16.5+i*.23;cinematic.push([at,.16,100+i*8,45,.12+i*.007,'triangle',0,true]);}
for(const [i,f]of [196,246.94,293.66,392].entries())cinematic.push([18.55+i*.06,4.4,f,f,.04,'triangle',(i-1.5)*.22]);
export const HUYEN_TIEN_SCORE=Object.freeze([...material,...cinematic].sort((a,b)=>a[0]-b[0]).map(Object.freeze));
export function huyenTienMusicDuck(ms){const s=ms/1000;return s<17.5?.15:s<18.1?.05:s<21?.12:Math.min(1,.12+(s-21)/5*.88);}
const impulses=new WeakMap();
function hall(c){if(impulses.has(c))return impulses.get(c);const b=c.createBuffer(2,Math.floor(c.sampleRate*1.65),c.sampleRate);let seed=9317;for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);for(let i=0;i<d.length;i++){seed=(Math.imul(seed,1664525)+1013904223)|0;d[i]=(seed/2147483648)*Math.pow(1-i/d.length,3)*.38;}}impulses.set(c,b);return b;}
export function scheduleHuyenTienAudio(c,bus,elapsed=0,duration=26,strength=1,event={}){const pitch=qiVariant(event).pitch;const score=HUYEN_TIEN_SCORE.map(([at,len,f,end,vol,kind,pan,transient])=>[at,len,f*pitch,end*pitch,vol,kind,pan,transient]);
 const nodes=[];let destination=bus;
 // Dedicated hall: a dry attack stays sharp; the diffuse tail places it in a large ritual space.
 if(c.createConvolver){const input=c.createGain(),rev=c.createConvolver(),wet=c.createGain(),low=c.createBiquadFilter();input.connect(bus);rev.buffer=hall(c);wet.gain.value=.19;low.type='lowpass';low.frequency.value=3400;input.connect(rev);rev.connect(low);low.connect(wet);wet.connect(bus);nodes.push(input,rev,low,wet);destination=input;}
 const cue=scheduleAscensionScore(c,destination,score,elapsed,duration,26,strength);let timer=setTimeout(()=>nodes.forEach(n=>n.disconnect()),Math.max(0,(duration-elapsed+2)*1000));timer.unref?.();return {stop(){clearTimeout(timer);cue.stop();nodes.forEach(n=>n.disconnect());}};
}
