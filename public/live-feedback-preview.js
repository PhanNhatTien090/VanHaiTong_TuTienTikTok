import {LiveFeedbackDirector,prepareFeedbackArt} from './live-feedback-fx.js';
import {drawSkillImpact} from './skill-impact-v3.js';
import {prepareFeedbackAudio,playFeedbackAudio} from './feedback-audio.js';
const canvas=document.querySelector('#scene'),c=canvas.getContext('2d');
const director=new LiveFeedbackDirector();
prepareFeedbackArt();
const scene={canvas,budget:{level:'balanced',pressured:false},visibleActors:1,targets:[{id:'hero',x:450,y:1060,scale:1.8}],
 lastCam:{s:1,x:0,y:0},motion:true,reduceFlash:false,effects:[],fps:30};
const seed=1847,bg=document.createElement('canvas');bg.width=900;bg.height=1600;
const b=bg.getContext('2d');
const sky=b.createLinearGradient(0,0,0,1600);sky.addColorStop(0,'#090e31');sky.addColorStop(.55,'#153e62');sky.addColorStop(1,'#101329');
b.fillStyle=sky;b.fillRect(0,0,900,1600);
for(let i=0;i<55;i++){const x=(i*131)%900,y=(i*167)%1100;b.fillStyle=i%3?'#bce5ff90':'#ffe6aa80';b.fillRect(x,y,i%4===0?3:2,2);}
b.fillStyle='#344b6680';b.beginPath();b.ellipse(450,1160,370,95,0,0,Math.PI*2);b.fill();
for(let i=0;i<4;i++){b.beginPath();b.ellipse(450,1160,190+i*35,35+i*12,0,0,Math.PI*2);b.strokeStyle='#67bee770';b.lineWidth=2;b.stroke();}
const $=id=>document.getElementById(id);
let audio=null,sequence=0,hit=null,last=0,frames=0,frameSum=0,lastLog=0,stats={fps:0,ms:0};
function audioEnabled(){return $('sound').checked;}
async function ensureAudio(){
 if(!audioEnabled())return;
 if(!audio){const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const ctx=new C();audio={ctx,enabled:true,sfx:.8,fxBus:ctx.destination,ducked:false};prepareFeedbackAudio(ctx);}
 if(audio.ctx.state!=='running')await audio.ctx.resume();
}
scene.onFeedbackSound=(kind,level)=>{if(audioEnabled()&&audio)playFeedbackAudio(audio,kind,level);};
function reveal(kind){
 const now=performance.now(),id='demo:'+sequence++;
 if(kind==='hit'){
  hit={id,technique:{id:'thunder',name:'CỬU TIÊU THẦN LÔI',color:'#a6d9ff',intensity:3,duration:2000,ultimate:true},
   damage:340,target:{x:450,yRatio:.42},start:now,cinematicSeed:.4,sounded:false};
  return;
 }
 const common={id,user:'hero',name:'Thanh Vân'};
 let e;
 switch(kind){
  case 'small-stone':e={...common,reward:{stones:6}};break;
  case 'large-stone':e={...common,reward:{stones:800}};break;
  case 'hearts':director.push({...common,kind:'hearts',priority:3,level:2,amount:100,id,title:'TÂM Ý DỒI DÀO'},now,scene);return;
  case 'heart-goal':e={...common,heartRounds:1,likeGoal:1000};break;
  case 'stage-1':e={...common,stageUp:1};break;
  case 'stage-2':e={...common,stageUp:2};break;
  case 'stage-3':e={...common,stageUp:3};break;
  case 'reward':e={...common,miniReward:true};break;
  default:return;
 }
 director.add(e,now,scene);
}
for(const button of document.querySelectorAll('[data-kind]'))button.addEventListener('click',async()=>{await ensureAudio();reveal(button.dataset.kind);});
$('quality').addEventListener('change',e=>{scene.budget.level=e.target.value;});
$('motion').addEventListener('change',e=>{scene.motion=!e.target.checked;});
$('flash').addEventListener('change',e=>{scene.reduceFlash=e.target.checked;});
function drawActor(t){
 c.save();const x=450,y=1035;
 // Simple original demo silhouette (not a copied game character).
 c.globalAlpha=.5;c.strokeStyle='#8af4eb';c.lineWidth=3;
 c.beginPath();c.ellipse(x,y+106,95,25,0,0,Math.PI*2);c.stroke();
 c.fillStyle='#2b4265';c.beginPath();c.moveTo(x-20,y-52);c.lineTo(x+20,y-52);c.lineTo(x+95,y+96);c.lineTo(x-95,y+96);c.closePath();c.fill();
 c.fillStyle='#d6b79c';c.beginPath();c.arc(x,y-69,25,0,Math.PI*2);c.fill();
 c.strokeStyle='#90c9ff';c.lineWidth=2;c.beginPath();c.moveTo(x-60,y+80);c.lineTo(x+60,y+80);c.stroke();
 c.font='700 23px Georgia';c.textAlign='center';c.fillStyle='#fff3cf';c.fillText('THANH VÂN',x,y+149);
 c.restore();
}
function frame(t){
 requestAnimationFrame(frame);if(t-last<33)return;
 const begin=performance.now();last=t;c.drawImage(bg,0,0);drawActor(t);
 if(hit){
  const age=t-hit.start,k=age/hit.technique.duration;
  if(k>=1){hit=null;}
  else {
   drawSkillImpact(scene,c,hit,age,k,1600);
   if(k>=.55&&!hit.sounded){hit.sounded=true;scene.onFeedbackSound?.('hit',1);}
  }
 }
 director.draw(scene,c,t,1600);
 frames++;frameSum+=performance.now()-begin;
 if(t-lastLog>950){stats.fps=+(frames*1000/(t-(lastLog||t-1000))).toFixed(1);stats.ms=+(frameSum/frames).toFixed(2);lastLog=t;frames=0;frameSum=0;
  $('stats').textContent='Preview FPS: '+stats.fps+' | JS vẽ: '+stats.ms+' ms | Hiệu ứng: '+director.rows.length+' | Chất lượng: '+scene.budget.level;
 }
}
requestAnimationFrame(frame);
