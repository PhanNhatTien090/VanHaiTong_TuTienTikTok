// Xóa hồ sơ LIVE không vào quá N ngày (mặc định 7) và CHƯA TỪNG tặng quà. Chỉ chạy khi server đã tắt.
// Giữ: tu sĩ thường trú/giả, nhân vật chỉ có trên web, đang bàn giao web, Tông chủ/Hộ pháp hiện tại, có đạo lữ.
// Sao lưu toàn bộ file + danh sách người bị xóa vào data/backups/prune-inactive-<stamp>/ để khôi phục.
// Dùng: node scripts/prune-inactive.mjs <data/live.json> [days=7] [--dry]
import fs from 'node:fs';
import path from 'node:path';

const [file='data/live.json',daysArg='7',...flags]=process.argv.slice(2);
const days=Number(daysArg),dry=flags.includes('--dry'),now=Date.now(),cutoff=now-days*86400000;
if(!(days>=1))throw new Error('days must be >= 1');
const raw=fs.readFileSync(file,'utf8'),w=JSON.parse(raw);
if(w.mode&&w.mode!=='live')throw new Error('Not a LIVE world file: '+w.mode);
const bonded=new Set(Object.values(w.social?.bonds||{}).flatMap(b=>[b.a,b.b]));
const transfer=new Set(Object.keys(w.playTransfers||{}));
const protectedIds=new Set([w.patronCurrent,w.sectMaster?.current,w.sectMaster?.id].filter(Boolean));
const victims=Object.values(w.players).filter(p=>!p.resident&&!p.puppet&&!p.webOnly
  &&Number(p.lastActive)>0&&p.lastActive<cutoff
  &&!(Number(p.giftCoins)>0)&&!(p.giftHistory||[]).length
  &&!transfer.has(p.id)&&!bonded.has(p.id)&&!protectedIds.has(p.id)&&!p.bondId&&!(p.bondIds||[]).length);
const before=Object.keys(w.players).length;
const report={at:now,days,file,before,removed:victims.length,after:before-victims.length,
  maxRealm:Math.max(0,...victims.map(p=>p.realm||0)),ids:victims.map(p=>({id:p.id,name:p.name,realm:p.realm,lastActive:p.lastActive}))};
if(dry){console.log(JSON.stringify({...report,ids:undefined}));process.exit(0);}
const stamp=new Date(now).toISOString().replace(/[-:]/g,'').slice(0,15);
const dir=path.join(path.dirname(file),'backups',`prune-inactive-${stamp}`);
fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(path.join(dir,path.basename(file)),raw);
fs.writeFileSync(path.join(dir,'removed-players.json'),JSON.stringify(Object.fromEntries(victims.map(p=>[p.id,p]))));
fs.writeFileSync(path.join(dir,'report.json'),JSON.stringify(report,null,1));
for(const p of victims)delete w.players[p.id];
const tmp=file+'.prune.tmp';fs.writeFileSync(tmp,JSON.stringify(w));fs.renameSync(tmp,file);
console.log(JSON.stringify({...report,ids:undefined,backup:dir}));
