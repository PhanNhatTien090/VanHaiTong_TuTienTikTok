import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {DatabaseSync} from 'node:sqlite';
import {checkUpgrade,pruneReleases} from '../deploy/release-operations.mjs';
import {verifyProduction} from '../deploy/verify-production.mjs';

const deploy=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../deploy');
const linuxTest=process.platform==='linux'?test:test.skip;
const write=(file,text)=>{fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,text);};
const digest=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
function fixture(t,{logicChanged=false,phase=null,...behavior}={}) {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'vanhai-deploy-'));
  t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
  const old=path.join(root,'releases/old'),next=path.join(root,'releases/new'),data=path.join(root,'data');
  for(const [dir,version] of [[old,'old'],[next,'new']]){
    const files={};
    const content={
      'web/cloud/server.mjs':version==='new'&&logicChanged?'// changed logic':'// stable logic',
      'web/public/index.html':version,
      'package.json':'{"name":"test","version":"1.0.0"}',
      'package-lock.json':'{"lockfileVersion":3}',
    };
    for(const name of ['upgrade.sh','verify-bundle.mjs','release-operations.mjs'])content['web/deploy/'+name]=fs.readFileSync(path.join(deploy,name),'utf8');
    for(const [name,text]of Object.entries(content)){write(path.join(dir,name),text);files[name]=digest(path.join(dir,name));}
    write(path.join(dir,'release-manifest.json'),JSON.stringify({version,files}));
  }
  write(path.join(old,'node_modules/dependency/index.js'),'unchanged dependency');
  fs.symlinkSync(old,path.join(root,'current'));
  fs.mkdirSync(data);
  const db=new DatabaseSync(path.join(data,'web.sqlite'));
  db.exec('CREATE TABLE meta (key TEXT PRIMARY KEY,value TEXT NOT NULL)');
  db.prepare('INSERT INTO meta VALUES(?,?)').run('accounts',JSON.stringify({users:{keep_me:{id:'u1'}}}));
  if(phase)db.prepare('INSERT INTO meta VALUES(?,?)').run('play:p1',JSON.stringify({phase}));
  db.close();
  const before=digest(path.join(data,'web.sqlite'));
  const bin=path.join(root,'bin'),log=path.join(root,'events.jsonl');
  write(path.join(root,'behavior.json'),JSON.stringify(behavior));
  const dispatcher=path.join(bin,'dispatch.mjs');
  write(dispatcher,`#!/usr/bin/env node
import fs from 'node:fs';import path from 'node:path';import {DatabaseSync} from 'node:sqlite';
const root=process.env.VANHAI_INSTALL_ROOT,data=process.env.VANHAI_DATA_DIR;
const behavior=JSON.parse(fs.readFileSync(path.join(root,'behavior.json')));
const command=path.basename(process.argv[1]),args=process.argv.slice(2),current=fs.readlinkSync(path.join(root,'current'));
fs.appendFileSync(path.join(root,'events.jsonl'),JSON.stringify({command,args,current})+'\\n');
if(command==='id')console.log('0');
if(command==='npm'){if(behavior.npmFail)process.exit(9);fs.mkdirSync('node_modules',{recursive:true});}
if(command==='systemctl'&&args[0]==='stop'&&behavior.race){const db=new DatabaseSync(path.join(data,'web.sqlite'));db.prepare('INSERT OR REPLACE INTO meta VALUES(?,?)').run('play:raced',JSON.stringify({phase:'web'}));db.close();}
if(command==='systemctl'&&args[0]==='start'&&current.endsWith('/new')&&behavior.startFail)process.exit(9);
if(command==='runuser'){if(behavior.backupFail)process.exit(9);fs.mkdirSync(path.join(data,'backups'),{recursive:true});fs.copyFileSync(path.join(data,'web.sqlite'),path.join(data,'backups/snapshot.sqlite'));}
if(command==='curl'){if(current.endsWith('/new')&&behavior.healthFail)process.exit(22);console.log(JSON.stringify({ok:true,cloud:true}));}
`);
  fs.chmodSync(dispatcher,0o755);
  for(const name of ['id','systemctl','runuser','curl','sleep','npm'])fs.symlinkSync('dispatch.mjs',path.join(bin,name));
  const env={...process.env,PATH:bin+path.delimiter+process.env.PATH,VANHAI_INSTALL_ROOT:root,VANHAI_DATA_DIR:data,VANHAI_UPGRADE_LOCK:path.join(root,'deploy.lock')};
  // Child Node commands are ordinary CLI processes, not test-runner children.
  delete env.NODE_TEST_CONTEXT;
  const run=()=>spawnSync('bash',[path.join(next,'web/deploy/upgrade.sh')],{encoding:'utf8',timeout:15000,env});
  return {root,old,next,data,before,run,events:()=>fs.existsSync(log)?fs.readFileSync(log,'utf8').trim().split('\n').map(JSON.parse):[]};
}

linuxTest('static update can preserve active linked ownership without changing SQLite',t=>{
  const f=fixture(t,{phase:'web'});
  assert.equal(checkUpgrade(f.old,f.next,f.data).logicChanged,false);
  const r=f.run();assert.equal(r.status,0,r.stderr);
  assert.equal(fs.readlinkSync(path.join(f.root,'current')),f.next);
  assert.equal(digest(path.join(f.data,'web.sqlite')),f.before);
  assert.ok(fs.existsSync(path.join(f.data,'backups/snapshot.sqlite')));
  assert.equal(f.events().some(e=>e.command==='npm'),false);
  assert.equal(fs.statSync(path.join(f.old,'node_modules/dependency/index.js')).ino,fs.statSync(path.join(f.next,'node_modules/dependency/index.js')).ino);
});

