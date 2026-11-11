import {creditMasterGift,unlockMasterLoadout,resetHistoricMasters} from './master-rewards.mjs';
import {safeGiftUrl} from './public/gift-icons.js';
import {preserveOpportunityCredit,addOpportunityCredit,spendOpportunityCredit} from './opportunity-progress.mjs';
import {rebirthCommand} from './rebirth.mjs';
// 09/11: skin Tần Mục Hỏa Thần (public/viem-ton.js) — lệnh luyencong.
export const VIEM_SKIN_ID='phan-thien-viem-ton',VIEM_LUYENCONG_QI=9;
const viemWorn=p=>p?.skinChoice===VIEM_SKIN_ID&&p.rewardSkins?.includes(VIEM_SKIN_ID);
import {capturePeriodBase,ensurePeriods,computeTops} from './period-tops.mjs';
import {dailyPracticeView,creditDailyPractice,dailyAscensionView,recordDailyAscension,practiceDay} from './daily-practice.mjs';
import {bondVipInfo} from './public/bond-policy.js';
import {PET_COVE_MAP} from './public/pet-cove.js';
import {ABYSS_BOSS,ABYSS_SECT_REWARD} from './public/abyss-boss.js';
import {ascensionPracticeReward,ASCENSION_PACING_VERSION} from './public/ascension-pacing.js';
import {DORA_RELICS} from './public/doraemon-data.js';
import {trackIntro,finishIntro} from './onboarding.mjs';
import {talk,talking,TALK_SHOW_MS} from './talk.mjs';
import {automaticEventsPaused,configureEventSpacing} from './event-pacing.mjs';
import {auditRecord,noteVisitorParticipant,archiveVisitor} from './visitor-audit.mjs';
import {stageConflict,SKY_SETTLEMENT_MS,skyStageUntil} from './stage-lock.mjs';
import {startPetEvent,stopPetEvent,petEventView,petActivity,petCommand} from './spirit-pets.mjs';
import {giftForCommand,giftForTarget,giftForEventEnd} from './gift-for.mjs';
import {ALL_PETS} from './public/spirit-pets.js';
import {controlLantern,lanternCommand,tickLantern,lanternView} from './lantern-festival.mjs';
import {createCompanionPair,companionCommand,companionActivity,finishGuard,tickCompanions,companionView} from './companions.mjs';
import {tickPuppetRoses} from './puppet-auto-rose.mjs';
import {recordEventGiftFx} from './event-gift-fx.mjs';
import {flowerHearts,finishFlowerHearts,bossHearts} from './heart-events.mjs';
import {raceHearts} from './sword-race.mjs';
import {warActive,startWar as beginWar,stopWar as endWar,tickWar,warCommand,warHearts,warGift,warView,warStageIds} from './sect-war.mjs';
import {teasePair as beginTease} from './tease.mjs';
import {startBonk as beginBonk,stopBonk as endBonk,tickBonk,bonkCommand,bonkView,bonkGift,bonkOpen} from './bonk.mjs';
import {startTower as beginTower,stopTower as endTower,tickTower,towerCommand,towerView,towerOpen} from './tower.mjs'; // 11/11: Vân Hải Tháp
import {startMaze as beginMaze,stopMaze as endMaze,tickMaze,mazeCommand,mazeGift,mazeView,mazeActive} from './maze.mjs';
import {startAlchemy as beginAlchemy,stopAlchemy as endAlchemy,tickAlchemy,alchemyCommand,alchemyHearts,alchemyGift,alchemyView,alchemyStageIds,alchemyActive} from './alchemy.mjs';
import {DIVINE_ROLES,rankDivineRoles} from './public/divine-wardrobe.js';
import {honorRoll,honorTitle,eventAvatar,safeAvatar} from './public/honors.js';
import {festivalActivity,startBondFestival as beginBondFestival,stopBondFestival as endBondFestival} from './bond-festival.mjs';
import {CELESTIAL_BOSSES,CELESTIAL_RELICS} from './public/celestial-bosses.js';
import {ELITE_BOSSES,BOSS_RELICS,encounterPhase,encounterHit} from './public/boss-encounters.js';
import {BOSSES,environmentAt} from './public/world-rotation.js';
import {GIFT_TIERS,GIFT_ARTIFACTS,GIFT_POLICY_VERSION,giftReward} from './public/gift-rewards.js';
import {VIP_TIERS,vipTier} from './public/vip.js';
import {engagementCommand,tickEngagement,trackTasks,checkinStreak,sectBuild,engagementView,startEnvelopeNow,startQuizNow} from './engagement.mjs';
import {topPatron,PATRON_SKIN,PATRON_SWORD,PATRON_SEAL,SPECIAL_SKINS} from './public/patrons.js';
import {giftKind,giftNameVi} from './public/gift-kinds.js';
import {LOYALTY_ARTIFACTS,LOYALTY_TIERS} from './public/loyalty.js';
import {OPPORTUNITY_COSTS,OPPORTUNITY_MS} from './public/opportunity.js';
import {gameText} from './public/game-language.js';
import {EVENT_ARTIFACTS} from './public/event-artifacts.js';
import {attackTechnique,COMBAT_RELICS} from './public/combat-techniques.js';
import {creditVisitorGift,reconcileVisitorPricing,visitorSkinName,SIGNATURE_ARTIFACTS,VISITOR_GIFT_REWARDS} from './public/visitor-rewards.js';
import {VISITORS,VISITOR_RELICS} from './public/visitor-event.js';
import {raceStageIds,startRace as beginRace,stopRace as endRace,tickRace,raceCommand,raceBoost,raceView,raceVisible,giftRaceUnits,RACE_GIFT_PRIZES,raceGiftTop} from './sword-race.mjs';
import {SOCIAL_ITEMS,socialProfile,socialCommand,bondActivity,tickSocial,socialView,socialBusy,tournamentActive,startTournament as beginTournament,stopTournament as endTournament} from './social-events.mjs';
// Shared realm names keep server, overlay and breakthrough titles aligned.
import {REALM_NAMES,REBIRTH_UNLOCK_REALM} from './public/progression.js';
import {resolveQuick,quickView} from './quick-commands.mjs';
export const REALMS = REALM_NAMES;
export const CATALOG = [
  ...DORA_RELICS,...LOYALTY_ARTIFACTS,...GIFT_ARTIFACTS,...EVENT_ARTIFACTS,...VISITOR_RELICS,...SIGNATURE_ARTIFACTS,...COMBAT_RELICS,...SOCIAL_ITEMS,...BOSS_RELICS,...CELESTIAL_RELICS,
  {id:'tiger-bell',type:'artifact',name:'Lôi Hổ Thần Chung',icon:'bell',tier:0,price:0,herbs:0,damage:50,bonus:.35,exclusive:true,description:'Chiến lợi phẩm Top công lực khi hạ Lôi Hổ: +50 công lực, +35% tu vi khi trang bị.'},
  {id:'breath', type:'manual', name:'Thanh Tâm Quyết', icon:'scroll', tier:0, price:35, herbs:0, description:'Tu luyện nhận thêm 15% tu vi.', bonus:0.15},
  {id:'sword', type:'manual', name:'Vạn Kiếm Quy Tông', icon:'swords', tier:1, price:110, herbs:0, description:'Tăng 12 công lực khi xuất chiêu.', damage:12},
  {id:'lotus', type:'manual', name:'Cửu Chuyển Liên Hoa', icon:'lotus', tier:2, price:240, herbs:0, description:'Tu luyện nhận thêm 25% tu vi.', bonus:0.25},
  {id:'jade', type:'artifact', name:'Thanh Ngọc Kiếm', icon:'sword', tier:0, price:60, herbs:2, description:'Pháp bảo trang bị: +8 công lực.', damage:8},
  {id:'bell', type:'artifact', name:'Huyền Thiên Linh', icon:'bell', tier:1, price:140, herbs:4, description:'Pháp bảo trang bị: +14 công lực, +10% tu vi.', damage:14, bonus:0.10},
  {id:'orb', type:'artifact', name:'Tinh Hà Châu', icon:'orb', tier:2, price:280, herbs:8, description:'Pháp bảo trang bị: +22 công lực, +20% tu vi.', damage:22, bonus:0.20},
  {id:'qi-pill', type:'pill', name:'Tụ Khí Đan', icon:'pill', tier:0, price:12, herbs:2, qi:65, description:'Dùng một viên nhận 65 tu vi. Hồi 3 giây.'},
  {id:'frost-sword',type:'artifact',name:'Băng Phách Kiếm',icon:'sword',tier:3,price:420,herbs:12,damage:26,description:'Kiếm băng: +26 công lực.'},
  {id:'phoenix-blade',type:'artifact',name:'Xích Diễm Kiếm',icon:'sword',tier:4,price:650,herbs:20,damage:34,skinReward:'crimson-phoenix',description:'Kiếm hỏa: +34 công lực; mở Xích Phượng Chiến Y.'},
  {id:'celestial-orb',type:'artifact',name:'Cửu Tiêu Linh Châu',icon:'orb',tier:5,price:900,herbs:30,damage:24,bonus:.15,skinReward:'ivory-celestial',description:'Pháp bảo tinh tú: +24 công lực, +15% tu vi; mở Bạch Kim Tiên Đế.'},
  {id:PATRON_SWORD,type:'artifact',name:'Hộ Pháp Thiên Kiếm',icon:'sword',tier:0,price:0,herbs:0,damage:28,exclusive:true,description:'Thưởng dẫn đầu quà tích lũy: +28 công lực, kiếm Thương Long riêng.'},
  {id:PATRON_SEAL,type:'artifact',name:'Trấn Tông Long Ấn',icon:'orb',tier:0,price:0,herbs:0,damage:18,bonus:.12,exclusive:true,description:'Thưởng dẫn đầu quà tích lũy: +18 công lực, +12% tu vi khi trang bị.'},
  {id:'spirit-pill', type:'pill', name:'Ngưng Thần Đan', icon:'pill', tier:1, price:35, herbs:4, qi:180, description:'Dùng một viên nhận 180 tu vi. Hồi 3 giây.'}
];
export const DEFAULT_GIFTS=GIFT_TIERS;
// Passive rewards unlock outfits without replacing an explicit choice or visitor costume.
const autoSkinChoiceAllowed=p=>!['manual','admin'].includes(p.skinChoiceSource)&&!['hanlap-avatar','vuonglam-avatar','shende-avatar','doraemon-avatar','tudo-ma-ton','khuy-niet-loi-ton','phan-thien-viem-ton'].includes(p.skinChoice);

export function createWorld(mode='demo') {
  return {version:1,giftPolicyVersion:GIFT_POLICY_VERSION, mode, players:{}, feed:[], events:[], seen:{}, giftCounts:{}, gifts:structuredClone(DEFAULT_GIFTS), nextBossAt:0, boss:null, totalGifts:0, totalInteractions:0, sectQi:0, settings:{bossInterval:240}, createdAt:Date.now()};
}
const clean = (s,n=32)=>String(s??'').replace(/[\u0000-\u001f<>]/g,'').trim().slice(0,n);
export const normalize = s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/đ/g,'d').replace(/^!/,'').trim();
// v33: đắt hơn để không lên Nguyên Anh trong 15 phút chỉ nhờ spam tuluyen.
// Tu vi: 150 · 360 · 864 · 2074 · 4977 · 11944 · 28667 · 68800. Linh thạch: 30 · 70 · 110 · 150 …
// New players keep their first two steps; later breakthroughs require progressively longer cultivation.
export const progressionMult = p=>p.realm<2?1:p.realm<5?1.5:p.realm<8?2:p.realm<13?3:4;
export const requiredQi = p=>Math.round((p.realm<=8?150 * 2.4 ** p.realm:150 * 2.4 ** 8 * 1.8 ** (p.realm-8))*progressionMult(p));
export const requiredStones = p=>Math.round((30 + 40*p.realm)*Math.sqrt(progressionMult(p)));
export function power(p) {
  return 8 + p.realm*7 + p.manuals.reduce((n,id)=>n+(CATALOG.find(x=>x.id===id)?.damage||0),0) + (CATALOG.find(x=>x.id===p.equipped)?.damage||0) + Math.round(extraStat(p,'damage'));
}
function emit(w,p,text,effect='qi',now=Date.now(),extra={}) {
  text=gameText(text);
  const e={id:`${now}-${Math.random().toString(36).slice(2,8)}`,at:now,user:p?.id,name:p?.name||'Vân Hải Tông',text,effect,...extra};
  if(p?.puppet||p?.resident)e.actorKind='npc';
  w.feed.unshift(e); w.feed=w.feed.slice(0,70); w.events.push(e); w.events=w.events.slice(-100); return e;
}
// v68: tu vi chơi tay theo cảnh giới — 3 cảnh giới đầu nhanh, càng lên càng chậm; quà (phúc duyên) mới là đường lên nhanh.
// 3/11: tăng tốc tu vi chơi tay từ Hóa Thần trở xuống (Phàm nhân…Hóa Thần), cảnh giới cao giữ nguyên.
export const HAND_QI_MULT=Object.freeze([4.5,3.75,3,2,1.4,1,.3,.2]);
export const handQiMult=p=>HAND_QI_MULT[Math.min(HAND_QI_MULT.length-1,Math.max(0,Number(p.realm)||0))];
// Giờ vàng tân thủ: 30 phút đầu, cảnh giới ≤ Trúc Cơ → chơi tay được tu vi ×2, linh thạch ×3 (nút thắt của người mới là linh thạch).
export const GOLDEN_MS=30*60000;
export const goldenHour=(p,now,w=null)=>!!p&&w?.settings?.goldenHour===true&&!p.resident&&!p.puppet&&now!=null&&(Number(p.realm)||0)<=2&&now-(Number(p.joinedAt)||0)<GOLDEN_MS;
const qiBonus=p=>p.manuals.reduce((n,id)=>n+(CATALOG.find(x=>x.id===id)?.bonus||0),0)+(CATALOG.find(x=>x.id===p.equipped)?.bonus||0)+extraStat(p,'bonus');
export const EVENT_GEAR_SHARE=.5;
const freeQiUnit=p=>Math.ceil(requiredQi(p)/ascensionPracticeReward(p.realm,'cultivate',requiredQi(p),requiredStones(p)).steps);
function gain(w,p,qi,stones=0,herbs=0,now=null,hand=false,source='free') {
  if(hand&&heavenStunned(p,now??Date.now()))return 0; // 07/11: Thiên Lôi trấn áp — không tu luyện được
  if(hand)qi*=handQiMult(p)*(1+(VIP_TIERS[vipTier(p.giftCoins)]?.bonus||0)); // v86: VIP +10/20/30%
  if(hand&&talking(p,now))qi*=1.2; // 4/11: Luận Đạo — có trò chuyện thường trong 5 phút gần nhất
  if(hand&&goldenHour(p,now,w)){qi*=2;stones*=3;}
  // 09/11 (chủ game): thưởng sự kiện (nguồn 'reward': câu đố, lì xì, nhiệm vụ, lò đan…) chỉ ăn một nửa hệ số pháp bảo/công pháp.
  const bonus=qiBonus(p)*(source==='reward'?EVENT_GEAR_SHARE:1);
  // v33: Phúc duyên (buff sau khi tặng quà) nhân tu vi + linh thạch của hành động chơi tay trong thời gian hiệu lực.
  const buff=hand&&now!==null&&p.buffUntil>now?(p.buffMult||1):1;
  let amount=Math.round(qi*(1+bonus)*buff);stones=Math.round(stones*buff);
  if(w.settings?.ascensionShowcase===true&&!p.resident&&!p.puppet&&typeof hand==='string'){
    const floor=ascensionPracticeReward(p.realm,hand,requiredQi(p),requiredStones(p));
    amount=Math.max(amount,Math.round(floor.qi*(talking(p,now)?1.2:1)));stones=Math.max(stones,floor.stones);
  }
  amount=creditQi(w,p,amount,now??Date.now(),typeof hand==='string'?hand:source);
  p.qi+=amount;p.totalQi+=amount;p.stones+=stones;p.herbs+=herbs;w.sectQi+=amount; return amount;
}
function creditQi(w,p,amount,now=Date.now(),source='free'){
  const unit=freeQiUnit(p);
  const credit=creditDailyPractice(w,p,amount,source,now,unit);
  // 07/11/2026: hạn mức ngày chạy ngầm — không báo cho người chơi (đọc thấy rất nản).
  return credit.amount;
}
export const buffActive=(p,now=Date.now())=>p.buffUntil>now?p.buffMult:0;
const practiceTag=()=>''; // 07/11/2026: ẩn giới hạn tu luyện
const buffTag=(p,now)=>p.buffUntil>now?` • phúc duyên ×${String(p.buffMult).replace('.',',')}`:'';
// Phúc duyên theo tổng lượt quà: <10 ×3, <100 ×5, <1000 ×8, từ 1000 ×12; 10 phút.
export function giftBuff(totalCoins){return totalCoins>=1000?12:totalCoins>=100?8:totalCoins>=10?5:3;} // v68: phúc duyên quà mạnh hơn nhiều
export const GIFT_BUFF_MS=10*60000;
function cooldown(p,key,ms,now) {
  const left=ms-(now-(p.cooldowns[key]||0));
  if(left>0) return Math.ceil(left/1000);
  p.cooldowns[key]=now; return 0;
}
// TikTok/TikFinity không cung cấp giới tính tài khoản → người xem tự khai (nhapmon nam / nhapmon nu /
// gioitinh nu). Chưa khai thì xưng trung tính "đạo hữu", không đoán theo tên.
export function parseGender(text) {
  const t=' '+normalize(text).replace(/[^a-z0-9]+/g,' ')+' ';
  if(/ (nu|su ty|suty|ty|su muoi|sumuoi|muoi|tien tu|female|girl) /.test(t))return 'nu';
  if(/ (nam|su huynh|suhuynh|huynh|su de|sude|de|male|boy) /.test(t))return 'nam';
  if(/ (an|bi mat|dao huu|daohuu|khong) /.test(t))return 'an';
  return null;
}
export const title = g=>g==='nam'?'sư huynh':g==='nu'?'sư tỷ':'đạo hữu';
function setGender(w,p,g,now) {
  const value=g==='nam'||g==='nu'?g:null;
  if((p.gender??null)===value)return {ok:true,unchanged:true};
  p.gender=value;emit(w,p,`Xưng hiệu ${title(value)}`,'title',now);return {ok:true};
}
export function ensurePlayer(w,id,name,now=Date.now(),gender=null) {
  id=clean(id,80); if(!id) throw Error('Thiếu ID người tham gia.');
  if(!Object.hasOwn(w.players,id)) {
    if(Object.keys(w.players).length>=10000) throw Error('Đã đạt giới hạn 10.000 hồ sơ.');
    Object.defineProperty(w.players,id,{value:{id,name:clean(name)||id,gender:gender==='nam'||gender==='nu'?gender:null,realm:0,qi:0,totalQi:0,stones:30,herbs:3,manuals:[],artifacts:[],equipped:null,pills:{},cooldowns:{},contribution:0,interactions:0,giftCoins:0,joinedAt:now,lastActive:now,day:null},enumerable:true,writable:true,configurable:true});
    emit(w,w.players[id],'Ngự kiếm nhập môn • nhận 30 linh thạch, 3 linh thảo','join',now);
  }
  const p=w.players[id];capturePeriodBase(w,p,now);socialProfile(w,p);if(w.settings?.ascensionShowcase===true&&!p.resident&&!p.puppet)p.ascensionAccess='free';if(name)p.name=clean(name);p.lastActive=now;return p;
}
function fail(message){return {ok:false,message};}
// Người xem hay gõ có dấu và có dấu cách ("đột phá", "tu luyện", "nhập môn nữ", "dotpha!") → gộp thành lệnh.
const COMMANDS=['chuyensinh','phikiem','cungtu','giup','bay','baykiem','dua','duakiem','tangtoc','goiy','huongdan','lenh','nhapmon','gioitinh','xungho','xunghieu','tuvi','xem','thongtin','tuluyen','dotpha','hai','diemdanh','danh','hoc','ren','luyendan','dung','trangbi','skin','luyencong','coduyen','tythi','kiem','ketduyen','dongy','tuchoi','duyen','huyduyen','mecung','godau','leothap','vaothap'];
export function commandWords(text){
  const words=normalize(text).split(/\s+/).map(w=>w.replace(/[^a-z0-9]/g,'')).filter(Boolean);
  if(words.length>1&&!COMMANDS.includes(words[0])&&COMMANDS.includes(words[0]+words[1]))words.splice(0,2,words[0]+words[1]);
  return words;
}
export const finalRealmEligible=p=>p.ascensionAccess==='free'||p.realm<12||Number(p.giftCoins||0)>=100;
export const readyToBreak=(p,w=null,now=Date.now())=>finalRealmEligible(p)&&p.realm<REALMS.length-1&&p.qi>=requiredQi(p)&&p.stones>=requiredStones(p)&&(!w||!dailyAscensionView(w,p,now).exhausted);
// 08/11: nêu rõ phần còn thiếu + lệnh kiếm thêm (trước đây chỉ có số, người đủ tu vi nhưng thiếu linh thạch tưởng là lỗi).
export function missingText(p){const q=requiredQi(p)-p.qi,st=requiredStones(p)-p.stones;return [q>0&&'thiếu '+q.toLocaleString('vi-VN')+' tu vi · gõ tu luyện',st>0&&'thiếu '+st.toLocaleString('vi-VN')+' linh thạch · gõ hái'].filter(Boolean).join(' • ');}
export const statusText=(p,w=null,now=Date.now())=>`Tu vi ${p.qi}/${requiredQi(p)} • Linh thạch ${p.stones}/${requiredStones(p)} • ${REALMS[p.realm]}${p.realm<REALMS.length-1&&missingText(p)?' • '+missingText(p):''}${!finalRealmEligible(p)?' • Tiên Đế cần tổng quà 100 coin (hiện '+(p.giftCoins||0)+')':readyToBreak(p,w,now)?' • đủ đột phá':''}${w&&dailyAscensionView(w,p,now).exhausted&&p.qi>=requiredQi(p)&&p.stones>=requiredStones(p)?' • đạo cơ đang lắng đọng':''}`; // 07/11/2026: ẩn số liệu hạn mức
// Báo một lần khi người chơi vừa đủ điều kiện đột phá cảnh giới hiện tại.
function checkReady(w,p,now){
  if(!readyToBreak(p,w,now)||p.readyRealm===p.realm)return;
  p.readyRealm=p.realm;emit(w,p,`Đủ tu vi đột phá ${REALMS[p.realm+1]} • gõ dotpha`,'ready',now);
}
// Gợi ý bước tiếp theo cho từng người: đủ linh thạch thì chỉ đúng lệnh cần gõ.
// Mỗi gợi ý chỉ nói một lần mỗi người; mỗi người cách nhau ≥3 phút; cả tông môn ≥20 giây một gợi ý.
const plain=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D');
// v33: chỉ cần gõ lệnh ngắn (hoc / ren / luyendan / dung / trangbi), game tự chọn món phù hợp nhất.
// 11/11/2026: LINH BÀI ĐẠO HỮU — số liệu cho thẻ hồ sơ giữa màn khi gõ 9 / tu vi. Cùng nội dung statusText (không lộ hạn mức ngày),
// thêm thứ hạng tu vi và MỘT bước nên làm tiếp, chỉ bằng lệnh số.
export function profileCard(p,w,now=Date.now()){
  const last=p.realm>=REALMS.length-1,needQi=requiredQi(p),needStones=requiredStones(p),ready=readyToBreak(p,w,now);
  const real=Object.values(w.players).filter(x=>!x.resident&&!x.puppet);const rank=1+real.filter(x=>(x.totalQi||0)>(p.totalQi||0)).length;
  const settling=!!(w&&dailyAscensionView(w,p,now).exhausted&&p.qi>=needQi&&p.stones>=needStones);
  const tip=last?'Đã đạt đỉnh tu tiên':!finalRealmEligible(p)?'Tiên Đế cần tổng quà 100 coin':settling?'Đạo cơ đang lắng đọng · mai đột phá tiếp':ready?'Gõ 8 · đột phá ngay':p.qi<needQi?'Gõ 1 tu luyện · 4 luyện đan · 5 dùng đan':'Gõ 2 hái · 3 đánh để có linh thạch';
  return {realm:p.realm,realmName:REALMS[p.realm],next:last?null:REALMS[p.realm+1],qi:p.qi,needQi,stones:p.stones,needStones,ready,rank,players:real.length,totalQi:p.totalQi||0,tip};
}
export function suggestion(p){
  const pill=CATALOG.find(x=>x.type==='pill'&&p.pills[x.id]>0);if(pill)return {key:'use:'+pill.id,cmd:'dung',say:`dùng ${pill.name}`,why:pill.description};
  const can=x=>!x.exclusive&&x.tier<=p.realm&&p.stones>=x.price&&p.herbs>=x.herbs;
  const manual=CATALOG.find(x=>x.type==='manual'&&!p.manuals.includes(x.id)&&can(x));if(manual)return {key:'learn:'+manual.id,cmd:'hoc',say:`học để lĩnh ngộ ${manual.name}`,why:manual.description};
  const art=CATALOG.find(x=>x.type==='artifact'&&!p.artifacts.includes(x.id)&&can(x));if(art)return {key:'craft:'+art.id,cmd:'ren',say:`rèn để có ${art.name}`,why:art.description};
  const brew=[...CATALOG].reverse().find(x=>x.type==='pill'&&can(x));if(brew&&p.herbs>=brew.herbs)return {key:'brew:'+brew.id+':'+p.realm,cmd:'luyendan',say:`luyện đan để có ${brew.name}`,why:brew.description};
  return null;
}
const itemScore=id=>{const a=CATALOG.find(x=>x.id===id);return (a?.damage||0)+(a?.bonus||0)*100;};
// v70: luôn đeo pháp bảo mạnh nhất đang sở hữu (sát thương + %tu vi×100). Chỉ tính lại khi túi đồ/món đang đeo đổi.
const equipSeen=new WeakMap();
// v71: tu vi càng cao càng đeo được nhiều pháp bảo cùng lúc (món chính đủ sức mạnh, món phụ 50%).
export const relicSlots=p=>{const r=Number(p.realm)||0;return r>=12?5:r>=9?4:r>=6?3:r>=3?2:1;};
export function autoEquipBest(p){const arts=p.artifacts||[];const sig=arts.length+'|'+p.equipped+'|'+relicSlots(p)+'|'+(p.equippedExtra||[]).length;if(equipSeen.get(p)===sig)return false;
  const ranked=[...new Set(arts)].filter(id=>CATALOG.some(x=>x.id===id&&x.type==='artifact')).sort((a,b)=>itemScore(b)-itemScore(a));
  const best=ranked[0]||null,extra=ranked.slice(1,relicSlots(p));const changed=best!==p.equipped||String(extra)!==String(p.equippedExtra||[]);
  p.equipped=best;p.equippedExtra=extra;equipSeen.set(p,arts.length+'|'+p.equipped+'|'+relicSlots(p)+'|'+extra.length);return changed;}
