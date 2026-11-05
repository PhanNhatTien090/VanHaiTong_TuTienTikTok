import {scheduleAscensionScore} from './ascension-score.js';
const originalScore=[
 [.1,5,160,550,.13,'wind'],[.2,4,73,98,.10,'triangle'],
 ...[220,294,370,440].map((f,i)=>[3+i*.65,1.7,f,f*.999,.065]),
 [7,3.8,70,105,.14,'triangle'],[7.1,3.4,650,1500,.17,'wind'],
 ...Array.from({length:9},(_,i)=>[11+i*.42,.95,294*Math.pow(2,i/12),294*Math.pow(2,i/12),.065,'sine',(i%2?1:-1)*.25]),
 [15.2,2.5,120,70,.12,'triangle'],[16.2,2.2,587,784,.065],
 [18.2,3,98,392,.085,'triangle'],[18.3,2.8,99,394,.04],
 [21.3,2.3,95,26,.29,'triangle'],[21.31,1.4,1600,170,.21,'wind'],
 ...[330,392,494,659,784].map((f,i)=>[21.6+i*.14,3,f,f*.999,.045])
];
export const CHAN_TIEN_SCORE=Object.freeze([
 ...originalScore.filter(([at])=>at>=11).map(([at,...rest])=>[at+6,...rest]),
 [.1,3.2,68,42,.12,'triangle'],[.2,4,160,650,.14,'wind'],[1.7,.65,3400,350,.18,'sword',-.4],[1.9,1.7,1400,90,.19,'impact'],
 ...[294,370,440,494,587].map((f,i)=>[3.2+i*.23,1.4,f,f*1.5,.075,'sine',(i-2)*.2]),
 [5.8,2,196,392,.08],[8.5,1.8,95,32,.21,'triangle'],[8.5,1.8,1900,180,.19,'impact'],
 [8.6,2.1,125,43,.14,'roar',-.25],[7.3,2,780,180,.10,'wind',.25],
 [11,5.4,220,3200,.20,'wind'],[12.3,2.8,90,180,.09,'triangle'],
 [14.7,1.8,850,3600,.13,'sword',-.55],[15.2,1.3,1100,250,.14,'wind',.55],
 [16.4,1.5,120,35,.17,'triangle'],[16.4,1.6,1700,150,.16,'impact'],
 [21.2,1.8,98,38,.12,'roar',.2],
 [27.3,2.4,3500,90,.24,'impact'],[27.35,2.8,48,26,.15,'sine']
]);
export function chanTienMusicDuck(ms){const t=ms/1000;return t<7?.48:t<11?.25:t<17?.13:t<24.2?.25:t<27.3?.13:t<28.7?.10:Math.min(1,.10+(t-28.7)/2.9*.90);}
export function scheduleChanTienAudio(c,bus,elapsed=0,duration=31.6,strength=1){return scheduleAscensionScore(c,bus,CHAN_TIEN_SCORE,elapsed,duration,31.6,strength);}
