// Vân Hải Lôi Đài (15/11/2026) — bộ 4 chiêu mỗi đấu thủ. Dùng chung server (luật) + overlay (hình).
// v2 (15/11 chiều): 5 ô — SK1 pháp bảo · SK2/SK3 bí pháp chiêu thức (chưa học: pháp bảo phụ / chiêu hệ) · SK4 linh thú · SK5 tuyệt kỹ (nộ khí đầy).
import {TECHNIQUES,attackTechnique} from './combat-techniques.js';
import {petV2Skill} from './pet-v2-catalog.js';
import {arenaElement} from './arena-fx.js';

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
export const ARENA_SLOT_LABEL=Object.freeze(['','Chiêu thường','Bí pháp','Bí pháp','Linh thú','Tuyệt kỹ']);
export const ARENA_SLOTS=5,ARENA_ULT_SLOT=5,ARENA_PET_SLOT=4;
// Hồi chiêu (ms) và sức mạnh cơ bản (phần máu tối đa của đối thủ).
export const ARENA_SLOT_RULES=Object.freeze({
 1:{cd:0,min:.045,max:.06},
 2:{cd:6000,min:.075,max:.10},
 3:{cd:8000,min:.08,max:.105},
 4:{cd:10000,min:.085,max:.11},
 5:{cd:0,min:.20,max:.25}
});
// Ngũ hành: hệ hình → hành; khắc: kim>mộc>thổ>thủy>hỏa>kim (±10%).
export const ARENA_HANH_OF=Object.freeze({sword:'kim',star:'kim',flower:'moc',water:'thuy',ice:'thuy',fire:'hoa',lightning:'hoa',gold:'tho',soul:'tho'});
export const ARENA_HANH_NAME=Object.freeze({kim:'Kim',moc:'Mộc',thuy:'Thủy',hoa:'Hỏa',tho:'Thổ'});
const BEATS=Object.freeze({kim:'moc',moc:'tho',tho:'thuy',thuy:'hoa',hoa:'kim'});
export const arenaHanh=tech=>ARENA_HANH_OF[arenaElement(tech)]||'kim';
export const hanhBeats=(a,b)=>BEATS[a]===b;
// Hiệu ứng phụ mặc định của chiêu hệ (SK2/SK3 khi chưa học bí pháp).
export const ARENA_ELEMENT_EFFECT=Object.freeze({ice:'weaken',fire:'burn',lightning:'knock',sword:'break',soul:'drain',gold:'reflect',water:'none',flower:'none',star:'none'});
export const ARENA_EFFECT_NAME=Object.freeze({burn:'Độc/Bỏng',weaken:'Giảm công',knock:'Đẩy lùi',break:'Phá khiên',drain:'Hút máu',reflect:'Phản đòn',stun:'Choáng',none:''});
export const arenaSkillLevel=fights=>Math.min(10,1+Math.floor(Math.sqrt(Math.max(0,Number(fights)||0)/2)));
const colorOf=id=>TECHNIQUES[id]?.color||'#bfe8ff';
const techOf=(p,equipped)=>{try{return attackTechnique(equipped?{...p,equipped}:p);}catch{return {id:'slash',name:'Thanh Phong Trảm'};}};

/** Bộ 5 chiêu của một người chơi (không thay đổi dữ liệu người chơi). books: bí pháp chiêu thức đã xếp ô (tối đa 2). */
export function arenaKit(p,technique=techOf,books=[]){
 const realm=Math.max(0,Math.floor(Number(p?.realm)||0)),lv=arenaSkillLevel(p?.arenaFights);
 const main=technique(p)||{id:'slash',name:'Thanh Phong Trảm'},mainId=TECHNIQUES[main.id]?main.id:'slash';
 const used=new Set([mainId]),fill=[];
 const extraId=(p?.equippedExtra||[]).find(id=>id&&id!==p?.equipped&&(p?.artifacts||[]).includes(id));
 const extra=extraId?technique({...p,equipped:extraId}):null;
 if(extra&&TECHNIQUES[extra.id]&&!used.has(extra.id)){fill.push({id:extra.id,name:extra.name});used.add(extra.id);}
 for(let n=0,i=realm%ARENA_ELEMENTS.length;fill.length<2&&n<ARENA_ELEMENTS.length;n++,i=(i+1)%ARENA_ELEMENTS.length){const e=ARENA_ELEMENTS[i];if(used.has(e.tech))continue;fill.push({id:e.tech,name:e.name});used.add(e.tech);}
 const book=(b,fb)=>b?{tech:b.tech,name:b.name,effect:b.effect||'none',tier:b.tier||1,book:b.id,power:b.power||1,art:b.art||null}:{tech:fb.id,name:fb.name,effect:ARENA_ELEMENT_EFFECT[arenaElement(fb.id)]||'none',tier:1,power:1};
 const s2=book(books[0],fill[0]),s3=book(books[1],fill[1]||fill[0]);
 const pet=p?.spiritPet&&(p.spiritPets||[]).includes(p.spiritPet)?petV2Skill(p.spiritPet):null;
 const petSkill=pet?{id:PET_FX_TECH[pet.fx]||'stars',name:pet.name,role:pet.role,pet:p.spiritPet}:{id:'bell',name:'Hộ Thân Cương Khí',role:'defense',pet:null};
 const ultId=ARENA_ULTIMATES[mainId]?mainId:ARENA_ULTIMATES[s2.tech]?s2.tech:ULT_ORDER[realm%ULT_ORDER.length];
 const mk=(o)=>({...o,color:colorOf(o.tech),hanh:arenaHanh(o.tech),lv});
 return [
  mk({slot:1,tech:mainId,name:main.name||TECHNIQUES[mainId]?.name,role:'attack',effect:'none',tier:1}),
  mk({slot:2,tech:s2.tech,name:s2.name,role:'attack',effect:s2.effect,tier:s2.tier,book:s2.book||null,power:s2.power,art:s2.art||null}),
  mk({slot:3,tech:s3.tech,name:s3.name,role:'attack',effect:s3.effect,tier:s3.tier,book:s3.book||null,power:s3.power,art:s3.art||null}),
  mk({slot:4,tech:petSkill.id,name:petSkill.name,role:petSkill.role,pet:petSkill.pet,effect:'none',tier:3}),
  mk({slot:5,tech:ultId,name:ARENA_ULTIMATES[ultId],role:'ultimate',effect:'none',tier:4})
 ];
}
