import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),version=new Date().toISOString().replace(/[:.]/g,'-');
const output=path.join(root,'output','web-release-'+version),files={};fs.mkdirSync(output,{recursive:true});
function copy(relative){const source=path.join(root,relative),dest=path.join(output,relative),st=fs.statSync(source);if(st.isDirectory()){for(const name of fs.readdirSync(source))copy(path.join(relative,name));return;}fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(source,dest);files[relative.replaceAll('\\','/')]=crypto.createHash('sha256').update(fs.readFileSync(dest)).digest('hex');}
const modules=new Set();
function module(relative){relative=path.normalize(relative);if(modules.has(relative))return;modules.add(relative);copy(relative);const code=fs.readFileSync(path.join(root,relative),'utf8');for(const re of [/\b(?:import|export)\s+(?:[^;'"\n]*?\s+from\s*)?['"](\.[^'"]+)['"]/g,/\bimport\(\s*['"](\.[^'"]+)['"]\s*\)/g])for(const match of code.matchAll(re))module(path.join(path.dirname(relative),match[1]));}
for(const entry of ['web/cloud/server.mjs','web/cloud/cli.mjs','web/cloud/agent.mjs'])module(entry);
copy('public');copy('web/public');copy('web/deploy');copy('package-lock.json');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));pkg.scripts={start:'node web/cloud/server.mjs',agent:'node web/cloud/agent.mjs',maintenance:'node web/cloud/cli.mjs'};pkg.engines={node:'>=24'};
fs.writeFileSync(path.join(output,'package.json'),JSON.stringify(pkg,null,2));files['package.json']=crypto.createHash('sha256').update(fs.readFileSync(path.join(output,'package.json'))).digest('hex');
fs.writeFileSync(path.join(output,'release-manifest.json'),JSON.stringify({version,createdAt:new Date().toISOString(),files},null,2));
for(const name of Object.keys(files))if(/(^|\/)(data|\.git|node_modules|\.env)(\/|$)/.test(name))throw Error('Private/runtime file included');
const verified=spawnSync(process.execPath,[path.join(output,'web/deploy/verify-bundle.mjs')],{encoding:'utf8'});if(verified.status!==0)throw Error(verified.stderr);
const archive=output+'.tar.gz',tar=spawnSync('tar',['-czf',archive,'-C',output,'.'],{encoding:'utf8'});if(tar.status!==0)throw Error(tar.stderr);
console.log(JSON.stringify({output,archive,bytes:fs.statSync(archive).size,files:Object.keys(files).length,version}));
