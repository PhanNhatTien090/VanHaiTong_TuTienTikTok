import {makeSurface} from './performance.js';
import {TAU,clamp,ease,glow} from './ascension-primitives.js';
function hash(x,y){let n=Math.imul(x,374761393)+Math.imul(y,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;}
function noise(x,y){const a=Math.floor(x),b=Math.floor(y),u=(x-a)*(x-a)*(3-2*(x-a)),v=(y-b)*(y-b)*(3-2*(y-b)),p=hash(a,b)*(1-u)+hash(a+1,b)*u,q=hash(a,b+1)*(1-u)+hash(a+1,b+1)*u;return p*(1-v)+q*v;}
function fbm(x,y){let v=0,w=.54;for(let i=0;i<4;i++){v+=noise(x,y)*w;x=x*2.07+17.1;y=y*2.03+4.3;w*=.49;}return v;}
export function smokeTexture(scene){
 if(scene.cinemaSmoke)return scene.cinemaSmoke;const im=makeSurface(192,192);if(!im)return null;const c=im.getContext('2d'),data=c.createImageData(192,192);
 for(let y=0;y<192;y++)for(let x=0;x<192;x++){const nx=(x-96)/96,ny=(y-96)/96,r=Math.hypot(nx,ny),edge=clamp((1-r)/.35),density=fbm(x*.032,y*.032),lighting=clamp(.5+(fbm(x*.032+.08,y*.032-.08)-density)*9),i=(y*192+x)*4;
  data.data[i]=105+lighting*105;data.data[i+1]=130+lighting*104;data.data[i+2]=155+lighting*95;data.data[i+3]=Math.round(edge*edge*Math.max(0,density-.19)*200);}
 c.putImageData(data,0,0);scene.cinemaSmoke=im;return im;
}
export function smoke(c,im,x,y,size,angle=0,alpha=.5,stretch=1){if(!im||alpha<=0)return;c.save();c.globalAlpha*=alpha;c.translate(x,y);c.rotate(angle);c.drawImage(im,-size*.5,-size*.5*stretch,size,size*stretch);c.restore();}
export function stormClouds(scene,c,H,time,power=1){
 const im=smokeTexture(scene),n=scene.budget?.level==='light'?12:22;c.save();
 for(let i=0;i<n;i++){const a=i*2.399+time*.075*(i%2?1:.7),r=110+i%5*48+Math.sin(time*.34+i)*24,x=450+Math.cos(a)*r,y=H*.36+Math.sin(a)*r*.46;smoke(c,im,x,y,300+i%4*55,a+time*.05,power*(.42+i%3*.12),.7);}
 c.restore();
}
export function filament(c,points,color,alpha=.7,width=1.5){
 if(points.length<2||alpha<=0)return;c.save();c.globalCompositeOperation='screen';
 for(const [w,a]of [[width*8,.035],[width*3,.11],[width,.7]]){c.globalAlpha=alpha*a;c.strokeStyle=color;c.lineWidth=w;c.lineCap='round';c.beginPath();c.moveTo(points[0].x,points[0].y);for(let i=1;i<points.length;i++){const p=points[i-1],q=points[i];c.quadraticCurveTo(p.x,p.y,(p.x+q.x)/2,(p.y+q.y)/2);}c.lineTo(points.at(-1).x,points.at(-1).y);c.stroke();}c.restore();
}
export function organicPortalPath(c,x,y,rx,ry,time=0){c.beginPath();for(let i=0;i<=100;i++){const a=i/100*TAU,r=1+.025*Math.sin(a*3+time*.8)+.014*Math.sin(a*7-time*.6),xx=x+Math.cos(a)*rx*r,yy=y+Math.sin(a)*ry*r;i?c.lineTo(xx,yy):c.moveTo(xx,yy);}c.closePath();}
export function portalRim(scene,c,H,camera,time){
 const open=ease((time-10.1)/1.8),rx=(130+camera.enter*740)*open,ry=(260+camera.enter*1100)*open,x=450,y=H*.43,im=smokeTexture(scene),count=scene.budget?.level==='light'?16:30;
 c.save();c.globalCompositeOperation='screen';
 for(let i=0;i<count;i++){const a=i/count*TAU+time*.045,r=1+Math.sin(a*3+time*.8)*.025,xx=x+Math.cos(a)*rx*r,yy=y+Math.sin(a)*ry*r;
  smoke(c,im,xx,yy,90+camera.enter*160,a+time*.15,.5,.65);const q=1+.012*Math.sin(a*11-time*2);const a2=a+.18,points=[];for(let j=0;j<=8;j++){const b=a+(a2-a)*j/8;points.push({x:x+Math.cos(b)*rx*q,y:y+Math.sin(b)*ry*q});}filament(c,points,i%4?'#b6e7dd':'#ffe6ad',.22,.9);}
 c.restore();return {x,y,rx,ry};
}
export function driftingMists(scene,c,H,time,amount=.4){const im=smokeTexture(scene),n=scene.budget?.level==='light'?5:9;for(let i=0;i<n;i++){const phase=time*.016+i*.19,x=((phase%1)*1300)-200,y=H*(.42+(i%4)*.16);smoke(c,im,x,y,420+i%3*130,time*.015+i,amount,.7);}}
export function filmFinish(c,H,strength=.65){const g=c.createRadialGradient(450,H*.43,200,450,H*.48,H*.63);g.addColorStop(0,'#03081300');g.addColorStop(.65,'#03081308');g.addColorStop(1,`rgba(3,8,19,${strength})`);c.fillStyle=g;c.fillRect(0,0,900,H);}
export function softRelease(scene,c,H,elapsed,feet,motion=true){
 const im=smokeTexture(scene),flash=ease(elapsed/.08)*(1-ease((elapsed-.1)/.55)),expand=ease(elapsed/1.7),opacity=(1-expand)*(motion?1:.25);glow(c,450,feet-150,180+expand*500,'#ecf7db',flash*.68*(motion?1:.25));
 for(let i=0;i<(scene.budget?.level==='light'?12:24);i++){const a=i*2.399,r=40+expand*(300+i%5*70);smoke(c,im,450+Math.cos(a)*r,feet-150+Math.sin(a)*r*.7,100+expand*180,a+elapsed*.2,opacity*.6,.55);}
 c.save();c.globalAlpha=opacity*.45;c.strokeStyle='#f5ead1';for(let i=0;i<24;i++){const a=i*2.399,r=80+expand*600;c.lineWidth=1;c.beginPath();c.moveTo(450+Math.cos(a)*r*.8,feet-150+Math.sin(a)*r*.75);c.lineTo(450+Math.cos(a)*r,feet-150+Math.sin(a)*r*.95);c.stroke();}c.restore();
}
