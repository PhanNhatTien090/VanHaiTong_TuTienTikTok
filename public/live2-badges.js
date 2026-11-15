// Compact, pre-rasterized path badges. BitmapCache does all text drawing once per tier.
// Original nameplate layout stays unchanged; disabled paths produce zero extra draws.
const MARKS=Object.freeze({
 sword:{mark:'⚔',color:'#95e5ff'},
 demon:{mark:'✦',color:'#cf9cff'},
 body:{mark:'◆',color:'#ffe09f'},
 beast:{mark:'◇',color:'#94f2d9'},
 alchemy:{mark:'✺',color:'#ffbe89'}
});
function drawMark(c,def,level,x,y,light){
 c.save();
 try{
  c.globalAlpha=.95;c.fillStyle='#080e20e8';c.strokeStyle=def.color;
  c.lineWidth=level>=4?2:1.2;
  c.beginPath();c.arc(x,y,light?11:13,0,Math.PI*2);c.fill();c.stroke();
  c.fillStyle=def.color;c.font='800 '+(light?13:16)+'px Segoe UI,Arial,sans-serif';
  c.textAlign='center';c.textBaseline='middle';c.fillText(def.mark,x,y);
  if(!light&&level===5){
   c.globalAlpha=.52;c.lineWidth=1;c.beginPath();c.arc(x,y,17,0,Math.PI*2);c.stroke();
  }
 }finally{c.restore();}
}
export function drawDaoNameBadge(c,p,x,y,{light=false,cache=null}={}){
 const summary=p?.live2Summary,def=MARKS[summary?.path];
 if(!c||!def)return false;
 const level=Math.max(1,Math.min(5,Number(summary.level)||1));
 const size=light?26:40;
 if(cache&&typeof cache.get==='function'){
  const key='live2-badge:'+summary.path+':'+level+':'+(light?1:0);
  const bitmap=cache.get(key,size*2,size*2,off=>{
   off.setTransform(2,0,0,2,2,2);
   drawMark(off,def,level,size/2,size/2,light);
  });
  if(bitmap){c.drawImage(bitmap,x-size/2,y-size/2,size,size);return true;}
 }
 drawMark(c,def,level,x,y,light);
 return true;
}
