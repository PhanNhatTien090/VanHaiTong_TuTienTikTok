import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {DatabaseSync} from 'node:sqlite';

const manifest=release=>JSON.parse(fs.readFileSync(path.join(release,'release-manifest.json'),'utf8'));
const affectsGame=name=>(name.endsWith('.mjs')&&!name.startsWith('web/deploy/'))||['package.json','package-lock.json'].includes(name);

export function checkUpgrade(previous, next, dataDir) {
  let old;
  try {old=manifest(previous);}catch {old={files:{}};}
  const fresh=manifest(next);
  const names=new Set([...Object.keys(old.files),...Object.keys(fresh.files)]);
  const logicChanged=[...names].some(name=>affectsGame(name)&&old.files[name]!==fresh.files[name]);
  const database=path.join(dataDir,'web.sqlite');
  if(!fs.existsSync(database)||fs.existsSync(path.join(dataDir,'.migration-pending')))throw Error('Finish the initial real-account migration before updating production');
  const db=new DatabaseSync(database,{readOnly:true});
  try {
    if(!db.prepare("SELECT value FROM meta WHERE key='accounts'").get())throw Error('Finish the initial real-account migration before updating production');
    if(!logicChanged)return {ok:true,logicChanged,pending:0};
    const pending=db.prepare("SELECT count(*) AS n FROM meta WHERE key LIKE 'play:%' AND json_extract(value,'$.phase') IN ('acquire','web','release')").get().n;
    if(pending)throw Error(`Update paused: ${pending} linked play sessions/handoffs remain. Finish returns with LIVE and the agent online, then retry. Current release is retained.`);
    return {ok:true,logicChanged,pending};
  }finally {db.close();}
}

export function pruneReleases(installRoot, keep=3, previous=null) {
  const releases=fs.realpathSync(path.join(installRoot,'releases'));
  const current=fs.realpathSync(path.join(installRoot,'current'));
  if(path.dirname(current)!==releases)throw Error('Current release is outside release directory');
  if(previous&&path.dirname(fs.realpathSync(previous))!==releases)throw Error('Previous release is outside release directory');
  const candidates=fs.readdirSync(releases,{withFileTypes:true})
    .filter(entry=>entry.isDirectory()&&/^[a-f0-9]{40}-\d+-\d+$/.test(entry.name))
    .map(entry=>path.join(releases,entry.name))
    .filter(dir=>fs.existsSync(path.join(dir,'release-manifest.json')))
    .sort((a,b)=>fs.statSync(b).mtimeMs-fs.statSync(a).mtimeMs);
  const retained=new Set([current,...candidates.slice(0,keep),...(previous?[fs.realpathSync(previous)]:[])]);
  let removed=0;
  for(const dir of candidates)if(!retained.has(dir)){fs.rmSync(dir,{recursive:true});removed++;}
  return {ok:true,removed};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  try {
    const [command,...args]=process.argv.slice(2);
    if(command==='check'&&args.length===3)console.log(JSON.stringify(checkUpgrade(...args)));
    else if(command==='prune'&&[1,2].includes(args.length))console.log(JSON.stringify(pruneReleases(args[0],3,args[1])));
    else throw Error('Usage: release-operations.mjs check <old> <new> <data> | prune <install-root> [previous]');
  }catch(error){console.error(error.message);process.exitCode=1;}
}
