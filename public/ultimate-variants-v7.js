// V7: six NEW authored ultimate families alongside V6's thunder/sword/fire/water/ice/yinyang.
// Actual technique IDs are mapped to distinct silhouettes, not just a recolored laser.
import {makeSurface} from './performance.js';
const TAU=Math.PI*2,clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),ease=x=>1-(1-clamp(x))**3;
const specs=Object.freeze({
 void:{name:'Hư Không Vạn Hồn',asset:'void-rift.svg',color:'#ce9dff'},
 stars:{name:'Thất Tinh Diệt Thần Trận',asset:'seven-stars.svg',color:'#d2dbff'},
 soul:{name:'Vạn Hồn U Minh',asset:'soul-phantom.svg',color:'#bb84ff'},
 lotus:{name:'Cửu Liên Thánh Quang',asset:'holy-lotus.svg',color:'#ffe8ba'},
 bell:{name:'Kim Chung Bất Diệt',asset:'celestial-bell.svg',color:'#ffe1a3'},
 meteor:{name:'Tinh Không Diệt Thế',asset:'meteor-judgment.svg',color:'#b9ceff'},
 blossom:{name:'Bách Hoa Kiếm Vực',asset:'blossom-sword.svg',color:'#ffb8e1'}
});
export const V7_VARIANTS=Object.freeze({
 soul:'soul','dora-door':'void',sevenstars:'stars',stars:'stars',
 petal:'blossom',flowersword:'blossom',peachfan:'blossom',flowercage:'blossom',
 lotus:'lotus',bell:'bell',meteor:'meteor',stardust:'meteor',starmirror:'meteor'
});
export function v7SkillSpec(id){
 const group=V7_VARIANTS[id];
 return group?{id:group,...specs[group]}:null;
}
export function prewarmVariantArt(scene,match){
 if(!match?.id||!scene)return;
 if(scene.v7VariantMatch===match.id)return;
 scene.v7VariantMatch=match.id;scene.v7VariantArt={};scene.v7VariantErrors=new Set();
 if(typeof Image==='undefined')return;
 for(const group of new Set([match.a,match.b].map(id=>V7_VARIANTS[match.techniques?.[id]?.id]).filter(Boolean))){
  const img=new Image();img.decoding='async';
  img.onload=()=>{
   if(scene.v7VariantMatch!==match.id||!img.naturalWidth)return;
   // Rasterize complex SVG once, up to 20 seconds BEFORE the finisher.
   // A 256px offscreen glyph is ample for crowded mode; High gets 384px.
   const sz=scene.budget?.crowded||scene.budget?.level==='light'?256:384;
   const frame=makeSurface(sz,sz);
   if(frame)try{
    frame.getContext('2d').drawImage(img,0,0,sz,sz);
    frame.naturalWidth=sz;frame.naturalHeight=sz;
    scene.v7VariantArt[group]=frame;return;
   }catch{}
   scene.v7VariantArt[group]=img;
  };
  img.onerror=()=>{if(scene.v7VariantMatch===match.id)scene.v7VariantErrors.add(group);};
  img.src='/assets/v7/'+specs[group].asset;
 }
}
function stroke(c,x,y,x2,y2,color,w,alpha){
 c.globalAlpha=alpha;c.strokeStyle=color;c.lineWidth=w;
 c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke();
}
function circle(c,x,y,r,color,w,alpha,aspect=1){
 c.globalAlpha=alpha;c.strokeStyle=color;c.lineWidth=w;
 c.beginPath();c.ellipse(x,y,r,r*aspect,0,0,TAU);c.stroke();
}
function glyph(c,im,x,y,r,k,alpha=1){
 if(!im?.naturalWidth)return false;
 c.save();c.translate(x,y);c.rotate(k);c.globalAlpha=alpha;
 c.drawImage(im,-r,-r,r*2,r*2);c.restore();return true;
}
function bolt(c,x,y,r,a,len,color,alpha=1){
 const ex=x+Math.cos(a)*(r+len),ey=y+Math.sin(a)*(r+len)*.7;
 stroke(c,x+Math.cos(a)*r,y+Math.sin(a)*r*.7,ex,ey,color,3,alpha);
}
function petals(c,x,y,n,scale,color,rot,alpha){
 c.globalAlpha=alpha;c.fillStyle=color;
 for(let i=0;i<n;i++){
  const a=i*TAU/n+rot,xx=x+Math.cos(a)*scale*.58,yy=y+Math.sin(a)*scale*.58;
  c.save();c.translate(xx,yy);c.rotate(a);
  c.beginPath();c.ellipse(0,-scale*.16,scale*.075,scale*.20,0,0,TAU);c.fill();c.restore();
 }
}
export function drawV7Variant(scene,c,t,actor,target,tech,k,{counter=false}={}){
 const spec=v7SkillSpec(tech?.id);
 if(!spec||scene.v7Overdrive===false||scene.cinematicV2===false||!actor||!target||k<0||k>1)return false;
 const low=!!(scene.budget?.crowded||scene.budget?.pressured||scene.budget?.level==='light'||scene.fps>0&&scene.fps<19);
 const n=low?6:16,scale=counter?.67:1,color=spec.color,rot=scene.motion===false?0:t*.00045;
 const ready=k<.56,u=ready?clamp(k/.56):clamp((k-.56)/.44);
 const sx=actor.x,sy=actor.y-162,tx=target.x,ty=target.y-34;
 const x=ready?sx:sx+(tx-sx)*ease(u),y=ready?sy:sy+(ty-sy)*ease(u)-Math.sin(u*Math.PI)*(counter?55:120);
 const radius=(ready?60+u*160:155+u*85)*scale*(low?.78:1);
 const im=scene.v7VariantArt?.[spec.id];
 c.save();c.lineCap='round';c.lineJoin='round';
 // Layer 1 - strong, dark center prevents bloom from washing out important HUD.
 c.globalAlpha=ready?.14:u*.13;c.fillStyle='#08091a';
 c.beginPath();c.ellipse(x,y,radius*.72,radius*.55,0,0,TAU);c.fill();
 // Every variant gets one original SVG seal/portrait, predecoded per match.
 glyph(c,im,x,y,radius,rot*(ready?1:3),ready?.30+u*.60:Math.max(.22,1-u*.73));
 if(ready){
  circle(c,sx,actor.y+16,radius*.76,color,3,.33+.5*u,.26);
  circle(c,x,y,radius, '#fcf6e5',2,.26+.46*u);
  if(spec.id==='lotus'||spec.id==='blossom'){
   petals(c,x,y,low?6:12,radius,color,rot,.30+.48*u);
  }else if(spec.id==='stars'||spec.id==='meteor'){
   for(let i=0;i<n;i++){
    const a=i*TAU/n+rot,xx=x+Math.cos(a)*radius,yy=y+Math.sin(a)*radius*.55;
    circle(c,xx,yy,i%3===0?8:4,color,2,.32+.5*u);
    if(i%3===0)stroke(c,xx,yy,xx+Math.cos(a)*radius*.25,yy+Math.sin(a)*radius*.25,'#ffffff',1.8,.62*u);
   }
  }else if(spec.id==='bell'){
   circle(c,x,y,radius*.73,'#fff4cb',6,.41+.48*u,.94);
   circle(c,x,y,radius*.55,color,3,.39+.48*u,.94);
  }else{
   for(let i=0;i<n;i++){
    const a=i*TAU/n+rot;
    bolt(c,x,y,radius*.56,a,radius*.29,i%3?'#fbecff':color,.27+.52*u);
   }
  }
 }else{
  // Release silhouettes: meteor shards / transparent bell / flower crescents / soul rifts.
  const fade=Math.max(0,Math.min(1,(1-u)/.18));
  if(spec.id==='lotus'){
   petals(c,x,y,low?7:15,80+u*220,color,rot*2,fade*.70);
   circle(c,tx,ty,radius*.75,color,5,fade,.4);
  }else if(spec.id==='bell'){
   circle(c,tx,ty,radius*1.35,'#fce5a0',low?4:8,.40+fade*.43,1.1);
   circle(c,tx,ty,radius*.94,'#fff9d6',3,fade,.96);
  }else if(spec.id==='stars'||spec.id==='meteor'){
   for(let i=0;i<n;i++){
    const a=i*TAU/n+rot*.4,xx=x+Math.cos(a)*(radius*.7),yy=y+Math.sin(a)*(radius*.65);
    const nextX=tx+Math.cos(a)*u*67,nextY=ty+Math.sin(a)*u*67;
    stroke(c,xx,yy,nextX,nextY,i%3?'#baceff':'#fff7ce',i%3?3:6,fade*.80);
   }
   circle(c,tx,ty,radius*.72,color,4,fade,.4);
  }else if(spec.id==='blossom'){
   for(let i=0;i<n;i++){
    const a=i*TAU/n+rot,dist=radius*.7;
    stroke(c,x+Math.cos(a)*dist,y+Math.sin(a)*dist,
     tx+Math.cos(a+1)*dist,ty+Math.sin(a+1)*dist,color,i%3?2:5,fade*.70);
   }
   petals(c,tx,ty,low?6:11,150*scale,color,rot,fade*.76);
  }else {
   for(let i=0;i<n;i++){
    const a=i*TAU/n+rot;
    bolt(c,x,y,radius*.4,a,radius*.62,i%2?'#e3c8ff':color,fade*.65);
   }
   circle(c,tx,ty,radius*.95,color,5,fade,.65);
  }
  if(u>.25){
   const hit=clamp((u-.25)/.62),ring=65+hit*280*scale;
   circle(c,tx,ty,ring,'#fff6df',3,(1-hit)*fade,.43);
   circle(c,tx,ty,ring*.7,color,5,(1-hit)*fade,.32);
  }
 }
 c.restore();return true;
}
