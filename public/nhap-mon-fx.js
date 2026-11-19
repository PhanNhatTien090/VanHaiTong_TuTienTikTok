// 19/11/2026 (chủ game: "90 s hơi lâu, mục tiêu ~30 người chơi cùng lúc đẹp"): NHẬP MÔN tại chỗ — người mới bình luận lần đầu
// được hiệu ứng NGAY ở ghế của mình, không xếp hàng: vòng mực loang + vòng vàng dưới chân, cột sáng mảnh, thẻ giấy "NHẬP MÔN · tên".
// Nhẹ (vài path + 1 gradient/người), nhiều người cùng lúc vẫn chạy. Màn toàn cảnh vẫn ≤1/60 s (app.js).
export const NHAP_MON_MS=2800;
const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>1-Math.pow(1-clamp(x),3);
export function addNhapMon(scene,e){(scene.nhapMon??=[]).push({user:e.user,name:String(e.name||'').slice(0,18),start:null});if(scene.nhapMon.length>12)scene.nhapMon.shift();}
export function drawNhapMon(scene,c,t){
 const list=scene.nhapMon;if(!list?.length)return;
 for(let i=list.length-1;i>=0;i--){const e=list[i],p=scene.targets?.find(x=>x.id===e.user);e.born??=t;
  if(!p){if(t-e.born>8000)list.splice(i,1);continue;} // chờ nhân vật lên sân (tối đa 8 s)
  e.start??=t;const k=(t-e.start)/NHAP_MON_MS;if(k>=1){list.splice(i,1);continue;}const s0=(p.scale||1.4)/1.4,s=Math.max(.9,s0),x=p.x,feet=p.y+16*s0,fade=Math.min(1,k/.08,(1-k)/.2);
  c.save();c.globalAlpha*=fade;
  // vòng mực loang + vòng vàng
  const r=ease(k/.5);c.save();c.translate(x,feet);c.scale(1,.3);
  c.strokeStyle='rgba(27,24,19,'+(.55*(1-r))+')';c.lineWidth=10*s*(1-r)+2;c.beginPath();c.arc(0,0,24*s+70*s*r,0,Math.PI*2);c.stroke();
  c.strokeStyle='rgba(244,201,106,'+(.9*(1-r*.6))+')';c.lineWidth=2.4*s;c.beginPath();c.arc(0,0,18*s+52*s*r,0,Math.PI*2);c.stroke();c.restore();
  // cột sáng mảnh
  const h=150*s,g=c.createLinearGradient(0,feet-h,0,feet);g.addColorStop(0,'rgba(255,240,200,0)');g.addColorStop(1,'rgba(255,236,180,'+(.55*(1-k))+')');
  c.save();c.globalCompositeOperation='lighter';c.fillStyle=g;c.fillRect(x-6*s,feet-h,12*s,h);c.restore();
  // thẻ giấy NHẬP MÔN trên đầu
  const ty=p.y-100*s0-10-14*ease(k/.25),T=1.55; /* thẻ cỡ cố định (dễ đọc kể cả sân đông) */c.font='900 '+Math.round(13*T)+'px "Noto Serif",Georgia,serif';
  const t1='NHẬP MÔN',w1=c.measureText(t1).width;c.font='800 '+Math.round(11*T)+'px "Segoe UI",sans-serif';const w2=c.measureText(e.name).width;
  const bw=Math.max(w1,w2)*1.12+26*T,bh=34*T;c.fillStyle='rgba(243,234,216,.96)';c.fillRect(x-bw/2,ty-bh,bw,bh);
  c.strokeStyle='#b3261e';c.lineWidth=1.6*T;c.strokeRect(x-bw/2+2*T,ty-bh+2*T,bw-4*T,bh-4*T);
  c.textAlign='center';c.textBaseline='middle';c.fillStyle='#b3261e';c.font='900 '+Math.round(13*T)+'px "Noto Serif",Georgia,serif';c.fillText(t1,x,ty-bh+11*T);
  c.fillStyle='#1b1813';c.font='800 '+Math.round(11*T)+'px "Segoe UI",sans-serif';c.fillText(e.name,x,ty-bh+25*T);
  c.restore();
 }
}
