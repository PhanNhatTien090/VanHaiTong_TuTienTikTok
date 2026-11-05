import {REALM_SKIN_IMAGES} from './realm-skins-v2-data.js';
import {visualGender} from './cosmetics.js';
import {specialSkinFor} from './patrons.js';
import {makeSurface} from './performance.js';

export function realmSkinV2For(p){
  if(specialSkinFor(p))return null;
  return REALM_SKIN_IMAGES[Math.trunc(Number(p.realm)||0)]||null;
}
export function ensureRealmSkinV2(scene,p){
  const assets=realmSkinV2For(p);if(!assets||typeof Image==='undefined')return;
  const gender=visualGender(p)==='nu'?'female':'male';
  const cache=scene.realmSkinV2Art??=new Map();
  for(const pose of ['standing','seated']){
    const spec=assets[gender+'-'+pose];if(!spec||cache.has(spec.url))continue;
    const entry={image:null};cache.set(spec.url,entry);let im=new Image();
    im.onload=()=>{const [x,y,right,bottom]=spec.bounds,w=right-x,h=bottom-y;
      const scale=Math.min(1,768/Math.max(w,h)),surface=makeSurface(Math.ceil(w*scale),Math.ceil(h*scale));
      if(surface){const c=surface.getContext('2d');c.imageSmoothingQuality='high';c.drawImage(im,x,y,w,h,0,0,surface.width,surface.height);entry.image=surface;}else entry.image=im;
      scene.characterFrames?.clear();for(const [key,value] of Object.entries(scene))if(/Actor$/.test(key)&&value?.frames instanceof Map)value.frames.clear();im=null;
    };
    im.onerror=()=>{cache.delete(spec.url);im=null;};im.src=spec.url;
  }
}
export function drawRealmSkinV2(scene,c,p,pose,t){
  const assets=realmSkinV2For(p);if(!assets)return false;
  ensureRealmSkinV2(scene,p);const gender=visualGender(p)==='nu'?'female':'male',stand=Math.max(0,Math.min(1,pose.stand||0));
  const standing=scene.realmSkinV2Art?.get(assets[gender+'-standing']?.url)?.image,seated=scene.realmSkinV2Art?.get(assets[gender+'-seated']?.url)?.image;
  if(stand>.001&&!standing||stand<.999&&!seated)return false;
  c.save();c.translate(0,pose.lift||0);c.rotate(pose.lean||0);c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
  const draw=(im,alpha,height)=>{if(!im||alpha<=.001)return;const width=height*im.width/im.height;c.save();c.globalAlpha*=alpha;const breath=scene.motion===false?0:Math.sin(t*.0018)*.003;c.scale(1+breath,1-breath);c.drawImage(im,-width/2,27-height,width,height);c.restore();};
  draw(seated,1-stand,85);draw(standing,stand,118);c.restore();return true;
}
