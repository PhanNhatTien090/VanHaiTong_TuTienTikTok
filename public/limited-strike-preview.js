// 20/11: xem thử đòn thần khí GIỚI HẠN (public/bao-limited-strike.js) — 12 món × 3 mốc. ?k=.2,.5,.8
import {drawLimitedStrike,limitedArt} from './bao-limited-strike.js?v=20261120';
import {BAO_ITEMS} from './phap-bao-data.js';
const ids=BAO_ITEMS.filter(x=>x.tier===6).map(x=>x.id),ks=(new URLSearchParams(location.search).get('k')||'.2,.5,.8').split(',').map(Number);
const CW=300,CH=420,cv=document.getElementById('cv');cv.width=CW*ks.length*2;cv.height=CH*ids.length/2;
const c=cv.getContext('2d');ids.forEach(limitedArt);
setTimeout(()=>{c.fillStyle='#1b2229';c.fillRect(0,0,cv.width,cv.height);
 ids.forEach((id,i)=>ks.forEach((k,j)=>{const col=(i%2)*ks.length+j,row=Math.floor(i/2),x0=col*CW,y0=row*CH;
  c.save();c.beginPath();c.rect(x0,y0,CW,CH);c.clip();c.fillStyle=(i+j)%2?'#26313a':'#222b33';c.fillRect(x0,y0,CW,CH);
  c.translate(x0,y0);c.scale(CW/900,CW/900);const A={x:220,y:1250},B={x:680,y:1150};
  c.fillStyle='#556';c.fillRect(A.x-25,A.y-120,50,120);c.fillStyle='#755';c.fillRect(B.x-30,B.y-140,60,140);
  drawLimitedStrike(c,id,A,B,k,1000+k*1400,i+1);c.restore();c.fillStyle='#fff';c.fillText(id+' k='+k,x0+4,y0+14);}));
 document.title='ready';},1500);
// Bản HTML (Tháp): khối thẻ làn giả, chạy lặp playLimitedStrikeIn
import {playLimitedStrikeIn} from './bao-limited-strike.js?v=20261120';
if(new URLSearchParams(location.search).has('dom')){cv.style.display='none';const box=document.createElement('div');Object.assign(box.style,{width:'360px',height:'220px',margin:'20px',background:'#2b3a44',border:'2px solid #c9a86a',borderRadius:'8px'});box.textContent='Làn 2 · Thủ vệ tầng 37';document.body.appendChild(box);
 const run=()=>playLimitedStrikeIn(box,'L01-tru-tien',{from:{x:.3,y:.95},to:{x:.66,y:.62}});run();setInterval(run,1500);}
