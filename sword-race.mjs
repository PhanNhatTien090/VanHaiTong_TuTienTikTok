import {RACE_SWORD_SKINS} from './public/race-sword-skins.js';
import {stageConflict} from './stage-lock.mjs';
// Server-authoritative distance; boosts remain valid until the racer crosses the finish.
export const raceActive=w=>['queued','registration','running'].includes(w.race?.phase);
export const raceVisible=(w,now)=>['registration','running'].includes(w.race?.phase)||w.race?.podiumUntil>now;
const occupied=(w,now)=>!!stageConflict(w,now);
const announce=(w,p,text,now,c)=>c.emit(w,p,text,'race',now);
function register(w,now,c){const old=w.race;w.race={id:'race-'+now,phase:'registration',registrationEndsAt:now+45000,entries:(old?.waiting||[]).filter(e=>w.players[e.id]&&c.active(w,w.players[e.id],now)).map(e=>({...e,at:now})),waiting:[],racers:[],repeat:old?.repeat!==false};announce(w,null,'VÂN HẢI PHI KIẾM • gõ bay để vào đường đua trên mây • tuyển 45 giây • '+racePrizeLine(),now,c);}
export function startRace(w,now,c){if(raceActive(w))return {ok:false,message:'Đua phi kiếm đã được mở.'};w.race={...w.race,phase:'queued',repeat:true};if(!occupied(w,now))register(w,now,c);else announce(w,null,'Đua phi kiếm đã xếp lịch • tự mở sau hoạt động hiện tại',now,c);return {ok:true,queued:w.race.phase==='queued'};}
export function stopRace(w,now,c){if(!raceActive(w)&&!w.race?.repeat)return {ok:false,message:'Không có đường đua đang mở.'};w.race.phase='cancelled';w.race.repeat=false;w.race.podiumUntil=0;w.nextBossAt=now+(w.settings?.bossInterval??240)*1000;announce(w,null,'Đường đua đã khép lại • giữ nguyên phần thưởng đã nhận',now,c);return {ok:true};}
export function raceDistance(r,now){return Math.min(1000,Math.max(0,(Math.min(now,r.finishAt||now)-r.startedAt)/1000*r.speed+r.bonus));}
// Unlimited boost counts; the race still ends at 1,000 distance.
export const GIFT_RACE_CAP=Infinity,GIFT_RACE_STEP=30;
// Gifts grant +30 distance per coin, without a per-race gift quota.
export const GIFT_RACE_PER_COIN=30,GIFT_RACE_MAX=Infinity;
export const HEART_RACE_STEP=50,HEART_RACE_CAP=Infinity;
export function raceHearts(w,p,count,now,c){
 const e=w.race,r=e?.racers?.find(r=>r.id===p.id);
 if(e?.phase!=='running'||!r||r.finishAt||now>=e.endsAt||p.resident||p.puppet)return 0;
 settle(r,now);if(r.finishAt)return 0;
 const before=Math.min(HEART_RACE_CAP,Math.floor((r.hearts||0)/HEART_RACE_STEP));r.hearts=(r.hearts||0)+count;
 const after=Math.min(HEART_RACE_CAP,Math.floor(r.hearts/HEART_RACE_STEP)),n=after-before;if(!n)return 0;
 r.heartBoosts=after;r.bonus+=n*18;r.boostUntil=now+4200;r.lastBoostAt=now;settle(r,now);
 c.emit(w,p,`NGỰ PHONG • ${r.hearts} tim • bứt tốc ${after} lần • +${n*18} trượng`,'race',now,{heartRace:true,heartBoost:n});return n;
}
export const giftRaceUnits=v=>v>=1000?6:v>=100?4:v>=10?2:1;
export function raceBoost(w,p,now,units,c,source='free'){if(!Number.isSafeInteger(Number(units))||Number(units)<1)return 0;const r=w.race?.racers?.find(r=>r.id===p.id);if(w.race?.phase!=='running'||!r||r.finishAt||now>=w.race.endsAt)return 0;settle(r,now);if(r.finishAt)return 0;
 if(source==='gift'){const d=Math.min(GIFT_RACE_MAX-(r.giftDist||0),Math.round(Math.max(0,Number(units)||0)*GIFT_RACE_PER_COIN));if(d<=0)return 0;r.giftDist=(r.giftDist||0)+d;r.giftBoosts=Math.round(r.giftDist/GIFT_RACE_STEP);r.bonus+=d;r.boostUntil=now+6000;r.lastBoostAt=now;settle(r,now);return d;}const n=Math.max(0,Math.floor(Number(units)||0));if(!n)return 0;r.boosts+=n;r.bonus+=n*18;r.boostUntil=now+4200;r.lastBoostAt=now;settle(r,now);return n;}
