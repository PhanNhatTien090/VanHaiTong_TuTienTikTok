// Vân Hải Lôi Đài (15/11/2026) — bộ 4 chiêu mỗi đấu thủ. Dùng chung server (luật) + overlay (hình).
// SK1 pháp bảo đang đeo · SK2 pháp bảo phụ / chiêu hệ theo cảnh giới · SK3 tuyệt kỹ linh thú · SK4 tuyệt kỹ (nộ khí đầy).
import {TECHNIQUES,attackTechnique} from './combat-techniques.js';
import {petV2Skill} from './pet-v2-catalog.js';

// Tuyệt kỹ: chỉ dùng chiêu đã có cảnh V6/V7 dựng sẵn (hình lớn, cut-in).
export const ARENA_ULTIMATES=Object.freeze({
 thunder:'Cửu Thiên Lôi Long',sword:'Vạn Kiếm Diệt Thế',flame:'Phượng Hoàng Niết Bàn',dragon:'Thương Long Phá Hải',
 frost:'Băng Phách Phong Giới',lotus:'Cửu Liên Thánh Quang',bell:'Kim Chung Bất Diệt',meteor:'Tinh Không Diệt Thế',
 soul:'Vạn Hồn U Minh',sevenstars:'Thất Tinh Diệt Thần Trận',petal:'Bách Hoa Kiếm Vực',celestial:'Thái Cực Phong Thiên'
});
const ULT_ORDER=['sword','frost','flame','dragon','thunder','lotus','meteor','soul','sevenstars','bell','petal','celestial'];
// Chiêu hệ khi không có pháp bảo phụ: mỗi cảnh giới một hệ, tên riêng, hình khác SK1.
export const ARENA_ELEMENTS=Object.freeze([
 {tech:'slash',name:'Kim Quang Kiếm Khí'},{tech:'bamboo',name:'Mộc Linh Triền Trảm'},{tech:'dragon',name:'Huyền Thủy Long Ngâm'},
 {tech:'flame',name:'Liệt Hỏa Phần Thiên'},{tech:'bell',name:'Hậu Thổ Trấn Sơn'},{tech:'thunder',name:'Cửu Tiêu Lôi Đình'},
 {tech:'stardust',name:'Phong Nhận Loạn Vũ'},{tech:'frost',name:'Hàn Băng Phong Ấn'},{tech:'petal',name:'Bách Hoa Phi Diệp'},
 {tech:'stararrow',name:'Lưu Tinh Xuyên Vân'}
]);
// Hình cho chiêu linh thú (fx của Linh Thú V2 → chiêu có sẵn).
const PET_FX_TECH=Object.freeze({moon:'lotus',flame:'flame',frost:'frost',stars:'stars',lightning:'thunder',blood:'soul',shield:'bell',water:'dragon'});
export const ARENA_SLOT_LABEL=Object.freeze(['','Chiêu thường','Chiêu phụ','Linh thú','Tuyệt kỹ']);
// Hồi chiêu (ms) và sức mạnh cơ bản (phần máu tối đa của đối thủ).
export const ARENA_SLOT_RULES=Object.freeze({
 1:{cd:0,min:.045,max:.06},
 2:{cd:6000,min:.075,max:.10},
 3:{cd:10000,min:.085,max:.11},
 4:{cd:0,min:.20,max:.25}
});
export const arenaSkillLevel=fights=>Math.min(10,1+Math.floor(Math.sqrt(Math.max(0,Number(fights)||0)/2)));
const colorOf=id=>TECHNIQUES[id]?.color||'#bfe8ff';
const techOf=(p,equipped)=>{try{return attackTechnique(equipped?{...p,equipped}:p);}catch{return {id:'slash',name:'Thanh Phong Trảm'};}};

/** Bộ 4 chiêu của một người chơi (không thay đổi dữ liệu người chơi). */
export function arenaKit(p,technique=techOf){
 const realm=Math.max(0,Math.floor(Number(p?.realm)||0)),lv=arenaSkillLevel(p?.arenaFights);
 const main=technique(p)||{id:'slash',name:'Thanh Phong Trảm'},mainId=TECHNIQUES[main.id]?main.id:'slash';
 const extraId=(p?.equippedExtra||[]).find(id=>id&&id!==p?.equipped&&(p?.artifacts||[]).includes(id));
 let second=extraId?technique({...p,equipped:extraId}):null;
 if(!second||!TECHNIQUES[second.id]||second.id===mainId){
  let i=realm%ARENA_ELEMENTS.length;for(let n=0;n<ARENA_ELEMENTS.length&&ARENA_ELEMENTS[i].tech===mainId;n++)i=(i+1)%ARENA_ELEMENTS.length;
  second={id:ARENA_ELEMENTS[i].tech,name:ARENA_ELEMENTS[i].name};
 }
 const pet=p?.spiritPet&&(p.spiritPets||[]).includes(p.spiritPet)?petV2Skill(p.spiritPet):null;
 const third=pet?{id:PET_FX_TECH[pet.fx]||'stars',name:pet.name,role:pet.role,pet:p.spiritPet}:{id:'bell',name:'Hộ Thân Cương Khí',role:'defense',pet:null};
 const ultId=ARENA_ULTIMATES[mainId]?mainId:ARENA_ULTIMATES[second.id]?second.id:ULT_ORDER[realm%ULT_ORDER.length];
 return [
  {slot:1,tech:mainId,name:main.name||TECHNIQUES[mainId]?.name,color:colorOf(mainId),role:'attack',lv},
  {slot:2,tech:second.id,name:second.name,color:colorOf(second.id),role:'attack',lv},
  {slot:3,tech:third.id,name:third.name,color:colorOf(third.id),role:third.role,pet:third.pet,lv},
  {slot:4,tech:ultId,name:ARENA_ULTIMATES[ultId],color:colorOf(ultId),role:'ultimate',lv}
 ];
}
