// 15/11/2026: ẢNH THẬT cho bảng xem túi đồ / linh thú / skin.
// Vẽ bằng chính hình trên sân khấu (không vẽ ảnh mới). Mỗi ảnh vẽ 1 lần vào canvas nhỏ rồi giữ cache;
// chỉ chạy khi có người gõ lệnh xem, không chạy theo khung hình.
import {skinFor} from './cosmetics.js';
import {drawPngRelic} from './immortal-art.js';
import {petThumbFrames} from './spirit-pet-art.js';
import {petById} from './spirit-pets.js';
export const THUMB=128;
// Pháp bảo có ảnh riêng (bộ Thiên Khuyết).
const RELIC_ART=new Set(['hac-kim-hoa-dao','huyet-nguyet-dao','kim-cuong-chung','kim-phuong-cung','ngoc-tieu-an','nguyet-bach-phien','nguyet-lien-ngoc-truong','thanh-long-thuong','thien-kinh','tu-loi-luan','van-van-lo','xich-ha-thap','xich-vu-thien-kich']);
const images=new Map(),done=new Map();
function image(src){
 if(typeof Image==='undefined')return Promise.resolve(null);
 if(!images.has(src))images.set(src,new Promise(ok=>{const im=new Image();im.decoding='async';im.onload=()=>ok(im);im.onerror=()=>ok(null);im.src=src;}));
 return images.get(src);
}
// Thu gọn phần có hình (bỏ viền trong suốt) rồi đặt giữa ô vuông.
function fit(ctx,src,pad=6){
 const w=src.naturalWidth||src.width,h=src.naturalHeight||src.height;if(!w||!h)return false;
 const s=Math.min((THUMB-pad*2)/w,(THUMB-pad*2)/h);
 ctx.clearRect(0,0,THUMB,THUMB);ctx.drawImage(src,(THUMB-w*s)/2,(THUMB-h*s)/2,w*s,h*s);return true;
}
function trimmed(src){
 const w=src.width,h=src.height,doc=globalThis.document;if(!doc?.createElement||!w||!h)return src;
 let data;try{data=src.getContext('2d').getImageData(0,0,w,h).data;}catch{return src;}
 let x0=w,y0=h,x1=-1,y1=-1;
 for(let y=0;y<h;y+=2)for(let x=0;x<w;x+=2)if(data[(y*w+x)*4+3]>40){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
 if(x1<0)return null;
 const out=doc.createElement('canvas');out.width=x1-x0+3;out.height=y1-y0+3;out.getContext('2d').drawImage(src,x0-1,y0-1,out.width,out.height,0,0,out.width,out.height);return out;
}
function scratch(size=256){const c=globalThis.document?.createElement?.('canvas');if(!c)return null;c.width=size;c.height=size;return c;}
// Skin: vẽ nhân vật mặc skin đó (nửa người trên cho to mặt). Ảnh skin có thể chưa nạp → trả về false để vẽ lại sau.
function drawSkin(ctx,scene,player,skinId){
 const body=scratch(260);if(!body||!scene?.drawCharacterBody)return false;
 const x=body.getContext('2d');x.translate(130,236);x.scale(2.4,2.4);
 const p={...player,skinChoice:skinId,rewardSkins:[...new Set([...(player.rewardSkins||[]),skinId])]};
 try{scene.drawCharacterBody(x,p,skinFor(p.giftCoins),0);}catch{return false;}
 const t=trimmed(body);if(!t)return false;
 const keep=Math.min(t.height,Math.round(t.width*1.25)),s=Math.min((THUMB-4)/t.width,(THUMB-4)/keep);
 ctx.clearRect(0,0,THUMB,THUMB);ctx.drawImage(t,0,0,t.width,keep,(THUMB-t.width*s)/2,THUMB-2-keep*s,t.width*s,keep*s);return true;
}
function drawRelic(ctx,scene,player,id){
 const c=scratch(160);if(!c)return false;const x=c.getContext('2d');
 // drawPngRelic vẽ lệch về bên phải vai (motion=false → x≈34, y≈-24); dịch ngược để món nằm giữa.
 x.translate(80-34*2.6,80+24*2.6);x.scale(2.6,2.6);
 let ok=false;try{ok=drawPngRelic(x,{id:player?.id||'',equipped:id,relicVariant:player?.relicVariant},0,scene?.relicSprites,false,scene?.signatureSprites,scene?.combatSprites);}catch{ok=false;}
 if(!ok)return false;const t=trimmed(c);return t?fit(ctx,t,8):false;
}
// spec: {kind:'pet'|'skin'|'artifact', id}. Trả về true nếu đã có ảnh thật (không cần icon dự phòng).
export function paintThumb(canvas,spec,scene,player){
 const ctx=canvas?.getContext?.('2d');if(!ctx||!spec?.id)return false;
 const key=spec.kind+':'+spec.id+(spec.kind==='skin'?':'+(player?.gender||''):'');
 const cached=done.get(key);if(cached){ctx.clearRect(0,0,THUMB,THUMB);ctx.drawImage(cached,0,0);canvas.dataset.ready='1';return true;}
 const keep=()=>{const c=scratch(THUMB);if(!c)return;c.getContext('2d').drawImage(canvas,0,0);done.set(key,c);if(done.size>96)done.delete(done.keys().next().value);};
 if(spec.kind==='pet'){
  if(!petById(spec.id))return false;
  petThumbFrames(spec.id).then(frames=>{const f=frames?.[0];if(f&&fit(ctx,f,4)){canvas.dataset.ready='1';keep();}}).catch(()=>{});
  return true;
 }
 if(spec.kind==='artifact'){
  if(RELIC_ART.has(spec.id)){image('/assets/thien-khuyet/relic-'+spec.id+'.webp').then(im=>{if(im&&fit(ctx,im,6)){canvas.dataset.ready='1';keep();}});return true;}
  if(drawRelic(ctx,scene,player,spec.id)){canvas.dataset.ready='1';keep();return true;}
  return false;
 }
 if(spec.kind==='skin'){
  // Ảnh skin nạp lười: vẽ ngay, vẽ lại sau 1,2 s và 3 s; chỉ lưu cache ở lần cuối.
  if(!drawSkin(ctx,scene,player,spec.id))return false;canvas.dataset.ready='1';
  const again=(ms,last)=>setTimeout(()=>{if(canvas.isConnected===false)return;if(drawSkin(ctx,scene,player,spec.id)&&last)keep();},ms);
  again(1200,false);again(3000,true);return true;
 }
 return false;
}
