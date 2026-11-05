// Shared raid clock; purely visual retaliation, no invented player health/currency loss.
export const ABYSS_BOSS=Object.freeze({species:'abyss-dragon',name:'Hắc Uyên Ma Long',worldBoss:true,hpMultiplier:10,duration:300000,reward:'dragon-pearl',skill:'Hắc Diễm Diệt Trận',color:'#ff735d'});
export const ABYSS_SECT_REWARD=Object.freeze({qi:500,stones:200,herbs:15});
const TAU=Math.PI*2,clamp=v=>Math.max(0,Math.min(1,v)),ease=v=>{v=clamp(v);return v*v*(3-2*v);};
export function abyssPhase(b,now){
 if(b?.species!==ABYSS_BOSS.species)return null;
 const age=Math.max(0,now-b.startedAt),enraged=b.hp/b.maxHp<=.3,period=enraged?9000:12000,k=(age%period)/period,
 id=k<.30?'charge':k<.50?'strike':k<.82?'exposed':'recover';
 return {id,name:id==='charge'?'TỤ HẮC DIỄM':id==='strike'?'LONG TỨC · TÔNG MÔN KẾT GIỚI':id==='exposed'?'LỘ SƠ HỞ · PHẢN CÔNG':'THU TRẢO HỒI KHÍ',progress:k,enraged,period,cycle:Math.floor(age/period),mult:id==='exposed'?1.8:id==='charge'?.8:1,color:ABYSS_BOSS.color,skill:ABYSS_BOSS.skill};
}
export function prepareAbyssArt(scene){
 if(scene.abyssArt||scene.abyssLoading||typeof Image==='undefined')return;
 scene.abyssLoading=true;const im=new Image();im.onload=()=>scene.abyssArt=im;im.onerror=()=>scene.abyssLoading=false;im.src='/assets/abyss-dragon-v1/abyss-dragon.png';
}
function glow(c,x,y,r,color,alpha){if(alpha<=0)return;c.save();c.globalAlpha*=alpha;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,color+'00');c.fillStyle=g;c.fillRect(x-r,y-r,2*r,2*r);c.restore();}
export function abyssPose(b,now,motion=true){
 const p=abyssPhase(b,now);if(!p)return null;const k=motion?p.progress:.15,
 charge=p.id==='charge'?ease(k/.3):0,strike=p.id==='strike'?Math.sin(clamp((k-.3)/.2)*Math.PI):0;
 return {p,charge,strike,dy:motion?-charge*24+strike*88+Math.sin((now-b.startedAt)*.0018)*6:0,scale:1+strike*.08+charge*.025,angle:motion?Math.sin((now-b.startedAt)*.0007)*.018-strike*.045:0};
}
export function drawAbyssBoss(c,b,now,x,y,art,motion=true){
 const pose=abyssPose(b,now,motion);if(!pose)return false;const age=Math.max(0,now-b.startedAt),entry=motion?ease(age/1800):1,{p,charge,strike}=pose;
 c.save();c.translate(x,y-240*(1-entry)+pose.dy);c.rotate(pose.angle);c.scale(pose.scale,pose.scale);
 glow(c,0,60,300,'#c3292a',.20+charge*.14);glow(c,0,-15,130,'#ff7844',charge*.3);
 if(art){const w=600,h=w*(art.naturalHeight||art.height)/(art.naturalWidth||art.width),bands=18;
  // Head remains stable. The heavy lower coils lag behind the lunge.
  for(let i=0;i<bands;i++){const u=i/bands,shift=motion?Math.sin(age*.0018-u*4)*6*Math.max(0,u-.3):0;c.drawImage(art,0,i*(art.naturalHeight||art.height)/bands,art.naturalWidth||art.width,(art.naturalHeight||art.height)/bands, -w/2+shift,-h*.46+i*h/bands,w,h/bands+.7);}
 }else{glow(c,-42,-10,16,'#ff5939',1);glow(c,42,-10,16,'#ff5939',1);}
 if(p.id==='charge'){for(let i=0;i<16;i++){const u=(charge+i/16)%1,a=i*2.399,r=160*(1-u);glow(c,Math.cos(a)*r,10+Math.sin(a)*r*.6,4+u*5,'#ffb06a',Math.sin(u*Math.PI)*.8);}}
 c.restore();return true;
}
export function drawAbyssRetaliation(scene,c,b,now,H,layer='front'){
 if(b?.species!==ABYSS_BOSS.species)return;const motion=scene.motion!==false,pose=abyssPose(b,now,motion),{p}=pose,targets=scene.targets||[];
 const x=450,y=H*.32+pose.dy+30,ground=H*.68;
 c.save();
 if(layer==='back'&&p.id==='charge'){
  const u=ease(p.progress/.3);c.strokeStyle='#ff745e';c.lineWidth=2;c.globalAlpha=.2+u*.35;
  c.beginPath();c.ellipse(450,ground,100+u*250,24+u*45,0,0,TAU);c.stroke();
  for(let i=0;i<3;i++){c.beginPath();c.arc(450,ground,45+u*190+i*15,Math.PI*1.1,Math.PI*1.9);c.stroke();}
 }
 if(layer==='front'&&p.id==='strike'){
  const u=clamp((p.progress-.3)/.2),power=Math.sin(u*Math.PI),reach=ease(u/.5),wave=ground+50;
  c.globalCompositeOperation='screen';
  // Three curved ribbons of black-red flame travel from the mouth into the shield.
  for(let i=0;i<3;i++){
   const tx=260+i*190,ty=y+(wave-y)*reach,gradient=c.createLinearGradient(x,y,tx,ty);gradient.addColorStop(0,'#fff0bb');gradient.addColorStop(.25,'#ff9155');gradient.addColorStop(.75,'#e22c3866');gradient.addColorStop(1,'#a6273700');
   c.strokeStyle=gradient;c.lineWidth=(18+i*7)*power;c.lineCap='round';c.beginPath();c.moveTo(x,y);c.bezierCurveTo(x+(i-1)*30,y+100,tx+(i-1)*70,ty-120,tx,ty);c.stroke();
  }
  const n=scene.budget?.level==='light'?20:36;
  for(let i=0;i<n;i++){const v=(u*2+i/n)%1,xx=x+Math.sin(i*2.399+v*4)*v*230,yy=y+(wave-y)*v;glow(c,xx,yy,4+i%4,'#ff794c',power*(1-v)*.7);}
  // The sect's protective barrier catches the attack, then ripples across actual allies.
  c.globalAlpha=power*.85;c.strokeStyle='#a8e9ff';c.lineWidth=3;c.beginPath();c.ellipse(450,wave,330,95,0,Math.PI,TAU);c.stroke();
  for(let i=0;i<Math.min(12,targets.length);i++){const a=targets[i],pulse=power*(.6+.4*Math.sin(i+u*9));c.globalAlpha=Math.max(0,pulse)*.75;c.lineWidth=1.5;c.beginPath();c.ellipse(a.x,a.y-35,24,40,0,Math.PI,TAU);c.stroke();}
 }
 c.restore();
}
export function drawAbyssHealth(c,b,now,H){
 if(b?.species!==ABYSS_BOSS.species)return;const ratio=clamp(b.hp/b.maxHp),p=abyssPhase(b,now),fmt=n=>Math.ceil(n).toLocaleString('vi-VN'),x=85,y=H*.105,w=730;
 c.save();c.fillStyle='#160f20e8';c.fillRect(x-16,y-57,w+32,126);c.strokeStyle='#ae6558';c.lineWidth=1;c.strokeRect(x-16,y-57,w+32,126);
 c.font='bold 28px Arial';c.fillStyle='#ffe2bb';c.textAlign='left';c.fillText('HẮC UYÊN MA LONG · MÁU ×10',x,y-20,w);
 c.fillStyle='#351c2b';c.fillRect(x,y,w,24);const g=c.createLinearGradient(x,0,x+w,0);g.addColorStop(0,'#9e2441');g.addColorStop(1,'#ff8252');c.fillStyle=g;c.fillRect(x,y,w*ratio,24);
 c.font='bold 18px Arial';c.textAlign='center';c.fillStyle='#fff9e8';c.fillText(`${fmt(b.hp)} / ${fmt(b.maxHp)} · ${Math.round(ratio*100)}%`,450,y+19);
 c.font='17px Arial';c.fillStyle=p.enraged?'#ff9d8e':'#dfc4ba';c.fillText(`${p.enraged?'CUỒNG NỘ · ':''}${p.name} · ${Math.max(0,Math.ceil((b.endsAt-now)/1000))}s`,450,y+48,w);
 c.restore();
}
