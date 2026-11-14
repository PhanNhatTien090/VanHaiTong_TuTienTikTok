// V2 dueling rules: elemental and role tactics are deterministic, capped and
// NEVER override the 3%-total-cultivation winner rule from social-events.mjs.
// No pet rarity / coin / gift multiplier is read here.
import {petV2Skill} from './public/pet-v2-catalog.js';
const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
const affinity=Object.freeze({
 fire:'ice',ice:'water',water:'fire',lightning:'water',moon:'blood',
 blood:'star',star:'lightning'
});
// 13 distinct battle styles, all bounded to fractions of one duel point.
const TALENTS=Object.freeze({
 'jade-rabbit':.40,'ember-fox':.54,'frost-tiger':.44,
 'sun-phoenix':.32,'astral-dragon':.54,'loi-oa':.42,
 'van-thu':.47,'ky-lan':.38,'bach-nguyet-ho':.46,
 'ngoc-chau-long':.36,'xich-ha-phuong':.55,
 'tu-nguyet-lan':.42,'hac-tinh-ho':.52
});
export function petV2Traits(id,level=1,stage=0,bond=0,points=1){
 const p=petV2Skill(id);if(!p)return null;
 return Object.freeze({id,role:p.role,element:p.element,
  stage:clamp(Math.floor(Number(stage)||0),0,3),
  points:clamp(Number(points)||0,0,4),
  intensity:clamp((Number(level)||1)/40*.45+(Number(bond)||0)/100*.15,0,.6),
  talent:TALENTS[id]});
}
export function petV2TacticalScore(a,b,{cast=false,enemyCast=false}={}){
 if(!a)return 0;
 const pa=Number(a.points)||0;if(pa<=0)return 0;
 let bonus=0;
 if(cast){
  bonus=(Number(a.talent)||0)+Math.min(.22,a.stage*.065);
  if(a.role==='attack')bonus+=.35;
  else if(a.role==='support')bonus+=.22;
  else if(a.role==='control')bonus+=.28;
  else if(a.role==='defense')bonus+=.13;
  else if(a.role==='drain')bonus+=.25;
 }
 if(b){
  if(affinity[a.element]===b.element)bonus+=.26;
  if(affinity[b.element]===a.element)bonus-=.26;
  if(b.role==='defense')bonus-=enemyCast?.52:.22;
  if(b.role==='control'&&enemyCast)bonus-=.35;
  if(b.role==='drain'&&enemyCast)bonus-=.26;
  if(a.role==='defense'&&cast&&b.role==='attack')bonus+=.25;
 }
 // A well-developed ordinary pet still competes with premium pets;
 // the most powerful skills cannot increase tactical influence beyond 1 point.
 return clamp(pa+clamp(bonus,-.8,1),0,5);
}
export const petV2TraitDescriptions=Object.freeze({
 attack:'Tấn công: tăng áp lực khi xuất thần thông',
 support:'Hỗ trợ: tăng ổn định linh lực khi thi triển',
 defense:'Hộ pháp: giảm trợ lực từ thần thông đối thủ',
 control:'Khống chế: hạn chế thần thông của đối thủ',
 drain:'Hấp thụ: suy yếu trợ lực đối thủ'
});
