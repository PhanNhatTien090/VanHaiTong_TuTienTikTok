// Permanent cosmetics; never affect speed or equipped combat artifacts.
export const RACE_SWORD_SKINS=Object.freeze([
 {id:'race-emperor',name:'Thương Long Đế Kiếm',color:'#5de5ff',edge:'#ffe3a3',dark:'#12396d',cell:1,motif:'dragon'},
 {id:'race-moon',name:'Tinh Hà Nguyệt Kiếm',color:'#dcafff',edge:'#fff0cd',dark:'#49216f',cell:2,motif:'moon'},
 {id:'race-frost',name:'Băng Liên Thần Kiếm',color:'#86ffe2',edge:'#e5ffff',dark:'#165466',cell:0,motif:'lotus'},
 // 07/11: giải nhất Đua phi kiếm (thay Thương Long). Ảnh riêng, hiệu ứng lấp lánh nháy liên tục.
 {id:'race-cuu-thien',name:'Cửu Thiên Lưu Ly Kiếm',color:'#ffc8f2',edge:'#fff4c8',dark:'#5b2d86',cell:3,motif:'phoenix',sparkle:true,art:'/assets/events-v1/sword-cuu-thien-v1.png'},
 ...[
 ['thai-duong','Thái Dương Long Kiếm','#ffdc84','dragon'],
 ['tu-tinh','Tử Tinh Trảm Nguyệt','#d9a6ff','moon'],
 ['thanh-cot','Thanh Long Cốt Kiếm','#89ffe0','dragon'],
 ['xich-phuong','Xích Phượng Hoàng Vũ','#ff8f70','phoenix'],
 ['bach-bang','Bạch Băng Hàn Quang','#a2e7ff','lotus'],
 ['dao-lien','Đào Liên Kiếm','#ffb7cf','lotus'],
 ['lam-loi','Lam Lôi Kiếm','#9db9ff','dragon'],
 ['u-anh','U Ảnh Kiếm','#d5c2ff','moon'],
 ['thanh-truc','Thanh Trúc Kiếm','#acffc9','lotus'],
 ['ho-phach','Hổ Phách Kiếm','#ffca82','phoenix']
 ].map(([slug,name,color,motif],i)=>({id:'race-'+slug,name,color,motif,edge:'#fff2d4',dark:'#20253b',prize:i<4?'elite':'standard',file:'/assets/thien-khuyet/sword-'+slug+'.webp'}))
]);
// Ngôi sao 4 cánh nháy theo nhịp riêng dọc lưỡi kiếm + vầng cầu vồng thở + thỉnh thoảng một chớp sáng lớn.
// Khung toạ độ: kiếm dựng đứng, mũi ở y=-len/2, chuôi ở y=+len/2, tâm (0,0).
const RAINBOW=['#ff9ad5','#ffe27a','#8ff3ff','#c9a2ff','#ffffff','#9dffc8'];
function star(c,x,y,r,color){c.fillStyle=color;c.beginPath();c.moveTo(x,y-r);c.quadraticCurveTo(x,y,x+r*.32,y);c.quadraticCurveTo(x,y,x,y+r);c.quadraticCurveTo(x,y,x-r*.32,y);c.quadraticCurveTo(x,y,x,y-r);c.fill();c.beginPath();c.moveTo(x-r*.7,y);c.quadraticCurveTo(x,y,x,y-r*.22);c.quadraticCurveTo(x,y,x+r*.7,y);c.quadraticCurveTo(x,y,x,y+r*.22);c.quadraticCurveTo(x,y,x-r*.7,y);c.fill();}
export function drawSwordSparkle(c,t,len,motion=true,light=false){
 const clock=motion?t*.001:.35,w=len*.22;c.save();c.globalCompositeOperation='lighter';
 // vầng cầu vồng ôm thân kiếm, đổi màu chậm
 const hueI=Math.floor(clock*.8)%RAINBOW.length,next=RAINBOW[(hueI+1)%RAINBOW.length],pulse=.5+.5*Math.sin(clock*3.2);
 c.save();c.translate(0,-len*.14);c.scale(.42,1);const g=c.createRadialGradient(0,0,0,0,0,len*.5);g.addColorStop(0,next+'66');g.addColorStop(.45,RAINBOW[hueI]+'26');g.addColorStop(1,RAINBOW[hueI]+'00');c.globalAlpha=.5+.4*pulse;c.fillStyle=g;c.beginPath();c.arc(0,0,len*.5,0,Math.PI*2);c.fill();c.restore();
 // ngôi sao nháy: mỗi ngôi một chu kỳ, bật sáng rồi tắt hẳn (hiệu ứng "nháy nháy")
 const n=light?8:16;
 for(let i=0;i<n;i++){const seed=i*97.13,period=.7+(i%4)*.21,u=((clock+seed%1.7)/period)%1,on=u<.34?Math.sin(u/.34*Math.PI):0;if(on<=0)continue;
  const along=-len*.48+((i*.618)%1)*len*.86,side=((i*.377)%1-.5)*w*(along>len*.05?2.2:.9);c.globalAlpha=on;star(c,side,along,(9+(i%3)*5)*on*len/240,RAINBOW[i%RAINBOW.length]);star(c,side,along,(3.5+(i%3)*1.5)*on*len/240,'#ffffff');}
 // chớp sáng lớn ở mũi kiếm và ngọc chuôi mỗi ~1,6 giây
 const flash=(clock%1.6)/1.6,f=flash<.12?Math.sin(flash/.12*Math.PI):0;
 if(f>0){c.globalAlpha=f;star(c,0,-len*.46,len*.11*f,'#ffffff');star(c,0,len*.13,len*.08*f,'#ffe6ff');}
 // vệt sáng quét dọc lưỡi
 const sweep=(clock*.55)%1;c.globalAlpha=.3*Math.sin(sweep*Math.PI);const sg=c.createLinearGradient(0,-len*.48+sweep*len*.6-len*.05,0,-len*.48+sweep*len*.6+len*.05);sg.addColorStop(0,'#ffffff00');sg.addColorStop(.5,'#ffffff');sg.addColorStop(1,'#ffffff00');c.fillStyle=sg;c.fillRect(-w*.12,-len*.5,w*.24,len*.62);
 c.restore();
}
export function raceSwordFor(p={}){return RACE_SWORD_SKINS.find(s=>s.id===p.raceSwordChoice&&p.raceSwordSkins?.includes(s.id))||RACE_SWORD_SKINS.find(s=>p.raceSwordSkins?.includes(s.id));}
export function racePrizeImage(scene,skin){
 if(!skin?.file||typeof Image==='undefined')return null;
 const cache=scene.racePrizeArt??=new Map();
 if(!cache.has(skin.file)){const img=new Image();img.decoding='async';img.src=skin.file;cache.set(skin.file,img);}
 const img=cache.get(skin.file);return img.complete&&img.naturalWidth?img:null;
}
export function drawRaceSword(scene,c,a,t){
 const skin=raceSwordFor(a.player),scale=(a.scale||1.5)/1.5;
 if(!skin){scene.drawRaceBaseSword?.(c,a,t);return;}
 const img=racePrizeImage(scene,skin);
 if(img){
   c.save();c.translate(a.x,a.y+31*scale);c.rotate(-.07-(a.kick||0)*.22);
   const w=(skin.prize==='elite'?226:197)*scale,h=w*img.naturalHeight/img.naturalWidth;
   c.drawImage(img,-w/2,-h/2,w,h);
   if(skin.prize==='elite'&&scene.motion!==false){
    const u=(t*.001)%1;c.globalAlpha=Math.sin(u*Math.PI)*.9;star(c,(u-.5)*w*.84,-5*scale,10*scale,skin.color);
   }
   c.restore();return;
 }
 const art=scene.prestigeSwords?.[skin.cell];
 if(art){c.save();c.translate(a.x,a.y+32*scale);c.rotate(Math.PI/2-.04);c.drawImage(art,-56*scale,-120*scale,112*scale,240*scale);if(skin.sparkle)drawSwordSparkle(c,t,240*scale,scene.motion!==false,scene.budget?.level==='light');c.restore();return;}
 c.save();c.translate(a.x,a.y+32*scale);c.scale(scale,scale);c.rotate(-.04+(a.boost?-.035:0));
 const path=(pts,fill,stroke)=>{c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.3;c.stroke();}};
 const metal=c.createLinearGradient(0,-15,0,16);metal.addColorStop(0,skin.edge);metal.addColorStop(.28,skin.color);metal.addColorStop(.48,'#ffffff');metal.addColorStop(.55,skin.dark);metal.addColorStop(1,skin.color);
 path([[-48,-9],[35,-13],[84,-8],[127,0],[84,8],[35,13],[-48,9]],metal,skin.edge);
 path([[-38,0],[65,-4],[115,0],[65,4]],skin.dark);c.strokeStyle=skin.edge;c.lineWidth=1;c.beginPath();c.moveTo(-35,0);c.lineTo(105,0);c.stroke();
 // Sculpted twin guards: dragon horns, crescent blades, or layered lotus petals.
 for(const side of [-1,1]){c.save();c.scale(1,side);
 const pts=skin.motif==='dragon'?[[-55,0],[-64,-21],[-41,-30],[-45,-14],[-21,-22],[-34,-8]]:skin.motif==='moon'?[[-56,0],[-67,-24],[-43,-34],[-52,-18],[-28,-24],[-35,-8]]:[[-56,0],[-65,-18],[-52,-32],[-43,-15],[-23,-19],[-36,-6]];
 path(pts,metal,skin.edge);c.restore();}
 c.fillStyle=skin.dark;c.strokeStyle=skin.edge;c.lineWidth=2;c.beginPath();c.roundRect(-93,-5,42,10,4);c.fill();c.stroke();
 for(let i=0;i<5;i++){c.beginPath();c.moveTo(-87+i*7,-5);c.lineTo(-83+i*7,5);c.stroke();}
 path([[-105,0],[-96,-9],[-87,0],[-96,9]],skin.color,skin.edge);
 path([[-63,0],[-51,-10],[-39,0],[-51,10]],skin.dark,skin.edge);path([[-58,0],[-51,-6],[-44,0],[-51,6]],skin.color);
 // Engraving and restrained moving reflections belong to the sword surface itself.
 c.strokeStyle=skin.edge;c.lineWidth=1;for(let i=0;i<4;i++){const x=i*18;c.beginPath();c.moveTo(x-7,-6);c.lineTo(x,-2);c.lineTo(x+7,-6);c.stroke();}
 const phase=scene.motion===false?.5:(t*.0006)%1;c.globalAlpha=.7;c.fillStyle='#ffffff';c.beginPath();c.ellipse(-30+phase*105,0,2,7,Math.PI/5,0,Math.PI*2);c.fill();c.restore();
}
