import {createCanvas,loadImage} from '@napi-rs/canvas';
import fs from 'node:fs/promises';
import {Scene} from './public/scene.js';
import {CharacterAnimator,drawArticulated} from './public/character-animation.js';
import {SKINS} from './public/cosmetics.js';
globalThis.document={body:{classList:{contains:()=>true}}};
const scene=Object.create(Scene.prototype);scene.standingArt=await loadImage('public/assets/cultivators-standing-v14.png');scene.characterArt=await loadImage('public/assets/cultivators-v3.png');scene.motion=true;scene.animator=new CharacterAnimator();scene.targets=[];
const c=createCanvas(1500,900),ctx=c.getContext('2d');ctx.fillStyle='#142632';ctx.fillRect(0,0,1500,900);
const events=[{effect:'join',text:'Nhập môn'},{effect:'attack',text:'Xuất chiêu'},{effect:'sword',text:'Lĩnh ngộ bí pháp'},{effect:'petal',text:'Luyện thành Tụ Khí Đan'},{effect:'breakthrough',text:'Đột phá'}];
for(let row=0;row<2;row++)for(let i=0;i<5;i++){
 const p={id:'p'+i,giftCoins:SKINS[i].min,name:SKINS[i].name};const e={...events[i],id:'e'+i,user:p.id};scene.animator.trigger(e,0);
 const pose=scene.animator.pose(p,row?2300:1000,true);ctx.save();ctx.translate(150+i*300,340+row*420);ctx.scale(2.7,2.7);drawArticulated(ctx,scene,p,SKINS[i],row?2300:1000,i,pose);ctx.restore();ctx.fillStyle='#f2e8d3';ctx.font='20px Segoe UI';ctx.textAlign='center';ctx.fillText(e.text,150+i*300,395+row*420);
}
await fs.mkdir('output',{recursive:true});await fs.writeFile('output/character-actions-v15.png',c.toBuffer('image/png'));console.log('output/character-actions-v15.png');