const extraStat=(p,key)=>(p.equippedExtra||[]).reduce((n,id)=>n+(CATALOG.find(x=>x.id===id)?.[key]||0)*.5,0);
// Lệnh không kèm tên → chọn món: món đủ điều kiện đầu tiên; nếu chưa đủ thì món kế tiếp (để báo thiếu gì).
function autoItem(p,type){
  if(type==='equip')return [...p.artifacts].sort((a,b)=>itemScore(b)-itemScore(a))[0];
  if(type==='use')return CATALOG.find(x=>x.type==='pill'&&p.pills[x.id]>0)?.id;
  const kind={learn:'manual',craft:'artifact',brew:'pill'}[type];
  const list=CATALOG.filter(x=>x.type===kind&&!x.exclusive&&(kind==='pill'||!(kind==='manual'?p.manuals:p.artifacts).includes(x.id)));
  const ok=x=>x.tier<=p.realm&&p.stones>=x.price&&p.herbs>=x.herbs;
  return (kind==='pill'?[...list].reverse().find(ok):list.find(ok))?.id||list.find(x=>x.tier<=p.realm)?.id||list[0]?.id;
}
// v79: HƯỚNG DẪN NGƯỜI MỚI theo từng bước (15 phút đầu, Phàm nhân/Luyện Khí): điểm danh → tu luyện → hái thảo/thả tim.
// Mỗi bước nhắc 1 lần, làm rồi thì bỏ qua; giọng đọc ưu tiên ngang câu cảm ơn quà.
const vnDay=now=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
export function newbieGuide(w,p,now){
  const age=now-(p.intro?.startedAt||p.joinedAt||0);if(p.resident||p.puppet&&!p.guideDemo||(p.realm||0)>1||age>15*60000||age<20000||readyToBreak(p,w,now))return false;
  p.guided??=[];if(now-(p.guideAt||0)<12000||now-(w.lastGuideAt||0)<4000)return false;
  const step=!p.cultivatedAt?'cultivate':null;
  if(!step||p.guided.includes(step))return false;
  p.guided.push(step);p.guideAt=now;w.lastGuideAt=now;
  emit(w,p,'Hướng dẫn: '+{checkin:'diemdanh',cultivate:'tuluyen',gather:'hai'}[step],'hint',now,{guide:step});return true;
}
// v82: đủ tu vi mà THIẾU LINH THẠCH → tự báo (nhiều người không biết vì sao chưa đột phá được).
// 08/11: nhắc lại mỗi 3 phút khi vẫn còn thiếu (trước chỉ 1 lần mỗi cảnh giới); overlay hiện bong bóng "Gõ hái" trên đầu.
export const STONE_HINT_MS=180000;
function missingStones(w,p,now){if(p.resident||p.puppet||p.realm>=REALMS.length-1||p.qi<requiredQi(p)||p.stones>=requiredStones(p)||now-(p.stoneHintAt||0)<STONE_HINT_MS||now-(w.lastGuideAt||0)<4000)return false;
  p.stoneHintRealm=p.realm;p.stoneHintAt=now;w.lastGuideAt=now;emit(w,p,statusText(p,w,now),'status',now,{missing:'stones'});return true;}
function maybeHint(w,p,now){
  if(p.intro&&!p.intro.advancedAt&&now-p.intro.startedAt<5*60000)return;
  if(readyToBreak(p,w,now)||now-(p.joinedAt||0)<30000)return;const s=suggestion(p);if(!s)return;p.hints??=[];
  if(p.hints.includes(s.key)||now-(p.hintAt||0)<90000||now-(w.lastHintAt||0)<12000)return;
  p.hints.push(s.key);p.hints=p.hints.slice(-20);p.hintAt=now;w.lastHintAt=now;
  emit(w,p,`Gõ: ${s.cmd}`,'hint',now,{say:s.say,why:s.why});
}
// Simulated actors are a DEMO tool; LIVE retains existing actors as labeled NPCs.
const PUPPET_TYPES=['chat','like','gift','attack','breakthrough','follow','checkin','gather','cultivate'];
export function puppetControl(w,b={},now=Date.now()){
  const op=b.op;
  if(w.mode==='live'&&op!=='list'&&!(op==='keep'&&b.keep===false))return fail('Mô phỏng chỉ dùng ở DEMO. Chuyển sang thế giới thử nghiệm để tạo nhân vật hoặc thử quà.');
  if(op==='list')return {ok:true,puppets:Object.values(w.players).filter(p=>p.puppet).map(p=>({id:p.id,name:p.name,gender:p.gender,realm:p.realm,realmName:REALMS[p.realm],qi:p.qi,giftCoins:p.giftCoins,keep:p.puppetKeep!==false,autoRose:p.puppetAutoRose!==false,nextRoseAt:p.puppetRoseAt||null,active:currentParticipant(w,p,now)}))};
  if(op==='create'){const name=clean(b.name,40);if(!name)return fail('Nhập tên tu sĩ.');const id='puppet-'+now.toString(36)+Math.random().toString(36).slice(2,6);
    const gender=b.gender==='nu'?'nu':b.gender==='nam'?'nam':'';const r=action(w,{type:'chat',userId:id,name,text:('nhapmon '+gender).trim()},now);const p=w.players[id];if(!p)return r.ok===false?r:fail('Không tạo được.');
    p.puppet=true;p.puppetKeep=true;const realm=Math.max(0,Math.min(REALMS.length-1,Math.trunc(Number(b.realm)||0)));if(realm){p.realm=realm;p.totalQi=Math.max(p.totalQi,requiredQi({realm:realm-1}));}
    return {ok:true,id,name:p.name};}
  const p=w.players[clean(b.id,80)];if(!p||!p.puppet)return fail('Không tìm thấy tu sĩ giả.');
  if(op==='keep'){p.puppetKeep=b.keep!==false;if(!p.puppetKeep)p.lastActive=0;else p.lastActive=now;return {ok:true};}
  if(op==='auto-rose'){p.puppetAutoRose=b.enabled!==false;p.puppetRoseAt=null;return {ok:true};}
  if(op==='act'){const type=b.type;if(!PUPPET_TYPES.includes(type))return fail('Hành động không hợp lệ.');p.lastActive=now;
    const input={type,userId:p.id,name:p.name,eventId:'puppet-'+now+'-'+Math.random().toString(36).slice(2,8)};
    if(type==='chat'){input.text=clean(b.text,200);if(!input.text)return fail('Nhập nội dung bình luận.');}
    if(type==='like')input.count=Math.max(1,Math.min(5000,Math.trunc(Number(b.count)||10)));
    if(type==='gift'){input.coins=Math.max(1,Math.min(100000,Math.trunc(Number(b.coins)||1)));input.count=Math.max(1,Math.min(1000,Math.trunc(Number(b.count)||1)));input.giftName=clean(b.giftName,40)||'Rose';}
    const before=w.events.length,result=action(w,input,now);
    // v83: báo lại phần thưởng thật của lần tặng (món quà, tu vi, tài nguyên, pháp bảo mới hoặc đã có, phúc duyên)
    if(type==='gift'&&result.ok&&!result.duplicate){const e=w.events.slice(before).findLast(x=>x.user===p.id&&x.gift);
      const tierItem=CATALOG.find(x=>x.id===giftReward(input.coins,w.gifts).tier.artifact)?.name||null;
      if(e)result.gift={name:e.gift,coins:input.coins*input.count,qi:e.reward?.qi||0,stones:e.reward?.stones||0,herbs:e.reward?.herbs||0,items:e.reward?.itemNames||[],tierItem,alreadyOwned:!!tierItem&&!(e.reward?.itemNames||[]).includes(tierItem),buff:e.buff?.mult||null,raceBoost:e.raceBoost||0};}
    return result;}
  return fail('Thao tác không hợp lệ.');
}
function protectTransferred(w,fn){
  const held=Object.entries(w.playTransfers||{}).filter(([id,lock])=>lock.phase==='web'&&w.players[id]).map(([id,lock])=>[w.players[id],structuredClone(lock.player)]);
  try{return fn();}finally{for(const [p,saved]of held){for(const key of Object.keys(p))delete p[key];Object.assign(p,saved);}}
}
export function action(w,input,now=Date.now()) {return protectTransferred(w,()=>unlockedAction(w,input,now));}
// 07/11/2026: CHỐNG TỰ THẢ TIM. Tim tính điểm sự kiện tối đa ~2 tim/giây mỗi người (dồn được 120 tim cho lúc thả dồn dập).
// Thả liên tục trung bình >1,5 tim/giây (đo ~5 phút) → tim tụ linh hồi 30 giây thay vì 10 giây. Không phát thông báo nào.
// 09/11/2026 ĐẠO TÂM — chống auto tim / spam lệnh trên LIVE. Mốc "tham gia thật" (engagedAt) chỉ làm mới khi: trò chuyện,
// gõ lệnh sự kiện / lệnh khác ngoài nhóm cày (tuluyen, luyencong, hai, diemdanh, dotpha) và nhóm xem thông tin, đánh yêu thú, tặng quà thật.
// Thả tim và nhóm lệnh cày KHÔNG làm mới. Quá 15 phút không tham gia thật → cảnh báo; quá 20 phút → tim / tuluyen / luyencong / hai
// không cộng tu vi (nhắc lại tối đa 5 phút/lần) tới khi người chơi trò chuyện hoặc tham gia sự kiện. Không áp cho web, NPC, puppet.
export const DAO_TAM=Object.freeze({warnMs:15*60000,blockMs:20*60000,noticeMs:5*60000});
const FARM_CMDS=new Set(['tuluyen','luyencong','hai','diemdanh','dotpha']),INFO_CMDS=new Set(['xem','tuvi','thongtin','giup','lenh','huongdan','goiy']);
const noteEngaged=(p,now)=>{p.engagedAt=now;p.daoTamWarnedAt=0;};
function daoTamBlocked(w,p,now){
 if(w.webShadow||p.resident||p.puppet||p.actorKind==='npc')return false;
 p.engagedAt??=now;const idle=now-p.engagedAt;
 if(idle>=DAO_TAM.blockMs){if(now-(p.daoTamNoticeAt||0)>=DAO_TAM.noticeMs){p.daoTamNoticeAt=now;emit(w,p,'Đạo tâm trì trệ • chỉ gõ lệnh lặp lại nên tạm ngừng tăng tu vi • trò chuyện hoặc tham gia sự kiện để tu tiếp','status',now,{daoTam:'blocked'});}return true;}
 if(idle>=DAO_TAM.warnMs&&!p.daoTamWarnedAt){p.daoTamWarnedAt=now;emit(w,p,'Đạo tâm sắp trì trệ • 5 phút nữa chưa trò chuyện hoặc tham gia sự kiện sẽ ngừng tăng tu vi','status',now,{daoTam:'warn'});}
 return false;}
export const HEART_GATE=Object.freeze({refillPerSec:2,burst:120,tauSec:300,heavyRate:1.5,heavyCooldownMs:30000});
export function heartGate(p,count,now=Date.now()){const g=HEART_GATE,f=p.heartFlow&&Number.isFinite(p.heartFlow.at)?p.heartFlow:{at:now,rate:0,tokens:g.burst},dt=Math.max(0,(now-f.at)/1000);
  const rate=f.rate*Math.exp(-dt/g.tauSec)+count/g.tauSec,tokens=Math.min(g.burst,f.tokens+dt*g.refillPerSec),eff=Math.max(0,Math.min(count,Math.floor(tokens)));
  p.heartFlow={at:now,rate:Math.round(rate*1000)/1000,tokens:tokens-eff};return eff;}
