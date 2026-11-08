import {MAX_REALM} from './progression.js';
import {divineSelection} from './divine-wardrobe.js';
import {specialSkinFor} from './patrons.js';
import {skinFor,SKINS} from './cosmetics.js';
const TIERS=[0,0,1,2,2,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4];
const TRIMS=['#b8c5b1','#e2c184','#bcecff','#d4b7ff','#8fe1d4','#ffd580','#a3d4ff','#f2c8ff','#fff0af','#9fd0ff','#ffd86b','#c9a6ff','#ff9f8a','#fff6d8','#83ffe5','#c7b1ff','#ffb0d3','#8bd8ff','#ffe78b','#94fff0','#c9b4ff','#fff1cf','#ff6a4a','#c995ff','#eef0ff'];
export const REALM_STYLES=Object.freeze([
 {robe:'#71817b',metal:'#bcc3ac',motif:0},
 {robe:'#258b73',metal:'#b2e8bd',motif:1},
 {robe:'#c6e8f0',metal:'#e8f8ff',motif:2},
 {robe:'#794db4',metal:'#dcbaff',motif:3},
 {robe:'#12685f',metal:'#82f2c8',motif:4},
 {robe:'#79612b',metal:'#ffe5a4',motif:5},
 {robe:'#234c8d',metal:'#b5e5ff',motif:6},
 {robe:'#5e286c',metal:'#f3c5ff',motif:7},
 {robe:'#e4dfc8',metal:'#fff0a8',motif:8},
 {robe:'#1c2f5e',metal:'#bfe0ff',motif:9},
 {robe:'#8a6418',metal:'#ffe08a',motif:10},
 {robe:'#3b1f66',metal:'#e6d4ff',motif:11},
 {robe:'#6e1a1a',metal:'#ffd0a0',motif:12},
 {robe:'#f2ead2',metal:'#fff8e0',motif:13},
 ...['#83ffe5','#c7b1ff','#ffb0d3','#8bd8ff','#ffe78b','#94fff0','#c9b4ff','#fff1cf'].map((metal,i)=>({robe:['#124c49','#382360','#661d46','#153c64','#52370d','#164e4a','#493376','#67532c'][i],metal,motif:14+i}))
]);
export const REALM_ROBES=['Áo vải nhập môn','Đạo bào Luyện Khí','Ngân văn Trúc Cơ','Tử văn Kim Đan','Đạo bào Nguyên Anh','Kim văn Hóa Thần','Đạo bào Luyện Hư','Thiên y Đại Thừa','Tiên y Chân Tiên','Huyền quang tiên bào','Kim thân tiên y','Thái Ất tử bào','Đại La xích kim bào','Tiên Đế long bào','Đạo Tổ thiên y','Thiên Tôn tinh bào','Thần Quân huyền y','Thần Vương long y','Thần Đế vạn tượng','Thần Tôn thiên y','Thần Tổ nguyên bào','Hồng Mông chí tôn y','Ma Thần huyết giáp','Thiên Ma thánh đế giáp','Diệt Thế chí tôn giáp'];
// v48: nấc áo theo cảnh giới — Kim Đan/Nguyên Anh áo vàng · Hóa Thần/Luyện Hư áo đỏ (Xích Phượng) · Đại Thừa+ Thương Long.
// Coin quà tích lũy lên được cùng nấc: 500 → vàng, 2.000 → đỏ, 10.000 → Thương Long.
export const OUTFIT_RUNGS=Object.freeze([{name:null,minRealm:0,minCoins:0},{name:'Kim Y',minRealm:3,minCoins:500},{name:'Xích Phượng Chiến Y',minRealm:5,minCoins:2000},{name:'Thương Long Hộ Pháp',minRealm:7,minCoins:10000}]);
export function outfitRung(p){let r=0;OUTFIT_RUNGS.forEach((x,i)=>{if(i&&((Number(p.realm)||0)>=x.minRealm||(Number(p.giftCoins)||0)>=x.minCoins))r=i;});return r;}
export function appearanceFor(p){const realm=Math.max(0,Math.min(MAX_REALM,Math.trunc(Number(p.realm)||0))),gift=skinFor(p.giftCoins),special=specialSkinFor(p),level=Math.max(gift.level,TIERS[realm]);return {...(special||SKINS[level]),realm,realmTrim:TRIMS[realm],name:divineSelection(p)?.name||special?.name||REALM_ROBES[realm]};}
// Keep original painted robes unobstructed. No added armour, belt panels or crowns.
export function drawRealmClothes(){}
export function realmQiProfile(p){
 const realm=Math.max(0,Math.min(MAX_REALM,Math.trunc(Number(p.realm)||0)));
 return {realm,color:TRIMS[realm],radius:20+realm*3.5,height:35+realm*7,streams:realm===0?0:Math.min(4,1+Math.floor(realm/2)),speed:.00065+realm*.00006};
}
export function drawRealmAscension(c,p,pose,t,motion=true,quality='balanced'){
 const q=realmQiProfile(p),r=q.realm;if(!r)return;
 const a=motion?t*q.speed:0,standing=pose.stand>.5,cy=(standing?-39:-15)+(pose.lift||0),height=q.height+(standing?14:0);
 const light=quality==='light',steps=light?18:28,streams=Math.min(q.streams,light?3:4);
 c.save();c.translate(0,cy);c.globalCompositeOperation='screen';
 const mist=c.createRadialGradient(0,0,5,0,0,q.radius);mist.addColorStop(0,q.color+(r>=5?'28':'12'));mist.addColorStop(1,q.color+'00');c.fillStyle=mist;c.fillRect(-q.radius,-q.radius,q.radius*2,q.radius*2);
 const flow=c.createLinearGradient(0,-height/2,0,height/2);flow.addColorStop(0,q.color+'00');flow.addColorStop(.25,q.color+'a0');flow.addColorStop(.65,q.color+'c0');flow.addColorStop(1,q.color+'00');
 for(let j=0;j<streams;j++){
  const points=[];for(let i=0;i<=steps;i++){const u=i/steps,theta=a+u*Math.PI*(r>=5?4:2.5)+j*Math.PI*2/streams,rr=q.radius*(.55+.4*Math.sin(u*Math.PI));points.push([Math.cos(theta)*rr,height/2-u*height+Math.sin(theta)*5]);}c.beginPath();c.moveTo(...points[0]);for(let i=1;i<points.length-1;i++){const p0=points[i],p1=points[i+1];c.quadraticCurveTo(p0[0],p0[1],(p0[0]+p1[0])/2,(p0[1]+p1[1])/2);}c.lineTo(...points.at(-1));
  c.strokeStyle=flow;c.lineWidth=r>=5?2.8:1.7;c.globalAlpha=.45+r*.035;c.stroke();c.lineWidth=.6;c.strokeStyle=q.color;c.globalAlpha=.35;c.stroke();
 }
 if(r>=8){c.globalAlpha=.28;c.strokeStyle=q.color;c.lineWidth=.9;for(let j=0;j<(r>=7?2:1);j++){c.beginPath();c.ellipse(0,3,q.radius+2+j*3,height*.42+j*4,Math.sin(a*.3+j)*.17,0,Math.PI*2);c.stroke();}}
 // Rising motes imply gathering energy without a large particle system.
 const n=Math.min(light?7:12,2+r);for(let i=0;i<n;i++){const u=((motion?t*.00023:0)+i*.173)%1,x=Math.sin(i*8.2+a*.3)*(q.radius-3);c.globalAlpha=Math.sin(u*Math.PI)*(.35+r*.035);c.fillStyle=i%2?q.color:'#fff0ba';c.beginPath();c.ellipse(x,height/2-u*height,1,1.4+r*.12,0,0,Math.PI*2);c.fill();}
 c.restore();
}
export function drawRealmQiFront(c,p,pose,t,motion=true){
 const q=realmQiProfile(p);if(q.realm<3)return;
 const a=motion?t*q.speed:0,y=(pose.stand>.5?-5:12)+(pose.lift||0);
 c.save();c.globalCompositeOperation='screen';c.strokeStyle=q.color;c.lineWidth=q.realm>=6?1.7:1;c.globalAlpha=.45;
 const n=q.realm>=6?2:1;for(let j=0;j<n;j++){c.beginPath();c.ellipse(0,y-j*13,q.radius,6+j*2,Math.sin(a+j)*.13,.08,Math.PI-.08);c.stroke();}c.restore();
}

