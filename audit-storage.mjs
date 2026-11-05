import fs from 'node:fs';
import path from 'node:path';
const day=at=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(at);
export function createAuditStorage(dataDir){
 const dir=path.join(dataDir,'audit');fs.mkdirSync(dir,{recursive:true});
 const file=(mode,date)=>path.join(dir,`gifts-${mode==='live'?'live':'demo'}-${date}.jsonl`);
 return {
  flush(w,mode){const rows=w.auditOutbox||[];if(!rows.length)return;
   const groups=new Map();for(const r of rows){const d=day(r.at);groups.set(d,(groups.get(d)||'')+JSON.stringify(r)+'\n');}
   for(const [date,text]of groups)fs.appendFileSync(file(mode,date),text);
   rows.splice(0,rows.length);
  },
  file(mode,date){if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return null;return file(mode,date);},
  today:()=>day(Date.now())
 };
}
