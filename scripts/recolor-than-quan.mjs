// 08/11/2026: skin TẠM cho 3 cảnh giới mới = skin Thần Quân đổi màu (chủ game yêu cầu), tới khi có ảnh riêng.
// Chỉ đổi: giáp vàng (hue 32–68°), ngọc xanh lá (85–165°), vải xanh lam (165–215°). Da (hue < 30°) và vùng xám giữ nguyên.
// Chạy: node scripts/recolor-than-quan.mjs  → public/assets/realm-skins-v3/{ma-than,thien-ma-thanh-de,diet-the-chi-ton}/*.png
import {createCanvas,loadImage} from '@napi-rs/canvas';import fs from 'node:fs/promises';
const root=new URL('../',import.meta.url),SRC='public/assets/realm-skins-v3/than-quan/';
const FILES=['male-standing-v1.png','female-standing-v1.png','male-seated-v1.png','female-seated-v1.png'];
// mỗi nhóm: [hue đích (độ) hoặc null = giữ hue, hệ số bão hoà, hệ số sáng]
export const RECOLORS={
 'ma-than':{gold:[356,1.15,.82],gem:[14,1.25,1.05],cloth:[350,1.0,.62]},
 'thien-ma-thanh-de':{gold:[278,1.05,.85],gem:[318,1.2,1.05],cloth:[262,.95,.6]},
 'diet-the-chi-ton':{gold:[220,.12,.95],gem:[198,1.1,1.1],cloth:[230,.18,.35]}
};
function rgb2hsl(r,g,b){r/=255;g/=255;b/=255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2;let h=0,s=0;if(mx!==mn){const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h*=60;}return [h,s,l];}
function hsl2rgb(h,s,l){h=((h%360)+360)%360/360;const f=(p,q,t)=>{t=(t+1)%1;return t<1/6?p+(q-p)*6*t:t<1/2?q:t<2/3?p+(q-p)*(2/3-t)*6:p;};if(s===0)return [l*255,l*255,l*255];const q=l<.5?l*(1+s):l+s-l*s,p=2*l-q;return [f(p,q,h+1/3)*255,f(p,q,h)*255,f(p,q,h-1/3)*255];}
const band=(h,a,b,soft=6)=>h<a-soft||h>b+soft?0:h<a?(h-a+soft)/soft:h>b?(b+soft-h)/soft:1;
export function recolorPixels(d,spec){
 for(let i=0;i<d.length;i+=4){if(d[i+3]<8)continue;const [h,s,l]=rgb2hsl(d[i],d[i+1],d[i+2]);if(s<.12)continue;
  const w=[['gold',band(h,32,68)],['gem',band(h,85,165)],['cloth',band(h,165,215)]].sort((a,b)=>b[1]-a[1])[0];if(w[1]<=0)continue;
  const [th,ks,kl]=spec[w[0]],nh=th,ns=Math.min(1,s*ks),nl=Math.min(1,l*kl),[r,g,b]=hsl2rgb(nh,ns,nl),k=w[1];
  d[i]=d[i]*(1-k)+r*k;d[i+1]=d[i+1]*(1-k)+g*k;d[i+2]=d[i+2]*(1-k)+b*k;}
}
if(import.meta.url===`file:///${process.argv[1].replace(/\\/g,'/')}`||process.argv[1]?.endsWith('recolor-than-quan.mjs')){
 for(const [slug,spec] of Object.entries(RECOLORS)){const outDir=new URL('public/assets/realm-skins-v3/'+slug+'/',root);await fs.mkdir(outDir,{recursive:true});
  for(const f of FILES){const im=await loadImage(new URL(SRC+f,root).pathname.replace(/^\/([A-Z]:)/,'$1'));const cv=createCanvas(im.width,im.height),c=cv.getContext('2d');c.drawImage(im,0,0);const data=c.getImageData(0,0,im.width,im.height);recolorPixels(data.data,spec);c.putImageData(data,0,0);
   await fs.writeFile(new URL(f,outDir),cv.toBuffer('image/png'));}
  console.log('wrote',slug);}
}
