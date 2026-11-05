// Reuse the game's existing PNGs at native tile detail; no generated replacement art.
import {makeSurface} from './performance.js';
export const NGUYEN_ANH_ASSETS=Object.freeze([
 {url:'/assets/breakthrough-v2/mid.png',tiles:[['lotus',2]]},
 {url:'/assets/breakthrough-v3/celestial-spectacle.png',tiles:[['halo',5],['groundWave',4]]},
 {url:'/assets/breakthrough-v2/bursts.png',tiles:[['burst',2]]}
]);
export function sliceNguyenAnhArt(im,tiles,factory=makeSurface){
 const result={},w=(im.naturalWidth||im.width)/3,h=(im.naturalHeight||im.height)/2,size=Math.min(512,Math.round(w));
 for(const [key,index]of tiles){const canvas=factory(size,size);if(!canvas)continue;const c=canvas.getContext('2d');c.imageSmoothingQuality='high';c.drawImage(im,index%3*w,Math.floor(index/3)*h,w,h,3,3,size-6,size-6);result[key]=canvas;}
 return result;
}
export function prepareNguyenAnhArt(scene){
 if(typeof Image==='undefined')return;scene.nguyenAnhArt??={};scene.nguyenAnhArtLoading??=new Set();scene.nguyenAnhArtRetry??={};
 for(const {url,tiles}of NGUYEN_ANH_ASSETS){if(tiles.every(([key])=>scene.nguyenAnhArt[key])||scene.nguyenAnhArtLoading.has(url)||scene.nguyenAnhArtRetry[url]>Date.now())continue;
  scene.nguyenAnhArtLoading.add(url);let im=new Image();im.onload=()=>{Object.assign(scene.nguyenAnhArt,sliceNguyenAnhArt(im,tiles));scene.nguyenAnhArtLoading.delete(url);im=null;};im.onerror=()=>{scene.nguyenAnhArtLoading.delete(url);scene.nguyenAnhArtRetry[url]=Date.now()+15000;im=null;};im.src=url;
 }
}
