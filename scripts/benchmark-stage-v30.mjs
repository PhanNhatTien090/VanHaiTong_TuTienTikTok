import {createCanvas,loadImage} from '@napi-rs/canvas';import fs from 'node:fs/promises';
import {Scene} from '../public/scene.js';import {CharacterAnimator} from '../public/character-animation.js';import {CharacterFrames,QUALITY} from '../public/performance.js';import {SKINS} from '../public/cosmetics.js';
globalThis.document={body:{classList:{contains:()=>true}},createElement:()=>createCanvas(1,1)};
const art=await loadImage('public/assets/cultivators-v3.png'),standing=await loadImage('public/assets/cultivators-standing-v14.png');
const rows=[];
for(const count of [24,8,1]){
 const s=Object.create(Scene.prototype);Object.assign(s,{motion:true,characterArt:art,standingArt:standing,showNames:true,animator:new CharacterAnimator(),characterFrames:new CharacterFrames(createCanvas),budget:{level:'light',config:QUALITY.light},effects:[],targets:Array.from({length:count},(_,i)=>({id:'p'+i,x:100+(i%6)*140,y:200+Math.floor(i/6)*300,scale:1.6,player:{id:'p'+i,name:'Đạo hữu '+i,realm:5+i%4,giftCoins:SKINS[i%5].min,gender:i%2?'nu':'nam',equipped:'cosmic-cauldron',qi:90,neededQi:100,stones:0,neededStones:30}}))});
 const c=createCanvas(540,960).getContext('2d');c.scale(.6,.6);const times=[];
 for(let f=0;f<180;f++){const t=f*1000/24;if(f%70===0)for(const a of s.targets)s.animator.trigger({id:'e'+f+a.id,user:a.id,effect:'attack'},t);const begin=performance.now();c.clearRect(0,0,900,1600);for(const a of s.targets)s.drawPlayer(c,a.player,a.x,a.y,t);s.drawNames(c,t);if(f>24)times.push(performance.now()-begin);}
 times.sort((a,b)=>a-b);rows.push({actors:count,meanMs:+(times.reduce((a,b)=>a+b,0)/times.length).toFixed(2),p95Ms:+times[Math.floor(times.length*.95)].toFixed(2)});
}
await fs.writeFile('output/performance-stage-v30.json',JSON.stringify({note:'Same light quality, same current renderer, actor-and-name drawing only. Excludes compositor, network, TTS, background and VIP VFX.',rows},null,2));console.log(JSON.stringify(rows));
