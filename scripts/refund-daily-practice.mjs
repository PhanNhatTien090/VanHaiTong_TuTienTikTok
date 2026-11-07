// 07/11/2026: trả lại điểm hạn mức tu luyện ngày cho một người chơi trong file xuất (dùng lúc restart, server đã tắt).
// node scripts/refund-daily-practice.mjs <file.json> <playerId> <points>
import fs from 'node:fs';
import {practiceDay} from '../daily-practice.mjs';
const [file,id,pts]=process.argv.slice(2);const w=JSON.parse(fs.readFileSync(file,'utf8'));const p=w.players?.[id];
if(!p)throw new Error('player not found');const day=practiceDay(Date.now());
const before=p.dailyPractice?.day===day?p.dailyPractice.used:0,after=Math.max(0,before-Math.round(Number(pts)*100));
p.dailyPractice={day,used:after};fs.writeFileSync(file,JSON.stringify(w));
console.log(`${p.name}: dailyPractice ${before/100} -> ${after/100} (${day})`);