// v52: hào quang thường trực cảnh giới cao (vẽ SAU thân, gọi trong drawRealmAscension).
// Huyền Tiên: vầng sáng sau đầu · Kim Tiên: + đài sen vàng · Thái Ất: + cánh ánh sáng · Đại La: + 6 phi kiếm hộ thân · Tiên Đế: + thiên quang chín màu.
export function drawImmortalAura(c,p,pose,t,motion=true,light=false){
 const r=Math.max(0,Math.min(MAX_REALM,Math.trunc(Number(p.realm)||0)));if(r<9)return;
 const a=motion?t*.001:0,st=pose.stand>.5,head=(st?-78:-56)+(pose.lift||0),seat=(st?26:22)+(pose.lift||0),col=TRIMS[r];
 c.save();c.globalCompositeOperation='screen';
 const glow=(x,y,R,cc,al)=>{const g=c.createRadialGradient(x,y,0,x,y,R);g.addColorStop(0,cc+Math.round(255*al).toString(16).padStart(2,'0'));g.addColorStop(1,cc+'00');c.fillStyle=g;c.fillRect(x-R,y-R,R*2,R*2);};
 if(r>=13){for(let i=0;i<9;i++){const q=i/9*Math.PI*2+a*.2;c.strokeStyle=`hsla(${i*40},90%,75%,.35)`;c.lineWidth=3;c.beginPath();c.moveTo(0,head);c.lineTo(Math.cos(q)*70,head+Math.sin(q)*70);c.stroke();}}
 if(r>=11&&!light){for(const side of [-1,1]){c.save();c.translate(0,head+28);c.scale(side,1);for(let i=0;i<5;i++){const len=34+i*7,ang=-.2-i*.22+Math.sin(a*1.6)*.06;c.strokeStyle=col+'90';c.lineWidth=5-i*.6;c.beginPath();c.moveTo(6,0);c.quadraticCurveTo(len*.6*Math.cos(ang)+10,len*.6*Math.sin(ang)-10,len*Math.cos(ang)+8,len*Math.sin(ang));c.stroke();}c.restore();}}
 // vầng sáng sau đầu (Huyền Tiên+)
 glow(0,head,30,col,.55);c.strokeStyle=col+'d0';c.lineWidth=2;c.beginPath();c.arc(0,head,19,0,Math.PI*2);c.stroke();c.lineWidth=1;c.beginPath();c.arc(0,head,24+Math.sin(a*2)*1.5,0,Math.PI*2);c.stroke();
 for(let i=0;i<8;i++){const q=i/8*Math.PI*2+a*.5;c.fillStyle=col;c.fillRect(Math.cos(q)*24-1,head+Math.sin(q)*24-1,2.4,2.4);}
 if(r>=10){c.save();c.translate(0,seat);c.scale(1,.32);for(let i=0;i<10;i++){c.save();c.rotate(i/10*Math.PI*2+a*.15);c.fillStyle=i%2?'#ffe08a88':'#fff4c888';c.beginPath();c.ellipse(0,-30,9,22,0,0,Math.PI*2);c.fill();c.restore();}c.restore();glow(0,seat,40,'#ffd86b',.35);}
 if(r>=12){for(let i=0;i<6;i++){const q=i/6*Math.PI*2+a*.9,x=Math.cos(q)*42,y=head+30+Math.sin(q)*14;c.save();c.translate(x,y);c.rotate(q+Math.PI/2);c.fillStyle=i%2?'#ffd0a0':'#fff2d8';c.fillRect(-1.2,-12,2.4,18);c.fillRect(-4,-6,8,1.4);c.restore();}}
 c.restore();
}
