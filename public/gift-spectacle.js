import {qiVariant} from './qi-impact.js';
import {drawSpiritGift} from './gift-spirit-beasts.js';
import {makeSurface} from './performance.js';
const TAU=Math.PI*2,clamp=v=>Math.max(0,Math.min(1,v)),ease=v=>1-(1-clamp(v))**3;
export const GIFT_SPECTACLES=Object.freeze([
 {min:500,name:'Xích Phượng Khai Thiên',cell:0,color:'#ff536c',duration:8000,size:440,swords:12,particles:12,shake:3},
 {min:700,name:'Tử Lôi Long Vũ',cell:1,color:'#c38aff',duration:9000,size:490,swords:16,particles:16,shake:4},
 {min:1000,name:'Long Phượng Kiếm Trận',cell:2,color:'#8ceaff',duration:10000,size:550,swords:20,particles:20,shake:5},
 {min:1500,name:'Song Long Diệt Thế',cell:3,color:'#ff965b',duration:11000,size:610,swords:24,particles:24,shake:6},
 {min:2000,name:'Long Phượng Đế Uy',cell:4,color:'#ffd37b',duration:12000,size:680,swords:28,particles:28,shake:7},
 {min:3000,name:'Song Long Song Phượng',cell:4,color:'#ffe4a3',duration:13000,size:730,swords:32,particles:32,shake:8},
 {min:10000,name:'Vạn Giới Long Phượng',cell:4,color:'#fff0c1',duration:14000,size:780,swords:36,particles:36,shake:9}
]);
export function giftSpectacleTier(e){const coin=Number(e.coins),count=Math.max(1,Number(e.count)||1);if(!Number.isFinite(coin)||coin<=0||!Number.isFinite(count))return null;const value=coin*count;let tier=null;for(const t of GIFT_SPECTACLES)if(value>=t.min)tier={...t,value};return tier;}
export function sliceSpectacleAtlas(im,factory=makeSurface,size=320){const w=im.naturalWidth||im.width,h=im.naturalHeight||im.height;return Array.from({length:6},(_,i)=>{const frame=factory(size,size);frame?.getContext('2d').drawImage(im,i%3*w/3,Math.floor(i/3)*h/2,w/3,h/2,2,2,size-4,size-4);return frame;});}
export function loadGiftSpectacle(scene){if(scene.giftSpectacleArt||scene.giftSpectacleLoading||scene.giftSpectacleRetry>Date.now()||typeof Image==='undefined')return;scene.giftSpectacleLoading=true;Promise.all(['formations','impacts'].map(name=>new Promise((resolve,reject)=>{let im=new Image();im.onload=()=>{const cells=sliceSpectacleAtlas(im);im=null;resolve(cells);};im.onerror=reject;im.src='/assets/gift-spectacle-v1/'+name+'.png';}))).then(([formations,impacts])=>{scene.giftSpectacleArt={formations,impacts};scene.giftSpectacleLoading=false;}).catch(()=>{scene.giftSpectacleLoading=false;scene.giftSpectacleRetry=Date.now()+15000;});}
const envelope=(k,center,width)=>clamp(1-Math.abs(k-center)/width);
export function spectacleShake(e,t,motion=true){const q=giftSpectacleTier(e);if(!q||!motion)return {x:0,y:0};const age=t-e.start,k=age/(e.duration||q.duration);if(k<0||k>1)return {x:0,y:0};const amp=q.shake*(envelope(k,.34,.045)+.65*envelope(k,.68,.035));if(!amp)return {x:0,y:0};return {x:Math.sin(age*.046)*amp,y:Math.sin(age*.061+1)*amp*.65};}
function sprite(c,im,x,y,w,h=w,angle=0,alpha=1){if(!im||alpha<=0)return;c.save();c.globalAlpha*=alpha;c.translate(x,y);c.rotate(angle);c.drawImage(im,-w/2,-h/2,w,h);c.restore();}
export function drawGiftSpectacle(c,e,t,k,p,H,{light=true,art=null,layer='back',motion=true,beasts=null}={}){
 const q=giftSpectacleTier(e);if(!q||k<0||k>1)return false;
 // Four continuous phases: gather -> summon -> impact -> disperse. No frame-triggered spawning.
 const time=(motion?(t-e.start):q.duration*.45)+qiVariant(e).phase*1600,phase=motion?k:.45,fade=clamp(Math.min(phase/.10,(1-phase)/.14)),open=ease(phase/.30),impact=clamp((phase-.32)/.23),second=clamp((phase-.66)/.22),exit=ease((phase-.82)/.18),x=p.x,cy=Math.max(H*.25,p.y-170),size=q.size*open*(1-exit*.18),color=q.color,rank=GIFT_SPECTACLES.findIndex(v=>v.min===q.min),f=art?.formations,b=art?.impacts;
 c.save();c.globalAlpha*=fade;
 if(layer==='back'){
  c.fillStyle='#08031170';c.fillRect(0,0,900,H);
  // The painted smoke breathes, rolls and widens; the formation is never a static pop-in.
  sprite(c,b?.[5],x,cy+35,size*1.25,size*(.85+Math.sin(time*.001)*.06),-time*.00013,.38);
  sprite(c,f?.[q.cell],x+(rank===3?260*(1-open):0),cy+(rank===3?-180*(1-open)+Math.sin(time*.0016)*14:Math.sin(time*.0012)*7),size,size,rank===3?Math.sin(time*.0008)*.045:time*(rank===2?-.00023:.00013),beasts?.dragon?.length ? .26 : .90);
  if(rank===1||rank>=4){c.strokeStyle=color+'b0';c.lineWidth=rank===1?2:3;for(let i=0;i<(light?4:7);i++){const a=i*TAU/(light?4:7)+Math.sin(time*.002+i)*.08,r=size*.42;c.beginPath();for(let j=0;j<6;j++){const u=j/5,rr=r*(1-u*.55),px=x+Math.cos(a)*rr+Math.sin(time*.006+j*9+i)*9,py=cy+Math.sin(a)*rr+(j%2?9:-9);j?c.lineTo(px,py):c.moveTo(px,py);}c.stroke();}}
  if(!beasts&&rank>=3)for(const side of [-1,1])sprite(c,f?.[q.cell],x+side*(size*.38+Math.sin(time*.001)*12),cy+25,size*.48,size*.48,-side*time*.00035,.3);
  drawSpiritGift(c,q.value,phase,p,H,{art:beasts,time,light,motion});
  // Ground shock seal follows the actor, scaled in perspective.
  sprite(c,f?.[q.cell],x,p.y+65,size*(.66+Math.sin(time*.0014)*.025),size*.18,-time*.00017,.65);
  const n=light?3:5;c.strokeStyle=color+'65';c.lineWidth=2;for(let i=0;i<n;i++){const a=i*TAU/n+time*.0006,r=size*.43;c.beginPath();c.moveTo(x+Math.cos(a)*r,cy+Math.sin(a)*r);c.lineTo(x+Math.cos(a+.2)*r*.63,cy+Math.sin(a+.2)*r*.63);c.stroke();}
  if(!f?.[q.cell]){c.strokeStyle=color;c.lineWidth=4;c.beginPath();c.arc(x,cy,size*.45,0,TAU);c.stroke();}
 }else{
  // Impact image expands rapidly, twists and dissolves rather than sitting on the avatar.
  for(const [u,m]of [[impact,1],[second,.8]])if(u>0&&u<1){const s=size*(.30+ease(u)*1.2)*m;sprite(c,b?.[q.cell],x,cy+55,s,s,-u*.38,(1-u)*(beasts?.dragon?.length ? .3 : .9));c.strokeStyle=color;c.globalAlpha=fade*(1-u)*.8;c.lineWidth=6*(1-u)+1;c.beginPath();c.ellipse(x,p.y+50,40+u*size*.8,14+u*size*.22,0,0,TAU);c.stroke();c.globalAlpha=fade;}
  const count=light?Math.min(beasts?12:36,q.swords):Math.min(beasts?20:54,Math.round(q.swords*1.5)),waves=rank>=4?3:rank>=2?2:1;
  for(let i=0;i<count;i++){
   const delay=i/count*.23,wave=i%waves,travel=clamp((phase-.20-delay-wave*.12)/.16);if(travel<=0||travel>=1)continue;
   const lane=((i*137)%1000)/1000,fromX=90+lane*720,fromY=-100-(i%3)*70,toX=x+(lane-.5)*(230+rank*22),toY=p.y+35;
   const sx=fromX+(toX-fromX)*travel,sy=fromY+(toY-fromY)*travel,angle=Math.atan2(toY-fromY,toX-fromX)-Math.PI/2;
   c.strokeStyle=color+'70';c.lineWidth=2;c.beginPath();c.moveTo(sx,sy);c.lineTo(sx-(toX-fromX)*.12,sy-(toY-fromY)*.12);c.stroke();
   if(f?.[5])sprite(c,f[5],sx,sy,35+rank*3,100+rank*8,angle,Math.sin(travel*Math.PI));else{c.fillStyle=color;c.fillRect(sx-2,sy-40,4,70);}
  }
  // Bounded debris moves radially out of the impact, then falls and fades.
  if(phase>.32){const n=light?q.particles:Math.round(q.particles*1.5),u=clamp((phase-.32)/.60);c.fillStyle=color;for(let i=0;i<n;i++){const a=i*2.399,dist=(70+(i%7)*33)*ease(u),xx=x+Math.cos(a)*dist,yy=cy+Math.sin(a)*dist*.6+u*u*150;c.globalAlpha=fade*(1-u);c.save();c.translate(xx,yy);c.rotate(a+u*7);c.fillRect(-2,-5,3+i%3,8+i%4);c.restore();}}
  // One soft localized impact bloom; no repeated fullscreen flashes.
  const pulse=envelope(phase,.34,.035);if(pulse){c.globalAlpha=fade*pulse*.20;const g=c.createRadialGradient(x,cy,0,x,cy,size*.6);g.addColorStop(0,'#fff4de');g.addColorStop(1,color+'00');c.fillStyle=g;c.fillRect(x-size,cy-size,size*2,size*2);}
 }
 c.restore();return true;
}
