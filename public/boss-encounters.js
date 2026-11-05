import {abyssPhase} from './abyss-boss.js';
import {celestialPhase} from './celestial-bosses.js';
// Shared encounter clock: server damage and client animation use identical phases.
export const ELITE_BOSSES=Object.freeze([
 {species:'storm-tiger',name:'Lôi Hổ Thiên Kiếp',cell:0,elite:true,reward:'storm-fang',skill:'Thiên Lôi Bổ Địa',color:'#a4ddff'},
 {species:'astral-tortoise',name:'Huyền Vũ Tinh Hà',cell:1,elite:true,reward:'astral-shell',skill:'Tinh Hà Kết Giới',color:'#bcaaff'},
 {species:'rebirth-phoenix',name:'Phượng Hoàng Niết Bàn',cell:2,elite:true,reward:'rebirth-feather',skill:'Niết Bàn Hỏa Vũ',color:'#ffd49c'}
]);
export const BOSS_RELICS=Object.freeze([
 {id:'storm-fang',type:'artifact',name:'Thiên Kiếp Lôi Nha',icon:'sword',tier:0,price:0,herbs:0,damage:54,bonus:.30,exclusive:true,eventReward:'Lôi Hổ Thiên Kiếp · Top sát thương',description:'Chiến lợi phẩm yêu thú: +54 sát thương, +30% tu vi.',cell:0},
 {id:'astral-shell',type:'artifact',name:'Tinh Hà Huyền Ấn',icon:'orb',tier:0,price:0,herbs:0,damage:42,bonus:.42,exclusive:true,eventReward:'Huyền Vũ Tinh Hà · Top sát thương',description:'Chiến lợi phẩm yêu thú: +42 sát thương, +42% tu vi.',cell:3},
 {id:'rebirth-feather',type:'artifact',name:'Niết Bàn Linh Vũ',icon:'orb',tier:0,price:0,herbs:0,damage:48,bonus:.36,exclusive:true,eventReward:'Phượng Hoàng Niết Bàn · Top sát thương',description:'Chiến lợi phẩm yêu thú: +48 sát thương, +36% tu vi.',cell:1}
]);
export function encounterPhase(b,now){const abyss=abyssPhase(b,now);if(abyss)return abyss;const celestial=celestialPhase(b,now);if(celestial)return celestial;const def=ELITE_BOSSES.find(x=>x.species===b?.species);if(!def)return null;const age=Math.max(0,now-b.startedAt),enraged=b.hp/b.maxHp<.4,period=def.cell===2?(enraged?10000:14000):def.cell===1?18000:12000,at=age%period;
 if(def.cell===1){const broken=b.shieldBrokenUntil>now,weak=broken||at>=14000;return {id:weak?'exposed':'shield',name:weak?'VỠ GIÁP · đánh ngay':'KẾT GIỚI · 3 người hợp kích',mult:weak?1.65:.65,progress:at/period,enraged,color:def.color,skill:def.skill};}
 const charge=period*.35,strike=period*.55,weak=period*.88,id=at<charge?'charge':at<strike?'strike':at<weak?'exposed':'recover';return {id,name:id==='charge'?'TÍCH LỰC':id==='strike'?def.skill.toUpperCase():id==='exposed'?'LỘ SƠ HỞ · đánh ngay':'HỒI KHÍ',mult:id==='exposed'?1.75:id==='charge'?.8:1,progress:at/period,enraged,color:def.color,skill:def.skill};}
export function encounterHit(b,id,now){if(b.species==='astral-tortoise'&&!(b.shieldBrokenUntil>now)){b.shieldHits=(b.shieldHits||[]).filter(x=>now-x.at<6000);if(!b.shieldHits.some(x=>x.id===id))b.shieldHits.push({id,at:now});if(b.shieldHits.length>=3){b.shieldBrokenUntil=now+8000;b.shieldHits=[];}}return encounterPhase(b,now);}
export function drawEliteBoss(c,b,now,x,y,sprites){const def=ELITE_BOSSES.find(d=>d.species===b.species),art=sprites?.[def?.cell];if(!def||!art)return false;const age=Math.max(0,now-b.startedAt),p=encounterPhase(b,now),a=now*.002,land=Math.max(0,1-age/1600),strike=p.id==='strike'?Math.sin((p.progress-.35)/.2*Math.PI):0;
 c.save();c.translate(x+(def.cell===2?Math.sin(a*.35)*45:0),y-land*330+Math.sin(a)*7+strike*30);c.scale(1+(p.enraged ? .08 : 0),1+(p.enraged ? .08 : 0));
 c.strokeStyle=def.color;c.lineWidth=2;c.globalAlpha=.55;for(let i=0;i<3;i++){c.beginPath();c.ellipse(0,80+i*8,90+i*35,18+i*5,0,0,Math.PI*2);c.stroke();}c.globalAlpha=1;
 if(def.cell===1){const count=6;for(let i=0;i<count;i++){const q=i*Math.PI*2/count+a*.13;c.save();c.translate(Math.cos(q)*145,Math.sin(q)*65-20);c.rotate(q);c.strokeStyle=def.color;c.lineWidth=p.id==='shield'?4:1;c.globalAlpha=p.id==='shield'?.75:.22;c.beginPath();for(let j=0;j<6;j++){const v=j*Math.PI/3;j?c.lineTo(Math.cos(v)*27,Math.sin(v)*27):c.moveTo(Math.cos(v)*27,Math.sin(v)*27);}c.closePath();c.stroke();c.restore();}}
 if(def.cell===2){c.save();c.rotate(Math.sin(a*.8)*.055+strike*.1);const flap=1+Math.sin(a*2)*.035;c.scale(flap,1/flap);c.drawImage(art,-180,-185,360,360);c.restore();}
 else {c.save();c.rotate(def.cell===0?strike*.1:Math.sin(a*.5)*.035);c.drawImage(art,-180,-185,360,360);c.restore();}
 if(p.id==='charge'){c.globalAlpha=.65;c.strokeStyle=def.color;c.lineWidth=3;const radius=45+(1-p.progress/.35)*95;c.beginPath();c.arc(0,-45,radius,0,Math.PI*2);c.stroke();}
 if(def.cell===0&&p.id==='strike'){c.strokeStyle='#e5f9ff';c.lineWidth=4;for(let i=0;i<3;i++){c.beginPath();c.moveTo(-110+i*110,-240);for(let j=0;j<7;j++)c.lineTo(-110+i*110+Math.sin(j*2+a)*20,-240+j*55);c.stroke();}}
 if(def.cell===2&&p.id==='strike'){c.strokeStyle='#ffc481';c.lineWidth=3;for(let i=0;i<8;i++){const q=i*Math.PI/4+a*.5;c.beginPath();c.moveTo(Math.cos(q)*70,Math.sin(q)*35);c.quadraticCurveTo(Math.cos(q)*180,Math.sin(q)*100+80,Math.cos(q)*230,Math.sin(q)*150+140);c.stroke();}}
 if(p.id==='exposed'){c.globalAlpha=.65;c.strokeStyle='#ffecac';c.lineWidth=2;c.beginPath();c.arc(0,-20,70+Math.sin(a*3)*5,0,Math.PI*2);c.stroke();}
 c.restore();return true;}
