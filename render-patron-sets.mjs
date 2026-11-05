import {createCanvas,loadImage} from '@napi-rs/canvas';
import fs from 'node:fs/promises';
import {Scene} from './public/scene.js';
import {CharacterAnimator} from './public/character-animation.js';
import {skinFor} from './public/cosmetics.js';
const s=Object.create(Scene.prototype),atlas=await loadImage('public/assets/patron-sets-v18.png');s.specialArt=[];
for(const [y,h]of [[0,590],[600,424]]){const sheet=createCanvas(atlas.width,h);sheet.getContext('2d').drawImage(atlas,0,y,atlas.width,h,0,0,sheet.width,h);sheet.naturalWidth=sheet.width;sheet.naturalHeight=sheet.height;sheet.complete=true;s.specialArt.push(sheet);}
Object.assign(s,{characterArt:await loadImage('public/assets/cultivators-v3.png'),standingArt:await loadImage('public/assets/cultivators-standing-v14.png'),animator:new CharacterAnimator(),motion:true,targets:[]});
const canvas=createCanvas(1100,700),c=canvas.getContext('2d');c.fillStyle='#102636';c.fillRect(0,0,1100,700);c.textAlign='center';c.fillStyle='#e4d7ad';c.font='24px Georgia';c.fillText('BỘ TRANG BỊ MỚI · VÂN HẢI TÔNG',550,42);
const sets=[['azure-patron','nam','Thương Long · nam'],['azure-patron','nu','Thương Long · nữ'],['crimson-phoenix','nam','Xích Phượng'],['crimson-phoenix','nu','Xích Phượng · nữ'],['ivory-celestial','nam','Bạch Kim Tiên Đế']];
for(let i=0;i<5;i++)for(let row=0;row<2;row++){
 const [skin,gender,name]=sets[i],p={id:'sample'+i,realm:0,giftCoins:0,gender,rewardSkins:[skin],skinChoice:skin,equipped:i<2?'patron-sword':'jade'};
 if(row===0)s.animator.trigger({id:'standing'+i,user:p.id,effect:'join'},0);
 c.save();c.translate(110+i*220,270+row*300);c.scale(2.25,2.25);s.drawCharacterBody(c,p,skinFor(0),row===0?1400:8000);c.restore();
 if(row===0){c.font='16px Segoe UI';c.fillStyle='#f1e8cf';c.fillText(name,110+i*220,335);}
}
await fs.writeFile('output/patron-sets-v18.png',canvas.toBuffer('image/png'));console.log('output/patron-sets-v18.png');
