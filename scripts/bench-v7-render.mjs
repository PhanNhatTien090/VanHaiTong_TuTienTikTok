// Deterministic CPU-only benchmark. Not a substitute for a real GPU/TikTok LIVE Studio test.
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {writeFile,mkdir} from 'node:fs/promises';
import {drawV7Variant} from '../public/ultimate-variants-v7.js';
import {drawDuelV6Ultimate,V6_ASSETS} from '../public/duel-showcase-v6.js';
import {drawGiftOverdriveV7} from '../public/gift-overdrive-v7.js';
import {drawOverdriveV7} from '../public/cinematic-overdrive-v7.js';
import {V7_PREMIUM_ENABLED} from '../public/v7-premium-config.js';
const W=900,H=1600,out='output/v7-visual-proof';
await mkdir(out,{recursive:true});
const v6={},v7={};
for(const [id,url] of Object.entries(V6_ASSETS))try{v6[id]=await loadImage('public'+url);}catch{}
for(const [id,file]of Object.entries({void:'void-rift.svg',soul:'soul-phantom.svg',stars:'seven-stars.svg',lotus:'holy-lotus.svg',bell:'celestial-bell.svg',meteor:'meteor-judgment.svg',blossom:'blossom-sword.svg'}))v7[id]=await loadImage('public/assets/v7/'+file);
const shatter=await loadImage('public/assets/v7/screen-shatter.svg');
const premium={};
if(V7_PREMIUM_ENABLED)for(const [key,file]of Object.entries({
 thunderDragon:'thunder-dragon.webp',thunderImpact:'thunder-dragon-impact.webp',
 swordStorm:'divine-sword-storm.webp',phoenix:'flame-phoenix.webp',
 phoenixImpact:'phoenix-impact.webp',taiji:'taiji-seal.webp',shatter:'screen-shatter.webp'
}))premium[key]=await loadImage('public/assets/v7-premium/'+file);
const actor={x:225,y:1245},target={x:450,y:890},skills=['thunder','bamboo','flame','dragon','frost','celestial','dora-door','soul','sevenstars','lotus','bell','meteor','petal'];
const percentile=(values,p)=>{values.sort((a,b)=>a-b);return Number(values[Math.min(values.length-1,Math.ceil(values.length*p)-1)].toFixed(2));};
const results=[];
for(const tier of ['high','crowded']){
 const canvas=createCanvas(540,960),c=canvas.getContext('2d');
 const scene={canvas,height:H,budget:{level:tier,crowded:tier==='crowded',pressured:tier==='crowded'},
  fps:tier==='crowded'?24:30,motion:true,reduceFlash:tier==='crowded',
  cinematicV2:true,v6Showcase:true,v7Overdrive:true,v6Assets:v6,v7VariantArt:v7,v7ShatterArt:shatter,v7PremiumArt:premium};
 c.setTransform(.6,0,0,.6,0,0);
 const costs=[],types={ultimate:[],gift:[],shatter:[]};let count=0;
 const sample=(type,fn)=>{const time=performance.now();fn();const ms=performance.now()-time;costs.push(ms);types[type].push(ms);count++;};
 for(const id of skills)for(let f=0;f<20;f++){
  c.clearRect(0,0,W,H);
  sample('ultimate',()=>{
   const k=f/19,ok=drawV7Variant(scene,c,f*32,actor,target,{id},k)||
     drawDuelV6Ultimate(scene,c,f*32,actor,target,{id},k);
   if(!ok)throw Error('empty skill '+id);
  });
 }
 for(const value of [100,500,700,1000,1500,2000])for(let f=0;f<15;f++){
  c.clearRect(0,0,W,H);
  const e={user:'a',mode:'duel',value,profile:{duration:4200},start:0,
   wardEffect:{kind:value===1500?'shield-heal':'shield-break',amount:1000}};
  sample('gift',()=>drawGiftOverdriveV7(scene,c,e,4200*(.12+f*.038),actor,target,H));
 }
 for(let f=0;f<22;f++){
  c.clearRect(0,0,W,H);
  const ms=55+f*22;
  const ss={...scene,duelImpact:{ultimate:true,at:1000,x:450,y:890},socialScene:'tournament',
    eventGiftQueue:{activeRows:[]}};
  sample('shatter',()=>drawOverdriveV7(ss,c,ms,H,1000+ms));
 }
 results.push({tier,frames:count,cpuMeanMs:Number((costs.reduce((a,b)=>a+b,0)/count).toFixed(2)),
  p95TotalCpuMs:percentile(costs,.95),maxCpuMs:Number(Math.max(...costs).toFixed(2)),
  individual:Object.fromEntries(Object.entries(types).map(([id,values])=>[id,{count:values.length,p95CpuMs:percentile(values,.95)}]))});
}
await writeFile(out+'/benchmark.json',JSON.stringify({note:'CPU-only draw calls on GitHub runner; NOT live GPU FPS/OBS capture',results},null,2));
console.log('V7 CPU render benchmark',JSON.stringify(results));
