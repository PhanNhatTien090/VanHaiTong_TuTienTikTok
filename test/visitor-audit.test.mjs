import {test} from 'node:test';import assert from 'node:assert/strict';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
import {createWorld,ensurePlayer,startVisitor,action,snapshot} from '../engine.mjs';
import {reconcileVisitorPricing} from '../public/visitor-rewards.js';
import {archiveVisitor,repairVisitorHistory,visitorAuditView} from '../visitor-audit.mjs';
import {createAuditStorage} from '../audit-storage.mjs';
const N=1800000000000;
const gift=(w,id,coins,count=1,at=N+10)=>action(w,{type:'gift',userId:id,name:id,coins,count,eventId:'gift-'+id+'-'+at},at);
test('real gift combos count once and the audit distinguishes observed non-gifters, outside gifts and simulated gifts',()=>{
 const w=createWorld();ensurePlayer(w,'watcher','Watcher',N);startVisitor(w,'vuonglam',N);
 gift(w,'donor',40,5);gift(w,'donor',40,5);
 const npc=ensurePlayer(w,'npc','Npc',N);npc.puppet=true;gift(w,'npc',300);
 gift(w,'outside',300,1,N+180000);
 assert.equal(w.visitor.giftProgress.donor.coins,200);assert.equal(w.visitor.giftProgress.npc,undefined);
 const rows=visitorAuditView(w).event.rows;assert.equal(rows.find(p=>p.id==='watcher').coins,0);
 assert.equal(rows.find(p=>p.id==='donor').skinOwned,true);
 const log=w.auditOutbox.filter(r=>r.type==='gift');assert.equal(log.length,3);
 assert.equal(log.find(r=>r.user==='donor').count,5);assert.equal(log.find(r=>r.user==='donor').coins,200);
 assert.equal(log.find(r=>r.user==='npc').simulated,true);assert.equal(log.find(r=>r.user==='outside').eventId,null);
 const s=snapshot(w,N+20);assert.equal(s.auditOutbox,undefined);assert.equal(s.visitorArchive,undefined);
});
test('earned skin and artifact are repaired even if stale awarded flags are true after the round closes',()=>{
 const w=createWorld(),p=ensurePlayer(w,'a','A',N);startVisitor(w,'vuonglam',N);
 w.visitor.giftProgress={a:{coins:300,skinAwarded:true,artifactAwarded:true}};w.visitor.closedAt=N+180000;
 const first=reconcileVisitorPricing(w,N+200000);assert.equal(first.length,1);
 assert.ok(p.rewardSkins.includes('vuonglam-avatar'));assert.ok(p.artifacts.includes('vuonglam-soul-banner'));
 assert.equal(reconcileVisitorPricing(w,N+200001).length,0);
});
test('archived evidence repairs missing rewards once without using lifetime coins or overriding a selected skin',()=>{
 let w=createWorld(),p=ensurePlayer(w,'a','A',N);Object.assign(p,{giftCoins:100000,skinChoice:'hanlap-avatar',skinChoiceSource:'manual',rewardSkins:['hanlap-avatar']});
 startVisitor(w,'vuonglam',N);w.visitor.giftProgress={a:{coins:199}};archiveVisitor(w);const evidence=structuredClone(w.visitor);
 startVisitor(w,'hanlap',N+180001);w=JSON.parse(JSON.stringify(w));
 assert.equal(repairVisitorHistory(w,N+200000).length,0);
 evidence.giftProgress.a.coins=300;assert.equal(repairVisitorHistory(w,N+200000,[evidence]).length,1);
 assert.equal(w.players.a.skinChoice,'hanlap-avatar');assert.ok(w.players.a.rewardSkins.includes('vuonglam-avatar'));
 assert.equal(repairVisitorHistory(w,N+200001,[evidence]).length,0);
 assert.equal(visitorAuditView(w,evidence.id).event.rows[0].coins,300);
});
test('daily journal is append-only, drains once and rejects arbitrary file paths',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'vanhai-audit-'));
 try{const store=createAuditStorage(dir),w=createWorld();gift(w,'a',200);
 const row=w.auditOutbox.find(r=>r.type==='gift');store.flush(w,'live');assert.equal(w.auditOutbox.length,0);
 const date=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(row.at),file=store.file('live',date);
 const text=fs.readFileSync(file,'utf8');store.flush(w,'live');assert.equal(fs.readFileSync(file,'utf8'),text);
 assert.ok(text.includes('"coins":200'));assert.equal(store.file('live','../../live.json'),null);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});

test('startup restores visitor outfits overwritten by crafting, while keeping explicit choices intact',()=>{
 const w=createWorld();for(const [id,source]of [['auto','craft'],['manual','manual'],['admin','admin']]){
  const p=ensurePlayer(w,id,id,N);Object.assign(p,{rewardSkins:['vuonglam-avatar','ivory-celestial'],skinChoice:'ivory-celestial',skinChoiceSource:source});
 }
 assert.equal(repairVisitorHistory(w,N).length,1);assert.equal(w.players.auto.skinChoice,'vuonglam-avatar');
 assert.equal(w.players.manual.skinChoice,'ivory-celestial');assert.equal(w.players.admin.skinChoice,'ivory-celestial');
 assert.equal(repairVisitorHistory(w,N+1).length,0);
});
