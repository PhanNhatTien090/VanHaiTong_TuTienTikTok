// Optional original high-detail WEBPs, only decoded before LIVE's actual effects.
// Defaults OFF: no missing URLs or extra GPU memory without installing the asset ZIP.
import {V7_PREMIUM_ENABLED,V7_PREMIUM_FILES} from './v7-premium-config.js';
const URL='/assets/v7-premium/';
const supported=Object.freeze({
 thunderDragon:'thunder-dragon.webp',
 thunderImpact:'thunder-dragon-impact.webp',
 swordStorm:'divine-sword-storm.webp',
 phoenix:'flame-phoenix.webp',
 phoenixImpact:'phoenix-impact.webp',
 taiji:'taiji-seal.webp',
 shatter:'screen-shatter.webp',
 goldenAtlas:'golden-sword-atlas.webp',
 thunderAtlas:'thunder-parts-atlas.webp',
 formationAtlas:'sword-formation-atlas.webp'
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
const disabled=scene=>scene.budget?.crowded||scene.budget?.pressured||scene.budget?.level==='light';
function requestOne(scene,key,token){
 if(!scene.premiumAllowed?.has(supported[key])||scene.premiumRequested?.has(key))return;
 scene.premiumRequested.add(key);
 const img=new Image();img.decoding='async';
 img.onload=()=>{
  if(scene.premiumMatchId===token&&img.naturalWidth>0)scene.v7PremiumArt[key]=img;
 };
 img.onerror=()=>{if(scene.premiumMatchId===token)scene.v7PremiumErrors.add(key);};
 img.src=URL+supported[key];
}
export function prewarmV7Premium(scene,match){
 if(!V7_PREMIUM_ENABLED||!scene||!match?.id||typeof Image==='undefined'||disabled(scene))return false;
 if(scene.premiumMatchId===match.id)return true;
 scene.premiumMatchId=match.id;scene.v7PremiumArt={};scene.v7PremiumErrors=new Set();
 scene.premiumRequested=new Set();scene.premiumAllowed=new Set(V7_PREMIUM_FILES);
 for(const key of premiumArtKeys(match))requestOne(scene,key,match.id);
 return true;
}
// Called at authoritative receipt sync, NEVER from the draw loop.
// One atlas per gift tier; 2 concurrent high-value donors => <=2 extra sprites.
export function prewarmV7GiftArt(scene,rows=[]){
 if(!V7_PREMIUM_ENABLED||!scene?.premiumMatchId||disabled(scene)||typeof Image==='undefined')return 0;
 let loaded=0;
 for(const row of rows){
  const v=Number(row?.value)||0;
  const key=v>=2000?'goldenAtlas':v>=1500?null:v>=1000?'formationAtlas':v>=700?'thunderAtlas':v>=500?'phoenix':null;
  if(key&&!scene.premiumRequested.has(key)){
   requestOne(scene,key,scene.premiumMatchId);loaded++;
  }
 }
 return loaded;
}
export function drawPremiumArt(c,img,x,y,w,h,a=1,flip=false){
 if(!img?.naturalWidth||a<=0)return false;
 c.save();c.globalAlpha=a;c.translate(x,y);if(flip)c.scale(-1,1);
 c.drawImage(img,-w*.5,-h*.5,w,h);c.restore();return true;
}
