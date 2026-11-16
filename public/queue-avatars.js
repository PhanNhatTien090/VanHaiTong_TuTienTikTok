// 16/11 (chủ game): hàng chờ Vân Hải Tháp / Lôi Đài = bảng nhỏ chỉ có avatar tròn (ảnh TikTok), không ghi tên.
// Ai đánh xong thì người đầu hàng tự vào (server: tower.queue / arena.queue). Không có ảnh → vòng tròn số thứ tự.
import {safeAvatar} from './honors.js';
import {donorPortrait} from './gift-donor.js';
export function queueAvatarsHTML(list,more,esc){
 return (list||[]).map((q,i)=>{const u=safeAvatar(q?.avatar);return u?`<img class="qa-av" src="${esc(u)}" referrerpolicy="no-referrer" alt="">`:`<i class="qa-av qa-none">${i+1}</i>`;}).join('')+(more>0?`<b class="qa-more">+${more}</b>`:'');
}
const rounds=new Map();
function roundAvatar(im,r){
 const key=im.src+'|'+r;let s=rounds.get(key);if(s)return s;
 s=document.createElement('canvas');s.width=s.height=r*4;const x=s.getContext('2d');
 x.beginPath();x.arc(r*2,r*2,r*2-3,0,Math.PI*2);x.closePath();x.save();x.clip();x.drawImage(im,0,0,r*4,r*4);x.restore();
 x.lineWidth=3;x.strokeStyle='#ffd98a';x.stroke();
 rounds.set(key,s);if(rounds.size>32)rounds.delete(rounds.keys().next().value);return s;
}
// Vẽ hàng avatar (canvas) từ trái sang phải, trả về x kết thúc.
export function drawQueueAvatars(c,list,x,y,r=16,gap=6){
 for(const [i,q] of (list||[]).entries()){
  const im=donorPortrait(q?.avatar),cx=x+r+i*(r*2+gap);
  if(im?.naturalWidth)c.drawImage(roundAvatar(im,r),cx-r,y-r,r*2,r*2);
  else{c.beginPath();c.arc(cx,y,r-1,0,Math.PI*2);c.fillStyle='#173047';c.fill();c.lineWidth=2;c.strokeStyle='#ffd98a';c.stroke();
   c.fillStyle='#ffe9b0';c.font='800 '+Math.round(r)+'px Segoe UI, sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(String(i+1),cx,y+1);}
  if(q?.vs){c.fillStyle='#ff6a5a';c.font='900 '+Math.round(r*.8)+'px Segoe UI, sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('⚔',cx+r*.75,y-r*.7);}
 }
 return x+(list?.length||0)*(r*2+gap);
}
