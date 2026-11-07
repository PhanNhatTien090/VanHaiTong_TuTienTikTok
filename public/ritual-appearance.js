// Per-event cosmetic direction. Stable for seeking/replay; no gameplay or timing changes.
import {qiSeed} from './qi-impact.js';
import {REALM_NAMES} from './progression.js';
import {makeSurface} from './performance.js';
const BASE=['','#7dffcf','#9dffc4','#ffd36e','#d8a9ff','#8bdcff'];
export const RITUAL_BACKGROUNDS=Object.freeze(['#46bea2','#4f9adb','#9370d4','#d99c45','#ba759e','#85a6b8']);
const SHIFTS=[-30,-15,0,15,30,45],cache=new Map(),TAU=Math.PI*2;
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
 const colorIndex=(seed>>>1)%SHIFTS.length,main=hue(BASE[realm],SHIFTS[colorIndex]),accent=hue('#ffe4ad',SHIFTS[(seed>>>7)%6]*.7);
 const palette=Object.freeze({main,main2:lighten(main,.28),soft:lighten(main,.74),gold:accent});
 const backgroundIndex=(seed>>>17)%RITUAL_BACKGROUNDS.length;
 const a=Object.freeze({key,realm,seed,colorIndex,palette,backgroundIndex,background:RITUAL_BACKGROUNDS[backgroundIndex],title:lighten(main,.52),accent,border:(seed>>>4)%4,details:3+(seed>>>12)%4,phase:(seed>>>16)/65535,direction:seed&1?1:-1});
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
