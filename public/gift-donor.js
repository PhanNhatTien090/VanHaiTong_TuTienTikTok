import {safeAvatar} from './honors.js';
const portraits=new Map();
export function donorPortrait(url){
 url=safeAvatar(url);if(!url||typeof Image==='undefined')return null;
 let entry=portraits.get(url);
 if(!entry){
  if(portraits.size>=64)portraits.delete(portraits.keys().next().value);
  const image=new Image();entry={image,ready:false};portraits.set(url,entry);image.decoding='async';image.referrerPolicy='no-referrer';
  image.onload=()=>entry.ready=true;image.onerror=()=>entry.failed=true;image.src=url;
 }
 return entry.ready?entry.image:null;
}
export function drawGiftDonor(c,row,x,y,{color='#ffe4a0',radius=31,width=280,alpha=1,caption=''}={}){
 const im=donorPortrait(row.avatar),name=String(row.name||'Đạo hữu');
 c.save();c.globalAlpha*=alpha;c.fillStyle='#071b2bf2';c.strokeStyle=color;c.lineWidth=2;
 c.beginPath();c.roundRect(x-width/2,y+radius-6,width,caption?54:30,8);c.fill();c.stroke();
 c.save();c.beginPath();c.arc(x,y,radius,0,Math.PI*2);c.clip();
 c.fillStyle='#173b50';c.fillRect(x-radius,y-radius,radius*2,radius*2);
 if(im){const size=Math.min(im.naturalWidth,im.naturalHeight);c.drawImage(im,(im.naturalWidth-size)/2,(im.naturalHeight-size)/2,size,size,x-radius,y-radius,radius*2,radius*2);}
 else{c.fillStyle='#fff6db';c.font='900 '+Math.round(radius)+'px "Segoe UI",Arial,sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(Array.from(name)[0]||'Đ',x,y);}
 c.restore();c.beginPath();c.arc(x,y,radius+2,0,Math.PI*2);c.stroke();
 c.textAlign='center';c.textBaseline='middle';c.font='800 19px "Segoe UI",Arial,sans-serif';c.fillStyle='#fff';
 let display=name;while(c.measureText(display).width>width-16&&display.length>2)display=display.slice(0,-2)+'…';
 c.fillText(display,x,y+radius+10);
 if(caption){c.font='700 16px "Segoe UI",Arial,sans-serif';c.fillStyle=color;c.fillText(caption,x,y+radius+32,width-14);}
 c.restore();
}
