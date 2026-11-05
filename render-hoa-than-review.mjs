import {setPriority} from 'node:os';try{setPriority(10);}catch{}
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
players[1].gender=process.argv.includes('--female')?'nu':'nam';if(process.argv.includes('--event-skin')){players[1].skinChoice='sea-dragon-heir';players[1].rewardSkins=['sea-dragon-heir'];}if(process.argv.includes('--event-skin')){const {sliceSeaSkin}=await import('./public/sea-dragon-heir.js');s.seaSkinArt=sliceSeaSkin(await loadImage('public/assets/sea-dragon-heir-v1/skin-v2.png'),createCanvas);}


const realm=Number(process.argv.find(x=>x.startsWith('--realm='))?.split('=')[1]||5),duration=breakthroughDuration({toRealm:realm}),dir=process.argv.find(x=>x.startsWith('--out='))?.slice(6)||'output/hoa-than-v2';await fs.mkdir(dir,{recursive:true});
s.ascensionStageArt=await loadImage('public/assets/worlds-v2/jade-palace.png');s.hoaThanWorldArt=await loadImage('public/assets/hoa-than-v2/storm-world.png');
const draw=process.argv.includes('--before')?(await import('./output/hoa-than-before/before-awakening.mjs')).drawHoaThanAwakening:drawRitual;
const event={id:'hoa-review-02',user:'p1',name:'Mộc Miên',effect:'breakthrough',fromRealm:realm-1,toRealm:realm,visualFrom:{...players[1],realm:realm-1},visualTo:{...players[1],realm},start:0,duration};
const times=process.argv.some(x=>x.startsWith('--times='))?process.argv.find(x=>x.startsWith('--times=')).slice(8).split(',').map(Number):realm===5?[.2,1.2,2.8,4.2,5.9,7.5,9.2,10.9,12.2,13.6,14.5,14.9,15.6,16.5,17.3]:[.2,1.5,3.2,5.8,7.6,8.7,9.8,10.6,10.85,11.2,12,13.6];
const sheet=createCanvas(900,Math.ceil(times.length/3)*534),out=sheet.getContext('2d');
const costs=[];
for(const [i,sec] of times.entries()){s.ctx.setTransform(canvas.width/900,0,0,canvas.height/1600,0,0);const start=performance.now();draw(s,s.ctx,event,sec*1000,1600);costs.push(performance.now()-start);out.drawImage(canvas,(i%3)*300,Math.floor(i/3)*534,300,534);out.fillStyle='#ffffff';out.font='18px Arial';out.fillText(sec+'s',(i%3)*300+10,Math.floor(i/3)*534+25);await fs.writeFile(dir+'/'+sec+'.png',canvas.toBuffer('image/png'));}
await fs.writeFile(dir+'/storyboard.png',sheet.toBuffer('image/png'));
if(process.argv.includes('--motion')){const {spawn}=await import('node:child_process');const {once}=await import('node:events');const proc=spawn('ffmpeg',['-y','-threads','2','-f','image2pipe','-vcodec','png','-r','30','-i','-','-an','-c:v','libx264','-threads','2','-preset','fast','-crf','21','-pix_fmt','yuv420p',dir+'/motion-silent.mp4'],{windowsHide:true,stdio:['pipe','ignore','pipe']});let err='';proc.stderr.on('data',d=>err+=d);const frame=createCanvas(540,960),fc=frame.getContext('2d');for(let i=0;i<Math.ceil(duration/1000*30);i++){s.ctx.setTransform(canvas.width/900,0,0,canvas.height/1600,0,0);draw(s,s.ctx,event,i/30*1000,1600);fc.drawImage(canvas,0,0,540,960);if(!proc.stdin.write(frame.toBuffer('image/png')))await once(proc.stdin,'drain');}proc.stdin.end();const [code]=await once(proc,'close');if(code)throw Error(err);}
if(process.argv.includes('--bench')){costs.length=0;for(let i=0;i<90;i++){const before=performance.now();s.ctx.setTransform(canvas.width/900,0,0,canvas.height/1600,0,0);draw(s,s.ctx,event,(i+.5)/90*duration,1600);costs.push(performance.now()-before);}costs.sort((a,b)=>a-b);const report={source:'Node Canvas CPU, not browser FPS',width:canvas.width,height:canvas.height,medianMs:costs[45],p95Ms:costs[85]};await fs.writeFile(dir+'/canvas-cost.json',JSON.stringify(report,null,2));console.log(report);}
console.log(dir+'/storyboard.png');
