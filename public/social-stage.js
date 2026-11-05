import {drawEventGiftFx} from './event-gift-fx.js';
import {makeSurface} from './performance.js';
import {drawCombatTechnique} from './combat-techniques.js';
export function syncSocialStage(scene,state){
 scene.socialStage=state.socialStage||[];scene.socialStatus=state.socialStatus;scene.socialScene=state.socialScene;
 const kind=state.socialScene;document.body.classList.toggle('social-stage',!!kind);document.body.classList.toggle('social-podium',kind==='tournament'&&scene.socialStage.length===1);
 if(kind===scene.socialArtKind)return;scene.socialArtKind=kind;scene.socialArt=null;if(!kind)return;
 const image=new Image();image.onload=()=>{if(scene.socialArtKind!==kind)return;const size=scene.budget?.level==='light'?256:384,frames=[];for(let i=0;i<6;i++){const frame=makeSurface(size,size);if(!frame)continue;frame.getContext('2d').drawImage(image,i%3*image.naturalWidth/3,Math.floor(i/3)*image.naturalHeight/2,image.naturalWidth/3,image.naturalHeight/2,0,0,size,size);frames.push(frame);}scene.socialArt=frames;};image.src='/assets/events-v1/'+kind+'-effects.png';
}
export function socialTargets(scene,ordered,H){
 const pair=ordered.length===2,kind=scene.socialScene;
 return ordered.map((p,i)=>({id:p.id,player:p,x:pair?(kind==='bond'?315+i*270:225+i*450):450,y:H*(kind==='bond'?.57:.55),scale:pair?2.25:2.6,lift:0,baseY:H*.57}));
}
export function drawSocialStage(scene,c,t,layer,solo){
 if(solo||!scene.socialScene)return;const art=scene.socialArt,H=scene.height,s=scene.socialStatus,now=Date.now(),match=s?.tournament?.current,ceremony=s?.ceremony;
 const image=(n,x,y,w,h,a=1)=>{if(!art?.[n])return;c.save();c.globalAlpha=a;c.drawImage(art[n],x,y,w,h);c.restore();};
 if(scene.socialScene==='tournament'){
  drawEventGiftFx(scene,c,t,layer,'duel');
  if(match&&scene.targets.length===2){const age=now-match.startedAt;
   if(layer==='back'&&age<3000)scene.targets.forEach((p,i)=>image(i,p.x-90,p.y-240,180,260,Math.max(0,1-age/3000)));
   if(layer==='front'&&age>=0){const turn=Math.floor(age/4000),a=scene.targets[turn%2],b=scene.targets[(turn+1)%2],technique=match.techniques[a.id],k=age%4000/4000;
    if(technique&&!scene.eventGiftQueue?.active?.fighter){scene.animator?.trigger({id:match.id+':'+turn,user:a.id,effect:'attack',technique},t);drawCombatTechnique(c,{technique,target:{x:b.x,yRatio:(b.y-60)/H}},scene.motion?t:0,k,a,H,{light:scene.budget?.level==='light',signatures:scene.signatureSprites,relics:scene.combatSprites});}
    if(k>.6&&k<.95)image(3,b.x-70,b.y-130,140,140,Math.sin((k-.6)/.35*Math.PI)*.65);
   }
  }else if(s?.tournament?.podiumUntil>now&&scene.targets[0]){const p=scene.targets[0];if(layer==='back')image(4,p.x-140,p.y-280,280,280,.7);else image(5,p.x+70,p.y-120,100,140);}
 }else if(ceremony&&scene.targets.length===2){const floor=H*.57,k=Math.max(0,Math.min(1,(now-ceremony.startedAt)/Math.max(1,ceremony.endsAt-ceremony.startedAt))),fade=Math.min(1,k*5,(1-k)*5);
  if(layer==='back'){image(0,190,floor-480,520,520,fade);image(3,210,floor-145,480,260,fade);c.save();c.translate(450,floor-150);c.rotate(scene.motion?Math.sin(t*.0004)*.12:0);image(4,-260,-260,520,520,fade*.4);c.restore();}
  else {if(ceremony.festivalId){for(let i=0;i<6;i++){const angle=(scene.motion?t*.00035:0)+i*Math.PI/3;image(1,450+Math.cos(angle)*235-22,floor-170+Math.sin(angle)*95-30,44,60,fade*.7);}}image(2,335,floor-160,230,130,fade*.8);if(k>.5)image(1,400,floor-245,100,140,fade);if(k>.75)image(5,365,floor+25,170,100,fade);}
 }
}

export function drawBondLinks(scene,c,t){
 if(scene.socialScene||scene.presentation?.until>t)return;const paired=new Set();
 for(const a of scene.targets){const bond=a.player.bondInfo;if(!bond||bond.level<1&&!a.player.bondFestivalWins||paired.has(bond.id))continue;const b=scene.targets.find(p=>p.id===(bond.a===a.id?bond.b:bond.a));if(!b)continue;paired.add(bond.id);
 c.save();c.globalAlpha=.35;c.strokeStyle=bond.level>=3?'#ffe3a2':'#f0b5da';c.lineWidth=1.4;c.beginPath();c.moveTo(a.x,a.y);c.bezierCurveTo(a.x,a.y-40,b.x,b.y-40,b.x,b.y);c.stroke();
 if(bond.level>=2||a.player.bondFestivalWins)for(const p of [a,b])scene.drawFlyingSword(c,p.x,p.y+18,Math.PI/2,'#d4edf5');
 if(bond.level>=3)for(const p of [a,b]){c.beginPath();c.ellipse(p.x,p.y+15,37,10,0,0,Math.PI*2);c.stroke();}
 if(bond.level>=4)for(let i=0;i<4;i++){const u=(scene.motion?t*.00015:0)+i/4;c.fillStyle='#ffe4cb';c.fillRect(a.x+(b.x-a.x)*(u%1),a.y+(b.y-a.y)*(u%1)-18,2,2);}
 c.restore();}
}
