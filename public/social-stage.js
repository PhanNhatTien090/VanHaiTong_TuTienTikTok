import {drawAura,drawSeal,drawShockwave} from './cinematic-vfx.js';
import {duelCastState,duelPhase,drawDuelImpact} from './duel-combat.js';
import {DUEL_RELEASE_AT,drawDuelCharge,drawDuelRelease,duelSoundPreset} from './duel-cinematic.js';
import {drawDuelFeedback} from './duel-feedback-v3.js';
import {drawEventGiftFx} from './event-gift-fx.js?v=event-donors-20261114';
import {makeSurface} from './performance.js';
import {portraitCanvas} from './linh-bai.js';
import {drawCombatTechnique} from './combat-techniques.js';
import {prewarmDuelV6,drawDuelV6Ultimate,v6SkillFamily,v6CounterProgress} from './duel-showcase-v6.js';
import {prewarmVariantArt,drawV7Variant,v7SkillSpec} from './ultimate-variants-v7.js';
import {prewarmOverdrive} from './cinematic-overdrive-v7.js';
import {prewarmV7Premium} from './v7-premium-art.js';
export function syncSocialStage(scene,state){
 scene.socialStage=state.socialStage||[];scene.socialStatus=state.socialStatus;scene.socialScene=state.socialScene;
 const match=state.socialStatus?.tournament?.current,active=state.socialScene==='tournament'&&!!match?.id;
 // Release potentially multi-megabyte decoded sprites when the LIVE scene changes.
 if(!active&&scene.premiumMatchId){scene.premiumMatchId=null;scene.v7PremiumArt=null;scene.v7PremiumErrors=null;}
 if(!active&&scene.v7VariantMatch){scene.v7VariantMatch=null;scene.v7VariantArt=null;scene.v7VariantErrors=null;}
 if(!active&&scene.v6AssetMatch){scene.v6AssetMatch=null;scene.v6Assets=null;scene.v6MissingAssets=null;}
 if(active&&scene.v6Showcase!==false)prewarmDuelV6(scene,match);
 if(active&&scene.v7Overdrive!==false){prewarmVariantArt(scene,match);prewarmOverdrive(scene);prewarmV7Premium(scene,match);}
 if(active&&match.id!==scene.duelPortraitMatchId){
  scene.duelPortraitMatchId=match.id;
  const fighters=(state.players||[]).filter(p=>p.id===match.a||p.id===match.b);
  // Pre-raster the two existing in-game character portraits outside the render frame.
  // Do not cache an empty portrait before sprite sheets have decoded.
  setTimeout(()=>{if(scene.duelPortraitMatchId!==match.id||!scene.standingArt?.naturalWidth)return;
   for(const p of fighters)try{portraitCanvas(scene,p);}catch{}},0);
 }
 const kind=state.socialScene;document.body.classList.toggle('social-stage',!!kind);document.body.classList.toggle('social-podium',kind==='tournament'&&scene.socialStage.length===1);
 if(kind===scene.socialArtKind)return;scene.socialArtKind=kind;scene.socialArt=null;if(!kind)return;
 const image=new Image();image.onload=()=>{if(scene.socialArtKind!==kind)return;const size=scene.budget?.level==='light'?256:384,frames=[];for(let i=0;i<6;i++){const frame=makeSurface(size,size);if(!frame)continue;frame.getContext('2d').drawImage(image,i%3*image.naturalWidth/3,Math.floor(i/3)*image.naturalHeight/2,image.naturalWidth/3,image.naturalHeight/2,0,0,size,size);frames.push(frame);}scene.socialArt=frames;};image.src='/assets/events-v1/'+kind+'-effects.png';
}
// 08/11: nền Luận Kiếm mới (maps-v3/tournament-arena.png) có mặt sàn ~66–92% chiều cao — đứng ở 78% để chân chạm sàn, không lơ lửng.
const TOURNAMENT_FLOOR=.78;
export function tournamentLobbyTargets(players,H){
 const cols=Math.min(5,Math.max(1,players.length)),rows=Math.max(1,Math.ceil(players.length/cols));
 const scale=Math.min(1.7,rows>3?1.05:rows>1?1.35:1.7);
 return players.map((player,i)=>{const row=Math.floor(i/cols),count=Math.min(cols,players.length-row*cols),x=450+(i%cols-(count-1)/2)*158,y=H*(rows===1?.78:.72+row/Math.max(1,rows-1)*.14);return {id:player.id,player,x,y,baseY:y,scale,lift:0};});
}
export function socialTargets(scene,ordered,H){
 const pair=ordered.length===2,kind=scene.socialScene;
 return ordered.map((p,i)=>({id:p.id,player:p,x:pair?(kind==='bond'?315+i*270:225+i*450):450,y:H*(kind==='bond'?.57:TOURNAMENT_FLOOR),scale:pair?2.25:2.6,lift:0,baseY:H*(kind==='bond'?.57:TOURNAMENT_FLOOR)}));
}
export function drawSocialStage(scene,c,t,layer,solo){
 if(solo||!scene.socialScene)return;const art=scene.socialArt,H=scene.height,s=scene.socialStatus,now=Date.now(),match=s?.tournament?.current,ceremony=s?.ceremony;
 const image=(n,x,y,w,h,a=1)=>{if(!art?.[n])return;c.save();c.globalAlpha=a;c.drawImage(art[n],x,y,w,h);c.restore();};
 if(scene.socialScene==='tournament'){
  // 05/11/2026: luận kiếm là so pháp lực, không đánh vào người. Mỗi bên phóng chiêu vào Linh Châu giữa đài;
  // bên linh áp cao hơn đẩy linh châu về phía đối phương. Đầu ván hai bên chắp tay "mời chỉ giáo", cuối ván người thua "đa tạ chỉ giáo".
  drawEventGiftFx(scene,c,t,layer,'duel');
  const bow=s?.tournament?.lastBow;
  if(match&&scene.targets.length===2){const age=now-match.startedAt,[L,R]=scene.targets,aura=match.aura||{},lead=((aura[L.id]||0)-(aura[R.id]||0))/100;
   const orb={x:450+Math.max(-1,Math.min(1,lead))*120,y:(L.y+R.y)/2-110};
   if(layer==='back'&&age<3000)scene.targets.forEach((p,i)=>image(i,p.x-90,p.y-240,180,260,Math.max(0,1-age/3000)));
   if(layer==='front'&&age>=0){
    const cast=duelCastState(age,lead),phaseInfo=duelPhase(age),charging=cast.phase==='charge';
    for(const [p,i] of [[L,0],[R,1]]){const tech=match.techniques[p.id];beam(c,p.x,p.y-60,orb.x,orb.y,tech?.color||(i?'#c6a0ff':'#a6ecff'),(charging?.55+.35*cast.phaseK:.35)+.25*Math.sin((scene.motion?t:0)*.006+i*2));
     if(charging)drawAura(c,i?'dusk':'jade',p.x,p.y-95,70+75*cast.phaseK,.18+.32*cast.phaseK);}
    linhChau(c,orb.x,orb.y,scene.motion?t:0);
    // V4: pha có nhịp. Bên ra chiêu chốt lúc chiêu bắt đầu (linh áp đổi giữa chừng không làm chiêu đổi bên).
    const key=match.id+':'+cast.turn;if(scene.duelLastCast!==key){scene.duelLastCast=key;scene.duelCastSide=cast.side;scene.duelHitKey=null;}
    const side=scene.duelCastSide??cast.side,a=scene.targets[side],trailer=scene.targets[1-side],technique=match.techniques[a.id],k=cast.k,light=scene.budget?.level==='light';
    const shield=cast.guard?{x:trailer.x+(orb.x-trailer.x)*.42,y:orb.y+28}:null,aim=shield||orb;
    if(cast.guard){const up=Math.min(1,cast.phaseK*6);drawSeal(c,side?'jade':'dusk',trailer.x,trailer.y+10,82,scene.motion?t*.0009:0,.55*up);drawAura(c,side?'jade':'dusk',shield.x,shield.y,58+(k>.34&&k<.6?18:0),.6*up);const hit=k>.34&&k<.6?1-(k-.34)/.26:0;c.save();c.globalAlpha=(.55+.4*hit)*up;c.strokeStyle=side?'#9ff5df':'#e2c4ff';c.lineWidth=3+3*hit;c.beginPath();c.ellipse(shield.x,shield.y-6,26+6*hit,78+10*hit,0,0,Math.PI*2);c.stroke();c.globalAlpha*=.5;c.lineWidth=1.5;c.beginPath();c.ellipse(shield.x,shield.y-6,16,62,0,0,Math.PI*2);c.stroke();c.restore();}
    if(cast.ready&&technique){
     // The real fighter charges visibly BEFORE the attack animation. Sound and
     // release are one-shot, keyed by this server match/cast, never by a frame.
     if(scene.duelLastCharge!==key){
      scene.duelLastCharge=key;
      if(cast.ultimate)scene.duelChargeAt=now;
      scene.onCombatSound?.('cast',technique.id);
      scene.onCinematicSound?.(key+':sfx',duelSoundPreset(technique),Math.max(0,(.67-k)*cast.period)/1000,{priority:cast.ultimate?5:2,charge:!!cast.ultimate,gain:cast.ultimate?.55:.29});
     }
     // A softer second-caster hit adds stereo-like call-and-response without
     // changing simulation, animation loops or the three-voice cinematic cap.
     if(cast.ultimate&&scene.v7Overdrive!==false&&k>=.16&&k<.72){
      const counterAudioKey=match.id+':counter-audio',other=match.techniques?.[trailer.id];
      if(other&&scene.duelCounterAudioKey!==counterAudioKey){
       scene.duelCounterAudioKey=counterAudioKey;
       const counterHit=.16+.67*(1-.16);
       scene.onCinematicSound?.(counterAudioKey,duelSoundPreset(other),Math.max(0,(counterHit-k)*cast.period/1000),
        {priority:2,charge:false,gain:.20,enabled:{crack:false,sub:false}});
      }
     }
     const v7Hero=cast.ultimate&&scene.cinematicV2!==false&&scene.v7Overdrive!==false&&!!v7SkillSpec(technique.id);
     const v6Hero=!v7Hero&&cast.ultimate&&scene.cinematicV2!==false&&scene.v6Showcase!==false&&!!v6SkillFamily(technique.id);
     if(k<DUEL_RELEASE_AT){
      if(v7Hero)drawV7Variant(scene,c,t,a,aim,technique,k);
      else if(v6Hero)drawDuelV6Ultimate(scene,c,t,a,aim,technique,k);
      else drawDuelCharge(scene,c,a,technique,k,t,{ultimate:cast.ultimate,light});
     }
     if(k>=DUEL_RELEASE_AT&&scene.duelLastTrigger!==key){
      scene.duelLastTrigger=key;
      scene.animator?.trigger({id:key,user:a.id,effect:'attack',technique},t);
     }
     if(k>=.67&&scene.duelHitKey!==key){
      scene.duelHitKey=key;
      if(!cast.light){
       scene.duelImpact={at:now,preset:cast.ultimate?'legendary':'minor',ultimate:!!cast.ultimate,x:aim.x,y:aim.y};
       scene.onFeedbackSound?.('hit',cast.ultimate?3:cast.guard?2:1);
       // The elemental SFX remains dominant, with a short low-headroom shatter accent.
        if(cast.ultimate&&scene.v7Overdrive!==false)scene.onCinematicSound?.(key+':v7-shatter','fracture',0,{priority:5,charge:false,gain:.19});
      }
     }
     if(k>=DUEL_RELEASE_AT){
      const releaseK=Math.min(1,(k-DUEL_RELEASE_AT)/(1-DUEL_RELEASE_AT));
      if(v7Hero)drawV7Variant(scene,c,t,a,aim,technique,k);
      else if(v6Hero)drawDuelV6Ultimate(scene,c,t,a,aim,technique,k);
      else {
       drawCombatTechnique(c,{technique,target:{x:aim.x,yRatio:aim.y/H}},scene.motion?t:0,releaseK,a,H,{light:light||cast.light,signatures:scene.signatureSprites,relics:scene.combatSprites});
       if(scene.cinematicV2===false)drawDuelImpact(c,aim,{...cast,k:releaseK},technique,light);
       else{
        drawDuelRelease(scene,c,a,aim,technique,k,{ultimate:cast.ultimate,light});
        drawShockwave(c,side?'dusk':'jade',aim.x,aim.y,(k-.67)*cast.period,{quality:light?'light':'balanced',radius:cast.ultimate?280:cast.light?92:cast.guard?120:150,seed:cast.turn*.17,motion:scene.motion,flash:false,aspect:.68});
       }
      }
     }
     // Counter-ultimate: a second REAL fighter charges and releases a distinct
     // defensive spell. Its position and timing are authored, never a fake hit.
     if(cast.ultimate&&scene.cinematicV2!==false&&scene.v6Showcase!==false){
      const other=match.techniques?.[trailer.id],counterK=v6CounterProgress(match,now);
      if(other&&counterK>=0&&counterK<=1){
       const shown=(scene.v7Overdrive!==false&&drawV7Variant(scene,c,t,trailer,aim,other,counterK,{counter:true}))||drawDuelV6Ultimate(scene,c,t,trailer,aim,other,counterK,{counter:true});
       if(!shown&&counterK<DUEL_RELEASE_AT)drawDuelCharge(scene,c,trailer,other,counterK,t,{ultimate:true,light:true});
      }
     }
     if(!cast.ultimate)techName(c,a.x,a.y-312,technique,Math.min(1,k/.08,(1-k)/.2));
    }
    if(cast.label){const la=age-phaseInfo.from,fade=Math.max(0,Math.min(1,la/180,(1300-la)/350));if(fade>0){c.save();c.globalAlpha=fade;c.textAlign='center';c.textBaseline='middle';c.font='900 30px "Segoe UI",Arial,sans-serif';c.lineWidth=6;c.strokeStyle='#07121d';c.strokeText(cast.label,450,Math.min(L.y,R.y)-352);c.fillStyle=cast.ultimate?'#ffe4a0':'#e9f6ff';c.fillText(cast.label,450,Math.min(L.y,R.y)-352);c.restore();}}
    if(k>.6&&k<.95)image(3,orb.x-60,orb.y-60,120,120,Math.sin((k-.6)/.35*Math.PI)*.55);
    drawDuelFeedback(scene,c,match,scene.targets,now);
    if(age<650)for(const p of scene.targets)bubble(c,p.x,p.y-250,'Mời chỉ giáo',Math.min(1,age/250,(650-age)/200));
   }
  }else if(bow?.until>now&&scene.targets.length===2&&layer==='front'){const k=Math.min(1,(now-bow.at)/250,(bow.until-now)/250);
   for(const p of scene.targets)bubble(c,p.x,p.y-250,p.id===bow.loser?'Đa tạ chỉ giáo':'Đã nhường',k);
  }else if(s?.tournament?.podiumUntil>now&&scene.targets[0]){const p=scene.targets[0];if(layer==='back')image(4,p.x-140,p.y-280,280,280,.7);else image(5,p.x+70,p.y-120,100,140);}
 }else if(ceremony&&scene.targets.length===2){const floor=H*.57,k=Math.max(0,Math.min(1,(now-ceremony.startedAt)/Math.max(1,ceremony.endsAt-ceremony.startedAt))),fade=Math.min(1,k*5,(1-k)*5);
  if(layer==='back'){image(0,190,floor-480,520,520,fade);if(scene.cinematicV2===false)image(3,210,floor-145,480,260,fade);else{drawSeal(c,'gold',450,floor+8,222,scene.motion?t*.0003:0,fade*.72);drawAura(c,'dusk',450,floor-125,155,fade*.36);}c.save();c.translate(450,floor-150);c.rotate(scene.motion?Math.sin(t*.0004)*.12:0);image(4,-260,-260,520,520,fade*.4);c.restore();}
  else {if(ceremony.festivalId){for(let i=0;i<6;i++){const angle=(scene.motion?t*.00035:0)+i*Math.PI/3;image(1,450+Math.cos(angle)*235-22,floor-170+Math.sin(angle)*95-30,44,60,fade*.7);}}image(2,335,floor-160,230,130,fade*.8);if(k>.5)image(1,400,floor-245,100,140,fade);if(k>.75)image(5,365,floor+25,170,100,fade);}
 }
}

