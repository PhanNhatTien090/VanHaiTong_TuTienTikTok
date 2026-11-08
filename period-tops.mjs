import {practiceDay} from './daily-practice.mjs';
// 07/11: Bảng xếp hạng theo ngày / theo tuần (giờ Việt Nam, tuần bắt đầu thứ Hai).
// Mỗi kỳ lưu "mốc" bộ đếm tích lũy của từng người ngay trước lần tương tác đầu tiên trong kỳ;
// hạng = bộ đếm hiện tại − mốc. Chỉ lưu người có hoạt động trong kỳ nên file dữ liệu không phình.
export const PERIOD_METRICS=Object.freeze([
 {id:'qi',label:'Tu vi',unit:'tu vi',get:p=>p.totalQi},
 {id:'coins',label:'Quà',unit:'coin',get:p=>p.giftCoins},
 {id:'hearts',label:'Thả tim',unit:'tim',get:p=>p.heartsTotal},
 {id:'quiz',label:'Giải câu đố',unit:'câu',get:p=>p.quizSolved},
 {id:'duel',label:'Tỷ thí',unit:'huy chương',get:p=>p.tournamentMedals},
 {id:'skins',label:'Skin mới',unit:'skin',get:p=>(p.rewardSkins?.length||0)+(p.raceSwordSkins?.length||0)},
]);
const num=v=>Number.isFinite(Number(v))?Number(v):0;
const counters=p=>PERIOD_METRICS.map(m=>num(m.get(p)));
const eligible=p=>p&&!p.resident&&!p.puppet;
export function periodWeek(day){const d=new Date(day+'T00:00:00Z');d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7);return d.toISOString().slice(0,10);}
let weekDay,weekCache;
const weekOf=day=>{if(day!==weekDay){weekDay=day;weekCache=periodWeek(day);}return weekCache;};
const ROLL_WINDOW=36*3600000; // ai hoạt động gần đây được chụp mốc ngay lúc sang kỳ (nhận thưởng sự kiện mà chưa gõ lại)
export function ensurePeriods(w,now=Date.now()){
 const day=practiceDay(now),keys={day,week:weekOf(day)},s=w.periodStats??={};
 for(const kind of ['day','week']){
  const cur=s[kind];if(cur?.key===keys[kind])continue;
  if(cur?.base)s[kind==='day'?'prevDay':'prevWeek']={key:cur.key,startedAt:cur.startedAt,endedAt:now,tops:computeTops(w,cur)};
  const base={};for(const p of Object.values(w.players))if(eligible(p)&&now-(p.lastActive||0)<ROLL_WINDOW)base[p.id]=counters(p);
  s[kind]={key:keys[kind],startedAt:now,base};
 }
 return s;
}
// Gọi trước khi người chơi thay đổi chỉ số (ensurePlayer).
export function capturePeriodBase(w,p,now=Date.now()){
 if(!eligible(p))return;const s=ensurePeriods(w,now);
 for(const kind of ['day','week'])if(!Object.hasOwn(s[kind].base,p.id))s[kind].base[p.id]=counters(p);
}
export function computeTops(w,period,limit=10){
 const rows=[];
 for(const [id,base] of Object.entries(period?.base||{})){const p=w.players[id];if(!eligible(p))continue;const cur=counters(p);rows.push({p,d:cur.map((v,i)=>Math.max(0,v-num(base[i]??v)))});}
 const tops={};
 PERIOD_METRICS.forEach((m,i)=>{tops[m.id]=rows.filter(r=>r.d[i]>0).sort((a,b)=>b.d[i]-a.d[i]).slice(0,limit).map(r=>({id:r.p.id,name:r.p.name,realm:r.p.realm,gender:r.p.gender||null,value:r.d[i]}));});
 return tops;
}
export function periodTopsView(w,now=Date.now(),limit=10){
 const s=ensurePeriods(w,now),meta=PERIOD_METRICS.map(({id,label,unit})=>({id,label,unit}));
 const view=(kind,label)=>{const x=s[kind];if(!x)return null;return {kind,label,key:x.key,startedAt:x.startedAt,endedAt:x.endedAt||null,players:x.base?Object.keys(x.base).length:undefined,tops:x.tops||computeTops(w,x,limit)};};
 return {metrics:meta,serverNow:now,periods:[view('day','Hôm nay'),view('week','Tuần này'),view('prevDay','Hôm qua'),view('prevWeek','Tuần trước')].filter(Boolean)};
}
// Lần đầu cài: dựng lại phần "Quà" của hôm nay và tuần này từ sổ quà (data/audit/gifts-*.jsonl),
// để bảng không trống tới hết tuần. Các chỉ số khác bắt đầu tính từ lúc cài.
export function backfillPeriodCoins(w,records,now=Date.now()){
 if(w.periodStats)return 0;const s=ensurePeriods(w,now),ci=PERIOD_METRICS.findIndex(m=>m.id==='coins');let n=0;
 const start={day:Date.parse(s.day.key+'T00:00:00+07:00'),week:Date.parse(s.week.key+'T00:00:00+07:00')},seen=new Set();
 const sums={day:{},week:{}};
 for(const r of records){if(r?.type!=='gift'||r.simulated||!r.user||!(r.coins>0)||r.at>now||seen.has(r.id))continue;seen.add(r.id);
  for(const kind of ['day','week'])if(r.at>=start[kind])sums[kind][r.user]=(sums[kind][r.user]||0)+r.coins;}
 for(const kind of ['day','week'])for(const [id,coins] of Object.entries(sums[kind])){const p=w.players[id];if(!eligible(p))continue;
  const base=s[kind].base[id]??=counters(p);base[ci]=Math.max(0,num(p.giftCoins)-coins);n++;}
 return n;
}
export function readGiftAudit(fs,path,dataDir,mode,now=Date.now(),days=9){
 const records=[];
 for(let d=0;d<days;d++){const day=new Date(now+7*3600000-d*86400000).toISOString().slice(0,10),file=path.join(dataDir,'audit','gifts-'+mode+'-'+day+'.jsonl');
  if(!fs.existsSync(file))continue;
  for(const line of fs.readFileSync(file,'utf8').split(/\r?\n/))if(line.trim())try{records.push(JSON.parse(line));}catch{}}
 return records;
}