export const heartHeavy=p=>(p.heartFlow?.rate||0)>HEART_GATE.heavyRate;
function unlockedAction(w,input,now) {
  const actor=w.players[clean(input.userId,80)];
  if(w.playTransfers?.[actor?.id]?.phase==='web')return {ok:false,code:'PLAYING_WEB',message:'Nhân vật đang chơi trên web. Hãy đăng xuất web trước khi trở lại LIVE.'};
  if(w.mode==='live' && input.type==='chat' && ['roi live','roilive'].includes(normalize(input.text||'')) && actor){actor.leftLiveAt=now;actor.lastActive=0;return {ok:true,leftLive:true};}
  if(w.mode==='live'&&(input.simulated||input.autoRose||((actor?.puppet||actor?.resident)&&['gift','like','follow','share'].includes(clean(input.type,30)))))return fail('Sự kiện mô phỏng không được ghi vào LIVE.');
  if(input.type==='like'){
    const count=Number(input.count);if(!Number.isSafeInteger(count)||count<1)return fail('Số tim không hợp lệ.');
    input={...input,count:Math.min(5000,count)};
    // 07/11/2026: chống công cụ tự thả tim — chạy ngầm, không báo trên màn hình.
    if(w.mode==='live'&&w.settings?.heartGate===true&&actor&&!actor.resident&&!actor.puppet){const eff=heartGate(actor,input.count,now);if(eff<=0)return {ok:true,likes:0,throttled:true};input={...input,count:eff};}
  }
  const result=actionCore(w,input,now);
  if(input.type==='like'&&result.ok&&!result.duplicate){const liker=w.players[clean(input.userId,80)];if(liker&&!liker.resident&&!liker.puppet)liker.heartsTotal=(liker.heartsTotal||0)+input.count;} // 07/11: đếm tim cho top ngày/tuần
  // Per-realm novice shortcut. Only attributed, successful actions count;
  // room-wide hearts and unsuccessful cooldown attempts never qualify.
  const novice=w.players[clean(input.userId,80)];
  if(w.mode==='live'&&novice&&!novice.resident&&!novice.puppet&&novice.realm<5&&result.ok&&!result.duplicate&&!result.pending&&['cultivate','like'].includes(input.type)){
    const r=novice.realm;
    if(novice.novicePractice?.realm!==r)novice.novicePractice={realm:r,likes:0,cultivations:0};
    const progress=novice.novicePractice;
    if(input.type==='cultivate'||result.heartCultivated)progress.cultivations++; // 4/11 heartPlay: tim vận công cũng là một lần vận công
    if(input.type==='like')progress.likes+=input.count;
    if(progress.likes>=100*(r+1)&&progress.cultivations>=r+2){
      const qi=Math.max(0,requiredQi(novice)-novice.qi),stones=Math.max(0,requiredStones(novice)-novice.stones);
      novice.qi+=qi;novice.totalQi+=qi;w.sectQi+=qi;novice.stones+=stones;
      checkReady(w,novice,now);
    }
  }
  if(result.chatOnly){const p=w.players[clean(input.userId,80)];if(p)newbieGuide(w,p,now);return result;}
  // In LIVE, platform metrics are acknowledgements unless the operator explicitly opts in.
  if(w.mode==='live'&&w.settings?.engagementRewards!==true&&['like','follow','share'].includes(input.type)&&!(input.type==='like'&&result.heartCultivated)){if(input.type==='like'&&result.ok&&!result.duplicate){const petPlayer=w.players[clean(input.userId,80)];if(petPlayer)petActivity(w,petPlayer,input,now,emit);}return result;}
  const introPlayer=w.players[clean(input.userId,80)];if(introPlayer){const stage=trackIntro(w,introPlayer,result.heartCultivated?{...input,type:'cultivate'}:input,result,now);if(stage==='started'){const arrival=w.events.findLast(e=>e.user===introPlayer.id&&e.effect==='join'&&e.at===now)||emit(w,introPlayer,'Chào đồng môn mới • trò chuyện cùng đồng môn','join',now);arrival.newcomerWelcome=true;}if(stage==='cultivated')emit(w,introPlayer,'Linh khí đã khai mở • tiếp tục tuluyen, hoặc cungtu để tìm bạn','lotus',now,{introSpark:true});}
  if(result.ok&&!result.duplicate&&!result.pending&&w.mode==='live'&&w.settings?.engagementRewards!==true&&w.settings?.heartPlay===false&&['cultivate','gather','attack'].includes(input.type)&&introPlayer&&!introPlayer.puppet&&!introPlayer.resident){
    flowerScore(w,introPlayer,5,now);festivalActivity(w,introPlayer,input,now,socialContext);
  }
  const p=w.players[clean(input.userId,80)];if(p&&Object.hasOwn(w.players,p.id)){if(result.ok&&!result.duplicate&&!result.pending){companionActivity(w,p,input,now,companionContext);{const to=input.type==='gift'&&result.giftRecipientId?w.players[result.giftRecipientId]:null;if(to)petActivity(w,to,input,now,(w2,who,text,effect,t,extra)=>emit(w2,who,text+' • '+p.name+' tặng',effect,t,{...extra,giftFrom:p.name,giftFromId:p.id}));else petActivity(w,p,input,now,emit);}advanceVisitor(w,p,input,now);bondActivity(w,p,input,now,socialContext);if(input.type==='gift')w.social.visualBusyUntil=now+10000;}checkReady(w,p,now);trackTasks(w,p,input,result,now,engageCtx);if(!missingStones(w,p,now)&&!(result.ok&&newbieGuide(w,p,now)))maybeHint(w,p,now);}
  return result;
}
function actionCore(w,input,now) {
  const type=clean(input.type,30);
  const valid=['join','cultivate','like','follow','share','checkin','gather','learn','craft','equip','brew','use','breakthrough','attack','gift','chat'];
  if(!valid.includes(type))return fail('Hành động không hợp lệ.');
  if(['follow','share'].includes(type)&&input.eventId&&w.seen[type+':'+input.eventId])return {ok:true,duplicate:true};
  if(type==='gift') {
    if(!Number.isSafeInteger(input.coins)||input.coins<1||input.coins>100000)return fail('Giá trị quà không hợp lệ.');
    if(input.eventId&&w.seen[input.eventId])return {ok:true,duplicate:true};
  }
  const words=type==='chat'?commandWords(input.text):[];const quick=type==='chat'?resolveQuick(w,words,now):null;if(quick){words.splice(0,1,quick);input={...input,text:quick,quick:true};} // 11/11: lệnh số 1–6
  const cmd=words[0];const rest=words.slice(1).join(' ');
  const genderCmd=['nhapmon','gioitinh','xungho','xunghieu'].includes(cmd);
  const gender=genderCmd?parseGender(rest):type==='join'&&input.gender?parseGender(input.gender):null;
  const existed=Object.hasOwn(w.players,clean(input.userId,80)),prevActive=existed?w.players[clean(input.userId,80)].lastActive||0:0;
  const p=ensurePlayer(w,input.userId,input.name,now,gender);p.lastRealInteractionAt=now;p.leftLiveAt=null;if(input.handle)p.handle=clean(input.handle,40);let giftRecipient=null;
  if(type==='gift'&&!input.simulated&&!input.autoRose||type==='attack'||type==='chat'&&cmd&&!FARM_CMDS.has(cmd)&&!INFO_CMDS.has(cmd))noteEngaged(p,now);
  if(type==='chat'&&cmd==='chuyensinh'){
    const result=rebirthCommand(w,p,rest,now);
    if(result.reborn)emit(w,p,result.message,'skin',now,{rebirth:true,transform:true,fromRealm:REBIRTH_UNLOCK_REALM,toRealm:0,visualFrom:result.visualFrom,visualTo:result.visualTo});
    else if(!cooldown(p,'rebirth-info',5000,now))emit(w,p,result.message,'status',now);
    return {ok:result.ok,pending:result.pending,reborn:result.reborn,message:result.message};
  }
  // v86: Hộ Pháp (đã tặng ≥100 coin) quay lại sau ≥30 phút vắng → chào riêng, giọng ưu tiên
  if(existed&&!p.resident&&!p.puppet&&vipTier(p.giftCoins)&&prevActive&&now-prevActive>30*60000)emit(w,p,'HỘ PHÁP TRỞ LẠI • '+VIP_TIERS[vipTier(p.giftCoins)].name,'join',now,{vipReturn:vipTier(p.giftCoins)});
  noteVisitorParticipant(w,p,now);
  const avatar=safeAvatar(input.avatar);if(avatar)p.avatar=avatar;
  if(type==='attack'&&w.sectWar?.phase==='running'){const r=warCommand(w,p,'danh',now,socialContext);if(r)return r;}
  if(type==='attack'&&w.race?.phase==='running')return raceCommand(w,p,'danh',now,socialContext);
  if(type==='chat'){const mz=mazeCommand(w,p,cmd,now,mazeContext);if(mz){if(!mz.ok&&!cooldown(p,'maze-error',8000,now))emit(w,p,mz.message,'status',now);return mz;}} // 10/11: Bí Cảnh Mê Cung
  if(type==='chat'){const tw=towerCommand(w,p,cmd,now,towerContext);if(tw){if(!tw.ok&&!cooldown(p,'tower-error',6000,now))emit(w,p,tw.message,'status',now);return tw;}} // 11/11: Vân Hải Tháp
  if(type==='chat'){const bk=bonkCommand(w,p,cmd,input.text,now,bonkContext);if(bk){if(!bk.ok&&!cooldown(p,'bonk-error',6000,now))emit(w,p,bk.message,'status',now);return bk;}} // 10/11: Hội Gõ Đầu
  if(type==='chat'){const r=lanternCommand(w,p,cmd,rest,now,companionContext);if(r){if(!r.ok&&!cooldown(p,'lantern-error',5000,now))emit(w,p,r.message,'status',now);return r;}}
  if(type==='chat'){const result=companionCommand(w,p,cmd,rest,now,companionContext);if(result){if(!result.ok&&!cooldown(p,'companion-error',5000,now))emit(w,p,result.message,'status',now);return result;}}
  if(type==='chat'){const gf=giftForCommand(w,p,cmd,input.text,now,{emit,active:currentParticipant});if(gf){if(!gf.ok&&!cooldown(p,'giftfor-error',5000,now))emit(w,p,gf.message,'status',now);return gf;}} // 10/11: tặng hộ
  if(type==='chat'){const pet=petCommand(w,p,cmd,rest,now,emit);if(pet){if(!pet.ok&&!cooldown(p,'pet-error',10000,now))emit(w,p,pet.message,'status',now);return pet;}}
  if(type==='chat'){const alc=alchemyCommand(w,p,cmd,now);if(alc)return alc;} // 08/11: Khai Lò Cửu Chuyển (1/2, bat)
  if(type==='chat'){const eg=engagementCommand(w,p,cmd,rest,now,engageCtx);if(eg)return eg;} // v87: hồng bao / câu đố / nhiệm vụ
  if(type==='chat'){const war=warCommand(w,p,cmd,now,socialContext);if(war){if(!war.ok&&!cooldown(p,'war-error',8000,now))emit(w,p,war.message,'war',now);return war;}}
  if(type==='chat'){const raceResult=raceCommand(w,p,(cmd==='bay'||cmd==='baykiem')&&rest?null:cmd,now,socialContext,rest);if(raceResult){if(!raceResult.ok&&!cooldown(p,'race-error',10000,now))emit(w,p,raceResult.message,'social',now);return raceResult;}const socialResult=socialCommand(w,p,cmd,rest,now,socialContext);if(socialResult){if(!socialResult.ok&&!cooldown(p,'social-error',10000,now))emit(w,p,socialResult.message,'social',now);return socialResult;}}
  if(type==='attack'&&tournamentActive(w))return socialCommand(w,p,'danh','',now,socialContext);
  if(existed&&gender)setGender(w,p,gender,now);
  if(type==='chat'&&(w.mode!=='live'||w.settings?.engagementRewards===true)){const ev=w.flowerEvent,pts=ev&&now<ev.endsAt?SKY_EVENTS[ev.kind||'flower']?.chatPoints:0;if(pts&&now-(p.cooldowns.skyChat||0)>=3000){p.cooldowns.skyChat=now;flowerScore(w,p,pts,now);}}
  if(type==='chat'&&genderCmd&&cmd!=='nhapmon'){
    if(!gender)return fail('Gõ gioitinh nam, gioitinh nu hoặc gioitinh an.');
    return {ok:true,gender:p.gender};
  }
  if(type==='chat'&&cmd==='coduyen'&&w.visitor&&now<w.visitor.endsAt)return claimVisitor(w,p,now);
  if(type==='chat'&&cmd==='coduyen'){
    const e=w.opportunity,wait=cooldown(p,'opportunity-status',15000,now);if(wait)return fail('Xem lại cơ duyên sau '+wait+'s.');
    if(!e||now>=e.endsAt){emit(w,p,'Cơ duyên chưa mở hoặc đã kết thúc','status',now);return {ok:true};}
    const settled=settleOpportunity(w,p,now);if(settled?.tiers)return {ok:true};
    const balance=p.opportunityCredit?.balance||0,cost=e.costs[p.realm];
    emit(w,p,p.realm>=REALMS.length-1?'Đã đạt '+REALMS.at(-1):`Cơ duyên ${REALMS[p.realm]} → ${REALMS[p.realm+1]} • tiến độ lưu ${balance}/${cost} • ${dailyAscensionView(w,p,now).exhausted?'đã dùng lượt đại cảnh hôm nay, tiến độ dư được giữ':'còn '+Math.ceil((e.endsAt-now)/1000)+'s'}`,'status',now);return {ok:true};
  }
  if(type==='chat'&&cmd==='skin'){
    if(['macdinh','mac dinh','thuong','bo','canhgioi','canh gioi'].includes(rest)){const wait=cooldown(p,'skin',10000,now);if(wait)return fail(`Đổi áo sau ${wait}s.`);if(!p.skinChoice&&p.divineRoleHidden)return {ok:true,unchanged:true};p.skinChoice=null;p.divineRoleHidden=true;p.divineRoleChoice=null;p.skinChoiceSource='manual';emit(w,p,'Áo cảnh giới','skin',now);return {ok:true};}
    const roleQuery=['vinhdanh','vinh danh','thantrang','than trang'].includes(rest)?'auto':DIVINE_ROLES.find(r=>r.id===rest||normalize(r.name)===rest)?.id;if(roleQuery){if(p.realm<=5)return fail('Thần trang danh hiệu mới dùng từ Luyện Hư; cấp thấp giữ bộ gọn.');const roles=rankDivineRoles(Object.values(w.players).map(x=>({...x,active:currentParticipant(w,x,now)})),w.adminLog||[]).get(p.id)||[];if(!roles.length||roleQuery!=='auto'&&!roles.includes(roleQuery))return fail('Chưa giữ danh hiệu này. Xem điều kiện trong tab Skin.');const wait=cooldown(p,'skin',10000,now);if(wait)return fail(`Đổi áo sau ${wait}s.`);p.skinChoice=null;p.divineRoleHidden=false;p.divineRoleChoice=roleQuery==='auto'?null:roleQuery;p.skinChoiceSource='manual';emit(w,p,'Thần trang vinh danh','skin',now);return {ok:true};}
    const skin=SPECIAL_SKINS.find(s=>s.id===rest||normalize(s.name)===rest||s.aliases?.includes(rest));
    if(!skin||!p.rewardSkins?.includes(skin.id))return fail('Chưa sở hữu bộ này. Gõ skin kèm tên bộ đã mở khóa, hoặc skin macdinh để mặc áo cảnh giới.');
    const wait=cooldown(p,'skin',10000,now);if(wait)return fail(`Đổi áo sau ${wait}s.`);
    p.skinChoice=skin.id;p.skinChoiceSource='manual';emit(w,p,skin.id==='vuonglam-avatar'?visitorSkinName('vuonglam',p.gender):skin.name,'skin',now);return {ok:true};
  }
  if(type==='chat') {
    if(['goiy','huongdan','lenh','help'].includes(cmd)){
      const wait=cooldown(p,'status',15000,now);if(wait)return fail(`Hỏi lại sau ${wait}s.`);
      if(readyToBreak(p,w,now)){emit(w,p,statusText(p,w,now),'status',now);return {ok:true};}
      if(p.intro&&!p.intro.advancedAt){emit(w,p,'Thả tim • vận công; khoảng một phút đầu sẽ nhận Tân thủ lệnh','hint',now,{guide:'cultivate'});return {ok:true};}
      const s=suggestion(p);if(s){emit(w,p,`Gõ: ${s.cmd}`,'hint',now,{say:s.say,why:s.why});return {ok:true};}
      emit(w,p,statusText(p,w,now),'status',now);return {ok:true};
    }
    if(['tuvi','xem','thongtin','tv','check'].includes(cmd)){
      const wait=cooldown(p,'status',15000,now);if(wait)return fail(`Xem tu vi lại sau ${wait}s.`);
      emit(w,p,statusText(p,w,now),'status',now,{card:profileCard(p,w,now)});return {ok:true};
    }
    // 05/11: lệnh tiếp linh lực khi lên đài luận kiếm (vẫn nhận 'danh' như cũ). Ngoài giải, 'kiem' là lời trò chuyện bình thường.
    if(cmd==='kiem'&&tournamentActive(w))return action(w,{...input,type:'attack'},now);
    // 09/11: skin Tần Mục Hỏa Thần — gõ luyencong = vận công ×1,5 (chung hồi 10 s với tuluyen/tim, nên không cộng dồn).
    if(cmd==='luyencong')return action(w,{...input,type:'cultivate',luyencong:true},now);
    const commands={nhapmon:'join',tuluyen:'cultivate',dotpha:'breakthrough',hai:'gather',diemdanh:'checkin',danh:'attack',hoc:'learn',ren:'craft',luyendan:'brew',dung:'use',trangbi:'equip'};
    if(commands[cmd]) {
      const wanted=CATALOG.find(x=>normalize(x.name)===rest||normalize(gameText(x.name))===rest||x.id===rest);
      const type=commands[cmd],itemId=wanted?.id||(rest?rest:['learn','craft','brew','use','equip'].includes(type)?autoItem(p,type):rest);
      return action(w,{...input,type,itemId},now);
    }
    if(w.mode==='live'&&w.settings?.engagementRewards!==true){talk(p,input.text,now);return {ok:true,chatOnly:true};} // 4/11: bong bóng thoại + Luận Đạo
    // DEMO/legacy: non-command chat can grant a small cultivation reward.
    if(goldenHour(p,now,w)&&now-(Number(p.joinedAt)||0)<5*60000&&!cooldown(p,'cultivate',10000,now)){
      p.cultivatedAt??=now;const q=gain(w,p,6,1,0,now,true);p.interactions++;w.totalInteractions++;
      emit(w,p,`Bình luận hóa tu luyện • +${q} tu vi • gõ tuluyen để tu nhanh`,'qi',now,{newbieChat:true});return {ok:true};
    }
    const wait=cooldown(p,'chat',15000,now);if(wait)return fail(`Bình luận nhận tu vi sau ${wait}s nữa.`);
    const q=gain(w,p,2,1,0,now,true);p.interactions++;w.totalInteractions++;
    // Display only controlled game text; arbitrary live chat is not put on stream.
    emit(w,p,`Luận đạo cùng đồng môn • +${q} tu vi${buffTag(p,now)}`,'qi',now);return {ok:true};
  }
  if(type==='join')return {ok:true,playerId:p.id};
  if(['cultivate','gather','attack','use','breakthrough'].includes(type)&&heavenStunned(p,now)){const left=Math.ceil((p.stunUntil-now)/1000),msg=`Đang bị Thiên Lôi trấn áp • kinh mạch tê liệt, chưa tu luyện được • còn ${Math.floor(left/60)}:${String(left%60).padStart(2,'0')}`;if(!cooldown(p,'stun-msg',20000,now))emit(w,p,msg,'status',now,{heavenStunned:true});return fail(msg);}
  if(type==='cultivate') {const viem=input.luyencong===true;
    if(viem&&!viemWorn(p))return fail('Lệnh luyencong chỉ dành cho người đang mặc skin Tần Mục Hỏa Thần.');
    if(daoTamBlocked(w,p,now))return fail('Đạo tâm trì trệ • trò chuyện hoặc tham gia sự kiện để tu tiếp.');
    p.cultivatedAt??=now;
    const wait=cooldown(p,'cultivate',10000,now);if(wait)return fail(`Đang vận công • còn ${wait}s.`);
    const q=gain(w,p,viem?VIEM_LUYENCONG_QI:6,1,0,now,'cultivate');emit(w,p,`${viem?'Hỏa Thần Luyện Công':'Vận Thanh Tâm'} • +${q} tu vi${viem?' • Hỏa Thần ×1,5':''}${buffTag(p,now)}${practiceTag(w,p,now)}`,'qi',now,viem?{luyencong:true}:undefined);
  } else if(type==='like') {
    const count=Number(input.count);if(!Number.isFinite(count)||count<1)return fail('Số tim không hợp lệ.');
    // 4/11/2026 heartPlay (mặc định bật trên LIVE): tim là cách chơi chính — tim = vận công (chung hồi 10 s với tuluyen),
    // tim chấm điểm sự kiện, nạp kiếm trận yêu thú. settings.heartPlay=false → quay về chỉ đếm tim như trước.
    const heartLive=w.mode==='live'&&w.settings?.engagementRewards!==true;
    if(heartLive&&w.settings?.heartPlay===false){
      p.likeReceipt={at:now,batch:count,total:(p.likeReceipt?.total||0)+count};
      p.interactions++;w.totalInteractions++;return {ok:true,likes:count,metricOnly:true};
    }
    if(!p.resident&&!p.puppet){
      p.likeReceipt={at:now,batch:count,total:(p.likeReceipt?.total||0)+count};
      festivalActivity(w,p,input,now,socialContext);likeGoal(w,count,now);
      flowerHearts(w,p,count,now,{gain,emit});raceHearts(w,p,count,now,socialContext);warHearts(w,p,count,now,socialContext);alchemyHearts(w,p,count,now,alchemyContext);
      bossHearts(w,p,count,now,{emit,win:winBoss});
    }
    flowerScore(w,p,count,now); // Điểm sự kiện luôn nhận, độc lập hồi thưởng tu vi.
    if(heartLive){if(p.resident||p.puppet)return {ok:true,likes:count};
      if(heavenStunned(p,now)){p.interactions++;w.totalInteractions++;return {ok:true,likes:count,stunned:true};}
      if(daoTamBlocked(w,p,now)){p.interactions++;w.totalInteractions++;return {ok:true,likes:count,daoTam:true};}
      const wait=cooldown(p,'cultivate',w.settings?.heartGate===true&&heartHeavy(p)?HEART_GATE.heavyCooldownMs:10000,now);if(wait){p.interactions++;w.totalInteractions++;return {ok:true,likes:count,xpCooldown:wait};}
      p.cultivatedAt??=now;const q=gain(w,p,6,1,0,now,'cultivate');emit(w,p,`Tim tụ linh • vận công +${q} tu vi${buffTag(p,now)}${practiceTag(w,p,now)}${talking(p,now)?' • luận đạo +20%':''}`,'qi',now,{heartCultivate:true});
      p.interactions++;w.totalInteractions++;return {ok:true,likes:count,heartCultivated:true};
    }
    if(daoTamBlocked(w,p,now)){p.interactions++;w.totalInteractions++;return {ok:true,likes:count,daoTam:true};}
    const wait=cooldown(p,'like',15000,now);if(wait){p.interactions++;w.totalInteractions++;return {ok:true,likes:count,xpCooldown:wait};}
    const q=gain(w,p,Math.min(3,Math.ceil(count/10)),0,0,now,true);emit(w,p,`Tụ linh từ lượt thích • +${q} tu vi`,'petal',now);
  } else if(type==='follow'||type==='share') {
    if(p.resident||p.puppet)return {ok:true,ignored:true};
    if(input.eventId)w.seen[type+':'+input.eventId]=now;
    if(type==='follow'&&p.followed&&now-(p.lastFollowReactionAt||0)<5*60000)return {ok:true,duplicate:true};
    if(type==='share'&&now-(p.lastShareAt||0)<60000)return {ok:true,duplicate:true,cooldown:true};
    const day=vnDay(now),awarded=type==='follow'?!p.followed:p.shareRewardDay!==day;
    let qi=0,stones=0;
    if(type==='follow'){p.followed=true;p.lastFollowReactionAt=now;}
    else{p.lastShareAt=now;p.shareEvents=(p.shareEvents||0)+1;if(awarded)p.shareRewardDay=day;}
    // Thanks only by default: a risk-reduction choice, not a blanket policy interpretation.
    if(awarded&&w.settings?.engagementRewards===true){stones=type==='follow'?10:5;qi=gain(w,p,type==='follow'?20:15,stones,0,now);}
    const verb=type==='follow'?'Kết duyên tiên môn':'Hạc truyền tin';
    emit(w,p,verb+(awarded&&qi>0?` • +${qi} tu vi, +${stones} linh thạch`:''),'petal',now,{engagementAction:type,engagementReward:{qi,stones},rewarded:awarded});
    auditRecord(w,'engagement',now,{id:input.eventId,user:p.id,name:p.name,action:type,awarded,qi,stones});
  } else if(type==='checkin') {
    const day=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
    if(p.day===day)return fail('Hôm nay đã điểm danh. Hẹn đạo hữu ngày mai!');
    p.day=day;const got=gain(w,p,25,20,3,now);emit(w,p,`Điểm danh • +${got} tu vi, +20 linh thạch, +3 linh thảo`,'petal',now);checkinStreak(w,p,day,now,engageCtx);
  } else if(type==='gather') {if(daoTamBlocked(w,p,now))return fail('Đạo tâm trì trệ • trò chuyện hoặc tham gia sự kiện để tu tiếp.');p.gatheredAt??=now;
    const wait=cooldown(p,'gather',30000,now);if(wait)return fail(`Linh thảo đang mọc • còn ${wait}s.`);
    const beforeStones=p.stones,q=gain(w,p,3,2,3,now,'gather');emit(w,p,`Hái linh thảo • +3 linh thảo, +${p.stones-beforeStones} linh thạch, +${q} tu vi${buffTag(p,now)}${practiceTag(w,p,now)}`,'petal',now);
  } else if(['learn','craft','brew'].includes(type)) {
    const item=CATALOG.find(x=>x.id===input.itemId);
    const expected={learn:'manual',craft:'artifact',brew:'pill'}[type];
    if(item?.exclusive)return fail(item.eventReward?`Pháp bảo sự kiện (${item.eventReward}): trao khi sự kiện kết thúc.`:item.loyaltyMinutes?'Pháp bảo tri ân được trao tự động khi đủ mốc nhập môn và đang hoạt động.':'Trang bị này được trao tự động khi dẫn đầu tổng quà tích lũy.');
    if(!item||item.type!==expected)return fail('Chọn đúng vật phẩm trong Tàng Kinh Các / Đan Phòng.');
    if(p.realm<item.tier)return fail(`Cần cảnh giới ${REALMS[item.tier]}.`);
    if(type==='learn'&&p.manuals.includes(item.id)||type==='craft'&&p.artifacts.includes(item.id))return fail('Đạo hữu đã sở hữu vật phẩm này.');
    if(p.stones<item.price||p.herbs<item.herbs)return fail(`Cần ${item.price} linh thạch${item.herbs?` và ${item.herbs} linh thảo`:''}.`);
    p.stones-=item.price;p.herbs-=item.herbs;
    if(type==='learn')p.manuals.push(item.id);
    if(type==='craft'){p.artifacts.push(item.id);p.equipped=item.id;if(item.skinReward){p.rewardSkins??=[];if(!p.rewardSkins.includes(item.skinReward))p.rewardSkins.push(item.skinReward);if(autoSkinChoiceAllowed(p)){p.skinChoice=item.skinReward;p.skinChoiceSource='craft';}}}
    if(type==='brew')p.pills[item.id]=(p.pills[item.id]||0)+1;
    emit(w,p,`${type==='learn'?'Lĩnh ngộ':type==='craft'?'Rèn thành':'Luyện thành'} ${item.name}`,type==='learn'?'sword':type==='craft'?'lotus':'petal',now,type==='brew'?{}:{achieve:{kind:type,item:item.name,skin:type==='craft'&&item.skinReward?SPECIAL_SKINS.find(k=>k.id===item.skinReward)?.name||null:null}}); // 11/11: Ngọc Giản Báo Hỷ
  } else if(type==='equip') {
    if(!p.artifacts.includes(input.itemId))return fail('Chưa sở hữu pháp bảo này.');p.equipped=input.itemId;emit(w,p,`Trang bị ${CATALOG.find(x=>x.id===input.itemId).name}`,'sword',now);
  } else if(type==='use') {
    const item=CATALOG.find(x=>x.id===input.itemId&&x.type==='pill');
    if(!item||!(p.pills[item.id]>0))return fail('Chưa có đan dược này. Hãy luyện đan trước.');
    const allowance=dailyPracticeView(w,p,now),pillCost=Math.max(1,Math.ceil(Math.round(item.qi*(1+qiBonus(p)))/freeQiUnit(p)*100))/100;
    if(allowance.enabled&&allowance.remaining+1e-8<pillCost)return fail('Kinh mạch đã no linh khí • đan dược giữ lại dùng lúc khác.'); /* 07/11/2026: ẩn giới hạn */
    const wait=cooldown(p,'pill',3000,now);if(wait)return fail(`Đang hấp thu đan dược • ${wait}s.`);
    p.pills[item.id]--;const q=gain(w,p,item.qi,0,0,now);emit(w,p,`Dùng ${item.name} • +${q} tu vi`,'lotus',now);
  } else if(type==='breakthrough') {
    // 08/11 tối: đang Chính Ma Đại Chiến thì tạm ngưng đột phá (màn đột phá che chiến trường, lời đọc chen hô chiến).
    if(warActive(w))return fail('Chính Ma Đại Chiến đang diễn ra • tạm ngưng đột phá, dồn sức đẩy chiến tuyến!');
    if(p.realm>=REALMS.length-1)return fail('Đã đạt '+REALMS.at(-1)+'. Hãy hỗ trợ đồng môn!');
    if(!finalRealmEligible(p)){const message='Tiên Đế cần tổng quà ít nhất 100 coin • hiện '+(p.giftCoins||0)+' coin';if(!cooldown(p,'final-realm',15000,now))emit(w,p,message,'status',now);return fail(message);}
    if(p.qi<requiredQi(p)||p.stones<requiredStones(p)){const onlyStones=p.qi>=requiredQi(p);if(!cooldown(p,'status',15000,now)){emit(w,p,statusText(p,w,now),'status',now,onlyStones?{missing:'stones'}:{});if(onlyStones)p.stoneHintAt=now;}return fail(`Chưa đủ đột phá: ${missingText(p)}.`);}
    if(dailyAscensionView(w,p,now).exhausted){const message='Đạo cơ đang lắng đọng • thiên kiếp chưa tới, tiếp tục tích lũy tu vi.'; /* 07/11/2026: ẩn giới hạn */if(!cooldown(p,'daily-break',15000,now))emit(w,p,message,'status',now,{dailyAscensionCap:true});return fail(message);}
    recordDailyAscension(w,p,now);
    p.qi-=requiredQi(p);p.stones-=requiredStones(p);p.realm++;
    const helpers=finishGuard(w,p,p.realm-1,now,companionContext);
    emit(w,p,`ĐỘT PHÁ ${REALMS[p.realm].toUpperCase()} • thiên môn khai mở`,'breakthrough',now,{fromRealm:p.realm-1,toRealm:p.realm,guardHelpers:helpers});
  } else if(type==='attack') {
    if(!w.boss||w.boss.endsAt<=now||w.boss.hp<=0)return fail('Chưa có yêu thú. Bí cảnh sẽ mở theo lịch.');
    const wait=cooldown(p,'attack',4000,now);if(wait)return fail(`Chiêu thức hồi sau ${wait}s.`);
    const encounter=encounterHit(w.boss,p.id,now);const dmg=Math.min(w.boss.hp,Math.max(1,Math.round(power(p)*(encounter?.mult||1))));w.boss.hp-=dmg;p.contribution+=dmg;w.boss.participants[p.id]=true;w.boss.damage??={};w.boss.damage[p.id]=(w.boss.damage[p.id]||0)+dmg;
    const gearList=[p.equipped,...(p.equippedExtra||[])].filter(Boolean),gearNow=gearList.length>1?gearList[(p.attackSeq=(p.attackSeq||0)+1)%gearList.length]:p.equipped;const technique=attackTechnique(gearNow===p.equipped?p:{...p,equipped:gearNow});gain(w,p,3,1,0,now,'attack');emit(w,p,`${technique.name} • ${dmg} công lực${practiceTag(w,p,now)}`,'attack',now,{technique,target:{x:450,yRatio:.37},damage:dmg,encounterPhase:encounter?.id,damageMultiplier:encounter?.mult||1});
    if(w.boss.hp===0) {
      winBoss(w,now);
    }
  } else if(type==='gift') {
    if(input.eventId)w.seen[input.eventId]=now;
    const count=Math.min(1000,Math.max(1,Math.trunc(Number(input.count)||1)));
    const award=giftReward(input.coins,w.gifts),tier=award.tier,qiBeforeGift=p.qi;
    const firstGift=!p.giftCoins&&!p.puppet&&!p.resident,vipBefore=vipTier(p.giftCoins); // v86: lễ quà đầu tiên → phúc duyên ≥×5 trong 20 phút
    // 07/11/2026: đang đua phi kiếm → quà chỉ để BỨT TỐC, không cộng tu vi.
    const racing=w.race?.phase==='running'&&now<w.race.endsAt&&w.race.racers.some(r=>r.id===p.id&&!r.finishAt);
    // 08/11 tối (chủ game): đang có sự kiện có luật quà riêng → CHỈ áp dụng luật sự kiện (đua: bứt tốc, Chính Ma: đẩy, …), không cộng quà mặc định.
    const eventRule=giftEventRule(w,now),defaults=!eventRule,award0={qi:defaults?award.qi*count:0,stones:defaults?award.stones*count:0,herbs:defaults?award.herbs*count:0};
    const q=defaults?gain(w,p,award0.qi,award0.stones,award0.herbs,now,false,'gift'):0;
    const items=[];if(defaults&&tier.artifact&&!p.artifacts.includes(tier.artifact)){p.artifacts.push(tier.artifact);items.push(tier.artifact);const value=id=>{const a=CATALOG.find(x=>x.id===id);return (a?.damage||0)+(a?.bonus||0)*100;};if(value(tier.artifact)>value(p.equipped))p.equipped=tier.artifact;}
    if(defaults&&tier.skin){p.rewardSkins??=[];if(!p.rewardSkins.includes(tier.skin)){p.rewardSkins.push(tier.skin);if(autoSkinChoiceAllowed(p)){p.skinChoice=tier.skin;p.skinChoiceSource='gift';}}}
    const itemNames=items.map(id=>CATALOG.find(x=>x.id===id).name);
    if(!input.simulated&&!input.autoRose)creditMasterGift(w,p,input.coins*count);
    p.giftCoins+=input.coins*count;w.totalGifts+=input.coins*count;sectBuild(w,p,input.coins*count,now,engageCtx);
    // Quà có tên nhận diện được → sự kiện riêng (hoa hồng, mèo, sư tử…); không thì theo mốc coin.
    const kind=giftKind(input.giftName),gift=input.giftName?giftNameVi(input.giftName,kind):null;
    // Phúc duyên: sau khi tặng quà, chơi tay (tu luyện, hái, bình luận, đánh) được nhân thưởng trong 10 phút.
    let buff=null;if(defaults){const mult=Math.max(giftBuff(input.coins*count),firstGift?5:1,p.buffUntil>now?p.buffMult||1:1);p.buffMult=mult;p.buffUntil=now+(firstGift?2:1)*GIFT_BUFF_MS;buff={mult,minutes:(firstGift?2:1)*GIFT_BUFF_MS/60000};}
    const giftEvent=emit(w,p,defaults?`${gift||tier.name}${count>1?` ×${count}`:''} • +${q} tu vi • phúc duyên ×${String(buff.mult).replace('.',',')} 10 phút`:`${gift||tier.name}${count>1?` ×${count}`:''} • ${eventRule}`,tier.effect,now,{kind,gift,count,tier:tier.name,coins:input.coins,comboKey:input.comboKey,comboFinal:input.comboFinal,buff,firstGift,eventRule,reward:{qi:q,stones:award0.stones,herbs:award0.herbs,items,itemNames}});
    if(!input.simulated&&!input.autoRose&&unlockMasterLoadout(w,p,CATALOG,now,input.coins)){giftEvent.sectMasterAward=true;giftEvent.masterUnlocked=true;}
    if(vipTier(p.giftCoins)>vipBefore&&!p.puppet){const t=vipTier(p.giftCoins);emit(w,p,'THĂNG VIP '+VIP_TIERS[t].name.toUpperCase(),'skin',now,{vipUp:t,achieve:{kind:'vip',item:VIP_TIERS[t].name}});} // v86
    if(['registration','running'].includes(w.race?.phase)){w.race.giftScores??={};w.race.giftScores[p.id]=(w.race.giftScores[p.id]||0)+input.coins*count;} // v85: quà đua
    if(w.race?.phase==='running'&&w.race.racers.some(r=>r.id===p.id)){const value=input.coins*count,tier=value>=100?3:value>=10?2:1;giftEvent.raceBoost=raceBoost(w,p,now,value,socialContext,'gift');giftEvent.raceGift=true;if(racing)giftEvent.text=`${gift||tier.name}${count>1?` ×${count}`:''} • BỨT TỐC +${giftEvent.raceBoost} trượng`;
      // v65: ghi lại để cảnh vẽ hiệu ứng quà theo nấc
      const rr=w.race.racers.find(r=>r.id===p.id);if(rr){rr.giftAt=now;rr.giftTier=tier;rr.giftUnits=giftEvent.raceBoost;rr.giftCoins=input.coins*count;rr.giftName=input.giftName||'';}}
    if(w.sectWar?.phase==='running'){const war=warGift(w,p,input.coins*count,now,socialContext,giftEvent);if(war){giftEvent.warGift=war.side;giftEvent.warPushed=war.pushed;giftEvent.warTruong=war.truong;giftEvent.text+=' • đẩy '+war.truong+' trượng';if(war.flip)giftEvent.warFlip=true;}}
    if(alchemyActive(w)){const alc=alchemyGift(w,p,input.coins*count,now,alchemyContext);if(alc)giftEvent.alchemyRole=alc.role;}
    if(mazeActive(w)){const mz=mazeGift(w,p,input.coins*count,now,mazeContext);if(mz){giftEvent.mazeGift=mz;giftEvent.text+=' • '+mz.text;}}
    {const bk=bonkGift(w,p,input.coins*count,now);if(bk){giftEvent.bonkHammer=bk;giftEvent.text+=' • '+bk.text;}} // 10/11: Hội Gõ Đầu — quà = búa xịn
    recordEventGiftFx(w,p,giftEvent,now);
    if(input.autoRose&&p.puppet){giftEvent.autoRose=true;giftEvent.simulated=true;giftEvent.gift='Hoa hồng mô phỏng';giftEvent.text=giftEvent.text.replace(/^Hoa hồng/, 'Hoa hồng mô phỏng');}
    p.giftHistory??=[];p.giftHistory.push({id:input.eventId,at:now,gift,coins:input.coins,count,eventRule,reward:{qi:q,stones:award0.stones,herbs:award0.herbs,items,itemNames}});p.giftHistory=p.giftHistory.slice(-12);
    reconcilePatron(w,now);
    // 10/11: tặng hộ — tiến độ skin/linh thú về người nhận đang ở LIVE; coin, VIP, top vẫn của người tặng.
    const giftFor=input.simulated||input.autoRose||p.puppet||p.resident?null:giftForTarget(w,p,now,currentParticipant);
    giftRecipient=giftFor?.target||null;const recipient=giftRecipient||p;
    if(giftRecipient){giftEvent.giftFor={to:recipient.id,toName:recipient.name};giftEvent.text+=' • tặng hộ '+recipient.name;}
    else if(giftFor?.missing&&giftForEventEnd(w,now)){giftEvent.giftForMissing=giftFor.name;giftEvent.text+=' • '+giftFor.name+' đã rời LIVE, quà tính cho '+p.name;}
    const visitorReward=creditVisitorGift(w,recipient,input.coins*count,now);
    if(!giftRecipient){items.push(...visitorReward.items);itemNames.push(...visitorReward.itemNames);}
    if(visitorReward.kind){giftEvent.visitorProgress={kind:visitorReward.kind,coins:visitorReward.coins,...(giftRecipient?{to:recipient.id,toName:recipient.name}:{})};if(!giftRecipient){giftEvent.reward.skinNames=visitorReward.skinNames;p.giftHistory.at(-1).reward.skinNames=visitorReward.skinNames;}}
    // v51: nhận skin khách mời → sự kiện BIẾN HÌNH riêng (thông báo + hiệu ứng), chạy sau màn cảm ơn quà.
    if(visitorReward.skinNames?.length){const skinName=visitorReward.skinNames[0].replace(/^Skin /,'');emit(w,recipient,`Biến hình ${skinName} • ${giftRecipient?p.name+' tặng skin truyền thừa':'nhận skin truyền thừa'}`,'transform',now,{transform:visitorReward.kind,skinName,...(giftRecipient?{giftFrom:p.name,giftFromId:p.id}:{})});}
    if(visitorReward.items.length){const id=visitorReward.items[0];if(itemScore(id)>itemScore(recipient.equipped))recipient.equipped=id;if(giftRecipient)emit(w,recipient,'Nhận '+visitorReward.itemNames.join(' · ')+' • '+p.name+' tặng','visitor',now,{visitorAward:true,visitorKind:visitorReward.kind,itemNames:visitorReward.itemNames,reward:{items:visitorReward.items,itemNames:visitorReward.itemNames},giftFrom:p.name,giftFromId:p.id});else giftEvent.visitorTechnique=visitorReward.kind;}
    const jackpot=input.simulated||input.autoRose?null:giftJackpot(w,p,input.coins*count,now,Math.random,qiBeforeGift);if(jackpot){giftEvent.jackpot=jackpot;giftEvent.text+=' • ĐẠI LỄ: +'+jackpot.qi+' tu vi (50%)'+(jackpot.skinName?' + skin '+jackpot.skinName:'');giftEvent.reward.qi+=jackpot.qi;giftEvent.reward.stones+=jackpot.stones;giftEvent.reward.herbs+=jackpot.herbs;if(jackpot.skinName){giftEvent.reward.skinNames=['Skin '+jackpot.skinName];itemNames.push('Skin '+jackpot.skinName);}}
    auditRecord(w,'gift',now,{id:input.eventId,user:p.id,name:p.name,gift:gift||input.giftName||tier.name,unitCoins:input.coins,count,coins:input.coins*count,simulated:!!(p.puppet||p.resident||input.simulated||input.autoRose),eventId:visitorReward.kind?w.visitor.id:null,eventKind:visitorReward.kind||null,contextEventId:w.visitor?.id||null,reason:p.puppet||p.resident||input.simulated||input.autoRose?'simulated':visitorReward.kind?'in-event':'outside-event-window',eventCoins:visitorReward.coins||0,skinNames:visitorReward.skinNames,items:visitorReward.items,...(giftRecipient?{recipient:giftRecipient.id,recipientName:giftRecipient.name}:{})});
    creditOpportunity(w,p,input.coins*count,now);
    flowerScore(w,p,input.coins*count*100,now); // v59: 1 coin quà = 100 điểm sự kiện
  }
  p.interactions++;w.totalInteractions++;return giftRecipient?{ok:true,playerId:p.id,giftRecipientId:giftRecipient.id}:{ok:true,playerId:p.id};
}
// Sự kiện đang mở có LUẬT QUÀ RIÊNG (tên hiển thị) → quà không cộng phần mặc định. Yêu thú/tỷ thí/kết duyên không có luật quà → vẫn quà mặc định.
export function giftEventRule(w,now){
 if(['registration','running'].includes(w.race?.phase))return 'đua phi kiếm';
 if(w.sectWar?.phase==='running')return 'chính ma đại chiến';
 if(['opening','brewing','tribulation'].includes(w.alchemy?.phase))return 'lò luyện đan';
 if(['registration','running'].includes(w.maze?.phase))return 'bí cảnh mê cung';
 if(bonkOpen(w,now))return 'hội gõ đầu';
 if(towerOpen(w,now))return 'vân hải tháp';
 if(w.visitor&&!w.visitor.closedAt&&now>=(w.visitor.startedAt||0)&&now<w.visitor.endsAt)return 'tiên nhân truyền đạo';
 if(w.opportunity&&!w.opportunity.closedAt&&now>=(w.opportunity.startedAt||0)&&now<w.opportunity.endsAt)return 'cơ duyên';
 if(w.flowerEvent&&now>=(w.flowerEvent.startedAt||0)&&now<w.flowerEvent.endsAt)return w.flowerEvent.kind==='meteor'?'sao băng':'mưa hoa';
 return null;
}
// 08/11 tối (chủ game): tặng từ 500 coin một lần lúc KHÔNG có sự kiện → thưởng ngay 50% tu vi hiện tại,
// 1 skin sự kiện ngẫu nhiên chưa có (bộ giá ≤200 coin) và thêm linh thạch + linh thảo.
export const GIFT_JACKPOT=Object.freeze({minCoins:500,qiRate:.5,maxSkinCoins:200,stones:1000,stoneRate:.5,herbs:100});
export function giftJackpot(w,p,coins,now,rand=Math.random,baseQi=p?.qi){
  if(!p||p.puppet||p.resident||!(coins>=GIFT_JACKPOT.minCoins)||stageConflict(w,now))return null;
  const qi=creditQi(w,p,Math.floor(Math.max(0,Number(baseQi)||0)*GIFT_JACKPOT.qiRate),now,'gift');
  const stones=Math.max(GIFT_JACKPOT.stones,Math.round(requiredStones(p)*GIFT_JACKPOT.stoneRate)),herbs=GIFT_JACKPOT.herbs;
  p.qi+=qi;p.totalQi+=qi;p.stones+=stones;p.herbs+=herbs;w.sectQi+=qi;
  p.rewardSkins??=[];const pool=Object.entries(VISITOR_GIFT_REWARDS).filter(([,r])=>(r.skinCoins||100)<=GIFT_JACKPOT.maxSkinCoins&&!p.rewardSkins.includes(r.skin));
  let skinName=null;if(pool.length){const [kind,r]=pool[Math.floor(rand()*pool.length)%pool.length];p.rewardSkins.push(r.skin);p.skinChoice=r.skin;p.skinChoiceSource='gift';skinName=visitorSkinName(kind,p.gender);
    emit(w,p,`Biến hình ${skinName} • quà 500 nhận skin`,'transform',now,{transform:kind,skinName,jackpotSkin:true});}
  return {qi,stones,herbs,skinName};
}
export const LIVE_ACTIVE_MS=5*60000;
export function startOpportunity(w,now=Date.now()){
 const conflict=stageConflict(w,now);if(conflict)return fail('Đang có '+conflict+' • chờ kết thúc và trao thưởng.');
  if(socialBusy(w,now))return fail('Đang có tỷ thí hoặc lễ kết duyên.');
  if(w.visitor&&now<w.visitor.endsAt)return fail('Chờ tiên nhân truyền đạo kết thúc để tránh trùng lệnh.');
  if(w.opportunity&&now<w.opportunity.endsAt)return fail('Cơ duyên đang mở, không thể đặt lại tiến độ.');
  if(w.boss&&now<w.boss.endsAt&&w.boss.hp>0)return fail(BOSS_BUSY);
  preserveOpportunityCredit(w,w.opportunity);
  w.opportunity={id:'opportunity-'+now,startedAt:now,endsAt:now+OPPORTUNITY_MS,costs:[...OPPORTUNITY_COSTS],players:{}};
  emit(w,null,'Thiên Đạo Cơ Duyên mở trong 5 phút • tiến độ dư được giữ qua các lần mở • từ Hóa Thần tối đa một đại cảnh mỗi ngày','opportunity',now,{opportunityStart:true});
  return {ok:true,endsAt:w.opportunity.endsAt};
}
function settleOpportunity(w,p,now){
 const event=w.opportunity;if(!event||event.closedAt||now<event.startedAt||now>=event.endsAt||p.resident||p.puppet)return;
 const result=spendOpportunityCredit(w,p,event,now,REALMS.length-1,finalRealmEligible);
 if(result.tiers)emit(w,p,`Cơ duyên đột phá ${result.tiers} cảnh giới • ${REALMS[result.from]} → ${REALMS[result.to]} • tiến độ dư được giữ cho lần sau`,'breakthrough',now,{opportunityAward:true,fromRealm:result.from,toRealm:result.to,tiers:result.tiers});
 return result;
}
function creditOpportunity(w,p,coins,now){
 const event=w.opportunity;if(!event||event.closedAt||now<event.startedAt||now>=event.endsAt||p.resident||p.puppet)return;
 addOpportunityCredit(p,event,coins);const result=settleOpportunity(w,p,now);
 if(!result?.tiers&&p.opportunityCredit?.balance>0&&dailyAscensionView(w,p,now).exhausted&&p.opportunityLimitNoticeDay!==practiceDay(now)){p.opportunityLimitNoticeDay=practiceDay(now);emit(w,p,'Đã dùng lượt đại cảnh hôm nay • tiến độ Cơ duyên được giữ qua ngày, không cần tặng thêm để sử dụng','status',now,{opportunityBanked:true});}
}
// First-join age is verifiable; passive viewing duration is not available from TikFinity.
// Permanent milestones, awarded only to currently active real participants.
export function awardLoyalty(w,now=Date.now(),limit=3){
  if(now-(w.loyaltyCheckedAt??0)<5000)return [];
  w.loyaltyCheckedAt=now;
  const awarded=[];
  const eligible=Object.values(w.players).filter(p=>currentParticipant(w,p,now)&&Number.isFinite(p.joinedAt)&&p.joinedAt<=now)
    .sort((a,b)=>a.joinedAt-b.joinedAt||String(a.id).localeCompare(String(b.id)));
  for(const p of eligible){
    if(awarded.length>=limit)break;
    p.loyaltyRewards??=[];
    // v33: tính theo số phút THỰC SỰ hoạt động (p.activeMs, cộng dồn trong tick), không theo lúc nhập môn lần đầu.
    const due=LOYALTY_TIERS.filter(t=>(p.activeMs||0)>=t.minutes*60000&&!p.loyaltyRewards.some(r=>r.item===t.item)&&!p.artifacts.includes(t.item)).slice(0,1);
    p.rewardSkins??=[];
    const earned=LOYALTY_TIERS.filter(t=>t.skin&&(due.includes(t)||p.loyaltyRewards.some(r=>r.item===t.item)||p.artifacts.includes(t.item)));
    const newSkins=earned.map(t=>t.skin).filter(id=>!p.rewardSkins.includes(id));
    if(!due.length&&!newSkins.length)continue;
    const reward={qi:0,stones:0,herbs:0},items=[];
    for(const tier of due){
      p.artifacts.push(tier.item);items.push(tier.item);
      p.loyaltyRewards.push({item:tier.item,minutes:tier.minutes,at:now});
      reward.qi+=tier.qi;reward.stones+=tier.stones;reward.herbs+=tier.herbs;
    }
    // Credit before auto-equipping so the new item's bonus does not alter its own award.
    if(due.length)reward.qi=gain(w,p,reward.qi,reward.stones,reward.herbs,now);
    if(newSkins.length){p.rewardSkins.push(...newSkins);if(autoSkinChoiceAllowed(p)){p.skinChoice=newSkins.at(-1);p.skinChoiceSource='loyalty';}}
    const score=id=>{const x=CATALOG.find(x=>x.id===id);return (x?.damage||0)+(x?.bonus||0)*100;};
    const strongest=items.at(-1);if(strongest&&score(strongest)>score(p.equipped))p.equipped=strongest;
    const names=[...items.map(id=>CATALOG.find(x=>x.id===id).name),...newSkins.map(id=>SPECIAL_SKINS.find(s=>s.id===id).name)];
    const event=emit(w,p,`Tri ân đồng môn • nhận ${names.join(', ')} • +${reward.qi} tu vi, +${reward.stones} linh thạch, +${reward.herbs} linh thảo`,due.length?'lotus':'skin',now,{loyaltyAward:true,items,skins:newSkins,itemNames:names,reward,milestone:due.at(-1)?.minutes||earned.at(-1).minutes});
    checkReady(w,p,now);awarded.push({id:p.id,name:p.name,items,reward,eventId:event.id});
  }
  return awarded;
}
export function currentParticipant(w,p,now=Date.now()){
  // Vế rẻ nhất, loại nhiều nhất (đa số ~8k hồ sơ đã rời LIVE) đứng trước; mọi vế là boolean không tác dụng phụ nên kết quả không đổi.
  return now-p.lastActive<LIVE_ACTIVE_MS&&w.liveSession?.active!==false&&p.lastActive>=(w.liveSession?.startedAt||0)&&!p.resident&&w.playTransfers?.[p.id]?.phase!=='web'&&!(p.leftLiveAt&&p.leftLiveAt>=(p.lastRealInteractionAt||0))&&!(p.lastAutoArrivalAt>=(p.lastRealInteractionAt||0)&&now-p.lastAutoArrivalAt>=20000); // 08/11: chỉ ghé vào (chưa tim/chat/quà) thì rời sân sau 20 s (trước 90 s)
}
export function markLiveSession(w,isLive,now=Date.now()){
  if(isLive){if(!w.liveSession)w.liveSession={startedAt:now-LIVE_ACTIVE_MS,active:true};else if(!w.liveSession.active)w.liveSession={startedAt:now,active:true};}
  else if(w.liveSession)w.liveSession.active=false;
}
export function reconcilePatron(w,now=Date.now()){
  w.patronEnabled=true;
  if(w.patronGiftTotal===w.totalGifts&&now-(w.patronCheckedAt||0)<5000&&w.patronCurrent&&currentParticipant(w,w.players[w.patronCurrent],now))return;w.patronCheckedAt=now;
  const leader=topPatron(Object.values(w.players).filter(p=>currentParticipant(w,p,now)),w.patronCurrent);w.patronGiftTotal=w.totalGifts;
  if(!leader){w.patronCurrent=null;return;}
  const changed=w.patronCurrent!==leader.id;w.patronCurrent=leader.id;
  leader.rewardSkins??=[];
  if(!leader.rewardSkins.includes(PATRON_SKIN.id)){
    leader.rewardSkins.push(PATRON_SKIN.id);
    for(const id of [PATRON_SWORD,PATRON_SEAL])if(!leader.artifacts.includes(id))leader.artifacts.push(id);
    const strength=id=>{const a=CATALOG.find(x=>x.id===id);return (a?.damage||0)+(a?.bonus||0)*100;};if(strength(PATRON_SWORD)>strength(leader.equipped))leader.equipped=PATRON_SWORD;if(autoSkinChoiceAllowed(leader)){leader.skinChoice=PATRON_SKIN.id;leader.skinChoiceSource='patron';}
    emit(w,leader,'Đại Hộ Pháp • nhận Thương Long Hộ Pháp, Hộ Pháp Thiên Kiếm và Trấn Tông Long Ấn','skin',now,{patronAward:true});
  }else if(changed)emit(w,leader,'Đại Hộ Pháp • dẫn đầu tổng quà tích lũy','skin',now,{patronAward:true});
}
function winBoss(w,now) {
  const boss=w.boss;const sealAt=now;
  const ranking=Object.entries(boss.damage||{}).filter(([id,d])=>w.players[id]&&!w.players[id].resident&&(boss.species!==ABYSS_BOSS.species||!w.players[id].puppet&&w.players[id].actorKind!=='npc'&&!w.players[id].webOnly)&&d>0).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
  if(['thunder-tiger','raid'].includes(boss.kind)&&ranking.length){
    const [winnerId,damage]=ranking[0],p=w.players[winnerId],item=[...ELITE_BOSSES,...CELESTIAL_BOSSES,ABYSS_BOSS].find(b=>b.species===boss.species)?.reward||'tiger-bell';
    if(!p.artifacts.includes(item))p.artifacts.push(item);
    if(itemScore(item)>itemScore(p.equipped))p.equipped=item;
    const qi=gain(w,p,800,250,20,now);
    p.bossWins=(p.bossWins||0)+1;
    w.lastBossResult={id:boss.id,name:boss.name,at:now,winnerId,winner:p.name,damage,ranking:ranking.slice(0,3).map(([id,damage])=>({id,name:w.players[id].name,damage})),reward:{qi,stones:250,herbs:20,item}};
    emit(w,p,`Đệ nhất hàng yêu • ${damage} công lực • nhận ${CATALOG.find(a=>a.id===item)?.name||'Lôi Hổ Thần Chung'}, +${qi} tu vi, 250 linh thạch và 20 linh thảo`,'victory',now,{bossChampion:true,damage,reward:w.lastBossResult.reward});
  }
  if(boss.species===ABYSS_BOSS.species){
    const members=Object.values(w.players).filter(p=>!p.resident&&!p.puppet&&p.actorKind!=='npc'&&!p.webOnly);
    const reward=ABYSS_SECT_REWARD;
    for(const ally of members)gain(w,ally,reward.qi,reward.stones,reward.herbs,now);
    w.lastBossResult={...(w.lastBossResult?.id===boss.id?w.lastBossResult:{}),id:boss.id,name:boss.name,at:now,sectReward:{...reward,members:members.length}};
    emit(w,null,`Hắc Uyên Ma Long đã bị hạ! Toàn tông ${members.length} đồng môn, kể cả người không tham chiến, nhận ${reward.qi} tu vi cơ bản, ${reward.stones} linh thạch và ${reward.herbs} linh thảo mỗi người.`,'victory',now,{sectBossReward:true,reward:{...reward},members:members.length});
  }else{
    for(const id of Object.keys(boss.participants)) {const ally=w.players[id];if(ally)gain(w,ally,45,25,4,now);}
    emit(w,null,'Bí cảnh hoàn tất • mỗi người tham chiến nhận 45 tu vi, 25 linh thạch, 4 linh thảo','victory',now);
  }
  // 05/11/2026: cảnh Phong Ấn trên overlay (chỉ hình ảnh, ~3,6 s) — ai đứng đầu công lực nhận ấn bay về.
  const sealTop=w.lastBossResult?.id===boss.id?w.lastBossResult:null;w.bossSeal={id:boss.id,species:boss.species,name:boss.name,startedAt:boss.startedAt,at:sealAt,winnerId:sealTop?.winnerId||null,winnerName:sealTop?.winner||null};
  w.boss=null;w.nextBossAt=now+w.settings.bossInterval*1000;
}
// Tu tiên giả thường trú (Tý Tèo, Người Không Buồn Cười, Hai Thùy) hợp lực đánh yêu thú ở máy chủ:
// mỗi ~5 giây gây 10–16 sát thương, không phải người chơi nên không nhận thưởng, không vào bảng xếp hạng.
export function residentStrike(w,now=Date.now(),rng=Math.random) {
  if(w.settings?.residents===false||!w.boss||w.boss.hp<=0||w.boss.endsAt<=now)return 0;
  if(now-(w.boss.residentAt||w.boss.startedAt||w.boss.endsAt-120000)<5000)return 0;
  w.boss.residentAt=now;const dmg=Math.min(w.boss.hp,10+Math.floor(rng()*7));w.boss.hp-=dmg;
  if(w.boss.hp===0)winBoss(w,now);
  return dmg;
}
export function openBoss(w,now=Date.now(),species=null) {
 const conflict=stageConflict(w,now);if(conflict)return fail('Đang có '+conflict+' • chờ kết thúc và trao thưởng.');
  if(species&&!BOSSES.some(b=>b.species===species))return fail('Yêu thú không hợp lệ.');
  if(socialBusy(w,now))return fail('Đang có tỷ thí hoặc lễ kết duyên.');
  if(w.boss)return fail('Bí cảnh đang mở.');
  if(eventBusyUntil(w,now))return fail('Đang có sự kiện • đợi sự kiện kết thúc rồi mở bí cảnh.');
  const activeList=Object.values(w.players).filter(p=>now-p.lastActive<15*60000&&!p.resident&&!p.puppet),active=activeList.length;
  // 05/11/2026: sàn yêu lực theo người mạnh nhất đang chơi (≈6 chiêu, ~20 giây đánh một mình) để boss không bị hạ trong 1 chiêu
  // lúc vắng người; khi đông người công thức cũ vẫn quyết định. Không ai hoạt động → giữ 120 để NPC tự kết thúc trận.
  const strongest=activeList.reduce((m,p)=>Math.max(m,power(p)),0);
  const baseHp=active?Math.max(480+Math.min(active,40)*100,strongest*6):120; // 4/11: giảm ~40% máu để trận nhanh hơn (trước 800+160/người)
  const variant=species?BOSSES.find(b=>b.species===species):BOSSES[(w.bossSequence||0)%BOSSES.length];w.bossSequence=(w.bossSequence||0)+1;
  const hp=baseHp*(variant.hpMultiplier||1);
  w.boss={id:'raid-'+now,kind:'raid',species:variant.species,name:variant.name,startedAt:now,hp,maxHp:hp,endsAt:now+(variant.duration||120000),participants:{},damage:{},worldBoss:!!variant.worldBoss};emit(w,null,`${variant.name} giáng thế${variant.worldBoss?' • yêu lực ×10 • hạ quái: cả tông môn nhận 500 tu vi cơ bản, 200 linh thạch, 15 linh thảo':''} • gõ đánh • Top công lực nhận ${CATALOG.find(a=>a.id===variant.reward)?.name||'Lôi Hổ Thần Chung'} khi hạ quái`,'boss',now,{bossName:variant.name});return {ok:true};
}
// Sự kiện "Thiên Đạo Ban Phúc": linh khí bộc phát, tối đa `count` người đang hoạt động (gần đủ tu vi nhất)
// Chỉ chọn người đủ điều kiện và trừ tài nguyên như đột phá thường; không tạo cấp miễn phí.
export function blessing(w,now=Date.now(),count=3) {
  const picks=Object.values(w.players).filter(p=>now-p.lastActive<15*60000&&readyToBreak(p,w,now))
    .sort((a,b)=>b.qi/requiredQi(b)-a.qi/requiredQi(a)).slice(0,Math.max(1,Math.min(10,count)));
  if(!picks.length)return fail('Chưa có đạo hữu đang hoạt động đủ tu vi và linh thạch để ban phúc.');
  emit(w,null,`Thiên đạo ban phúc • ${picks.length} đạo hữu được đột phá`,'blessing',now,{count:picks.length,kind:'blessing'});
  for(const p of picks){recordDailyAscension(w,p,now);p.qi-=requiredQi(p);p.stones-=requiredStones(p);p.realm++;p.readyRealm=null;emit(w,p,`ĐỘT PHÁ ${REALMS[p.realm].toUpperCase()} • thiên đạo ban phúc`,'breakthrough',now,{fromRealm:p.realm-1,toRealm:p.realm});}
  w.lastBlessingAt=now;return {ok:true,players:picks.map(p=>p.name)};
}
// v49: sự kiện (Thiên Hoa Vũ / Lưu Tinh / tiên nhân / cơ duyên) và đánh yêu thú không chạy chung.
// Trả về thời điểm sự kiện muộn nhất kết thúc nếu đang có sự kiện, không thì 0.
// v84: ĐẠI ĐIỂN VINH DANH — tôn phong top 3 người tặng quà đang có mặt: Thái Thượng Hộ Pháp / Tả Hộ Pháp / Hữu Hộ Pháp.
export const CEREMONY_TITLES=Object.freeze(['THÁI THƯỢNG HỘ PHÁP','TẢ HỘ PHÁP','HỮU HỘ PHÁP']);
export function honorCeremony(w,now=Date.now(),force=false){
  const top=Object.values(w.players).filter(p=>!p.resident&&!p.puppet&&p.giftCoins>0&&currentParticipant(w,p,now)).sort((a,b)=>b.giftCoins-a.giftCoins||a.joinedAt-b.joinedAt).slice(0,3);
  if(!top.length)return fail('Chưa có ai tặng quà đang có mặt.');
  if(!force&&(eventBusyUntil(w,now)>now||w.boss&&w.boss.hp>0&&now<w.boss.endsAt||socialBusy(w,now)||['registration','running'].includes(w.race?.phase)||['registration','running'].includes(w.maze?.phase)))return fail('Đang có sự kiện, để sau.');
  w.lastCeremonyAt=now;
  const list=top.map((p,i)=>({id:p.id,name:p.name,avatar:safeAvatar(p.avatar),coins:p.giftCoins,title:CEREMONY_TITLES[i],realmName:REALMS[p.realm]}));
  emit(w,null,'ĐẠI ĐIỂN VINH DANH • '+list.map(x=>x.title+' '+x.name).join(' • '),'ceremony',now,{ceremony:list});
  return {ok:true,top:list};
}
function autoCeremony(w,now){if(automaticEventsPaused(w,now))return;const every=(w.settings?.ceremonyMinutes??20)*60000;if(w.settings?.ceremony===false)return;
  if(!w.lastCeremonyAt){w.lastCeremonyAt=now-every+5*60000;return;}if(now-w.lastCeremonyAt<every)return;
  if(!honorCeremony(w,now).ok)w.lastCeremonyAt=now-every+60000;}
