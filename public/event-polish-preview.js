import {drawHallWar} from './hall-war.js?v=polish-20261114';
import {renderMiniEvent} from './mini-event-ui.js?v=polish-20261114';
import {addEventDonation,drawEventDonations} from './event-donations.js?v=polish-20261114';
const names=['Truyền Công Đường','Tàng Bảo Đường','Đan Đỉnh Đường','Tuần Sơn Đường','Linh Dược Đường'],colors=['#79e9c4','#ffc671','#d6aaff','#91caff','#c7ee80'],people=['Thanh Vân','Bạch Nguyệt','Lâm Phong','Hải Lam','Mộc Thanh'];
const canvas=document.querySelector('canvas'),ctx=canvas.getContext('2d'),root=document.querySelector('.scene-shell'),params=new URLSearchParams(location.search),scene={canvas,height:1600,motion:true,budget:{level:'balanced'},hallWarHeard:new Set()},base=Date.now();let phase=params.get('phase')||'running',mini=null,lastCast=0,sequence=0;
const members=Array.from({length:40},(_,i)=>({id:'p'+i,name:people[i%5]+' '+(Math.floor(i/5)+1),index:i%5,joinedAt:i,hp:i===7?0:80,respawnAt:base+4000,score:100+i*17,kills:i%3}));
const event={id:'preview-hall',active:true,phase,startedAt:base-30000,battleStartedAt:base-30000,registrationEndsAt:base+30000,endsAt:base+90000,podiumUntil:base+14000,teams:names.map((name,index)=>({index,name,color:colors[index],score:1200+index*250,kills:index})),members,fx:[],rewardCount:28,mvp:[{name:'Thanh Vân',score:1710}]};scene.hallWarStatus=event;scene.playerIndex=new Map(members.map(p=>[p.id,p]));
const image=new Image();image.src='/assets/maps-v3/tournament-arena.png';await image.decode();scene.background=image;
function setPhase(next){phase=event.phase=next;document.body.classList.toggle('hall-war-podium',phase==='finished');const now=Date.now();if(next==='registration')event.startedAt=now;event.registrationEndsAt=now+30000;event.podiumUntil=now+14000;event.endsAt=now+90000;event.results=[...event.teams].sort((a,b)=>b.score-a.score);}
function showMini(type){const now=Date.now(),labels={rps:'OẲN TÙ TÌ TIÊN GIỚI',lucky:'BA TÚI LINH LỘC',star:'BẮT SAO MAY MẮN'};mini={id:'preview-'+type,type,name:labels[type],startedAt:now-9000,endsAt:now+36000,resultUntil:0,phase:'playing',count:0,remaining:12,latest:[],winners:[]};claim();}
function claim(){if(!mini||mini.phase==='finished'||mini.count>=12)return;mini.count++;mini.remaining=12-mini.count;const row={id:'viewer'+mini.count,at:Date.now(),name:people[(mini.count-1)%5],qi:120,stones:18,result:mini.type==='rps'?'Kéo • Đạo hữu thắng!':mini.type==='lucky'?'Túi 2 • Đại Cát':'Bắt được sao hạng '+mini.count,outcome:mini.type==='rps'?'win':mini.type==='lucky'?'grand':'star',choice:String(mini.count)};mini.latest.unshift(row);mini.latest=mini.latest.slice(0,3);mini.winners.push(row);mini.winners=mini.winners.slice(0,3);}
function gift(){addEventDonation(scene,{id:'preview-gift-'+sequence++,gift:'Hoa',coins:300,count:1,user:'p0',name:'Thanh Vân'},performance.now());}
setPhase(phase);if(params.has('mini'))showMini(params.get('mini'));if(params.has('finale')&&mini){mini.phase='finished';mini.resultUntil=Date.now()+8000;claim();}if(params.has('capture'))document.body.classList.add('preview-capture');
for(const b of document.querySelectorAll('[data-phase]'))b.onclick=()=>setPhase(b.dataset.phase);for(const b of document.querySelectorAll('[data-mini]'))b.onclick=()=>showMini(b.dataset.mini);
document.getElementById('previewClaim').onclick=claim;document.getElementById('previewFinish').onclick=()=>{if(mini){mini.phase='finished';mini.resultUntil=Date.now()+8000;}};document.getElementById('previewGift').onclick=gift;document.getElementById('previewMotion').onclick=()=>{scene.motion=!scene.motion;};
let ready=false,lastPaint=0;
function frame(t){
 requestAnimationFrame(frame);if(document.hidden||t-lastPaint<33)return;lastPaint=t;
 const now=Date.now();scene.stateServerNow=now;scene.stateReceivedAt=t;scene.lastState={serverNow:now,hallWar:event};
 if(phase==='running'&&now-lastCast>1600){lastCast=now;event.fx=Array.from({length:6},(_,i)=>{const from=members[(sequence+i*7)%members.length],to=members[(sequence+i*7+1)%members.length];return {id:'preview-fx-'+sequence+'-'+i,from:from.id,to:to.id,index:from.index,at:now-i*30,damage:23+i*3,knockout:i===5,ultimate:i%3===0,value:i%3===0?300:0};});sequence++;}
 const started=performance.now();drawHallWar(scene,ctx,t,1600);drawEventDonations(scene,ctx,t,1600);scene.frameMs=performance.now()-started;renderMiniEvent(mini,now,root,scene.motion);
 if(!ready){ready=true;window.previewReady=true;if(params.has('gift'))gift();}
}
window.eventPreview={scene,event,showMini,claim,setPhase,gift,get mini(){return mini;}};requestAnimationFrame(frame);
