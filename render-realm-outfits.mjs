import {createCanvas,loadImage} from '@napi-rs/canvas';
import fs from 'node:fs/promises';
import {Scene} from './public/scene.js';
import {CharacterAnimator} from './public/character-animation.js';
import {skinFor} from './public/cosmetics.js';
import {appearanceFor} from './public/realm-outfits.js';
const s=Object.create(Scene.prototype);Object.assign(s,{characterArt:await loadImage('public/assets/cultivators-v3.png'),standingArt:await loadImage('public/assets/cultivators-standing-v14.png'),motion:false,animator:new CharacterAnimator()});
const canvas=createCanvas(1200,720),c=canvas.getContext('2d');c.fillStyle='#142a35';c.fillRect(0,0,1200,720);c.textAlign='center';
for(let realm=0;realm<9;realm++){
 const p={id:'same-player',realm,giftCoins:0,gender:'nam'},col=realm%5,row=Math.floor(realm/5),x=120+col*240,y=240+row*340;
 c.save();c.translate(x,y);c.scale(2.6,2.6);s.drawCharacterBody(c,p,skinFor(0),0);c.restore();c.fillStyle='#eaddb4';c.font='18px Segoe UI';c.fillText(appearanceFor(p).name,x,y+90);
}
await fs.writeFile('output/realm-qi-v31.png',canvas.toBuffer('image/png'));console.log('output/realm-qi-v31.png');
