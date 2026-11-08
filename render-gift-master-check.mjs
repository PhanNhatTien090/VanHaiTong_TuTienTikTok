import {SCENES} from './public/world-rotation.js';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import fs from 'node:fs/promises';
import {Scene} from './public/scene.js';
import {RenderBudget,CharacterFrames} from './public/performance.js';
import {CharacterAnimator} from './public/character-animation.js';
import {sliceDivineAtlas} from './public/divine-wardrobe.js';
import {sliceAscensionAtlas} from './public/ascension-art.js';
import {sliceSpectacle} from './public/breakthrough-spectacle.js';
import {breakthroughDuration} from './public/breakthrough-fx.js';
import {divineAsset} from './public/divine-wardrobe.js';
import {drawRitual} from './public/live-cinema.js';
globalThis.document={body:{classList:{contains:()=>true,toggle(){}}},createElement:()=>createCanvas(1,1)};globalThis.requestAnimationFrame=()=>{};
const canvas=createCanvas(1080,1920);canvas.clientWidth=1080;
const s=Object.create(Scene.prototype);Object.assign(s,{canvas,ctx:canvas.getContext('2d'),background:createCanvas(1080,1920),height:1600,visible:true,motion:true,showNames:true,worldLife:{environment:false,npcs:false},residents:false,cameraEnabled:true,camera:{s:1,x:0,y:0},zoom:1,targets:[],effects:[],budget:new RenderBudget('balanced'),characterFrames:new CharacterFrames(createCanvas),animator:new CharacterAnimator(),characterArt:await loadImage('public/assets/cultivators-v3.png'),standingArt:await loadImage('public/assets/cultivators-standing-v14.png'),robeArt:await loadImage('public/assets/cultivators-robes-v39.png'),robeStandingArt:await loadImage('public/assets/cultivators-standing-v39.png')});
s.divineArt=new Map();for(let group=0;group<7;group++){try{s.divineArt.set(group,sliceDivineAtlas(await loadImage('public'+divineAsset(group)),group,createCanvas,512));}catch{}}
s.sectMasterArt=await loadImage('public/assets/sect-hall-v1/sect-master-throne-v2.png');
s.ascensionArt={};for(const name of ['mid','high','bursts'])s.ascensionArt[name]=sliceAscensionAtlas(await loadImage('public/assets/breakthrough-v2/'+name+'.png'),320,createCanvas);
s.breakthroughSpectacle=sliceSpectacle(await loadImage('public/assets/breakthrough-v3/celestial-spectacle.png'),createCanvas);
const hall=SCENES.find(m=>m.id==='sect-hall');s.environment=hall;s.environmentImage=hall.image;s.art=await loadImage('public'+hall.image);s.background.getContext('2d').scale(1.2,1.2);s.paintWorld(s.background.getContext('2d'));
const names=['Thanh Vân','Mộc Miên','Tiểu Ngư','Hàn Phong','Bạch Lộ','Vô Trần','Lạc Yên','Minh Nguyệt'];
const players=Array.from({length:8},(_,i)=>({id:'p'+i,name:names[i%8]+' '+(i+1),active:true,joinedAt:i,realm:i%6,giftCoins:0,qi:20,neededQi:100,stones:5,neededStones:20}));s.update({players,boss:null,environment:hall,serverNow:Date.now()},null);s.frame(performance.now());
await fs.mkdir('output/sect-hall-v1',{recursive:true});await fs.writeFile('output/sect-hall-v1/plaza.png',canvas.toBuffer('image/png'));
players[0].giftCoins=2000;players[0].sectMasterUnlocked=true;
const now=Date.now();s.update({players,boss:null,environment:hall,serverNow:now,sectMaster:{enabled:true,source:'gift',active:false,userId:players[0].id,name:players[0].name,player:players[0]}},null);s.frame(performance.now()+100);
await fs.writeFile('output/sect-hall-v1/gift-master-verified.png',canvas.toBuffer('image/png'));
console.log('output/sect-hall-v1/gift-master-verified.png');

s.addEffect({id:'rose-preview',user:players[0].id,name:players[0].name,gift:'Hoa hồng',coins:1,effect:'petal'});const t=performance.now();for(let i=1;i<=25;i++)s.frame(t+i*40);await fs.writeFile('output/sect-hall-v1/gift-zoom-verified.png',canvas.toBuffer('image/png'));
