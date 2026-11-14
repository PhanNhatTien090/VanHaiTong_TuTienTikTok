// V7: six premium gift-class spells. Pure Canvas over the REAL server receipt.
// Never invents damage/heal values, does not mutate ward/HP, respects RenderBudget.
const TAU=Math.PI*2,clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const ease=x=>1-(1-clamp(x))**3;
export const V7_GIFT_SPELLS=Object.freeze([
 {min:100,key:'sword',name:'LINH KIẾM THIÊN KÍCH',color:'#ffe6b1'},
 {min:500,key:'phoenix',name:'XÍCH PHƯỢNG PHẦN THIÊN',color:'#ff8a56'},
 {min:700,key:'thunder',name:'TỬ LÔI LONG ẢNH',color:'#d5aaff'},
 {min:1000,key:'dual',name:'LONG PHƯỢNG SONG SINH',color:'#ffd1a0'},
 {min:1500,key:'lotus',name:'THẦN LIÊN HỒI NGUYÊN',color:'#b7ffdb'},
 {min:2000,key:'judgment',name:'VẠN KIẾM HUYỀN LONG',color:'#ffe3a7'}
]);
export function giftV7Spell(value){
 value=Number(value);if(!Number.isFinite(value)||value<100)return null;
 let v=V7_GIFT_SPELLS[0];for(const q of V7_GIFT_SPELLS)if(value>=q.min)v=q;return v;
}
function stroke(c,x,y,xx,yy,color,w,alpha){
 c.strokeStyle=color;c.lineWidth=w;c.globalAlpha=alpha;
 c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.stroke();
}
function ring(c,x,y,r,color,alpha,oval=.45){
 c.strokeStyle=color;c.globalAlpha=alpha;c.lineWidth=4;
 c.beginPath();c.ellipse(x,y,r,r*oval,0,0,TAU);c.stroke();
}
function sword(c,x,y,angle,size,col,alpha=1){
 c.save();c.translate(x,y);c.rotate(angle);c.globalAlpha=alpha;
 c.fillStyle=col;c.strokeStyle='#fffaf0';c.lineWidth=1.6;
 c.beginPath();c.moveTo(0,-size);c.lineTo(size*.14,-size*.25);c.lineTo(size*.10,size*.52);
 c.lineTo(0,size*.66);c.lineTo(-size*.10,size*.52);c.lineTo(-size*.14,-size*.25);c.closePath();
 c.fill();c.stroke();c.restore();
}
export function drawGiftOverdriveV7(scene,c,e,t,actor,target,H){
 if(!e||e.mode!=='duel'||scene.v7Overdrive===false||scene.cinematicV2===false)return false;
 const spec=giftV7Spell(e.value);
 if(!spec||!e.profile?.duration)return false;
 const p=(t-e.start)/e.profile.duration;
 if(p<.08||p>.74)return false;
 const low=!!(scene.budget?.crowded||scene.budget?.pressured||scene.budget?.level==='light'||scene.fps>0&&scene.fps<19);
 const n=low?6:14,attack=clamp((p-.17)/.27),fade=clamp((.74-p)/.23);
 const sourceX=actor?.x??450,sourceY=(actor?.y??H*.65)-190;
 const hitX=target?.x??450,hitY=(target?.y??H*.65)-125;
 const x=sourceX+(hitX-sourceX)*ease(attack),y=sourceY+(hitY-sourceY)*ease(attack)-Math.sin(attack*Math.PI)*110;
 const radius=(65+attack*210)*(low?.75:1);
 c.save();c.lineCap='round';c.lineJoin='round';
 // Visual distinctions per price class, not recolored duplicate circles.
 if(spec.key==='sword'){
  sword(c,x,y,Math.atan2(hitY-sourceY,hitX-sourceX)+Math.PI/2,70,spec.color,fade);
  stroke(c,sourceX,sourceY,x,y,spec.color,5,fade*.73);
 }else if(spec.key==='phoenix'){
  for(let i=0;i<n;i++){
   const a=i*TAU/n+t*.001,spread=radius*(.45+i%3*.09);
   stroke(c,x+Math.cos(a)*spread,y+Math.sin(a)*spread*.45,
    x+Math.cos(a)*spread*1.42,y-Math.sin(a)*spread*.18,
    i%2?'#ffea8b':'#ff653f',3+i%3,fade*.77);
  }
  ring(c,x,y,radius*.8,'#ffd1a0',fade*.62);
 }else if(spec.key==='thunder'){
  for(let i=0;i<n;i++){
   const a=i*TAU/n,xx=x+Math.cos(a)*radius,yy=y+Math.sin(a)*radius;
   stroke(c,xx,yy,x+(xx-x)*.42,y+(yy-y)*.2,i%3?'#a98aff':'#e8f7ff',3+i%3,fade*.86);
  }
  ring(c,x,y,radius,'#d6b1ff',fade);
 }else if(spec.key==='dual'){
  for(const dir of [-1,1]){
   for(let i=0;i<n/2;i++){
    const u=i/(n/2),a=u*TAU+attack*3*dir;
    const xx=x+Math.sin(a)*radius*.8,yy=y+Math.cos(a)*radius*.45;
    stroke(c,xx,yy,xx+Math.cos(a+dir)*36,yy-44,
      dir<0?'#95f7ff':'#ffc790',5,fade*.74);
   }
  }
 }else if(spec.key==='lotus'){
  const heal=e.wardEffect?.kind==='shield-heal'||e.wardEffects?.some(a=>a.kind==='shield-heal');
  const cx=heal?sourceX:hitX,cy=heal?sourceY:hitY;
  for(let i=0;i<n;i++){
   const a=i*TAU/n+t*.0003,r=radius*(.55+attack*.3);
   c.save();c.translate(cx+Math.cos(a)*r*.55,cy+Math.sin(a)*r*.25);
   c.rotate(a);c.globalAlpha=fade*.65;c.fillStyle=heal?'#c8ffe2':'#ffe3b9';
   c.beginPath();c.ellipse(0,-21,8,28,0,0,TAU);c.fill();c.restore();
  }
  ring(c,cx,cy,radius,heal?'#8dffd2':'#ffce90',fade);
 }else if(spec.key==='judgment'){
  for(let i=0;i<n;i++){
   const a=i*TAU/n+t*.0004,rr=radius*(.55+(i%3)*.13);
   sword(c,x+Math.cos(a)*rr,y+Math.sin(a)*rr*.7,
    Math.atan2(hitY-sourceY,hitX-sourceX)+Math.PI/2,25+i%3*9,
    i%3?'#fff9db':'#a5ecff',fade*.86);
  }
  sword(c,x,y,Math.atan2(hitY-sourceY,hitX-sourceX)+Math.PI/2,110,'#fff8cf',fade);
 }
 if(attack>.45){
  const hit=clamp((attack-.45)/.55),r=70+hit*(spec.key==='judgment'?340:245);
  ring(c,hitX,hitY,r,spec.color,(1-hit)*fade);
  ring(c,hitX,hitY,r*.72,'#fff7e2',(1-hit)*fade*.67);
 }
 c.restore();return true;
}
