// Xem thử màn kết thúc Tọa Kỵ Bí Cảnh (châu rơi vào avatar) không cần server: ?n=40
import {syncMountRealm,drawMountRealm} from './mount-realm.js';
const q=new URLSearchParams(location.search),n=+(q.get('n')||40),canvas=document.getElementById('c'),c=canvas.getContext('2d');
const members=Array.from({length:n},(_,i)=>({id:'u'+i,name:'Đạo hữu '+i,x:450+Math.cos(i*2.4)*Math.sqrt(i/n)*300,y:650+Math.sin(i*2.4)*Math.sqrt(i/n)*180}));
const rows=members.map((m,i)=>({id:m.id,common:1,vip:i%7===0?1:0,divine:i===3?1:0}));
const scene={canvas,motion:true,stateServerNow:Date.now(),stateReceivedAt:performance.now()};
const state={mountRealm:{id:'p',phase:'finished',members,top:members.slice(0,5).map((m,i)=>({id:m.id,name:m.name,dmg:900-i*50})),results:{rows,tamed:true,top:members.slice(0,3).map(m=>({name:m.name,bossDmg:300})),rewarded:n},mobs:[],fx:[],gifts:[]}};
syncMountRealm(scene,state);
function frame(t){drawMountRealm(scene,c,t,1600);requestAnimationFrame(frame);}requestAnimationFrame(frame);
