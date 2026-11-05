import {makeSurface} from './performance.js';
import {TAU,clamp,ease,glow} from './ascension-primitives.js';
import {driftingMists,smokeTexture,smoke,filmFinish} from './cinema-atmosphere.js';
export function immortalCamera(seconds,motion=true){
 const enter=ease((seconds-11)/5.4),settle=ease((seconds-16.4)/1.6);
 return {enter,settle,zoom:motion?1+enter*8:1,travel:motion?enter*18:0,bank:motion?Math.sin(enter*Math.PI)*.045:0,speed:motion?Math.sin(enter*Math.PI)*enter:0,inside:seconds>=16.4};
}
export function projectImmortal(x,y,z,travel,H=1600){const depth=Math.max(.35,z-travel),scale=280/depth;return {x:450+x*scale,y:H*.43+y*scale,scale,depth};}
export function prepareImmortalWorld(scene){
 if(!scene.immortalWorldArt&&!scene.immortalWorldLoading&&typeof Image!=='undefined'){
  scene.immortalWorldLoading=true;const im=new Image();im.onload=()=>{scene.immortalWorldArt=im;};im.onerror=()=>{};im.src='/assets/chan-tien-cinema-v2/immortal-world.png';
 }
}
function nearLandscape(scene,image,H){
 if(scene.immortalNearLayers?.image===image&&scene.immortalNearLayers.H===H)return scene.immortalNearLayers.layers;
 const layers=[],iw=image.naturalWidth||image.width,ih=image.naturalHeight||image.height,s=Math.max(900/iw,H/ih)*1.035;
 for(const side of [-1,1]){const f=makeSurface(450,Math.round(H/2));if(!f)continue;const q=f.getContext('2d');q.scale(.5,.5);q.drawImage(image,(900-iw*s)/2,(H-ih*s)/2,iw*s,ih*s);q.globalCompositeOperation='destination-in';const g=q.createLinearGradient(side<0?0:900,0,side<0?430:470,0);g.addColorStop(0,'#ffffffff');g.addColorStop(.5,'#ffffffdd');g.addColorStop(1,'#ffffff00');q.fillStyle=g;q.fillRect(0,0,900,H);const bottom=q.createLinearGradient(0,H*.2,0,H*.8);bottom.addColorStop(0,'#ffffff00');bottom.addColorStop(1,'#ffffffff');const vertical=makeSurface(450,Math.round(H/2)),v=vertical.getContext('2d');v.scale(.5,.5);v.fillStyle=bottom;v.fillRect(0,0,900,H);q.drawImage(vertical,0,0,900,H);layers.push({side,image:f});}
 scene.immortalNearLayers={image,H,layers};return layers;
}
export function drawImmortalWorld(scene,c,H,camera,{clock=0,light=false}={}){
 prepareImmortalWorld(scene);const image=scene.immortalWorldArt;
 const sky=c.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#0b1d35');sky.addColorStop(.5,'#536f83');sky.addColorStop(1,'#183348');c.fillStyle=sky;c.fillRect(0,0,900,H);
 if(image){const iw=image.naturalWidth||image.width,ih=image.naturalHeight||image.height,scale=Math.max(900/iw,H/ih)*(1.035+camera.enter*.22),drift=Math.sin(camera.enter*Math.PI)*12,x=(900-iw*scale)/2+drift,y=(H-ih*scale)/2;
  c.drawImage(image,x,y,iw*scale,ih*scale);
  if(!light&&camera.speed>0){for(const layer of nearLandscape(scene,image,H)){c.save();c.globalAlpha=camera.speed*.22;c.translate(450+layer.side*camera.enter*38,H*.43);c.scale(1+camera.enter*.22,1+camera.enter*.22);c.drawImage(layer.image,-450,-H*.43,900,H);c.restore();}}
 }
 const dawn=ease((clock-17)/7),arrival=ease((clock-15)/2);if(arrival>0){c.save();c.globalAlpha=arrival*(1-dawn)*.36;c.fillStyle='#0a1238';c.fillRect(0,0,900,H);c.restore();}
 driftingMists(scene,c,H,clock,image?.28:.55);
 // Near vapour has a different speed and size from the far painting. No duplicate model buildings.
 const im=smokeTexture(scene);for(let i=0;i<(light?4:7);i++){const phase=(camera.travel*.05+i*.173)%1,side=i%2?1:-1,depth=1-phase,r=100+phase*500,x=450+side*r,y=H*.52+phase*H*.6;smoke(c,im,x,y,180+phase*470,clock*.02+i,.24*(1-depth*.5),.8);}
 if(camera.speed>0){c.save();c.globalAlpha=camera.speed*.38;c.strokeStyle='#dbede6';for(let i=0;i<(light?14:30);i++){const a=i*2.399,phase=(clock*.8+i*.619)%1,r=280+phase*560,stretch=10+camera.speed*110;c.lineWidth=.6+phase;c.beginPath();c.moveTo(450+Math.cos(a)*r,H*.43+Math.sin(a)*r*1.5);c.lineTo(450+Math.cos(a)*(r+stretch),H*.43+Math.sin(a)*(r+stretch)*1.5);c.stroke();}c.restore();}
 filmFinish(c,H,.45);
}
