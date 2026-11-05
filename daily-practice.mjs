// A shared daily budget for ordinary practice, not for gifts or event rewards.
// Integer hundredths keep 1 / 1.4 / .35 action weights exact across saves.
export const DAILY_PRACTICE_LIMIT=900;
const COSTS=Object.freeze({cultivate:100,gather:140,attack:35});
const formatter=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'});
let cachedMinute=null,cachedDay;
export function practiceDay(now){const minute=Math.floor(now/60000);if(minute!==cachedMinute){cachedMinute=minute;const parts=Object.fromEntries(formatter.formatToParts(now).map(p=>[p.type,p.value]));cachedDay=parts.year+'-'+parts.month+'-'+parts.day;}return cachedDay;}
function limitFor(w){const n=w.settings?.dailyPracticeLimit;return n===0?0:Number.isSafeInteger(n)&&n>0?Math.min(n,100000):DAILY_PRACTICE_LIMIT;}
export function dailyPracticeView(w,p,now=Date.now()){
 const limit=limitFor(w),day=practiceDay(now),enabled=w.mode==='live'&&!p.resident&&!p.puppet&&p.realm>=5&&limit>0;
 const raw=p.dailyPractice?.day===day?p.dailyPractice.used:0,used=Number.isSafeInteger(raw)&&raw>=0?Math.min(raw,limit*100):0;
 return {enabled,day,limit,used:used/100,remaining:Math.max(0,limit-used/100),exhausted:enabled&&used>=limit*100,resetsAt:Date.parse(day+'T00:00:00+07:00')+86400000};
}
export function creditDailyPractice(w,p,amount,kind,now=Date.now()){
 const cost=COSTS[kind],view=dailyPracticeView(w,p,now);
 if(!view.enabled||!cost||amount<=0)return {amount,limited:false,justExhausted:false};
 const used=Math.round(view.used*100),allow=Math.min(cost,Math.max(0,view.limit*100-used));
 p.dailyPractice={day:view.day,used:used+allow};
 return {amount:Math.floor(amount*allow/cost),limited:allow<cost,justExhausted:used<view.limit*100&&used+allow>=view.limit*100};
}
