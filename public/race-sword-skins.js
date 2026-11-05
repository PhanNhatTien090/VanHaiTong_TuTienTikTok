// Permanent cosmetics; never affect speed or equipped combat artifacts.
export const RACE_SWORD_SKINS=Object.freeze([
 {id:'race-emperor',name:'Thương Long Đế Kiếm',color:'#5de5ff',edge:'#ffe3a3',dark:'#12396d',cell:1,motif:'dragon'},
 {id:'race-moon',name:'Tinh Hà Nguyệt Kiếm',color:'#dcafff',edge:'#fff0cd',dark:'#49216f',cell:2,motif:'moon'},
 {id:'race-frost',name:'Băng Liên Thần Kiếm',color:'#86ffe2',edge:'#e5ffff',dark:'#165466',cell:0,motif:'lotus'}]);
export function raceSwordFor(p={}){return RACE_SWORD_SKINS.find(s=>s.id===p.raceSwordChoice&&p.raceSwordSkins?.includes(s.id))||RACE_SWORD_SKINS.find(s=>p.raceSwordSkins?.includes(s.id));}
export function drawRaceSword(scene,c,a,t){
 const skin=raceSwordFor(a.player),scale=(a.scale||1.5)/1.5;
 if(!skin){scene.drawRaceBaseSword?.(c,a,t);return;}
 const art=scene.prestigeSwords?.[skin.cell];
 if(art){c.save();c.translate(a.x,a.y+32*scale);c.rotate(Math.PI/2-.04);c.drawImage(art,-56*scale,-120*scale,112*scale,240*scale);c.restore();return;}
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
