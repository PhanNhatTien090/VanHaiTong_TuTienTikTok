// v58: hoạt cảnh chiêu thức khi gõ "danh" — 3 pha: TỤ LỰC quanh người (0→.28) · PHÓNG CHIÊU bay tới mục tiêu (.22→.6) · NỔ tại mục tiêu (.55→1).
// Mỗi chiêu có hình riêng theo pháp bảo đang trang bị. Ánh sáng dùng gradient (rẻ), hình khối gộp chung một path để giữ ngân sách vẽ ở chế độ nhẹ.
import {drawEventRelic} from './event-artifacts.js';
const TAU=Math.PI*2;
// vẽ pháp bảo sự kiện to tại (x,y): drawEventRelic vẽ lệch (32,-18) khi motion=false nên bù lại
// màn tối viền (giữa vẫn sáng) cho chiêu tối thượng — không che nhân vật ở giữa cảnh
function vignette(c,H,color,a){if(a<=0)return;c.save();c.globalCompositeOperation='source-over';const g=c.createRadialGradient(450,H*.5,H*.18,450,H*.5,H*.75);g.addColorStop(0,color+'00');g.addColorStop(1,color+hexA(a));c.fillStyle=g;c.fillRect(0,0,900,H);c.restore();}
function relicAt(c,id,x,y,S,t){c.save();c.translate(x-32*S,y+18*S);c.scale(S,S);drawEventRelic(c,id,t,false);c.restore();}
const clamp=v=>Math.max(0,Math.min(1,v)),easeOut=k=>1-(1-clamp(k))**3,easeIn=k=>clamp(k)**2;
const rnd=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};
const hexA=a=>Math.round(255*clamp(a)).toString(16).padStart(2,'0');
function glow(c,x,y,r,color,a){if(r<=1||a<=0)return;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'#ffffff'+hexA(a*.9));g.addColorStop(.25,color+hexA(a*.75));g.addColorStop(1,color+'00');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
function ring(c,x,y,r,flat,color,a,w){if(r<=0||a<=0)return;c.strokeStyle=color+hexA(a);c.lineWidth=w;c.beginPath();c.ellipse(x,y,r,r*flat,0,0,TAU);c.stroke();}
// tia tỏa: nhiều đoạn thẳng trong một path
function rays(c,x,y,n,r0,r1,color,a,w,rot=0){if(a<=0)return;c.strokeStyle=color+hexA(a);c.lineWidth=w;c.beginPath();for(let i=0;i<n;i++){const ang=rot+i*TAU/n+rnd(i)*.3,l=r1*(.6+rnd(i+9)*.4);c.moveTo(x+Math.cos(ang)*r0,y+Math.sin(ang)*r0);c.lineTo(x+Math.cos(ang)*l,y+Math.sin(ang)*l);}c.stroke();}
function bolt(c,x0,y0,x1,y1,seed,jag){c.moveTo(x0,y0);const n=8;for(let i=1;i<=n;i++){const u=i/n,o=i<n?(rnd(seed+i)-.5)*jag:0;c.lineTo(x0+(x1-x0)*u+o,y0+(y1-y0)*u);}}
function swordPath(c,x,y,a,s){const ca=Math.cos(a),sa=Math.sin(a),P=(px,py)=>[x+px*ca-py*sa,y+px*sa+py*ca];const pts=[[-2.2*s,-22*s],[2.2*s,-22*s],[3*s,9*s],[0,20*s],[-3*s,9*s]];pts.forEach((q,i)=>{const [X,Y]=P(...q);i?c.lineTo(X,Y):c.moveTo(X,Y);});c.closePath();const [g1x,g1y]=P(-8*s,-15*s),[g2x,g2y]=P(8*s,-15*s);c.moveTo(g1x,g1y);c.lineTo(g2x,g2y);}
function diamond(c,x,y,a,l,w){const ca=Math.cos(a),sa=Math.sin(a);c.moveTo(x+ca*l,y+sa*l);c.lineTo(x-sa*w,y+ca*w);c.lineTo(x-ca*l*.6,y-sa*l*.6);c.lineTo(x+sa*w,y-ca*w);c.closePath();}
function petal(c,x,y,a,s){c.moveTo(x+Math.cos(a)*7*s,y+Math.sin(a)*7*s);c.ellipse(x,y,7*s,3.4*s,a,0,TAU);}

