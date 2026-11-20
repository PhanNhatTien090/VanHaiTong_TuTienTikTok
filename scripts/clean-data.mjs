// 20/11/2026 — DỌN data/ (docs/CAI-TIEN-2026-11-20.md mục 8). Mặc định CHỈ LIỆT KÊ; thêm --apply mới xóa.
//   node scripts/clean-data.mjs            → xem sẽ xóa gì, giải phóng bao nhiêu
//   node scripts/clean-data.mjs --apply    → xóa thật
// Gốc phình: server.mjs backupLive() có regex giữ 48 bản viết sai (thiếu "\") nên chưa từng xóa → 841 bản ~10 MB;
// mỗi lần restart các script tạo *-pre-*.json + log + gift-handover và không ai dọn.
// KHÔNG BAO GIỜ đụng: live.json, demo.json, web/, audit/, speech/, cấu hình, bản sao lưu dọn hồ sơ (backups/prune-*).
// Quy tắc giữ (đổi được ở đây):
const KEEP_RECENT_BACKUPS=48;      // backups/live-YYYYMMDD-HHMM.json: 48 bản mới nhất (~24 giờ, 30 phút/bản)
const KEEP_DAILY_DAYS=14;          // + bản cuối mỗi ngày trong 14 ngày gần nhất
const KEEP_PRE_COPIES=5;           // data/live-pre-*.json, demo-pre-*.json…: 5 bản mới nhất mỗi loại (live/demo)
const LOG_DAYS=14;                 // log + gift-handover cũ hơn 14 ngày thì xóa; log rỗng (≤64 byte) xóa luôn
const CODE_COPY_DAYS=7;            // bản sao file code (*.js.bak…) cũ hơn 7 ngày — git đã giữ lịch sử
import fs from 'node:fs';
import path from 'node:path';

const apply=process.argv.includes('--apply'),root=path.resolve(process.argv.find(a=>a.startsWith('--data='))?.slice(7)||'data'),now=Date.now(),DAY=864e5;
const backups=path.join(root,'backups');
const stat=p=>fs.statSync(p),age=p=>now-stat(p).mtimeMs;
const size=p=>{const s=stat(p);if(!s.isDirectory())return s.size;return fs.readdirSync(p).reduce((n,f)=>n+size(path.join(p,f)),0);};
const plan=[];const add=(p,why)=>{try{plan.push({p,why,bytes:size(p)});}catch{}}; // file biến mất giữa chừng (server đang ghi) thì bỏ qua
const PROTECT=new Set(['live.json','demo.json','web','audit','speech','backups','source-visual.json','bridge.json','watchdog-status.json','web-cloud-agent.json','web-enabled','visitor-history-recovery.json']);

// 1) backups/live-*.json: 48 mới nhất + bản cuối mỗi ngày trong 14 ngày
if(fs.existsSync(backups)){
 const snaps=fs.readdirSync(backups).filter(f=>/^live-\d{8}-\d{4}\.json$/.test(f)).sort();
 const keep=new Set(snaps.slice(-KEEP_RECENT_BACKUPS)),byDay=new Map();
 for(const f of snaps)byDay.set(f.slice(5,13),f);
 const cutDay=new Date(now-KEEP_DAILY_DAYS*DAY).toISOString().slice(0,10).replace(/-/g,'');
 for(const [day,f] of byDay)if(day>=cutDay)keep.add(f);
 for(const f of snaps)if(!keep.has(f))add(path.join(backups,f),'bản sao 30 phút cũ');
 // bản sao file code + thư mục sao lưu cũ (trừ prune-* = khôi phục hồ sơ đã xóa)
 for(const f of fs.readdirSync(backups)){if(/^live-\d{8}-\d{4}\.json$/.test(f)||f.startsWith('prune-'))continue;const p=path.join(backups,f);
  if(stat(p).isDirectory()?age(p)>LOG_DAYS*DAY:age(p)>CODE_COPY_DAYS*DAY)add(p,stat(p).isDirectory()?'thư mục sao lưu cũ':'bản sao file code cũ');}
}
// 2) data/ gốc
const pre={};
for(const f of fs.readdirSync(root)){
 if(PROTECT.has(f)||f.startsWith('live.json')||f.startsWith('demo.json')||f.endsWith('.tmp'))continue; // file tạm server đang ghi
 const p=path.join(root,f);let st;try{st=stat(p);}catch{continue;}if(st.isDirectory())continue;
 const m=/^(live|demo)-(pre|before)-.*\.json$/.exec(f);
 if(m){(pre[m[1]]??=[]).push(p);continue;}
 if(/\.log$/.test(f)){if(stat(p).size<=64||age(p)>LOG_DAYS*DAY)add(p,stat(p).size<=64?'log rỗng':'log cũ');continue;}
 if(/^gift-handover-.*\.json$/.test(f)){if(age(p)>LOG_DAYS*DAY)add(p,'gift-handover cũ (đã phát lại khi restart)');continue;}
 if(/\.(js|css|mjs|html)\.(bak|pre|before)/.test(f)||/\.bak-/.test(f)){if(age(p)>CODE_COPY_DAYS*DAY)add(p,'bản sao file code cũ');continue;}
}
for(const list of Object.values(pre)){list.sort((a,b)=>stat(a).mtimeMs-stat(b).mtimeMs);for(const p of list.slice(0,Math.max(0,list.length-KEEP_PRE_COPIES)))add(p,'bản sao trước restart cũ');}

const total=plan.reduce((n,x)=>n+x.bytes,0),by={};for(const x of plan){(by[x.why]??={n:0,b:0});by[x.why].n++;by[x.why].b+=x.bytes;}
console.log((apply?'XÓA':'SẼ XÓA (chạy thử)')+': '+plan.length+' mục, '+(total/1048576).toFixed(0)+' MB');
for(const [k,v] of Object.entries(by))console.log('  '+k+': '+v.n+' mục, '+(v.b/1048576).toFixed(0)+' MB');
if(apply){let fail=0;for(const x of plan){try{fs.rmSync(x.p,{recursive:true,force:true});}catch(e){fail++;console.error('  lỗi',x.p,e.message);}}console.log('Xong'+(fail?', lỗi '+fail:'')+'.');}
else console.log('Chạy lại với --apply để xóa.');
