// Scenery actors only. They never enter player state, rankings, gift totals or chat.
export const NPCS=Object.freeze([
  {id:'sword-master',name:'Kiếm sư',role:'sword',color:'#a5d7ec'},
  {id:'alchemist',name:'Đan sư',role:'alchemy',color:'#cfb5f4'},
  {id:'guardian',name:'Hộ viện',role:'patrol',color:'#e9c38b'},
  {id:'gardener',name:'Linh đồng',role:'garden',color:'#9ed9ac'}
]);
export function npcPositions(floor,t){const a=t/1000;return NPCS.map((npc,i)=>({...npc,x:[180,730,450+Math.sin(a*.18)*195,150+Math.sin(a*.12)*22][i],y:[floor-155,floor-155,floor-265, floor+105][i]}));}
export function drawWorldLife(scene,c,t,{crowd=0,environment=true,npcs=true}={}){
  const H=scene.height,floor=scene.courtyardY(H),time=scene.motion?t:0;
  const el=(ctx,...args)=>scene.ellipse(ctx,...args),path=(ctx,...args)=>scene.path(ctx,...args);
  if(environment){
    c.save();c.globalCompositeOperation='screen';
    // Breathe light into the actual palace windows and courtyard lamps.
    for(const [x,y,r]of [[451,H*.285,34],[375,H*.307,17],[527,H*.307,17],[125,H*.43,22],[780,H*.405,22]]){
      const alpha=.11+(scene.motion?Math.sin(time*.0018+x)*.035:0),g=c.createRadialGradient(x,y,1,x,y,r);g.addColorStop(0,`rgba(255,202,106,${alpha})`);g.addColorStop(1,'#ffcb6900');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);
    }
    // Individual streaks stay near the waterfall banks rather than covering the plaza.
    for(let side=0;side<2;side++)for(let i=0;i<18;i++){
      const x=(side?730:165)+Math.sin(i*3.2)*38,y=H*(.35+((i*.037+time*.000055)% .42));
      c.strokeStyle=`rgba(184,229,244,${.06+(i%3)*.025})`;c.lineWidth=.8+(i%2);c.beginPath();c.moveTo(x,y);c.lineTo(x-2,y+15+(i%4)*8);c.stroke();
    }
    // Moving mist has a soft gradient falloff; no opaque scrolling image.
    for(let i=0;i<6;i++){const x=((i*181+time*.009)%1120)-110,y=H*(.26+(i%3)*.19),g=c.createRadialGradient(x,y,0,x,y,110);g.addColorStop(0,'#d7edfa0c');g.addColorStop(1,'#d7edfa00');c.save();c.translate(x,y);c.scale(1,.3);c.translate(-x,-y);c.fillStyle=g;c.fillRect(x-110,y-110,220,220);c.restore();}
    // Ambient spirit motes trace the courtyard in changing currents.
    for(let i=0;i<26;i++){const a=i*2.399+time*.00018,r=80+(i%7)*32;el(c,450+Math.cos(a)*r,floor+Math.sin(a)*r*.27,1.2+(i%3)*.35,1.2,'#ccefc080');}
    c.restore();
    for(let i=0;i<16;i++){const x=(i*127+time*.015)%950-25,y=(i*103+time*.021)%H;c.save();c.translate(x,y);c.rotate(i+time*.0007);el(c,0,0,3.6,1.4,'#ecc5d4aa');c.restore();}
  }
  if(!npcs)return;
  // Dense rooms keep peripheral NPCs compact, leaving the viewer rows readable.
  const scale=crowd>18?.65:.85;
  for(const npc of npcPositions(floor,time)){
    c.save();c.translate(npc.x,npc.y);c.scale(scale,scale);el(c,0,17,22,6,'#091e2766');
    const a=time*.002,arm=npc.role==='sword'?Math.sin(a)*.6:Math.sin(a*.5)*.1;
    const robe=c.createLinearGradient(-13,-20,15,20);robe.addColorStop(0,'#f3efdd');robe.addColorStop(.3,npc.color);robe.addColorStop(1,'#314354');
    path(c,[[-6,-25],[-18,-13],[-23,4],[-11,0],[-17,18],[18,18],[11,0],[23,3],[18,-13],[6,-25]],robe,'#edf2db77');
    path(c,[[-4,-24],[0,-12],[5,-24],[3,14],[-4,14]],'#f4ecd1');c.strokeStyle='#ead398';c.lineWidth=2;c.beginPath();c.moveTo(-9,-2);c.lineTo(10,-2);c.stroke();
    el(c,0,-35,8,11,'#e7ceb2');path(c,[[-8,-32],[-9,-42],[-4,-49],[5,-49],[9,-41],[8,-32],[4,-40],[-4,-40]],'#192b37');el(c,0,-49,4,4,'#152738');
    c.save();c.translate(12,-14);c.rotate(arm);c.strokeStyle=npc.color;c.lineWidth=7;c.lineCap='round';c.beginPath();c.moveTo(0,0);c.lineTo(20,-3);c.stroke();el(c,23,-3,3,2,'#efd9bb');
    if(npc.role==='sword'){scene.drawFlyingSword(c,29,-13,1.1,npc.color);c.strokeStyle='#b9e8ff88';c.lineWidth=2;c.beginPath();c.arc(20,-5,45,-1+arm,1.2+arm);c.stroke();}c.restore();
    if(npc.role==='alchemy'){
      el(c,22,21,23,7,'#b49a65');el(c,22,3,20,20,'#3c5863','#c5b078');el(c,22,-11,22,7,'#bb9e69');el(c,22,-14,16,5,'#172939');
      c.save();c.globalCompositeOperation='screen';for(let i=0;i<12;i++){const k=((time*.00026+i/12)%1);el(c,22+Math.sin(k*9+i)*10,-18-k*64,4+k*10,3+k*5,`rgba(191,207,240,${(1-k)*.2})`);}for(let i=0;i<7;i++){const k=(time*.0005+i/7)%1;el(c,22+Math.sin(i*2)*12,15-k*18,2,5*(1-k)+1,'#edba6e99');}c.restore();
    }
    if(npc.role==='garden'){for(let i=0;i<4;i++)path(c,[[18+i*7,17],[15+i*7,1],[21+i*7,8],[24+i*7,-3],[26+i*7,17]],'#8cba9688');}
    if(npc.role==='patrol'){const step=Math.sin(time*.006)*3;c.strokeStyle='#1b2939';c.lineWidth=6;c.beginPath();c.moveTo(-6,17);c.lineTo(-8+step,23);c.moveTo(7,17);c.lineTo(8-step,23);c.stroke();}
    c.fillStyle='#142532ee';c.beginPath();c.roundRect(-39,30,78,21,5);c.fill();c.strokeStyle='#b9c5d244';c.lineWidth=.6;c.stroke();c.textAlign='center';c.font='11px Segoe UI';c.fillStyle='#ced9e0';c.fillText(npc.name,0,44);c.restore();
  }
}

