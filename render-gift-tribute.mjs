import {sliceSpectacleAtlas} from './public/gift-spectacle.js';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
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
const canvas=createCanvas(540,960);canvas.clientWidth=540;
const s=Object.create(Scene.prototype);Object.assign(s,{canvas,ctx:canvas.getContext('2d'),background:createCanvas(540,960),height:1600,visible:true,motion:true,showNames:true,worldLife:{environment:false,npcs:false},residents:false,cameraEnabled:true,camera:{s:1,x:0,y:0},zoom:1,targets:[],effects:[],budget:new RenderBudget('balanced'),characterFrames:new CharacterFrames(createCanvas),animator:new CharacterAnimator(),characterArt:await loadImage('public/assets/cultivators-v3.png'),standingArt:await loadImage('public/assets/cultivators-standing-v14.png'),robeArt:await loadImage('public/assets/cultivators-robes-v39.png'),robeStandingArt:await loadImage('public/assets/cultivators-standing-v39.png')});
s.divineArt=new Map();for(let group=0;group<7;group++){try{s.divineArt.set(group,sliceDivineAtlas(await loadImage('public'+divineAsset(group)),group,createCanvas,512));}catch{}}
s.ascensionArt={};for(const name of ['mid','high','bursts'])s.ascensionArt[name]=sliceAscensionAtlas(await loadImage('public/assets/breakthrough-v2/'+name+'.png'),320,createCanvas);
s.breakthroughSpectacle=sliceSpectacle(await loadImage('public/assets/breakthrough-v3/celestial-spectacle.png'),createCanvas);
s.nguyenAnhArt={};for(const spec of NGUYEN_ANH_ASSETS)Object.assign(s.nguyenAnhArt,sliceNguyenAnhArt(await loadImage('public'+spec.url),spec.tiles,createCanvas));
s.spiritBeasts={dragon:sliceSpiritAtlas(await loadImage('public/assets/gift-beasts-v1/dragon.png'),3,createCanvas),phoenix:[]};
s.ritualSwords=sliceRitualSwords(await loadImage('public/assets/events-v1/prestige-swords-v1.png'),createCanvas);
s.immortalWorldArt=await loadImage('public/assets/chan-tien-cinema-v2/immortal-world.png');
s.art=await loadImage('public/assets/sect-morning-v20.png');s.background.getContext('2d').scale(.6,.6);s.paintWorld(s.background.getContext('2d'));
const names=['Thanh Vân','Mộc Miên','Tiểu Ngư','Hàn Phong','Bạch Lộ','Vô Trần','Lạc Yên','Minh Nguyệt'];
const players=Array.from({length:48},(_,i)=>({id:'p'+i,name:names[i%8]+' '+(i+1),active:true,joinedAt:i,realm:i%6,giftCoins:0,qi:20,neededQi:100,stones:5,neededStones:20}));s.update({players,boss:null},null);s.frame(1000);
players[1].gender=process.argv.includes('--female')?'nu':'nam';
const v2=true,dir='output/chan-tien-v1'+(process.argv.includes('--female')?'-female':'');
await fs.mkdir(dir,{recursive:true});await fs.writeFile(dir+'/plaza.png',canvas.toBuffer('image/png'));


s.tributeRose=await loadImage('public/assets/gift-rose.webp');s.giftSpectacleArt={};for(const name of ["formations","impacts"])s.giftSpectacleArt[name]=sliceSpectacleAtlas(await loadImage("public/assets/gift-spectacle-v1/"+name+".png"),createCanvas);
const output=process.argv.includes('--before')?'output/gift-tribute-v1/before':'output/gift-tribute-v1/after';await fs.mkdir(output,{recursive:true});
const coinsList=[1,10,30,100,199,500,1000,3000];
const sheet=createCanvas(1080,960),q=sheet.getContext('2d');
for(let i=0;i<coinsList.length;i++){
 const coins=coinsList[i],e={id:'gift-'+coins,user:players[1].id,name:'Mộc Miên',effect:coins<5?'petal':'lotus',gift:coins===1?'Hoa hồng':'Quà tri ân',kind:coins<30?'rose':'cosmos',coins,count:1,start:0,duration:6500};
 const cv=createCanvas(540,960),c=cv.getContext('2d');c.scale(.6,.6);c.drawImage(s.background,0,0,900,1600);s.targets=[{id:e.user,player:players[1],x:450,y:1060,scale:3.4}];
 s.drawEffect(c,e,6500*.45,'back');s.drawPlayer(c,players[1],450,1060,0);s.drawEffect(c,e,6500*.45,'front');
 const x=i%4*270,y=Math.floor(i/4)*480;q.drawImage(cv,x,y,270,480);q.fillStyle='#030d20';q.fillRect(x,y,270,30);q.fillStyle='#ffe4ad';q.font='bold 19px Arial';q.fillText(coins+' coin',x+12,y+22);
 await fs.writeFile(output+'/'+coins+'.png',cv.toBuffer('image/png'));
}
await fs.writeFile(output+'/tiers.png',sheet.toBuffer('image/png'));console.log(output);

const timeline=createCanvas(1440,640),tc=timeline.getContext('2d');
for(let i=0;i<6;i++){
 const k=[.08,.25,.43,.49,.67,.89][i],e={id:'motion-100',user:players[1].id,name:'Mộc Miên',effect:'lotus',gift:'Quà tri ân',coins:100,count:1,start:0,duration:5800},cv=createCanvas(540,960),c=cv.getContext('2d');c.scale(.6,.6);c.drawImage(s.background,0,0,900,1600);s.targets=[{id:e.user,player:players[1],x:450,y:1040,scale:4.2}];
 const begin=performance.now();s.drawEffect(c,e,k*5800,'back');s.drawPlayer(c,players[1],450,1040,0);s.drawEffect(c,e,k*5800,'front');
 tc.drawImage(cv,i*240,0,240,426);tc.fillStyle='#07101c';tc.fillRect(i*240,426,240,28);tc.fillStyle='#ffe1ac';tc.font='16px Arial';tc.fillText((k*5.8).toFixed(2)+' giây',i*240+9,446);
}
await fs.writeFile(output+'/100-sequence.png',timeline.toBuffer('image/png'));
