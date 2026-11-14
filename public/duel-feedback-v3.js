// V3.5 Duel HUD — reflects server-authoritative duel aura and accepted boosts.
// Does not invent HP or change tournament winner logic.
import {duelCastState} from './duel-combat.js';
import {DUEL_RELEASE_AT} from './duel-cinematic.js';
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
export function duelVisualState(match,id,now){
 const age=Math.max(0,now-(match?.startedAt||now)),boosts=Math.max(0,Math.min(3,Number(match?.boosts?.[id])||0));
 const aura=clamp((Number(match?.aura?.[id])||0)/100);
 const boostAge=Math.max(0,now-(Number(match?.lastBoost?.[id])||-1e9));
 // This secondary bar is a telegraphed casting phase, not a fake combat stat.
 // V4: thanh tụ khí theo pha thật của trận (đầy dần lúc Tụ Khí, nạp theo từng chiêu lúc ra chiêu).
 const cast=duelCastState(age),recharge=cast.phase==='charge'?cast.phaseK:cast.ready?clamp(cast.k/DUEL_RELEASE_AT):cast.phase==='open'?0:1;
 return {age,aura,boosts,boostAge,phase:cast.phase,charge:recharge,recovery:boostAge<1450?1-clamp(boostAge/1450):0};
}
export function drawDuelFeedback(scene,c,match,targets,now){
 if(!match||!targets||targets.length!==2)return;
 const light=scene.budget?.pressured||scene.budget?.level==='light',motion=scene.motion!==false,flash=scene.reduceFlash;
 for(let i=0;i<2;i++){
  const p=targets[i],state=duelVisualState(match,p.id,now),x=p.x,y=p.y-292,width=190;
  c.save();
  c.fillStyle='#091526d8';c.strokeStyle=i===0?'#74e8e1':'#d3b5ff';c.lineWidth=1;
  c.beginPath();c.roundRect(x-width/2,y,width,74,8);c.fill();c.stroke();
  c.font='700 12px Segoe UI,Arial';c.textAlign='left';c.fillStyle='#f7e7b2';
  c.fillText('LINH ÁP',x-width/2+8,y+17);
  c.fillText('TỤ KHÍ',x-width/2+8,y+42);
  c.fillStyle='#233c52';c.fillRect(x-width/2+70,y+9,110,9);c.fillRect(x-width/2+70,y+34,110,9);
  c.fillStyle=i===0?'#78dfcb':'#bb9af1';c.fillRect(x-width/2+70,y+9,110*state.aura,9);
  c.fillStyle='#d8bd79';c.fillRect(x-width/2+70,y+34,110*state.charge,9);
  // V4: hướng dẫn ngay trên đài — đấu thủ gõ kiem để trợ lực (tối đa 3, hồi 5 s), giống luật server.
  c.font='800 15px Segoe UI,Arial';c.textAlign='center';c.fillStyle=state.boosts>=3?'#9fe8b8':'#ffe7a8';c.fillText(state.boosts>=3?'✦ ĐÃ TRỢ LỰC ĐỦ 3/3':'gõ kiem · trợ lực '+state.boosts+'/3',x,y+64);
  if(state.recovery>0){
   const k=motion?state.recovery:1,cx=x,cy=y+72;
   c.globalAlpha=k;c.strokeStyle=i===0?'#80fff0':'#e5afff';c.lineWidth=2.5;
   c.beginPath();c.ellipse(cx,cy,30+(1-k)*65,10+(1-k)*30,0,0,Math.PI*2);c.stroke();
   if(!flash){c.globalAlpha*=.38;c.fillStyle='#eafde9';c.beginPath();c.arc(cx,cy-22,11+10*k,0,Math.PI*2);c.fill();}
   c.globalAlpha=k;c.fillStyle='#e7ffe9';c.font='700 14px Segoe UI,Arial';c.textAlign='center';c.fillText('HỒI LINH LỰC +'+state.boosts+'/3',x,y-10);
  }
  c.restore();
 }
}
