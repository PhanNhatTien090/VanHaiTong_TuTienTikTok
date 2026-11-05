// Articulated character poses, sampled from one clock. Presentation only: no game rewards.
const TAU=Math.PI*2;
const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
const hash=s=>{let n=0;for(const ch of String(s))n=(Math.imul(n,31)+ch.charCodeAt(0))|0;return Math.abs(n);};
export function actionPose(e){
  if(e.engagementAction==='follow')return 'wave';if(e.engagementAction==='share')return 'cast';
  const text=String(e.text||'');
  if(e.guardJoin)return 'cast';if(e.togetherStart)return 'meditate';if(e.togetherDone||e.guardSuccess)return 'celebrate';
  if(e.effect==='attack'&&e.technique?.pose)return e.technique.pose;
  if(e.loyaltyAward||e.visitorAward)return 'celebrate';
  if(e.effect==='breakthrough')return 'ascend';
  if(/theo dõi|Kết duyên/.test(text))return 'wave';
  if(e.effect==='join')return 'salute';
  if(/^Dùng |^Kích hoạt /.test(text))return 'cast';
  if(/^Rèn thành|^Trang bị/.test(text))return 'forge';
  if(e.kind==='dragon')return 'dragon';
  if(e.kind==='lotus')return 'lotus';
  if(/Tụ linh/.test(text))return 'heart';
  if(e.effect==='victory'||e.effect==='skin'||e.effect==='title')return 'celebrate';
  if(/^Luyện thành|^Chế tạo thành|^Luyện đan/.test(text)||e.kind==='pill')return 'alchemy';
  if(/^Lĩnh ngộ/.test(text)||e.kind==='learn')return 'read';
  if(e.effect==='attack'||e.kind==='duel'||e.effect==='sword')return 'slash';
  if(e.gift||['lotus','dragon','blessing'].includes(e.effect))return 'cast';
  if(/^Hái/.test(text))return 'gather';
  if(e.effect==='qi')return 'meditate';
  return 'salute';
}
const ranks={dragon:3,lotus:3,forge:2,elixir:2,wave:1,heart:1,ascend:4,celebrate:3,cast:3,slash:2,alchemy:2,read:2,gather:1,salute:1,meditate:0};
export class CharacterAnimator{
  constructor(){this.actions=new Map();}
  trigger(e,t){
    if(!e.user||!e.effect||['hint','ready','status'].includes(e.effect))return;
    const mode=actionPose(e),old=this.actions.get(e.user);
    if(old&&old.id===e.id)return;
    if(old&&t<old.start+old.duration-500&&ranks[old.mode]>ranks[mode])return;
    this.actions.set(e.user,{id:e.id,mode,start:t,duration:mode==='ascend'?5400:mode==='slash'?3800:4200});
    for(const [id,a]of this.actions)if(t>a.start+a.duration+10000)this.actions.delete(id);
    while(this.actions.size>160)this.actions.delete(this.actions.keys().next().value);
  }
  pose(p,t,motion=true){
    if(!motion)return {mode:'meditate',stand:0,left:0,right:0,lean:0,head:0,lift:0,cloth:0,phase:0,energy:0};
    const seed=hash(p.id),wave=t*.002+seed,action=this.actions.get(p.id);
    let mode='meditate',phase=0,amount=0;
    if(action&&t>=action.start&&t<action.start+action.duration){mode=action.mode;phase=(t-action.start)/action.duration;amount=smooth(phase/.15)*smooth((1-phase)/.18);}
    else{
      // A quiet stretch/hand exercise is staggered per actor, never emitted as a viewer interaction.
      const cycle=((t+seed%24000)%24000)/24000;
      if(cycle>.76){mode=p.resident?'practice':'stretch';phase=(cycle-.76)/.24;amount=smooth(phase/.22)*smooth((1-phase)/.25);}
    }
    const pose={mode,phase,stand:0,left:Math.sin(wave)*.035,right:-Math.sin(wave+.5)*.035,lean:Math.sin(wave*.45)*.018,head:Math.sin(wave*.63)*.045,lift:Math.sin(wave)*.65,cloth:Math.sin(wave*.72)*1.5,energy:amount};
    if(mode==='meditate'){pose.left-=amount*.24;pose.right+=amount*.24;pose.lift-=amount*3;return pose;}
    pose.stand=amount;pose.step=0;pose.twist=Math.sin(phase*TAU)*amount*.035;
    if(mode==='slash'||mode==='practice'){
      const strike=keyframes(phase,[[0,0],[.16,-.65],[.28,1],[.40,-.45],[.52,.9],[.66,-.6],[.76,1],[1,0]]),anticipate=Math.sin(phase*TAU);
      pose.left+=amount*(-.35+anticipate*.3);pose.right+=amount*(.6+strike*1.05);pose.lean+=amount*strike*.13;pose.head-=amount*strike*.10;pose.blade=true;pose.strike=Math.max(0,strike);pose.step=amount*strike*3;
    }else if(mode==='wave'){pose.right-=amount*(.8+Math.sin(phase*TAU*3)*.22);pose.head+=amount*.06;
    }else if(mode==='heart'){pose.left-=amount*.7;pose.right+=amount*.7;pose.lift-=Math.sin(phase*Math.PI)*3;
    }else if(mode==='elixir'){pose.right+=amount*1.15;pose.head-=amount*.14;
    }else if(mode==='forge'){const hammer=keyframes(phase,[[0,0],[.22,-.7],[.3,1],[.48,-.7],[.57,1],[.76,-.5],[.84,1],[1,0]]);pose.right+=amount*hammer;pose.left-=amount*.3;pose.blade=true;pose.strike=Math.max(0,hammer);
    }else if(mode==='salute'){
      pose.left-=amount*.77;pose.right+=amount*.77;pose.lean+=Math.sin(phase*Math.PI)*amount*.10;
    }else if(mode==='cast'||mode==='ascend'||mode==='celebrate'||mode==='dragon'||mode==='lotus'){
      const high=mode==='ascend'?1.65:mode==='celebrate'?1.3:1.0;
      pose.left+=amount*high;pose.right-=amount*high;pose.lift-=amount*(mode==='ascend'?14:3);pose.head-=amount*.04;pose.cloth+=Math.sin(phase*TAU*3)*amount*2;pose.step=Math.sin(phase*TAU)*amount*2;
    }else if(mode==='read'){
      pose.left-=amount*.72;pose.right+=amount*.7;pose.head+=amount*.12;
    }else if(mode==='alchemy'||mode==='gather'){
      pose.left-=amount*(.5+Math.sin(phase*TAU*2)*.2);pose.right+=amount*(.6+Math.cos(phase*TAU*2)*.2);pose.lean+=amount*.12;
    }else{pose.left+=amount*.9;pose.right-=amount*.7;pose.head-=amount*.06;}
    return pose;
  }
}

