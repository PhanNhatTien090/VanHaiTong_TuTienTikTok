import {sliceRitualSwords} from './public/dai-thua-awakening.js';
import {sliceSpiritAtlas} from './public/gift-spirit-beasts.js';
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
const canvas=createCanvas(1080,1920);canvas.clientWidth=1080;
const s=Object.create(Scene.prototype);Object.assign(s,{canvas,ctx:canvas.getContext('2d'),background:createCanvas(1080,1920),height:1600,visible:true,motion:true,showNames:true,worldLife:{environment:false,npcs:false},residents:false,cameraEnabled:true,camera:{s:1,x:0,y:0},zoom:1,targets:[],effects:[],budget:new RenderBudget('balanced'),characterFrames:new CharacterFrames(createCanvas),animator:new CharacterAnimator(),characterArt:await loadImage('public/assets/cultivators-v3.png'),standingArt:await loadImage('public/assets/cultivators-standing-v14.png'),robeArt:await loadImage('public/assets/cultivators-robes-v39.png'),robeStandingArt:await loadImage('public/assets/cultivators-standing-v39.png')});
s.divineArt=new Map();for(let group=0;group<7;group++){try{s.divineArt.set(group,sliceDivineAtlas(await loadImage('public'+divineAsset(group)),group,createCanvas,512));}catch{}}
s.ascensionArt={};for(const name of ['mid','high','bursts'])s.ascensionArt[name]=sliceAscensionAtlas(await loadImage('public/assets/breakthrough-v2/'+name+'.png'),320,createCanvas);
s.breakthroughSpectacle=sliceSpectacle(await loadImage('public/assets/breakthrough-v3/celestial-spectacle.png'),createCanvas);
s.nguyenAnhArt={};for(const spec of NGUYEN_ANH_ASSETS)Object.assign(s.nguyenAnhArt,sliceNguyenAnhArt(await loadImage('public'+spec.url),spec.tiles,createCanvas));
s.spiritBeasts={dragon:sliceSpiritAtlas(await loadImage('public/assets/gift-beasts-v1/dragon.png'),3,createCanvas),phoenix:[]};
s.ritualSwords=sliceRitualSwords(await loadImage('public/assets/events-v1/prestige-swords-v1.png'),createCanvas);
s.immortalWorldArt=await loadImage('public/assets/chan-tien-cinema-v2/immortal-world.png');
s.art=await loadImage('public/assets/sect-morning-v20.png');s.background.getContext('2d').scale(1.2,1.2);s.paintWorld(s.background.getContext('2d'));
const names=['Thanh Vân','Mộc Miên','Tiểu Ngư','Hàn Phong','Bạch Lộ','Vô Trần','Lạc Yên','Minh Nguyệt'];
const players=Array.from({length:48},(_,i)=>({id:'p'+i,name:names[i%8]+' '+(i+1),active:true,joinedAt:i,realm:i%6,giftCoins:0,qi:20,neededQi:100,stones:5,neededStones:20}));s.update({players,boss:null},null);s.frame(1000);
players[1].gender=process.argv.includes('--female')?'nu':'nam';
const v2=true,dir='output/chan-tien-v1'+(process.argv.includes('--female')?'-female':'');
await fs.mkdir(dir,{recursive:true});await fs.writeFile(dir+'/plaza.png',canvas.toBuffer('image/png'));
const sheet=createCanvas(1350,v2?2400:1600),out=sheet.getContext('2d');
for(const [i,k]of [2,5.5,9,11.8,14.2,16.6,20,27.7,30.5].map(t=>t/31.6).entries()){
 const realm=8,duration=breakthroughDuration({toRealm:realm});s.ctx.setTransform(1.2,0,0,1.2,0,0);
 drawRitual(s,s.ctx,{id:'preview',user:'p1',name:'Mộc Miên',effect:'breakthrough',fromRealm:7,toRealm:realm,visualFrom:{...players[1],realm:7},visualTo:{...players[1],realm},start:0,duration},k*duration,1600);
 out.drawImage(canvas,(i%3)*450,Math.floor(i/3)*800,450,800);
}
await fs.writeFile(dir+'/storyboard.png',sheet.toBuffer('image/png'));
console.log(dir+'/storyboard.png');
