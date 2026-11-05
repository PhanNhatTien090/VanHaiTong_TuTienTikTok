// Read-only scan of existing backups. Writes a separate import file, never live.json.
import fs from 'node:fs';
import path from 'node:path';
import {VISITOR_GIFT_REWARDS} from '../public/visitor-rewards.js';
const dir=path.resolve('data'),files=[];
for(const folder of [dir,path.join(dir,'backups')])for(const name of fs.readdirSync(folder))if(/^live.*\.json$/.test(name))files.push(path.join(folder,name));
const live=await(await fetch('http://127.0.0.1:4317/api/export?world=live')).json(),events=new Map();
function collect(w,source){const e=w.visitor;if(!e?.id||!VISITOR_GIFT_REWARDS[e.kind])return;
 let row=events.get(e.id);if(!row){row={id:e.id,kind:e.kind,startedAt:e.startedAt,endsAt:e.endsAt,closedAt:e.closedAt,giftProgress:{},provenance:'backup',sources:[]};events.set(e.id,row);}
 if(!row.sources.includes(source))row.sources.push(source);
 for(const [id,g]of Object.entries(e.giftProgress||{}))if(Number.isSafeInteger(g.coins)&&g.coins>(row.giftProgress[id]?.coins||0))row.giftProgress[id]={...g};
 // Only reconstruct receipts with stable IDs inside this exact event interval.
 for(const p of Object.values(w.players||{})){
  if(p.resident||p.puppet)continue;
  const receipts=new Map((p.giftHistory||[]).filter(g=>g.id&&g.at>=e.startedAt&&g.at<e.endsAt&&!g.simulated).map(g=>[g.id,g]));
  const coins=[...receipts.values()].reduce((n,g)=>n+g.coins*g.count,0);
  if(Number.isSafeInteger(coins)&&coins>(row.giftProgress[p.id]?.coins||0))row.giftProgress[p.id]={coins,skinAwarded:false,artifactAwarded:false,receiptReconstruction:true};
 }
}
for(const file of files){try{collect(JSON.parse(fs.readFileSync(file,'utf8')),path.relative(dir,file));}catch(e){console.error('Skipped backup:',path.basename(file),e.message);}}
collect(live,'live-export');
const recovered=[...events.values()].sort((a,b)=>a.startedAt-b.startedAt).slice(-100),missing=[];
for(const e of recovered)for(const [id,g]of Object.entries(e.giftProgress)){
 const p=live.players[id],r=VISITOR_GIFT_REWARDS[e.kind];if(!p||p.resident||p.puppet)continue;
 if(g.coins>=r.skinCoins&&!p.rewardSkins?.includes(r.skin)||g.coins>=r.artifactCoins&&!p.artifacts?.includes(r.artifact))missing.push({event:e.id,kind:e.kind,id,name:p.name,coins:g.coins,skinMissing:g.coins>=r.skinCoins&&!p.rewardSkins?.includes(r.skin),artifactMissing:g.coins>=r.artifactCoins&&!p.artifacts?.includes(r.artifact)});
}
fs.writeFileSync(path.join(dir,'visitor-history-recovery.json'),JSON.stringify({createdAt:Date.now(),events:recovered}));
fs.writeFileSync('output/visitor-recovery-report.json',JSON.stringify({scanned:files.length,events:recovered.length,missing},null,2));
console.log(JSON.stringify({scanned:files.length,events:recovered.length,missing}));
