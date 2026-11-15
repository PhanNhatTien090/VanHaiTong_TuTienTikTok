// Guild War LIVE stage: reuse existing cultivator sprite/animation pipeline.
// Two fixed formations, never clone character sprites, never create per-player canvases.
export const GUILD_ACTORS_PER_SIDE=4;
export function guildWarActorIds(war){
 if(!war?.active)return [];
 return (war.groups||[]).slice(0,2).flatMap(g=>(g.roster||[]).slice(0,GUILD_ACTORS_PER_SIDE));
}
export function guildWarTargets(war,playerIndex,H=1600,{light=false}={}){
 if(!war?.active)return [];
 const groups=(war.groups||[]).slice(0,2);
 const players=[];
 for(let side=0;side<groups.length;side++){
  const seen=new Set();
  const pool=(groups[side].roster||[]).filter(id=>!seen.has(id)&&seen.add(id))
   .slice(0,light?2:GUILD_ACTORS_PER_SIDE);
  for(let i=0;i<pool.length;i++){
   const id=pool[i],player=playerIndex?.get(id);
   if(!player||player.resident||player.puppet||player.webOnly)continue;
   const x=(side===0?230:670)+(i-(pool.length-1)/2)*(light?114:96);
   const y=H*(.72+(i%2)*.085);
   players.push({id,player,x,y,baseY:y,scale:light?1.35:1.55,lift:0,guildSide:side});
  }
 }
 return players;
}
// Static luminous runes and a small score contrast. Never per-frame rasterize glyphs.
export function drawGuildWarFloor(c,war,t,H=1600,{light=false,motion=true}={}){
 if(!war?.active||!c)return false;
 c.save();
 try{
  const now=motion?t*.00018:0,opacity=motion?.35+Math.sin(now*3)*.035:.35;
  for(const [x,y,stroke] of [[230,H*.765,'#7edcf8'],[670,H*.765,'#ffcc85']]){
   c.save();c.translate(x,y);
   c.strokeStyle=stroke;c.globalAlpha=opacity;c.lineWidth=light?2:3;
   c.beginPath();c.ellipse(0,0,light?124:188,light?22:35,0,0,Math.PI*2);c.stroke();
   if(!light){c.lineWidth=1;c.globalAlpha*=.6;c.beginPath();c.ellipse(0,0,165,25,0,0,Math.PI*2);c.stroke();}
   c.restore();
  }
  c.strokeStyle='#fff1c9';c.lineWidth=light?1:2;c.globalAlpha=.26;
  c.beginPath();c.moveTo(450,H*.36);c.lineTo(450,H*.87);c.stroke();
 }finally{c.restore();}
 return true;
}
