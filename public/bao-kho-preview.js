// Xem thử Thiên Công Bảo Khố không cần server: ?mode=board|card|gold|limited|finished&sec=N&id=<món>
import {syncBaoKho,drawBaoKho,drawGoldReveal,drawLimitedReveal} from './bao-kho.js';
import {BAO_ITEMS} from './phap-bao-data.js';
const q=new URLSearchParams(location.search),mode=q.get('mode')||'board',sec=+(q.get('sec')||1);
const canvas=document.getElementById('c'),c=canvas.getContext('2d');
const N=Date.now(),names=['Chán Bố Mà Ra Đường','Công Tài','BOY HAI MÁ','Mẹ em Gạo','Hoàng Thượng','Tiểu Long Nữ'];
const lim=BAO_ITEMS.filter(x=>x.tier===6).map((x,i)=>({id:x.id,owner:i===2?'Công Tài':i===7?'Mẹ em Gạo':null}));
const log=[{k:1,u:'u1',name:names[1],t:0,id:null,s:0,p4:3,p5:41},{k:2,u:'u2',name:names[2],t:4,id:'s4-phien',s:1,p4:10,p5:22},{k:3,u:'u0',name:names[0],t:0,id:null,s:0,p4:6,p5:70}];
const e={id:'bao-demo',phase:mode==='finished'?'finished':'open',startedAt:N-60000,endsAt:N+190000,podiumUntil:N+20000,pulls:137,log:[],top:names.slice(0,5).map((n,i)=>({id:'u'+i,name:n,items:6-i,pulls:30-i*4})),reveals:[],limited:lim,season:1};
const scene={canvas,motion:true,budget:{level:'full'},playerIndex:new Map(),stateServerNow:N,stateReceivedAt:performance.now()};
syncBaoKho(scene,{baoKho:e,giftArt:{}});e.log=log;syncBaoKho(scene,{baoKho:{...e}});
if(mode!=='card')scene.baoFx.cards=[];
const t0=performance.now();let n=0;
function frame(){n++;c.setTransform(1,0,0,1,0,0);c.fillStyle='#000';c.fillRect(0,0,900,1600);
 const t=performance.now();
 if(mode==='gold')drawGoldReveal(scene,c,t,1600,{x:{k:7,u:'u0',name:names[0],t:5,id:q.get('id')||'s5-chung',s:2},age:sec*1000,ms:4500,k:sec/4.5});
 else if(mode==='limited')drawLimitedReveal(scene,c,t,1600,{x:{k:8,u:'u0',name:names[0],t:6,id:q.get('id')||'L01-tru-tien',s:1},age:sec*1000,ms:8000,k:sec/8},e);
 else{if(mode==='card'&&scene.baoFx.cards[0])scene.baoFx.cards[0].t0=t-sec*1000;scene.baoFx.banners.forEach((b,i)=>b.t0=t-400-i*300);drawBaoKho(scene,c,t,1600);}
 if(n<12)setTimeout(frame,200);}
frame();