export function drawBondLinks(scene,c,t){
 if(scene.socialScene||scene.presentation?.until>t)return;const paired=new Set();
 const targets=new Map(scene.targets.map(p=>[p.id,p]));for(const a of scene.targets)for(const bond of (a.player.bondInfos||[a.player.bondInfo].filter(Boolean))){if(!bond||bond.level<1&&!a.player.bondFestivalWins||paired.has(bond.id))continue;const b=targets.get(bond.a===a.id?bond.b:bond.a);if(!b)continue;paired.add(bond.id);
 c.save();c.globalAlpha=.35;c.strokeStyle=bond.level>=3?'#ffe3a2':'#f0b5da';c.lineWidth=1.4;c.beginPath();c.moveTo(a.x,a.y);c.bezierCurveTo(a.x,a.y-40,b.x,b.y-40,b.x,b.y);c.stroke();
 if(bond.level>=2||a.player.bondFestivalWins)for(const p of [a,b])scene.drawFlyingSword(c,p.x,p.y+18,Math.PI/2,'#d4edf5');
 if(bond.level>=3)for(const p of [a,b]){c.beginPath();c.ellipse(p.x,p.y+15,37,10,0,0,Math.PI*2);c.stroke();}
 if(bond.level>=4)for(let i=0;i<4;i++){const u=(scene.motion?t*.00015:0)+i/4;c.fillStyle='#ffe4cb';c.fillRect(a.x+(b.x-a.x)*(u%1),a.y+(b.y-a.y)*(u%1)-18,2,2);}
 c.restore();}
}
// Linh Châu giữa đài: quả cầu sáng xoay, không có hình người.
function linhChau(c,x,y,t){c.save();const r=34+Math.sin(t*.004)*3,g=c.createRadialGradient(x,y,2,x,y,r*2.2);g.addColorStop(0,'#ffffff');g.addColorStop(.25,'#fff1c4e6');g.addColorStop(.6,'#9fe6ff66');g.addColorStop(1,'#9fe6ff00');c.fillStyle=g;c.beginPath();c.arc(x,y,r*2.2,0,Math.PI*2);c.fill();
 c.strokeStyle='#f6dd9a';c.lineWidth=2;for(let i=0;i<3;i++){c.globalAlpha=.55;c.beginPath();c.ellipse(x,y,r*1.25,r*.42,t*.0012+i*Math.PI/3,0,Math.PI*2);c.stroke();}c.restore();}