function awardRaceGifts(w,now){const r=w.race;if(!r||r.giftAwarded||r.phase!=='finished'||!r.giftScores)return;r.giftAwarded=true;
  raceGiftTop(w).forEach((t,i)=>{const p=w.players[t.id],pz=RACE_GIFT_PRIZES[i];if(!p||!pz)return;
    if(pz.skin){p.raceSwordSkins??=[];if(!p.raceSwordSkins.includes(pz.skin))p.raceSwordSkins.push(pz.skin);p.raceSwordChoice=pz.skin;}
    // 08/11: vật cưỡi đua (top 1 Cửu Vĩ Hồ, 2 Kim Lý, 3 Tiên Hạc) — vĩnh viễn, đua sau tự cưỡi con đẹp nhất đang có.
    if(pz.mount){p.raceMounts??=[];if(!p.raceMounts.includes(pz.mount))p.raceMounts.push(pz.mount);}
    const qi=gain(w,p,pz.qi,pz.stones,0,now);
    emit(w,p,`Quà đua hạng ${i+1} • ${pz.mount?'nhận vật cưỡi '+pz.mountName+' + ':''}${pz.skin?'skin '+pz.name+' vĩnh viễn • ':''}+${qi} tu vi`,'race',now,{raceGiftRank:i+1,itemNames:pz.skin?[pz.name]:[],mountName:pz.mountName||null,raceSwordSkin:pz.skin||null,raceMount:pz.mount||null,reward:{qi,stones:pz.stones}});
  });}