export function drawCombatFx(c,e,t,k,p,H,{light=true,signatures=null,relics=null}={}){
  const tr=e.technique;if(!tr||k<0||k>1)return;
  const col=tr.color||'#bfeaff',hot=tr.hot||'#ffffff',I=tr.intensity||1,sc=Math.max(.8,(p.scale||1.5)/1.5);
  const dmgBoost=1+Math.min(.6,(Number(e.damage)||0)/500),Q=light?.6:1;
  const sx=p.x,sy=p.y-48*sc,bx=e.target?.x??450,by=H*(e.target?.yRatio??.37);
  const fade=clamp(Math.min(k/.08,(1-k)/.18));
  const ck=clamp(k/.28),u=clamp((k-.22)/.38),v=clamp((k-.55)/.45),ue=easeOut(u);
  const arc=tr.arc??70,px=sx+(bx-sx)*ue,py=sy+(by-sy)*ue-Math.sin(u*Math.PI)*arc,ang=Math.atan2(by-sy,bx-sx);
  const id=tr.id;
  c.save();c.globalAlpha=fade;c.lineCap='round';c.lineJoin='round';
  // ---------- PHA 1: TỤ LỰC ----------
  if(k<.4){const a=1-clamp((k-.28)/.12);c.globalCompositeOperation='lighter';
    glow(c,sx,sy,(40+I*12)*sc*(.6+ck*.6),col,.55*a);
    ring(c,sx,p.y+16*sc,(34+I*8)*sc*easeOut(ck/.7),.32,col,.8*a,2);
    // hạt linh khí hút về người
    c.fillStyle=hot+hexA(.85*a);c.beginPath();for(let i=0;i<(light?8:14);i++){const ang2=i*TAU/(light?8:14)+rnd(i)*.5,r=(80-70*ck)*sc*(.7+rnd(i+3)*.5);c.rect(sx+Math.cos(ang2)*r-1.5,sy+Math.sin(ang2)*r*.8-1.5,3,3);}c.fill();
    c.globalCompositeOperation='source-over';}
  // ---------- PHA 2 + 3: theo chiêu ----------
  c.globalCompositeOperation='lighter';
  const travel=u>0&&u<1,impact=v>0,imp=easeOut(v),ia=1-v;
  const R=(82+I*28)*dmgBoost*sc;// bán kính nổ
  switch(id){
    case 'slash':{// 3 lưỡi gió hình trăng khuyết lần lượt
      for(let j=0;j<(light?2:3);j++){const uj=clamp((k-.2-j*.07)/.35);if(uj<=0||uj>=1)continue;const e2=easeOut(uj),x=sx+(bx-sx)*e2,y=sy+(by-sy)*e2-Math.sin(uj*Math.PI)*40*(j-1);
        glow(c,x,y,60*sc,col,.6);c.strokeStyle=hot+'e0';c.lineWidth=7-j;c.beginPath();c.ellipse(x,y,56*sc,26*sc,ang+j*.4,-1.9,1.9);c.stroke();c.strokeStyle=col+'90';c.lineWidth=10;c.beginPath();c.ellipse(x-Math.cos(ang)*14,y-Math.sin(ang)*14,50*sc,22*sc,ang+j*.4,-1.6,1.6);c.stroke();}
      if(impact){c.strokeStyle=hot+hexA(ia);c.lineWidth=6*ia+1;c.beginPath();const L=R*.9*imp;c.moveTo(bx-L,by-L*.6);c.lineTo(bx+L,by+L*.6);c.moveTo(bx+L,by-L*.6);c.lineTo(bx-L,by+L*.6);c.stroke();}
      break;}
    case 'sword':{// mưa phi kiếm phóng tuần tự, vệt sáng dài
      const n=Math.round((light?5:9)+I*2*Q);c.fillStyle=hot+'e8';c.beginPath();const trails=[];
      for(let i=0;i<n;i++){const ui=clamp((k-.18-i*.018)/.34);if(ui<=0||ui>=1)continue;const e2=easeOut(ui),spread=(i-(n-1)/2)*14*sc,x=sx+spread+(bx+spread*.3-sx-spread)*e2,y=sy-30*sc+(by-sy+30*sc)*e2-Math.sin(ui*Math.PI)*(60+rnd(i)*50),d=Math.atan2(by-y,bx-x);
        swordPath(c,x,y,d-Math.PI/2,1.6*sc);trails.push([x,y,d]);}
      c.fill();c.strokeStyle=col+'70';c.lineWidth=3;c.beginPath();for(const [x,y,d] of trails){c.moveTo(x,y);c.lineTo(x-Math.cos(d)*60,y-Math.sin(d)*60);}c.stroke();
      if(impact){glow(c,bx,by,R*1.3*imp,col,.7*ia);ring(c,bx,by,R*1.4*imp,.45,hot,ia,3);c.fillStyle=col+hexA(ia);c.beginPath();for(let i=0;i<8;i++){const x=bx+(rnd(i)-.5)*R*1.6,y=by+R*.35+rnd(i+4)*10;swordPath(c,x,y-14,(rnd(i+7)-.5)*.4,.9*sc);}c.fill();}
      break;}
    case 'bamboo':{// HÀN LẬP (chiêu tối thượng): Thanh Trúc Phong Vân Kiếm — kiếm trận sau lưng → đợt kiếm tre bay → đại kiếm trận trên đầu quái giáng mưa kiếm → Tịch Tà Thần Lôi vàng
      vignette(c,H,'#021a10',.5*fade);
      const img=signatures?.[0],S=(130+I*20)*sc;
      if(img&&k<.7){c.save();c.globalCompositeOperation='source-over';c.globalAlpha=fade*(1-clamp((k-.5)/.2));c.translate(sx,sy-20*sc);c.rotate(t*.005);c.drawImage(img,-S/2,-S/2,S,S);c.restore();glow(c,sx,sy-20*sc,S*.8,'#3fe08a',.45);}
      // 2 vòng kiếm tre xoay quanh người lúc tụ lực
      if(k<.35){const a0=1-clamp((k-.25)/.1);c.fillStyle='#c6ffd9'+hexA(a0);c.beginPath();for(let ring2=0;ring2<2;ring2++){const m=light?8:12,r=(70+ring2*34)*sc*easeOut(ck);for(let i=0;i<m;i++){const a=i*TAU/m+t*.004*(ring2?-1:1);swordPath(c,sx+Math.cos(a)*r,sy-20*sc+Math.sin(a)*r*.45,a+Math.PI,1.1*sc);}}c.fill();}
      // đợt kiếm bay
      const n=Math.round((light?9:16)+I*2*Q),flying=[];
      for(let i=0;i<n;i++){const ui=clamp((k-.16-(i%6)*.03-Math.floor(i/6)*.05)/.26);if(ui<=0||ui>=1)continue;const e2=easeOut(ui),a0=i*2.39996,ox=Math.cos(a0)*60*sc,oy=Math.sin(a0)*40*sc-20*sc,tx=bx+(rnd(i)-.5)*R*.8,ty=by+(rnd(i+5)-.5)*R*.4,
        x=sx+ox+(tx-sx-ox)*e2,y=sy+oy+(ty-sy-oy)*e2-Math.sin(ui*Math.PI)*(50+rnd(i+2)*70);flying.push([x,y,Math.atan2(ty-y,tx-x)]);}
      // đại kiếm trận trên đầu quái rồi giáng xuống
      const fk=clamp((k-.34)/.16),dk=clamp((k-.52)/.16),FR=R*1.15*easeOut(fk),FY=Math.max(H*.06+R*.4,by-R*1.55),m=light?12:24;
      if(fk>0){ring(c,bx,FY,FR*1.08,.32,'#9dffbf',.8*(1-dk),3);ring(c,bx,FY,FR*.7,.32,'#ffe08a',.6*(1-dk),2);glow(c,bx,FY,FR,'#3fe08a',.35*(1-dk));
        for(let i=0;i<m;i++){const a=i*TAU/m+t*.0025,x0=bx+Math.cos(a)*FR,y0=FY+Math.sin(a)*FR*.32,di=clamp(dk*1.4-(i%6)*.07);if(di>=1)continue;const e2=easeIn(di),tx=bx+Math.cos(a)*R*.35,ty=by+Math.sin(a)*R*.15;flying.push([x0+(tx-x0)*e2,y0+(ty-y0)*e2,di>0?Math.atan2(ty-y0,tx-x0):Math.PI/2]);}}
      c.strokeStyle='#4dff9a70';c.lineWidth=5*sc;c.beginPath();for(const [x,y,d] of flying){c.moveTo(x,y);c.lineTo(x-Math.cos(d)*70*sc,y-Math.sin(d)*70*sc);}c.stroke();
      for(let i=0;i<flying.length;i+=2){const [x,y]=flying[i];glow(c,x,y,22*sc,'#3fe08a',.45);}
      c.fillStyle='#c6ffd9';c.beginPath();for(const [x,y,d] of flying)swordPath(c,x,y,d-Math.PI/2,1.5*sc);c.fill();
      c.strokeStyle='#1d7a46';c.lineWidth=1.4;c.beginPath();for(const [x,y,d] of flying)for(const s of [-8,2]){const cx=x+Math.cos(d)*s*1.5*sc,cy=y+Math.sin(d)*s*1.5*sc;c.moveTo(cx-Math.sin(d)*3.5*sc,cy+Math.cos(d)*3.5*sc);c.lineTo(cx+Math.sin(d)*3.5*sc,cy-Math.cos(d)*3.5*sc);}c.stroke();
      if(impact){glow(c,bx,by,R*1.6*imp,'#3fe08a',.75*ia);ring(c,bx,by+10,R*1.7*imp,.35,'#c9ffe0',ia,5);ring(c,bx,by+10,R*1.1*imp,.35,'#ffe08a',ia,3);
        // Tịch Tà Thần Lôi: tia sét vàng tỏa
        c.strokeStyle='#ffe08a'+hexA(ia);c.lineWidth=3;c.beginPath();for(let i=0;i<(light?5:8);i++){const a=i*TAU/8+rnd(i)*.5;bolt(c,bx,by,bx+Math.cos(a)*R*1.6*imp,by+Math.sin(a)*R*.9*imp,i*11+Math.floor(t/60),20);}c.stroke();glow(c,bx,by,R*.7,'#fff1b0',.8*ia);
        c.fillStyle='#9dffbf'+hexA(ia);c.beginPath();for(let i=0;i<(light?8:12);i++){const x=bx+(rnd(i+20)-.5)*R*1.8,y=by+R*.3+rnd(i+30)*12;swordPath(c,x,y-16,(rnd(i+7)-.5)*.5,1.2*sc);}c.fill();
        c.fillStyle='#58e88d'+hexA(ia);c.beginPath();for(let i=0;i<(light?12:24);i++){const a=i*2.4,r=R*1.8*imp*(.4+rnd(i)*.7);petal(c,bx+Math.cos(a)*r,by+Math.sin(a)*r*.7,a+t*.005,1.5*sc);}c.fill();}
      break;}
    case 'soul':{// VƯƠNG LÂM (chiêu tối thượng): Hồn Phiên — trời tối, phiên khổng lồ tung đàn hồn phách → hồn chủ khổng lồ há miệng nuốt quái → cột u hỏa bùng quanh
      vignette(c,H,'#0d0418',.62*fade);
      if(signatures?.[1]&&k<.88){const B=1.5*sc;c.save();c.globalCompositeOperation='source-over';c.globalAlpha=fade*(1-clamp((k-.7)/.18));c.drawImage(signatures[1],sx-60*B,sy-150*B+Math.sin(t*.004)*5,100*B,140*B);c.restore();glow(c,sx-10*B,sy-80*B,110*sc,'#7a3cff',.45*(1-v));}
      // u hỏa bốc lên quanh người
      if(k<.6){c.fillStyle='#b48cff'+hexA(.7*(1-clamp((k-.45)/.15)));c.beginPath();for(let i=0;i<(light?6:10);i++){const f=(t*.0012+rnd(i))%1,x=sx+(rnd(i+1)-.5)*120*sc,y=p.y+10*sc-f*140*sc,s=(1-f)*9*sc+2;c.moveTo(x,y-s*2.2);c.quadraticCurveTo(x+s,y,x,y+s);c.quadraticCurveTo(x-s,y,x,y-s*2.2);}c.fill();}
      const n=Math.round((light?9:16)+I*Q*3),ghosts=[];
      for(let i=0;i<n;i++){const ui=clamp((k-.12-i*.018)/.34);if(ui<=0||ui>=1)continue;const e2=easeOut(ui),fan=(i/(n-1)-.5)*2.8,
        cx1=sx+Math.cos(-Math.PI/2+fan)*200*sc,cy1=sy-70*sc+Math.sin(-Math.PI/2+fan)*140*sc,tx=bx+(rnd(i)-.5)*R*.8,ty=by+(rnd(i+3)-.5)*R*.5,
        m=1-e2,x=m*m*sx+2*m*e2*cx1+e2*e2*tx,y=m*m*(sy-70*sc)+2*m*e2*cy1+e2*e2*ty,dx=2*m*(cx1-sx)+2*e2*(tx-cx1),dy=2*m*(cy1-sy+70*sc)+2*e2*(ty-cy1);ghosts.push([x,y,Math.atan2(dy,dx),i,1+rnd(i)*.5]);}
      // hồn chủ khổng lồ
      const gk=clamp((k-.4)/.22);if(gk>0&&gk<1){const e2=easeIn(gk),x=sx+(bx-sx)*e2,y=sy-110*sc+(by-sy+110*sc)*e2;ghosts.push([x,y,Math.atan2(by-y,bx-x),99,3.6]);glow(c,x,y,120*sc,'#7a3cff',.7);}
      for(const [x,y,d,,z] of ghosts){glow(c,x,y,30*sc*z,col,.55);glow(c,x-Math.cos(d)*30*sc*z,y-Math.sin(d)*30*sc*z,22*sc*z,'#5a2a9a',.5);}
      c.fillStyle='#efe2ffd8';c.beginPath();for(const [x,y,d,i,z] of ghosts){const s=z*sc,ca=Math.cos(d),sa=Math.sin(d),P=(fx,fy)=>[x+fx*ca-fy*sa,y+fx*sa+fy*ca],w=Math.sin(t*.02+i)*4;
        const pts=[P(10*s,0),P(4*s,-9*s),P(-8*s,-8*s),P(-22*s,-4*s+w),P(-34*s,w*1.5),P(-22*s,4*s+w),P(-8*s,8*s),P(4*s,9*s)];c.moveTo(...pts[0]);for(let j=1;j<pts.length;j++)c.lineTo(...pts[j]);c.closePath();}c.fill();
      c.fillStyle='#1a0730';c.beginPath();for(const [x,y,d,i,z] of ghosts){const s=z*sc,ca=Math.cos(d),sa=Math.sin(d);for(const e of [-1,1]){const ex=x+3*s*ca-e*3.5*s*sa,ey=y+3*s*sa+e*3.5*s*ca;c.moveTo(ex+2*s,ey);c.arc(ex,ey,2*s,0,TAU);}if(z>3){const mx=x+7*s*ca,my=y+7*s*sa;c.moveTo(mx+3*s,my);c.ellipse(mx,my,3*s,1.6*s+Math.abs(Math.sin(t*.02))*1.4*s,d,0,TAU);}}c.fill();
      if(impact){c.save();c.globalCompositeOperation='source-over';glow(c,bx,by,R*1.7,'#0d0418',.75*ia);c.restore();glow(c,bx,by,R*1.2*imp,col,.65*ia);
        for(let r=0;r<3;r++)ring(c,bx,by,R*(1.4-r*.35)*(1-imp*.45)+r*6,.5,col,ia*.9,3.5-r*.8);
        c.strokeStyle='#d7b8ff'+hexA(ia);c.lineWidth=2.6;c.beginPath();for(let i=0;i<6;i++){const a0=i*TAU/6+t*.005;for(let s=0;s<12;s++){const a=a0+s*.26,r=R*1.4*(1-s/12)*(1.1-imp*.4);s?c.lineTo(bx+Math.cos(a)*r,by+Math.sin(a)*r*.55):c.moveTo(bx+Math.cos(a)*r,by+Math.sin(a)*r*.55);}}c.stroke();
        // cột u hỏa bùng quanh mục tiêu
        const pk=easeOut(clamp(v/.4));for(let i=0;i<(light?4:6);i++){const a=i*TAU/6+.3,x=bx+Math.cos(a)*R*1.25,y=by+Math.sin(a)*R*.45+R*.3,hh=R*(.8+rnd(i)*.4)*pk*(1-clamp((v-.6)/.4)),wv=Math.sin(t*.012+i)*8*sc;
          const g=c.createLinearGradient(0,y,0,y-hh);g.addColorStop(0,'#e7d6ff'+hexA(.9*ia));g.addColorStop(.4,col+hexA(.7*ia));g.addColorStop(1,col+'00');c.fillStyle=g;c.beginPath();c.moveTo(x-18*sc,y);c.quadraticCurveTo(x-26*sc,y-hh*.45,x+wv,y-hh);c.quadraticCurveTo(x+22*sc,y-hh*.5,x+18*sc,y);c.closePath();c.fill();glow(c,x,y,26*sc,col,.7*ia);}}
      break;}
    case 'thunder':{// sét giáng từ trời xuống nhiều đợt
      if(relics?.[0]&&k>.15){c.save();c.globalCompositeOperation='source-over';c.globalAlpha=fade*clamp((k-.15)/.15)*(1-v*.6);c.drawImage(relics[0],bx-55,by-200,110,110);c.restore();}
      const strikes=light?2:3;for(let j=0;j<strikes;j++){const sk=clamp((k-.35-j*.1)/.18);if(sk<=0||sk>=1)continue;const a=1-sk,ox=(rnd(j*7+Math.floor(t/80))-.5)*60;
        glow(c,bx+ox,by,R*1.2,col,.7*a);c.strokeStyle=col+hexA(a);c.lineWidth=9;c.beginPath();bolt(c,bx+ox*.3,by-230,bx+ox,by,j*31+Math.floor(t/60),40);c.stroke();c.strokeStyle='#ffffff'+hexA(a);c.lineWidth=3;c.stroke();}
      if(impact){ring(c,bx,by+10,R*1.6*imp,.3,hot,ia,4);c.strokeStyle=col+hexA(ia);c.lineWidth=2;c.beginPath();for(let i=0;i<(light?4:7);i++){const a=i*TAU/7+rnd(i)*.4;bolt(c,bx,by,bx+Math.cos(a)*R*1.3*imp,by+Math.sin(a)*R*.8*imp,i*13+Math.floor(t/70),18);}c.stroke();}
      break;}
    case 'lotus':{// sen nở dưới mục tiêu, cánh sen bay xoắn
      if(travel){c.fillStyle=col+'d0';c.beginPath();for(let i=0;i<(light?6:12);i++){const ui=clamp(u-i*.02),e2=easeOut(ui),a=i*TAU/12+t*.003,x=sx+(bx-sx)*e2+Math.cos(a)*30*(1-e2),y=sy+(by-sy)*e2-Math.sin(ui*Math.PI)*arc+Math.sin(a)*20*(1-e2);petal(c,x,y,a,1.6*sc);}c.fill();}
      if(k>.45){const b=easeOut((k-.45)/.3);c.save();c.translate(bx,by);for(let layer=0;layer<2;layer++){const n=8+layer*4,r=R*(.5+layer*.4)*b;c.fillStyle=(layer?col:'#fff0f6')+hexA(.75*(1-v*.8));c.beginPath();for(let i=0;i<n;i++){const a=i*TAU/n+layer*.3+t*.0006;c.moveTo(0,0);c.ellipse(Math.cos(a)*r*.55,Math.sin(a)*r*.55*.6,r*.5,r*.16,a,0,TAU);}c.fill();}c.restore();
        if(relics?.[1]){c.save();c.globalCompositeOperation='source-over';c.globalAlpha=fade*(1-v);c.drawImage(relics[1],bx-30,by-30-20*b,60,60);c.restore();}
        glow(c,bx,by,R*1.3*b,col,.55*(1-v));}
      break;}
    case 'vortex':{// hồ lô thôn vân: xoáy hút rồi bùng nổ
      if(relics?.[2]){c.save();c.globalCompositeOperation='source-over';c.globalAlpha=fade*(1-v);c.drawImage(relics[2],sx-30*sc,sy-90*sc,60*sc,80*sc);c.restore();}
      if(k>.25){const pull=clamp((k-.25)/.4);c.strokeStyle=col+hexA(.85*(1-v));c.lineWidth=3;c.beginPath();for(let arm=0;arm<4;arm++){for(let s=0;s<16;s++){const a=arm*TAU/4+s*.32+t*.008,r=R*1.4*(1-s/16)*(1-pull*.5);s?c.lineTo(bx+Math.cos(a)*r,by+Math.sin(a)*r*.5):c.moveTo(bx+Math.cos(a)*r,by+Math.sin(a)*r*.5);}}c.stroke();glow(c,bx,by,R*.8,col,.6*(1-v));}
      if(impact){const burst=clamp((v-.25)/.75);ring(c,bx,by,R*1.8*easeOut(burst),.5,hot,1-burst,5);glow(c,bx,by,R*1.5*easeOut(burst),col,.6*(1-burst));}
      break;}
    case 'stars':{// pháp luân tinh hà bay xoay + chòm sao nối tại mục tiêu
      c.save();c.translate(px,py);c.rotate(t*.006);const s=(80+I*16)*sc*(impact?1+imp*.5:1);
      if(relics?.[3]){c.globalCompositeOperation='source-over';c.globalAlpha=fade*(impact?ia:1);c.drawImage(relics[3],-s/2,-s/2,s,s);}else ring(c,0,0,s/2,1,col,.9,3);c.restore();
      if(impact){const n=7,pts=Array.from({length:n},(_,i)=>[bx+Math.cos(i*TAU/n+rnd(i))*R*1.1,by+Math.sin(i*TAU/n+rnd(i))*R*.6]);c.strokeStyle=col+hexA(ia);c.lineWidth=1.5;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.stroke();
        for(const [x,y] of pts)glow(c,x,y,10*sc*(1+imp),hot,ia);rays(c,bx,by,12,8,R*1.4*imp,hot,ia*.8,2,t*.001);}
      break;}
    case 'celestial':{// Thiên Đế ấn từ trời đập xuống, cột sáng + sóng vàng dẹt
      const drop=easeIn(clamp((k-.2)/.35));const sy2=by-260+(260-20)*drop;
      if(relics?.[0]){c.save();c.globalCompositeOperation='source-over';c.globalAlpha=fade*(impact?ia:1);const s=(150+I*15)*sc;c.drawImage(relics[0],bx-s/2,sy2-s*.8,s,s);c.restore();}
      else{c.fillStyle=col+'c0';c.fillRect(bx-60,sy2-60,120,60);}
      const beam=c.createLinearGradient(bx-40,0,bx+40,0);beam.addColorStop(0,col+'00');beam.addColorStop(.5,col+hexA(.5*(1-v)));beam.addColorStop(1,col+'00');c.fillStyle=beam;c.fillRect(bx-40,0,80,by);
      if(impact){for(let r=0;r<3;r++)ring(c,bx,by+12,R*(1.2+r*.6)*imp,.22,r?col:hot,ia*(1-r*.25),5-r);glow(c,bx,by,R*1.6*imp,col,.7*ia);rays(c,bx,by,16,R*.3,R*1.8*imp,hot,ia*.7,2.5);}
      break;}
    case 'frost':{// mũi băng phóng + băng nổ gai nhọn
      if(travel){c.fillStyle='#e8fbff';c.beginPath();const n=light?4:7;for(let i=0;i<n;i++){const ui=clamp(u-i*.03),e2=easeOut(ui),off=(i-(n-1)/2)*12,x=sx+(bx-sx)*e2,y=sy+off+(by-sy)*e2-Math.sin(ui*Math.PI)*30;diamond(c,x,y,ang,34*sc,8*sc);glow(c,x-Math.cos(ang)*26,y-Math.sin(ang)*26,26*sc,col,.6);}c.fill();}
      if(impact){glow(c,bx,by,R*1.4*imp,col,.65*ia);c.fillStyle='#dff8ff'+hexA(.95*ia);c.beginPath();const n=light?8:12;for(let i=0;i<n;i++){const a=i*TAU/n+rnd(i)*.3,l=R*(.6+rnd(i+2)*.6)*easeOut(v/.35);diamond(c,bx+Math.cos(a)*l*.5,by+Math.sin(a)*l*.3,a,l*.5,6*sc);}c.fill();ring(c,bx,by+10,R*1.5*imp,.3,'#ffffff',ia,3);}
      break;}
    case 'flame':{// hỏa phượng: cầu lửa đuôi dài, nổ cam + tàn lửa
      if(travel){for(let i=0;i<(light?6:10);i++){const ui=clamp(u-i*.025),e2=easeOut(ui),x=sx+(bx-sx)*e2,y=sy+(by-sy)*e2-Math.sin(ui*Math.PI)*arc;glow(c,x,y,(56-i*4.2)*sc,i<2?'#ffd27a':col,.75-i*.06);}
        c.fillStyle='#ffb347b0';c.beginPath();for(const d of [-1,1]){c.moveTo(px,py);c.quadraticCurveTo(px-Math.cos(ang)*30+d*Math.sin(ang)*-50*sc,py-Math.sin(ang)*30+d*Math.cos(ang)*50*sc,px-Math.cos(ang)*60*sc,py-Math.sin(ang)*60*sc);c.closePath();}c.fill();}
      if(impact){glow(c,bx,by,R*1.7*imp,'#ff6a1f',.85*ia);glow(c,bx,by,R*.8*imp,'#ffe08a',.9*ia);ring(c,bx,by,R*1.6*imp,.5,'#ffcf6a',ia,4);c.fillStyle='#ffb04a'+hexA(ia);c.beginPath();for(let i=0;i<(light?10:20);i++){const a=rnd(i)*TAU,r=R*1.6*imp*(.4+rnd(i+5)*.7);c.rect(bx+Math.cos(a)*r,by+Math.sin(a)*r*.7-imp*30*rnd(i+8),3,3);}c.fill();}
      break;}
    case 'bell':{// chuông vàng chụp xuống mục tiêu, sóng âm dội liên tiếp
      const drop=easeOut(clamp((k-.25)/.3)),bh=(90+I*14)*sc,yy=by-200+(200-bh*.35)*drop;
      if(k>.25){c.save();c.globalCompositeOperation='source-over';c.globalAlpha=fade*(1-v*.8)*.9;const g=c.createLinearGradient(bx-bh*.6,0,bx+bh*.6,0);g.addColorStop(0,'#8a5a12');g.addColorStop(.45,'#ffe7a0');g.addColorStop(1,'#a06a14');c.fillStyle=g;c.beginPath();c.moveTo(bx-bh*.18,yy-bh*.55);c.quadraticCurveTo(bx-bh*.5,yy-bh*.5,bx-bh*.6,yy+bh*.35);c.lineTo(bx+bh*.6,yy+bh*.35);c.quadraticCurveTo(bx+bh*.5,yy-bh*.5,bx+bh*.18,yy-bh*.55);c.closePath();c.fill();c.strokeStyle='#5a3a08';c.lineWidth=2;c.stroke();c.restore();}
      if(impact)for(let r=0;r<(light?2:4);r++){const w=clamp(v*1.6-r*.22);if(w>0&&w<1)ring(c,bx,by+bh*.3,R*(.5+w*1.6),.4,r%2?col:hot,(1-w)*.9,4-r*.6);}
      if(impact)glow(c,bx,by,R*1.2,col,.5*ia);
      break;}
    case 'dragon':{// thương long uốn lượn lao tới, há miệng nổ long khí
      const segs=light?10:16;c.fillStyle=col+'e0';c.beginPath();let head=null;
      for(let i=segs-1;i>=0;i--){const ui=clamp(u*1.1-i*.035);if(ui<=0)continue;const e2=easeOut(ui),x=sx+(bx-sx)*e2,y=sy+(by-sy)*e2-Math.sin(ui*Math.PI)*arc+Math.sin(ui*10+t*.01)*38*sc*(1-e2*.4),r=(24-i*1.1)*sc;c.moveTo(x+r,y);c.arc(x,y,r,0,TAU);if(i===0)head=[x,y];}
      c.fill();if(head&&!impact){glow(c,head[0],head[1],70*sc,col,.85);glow(c,head[0],head[1],24*sc,'#ffffff',.9);}
      if(impact){glow(c,bx,by,R*1.6*imp,col,.75*ia);ring(c,bx,by,R*1.7*imp,.5,hot,ia,5);rays(c,bx,by,10,R*.2,R*1.5*imp,col,ia,4,t*.002);}
      break;}
    case 'petal':{// bách hoa: dòng cánh hoa xoắn ốc, nổ thành hoa nở
      c.fillStyle=col+'d8';c.beginPath();const n=light?10:18;for(let i=0;i<n;i++){const ui=clamp(u-i*.015),e2=easeOut(ui);if(ui<=0||(impact&&v>.3))continue;const sw=Math.sin(ui*TAU+i)*40*(1-e2),x=sx+(bx-sx)*e2-Math.sin(ang)*sw,y=sy+(by-sy)*e2-Math.sin(ui*Math.PI)*arc+Math.cos(ang)*sw;petal(c,x,y,i+t*.006,2*sc);}c.fill();
      if(impact){glow(c,bx,by,R*1.3*imp,col,.6*ia);c.fillStyle='#ffe3ef'+hexA(ia);c.beginPath();for(let i=0;i<(light?12:22);i++){const a=i*TAU/22+rnd(i)*.4,r=R*1.4*imp*(.3+rnd(i+1)*.7);petal(c,bx+Math.cos(a)*r,by+Math.sin(a)*r*.7,a+t*.004,1.5*sc);}c.fill();}
      break;}
    case 'meteor':{// lưu tinh: thiên thạch rơi chéo từ trời xuống mục tiêu
      const n=light?3:5;for(let j=0;j<n;j++){const mk=clamp((k-.25-j*.07)/.25);if(mk<=0||mk>=1)continue;const e2=easeIn(mk),ox=(rnd(j)-.5)*90,x0=bx+ox+260,y0=by-300,x=x0+(bx+ox*.4-x0)*e2,y=y0+(by-y0)*e2;
        const tl=c.createLinearGradient(x,y,x+90,y-104);tl.addColorStop(0,'#ffffffd0');tl.addColorStop(.3,col+'a0');tl.addColorStop(1,col+'00');c.strokeStyle=tl;c.lineWidth=16*sc;c.beginPath();c.moveTo(x,y);c.lineTo(x+120,y-140);c.stroke();glow(c,x,y,40*sc,col,.95);}
      if(impact){glow(c,bx,by,R*1.5*imp,col,.75*ia);ring(c,bx,by+12,R*1.6*imp,.3,hot,ia,4);rays(c,bx,by,14,R*.2,R*1.3*imp,hot,ia*.8,2.5);}
      break;}
    // ---- v59: chiêu riêng của 7 pháp bảo sự kiện (pháp bảo hiện to trên đầu lúc tụ lực) ----
    case 'flowersword':{// Bách Hoa Tiên Kiếm: kiếm ngọc hồng kéo đuôi cánh hoa, cắm thành đóa hoa quanh mục tiêu
      const n=light?5:7,fly=[];for(let i=0;i<n;i++){const ui=clamp((k-.2-i*.03)/.32);if(ui<=0)continue;const a=i*TAU/n-Math.PI/2,tx=bx+Math.cos(a)*R*.55,ty=by+Math.sin(a)*R*.3,e2=easeOut(ui),
        x=sx+(tx-sx)*e2,y=sy+(ty-sy)*e2-Math.sin(ui*Math.PI)*(80+i*10);fly.push([x,y,ui>=1?a+Math.PI:Math.atan2(ty-y,tx-x),ui]);}
      c.fillStyle='#ff9ec7c0';c.beginPath();for(const [x,y,d,ui] of fly)if(ui<1)for(let j=1;j<5;j++)petal(c,x-Math.cos(d)*j*16*sc+Math.sin(t*.01+j)*5,y-Math.sin(d)*j*16*sc,j+t*.008,1.3*sc);c.fill();
      for(const [x,y] of fly)glow(c,x,y,26*sc,'#ff7fb4',.55*(impact?ia:1));
      c.fillStyle='#ffe3f0'+hexA(impact?ia:1);c.beginPath();for(const [x,y,d,ui] of fly)swordPath(c,x,y,d-Math.PI/2,1.7*sc);c.fill();
      if(impact){glow(c,bx,by,R*1.3*imp,'#ff6fa8',.6*ia);c.fillStyle='#ffc2dc'+hexA(ia*.9);c.beginPath();for(let i=0;i<10;i++){const a=i*TAU/10+t*.001;c.moveTo(bx,by);c.ellipse(bx+Math.cos(a)*R*.55*imp,by+Math.sin(a)*R*.3*imp,R*.5*imp,R*.14*imp,a,0,TAU);}c.fill();}
      break;}
    case 'peachfan':{// Đào Hoa Linh Phiến: phẩy quạt tạo 3 đợt gió trăng khuyết cuốn cánh đào, xoáy lốc tại mục tiêu
      if(k<.75){c.save();c.globalCompositeOperation='source-over';c.globalAlpha=fade*(1-clamp((k-.6)/.15));c.translate(sx+30*sc,sy-50*sc);c.rotate(Math.sin(clamp((k-.15)/.2)*Math.PI)*.9-.3);relicAt(c,'dao-hoa-phien',0,0,3.2*sc,t);c.restore();}
      for(let j=0;j<3;j++){const uj=clamp((k-.22-j*.08)/.3);if(uj<=0||uj>=1)continue;const e2=easeOut(uj),x=sx+(bx-sx)*e2,y=sy+(by-sy)*e2-Math.sin(uj*Math.PI)*30,w=(60+j*14)*sc*(1+uj*.5);
        c.strokeStyle='#ffd0e4'+hexA(.9*(1-uj*.5));c.lineWidth=(9-j*2)*sc;c.beginPath();c.ellipse(x,y,w*.45,w,ang,-1.3,1.3);c.stroke();glow(c,x,y,w*.8,'#ff8cb8',.35);
        c.fillStyle='#ff9ec7e0';c.beginPath();for(let i=0;i<(light?5:9);i++){const a=-1.2+i*2.4/8,xx=x+Math.cos(a+ang)*w*.45,yy=y+Math.sin(a+ang)*w;petal(c,xx,yy,a+t*.01,1.5*sc);}c.fill();}
      if(impact){c.fillStyle='#ffb3d1'+hexA(ia);c.beginPath();for(let i=0;i<(light?14:24);i++){const h=i/24,a=h*TAU*3+t*.012,r=(20+h*R)*(.6+imp*.5);petal(c,bx+Math.cos(a)*r,by+R*.4-h*R*1.4+Math.sin(a)*r*.25,a,1.4*sc);}c.fill();glow(c,bx,by,R*1.2,'#ff8cb8',.5*ia);}
      break;}
    case 'flowercage':{// Hoa Vũ Linh Lung: tháp linh lung bay lên trên mục tiêu, giáng lồng hoa ánh sáng giam lại rồi nổ
      const rise=easeOut(clamp((k-.15)/.35)),tx=sx+(bx-sx)*rise,ty=sy-80*sc+(by-R*1.2-sy+80*sc)*rise;
      if(k<.9){c.save();c.globalCompositeOperation='source-over';c.globalAlpha=fade*(1-clamp((k-.75)/.15));relicAt(c,'hoa-linh-lung',tx,ty,3.2*sc*(1+rise*.4),t);c.restore();glow(c,tx,ty,50*sc,'#ffd27a',.5);}
      if(k>.42){const b=easeOut((k-.42)/.18),fall=1-(impact?imp:0);c.strokeStyle='#ffe9b0'+hexA(.85*(1-v*.7));c.lineWidth=3*sc;c.beginPath();const bars=light?8:12;for(let i=0;i<bars;i++){const a=i*TAU/bars+t*.001,xx=bx+Math.cos(a)*R*.8,zz=Math.sin(a)*R*.25;c.moveTo(xx,ty+zz*.3);c.lineTo(xx,(ty+(by+R*.4-ty)*b)+zz);}c.stroke();
        ring(c,bx,by+R*.4,R*.8,.3,'#ffd27a',.8*fall,3);c.fillStyle='#ffc6e0'+hexA(.9*fall);c.beginPath();for(let i=0;i<(light?8:14);i++){const a=i*TAU/14+t*.002,yy=ty+(by+R*.4-ty)*((i*.37+t*.0004)%1);petal(c,bx+Math.cos(a)*R*.8,yy,a,1.4*sc);}c.fill();}
      if(impact){const bv=clamp((v-.3)/.7);if(bv>0){glow(c,bx,by,R*1.6*easeOut(bv),'#ffd27a',.7*(1-bv));rays(c,bx,by,14,R*.3,R*1.6*easeOut(bv),'#fff1c9',(1-bv),3);}}
      break;}
    case 'starmirror':{// Tinh Hà Bảo Kính: gương soi phóng chùm ngân hà rộng, sao lấp lánh chạy dọc chùm
      const mx=sx+40*sc,my=sy-70*sc;if(k<.9){c.save();c.globalCompositeOperation='source-over';c.globalAlpha=fade*(1-clamp((k-.75)/.15));relicAt(c,'tinh-ha-kinh',mx,my,3.4*sc,t);c.restore();}glow(c,mx,my,60*sc,col,.6*clamp(k/.25));
      const beam=clamp((k-.3)/.15)*(1-clamp((k-.78)/.15));if(beam>0){const d=Math.atan2(by-my,bx-mx),L=Math.hypot(bx-mx,by-my),w0=14*sc,w1=R*.7;c.save();c.translate(mx,my);c.rotate(d);
        const g=c.createLinearGradient(0,-w1,0,w1);g.addColorStop(0,col+'00');g.addColorStop(.5,col+hexA(.75*beam));g.addColorStop(1,col+'00');c.fillStyle=g;c.beginPath();c.moveTo(0,-w0);c.lineTo(L,-w1);c.lineTo(L,w1);c.lineTo(0,w0);c.closePath();c.fill();
        c.fillStyle='#ffffff'+hexA(beam);c.beginPath();for(let i=0;i<(light?14:26);i++){const f=(rnd(i)+t*.0012*(1+rnd(i+1)))%1,yy=(rnd(i+2)-.5)*2*(w0+(w1-w0)*f)*.8;c.rect(f*L-1.5,yy-1.5,3,3);}c.fill();c.restore();}
      if(impact){glow(c,bx,by,R*1.5*imp,col,.7*ia);rays(c,bx,by,8,R*.2,R*1.7*imp,'#ffffff',ia,2.5,Math.PI/8);rays(c,bx,by,8,R*.1,R*1.0*imp,col,ia,1.5);}
      break;}
    case 'stararrow':{// Lưu Tinh Thần Cung: giương cung, 3 mũi tên sao băng bắn thẳng xuyên mục tiêu
      const cx0=sx+30*sc,cy0=sy-30*sc;if(k<.8){c.save();c.globalCompositeOperation='source-over';c.globalAlpha=fade*(1-clamp((k-.65)/.15));relicAt(c,'luu-tinh-cung',cx0,cy0,3.2*sc,t);c.restore();}
      if(k<.32){const pull=clamp(k/.3);glow(c,cx0,cy0,(20+pull*30)*sc,col,.8);}
      for(let j=0;j<3;j++){const uj=clamp((k-.3-j*.06)/.14);if(uj<=0||uj>=1)continue;const ty=by+(j-1)*18*sc,x=cx0+(bx+30-cx0)*uj,y=cy0+(ty-cy0)*uj,d=Math.atan2(ty-cy0,bx-cx0);
        const g=c.createLinearGradient(x,y,x-Math.cos(d)*200,y-Math.sin(d)*200);g.addColorStop(0,'#ffffff');g.addColorStop(.2,col+'c0');g.addColorStop(1,col+'00');c.strokeStyle=g;c.lineWidth=9*sc;c.beginPath();c.moveTo(x,y);c.lineTo(x-Math.cos(d)*200,y-Math.sin(d)*200);c.stroke();glow(c,x,y,30*sc,col,.9);}
      if(impact){glow(c,bx,by,R*1.2*imp,col,.7*ia);for(let j=0;j<3;j++){const ty=by+(j-1)*18*sc;c.strokeStyle='#ffffff'+hexA(ia);c.lineWidth=3;c.beginPath();c.moveTo(bx-R*.3,ty);c.lineTo(bx+R*1.6*imp,ty+(j-1)*10*imp);c.stroke();}ring(c,bx,by,R*1.4*imp,.5,col,ia,3);}
      break;}
    case 'sevenstars':{// Thất Tinh Linh Phù: 7 lá bùa bay lập trận Bắc Đẩu quanh mục tiêu, nối sao rồi giáng lôi quang vào giữa
      const DIP=[[-1.1,-.5],[-.6,-.6],[-.15,-.45],[.2,-.2],[.35,.25],[.95,.3],[1.05,-.15]],pts=DIP.map(([x,y])=>[bx+x*R*1.1,by+y*R*1.1]);
      const flyK=i=>clamp((k-.18-i*.03)/.25),pos=pts.map(([tx,ty],i)=>{const e2=easeOut(flyK(i));return [sx+(tx-sx)*e2,sy+(ty-sy)*e2-Math.sin(flyK(i)*Math.PI)*60];});
      c.save();c.globalCompositeOperation='source-over';c.globalAlpha=fade*(1-v);c.fillStyle='#f3d27a';c.beginPath();pos.forEach(([x,y],i)=>{if(flyK(i)>0){c.save();c.translate(x,y);c.rotate(Math.sin(t*.005+i)*.2);c.rect(-7*sc,-12*sc,14*sc,24*sc);c.restore();}});c.fill();
      c.fillStyle='#c0262d';c.beginPath();pos.forEach(([x,y],i)=>{if(flyK(i)>0)c.rect(x-1.5*sc,y-8*sc,3*sc,16*sc);});c.fill();c.restore();
      pos.forEach(([x,y],i)=>flyK(i)>0&&glow(c,x,y,22*sc,col,.7));
      const link=clamp((k-.5)/.12);if(link>0){c.strokeStyle=col+hexA(.9*(1-v*.6));c.lineWidth=2.5;c.beginPath();const m=Math.max(1,Math.ceil(link*6));pts.slice(0,m+1).forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();}
      if(impact){c.strokeStyle='#ffffff'+hexA(ia);c.lineWidth=2;c.beginPath();pts.forEach(([x,y],i)=>bolt(c,x,y,bx,by,i*17+Math.floor(t/70),14));c.stroke();glow(c,bx,by,R*1.4*imp,col,.75*ia);ring(c,bx,by,R*1.5*imp,.5,'#ffffff',ia,3);}
      break;}
    case 'stardust':{// Tinh Sa Linh Đại: túi gấm mở, dòng sông bụi sao uốn lượn cuốn quanh mục tiêu rồi lóe sáng
      if(k<.8){c.save();c.globalCompositeOperation='source-over';c.globalAlpha=fade*(1-clamp((k-.65)/.15));relicAt(c,'tinh-sa-dai',sx+30*sc,sy-60*sc,3*sc,t);c.restore();}
      const n=light?40:80;c.fillStyle='#e9f0ff';c.beginPath();for(let i=0;i<n;i++){const f=i/n,ui=clamp(u*1.7-f*.7);if(ui<=0)continue;const e2=easeOut(ui),sw=Math.sin(f*TAU*2+t*.004)*40*sc*(1-e2),
        swirl=impact?imp:0,a=f*TAU*2+t*.006,x=sx+(bx-sx)*e2+Math.cos(a)*R*.9*swirl*e2-Math.sin(ang)*sw,y=sy-60*sc+(by-sy+60*sc)*e2-Math.sin(ui*Math.PI)*arc+Math.sin(a)*R*.4*swirl*e2+Math.cos(ang)*sw,s=(2.5+rnd(i)*3.5)*sc;c.rect(x-s/2,y-s/2,s,s);}c.fill();
      glow(c,px,py,40*sc,col,.5*(1-v));if(impact){const bv=clamp((v-.4)/.6);glow(c,bx,by,R*1.4,col,.55*ia);if(bv>0){rays(c,bx,by,20,R*.2,R*1.5*easeOut(bv),'#ffffff',(1-bv),1.5);glow(c,bx,by,R*.9,'#ffffff',.6*(1-bv));}}
      break;}
    default:{c.strokeStyle=col;c.lineWidth=4;c.beginPath();c.ellipse(px,py,38,20,-.6,-2,1);c.stroke();}
  }
  // lóe trắng chung khi trúng đích (mạnh theo sát thương)
  if(v>0&&v<.3){const f=1-v/.3;glow(c,bx,by,R*.9,'#ffffff',.9*f);ring(c,bx,by,R*(.3+v*3),.6,'#ffffff',.8*f,2);}
  c.restore();
}
