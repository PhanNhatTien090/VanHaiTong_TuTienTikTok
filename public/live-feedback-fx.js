// Cinematic V3.5 — event-driven, bounded overlay feedback.
// No new animation loop, layout thrashing or event reward changes.
import {makeSurface} from './performance.js';
const TAU=Math.PI*2,clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const ease=n=>1-(1-clamp(n))**3;
const identity=n=>String(n??'').slice(0,100);
const sample=(seed,i)=>{const n=Math.sin(seed*13.173+i*127.19)*43758.5453;return n-Math.floor(n);};
const images=new Map();
const colors={blue:['#5af5ff','#1f66e0','#e9ffff'],violet:['#b893ff','#6043b9','#fff3ff'],gold:['#ffe29a','#d99230','#fff8d9']};
const STAGE_NAMES=['SƠ KỲ','TRUNG KỲ','HẬU KỲ','VIÊN MÃN'];
function image(kind){
 if(images.has(kind))return images.get(kind);
 const s=makeSurface(80,80);if(!s)return null;
 const c=s.getContext('2d');
 c.save();c.translate(40,40);
 if(kind==='heart'){
   const g=c.createLinearGradient(-24,-30,21,30);g.addColorStop(0,'#fff0f5');g.addColorStop(.32,'#ff9bcb');g.addColorStop(1,'#e54e95');
   c.beginPath();c.moveTo(0,29);c.bezierCurveTo(-13,19,-31,-.5,-28,-16);c.bezierCurveTo(-25,-31,-8,-32,0,-18);c.bezierCurveTo(10,-33,27,-30,29,-16);c.bezierCurveTo(31,0,12,19,0,29);c.closePath();c.fillStyle=g;c.fill();c.strokeStyle='#fff7ffcc';c.lineWidth=2;c.stroke();
   c.fillStyle='#ffffffbf';c.beginPath();c.ellipse(-13,-16,7,3,-.6,0,TAU);c.fill();
 }else if(kind==='spark'){
   const g=c.createRadialGradient(0,0,0,0,0,35);g.addColorStop(0,'#ffffff');g.addColorStop(.12,'#fff8decc');g.addColorStop(1,'#ffe09200');c.fillStyle=g;c.fillRect(-35,-35,70,70);
   c.fillStyle='#fffbe7';c.beginPath();c.moveTo(0,-29);c.quadraticCurveTo(3,-4,29,0);c.quadraticCurveTo(3,4,0,29);c.quadraticCurveTo(-3,4,-29,0);c.quadraticCurveTo(-3,-4,0,-29);c.fill();
 }else{
   const [shine,edge,core]=colors[kind]||colors.blue;
   const g=c.createLinearGradient(-20,-29,23,28);g.addColorStop(0,shine);g.addColorStop(.53,core);g.addColorStop(1,edge);
   c.beginPath();c.moveTo(0,-33);c.lineTo(21,-14);c.lineTo(25,13);c.lineTo(0,34);c.lineTo(-25,13);c.lineTo(-21,-14);c.closePath();c.fillStyle=g;c.fill();c.strokeStyle='#fffce4aa';c.lineWidth=1.5;c.stroke();
   c.fillStyle=edge+'a9';c.beginPath();c.moveTo(0,-33);c.lineTo(0,34);c.lineTo(-25,13);c.lineTo(-21,-14);c.closePath();c.fill();
   c.fillStyle=shine+'a9';c.beginPath();c.moveTo(0,-33);c.lineTo(21,-14);c.lineTo(0,4);c.lineTo(-21,-14);c.closePath();c.fill();
   c.strokeStyle=core;c.lineWidth=1;c.beginPath();c.moveTo(0,4);c.lineTo(0,34);c.moveTo(0,4);c.lineTo(25,13);c.moveTo(0,4);c.lineTo(-25,13);c.stroke();
   c.fillStyle='#fff';c.fillRect(-7,-21,7,2);
 }
 c.restore();images.set(kind,s);return s;
}
export function prepareFeedbackArt(){for(const key of ['heart','spark','blue','violet','gold'])image(key);}
export function feedbackPlan(event){
 if(!event||event.resident||event.actorKind==='npc'||event.puppet)return null;
 if(Number.isInteger(event.stageUp)&&event.stageUp>=1&&event.stageUp<=3)return {kind:'stage',priority:4,level:event.stageUp,name:event.name,title:STAGE_NAMES[event.stageUp]};
 if(event.heartRounds>0&&event.likeGoal>0)return {kind:'hearts',priority:3,level:2,name:'Vân Hải Tông',title:'ĐẠO TÂM CỘNG HƯỞNG',amount:event.likeGoal};
 const stones=Number(event.reward?.stones)||0;
 if(stones>0&&!event.gift)return {kind:'stones',priority:stones>=200?3:1,level:stones>=200?3:stones>=30?2:1,name:event.name,title:'LINH THẠCH THIÊN GIÁNG',amount:stones};
 if(event.achieve?.kind==='disciple')return {kind:'stage',priority:4,level:2,name:event.name,title:'CHÂN TRUYỀN ĐỆ TỬ'};
 if(event.warTurn)return {kind:'celebrate',priority:3,level:2,name:event.name,title:'CHIẾN TUYẾN ĐẢO CHIỀU'};
 if(event.warFinal||event.warEnd)return {kind:'celebrate',priority:3,level:3,name:event.name,title:'CHÍNH MA ĐẠI CHIẾN'};
 if(event.hallWarEnd||event.tournamentChampion)return {kind:'celebrate',priority:3,level:3,name:event.name,title:'CỬU PHONG VINH QUANG'};
 if(event.alchemyEnd)return {kind:'celebrate',priority:2,level:2,name:event.name,title:'THÀNH ĐAN PHÚC LỘC'};
 if(event.mazeFinishRank||event.mazeEnd)return {kind:'celebrate',priority:2,level:2,name:event.name,title:'BÍ CẢNH THẮNG LỢI'};
 if(event.miniReward||event.hallWarReward||event.visitorAward||event.petAward||event.opportunityEnd)return {kind:'celebrate',priority:2,level:1,name:event.name,title:'PHÚC DUYÊN GIÁNG LÂM'};
 return null;
}
export function feedbackParticles(kind,light=false,level=1){
 if(kind==='stones')return light?5:level>=3?18:level>=2?12:7;
 if(kind==='hearts')return light?5:level>=2?12:7;
 return light?3:8;
}
export class LiveFeedbackDirector{
 constructor(){this.rows=[];this.seen=new Set();this.lastByType=new Map();}
 add(event,now,scene){
  const plan=feedbackPlan(event);
  if(!plan)return false;
  return this.push({...plan,id:event.id||('event:'+now+':'+plan.kind),user:event.user},now,scene);
 }
 push(event,now,scene){
  if(!event||!Number.isFinite(now))return false;
  const id=identity(event.id),type=event.kind;
  if(!id||this.seen.has(id)||!['stones','hearts','stage','celebrate'].includes(type))return false;
  this.seen.add(id);if(this.seen.size>200)this.seen.delete(this.seen.values().next().value);
  const byUser=type+':'+identity(event.user);
  const prev=this.lastByType.get(byUser)??-1e9;
  if(now-prev<(type==='stones'?800:type==='hearts'?1600:750))return false;
  this.lastByType.set(byUser,now);
  if(this.lastByType.size>80)this.lastByType.delete(this.lastByType.keys().next().value);
  const n=Math.round(Number(event.amount)||0).toLocaleString('vi-VN');
  const row={...event,id,start:now,seed:Math.abs([...id].reduce((n,ch)=>Math.imul(n,31)+ch.charCodeAt(0)|0,1337)),duration:type==='stones'?1450:type==='hearts'?1580:1900,
   labelTitle:String(event.title||'').slice(0,38),labelName:String(event.name||'Đạo hữu').slice(0,24),
   labelValue:type==='stones'?' +'+n+' linh thạch':type==='hearts'?' ❤ '+n+' tim':''};
  this.rows.push(row);
  this.rows.sort((a,b)=>b.priority-a.priority||a.start-b.start);
  if(this.rows.length>6)this.rows.length=6;
  if(scene&&this.rows[0]===row&&!scene.budget?.pressured){
   const sound=type==='stones'?'crystal':type==='hearts'?'heart':type==='stage'?'stage':'reward';
   scene.onFeedbackSound?.(sound,clamp((event.level||1)/3,.25,1));
  }
  return true;
 }
 snapshot(oldIndex,players,now,scene){
  if(!oldIndex?.size)return;
  // Only two visual receipts per state update, regardless of audience size.
  let emitted=0;
  for(const p of players||[]){
   if(emitted>=2)break;
   if(!p.active||p.resident||p.puppet)continue;
   const previous=oldIndex.get(p.id);if(!previous)continue;
   const currentHearts=Number(p.likeReceipt?.total)||0,oldHearts=Number(previous.likeReceipt?.total)||0;
   if(currentHearts>oldHearts&&Math.floor(currentHearts/100)>Math.floor(oldHearts/100)){
    if(this.push({kind:'hearts',priority:3,level:2,id:'heart:'+p.id+':'+Math.floor(currentHearts/100),user:p.id,name:p.name,amount:currentHearts,title:'TÂM Ý DỒI DÀO'},now,scene))emitted++;
    continue;
   }
   const gained=(Number(p.stones)||0)-(Number(previous.stones)||0);
   if(gained>0&&!p.giftReceipt){
    if(this.push({kind:'stones',priority:gained>=200?3:1,level:gained>=200?3:gained>=30?2:1,id:'stones:'+p.id+':'+now,user:p.id,name:p.name,amount:gained,title:'LINH THẠCH'},now,scene))emitted++;
   }
  }
 }
 draw(scene,c,now,H){
  for(let i=this.rows.length-1;i>=0;i--)if(now-this.rows[i].start>=this.rows[i].duration)this.rows.splice(i,1);
  if(!this.rows.length)return;
  // Let the hero ritual, large gift or full-screen cinematic own the frame.
  if(scene.effects?.some(e=>e.effect==='breakthrough'&&now-e.start<e.duration)||scene.heavenStrike?.locked)return;
  const light=!!(scene.budget?.pressured||scene.budget?.level==='light'||(scene.fps>0&&scene.fps<18)||scene.visibleActors>30);
  const max=Math.min(this.rows.length,light?1:2),motion=scene.motion!==false;
  c.save();c.setTransform(scene.canvas.width/900,0,0,scene.canvas.height/H,0,0);
  for(let index=0;index<max;index++){
   const e=this.rows[index],age=now-e.start,k=clamp(age/e.duration),intro=clamp(age/230),fade=clamp((e.duration-age)/350)*intro;
   const actor=scene.targets?.find(a=>a.id===e.user);
   const cam=scene.lastCam||{s:1,x:0,y:0};
   const x=actor?clamp(actor.x*cam.s+cam.x,95,805):450,y=actor?clamp((actor.y-75)*cam.s+cam.y,H*.28,H*.72):H*.43;
   const count=feedbackParticles(e.kind,light,e.level);
   c.globalAlpha=fade;
   const radius=e.kind==='hearts'?112:94;
   if(e.kind==='hearts'){
    for(let i=0;i<count;i++){
     const a=(i+sample(e.seed,i))*(TAU/count),u=motion?clamp((age-i*35)/(e.duration-150)):.62;
     if(u<=0)continue;
     const xx=x+Math.cos(a)*(18+radius*ease(u)),yy=y-18+Math.sin(a)*(16+55*ease(u))-u*66;
     const img=image('heart');if(img)c.drawImage(img,xx-10,yy-10,20,20);
    }
   }else if(e.kind==='stones'){
    if(e.level>=2&&!scene.reduceFlash){const glow=image('spark');if(glow){c.globalAlpha=fade*.24;c.drawImage(glow,x-115,y-175,230,230);c.globalAlpha=fade;}}
    for(let i=0;i<count;i++){
     const a=sample(e.seed,i),b=sample(e.seed,i+100),delay=i*45,u=motion?clamp((age-delay)/(650+400*b)):.72;
     if(u<=0)continue;
     const xx=x+(a-.5)*(e.level>=3?270:185),yy=y-155-b*70+ease(u)*(170+b*100),size=17+9*b;
     const img=image(i%7===0&&e.level>=3?'gold':i%3===0?'violet':'blue');if(img)c.drawImage(img,xx-size/2,yy-size/2,size,size*1.2);
     if(!scene.reduceFlash&&u>.7&&u<.9){const spark=image('spark');if(spark){c.globalAlpha=fade*(1-Math.abs(u-.8)/.1)*.65;c.drawImage(spark,xx-18,yy-18,36,36);c.globalAlpha=fade;}}
    }
   }else{
    const glow=image('spark');if(glow&&!scene.reduceFlash){c.globalAlpha=fade*.37;c.drawImage(glow,x-90,y-105,180,180);c.globalAlpha=fade;}
    c.strokeStyle=e.kind==='stage'?'#ffda85':'#8de6ff';c.lineWidth=3;c.beginPath();c.ellipse(x,y,28+125*ease(motion?k:.6),10+49*ease(motion?k:.6),0,0,TAU);c.stroke();
    const spark=image('spark');for(let i=0;i<count;i++){const a=TAU*i/count+sample(e.seed,i),r=30+105*ease(motion?k:.6),xx=x+Math.cos(a)*r,yy=y+Math.sin(a)*r*.5;
      if(spark)c.drawImage(spark,xx-8,yy-8,16,16);}
   }
   // Readable spotlight ribbon (never covers the global HUD).
   const text=e.labelTitle,name=e.labelName,font='700 19px Georgia';
   c.font=font;const width=e.labelWidth??(e.labelWidth=clamp(c.measureText(text).width+48,154,490)),bx=clamp(x-width/2,15,885-width),by=clamp(y-125,H*.23,H*.73);
   c.globalAlpha=fade*.90;c.fillStyle='#081323db';c.beginPath();c.roundRect(bx,by,width,53,14);c.fill();
   c.lineWidth=1.5;c.strokeStyle=e.kind==='hearts'?'#ff9fd0':e.kind==='stones'?'#91f1e9':'#f1d48e';c.stroke();
   c.textAlign='center';c.fillStyle='#fff5d8';c.fillText(text,bx+width/2,by+23);
   c.font='500 13px Segoe UI';c.fillStyle='#e0ebff';c.fillText((name+e.labelValue).slice(0,65),bx+width/2,by+42);
  }
  c.restore();
 }
}