// v86: TÂN THỦ LỆNH — người mới ở lại đủ 3 phút mà vẫn Phàm nhân → tự đột phá Luyện Khí (mỗi 6 giây tối đa 1 người để không loạn).
function starterBoost(w,now){if(now-(w.lastStarterAt||0)<15000)return;
  const p=Object.values(w.players).find(p=>!p.resident&&!p.puppet&&!p.starterDone&&(p.realm||0)===0&&(p.intro?(p.activeMs||0)-(p.intro.activeStart||0)>=60000&&!!p.intro.cultivatedAt:(p.activeMs||0)>=3*60000)&&currentParticipant(w,p,now));if(!p)return;
  p.starterDone=true;w.lastStarterAt=now;p.qi=Math.max(p.qi,requiredQi(p));p.stones=Math.max(p.stones,requiredStones(p));p.qi-=requiredQi(p);p.stones-=requiredStones(p);p.realm=1;p.stones+=20;p.herbs+=5;finishIntro(w,p,now);
  emit(w,p,'ĐỘT PHÁ LUYỆN KHÍ • tân thủ lệnh','breakthrough',now,{fromRealm:0,toRealm:1,starter:true});}
// v86: MỤC TIÊU TIM TOÀN LIVE — đủ mốc thì ban phúc mọi người đang chơi; mốc sau tăng 20% (tối đa 5.000).
function likeGoal(w,count,now){const g=w.likeGoal??={count:0,target:1000,level:0};g.count+=count;if(g.count<g.target)return;
  let reached=0,rounds=0;
  while(g.count>=g.target){g.count-=g.target;reached+=g.target;rounds++;g.level++;g.target=Math.min(5000,Math.round(g.target*1.2/100)*100);}
  const team=Object.values(w.players).filter(q=>!q.resident&&!q.puppet&&currentParticipant(w,q,now));
  for(const q of team){gain(w,q,Math.min(1000,Math.max(20,Math.round(requiredQi(q)*.01)))*rounds,10*rounds,rounds,now);q.buffMult=Math.max(2,q.buffUntil>now?q.buffMult||1:1);q.buffUntil=Math.max(q.buffUntil||0,now+5*60000);}
  emit(w,null,`MỤC TIÊU TIM ${reached} • ${rounds} mốc • ban phúc ${team.length} đồng môn • phúc duyên ×2`,'blessing',now,{likeGoal:reached,count:team.length,heartRounds:rounds});}
