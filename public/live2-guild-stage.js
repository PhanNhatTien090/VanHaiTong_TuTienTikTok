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


// One pooled clash, triggered by a scoreboard delta; never spawn a particle per comment.
// Draw in world coordinates after the arena background, before character names/HUD.
export function drawGuildWarClash(c,pulse,t,H=1600,{light=false,motion=true,reducedFlash=false}={}){
 if(!c||!pulse||!Number.isFinite(pulse.at)||t<pulse.at||t-pulse.at>1000)return false;
 const k=(t-pulse.at)/1000,alpha=Math.min(1,k*9,(1-k)*5);
 if(alpha<=0)return false;
 const attacking=Number(pulse.side)===1?670:230,enemy=Number(pulse.side)===1?230:670;
 const startY=H*.61,endY=H*.59,impactX=450;
 const projectileX=attacking+(impactX-attacking)*Math.min(1,k*2.8);
 const projectileY=startY-90*Math.sin(Math.min(1,k*2.8)*Math.PI);
 const color=Number(pulse.side)===1?'#ffbd8b':'#8fe4ff';
 c.save();
 try{
  c.globalAlpha=alpha*(reducedFlash?.50:.8);
  c.lineCap='round';c.strokeStyle=color;c.lineWidth=light?5:9;
  c.beginPath();c.moveTo(attacking,startY);
  c.quadraticCurveTo((attacking+projectileX)/2,H*.47,projectileX,projectileY);c.stroke();
  if(!light){
   c.strokeStyle='#fff4da';c.lineWidth=2;c.globalAlpha*=.65;
   c.beginPath();c.moveTo(attacking,startY);
   c.quadraticCurveTo((attacking+projectileX)/2,H*.47,projectileX,projectileY);c.stroke();
  }
  if(k>.28&&k<.89){
   const radius=18+(k-.28)*310;
   c.strokeStyle='#f6e5d0';c.lineWidth=light?2:4;
   c.globalAlpha=Math.max(0,Math.min(.6,(k-.28)*5,(.89-k)*4))*(reducedFlash?.35:1);
   c.beginPath();c.ellipse(impactX,endY,radius,radius*.35,0,0,Math.PI*2);c.stroke();
  }
 }finally{c.restore();}
 return true;
}
