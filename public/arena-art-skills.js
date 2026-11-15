// Chiêu có ảnh (Codex vẽ, public/assets/skills-v1) — mỗi ảnh một cách chuyển động riêng (15/11/2026).
// rìu bổ từ trời · mưa kiếm đâm xuống · lốc xoáy cuộn · sóng biển tràn ngang · mây độc lan · gậy như ý vươn rồi đập · rồng lửa lượn tới · kim thân hiện sau lưng.
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),ease=k=>1-(1-clamp(k))**3,easeIn=k=>clamp(k)**2;
export const ARENA_ART=Object.freeze(['axe','sword-rain','tornado','wave','poison','staff','fire-dragon','golden-avatar']);
export function loadSkillArt(scene,key){
 if(!key)return null;scene.skillArt??={};if(key in scene.skillArt)return scene.skillArt[key];
 scene.skillArt[key]=null;if(typeof Image==='undefined')return null;
 const im=new Image();im.decoding='async';im.onload=()=>{scene.skillArt[key]=im;};im.onerror=()=>{};im.src='/assets/skills-v1/'+key+'.webp';return null;
}
/** Vẽ chiêu có ảnh. Trả true nếu đã vẽ (để bỏ hình chiêu mặc định). A người ra đòn, B mục tiêu (x,y là chân). */
export function drawArtSkill(scene,c,art,k,A,B,H,{self=false,seed=1}={}){
 const im=loadSkillArt(scene,art);if(!im)return false;
 const w=im.naturalWidth||im.width,h=im.naturalHeight||im.height,dir=B.x>A.x?1:-1;
 const tx=self?A.x:B.x,ty=(self?A.y:B.y)-120;
 c.save();
 const fadeOut=clamp((1-k)/.18);
 if(art==='axe'){
  // Rìu khổng lồ rơi từ trời bổ thẳng xuống, khựng lại ở điểm trúng rồi mờ.
  const drop=easeIn(clamp(k/.55)),sh=H*.5,sw=sh*w/h,y=-sh+(ty+40)*drop+sh*drop*.3;
  c.globalAlpha=fadeOut;c.translate(tx,y);c.rotate((1-drop)*.25*dir);c.drawImage(im,-sw/2,-sh*.75,sw,sh);
 }else if(art==='sword-rain'){
  const drop=easeIn(clamp(k/.5)),sh=H*.42,sw=sh*w/h;
  for(let i=0;i<3;i++){const off=(i-1)*sw*.35,delay=i*.06,d=easeIn(clamp((k-delay)/.5));c.globalAlpha=fadeOut*(i===1?1:.7);c.drawImage(im,tx+off-sw/2,-sh+(ty+20+sh*.2)*d,sw,sh);}
 }else if(art==='tornado'){
  const grow=ease(clamp((k-.15)/.4)),sh=H*.38*(.35+.65*grow),sw=sh*w/h,sway=Math.sin(k*30+seed)*10;
  c.globalAlpha=fadeOut*grow;c.drawImage(im,tx-sw/2+sway,ty+90-sh,sw,sh);
 }else if(art==='wave'){
  const u=ease(clamp((k-.1)/.55)),sw=520,sh=sw*h/w,x=A.x+(tx-A.x)*u;
  c.globalAlpha=fadeOut;c.translate(x,ty+30);if(dir<0)c.scale(-1,1);c.drawImage(im,-sw/2,-sh/2,sw,sh);
 }else if(art==='poison'){
  const grow=ease(clamp((k-.2)/.45)),sw=360*(.4+.6*grow),sh=sw*h/w;
  c.globalAlpha=fadeOut*grow*.95;c.drawImage(im,tx-sw/2,ty-sh/2+10,sw,sh);
 }else if(art==='staff'){
  // Gậy vươn dài từ tay người ra đòn tới đối thủ rồi đập xuống.
  const reach=ease(clamp(k/.35)),slam=ease(clamp((k-.35)/.2)),len=Math.abs(tx-A.x)+120,th=len*h/w*.9;
  c.globalAlpha=fadeOut;c.translate(A.x,A.y-170);c.rotate(dir*(-.35+slam*.5));if(dir<0)c.scale(-1,1);
  c.drawImage(im,0,-th/2,len*reach,th);
 }else if(art==='fire-dragon'){
  const u=ease(clamp((k-.05)/.55)),s=260*(.6+.4*u),x=A.x+(tx-A.x)*u,y=A.y-200+(ty-A.y+200)*u-Math.sin(u*Math.PI)*120;
  c.globalAlpha=fadeOut;c.translate(x,y);if(dir<0)c.scale(-1,1);c.drawImage(im,-s/2,-s/2,s,s);
 }else if(art==='golden-avatar'){
  const rise=ease(clamp(k/.4)),sh=H*.36,sw=sh*w/h;
  c.globalAlpha=fadeOut*rise*.85;c.drawImage(im,A.x-sw/2,A.y-sh-20+(1-rise)*60,sw,sh);
 }else{c.restore();return false;}
 c.restore();return true;
}
