import {makeSurface,QUALITY} from './performance.js';
export function sliceFishAtlas(im,factory=makeSurface){const w=im.naturalWidth||im.width,h=im.naturalHeight||im.height,out=[];for(let i=0;i<6;i++){const f=factory(128,128);if(!f)continue;f.getContext('2d').drawImage(im,i%3*w/3,Math.floor(i/3)*h/2,w/3,h/2,2,2,124,124);out.push(f);}return out;}
export function loadFish(scene){if(scene.fishSprites||scene.fishLoading||scene.fishRetry>Date.now()||typeof Image==='undefined')return;scene.fishLoading=true;let im=new Image();im.onload=()=>{scene.fishSprites=sliceFishAtlas(im);scene.fishLoading=false;scene.environmentLayers?.clear();im=null;};im.onerror=()=>{scene.fishLoading=false;scene.fishRetry=Date.now()+15000;};im.src='/assets/worlds-v2/fish-atlas.png';}
export function floatingTargets(scene,players,H,t){
 const visible=players.slice(0,scene.budget?.config?.seats??QUALITY.light.seats),count=visible.length;
 const slots=[[.32,.40],[.68,.43],[.2,.55],[.5,.56],[.8,.57],[.33,.69],[.67,.71],[.5,.76]];
 const cols=count<=16?4:6,rows=Math.ceil(count/cols);
 const scale=count<=2?2.2:count<=8?1.65:Math.max(.65,Math.min(1.25,H*.4/Math.max(1,rows-1)/155));
 const targets=visible.map((p,i)=>{
   const row=Math.floor(i/cols),col=i%cols,n=Math.min(cols,count-row*cols);
   const [x,y]=count<=8?slots[i]:[.5+(col-(n-1)/2)*.78/cols,.4+row*.4/Math.max(1,rows-1)];
   const bob=scene.motion?Math.sin(t*.00065+i*2)*12:0;
   return {id:p.id,player:p,x:x*900+(scene.motion?Math.sin(t*.0003+i)*6:0),y:y*H+bob,scale,lift:0,baseY:y*H};
 });
 const half=450*.96/Math.max(1,scene.zoom||1),reach=Math.max(1,...targets.map(a=>Math.abs(a.x-450))),fit=Math.min(1,Math.max(.4,(half-45*scale)/reach));
 for(const a of targets)a.x=450+(a.x-450)*fit;return targets;
}
function fish(c,im,x,y,w,phase,flip,alpha){c.save();c.globalAlpha=alpha;c.translate(x,y);c.scale(flip?-1:1,1);c.rotate(Math.sin(phase)*.025);if(im){c.scale(1+Math.sin(phase*2)*.025,1);c.drawImage(im,-w/2,-w/2,w,w);}else{c.fillStyle='#7bdcda';c.beginPath();c.ellipse(0,0,w*.25,w*.1,0,0,Math.PI*2);c.fill();c.beginPath();c.moveTo(-w*.2,0);c.lineTo(-w*.4,-w*.14);c.lineTo(-w*.4,w*.14);c.fill();}c.restore();}
export function drawWorldAmbience(scene,c,t,layer){const kind=scene.environment?.ambience;if(!kind||scene.worldLife?.environment===false)return;const H=scene.height,time=scene.motion?t:0,light=scene.budget?.level==='light';c.save();
 if(layer==='back'){
  if(kind==='sect'){
   for(const x of [42,858]){const y=H*.35,a=.055+(scene.motion?Math.sin(time*.003+x)*.012:0),g=c.createRadialGradient(x,y,0,x,y,65);g.addColorStop(0,'rgba(255,197,105,'+a+')');g.addColorStop(1,'#ffbc6000');c.fillStyle=g;c.fillRect(x-65,y-65,130,130);}
  }else if(kind==='underwater'){
   // Soft shafts and bounded caustic strokes; fish stay behind every player.
   c.fillStyle='#8ae8f20a';for(let i=0;i<4;i++){const x=70+i*250+Math.sin(time*.00013+i)*30;c.beginPath();c.moveTo(x,0);c.lineTo(x+30,0);c.lineTo(x+180,H);c.lineTo(x-70,H);c.fill();}
   const count=light?7:11;for(let i=0;i<count;i++){const flip=i%2===1,speed=10+(i%4)*5,u=((time*.001*speed+i*163)%(1150))/1150,x=flip?1020-u*1150:-130+u*1150,y=H*(.15+(i%5)*.13)+Math.sin(time*.00055+i)*22,w=i%6===3?145:i%6===4?100:60+(i%3)*17;fish(c,scene.fishSprites?.[i%6],x,y,w,time*.003+i,flip,i<4?.45:.72);}
   c.strokeStyle='#bafaff18';c.lineWidth=1.4;for(let i=0;i<(light?8:14);i++){const x=60+(i*139)%800,y=H*.68+(i%4)*H*.08;c.beginPath();c.moveTo(x-45,y);c.bezierCurveTo(x-20,y+Math.sin(time*.001+i)*12,x+15,y-10,x+55,y+4);c.stroke();}
  }else if(kind==='dungeon'){
   for(let i=0;i<4;i++){const x=i%2?820:80,y=H*(.22+Math.floor(i/2)*.2),a=.05+Math.sin(time*.003+i)*.015,g=c.createRadialGradient(x,y,0,x,y,95);g.addColorStop(0,'rgba(255,172,66,'+a+')');g.addColorStop(1,'#ffad4000');c.fillStyle=g;c.fillRect(x-95,y-95,190,190);}
   c.fillStyle='#b9dfff60';for(let i=0;i<(light?12:22);i++){const x=(i*127+time*.006)%900,y=(i*233+time*.003)%H;c.globalAlpha=.18+.18*Math.sin(time*.001+i);c.fillRect(x,y,1.6,1.6);}
  }else if(kind==='jade'){
   for(let i=0;i<3;i++){const x=((i*340+time*.009)%1250)-160,y=H*(.22+i*.19),g=c.createRadialGradient(x,y,0,x,y,170);g.addColorStop(0,'#c9fff510');g.addColorStop(1,'#c9fff500');c.save();c.translate(x,y);c.scale(1,.2);c.translate(-x,-y);c.fillStyle=g;c.fillRect(x-170,y-170,340,340);c.restore();}
   c.fillStyle='#d7fff39a';for(let i=0;i<(light?8:15);i++){const a=time*.00025+i*2.399;c.globalAlpha=.3+Math.sin(a)*.2;c.fillRect(450+Math.cos(a)*(150+i*14),H*.45+Math.sin(a)*H*.23,2,2);}
  }else if(kind==='cosmos'){
   for(let i=0;i<(light?35:65);i++){c.globalAlpha=.25+.55*(.5+.5*Math.sin(time*.0007+i*7));c.fillStyle=i%4?'#dceaff':'#e3c3ff';const x=(i*173+time*.001*(1+i%3))%900,y=(i*313+time*.0015)%H,r=i%9===0?2:1;c.fillRect(x,y,r,r);}
   c.globalAlpha=.6;c.strokeStyle='#cfdbff';c.lineWidth=1.3;for(let i=0;i<2;i++){const u=((time*.000045+i*.51)%1),x=1100-u*1300,y=H*.1+u*H*.22;c.globalAlpha=Math.sin(u*Math.PI)*.45;c.beginPath();c.moveTo(x,y);c.lineTo(x+60,y-25);c.stroke();}
  }
 }else if(layer==='front'){
  if(kind==='underwater'){c.strokeStyle='#d0fdff80';c.lineWidth=1;for(let i=0;i<(light?8:15);i++){const u=(time*.00007+i*.137)%1,x=40+(i*173)%820+Math.sin(time*.0009+i)*7,y=(1-u)*H;c.globalAlpha=Math.sin(u*Math.PI)*.45;c.beginPath();c.arc(x,y,2+i%4,0,Math.PI*2);c.stroke();}}
  else if(kind==='dungeon'){c.globalAlpha=.13;c.fillStyle='#95a8bc';for(let i=0;i<3;i++){const x=((i*350+time*.012)%1200)-150;c.save();c.translate(x,H*.8+i*30);c.scale(1,.07);c.beginPath();c.arc(0,0,145,0,Math.PI*2);c.fill();c.restore();}}
 }else if(layer==='screen'){const g=c.createRadialGradient(450,H*.5,H*.25,450,H*.5,H*.75);g.addColorStop(0,'#00152200');g.addColorStop(1,kind==='underwater'?'#001a3555':'#03091955');c.fillStyle=g;c.fillRect(0,0,900,H);}
 c.restore();}
