import {makeSurface} from './performance.js';
import {drawAscensionStageBackdrop} from './ascension-stage.js';
import {setFxPalette,qiVariant,qiRemap,pushFxCamera,drawQiEnvironment,drawQiVignette,drawQiInflow,drawQiCompression,drawQiImpact,drawQiAura,drawQiMotes} from './qi-impact.js';
const HT_PALETTE={main:'#9bcfff',main2:'#c2dcff',soft:'#eef6ff',gold:'#ffe3a2'};
export const HOA_THAN_DURATION=17600,HOA_THAN_REVEAL=14.65;
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10);};
export function hoaThanState(k,H=1600,motion=true){
 const seconds=clamp(k)*17.6,up=ease((seconds-2)/2.4),merge=ease((seconds-12.8)/1.6),burst=ease((seconds-14.4)/.20)*(1-ease((seconds-14.8)/1.5));
 return {k:clamp(k),seconds,feet:H*.67,up,merge,spiritY:H*.67-180-up*280*(1-merge),gates:Array.from({length:6},(_,i)=>ease((seconds-4.4-i*.42)/.65)),avatar:ease((seconds-10.5)/1.8)*(1-ease((seconds-15.5)/2.1)),burst,revealed:seconds>=HOA_THAN_REVEAL,fade:1-ease((seconds-16.5)/1.1),motion};
}
function ring(c,x,y,rx,ry,color,width=2){c.beginPath();c.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),0,0,TAU);c.strokeStyle=color;c.lineWidth=width;c.stroke();}
function glow(c,x,y,r,color,alpha=1){if(r<=0||alpha<=0)return;c.save();c.globalAlpha*=alpha;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'#799fff00');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);c.restore();}
export function actorImage(scene,p,e){
 const key=p.realm;
 if(scene.hoaThanActor?.event!==e.id)scene.hoaThanActor={event:e.id,frames:new Map()};
 const cache=scene.hoaThanActor.frames;
 if(cache.has(key))return cache.get(key);
 const im=makeSurface(640,720);if(!im)return null;const c=im.getContext('2d'),targets=scene.targets,compact=scene.compact,ritual=scene.ritualDrawing;
 scene.targets=[{id:p.id,player:p,x:320,y:590,scale:4.2}];scene.compact=true;scene.ritualDrawing=true;
 try{scene.drawPlayer(c,p,320,590,0);}finally{scene.targets=targets;scene.compact=compact;scene.ritualDrawing=ritual;}
 cache.set(key,im);while(cache.size>2)cache.delete(cache.keys().next().value);return im;
}
// 4/11: bản "hồn" của ảnh nhân vật — bỏ điểm ảnh mờ (alpha³), phủ lam, mép tròn mờ dần; trước đây vẽ thẳng ảnh nên hiện khối chữ nhật xám.
function ghost(im){if(im._ghost)return im._ghost;const g=makeSurface(640,720);if(!g)return im;const a=g.getContext('2d');a.drawImage(im,0,0);a.globalCompositeOperation='destination-in';a.drawImage(im,0,0);a.drawImage(im,0,0);a.globalCompositeOperation='source-atop';a.globalAlpha=.55;a.fillStyle='#9fc8ff';a.fillRect(0,0,640,720);a.globalAlpha=1;a.globalCompositeOperation='destination-in';const m=a.createRadialGradient(320,430,60,320,430,360);m.addColorStop(0,'#fff');m.addColorStop(.62,'#fff');m.addColorStop(1,'#fff0');a.fillStyle=m;a.fillRect(0,0,640,720);const b=a.createLinearGradient(0,0,0,720);b.addColorStop(0,'#fff');b.addColorStop(.6,'#fff');b.addColorStop(.86,'#fff0');a.fillStyle=b;a.fillRect(0,0,640,720);im._ghost=g;return g;}
function spirit(c,im,x,y,scale,alpha){if(!im||alpha<=0)return;im=ghost(im);c.save();c.globalAlpha=alpha;c.globalCompositeOperation='screen';c.drawImage(im,x-320*scale,y-420*scale,640*scale,720*scale);c.restore();}
function spiritChannels(c,s,clock,front=false){
 const sec=s.seconds,open=ease((sec-2)/.8)*(1-ease((sec-14.4)/.7));if(!open)return;
 c.save();c.globalCompositeOperation='screen';
 if(!front){
  // A visible soul tether connects the rising spirit to its original dantian.
  const split=s.up*(1-s.merge);c.globalAlpha=open*split*.65;c.strokeStyle='#a7d8ff';c.lineWidth=3;c.beginPath();c.moveTo(450,s.feet-145);c.bezierCurveTo(390,s.feet-230,510,s.spiritY+120,450,s.spiritY+80);c.stroke();
  for(let i=0;i<3;i++){const u=(clock*.45+i/3)%1,y=(s.feet-145)*(1-u)+(s.spiritY+80)*u;glow(c,450+Math.sin(u*TAU)*17,y,12,'#ddf4ff',split*Math.sin(u*Math.PI));}
  // Three awareness arcs are engraved in time around the effigy's head.
  for(let i=0;i<3;i++){const draw=ease((sec-10.5-i*.35)/1.0);c.globalAlpha=draw*s.avatar*.75*s.fade;c.lineWidth=2;c.strokeStyle=i===1?'#ffe3a5':'#d6e8ff';c.beginPath();c.ellipse(450,s.feet-430,270+i*17,245+i*16,-clock*.05,-Math.PI/2,-Math.PI/2+TAU*Math.max(.001,draw));c.stroke();}
 }else{
  // Successful lightning leaves two lit meridians, then fades after the reveal.
  const charge=ease((sec-7.6)/2.5)*(1-ease((sec-15.2)/1.5));c.globalAlpha=charge*.5*s.fade;c.strokeStyle='#c8e5ff';c.lineWidth=2;
  for(const side of [-1,1]){c.beginPath();c.moveTo(450,s.feet-70);c.bezierCurveTo(450+side*70,s.feet-110,450+side*110,s.feet-240,450+side*35,s.feet-320);c.stroke();}
  for(let i=0;i<6;i++){const age=sec-(7.6+i*.44),a=clamp(age/.6),strength=Math.sin(a*Math.PI);if(strength<=0)continue;glow(c,450,s.feet-145,38,'#d8efff',strength*.4);ring(c,450,s.feet-145,12+a*65,6+a*32,'#d9e9ff88',2);}
 }
 c.restore();
}
export function drawHoaThanAwakening(scene,c,e,t,H){
 const s=hoaThanState((t-e.start)/e.duration,H,scene.motion!==false),sec=s.seconds,clock=s.motion?sec:0,light=scene.budget?.level==='light',old=scene.playerIndex?.get(e.user)||scene.players?.find(p=>p.id===e.user)||e.visualFrom||e.visualTo,from=e.visualFrom||{...old,realm:4},to=e.visualTo||{...old,realm:5},p=s.revealed?to:from;
 c.save();const bg=c.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#030918');bg.addColorStop(.5,'#101c38');bg.addColorStop(1,'#050f20');c.fillStyle=bg;c.fillRect(0,0,900,H);drawAscensionStageBackdrop(scene,c,H,{clock:t-e.start,ritual:true,color:'#9bcfff',feet:s.feet}); // 4/11: thiên đài
 const v=qiVariant(e),kq=qiRemap(s.k,14.4/17.6),origin={x:450,y:s.feet-35};setFxPalette(HT_PALETTE);drawQiEnvironment(scene,c,kq,H,origin,true);pushFxCamera(scene,c,kq,v,s.feet);
 const shake=s.motion&&scene.cameraEnabled!==false?s.burst*9:0;c.translate(Math.sin(clock*81)*shake,Math.cos(clock*67)*shake*.5);
 glow(c,450,H*.43,530,'#587fc360',s.up*.7);
 const open=ease(sec/2),im=old?actorImage(scene,from,e):null;
 // The spirit leaves the original body. The same image grows into the effigy.
 const power=s.up*(1-s.merge)*s.fade;spiritChannels(c,s,clock,false);drawQiInflow(scene,c,kq,origin,v.phase);
 if(im){spirit(c,im,450,H*.67-410,1.8+s.avatar*.35,s.avatar*.32*s.fade);spirit(c,im,450,s.spiritY,.3+.32*s.up,power*.8);}
 c.save();c.globalAlpha=open*s.fade;c.strokeStyle='#78bce488';
 for(let i=0;i<4;i++)ring(c,450,s.feet+40,160+i*53,40+i*13,i%2?'#a8d9ed88':'#7a9bdc66',1.5);
 // Six gates build in alternating depth, with a distinct lightning path per gate.
 for(let i=0;i<6;i++){
  const a=i*TAU/6-Math.PI/2+clock*.04,r=275*(1-s.merge*.68),x=450+Math.cos(a)*r,y=s.feet-270+Math.sin(a)*r*.69,g=s.gates[i]*(1-s.merge*.8),strike=clamp(1-Math.abs(sec-(7.6+i*.44))/.26);
  c.globalAlpha=g*s.fade*.8;ring(c,x,y,42*g,80*g,'#adccff',2.5);ring(c,x,y,30*g,66*g,'#ffe3a2',1.5);
  glow(c,x,y,85,'#6eacff66',g*.8);c.strokeStyle='#bce3ff';c.lineWidth=2;
  for(let j=0;j<8;j++){const a=j*TAU/8+clock*.15;c.beginPath();c.moveTo(x+Math.cos(a)*34*g,y+Math.sin(a)*70*g);c.lineTo(x+Math.cos(a)*42*g,y+Math.sin(a)*80*g);c.stroke();}
  c.beginPath();c.moveTo(x,y-38*g);c.lineTo(x+15*g,y);c.lineTo(x,y+38*g);c.lineTo(x-15*g,y);c.closePath();c.stroke();
  if(sec>7){const flow=ease((sec-7)/.8)*(1-s.merge);c.globalAlpha=flow*s.fade*.4;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(450,s.spiritY-180,450,s.spiritY);c.strokeStyle='#93caff';c.lineWidth=6;c.stroke();c.lineWidth=1;c.strokeStyle='#ecf5ff';c.stroke();}
  if(strike>0){c.globalAlpha=strike*(s.motion?1:.3);c.lineWidth=3+strike*3;c.strokeStyle='#e1f0ff';c.beginPath();c.moveTo(x,y-65);for(let j=1;j<=12;j++){const v=j/12;c.lineTo(x+(450-x)*v+Math.sin(j*7+i*3)*18*Math.sin(v*Math.PI),y+(s.feet-140-y)*v);}c.stroke();glow(c,450,s.feet-140,115,'#d6e7ff',strike*.75);}
 }
 c.restore();
 // Awareness ripples become a crown around the awakened effigy, then contract.
 if(s.avatar>0){c.save();c.globalAlpha=s.avatar*s.fade;const r=220*(1-s.merge*.75);for(let i=0;i<3;i++){ring(c,450,s.feet-430,r+i*25,(r+i*25)*.9,i===1?'#ffe1a3aa':'#bcd7ff99',2);}
 const n=light?12:24;for(let i=0;i<n;i++){const a=i*TAU/n+clock*.12;c.beginPath();c.moveTo(450+Math.cos(a)*r,s.feet-430+Math.sin(a)*r*.9);c.lineTo(450+Math.cos(a)*(r+25),s.feet-430+Math.sin(a)*(r+25)*.9);c.strokeStyle='#f3dfa5';c.stroke();}c.restore();}
 if(s.avatar>0&&s.merge<1){c.save();c.globalCompositeOperation='screen';c.globalAlpha=s.avatar*(1-s.merge)*.55;for(let i=0;i<3;i++){c.beginPath();for(let j=0;j<=70;j++){const u=j/70,a=u*TAU*1.5+clock*.9+i*TAU/3,r=130+Math.sin(u*Math.PI)*80,x=450+Math.cos(a)*r,y=s.feet+30-u*560;j?c.lineTo(x,y):c.moveTo(x,y);}c.strokeStyle=i===1?'#ffe2a9':'#92ceff';c.lineWidth=i===1?2:4;c.stroke();}c.restore();}
 // Energy travels from the six gates into the SAME descending spirit.
 if(sec>6.8&&sec<14.4){c.save();c.globalCompositeOperation='screen';for(let i=0;i<(light?12:30);i++){const u=(clock*.5+i/30)%1,a=i*2.399,r=(1-u)*340;c.globalAlpha=Math.sin(u*Math.PI)*.75*s.fade;c.fillStyle=i%3?'#adcfff':'#ffe3a3';c.beginPath();c.ellipse(450+Math.cos(a)*r,s.spiritY+Math.sin(a)*r*.5,2,7,Math.atan2(-Math.sin(a)*.5,-Math.cos(a)),0,TAU);c.fill();}c.restore();}
 drawQiAura(scene,c,kq,origin,s.feet);
 if(old){const image=actorImage(scene,p,e);scene.targets=[{id:p.id,player:p,x:450,y:s.feet,scale:4.2}];if(image)c.drawImage(image,130,s.feet-590);else scene.drawPlayer(c,p,450,s.feet,0);}
 spiritChannels(c,s,clock,true);
 if(s.merge>0&&!s.revealed)glow(c,450,s.feet-140,80+s.merge*80,'#dceaff',s.merge*.8);
 // One impact, followed by six propagating pressure waves rather than repeated flashes.
 if(sec>=14.4){const reduced=s.motion?1:.25;glow(c,450,s.feet-180,180+s.burst*330,'#d7e9ff',s.burst*.8*reduced);for(let i=0;i<6;i++){const u=clamp((sec-14.4-i*.12)/1.7);if(u<=0||u>=1)continue;c.save();c.globalAlpha=(1-u)*(.8-i*.08)*reduced;ring(c,450,i%2?s.feet+40:s.feet-180,50+ease(u)*620,(50+ease(u)*620)*(i%2?.26:.8),i%2?'#ffe5aa':'#b9d8ff',5*(1-u)+1);c.restore();}}
 drawQiCompression(c,kq,origin);drawQiImpact(scene,c,kq,H,origin,s.feet);
 c.restore();drawQiMotes(scene,c,kq,H);drawQiVignette(c,kq,H);
 c.restore();
 const ui={k:s.k,realm:5,phase:s.revealed?'reveal':sec<2?'still':sec<4.4?'spirit':sec<7.6?'gates':sec<10.5?'thunder':sec<12.8?'effigy':'merge',revealed:s.revealed,color:'#c2dcff',title:'Hóa Thần',subtitle:'Thần Lôi Tẩy Tủy',name:String(e.name||'Đạo hữu').normalize('NFC'),label:'',detail:'',shake};
 if(scene.onRitualFrame)scene.onRitualFrame(ui);else{c.textAlign='center';c.font='600 26px Arial';c.fillStyle='#e1ecff';c.fillText(ui.name,450,H*.17);if(s.revealed){c.font='700 44px Arial';c.fillText('HÓA THẦN',450,H*.22);}}
 return ui;
}
