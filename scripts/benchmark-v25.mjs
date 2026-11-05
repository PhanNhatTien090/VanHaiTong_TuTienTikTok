import {createCanvas,loadImage} from '@napi-rs/canvas';
import fs from 'node:fs/promises';
import {Scene as Before} from '../output/scene-before-v25.mjs';
import {Scene as After} from '../public/scene.js';
import {CharacterFrames,QUALITY} from '../public/performance.js';
import {CharacterAnimator} from '../public/character-animation.js';
import {SKINS} from '../public/cosmetics.js';
globalThis.document={body:{classList:{contains:()=>true}},createElement:()=>createCanvas(1,1)};
const art=await loadImage('public/assets/cultivators-v3.png'),standing=await loadImage('public/assets/cultivators-standing-v14.png');
const players=Array.from({length:24},(_,i)=>({id:'actor-'+i,name:'Đạo hữu thử '+i,realm:5+i%4,giftCoins:SKINS[i%5].min,gender:i%2?'nu':'nam',qi:80,neededQi:100,stones:10,neededStones:20,equipped:i%3?'cosmic-cauldron':null}));
const LEGACY={light:{width:540,fps:24,poseFps:10,mesh:3,atmosphereFps:5,effects:3},balanced:{width:720,fps:30,poseFps:12,mesh:4,atmosphereFps:8,effects:5}};
function run(Type,level,config){
 const scene=Object.create(Type.prototype);Object.assign(scene,{motion:true,characterArt:art,standingArt:standing,showNames:true,animator:new CharacterAnimator(),characterFrames:new CharacterFrames(createCanvas),budget:{level,config},effects:[],targets:players.map((player,i)=>({id:player.id,player,x:90+(i%6)*145,y:190+Math.floor(i/6)*300,scale:1.6}))});
 const c=createCanvas(720,1280).getContext('2d');c.scale(.8,.8);const costs=[];
 for(let frame=0;frame<210;frame++){
   const t=frame*1000/30;
   if(frame%90===0)for(const p of players)scene.animator.trigger({id:'a'+frame+p.id,user:p.id,effect:'attack'},t);
   const begin=performance.now();c.clearRect(0,0,900,1600);
   for(const a of scene.targets)scene.drawPlayer(c,a.player,a.x,a.y,t);
   scene.drawNames(c,t);if(frame>=30)costs.push(performance.now()-begin);
 }
 costs.sort((a,b)=>a-b);return {meanMs:+(costs.reduce((a,b)=>a+b,0)/costs.length).toFixed(2),p50Ms:+costs[Math.floor(costs.length*.5)].toFixed(2),p95Ms:+costs[Math.floor(costs.length*.95)].toFixed(2)};
}
const rows=[];for(const level of ['light','balanced']){const before=run(Before,level,LEGACY[level]),after=run(After,level,QUALITY[level]);rows.push({level,before,after,meanReductionPercent:Math.round((1-after.meanMs/before.meanMs)*100)});}
await fs.writeFile('output/performance-v25.json',JSON.stringify({note:'CPU Canvas microbenchmark, 24 actors + names; excludes browser compositor, network, encoder and TTS. Same 24 actors and output size; tuned pose rate, mesh and sprite resolution after.',rows},null,2));console.log(JSON.stringify(rows));
