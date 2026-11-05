import {makeSurface} from './performance.js';
import {loadSpiritBeasts,drawFlyingDragon} from './gift-spirit-beasts.js';
export const SEA_SKIN='sea-dragon-heir';
export const seaWorn=p=>p?.skinChoice===SEA_SKIN&&p.rewardSkins?.includes(SEA_SKIN);
export function sliceSeaSkin(im,factory=makeSurface){
 const w=im.naturalWidth||im.width,h=im.naturalHeight||im.height;
 return Array.from({length:4},(_,i)=>{
  const top=i<2?0:h*.54,sh=i<2?h*.54:h*.46,sw=w/2,raw=factory(Math.ceil(sw),Math.ceil(sh));if(!raw)return null;
  const q=raw.getContext('2d');q.drawImage(im,i%2*sw,top,sw,sh,0,0,raw.width,raw.height);
  const bytes=q.getImageData(0,0,raw.width,raw.height).data;let x0=raw.width,y0=raw.height,x1=0,y1=0;
  for(let y=0;y<raw.height;y++)for(let x=0;x<raw.width;x++)if(bytes[(y*raw.width+x)*4+3]>35){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
  const f=factory(384,512);if(!f)return null;const cw=x1-x0+5,ch=y1-y0+5,k=Math.min(370/cw,498/ch);f.getContext('2d').drawImage(raw,x0-2,y0-2,cw,ch,(384-cw*k)/2,506-ch*k,cw*k,ch*k);return f;
 });
}
export function loadSeaArt(scene){
 loadSpiritBeasts(scene);if(scene.seaSkinArt||scene.seaSkinLoading||typeof Image==='undefined')return;
 scene.seaSkinLoading=true;const im=new Image();im.onload=()=>{scene.seaSkinArt=sliceSeaSkin(im);scene.characterFrames?.clear();};im.onerror=()=>scene.seaSkinLoading=false;im.src='/assets/sea-dragon-heir-v1/skin-v2.png';
}
function poseFrame(c,im,top,height,clock,alpha){
 if(!im||alpha<=.001)return;c.save();c.globalAlpha*=alpha;const bands=12;
 for(let i=0;i<bands;i++){const u=i/bands,shift=Math.sin(clock*.0018-u*2.2)*1.1*u*u;c.drawImage(im,0,i*im.height/bands,im.width,im.height/bands,-57+shift,top+i*height/bands,114,height/bands+.25);}
 c.restore();
}
export function drawSeaBody(scene,c,p,pose,t){
 if(!seaWorn(p))return false;loadSeaArt(scene);if(!scene.seaSkinArt)return false;
 const gender=p.gender==='nu'?1:0,stand=Math.max(0,Math.min(1,pose.stand||0)),clock=scene.motion===false?0:t;
 c.save();c.translate(0,pose.lift||0);c.rotate((pose.lean||0)*.5);
 poseFrame(c,scene.seaSkinArt[gender+2],-91,120,clock,1-stand);poseFrame(c,scene.seaSkinArt[gender],-116,144,clock,stand);c.restore();return true;
}
export function seaDragonPosition(t,seed=0,motion=true){const a=(motion?t*.00115:0)+seed;return {a,x:Math.cos(a)*49,y:-49+Math.sin(a)*20,z:Math.sin(a),size:.13};}
export function drawSeaAdornment(scene,c,target,t,layer='front'){
 const p=target.player;if(!seaWorn(p))return;loadSeaArt(scene);const sc=target.scale||1.4,clock=scene.motion===false?0:t,seed=[...String(p.id)].reduce((n,ch)=>(n*31+ch.charCodeAt(0))>>>0,0)%1000,
 pose=scene.animator?.pose?.(p,clock,scene.motion)||{},stand=pose.stand||0,up=-stand*13,orbit=seaDragonPosition(t,seed*.01,scene.motion!==false);
 c.save();c.translate(target.x,target.y);c.scale(sc,sc);c.translate(0,(pose.lift||0)+up);
 // Draw one miniature articulated dragon, only in its correct depth layer.
 if((orbit.z>0)===(layer==='front')){
  c.save();c.translate(orbit.x,orbit.y);c.rotate(Math.cos(orbit.a)*.12);c.scale(.14,.14);c.filter='hue-rotate(310deg) saturate(.85)';
  drawFlyingDragon(c,scene.spiritBeasts?.dragon,{x:0,y:0,radius:100,phase:orbit.a/(Math.PI*2),time:clock,color:1,side:1,scale:1.15,light:true,alpha:1});c.restore();
 }
 if(layer==='front'){
  // Shimmer follows the embroidered neckline and robe edges, never opaque lines across the face.
  c.save();c.globalCompositeOperation='screen';
  for(let side of [-1,1])for(let i=0;i<7;i++){
   const u=i/6,x=side*(8+u*19),y=-63+u*78-stand*9,tw=Math.max(0,Math.sin(clock*.0028-u*7+side+seed));
   c.globalAlpha=.18+tw*.62;c.strokeStyle=tw>.8?'#e4fcff':'#4ccfff';c.lineWidth=.6;c.beginPath();c.moveTo(x-1.8,y);c.lineTo(x+1.8,y);c.moveTo(x,y-1.8);c.lineTo(x,y+1.8);c.stroke();
  }
  for(let i=0;i<8;i++){const a=i*2.399+seed,r=16+i%3*7,tw=Math.max(0,Math.sin(clock*.003+i*1.9));c.globalAlpha=tw*.65;c.fillStyle='#b9f3ff';c.fillRect(Math.cos(a)*r,-45+Math.sin(a)*25,1.1,1.1);}
  c.restore();
 }
 c.restore();
}
export function drawSeaVisitor(scene,c,e,t,H){
 if(e?.kind!=='hailam'||Date.now()>=e.endsAt)return false;loadSeaArt(scene);const im=scene.seaSkinArt?.[0];if(!im)return true;
 const p={id:'sea-visitor',gender:'nam',realm:1,skinChoice:SEA_SKIN,rewardSkins:[SEA_SKIN]},target={id:p.id,player:p,x:450,y:H*.46,scale:2.1};
 drawSeaAdornment(scene,c,target,t,'back');c.save();c.translate(target.x,target.y);c.scale(target.scale,target.scale);poseFrame(c,im,-116,144,scene.motion?t:0,1);c.restore();drawSeaAdornment(scene,c,target,t,'front');return true;
}
