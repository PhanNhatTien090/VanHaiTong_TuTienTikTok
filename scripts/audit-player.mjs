// Kiểm tra một người chơi có tu vi tăng bất thường không (CHỈ ĐỌC, không ghi dữ liệu).
// Chạy trên máy LIVE, tại thư mục dự án:   node scripts/audit-player.mjs Huy
// Tùy chọn: VAN_HAI_DATA_DIR=đường_dẫn_data  (mặc định ./data), --world=demo để xem thế giới thử.
// Đọc: data/live.json (hồ sơ, adminLog, 100 sự kiện gần nhất) + data/audit/gifts-live-*.jsonl (quà thật theo ngày).
import fs from 'node:fs';
import path from 'node:path';
import {requiredQi,REALMS} from '../engine.mjs';
import {ASCENSION_PRACTICE_STEPS} from '../public/ascension-pacing.js';
import {dailyPracticeView} from '../daily-practice.mjs';

const args=process.argv.slice(2),mode=args.includes('--world=demo')?'demo':'live',query=args.filter(a=>!a.startsWith('--')).join(' ').trim();
const dataDir=process.env.VAN_HAI_DATA_DIR||path.join(process.cwd(),'data');
if(!query){console.error('Cách dùng: node scripts/audit-player.mjs <tên hoặc id hoặc mã>');process.exit(1);}
const norm=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase().trim();
const w=JSON.parse(fs.readFileSync(path.join(dataDir,mode+'.json'),'utf8'));
const now=Date.now(),fmt=n=>Math.round(Number(n)||0).toLocaleString('vi-VN'),date=t=>t?new Date(t).toLocaleString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'}):'—';
const players=Object.values(w.players).filter(p=>!p.resident&&!p.puppet);
const q=norm(query),matches=players.filter(p=>p.id===query||norm(p.name).includes(q)||norm(p.socialCode)===q);
if(!matches.length){console.log('Không tìm thấy người chơi khớp "'+query+'".');process.exit(0);}
const ranked=[...players].sort((a,b)=>(b.totalQi||0)-(a.totalQi||0)),rankOf=p=>ranked.indexOf(p)+1;
// Quà thật trong nhật ký kiểm toán theo ngày.
const auditDir=path.join(dataDir,'audit'),giftFiles=fs.existsSync(auditDir)?fs.readdirSync(auditDir).filter(f=>f.startsWith(`gifts-${mode}-`)&&f.endsWith('.jsonl')).sort():[];
function auditRows(id){const rows=[];for(const f of giftFiles){for(const line of fs.readFileSync(path.join(auditDir,f),'utf8').split('\n')){if(!line)continue;try{const r=JSON.parse(line);if(r.user===id)rows.push({...r,file:f});}catch{}}}return rows;}
const perDay=p=>{const days=Math.max(1/24,(now-(Number(p.joinedAt)||now))/86400000);return (Number(p.totalQi)||0)/days;};
// Ước lượng tu vi miễn phí tối đa / ngày ở cảnh giới hiện tại: ngân sách ngày × suất mỗi lượt (chưa tính thưởng sự kiện được miễn trần).
function freeCap(p){const steps=ASCENSION_PRACTICE_STEPS[Math.min(ASCENSION_PRACTICE_STEPS.length-1,p.realm||0)],perPoint=requiredQi(p)/steps,v=dailyPracticeView(w,p,now);return {perPoint,budget:v.limit,qi:v.enabled?perPoint*v.limit:Infinity,used:v.used,enabled:v.enabled};}