export function eventBusyUntil(w,now=Date.now()){
  const ends=[w.flowerEvent,w.visitor,w.opportunity].filter(e=>e&&!e.closedAt&&now<e.endsAt).map(e=>e.endsAt);
  if(skyStageUntil(w,now)>now)ends.push(skyStageUntil(w,now));
  if(!w.bondFestival?.closedAt&&w.bondFestival?.endsAt>now)ends.push(w.bondFestival.endsAt);
  return ends.length?Math.max(...ends):0;
}
const BOSS_BUSY='Đang đánh yêu thú • đợi bí cảnh kết thúc rồi mở sự kiện.';
export function controlPetEvent(w,op,now=Date.now(),minutes=15){
 if(op==='start'){const r=startPetEvent(w,now,minutes);if(r.ok)emit(w,null,'LINH THÚ CỐC KHAI MỞ • Thả 100 tim nhận Ngọc Thố • gõ thu xem tiến độ','pet',now,{petStart:true});return r;}
 if(op==='stop'){if(stopPetEvent(w,now))emit(w,null,'LINH THÚ CỐC KHÉP LẠI • giữ nguyên linh thú đã nhận','pet',now,{petEnd:true});return {ok:true};}
 return {ok:false,message:'Thao tác không hợp lệ.'};
}
// Two races then one tournament; missed slots never accumulate a burst.
export const COMPETITION_INTERVAL_MS=15*60000;
export function startNextCompetition(w,now=Date.now()){
 if(!w.settings?.scheduledCompetitions)return fail('Lịch thi đấu đang tắt.');
 const conflict=stageConflict(w,now);if(conflict||w.race?.phase==='queued'||w.social?.ceremonies?.length)return fail('Sân đang bận • chờ hoạt động hiện tại kết thúc.');
 tickCompetitionSchedule(w,now,{manual:true});
 if(w.competitionSchedule.lastAt===now)return {ok:true,kind:w.competitionSchedule.lastKind};
 w.competitionSchedule.nextAt=now;
 tickCompetitionSchedule(w,now,{manual:true});
 return w.competitionSchedule.lastAt===now?{ok:true,kind:w.competitionSchedule.lastKind}:fail('Chưa thể mở lượt thi đấu.');
}
export function tickCompetitionSchedule(w,now=Date.now(),{manual=false}={}){
 if(!w.settings?.scheduledCompetitions)return;
 const schedule=w.competitionSchedule??={nextAt:now+COMPETITION_INTERVAL_MS,intervalMs:COMPETITION_INTERVAL_MS};
 if(schedule.intervalMs!==COMPETITION_INTERVAL_MS){schedule.intervalMs=COMPETITION_INTERVAL_MS;schedule.nextAt=Math.max(schedule.nextAt||0,now+COMPETITION_INTERVAL_MS);}
 if(schedule.cycleVersion!==2){schedule.cycleVersion=2;schedule.cycleIndex=0;}
 const cycle=['race','race','tournament'];
 schedule.nextKind=cycle[schedule.cycleIndex%3];
 // Existing/manual races finish their current round instead of repeating forever.
 if(w.race)w.race.repeat=false;
 if(w.settings.huntBeforeCompetition&&!manual&&schedule.huntForAt!==schedule.nextAt){
   if(now<schedule.nextAt-5*60000)return; // 4/11: săn yêu thú 5 phút trước tỷ thí (trước 10)
   if(stageConflict(w,now)||w.race?.phase==='queued'||w.social?.ceremonies?.length||automaticEventsPaused(w,now))return;
   const variety=w.scheduledVariety??={majorSinceVisitor:0,nextVisitor:'vuonglam'};
   if(w.settings.visitorEveryFive&&variety.majorSinceVisitor>=4){
     const kind=variety.nextVisitor==='shende'?'shende':'vuonglam';
     const guest=startVisitor(w,kind,now);if(!guest.ok)return;
     variety.majorSinceVisitor=0;variety.nextVisitor=kind==='vuonglam'?'shende':'vuonglam';variety.lastVisitorAt=now;
     // A guest never cancels hunt/competition: the preparation slot waits.
     schedule.nextAt=Math.max(schedule.nextAt,now+8*60000);return;
   }
   const result=openBoss(w,now);if(!result.ok)return;
   variety.majorSinceVisitor++;
   // Never replace an operator's already-running pet event.
   if(!w.petEvent||w.petEvent.closedAt||w.petEvent.endsAt<=now)controlPetEvent(w,'start',now,5);
   schedule.nextAt=Math.max(schedule.nextAt,now+5*60000);
   schedule.huntForAt=schedule.nextAt;schedule.huntStartedAt=now;
   return;
 }
 if(now<schedule.nextAt||!manual&&automaticEventsPaused(w,now))return;
 if(eventBusyUntil(w,now)>now||w.boss?.hp>0&&w.boss.endsAt>now||socialBusy(w,now)||w.social?.ceremonies?.length||w.bondFestival?.endsAt>now)return;
 const kind=schedule.nextKind==='race'?'race':'tournament';
 const result=kind==='race'?startRace(w,now):startTournament(w,now);
 if(!result.ok)return;
 if(kind==='race')w.race.repeat=false;
 if(w.settings.huntBeforeCompetition){const variety=w.scheduledVariety??={majorSinceVisitor:0,nextVisitor:'vuonglam'};variety.majorSinceVisitor++;}
 schedule.lastAt=now;schedule.lastKind=kind;schedule.cycleIndex=(schedule.cycleIndex+1)%3;schedule.nextKind=cycle[schedule.cycleIndex];schedule.nextAt=now+COMPETITION_INTERVAL_MS;
}
export function tick(w,now=Date.now()) {
  // A transferred player must not receive automatic/group rewards on LIVE.
  return protectTransferred(w,()=>tickCore(w,now));
}
// 08/11: mỗi 6 s tìm 1 người đang có mặt (hoạt động ≤10 phút) đủ tu vi mà thiếu linh thạch để nhắc — không chờ họ thả tim/gõ lệnh.
function stoneHintTick(w,now){if(warActive(w)||now-(w.stoneScanAt||0)<6000)return;w.stoneScanAt=now;for(const p of Object.values(w.players)){if(now-(p.lastActive||0)>600000||w.playTransfers?.[p.id]?.phase==='web')continue;if(missingStones(w,p,now))return;}}
// 11/11/2026: THIÊN TÀI XUẤT THẾ — ~6 phút một lần, lúc sân không bận sự kiện, vinh danh người tăng tu vi nhiều nhất HÔM NAY
// (bảng ngày period-tops, chỉ người thật). Chỉ nói về tu vi trong game — không nhắc quà/tim (luật LIVE).
export const THIEN_TAI={firstMs:4*60000,everyMs:6*60000,retryMs:30000,minQi:1000};
function thienTaiTick(w,now){
 if(w.liveSession?.active===false)return;
 if(!w.nextThienTaiAt){w.nextThienTaiAt=now+THIEN_TAI.firstMs;return;}
 if(now<w.nextThienTaiAt)return;
 // Chỉ nhường khi sân giữa bị khóa thật; khách quý / mưa hoa / cơ duyên chỉ là bảng bên cạnh, thẻ vẫn xếp hàng Vân Đài.
 const locked=alchemyActive(w)||warActive(w)||skyStageUntil(w,now)>now||socialBusy(w,now)||['registration','running'].includes(w.race?.phase);
 if(locked){w.nextThienTaiAt=now+THIEN_TAI.retryMs;return;}
 w.nextThienTaiAt=now+THIEN_TAI.everyMs;
 const top=computeTops(w,ensurePeriods(w,now).day,3).qi||[],first=top[0],p=first&&w.players[first.id];
 if(!p||first.value<THIEN_TAI.minQi)return;
 const f=v=>Math.round(v).toLocaleString('vi-VN');
 emit(w,p,`Thiên tài xuất thế • ${p.name} tu luyện ${f(first.value)} tu vi hôm nay`,'title',now,{achieve:{kind:'genius',item:p.name,value:first.value,runners:top.slice(1).map((r,i)=>`${i+2}. ${r.name} ${f(r.value)}`)}});
}
function tickCore(w,now) {
 stoneHintTick(w,now);
 ensurePeriods(w,now); // 07/11: sang ngày/tuần mới → chốt bảng cũ, mở kỳ mới
 automaticEventsPaused(w,now);
 tickLantern(w,now,companionContext);tickCompanions(w,now,companionContext);
 if(w.petEvent&&!w.petEvent.closedAt&&now>=w.petEvent.endsAt){w.petEvent.closedAt=now;emit(w,null,'LINH THÚ CỐC KHÉP LẠI • giữ nguyên linh thú đã nhận','pet',now,{petEnd:true});}
 // Explicit opt-in in DEMO only; tickPuppetRoses also rejects LIVE independently.
 if(w.settings?.puppetAutoRose===true)tickPuppetRoses(w,now,(input,at)=>action(w,input,at));
 for(const {player:p,reward:r}of reconcileVisitorPricing(w,now)){auditRecord(w,'visitor-repair',now,{eventId:w.visitor.id,kind:w.visitor.kind,user:p.id,name:p.name,coins:r.coins,skinNames:r.skinNames,items:r.items});for(const id of r.items)if(itemScore(id)>itemScore(p.equipped))p.equipped=id;emit(w,p,'Nhận truyền thừa theo mốc mới • '+r.itemNames.join(' · '),'visitor',now,{visitorAward:true,visitorKind:r.kind,itemNames:r.itemNames,reward:{items:r.items,itemNames:r.itemNames},pricingUpdate:true});}

  if(w.flowerEvent&&now>=w.flowerEvent.endsAt&&!w.flowerEvent.closedAt)finishFlowerEvent(w,now);
  // A boss overdue by five minutes gets the next free, rested slot instead
  // of losing it repeatedly to competitions and the random-event deck.
  if(!w.settings?.huntBeforeCompetition&&w.settings?.bossInterval<=900&&w.nextBossAt&&now-w.nextBossAt>=5*60000&&!w.boss&&!w.social?.ceremonies?.length&&!automaticEventsPaused(w,now)&&(w.settings?.residents!==false||Object.values(w.players).some(p=>currentParticipant(w,p,now))))openBoss(w,now);
  tickCompetitionSchedule(w,now);
  tickRace(w,now,socialContext);awardRaceGifts(w,now);tickWar(w,now,socialContext);tickAlchemy(w,now,alchemyContext);tickMaze(w,now,mazeContext);tickBonk(w,now,bonkContext);tickTower(w,now,towerContext);
  tickSocial(w,now,socialContext);
  reconcilePatron(w,now);

  if(w.visitor&&now>=w.visitor.endsAt&&!w.visitor.closedAt){w.visitor.closedAt=now;archiveVisitor(w);auditRecord(w,'visitor-end',now,{eventId:w.visitor.id,kind:w.visitor.kind});emit(w,null,VISITORS[w.visitor.kind].name+' đã rời tiên môn • giữ nguyên quà đã nhận','visitor',now,{visitorEnd:true});}
  autoSkyEvent(w,now);visitorRotation(w,now);autoCeremony(w,now);tickEngagement(w,now,engageCtx);thienTaiTick(w,now);
  if(w.opportunity){
    preserveOpportunityCredit(w,w.opportunity);
    if(!w.opportunity.closedAt&&now<w.opportunity.endsAt&&w.opportunity.creditClaimDay!==practiceDay(now)){
      w.opportunity.creditClaimDay=practiceDay(now);
      for(const p of Object.values(w.players))if(p.opportunityCredit?.balance>0&&currentParticipant(w,p,now))settleOpportunity(w,p,now);
    }
  }
  if(w.opportunity&&now>=w.opportunity.endsAt&&!w.opportunity.closedAt){w.opportunity.closedAt=now;emit(w,null,'Thiên Đạo Cơ Duyên đã kết thúc • ngừng tính quà vào mốc đột phá','opportunity',now,{opportunityEnd:true});}
  // Cộng dồn thời gian hoạt động thật (có tương tác trong 5 phút gần nhất) cho mốc Tri ân.
  const dt=Math.min(5000,Math.max(0,now-(w.activeTickAt||now)));w.activeTickAt=now;
  if(dt)for(const p of Object.values(w.players))if(currentParticipant(w,p,now))p.activeMs=(p.activeMs||0)+dt;
  for(const p of Object.values(w.players)){if(p.resident)continue;autoEquipBest(p);if(p.puppet&&p.puppetKeep!==false)p.lastActive=now;} // tu sĩ giả 'ở lại' luôn có mặt
  awardLoyalty(w,now);starterBoost(w,now);
  // v33: ban phúc tự động 30 phút/lần, mỗi lần 1 người (nút bấm tay vẫn mặc định 3).
  const every=(w.settings.blessingMinutes??30)*60000;
  if(every>0&&!automaticEventsPaused(w,now)){if(!w.lastBlessingAt)w.lastBlessingAt=now;else if(now-w.lastBlessingAt>=every&&!w.boss&&Object.values(w.players).some(p=>now-p.lastActive<5*60000))blessing(w,now,w.settings.blessingCount??1);}
  if(!w.nextBossAt)w.nextBossAt=now+w.settings.bossInterval*1000;
  if(w.boss&&w.boss.endsAt<=now) {emit(w,null,'Huyền Giao trở về vực sâu • giữ nguyên tiến trình của mọi người','boss',now);w.boss=null;w.nextBossAt=now+w.settings.bossInterval*1000;}
  {const until=eventBusyUntil(w,now);if(until&&!w.boss&&(w.nextBossAt||0)<until+60000)w.nextBossAt=until+60000;}
  if(!w.settings?.huntBeforeCompetition&&!automaticEventsPaused(w,now)&&!eventBusyUntil(w,now)&&!socialBusy(w,now)&&!w.social?.ceremonies?.length&&!w.boss&&now>=w.nextBossAt&&(w.settings?.residents!==false||Object.values(w.players).some(p=>now-p.lastActive<15*60000)))openBoss(w,now);
  residentStrike(w,now);
  for(const [key,at] of Object.entries(w.seen))if(now-at>86400000)delete w.seen[key];
  for(const [key,v] of Object.entries(w.giftCounts))if(now-v.at>86400000)delete w.giftCounts[key];
}
// opts.select(ctx) => Set id: chỉ dựng hồ sơ đầy đủ cho người sẽ được gửi đi (giảm ~150 ms/lần với ~8k hồ sơ).
// Xếp hạng (danh hiệu, thần vị) vẫn tính trên toàn bộ người chơi bằng bản rút gọn, nên kết quả không đổi.
export function snapshot(w,now=Date.now(),opts={}) {
  const select=typeof opts.select==='function'?opts.select:null;
  const all=Object.values(w.players);
  const ranked=select?all.map(p=>({id:p.id,name:p.name,avatar:p.avatar,realm:p.realm,realmName:REALMS[p.realm],totalQi:p.totalQi,giftCoins:p.giftCoins,joinedAt:p.joinedAt,bossWins:p.bossWins,contribution:p.contribution,activeMs:p.activeMs,resident:p.resident,puppet:p.puppet,webOnly:p.webOnly,active:currentParticipant(w,p,now)})):null;
  const earlyHonors=select?honorRoll(w,ranked):null,earlyRoles=select?rankDivineRoles(ranked,w.adminLog||[]):null;
  let pick=all;
  if(select){const r=socialView(w,now),rt=r.tournament,rc=r.ceremony,stage=rt?.current?[rt.current.a,rt.current.b]:rt?.lastBow?.until>now&&rt.lastBow.pair?rt.lastBow.pair:rc?[rc.a,rc.b]:rt?.podiumUntil>now?[rt.winner]:[];const ids=select({players:ranked,honors:earlyHonors,socialStage:stage,raceStage:raceStageIds(w,now),patronCurrent:w.patronCurrent});pick=all.filter(p=>ids.has(p.id));}
  const players=pick.map(p=>({...p,isPatronLeader:p.id===w.patronCurrent,power:power(p),realmName:REALMS[p.realm],progressionReady:readyToBreak(p,w,now),dailyAscensionStatus:p.realm>=5&&!p.resident&&!p.puppet?dailyAscensionView(w,p,now):null,dailyPracticeStatus:p.realm>=5&&!p.resident&&!p.puppet?dailyPracticeView(w,p,now):null,rebirthEligible:!p.resident&&!p.puppet&&p.realm>=REBIRTH_UNLOCK_REALM,talk:p.talk&&now-p.talk.at<TALK_SHOW_MS?p.talk.text:undefined,talking:talking(p,now)||undefined,neededQi:requiredQi(p),neededStones:requiredStones(p),finalRealmEligible:finalRealmEligible(p),active:currentParticipant(w,p,now)}));
  const socialStatus=socialView(w,now),t=socialStatus.tournament,ceremony=socialStatus.ceremony;
  const socialStage=t?.current?[t.current.a,t.current.b]:t?.lastBow?.until>now&&t.lastBow.pair?t.lastBow.pair:ceremony?[ceremony.a,ceremony.b]:t?.podiumUntil>now?[t.winner]:[];
  const socialScene=tournamentActive(w)||t?.podiumUntil>now?'tournament':ceremony?'bond':null;
  const bondIndex=new Map();for(const b of socialStatus.bonds){for(const id of [b.a,b.b]){if(!bondIndex.has(id))bondIndex.set(id,[]);bondIndex.get(id).push(b);}}for(const p of players){p.socialCode=w.players[p.id].socialCode;p.bondInfos=bondIndex.get(p.id)||[];p.bondInfo=p.bondInfos.find(b=>b.id===w.players[p.id].bondId)||p.bondInfos[0]||null;p.bondIds=p.bondInfos.map(b=>b.id);const vip=bondVipInfo(w.players[p.id]);p.bondVip={...vip,used:p.bondInfos.length,remaining:Math.max(0,vip.limit-p.bondInfos.length)};}
  const raceStatus=raceView(w,now),raceStage=raceStageIds(w,now);
  const divineRoles=earlyRoles||rankDivineRoles(players,w.adminLog||[]);for(const p of players)p.divineRoles=divineRoles.get(p.id)||[];
  const honors=earlyHonors||honorRoll(w,players);for(const p of players)p.honor=honorTitle(p,honors);
  // v53: chi phí lên từng cảnh giới (tu vi + linh thạch cần ở cảnh giới trước) cho bảng cảnh giới trên LIVE.
  const realmCosts=REALMS.map((name,r)=>r?{qi:requiredQi({realm:r-1}),stones:requiredStones({realm:r-1})}:null);
  return {...w,tower:towerView(w,now),bonkFest:bonkView(w,now),maze:mazeView(w,now),alchemy:alchemyView(w,now),alchemyStage:alchemyStageIds(w,now),sectWar:warView(w,now),warStage:warStageIds(w,now),progressionPacingVersion:ASCENSION_PACING_VERSION,rebirthUnlockRealm:REBIRTH_UNLOCK_REALM,bondRulesVersion:1,bossCatalog:BOSSES.map(b=>({species:b.species,name:b.name,worldBoss:!!b.worldBoss,hpMultiplier:b.hpMultiplier||1})),liveIntegrityVersion:1,ascensionShowcaseVersion:w.settings?.ascensionShowcase===true?1:0,visitor:w.visitor?{...w.visitor,observed:undefined}:null,auditOutbox:undefined,periodStats:undefined,visitorArchive:undefined,lanternFestival:lanternView(w,now),companions:undefined,companionStatus:companionView(w,now),petEvent:petEventView(w,now),boss:w.boss?{...w.boss,encounter:encounterPhase(w.boss,now)}:null,seen:undefined,giftCounts:undefined,players,honors,realmCosts,social:undefined,tournament:undefined,bondFestival:undefined,socialStatus,socialStage,socialScene,race:undefined,raceStatus,raceStage,skyEvents:SKY_EVENTS,quiz:undefined,envelope:undefined,quizUsed:undefined,engagement:engagementView(w,now),quick:quickView(w,now),serverNow:now,environment:raceStatus?.active?{id:'race',name:'Vân Hải Thiên Lộ',image:'/assets/events-v1/race-background.png'}:socialScene?{id:socialScene,name:socialScene==='tournament'?'Luận Kiếm Đài':'Tam Sinh Tiên Cảnh',image:'/assets/maps-v3/'+(socialScene==='tournament'?'tournament-arena.png':'bond-garden.png')}:petEventView(w,now)?.active&&!w.boss?PET_COVE_MAP:environmentAt(w.createdAt,now,w.settings.sceneMode||'auto'),catalog:CATALOG.map(i=>({...i,name:gameText(i.name),description:gameText(i.description)})),realms:REALMS};
}
export function ingest(w,event,now=Date.now()) {
  if(w.mode==='live'&&(event.simulated||event.autoRose||event.data?.simulated||event.data?.autoRose))return fail('Sự kiện mô phỏng không được ghi vào LIVE.');
  if(!['member','chat','like','follow','share','gift'].includes(event.event))return {ok:true,ignored:true};
  const d=event.data||{}; const u=d.user||d;
  const userId=u.userId||u.id||d.userId||d.id||u.uniqueId||d.uniqueId||u.displayId;
  if(!userId)return {ok:false,message:'Sự kiện không có ID người xem.'};
  const base={userId:String(userId),name:u.nickname||u.uniqueId||d.nickname||d.uniqueId,handle:u.uniqueId||d.uniqueId,avatar:eventAvatar(d)};
  if(w.playTransfers?.[base.userId]?.phase==='web'){
    // Người xem đang có mặt trên LIVE: xin web trả nhân vật về (web chỉ nhả khi không còn chơi).
    w.playTransfers[base.userId].wantsLiveAt=now;
    if(event.event==='gift'){
      const queue=w.playTransfers[base.userId].gifts??=[];
      const encoded=JSON.stringify(event);
      if(!queue.some(x=>JSON.stringify(x)===encoded))queue.push(structuredClone(event));
      return {ok:true,pending:true,queuedGift:true};
    }
    return {ok:false,code:'PLAYING_WEB',message:'Nhân vật đang ở web. Nếu không còn chơi web, vài giây nữa sẽ tự về LIVE.'};
  }
  if(event.event==='member'){
    // Only per-viewer arrivals; roomUser is an aggregate counter, not a roster.
    if(d.actionId!==undefined&&Number(d.actionId)!==1)return {ok:true,ignored:true};
    const prior=w.players[clean(base.userId,80)];
    if(prior?.resident||prior?.puppet||w.liveSession?.active===false)return {ok:true,ignored:true};
    if(prior&&(now-(prior.lastAutoArrivalAt||0)<15000))return {ok:true,duplicate:true};
    const p=ensurePlayer(w,base.userId,base.name,now);if(base.avatar)p.avatar=base.avatar;p.lastAutoArrivalAt=now;p.leftLiveAt=null;
    const arrival=!prior?w.events.findLast(e=>e.user===p.id&&e.effect==='join'&&e.at===now):null;
    Object.assign(arrival||emit(w,p,'Chào đạo hữu trở lại','join',now),{autoArrival:true,newcomerWelcome:true,returning:!!prior});
    // Arrival itself grants no tu vi, gift credit or task progress. The first
    // real cultivation starts the newcomer journey and remembers chosen gender.
    return {ok:true,playerId:p.id,autoArrival:true};
  }
  if(event.event==='chat')return action(w,{...base,type:'chat',text:d.comment},now);
  if(event.event==='like'){
    const count=Number(d.likeCount??d.count);
    if(!Number.isSafeInteger(count)||count<1)return fail('Gói tym thiếu số lượt hợp lệ; không tự đoán.');
    return action(w,{...base,type:'like',count},now);
  }
  if(event.event==='follow'||event.event==='share')return action(w,{...base,type:event.event,eventId:d.msgId?String(d.msgId):undefined},now);
  if(event.event!=='gift')return {ok:true,ignored:true};
  const gift=d.gift||{};const coins=Number(d.diamondCount??gift.diamondCount??gift.diamond_count);
  if(!Number.isSafeInteger(coins)||coins<1)return fail('Quà thiếu giá trị coin; không tự đoán.');
  // 08/11: ghi ảnh thật của món quà (để bảng sự kiện hiện ảnh quà thay số coin). Giữ tối đa 40 món gần nhất.
  {const name=String(d.giftName||gift.name||'').normalize('NFC').slice(0,40),url=safeGiftUrl(d.giftPictureUrl||gift.giftPictureUrl);if(name&&url){w.giftArt??={};delete w.giftArt[name];w.giftArt[name+'|'+coins]={coins,url,at:now}; /* 08/11 tối: khóa theo tên + giá — 'Vương miện' 500 và 2000 coin là hai quà khác ảnh */const keys=Object.keys(w.giftArt);if(keys.length>40)delete w.giftArt[keys.sort((a,b)=>w.giftArt[a].at-w.giftArt[b].at)[0]];}}
  const total=Number(d.repeatCount??1);if(!Number.isSafeInteger(total)||total<1||total>1000)return fail('Combo không hợp lệ.');
  const streak=Number(d.giftType??gift.giftType??gift.type)===1;
  let count=total; const group=d.groupId||d.giftGroupId;
  // Cumulative streak: grant only the delta. Without group ID wait for final event.
  const eventId=d.msgId?`gift:${d.msgId}`:null;
  if(eventId&&w.seen[eventId])return {ok:true,duplicate:true};
  if(streak&&group) {
    const key=`${base.userId}:${d.giftId||gift.id}:${group}`;const prev=w.giftCounts[key]?.count||0;
    count=Math.max(0,total-prev);w.giftCounts[key]={count:Math.max(prev,total),at:now};
    if(!count)return {ok:true,duplicate:true};
  }else if(streak&&!d.repeatEnd)return {ok:true,pending:true};
  // A stable identifier is required so reconnect/replay cannot duplicate a gift.
  const stableId=eventId|| (group?`gift:${base.userId}:${d.giftId||gift.id}:${group}:${total}`:null);
  if(!stableId)return fail('Quà thiếu msgId/groupId; cần kiểm tra cấu trúc sự kiện TikFinity.');
  const giftName=clean(d.giftName??gift.name??d.extendedGiftInfo?.name??'',40)||undefined;
  return action(w,{...base,type:'gift',coins,count,eventId:stableId,giftName,comboKey:group?String(group):undefined,comboFinal:!streak||d.repeatEnd===true},now);
}
// v37: Sự kiện bất ngờ "Thiên Hoa Vũ" do người điều hành bấm. Tim = 1 điểm, coin quà = 100 điểm (v59).
// Tham gia → Phúc duyên ×2 ngay. Hết giờ: Top 1–3 nhận pháp bảo lớn, mọi người ≥10 điểm nhận Tụ Linh Bình + thưởng.
// v38: nhiều loại sự kiện dùng chung một khung (w.flowerEvent.kind). Mỗi loại có pháp bảo riêng.
export const SKY_EVENTS=Object.freeze({
  flower:{name:'Thiên Hoa Vũ',chatPoints:0,how:'thả tim, tặng quà',
    rewards:[{item:'hoa-tien-kiem',qi:3000,stones:500,herbs:30,mult:3},{item:'dao-hoa-phien',qi:1500,stones:250,herbs:20,mult:3},{item:'hoa-linh-lung',qi:800,stones:150,herbs:12,mult:3}],
    participant:{item:'spirit-vase',qi:200,stones:50,herbs:5,mult:2,minScore:10}},
  meteor:{name:'Tinh Hà Lưu Tinh',chatPoints:5,how:'bình luận bắt sao, thả tim, tặng quà',
    rewards:[{item:'tinh-ha-kinh',qi:3000,stones:500,herbs:30,mult:3},{item:'luu-tinh-cung',qi:1500,stones:250,herbs:20,mult:3},{item:'that-tinh-phu',qi:800,stones:150,herbs:12,mult:3}],
    participant:{item:'tinh-sa-dai',qi:200,stones:50,herbs:5,mult:2,minScore:10}}
});
export const FLOWER_REWARDS=SKY_EVENTS.flower.rewards,FLOWER_PARTICIPANT=SKY_EVENTS.flower.participant;
export function startFlowerEvent(w,now=Date.now(),minutes=2,kind='flower'){
 const conflict=stageConflict(w,now);if(conflict)return fail('Đang có '+conflict+' • chờ kết thúc và trao thưởng.');
  if(socialBusy(w,now))return fail('Đang có tỷ thí hoặc lễ kết duyên.');
  const cfg=SKY_EVENTS[kind];if(!cfg)return fail('Loại sự kiện không hợp lệ.');
  if(w.boss&&now<w.boss.endsAt&&w.boss.hp>0)return fail(BOSS_BUSY);
  if(w.flowerEvent&&now<w.flowerEvent.endsAt)return fail(`${SKY_EVENTS[w.flowerEvent.kind||'flower'].name} đang diễn ra.`);
  const m=Math.max(1,Math.min(10,Math.round(Number(minutes)||2)));
  w.flowerEvent={id:kind+'-'+now,kind,startedAt:now,endsAt:now+m*60000,minutes:m,scores:{}};
  emit(w,null,`${cfg.name} giáng thế ${m} phút • ${cfg.how} để tranh pháp bảo`,'flower',now,{skyPresentationUntil:w.flowerEvent.endsAt,flowerStart:true,eventKind:kind,minutes:m});
  return {ok:true,endsAt:w.flowerEvent.endsAt,kind};
}
// Tự động mở sự kiện: mỗi autoEventMinutes (mặc định 15) nếu có ≥2 người đang hoạt động và không có yêu thú; luân phiên các loại.
function autoSkyEvent(w,now){
  if(automaticEventsPaused(w,now))return;
  if(w.settings?.autoEvents===false||socialBusy(w,now)||w.social?.ceremonies?.length||w.settings?.scheduledCompetitions&&w.competitionSchedule?.nextAt<=now)return;const every=Math.max(5,w.settings?.autoEventMinutes??15)*60000;
  if(!w.nextAutoEventAt){w.nextAutoEventAt=now+5*60000;return;}
  if(now<w.nextAutoEventAt)return;
  const busy=eventBusyUntil(w,now)||w.boss,active=Object.values(w.players).filter(p=>!p.resident&&now-p.lastActive<5*60000).length;
  if(busy||active<2){w.nextAutoEventAt=now+60000;return;}
  if(w.settings?.autoRandom){randomEvent(w,now);w.nextAutoEventAt=now+every;return;}
  const kinds=Object.keys(SKY_EVENTS),kind=kinds[(w.autoEventSeq||0)%kinds.length];w.autoEventSeq=(w.autoEventSeq||0)+1;
  startFlowerEvent(w,now,w.settings?.autoEventLength??2,kind);w.nextAutoEventAt=now+every;
}
// 09/11: KHÁCH MỜI SKIN LUÂN PHIÊN — cứ 10 phút (tính từ lượt khách mời trước, kể cả lượt mở tay) một vị, bốc ngẫu nhiên
// có trọng số: skin 300 coin (Khuy Niết, Tần Mục) trọng số 1, các vị khác 2; không bao giờ trùng vị vừa rồi. Sân bận thì thử lại sau 30 s.
// Tắt bằng settings.visitorRotation=false. Khi bật, túi sự kiện ngẫu nhiên không còn tự mở khách mời nữa.
export const VISITOR_ROTATION_MS=10*60000;
export function visitorRotationWeights(){return Object.keys(VISITOR_GIFT_REWARDS).filter(k=>Object.hasOwn(VISITORS,k)).map(k=>[k,(VISITOR_GIFT_REWARDS[k].skinCoins||100)>=300?1:2]);}
export function pickRotationVisitor(last,rand=Math.random){const pool=visitorRotationWeights().filter(([k])=>k!==last),total=pool.reduce((n,[,x])=>n+x,0);let r=rand()*total;for(const [k,x] of pool)if((r-=x)<0)return k;return pool.at(-1)?.[0]||null;}
const rotationOn=w=>w.settings?.visitorRotation!==false;
function visitorRotation(w,now){
  if(!rotationOn(w)||w.settings?.autoEvents===false||automaticEventsPaused(w,now))return;
  if(!w.nextVisitorAt){w.nextVisitorAt=Math.max(now+60000,(w.lastVisitorStartAt||0)+VISITOR_ROTATION_MS);return;}
  if(now<w.nextVisitorAt)return;
  const active=Object.values(w.players).filter(p=>!p.resident&&!p.puppet&&now-p.lastActive<5*60000).length;if(active<2){w.nextVisitorAt=now+60000;return;}
  const kind=pickRotationVisitor(w.lastVisitorKind);if(!kind||!startVisitor(w,kind,now).ok)w.nextVisitorAt=now+30000;
}
// v74: RANDOM mọi sự kiện — bốc ngẫu nhiên (không lặp lại cái vừa chạy); cái nào không mở được thì thử cái khác.
export const RANDOM_EVENTS=Object.freeze([
  ['flower','Thiên Hoa Vũ',(w,now)=>startFlowerEvent(w,now,w.settings?.autoEventLength??2,'flower')],
  ['meteor','Tinh Hà Lưu Tinh',(w,now)=>startFlowerEvent(w,now,w.settings?.autoEventLength??2,'meteor')],
  ['visitor-hanlap','Tiên nhân Hàn Lập',(w,now)=>startVisitor(w,'hanlap',now)],
  ['visitor-vuonglam','Tiên nhân Vương Lâm',(w,now)=>startVisitor(w,'vuonglam',now)],
  ['visitor-shende','Tiên nhân Thần Đế',(w,now)=>startVisitor(w,'shende',now)],
  ['opportunity','Cơ duyên',(w,now)=>startOpportunity(w,now)],
  ['tournament','Phong Vân Luận Kiếm',(w,now)=>startTournament(w,now)],
  ['race','Đua phi kiếm',(w,now)=>{const r=startRace(w,now);if(r.ok&&w.race)w.race.repeat=false;return r;}],
  ['war','Chính Ma Đại Chiến',(w,now)=>startWar(w,now)],
  ['alchemy','Khai Lò Cửu Chuyển',(w,now)=>startAlchemy(w,now)],
  ['bond','Lễ kết duyên',(w,now)=>startBondFestival(w,now)],
  ['bonk','Hội Gõ Đầu',(w,now)=>beginBonk(w,now,bonkContext)],
  ['tower','Vân Hải Tháp',(w,now)=>beginTower(w,now,towerContext)],
  ['boss','Yêu thú',(w,now)=>openBoss(w,now)]
]);
// v77: "xào bài" — trộn đủ 10 sự kiện, rút lần lượt; hết túi mới trộn lại → 10 lượt liên tiếp chắc chắn có đủ kết duyên, phi kiếm, tỷ thí…
function randomEvent(w,now){if(['registration','running'].includes(w.race?.phase))return null;
  // Chính Ma Đại Chiến chỉ vào túi ngẫu nhiên khi bật settings.sectWarAuto (mặc định tắt tới khi xong phần hình).
  const allowed=RANDOM_EVENTS.map(([id])=>id).filter(id=>!(id==='war'&&w.settings?.sectWarAuto!==true)&&!(id==='alchemy'&&w.settings?.alchemyAuto!==true)&&!(id==='tower'&&w.settings?.towerAuto===false)).filter(id=>!(rotationOn(w)&&id.startsWith('visitor-'))&&!(w.settings?.visitorEveryFive&&['visitor-vuonglam','visitor-shende'].includes(id))&&!(w.settings?.randomExclude||[]).includes(id)&&!(w.settings?.eventSpacing&&id==='boss')&&!(w.settings?.scheduledCompetitions&&['race','tournament'].includes(id)));
  w.randomBag=(w.randomBag||[]).filter(id=>allowed.includes(id));
  if(!w.randomBag.length){const bag=[...allowed];for(let i=bag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}
    if(bag.length>1&&bag[0]===w.lastRandomEvent)bag.push(bag.shift());w.randomBag=bag;}
  // thử theo thứ tự trong túi; cái nào chưa mở được thì giữ lại cho lượt sau
  for(const id of [...w.randomBag]){const start=RANDOM_EVENTS.find(e=>e[0]===id)[2];let r;try{r=start(w,now);}catch{r=null;}
    if(r?.ok){w.randomBag.splice(w.randomBag.indexOf(id),1);w.lastRandomEvent=id;return id;}}
  return null;}
