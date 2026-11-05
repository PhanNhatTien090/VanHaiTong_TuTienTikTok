import fs from 'node:fs';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {raceTargets,drawRace} from '../public/sword-race.js';
import {raceFlightPose} from '../public/race-motion.js';
import {sliceDivineAtlas,drawDivineBody} from '../public/divine-wardrobe.js';
const background=await loadImage('public/assets/events-v1/race-background.png'),art=new Map();
for(const group of [1,2,3])art.set(group,sliceDivineAtlas(await loadImage('public/assets/divine-war-v1/realms-'+group+'.png'),group,createCanvas,192));
const swordImage=await loadImage('public/assets/events-v1/prestige-swords-v1.png'),swords=[];for(let i=0;i<3;i++){const f=createCanvas(192,384);f.getContext('2d').drawImage(swordImage,i*swordImage.width/3,0,swordImage.width/3,swordImage.height,0,0,192,384);swords.push(f);}
const players=[{id:'a',name:'Thanh Vân',realm:6,giftCoins:0},{id:'b',name:'Công Tài',realm:8,giftCoins:488},{id:'c',name:'Kiếm Chủ',realm:12,giftCoins:5000},{id:'d',name:'Thần Quân',realm:16,giftCoins:20000}];
for(const [name,t]of [['surge',1000],['surge-later',1700]]){
 const e={active:true,phase:'running',startedAt:0,endsAt:90000,giftTop:[],racers:players.map((p,i)=>({id:p.id,name:p.name,at:i,startedAt:0,speed:11.5,bonus:i*38,boostUntil:i>1?5000:0,lastBoostAt:i>1?700:0,giftAt:i===3?700:0,giftTier:3,giftCoins:2000}))};
 const scene={height:1600,motion:true,budget:{level:'light'},raceStatus:e,raceServerNow:0,raceReceivedAt:0,divineArt:art,prestigeSwords:swords,drawFlyingSword(c,x,y,a,color){c.save();c.translate(x,y);c.rotate(a);c.fillStyle=color;c.fillRect(-2,-25,4,40);c.fillRect(-8,8,16,3);c.restore();}};
 scene.targets=raceTargets(scene,players,1600,t);
 const canvas=createCanvas(675,1200),c=canvas.getContext('2d');c.scale(.75,.75);c.drawImage(background,0,0,900,1600);drawRace(scene,c,t,'back');
 for(const a of scene.targets){c.save();c.translate(a.x,a.y);c.scale(a.scale,a.scale);drawDivineBody(scene,c,a.player,raceFlightPose(a,t,true),t);c.restore();}
 drawRace(scene,c,t,'front');fs.writeFileSync('output/race-'+name+'.png',canvas.toBuffer('image/png'));
}
