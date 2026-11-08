// Per-event cosmetic direction. Stable for seeking/replay; no gameplay or timing changes.
import {qiSeed} from './qi-impact.js';
import {REALM_NAMES} from './progression.js';
import {makeSurface} from './performance.js';
const BASE=['','#7dffcf','#9dffc4','#ffd36e','#d8a9ff','#8bdcff'];
export const RITUAL_BACKGROUNDS=Object.freeze(['#46bea2','#4f9adb','#9370d4','#d99c45','#ba759e','#85a6b8']);
const SHIFTS=[-30,-15,0,15,30,45],cache=new Map(),TAU=Math.PI*2;
// 07/11: Phàm nhân → Kim Đan chiếu rất nhiều lần trên LIVE. Mỗi lần đột phá bốc ngẫu nhiên nhiều lớp khác nhau
// (nền ảnh, lật trái/phải, khung zoom, bảng màu rộng, thời tiết, âm thanh) và không lặp lại lựa chọn của vài lần gần nhất.
export const EARLY_RITUAL_MAX=3;
export const RITUAL_BACKDROPS=Object.freeze(['/assets/worlds-v2/jade-palace.png','/assets/worlds-v2/cosmos.png','/assets/worlds-v2/underwater.png','/assets/sect-autumn-peak.png','/assets/sect-jade-lake.png','/assets/sect-morning-v20.png','/assets/sect-twilight-v2.png','/assets/arena-v1/boss-arena.png','/assets/chan-tien-cinema-v2/immortal-world.png','/assets/worlds-v2/dungeon.png']);
export const RITUAL_WEATHER=Object.freeze(['petals','snow','fireflies','embers','rain','leaves','motes','sparks']);
export const RITUAL_ACCENTS=Object.freeze(['gong','bell','drum','chime','thunder']);
export const RITUAL_GRADES=Object.freeze(['#ff5d8f','#ffad42','#8a5cff','#27d3ff','#4dff9a','#ff4b3a','#3d6dff','#ffe04a','#ff7de9','#00e0b8']);
const EARLY_SHIFTS=[-150,-110,-75,-40,0,40,75,110,150,180];
const recent={backdrop:[],weather:[],accent:[],shift:[],grade:[]};
// Chọn theo seed nhưng né các lựa chọn vừa dùng → hai lần liên tiếp không bao giờ trùng nền/thời tiết/màu.
function fresh(kind,start,count,memory){const used=recent[kind];let i=start%count;for(let n=0;n<count&&used.includes(i);n++)i=(i+1)%count;used.push(i);if(used.length>memory)used.shift();return i;}
function earlyVariety(seed){
 const zoom=1+((seed>>>13)%5)*.025,room=(zoom-1)*1600*.36;
 return {backdropIndex:fresh('backdrop',seed>>>9,RITUAL_BACKDROPS.length,5),weather:RITUAL_WEATHER[fresh('weather',seed>>>19,RITUAL_WEATHER.length,3)],mirror:!!((seed>>>3)&1),zoom,
  dy:Math.trunc(Math.max(-room,Math.min(room,((seed>>>21)%5-2)*16))),veil:.36+((seed>>>24)%4)*.08,grade:RITUAL_GRADES[fresh('grade',seed>>>11,RITUAL_GRADES.length,4)],gradeMode:['soft-light','overlay','color-dodge'][(seed>>>2)%3],
  audio:Object.freeze({gain:[1.25,1.4,1.55,1.7][(seed>>>26)%4],tone:['warm','bright','deep','air'][(seed>>>28)%4],accent:RITUAL_ACCENTS[fresh('accent',seed>>>5,RITUAL_ACCENTS.length,2)],detune:[-200,-100,0,100,200,300][(seed>>>15)%6]})};
}
const clamp=x=>Math.max(0,Math.min(1,x));
function hue(hex,deg){
 const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255),max=Math.max(...rgb),min=Math.min(...rgb),d=max-min;
 let h=d===0?0:max===rgb[0]?((rgb[1]-rgb[2])/d)%6:max===rgb[1]?(rgb[2]-rgb[0])/d+2:(rgb[0]-rgb[1])/d+4;
 h=((h+deg/60)%6+6)%6;const x=d*(1-Math.abs(h%2-1)),m=min;
 const out=h<1?[d,x,0]:h<2?[x,d,0]:h<3?[0,d,x]:h<4?[0,x,d]:h<5?[x,0,d]:[d,0,x];
 return '#'+out.map(v=>Math.round((v+m)*255).toString(16).padStart(2,'0')).join('');
}
const lighten=(hex,u)=>'#'+[1,3,5].map(i=>Math.round(parseInt(hex.slice(i,i+2),16)*(1-u)+255*u).toString(16).padStart(2,'0')).join('');
export function ritualAppearance(e){
 const text=String(e?.text||'').normalize('NFC').toLocaleUpperCase('vi');let inferred=1;for(let r=REALM_NAMES.length-1;r>0;r--)if(text.includes(REALM_NAMES[r].toLocaleUpperCase('vi'))){inferred=r;break;}
 const realm=Math.trunc(Number(e?.toRealm??e?.realm??inferred));if(realm<1||realm>5)return null;
 const seed=qiSeed(e),key=realm+':'+seed;if(cache.has(key))return cache.get(key);
 const early=realm<=EARLY_RITUAL_MAX,colorIndex=early?fresh('shift',seed>>>1,EARLY_SHIFTS.length,3):(seed>>>1)%SHIFTS.length,main=hue(BASE[realm],early?EARLY_SHIFTS[colorIndex]:SHIFTS[colorIndex]),accent=hue('#ffe4ad',SHIFTS[(seed>>>7)%6]*.7);
 const palette=Object.freeze({main,main2:lighten(main,.28),soft:lighten(main,.74),gold:accent});
 const backgroundIndex=(seed>>>17)%RITUAL_BACKGROUNDS.length;
 const a=Object.freeze({key,realm,seed,colorIndex,palette,backgroundIndex,background:RITUAL_BACKGROUNDS[backgroundIndex],title:lighten(main,.52),accent,border:(seed>>>4)%4,details:3+(seed>>>12)%4,phase:(seed>>>16)/65535,direction:seed&1?1:-1,...(early?earlyVariety(seed):{})});
 cache.set(key,a);if(cache.size>128)cache.delete(cache.keys().next().value);return a;
}
export function ritualAppearanceFrame(ui,a){return ui&&a?{...ui,color:a.title,accent:a.accent,appearanceKey:a.key,border:a.border}:ui;}
export function drawRitualTint(scene,c,H){
 const a=scene.ritualAppearance;if(!a)return;const key=a.background+':'+H;let entry=scene.ritualTint;
 if(entry?.key!==key){const surface=makeSurface(450,Math.ceil(H/2));if(surface){const x=surface.getContext('2d'),g=x.createLinearGradient(0,0,0,surface.height);g.addColorStop(0,a.background+'48');g.addColorStop(.42,a.background+'18');g.addColorStop(.75,a.background+'30');g.addColorStop(1,a.background+'12');x.fillStyle=g;x.fillRect(0,0,surface.width,surface.height);}entry=scene.ritualTint={key,surface};}
 if(entry.surface){c.save();c.globalCompositeOperation='screen';c.drawImage(entry.surface,0,0,900,H);c.restore();}
}
export function drawRitualAppearance(scene,c,e,t,H,a){
 if(!a)return;const k=clamp((t-e.start)/e.duration),fade=Math.min(clamp(k/.07),clamp((1-k)/.09));if(fade<=0)return;
 const clock=scene.motion===false?0:(t-e.start)*.001;
 c.save();c.globalAlpha=fade*.68;c.strokeStyle=a.palette.main2;c.fillStyle=a.accent;c.lineWidth=1.5;
 // Four authored corner crests; all geometry stays outside the actor/face area.
 for(const [x,y,sx,sy]of [[25,70,1,1],[875,70,-1,1],[25,H-70,1,-1],[875,H-70,-1,-1]]){
  c.save();c.translate(x,y);c.scale(sx,sy);c.beginPath();
  if(a.border===0){c.moveTo(0,70);c.lineTo(0,15);c.quadraticCurveTo(0,0,16,0);c.lineTo(70,0);c.moveTo(7,43);c.bezierCurveTo(30,53,30,18,15,21);c.bezierCurveTo(8,30,32,35,43,7);}
  else if(a.border===1){c.moveTo(0,68);c.lineTo(0,0);c.lineTo(68,0);c.moveTo(8,43);c.lineTo(8,8);c.lineTo(43,8);c.moveTo(13,29);c.lineTo(29,13);c.lineTo(39,23);c.lineTo(23,39);c.closePath();}
  else if(a.border===2){c.moveTo(0,66);c.quadraticCurveTo(1,1,66,0);for(let i=0;i<3;i++){const d=14+i*10;c.moveTo(9,43);c.bezierCurveTo(d-8,16,d,8,d+6,9);c.bezierCurveTo(d+12,20,27,32,9,43);}}
  else{c.moveTo(0,70);c.lineTo(0,0);c.lineTo(70,0);c.moveTo(8,48);c.lineTo(27,28);c.lineTo(19,27);c.lineTo(43,8);c.moveTo(12,52);c.lineTo(38,31);c.lineTo(31,27);c.lineTo(51,12);}
  c.stroke();c.strokeStyle=a.accent;c.globalAlpha*=.7;c.beginPath();c.moveTo(0,82);c.lineTo(0,102);c.moveTo(82,0);c.lineTo(102,0);c.stroke();c.restore();
 }
 // Side-lane talismans rise with the charge, then retreat after the impact.
 const charge=scene.motion===false?.6:Math.sin(Math.PI*k),sway=scene.motion===false?0:Math.sin(clock*.8+a.phase*TAU)*4;
 c.strokeStyle=a.accent;c.globalAlpha=fade*(.25+.35*charge);
 for(const side of [-1,1])for(let i=0;i<a.details;i++){
  const x=side<0?43+sway:857-sway,y=H*(.26+i*.085)+a.direction*Math.sin(clock*.5+i+a.phase)*8;
  c.save();c.translate(x,y);c.beginPath();
  if((i+a.border)%2){c.moveTo(0,-8);c.lineTo(5,0);c.lineTo(0,8);c.lineTo(-5,0);c.closePath();}
  else{c.moveTo(-6,0);c.quadraticCurveTo(0,-13,6,0);c.quadraticCurveTo(0,13,-6,0);}
  c.stroke();c.restore();
 }
 c.restore();
}

