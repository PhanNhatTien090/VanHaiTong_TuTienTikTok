import {bondVipInfo,bondCapacity} from './public/bond-policy.js';
export {bondVipInfo,bondCapacity};
// Canonical relationships live in social.bonds. Legacy bondId remains a primary pointer only.
export function activeBonds(w,id){return Object.values(w.social?.bonds||{}).filter(b=>!b.endedAt&&b.a!==b.b&&(b.a===id||b.b===id)&&w.players[b.a]&&w.players[b.b]);}
export function syncBondRefs(w,p){const ids=activeBonds(w,p.id).map(b=>b.id);p.bondIds=ids;p.bondId=ids.includes(p.bondId)?p.bondId:ids[0]||null;return ids;}
export function bondAllowance(w,p){const info=bondVipInfo(p),used=activeBonds(w,p.id).length;return {...info,used,remaining:Math.max(0,info.limit-used)};}
export function alreadyBonded(w,a,b){return activeBonds(w,a).some(x=>x.a===b||x.b===b);}