for(const phase of ['acquire','web','release'])linuxTest(`logic update refuses outstanding ${phase} without stopping service`,t=>{
  const f=fixture(t,{logicChanged:true,phase});
  const r=f.run();assert.notEqual(r.status,0);
  assert.match(r.stderr+r.stdout,/Update paused/,JSON.stringify({status:r.status,signal:r.signal,error:r.error,events:f.events()}));
  assert.equal(fs.readlinkSync(path.join(f.root,'current')),f.old);
  assert.equal(f.events().some(e=>e.command==='systemctl'),false);
  assert.equal(digest(path.join(f.data,'web.sqlite')),f.before);
});

for(const behavior of ['healthFail','startFail','backupFail'])linuxTest(`${behavior} restores and restarts previous code, without rolling data back`,t=>{
  const f=fixture(t,{[behavior]:true});
  const r=f.run();assert.notEqual(r.status,0);
  assert.equal(fs.readlinkSync(path.join(f.root,'current')),f.old);
  const starts=f.events().filter(e=>e.command==='systemctl'&&e.args[0]==='start');
  assert.equal(starts.at(-1).current,f.old);
  assert.equal(digest(path.join(f.data,'web.sqlite')),f.before);
});

linuxTest('second ownership check catches a login racing service stop',t=>{
  const f=fixture(t,{logicChanged:true,race:true});
  const r=f.run();assert.notEqual(r.status,0);assert.match(r.stderr+r.stdout,/Update paused/);
  assert.equal(fs.readlinkSync(path.join(f.root,'current')),f.old);
  assert.equal(f.events().some(e=>e.command==='runuser'),false);
  const db=new DatabaseSync(path.join(f.data,'web.sqlite'),{readOnly:true});
  assert.equal(JSON.parse(db.prepare("SELECT value FROM meta WHERE key='play:raced'").get().value).phase,'web');db.close();
});

linuxTest('failed dependency installation leaves previous service untouched',t=>{
  const f=fixture(t,{npmFail:true});fs.rmSync(path.join(f.old,'node_modules'),{recursive:true});
  const r=f.run();assert.notEqual(r.status,0);
  assert.equal(f.events().some(e=>e.command==='systemctl'),false);
  assert.equal(fs.readlinkSync(path.join(f.root,'current')),f.old);
});

linuxTest('production upgrade cannot create an empty account store before migration',t=>{
  const f=fixture(t);fs.rmSync(path.join(f.data,'web.sqlite'));
  const r=f.run();assert.notEqual(r.status,0);assert.match(r.stderr,/initial real-account migration/);
  assert.equal(fs.existsSync(path.join(f.data,'web.sqlite')),false);
  assert.equal(f.events().some(e=>e.command==='systemctl'),false);
});

linuxTest('pending migration guard blocks deployment even when an account database exists',t=>{
  const f=fixture(t);write(path.join(f.data,'.migration-pending'),'');
  const r=f.run();assert.notEqual(r.status,0);assert.match(r.stderr,/initial real-account migration/);
  assert.equal(digest(path.join(f.data,'web.sqlite')),f.before);
  assert.equal(f.events().some(e=>e.command==='systemctl'),false);
});

linuxTest('pruning retains current, previous, manual releases, data, and external symlinks',t=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'vanhai-prune-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
  const releases=path.join(root,'releases');fs.mkdirSync(releases);
  const dirs=[];
  for(let i=0;i<7;i++){
    const dir=path.join(releases,'a'.repeat(40)+`-${i}-1`);write(path.join(dir,'release-manifest.json'),'{}');
    fs.utimesSync(dir,1000+i,1000+i);dirs.push(dir);
  }
  fs.symlinkSync(dirs[0],path.join(root,'current'));
  write(path.join(releases,'manual-install/keep'),'manual');
  const external=path.join(root,'external');write(path.join(external,'keep'),'external');
  fs.symlinkSync(external,path.join(releases,'b'.repeat(40)+'-1-1'));
  assert.equal(pruneReleases(root,3,dirs[1]).removed,2);
  for(const index of [0,1,4,5,6])assert.ok(fs.existsSync(dirs[index]));
  assert.ok(fs.existsSync(path.join(releases,'manual-install/keep')));
  assert.ok(fs.existsSync(path.join(external,'keep')));
});

test('public verification waits for the requested revision, not merely HTTP 200',async()=>{
  const sha='a'.repeat(40);let polls=0,waits=0;
  const request=async url=>{
    if(url.pathname==='/healthz')return Response.json({ok:true,cloud:true,ready:true});
    polls++;assert.ok(url.searchParams.has('verify'));
    return Response.json({version:polls===1?'old':sha});
  };
  assert.deepEqual(await verifyProduction('https://game.example.com',sha,{request,wait:async()=>waits++,attempts:2}),{ok:true,revision:sha,ready:true});
  assert.equal(waits,1);
});

test('public verification rejects an unsynced cloud even on the correct revision',async()=>{
  const sha='a'.repeat(40);
  const request=async url=>Response.json(url.pathname==='/healthz'?{ok:true,cloud:true,ready:false}:{version:sha});
  await assert.rejects(verifyProduction('https://game.example.com',sha,{request,attempts:1}),/ready state/);
});

test('public verification requires HTTPS and keeps credentials out of URLs',async()=>{
  const request=()=>{assert.fail('No request should be made');};
  for(const url of ['http://game.example.com','https://user:password@game.example.com'])await assert.rejects(verifyProduction(url,'a'.repeat(40),{request}),/HTTPS/);
});
