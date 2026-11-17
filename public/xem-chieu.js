// 18/11/2026: trang XEM CHIÊU cho chủ game — chọn màn chiếu riêng, tự chạy lặp lại (không cần sự kiện thật, không có nhân vật).
// Mở: http://127.0.0.1:4317/xem-chieu.html  (script tách file riêng vì CSP của server chặn script viết trong HTML).
import {drawCutFull} from './skill-cutscene.js?v=20261118';
import {drawTowerCut} from './tower-cutscene.js';
import {drawGoldReveal,drawLimitedReveal} from './bao-kho.js';
import {drawVipCut,drawDivineCut} from './mount-cut.js';
import {BAO_ITEMS} from './phap-bao-data.js';
import {BAO_ULTS} from './bao-ults.js';
import {MOUNTS} from './mounts.js';

const canvas=document.getElementById('c'),c=canvas.getContext('2d'),pick=document.getElementById('pick'),info=document.getElementById('info');
const scene={canvas,motion:true,budget:{level:'full'},playerIndex:new Map(),towerGiftArt:{}};
const A='Chán Bố Mà Ra Đường',FOE='Công Tài';
const L=[];
// Thần khí GIỚI HẠN (Lôi Đài)
for(const it of BAO_ITEMS.filter(x=>x.tier===6))L.push({g:'Chiêu thần khí GIỚI HẠN (Lôi Đài)',name:it.name+' — '+(BAO_ULTS[it.id]?.move||''),ms:9500,draw:(t,age,k,n)=>drawCutFull(scene,c,t,1600,{e:{n,by:'a',to:'b',slot:1,dmg:4321,ko:false,skill:{name:it.name,bao:it.id},bao:{id:it.id,tier:6},cut:{kind:'bao',bao:it.id,tier:6,ms:9500}},age,k,ms:9500},new Map())});
for(const it of BAO_ITEMS.filter(x=>x.tier===5))L.push({g:'Thần thông 5★ (Lôi Đài)',name:it.name,ms:3600,draw:(t,age,k,n)=>drawCutFull(scene,c,t,1600,{e:{n,by:'a',to:'b',slot:1,dmg:2345,ko:false,skill:{name:it.name,bao:it.id},bao:{id:it.id,tier:5},cut:{kind:'bao',bao:it.id,tier:5,ms:3600}},age,k,ms:3600},new Map())});
// Quà Lôi Đài
for(const [trick,name,art] of [['summon','Quà 99 · Triệu Hồi Hỏa Long','fire-dragon'],['burst','Quà 499 · Pháp Bảo Bạo Phát',null],['heaven','Quà 2.000 · Thiên Giáng',  'axe']])
 L.push({g:'Quà trợ chiêu Lôi Đài',name,ms:4400,draw:(t,age,k,n)=>drawCutFull(scene,c,t,1600,{e:{n,by:'a',to:'b',gift:true,trick,skill:{name:name.split('· ')[1],art},dmg:3210,ko:false,cut:{kind:'gift',trick,from:FOE,ms:4400}},age,k,ms:4400},new Map())});
// Tháp
for(const [tier,name,ms,dmg] of [['g100','THIÊN HỎA LIỆU NGUYÊN',4600,2958],['g500','VẠN KIẾM QUY TÔNG',5600,3480]])
 L.push({g:'Quà Vân Hải Tháp',name:(tier==='g100'?'Quà 100 · ':'Quà 500 · ')+name,ms,draw:(t,age,k,n)=>drawTowerCut(scene,c,t,1600,{id:'tw:'+n,tier,name,value:tier==='g100'?100:500,user:'u1',userName:A,from:'u2',fromName:FOE,floor:12,dmg,ko:tier==='g500',ms,guardian:{art:n%3,hue:[0,140,230][n%3],name:'Thủ vệ'}},k)});
// Bảo Khố — màn nhận
L.push({g:'Thiên Công Bảo Khố — màn nhận',name:'Nhận 5★ (Đông Hoàng Chung)',ms:4500,draw:(t,age,k,n)=>drawGoldReveal(scene,c,t,1600,{x:{k:n,u:'u0',name:A,t:5,id:'s5-chung',s:1},age,ms:4500,k})});
for(const it of BAO_ITEMS.filter(x=>x.tier===6).slice(0,3))L.push({g:'Thiên Công Bảo Khố — màn nhận',name:'Nhận GIỚI HẠN ('+it.name+')',ms:8000,draw:(t,age,k,n)=>drawLimitedReveal(scene,c,t,1600,{x:{k:n,u:'u0',name:A,t:6,id:it.id,s:1},age,ms:8000,k},{limited:[]})});
// Nở tọa kỹ
const mv=MOUNTS.find(m=>m.tier==='vip'),md=MOUNTS.find(m=>m.tier==='divine');
if(mv)L.push({g:'Nở tọa kỹ',name:'VIP · '+mv.name,ms:5600,draw:(t,age,k,n,r)=>drawVipCut(scene,c,t,1600,r,age/1000),r:()=>({id:mv.id,tier:'vip',orb:'vip',stars:1,fresh:true,who:A,mname:mv.name,seed:'xem:'+mv.id})});
if(md)L.push({g:'Nở tọa kỹ',name:'Thần · '+md.name,ms:7600,draw:(t,age,k,n,r)=>drawDivineCut(scene,c,t,1600,r,age/1000),r:()=>({id:md.id,tier:'divine',orb:'divine',stars:1,fresh:true,who:A,mname:md.name,seed:'xem:'+md.id})});

let group='';for(const [i,x] of L.entries()){if(x.g!==group){group=x.g;const og=document.createElement('optgroup');og.label=group;pick.appendChild(og);}const o=document.createElement('option');o.value=i;o.textContent=x.name;pick.lastChild.appendChild(o);}
const q=new URLSearchParams(location.search);pick.value=q.get('i')||'0';
let start=performance.now(),speed=1,n=1,r=null,cur=null;
function restart(){start=performance.now();n++;cur=L[+pick.value];r=cur.r?cur.r():null;}
pick.onchange=restart;document.getElementById('again').onclick=restart;
document.getElementById('slow').onclick=e=>{speed=speed===1?.5:1;e.target.textContent=speed===1?'Chậm ×0,5':'Tốc độ thường';restart();};
restart();
function frame(now){
 const at=q.get('at'),x=cur,age=at?+at*1000:(now-start)*speed,loop=x.ms+900,a=age%loop;if(age>=loop&&a<40&&!x.wrapped){x.wrapped=true;n++;r=x.r?x.r():null;}if(a>=40)x.wrapped=false;
 c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.fillStyle='#000';c.fillRect(0,0,900,1600);
 if(a<x.ms){try{c.save();x.draw(now,a,a/x.ms,n,r);c.restore();}catch(err){info.textContent='Lỗi: '+err.message;}}
 c.setTransform(1,0,0,1,0,0);
 info.textContent=(a/1000).toFixed(1)+' / '+(x.ms/1000).toFixed(1)+' s';
 if(q.get('at')){if((frame.n=(frame.n||0)+1)<10)setTimeout(()=>frame(performance.now()),200);return;} /* chụp kiểm tra: đứng hình, vẽ vài khung rồi dừng */
 requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
