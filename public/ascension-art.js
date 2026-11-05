import {KIM_TIEN_TIMELINE} from './kim-tien-timeline.js';
import {HUYEN_TIEN_TIMELINE} from './huyen-tien-timeline.js';
import {DAI_THUA_DURATION} from './dai-thua-awakening.js';
import {CHAN_TIEN_DURATION} from './chan-tien-awakening.js';
import {LUYEN_HU_DURATION} from './luyen-hu-awakening.js';
import {HOA_THAN_DURATION} from './hoa-than-awakening.js';
import {makeSurface} from './performance.js';
import {TRUC_CO_DURATION} from './truc-co-timeline.js';
import {KIM_DAN_DURATION} from './kim-dan-timeline.js';
import {NGUYEN_ANH_DURATION} from './nguyen-anh-timeline.js';
const TITLES=['','Khí Hải Sơ Khai','Ngọc Cơ Thành Đạo','Kim Đan Diệu Nhật','Nguyên Thần Liên Sinh','Thần Lôi Tẩy Tủy','Hư Không Khai Giới','Vạn Kiếm Triều Tông','Long Môn Đăng Tiên','Huyền Tinh Chuyển Mệnh','Kim Liên Bất Diệt','Thái Cực Khai Thiên','Đại La Pháp Tướng','Tiên Đế Đăng Cơ','Thái Sơ Khai Đạo','Cửu Thiên Quy Nhất','Hồng Mông Thần Hiện','Vạn Giới Triều Vương','Thần Đế Khai Thiên'];
const SHAPES=['','qi','foundation','core','spirit','thunder','rift','swords','gate','orrery','solar-lotus','taichi','qilin','emperor','orrery','taichi','solar-lotus','qilin','emperor'];
const COLORS=['','#8de9ba','#9eefff','#ffe098','#d8a9ff','#9bcfff','#b59aff','#e8ceff','#ffe7b0','#9dbcff','#ffdc78','#c9a3ff','#ffad7f','#fff1c7','#83ffe5','#c7b1ff','#ffb0d3','#8bd8ff','#ffe78b'];
// Authored early rituals have their own lengths; retain the spacing of later realms.
const DURATIONS=[0,5200,6800,7200,7600,8000,8200,8400,8800,9000,9200,9400,9600,9800,10000,10200,10400,10600,10800].map((ms,r)=>r===1?8800:r===2?TRUC_CO_DURATION:r===3?KIM_DAN_DURATION:r>=4?ms+2200+Math.round((r-1)*800/17)+(NGUYEN_ANH_DURATION-9941):0);
const afterHoa=DURATIONS.map((ms,r)=>r===5?HOA_THAN_DURATION:r>5?ms+(HOA_THAN_DURATION-DURATIONS[5]):ms);
const afterLuyenHu=afterHoa.map((ms,r)=>r===6?LUYEN_HU_DURATION:r>6?ms+(LUYEN_HU_DURATION-afterHoa[6]):ms);
const afterDaiThua=afterLuyenHu.map((ms,r)=>r===7?DAI_THUA_DURATION:r>7?ms+(DAI_THUA_DURATION-afterLuyenHu[7]):ms);
const finalDurations=afterDaiThua.map((ms,r)=>r===8?CHAN_TIEN_DURATION:r>8?ms+(CHAN_TIEN_DURATION-afterDaiThua[8]):ms);
export const ASCENSIONS=Object.freeze(TITLES.map((title,realm)=>realm?Object.freeze({realm,title,id:realm>13?'transcendent-'+realm:SHAPES[realm],shape:SHAPES[realm],color:COLORS[realm],duration:realm===10?KIM_TIEN_TIMELINE.duration:realm===9?HUYEN_TIEN_TIMELINE.duration:realm>9?finalDurations[realm]+(36000-finalDurations[9]):finalDurations[realm],group:realm>=8?'high':'mid',cell:realm>=8?Math.min(5,realm-8):Math.max(0,realm-2),burst:realm===13?5:realm===12?3:realm===11||realm===6?2:realm>=8||realm===3?1:0,layers:2+Math.floor(realm/2)}):null));
export const ascensionProfile=realm=>ASCENSIONS[Math.max(1,Math.min(18,Number(realm)||1))];
export function sliceAscensionAtlas(im,size=320,factory=makeSurface){const w=im.naturalWidth||im.width,h=im.naturalHeight||im.height,frames=[];for(let i=0;i<6;i++){const f=factory(size,size);if(!f)continue;f.getContext('2d').drawImage(im,i%3*w/3,Math.floor(i/3)*h/2,w/3,h/2,2,2,size-4,size-4);frames.push(f);}return frames;}
export function prepareAscensionArt(scene,realm){if(typeof Image==='undefined')return;const p=ascensionProfile(realm);scene.ascensionArt??={};scene.ascensionLoading??=new Set();scene.ascensionRetry??={};for(const group of [p.group,'bursts']){if(scene.ascensionArt[group]||scene.ascensionLoading.has(group)||scene.ascensionRetry[group]>Date.now())continue;scene.ascensionLoading.add(group);let im=new Image();im.onload=()=>{scene.ascensionArt[group]=sliceAscensionAtlas(im,group==='high'?384:256);scene.ascensionLoading.delete(group);im=null;};im.onerror=()=>{scene.ascensionLoading.delete(group);scene.ascensionRetry[group]=Date.now()+15000;};im.src='/assets/breakthrough-v2/'+group+'.png';}}
const TAU=Math.PI*2,clamp=x=>Math.max(0,Math.min(1,x));
export function drawAscension(c,e,t,k,p,H,r,{light=false,art={},layer='back',viewScale=1}={}){const a=ascensionProfile(r),fade=Math.min(1,k/.12,(1-k)/.14),gather=clamp(k/.23),open=1-(1-clamp((k-.12)/.35))**3,detonate=Math.max(0,1-Math.abs(k-.48)/.12),settle=clamp((k-.62)/.16),x=p.x,feet=p.y,y=feet-150,width=Math.min(820/Math.max(1,viewScale),320+r*18),spin=t*.0003,main=art[a.group]?.[a.cell],burst=art.bursts?.[a.burst];c.save();c.globalAlpha=fade;
 const image=(im,cx,cy,size,alpha=1,rot=0,yscale=1)=>{if(!im||alpha<=0)return;c.save();c.globalAlpha*=alpha;if(r>13)c.filter='hue-rotate('+((r-13)*48)+'deg)';c.translate(cx,cy);c.rotate(rot);c.scale(1,yscale);c.drawImage(im,-size/2,-size/2,size,size);c.restore();};
 if(layer==='front'){if(burst&&detonate>0)image(burst,x,y,width*(.65+detonate*.65),detonate*.5);if(settle>0){c.save();c.globalAlpha*=settle;c.textAlign='center';c.fillStyle=a.color;c.font='bold '+(r>=12?29:r>=8?25:21)+'px Segoe UI';c.fillText(a.title.toLocaleUpperCase('vi'),x,feet+105,Math.min(700,820/viewScale));c.font='600 20px Segoe UI';c.fillStyle='#fff4d3';c.fillText(String(e.name||'Đạo hữu').normalize('NFC'),x,feet+135,Math.min(520,800/viewScale));c.restore();}c.restore();return;}
 c.fillStyle='rgba(3,9,24,'+Math.min(.68,.25+r*.028)+')';c.fillRect(0,0,900,H);
 const beam=c.createLinearGradient(x-width*.4,0,x+width*.4,0);beam.addColorStop(0,a.color+'00');beam.addColorStop(.5,a.color+(detonate>.3?'99':'35'));beam.addColorStop(1,a.color+'00');c.fillStyle=beam;c.fillRect(x-width*.4,0,width*.8,feet+45);
 // Unique central silhouettes replace the old cumulative high-realm stack.
 const angle=['orrery','taichi','swords','rift','core','foundation'].includes(a.shape)?spin*(r%2?-1:1):Math.sin(spin)*.025;
 image(main,x,y-25,width*(.35+.65*open),.55+.45*open,angle);
 if(!main){c.strokeStyle=a.color;c.lineWidth=2;for(let i=0;i<a.layers;i++){c.beginPath();c.ellipse(x,y,(35+i*20)*open,(35+i*20)*open,0,0,TAU);c.stroke();}}
 if(r>=8)image(art.bursts?.[4],x,y,width*.76,settle*.3,-spin*.15);
 image(main,x,feet+35,width*.7,gather*.55,-angle*.7,.25);
 // At most 6 bounded rays / 28 particles in light mode, regardless of realm.
 const rays=Math.min(light?6:10,2+Math.floor(r/2));c.strokeStyle=a.color;c.lineWidth=1.5;for(let i=0;i<rays;i++){const q=i*TAU/rays+spin*.2,rad=width*(.2+.24*open);c.globalAlpha=fade*(.18+detonate*.6);c.beginPath();c.moveTo(x+Math.cos(q)*rad*.55,y+Math.sin(q)*rad*.55);c.lineTo(x+Math.cos(q)*rad,y+Math.sin(q)*rad);c.stroke();}
 const n=Math.min(light?28:48,8+r*3);for(let i=0;i<n;i++){const u=(k*1.6+i*.618)%1,q=i*2.399+spin*(r%2?-1:1),rad=(20+u*width*.43)*open;c.globalAlpha=fade*Math.sin(u*Math.PI)*.7;c.fillStyle=i%3?a.color:'#ffffff';c.fillRect(x+Math.cos(q)*rad,y+Math.sin(q)*rad*.7-u*45,1.5+(r>=10),3+(r>=12));}
 // Each high realm also gets a different moving secondary pattern.
 c.globalAlpha=fade*.65;c.strokeStyle=a.color;c.lineWidth=2;
 if(a.shape==='thunder'){for(let j=0;j<(light?2:4);j++){const q=spin*4+j;c.beginPath();c.moveTo(x+(j-1)*90,y-240);for(let i=0;i<7;i++)c.lineTo(x+Math.sin(i*2+q)*35+(j-1)*65,y-240+i*50);c.stroke();}}
 if(a.shape==='rift'||a.shape==='taichi'){for(let i=0;i<(light?4:8);i++){const q=i*TAU/(light?4:8)-spin;c.save();c.translate(x+Math.cos(q)*width*.4,y+Math.sin(q)*width*.3);c.rotate(q);c.strokeRect(-4,-18,8,36);c.restore();}}
 if(a.shape==='gate'){for(let i=0;i<5;i++){c.globalAlpha=fade*(.35+i*.07);c.beginPath();c.ellipse(x,feet-i*26,width*.22+i*4,9,0,0,TAU);c.stroke();}}
 if(a.shape==='orrery'){for(let i=0;i<3;i++){c.save();c.translate(x,y);c.rotate(i*Math.PI/3+spin*.25);c.beginPath();c.ellipse(0,0,width*.4,width*.15,0,0,TAU);c.stroke();c.restore();}}
 if(a.shape==='solar-lotus'){for(let i=0;i<(light?8:12);i++){const q=i*TAU/(light?8:12)+spin*.3;c.save();c.translate(x,feet+28);c.scale(1,.3);c.rotate(q);c.beginPath();c.ellipse(0,-width*.18,14,width*.22*open,0,0,TAU);c.stroke();c.restore();}}
 if(a.shape==='qilin'){for(const side of [-1,1]){c.beginPath();c.moveTo(x+side*width*.16,y-width*.2);c.bezierCurveTo(x+side*width*.45,y-width*.4,x+side*width*.6,y+width*.1,x+side*width*.3,feet);c.stroke();}}
 if(a.shape==='emperor'){for(let i=0;i<9;i++){const q=-Math.PI/2+(i-4)*.22;c.strokeStyle=['#ffe19c','#a5e8ff','#d0b0ff'][i%3];c.globalAlpha=fade*(.15+detonate*.45);c.lineWidth=3;c.beginPath();c.moveTo(x,y-60);c.lineTo(x+Math.cos(q)*width*.65,y-60+Math.sin(q)*H*.55);c.stroke();}}
 c.restore();}