// Interpolate authored anticipation / release / recovery keys, rather than a repeating sine strike.
export function keyframes(t,keys){for(let i=1;i<keys.length;i++)if(t<=keys[i][0]){const [a,x]=keys[i-1],[b,y]=keys[i];return x+(y-x)*smooth((t-a)/(b-a));}return keys.at(-1)[1];}

// A single continuous mesh: sleeves share vertices with shoulders and skirt, so joints cannot open holes.
export function deformPoint(x,y,pose){
  const side=x<0?-1:1,arm=smooth((Math.abs(x)-9)/21)*smooth((y+65)/10)*(1-smooth((y+17)/21));
  const angle=(side<0?pose.left:pose.right)*.53,px=side*13,py=-54,dx=x-px,dy=y-py;
  let xx=x+(px+dx*Math.cos(angle)-dy*Math.sin(angle)-x)*arm;
  let yy=y+(py+dx*Math.sin(angle)+dy*Math.cos(angle)-y)*arm;
  const skirt=smooth((y+17)/40),hair=(1-smooth((y+57)/15))*smooth((Math.abs(x)-9)/19);
  xx+=pose.cloth*(skirt*.75+hair*.3)+Math.sin(y*.12+pose.cloth)*skirt*.6;
  yy+=Math.sin(x*.08+pose.cloth)*skirt*.4;
  const head=1-smooth((y+63)/11),hx=xx,hy=yy+59,a=pose.head*.5*head;
  return {x:hx*Math.cos(a)-hy*Math.sin(a)+(pose.step||0),y:hx*Math.sin(a)+hy*Math.cos(a)-59};
}
function triangle(c,art,source,dest){
  const [u,v,w]=source,[a,b,d]=dest;
  const det=(v.x-u.x)*(w.y-u.y)-(w.x-u.x)*(v.y-u.y);if(Math.abs(det)<1e-8)return;
  const A=((b.x-a.x)*(w.y-u.y)-(d.x-a.x)*(v.y-u.y))/det;
  const B=((b.y-a.y)*(w.y-u.y)-(d.y-a.y)*(v.y-u.y))/det;
  const C=((d.x-a.x)*(v.x-u.x)-(b.x-a.x)*(w.x-u.x))/det;
  const D=((d.y-a.y)*(v.x-u.x)-(b.y-a.y)*(w.x-u.x))/det;
  c.save();c.beginPath();
  // Tiny overlap removes antialias hairlines; all triangles share exact transformed edges.
  const mx=(a.x+b.x+d.x)/3,my=(a.y+b.y+d.y)/3;
  for(const [i,p]of [a,b,d].entries()){const len=Math.hypot(p.x-mx,p.y-my)||1,x=p.x+(p.x-mx)/len*.22,y=p.y+(p.y-my)/len*.22;i?c.lineTo(x,y):c.moveTo(x,y);}
  c.closePath();c.clip();c.transform(A,B,C,D,a.x-A*u.x-C*u.y,a.y-B*u.x-D*u.y);const sx=Math.max(0,Math.min(u.x,v.x,w.x)-3),sy=Math.max(0,Math.min(u.y,v.y,w.y)-3),sw=Math.min(art.naturalWidth,Math.max(u.x,v.x,w.x)+3)-sx,sh=Math.min(art.naturalHeight,Math.max(u.y,v.y,w.y)+3)-sy;c.drawImage(art,sx,sy,sw,sh,sx,sy,sw,sh);c.restore();
}
export function drawArticulated(c,scene,p,skin,t,cell,pose){
  const art=scene.standingArt;if(!art?.complete||!art.naturalWidth)return false;
  const sw=art.naturalWidth/5,sh=art.naturalHeight,cols=scene.budget?.config.mesh||(scene.targets?.length>12?4:6),rows=cols*2,points=[];
  for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++)points.push({s:{x:cell*sw+i*sw/cols,y:j*sh/rows},d:deformPoint(-39+i*78/cols,-84+j*112/rows,pose)});
  c.save();c.shadowBlur=0;c.translate(0,pose.lift+(1-pose.stand)*22);c.rotate(pose.lean);c.scale(1+(pose.twist||0),1);
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
    const a=points[j*(cols+1)+i],b=points[j*(cols+1)+i+1],d=points[(j+1)*(cols+1)+i],e=points[(j+1)*(cols+1)+i+1];
    triangle(c,art,[a.s,b.s,e.s],[a.d,b.d,e.d]);triangle(c,art,[a.s,e.s,d.s],[a.d,e.d,d.d]);
  }
  drawProps(c,scene,skin,pose);c.restore();return true;
}
function glow(c,x,y,r,color,alpha=1){c.save();c.globalCompositeOperation='screen';c.globalAlpha*=alpha;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'#fff7dc');g.addColorStop(.23,color+'bb');g.addColorStop(1,color+'00');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);c.restore();}
function drawProps(c,scene,skin,p){
  const k=p.phase,a=p.energy;if(a<.05)return;
  c.save();c.globalAlpha*=a;
  if(p.blade){
    const hand=deformPoint(30,-24,p);scene.drawFlyingSword(c,hand.x,hand.y+22,.18+p.right*.42,skin.trim);
    if(p.strike>.15){c.save();c.globalCompositeOperation='screen';c.globalAlpha*=p.strike;c.shadowColor=skin.color;c.shadowBlur=8;
      for(let i=0;i<3;i++){c.strokeStyle=i?'#ffffff90':skin.color;c.lineWidth=3-i*.9;c.beginPath();c.ellipse(0,-35,49+i*3,22+i*2,p.right*.5,-1.8,.6);c.stroke();}c.restore();}
  }
  if(p.mode==='read'){
    c.save();c.translate(0,-25);c.scale(1,Math.max(.15,Math.sin(Math.min(1,k/.25)*Math.PI/2)));c.fillStyle='#ebdcb0';c.strokeStyle='#ad8e51';c.lineWidth=.65;
    c.beginPath();c.moveTo(-12,-7);c.quadraticCurveTo(-5,-10,0,-6);c.quadraticCurveTo(6,-10,12,-7);c.lineTo(12,7);c.quadraticCurveTo(5,4,0,7);c.quadraticCurveTo(-6,4,-12,7);c.closePath();c.fill();c.stroke();
    for(let i=0;i<4;i++){c.beginPath();c.moveTo(-9,-4+i*2.3);c.lineTo(-3,-4+i*2.3);c.moveTo(3,-4+i*2.3);c.lineTo(9,-4+i*2.3);c.stroke();}c.restore();
    for(let i=0;i<5;i++)glow(c,-14+i*7,-38-((k*30+i*9)%24),2,skin.color,.5);
  }
  if(p.mode==='alchemy'){
    c.fillStyle='#34494e';c.strokeStyle=skin.trim;c.lineWidth=1.1;c.beginPath();c.ellipse(0,-12,12,9,0,0,TAU);c.fill();c.stroke();c.fillRect(-10,-20,20,5);
    for(let i=0;i<4;i++){const y=-27-((k*40+i*7)%22);glow(c,Math.sin(k*12+i)*5,y,4,skin.color,.6);}glow(c,0,-28,6,skin.trim);
  }else if(p.mode==='elixir'){const h=deformPoint(30,-24,p);glow(c,h.x,h.y,4,skin.trim);glow(c,0,-37,10,skin.color,Math.sin(k*Math.PI));}
  if(p.mode==='heart'){
    c.save();c.translate(0,-38-k*28);c.scale(1+Math.sin(k*Math.PI)*.25,1+Math.sin(k*Math.PI)*.25);c.fillStyle='#ffc5d7';c.beginPath();c.moveTo(0,4);c.bezierCurveTo(-16,-5,-5,-15,0,-7);c.bezierCurveTo(5,-15,16,-5,0,4);c.fill();c.restore();
  }
  if(['cast','ascend','dragon','lotus','celebrate','gather'].includes(p.mode)){
    const count=p.mode==='lotus'?8:5;
    for(let i=0;i<count;i++){const angle=i*TAU/count+k*TAU*1.5,r=24+Math.sin(k*Math.PI)*10;glow(c,Math.cos(angle)*r,-28+Math.sin(angle)*r*.55,3,skin.color,.7);}
    glow(c,0,-28,14,skin.color,.55);
    if(p.mode==='ascend'){c.save();c.globalCompositeOperation='screen';c.strokeStyle=skin.trim;c.lineWidth=.7;for(let i=0;i<3;i++){c.beginPath();c.ellipse(0,12-i*21,31+Math.sin(k*10+i)*3,8,0,0,TAU);c.stroke();}c.restore();}
    if(p.mode==='lotus'){for(let i=0;i<8;i++){c.save();c.translate(0,11);c.rotate(i*TAU/8+k);c.fillStyle=skin.color+'70';c.beginPath();c.ellipse(0,-16,4,17,0,0,TAU);c.fill();c.restore();}}
  }
  c.restore();
}

export function drawSeatedAnimated(c,art,cell,pose,bands=12){
  const sw=art.naturalWidth/5,sh=art.naturalHeight;
  c.save();c.translate(0,pose.lift);c.rotate(pose.lean);
  // Mesh bands supply breathing and fabric motion without hard rectangular seams.
  for(let i=0;i<bands;i++){
    const sy=i*sh/bands,top=-61+i*86/bands,offset=Math.sin(i*.25+pose.cloth)*.3;
    c.drawImage(art,cell*sw,sy,sw,sh/bands,-33+offset,top,66,86/bands+.12);
  }
  c.restore();
}