export function setEventSettings(w,{autoEvents,autoEventMinutes,autoRandom,scheduledCompetitions,eventSpacing,bossIntervalMinutes,huntBeforeCompetition,visitorEveryFive,randomExclude,quiz,envelope,heartPlay}={}){
  // 4/11/2026: công tắc từng sự kiện trên trang điều hành (có hiệu lực ngay trên LIVE).
  if(randomExclude!==undefined){if(!Array.isArray(randomExclude))return fail('Danh sách sự kiện tắt không hợp lệ.');const ids=new Set(RANDOM_EVENTS.map(([id])=>id));w.settings??={};w.settings.randomExclude=[...new Set(randomExclude.map(String))].filter(id=>ids.has(id));if(w.randomBag)w.randomBag=w.randomBag.filter(id=>!w.settings.randomExclude.includes(id));}
  for(const [k,v] of [['quiz',quiz],['envelope',envelope],['heartPlay',heartPlay]])if(typeof v==='boolean'){w.settings??={};w.settings[k]=v;}
  if(bossIntervalMinutes!==undefined){const m=Number(bossIntervalMinutes);if(!Number.isInteger(m)||m<10||m>120)return fail('Nhịp yêu thú cần từ 10 đến 120 phút.');w.settings??={};w.settings.bossInterval=m*60;w.nextBossAt=Math.min(w.nextBossAt||Infinity,Date.now()+m*60000);}
  if(typeof eventSpacing==='boolean')configureEventSpacing(w,eventSpacing,Date.now());
  if(typeof visitorEveryFive==='boolean'){w.settings??={};w.settings.visitorEveryFive=visitorEveryFive;}
  if(typeof huntBeforeCompetition==='boolean'){
    w.settings??={};w.settings.huntBeforeCompetition=huntBeforeCompetition;
    if(huntBeforeCompetition){w.settings.scheduledCompetitions=true;w.competitionSchedule??={nextAt:Date.now()+10*60000,intervalMs:COMPETITION_INTERVAL_MS,nextKind:'race',cycleVersion:2,cycleIndex:0};w.competitionSchedule.nextAt=Math.max(w.competitionSchedule.nextAt||0,Date.now()+10*60000);}
  }
  if(typeof scheduledCompetitions==='boolean'){w.settings??={};w.settings.scheduledCompetitions=scheduledCompetitions;if(scheduledCompetitions&&!w.competitionSchedule)w.competitionSchedule={nextAt:Date.now()+COMPETITION_INTERVAL_MS,intervalMs:COMPETITION_INTERVAL_MS,nextKind:'race',cycleVersion:2,cycleIndex:0};}
  w.settings??={};if(typeof autoEvents==='boolean')w.settings.autoEvents=autoEvents;if(typeof autoRandom==='boolean'){w.settings.autoRandom=autoRandom;if(autoRandom)w.settings.autoEvents=true;}
  if(autoEventMinutes!==undefined){const m=Math.round(Number(autoEventMinutes));if(!Number.isFinite(m)||m<5||m>120)return fail('Khoảng cách 5–120 phút.');w.settings.autoEventMinutes=m;if(w.nextAutoEventAt)w.nextAutoEventAt=Math.min(w.nextAutoEventAt,Date.now()+m*60000);}
  return {ok:true,settings:{autoEvents:w.settings.autoEvents!==false,autoRandom:!!w.settings.autoRandom,autoEventMinutes:w.settings.autoEventMinutes??15,nextAutoEventAt:w.nextAutoEventAt||null,randomExclude:w.settings.randomExclude||[],quiz:w.settings.quiz!==false,envelope:w.settings.envelope!==false,heartPlay:w.settings.heartPlay!==false,scheduledCompetitions:!!w.settings.scheduledCompetitions,huntBeforeCompetition:!!w.settings.huntBeforeCompetition}};
}
function flowerScore(w,p,points,now){
  const ev=w.flowerEvent;if(!ev||now<ev.startedAt||now>=ev.endsAt||p.resident||points<=0)return;
  const first=!ev.scores[p.id];ev.scores[p.id]=(ev.scores[p.id]||0)+points;
  if(first){p.buffMult=Math.max(2,p.buffUntil>now?p.buffMult||1:1);p.buffUntil=Math.max(p.buffUntil||0,now+GIFT_BUFF_MS);}
}
function giveArtifact(w,p,id){if(!p.artifacts.includes(id)){p.artifacts.push(id);if(itemScore(id)>itemScore(p.equipped))p.equipped=id;return true;}return false;}
function finishFlowerEvent(w,now){
  const ev=w.flowerEvent;ev.closedAt=now;
  finishFlowerHearts(w,ev,now,{gain,emit});
  const ranking=Object.entries(ev.scores).filter(([id])=>w.players[id]).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
  ev.result=[];
  const cfg=SKY_EVENTS[ev.kind||'flower'];
  ranking.forEach(([id,score],i)=>{const p=w.players[id],tier=cfg.rewards[i]||(score>=cfg.participant.minScore?cfg.participant:null);if(!tier)return;
    const gotItem=giveArtifact(w,p,tier.item),qi=gain(w,p,tier.qi,tier.stones,tier.herbs,now);
    p.buffMult=Math.max(tier.mult,p.buffUntil>now?p.buffMult||1:1);p.buffUntil=now+GIFT_BUFF_MS;
    const itemName=CATALOG.find(x=>x.id===tier.item)?.name;
    if(i<3){ev.result.push({id,name:p.name,score,item:itemName,qi});
      emit(w,p,`${cfg.name} hạng ${i+1} • ${score} điểm • nhận ${gotItem?itemName+', ':''}+${qi} tu vi, +${tier.stones} linh thạch • phúc duyên ×${tier.mult}`,'flower',now,{skyPresentationUntil:Math.max(ev.endsAt,now)+SKY_SETTLEMENT_MS,flowerRank:i+1,eventKind:ev.kind||'flower',score,itemNames:gotItem?[itemName]:[],reward:{qi,stones:tier.stones,herbs:tier.herbs}});}
  });
  const others=Math.max(0,ranking.filter(([,s])=>s>=FLOWER_PARTICIPANT.minScore).length-3);
  const pName=CATALOG.find(x=>x.id===cfg.participant.item)?.name;
  emit(w,null,`${cfg.name} kết thúc • ${ranking.length} đạo hữu tham gia${others?` • ${others} người nhận ${pName}`:''}`,'flower',now,{skyPresentationUntil:Math.max(ev.endsAt,now)+SKY_SETTLEMENT_MS,flowerEnd:true,eventKind:ev.kind||'flower',count:ranking.length,others,participantItem:pName});
}
// v33 (chạy 1 lần lúc mở máy chủ): skin Xích Phượng / Bạch Kim do Tri ân cũ tự gán không còn tự mặc
// (vẫn sở hữu, gõ "skin <tên>" để mặc). Skin có được bằng rèn (Xích Diễm Kiếm / Cửu Tiêu Linh Châu) hoặc quà
// 2.999+ (Long Phượng Thần Châu) giữ nguyên lựa chọn.
export function migrateSkinsV33(w){
  if(w.migrations?.skinsV33)return 0;let n=0;
  for(const p of Object.values(w.players)){
    const earned={'crimson-phoenix':p.artifacts?.includes('phoenix-blade'),'ivory-celestial':p.artifacts?.includes('celestial-orb')||p.artifacts?.includes('vip-dragon-orb')};
    if(p.skinChoice in earned&&!earned[p.skinChoice]){p.skinChoice=null;n++;}
  }
  (w.migrations??={}).skinsV33=Date.now();return n;
}
// v33: người điều hành chỉnh tay từng người (trang quản lý, chỉ trên máy này). Kiểm tra từng trường, ghi nhật ký.
// v80: NÚT BAN THƯỞNG của người điều hành — gói tu vi theo % yêu cầu cảnh giới hiện tại (ai cũng thấy đáng), linh thạch, linh thảo, phúc duyên.
export const ADMIN_COMBOS=Object.freeze({
  small:{name:'Tiểu Lễ',qiPct:.10,stones:30,herbs:5,buff:0},
  medium:{name:'Trung Lễ',qiPct:.30,stones:100,herbs:15,buff:3},
  large:{name:'Đại Lễ',qiPct:.60,stones:250,herbs:40,buff:5},
  buff:{name:'Phúc Duyên',qiPct:0,stones:0,herbs:0,buff:8},
  breakthrough:{name:'Đột Phá Đan',qiPct:1,stones:0,herbs:0,buff:0,fill:true}
});
export function adminGift(w,id,combo,now=Date.now(),custom=null){
  if(w.playTransfers?.[id]?.phase==='web')return fail('Nhân vật đang chơi web; đăng xuất trước khi sửa tài nguyên.');
  if(combo==='custom')return adminCustomGift(w,id,custom||{},now);
  const c=ADMIN_COMBOS[combo];if(!c)return fail('Gói quà không hợp lệ.');
  let p;if(id==='*'){const pool=Object.values(w.players).filter(x=>!x.resident&&currentParticipant(w,x,now));if(!pool.length)return fail('Chưa có ai đang chơi.');p=pool[Math.floor(Math.random()*pool.length)];}
  else p=w.players[clean(id,80)];if(!p||p.resident)return fail('Không tìm thấy người chơi.');
  const need=requiredQi(p);let qi=c.fill?Math.max(0,need-p.qi):Math.round(need*c.qiPct);
  if(c.fill){p.stones=Math.max(p.stones,requiredStones(p));}
  const got=qi?gain(w,p,qi,c.stones,c.herbs,now,false,'admin'):0;if(!qi&&(c.stones||c.herbs)){p.stones+=c.stones;p.herbs+=c.herbs;}
  if(c.buff){p.buffMult=Math.max(c.buff,p.buffUntil>now?p.buffMult||1:1);p.buffUntil=now+GIFT_BUFF_MS;}
  p.lastActive=Math.max(p.lastActive||0,now);
  const parts=[got&&`+${got} tu vi`,c.stones&&!c.fill&&`+${c.stones} linh thạch`,c.herbs&&`+${c.herbs} linh thảo`,c.buff&&`phúc duyên ×${c.buff} 10 phút`,c.fill&&(readyToBreak(p,w,now)?'đủ điều kiện đột phá':'đủ tu vi và linh thạch, chờ lượt đột phá ngày sau')].filter(Boolean);
  emit(w,p,`Tông chủ ban ${c.name} cho ${p.name} • ${parts.join(' • ')}`,'lotus',now,{achieve:{kind:'admin',item:c.name,parts},adminGift:combo,comboName:c.name,reward:{qi:got,stones:c.stones,herbs:c.herbs},buff:c.buff?{mult:c.buff,minutes:10}:null});
  (w.adminLog??=[]).push({at:now,id:p.id,name:p.name,changes:['ban '+c.name]});if(w.adminLog.length>200)w.adminLog.splice(0,w.adminLog.length-200);
  checkReady(w,p,now);return {ok:true,id:p.id,name:p.name,combo:c.name,qi:got};
}
// 07/11/2026: THIÊN ĐẠO — người điều hành giáng thiên lôi xuống 1 người (hoặc '*' ngẫu nhiên người đang chơi).
// Trừ 20% tu vi hiện có, choáng 5 phút: không vận công/hái/đánh/dùng đan/đột phá, tim vẫn tính điểm sự kiện, quà vẫn nhận đủ.
export const HEAVEN_STRIKE=Object.freeze({lossPct:.2,stunMs:5*60000,cooldownMs:60000});
export const heavenStunned=(p,now=Date.now())=>!!p&&p.stunUntil>now;
export function heavenStrike(w,id,now=Date.now()){
  const wait=HEAVEN_STRIKE.cooldownMs-(now-(w.lastHeavenStrikeAt||0));if(wait>0)return fail(`Thiên lôi đang tụ lại • chờ ${Math.ceil(wait/1000)} giây nữa.`);
  let p;if(id==='*'){const pool=Object.values(w.players).filter(x=>!x.resident&&!x.puppet&&!heavenStunned(x,now)&&currentParticipant(w,x,now));if(!pool.length)return fail('Chưa có ai đang chơi để giáng lôi.');p=pool[Math.floor(Math.random()*pool.length)];}
  else p=w.players[clean(id,80)];if(!p||p.resident)return fail('Không tìm thấy người chơi.');
  const loss=Math.max(0,Math.floor((p.qi||0)*HEAVEN_STRIKE.lossPct));p.qi-=loss;p.totalQi=Math.max(0,(p.totalQi||0)-loss);w.sectQi=Math.max(0,(w.sectQi||0)-loss);
  p.stunUntil=now+HEAVEN_STRIKE.stunMs;w.lastHeavenStrikeAt=now;p.lastActive=Math.max(p.lastActive||0,now);
  const seed=Math.floor(Math.random()*1e9);
  emit(w,p,`THIÊN KIẾP GIÁNG LÂM • thiên lôi đánh trúng • -${loss} tu vi (20%) • choáng 5 phút`,'heavenStrike',now,{gender:p.gender,realm:p.realm,heavenStrike:{loss,stunMs:HEAVEN_STRIKE.stunMs,seed,until:p.stunUntil}});
  (w.adminLog??=[]).push({at:now,id:p.id,name:p.name,changes:['thiên lôi: -'+loss+' tu vi, choáng 5 phút']});if(w.adminLog.length>200)w.adminLog.splice(0,w.adminLog.length-200);
  return {ok:true,id:p.id,name:p.name,loss,until:p.stunUntil};
}
// 4/11/2026: ban thưởng tùy chỉnh cho một người (hoặc '*' = ngẫu nhiên 1 người đang chơi). Cộng thẳng đúng số đã nhập.
export function adminCustomGift(w,id,custom={},now=Date.now()){
  if(w.playTransfers?.[id]?.phase==='web')return fail('Nhân vật đang chơi web; đăng xuất trước khi sửa tài nguyên.');
  const num=(v,max)=>{const n=Math.round(Number(v)||0);return n<0||!Number.isFinite(n)?NaN:Math.min(max,n);};
  const qi=num(custom.qi,1e10),stones=num(custom.stones,1e6),herbs=num(custom.herbs,1e5),buff=num(custom.buff,10),minutes=num(custom.minutes??10,120);
  if([qi,stones,herbs,buff,minutes].some(Number.isNaN))return fail('Số không hợp lệ.');
  if(buff===1||buff>10)return fail('Phúc duyên từ ×2 đến ×10 (0 = không).');if(buff&&(minutes<1))return fail('Thời gian phúc duyên từ 1 đến 120 phút.');
  if(!qi&&!stones&&!herbs&&!buff)return fail('Nhập ít nhất một phần thưởng.');
  let p;if(id==='*'){const pool=Object.values(w.players).filter(x=>!x.resident&&currentParticipant(w,x,now));if(!pool.length)return fail('Chưa có ai đang chơi.');p=pool[Math.floor(Math.random()*pool.length)];}
  else p=w.players[clean(id,80)];if(!p||p.resident)return fail('Không tìm thấy người chơi.');
  p.qi+=qi;p.totalQi+=qi;w.sectQi+=qi;p.stones+=stones;p.herbs+=herbs;
  if(buff){p.buffMult=Math.max(buff,p.buffUntil>now?p.buffMult||1:1);p.buffUntil=Math.max(p.buffUntil>now?p.buffUntil:0,now+minutes*60000);}
  p.lastActive=Math.max(p.lastActive||0,now);
  const parts=[qi&&`+${qi} tu vi`,stones&&`+${stones} linh thạch`,herbs&&`+${herbs} linh thảo`,buff&&`phúc duyên ×${buff} ${minutes} phút`].filter(Boolean);
  emit(w,p,`Tông chủ ban thưởng riêng cho ${p.name} • ${parts.join(' • ')}`,'lotus',now,{achieve:{kind:'admin',item:'Thưởng Riêng',parts},adminGift:'custom',comboName:'Thưởng Riêng',reward:{qi,stones,herbs},buff:buff?{mult:buff,minutes}:null});
  (w.adminLog??=[]).push({at:now,id:p.id,name:p.name,changes:['thưởng riêng: '+parts.join(', ')]});if(w.adminLog.length>200)w.adminLog.splice(0,w.adminLog.length-200);
  checkReady(w,p,now);return {ok:true,id:p.id,name:p.name,combo:'Thưởng Riêng',qi};
}
export function adminEditPlayer(w,id,patch={},now=Date.now(),{announce=false}={}){
  if(w.playTransfers?.[id]?.phase==='web')return fail('Nhân vật đang chơi web; đăng xuất trước khi sửa tài nguyên.');
  id=clean(id,80);if(!id||!Object.hasOwn(w.players,id))return fail('Không tìm thấy người này.');
  const p=w.players[id],changes=[];
  const int=(v,max=1e9)=>{const n=Number(v);if(!Number.isSafeInteger(n)||n<0||n>max)throw Error('Số không hợp lệ (0 – '+max.toLocaleString('vi-VN')+').');return n;};
  try{
    if(patch.name!==undefined){const n=clean(patch.name);if(!n)throw Error('Tên không được trống.');if(n!==p.name){changes.push('tên');p.name=n;}}
    if(patch.gender!==undefined){const g=patch.gender==='nam'||patch.gender==='nu'?patch.gender:null;if(g!==(p.gender??null)){changes.push('xưng hô');p.gender=g;}}
    const oldRealm=p.realm;
    if(patch.realm!==undefined){const r=int(patch.realm,REALMS.length-1);if(r!==p.realm){changes.push(`cảnh giới ${REALMS[p.realm]} → ${REALMS[r]}`);p.realm=r;p.readyRealm=null;}}
    for(const [key,label] of [['qi','tu vi'],['stones','linh thạch'],['herbs','linh thảo'],['giftCoins','coin quà']]){
      if(patch[key]===undefined)continue;const v=int(patch[key]);if(v===p[key])continue;
      if(key==='qi'&&v>p.qi)p.totalQi+=v-p.qi;
      changes.push(`${label} ${p[key]} → ${v}`);p[key]=v;
    }
    for(const itemId of [].concat(patch.addItems||[])){
      const item=CATALOG.find(x=>x.id===itemId);if(!item)throw Error('Vật phẩm không tồn tại.');
      if(item.type==='manual'&&!p.manuals.includes(item.id)){p.manuals.push(item.id);changes.push('trao '+item.name);}
      else if(item.type==='artifact'&&!p.artifacts.includes(item.id)){p.artifacts.push(item.id);changes.push('trao '+item.name);}
      else if(item.type==='pill'){p.pills[item.id]=(p.pills[item.id]||0)+1;changes.push('trao 1 '+item.name);}
    }
    for(const itemId of [].concat(patch.removeItems||[])){
      const i=p.manuals.indexOf(itemId),j=p.artifacts.indexOf(itemId);
      if(i>=0){p.manuals.splice(i,1);changes.push('gỡ '+CATALOG.find(x=>x.id===itemId)?.name);}
      if(j>=0){p.artifacts.splice(j,1);if(p.equipped===itemId)p.equipped=null;changes.push('gỡ '+CATALOG.find(x=>x.id===itemId)?.name);}
    }
    if(patch.equipped!==undefined){const e=patch.equipped||null;if(e&&!p.artifacts.includes(e))throw Error('Chỉ trang bị được pháp bảo người này đang có.');if(e!==p.equipped){changes.push('trang bị '+(CATALOG.find(x=>x.id===e)?.name||'không'));p.equipped=e;}}
    // v47: chỉnh skin. skinChoice: id skin đặc biệt (tự cấp quyền sở hữu nếu chưa có) hoặc null = áo theo bậc.
    if(patch.skinChoice!==undefined){const id=patch.skinChoice||null,skin=id&&SPECIAL_SKINS.find(s=>s.id===id);if(id&&!skin)throw Error('Skin không tồn tại.');
      p.rewardSkins??=[];if(skin&&!p.rewardSkins.includes(id)){p.rewardSkins.push(id);changes.push('cấp skin '+skin.name);}
      if((p.skinChoice||null)!==id){changes.push('mặc '+(skin?skin.name:'áo theo bậc'));p.skinChoice=id;p.skinChoiceSource='admin';p.divineRoleHidden=id===null;}}
    if(patch.divineRoleHidden!==undefined){if(typeof patch.divineRoleHidden!=='boolean')throw Error('Chế độ thần trang không hợp lệ.');if(!!p.divineRoleHidden!==patch.divineRoleHidden){p.divineRoleHidden=patch.divineRoleHidden;changes.push(p.divineRoleHidden?'dùng áo cảnh giới':'dùng thần trang khi giữ danh hiệu');}}
    // 09/11: chọn linh thú đồng hành từ trang quản lý (tự cấp quyền sở hữu nếu chưa có); null = cất linh thú.
    if(patch.spiritPet!==undefined){const id=patch.spiritPet||null,pet=id&&ALL_PETS.find(x=>x.id===id);if(id&&!pet)throw Error('Linh thú không tồn tại.');
      p.spiritPets??=[];if(pet&&!p.spiritPets.includes(id)){p.spiritPets.push(id);changes.push('cấp linh thú '+pet.name);}
      if((p.spiritPet||null)!==id){p.spiritPet=id;changes.push(pet?'đồng hành '+pet.name:'cất linh thú');}}
    // 08/11: gỡ linh thú (thu hồi thần thú nhận nhầm theo luật Tông chủ cũ); linh thú đang dẫn bị gỡ thì đổi sang con mạnh nhất còn lại.
    for(const id of [].concat(patch.removePets||[])){const i=(p.spiritPets||[]).indexOf(id);if(i>=0){p.spiritPets.splice(i,1);if(p.spiritPet===id)p.spiritPet=[...ALL_PETS].reverse().find(x=>p.spiritPets.includes(x.id))?.id||null;changes.push('gỡ linh thú '+(ALL_PETS.find(x=>x.id===id)?.name||id));}}
    for(const id of [].concat(patch.removeSkins||[])){const i=(p.rewardSkins||[]).indexOf(id);if(i>=0){p.rewardSkins.splice(i,1);if(p.skinChoice===id)p.skinChoice=null;changes.push('gỡ skin '+(SPECIAL_SKINS.find(s=>s.id===id)?.name||id));}}
    if(patch.resetCooldowns){p.cooldowns={};changes.push('xóa thời gian hồi');}
    if(announce&&p.realm>oldRealm)emit(w,p,`ĐỘT PHÁ ${REALMS[p.realm].toUpperCase()} • thiên môn khai mở`,'breakthrough',now,{fromRealm:oldRealm,toRealm:p.realm});
  }catch(e){return fail(e.message);}
  if(changes.length){w.adminLog??=[];w.adminLog.push({at:now,id,name:p.name,changes});w.adminLog=w.adminLog.slice(-200);}
  return {ok:true,changes};
}
export function seedDemo() {
  const w=createWorld('demo'), now=Date.now();
  const names=['Thanh Vân','Mộc Miên','Hàn Phong','Tiểu Ngư','Bạch Lộ','Vô Trần','Lạc Yên','Minh Nguyệt','A Thanh','Trúc Linh','Thiên Vũ','Lam Khê'];
  names.forEach((name,i)=>{const p=ensurePlayer(w,`demo-${i}`,name,now);p.realm=i===0?2:i<5?1:0;p.qi=i===0?210:30+i*7;p.totalQi=p.qi+120*p.realm;p.stones=i===0?180:45+i*4;p.herbs=8;p.manuals=i<5?['breath']:[];p.artifacts=i<3?['jade']:[];p.equipped=i<3?'jade':null;p.pills={'qi-pill':2};});
  w.sectQi=Object.values(w.players).reduce((n,p)=>n+p.totalQi,0);w.nextBossAt=now+180000;return w;
}

