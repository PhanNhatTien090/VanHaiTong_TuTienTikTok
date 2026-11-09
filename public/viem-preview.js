import {loadViemArt,drawViemBody,drawViemAdornment,VIEM_SKIN,VIEM_BLADES} from './viem-ton.js';
import {drawTransform,TRANSFORM_MS,REVEAL_AT} from './transform-fx.js';
const canvas=document.querySelector('canvas'),c=canvas.getContext('2d'),p={id:'preview-viem',gender:'nam',realm:1,skinChoice:VIEM_SKIN,rewardSkins:[VIEM_SKIN],equipped:VIEM_BLADES},scene={motion:true,budget:{level:'balanced'},characterFrames:{clear(){}}};let stand=1,descent=-1;
loadViemArt(scene);
document.querySelector('#pose').onclick=()=>stand=1-stand;
document.querySelector('#orb').onclick=()=>{p.equipped=p.equipped?null:VIEM_BLADES;};document.querySelector('#descent').onclick=()=>descent=performance.now();
const bg=new Image();bg.src='/assets/worlds-v2/jade-palace.png';
function frame(t){canvas.width=540;canvas.height=960;c.setTransform(.6,0,0,.6,0,0);if(bg.complete&&bg.naturalWidth)c.drawImage(bg,0,0,900,1600);else{c.fillStyle='#140402';c.fillRect(0,0,900,1600);}c.fillStyle='#14040233';c.fillRect(0,0,900,1600);
 const k=descent<0?-1:(t-descent)/TRANSFORM_MS,ev={transform:'viemton'},pos={x:450,y:1210,scale:6.4},show=k<0||k>=1||k>REVEAL_AT;if(k>=0&&k<1)drawTransform(c,ev,t,k,pos,1600,'back');
 const target={id:p.id,player:p,x:450,y:1210,scale:6.4,pose:{stand}};if(show)drawViemAdornment(scene,c,target,t,'back');c.save();c.translate(target.x,target.y);c.scale(target.scale,target.scale);if(show)drawViemBody(scene,c,p,{stand},t);c.restore();if(show)drawViemAdornment(scene,c,target,t,'front');
 if(k>=0&&k<1)drawTransform(c,ev,t,k,pos,1600,'front');
 c.textAlign='center';c.fillStyle='#ffe6cc';c.font='bold 36px Arial';c.fillText('TẦN MỤC HỎA THẦN',450,140);c.font='22px Arial';c.fillText('300 coin skin · 500 coin thêm Song Đao Liệt Diễm',450,185);requestAnimationFrame(frame);}
requestAnimationFrame(frame);
