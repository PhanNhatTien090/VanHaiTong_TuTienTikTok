import {test} from 'node:test';import assert from 'node:assert/strict';import {createCanvas,loadImage} from '@napi-rs/canvas';
import {Scene} from '../public/scene.js';import {RenderBudget,CharacterFrames} from '../public/performance.js';
import {sliceDivineAtlas} from '../public/divine-wardrobe.js';
import {sliceSpectacleAtlas} from '../public/gift-spectacle.js';
import {CharacterAnimator} from '../public/character-animation.js';
test('complete renderer with 500 profiles caps a >30 crowd at 50 skin-only seats at idle, isolates a VIP, then restores everyone',async()=>{
 const oldDocument=globalThis.document,oldRAF=globalThis.requestAnimationFrame;
 globalThis.document={body:{classList:{contains:()=>true,toggle(){}}},createElement:()=>createCanvas(1,1)};globalThis.requestAnimationFrame=()=>{};
 try{
  const canvas=createCanvas(540,960);canvas.clientWidth=540;
  const s=Object.create(Scene.prototype);Object.assign(s,{canvas,ctx:canvas.getContext('2d'),background:createCanvas(540,960),height:1600,visible:true,motion:true,showNames:true,worldLife:{environment:false,npcs:false},residents:false,cameraEnabled:false,camera:{s:1,x:0,y:0},zoom:1,targets:[],effects:[],budget:new RenderBudget('light'),characterFrames:new CharacterFrames(createCanvas),animator:new CharacterAnimator(),characterArt:await loadImage('public/assets/cultivators-v3.png'),standingArt:await loadImage('public/assets/cultivators-standing-v14.png')});
  s.divineArt=new Map();for(let group=0;group<5;group++){const im=await loadImage('public/assets/divine-war-v1/'+(group===4?'honors':'realms-'+group)+'.png');s.divineArt.set(group,sliceDivineAtlas(im,group,createCanvas));}
  const players=Array.from({length:500},(_,i)=>({id:'p'+i,name:'P'+i,active:true,joinedAt:i,realm:8,giftCoins:0,qi:20,neededQi:100,stones:5,neededStones:20}));
  s.divineHalos=Array.from({length:6},()=>createCanvas(256,256));const haloSet=new Set(s.divineHalos),originalDraw=s.ctx.drawImage.bind(s.ctx),originalPlayer=s.drawPlayer;let bodyStarted=false,haloAfterBody=false,haloCount=0;s.ctx.drawImage=(im,...args)=>{if(haloSet.has(im)){haloCount++;if(bodyStarted)haloAfterBody=true;}return originalDraw(im,...args);};s.drawPlayer=function(...args){bodyStarted=true;return originalPlayer.apply(this,args);};
  s.update({players,boss:null},null);s.frame(performance.now());assert.equal(s.targets.length,50);assert.equal(haloCount,0,'10+ active players hide spinning wearable halos');assert.equal(s.crowded,true);assert.equal(s.budget.level,'light');assert.equal(haloAfterBody,false,'all wearable halo images must be drawn before the first character body');s.ctx.drawImage=originalDraw;s.drawPlayer=originalPlayer;
  s.giftSpectacleArt={formations:sliceSpectacleAtlas(await loadImage('public/assets/gift-spectacle-v1/formations.png'),createCanvas),impacts:sliceSpectacleAtlas(await loadImage('public/assets/gift-spectacle-v1/impacts.png'),createCanvas)};
  s.addEffect({id:'big',user:'p490',name:'P490',effect:'dragon',gift:'Real gift',coins:9999,count:1});
  const now=performance.now();s.frame(now+100);assert.equal(s.targets.length,1);assert.equal(s.targets[0].id,'p490');assert.equal(s.soloVisible,true);
  let impacts=0;s.onSpectacleImpact=()=>impacts++;s.frame(now+4500);s.frame(now+4501);s.frame(now+8800);assert.equal(impacts,2,'impact audio fires once per impact');
  s.frame(now+16000);assert.equal(s.targets.length,50);assert.equal(s.soloVisible,false);
  s.budget.set('balanced');s.frame(now+17000);assert.equal(s.targets.length,50);
  s.budget.set('high');s.frame(now+18000);assert.equal(s.targets.length,50);
 }finally{globalThis.document=oldDocument;globalThis.requestAnimationFrame=oldRAF;}
});
