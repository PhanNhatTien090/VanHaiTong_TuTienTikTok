import {loadSeaArt,drawSeaBody,drawSeaAdornment,SEA_SKIN} from './sea-dragon-heir.js';
const canvas=document.querySelector('canvas'),c=canvas.getContext('2d'),p={id:'preview-sea',gender:'nam',realm:1,skinChoice:SEA_SKIN,rewardSkins:[SEA_SKIN]},scene={motion:true,budget:{level:'balanced'},characterFrames:{clear(){}}};let stand=1;
scene.animator={pose:()=>({stand})};loadSeaArt(scene);
document.querySelector('#male').onclick=()=>p.gender='nam';document.querySelector('#female').onclick=()=>p.gender='nu';document.querySelector('#pose').onclick=()=>stand=1-stand;
const bg=new Image();bg.src='/assets/worlds-v2/underwater.png';
function frame(t){canvas.width=540;canvas.height=960;c.setTransform(.6,0,0,.6,0,0);if(bg.complete&&bg.naturalWidth)c.drawImage(bg,0,0,900,1600);else{c.fillStyle='#07182c';c.fillRect(0,0,900,1600);}c.fillStyle='#03112655';c.fillRect(0,0,900,1600);
 const target={id:p.id,player:p,x:450,y:1210,scale:6.4};drawSeaAdornment(scene,c,target,t,'back');c.save();c.translate(target.x,target.y);c.scale(target.scale,target.scale);drawSeaBody(scene,c,p,{stand},t);c.restore();drawSeaAdornment(scene,c,target,t,'front');
 c.textAlign='center';c.fillStyle='#d9faff';c.font='bold 36px Arial';c.fillText('LONG DUỆ HẢI LAM',450,140);c.font='22px Arial';c.fillText('Long lân · Ngân tuyến · Tiểu long hộ thân',450,185);requestAnimationFrame(frame);}
requestAnimationFrame(frame);
