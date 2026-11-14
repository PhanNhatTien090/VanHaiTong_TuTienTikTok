// Linh Thú V2 event cinema. ALWAYS uses each species' original animated frames.
// No new anatomy, no static substitutions; low-cost arcs and glyphs are purely additive.
import {petById} from './spirit-pets.js';
import {petArtFrame} from './premium-pet-motion.js';
const TAU=Math.PI*2;
const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>1-(1-clamp(x))**3;
const fade=k=>Math.min(1,k*9,(1-k)*7);
const labeled=(c,txt,x,y,font,fill,maxWidth)=>{c.textAlign='center';c.textBaseline='middle';c.font=font;c.lineJoin='round';c.lineWidth=5;c.strokeStyle='#07111ce0';c.strokeText(txt,x,y,maxWidth);c.fillStyle=fill;c.fillText(txt,x,y,maxWidth);};
export function petV2EffectDuration(e){
 if(e?.petV2Evolve)return 4600;
 if(e?.petV2Synergy)return 3400;
 if(e?.petV2Cast)return 2600;
 if(e?.petV2ExpeditionDone)return 1900;
 if(e?.petV2Expedition)return 1600;
 if(e?.petV2Reward||e?.petV2Feed||e?.petV2Train)return 1250;
 return 0;
}
export function petV2EffectType(e){return e?.petV2Evolve?'evolve':e?.petV2Synergy?'synergy':e?.petV2Cast?'cast':e?.petV2ExpeditionDone?'return':e?.petV2Expedition?'journey':e?.petV2Reward?'reward':e?.petV2Feed?'feed':e?.petV2Train?'train':null;}
export function petV2EffectPositions(e,H,target={x:450,y:H*.65}){
 const kind=petV2EffectType(e);
 const large=['evolve','cast','synergy'].includes(kind);
 return {x:large?450:target.x,y:large?H*.36:target.y-65*(target.scale||1),size:large?Math.min(220,H*.19):Math.min(115,H*.08)};
}
export function drawPetV2Event(scene,c,e,t,k,target,H,layer){
 const type=petV2EffectType(e),pet=petById(e?.petId);
 if(!type||!pet)return false;
 const light=scene.budget?.level==='light'||scene.heavyCrowd||scene.minimalCrowd;
 const motion=scene.motion!==false;
 const alpha=fade(k),main=['evolve','cast','synergy'].includes(type);
 const {x,y,size}=petV2EffectPositions(e,H,target);
 const phase=(motion?k:.38)*TAU;
 const color=pet.color||'#e9d09d';
 c.save();c.globalAlpha=alpha;
 if(layer==='back'){
  // Draw a subtle darkening field only for landmark effects; never obscure battle UI.
  if(main&&!light&&!scene.reduceFlash){
   c.fillStyle='rgba(3,9,24,0.32)';c.globalAlpha=alpha*.7;
   c.fillRect(0,0,900,H);
   c.globalAlpha=alpha;
  }
  c.translate(x,y+size*.38);
  c.scale(1,.32);
  for(let j=0;j<(main&&!light?3:1);j++){
   const r=size*(.47+j*.21)+(motion?Math.sin(phase+j)*7:0);
   c.strokeStyle=j?'#e8d6a8':color;c.lineWidth=j?2:3;
   c.beginPath();c.ellipse(0,0,r,r,0,0,TAU);c.stroke();
  }
  c.restore();return true;
 }
 if(layer!=='front'){c.restore();return true;}
 const n=motion?(light?4:main?14:7):0;
 for(let i=0;i<n;i++){
  const theta=i*2.399+phase*(type==='evolve'?1.5:1);
  const radius=size*(.58+.12*Math.sin(phase+i)),py=y+Math.sin(theta)*radius*.7;
  c.globalAlpha=alpha*(.23+.45*Math.sin((i+1)*2));
  c.fillStyle=i%3===0?'#ffeed1':color;
  c.fillRect(x+Math.cos(theta)*radius,py,light?2:3,light?3:6);
 }
 c.globalAlpha=alpha;
 const frames=scene.petArt?.get(pet.id);
 const sprite=petArtFrame(frames,t,0,motion);
 // Never show replacement/stock art when the correct animated species has not loaded.
 if(sprite){
  const p=type==='evolve'?Math.sin(Math.PI*clamp(k)):(main?Math.sin(Math.PI*clamp(k))*.13:0);
  const s=size*(1+.18*p);
  c.save();c.translate(x,y);
  if(motion)c.rotate(Math.sin(phase*2)*.025);
  c.drawImage(sprite,-s/2,-s*.68,s,s);
  c.restore();
 }
 if(main){
  // Comic-style skill cut-in using thin diagonal bands, not large raster layers.
  const bend=main&&type==='cast'?1:0;
  const pos=H*(type==='evolve'?.235:.22)+bend*H*.03;
  c.globalAlpha=alpha*.78;
  c.fillStyle='#071629e8';c.beginPath();c.moveTo(0,pos-9);c.lineTo(900,pos-33);c.lineTo(900,pos+63);c.lineTo(0,pos+89);c.closePath();c.fill();
  c.strokeStyle=color;c.lineWidth=3;c.beginPath();c.moveTo(0,pos-5);c.lineTo(900,pos-29);c.stroke();
  c.globalAlpha=alpha;
  labeled(c,type==='evolve'?'LINH THÚ TIẾN HÓA':type==='synergy'?'LINH THÚ HỢP KÍCH':'THẦN THÔNG LINH THÚ',450,pos+6,'700 20px Segoe UI',color,760);
  const heading=type==='evolve'?pet.name+' · '+['ẤU LINH','CHIẾN LINH','THÁNH LINH','BẢN MỆNH'][Math.max(0,Math.min(3,e.petStage||0))]:String(e.petSkill||pet.name).slice(0,46);
  labeled(c,heading,450,pos+47,light?'700 26px Georgia':'700 34px Georgia','#fff6dd',800);
 }else if(type!=='feed'&&type!=='train'){
  labeled(c,type==='journey'?'LINH THÚ KHỞI HÀNH':type==='return'?'BÍ CẢNH HOÀN TẤT':'LINH DUYÊN',x,y-size*.78,'700 17px Segoe UI',color,300);
 }
 c.restore();return true;
}
