// 19/11/2026 — 3 CHỈ SỐ NGƯỜI MỚI (kế hoạch "Vân Hải Tông Đổi Mới", GĐ2), đo mỗi tuần. Chỉ ĐỌC data/live.json.
// node scripts/chi-so-nguoi-moi.mjs [số ngày=7]
//  1. Gõ lệnh đầu tiên: người mới có ít nhất 1 tương tác thật (bình luận/lệnh).
//  2. Đột phá lần đầu: người mới đã lên cảnh giới ≥1.
//  3. Quay lại sau 1 ngày: còn hoạt động sau hơn 24 giờ kể từ lúc vào (chỉ tính người vào đủ 1 ngày trước).
// Kết quả nối thêm vào data/chi-so-nguoi-moi.jsonl để so tuần này với tuần trước.
import fs from 'node:fs/promises';
const days=Number(process.argv[2]||7),now=Date.now(),from=now-days*864e5,DAY=864e5;
const w=JSON.parse(await fs.readFile('data/live.json','utf8'));
const fresh=Object.values(w.players).filter(p=>!p.resident&&!p.puppet&&!p.webOnly&&Number(p.joinedAt)>=from);
const pct=(a,b)=>b?+(a/b*100).toFixed(1):0;
const typed=fresh.filter(p=>(p.interactions||0)>0||p.lastRealInteractionAt||p.firstStepAt||(p.realm||0)>0).length;
const broke=fresh.filter(p=>(p.realm||0)>=1).length;
const old=fresh.filter(p=>now-p.joinedAt>DAY),back=old.filter(p=>(Number(p.lastActive)||0)-p.joinedAt>DAY).length;
const row={at:new Date(now).toISOString(),days,newPlayers:fresh.length,firstCommandPct:pct(typed,fresh.length),firstBreakthroughPct:pct(broke,fresh.length),returnAfterDayPct:pct(back,old.length),returnBase:old.length};
console.log(`Người mới ${days} ngày: ${row.newPlayers}`);
console.log(`1. Gõ lệnh đầu tiên:     ${row.firstCommandPct}%  (${typed})`);
console.log(`2. Đột phá lần đầu:      ${row.firstBreakthroughPct}%  (${broke})`);
console.log(`3. Quay lại sau 1 ngày:  ${row.returnAfterDayPct}%  (${back}/${old.length})`);
await fs.appendFile('data/chi-so-nguoi-moi.jsonl',JSON.stringify(row)+'\n');
