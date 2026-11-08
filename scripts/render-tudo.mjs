// Ảnh kiểm tra Tư Đồ Ma Tôn (offline): node scripts/render-tudo.mjs → output/tudo-ma-ton-v1/review-*.png
import fs from 'node:fs';import {createCanvas,loadImage} from '@napi-rs/canvas';
import {sliceTudoSkin,trimBlade,drawTudoBody,drawTudoAdornment,TUDO_SKIN,TUDO_BLADE} from '../public/tudo-ma-ton.js';
const skin=sliceTudoSkin(await loadImage('public/assets/tudo-ma-ton-v1/skin.png'),createCanvas),blade=trimBlade(await loadImage('public/assets/tudo-ma-ton-v1/sabre.png'),createCanvas),bg=await loadImage('public/assets/worlds-v2/jade-palace.png');
const scene={motion:true,budget:{level:'balanced'},tudoSkinArt:skin,tudoBladeArt:blade,surfaceFactory:(w,h)=>createCanvas(w,h)};
// Ô 1: 4 người (nam/nữ × đứng/ngồi) cỡ lớn; ô 2: 3 thời điểm (thường, đang vung đao, sau vung) để xem chuyển động
const cv=createCanvas(1800,1600),c=cv.getContext('2d');c.drawImage(bg,0,0,900,1600);c.drawImage(bg,900,0,900,1600);
const people=[['a1','nam',1,240,700],['b2','nu',1,660,700],['c3','nam',0,240,1450],['d4','nu',0,660,1450]];
for(const [id,gender,stand,x,y] of people){const p={id,gender,skinChoice:TUDO_SKIN,rewardSkins:[TUDO_SKIN]},target={id,player:p,x,y,scale:3.4,pose:{stand}};drawTudoAdornment(scene,c,target,2000,'back');c.save();c.translate(x,y);c.scale(3.4,3.4);drawTudoBody(scene,c,p,{stand},2000);c.restore();drawTudoAdornment(scene,c,target,2000,'front');}
// thời điểm vung đao của người 'a1': quét tìm khung có flash
const {tudoBladePose}=await import('../public/tudo-ma-ton.js');let tf=0;const seed=(()=>{let h=2166136261;for(const ch of 'e5')h=Math.imul(h^ch.codePointAt(0),16777619);return (h>>>0)%100000;})();for(let t=0;t<12000;t+=20)if(tudoBladePose(t,seed).flash>.9){tf=t;break;}
[[tf-1500,1130,430],[tf,1530,430],[tf+900,1330,1250]].forEach(([t,x,y])=>{const p={id:'e5',gender:'nam',skinChoice:TUDO_SKIN,rewardSkins:[TUDO_SKIN]},target={id:'e5',player:p,x,y,scale:2.8,pose:{stand:1}};drawTudoAdornment(scene,c,target,t,'back');c.save();c.translate(x,y);c.scale(2.8,2.8);drawTudoBody(scene,c,p,{stand:1},t);c.restore();drawTudoAdornment(scene,c,target,t,'front');});
fs.writeFileSync('output/tudo-ma-ton-v1/review.png',cv.toBuffer('image/png'));console.log('ok flash at',tf,'cells',skin.map(f=>!!f).join(','));