// Free visiting-immortal events. Exactly-once awards persist with the world.
export function startVisitor(w,kind='hanlap',now=Date.now()){
 const conflict=stageConflict(w,now);if(conflict)return fail('Đang có '+conflict+' • chờ kết thúc và trao thưởng.');
 if(socialBusy(w,now))return fail('Đang có tỷ thí hoặc lễ kết duyên.');
 if(w.boss&&now<w.boss.endsAt&&w.boss.hp>0)return fail(BOSS_BUSY);
 if(typeof kind!=='string'||!Object.hasOwn(VISITORS,kind))return fail('Tiên nhân không hợp lệ.');
 if(w.visitor&&now<w.visitor.endsAt)return fail('Tiên nhân đang truyền đạo.');
 if(w.opportunity&&now<w.opportunity.endsAt)return fail('Chờ sự kiện cơ duyên hiện tại kết thúc để tránh trùng lệnh.');
 const active=Object.values(w.players).filter(p=>currentParticipant(w,p,now)).length;
 archiveVisitor(w);
 w.lastVisitorStartAt=now;w.lastVisitorKind=kind;w.nextVisitorAt=now+VISITOR_ROTATION_MS;
 w.visitor={id:'visitor-'+now,kind,startedAt:now,endsAt:now+(VISITORS[kind].duration||180000),players:{},points:0,goal:Math.min(200,Math.max(20,active*8)),bag:[],completed:false};
 if(w.settings?.visitorEveryFive&&['vuonglam','shende'].includes(kind)){const v=w.scheduledVariety??={};v.majorSinceVisitor=0;v.nextVisitor=kind==='vuonglam'?'shende':'vuonglam';v.lastVisitorAt=now;}
 for(const p of Object.values(w.players))if(currentParticipant(w,p,now))noteVisitorParticipant(w,p,now);
 auditRecord(w,'visitor-start',now,{eventId:w.visitor.id,kind,endsAt:w.visitor.endsAt});
 emit(w,null,VISITORS[kind].title+' • '+VISITORS[kind].how,'visitor',now,{visitorStart:true,visitorKind:kind});return {ok:true,endsAt:w.visitor.endsAt};
}
function awardVisitor(w,p,e,now){
 const progress=e.players[p.id];if(!progress||progress.awarded)return;progress.awarded=true;
 if(!e.bag.length){e.bag=(e.kind==='doraemon'?DORA_RELICS:VISITOR_RELICS).map(x=>x.id);for(let i=e.bag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[e.bag[i],e.bag[j]]=[e.bag[j],e.bag[i]];}}
 const id=e.bag.pop(),a=CATALOG.find(x=>x.id===id),fresh=giveArtifact(w,p,id);p.relicVariant??=Math.floor(Math.random()*6);
 const qi=gain(w,p,fresh?180:240,30,3,now);
 emit(w,p,VISITORS[e.kind].name+' ban '+(fresh?a.name:'mảnh cơ duyên quy đổi tu vi')+' • +'+qi+' tu vi','visitor',now,{visitorAward:true,visitorKind:e.kind,itemNames:fresh?[a.name]:[],reward:{qi,stones:30,herbs:3,items:fresh?[id]:[],itemNames:fresh?[a.name]:[]}});
}
function claimVisitor(w,p,now){
 const e=w.visitor;if(p.resident||!e||now<e.startedAt||now>=e.endsAt)return fail('Cơ duyên đã kết thúc.');
 if(e.players[p.id])return {ok:true,duplicate:true};
 if(Object.keys(e.players).length>=10000)return fail('Sự kiện đã đủ người.');
 e.players[p.id]={joinedAt:now,awarded:false,lastPointAt:0};
 if(e.kind==='hanlap'||e.kind==='shende'||e.kind==='doraemon'||e.kind==='hailam'||e.kind==='tudo'||e.kind==='khuyniet'||e.kind==='viemton'||e.completed)awardVisitor(w,p,e,now);
 else emit(w,p,'Đã nhập trận truyền đạo • cùng tu luyện và thả tim','visitor',now,{visitorKind:e.kind});
 return {ok:true};
}
function advanceVisitor(w,p,input,now){
 const e=w.visitor;if(!e||e.kind!=='vuonglam'||e.completed||now<e.startedAt||now>=e.endsAt)return;
 const progress=e.players[p.id];if(!progress||p.resident||now-progress.lastPointAt<5000||!['chat','cultivate','like','attack','gather'].includes(input.type))return;
 progress.lastPointAt=now;e.points=Math.min(e.goal,e.points+1);
 if(e.points>=e.goal){e.completed=true;for(const id of Object.keys(e.players))if(w.players[id])awardVisitor(w,w.players[id],e,now);emit(w,null,'Vương Lâm truyền đạo viên mãn • đã trao pháp bảo cho người nhập trận','visitor',now,{visitorComplete:true});}
}

const companionContext={emit,active:currentParticipant,ready:readyToBreak,creditQi,createPair:(w,a,b,now)=>createCompanionPair(w,a,b,now,companionContext)};
export const controlLanternEvent=(w,op,now=Date.now())=>controlLantern(w,op,now,companionContext);
const socialContext={emit,gain,power,technique:attackTechnique,active:currentParticipant};
// 07/11/2026: thưởng sự kiện (điểm danh chuỗi, lì xì, câu đố, nhiệm vụ ngày, kiến tạo tông) tính theo % tu vi cần,
// không trừ hạn mức tu luyện ngày — nếu không một lần điểm danh 7 ngày đã tiêu sạch hạn mức.
const engageCtx={emit,gain:(w,p,qi,stones=0,herbs=0,now=null)=>gain(w,p,qi,stones,herbs,now,false,'reward'),active:currentParticipant,requiredQi:p=>requiredQi(p)/progressionMult(p),giveArtifact,itemName:id=>CATALOG.find(x=>x.id===id)?.name||id,busy:(w,now)=>automaticEventsPaused(w,now)||alchemyActive(w)||eventBusyUntil(w,now)>now||socialBusy(w,now)||['registration','running'].includes(w.race?.phase)};
export const engageNow=(w,kind,now=Date.now())=>kind==='quiz'?startQuizNow(w,now,engageCtx):kind==='envelope'?startEnvelopeNow(w,now,engageCtx):fail('Không rõ hoạt động.');
export const startTournament=(w,now=Date.now())=>beginTournament(w,now,socialContext);
export const stopTournament=(w,now=Date.now())=>endTournament(w,now,socialContext);

export function prepareSocial(w){for(const p of Object.values(w.players))socialProfile(w,p);}

export const startRace=(w,now=Date.now())=>beginRace(w,now,socialContext);
export const startWar=(w,now=Date.now())=>beginWar(w,now,socialContext);
export const stopWar=(w,now=Date.now())=>endWar(w,now,socialContext);
// 08/11/2026: Khai Lò Cửu Chuyển — thưởng theo % tu vi cần (nguồn 'reward', không trừ hạn mức ngày).
const alchemyContext={emit,active:currentParticipant,gain:(w,p,qi,stones=0,herbs=0,now=null)=>gain(w,p,qi,stones,herbs,now,false,'reward'),requiredQi:p=>requiredQi(p)/progressionMult(p)};
export const startAlchemy=(w,now=Date.now())=>beginAlchemy(w,now,alchemyContext);
export const stopAlchemy=(w,now=Date.now())=>endAlchemy(w,now);
const mazeContext={emit,active:currentParticipant,gain:(w,p,qi,stones=0,herbs=0,now=null)=>gain(w,p,qi,stones,herbs,now,false,'reward'),requiredQi:p=>requiredQi(p)/progressionMult(p)};
export const startMaze=(w,now=Date.now())=>beginMaze(w,now,mazeContext);
const bonkContext={emit,active:currentParticipant};
const towerContext={emit,active:currentParticipant,gain:(w,p,qi,stones=0,now=null)=>gain(w,p,qi,stones,0,now,false,'reward'),requiredQi:p=>requiredQi(p)/progressionMult(p)};
export const startTower=(w,now=Date.now())=>beginTower(w,now,towerContext);
export const stopTower=(w,now=Date.now())=>endTower(w,now,towerContext);
export const startBonk=(w,now=Date.now())=>beginBonk(w,now,bonkContext);
export const stopBonk=(w,now=Date.now())=>endBonk(w,now,bonkContext);
export const stopMaze=(w,now=Date.now())=>endMaze(w,now);
export const teasePair=(w,a,b,now=Date.now())=>beginTease(w,a,b,now,{emit});
export const stopRace=(w,now=Date.now())=>endRace(w,now,socialContext);

export const startBondFestival=(w,now=Date.now())=>beginBondFestival(w,now,socialContext);
export const stopBondFestival=(w,now=Date.now())=>endBondFestival(w,now,socialContext);

export function migrateDivineWardrobe(w){if(w.divineWardrobeVersion===1)return 0;const manual=new Set((w.adminLog||[]).filter(r=>r.changes?.some(s=>s.startsWith('mặc '))).map(r=>r.id));let n=0;for(const p of Object.values(w.players)){if(['azure-patron','crimson-phoenix','ivory-celestial'].includes(p.skinChoice)&&!manual.has(p.id)&&!['manual','admin'].includes(p.skinChoiceSource)){p.skinChoiceSource='gift';n++;}}w.divineWardrobeVersion=1;return n;}

export function migrateSectMasters(w,now=Date.now()){return resetHistoricMasters(w);} // 07/11: không còn mở Tông chủ theo lịch sử