function settle(r,now){if(!r.finishAt&&(now-r.startedAt)/1000*r.speed+r.bonus>=1000)r.finishAt=Math.max(r.lastBoostAt||r.startedAt,r.startedAt+(1000-r.bonus)/r.speed*1000);}
export function raceCommand(w,p,cmd,now,c,rest=''){
 if(cmd==='phikiem'){const skin=RACE_SWORD_SKINS[Number(rest)-1];if(!skin||!p.raceSwordSkins?.includes(skin.id))return {ok:false,message:'Gõ phi kiếm 1 / 2 / 3 / 4 để chọn skin Thương Long / Tinh Hà / Băng Liên / Cửu Thiên đã sở hữu.'};p.raceSwordChoice=skin.id;announce(w,p,'Đã chọn skin phi kiếm '+skin.name,now,c);return {ok:true};}

 if(!['dua','duakiem','bay','baykiem','tangtoc'].includes(cmd)&&!(cmd==='danh'&&w.race?.phase==='running'))return;
 // v65: lệnh chính là "bay" (dua vẫn dùng được). "bay" là từ thường nên ngoài lúc tuyển thì bỏ qua, không báo lỗi.
 if((cmd==='bay'||cmd==='baykiem')&&(w.race?.phase!=='registration'||now>=w.race.registrationEndsAt))return;
 const e=w.race;if(['dua','duakiem','bay','baykiem'].includes(cmd)){if(e?.phase!=='registration'||now>=e.registrationEndsAt)return {ok:false,message:'Chưa mở tuyển đua phi kiếm.'};if(p.resident)return {ok:false,message:'NPC không đăng ký đua.'};if(e.entries.some(x=>x.id===p.id))return {ok:true,duplicate:true};e.entries.push({id:p.id,at:now});p.interactions++;w.totalInteractions++;announce(w,p,'Đã ghi danh phi kiếm • đến lượt sẽ tự xuất phát',now,c);return {ok:true};}
 const r=e?.racers?.find(x=>x.id===p.id);if(e?.phase!=='running'||!r||r.finishAt)return {ok:false,message:'Bứt tốc chỉ dùng khi đang đua.'};if(now-(r.freeBoostAt||0)<10000)return {ok:false,message:'Bứt tốc hồi sau 10 giây.'};const n=raceBoost(w,p,now,1,c);if(!n)return {ok:true,duplicate:true};r.freeBoostAt=now;p.interactions++;w.totalInteractions++;announce(w,p,'Bứt tốc lần '+r.boosts,now,c);return {ok:true};
}
export function tickRace(w,now,c){const e=w.race;if(!e)return;if(e.phase==='queued'){if(!occupied(w,now))register(w,now,c);return;}
 if(e.phase==='registration'&&now>=e.registrationEndsAt){const entries=e.entries.filter(x=>w.players[x.id]&&c.active(w,w.players[x.id],now)).sort((a,b)=>(w.players[a.id].lastRaceAt||0)-(w.players[b.id].lastRaceAt||0)||a.at-b.at);if(entries.length<2){e.waiting=entries;e.phase='finished';e.podiumUntil=now+12000;announce(w,null,e.repeat?'Chờ thêm đạo hữu • lượt tuyển kế tiếp sau 12 giây':'Chưa đủ 2 đạo hữu • hẹn lượt đua tiếp theo',now,c);return;}e.waiting=[];e.racers=entries.map((x,lane)=>{const p=w.players[x.id];p.lastRaceAt=now;return {id:x.id,name:p.name,lane,at:x.at,startedAt:now,speed:11.5,bonus:0,boosts:0};});e.phase='running';e.startedAt=now;e.endsAt=now+90000;announce(w,null,'Phi kiếm xuất phát • mỗi 50 tim +18 trượng • danh / tangtoc hồi 10 giây • quà mỗi coin +30 trượng • không giới hạn lượt bứt tốc trước khi về đích',now,c);}
 if(e.phase==='running'){for(const r of e.racers)settle(r,now);if(e.racers.every(r=>r.finishAt)||now>=e.endsAt){e.results=[...e.racers].sort((a,b)=>(a.finishAt||Infinity)-(b.finishAt||Infinity)||raceDistance(b,now)-raceDistance(a,now)||a.at-b.at);e.phase='finished';e.podiumUntil=now+12000;if(!e.awarded){e.awarded=true;e.results.forEach((r,i)=>{const p=w.players[r.id];if(!p)return;p.raceMedals=(p.raceMedals||0)+(i===0?5:i<3?3:1);if(i===0){p.raceWins=(p.raceWins||0)+1;p.raceTitle='Vân Hải Kiếm Vương';}if(i<5)c.gain(w,p,[150,100,80,60,40][i],20,0,now);});announce(w,w.players[e.results[0].id],'VÂN HẢI KIẾM VƯƠNG • '+e.results[0].name+' về đích đầu tiên • top 5 về đích nhận tu vi • tất cả đấu thủ nhận huy chương',now,c);
  // 08/11: top 3 về đích nhận vật cưỡi vĩnh viễn (hạng 1 thêm kiếm lấp lánh Cửu Thiên). Cần ít nhất 4 đấu thủ để không đua ít người lấy quà.
  if(e.results.length>=RACE_FINISH_MIN)e.results.slice(0,3).forEach((r,i)=>{const p=w.players[r.id],pz=RACE_FINISH_PRIZES[i];if(!p||p.resident||p.puppet||!pz)return;p.raceMounts??=[];const fresh=!p.raceMounts.includes(pz.mount);if(fresh)p.raceMounts.push(pz.mount);let sword='';if(pz.skin){p.raceSwordSkins??=[];if(!p.raceSwordSkins.includes(pz.skin)){p.raceSwordSkins.push(pz.skin);p.raceSwordChoice=pz.skin;}sword=' + '+pz.name;}
   c.emit(w,p,'Về đích hạng '+(i+1)+' • nhận vật cưỡi '+pz.mountName+sword+' vĩnh viễn','race',now,{raceFinishRank:i+1,mountName:pz.mountName,raceMount:pz.mount,raceSwordSkin:pz.skin||null,itemNames:pz.skin?[pz.name]:[]});});}w.nextBossAt=now+(w.settings?.bossInterval??240)*1000;}}
 if(e.phase==='finished'&&e.repeat&&now>=e.podiumUntil&&!occupied(w,now))register(w,now,c);
}
// Gifts during registration/racing: top 3 permanent cosmetics, top 5 cultivation, awarded once after a completed heat.
export const RACE_FINISH_MIN=4;
export const RACE_FINISH_PRIZES=Object.freeze([
 {mount:'lotus',mountName:'Hỏa Liên',skin:'race-cuu-thien',name:'Cửu Thiên Lưu Ly Kiếm'},
 {mount:'gourd',mountName:'Hồ Lô'},
 {mount:'crane',mountName:'Tiên Hạc'}]);
