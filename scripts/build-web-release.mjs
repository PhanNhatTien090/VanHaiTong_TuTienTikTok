import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {parseArgs} from 'node:util';
const {values:options}=parseArgs({options:{output:{type:'string'},version:{type:'string'},'directory-only':{type:'boolean',default:false}}});
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),version=options.version || new Date().toISOString().replace(/[:.]/g,'-');
if(!/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(version))throw Error('Invalid release version');
const output=options.output?path.resolve(options.output):path.join(root,'output','web-release-'+version),files={};
fs.mkdirSync(path.dirname(output),{recursive:true});fs.mkdirSync(output);
function copy(relative){const source=path.join(root,relative),dest=path.join(output,relative),st=fs.statSync(source);if(st.isDirectory()){for(const name of fs.readdirSync(source))copy(path.join(relative,name));return;}fs.mkdirSync(path.dirname(dest),{recursive:true});fs.copyFileSync(source,dest);files[relative.replaceAll('\\','/')]=crypto.createHash('sha256').update(fs.readFileSync(dest)).digest('hex');}
const modules=new Set();
function module(relative){relative=path.normalize(relative);if(modules.has(relative))return;modules.add(relative);copy(relative);const code=fs.readFileSync(path.join(root,relative),'utf8');for(const re of [/\b(?:import|export)\s+(?:[^;'"\n]*?\s+from\s*)?['"](\.[^'"]+)['"]/g,/\bimport\(\s*['"](\.[^'"]+)['"]\s*\)/g])for(const match of code.matchAll(re))module(path.join(path.dirname(relative),match[1]));}
for(const entry of ['web/cloud/server.mjs','web/cloud/cli.mjs','web/cloud/agent.mjs'])module(entry);
copy('public');copy('web/public');copy('web/deploy');copy('package-lock.json');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));pkg.scripts={start:'node web/cloud/server.mjs',agent:'node web/cloud/agent.mjs',maintenance:'node web/cloud/cli.mjs'};pkg.engines={node:'>=24'};
fs.writeFileSync(path.join(output,'package.json'),JSON.stringify(pkg,null,2));files['package.json']=crypto.createHash('sha256').update(fs.readFileSync(path.join(output,'package.json'))).digest('hex');
// Public revision only; allows deployment to be verified over HTTPS.
const revisionFile='web/public/deploy-version.json';
fs.writeFileSync(path.join(output,revisionFile),JSON.stringify({version})+'\n');
files[revisionFile]=crypto.createHash('sha256').update(fs.readFileSync(path.join(output,revisionFile))).digest('hex');
fs.writeFileSync(path.join(output,'release-manifest.json'),JSON.stringify({version,createdAt:new Date().toISOString(),files},null,2));
for(const name of Object.keys(files))if(/(^|\/)(data|\.git|\.secrets|node_modules|\.env(?:\.[^/]*)?)(\/|$)|\.(pem|key|pfx|p12)$/i.test(name))throw Error('Private/runtime file included');
const verified=spawnSync(process.execPath,[path.join(output,'web/deploy/verify-bundle.mjs')],{encoding:'utf8'});if(verified.status!==0)throw Error(verified.stderr);
if(options['directory-only']){console.log(JSON.stringify({output,files:Object.keys(files).length,version,archive:null}));process.exit(0);}
const archive=output+'.tar.gz',tar=spawnSync('tar',['-czf',archive,'-C',output,'.'],{encoding:'utf8'});if(tar.status!==0)throw Error(tar.stderr);
console.log(JSON.stringify({output,archive,bytes:fs.statSync(archive).size,files:Object.keys(files).length,version}));
