// Relic archetypes based ONLY on the canonical CATALOG item icon, never paid tiers.
// Legacy damage/bonus, auto-equipment, extra slots and old item rewards stay untouched.
export const RELIC_STYLES=Object.freeze({
 blade:{name:'Thiên Kiếm Phá Quân',art:'sword',boss:.057,tower:.029},
 orb:{name:'Tinh Hà Trấn Ấn',art:'relic',boss:.041,tower:.055},
 bell:{name:'Cửu Âm Phá Vực',art:'body',boss:.046,tower:.043},
 cauldron:{name:'Huyền Đan Tụ Linh',art:'alchemy',boss:.038,tower:.042},
 other:{name:'Vạn Bảo Hộ Tông',art:'relic',boss:.040,tower:.040}
});
const FAMILY=Object.freeze({sword:'blade',swords:'blade',dagger:'blade',blade:'blade',
 orb:'orb',seal:'orb',bell:'bell',chime:'bell',
 cauldron:'cauldron',vase:'cauldron',pot:'cauldron'});
export function relicDefinition(p,catalog=[]){
 const item=catalog.find(x=>x.id===p?.equipped&&x.type==='artifact');
 const family=FAMILY[item?.icon]||'other';
 return {family,style:RELIC_STYLES[family],itemName:item?.name||p?.equipped||'Pháp bảo'};
}
export function relicCombatBonus(p,now,kind='boss'){
 const s=p?.live2,a=s?.relicActive;
 if(!a||a.until<=now||a.id!==p.equipped||!p.artifacts?.includes(a.id))return 0;
 const style=RELIC_STYLES[a.family]||RELIC_STYLES.other;
 return Math.max(0,Math.min(.06,style[kind]||0));
}