// Nền ảnh của thiên đài: chốt ngay khung đầu của mỗi lần đột phá. Ảnh chưa tải xong thì dùng nền mặc định
// cho trọn lần đó (không đổi nền giữa chừng), đồng thời tải trước các nền còn lại cho lần sau.
export function ritualBackdropImage(scene,a){
 if(!a||a.backdropIndex==null||(typeof Image==='undefined'&&!scene.ritualBackdropLoader))return null;
 const map=scene.ritualBackdrops??=new Map(),load=url=>{if(map.has(url))return map.get(url);const im=scene.ritualBackdropLoader?scene.ritualBackdropLoader(url):Object.assign(new Image(),{decoding:'async',src:url});map.set(url,im);return im;};
 const url=RITUAL_BACKDROPS[a.backdropIndex];
 if(scene.ritualBackdropLock?.key!==a.key){const im=load(url),ready=!!(im?.complete&&(im.naturalWidth||im.width));scene.ritualBackdropLock={key:a.key,url:ready?url:null};
  if(!scene.ritualBackdropsPrefetched){scene.ritualBackdropsPrefetched=true;RITUAL_BACKDROPS.forEach((u,i)=>setTimeout(()=>load(u),400*i));}}
 const locked=scene.ritualBackdropLock.url;return locked?map.get(locked):null;
}
// Thời tiết riêng mỗi lần: vài chục hạt nhỏ, vẽ trên cùng, mờ dần ở đầu/cuối. Không phủ kín mặt nhân vật.
export function drawRitualWeather(scene,c,e,t,H,a){
 if(!a?.weather)return;const k=clamp((t-e.start)/e.duration),fade=Math.min(clamp(k/.08),clamp((1-k)/.1));if(fade<=0)return;
 const clock=scene.motion===false?0:(t-e.start)*.001,light=scene.budget?.level==='light',n=light?18:34,col=a.palette.soft,acc=a.accent;
 let r=a.seed||1;const rnd=()=>((r=(Math.imul(r,1664525)+1013904223)>>>0)/4294967296);
 c.save();
 for(let i=0;i<n;i++){
  const x0=rnd()*900,y0=rnd(),sp=.6+rnd()*.8,ph=rnd()*TAU,sz=.7+rnd()*1.1;let x,y;c.globalAlpha=fade*(.35+.45*rnd());
  switch(a.weather){
   case 'petals':case 'leaves':{y=((y0+clock*.05*sp)%1)*H;x=x0+Math.sin(clock*1.3*sp+ph)*40;c.fillStyle=a.weather==='petals'?'#ffc6dd':'#e6b45a';c.save();c.translate(x,y);c.rotate(clock*1.8*sp+ph);c.beginPath();c.ellipse(0,0,7*sz,3.4*sz,0,0,TAU);c.fill();c.restore();break;}
   case 'snow':{y=((y0+clock*.035*sp)%1)*H;x=x0+Math.sin(clock*.9+ph)*22;c.fillStyle='#f4fbff';c.beginPath();c.arc(x,y,2.6*sz,0,TAU);c.fill();break;}
   case 'fireflies':{x=x0+Math.sin(clock*.7*sp+ph)*55;y=H*(.25+.6*y0)+Math.cos(clock*.6*sp+ph)*40;c.globalAlpha*=.5+.5*Math.sin(clock*3*sp+ph);c.fillStyle=col;c.shadowColor=col;c.shadowBlur=10;c.beginPath();c.arc(x,y,2.8*sz,0,TAU);c.fill();c.shadowBlur=0;break;}
   case 'embers':{y=H-((y0+clock*.06*sp)%1)*H;x=x0+Math.sin(clock*1.6*sp+ph)*26;c.fillStyle=i%3?'#ffb35a':'#ff7b3a';c.fillRect(x,y,2.4*sz,2.4*sz);break;}
   case 'rain':{y=((y0+clock*.55*sp)%1)*H;x=x0-y*.12;c.strokeStyle=col;c.lineWidth=1.1;c.beginPath();c.moveTo(x,y);c.lineTo(x-5,y+28*sz);c.stroke();break;}
   case 'motes':{x=x0;y=H*(.1+.85*y0);c.globalAlpha*=.4+.6*Math.abs(Math.sin(clock*1.7*sp+ph));c.fillStyle=i%4?col:'#ffffff';c.fillRect(x-1,y-4*sz,2,8*sz);c.fillRect(x-4*sz,y-1,8*sz,2);break;}
   default:{const u=(clock*.25*sp+y0)%1;x=450+Math.cos(ph+clock*.3)*(140+u*380);y=H*.6+Math.sin(ph+clock*.3)*(60+u*170)-u*120;c.globalAlpha*=1-u;c.fillStyle=acc;c.fillRect(x,y,2.2*sz,2.2*sz);}
  }
 }
 c.restore();
}

// Chỉnh màu toàn cảnh mỗi lần một tông khác; chừa vùng tròn quanh nhân vật để da/mặt giữ màu thật.
export function drawRitualGrade(scene,c,e,t,H,a){
 if(!a?.grade)return;const k=clamp((t-e.start)/e.duration),fade=Math.min(clamp(k/.06),clamp((1-k)/.08));if(fade<=0)return;
 c.save();c.globalCompositeOperation=a.gradeMode||'soft-light';c.globalAlpha=fade*(a.gradeMode==='color-dodge'?.32:.78);
 const g=c.createRadialGradient(450,H*.56,120,450,H*.56,820);g.addColorStop(0,a.grade+'00');g.addColorStop(.35,a.grade+'90');g.addColorStop(1,a.grade+'ff');c.fillStyle=g;c.fillRect(0,0,900,H);
 c.globalCompositeOperation='screen';c.globalAlpha=fade*.16;const top=c.createLinearGradient(0,0,0,H*.4);top.addColorStop(0,a.grade);top.addColorStop(1,a.grade+'00');c.fillStyle=top;c.fillRect(0,0,900,H*.4);
 c.restore();
}
