// Synthetic server stress, reproducible on GitHub Actions. Not a substitute for real LIVE Studio FPS.
import {performance} from 'node:perf_hooks';
import {mkdir,writeFile} from 'node:fs/promises';
import {createWorld,ensurePlayer,action,tick,snapshot} from '../engine.mjs';
import {live2Command} from '../live2-systems.mjs';
const base=1_800_000_000_000;
const densities=[20,50,80],ticks=500;
const quantile=(a,q)=>a[Math.min(a.length-1,Math.floor(q*(a.length-1)))]||0;
function bench(count,enabled){
 const w=createWorld('live');
 Object.assign(w.settings,{live2Enabled:enabled,live2BossTrialsEnabled:false,live2GuildWarEnabled:false,residents:false,autoEvents:false,bossInterval:9999999});
 w.nextBossAt=base+1e12;
 const players=[];
 for(let i=0;i<count;i++){
  const p=ensurePlayer(w,'load-'+i,'Đạo Hữu '+i,base);
  p.realm=3;p.stones=100;p.herbs=15;p.lastActive=base;
  players.push(p);
 }
 const emit=()=>{};
 if(enabled)for(const p of players)live2Command(w,p,['chon','dao','kiem'],base,{emit});
 const timings=[],start=performance.now(),heap=process.memoryUsage().heapUsed;
 for(let n=0;n<ticks;n++){
  const t=base+n*31000,p=players[n%count],m=performance.now();
  if(n%4===0)action(w,{type:'chat',userId:p.id,name:p.name,text:'đạo ngộ'},t);
  else action(w,{type:'gather',userId:p.id,name:p.name},t);
  if(n%50===0){tick(w,t);snapshot(w,t,{select:()=>new Set(players.slice(0,Math.min(16,count)).map(x=>x.id))});}
  timings.push(performance.now()-m);
 }
 timings.sort((a,b)=>a-b);
 return {participants:count,enabled,actions:ticks,elapsedMs:+(performance.now()-start).toFixed(2),
  avgActionMs:+(timings.reduce((s,x)=>s+x,0)/ticks).toFixed(3),p95ActionMs:+quantile(timings,.95).toFixed(3),
  p99ActionMs:+quantile(timings,.99).toFixed(3),heapDeltaMb:+((process.memoryUsage().heapUsed-heap)/1048576).toFixed(2)};
}
const output=[];
for(const n of densities){
 const before=bench(n,false),after=bench(n,true);
 output.push({n,baseline:before,live2:after,ratioP95:+(after.p95ActionMs/Math.max(.001,before.p95ActionMs)).toFixed(2)});
 console.log(n+' simulated participants: p95 action '+before.p95ActionMs+'ms baseline, '+after.p95ActionMs+'ms live2');
}
await mkdir('output/live2-bench',{recursive:true});
await writeFile('output/live2-bench/server-synthetic.json',JSON.stringify({date:new Date().toISOString(),method:'synthetic server CPU only; not graphics FPS',results:output},null,2)+'\n');
