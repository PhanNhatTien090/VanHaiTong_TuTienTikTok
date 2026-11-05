// Đọc sẵn lời tông sư (public/idle-lines.js) bằng VieNeu → public/assets/idle/*.mp3
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {IDLE_LINES,SCENE_ARRIVAL} from '../public/idle-lines.js';
import {RESIDENT_VOICES} from '../public/resident-acts.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const vieneu=process.env.VAN_HAI_VIENEU_DIR||'C:\\WorkSpace\\TIKTOK\\tools\\vieneu';
for(const d of ['idle','resident'])fs.mkdirSync(path.join(root,'public','assets',d),{recursive:true});
const force=process.argv.includes('--force');
const jobs=(process.argv.includes('--idle-only')?[...IDLE_LINES,SCENE_ARRIVAL]:[...IDLE_LINES,SCENE_ARRIVAL,...RESIDENT_VOICES]).map((l,i)=>({id:String(i),text:l.say||l.text,output:path.join(root,'public',l.file)})).filter(j=>force||!fs.existsSync(j.output));
if(!jobs.length){console.log('Đã có đủ file. Dùng --force để đọc lại.');process.exit(0);}
const child=spawn(path.join(vieneu,'.venv','Scripts','python.exe'),[path.join(root,'scripts','vieneu_worker.py')],{cwd:vieneu,stdio:['pipe','pipe','inherit'],env:{...process.env,PYTHONIOENCODING:'utf-8',HF_HUB_OFFLINE:'1'}});
let left=jobs.length,failed=0;
readline.createInterface({input:child.stdout}).on('line',line=>{
  const m=JSON.parse(line);
  if(m.ready){for(const j of jobs)child.stdin.write(JSON.stringify(j)+'\n');return;}
  const j=jobs.find(x=>x.id===m.id);console.log(m.ok?'✓':'✗',path.basename(j.output),m.ok?'':m.error);if(!m.ok)failed++;
  if(--left===0){child.stdin.end();}
});
child.on('exit',()=>process.exit(failed?1:0));
