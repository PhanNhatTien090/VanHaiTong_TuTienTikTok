import {drawSoulBanner} from './lin-wan-art.js';
import {drawShendeGift} from './shende-art.js';
import {realmDivineLook} from './divine-wardrobe.js';
import {CELESTIAL_RELICS} from './celestial-bosses.js';
import {BOSS_RELICS} from './boss-encounters.js';
import {COMBAT_RELICS} from './combat-techniques.js';
import {makeSurface} from './performance.js';
import {VISITOR_RELICS} from './visitor-event.js';
import {visualGender} from './cosmetics.js';
import {appearanceFor,outfitRung} from './realm-outfits.js';
export function loadImmortalArt(scene){
 const atlas=(url,cols,rows,size,done)=>{const image=new Image();image.onload=()=>{const frames=[],sw=image.naturalWidth/cols,sh=image.naturalHeight/rows;for(let i=0;i<cols*rows;i++){const canvas=makeSurface(size,size);if(!canvas)continue;canvas.getContext('2d').drawImage(image,(i%cols)*sw,Math.floor(i/cols)*sh,sw,sh,0,0,size,size);frames.push(canvas);}done(frames);scene.characterFrames?.clear();};image.src=url;};
 atlas('/assets/combat-relics-v41.png',2,2,192,s=>scene.combatSprites=s);
 atlas('/assets/visitor-signatures-v40.png',2,1,256,s=>scene.signatureSprites=s);
 atlas('/assets/relics-immortal.png',3,2,160,s=>scene.relicSprites=s);
 // Tall visitors preserve their aspect, decoded once at a small resolution.
 const visitors=new Image();visitors.onload=()=>{scene.visitorSprites=[];for(let i=0;i<2;i++){const s=makeSurface(400,640);if(s){s.getContext('2d').drawImage(visitors,i*visitors.naturalWidth/2,0,visitors.naturalWidth/2,visitors.naturalHeight,0,0,400,640);scene.visitorSprites.push(s);}}scene.characterFrames?.clear();};visitors.src='/assets/immortal-visitors.png';
 const armed=new Image();armed.onload=()=>{scene.armedVisitorSprites=[];for(let i=0;i<2;i++){const s=makeSurface(400,640);if(s){s.getContext('2d').drawImage(armed,i*armed.naturalWidth/2,0,armed.naturalWidth/2,armed.naturalHeight,0,0,400,640);scene.armedVisitorSprites.push(s);}}};armed.src='/assets/immortal-visitors-armed-v40.png';
 for(const [key,url]of [['robeArt','/assets/cultivators-robes-v39.png'],['robeStandingArt','/assets/cultivators-standing-v39.png']]){const image=new Image();image.onload=()=>{const h=image.naturalHeight,s=makeSurface(image.naturalWidth,h);if(!s)return;s.getContext('2d').drawImage(image,0,0,s.width,h);s.naturalWidth=s.width;s.naturalHeight=h;s.complete=true;scene[key]=s;scene.characterFrames?.clear();};image.src=url;}
}
// v44: một quy tắc duy nhất. Bậc áo L = max(bậc coin quà, bậc cảnh giới) — giống hệt tên skin hiển thị.
// Bộ v39 có 3 hình nam (0 xanh ngọc · 2 tóc bạc áo chàm · 4 trắng vàng) và 2 hình nữ (1 trắng ánh trăng · 3 đỏ phượng).
// Nam: L0–2 → 0, L3–4 → 4.  Nữ: L0–2 → 1, L3–4 → 3.
// KHÔNG dùng hình 2 (nam tóc bạc áo đen chàm) cho áo thường: trông giống hệt skin Vương Lâm (chỉ có khi tặng đủ coin trong sự kiện Vương Lâm).
export const ROBE_CELLS=Object.freeze({nam:[0,0,0,4,4],nu:[1,1,1,3,3]});
export function robeLevel(p){const special=null;return Math.max(0,Math.min(4,appearanceFor({...p,skinChoice:special}).level??0));}
// v48: ảnh theo nấc áo. sheet: 'robe' (bộ v39) · 'special' (patron-sets: 0/1 Thương Long nam/nữ, 2/3 Xích Phượng nam/nữ) · 'legacy' (bộ ảnh cũ: 4 = nữ Thiên Đế trắng vàng).
export function outfitArt(p){if((Number(p.realm)||0)===0)return {sheet:'novice',cell:visualGender(p)==='nu'?1:0,group:5};if((Number(p.realm)||0)===2&&!(p.giftCoins>=500))return {sheet:'legacy',cell:visualGender(p)==='nu'?4:2};if((Number(p.realm)||0)<=5){const nu=visualGender(p)==='nu',r=outfitRung(p);if(r===3)return {sheet:'special',cell:nu?1:0};if(r===2)return {sheet:'special',cell:nu?3:2};if(r===1)return nu?{sheet:'legacy',cell:4}:{sheet:'robe',cell:4};return {sheet:'robe',cell:nu?1:0};}const d=realmDivineLook(p);return {sheet:'divine',cell:d.col,group:d.group,cols:d.cols};}
export function robeCell(p){const a=outfitArt(p);return a.sheet+':'+(a.group??'')+':'+a.cell;}
export function relicCell(p){
 const exact=VISITOR_RELICS.find(a=>a.id===p.equipped);if(exact)return exact.cell;
 const id=p.equipped||'';if(!id)return null;if(id==='sea-dragon-heart')return 4;
 if(/vase/.test(id))return 1;if(/bell/.test(id))return 2;if(/phien/.test(id))return 5;
 if(/seal/.test(id))return 4;
 if(!/sword|blade|kiem|^jade$/.test(id))return null;
 let seed=p.relicVariant??0;for(const c of String(p.id))seed=(Math.imul(seed,31)+c.charCodeAt(0))>>>0;
 return seed%2?3:0;
}
// v46: Thanh Trúc Phong Vân Kiếm (Hàn Lập) — cố định SAU LƯNG người chơi, tự xoay tròn tại chỗ. Gọi TRƯỚC khi vẽ thân nhân vật.
export function drawBackRelic(c,p,t,signatures,motion=true,pose={}){
 if(p.equipped!=='hanlap-bamboo-swords')return false;const img=signatures?.[0];if(!img)return false;
 const y=-40-12*(pose.stand||0)+(pose.lift||0),spin=motion?t*.0012:0,size=92;
 c.save();c.translate(0,y);
 c.save();c.globalCompositeOperation='screen';const g=c.createRadialGradient(0,0,4,0,0,size*.62);g.addColorStop(0,'#9ff0c8aa');g.addColorStop(1,'#9ff0c800');c.fillStyle=g;c.fillRect(-size*.62,-size*.62,size*1.24,size*1.24);c.restore();
 c.rotate(spin);c.drawImage(img,-size/2,-size/2,size,size);c.restore();return true;
}
export function drawPngRelic(c,p,t,sprites,motion=true,signatures=null,combat=null){
 const combatItem=[...COMBAT_RELICS,...BOSS_RELICS,...CELESTIAL_RELICS].find(a=>a.id===p.equipped),combatImage=combat?.[combatItem?.cell];
 if(combatImage){const a=motion?t*.001:0;c.save();c.translate(Math.cos(a)*33,-25+Math.sin(a)*9);c.rotate(Math.sin(a)*.13);c.drawImage(combatImage,-24,-28,48,56);c.restore();return true;}
 const signature=p.equipped==='hanlap-bamboo-swords'?signatures?.[0]:p.equipped==='vuonglam-soul-banner'?signatures?.[1]:null;
 if(signature){const a=motion?t*.001:0;c.save();c.translate(Math.cos(a)*30,-24+Math.sin(a)*8);c.rotate(p.equipped==='hanlap-bamboo-swords'?a*.25:Math.sin(a)*.1);if(p.equipped==='hanlap-bamboo-swords'){c.restore();return true;}/* đã vẽ sau lưng bằng drawBackRelic */else {c.restore();drawSoulBanner(c,signature,t,motion);return true;}c.restore();return true;}
 const cell=relicCell(p),img=sprites?.[cell];if(!img)return false;
 const a=motion?t*.001:0,x=Math.cos(a)*34,y=-24+Math.sin(a)*10;
 c.save();c.translate(x,y);c.rotate(Math.sin(a*.6)*.14);c.drawImage(img,-18,-28,36,48);c.restore();return true;
}
export function drawImmortalGift(c,e,t,k,p,H,sprites,light=true,signatures=null,shende=null){
 if(drawShendeGift(c,e,t,k,p,H,shende))return;
 if(e.visitorTechnique&&signatures?.length){const image=signatures[e.visitorTechnique==='hanlap'?0:1],fade=Math.max(0,Math.min(1,k/.15,(1-k)/.2));c.save();c.globalAlpha=fade*.85;c.translate(p.x,p.y-200);c.rotate(e.visitorTechnique==='hanlap'?t*.00025:Math.sin(t*.0007)*.05);c.drawImage(image,-150,-150,300,300);c.restore();}
 const value=(e.coins||0)*(e.count||1);if(value<999||!sprites?.length)return;
 const fade=Math.max(0,Math.min(1,k/.17,(1-k)/.18)),open=Math.sin(Math.min(1,k/.4)*Math.PI/2),cell=value>=9999?4:value>=2999?5:0;
 c.save();c.globalAlpha=fade*.65;c.translate(p.x,Math.max(H*.28,p.y-250));
 const size=(value>=9999?380:280)*(.7+.3*open);c.rotate(Math.sin(t*.0005)*.05);c.drawImage(sprites[cell],-size/2,-size/2,size,size);
 c.globalAlpha=fade*.8;const count=light?6:10;
 for(let i=0;i<count;i++){const a=i*Math.PI*2/count+t*.00045,r=110+open*70;c.save();c.translate(Math.cos(a)*r,Math.sin(a)*r*.65+80);c.rotate(a+Math.PI/2);c.drawImage(sprites[i%2?3:0],-12,-36,24,72);c.restore();}
 c.restore();
}
