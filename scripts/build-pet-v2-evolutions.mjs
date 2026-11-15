// Creates THREE richly embellished evolution atlases per species from every original
// genuinely-drawn pose. The base anatomy and existing motion are ALWAYS preserved.
// 8 original species × (3 poses × 3 evolutions) + 5 premium × (8 poses × 3) = 192 distinct images.
// This is original layered costume art over each real animated pose, not warped static artwork.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {ALL_PETS} from '../public/spirit-pets.js';
import {PREMIUM_PET_PERIODS} from '../public/premium-pet-motion.js';
import {slicePetFrames,slicePremiumPetFrames} from '../public/spirit-pet-art.js';
import {PET_V2_ASSET_MANIFEST} from '../public/pet-v2-art-manifest.js';
const TAU=Math.PI*2,OUT='public/assets/spirit-pets-v2/evolutions';
const rgb={
 'jade-rabbit':['#87f8d7','#eefff7','#f9d887','moon'],
 'ember-fox':['#ff825a','#ffd28b','#ed4835','flame'],
 'frost-tiger':['#8df4ff','#e9fdff','#668ce9','ice'],
 'sun-phoenix':['#ffae65','#fff1a9','#ef5443','wing'],
 'astral-dragon':['#b9a4ff','#e4d8ff','#7fd7ff','star'],
 'loi-oa':['#cca6ff','#f0e9ff','#6ac8ff','bolt'],
 'van-thu':['#ff597b','#ffbac5','#c62760','blood'],
 'ky-lan':['#ffe497','#fff6d2','#d3913e','flame'],
 'bach-nguyet-ho':['#c9deff','#fff9f7','#b19af7','moon'],
 'ngoc-chau-long':['#8fffcf','#f5ffdc','#9ad4ff','water'],
 'xich-ha-phuong':['#ffb481','#fff3d4','#f177b1','wing'],
 'tu-nguyet-lan':['#d2b7ff','#fff1ff','#78cbe0','moon'],
 'hac-tinh-ho':['#caaeff','#f5e9ff','#6376bb','star']
};
function poly(c,pts){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();}
function strokeArc(c,x,y,rx,ry,rot,col,width=2,alpha=.8){c.save();c.strokeStyle=col;c.lineWidth=width;c.globalAlpha=alpha;c.beginPath();c.ellipse(x,y,rx,ry,rot,0,TAU);c.stroke();c.restore();}
function oval(c,x,y,rx,ry,col,alpha=1){c.save();c.globalAlpha=alpha;c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fill();c.restore();}
function kite(c,x,y,r,col,second,angle=0){c.save();c.translate(x,y);c.rotate(angle);poly(c,[[0,-r*1.4],[r*.45,0],[0,r*.9],[-r*.45,0]]);c.fillStyle=col;c.fill();c.lineWidth=1.1;c.strokeStyle=second;c.stroke();c.restore();}
function petal(c,x,y,angle,len,width,c1,c2){c.save();c.translate(x,y);c.rotate(angle);c.beginPath();c.moveTo(0,0);c.bezierCurveTo(-width,-len*.26,-width*.68,-len*.72,0,-len);c.bezierCurveTo(width*.73,-len*.7,width,-len*.31,0,0);c.closePath();const g=c.createLinearGradient(0,0,0,-len);g.addColorStop(0,c1);g.addColorStop(.5,c2);g.addColorStop(1,'#ffffff');c.fillStyle=g;c.fill();c.strokeStyle=c2;c.lineWidth=1.3;c.stroke();c.restore();}
function ring(c,x,y,r,stage,colors,phase){
 const [main,light,accent]=colors;
 c.save();c.globalAlpha=stage===1?.55:.83;c.lineWidth=1.7;c.strokeStyle=light;
 c.beginPath();c.ellipse(x,y,r,r*.68,phase*.16,0,TAU);c.stroke();
 if(stage>=2){c.globalAlpha=.38;c.strokeStyle=main;c.beginPath();c.ellipse(x,y,r*1.12,r*.82,-phase*.16,0,TAU);c.stroke();}
 for(let i=0;i<(stage+2)*2;i++){
  const a=i*TAU/((stage+2)*2)+phase,x1=x+Math.cos(a)*r,y1=y+Math.sin(a)*r*.68;
  if(i%2)kite(c,x1,y1,stage===3?3:2.2,light,accent,a);
  else oval(c,x1,y1,stage===3?2.6:1.7,stage===3?2.6:1.7,main);
 }
 c.restore();
}
function wings(c,stage,colors,motif,phase){
 const [main,light,accent]=colors;
 if(stage===1)return;
 const count=stage===3?3:2;
 c.save();c.globalAlpha=stage===3?.5:.38;
 // Feather pairs reach upward BEHIND the body, never draw horizontal ribbons across the face.
 for(const side of [-1,1]){
  for(let i=0;i<count;i++){
   const a=side*(.22+i*.25)+Math.sin(phase)*.06;
   const ox=80+side*(19+i*5),oy=90+i*7;
   petal(c,ox,oy,a,stage===3?43+i*5:31+i*5,stage===3?7+i:5+i,main,i%2?light:accent);
  }
 }
 if(motif==='wing'){
  for(let j=0;j<3;j++){
   petal(c,80+(j-1)*15,80,Math.sin(phase)*.06+(j-1)*.22,25+stage*6,5,accent,light);
  }
 }
 c.restore();
}
function elemental(c,stage,colors,motif,phase){
 const [main,light,accent]=colors;
 if(motif==='ice'){for(let i=0;i<3+stage;i++)kite(c,52+i*17,42+Math.sin(i*2+phase)*7,6+stage*2,light,accent,i*.4);}
 else if(motif==='flame'){for(let i=0;i<3+stage;i++)petal(c,45+i*16,109+Math.cos(i+phase)*4,-.15+(i-2)*.12,21+stage*9,6+stage,accent,light);}
 else if(motif==='star'){for(let i=0;i<5+stage;i++){let a=i*2.4+phase;const rr=stage*11+24;kite(c,80+Math.cos(a)*rr,78+Math.sin(a)*rr*.65,3+stage,light,main,a);}}
 else if(motif==='bolt'){c.save();c.lineWidth=2.5;c.strokeStyle=light;for(let i=0;i<stage+1;i++){const x=36+i*33;c.beginPath();c.moveTo(x,56);c.lineTo(x+12,68);c.lineTo(x+5,79);c.lineTo(x+20,100);c.stroke();}c.restore();}
 else if(motif==='blood'){for(let i=0;i<3+stage;i++){const a=phase+i*TAU/(3+stage);oval(c,80+Math.cos(a)*48,82+Math.sin(a)*34,2+stage,2+stage,accent,.65);}}
 else if(motif==='water'){for(let i=0;i<stage+2;i++)strokeArc(c,80,108+i*3,39+i*5,8,phase*.07,main,1.8,.7);}
 else if(motif==='moon'){strokeArc(c,81,64,35+stage*7,27+stage*7,.14,light,stage===3?3:2,.52);}
}
const HEAD_ANCHOR={
 'jade-rabbit':[45,36],'ember-fox':[51,29],'frost-tiger':[53,34],'sun-phoenix':[76,26],
 'astral-dragon':[55,34],'loi-oa':[94,33],'van-thu':[66,45],'ky-lan':[60,24],
 'bach-nguyet-ho':[115,32],'ngoc-chau-long':[83,35],'xich-ha-phuong':[96,32],
 'tu-nguyet-lan':[99,36],'hac-tinh-ho':[112,34]
};
function crest(c,stage,colors,motif,phase,id){
 const [main,light,accent]=colors;
 const [cx,cy]=HEAD_ANCHOR[id]||[80,34];
 // Semi-flexible brow plate attached near upper right of each drawn pose.
 c.save();c.globalAlpha=.9;
 for(let s of [-1,1]){
  petal(c,cx+s*13,cy+10,s*.6,stage===1?12:stage===2?20:27,4+stage,main,light);
 }
 kite(c,cx,cy,6+stage*1.8,light,accent,phase*.04);
 c.restore();
 if(stage>=2){
  for(let i=0;i<stage;i++){
   const a=i*TAU/stage+phase*.12;
   kite(c,83+Math.cos(a)*32,77+Math.sin(a)*17,4+stage,accent,light,a*.7);
  }
 }
 if(stage===3){
  // A supernatural crown and orbiting spirit gems differentiate the final evolution.
  for(let i=-2;i<=2;i++)petal(c,cx+i*4,cy+1,i*.17,10+3*(2-Math.abs(i)),3,accent,light);
 }
}
function armor(c,stage,colors){
 // Neck jewel/shoulder clasp only: never mask an existing animal's face or anatomy.
 const [main,light,accent]=colors;
 c.save();c.globalAlpha=stage===1?.65:.85;
 const x=81,y=105,w=stage===3?13:stage===2?11:9;
 c.beginPath();c.ellipse(x,y,w,w*.58,-.25,0,TAU);
 c.fillStyle=main;c.fill();c.strokeStyle=light;c.lineWidth=1.4;c.stroke();
 kite(c,x,y-1,stage===1?3.5:stage===2?4.7:5.6,accent,light);
 if(stage>=2)strokeArc(c,x,y+3,w+7,7,.05,light,1.5,.8);
 c.restore();
}
function artFrame(base,spec,index,colors){
 const {stage,size,frames}=spec,c=createCanvas(size,size),g=c.getContext('2d'),scale=size/160;
 const phase=index*TAU/frames,magic=colors[3];
 g.save();g.scale(scale,scale);
 g.globalCompositeOperation='source-over';
 // Slight ambient footprint on transparent canvas, not a painted background.
 ring(g,80,84,stage===1?53:stage===2?59:67,stage,colors,phase);
 wings(g,stage,colors,magic,phase);
 elemental(g,stage,colors,magic,phase);
 g.drawImage(base,0,0,160,160);
 armor(g,stage,colors);
 crest(g,stage,colors,magic,phase,spec.id);
 // Frame-specific eye highlight; light enough to keep original face readable.
 if(stage===3){const h=HEAD_ANCHOR[spec.id]||[80,32];kite(g,h[0],h[1]-8,2.5,colors[1],colors[0],phase);}
 g.restore();return c;
}
await fs.mkdir(OUT,{recursive:true});
let total=0;
for(const pet of ALL_PETS){
 const premium=Object.hasOwn(PREMIUM_PET_PERIODS,pet.id);
 const src=premium?'public/assets/spirit-pets-v1/animated/'+pet.id+'-drawn-v2.webp':'public/assets/spirit-pets-v1/'+pet.id+'.png';
 const image=await loadImage(src);
 const sourceFrames=premium?slicePremiumPetFrames(image,pet.id,createCanvas):slicePetFrames(image,pet.id,createCanvas);
 if(sourceFrames.length!==(premium?8:3))throw Error(pet.id+' original animation missing');
 for(const spec of PET_V2_ASSET_MANIFEST.filter(x=>x.id===pet.id)){
  const atlas=createCanvas(spec.size*spec.cols,spec.size*spec.rows),c=atlas.getContext('2d');
  for(let i=0;i<spec.frames;i++){
   const original=sourceFrames[i],base=createCanvas(160,160),b=base.getContext('2d');
   b.drawImage(original,0,0,160,160);
   const frame=artFrame(base,spec,i,rgb[pet.id]);
   c.drawImage(frame,(i%spec.cols)*spec.size,Math.floor(i/spec.cols)*spec.size);
   total++;
  }
  const file='public'+spec.path;await fs.mkdir(path.dirname(file),{recursive:true});
  const buffer=await atlas.encode(premium?'webp':'png',premium?85:undefined);
  await fs.writeFile(file,buffer);
  console.log(pet.id+' · '+spec.stage+' · '+spec.frames+' drawn-pose variants · '+Math.round(buffer.length/1024)+'KiB');
 }
}
if(total!==192)throw Error('Expected 192 evolutions, received '+total);
console.log('Created 39 evolution atlases across 13 pets, 192 composed animated pose frames; all stage-0 assets untouched');
