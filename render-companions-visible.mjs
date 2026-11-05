import {slicePetFrames} from './public/spirit-pet-art.js';
import {sliceSeaSkin} from './public/sea-dragon-heir.js';
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

const dir='output/companions-visible-v1';await fs.mkdir(dir,{recursive:true});
s.seaSkinArt=sliceSeaSkin(await loadImage('public/assets/sea-dragon-heir-v1/skin-v2.png'),createCanvas);
s.petArt=new Map();const ids=['jade-rabbit','ember-fox','frost-tiger','sun-phoenix','astral-dragon'];for(const id of ids)s.petArt.set(id,slicePetFrames(await loadImage('public/assets/spirit-pets-v1/'+id+'.png'),id,createCanvas));
s.relicSprites=[];const relic=await loadImage('public/assets/relics-immortal.png');for(let i=0;i<6;i++){const f=createCanvas(160,160);f.getContext('2d').drawImage(relic,i%3*relic.width/3,Math.floor(i/3)*relic.height/2,relic.width/3,relic.height/2,0,0,160,160);s.relicSprites.push(f);}
s.signatureSprites=[];const sig=await loadImage('public/assets/visitor-signatures-v40.png');for(let i=0;i<2;i++){const f=createCanvas(256,256);f.getContext('2d').drawImage(sig,i*sig.width/2,0,sig.width/2,sig.height,0,0,256,256);s.signatureSprites.push(f);}
const team=players.slice(0,16).map((p,i)=>({...p,equipped:['jade','spirit-vase','soul-bell','hanlap-bamboo-swords'][i%4],spiritPet:ids[i%5],gender:i%2?'nu':'nam',...(i<2?{skinChoice:'sea-dragon-heir',rewardSkins:['sea-dragon-heir']}:{} )}));
s.cameraEnabled=false;s.camera={s:1,x:0,y:0};s.update({players:team,boss:null,realms:[]},null);s.frame(4000);await fs.writeFile(dir+'/crowd.png',canvas.toBuffer('image/png'));console.log(dir);
