// LIVE 2.0 Dao emblems. The five images are pre-rendered independent SVG assets.
// No animation is generated per player; effects reuse one image per path.
const PATHS=Object.freeze({
 sword:{title:'KIẾM ĐẠO',color:'#89ddff',asset:'sword'},
 demon:{title:'MA ĐẠO',color:'#cb8dff',asset:'demon'},
 body:{title:'THỂ ĐẠO',color:'#ffe098',asset:'body'},
 beast:{title:'NGỰ THÚ ĐẠO',color:'#85edce',asset:'beast'},
 alchemy:{title:'ĐAN ĐẠO',color:'#ffbc80',asset:'alchemy'}
});
const EXTRA=Object.freeze({guild:{title:'HỘI CHIẾN',color:'#f2d18c',asset:'guild'},mentor:{title:'SƯ ĐỒ TRUYỀN THỪA',color:'#f9d990',asset:'mentor'},alchemyFx:{title:'CỬU CHUYỂN ĐAN',color:'#ffb77a',asset:'alchemy'},relic:{title:'PHÁP BẢO HIỂN UY',color:'#bc9eff',asset:'relic'},boss:{title:'YÊU VƯƠNG BIẾN THIÊN',color:'#bfaaff',asset:'boss'},bond:{title:'TAM SINH ĐỒNG TÂM',color:'#ffa4c5',asset:'bond'},tribulation:{title:'THIÊN KIẾP',color:'#b8cfff',asset:'tribulation'}});
const ART=Object.freeze({...PATHS,...EXTRA});
const cache=new Map(),TAU=Math.PI*2;
export function prepareLive2Art(path){
 if(!Object.hasOwn(ART,path)||cache.has(path)||typeof Image==='undefined')return;
 const img=new Image();cache.set(path,null);
 img.onload=()=>cache.set(path,img);
 img.onerror=()=>cache.delete(path);
 img.src='/assets/live2-paths/'+ART[path].asset+'.svg';
}
// Visual regression harness injects the exact predecoded asset, runtime continues to lazy-load.
export function setLive2ArtForPreview(path,image){if(Object.hasOwn(ART,path)&&image)cache.set(path,image);}
export function drawLive2Fx(c,e,t,k,p,{light=false,motion=true}={}){
 const path=e.relicArt&&Object.hasOwn(ART,e.relicArt)?e.relicArt:e.live2Kind||(e.daoTribulation?'tribulation':e.daoPath),def=ART[path];if(!def)return;
 const img=cache.get(path),dramatic=!!(e.daoChoose||e.daoUltimate||e.guildWarStart||e.guildFounded||e.guildWarEnd||e.mentorJoined);
 const size=dramatic?420:e.daoSkill?218:e.daoBrew?245:170,centerX=p?.x??450,centerY=(p?.y??650)-(dramatic?128:70);
 const alpha=Math.max(0,Math.min(1,k*6,(1-k)*6));
 if(alpha<=0)return;
 // Dramatic reveal intentionally darkens only this single event, not every active character.
 if(dramatic&&!light){
  c.save();c.fillStyle='#030718';c.globalAlpha*=Math.sin(k*Math.PI)*.28;c.fillRect(0,0,900,1600);c.restore();
 }
 c.save();c.translate(centerX,centerY);c.globalAlpha*=alpha;
 const radius=size*.42;
 if(!light){
  c.save();c.globalCompositeOperation='screen';c.strokeStyle=def.color;c.lineWidth=dramatic?3.6:2.4;
  for(let i=0;i<(dramatic?3:2);i++){
   c.save();c.rotate((motion?t*.00024*(i%2?-1:1):0)+i*1.05);
   c.globalAlpha*=dramatic?.56:.42;c.beginPath();
   c.ellipse(0,0,radius+i*16,(radius+i*16)*.58,0,0,TAU);c.stroke();c.restore();
  }
  // Eight fixed radial rays, limited to one active spotlight. No costly blur filters.
  if(dramatic&&motion){
   for(let i=0;i<8;i++){
    const a=i*TAU/8+t*.00018,near=radius*.9,far=radius*1.32;
    c.globalAlpha=Math.max(0,.16*Math.sin(Math.PI*k));
    c.beginPath();c.moveTo(Math.cos(a)*near,Math.sin(a)*near*.76);
    c.lineTo(Math.cos(a)*far,Math.sin(a)*far*.76);c.stroke();
   }
  }
  c.restore();
 }
 if(img&&img.width>0&&img.height>0){
  const scale=motion?1+.035*Math.sin(k*Math.PI*4):1;
  c.drawImage(img,-size*scale/2,-size*scale*.57,size*scale,size*scale);
 }else{
  c.font='bold '+(dramatic?100:58)+'px Segoe UI';c.fillStyle=def.color;
  c.textAlign='center';c.textBaseline='middle';c.fillText('✦',0,0);
 }
 c.restore();
 if(e.daoChoose||e.daoSkill||e.daoLevelUp||e.live2Kind||e.daoTribulation){
  const y=centerY+size*(dramatic?.46:.58);
  c.save();c.globalAlpha*=alpha;c.textAlign='center';c.textBaseline='middle';
  c.font=(dramatic?'900 32px':'800 23px')+' "Segoe UI",sans-serif';
  c.lineWidth=dramatic?7:5;c.lineJoin='round';c.strokeStyle='#070d21';
  c.strokeText(e.relicSkill||def.title,centerX,y);c.fillStyle=def.color;c.fillText(e.relicSkill||def.title,centerX,y);
  c.restore();
 }
}
