// Validated equipment affinities and free expedition routes.
// These rules are shared by LIVE server gameplay; all player actions remain authoritative.
import {attackTechnique} from './public/combat-techniques.js';
import {petV2Skill} from './public/pet-v2-catalog.js';
const GEAR_ELEMENTS=Object.freeze({
 fire:Object.freeze(['flame']),
 lightning:Object.freeze(['thunder']),
 ice:Object.freeze(['frost']),
 star:Object.freeze(['stars','starmirror','stararrow','sevenstars','stardust','meteor']),
 water:Object.freeze(['dragon','vortex']),
 moon:Object.freeze(['lotus','petal','flowersword']),
 blood:Object.freeze(['soul'])
});
export const PET_V2_ROUTES=Object.freeze({
 nguyet:Object.freeze({id:'nguyet',name:'Nguyệt Ảnh Bí Cảnh',elements:Object.freeze(['moon','ice','water'])}),
 hoa:Object.freeze({id:'hoa',name:'Xích Hỏa Hoang',elements:Object.freeze(['fire','blood'])}),
 tinh:Object.freeze({id:'tinh',name:'Tinh Vực Lôi Đài',elements:Object.freeze(['star','lightning'])})
});
export const PET_V2_COMBOS=Object.freeze([
 ['fire','lightning','Lôi Hỏa Thiên Kiếp'],
 ['ice','water','Huyền Băng Thiên Triều'],
 ['moon','star','Tinh Nguyệt Đồng Huy'],
 ['fire','blood','Huyết Diễm Liên Hoa'],
 ['ice','moon','Nguyệt Hàn Phong Ấn'],
 ['water','star','Tinh Hải Long Triều'],
 ['lightning','star','Thiên Lôi Tinh Vũ'],
 ['blood','moon','Huyết Nguyệt Huyễn Trận'],
 ['fire','water','Long Hỏa Vân Hải']
].map(combo=>Object.freeze(combo)));
export const petV2Route=id=>PET_V2_ROUTES[id]||null;
export function petV2GearResonance(p,petId=p?.spiritPet){
 const pet=petV2Skill(petId);
 if(!pet||!p?.equipped||(p.artifacts||[]).includes(p.equipped)===false)return false;
 const allowed=GEAR_ELEMENTS[pet.element];if(!allowed)return false;
 return allowed.includes(attackTechnique(p).id);
}
export const petV2ExpeditionAffinity=(petId,routeId)=>{
 const pet=petV2Skill(petId),route=petV2Route(routeId);
 return !!pet&&!!route&&route.elements.includes(pet.element);
};
export function petV2Combination(a,b){
 if(!a||!b||a===b)return null;
 return PET_V2_COMBOS.find(c=>c[0]===a&&c[1]===b||c[0]===b&&c[1]===a)?.[2]||null;
}
