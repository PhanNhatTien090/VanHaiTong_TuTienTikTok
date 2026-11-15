// Small path identification by the existing nameplate; no extra sprite or offscreen buffer.
// The helper does nothing for legacy players and low-visibility/hidden names.
const MARKS=Object.freeze({
 sword:{mark:'⚔',color:'#95e5ff'},
 demon:{mark:'✦',color:'#cf9cff'},
 body:{mark:'◆',color:'#ffe09f'},
 beast:{mark:'◇',color:'#94f2d9'},
 alchemy:{mark:'✺',color:'#ffbe89'}
});
export function drawDaoNameBadge(c,p,x,y,{light=false}={}){
 const s=p?.live2Summary,def=MARKS[s?.path];
 if(!c||!def)return false;
 const lv=Math.max(1,Math.min(5,Number(s.level)||1));
 c.save();
 try{
  c.globalAlpha=.95;c.fillStyle='#080e20e8';c.strokeStyle=def.color;c.lineWidth=lv>=4?2.0:1.2;
  c.beginPath();c.arc(x,y,light?11:13,0,Math.PI*2);c.fill();c.stroke();
  c.fillStyle=def.color;c.font='800 '+(light?13:16)+'px Segoe UI,Arial,sans-serif';
  c.textAlign='center';c.textBaseline='middle';c.fillText(def.mark,x,y);
  if(!light&&lv===5){
   c.globalAlpha=.52;c.lineWidth=1;
   c.beginPath();c.arc(x,y,17,0,Math.PI*2);c.stroke();
  }
 }finally{c.restore();}
 return true;
}
