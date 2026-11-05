// Render the game Canvas directly for artwork QA, without browser automation.
import {createCanvas,loadImage} from '@napi-rs/canvas';
import fs from 'node:fs/promises';
import {Scene} from './public/scene.js';
import {drawWorldLife} from './public/world-life.js';
import {layoutPlayers,SKINS} from './public/cosmetics.js';
globalThis.document={body:{classList:{contains:()=>true}}};
const scene=Object.create(Scene.prototype);scene.width=900;scene.height=1600;scene.motion=true;scene.showNames=true;scene.effects=[];scene.focusUntil=0;scene.selected=null;scene.art=await loadImage('public/assets/sect-morning-v20.png');scene.characterArt=await loadImage('public/assets/cultivators-v3.png');
const canvas=createCanvas(1080,1920),c=canvas.getContext('2d');c.scale(1.2,1.2);scene.paintWorld(c);
const names=['Thanh Vân','Mộc Miên','Hàn Phong','Tiểu Ngư','Bạch Lộ','Vô Trần','Lạc Yên','Minh Nguyệt','A Thanh','Trúc Linh','Thiên Vũ','Lam Khê','Lưu Vân','Huyền Tâm','Ngọc Dao','Bạch Ly','Hạo Nhiên','Thanh Trúc','Tử Nguyệt','Kim Phong','Đạo Huyền','Phong Linh','Vũ Hạ','Tiên Nhi','Hà Quang','Trường An','Tiểu Mộc','Phi Vân','Linh Đan','Tâm An','Bích Ngọc','Đông Phong'];
const count=process.argv.includes('--empty')?0:process.argv.includes('--crowd')?32:12;
scene.players=names.slice(0,count).map((name,i)=>({id:'p'+i,name,realm:i%4,realmName:'Luyện Khí',giftCoins:SKINS[i%5].min,equipped:i%3?'jade':null}));scene.targets=layoutPlayers(scene.players,1600,scene.courtyardY(1600));
drawWorldLife(scene,c,14000,{crowd:count});
for(const t of scene.targets)scene.drawPlayer(c,t.player,t.x,t.y,4000);
scene.drawNames(c,4000);
c.fillStyle='#ecdfbd';c.font='16px Georgia';c.fillText('VÂN HẢI TÔNG',45,65);c.font='11px Segoe UI';c.fillStyle='#d7e4df';c.fillText('BẢN THỬ · SINH HOẠT TIÊN MÔN',45,86);
await fs.mkdir('output',{recursive:true});const dest=`output/preview-v5${count===32?'-crowd':count===0?'-empty':''}.png`;await fs.writeFile(dest,canvas.toBuffer('image/png'));console.log(dest);
