// 20/11: đọc sẵn câu chào người mới / người quay lại / nhập môn (public/welcome-lines.js) bằng VieNeu, giọng tông sư.
// Chạy trên máy LIVE (có VieNeu), tốt nhất lúc KHÔNG LIVE:  node scripts/make-welcome-voice.mjs [--force]
// Ra: public/assets/voice-welcome-v1/*.mp3 + manifest.json (overlay chỉ dùng file có trong manifest).
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {allWelcomeLines,WELCOME_DIR} from '../public/welcome-lines.js';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const vieneu=process.env.VAN_HAI_VIENEU_DIR||'C:\\WorkSpace\\TIKTOK\\tools\\vieneu';
const dir=path.join(root,'public',WELCOME_DIR);fs.mkdirSync(dir,{recursive:true});
const force=process.argv.includes('--force');
const out=l=>path.join(root,'public',l.file);
const writeManifest=()=>{const files=allWelcomeLines().filter(l=>fs.existsSync(out(l))&&fs.statSync(out(l)).size>1000).map(l=>l.file);
 fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify({engine:'VieNeu local',voice:'Thiền Tâm Đức (tongsu)',made:new Date().toISOString(),files,lines:allWelcomeLines()},null,1));
 console.log(`manifest: ${files.length}/${allWelcomeLines().length} câu`);};
const jobs=allWelcomeLines().map((l,i)=>({id:String(i),segments:[{voice:'tongsu',text:l.text}],output:out(l),name:path.basename(l.file)})).filter(j=>force||!fs.existsSync(j.output));
if(!jobs.length){writeManifest();console.log('Đã có đủ file. Dùng --force để đọc lại.');process.exit(0);}
const child=spawn(path.join(vieneu,'.venv','Scripts','python.exe'),[path.join(root,'scripts','vieneu_worker.py')],{cwd:vieneu,windowsHide:true,stdio:['pipe','pipe','inherit'],env:{...process.env,PYTHONIOENCODING:'utf-8',HF_HUB_OFFLINE:'1'}});
let left=jobs.length,failed=0;
const deadline=setTimeout(()=>{console.error('Quá 10 phút, dừng.');child.kill();},600000);
readline.createInterface({input:child.stdout}).on('line',line=>{
 let m;try{m=JSON.parse(line);}catch{return;}
 if(m.ready){for(const j of jobs){child.stdin.write(JSON.stringify({id:j.id,segments:j.segments,output:j.output})+'\n');}return;}
 const j=jobs.find(x=>x.id===m.id);if(!j)return;
 console.log(m.ok?'✓':'✗',j.name,m.ok?'':m.error);if(!m.ok)failed++;
 if(--left===0)child.stdin.end();
});
child.on('exit',()=>{clearTimeout(deadline);writeManifest();process.exit(failed?1:0);});
