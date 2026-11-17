// Xem thử chiếu riêng quà Vân Hải Tháp: ?tier=g100|g500&k=0.5&ko=1&floor=12
import {drawTowerCut} from './tower-cutscene.js';
const q=new URLSearchParams(location.search),tier=q.get('tier')||'g100',k=+(q.get('k')||.5),canvas=document.getElementById('c'),c=canvas.getContext('2d');
const scene={canvas,motion:true,budget:{level:'full'},playerIndex:new Map(),towerGiftArt:{}};
const x={id:'tw:c'+(q.get('v')||1),lane:0,tier,name:tier==='g500'?'VẠN KIẾM QUY TÔNG':'THIÊN HỎA LIỆU NGUYÊN',value:tier==='g500'?500:100,user:'u1',userName:'Chán Bố Mà Ra Đường',from:'u2',fromName:'Công Tài',floor:+(q.get('floor')||12),dmg:tier==='g500'?3480:2958,ko:q.get('ko')==='1'||tier==='g500',ms:tier==='g500'?5600:4600,guardian:{art:+(q.get('art')||1),hue:+(q.get('hue')||140),name:'Huyết Tinh Hải Côn Vương'}};
let n=0;function frame(){n++;c.setTransform(1,0,0,1,0,0);c.fillStyle='#000';c.fillRect(0,0,900,1600);drawTowerCut(scene,c,1e6+k*x.ms,1600,x,k);c.restore?.();if(n<12)setTimeout(frame,200);}frame();
