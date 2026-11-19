// 19/11/2026 (chủ game): VIỀN SÁNG MỎNG cho hình quan trọng (người, linh thú, thần khí) — màu "phản chiếu" theo ánh sáng:
// đỉnh sáng ấm, xuống dưới nhạt dần. Chỉ chạy khi body.ui-tm và CHỈ lúc vẽ lại bộ đệm (CharacterFrames repaint / cache ảnh),
// không chạy mỗi khung hình. Sau này có thể cho viền nhấp nháy/đổi màu (hiệu ứng) bằng cách đổi `tint`.
import {makeSurface} from './performance.js';
import {tmOn} from './ink-panel.js';
let scratch=null,sil=null;
const size=(cv,w,h)=>{if(!cv||cv.width!==w||cv.height!==h){cv=makeSurface(w,h);}return cv;};
// Màu viền theo người: đại gia vàng, có skin đặc biệt lấy màu skin, còn lại ngọc trắng.
export function rimTint(p,skinColor){const g=Number(p?.giftCoins)||0;if(g>=5000)return ['#fff1b8','#e9b949'];if(g>=1000)return ['#fff6d8','#f0c66b'];if(skinColor)return ['#ffffff',skinColor];return ['#f4fff8','#9fe3c8'];}
// Vẽ `paint` (đã đặt transform trên ctx đích) kèm viền: dựng hình ra canvas phụ cùng kích thước + transform, tạo bóng viền tô gradient, ghép.
export function withRim(ctx,paint,tint=["#fff6dc","#a8e6cf"],px=2.4){
 if(!tmOn()){paint(ctx);return;}
 const cv=ctx.canvas,W=cv.width,H=cv.height,T=ctx.getTransform();
 scratch=size(scratch,W,H);sil=size(sil,W,H);if(!scratch||!sil){paint(ctx);return;}
 const s=scratch.getContext('2d');s.setTransform(1,0,0,1,0,0);s.clearRect(0,0,W,H);s.setTransform(T);paint(s);
 const g=sil.getContext('2d');g.setTransform(1,0,0,1,0,0);g.globalCompositeOperation='source-over';g.clearRect(0,0,W,H);g.drawImage(scratch,0,0);
 g.globalCompositeOperation='source-in';const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,tint[0]);gr.addColorStop(.55,tint[1]);gr.addColorStop(1,tint[1]+'55');g.fillStyle=gr;g.fillRect(0,0,W,H);g.globalCompositeOperation='source-over';
 const d=Math.max(1,px*Math.hypot(T.a,T.b)/2);ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha*=1;
 for(let i=0;i<8;i++){const a=i*Math.PI/4;ctx.drawImage(sil,Math.cos(a)*d,Math.sin(a)*d);}
 ctx.drawImage(scratch,0,0);ctx.restore();
}
// Ảnh tĩnh (linh thú, thần khí): trả về bản đã có viền, cache theo ảnh + màu.
const cache=new WeakMap();
export function rimmed(img,tint=['#fff6dc','#a8e6cf'],px=3){
 if(!tmOn()||!img?.naturalWidth)return img;let m=cache.get(img);if(!m){m=new Map();cache.set(img,m);}const k=tint.join()+px;if(m.has(k))return m.get(k);
 const W=img.naturalWidth+px*2,H=img.naturalHeight+px*2,out=makeSurface(W,H),sv=makeSurface(W,H);if(!out||!sv)return img;
 const g=sv.getContext('2d');g.drawImage(img,px,px);g.globalCompositeOperation='source-in';const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,tint[0]);gr.addColorStop(.55,tint[1]);gr.addColorStop(1,tint[1]+'55');g.fillStyle=gr;g.fillRect(0,0,W,H);
 const o=out.getContext('2d');for(let i=0;i<8;i++){const a=i*Math.PI/4;o.drawImage(sv,Math.cos(a)*px,Math.sin(a)*px);}o.drawImage(img,px,px);
 out.naturalWidth=W;out.naturalHeight=H;out.complete=true;out.rimPad=px;m.set(k,out);return out;
}