for(const p of matches){
 const flags=[],rows=auditRows(p.id),gifts=rows.filter(r=>r.type==='gift'),coinsLogged=gifts.reduce((a,r)=>a+(Number(r.coins)||0),0),simulated=gifts.filter(r=>r.simulated);
 const admin=(w.adminLog||[]).filter(x=>x.id===p.id),recent=(w.events||[]).filter(e=>e.user===p.id),cap=freeCap(p);
 console.log('\n================ '+p.name+'  ('+p.id+')');
 console.log('Cảnh giới: '+REALMS[p.realm]+' ('+p.realm+')   cao nhất từng đạt: '+(p.highestRealm??p.realm)+'   chuyển sinh: '+(p.reincarnations||0));
 console.log('Tu vi hiện có: '+fmt(p.qi)+'   tổng tu vi: '+fmt(p.totalQi)+'   hạng tổng tu vi: '+rankOf(p)+'/'+players.length);
 console.log('Nhập môn: '+date(p.joinedAt)+'   hoạt động cuối: '+date(p.lastActive)+'   tổng tu vi/ngày từ khi nhập môn: '+fmt(perDay(p)));
 console.log('Quà ghi trên hồ sơ (giftCoins): '+fmt(p.giftCoins)+' coin   quà trong nhật ký kiểm toán: '+fmt(coinsLogged)+' coin ('+gifts.length+' lượt, '+giftFiles.length+' ngày có file)');
 console.log('Tương tác: '+fmt(p.interactions)+'   công lực boss: '+fmt(p.contribution)+'   hạ boss top1: '+(p.bossWins||0)+'   Cơ duyên còn: '+fmt(p.opportunityCredit?.balance)+' coin');
 console.log('Ngân sách tu luyện hôm nay: '+(cap.enabled?fmt(cap.used)+'/'+fmt(cap.budget)+' điểm (≈'+fmt(cap.qi)+' tu vi miễn phí tối đa/ngày ở cảnh giới này)':'không áp dụng (cảnh giới < Hóa Thần hoặc tắt)'));
 console.log('Đại cảnh hôm nay: '+JSON.stringify(p.dailyAscension||null)+'   đang choáng thiên lôi: '+(p.stunUntil>now?'có':'không'));
 // Dấu hiệu
 if(admin.length)flags.push('CÓ '+admin.length+' thao tác quản trị trên người này (ban thưởng tay/chỉnh hồ sơ) — xem danh sách bên dưới.');
 if(simulated.length)flags.push(simulated.length+' lượt quà được đánh dấu MÔ PHỎNG (không phải quà TikTok thật).');
 if((Number(p.giftCoins)||0)>coinsLogged*1.05+10&&giftFiles.length)flags.push('giftCoins trên hồ sơ ('+fmt(p.giftCoins)+') lớn hơn tổng quà trong nhật ký ('+fmt(coinsLogged)+') — có thể do chỉnh tay hoặc nhật ký thiếu ngày.');
 if(!(p.giftCoins>0)&&rankOf(p)<=10)flags.push('Không nạp nhưng nằm top '+rankOf(p)+' tổng tu vi.');
 if(cap.enabled&&Number.isFinite(cap.qi)&&perDay(p)>cap.qi*1.5)flags.push('Tổng tu vi trung bình/ngày ('+fmt(perDay(p))+') vượt 1,5× mức tu luyện miễn phí tối đa/ngày ở cảnh giới hiện tại ('+fmt(cap.qi)+'). Nguồn còn lại có thể là: quà, thưởng sự kiện (hồng bao, câu đố, nhiệm vụ, điểm danh — được miễn trần ngày), tu vi tích từ trước khi có trần, hoặc chỉnh tay.');
 if((p.qi||0)>requiredQi(p)*3)flags.push('Tu vi hiện có gấp '+((p.qi||0)/requiredQi(p)).toFixed(1)+' lần mức cần đột phá — tích lũy dồn do giới hạn 1 đại cảnh/ngày.');
 console.log(flags.length?'\nDẤU HIỆU CẦN XEM:\n - '+flags.join('\n - '):'\nKhông thấy dấu hiệu bất thường rõ ràng từ dữ liệu đang có.');
 if(admin.length){console.log('\nThao tác quản trị:');for(const a of admin.slice(-20))console.log(' '+date(a.at)+'  '+(a.changes||[]).join(', '));}
 if(gifts.length){const byDay=new Map();for(const r of gifts){const d=r.file.slice(-16,-6);byDay.set(d,(byDay.get(d)||0)+(Number(r.coins)||0));}console.log('\nQuà theo ngày: '+[...byDay].map(([d,c])=>d+': '+fmt(c)).join(' · '));}
 if(recent.length){console.log('\nSự kiện gần nhất của người này (trong 100 sự kiện cuối của server):');for(const e of recent.slice(-15))console.log(' '+date(e.at)+'  ['+e.effect+'] '+String(e.text||'').slice(0,140));}
}
console.log('\nTop 10 tổng tu vi (để so sánh):');
for(const p of ranked.slice(0,10))console.log(' '+String(rankOf(p)).padStart(2)+'. '+p.name.padEnd(22).slice(0,22)+' '+REALMS[p.realm].padEnd(18)+' tổng '+fmt(p.totalQi).padStart(16)+'  quà '+fmt(p.giftCoins).padStart(8)+' coin  /ngày '+fmt(perDay(p)));
