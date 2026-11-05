import {makeSurface} from './performance.js';
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x)),mix=(a,b,u)=>a+(b-a)*u;
export function impactChoreography(realm,k,motion=true){
 const r=Math.max(1,Math.min(18,realm||1)),absorb=clamp((k-.49)/.215),rushStart=r===18?.49:.57,rushEnd=r===18?.635:.735,rush=clamp((k-rushStart)/.135),strike=clamp((k-.62)/.085);
 return {realm:r,absorb,phoenix:r>=10&&r<=13,dragon:r>=6&&r<=9||r===18,palm:r>=14,crack:r>=6,dragonSize:motion?mix(110,1250,rush*rush):0,palmSize:motion?mix(140,1040,strike*strike):0,flightProgress:rush,flightAlpha:motion&&k>=rushStart&&k<rushEnd?clamp((k-rushStart)/.02)*clamp((rushEnd-k)/.03):0,phoenixSize:mix(480,8,absorb**1.7),crackAlpha:motion&&k>=.705?clamp((k-.705)/.018)*clamp((.94-k)/.12):0};
}
export function sliceImpactArt(im,factory=makeSurface,size=640){const w=im.naturalWidth||im.width,h=im.naturalHeight||im.height,frames=[];for(let i=0;i<2;i++){const f=factory(size,size);if(!f)continue;const c=f.getContext('2d');c.imageSmoothingQuality='high';c.drawImage(im,i*w/2,0,w/2,h,10,10,size-20,size-20);frames.push(f);}return frames;}
export function loadImpactArt(scene){if(scene.ascensionImpactArt||scene.ascensionImpactLoading||scene.ascensionImpactRetry>Date.now()||typeof Image==='undefined')return;scene.ascensionImpactLoading=true;let im=new Image();im.onload=()=>{scene.ascensionImpactArt=sliceImpactArt(im);scene.ascensionImpactLoading=false;im=null;};im.onerror=()=>{scene.ascensionImpactLoading=false;scene.ascensionImpactRetry=Date.now()+15000;};im.src='/assets/breakthrough-v3/dragon-palm-impact.png';}
function image(c,im,x,y,size,alpha,angle=0){if(!im||alpha<=0)return;c.save();c.globalAlpha*=clamp(alpha);c.translate(x,y);c.rotate(angle);c.drawImage(im,-size/2,-size/2,size,size);c.restore();}
function glow(c,x,y,r,color,alpha){if(r<=0||alpha<=0)return;c.save();c.globalAlpha*=clamp(alpha);const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'#fffde8');g.addColorStop(.14,color);g.addColorStop(1,color+'00');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);c.restore();}
function cracks(c,x,y,k,realm,H,light,color){
 const p=impactChoreography(realm,k),reach=clamp((k-.705)/.055),n=Math.min(light?9:14,4+Math.floor(realm/2)),fade=p.crackAlpha;if(!fade)return;c.save();c.globalAlpha*=fade;
 for(let i=0;i<n;i++){const angle=i*TAU/n+.14*Math.sin(i*17),length=(i%3===0?H*.6:430+80*Math.sin(i*7))*reach;let px=x,py=y;c.strokeStyle=i%2?'#c1fbff':color;c.lineWidth=i%3===0?2.4:1.2;c.beginPath();c.moveTo(x,y);for(let j=1;j<=6;j++){const d=j/6*length,offset=Math.sin(i*13+j*9)*15*(j/6),nx=x+Math.cos(angle)*d+Math.sin(angle)*offset,ny=y+Math.sin(angle)*d-Math.cos(angle)*offset;c.lineTo(nx,ny);if(j===3||j===5){const ba=angle+(i%2?1:-1)*.5,bl=length*.12;c.moveTo(nx+Math.cos(ba)*bl,ny+Math.sin(ba)*bl);c.lineTo(nx,ny);}px=nx;py=ny;}c.stroke();}
 const u=clamp((k-.72)/.18),shards=light?7:12;c.lineWidth=1;for(let i=0;i<shards;i++){const a=i*2.399,d=85+u*u*(180+i*15);c.save();c.translate(x+Math.cos(a)*d,y+Math.sin(a)*d*.75);c.rotate(a+u*(i%2?1:-1));c.fillStyle='#c9f5ff18';c.strokeStyle='#c6eaff80';c.beginPath();c.moveTo(-10,-18);c.lineTo(14,-4);c.lineTo(4,24);c.closePath();c.fill();c.stroke();c.restore();}c.restore();
}
export function drawAscensionImpact(scene,c,{k,realm,color},clock,H,layer='back'){
 const motion=scene.motion!==false,p=impactChoreography(realm,k,motion),x=450,chest=H*.62-200,light=scene.budget?.level==='light',u=p.absorb;
 c.save();
 if(layer==='back'){
  // One synchronized contraction instead of endlessly orbiting particles.
  if(k>=.49&&k<.71){const n=light?12:Math.min(32,14+realm),baseRadius=360+realm*4;for(let i=0;i<n;i++){const a=i*TAU/n+u*3.4,lag=(i%3)*.035,v=clamp((u-lag)/(1-lag)),r=baseRadius*(1-v)**1.5,px=x+Math.cos(a)*r,py=chest+Math.sin(a)*r*.75;c.globalAlpha=Math.sin(Math.PI*clamp(v*.85+.08))*.85;c.strokeStyle=i%3?color:'#fff6d6';c.lineWidth=2+v*3;c.beginPath();c.moveTo(px+Math.cos(a-.3)*32*(1-v),py+Math.sin(a-.3)*24*(1-v));c.quadraticCurveTo(px+Math.sin(a)*20,py-Math.cos(a)*20,px,py);c.stroke();}}
 }else{
  c.globalAlpha=1;
  if(p.phoenix&&k>=.49&&k<.706){const v=motion?u:1,im=scene.breakthroughSpectacle?.[2],px=mix(x-260,x,v)+Math.sin(v*Math.PI)*180,py=mix(chest-370,chest,v);image(c,im,px,py,p.phoenixSize,Math.sin(Math.PI*clamp((k-.49)/.22))*.95,motion?.3*(1-v):0);if(motion)for(let i=1;i<=3;i++){const t=clamp(v-i*.025);image(c,im,mix(x-260,x,t)+Math.sin(t*Math.PI)*180,mix(chest-370,chest,t),mix(480,8,t**1.7),.10/i,.3*(1-t));}}
  if(k>=.49&&k<.765){const hit=clamp(1-Math.abs(k-.707)/.035),radius=12+u*36+hit*(100+realm*4);glow(c,x,chest,radius,color,clamp((k-.49)/.06)*(.35+hit*.65));}
  if(p.dragon&&p.flightAlpha>0){const posY=mix(chest-170,H*.49,p.flightProgress);image(c,scene.ascensionImpactArt?.[0],x,posY,p.dragonSize,p.flightAlpha,.035*Math.sin(clock*.002));}
  if(p.palm&&k>=.62&&k<.755){const strike=clamp((k-.62)/.085),alpha=clamp((k-.62)/.025)*clamp((.755-k)/.035);image(c,scene.ascensionImpactArt?.[1],mix(x+140,x,strike),mix(chest-200,H*.48,strike),p.palmSize,motion?alpha:0,-.1*(1-strike));}
  if(p.crack&&motion)cracks(c,x,H*.49,k,realm,H,light,color);
 }
 c.restore();return p;
}
