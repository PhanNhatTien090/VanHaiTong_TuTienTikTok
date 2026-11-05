// v34: sân khấu quà theo mốc giá trị (coin × số lượng). KHÔNG dùng trận pháp / cột sáng của đột phá.
// Mốc 1: đèn chiếu + hoa nở · 2: vòng xoáy cánh hoa · 3: dải lụa + sóng xung kích · 4: phi kiếm vàng + vương miện.
// Từ 199 coin dùng hiệu ứng quà lớn có sẵn (luxury-fx.js: kiếm rơi, rồng bay, thiên môn).
const TAU=Math.PI*2;
const ease=k=>1-(1-Math.max(0,Math.min(1,k)))**3;
const hex=a=>Math.round(255*Math.max(0,Math.min(1,a))).toString(16).padStart(2,'0');
export const GIFT_STAGE_TIERS=Object.freeze([{min:1,name:'Đèn chiếu · hoa nở'},{min:5,name:'Xoáy cánh hoa'},{min:30,name:'Lụa tiên · sóng linh khí'},{min:99,name:'Kim kiếm hộ thân'}]);
export function giftStageLevel(e){const v=Math.max(1,Number(e.coins)||1)*Math.max(1,Number(e.count)||1);return v>=99?4:v>=30?3:v>=5?2:1;}
const KIND_COLORS={rose:['#ff4f74','#ffd0da'],flower:['#ff9ec0','#fff0b8'],heart:['#ff6fa8','#ffd6e8'],cat:['#b9a2f2','#f1eaff'],dog:['#f0a64a','#ffe6c2'],food:['#ffb070','#fff0d8'],
  perfume:['#c98cff','#f4e2ff'],crown:['#f5c542','#fff4c2'],lion:['#e8963a','#ffe0b0'],cosmos:['#8fa8ff','#e6ecff'],dragon:['#ffc24a','#fff2c4'],vessel:['#7fd8ff','#e2f7ff'],
  fish:['#6fe0ff','#ffd2ec'],beast:['#9fe8b8','#f0fff4'],firework:['#ffcf5a','#ffe9f4'],gg:['#ffd76a','#eaf7ff']};
function glow(c,x,y,r,color,a=1){if(r<=0)return;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color+hex(a));g.addColorStop(1,color+'00');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}
function petalShape(c,len,wid,fill){c.fillStyle=fill;c.beginPath();c.moveTo(0,0);c.bezierCurveTo(-wid,-len*.35,-wid*.7,-len*.9,0,-len);c.bezierCurveTo(wid*.7,-len*.9,wid,-len*.35,0,0);c.fill();}

