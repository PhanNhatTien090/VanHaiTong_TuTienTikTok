import {loadTudoArt,drawTudoBody,drawTudoAdornment,TUDO_SKIN,TUDO_BLADE} from './tudo-ma-ton.js';
const canvas=document.querySelector('canvas'),c=canvas.getContext('2d'),p={id:'preview-tudo',gender:'nam',realm:1,skinChoice:TUDO_SKIN,rewardSkins:[TUDO_SKIN],equipped:TUDO_BLADE},scene={motion:true,budget:{level:'balanced'},characterFrames:{clear(){}}};let stand=1;
scene.animator={pose:()=>({stand})};loadTudoArt(scene);
document.querySelector('#male').onclick=()=>p.gender='nam';document.querySelector('#female').onclick=()=>p.gender='nu';document.querySelector('#pose').onclick=()=>stand=1-stand;
document.querySelector('#blade').onclick=()=>{p.skinChoice=p.skinChoice?null:TUDO_SKIN;};
const bg=new Image();bg.src='/assets/worlds-v2/jade-palace.png';
function frame(t){canvas.width=540;canvas.height=960;c.setTransform(.6,0,0,.6,0,0);if(bg.complete&&bg.naturalWidth)c.drawImage(bg,0,0,900,1600);else{c.fillStyle='#1a070b';c.fillRect(0,0,900,1600);}c.fillStyle='#1a020833';c.fillRect(0,0,900,1600);
 const target={id:p.id,player:p,x:450,y:1210,scale:6.4};drawTudoAdornment(scene,c,target,t,'back');c.save();c.translate(target.x,target.y);c.scale(target.scale,target.scale);drawTudoBody(scene,c,p,{stand},t);c.restore();drawTudoAdornment(scene,c,target,t,'front');
 c.textAlign='center';c.fillStyle='#ffd7c8';c.font='bold 36px Arial';c.fillText('TƯ ĐỒ MA TÔN',450,140);c.font='22px Arial';c.fillText('Huyết Sát Ma Đao · Ma diễm · Phù văn huyết nguyệt',450,185);requestAnimationFrame(frame);}
requestAnimationFrame(frame);
