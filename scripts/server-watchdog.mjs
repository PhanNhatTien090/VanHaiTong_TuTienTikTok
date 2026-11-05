import fs from 'node:fs';import path from 'node:path';import {spawn} from 'node:child_process';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),data=path.resolve(process.env.VAN_HAI_DATA_DIR||path.join(root,'data'));
const port=Number(process.env.PORT||4317),base=`http://127.0.0.1:${port}`,interval=Math.max(500,Number(process.env.VAN_HAI_WATCH_INTERVAL)||3000),retryBase=Math.max(250,Number(process.env.VAN_HAI_WATCH_RETRY)||2000);
fs.mkdirSync(data,{recursive:true});const lock=path.join(data,'watchdog.lock'),logFile=path.join(data,'watchdog.jsonl'),statusFile=path.join(data,'watchdog-status.json'),pauseFile=path.join(data,'watchdog.pause');
const alive=pid=>{try{process.kill(Number(pid),0);return true;}catch{return false;}};
function log(type,extra={}){try{if(fs.existsSync(logFile)&&fs.statSync(logFile).size>5*1024*1024)fs.renameSync(logFile,logFile+'.previous');fs.appendFileSync(logFile,JSON.stringify({at:new Date().toISOString(),pid:process.pid,type,...extra})+'\n');}catch{}}
try{const fd=fs.openSync(lock,'wx');fs.writeFileSync(fd,JSON.stringify({pid:process.pid}));fs.closeSync(fd);}catch{let old;try{old=JSON.parse(fs.readFileSync(lock,'utf8'));}catch{}if(old&&alive(old.pid)){console.log('Watchdog already running: '+old.pid);process.exit(0);}fs.rmSync(lock,{force:true});const fd=fs.openSync(lock,'wx');fs.writeFileSync(fd,JSON.stringify({pid:process.pid}));fs.closeSync(fd);}
let child=null,attachedPid=Number(process.argv[2])||null,stopping=false,checking=false,attempts=0,nextStart=0,restarts=0,lastState='starting',startedAt=Date.now();
function status(state,more={}){lastState=state;try{const tmp=statusFile+'.tmp';fs.writeFileSync(tmp,JSON.stringify({watchdogPid:process.pid,serverPid:child?.pid||attachedPid,state,restarts,at:new Date().toISOString(),...more}));fs.renameSync(tmp,statusFile);}catch{}}
async function healthy(){try{const r=await fetch(base+'/api/state?world=live',{signal:AbortSignal.timeout(2500)});if(!r.ok)return false;const s=await r.json();return !!s.players&&typeof s.sectQi==='number';}catch{return false;}}
function output(stream,name){const file=path.join(data,name);stream.on('data',chunk=>{try{if(fs.existsSync(file)&&fs.statSync(file).size>10*1024*1024)fs.renameSync(file,file+'.previous');fs.appendFileSync(file,chunk);}catch{}});}
function start(){
 const env={...process.env,PORT:String(port),VAN_HAI_TTS:process.env.VAN_HAI_TTS||'vieneu',VAN_HAI_TTS_THREADS:process.env.VAN_HAI_TTS_THREADS||'2',VAN_HAI_WATCHDOG_PID:String(process.pid)};
 // Completed recovery buffers must not be inherited by every restart.
 delete env.VAN_HAI_RECOVERY_FILE;
 child=spawn(process.execPath,[path.join(root,'server.mjs')],{cwd:root,windowsHide:true,env,stdio:['ignore','pipe','pipe']});const owned=child;startedAt=Date.now();restarts++;log('spawn',{serverPid:owned.pid,restarts});status('starting');output(child.stdout,'watchdog-server.log');output(child.stderr,'watchdog-server-error.log');
 owned.on('error',err=>log('spawn-error',{message:err.message}));
 owned.on('exit',(code,signal)=>{log('server-exit',{serverPid:owned.pid,code,signal,uptimeMs:Date.now()-startedAt});if(child===owned)child=null;attachedPid=null;attempts++;nextStart=Date.now()+Math.min(60000,retryBase*2**Math.min(5,attempts-1));status('waiting-restart',{lastExitCode:code,lastSignal:signal,nextStart});});
}
async function check(){if(stopping||checking)return;checking=true;try{
 if(fs.existsSync(pauseFile)){status('paused');return;}
 const adoption=path.join(data,'watchdog-adopt.json');if(fs.existsSync(adoption)){try{const request=JSON.parse(fs.readFileSync(adoption,'utf8'));if(!child&&request.pid&&alive(request.pid)){attachedPid=Number(request.pid);log('attach',{serverPid:attachedPid});}fs.unlinkSync(adoption);}catch{}}
 if(attachedPid&&!alive(attachedPid)){log('attached-server-stopped',{serverPid:attachedPid,code:null,reason:'Exit code unavailable for a server started before watchdog attachment.'});attachedPid=null;}
 if(await healthy()){if(lastState!=='healthy')log('healthy',{serverPid:child?.pid||attachedPid});status('healthy');if(Date.now()-startedAt>60000)attempts=0;return;}
 if(child||attachedPid){status('unresponsive',{note:'Existing process retained; no forced termination.'});return;}
 if(Date.now()<nextStart){status('waiting-restart',{nextStart});return;}
 start();
}finally{checking=false;}}
function stop(signal){stopping=true;log('watchdog-stop',{signal,serverLeftRunning:!!(child||attachedPid)});status('stopped');clearInterval(timer);try{const owner=JSON.parse(fs.readFileSync(lock,'utf8'));if(owner.pid===process.pid)fs.unlinkSync(lock);}catch{}child?.unref();process.exit(0);}
log('watchdog-start',{attachedPid,port});status('starting');const timer=setInterval(check,interval);process.on('SIGINT',()=>stop('SIGINT'));process.on('SIGTERM',()=>stop('SIGTERM'));process.on('uncaughtExceptionMonitor',err=>log('watchdog-fatal',{message:err.stack||String(err)}));await check();
