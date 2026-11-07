import {SPECIAL_SKINS} from './public/patrons.js';
import {SPIRIT_PETS} from './public/spirit-pets.js';
import {RACE_SWORD_SKINS} from './public/race-sword-skins.js';
export const MASTER_COINS=2000;
const real=p=>p&&!p.puppet&&!p.resident&&!p.webOnly&&!String(p.id).startsWith('puppet-');
export function masterGiftTotal(w,p){
 if(!real(p))return 0;if(Number.isFinite(p.masterGiftTotal))return p.masterGiftTotal;
 const edited=(w.adminLog||[]).some(r=>r.id===p.id&&r.changes?.some(s=>s.startsWith('coin quà ')));
 return edited?0:Math.max(0,Number(p.giftCoins)||0);
}
export function creditMasterGift(w,p,value){if(!real(p))return;p.masterGiftTotal=masterGiftTotal(w,p)+Math.max(0,Number(value)||0);}
export function unlockMasterLoadout(w,p,catalog,now=Date.now()){
 if(masterGiftTotal(w,p)<MASTER_COINS)return false;
 const fresh=!p.sectMasterUnlocked,add=(key,ids)=>p[key]=[...new Set([...(p[key]||[]),...ids])];
 add('artifacts',catalog.filter(i=>i.type==='artifact').map(i=>i.id));add('manuals',catalog.filter(i=>i.type==='manual').map(i=>i.id));
 add('rewardSkins',SPECIAL_SKINS.map(s=>s.id));add('spiritPets',SPIRIT_PETS.map(s=>s.id));add('raceSwordSkins',RACE_SWORD_SKINS.map(s=>s.id));
 p.sectMasterUnlocked=true;p.sectMasterUnlockedAt??=now;
 return fresh;
}
export function giftMasterView(players,host={}){
 const p=players.filter(p=>real(p)&&p.active&&p.sectMasterUnlocked).sort((a,b)=>(b.masterGiftTotal??b.giftCoins)-(a.masterGiftTotal??a.giftCoins)||(a.sectMasterUnlockedAt||0)-(b.sectMasterUnlockedAt||0)||String(a.id).localeCompare(String(b.id)))[0];
 return p?{enabled:true,source:'gift',userId:p.id,name:p.name,player:p,active:false}:host;
}
