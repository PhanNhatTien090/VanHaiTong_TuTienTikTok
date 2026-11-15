// Deterministic Dao strengths: small PvE specialties, unlocked at Dao III; no randomness or paid benefit.
import {live2Level} from './live2-systems.mjs';
const ready=p=>!!p?.live2?.path&&live2Level(p)>=3;
export function live2TowerAffinity(p,t,now){
 if(!ready(p)||!t?.rule)return 1;
 const path=p.live2.path,rule=t.rule.id;
 if(path==='sword'&&rule==='sword')return 1.04;
 if(path==='body'&&(rule==='shield'||rule==='storm'))return 1.045;
 if(path==='beast'&&rule==='beast'&&p.spiritPet)return 1.045;
 if(path==='demon'&&rule==='mind')return 1.025;
 if(path==='alchemy'&&p.live2.elixirActive?.until>now)return 1.025;
 return 1;
}
export function live2BossAffinity(p,b,now){
 if(!ready(p)||!b?.live2Boss)return 1;
 const path=p.live2.path,phase=b.live2Boss;
 if(path==='demon'&&phase.phase==='frenzy')return 1.04;
 if(path==='sword'&&phase.phase==='seal'&&phase.exposedUntil>now)return 1.035;
 if(path==='beast'&&phase.phase==='gathering'&&p.spiritPet)return 1.03;
 if(path==='alchemy'&&p.live2.elixirActive?.until>now)return 1.025;
 return 1;
}
export function live2RecipeCost(p,r){
 if(!r)return null;
 const herbs=Number(r.herbs)||0,stones=Number(r.stones)||0;
 const saved=ready(p)&&p.live2.path==='alchemy'&&herbs>1?1:0;
 return {herbs:Math.max(0,herbs-saved),stones,herbsSaved:saved};
}
