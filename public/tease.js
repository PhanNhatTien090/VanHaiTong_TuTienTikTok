// 10/11/2026: CHỌC GHẸO (server: tease.mjs) — dây tim cong nối 2 người trên sân, tim lớn đập ở giữa, tim nhỏ bay lên.
// Nếu 1 trong 2 người không có trên sân (đang đua/mê cung…) thì hiện thẻ tim ở phía trên sân. 4 kiểu màu/câu (style) để không lặp y hệt.
const TAU=Math.PI*2,clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const STYLES=[{c:'#ff5c9a',g:'255,92,154',w:'TÂM ĐẦU Ý HỢP?'},{c:'#ff4d4d',g:'255,77,77',w:'CÓ TÌNH Ý ĐÓ NHA!'},{c:'#c77dff',g:'199,125,255',w:'TRỜI SE DUYÊN?'},{c:'#ffb347',g:'255,179,71',w:'XỨNG ĐÔI GHÊ!'}];
export function syncTease(scene,state){const t=state.tease;const now=state.serverNow||Date.now();scene.tease=t&&t.until>now?t:null;if(scene.tease){scene.teaseAt??=new Map();if(!scene.teaseAt.has(t.id))scene.teaseAt.set(t.id,performance.now());}}
export const teaseIds=scene=>scene.tease?[scene.tease.a,scene.tease.b]:[];
function heart(c,x,y,s,fill){c.save();c.translate(x,y);c.scale(s/16,s/16);c.beginPath();c.moveTo(0,5);c.bezierCurveTo(-16,-6,-8,-18,0,-9);c.bezierCurveTo(8,-18,16,-6,0,5);c.closePath();c.fillStyle=fill;c.fill();c.restore();}
function txt(c,s,x,y,font,fill,stroke=6){c.font=font;c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';c.lineWidth=stroke;c.strokeStyle='#1a0610';c.strokeText(s,x,y);c.fillStyle=fill;c.fillText(s,x,y);}
export function drawTease(scene,c,t){
 const e=scene.tease;if(!e)return;const start=scene.teaseAt?.get(e.id)??t,age=(t-start)/1000,dur=(e.until-e.at)/1000;if(age>dur+.3)return;
 const fade=Math.min(clamp(age/.5),clamp((dur-age)/.8)),S=STYLES[e.style%STYLES.length],H=scene.height;
 const ta=scene.targets?.find(x=>x.id===e.a),tb=scene.targets?.find(x=>x.id===e.b);
 c.save();c.globalAlpha=fade;
 if(ta&&tb){
  const head=x=>[x.x,x.y-34*(x.scale||1)],[ax,ay]=head(ta),[bx,by]=head(tb),mx=(ax+bx)/2,my=Math.min(ay,by)-60-Math.abs(ax-bx)*.12,grow=clamp(age/1.2);
  // dây tim: đường cong vẽ dần từ 2 đầu vào giữa
  c.lineCap='round';
  const pt=(u)=>{const v=1-u;return [v*v*ax+2*v*u*mx+u*u*bx,v*v*ay+2*v*u*my+u*u*by];};
  for(const [w,col] of [[12,`rgba(${S.g},.25)`],[5,`rgba(${S.g},.95)`],[1.6,'#fff']]){c.lineWidth=w;c.strokeStyle=col;c.beginPath();for(let i=0;i<=24;i++){const u=i/24*grow*.5;const [x,y]=pt(u);i?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();c.beginPath();for(let i=0;i<=24;i++){const u=1-i/24*grow*.5;const [x,y]=pt(u);i?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();}
  {const b2=1+.18*Math.max(0,Math.sin(age*7+1));for(const [x,y] of [[ax,ay],[bx,by]]){heart(c,x,y-6,24*b2,S.c);heart(c,x,y-7,12*b2,'#fff0f6');}}
  for(let i=1;i<10;i++){const u=(i/10+age*.15)%1;if(Math.abs(u-.5)>grow*.5)continue;const [x,y]=pt(u);heart(c,x,y,7,S.c);}
  if(grow>=1){const beat=1+.14*Math.max(0,Math.sin(age*7)),[hx,hy]=pt(.5);heart(c,hx,hy+4,30*beat,S.c);heart(c,hx,hy+2,16*beat,'#fff0f6');txt(c,S.w,hx,hy-40,'900 22px Segoe UI','#fff',6);}
  // tim nhỏ bay lên từ đầu 2 người
  for(const [x,y,k] of [[ax,ay,1],[bx,by,7]])for(let i=0;i<4;i++){const p=(age*.6+i/4+k*.13)%1;heart(c,x+Math.sin(p*9+i)*14,y-p*70,6+p*6,`rgba(${S.g},${(1-p).toFixed(2)})`);}
 }else{
  // thẻ tim phía trên sân
  const y=H*.2,pop=.85+.15*clamp(age/.4),beat=1+.1*Math.max(0,Math.sin(age*7));c.translate(450,y);c.scale(pop,pop);
  c.fillStyle='rgba(30,6,20,.82)';c.beginPath();c.roundRect?.(-300,-70,600,140,28);c.fill();c.strokeStyle=S.c;c.lineWidth=3;c.stroke();
  heart(c,0,8,40*beat,S.c);txt(c,String(e.aName).slice(0,16),-160,4,'900 30px Segoe UI','#fff',6);txt(c,String(e.bName).slice(0,16),160,4,'900 30px Segoe UI','#fff',6);txt(c,S.w,0,-48,'900 20px Segoe UI',S.c,5);
 }
 c.restore();
}
