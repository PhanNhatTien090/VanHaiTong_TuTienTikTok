import fs from 'node:fs';import path from 'node:path';
// Nhật ký lỗi bản web: JSONL trong <dataDir>/logs, xoay vòng 5 MB, gộp lỗi trùng để không bị tràn.
// Không ghi mật khẩu, body, cookie hay IP; chỉ ghi nơi xảy ra lỗi và nội dung lỗi.
const MAX_BYTES=5*1024*1024,clip=(v,n)=>String(v??'').slice(0,n);
export function createErrorLog(dataDir,{file='web-errors.jsonl',now=()=>Date.now()}={}){
  const dir=path.join(dataDir,'logs'),dest=path.join(dir,file);
  try{fs.mkdirSync(dir,{recursive:true,mode:0o700});}catch{}
  const seen=new Map(); // chữ ký lỗi → {at,n}: cùng một lỗi trong 60 giây chỉ ghi 1 lần, lần sau ghi kèm số lần lặp
  function write(entry){
    try{
      if(fs.existsSync(dest)&&fs.statSync(dest).size>MAX_BYTES)fs.renameSync(dest,dest+'.previous');
      fs.appendFileSync(dest,JSON.stringify(entry)+'\n',{mode:0o600});
    }catch{}
  }
  function record(kind,data={}){
    const t=now(),entry={at:new Date(t).toISOString(),kind,pid:process.pid};
    for(const [k,v] of Object.entries(data))if(v!==undefined&&v!==null&&v!=='')entry[k]=typeof v==='string'?clip(v,k==='stack'?2000:400):v;
    const sig=kind+'|'+(entry.route||entry.page||'')+'|'+(entry.message||'');
    const prev=seen.get(sig);
    if(prev&&t-prev.at<60000){prev.n++;return false;}
    if(prev?.n)entry.repeated=prev.n;
    seen.set(sig,{at:t,n:0});if(seen.size>500)seen.delete(seen.keys().next().value);
    write(entry);return true;
  }
  function installProcessHooks(name){
    record('start',{name,node:process.version});
    process.on('uncaughtExceptionMonitor',(err,origin)=>record('fatal',{name,origin,message:err?.message||String(err),stack:err?.stack}));
    process.on('unhandledRejection',err=>record('unhandled-rejection',{name,message:err?.message||String(err),stack:err?.stack}));
    process.on('warning',w=>record('warning',{name,message:w.message}));
    process.on('exit',code=>record('exit',{name,code,uptimeSeconds:Math.round(process.uptime()),rssMb:Math.round(process.memoryUsage().rss/1048576)}));
  }
  return {record,installProcessHooks,file:dest};
}
