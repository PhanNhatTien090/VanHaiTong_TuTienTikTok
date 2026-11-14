import {GIFT_HITS,giftSpectacleTier} from './gift-spectacle.js';
import {Scene} from './scene.js';
import {REALM_NAMES} from './progression.js';
import {breakthroughDuration} from './breakthrough-fx.js';
import {ascensionImpactRatio,CultivationAudio} from './audio.js';
import {attackTechnique} from './combat-techniques.js';
import {renderTower} from './tower.js';
import {RenderMetrics} from './live-diag.js';

const $=id=>document.getElementById(id);
const escapeText=value=>String(value).replace(/[&<>]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;'})[char]);
const audio=new CultivationAudio();
const events={
  ritual:REALM_NAMES.slice(1).map((name,i)=>[i+1,name]),
  combat:[['attack','Kiếm kích'],['boss','Lôi Hổ'],['strike','Thiên đạo giáng lôi']],
  gift:[[1,'Quà nhỏ'],[100,'Quà trung bình'],[500,'Quà lớn'],[5000,'Quà điện ảnh']],
  support:[['race','Đua phi kiếm'],['duel','Luận Kiếm'],['hallwar','Ngũ Đường Tranh Phong'],['boss','Trừ yêu'],['war','Chính Ma Đại Chiến'],['alchemy','Luyện đan'],['maze','Mê cung tốc biến'],['tower','Vân Hải Tháp']],
  daily:[['join','Nhập môn'],['practice','Tu luyện'],['skin','Nhận trang phục'],['victory','Vinh danh']]
};
let scene,metrics,meter,timeout,warTimer,entry=0,voice=null,generation=0;
const meterSamples=new Float32Array(2048);
let peak=0,interval=null;
const toggles=id=>Object.fromEntries([...$(id).querySelectorAll('input')].map(input=>[input.name,input.checked]));

function options(){
  const group=$('group').value;
  $('event').replaceChildren(...events[group].map(([value,name])=>new Option(name,value)));
  $('section').disabled=!['ritual','gift','support'].includes(group);
  $('layers').disabled=group!=='ritual';
}
$('group').onchange=options;
options();

function setup(){
  scene=new Scene($('preview'),()=>{});
  metrics=new RenderMetrics();
  scene.metrics=metrics;
  scene.residents=false;
  scene.zoom=1;
  scene.onSpectacleImpact=()=>audio.play('impact',true);
  scene.onCinematicSound=(id,preset,delay,options)=>audio.cinematicCue(id,preset,delay,{...options,enabled:toggles('cinematicLayers')});
  scene.onTowerSound=kind=>audio.play('tower-'+kind,true);
  scene.onMazePortalSound=()=>audio.play('maze-portal',true);
  scene.onWarSound=(kind,side,power)=>audio.war(kind,side,power);
  scene.onAlchemySound=(kind,power)=>audio.alchemy(kind,power);
  scene.onGiftSound=kind=>audio.play(kind,true);
  scene.onEventGiftSound=(kind,context)=>audio.eventGift(kind,context);
  scene.onCombatSound=(kind,variant)=>audio.combat(kind,variant);
  scene.onRitualSound=kind=>audio.play(kind==='gather'?'qi':kind==='reveal'?'victory':'impact',true);
  scene.onRitualAudio=(event,elapsed)=>{
    if(!event){voice?.audio.stop();voice=null;return;}
    if(!audio.enabled||voice?.event===event)return;
    voice?.audio.stop();
    const layers={...toggles('layers'),upgrade:$('version').value==='new',cinematicLayers:toggles('cinematicLayers')};
    voice={event,audio:audio.scheduleRitual(event,event.toRealm,elapsed,layers)};
  };
}
async function enableSound(){
  if(!audio.ctx){
    audio.init();
    meter=audio.ctx.createAnalyser();
    meter.fftSize=meterSamples.length;
    audio.softClip.connect(meter);
  }
  await audio.ctx.resume();
  return audio.ctx.state==='running';
}
function stop(){
  generation++;
  clearTimeout(timeout);clearTimeout(warTimer);
  voice?.audio.stop();voice=null;
  if(scene){renderTower($('previewTower'),null,scene,escapeText);scene.interruptPresentation();scene.heavenStrike=null;scene.visible=false;}
  for(const cue of audio.battleVoices||[])cue.stop();
  audio.battleVoices=[];
  audio.cinematic?.clear({replay:true});
  if(scene){scene.warSeen?.clear();scene.warPhaseKey=null;}
  audio.enabled=false;
}
$('stop').onclick=()=>{stop();$('stats').value='Đã dừng';};

document.querySelector('form').onsubmit=async event=>{
  event.preventDefault();
  stop();
  const current=generation;
  if(!scene)setup();
  let enabled=false;
  if($('sound').checked){try{enabled=await enableSound();}catch{$('stats').value='Trình duyệt đang chặn âm thanh';}}
  if(current!==generation)return;
  audio.enabled=enabled;
  const count=Math.max(1,Math.min(500,Math.trunc(Number($('actors').value)||1)));
  const players=Array.from({length:count},(_,i)=>({
    id:'demo-'+i,name:'Đạo hữu '+(i+1),active:i<(count===500?28:80),gender:i%2?'nu':'nam',joinedAt:i,
    realm:i%9,giftCoins:0,qi:20,neededQi:100,stones:10,neededStones:25
  }));
  const p=players[0],group=$('group').value,choice=$('event').value,seed=$('seed').value||'van-hai';
  const now=Date.now(),part=$('section').value,id='preview:'+seed+':'+group+':'+choice;
  const state={players,realms:REALM_NAMES,serverNow:now,settings:{},mode:'demo'};
  const support={id:id+'-gift',user:p.id,name:p.name,gift:'Quà mô phỏng',coins:500,value:500,count:1,at:now,mode:choice};
  if(group==='support'){
    if(choice==='race')state.raceStatus={id,active:true,phase:'running',startedAt:now,endsAt:now+15000,
      racers:players.map(player=>({id:player.id,name:player.name,startedAt:now,speed:42,bonus:28})),giftFx:[support]};
    if(choice==='race')state.raceStage=players.slice(0,10).map(player=>player.id);
    if(choice==='duel'){
      const opponent=players[1]||{...p,id:'demo-duel',name:'Đối thủ'};
      if(!players[1])players.push(opponent);
      state.socialScene='tournament';
      state.socialStage=[p.id,opponent.id];
      state.socialStatus={tournament:{current:{id,startedAt:now,endsAt:now+15000,
        aura:{[p.id]:50,[opponent.id]:45},techniques:{[p.id]:attackTechnique(p),[opponent.id]:attackTechnique(opponent)},giftFx:[support]}}};
    }
    if(choice==='war'){
      const impact=part==='impact',tail=part==='tail';
      state.sectWar={id,active:true,phase:tail?'finished':'running',line:62,startedAt:now,endsAt:now+15000,
        ...(tail?{finishedAt:now,podiumUntil:now+15000,result:{winner:'chinh'}}:{}),
        roster:{chinh:players.filter((_,i)=>i%2===0&&players[i].active),ma:players.filter((_,i)=>i%2===1&&players[i].active)},
        counts:{chinh:Math.ceil(players.filter(actor=>actor.active).length/2),ma:Math.floor(players.filter(actor=>actor.active).length/2)},fx:[{
          id:support.id,kind:impact?'flip':'gift',side:'chinh',user:p.id,name:p.name,value:500,truong:125,at:now,gift:support.gift
        }]};
    }
    if(choice==='alchemy'){
      state.alchemy={id,active:true,phase:'brewing',grade:5,heat:62,round:2,roundEndsAt:now+15000,
        fx:[{id:support.id,kind:'fire',user:p.id,name:p.name,at:now}],top:[]};
      state.alchemyStage=players.slice(0,12).map(player=>player.id);
    }
    if(choice==='maze'){
      const cols=8,rows=12,start={x:4,y:11},exit={x:4,y:0};
      const cells=Array.from({length:cols*rows},(_,i)=>i%cols===4?0:i%13===0?0:i%4===0?2:1).join('');
      state.maze={id,cols,rows,start,exit,cells,active:true,phase:'running',count,finished:1,endsAt:now+15000,
        runners:players.map((player,i)=>({id:player.id,n:player.name,x:i===0?4:3+i%3,y:i===0?0:11-i%6,f:i===0?now:0,d:11})),
        teleports:[{id:support.id,from:start,to:exit,at:now,name:p.name}]};
    }
    if(choice==='tower'){
      state.tower={id,active:true,endsAt:now+15000,last:{seq:1,name:p.name,floor:5,won:true,qi:600,mile:true,at:now},
        cur:{id:p.id,name:p.name,floor:6,next:10,hp:87,endsAt:now+13000,guardian:{name:'Tử Lôi Thủ Vệ',art:1,hue:45}},queue:[],queued:0};
    }
    if(choice==='hallwar'){
      const teams=['Truyền Công','Tàng Bảo','Đan Đỉnh','Tuần Sơn','Linh Dược'];
      const colors=['#63ddec','#ffc471','#e898f6','#80adeb','#b3e964'];
      state.hallWar={id,active:true,phase:'running',startedAt:now,battleStartedAt:now,endsAt:now+15000,
        teams:teams.map((name,index)=>({index,name,color:colors[index],score:0,kills:0})),
        members:players.map((actor,i)=>({id:actor.id,name:actor.name,index:i%5,score:0,joinedAt:now,hp:100,maxHp:100})),fx:[]};
    }
  }
  if((group==='combat'||group==='support')&&choice==='boss')state.boss={id,startedAt:now,endsAt:now+12000,species:'storm-tiger',name:'Lôi Hổ',hp:500,maxHp:500,participants:{},damage:{}};
  scene.showcase=group==='ritual';
  scene.cinematicV2=$('version').value==='new';
  scene.cinematicLayers=toggles('visualLayers');
  scene.shakeLevel=$('shake').value;
  scene.cameraEnabled=true;
  scene.motion=!$('motion').checked&&!matchMedia('(prefers-reduced-motion: reduce)').matches;
  scene.reduceFlash=$('flash').checked||!scene.motion;
  scene.visible=true;scene.setQuality($('quality').value);scene.update(state,null);
  peak=0;interval=null;entry=performance.now();
  if(state.tower)renderTower($('previewTower'),state,scene,escapeText,now);
  if(group==='ritual'){
    const realm=Number(choice),e={id,user:p.id,name:p.name,effect:'breakthrough',fromRealm:realm-1,toRealm:realm,
      visualFrom:{...p,realm:realm-1},visualTo:{...p,realm}};
    scene.noteEvent(e);scene.addEffect(e);
    const duration=breakthroughDuration(e),impact=duration*ascensionImpactRatio(realm);
    const offset=part==='impact'?Math.max(0,impact-850):part==='tail'?impact+450:0;
    const end=part==='charge'?Math.max(300,impact-250):part==='impact'?Math.min(duration,impact+1700):duration;
    const visual=scene.effects.find(effect=>effect.id===id);
    if(visual)visual.start-=offset;
    timeout=setTimeout(stop,end-offset+250);
  }else if(group==='gift'){
    const e={id,user:p.id,name:p.name,effect:'gift',gift:'Quà mô phỏng',coins:Number(choice),count:1};
    scene.noteEvent(e);scene.addEffect(e);audio.play(+choice>=100?'dragon':'sword',true);
    const visual=scene.effects.find(effect=>effect.id===id),tier=giftSpectacleTier(e);
    if(tier&&visual){
      if(part==='impact')visual.start-=Math.max(0,tier.duration*GIFT_HITS[0]-850);
      if(part==='tail')visual.start-=tier.duration*GIFT_HITS[1]+300;
    }
  }else if(group==='support'){
    if(['hallwar','boss','tower'].includes(choice))scene.addEffect({...support,effect:'gift'});
    if(choice==='war'&&part==='all'){
      warTimer=setTimeout(()=>{
        const at=Date.now(),war=state.sectWar;
        state.serverNow=at;
        state.sectWar={...war,line:37,fx:[{id:id+':turn',kind:'turn',side:'ma',at}]};
        scene.update(state,null);
        warTimer=setTimeout(()=>{
          const finishedAt=Date.now();
          state.serverNow=finishedAt;
          state.sectWar={...state.sectWar,phase:'finished',finishedAt,podiumUntil:finishedAt+15000,result:{winner:'ma'},fx:[]};
          scene.update(state,null);
        },4400);
      },3200);
    }
  }else if(group==='combat'&&choice==='strike'){
    scene.startHeavenStrike({user:p.id,name:p.name,heavenStrike:{seed,loss:0}});audio.play('impact',true);
  }else{
    const e={id,user:p.id,name:p.name,effect:group==='combat'?'attack':choice,text:'Diễn thử',technique:group==='combat'?attackTechnique(p):undefined};
    scene.noteEvent(e);scene.addEffect(e);audio.play(choice==='practice'?'qi':choice==='boss'?'boss':e.effect);
  }
  if(group!=='ritual')timeout=setTimeout(stop,group==='combat'&&choice==='strike'?14500:15000);
};
setInterval(()=>{
  if(!scene?.visible)return;
  if(scene.lastState?.tower)renderTower($('previewTower'),scene.lastState,scene,escapeText);
  if(meter&&audio.enabled){meter.getFloatTimeDomainData(meterSamples);for(const v of meterSamples)peak=Math.max(peak,Math.abs(v));}
  if(performance.now()-entry<650)return;
  const db=peak?(20*Math.log10(peak)).toFixed(1)+' dBFS':'—';
  if((performance.now()-entry)%1000<300)interval=metrics.snapshot(scene).timings.frameInterval;
  $('stats').value=(scene.fps||'—')+' FPS · P95/P99 '+(interval?.p95??'—')+'/'+(interval?.p99??'—')+' ms · đỉnh mẫu '+db;
},250);
addEventListener('pagehide',()=>{stop();audio.destroy();});
