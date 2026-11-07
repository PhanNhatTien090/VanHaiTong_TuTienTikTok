import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'release-manifest.json'),'utf8'));
for(const [name,hash]of Object.entries(manifest.files)){
 const file=path.resolve(root,name);if(!file.startsWith(root+path.sep))throw Error('Invalid manifest path');
 if(crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')!==hash)throw Error('Release mismatch: '+name);
}
console.log(JSON.stringify({ok:true,files:Object.keys(manifest.files).length,version:manifest.version}));
