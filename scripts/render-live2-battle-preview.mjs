// Real Canvas modules rendered into 1080×1920 QA frames with the game's arena PNG.
// Self-contained art inspection; no browser/TikTok stream/paid events.
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {mkdir,writeFile} from 'node:fs/promises';
import {drawLive2BossStage} from '../public/live2-boss-stage.js';
import {drawGuildWarFloor,drawGuildWarClash} from '../public/live2-guild-stage.js';
const W=1080,H=1920,root='output/live2-preview';
await mkdir(root,{recursive:true});
const map=await loadImage('public/assets/maps-v3/tournament-arena.png');
const canvas=createCanvas(W,H),c=canvas.getContext('2d');
const scenarios=[
 {id:'boss-gathering',phase:'gathering',title:'YÊU LỰC TỤ HỘI',detail:'Boss đang hấp thu linh lực'},
 {id:'boss-seal',phase:'seal',title:'HUYỀN ẤN PHONG MA',detail:'3 người hợp lực phá kết giới'},
 {id:'boss-seal-break',phase:'seal',exposed:true,title:'PHÁ VỠ KẾT GIỚI',detail:'8 giây phối hợp tung tuyệt kỹ'},
 {id:'boss-frenzy',phase:'frenzy',title:'THIÊN LÔI CUỒNG NỘ',detail:'Boss nổi giận ở cuối trận'},
 {id:'guild-war-clash',guild:true,title:'CHƯ TÔNG HỘI CHIẾN',detail:'Giao tranh giữa hai bang hội'}
];
for(const [index,s] of scenarios.entries()){
 c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,W,H);
 c.drawImage(map,0,0,W,H);c.fillStyle='rgba(8,9,30,.40)';c.fillRect(0,0,W,H);
 c.save();c.scale(1.2,1.2);
 if(s.guild){
  const status={active:true,groups:[{name:'Vân Hải Tông',roster:['a','b']},{name:'Thiên Kiếm Môn',roster:['c','d']}]};
  drawGuildWarFloor(c,status,2100,1600,{light:false,motion:true});
  drawGuildWarClash(c,{at:1500,side:0},2100,1600,{light:false,motion:true,reducedFlash:false});
 }else{
  // The actual Boss sprite is drawn by scene.js; this isolates its new overlay shape for QA.
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
