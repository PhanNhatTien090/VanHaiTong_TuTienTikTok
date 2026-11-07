import {MAX_REALM} from './public/progression.js';
// One shared daily budget for ALL free qi. Paid gifts, explicit admin edits and engagement rewards ('reward') are exempt.
// Integer hundredths keep 1 / 1.4 / .35 action weights exact across saves.
export const DAILY_PRACTICE_LIMIT=900;
export const DAILY_PRACTICE_SOFT_RATE=.1;
export const DAILY_PRACTICE_REALM_BONUS=75;
const COSTS=Object.freeze({cultivate:100,gather:140,attack:35});
const formatter=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'});
let cachedMinute=null,cachedDay;
export function practiceDay(now){const minute=Math.floor(now/60000);if(minute!==cachedMinute){cachedMinute=minute;const parts=Object.fromEntries(formatter.formatToParts(now).map(p=>[p.type,p.value]));cachedDay=parts.year+'-'+parts.month+'-'+parts.day;}return cachedDay;}
function limitFor(w,p){const n=w.settings?.dailyPracticeLimit;if(n===0)return 0;const base=Number.isSafeInteger(n)&&n>0?Math.min(n,100000):DAILY_PRACTICE_LIMIT,configured=w.settings?.dailyPracticeRealmBonus,step=Number.isSafeInteger(configured)&&configured>=0?Math.min(configured,10000):DAILY_PRACTICE_REALM_BONUS,realm=Math.max(5,Math.min(MAX_REALM,Math.trunc(Number(p.realm)||0)));return base+(realm-5)*step;}
export function dailyPracticeView(w,p,now=Date.now()){
 const limit=limitFor(w,p),day=practiceDay(now),enabled=w.mode==='live'&&!p.resident&&!p.puppet&&p.realm>=5&&limit>0;
 const raw=p.dailyPractice?.day===day?p.dailyPractice.used:0,used=Number.isSafeInteger(raw)&&raw>=0?Math.min(raw,limit*100):0;
 return {enabled,day,limit,used:used/100,remaining:Math.max(0,limit-used/100),exhausted:enabled&&used>=limit*100,softRate:DAILY_PRACTICE_SOFT_RATE,resetsAt:Date.parse(day+'T00:00:00+07:00')+86400000};
}
export function creditDailyPractice(w,p,amount,kind,now=Date.now(),qiPerPoint=null){
 const view=dailyPracticeView(w,p,now);
 if(!view.enabled||['gift','admin','reward'].includes(kind)||amount<=0)return {amount,limited:false,justExhausted:false};
 const cost=Number.isFinite(qiPerPoint)&&qiPerPoint>0?Math.max(COSTS[kind]||1,Math.ceil(amount/qiPerPoint*100)):(COSTS[kind]||100);
 const used=Math.round(view.used*100),allow=Math.min(cost,Math.max(0,view.limit*100-used));
 p.dailyPractice={day:view.day,used:used+allow};
 return {amount:Math.floor(amount*(allow/cost+(1-allow/cost)*DAILY_PRACTICE_SOFT_RATE)),limited:allow<cost,justExhausted:used<view.limit*100&&used+allow>=view.limit*100};
}

// 07/11/2026: giới hạn 1 đại cảnh/ngày chỉ từ Chân Tiên (realm ≥ 8). Hóa Thần/Luyện Hư/Đại Thừa chỉ cần 70–90 lượt nên
// cổng ngày chặn người đủ tu vi ("đủ tu vi mà không hiện đột phá").
export const DAILY_ASCENSION_FROM_REALM=8;
// High-realm ascensions share a calendar-day ledger across normal play, blessings,
// opportunities, reconnects and rebirth. Early onboarding through Hoa Than stays fast.
export function dailyAscensionView(w,p,now=Date.now()){
 const day=practiceDay(now),enabled=w.mode==='live'&&!p.resident&&!p.puppet&&p.realm>=DAILY_ASCENSION_FROM_REALM&&w.settings?.dailyRealmLimit!==0;
 const limit=Number.isSafeInteger(w.settings?.dailyRealmLimit)&&w.settings.dailyRealmLimit>0?Math.min(10,w.settings.dailyRealmLimit):1;
 const used=p.dailyAscension?.day===day&&Number.isSafeInteger(p.dailyAscension.used)?Math.max(0,p.dailyAscension.used):0;
 return {enabled,day,limit,used,remaining:Math.max(0,limit-used),exhausted:enabled&&used>=limit,resetsAt:Date.parse(day+'T00:00:00+07:00')+86400000};
}
export function recordDailyAscension(w,p,now=Date.now()){
 const v=dailyAscensionView(w,p,now);if(v.enabled)p.dailyAscension={day:v.day,used:v.used+1};
}
