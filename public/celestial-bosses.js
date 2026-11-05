import {makeSurface} from './performance.js';
export const CELESTIAL_BOSSES=Object.freeze([
 {species:'azure-dragon',name:'Thương Long Vân Hải',cell:0,celestial:true,reward:'dragon-pearl',skill:'Long Tức Xuyên Vân',color:'#82e6ef'},
 {species:'sky-kun',name:'Tinh Hải Cự Côn',cell:1,celestial:true,reward:'kun-heart',skill:'Tinh Hải Triều Dâng',color:'#9cbaff'},
 {species:'moon-fox',name:'Cửu Vĩ Nguyệt Hồ',cell:2,celestial:true,reward:'moon-fox-jade',skill:'Cửu Ảnh Nguyệt Luân',color:'#e9bcff'}
]);
export const CELESTIAL_RELICS=Object.freeze([
 {id:'dragon-pearl',type:'artifact',name:'Thương Long Đạo Châu',icon:'orb',tier:0,price:0,herbs:0,damage:55,bonus:.35,exclusive:true,eventReward:'Thương Long Vân Hải · Top công lực',description:'Long châu: +55 công lực, +35% tu vi.',cell:2},
 {id:'kun-heart',type:'artifact',name:'Tinh Hải Côn Tâm',icon:'orb',tier:0,price:0,herbs:0,damage:45,bonus:.45,exclusive:true,eventReward:'Tinh Hải Cự Côn · Top công lực',description:'Tinh hạch biển trời: +45 công lực, +45% tu vi.',cell:3},
 {id:'moon-fox-jade',type:'artifact',name:'Cửu Vĩ Nguyệt Ngọc',icon:'orb',tier:0,price:0,herbs:0,damage:50,bonus:.40,exclusive:true,eventReward:'Cửu Vĩ Nguyệt Hồ · Top công lực',description:'Nguyệt ngọc: +50 công lực, +40% tu vi.',cell:1}
]);
export function celestialPhase(b,now){const d=CELESTIAL_BOSSES.find(d=>d.species===b?.species);if(!d)return null;const period=d.cell===1?16000:d.cell===2?14000:12000,at=Math.max(0,now-b.startedAt)%period,k=at/period;let id,mult,name;
 if(d.cell===2){id=k<.42?'illusion':k<.65?'strike':'exposed';mult=id==='illusion'?.65:id==='exposed'?1.85:1;name=id==='illusion'?'PHÂN THÂN · chờ chân thân':id==='exposed'?'CHÂN THÂN HIỆN · đánh ngay':d.skill.toUpperCase();}
 else {id=k<.32?'charge':k<.56?'strike':'exposed';mult=id==='exposed'?(d.cell===1?1.65:1.8):id==='charge'?.85:1;name=id==='charge'?(d.cell===1?'HÚT LINH TRIỀU':'TỤ LONG TỨC'):id==='exposed'?'LỘ SƠ HỞ · đánh ngay':d.skill.toUpperCase();}
 return {id,name,mult,progress:k,color:d.color,skill:d.skill,enraged:b.hp/b.maxHp<.3};}
export function loadCelestialArt(scene){if(scene.celestialArtLoading||scene.celestialSprites||typeof Image==='undefined')return;scene.celestialArtLoading=true;const im=new Image();im.onload=()=>{scene.celestialSprites=[];for(let i=0;i<3;i++){const f=makeSurface(320,480);if(!f)continue;f.getContext('2d').drawImage(im,i*im.naturalWidth/3,0,im.naturalWidth/3,im.naturalHeight,0,0,320,480);scene.celestialSprites.push(f);}};im.onerror=()=>{scene.celestialArtLoading=false;};im.src='/assets/events-v1/celestial-bosses-v1.png';}
export function drawCelestialBoss(c,b,now,x,y,sprites){const d=CELESTIAL_BOSSES.find(d=>d.species===b.species);if(!d)return false;const art=sprites?.[d.cell];if(!art)return false;const p=celestialPhase(b,now),age=Math.max(0,now-b.startedAt),a=age*.002,entry=Math.max(0,1-age/1800),attack=p.id==='strike'?Math.sin(Math.min(1,(p.progress-.32)/.24)*Math.PI):0;
 c.save();c.translate(x+(d.cell===1?Math.sin(a*.25)*65:Math.sin(a*.4)*12),y-entry*320+Math.sin(a*.6)*9+attack*24);c.strokeStyle=d.color;c.lineWidth=2;
 if(d.cell===2&&p.id==='illusion'){for(const side of [-1,1]){c.save();c.globalAlpha=.22;c.translate(side*(100+Math.sin(a)*16),8);c.drawImage(art,-135,-220,270,405);c.restore();}}
 if(d.cell===1){for(let i=0;i<3;i++){const k=(age*.00018+i/3)%1;c.globalAlpha=(1-k)*.6;c.beginPath();c.ellipse(0,70+k*100,60+k*190,18+k*42,0,0,Math.PI*2);c.stroke();}c.globalAlpha=1;}
 c.save();c.rotate(d.cell===1?Math.sin(a*.7)*.055:d.cell===0?Math.sin(a*.6)*.06:0);const breath=1+Math.sin(a)*.014;c.scale(breath,1/breath);c.drawImage(art,-175,-260,350,525);c.restore();
 if(d.cell===0&&p.id==='strike'){c.globalAlpha=.75;c.lineWidth=4;for(let i=0;i<3;i++){c.beginPath();c.moveTo(0,-70);c.bezierCurveTo(-85+i*80,0,80-i*70,110,(i-1)*150,200);c.stroke();}}
 if(d.cell===2){c.globalAlpha=.65;for(let i=0;i<5;i++){const q=a*.3+i*Math.PI*2/5;c.beginPath();c.arc(Math.cos(q)*135,-30+Math.sin(q)*45,8,0,Math.PI*1.45);c.stroke();}}
 if(p.id==='charge'||p.id==='exposed'){c.globalAlpha=.55;c.lineWidth=p.id==='exposed'?3:1;c.beginPath();c.ellipse(0,-30,100+Math.sin(a)*8,130,Math.sin(a*.3)*.1,0,Math.PI*2);c.stroke();}
 c.restore();return true;}
