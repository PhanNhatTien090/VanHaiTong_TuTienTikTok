import {loadKhuyArt,drawKhuyBody,drawKhuyAdornment,KHUY_SKIN,KHUY_DRAGON} from './khuy-niet.js';
import {drawTransform,TRANSFORM_MS,REVEAL_AT} from './transform-fx.js';
const canvas=document.querySelector('canvas'),c=canvas.getContext('2d'),p={id:'preview-khuy',gender:'nam',realm:1,skinChoice:KHUY_SKIN,rewardSkins:[KHUY_SKIN],equipped:KHUY_DRAGON},scene={motion:true,budget:{level:'balanced'},characterFrames:{clear(){}}};let stand=1,descent=-1;
scene.animator={pose:()=>({stand})};loadKhuyArt(scene);
document.querySelector('#male').onclick=()=>p.gender='nam';document.querySelector('#female').onclick=()=>p.gender='nu';document.querySelector('#pose').onclick=()=>stand=1-stand;
document.querySelector('#dragon').onclick=()=>{p.equipped=p.equipped?null:KHUY_DRAGON;};document.querySelector('#descent').onclick=()=>descent=performance.now();
const bg=new Image();bg.src='/assets/worlds-v2/jade-palace.png';
function frame(t){canvas.width=540;canvas.height=960;c.setTransform(.6,0,0,.6,0,0);if(bg.complete&&bg.naturalWidth)c.drawImage(bg,0,0,900,1600);else{c.fillStyle='#14061f';c.fillRect(0,0,900,1600);}c.fillStyle='#0c041433';c.fillRect(0,0,900,1600);
 const k=descent<0?-1:(t-descent)/TRANSFORM_MS,ev={transform:'khuyniet'},pos={x:450,y:1210,scale:6.4},show=k<0||k>=1||k>REVEAL_AT;if(k>=0&&k<1)drawTransform(c,ev,t,k,pos,1600,'back');
 const target={id:p.id,player:p,x:450,y:1210,scale:6.4};if(show)drawKhuyAdornment(scene,c,target,t,'back');c.save();c.translate(target.x,target.y);c.scale(target.scale,target.scale);if(show)drawKhuyBody(scene,c,p,{stand},t);c.restore();if(show)drawKhuyAdornment(scene,c,target,t,'front');
 if(k>=0&&k<1)drawTransform(c,ev,t,k,pos,1600,'front');
 c.textAlign='center';c.fillStyle='#eadcff';c.font='bold 36px Arial';c.fillText('KHUY NIẾT LÔI TÔN',450,140);c.font='22px Arial';c.fillText('300 coin skin · 500 coin thêm Tử Lôi Long',450,185);requestAnimationFrame(frame);}
requestAnimationFrame(frame);
