// Per-player, per-command 8 second read gate. Mutations/combat are never throttled here.
export function live2AllowRead(p,key,now,windowMs=8000){
 if(!p||!Number.isFinite(now))return false;
 const c=p.cooldowns??={};
 const k='live2:read:'+key;
 if(now-(c[k]??-Infinity)<windowMs)return false;
 c[k]=now;
 return true;
}
