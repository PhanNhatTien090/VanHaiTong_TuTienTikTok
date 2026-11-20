// PHÂN TÍCH NGƯỜI CHƠI — chỉ ĐỌC, không sửa data/.
// node scripts/phan-tich-nguoi-choi.mjs [data/live.json] [data/audit] [số ngày=14]
// In báo cáo tiếng Việt + ghi data/phan-tich-nguoi-choi.json. Không in tên/ID người chơi (chỉ số tổng hợp).
import fs from 'node:fs';import path from 'node:path';
const [,, liveFile='data/live.json', auditDir='data/audit', daysArg='14']=process.argv,days=Number(daysArg)||14;
const now=Date.now(),DAY=864e5,from=now-days*DAY;
const w=JSON.parse(fs.readFileSync(liveFile,'utf8'));
const real=p=>p&&!p.resident&&!p.puppet&&!p.webOnly&&p.actorKind!=='npc';
const players=Object.values(w.players||{}).filter(real);
const pct=(a,b)=>b?Math.round(a/b*1000)/10:0,sum=a=>a.reduce((x,y)=>x+y,0);
const median=a=>{if(!a.length)return 0;const s=[...a].sort((x,y)=>x-y);return s[Math.floor(s.length/2)];};
const hourVN=t=>(new Date(t+7*36e5)).getUTCHours();
const out={days,generatedAt:new Date(now).toISOString()};
const L=[];const P=s=>L.push(s);
// ---- 1. Dân số
const act=ms=>players.filter(p=>now-(p.lastActive||0)<ms);
out.population={total:players.length,active1d:act(DAY).length,active7d:act(7*DAY).length,newInWindow:players.filter(p=>p.joinedAt>=from).length};
P(`# Phân tích người chơi (${days} ngày gần nhất)\n`);
P(`## 1. Dân số\n- Hồ sơ thật: ${out.population.total} · hoạt động 24h: ${out.population.active1d} · 7 ngày: ${out.population.active7d} · mới vào trong kỳ: ${out.population.newInWindow}`);
// ---- 2. Người tặng quà theo bậc
const TIERS=[['1–9',1,9],['10–99',10,99],['100–499',100,499],['500–1999',500,1999],['≥2000',2000,Infinity]];
const payers=players.filter(p=>(p.giftCoins||0)>0),totalCoins=sum(payers.map(p=>p.giftCoins));
out.payers={count:payers.length,pctOfPlayers:pct(payers.length,players.length),totalCoins,tiers:TIERS.map(([n,lo,hi])=>{const g=payers.filter(p=>p.giftCoins>=lo&&p.giftCoins<=hi);return {tier:n,players:g.length,coins:sum(g.map(p=>p.giftCoins)),pctCoins:pct(sum(g.map(p=>p.giftCoins)),totalCoins)};})};
P(`\n## 2. Ai tặng quà (tổng đời)\n- ${payers.length} người từng tặng (${out.payers.pctOfPlayers}% hồ sơ) · tổng ${totalCoins} coin`);
for(const t of out.payers.tiers)P(`  - ${t.tier} coin: ${t.players} người · ${t.pctCoins}% tổng coin`);
// ---- 3. Nhật ký quà (audit)
const rows=[];if(fs.existsSync(auditDir))for(const f of fs.readdirSync(auditDir).filter(f=>/^gifts-live-.*\.jsonl$/.test(f)))for(const line of fs.readFileSync(path.join(auditDir,f),'utf8').split('\n')){if(!line.trim())continue;try{const r=JSON.parse(line);if(r&&r.user&&!r.simulated&&r.at>=from)rows.push(r);}catch{}}
out.audit={rows:rows.length};
if(rows.length){
 const by=(key,val=r=>r.coins)=>{const m=new Map();for(const r of rows){const k=key(r);const e=m.get(k)||{n:0,coins:0,users:new Set()};e.n++;e.coins+=val(r);e.users.add(r.user);m.set(k,e);}return [...m].map(([k,e])=>({k,n:e.n,coins:e.coins,users:e.users.size})).sort((a,b)=>b.coins-a.coins);};
 const topGifts=by(r=>r.gift||'?').slice(0,12),bucket=by(r=>{const c=r.unitCoins||0;return c>=500?'≥500':c>=99?'99–499':c>=30?'30–98':c>=10?'10–29':c>=5?'5–9':'1–4';});
 const perUser=new Map();for(const r of rows){const e=perUser.get(r.user)||{n:0,days:new Set(),first:r.at};e.n++;e.days.add(new Date(r.at+7*36e5).toISOString().slice(0,10));e.first=Math.min(e.first,r.at);perUser.set(r.user,e);}
 const users=[...perUser.values()],repeat=users.filter(u=>u.days.size>=2).length,once=users.filter(u=>u.n===1).length;
 const hours=Array(24).fill(0);for(const r of rows)hours[hourVN(r.at)]+=r.coins;
 const ctx=by(r=>r.reason==='in-event'?('sự kiện '+(r.eventKind||'?')):'ngoài sự kiện khách');
 const first=[];for(const u of perUser.keys()){const p=w.players[u];const e=perUser.get(u);if(p?.joinedAt&&p.joinedAt>=from)first.push((e.first-p.joinedAt)/6e4);}
 out.audit={rows:rows.length,gifters:users.length,repeatGifters:repeat,oneGiftOnly:once,topGifts,byUnitSize:bucket,hoursVN:hours,context:ctx,medianMinutesJoinToFirstGift:Math.round(median(first))};
 P(`\n## 3. Nhật ký quà thật (${rows.length} lượt, ${users.length} người)\n- Tặng đúng 1 lượt rồi thôi: ${pct(once,users.length)}% · tặng từ 2 ngày khác nhau: ${pct(repeat,users.length)}%\n- Người mới tặng quà sau trung vị ${out.audit.medianMinutesJoinToFirstGift} phút kể từ lúc vào (mẫu ${first.length})\n- Món được tặng nhiều coin nhất:`);
 for(const g of topGifts)P(`  - ${g.k}: ${g.coins} coin · ${g.n} lượt · ${g.users} người`);
 P(`- Theo cỡ một lần tặng (coin/lượt):`);for(const b of bucket)P(`  - ${b.k}: ${b.coins} coin · ${b.users} người`);
 P(`- Giờ tặng nhiều nhất (giờ VN): ${hours.map((c,h)=>[h,c]).sort((a,b)=>b[1]-a[1]).slice(0,4).map(([h,c])=>h+'h('+c+')').join(', ')}`);
 P(`- Bối cảnh: ${ctx.map(c=>c.k+' '+c.coins).join(' · ')}`);
}else P(`\n## 3. Nhật ký quà: không có dòng nào trong ${auditDir} (hoặc ngoài kỳ).`);
// ---- 4. Quà theo sự kiện (từ giftHistory, 12 lượt gần nhất mỗi người)
const rule=new Map();for(const p of payers)for(const g of p.giftHistory||[]){if(g.at<from)continue;const k=g.eventRule?String(g.eventRule).slice(0,40):'(không có sự kiện — quà mặc định)';const e=rule.get(k)||{n:0,coins:0};e.n++;e.coins+=(g.coins||0)*(g.count||1);rule.set(k,e);}
out.giftByEventRule=[...rule].map(([k,e])=>({rule:k,...e})).sort((a,b)=>b.coins-a.coins).slice(0,12);
P(`\n## 4. Quà rơi vào sự kiện nào (mẫu 12 quà gần nhất mỗi người)`);for(const r of out.giftByEventRule)P(`  - ${r.rule}: ${r.coins} coin · ${r.n} lượt`);
// ---- 5. Người chơi chay: tham gia gì
const free=act(7*DAY).filter(p=>!(p.giftCoins>0)),paid=act(7*DAY).filter(p=>p.giftCoins>0);
const M=[['gõ lệnh (interactions>0)',p=>(p.interactions||0)>0],['thả tim (≥100)',p=>(p.heartsTotal||0)>=100],['điểm danh liên tiếp ≥3',p=>(p.checkinStreak||0)>=3],['giải câu đố',p=>(p.quizSolved||0)>0],['đánh yêu thú thắng',p=>(p.bossWins||0)>0],['huy chương đua phi kiếm',p=>(p.raceMedals||0)>0],['huy chương tỷ thí/Lôi Đài',p=>(p.tournamentMedals||0)>0],['có skin thưởng',p=>(p.rewardSkins?.length||0)>0],['ở ≥60 phút (activeMs)',p=>(p.activeMs||0)>=36e5],['có đạo lữ/kết duyên',p=>Object.values(w.social?.bonds||{}).some(b=>b?.a===p.id||b?.b===p.id)]];
out.engagement={freeActive7d:free.length,paidActive7d:paid.length,rows:M.map(([n,f])=>({what:n,freePct:pct(free.filter(f).length,free.length),paidPct:pct(paid.filter(f).length,paid.length)}))};
P(`\n## 5. Người chơi chay vs người tặng quà (hoạt động 7 ngày)\n- Chay ${free.length} · có tặng ${paid.length}\n| Việc | Chay % | Tặng % |\n|---|---|---|`);for(const r of out.engagement.rows)P(`| ${r.what} | ${r.freePct} | ${r.paidPct} |`);
// ---- 6. Giữ chân
const cohort=players.filter(p=>p.joinedAt>=from-14*DAY&&now-p.joinedAt>DAY),back=cohort.filter(p=>(p.lastActive||0)-p.joinedAt>DAY),back7=cohort.filter(p=>now-p.joinedAt>7*DAY&&(p.lastActive||0)-p.joinedAt>7*DAY);
out.retention={cohort:cohort.length,backAfter1dPct:pct(back.length,cohort.length),backAfter7dPct:pct(back7.length,cohort.filter(p=>now-p.joinedAt>7*DAY).length)};
P(`\n## 6. Giữ chân\n- Người mới (14 ngày trước kỳ): ${cohort.length} · quay lại sau 1 ngày: ${out.retention.backAfter1dPct}% · sau 7 ngày: ${out.retention.backAfter7dPct}%`);
const byRealm=Array(8).fill(0);for(const p of act(7*DAY))byRealm[Math.min(7,Math.floor((p.realm||0)/4))]++;out.activeByRealmBand=byRealm;
P(`- Người hoạt động 7 ngày theo nhóm cảnh giới (0–3, 4–7, …, 28+): ${byRealm.join(' / ')}`);
P(`\n> Lưu ý: dữ liệu cho biết người ta LÀM gì, không cho biết VÌ SAO. Muốn biết động cơ (khoe, skin, vui…) cần hỏi trực tiếp.`);
console.log(L.join('\n'));
fs.writeFileSync(path.join(path.dirname(liveFile),'phan-tich-nguoi-choi.json'),JSON.stringify(out,null,1));
