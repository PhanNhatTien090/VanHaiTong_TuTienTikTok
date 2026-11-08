// Xem thử bố cục đua đông người (v88): đoàn chính, người bứt xa, người về đích, kiếm khí mini.
// node scripts/render-race-crowd.mjs → output/race-v4/*.png. Không đụng tới LIVE.
import fs from 'node:fs';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {raceTargets,drawRace,raceActorIds} from '../public/sword-race.js';
import {raceFlightPose} from '../public/race-motion.js';
import {sliceDivineAtlas,drawDivineBody} from '../public/divine-wardrobe.js';
fs.mkdirSync('output/race-v4',{recursive:true});
const background=await loadImage('public/assets/events-v1/race-background.png'),art=new Map();
for(const group of [1,2,3])art.set(group,sliceDivineAtlas(await loadImage('public/assets/divine-war-v1/realms-'+group+'.png'),group,createCanvas,192));
const swordImage=await loadImage('public/assets/events-v1/prestige-swords-v1.png'),swords=[];for(let i=0;i<3;i++){const f=createCanvas(192,384);f.getContext('2d').drawImage(swordImage,i*swordImage.width/3,0,swordImage.width/3,swordImage.height,0,0,192,384);swords.push(f);}
const NAMES=['Thanh Vân','Công Tài','Kiếm Chủ','Thần Quân','Mộc Miên','Tiểu Ngư','Hàn Phong','Bạch Lộ','Vô Trần','Lăng Tiêu','Diệp Phàm','Tô Mạt','Hạ Vy','Lâm Uyên','Tử Yên'];
const players=Array.from({length:60},(_,i)=>({id:'p'+i,name:NAMES[i%NAMES.length]+(i>=NAMES.length?' '+i:''),realm:i%17,giftCoins:i%7===0?600:0,active:true}));
const T=60000;
function scenario(name,{breakaway=0,finished=0,giftMini=false}){
 const racers=players.map((p,i)=>({id:p.id,name:p.name,at:i,startedAt:0,speed:4,bonus:20+((i*37)%170),boostUntil:i%9===0?T+3000:0,lastBoostAt:0}));
 if(breakaway)racers[3].bonus=breakaway;
 for(let k=0;k<finished;k++){racers[k].bonus=1200;racers[k].finishAt=T-8000+k*900;}
 if(giftMini){const r=racers[47];r.giftAt=T-400;r.giftTier=3;r.giftCoins=300;r.giftUnits=9000;r.boostUntil=T+6000;}
 const e={active:true,phase:'running',startedAt:0,endsAt:90000,giftTop:[{id:'p3',name:'Thần Quân',coins:120},{id:'p47',name:players[47].name,coins:300}],racers};
 const index=new Map(players.map(p=>[p.id,p]));
 const scene={height:1600,motion:true,budget:{level:'normal'},raceStatus:e,raceStage:players.slice(0,8).map(p=>p.id),playerIndex:index,raceServerNow:T,raceReceivedAt:0,divineArt:art,prestigeSwords:swords,drawFlyingSword(c,x,y,a,color){c.save();c.translate(x,y);c.rotate(a);c.fillStyle=color;c.fillRect(-2,-25,4,40);c.fillRect(-8,8,16,3);c.restore();}};
 const actors=raceActorIds(scene,0).map(id=>index.get(id));
 // chạy vài giây khung hình để vị trí mượt ổn định
 for(let t=0;t<=3000;t+=50){scene.raceServerNow=T;scene.raceReceivedAt=t;scene.targets=raceTargets(scene,actors,1600,t);}
 const t=3000,canvas=createCanvas(675,1200),c=canvas.getContext('2d');c.scale(.75,.75);c.drawImage(background,0,0,900,1600);drawRace(scene,c,t,'back');
 for(const a of scene.targets){c.save();c.translate(a.x,a.y);c.scale(a.scale,a.scale);drawDivineBody(scene,c,a.player,raceFlightPose(a,t,true),t);c.restore();}
 drawRace(scene,c,t,'front');fs.writeFileSync('output/race-v4/'+name+'.png',canvas.toBuffer('image/png'));
 console.log(name,'full',scene.targets.length,'ys',scene.targets.map(a=>Math.round(a.y)).join(','));
}
scenario('crowd-normal',{});
scenario('crowd-breakaway',{breakaway:900});
scenario('crowd-finished',{finished:3});
scenario('crowd-gift-mini',{giftMini:true,breakaway:900});
