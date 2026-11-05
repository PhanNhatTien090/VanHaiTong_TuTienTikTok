import {createCanvas,loadImage} from '@napi-rs/canvas';import fs from 'node:fs/promises';
import {sliceSeaSkin,drawSeaBody,drawSeaAdornment,SEA_SKIN} from './public/sea-dragon-heir.js';import {sliceSpiritAtlas} from './public/gift-spirit-beasts.js';
globalThis.document={createElement:()=>createCanvas(1,1)};
const scene={motion:true,budget:{level:'balanced'},seaSkinArt:sliceSeaSkin(await loadImage('public/assets/sea-dragon-heir-v1/skin-v2.png'),createCanvas),spiritBeasts:{dragon:sliceSpiritAtlas(await loadImage('public/assets/gift-beasts-v1/dragon.png'),3,createCanvas)}};
const bg=await loadImage('public/assets/worlds-v2/underwater.png'),dir='output/sea-dragon-heir-v1';await fs.mkdir(dir,{recursive:true});
const sheet=createCanvas(1080,960),q=sheet.getContext('2d');
for(let i=0;i<4;i++){
 const canvas=createCanvas(540,960),c=canvas.getContext('2d');c.scale(.6,.6);c.drawImage(bg,0,0,900,1600);c.fillStyle='#06132f66';c.fillRect(0,0,900,1600);
 const p={id:'preview',gender:i%2?'nu':'nam',skinChoice:SEA_SKIN,rewardSkins:[SEA_SKIN]},stand=i<2?1:0;scene.animator={pose:()=>({stand})};
 const target={id:p.id,player:p,x:450,y:1250,scale:7};drawSeaAdornment(scene,c,target,2000+i*1000,'back');c.save();c.translate(target.x,target.y);c.scale(target.scale,target.scale);drawSeaBody(scene,c,p,{stand},2000);c.restore();drawSeaAdornment(scene,c,target,2000+i*1000,'front');
 c.textAlign='center';c.font='bold 34px Arial';c.fillStyle='#e0f9ff';c.fillText('LONG DUỆ HẢI LAM',450,130);await fs.writeFile(dir+'/'+i+'.png',canvas.toBuffer('image/png'));q.drawImage(canvas,i%2*540,Math.floor(i/2)*480,540,480);
}
await fs.writeFile(dir+'/looks.png',sheet.toBuffer('image/png'));console.log(dir);