// v8 — không khí & ánh sáng. 'back' vẽ sau nền (cực quang, tia sáng, linh hạc, đom đóm linh quang);
// 'front' vẽ trên nhân vật (ánh chiều/đêm, bụi sáng gần ống kính, viền tối). Chỉ dùng gradient,
// không ảnh, để nhẹ cho LIVE Studio. Tắt cùng nút "môi trường" và khi hệ điều hành giảm chuyển động.
export function drawAtmosphere(scene,c,t,layer){
  if(!scene.worldLife?.environment)return;
  const H=scene.height,time=scene.motion?t:0,floor=scene.courtyardY(H);
  // Chu kỳ ngày–đêm ~6 phút: 0 = hoàng hôn vàng, 1 = đêm trăng xanh.
  const night=.5-.5*Math.cos(time/360000*Math.PI*2);
  c.save();
  if(layer==='back'){
    c.globalCompositeOperation='screen';
    // Cực quang linh khí trên trời: 3 dải sóng mờ trôi chậm.
    for(let b=0;b<3;b++){
      const hue=[155,190,265][b],y0=H*(.07+b*.045),alpha=.035+night*.05;
      c.beginPath();c.moveTo(-20,y0);
      for(let x=-20;x<=920;x+=30)c.lineTo(x,y0+Math.sin(x*.009+time*.00022*(b+1)+b*2)*H*.025);
      for(let x=920;x>=-20;x-=30)c.lineTo(x,y0+H*.05+Math.sin(x*.011+time*.00018*(b+1)+b)*H*.02);
      c.closePath();const g=c.createLinearGradient(0,y0,0,y0+H*.06);g.addColorStop(0,`hsla(${hue},80%,70%,0)`);g.addColorStop(.5,`hsla(${hue},80%,70%,${alpha})`);g.addColorStop(1,`hsla(${hue},80%,70%,0)`);c.fillStyle=g;c.fill();
    }
    // Tia nắng/trăng chiếu xiên từ trên xuống, lắc nhẹ và thở.
    for(let i=0;i<4;i++){
      const sway=Math.sin(time*.00015+i*1.7)*40,x=60+i*220+sway,w=40+(i%3)*26,a=(.022+.016*Math.sin(time*.0006+i*2.1))*(1-night*.6);
      const g=c.createLinearGradient(x,0,x+180,H*.8);g.addColorStop(0,night>.5?`rgba(190,215,255,${a})`:`rgba(255,226,160,${a})`);g.addColorStop(1,'rgba(255,230,170,0)');
      c.fillStyle=g;c.beginPath();c.moveTo(x,-10);c.lineTo(x+w,-10);c.lineTo(x+w+230,H*.82);c.lineTo(x+150,H*.82);c.closePath();c.fill();
    }
    // Hào quang tông môn thở theo nhịp (đại điện ở giữa).
    const pulse=.06+.035*Math.sin(time*.0012),gl=c.createRadialGradient(451,H*.28,4,451,H*.28,220);gl.addColorStop(0,`rgba(255,214,140,${pulse})`);gl.addColorStop(1,'rgba(255,214,140,0)');c.fillStyle=gl;c.fillRect(231,H*.28-220,440,440);
    // Đom đóm linh quang bay lên từ sân, lập lòe.
    for(let i=0;i<34;i++){
      const k=((time*.00004*(1+(i%5)*.25))+i*.137)%1,x=(i*263)%900+Math.sin(time*.0011+i)*22,y=floor+90-k*H*.65;
      const a=Math.max(0,Math.sin(k*Math.PI))*(.35+.45*Math.abs(Math.sin(time*.003+i*1.3)))*(.6+night*.6),r=6+(i%4)*3;
      const g=c.createRadialGradient(x,y,0,x,y,r);const col=i%3===0?'255,220,150':i%3===1?'170,255,215':'200,210,255';g.addColorStop(0,`rgba(${col},${a})`);g.addColorStop(.25,`rgba(${col},${a*.5})`);g.addColorStop(1,`rgba(${col},0)`);c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);
    }
    c.globalCompositeOperation='source-over';
    // Đàn linh hạc bay ngang trời mỗi ~45 giây.
    const cycle=45000,phase=(time%cycle)/cycle;
    if(scene.motion&&phase<.4){const p=phase/.4,bx=-120+p*1150,by=H*(.16+.03*Math.sin(Math.floor(time/cycle)));
      for(let i=0;i<5;i++){const x=bx-[0,26,26,52,52][i],y=by+[0,-14,14,-28,28][i]+Math.sin(time*.003+i)*3,flap=Math.sin(time*.012+i)*7;
        c.strokeStyle='rgba(246,244,232,.85)';c.lineWidth=2.4;c.lineCap='round';c.beginPath();c.moveTo(x-16,y+flap);c.quadraticCurveTo(x-6,y-5,x,y);c.quadraticCurveTo(x+6,y-5,x+16,y+flap);c.stroke();c.lineWidth=1.6;c.beginPath();c.moveTo(x,y);c.lineTo(x+9,y+1);c.stroke();}}
  } else if(layer==='front'){
    // Ánh màu theo giờ: chiều vàng ấm → đêm xanh lam.
    c.globalCompositeOperation='multiply';c.fillStyle=`rgba(70,95,170,${(.34*night).toFixed(3)})`;c.fillRect(-50,-50,1000,H+100);
    c.globalCompositeOperation='overlay';c.fillStyle=`rgba(255,180,95,${(.10*(1-night)).toFixed(3)})`;c.fillRect(-50,-50,1000,H+100);
    c.globalCompositeOperation='screen';
    // Bụi sáng lớn, mờ, trôi sát ống kính → chiều sâu.
    for(let i=0;i<9;i++){const x=((i*211+time*.006*(1+i%3))%1100)-100,y=(i*331)%H+Math.sin(time*.0004+i)*30,r=26+(i%4)*14,a=.025+.015*Math.sin(time*.0009+i);
      const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(255,240,200,${a})`);g.addColorStop(1,'rgba(255,240,200,0)');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
    // Sương mỏng lững lờ trước sân.
    for(let i=0;i<4;i++){const x=((i*290+time*.012)%1300)-200,y=floor+60+i*28,g=c.createRadialGradient(x,y,0,x,y,190);g.addColorStop(0,'rgba(220,236,245,.045)');g.addColorStop(1,'rgba(220,236,245,0)');c.save();c.translate(x,y);c.scale(1,.25);c.translate(-x,-y);c.fillStyle=g;c.fillRect(x-190,y-190,380,380);c.restore();}
  } else {
    // Lớp màn hình (không theo máy quay): viền tối điện ảnh, kéo mắt vào giữa.
    const v=c.createRadialGradient(450,H*.52,H*.2,450,H*.52,H*.62);v.addColorStop(0,'rgba(4,10,20,0)');v.addColorStop(1,`rgba(4,10,20,${.42+night*.15})`);c.fillStyle=v;c.fillRect(-50,-50,1000,H+100);
  }
  c.restore();
}
