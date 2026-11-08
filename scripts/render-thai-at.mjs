// Dựng video đột phá từng khung, đúng thời gian (không phụ thuộc tốc độ máy) — dùng để duyệt chuyển động và ghép âm.
// Cách dùng (từ thư mục gốc dự án):
//   node skills/van-hai-dot-pha/scripts/render-realm-frames.mjs output/frames-r1 1
//   ffmpeg -framerate 30 -i output/frames-r1/f%04d.png -vf scale=540:960 -c:v libx264 -pix_fmt yuv420p out.mp4
// Giới hạn: không có HUD DOM (tên cảnh giới vẽ bằng chữ dự phòng trên canvas); nền thiên đài có nạp.
import {createCanvas,loadImage} from '@napi-rs/canvas';
import fs from 'node:fs/promises';
import {Scene} from '../public/scene.js';
import {RenderBudget,CharacterFrames} from '../public/performance.js';
import {CharacterAnimator} from '../public/character-animation.js';
import {sliceDivineAtlas} from '../public/divine-wardrobe.js';
import {sliceAscensionAtlas} from '../public/ascension-art.js';
import {sliceSpectacle} from '../public/breakthrough-spectacle.js';
import {breakthroughDuration} from '../public/breakthrough-fx.js';
import {divineAsset} from '../public/divine-wardrobe.js';
import {drawRitual} from '../public/live-cinema.js';
import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')+'/';
globalThis.document={body:{classList:{contains:()=>true,toggle(){}}},createElement:()=>createCanvas(1,1)};globalThis.requestAnimationFrame=()=>{};
const canvas=createCanvas(1080,1920);canvas.clientWidth=1080;
const s=Object.create(Scene.prototype);Object.assign(s,{canvas,ctx:canvas.getContext('2d'),background:createCanvas(1080,1920),height:1600,visible:true,motion:true,showNames:true,worldLife:{environment:false,npcs:false},residents:false,cameraEnabled:true,camera:{s:1,x:0,y:0},zoom:1,targets:[],effects:[],budget:new RenderBudget('balanced'),characterFrames:new CharacterFrames(createCanvas),animator:new CharacterAnimator(),characterArt:await loadImage(root+'public/assets/cultivators-v3.png'),standingArt:await loadImage(root+'public/assets/cultivators-standing-v14.png'),robeArt:await loadImage(root+'public/assets/cultivators-robes-v39.png'),robeStandingArt:await loadImage(root+'public/assets/cultivators-standing-v39.png')});
s.divineArt=new Map();for(let group=0;group<7;group++){try{s.divineArt.set(group,sliceDivineAtlas(await loadImage(root+'public'+divineAsset(group)),group,createCanvas,512));}catch{}}
s.ascensionArt={};for(const name of ['mid','high','bursts'])s.ascensionArt[name]=sliceAscensionAtlas(await loadImage(root+'public/assets/breakthrough-v2/'+name+'.png'),320,createCanvas);
s.breakthroughSpectacle=sliceSpectacle(await loadImage(root+'public/assets/breakthrough-v3/celestial-spectacle.png'),createCanvas);
s.art=await loadImage(root+'public/assets/sect-morning-v20.png');s.background.getContext('2d').scale(1.2,1.2);s.paintWorld(s.background.getContext('2d'));
const names=['Thanh Vân','Mộc Miên','Tiểu Ngư','Hàn Phong','Bạch Lộ','Vô Trần','Lạc Yên','Minh Nguyệt'];
const players=Array.from({length:48},(_,i)=>({id:'p'+i,name:names[i%8]+' '+(i+1),active:true,joinedAt:i,realm:i%6,giftCoins:0,qi:20,neededQi:100,stones:5,neededStones:20}));s.update({players,boss:null},null);s.frame(1000);
s.ascensionStageArt=await loadImage(root+'public/assets/worlds-v2/jade-palace.png');s.thaiAtWorldArt=await loadImage(root+'public/assets/thai-at-v1/two-realms.png');{const {sliceSpiritAtlas}=await import('../public/gift-spirit-beasts.js');s.spiritBeasts={dragon:sliceSpiritAtlas(await loadImage(root+'public/assets/gift-beasts-v1/dragon.png'),3,createCanvas),phoenix:sliceSpiritAtlas(await loadImage(root+'public/assets/gift-beasts-v1/phoenix.png'),3,createCanvas)};}{const {sliceSpiritAtlas}=await import('../public/gift-spirit-beasts.js');s.spiritBeasts={dragon:sliceSpiritAtlas(await loadImage(root+'public/assets/gift-beasts-v1/dragon.png'),3,createCanvas)};}{const {sliceRitualSwords}=await import('../public/dai-thua-awakening.js');s.ritualSwords=sliceRitualSwords(await loadImage(root+'public/assets/events-v1/prestige-swords-v1.png'),createCanvas);}
const only=(process.env.SECONDS||'').split(',').filter(Boolean).map(Number);
const dir=process.argv[2],fps=30,realm=Number(process.argv[3]||1),duration=breakthroughDuration({toRealm:realm}),total=Math.ceil(duration/1000*fps);await fs.mkdir(dir,{recursive:true});
for(let i=0;i<total;i++){if(only.length&&!only.some(sec=>Math.round(sec*fps)===i))continue;s.ctx.setTransform(1.2,0,0,1.2,0,0);s.ctx.fillStyle='#08152b';s.ctx.fillRect(0,0,900,1600);
 drawRitual(s,s.ctx,{id:'preview-a',user:'p1',name:'Mộc Miên',effect:'breakthrough',fromRealm:realm-1,toRealm:realm,visualFrom:{...players[1],realm:realm-1},visualTo:{...players[1],realm},start:0,duration},i*1000/fps,1600);
 await fs.writeFile(dir+'/f'+String(i).padStart(4,'0')+'.png',canvas.toBuffer('image/png'));}
console.log(total,'frames');
