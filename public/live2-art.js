// LIVE 2.0 Dao emblems. The five images are pre-rendered independent SVG assets.
// No animation is generated per player; effects reuse one image per path.
const PATHS=Object.freeze({
 sword:{title:'KIẾM ĐẠO',color:'#89ddff',asset:'sword'},
 demon:{title:'MA ĐẠO',color:'#cb8dff',asset:'demon'},
 body:{title:'THỂ ĐẠO',color:'#ffe098',asset:'body'},
 beast:{title:'NGỰ THÚ ĐẠO',color:'#85edce',asset:'beast'},
 alchemy:{title:'ĐAN ĐẠO',color:'#ffbc80',asset:'alchemy'}
});
const EXTRA=Object.freeze({guild:{title:'HỘI CHIẾN',color:'#f2d18c',asset:'guild'},mentor:{title:'SƯ ĐỒ TRUYỀN THỪA',color:'#f9d990',asset:'mentor'},alchemy:{title:'CỬU CHUYỂN ĐAN',color:'#ffb77a',asset:'alchemy'},relic:{title:'PHÁP BẢO HIỂN UY',color:'#bc9eff',asset:'relic'},bond:{title:'TAM SINH ĐỒNG TÂM',color:'#ffa4c5',asset:'bond'},tribulation:{title:'THIÊN KIẾP',color:'#b8cfff',asset:'tribulation'}});
const ART=Object.freeze({...PATHS,...EXTRA});
const cache=new Map(),TAU=Math.PI*2;
export function prepareLive2Art(path){
 if(!Object.hasOwn(ART,path)||cache.has(path)||typeof Image==='undefined')return;
 const img=new Image();cache.set(path,null);
 img.onload=()=>cache.set(path,img);
 img.onerror=()=>cache.delete(path);
 img.src='/assets/live2-paths/'+ART[path].asset+'.svg';
}
export function drawLive2Fx(c,e,t,k,p,{light=false,motion=true}={}){
 const path=e.live2Kind||(e.daoTribulation?'tribulation':e.daoPath),def=ART[path];if(!def)return;
 const img=cache.get(path),centerX=p?.x??450,centerY=(p?.y??650)-70;
 const alpha=Math.max(0,Math.min(1,k*5,(1-k)*5));
 if(!alpha)return;
 const r=e.daoChoose||e.daoUltimate?130:e.guildWarStart?122:e.daoSkill?95:72,size=e.daoChoose||e.daoUltimate?230:e.guildWarStart?215:e.daoSkill?155:120;
 c.save();c.globalAlpha*=alpha;
 c.translate(centerX,centerY);
 if(!light){
  c.strokeStyle=def.color;c.lineWidth=2.2;c.globalAlpha*=.75;
  for(let n=0;n<(e.daoChoose?3:2);n++){
   const angle=motion?t*.00025*(n%2?-1:1):0;
   c.save();c.rotate(angle+n);c.beginPath();c.ellipse(0,0,r+n*18,(r+n*18)*.42,0,0,TAU);c.stroke();c.restore();
  }
  c.globalAlpha=alpha;
 }
 if(img?.complete&&img.naturalWidth>0){
  const scale=motion?1+.06*Math.sin(k*Math.PI*4):1;
  c.drawImage(img,-size*scale/2,-size*scale*.60,size*scale,size*scale);
 }else{
  c.fillStyle=def.color;c.font='bold 48px sans-serif';c.textAlign='center';c.fillText('✦',0,0);
 }
 c.restore();
 // Text is one readable title on significant milestones, never on each combat frame.
 if(e.daoChoose||e.daoSkill||e.daoLevelUp||e.live2Kind||e.daoTribulation){
  c.save();c.globalAlpha*=alpha;c.textAlign='center';c.textBaseline='middle';
  const y=centerY+size*.57;c.font='800 24px "Segoe UI",sans-serif';
  c.lineJoin='round';c.lineWidth=5;c.strokeStyle='#0a1223';c.strokeText(def.title,centerX,y);
  c.fillStyle=def.color;c.fillText(def.title,centerX,y);c.restore();
 }
}
