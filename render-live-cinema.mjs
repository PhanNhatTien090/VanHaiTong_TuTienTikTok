import {createCanvas,loadImage} from '@napi-rs/canvas';
import fs from 'node:fs/promises';
import {Scene} from './public/scene.js';
import {RenderBudget,CharacterFrames} from './public/performance.js';
import {CharacterAnimator} from './public/character-animation.js';
import {sliceDivineAtlas} from './public/divine-wardrobe.js';
import {sliceAscensionAtlas} from './public/ascension-art.js';
import {drawRitual} from './public/live-cinema.js';
import {breakthroughDuration} from './public/breakthrough-fx.js';
globalThis.document={body:{classList:{contains:()=>true,toggle(){}}},createElement:()=>createCanvas(1,1)};globalThis.requestAnimationFrame=()=>{};
const canvas=createCanvas(810,1440);canvas.clientWidth=810;
const s=Object.create(Scene.prototype);Object.assign(s,{canvas,ctx:canvas.getContext('2d'),background:createCanvas(810,1440),height:1600,visible:true,motion:true,showNames:true,worldLife:{environment:false,npcs:false},residents:false,cameraEnabled:true,camera:{s:1,x:0,y:0},zoom:1,targets:[],effects:[],budget:new RenderBudget('balanced'),characterFrames:new CharacterFrames(createCanvas),animator:new CharacterAnimator(),characterArt:await loadImage('public/assets/cultivators-v3.png'),standingArt:await loadImage('public/assets/cultivators-standing-v14.png'),robeArt:await loadImage('public/assets/cultivators-robes-v39.png'),robeStandingArt:await loadImage('public/assets/cultivators-standing-v39.png')});
s.divineArt=new Map();for(let group=0;group<6;group++){try{s.divineArt.set(group,sliceDivineAtlas(await loadImage('public/assets/divine-war-v1/'+(group===4?'honors':group===5?'novice-robe-v2':'realms-'+group)+'.png'),group,createCanvas));}catch{}}
s.ascensionArt={};for(const name of ['mid','high','bursts'])s.ascensionArt[name]=sliceAscensionAtlas(await loadImage('public/assets/breakthrough-v2/'+name+'.png'),320,createCanvas);
s.art=await loadImage('public/assets/sect-morning-v20.png');s.background.getContext('2d').scale(.9,.9);s.paintWorld(s.background.getContext('2d'));
const names=['Thanh Vân','Mộc Miên','Tiểu Ngư','Hàn Phong','Bạch Lộ','Vô Trần','Lạc Yên','Minh Nguyệt'];
const players=Array.from({length:48},(_,i)=>({id:'p'+i,name:names[i%8]+' '+(i+1),active:true,joinedAt:i,realm:i%6,giftCoins:0,qi:20,neededQi:100,stones:5,neededStones:20}));s.update({players,boss:null},null);s.frame(1000);
await fs.mkdir('output/live-cinema-v1',{recursive:true});await fs.writeFile('output/live-cinema-v1/plaza.png',canvas.toBuffer('image/png'));
const sheet=createCanvas(900,1600),out=sheet.getContext('2d');
for(const [i,k]of [.10,.40,.83,.94].entries()){const duration=breakthroughDuration({toRealm:2});s.ctx.setTransform(.9,0,0,.9,0,0);drawRitual(s,s.ctx,{id:'preview',user:'p1',name:'Mộc Miên',effect:'breakthrough',fromRealm:1,toRealm:2,visualFrom:{...players[1],realm:1},visualTo:{...players[1],realm:2},start:0,duration},k*duration,1600);out.drawImage(canvas,(i%2)*450,Math.floor(i/2)*800,450,800);}
await fs.writeFile('output/live-cinema-v1/ritual-phases.png',sheet.toBuffer('image/png'));
console.log('output/live-cinema-v1/plaza.png\noutput/live-cinema-v1/ritual-phases.png');
