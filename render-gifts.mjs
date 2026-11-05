// Bảng xem trước hoạt cảnh quà: mỗi ô một loại quà ở giữa hoạt cảnh.
import {createCanvas,loadImage} from '@napi-rs/canvas';
import fs from 'node:fs/promises';
import {Scene} from './public/scene.js';
import {KINDS} from './public/gift-kinds.js';
import {drawGiftFx} from './public/gift-fx.js';
globalThis.document={body:{classList:{contains:()=>true}}};
const H=1600,scene=Object.create(Scene.prototype);Object.assign(scene,{width:900,height:H,motion:true,showNames:true,effects:[],focusUntil:0,selected:null});
scene.art=await loadImage('public/assets/sect-twilight-v2.png');scene.characterArt=await loadImage('public/assets/cultivators-v3.png');
const bg=createCanvas(900,H);scene.paintWorld(bg.getContext('2d'));
const kinds=Object.keys(KINDS),cols=4,cw=300,ch=533,sheet=createCanvas(cols*cw,Math.ceil(kinds.length/cols)*ch),s=sheet.getContext('2d');
const p={id:'x',x:450,y:scene.courtyardY(H),scale:2.15,player:{id:'x',name:'Lan',giftCoins:0,realm:1,gender:'nu'}};scene.targets=[p];
for(const [i,kind] of kinds.entries()){const cv=createCanvas(900,H),c=cv.getContext('2d');c.drawImage(bg,0,0);scene.drawPlayer(c,p.player,p.x,p.y,4000);
  drawGiftFx(c,{kind},4000,kind==='cat'||kind==='dog'||kind==='beast'?.6:.5,p,H);
  s.drawImage(cv,0,H*.05,900,H*.9,(i%cols)*cw,Math.floor(i/cols)*ch,cw,ch);s.fillStyle='#000a';s.fillRect((i%cols)*cw,Math.floor(i/cols)*ch,cw,34);s.fillStyle='#fff';s.font='bold 22px Segoe UI';s.fillText(kind,(i%cols)*cw+10,Math.floor(i/cols)*ch+25);}
await fs.writeFile('output/preview-gifts.png',sheet.toBuffer('image/png'));console.log('output/preview-gifts.png');
