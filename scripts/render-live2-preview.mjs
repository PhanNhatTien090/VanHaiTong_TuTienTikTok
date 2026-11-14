// Render actual LIVE 2.0 effect code + newly committed SVGs into 1080x1920 QA images.
// Does not need the TikTok bridge, voice playback, or a connected livestream.
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {mkdir,writeFile} from 'node:fs/promises';
import {drawLive2Fx,setLive2ArtForPreview} from '../public/live2-art.js';
const root='output/live2-preview',WIDTH=1080,HEIGHT=1920;
await mkdir(root,{recursive:true});
const themes=[
 {id:'sword',label:'KIẾM ĐẠO',caption:'Vạn Kiếm Khai Thiên'},
 {id:'demon',label:'MA ĐẠO',caption:'U Minh Phệ Thiên'},
 {id:'body',label:'THỂ ĐẠO',caption:'Bất Diệt Kim Thân'},
 {id:'beast',label:'NGỰ THÚ ĐẠO',caption:'Vạn Linh Triều Tông'},
 {id:'alchemy',label:'ĐAN ĐẠO',caption:'Cửu Chuyển Tạo Hóa'},
 {id:'guild',label:'HỘI CHIẾN',caption:'Chư Tông Tranh Bá'},
 {id:'mentor',label:'SƯ ĐỒ',caption:'Truyền Thừa Đại Đạo'},
 {id:'relic',label:'PHÁP BẢO',caption:'Tụ Linh Pháp Ấn'},
 {id:'bond',label:'ĐẠO LỮ',caption:'Tam Sinh Đồng Tâm'},
 {id:'tribulation',label:'THIÊN KIẾP',caption:'Thiên Đạo Thử Luyện'}
];
const background=await loadImage('public/assets/maps-v3/tournament-arena.png');
const c=createCanvas(WIDTH,HEIGHT),ctx=c.getContext('2d');
for(const entry of themes){
 const img=await loadImage('public/assets/live2-paths/'+entry.id+'.svg');
 if(!img.width||!img.height)throw new Error('Cannot decode live2 '+entry.id);
 setLive2ArtForPreview(entry.id,img);
 ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,WIDTH,HEIGHT);
 ctx.drawImage(background,0,0,WIDTH,HEIGHT);
 ctx.fillStyle='rgba(5,7,26,.39)';ctx.fillRect(0,0,WIDTH,HEIGHT);
 ctx.save();ctx.scale(1.2,1.2);
 const event={daoPath:entry.id,live2Kind:['guild','mentor','relic','bond','tribulation'].includes(entry.id)?entry.id:null,
  daoChoose:true,daoSkill:true,daoLevelUp:true,guildWarStart:entry.id==='guild',daoTribulation:entry.id==='tribulation'};
 // Native Scene coordinates are 900x1600; the image is scaled exactly as the game.
 drawLive2Fx(ctx,event,2000,.55,{x:450,y:770},{light:false,motion:true});
 ctx.restore();
 ctx.textAlign='center';ctx.shadowColor='#120b25';ctx.shadowBlur=15;
 ctx.fillStyle='#ffe5a3';ctx.font='bold 54px Georgia';ctx.fillText(entry.label,WIDTH/2,245);
 ctx.fillStyle='#fff7df';ctx.font='600 32px Segoe UI';ctx.fillText(entry.caption,WIDTH/2,296);
 ctx.shadowBlur=0;
 const fname=root+'/'+entry.id+'.png';await writeFile(fname,c.toBuffer('image/png'));
 console.log('Rendered '+fname);
}
