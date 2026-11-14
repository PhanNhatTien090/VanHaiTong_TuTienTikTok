// Render real V6/V7 LIVE functions into review images. Not concept art, not fake damage.
import {mkdir,writeFile} from 'node:fs/promises';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {drawDuelV6Ultimate,V6_ASSETS,v6SkillFamily} from '../public/duel-showcase-v6.js';
import {drawV7Variant,v7SkillSpec} from '../public/ultimate-variants-v7.js';
import {drawOverdriveV7} from '../public/cinematic-overdrive-v7.js';
import {drawGiftOverdriveV7,giftV7Spell} from '../public/gift-overdrive-v7.js';
const ROOT='output/v7-visual-proof',W=900,H=1600,S=.48;
await mkdir(ROOT,{recursive:true});
const bg=await loadImage('public/assets/maps-v3/tournament-arena.png');
const art={};
for(const [id,url] of Object.entries(V6_ASSETS)){
 try{art[id]=await loadImage('public'+url);}catch(e){console.warn('V6 missing',id,e.message);}
}
const variants={};
for(const [id,file] of Object.entries({
 void:'void-rift.svg',stars:'seven-stars.svg',soul:'soul-phantom.svg',
 lotus:'holy-lotus.svg',bell:'celestial-bell.svg',
 meteor:'meteor-judgment.svg',blossom:'blossom-sword.svg'
})){
 variants[id]=await loadImage('public/assets/v7/'+file);
}
const shatter=await loadImage('public/assets/v7/screen-shatter.svg');
const types=[
 ['thunder','CỬU THIÊN LÔI LONG'],['bamboo','VẠN KIẾM DIỆT THẾ'],
 ['flame','PHƯỢNG HOÀNG NIẾT BÀN'],['dragon','THƯƠNG LONG PHÁ HẢI'],
 ['frost','BĂNG PHÁCH PHONG GIỚI'],['celestial','THÁI CỰC PHONG THIÊN'],
 ['dora-door','HƯ KHÔNG TOÁI GIỚI'],['soul','VẠN HỒN U MINH'],
 ['sevenstars','THẤT TINH DIỆT THẦN'],['lotus','CỬU LIÊN THÁNH QUANG'],
 ['bell','KIM CHUNG BẤT DIỆT'],['meteor','TINH KHÔNG DIỆT THẾ'],
 ['petal','BÁCH HOA KIẾM VỰC']
];
const actor={id:'a',x:225,y:1244},target={x:480,y:925},manifest=[];
function stage(title,subtitle){
 const cv=createCanvas(Math.round(W*S),Math.round(H*S)),c=cv.getContext('2d');
 c.setTransform(S,0,0,S,0,0);c.drawImage(bg,0,0,W,H);
 c.fillStyle='#030718';c.globalAlpha=.28;c.fillRect(0,0,W,H);c.globalAlpha=1;
 c.fillStyle='#060d24';c.globalAlpha=.82;c.fillRect(0,0,W,208);c.globalAlpha=1;
 c.textAlign='center';c.textBaseline='middle';c.fillStyle='#fff2cb';
 c.font='900 42px sans-serif';c.fillText(title,450,92,840);
 c.font='700 22px sans-serif';c.fillStyle='#a6f5ff';c.fillText(subtitle,450,156,840);
 return {cv,c};
}
const scene={budget:{level:'balanced'},motion:true,reduceFlash:false,
 fps:30,v6Showcase:true,v7Overdrive:true,cinematicV2:true,
 v6Assets:art,v7VariantArt:variants,v7ShatterArt:shatter};
for(const [id,title] of types){
 for(const [phase,k]of [['charge',.40],['release',.79]]){
  const {cv,c}=stage(title,phase==='charge'?'TỤ LỰC · VẬN CÔNG':'GIẢI PHÓNG · TUYỆT KỸ');
  const v7=v7SkillSpec(id);
  const ok=v7?drawV7Variant(scene,c,1100,actor,target,{id},k):
    drawDuelV6Ultimate(scene,c,1100,actor,target,{id},k);
  if(!ok)throw Error('Blank skill '+id);
  const dest=ROOT+'/'+id+'-'+phase+'.png';await writeFile(dest,cv.toBuffer('image/png'));
  manifest.push({type:'ultimate',id,phase,path:dest});
 }
}
for(const value of [100,500,700,1000,1500,2000]){
 const {cv,c}=stage(giftV7Spell(value).name,'QUÀ TRỢ CHIẾN · '+value.toLocaleString('vi-VN')+' COIN');
 const e={id:'g'+value,user:'a',mode:'duel',name:'Mẫu',value,profile:{duration:4000},start:100,
  wardEffect:{kind:value===1500?'shield-heal':'shield-break',amount:25000,source:'a',target:'b'}};
 const ok=drawGiftOverdriveV7(scene,c,e,100+4000*.38,actor,{x:675,y:1244},H);
 if(!ok)throw Error('Missing gift '+value);
 const dest=ROOT+'/gift-'+value+'.png';await writeFile(dest,cv.toBuffer('image/png'));
 manifest.push({type:'gift',value,path:dest});
}
{
 const {cv,c}=stage('PHÁ KẾT GIỚI','HIỆU ỨNG VỠ MÀN HÌNH · KHÔNG PHẢI SÁT THƯƠNG');
 const s={...scene,canvas:cv,height:H,
  socialScene:'tournament',duelImpact:{at:1000,ultimate:true,x:450,y:820},
  eventGiftQueue:{activeRows:[]}};
 if(!drawOverdriveV7(s,c,1100,H,1130))throw Error('No shatter effect');
 const dest=ROOT+'/screen-shatter.png';await writeFile(dest,cv.toBuffer('image/png'));
 manifest.push({type:'impact',path:dest});
}
await writeFile(ROOT+'/manifest.json',JSON.stringify({count:manifest.length,source:'actual-V7-canvas-runtime',manifest},null,2));
console.log('V7 actual renderer gallery OK: '+manifest.length+' frames');
