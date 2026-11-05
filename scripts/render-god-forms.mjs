import fs from 'node:fs';import {createCanvas,loadImage} from '@napi-rs/canvas';
import {sliceDivineAtlas,drawDivineBody} from '../public/divine-wardrobe.js';
import {drawGodAuras,GOD_FORMS,sliceGodAuraAtlas} from '../public/god-forms.js';
import {sliceSpiritAtlas} from '../public/gift-spirit-beasts.js';
const frames=sliceDivineAtlas(await loadImage('public/assets/god-forms-v1/deities.png'),6,createCanvas,256),dragon=sliceSpiritAtlas(await loadImage('public/assets/gift-beasts-v1/dragon.png'),3,createCanvas,128);
const auraArt=sliceGodAuraAtlas(await loadImage('public/assets/god-forms-v1/presence-auras-v1.png'),createCanvas,224);
for(const t of [2400,3800]){
 const out=createCanvas(1200,780),c=out.getContext('2d'),scene={motion:true,budget:{level:'high'},divineArt:new Map([[6,frames]]),spiritBeasts:{dragon},godAuraArt:auraArt,targets:[]};
 c.fillStyle='#101827';c.fillRect(0,0,1200,780);c.font='bold 26px Segoe UI';c.textAlign='center';c.fillStyle='#ffe7ae';c.fillText('THẦN THỂ · NĂM CẢNH GIỚI TRÊN TIÊN ĐẾ',600,50);
 for(let g=0;g<2;g++)for(let i=0;i<5;i++)scene.targets.push({id:g+'-'+i,x:120+i*240,y:280+g*350,scale:1.6,player:{id:g+'-'+i,realm:14+i,gender:g?'nu':'nam'}});
 drawGodAuras(scene,c,t,'back');
 for(const a of scene.targets){c.save();c.translate(a.x,a.y);c.scale(a.scale,a.scale);drawDivineBody(scene,c,a.player,{stand:0,lift:0,lean:0},t);c.restore();}
 drawGodAuras(scene,c,t,'front');
 for(const a of scene.targets){c.font='bold 17px Segoe UI';c.fillStyle=GOD_FORMS[a.player.realm-14].color;c.fillText(GOD_FORMS[a.player.realm-14].name,a.x,a.y+93);c.font='14px Segoe UI';c.fillStyle='#b9c9db';c.fillText(['Đạo Tổ','Thiên Tôn','Thần Quân','Thần Vương','Thần Đế'][a.player.realm-14],a.x,a.y+117);}
 fs.writeFileSync('output/god-forms-'+t+'.png',out.toBuffer('image/png'));
}