export const RACE_GIFT_PRIZES=Object.freeze([
 {skin:'race-cuu-thien',name:'Cửu Thiên Lưu Ly Kiếm',mount:'fox',mountName:'Cửu Vĩ Hồ',qi:5000,stones:600},
 {skin:'race-moon',name:'Tinh Hà Nguyệt Kiếm',mount:'koi',mountName:'Kim Lý',qi:3000,stones:300},
 {skin:'race-frost',name:'Băng Liên Thần Kiếm',mount:'crane',mountName:'Tiên Hạc',qi:1500,stones:150},
 {qi:800,stones:80},{qi:500,stones:50}]);
export function raceGiftTop(w){const g=w.race?.giftScores||{};return Object.entries(g).filter(([id,n])=>n>0&&w.players[id]&&!w.players[id].resident&&!w.players[id].puppet).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,5).map(([id,coins])=>({id,name:w.players[id].name,coins}));}
// Ghi rõ skin của từng hạng quà; người không vào top 3 bay kiếm mặc định.
export function racePrizeLine(){return 'về đích top 1: Hỏa Liên + kiếm Cửu Thiên · top 2: Hồ Lô · top 3: Tiên Hạc • '+RACE_GIFT_PRIZES.filter(p=>p.skin).map((p,i)=>'top '+(i+1)+' quà: '+(p.mountName?p.mountName+' + ':'')+p.name).join(' · ')+' (vĩnh viễn) • top 5 nhận tu vi';}
export function raceEntryAnnouncement(w){const e=w.race;if(!['registration','running'].includes(e?.phase))return null;return {id:'race-entry:'+e.id+':'+e.phase,at:e.phase==='registration'?e.registrationEndsAt-45000:e.startedAt,name:'Vân Hải Tông',effect:'race',raceEntry:true,file:'/assets/voice-race-'+e.phase+'-v4.mp3',text:e.phase==='registration'?'VÂN HẢI PHI KIẾM • gõ bay để vào đường đua':'Phi kiếm xuất phát • '+racePrizeLine()};}
export function raceView(w,now){const e=w.race;if(!e)return null;return {...e,entryAnnouncement:raceEntryAnnouncement(w),giftTop:raceGiftTop(w),racers:(e.racers||[]).map(r=>({...r,distance:raceDistance(r,now)})),results:(e.results||[]).map(r=>({id:r.id,name:r.name,finishAt:r.finishAt})),active:raceVisible(w,now)};}
// Everyone races; only the camera is capped. Leaders + recent boosters + rotating participants.
export function raceStageIds(w,now){
 const e=w.race;if(!e||!raceVisible(w,now))return [];
 const rows=e.phase==='registration'?e.entries||[]:e.racers||[];
 if(rows.length<=8)return rows.map(r=>r.id);
 const selected=[],add=id=>{if(id&&!selected.includes(id)&&w.players[id]&&selected.length<8)selected.push(id);};
 if(e.phase!=='registration'){
  const ranked=[...rows].sort((a,b)=>(a.finishAt||Infinity)-(b.finishAt||Infinity)||raceDistance(b,now)-raceDistance(a,now)||a.at-b.at);ranked.slice(0,3).forEach(r=>add(r.id));
  [...rows].filter(r=>now-(r.lastBoostAt||0)<6000||now-(r.giftAt||0)<6000).sort((a,b)=>(b.lastBoostAt||b.giftAt||0)-(a.lastBoostAt||a.giftAt||0)).slice(0,3).forEach(r=>add(r.id));
 }
 const start=Math.floor(Math.max(0,now-(e.startedAt||e.registrationEndsAt-45000))/6000)*5%rows.length;
 for(let i=0;i<rows.length&&selected.length<8;i++)add(rows[(start+i)%rows.length].id);
 return selected;
}
