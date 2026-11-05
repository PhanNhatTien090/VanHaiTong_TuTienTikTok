// Private maintenance CLI: never serve these exports through HTTP.
import fs from 'node:fs';
import path from 'node:path';
import {openCloudStore} from './store.mjs';
const args=process.argv.slice(2),option=name=>args[args.indexOf(name)+1];
const dataDir=option('--data');if(!args.includes('--data') || !path.isAbsolute(dataDir || ''))throw Error('Use --data <absolute persistent directory>');
process.umask(0o077);
const store=openCloudStore(dataDir);
try{
  const command=args[0];
  if(command==='import'){
    if(!args.includes('--accounts'))throw Error('Use --accounts <private account export>');
    const accounts=JSON.parse(fs.readFileSync(option('--accounts'),'utf8')),world=store.loadWorld();
    if(args.includes('--world')){const raw=JSON.parse(fs.readFileSync(option('--world'),'utf8'));for(const p of Object.values(raw.players || {}))if(p.webOnly)world.players[p.id]=p;}
    store.importAccounts(accounts,world);console.log(JSON.stringify({ok:true,accounts:Object.keys(accounts.users).length}));
  }else if(command==='export'){
    if(!args.includes('--out'))throw Error('Use --out <private export directory>');
    const out=path.resolve(option('--out'));fs.mkdirSync(out,{recursive:true,mode:0o700});
    fs.writeFileSync(path.join(out,'accounts.json'),JSON.stringify(store.get('accounts')),{mode:0o600});
    fs.writeFileSync(path.join(out,'world.json'),JSON.stringify(store.loadWorld()),{mode:0o600});
    console.log(JSON.stringify({ok:true,exported:true}));
  }else if(command==='backup')console.log(JSON.stringify({ok:true,file:store.backup()}));
  else if(command==='status')console.log(JSON.stringify({ok:true,initialized:!!store.get('accounts'),sync:store.get('sync'),sqlite:store.db.prepare('SELECT sqlite_version() AS version').get().version}));
  else throw Error('Commands: import, export, backup, status');
}finally{store.close();}
