import {makeSurface} from './performance.js';
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>1-(1-clamp(x))**3;
export function spiritGiftProfile(value){value=Number(value);if(!Number.isFinite(value)||value<500)return null;
 return {dragons:value<700?0:value<1500?1:2,phoenixes:value<700?1:value<1000?0:value<1500?1:value<2000?0:value<3000?1:2,dragonColor:value<1000?1:value<1500?2:0,phoenixColor:value<700||value>=2000?0:1,scale:value>=10000?1.2:value>=3000?1.1:1};}
export function sliceSpiritAtlas(im,rows,factory=makeSurface,size=256){const w=im.naturalWidth||im.width,h=im.naturalHeight||im.height;return Array.from({length:rows*3},(_,i)=>{const f=factory(size,size),cuts=rows===3?[0,.378,.634,1]:[0,.5,1],row=Math.floor(i/3),sy=cuts[row]*h,sh=(cuts[row+1]-cuts[row])*h;f?.getContext('2d').drawImage(im,i%3*w/3,sy,w/3,sh,2,2,size-4,size-4);return f;});}
export function loadSpiritBeasts(scene){if(scene.spiritBeasts||scene.spiritLoading||scene.spiritRetry>Date.now()||typeof Image==='undefined')return;scene.spiritLoading=true;Promise.all([['dragon',3],['phoenix',2]].map(([name,rows])=>new Promise((resolve,reject)=>{let im=new Image();im.onload=()=>{const a=sliceSpiritAtlas(im,rows);im=null;resolve(a);};im.onerror=reject;im.src='/assets/gift-beasts-v1/'+name+'.png';}))).then(([dragon,phoenix])=>{scene.spiritBeasts={dragon,phoenix};scene.spiritLoading=false;}).catch(()=>{scene.spiritLoading=false;scene.spiritRetry=Date.now()+15000;});}
function stamp(c,im,x,y,w,h,angle=0,alpha=1){if(!im||alpha<=0)return;c.save();c.globalAlpha*=alpha;c.translate(x,y);c.rotate(angle);c.drawImage(im,-w/2,-h/2,w,h);c.restore();}
export function dragonFlightPoint(a,cx,cy,R,time=0){return {x:cx+Math.cos(a)*R,y:cy+Math.sin(a)*R*.46+Math.sin(a*2.2+time*.001)*R*.075};}
export function drawFlyingDragon(c,art,{x,y,radius=210,phase=.4,time=0,color=2,side=1,scale=1,light=true,alpha=1}={}){
 if(!art?.[color]||!art?.[color+3]||!art?.[color+6])return 0;
 const n=light?14:22,angle=side*(phase*TAU*1.7+.7),step=side*(light?.11:.07),points=Array.from({length:n+2},(_,i)=>dragonFlightPoint(angle-i*step,x,y,radius,time)),width=radius*.26*scale;let draws=0;
 // Tail and overlapping articulated scale segments bend along a continuous curve, head drawn last.
 // Tail art's attachment is at the lower-right root, not its image centre.
 // Anchor that root beneath the last body segment so the cut end stays hidden.
 const tail=points[n],nextTail=points[n-1],tw=width*1.9,th=width*.95;
 c.save();c.globalAlpha*=alpha;c.translate(tail.x,tail.y);c.rotate(Math.atan2(nextTail.y-tail.y,nextTail.x-tail.x));c.drawImage(art[color+6],-tw*.94,-th*.80,tw,th);c.restore();draws++;
 for(let i=n;i>=1;i--){const p=points[i],next=points[i-1],bend=Math.atan2(next.y-p.y,next.x-p.x),taper=.32+.68*(1-i/n);stamp(c,art[color+3],p.x,p.y,width*1.45,width*taper,bend,alpha);draws++;}
 const head=points[0],neck=points[1],rot=Math.atan2(head.y-neck.y,head.x-neck.x);stamp(c,art[color],head.x,head.y,width*3,width*2.4,rot,alpha);draws++;
 return draws;
}
export function phoenixFlightPose(phase,time,x,y,R,side=1){const a=phase*TAU*1.25*side,flap=Math.sin(time*.008+side);return {x:x+Math.sin(a)*R,y:y+Math.cos(a)*R*.30,bank:Math.sin(a)*.25,span:.45+.55*(.5+.5*flap),wingAngle:flap*.23};}
export function drawFlyingPhoenix(c,art,{x,y,radius=200,phase=.4,time=0,color=0,scale=1,side=1,alpha=1}={}){
 const row=color*3;if(!art?.[row]||!art?.[row+1]||!art?.[row+2])return 0;const p=phoenixFlightPose(phase,time,x,y,radius,side),size=165*scale;
 c.save();c.globalAlpha*=alpha;c.translate(p.x,p.y);c.rotate(p.bank);
 // Separate wings pivot at shoulders and foreshorten through each flap; body and tail follow after wings.
 for(const sign of [-1,1]){c.save();c.translate(sign*size*.12,-size*.16);c.rotate(sign*p.wingAngle);c.scale(p.span,1);const wing=art[row+(sign<0?1:2)],w=size*.95,h=size*1.05;c.drawImage(wing,sign<0?-w:-w*.08,-h*.93,w,h);c.restore();}
 const bands=5,im=art[row];for(let i=0;i<bands;i++){const shift=Math.sin(time*.007-i*.7)*size*.025*(i/bands);c.drawImage(im,0,i*im.height/bands,im.width,im.height/bands,-size*.42+shift,-size*.45+i*size*1.4/bands,size*.84,size*1.4/bands+1);}
 c.restore();return 7;
}
export function drawSpiritGift(c,value,k,p,H,{art=null,time=0,light=true,motion=true,mode='solo'}={}){
 const profile=spiritGiftProfile(value);if(!profile||!art||k<0||k>1)return 0;const phase=motion?k:.45,clock=motion?time:0,fade=clamp(Math.min(phase/.13,(1-phase)/.16));if(!fade)return 0;
 const compact=mode!=='solo',radius=(mode==='race'?95:mode==='duel'?135:225)*profile.scale,x=p.x,y=mode==='solo'?Math.max(H*.28,p.y-230):p.y-(mode==='race'?65:110),enter=1-ease(phase/.2),leave=ease((phase-.82)/.18),travel=enter-leave;let draws=0;
 c.save();c.globalAlpha*=fade;
 for(let i=0;i<profile.dragons;i++){const side=i?-1:1;draws+=drawFlyingDragon(c,art.dragon,{x:x+travel*side*(compact?180:600),y:y-enter*(compact?80:260)-leave*H*.22+(i?55:0),radius:radius*(i?.83:1),phase:phase+i*.32,time:clock,color:i?2:profile.dragonColor,side,scale:compact?.8:1.3,light,alpha:i?.85:1});}
 for(let i=0;i<profile.phoenixes;i++){const side=i?-1:1;draws+=drawFlyingPhoenix(c,art.phoenix,{x:x-travel*side*(compact?200:650),y:y-(compact?10:100)+(i?95:0)-leave*H*.2,radius:radius*(i?.8:1.05),phase:phase+i*.28,time:clock+i*90,color:i?1:profile.phoenixColor,scale:(compact?.64:1.15)*profile.scale,side,alpha:i?.85:1});}
 // One expanding landing ring at the swoop's closest approach; remains behind all player bodies.
 if(phase>.28&&phase<.52){const u=(phase-.28)/.24;c.globalAlpha*=1-u;c.strokeStyle=value>=1500?'#ffe7a8':'#d5f2ff';c.lineWidth=5*(1-u)+1;c.beginPath();c.ellipse(x,p.y+35,30+u*radius*1.7,12+u*radius*.42,0,0,TAU);c.stroke();}
 c.restore();return draws;
}
