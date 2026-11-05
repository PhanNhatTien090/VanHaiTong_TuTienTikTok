import fs from 'node:fs';import path from 'node:path';
export function installRuntimeLog(dataDir){
 const dest=path.join(dataDir,'server-lifecycle.jsonl');let reason='process-exit';
 function record(type,extra={}){try{if(fs.existsSync(dest)&&fs.statSync(dest).size>5*1024*1024)fs.renameSync(dest,dest+'.previous');fs.appendFileSync(dest,JSON.stringify({at:new Date().toISOString(),pid:process.pid,type,...extra})+'\n');}catch{}}
 record('start',{node:process.version,watchdogPid:process.env.VAN_HAI_WATCHDOG_PID||null});
 process.on('uncaughtExceptionMonitor',(err,origin)=>record('fatal',{origin,message:err.stack||String(err)}));
 process.on('exit',code=>record('exit',{code,reason,uptimeSeconds:Math.round(process.uptime()),memory:process.memoryUsage()}));
 return {record,reason(value){reason=value;record('shutdown-request',{reason});}};
}
