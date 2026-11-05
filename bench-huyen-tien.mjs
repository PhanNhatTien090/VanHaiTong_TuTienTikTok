import {NGUYEN_ANH_ASSETS,sliceNguyenAnhArt} from './public/nguyen-anh-art.js';
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
const canvas=createCanvas(process.argv.includes('--full')?1080:540,process.argv.includes('--full')?1920:960);canvas.clientWidth=1080;
const s=Object.create(Scene.prototype);Object.assign(s,{canvas,ctx:canvas.getContext('2d'),background:createCanvas(1080,1920),height:1600,visible:true,motion:true,showNames:true,worldLife:{environment:false,npcs:false},residents:false,cameraEnabled:true,camera:{s:1,x:0,y:0},zoom:1,targets:[],effects:[],budget:new RenderBudget('balanced'),characterFrames:new CharacterFrames(createCanvas),animator:new CharacterAnimator(),characterArt:await loadImage('public/assets/cultivators-v3.png'),standingArt:await loadImage('public/assets/cultivators-standing-v14.png'),robeArt:await loadImage('public/assets/cultivators-robes-v39.png'),robeStandingArt:await loadImage('public/assets/cultivators-standing-v39.png')});
s.divineArt=new Map();for(let group=0;group<7;group++){try{s.divineArt.set(group,sliceDivineAtlas(await loadImage('public'+divineAsset(group)),group,createCanvas,512));}catch{}}
s.ascensionArt={};for(const name of ['mid','high','bursts'])s.ascensionArt[name]=sliceAscensionAtlas(await loadImage('public/assets/breakthrough-v2/'+name+'.png'),320,createCanvas);
s.breakthroughSpectacle=sliceSpectacle(await loadImage('public/assets/breakthrough-v3/celestial-spectacle.png'),createCanvas);
s.nguyenAnhArt={};for(const spec of NGUYEN_ANH_ASSETS)Object.assign(s.nguyenAnhArt,sliceNguyenAnhArt(await loadImage('public'+spec.url),spec.tiles,createCanvas));
s.art=await loadImage('public/assets/sect-morning-v20.png');s.background.getContext('2d').scale(1.2,1.2);s.paintWorld(s.background.getContext('2d'));
const names=['Thanh Vân','Mộc Miên','Tiểu Ngư','Hàn Phong','Bạch Lộ','Vô Trần','Lạc Yên','Minh Nguyệt'];
const players=Array.from({length:48},(_,i)=>({id:'p'+i,name:names[i%8]+' '+(i+1),active:true,joinedAt:i,realm:i%6,giftCoins:0,qi:20,neededQi:100,stones:5,neededStones:20}));s.update({players,boss:null},null);s.frame(1000);
players[1].gender=process.argv.includes('--female')?'nu':'nam';

const dir='output/huyen-tien-v2'+(process.argv.includes('--female')?'-female':'');await fs.mkdir(dir,{recursive:true});
const {sliceRitualSwords}=await import('./public/dai-thua-awakening.js');const atlas=await loadImage('public/assets/events-v1/prestige-swords-v1.png');s.ritualSwords=sliceRitualSwords(atlas,createCanvas);s.prestigeSwords=Array.from({length:3},(_,i)=>{const f=createCanvas(192,384);f.getContext('2d').drawImage(atlas,i*atlas.width/3,0,atlas.width/3,atlas.height,0,0,192,384);return f;});
s.immortalWorldArt=await loadImage('public/assets/chan-tien-cinema-v2/immortal-world.png');
const event={id:'huyen-review-v1',user:'p1',name:'Mộc Miên',effect:'breakthrough',fromRealm:8,toRealm:9,visualFrom:{...players[1],realm:8},visualTo:{...players[1],realm:9},start:0,duration:36000};

const costs=[];for(let i=0;i<36;i++){const sec=[.24,6,9.5,14,17.25,24.3,28.32,31.5][i%8];s.ctx.setTransform(canvas.width/900,0,0,canvas.height/1600,0,0);const start=performance.now();drawRitual(s,s.ctx,event,sec*1000,1600);costs.push(performance.now()-start);}costs.sort((a,b)=>a-b);const report={source:'Node Canvas, no PNG encoding, not browser FPS',frames:costs.length,width:canvas.width,height:canvas.height,medianMs:costs[18],p95Ms:costs[34]};await fs.writeFile('output/huyen-tien-v2/canvas-cost.json',JSON.stringify(report,null,2));console.log(report);
