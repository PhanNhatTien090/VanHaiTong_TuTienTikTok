import {scheduleAscensionScore} from './ascension-score.js';
export const DAI_THUA_SCORE=Object.freeze([
 [.1,3,62,82,.11,'triangle'],[.2,4,240,470,.11,'wind'],
 ...Array.from({length:12},(_,i)=>[2+i*.25,.8,330*Math.pow(2,i/12),330*Math.pow(2,i/12)*.999,.055,'sine',(i%2?1:-1)*.4]),
 [5.5,3.8,180,850,.12,'wind'],[6,2.8,98,147,.07,'triangle'],
 ...[294,370,440].map((f,i)=>[8.8+i*.3,1.8,f,f*.999,.07]),
 [11.8,2.4,72,36,.17,'triangle'],[11.8,2.5,1800,330,.13,'wind'],
 [15,2.8,147,587,.075],[15.1,2.7,148,589,.035],
 [18,1,330,55,.075,'triangle'],[19,2.2,105,28,.28,'triangle'],[19.02,1.1,1400,180,.21,'wind'],
 ...[392,494,587,784].map((f,i)=>[19.3+i*.13,2.7,f,f*.999,.045])
]);
export function daiThuaMusicDuck(ms){const t=ms/1000;return t<5.5?.48:t<15?.27:t<19?.14:t<20.4?.11:Math.min(1,.11+(t-20.4)/2.4*.89);}
export function scheduleDaiThuaAudio(c,bus,elapsed=0,duration=22.8,strength=1){return scheduleAscensionScore(c,bus,DAI_THUA_SCORE,elapsed,duration,22.8,strength);}
