import {drawDebris} from './impact-debris.js?v=20261120';
// Vân Hải Lôi Đài — lớp hiệu ứng theo HỆ chiêu (15/11/2026): đường bay + nổ khi trúng.
// Mỗi hệ một DÁNG riêng (không chỉ đổi màu). Chỉ path/arc, không shadowBlur, không ảnh → nhẹ GPU.
const TAU=Math.PI*2,clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),ease=k=>1-(1-clamp(k))**3;
export const ARENA_ELEMENT_OF=Object.freeze({
 thunder:'lightning',sevenstars:'lightning',
 flame:'fire',
 frost:'ice',
 dragon:'water',vortex:'water',
 petal:'flower',flowersword:'flower',peachfan:'flower',flowercage:'flower',lotus:'flower',
 stars:'star',stardust:'star',starmirror:'star',stararrow:'star',meteor:'star',celestial:'star',
 slash:'sword',sword:'sword',bamboo:'sword',
 soul:'soul',bell:'gold'
});
export const ARENA_ELEMENT_COLORS=Object.freeze({
 lightning:['#c9b8ff','#ffffff','#7f6bff'],fire:['#ffb24a','#fff1b0','#ff4a2a'],ice:['#a8ecff','#ffffff','#4fb4ff'],
 water:['#6fe0ff','#e6fbff','#2a8cff'],flower:['#ffb3dc','#fff0f7','#ff6fae'],star:['#d6e2ff','#ffffff','#8fa8ff'],
 sword:['#e8fbff','#ffffff','#7fd8ff'],soul:['#c99bff','#f2e6ff','#7a3bff'],gold:['#ffe08a','#fffbe6','#ffb43c']
});
export const arenaElement=tech=>ARENA_ELEMENT_OF[tech]||'sword';
function rng(seed){let s=(seed*2654435761)>>>0||1;return()=>((s=(s*1664525+1013904223)>>>0)/4294967296);}
function bolt(c,x0,y0,x1,y1,r,width,color,jag=26){
 c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.beginPath();c.moveTo(x0,y0);
 const n=7;for(let i=1;i<n;i++){const k=i/n;c.lineTo(x0+(x1-x0)*k+(r()-.5)*jag,y0+(y1-y0)*k+(r()-.5)*jag);}c.lineTo(x1,y1);c.stroke();
}
function petal(c,x,y,s,rot,color){c.save();c.translate(x,y);c.rotate(rot);c.fillStyle=color;c.beginPath();c.ellipse(0,0,s,s*.45,0,0,TAU);c.fill();c.restore();}
function star(c,x,y,r,color){c.fillStyle=color;c.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4,rr=i%2?r*.35:r;c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}c.closePath();c.fill();}

