// LIVE pet combat catalog. Rarity is deliberately excluded from combat power.
import {ALL_PETS} from './spirit-pets.js';
export const PET_V2_STAGES=Object.freeze(['Ấu Linh','Chiến Linh','Thánh Linh','Bản Mệnh']);
const definitions=[
 ['jade-rabbit','moon','support','Nguyệt Linh Hồi Nguyên','moon'],
 ['ember-fox','fire','attack','Cửu Hỏa Hồ Ảnh','flame'],
 ['frost-tiger','ice','control','Băng Phách Trấn Thiên','frost'],
 ['sun-phoenix','fire','support','Phượng Vũ Niết Hỏa','flame'],
 ['astral-dragon','star','attack','Tinh Hà Long Tức','stars'],
 ['loi-oa','lightning','control','Cửu Thiên Lôi Chấn','lightning'],
 ['van-thu','blood','drain','Huyền Văn Thực Linh','blood'],
 ['ky-lan','fire','defense','Kỳ Lân Thánh Thuẫn','shield'],
 ['bach-nguyet-ho','ice','control','Cửu Vĩ Mê Thiên','frost'],
 ['ngoc-chau-long','water','defense','Thiên Hải Long Triều','water'],
 ['xich-ha-phuong','fire','attack','Xích Hà Phần Thiên','flame'],
 ['tu-nguyet-lan','moon','support','Tử Nguyệt Linh Trận','moon'],
 ['hac-tinh-ho','star','attack','Hắc Tinh Phá Không','stars']
];
export const PET_V2_SKILLS=Object.freeze(Object.fromEntries(definitions.map(([id,element,role,name,fx])=>[id,Object.freeze({id,element,role,name,fx})])));
export const PET_V2_IDS=Object.freeze(ALL_PETS.map(p=>p.id));
export const petV2Skill=id=>PET_V2_SKILLS[id]||null;
export const petStageName=i=>PET_V2_STAGES[Math.max(0,Math.min(3,Number(i)||0))];
export const petXpNext=level=>level>=40?0:20+4*level+Math.ceil(level*level/4);
export const petBasePoints=g=>Math.min(4,1+Math.min(2,Math.floor(((g?.level||1)-1)/15))+(g?.bond>=40?1:0));
export const petStageUnlocked=(g,target)=>g.level>=[1,10,20,30][target]&&(g.trains||0)>=target&&(target<2||(g.expeditions||0)>=target-1);
