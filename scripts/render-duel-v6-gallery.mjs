// CI/operator proof: actual V6 renderer, with LIVE-scale backdrop and real decoded assets.
// Explicitly a technique storyboard, NOT an in-game screenshot or HP simulation.
import {mkdir,writeFile} from 'node:fs/promises';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {drawDuelV6Ultimate,V6_ASSETS} from '../public/duel-showcase-v6.js';

const ROOT='output/duel-v6-gallery',W=900,H=1600;
await mkdir(ROOT,{recursive:true});
const background=await loadImage('public/assets/maps-v3/tournament-arena.png');
const art={};
const unavailable=[];
for(const [key,url]of Object.entries(V6_ASSETS)){
 try{art[key]=await loadImage('public'+url);}catch(e){unavailable.push(key);}
}
const entries=[
 ['01-thunder','LÔI LONG THIÊN PHẠT','thunder'],
 ['02-sword','VẠN KIẾM DIỆT THẾ','bamboo'],
 ['03-flame','PHƯỢNG HOÀNG NIẾT BÀN','flame'],
 ['04-azure','THƯƠNG LONG PHÁ HẢI','dragon'],
 ['05-frost','BĂNG PHÁCH PHONG GIỚI','frost'],
 ['06-yin-yang','THÁI CỰC PHONG THIÊN','celestial']
];
const manifest=[];
for(const [filename,title,id] of entries){
 for(const [phase,k]of [['charge',.40],['release',.76]]){
  const canvas=createCanvas(540,960),c=canvas.getContext('2d');
  c.setTransform(.6,0,0,.6,0,0);
  c.drawImage(background,0,0,W,H);
  c.fillStyle='rgba(4,8,24,.35)';c.fillRect(0,0,W,H);
  c.fillStyle='#080b19';c.globalAlpha=.54;
  c.fillRect(0,0,W,222);c.globalAlpha=1;
  c.fillStyle='#f2e9ca';c.textAlign='center';c.textBaseline='middle';
  c.font='900 39px sans-serif';c.fillText(title,450,105,785);
  c.font='700 22px sans-serif';c.fillStyle='#c4e4ff';
  c.fillText(phase==='charge'?'V6 · VẬN CÔNG, TỤ KHÍ':'V6 · GIẢI PHÓNG THẦN THÔNG',450,155,700);
  // Battle floor dummies indicate positioning only; no invented game hit results.
  for(const [x,isLead] of [[225,true],[675,false]]){
   c.globalAlpha=.62;c.strokeStyle=isLead?'#93e8ff':'#fbe4b9';c.lineWidth=5;
   c.beginPath();c.ellipse(x,1264,67,19,0,0,Math.PI*2);c.stroke();
   c.globalAlpha=1;
  }
  const scene={motion:true,reduceFlash:false,budget:{level:'balanced'},fps:30,
   v6Showcase:true,cinematicV2:true,v6Assets:art};
  const source={id:'a',x:225,y:1240,scale:2.25},target={x:450,y:950};
  const rendered=drawDuelV6Ultimate(scene,c,1800,source,target,{id},k);
  if(!rendered)throw Error('Missing runtime draw for '+id+' / '+phase);
  const file=ROOT+'/'+filename+'-'+phase+'.png';
  await writeFile(file,canvas.toBuffer('image/png'));
  manifest.push({id,phase,path:file,rendered,assets:Object.keys(art)});
 }
}
await writeFile(ROOT+'/manifest.json',JSON.stringify({status:'ACTUAL_V6_RENDERER',width:540,height:960,unavailable,manifest},null,2));
console.log('V6 gallery:',manifest.length,'frames, missing decoded artwork:',unavailable.join(',')||'none');