// Luồng linh lực từ đấu thủ tới linh châu.
function beam(c,x0,y0,x1,y1,color,a){c.save();c.globalAlpha=Math.max(0,a);c.lineCap='round';c.strokeStyle=color;c.lineWidth=10;c.shadowColor=color;c.shadowBlur=18;c.beginPath();c.moveTo(x0,y0);c.quadraticCurveTo((x0+x1)/2,Math.min(y0,y1)-50,x1,y1);c.stroke();c.lineWidth=3;c.strokeStyle='#ffffff';c.shadowBlur=0;c.stroke();c.restore();}
// Bong bóng lễ nghi trên đầu đấu thủ.
function bubble(c,x,y,text,a){if(a<=0)return;c.save();c.globalAlpha=Math.min(1,a);c.font='bold 30px "Segoe UI",Tahoma,sans-serif';c.textAlign='center';c.textBaseline='middle';const w=c.measureText(text).width+56,h=50;
 c.fillStyle='#102633e6';c.strokeStyle='#d3b778';c.lineWidth=2;c.beginPath();c.roundRect?c.roundRect(x-w/2,y-h/2,w,h,12):c.rect(x-w/2,y-h/2,w,h);c.fill();c.stroke();c.fillStyle='#f5e5be';c.fillText('🙏 '+text,x,y+1);c.restore();}
// Tên chiêu riêng (theo pháp bảo/cảnh giới) hiện trên đầu người đang ra chiêu; cường độ cao thêm sao.
function techName(c,x,y,tech,a){if(!tech?.name||a<=0)return;c.save();c.globalAlpha=a;c.font='bold 28px "Segoe UI",Tahoma,sans-serif';c.textAlign='center';c.textBaseline='middle';const label=tech.name+(tech.intensity>1?' '+'✦'.repeat(tech.intensity-1):'');
 c.lineWidth=6;c.strokeStyle='#0b1a26';c.shadowColor=tech.color||'#bfeaff';c.shadowBlur=14;c.strokeText(label,x,y,420);c.fillStyle=tech.color||'#bfeaff';c.fillText(label,x,y,420);c.restore();}