export function drawGiftStage(c,e,t,k,p,H,light=false){
  const level=giftStageLevel(e),[col,soft]=KIND_COLORS[e.kind]||['#ff8fb8','#fff0f6'];
  const fade=Math.max(0,Math.min(1,k/.1,(1-k)/.15)),open=ease(k/.35),x=p.x,feet=p.y+18,body=p.y-40,many=light?.5:1;
  c.save();c.globalAlpha=fade;
  // 1. Tối xung quanh, sáng chỗ người tặng (đèn sân khấu).
  const vg=c.createRadialGradient(x,body,60,x,body,620);vg.addColorStop(0,'rgba(4,6,18,0)');vg.addColorStop(1,`rgba(4,6,18,${(.5+level*.05).toFixed(2)})`);c.fillStyle=vg;c.fillRect(0,0,900,H);
  c.globalCompositeOperation='screen';
  // Lúc quà đến: chớp sáng + vòng sóng nổ tại người tặng.
  if(k<.14){const f=1-k/.14;glow(c,x,body,260*(1-f*.4),'#ffffff',.55*f);}
  if(k<.3){const w=k/.3;for(let i=0;i<2;i++){const ww=Math.max(0,w-i*.12);c.strokeStyle=soft+hex((1-ww)*.85);c.lineWidth=6-i*2;c.beginPath();c.ellipse(x,body,30+ww*260,(30+ww*260)*.6,0,0,TAU);c.stroke();}}
  // Viền hào quang quanh người tặng.
  glow(c,x,body-10,90,soft,.35+.1*Math.sin(t*.006));glow(c,x,body-30,48,'#ffffff',.25);
  // Chùm đèn chiếu xiên từ trên xuống (hình nón, khác cột sáng thẳng đứng của đột phá).
  const sx=x+(x>450?-140:140),cone=c.createLinearGradient(0,0,0,feet);cone.addColorStop(0,soft+'00');cone.addColorStop(.25,soft+hex(.18+level*.03));cone.addColorStop(1,col+hex(.28+level*.04));
  c.fillStyle=cone;c.beginPath();c.moveTo(sx-26,-10);c.lineTo(sx+26,-10);c.lineTo(x+120+level*12,feet+10);c.lineTo(x-120-level*12,feet+10);c.closePath();c.fill();
  // Vũng sáng dưới chân.
  c.save();c.translate(x,feet+6);c.scale(1,.3);glow(c,0,0,(150+level*30)*open,soft,.75);glow(c,0,0,(90+level*16)*open,col,.6);c.restore();
  // 2. Hoa nở dưới chân (mọi mốc): 2 tầng cánh mở ra.
  c.globalCompositeOperation='source-over';
  for(let layer=0;layer<2;layer++){const n=layer?8:10,len=(layer?78:110)*open*(1+level*.1),rot=t*.00025*(layer?-1:1);
    for(let i=0;i<n;i++){c.save();c.translate(x,feet);c.scale(1,.42);c.rotate(i*TAU/n+rot+(layer?TAU/16:0));
      const g=c.createLinearGradient(0,0,0,-len);g.addColorStop(0,soft+'f0');g.addColorStop(.55,col+'e0');g.addColorStop(1,col+(layer?'c0':'a0'));petalShape(c,len,len*.36,g);c.restore();}}
  c.globalCompositeOperation='screen';glow(c,x,feet-4,52*open,'#ffffff',.8);
  // 3. Mốc 2+: vòng xoáy cánh hoa + tia sáng quanh người, xoắn bay lên.
  if(level>=2){const n=Math.round((14+level*6)*many);
    for(let ring=0;ring<2;ring++)for(let i=0;i<n;i++){const u=((k*.9+i/n+ring*.5)%1),a=i/n*TAU+t*.0022*(ring?-1:1)+u*4,R=(70+ring*28)*(1-u*.35)*open,yy=feet-10-u*(170+level*20);
      const px=x+Math.cos(a)*R,py=yy+Math.sin(a)*R*.3;c.save();c.globalCompositeOperation='source-over';c.translate(px,py);c.rotate(a*2);c.globalAlpha=fade*(1-u*.6);petalShape(c,22,9,i%3?col:soft);c.restore();
      if(i%4===0)glow(c,px,py,8,'#ffffff',.6*(1-u));}}
  // 4. Mốc 3+: dải lụa xoáy lên trời + sóng xung kích dưới sàn + tia nổ.
  if(level>=3){c.lineCap='round';
    for(let j=0;j<3;j++){c.strokeStyle=[col,soft,'#ffe6a8'][j]+'b0';c.lineWidth=7-j*1.5;c.beginPath();
      for(let i=0;i<=40;i++){const u=i/40,a=u*TAU*1.6+t*.003+j*TAU/3,R=(80-u*30)*open,px=x+Math.cos(a)*R,py=feet-u*(feet-H*.12)*Math.min(1,k*2.2);i?c.lineTo(px,py):c.moveTo(px,py);}c.stroke();}
    for(let i=0;i<3;i++){const w=(k*1.6+i/3)%1;c.strokeStyle=soft+hex((1-w)*.7);c.lineWidth=3;c.beginPath();c.ellipse(x,feet+4,40+w*260,(40+w*260)*.28,0,0,TAU);c.stroke();}
    for(let b=0;b<Math.round(5*many);b++){const bk=(k*2+b*.23)%1,ang=b*2.4,bx=x+Math.cos(ang)*(130+b*12),by=body-60+Math.sin(ang)*90;
      for(let i=0;i<10;i++){const a=i*TAU/10,rr=ease(bk)*34;glow(c,bx+Math.cos(a)*rr,by+Math.sin(a)*rr,4,i%2?col:'#ffffff',1-bk);}}}
  // 5. Mốc 4: phi kiếm vàng xoay quanh rồi phóng lên + vương miện sáng + mưa vàng.
  if(level>=4){const launch=Math.max(0,(k-.55)/.35);
    for(let i=0;i<8;i++){const a=i*TAU/8+t*.0025,R=105*open,px=x+Math.cos(a)*R,py=body-20+Math.sin(a)*R*.35-ease(launch)*(body+60);
      c.save();c.translate(px,py);c.rotate(launch>0?0:a+Math.PI/2);c.fillStyle=i%2?'#ffe9a8':'#fff8e0';c.beginPath();c.moveTo(-2.5,-26);c.lineTo(2.5,-26);c.lineTo(3.5,9);c.lineTo(0,20);c.lineTo(-3.5,9);c.closePath();c.fill();c.fillRect(-9,-17,18,2.5);c.restore();glow(c,px,py,16,'#ffd56a',.5);}
    const cy=body-92,cs=ease((k-.1)/.3);c.save();c.translate(x,cy);c.scale(cs*1.6,cs*1.6);c.strokeStyle='#ffe08a';c.lineWidth=2;c.beginPath();c.moveTo(-22,8);c.lineTo(-24,-10);c.lineTo(-12,0);c.lineTo(0,-16);c.lineTo(12,0);c.lineTo(24,-10);c.lineTo(22,8);c.closePath();c.stroke();c.restore();glow(c,x,cy,60*cs,'#ffd56a',.55);
    for(let i=0;i<Math.round(40*many);i++){const u=(k*1.2+((Math.sin(i*91.7)+1)/2))%1,rx=((Math.sin(i*37.3)+1)/2)*900;c.fillStyle=i%2?'#ffe08a':'#fff7d6';c.fillRect(rx,u*H*.85,2,8);}}
  c.restore();
}
