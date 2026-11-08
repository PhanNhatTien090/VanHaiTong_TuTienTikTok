// Đo chi phí vẽ đua 200 người (CPU, offline). node scripts/bench-race-crowd.mjs [số người]
import {createCanvas} from '@napi-rs/canvas';import {raceTargets,drawRace} from '../public/sword-race.js';
const n=Number(process.argv[2])||200,racers=Array.from({length:n},(_,i)=>({id:'p'+i,name:'Người '+i,at:i,startedAt:0,speed:4,bonus:(i*37)%300})),players=racers.slice(0,12).map(r=>({id:r.id,name:r.name}));
const scene={height:1600,motion:true,budget:{level:'normal'},raceStatus:{active:true,phase:'running',startedAt:0,endsAt:90000,racers,giftTop:[]},raceServerNow:60000,raceReceivedAt:0,drawFlyingSword(c){c.fillRect(-2,-25,4,40);},surfaceFactory:(w,h)=>createCanvas(w,h)};
const c=createCanvas(900,1600).getContext('2d');for(let t=0;t<50;t++){scene.targets=raceTargets(scene,players,1600,t*16);drawRace(scene,c,t*16,'back');}
const t0=performance.now();for(let t=0;t<300;t++){scene.targets=raceTargets(scene,players,1600,t*16);drawRace(scene,c,t*16,'back');drawRace(scene,c,t*16,'front');}
console.log(n+' người · ms/khung',((performance.now()-t0)/300).toFixed(2));
