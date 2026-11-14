// Optional hand-authored premium WEBP gallery, decoded before a LIVE duel starts.
// Defaults OFF: no missing-file requests or extra GPU memory without installation.
import {V7_PREMIUM_ENABLED,V7_PREMIUM_FILES} from './v7-premium-config.js';
const URL='/assets/v7-premium/';
const supported=Object.freeze({
 thunderDragon:'thunder-dragon.webp',
 thunderImpact:'thunder-dragon-impact.webp',
 swordStorm:'divine-sword-storm.webp',
 phoenix:'flame-phoenix.webp',
 phoenixImpact:'phoenix-impact.webp',
 taiji:'taiji-seal.webp',
 shatter:'screen-shatter.webp'
});
export const PREMIUM_ART_FILES=supported;
export function premiumArtKeys(match){
 const ids=[match?.a,match?.b].map(id=>match?.techniques?.[id]?.id);
 const keys=[];
 for(const id of ids){
  if(id==='thunder')keys.push('thunderDragon','thunderImpact');
  if(['sword','slash','bamboo','stararrow'].includes(id))keys.push('swordStorm');
  if(id==='flame')keys.push('phoenix','phoenixImpact');
  if(id==='celestial')keys.push('taiji');
 }
 return [...new Set([...keys,'shatter'])];
}
export function prewarmV7Premium(scene,match){
 if(!V7_PREMIUM_ENABLED||!scene||!match?.id||typeof Image==='undefined'||
   scene.budget?.crowded||scene.budget?.pressured||scene.budget?.level==='light')return false;
 if(scene.premiumMatchId===match.id)return true;
 scene.premiumMatchId=match.id;scene.v7PremiumArt={};scene.v7PremiumErrors=new Set();
 const valid=new Set(V7_PREMIUM_FILES);
 for(const key of premiumArtKeys(match)){
  const file=supported[key];
  if(!valid.has(file))continue;
  const img=new Image();img.decoding='async';
  img.onload=()=>{
   if(scene.premiumMatchId===match.id&&img.naturalWidth>0)scene.v7PremiumArt[key]=img;
  };
  img.onerror=()=>{if(scene.premiumMatchId===match.id)scene.v7PremiumErrors.add(key);};
  img.src=URL+file;
 }
 return true;
}
export function drawPremiumArt(c,img,x,y,w,h,a=1,flip=false){
 if(!img?.naturalWidth||a<=0)return false;
 c.save();c.globalAlpha=a;c.translate(x,y);if(flip)c.scale(-1,1);
 c.drawImage(img,-w*.5,-h*.5,w,h);c.restore();return true;
}
