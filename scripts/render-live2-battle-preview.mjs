// Real Canvas modules rendered into 1080×1920 QA frames with the game's arena PNG.
// Self-contained art inspection; no browser/TikTok stream/paid events.
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {mkdir,writeFile} from 'node:fs/promises';
import {drawLive2BossStage} from '../public/live2-boss-stage.js';
import {drawGuildWarFloor,drawGuildWarClash} from '../public/live2-guild-stage.js';
import {drawLive2HeavenStage} from '../public/live2-heaven-stage.js';
const W=1080,H=1920,root='output/live2-preview';
await mkdir(root,{recursive:true});
const map=await loadImage('public/assets/maps-v3/tournament-arena.png');
const canvas=createCanvas(W,H),c=canvas.getContext('2d');
const bossAtlas=await loadImage('public/assets/boss-atlas.png');
const man=await loadImage('public/assets/realm-skins-v2/truc-co/male-standing-v1.png');
const woman=await loadImage('public/assets/realm-skins-v2/truc-co/female-standing-v1.png');
const hero=(img,x,y,width=190,height=295)=>{
 const scale=Math.min(width/img.width,height/img.height),w=img.width*scale,h=img.height*scale;
 c.drawImage(img,x-w/2,y-h,w,h);
};
const scenarios=[
 {id:'boss-gathering',phase:'gathering',title:'YÊU LỰC TỤ HỘI',detail:'Boss đang hấp thu linh lực'},
 {id:'boss-seal',phase:'seal',title:'HUYỀN ẤN PHONG MA',detail:'3 người hợp lực phá kết giới'},
 {id:'boss-seal-break',phase:'seal',exposed:true,title:'PHÁ VỠ KẾT GIỚI',detail:'8 giây phối hợp tung tuyệt kỹ'},
 {id:'boss-frenzy',phase:'frenzy',title:'THIÊN LÔI CUỒNG NỘ',detail:'Boss nổi giận ở cuối trận'},
 {id:'guild-war-clash',guild:true,title:'CHƯ TÔNG HỘI CHIẾN',detail:'Giao tranh giữa hai bang hội'},
 {id:'heaven-formation',heaven:true,title:'THIÊN KIẾP HỘ ĐẠO',detail:'Đạo hữu giúp nhau vượt thiên kiếp'}
];
for(const [index,s] of scenarios.entries()){
 c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,W,H);
 c.drawImage(map,0,0,W,H);c.fillStyle='rgba(8,9,30,.40)';c.fillRect(0,0,W,H);
 c.save();c.scale(1.2,1.2);
 if(s.guild){
  const status={active:true,groups:[{name:'Vân Hải Tông',roster:['a','b']},{name:'Thiên Kiếm Môn',roster:['c','d']}]};
  drawGuildWarFloor(c,status,2100,1600,{light:false,motion:true});
  hero(man,230,1280,180,320);hero(woman,670,1280,180,320);
  drawGuildWarClash(c,{at:1500,side:0},2100,1600,{light:false,motion:true,reducedFlash:false});
 }else if(s.heaven){
  drawLive2HeavenStage(c,{completed:false,helpers:2},450,1120,2100,{light:false,motion:true});
  hero(man,450,1160,220,370);
 }else{
  // Representative existing game Boss atlas frame + live2 overlay.
  // The live scene still chooses the exact sprite by Boss species and phase.
  const sw=bossAtlas.width/3;
  c.drawImage(bossAtlas,0,0,sw,bossAtlas.height,295,360,310,335);
  const b={live2Boss:{id:s.phase,exposed:!!s.exposed}};
  drawLive2BossStage(c,b,450,580,2100,{light:false,motion:true});
 }
 c.restore();
 c.save();c.textAlign='center';c.fillStyle='#ffdf9c';
 c.font='bold 47px Georgia';c.fillText(s.title,W/2,220);
 c.fillStyle='#e9def9';c.font='600 26px Arial';c.fillText(s.detail,W/2,280);
 c.restore();
 await writeFile(root+'/'+s.id+'.png',canvas.toBuffer('image/png'));
 console.log('LIVE2 battle render: '+s.id);
}