/** Đường bay của chiêu, k 0→1 (0,15–0,6 là lúc bay). */
export function drawElementTrail(c,el,from,to,k,seed=1,{light=false}={}){
 const u=clamp((k-.15)/.45);if(u<=0||u>=1)return;
 const [main,core,deep]=ARENA_ELEMENT_COLORS[el]||ARENA_ELEMENT_COLORS.sword,r=rng(seed),x=from.x+(to.x-from.x)*ease(u),y=from.y+(to.y-from.y)*ease(u)-Math.sin(u*Math.PI)*70;
 c.save();
 if(el==='lightning'){c.globalAlpha=.85;bolt(c,from.x,from.y,x,y,r,light?3:5,main,30);c.globalAlpha=1;bolt(c,from.x,from.y,x,y,rng(seed+1),light?1.5:2,core,18);}
 else if(el==='fire'){for(let i=0;i<(light?6:12);i++){const b=clamp(u-i*.035);const fx=from.x+(to.x-from.x)*ease(b),fy=from.y+(to.y-from.y)*ease(b)-Math.sin(b*Math.PI)*70;c.globalAlpha=(1-i/12)*.8;c.fillStyle=i<3?core:i<7?main:deep;c.beginPath();c.arc(fx,fy,16-i*1.1,0,TAU);c.fill();}}
 else if(el==='ice'){c.globalAlpha=.9;for(let i=0;i<(light?3:5);i++){const off=(i-2)*14,ix=x+off*.3,iy=y+off;c.fillStyle=i===2?core:main;c.beginPath();c.moveTo(ix+26,iy);c.lineTo(ix-14,iy-7);c.lineTo(ix-14,iy+7);c.closePath();c.fill();}}
 else if(el==='water'){c.strokeStyle=main;c.lineWidth=light?5:9;c.globalAlpha=.75;c.beginPath();for(let i=0;i<=20;i++){const b=u*i/20,wx=from.x+(to.x-from.x)*ease(b),wy=from.y+(to.y-from.y)*ease(b)-Math.sin(b*Math.PI)*70+Math.sin(b*18+seed)*12;i?c.lineTo(wx,wy):c.moveTo(wx,wy);}c.stroke();c.strokeStyle=core;c.lineWidth=2;c.stroke();}
 else if(el==='flower'){for(let i=0;i<(light?6:12);i++){const b=clamp(u-i*.03),px=from.x+(to.x-from.x)*ease(b)+(r()-.5)*40,py=from.y+(to.y-from.y)*ease(b)-Math.sin(b*Math.PI)*70+(r()-.5)*40;c.globalAlpha=.85-i*.05;petal(c,px,py,9,b*12+i,i%3?main:core);}}
 else if(el==='star'){c.globalAlpha=.9;star(c,x,y,20,core);for(let i=1;i<(light?4:8);i++){const b=clamp(u-i*.04);star(c,from.x+(to.x-from.x)*ease(b),from.y+(to.y-from.y)*ease(b)-Math.sin(b*Math.PI)*70,9-i,main);}}
 else if(el==='soul'){for(let i=0;i<(light?3:5);i++){const ph=seed+i*1.3,sx=x+Math.cos(u*9+ph)*24,sy=y+Math.sin(u*9+ph)*18;c.globalAlpha=.6;c.fillStyle=i%2?main:deep;c.beginPath();c.arc(sx,sy,10,0,TAU);c.fill();c.globalAlpha=.9;c.fillStyle=core;c.beginPath();c.arc(sx-3,sy-2,2.5,0,TAU);c.arc(sx+3,sy-2,2.5,0,TAU);c.fill();}}
 else if(el==='gold'){c.globalAlpha=.85;c.strokeStyle=main;c.lineWidth=4;c.beginPath();c.arc(x,y,22+8*Math.sin(u*20),0,TAU);c.stroke();c.fillStyle=core;c.beginPath();c.arc(x,y,9,0,TAU);c.fill();}
 else{c.globalAlpha=.9;c.strokeStyle=main;c.lineWidth=light?4:7;c.beginPath();const tx=x-(to.x-from.x)*.12,ty=y-(to.y-from.y)*.12;c.moveTo(tx,ty);c.lineTo(x,y);c.stroke();c.strokeStyle=core;c.lineWidth=2;c.stroke();}
 c.restore();
}
/** Nổ khi trúng, k 0→1 (vẽ từ 0,55 trở đi). power: 1 thường, 2 bạo kích, 3 tuyệt kỹ. */
export function drawElementImpact(c,el,x,y,k,seed=1,{power=1,light=false}={}){
 const u=clamp((k-.55)/.45);if(u<=0||u>=1)return;
 {const [m0,c0]=ARENA_ELEMENT_COLORS[el]||ARENA_ELEMENT_COLORS.sword;drawDebris(c,x,y,u*1.05,{floor:y+120,seed:seed+el.length*3.1,power:1+power*.6,color:m0,hot:c0,scale:.85+.2*power,light});} // 20/11: mảnh vỡ + chớp lõi mỗi đòn trúng
 const [main,core,deep]=ARENA_ELEMENT_COLORS[el]||ARENA_ELEMENT_COLORS.sword,r=rng(seed+7),fade=1-u,R=(50+40*power)*(light?.8:1),n=light?6:power>1?14:10;
 c.save();c.globalAlpha=fade;
 if(el==='lightning'){for(let i=0;i<n/2;i++){const a=r()*TAU;bolt(c,x,y,x+Math.cos(a)*R*(.6+u),y+Math.sin(a)*R*.7*(.6+u),r,3,i%2?core:main,18);}
  if(power>=2&&u<.4){c.globalAlpha=(.4-u)*1.6;bolt(c,x+(r()-.5)*30,y-420,x,y,r,6,core,40);}}
 else if(el==='fire'){c.fillStyle=deep;c.beginPath();c.ellipse(x,y+20,R*(.6+u),R*.25*(.6+u),0,0,TAU);c.fill();for(let i=0;i<n;i++){const a=i/n*TAU+seed,d=R*ease(u)*(0.6+r()*.5);c.fillStyle=i%3?main:core;c.beginPath();c.arc(x+Math.cos(a)*d,y+Math.sin(a)*d*.6-u*40,9*fade+3,0,TAU);c.fill();}}
 else if(el==='ice'){for(let i=0;i<n;i++){const a=i/n*TAU+seed,d=R*ease(u),len=18+power*8;c.strokeStyle=i%2?core:main;c.lineWidth=4;c.beginPath();c.moveTo(x+Math.cos(a)*d*.4,y+Math.sin(a)*d*.3);c.lineTo(x+Math.cos(a)*(d*.4+len),y+Math.sin(a)*(d*.3+len*.7));c.stroke();}c.strokeStyle=main;c.lineWidth=2;c.beginPath();c.ellipse(x,y+30,R*(.5+u),R*.18,0,0,TAU);c.stroke();}
 else if(el==='water'){for(let ring=0;ring<3;ring++){const rr=R*(.4+u*.9)-ring*14;if(rr<=0)continue;c.strokeStyle=ring?main:core;c.lineWidth=5-ring;c.beginPath();c.ellipse(x,y+20,rr,rr*.35,0,0,TAU);c.stroke();}for(let i=0;i<n;i++){const a=-Math.PI*(.15+.7*i/n),d=R*ease(u);c.fillStyle=main;c.beginPath();c.arc(x+Math.cos(a)*d*.8,y+Math.sin(a)*d*.9+u*u*60,4,0,TAU);c.fill();}}
 else if(el==='flower'){for(let i=0;i<n+4;i++){const a=i/(n+4)*TAU+seed,d=R*ease(u)*(.5+r()*.6);petal(c,x+Math.cos(a)*d,y+Math.sin(a)*d*.7+u*30,10,a+u*6,i%3?main:core);}}
 else if(el==='star'){star(c,x,y,R*.5*(1-u*.5),core);for(let i=0;i<n;i++){const a=i/n*TAU+seed,d=R*ease(u);star(c,x+Math.cos(a)*d,y+Math.sin(a)*d*.7,6+power*2,i%2?main:core);}}
 else if(el==='soul'){for(let i=0;i<n;i++){const a=i/n*TAU+seed+u*2,d=R*ease(u)*.8;c.fillStyle=i%2?main:deep;c.beginPath();c.arc(x+Math.cos(a)*d,y+Math.sin(a)*d*.6-u*50,8,0,TAU);c.fill();}c.strokeStyle=deep;c.lineWidth=3;c.beginPath();c.arc(x,y,R*.4*(1+u),0,TAU);c.stroke();}
 else if(el==='gold'){c.strokeStyle=main;c.lineWidth=6*fade+1;c.beginPath();c.arc(x,y,R*(.3+u*.9),0,TAU);c.stroke();c.strokeStyle=core;c.lineWidth=2;c.beginPath();c.arc(x,y,R*(.2+u*.6),0,TAU);c.stroke();for(let i=0;i<8;i++){const a=i/8*TAU;c.beginPath();c.moveTo(x+Math.cos(a)*R*.3,y+Math.sin(a)*R*.3);c.lineTo(x+Math.cos(a)*R*(.5+u),y+Math.sin(a)*R*(.5+u));c.stroke();}}
 else{for(let i=0;i<(power>1?3:2);i++){const a=-.6+i*.6+(r()-.5)*.3,len=R*1.6;c.strokeStyle=i%2?main:core;c.lineWidth=(power>1?7:5)*fade+1;c.beginPath();c.moveTo(x-Math.cos(a)*len*.5,y-Math.sin(a)*len*.5);c.lineTo(x+Math.cos(a)*len*.5*ease(u*2),y+Math.sin(a)*len*.5*ease(u*2));c.stroke();}}
 c.restore();
}
