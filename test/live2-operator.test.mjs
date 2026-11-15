import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {applyLive2Settings,backupLive2State,live2Flags} from '../live2-operator.mjs';
const flags={live2Enabled:true,live2GuildWarEnabled:false,live2BossTrialsEnabled:false};
function world(){return {mode:'live',version:1,settings:{live2Enabled:false},
 players:{a:{id:'a',name:'A',realm:9,qi:99,stones:100,pills:{qi:2},
  artifacts:['jade'],live2:{path:'sword',insight:80,refinements:{jade:2}}}}};}
test('operator cannot enable LIVE systems without a successful backup and explicit confirmation',()=>{
 const w=world();let calls=0;
 assert.equal(applyLive2Settings(w,flags,()=>{calls++;return 'save.json'}).ok,false);
 assert.equal(calls,0);
 assert.equal(applyLive2Settings(w,{...flags,confirm:'XAC NHAN LIVE2'},()=>{throw Object.assign(new Error('disk'),{code:'ENOSPC'})}).ok,false);
 assert.equal(w.settings.live2Enabled,false);
 assert.equal(applyLive2Settings(w,{...flags,live2BossTrialsEnabled:true,live2Enabled:false,confirm:'XAC NHAN LIVE2'},()=>{calls++;return 'save.json'}).ok,false);
 assert.equal(calls,0);
});
test('backup of in-memory LIVE world occurs before changing any flag, including disabling',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'live2-flags-'));try{
  const w=world(),data=structuredClone(w.players);
  const enable=applyLive2Settings(w,{...flags,confirm:'XAC NHAN LIVE2'},x=>backupLive2State(x,dir,1800000000000));
  assert.equal(enable.ok,true);
  const copy=JSON.parse(fs.readFileSync(path.join(dir,'backups',enable.backup),'utf8'));
  assert.equal(copy.settings.live2Enabled,false);
  assert.deepEqual(copy.players,data);
  const off=applyLive2Settings(w,{live2Enabled:false,live2BossTrialsEnabled:false,live2GuildWarEnabled:false,confirm:'XAC NHAN LIVE2'},x=>backupLive2State(x,dir,1800000000000));
  assert.equal(off.ok,true);
  assert.notEqual(enable.backup,off.backup);
  assert.equal(JSON.parse(fs.readFileSync(path.join(dir,'backups',off.backup),'utf8')).settings.live2Enabled,true);
  assert.deepEqual(w.players,data);
  assert.deepEqual(live2Flags(w),{live2Enabled:false,live2BossTrialsEnabled:false,live2GuildWarEnabled:false});
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('a repeated identical request is idempotent and never generates redundant backups',()=>{
 const w=world();w.settings.live2Enabled=true;let called=false;
 const r=applyLive2Settings(w,{...flags,confirm:'XAC NHAN LIVE2'},()=>{called=true;return 'x.json'});
 assert.equal(r.unchanged,true);assert.equal(called,false);
});
