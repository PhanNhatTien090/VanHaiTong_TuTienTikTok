import {spawn} from 'node:child_process';
import readline from 'node:readline';
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd(),dir=path.join(root,'public/assets/voice-fast-v1');fs.mkdirSync(dir,{recursive:true});
const lines={qi:'Linh khí hội tụ, đạo hạnh tăng tiến!',attack:'Xuất chiêu!',ready:'Đã đủ điều kiện. Gõ đột phá ngay!',breakthrough:'Thiên môn khai mở! Chúc mừng đạo hữu đột phá!',gift:'Quà đã tới, tu vi tăng mạnh!',join:'Chào mừng đạo hữu gia nhập tông môn!',gather:'Đã thu thập linh thảo!',learn:'Đạo hữu lĩnh ngộ bí pháp!',notice:'Tông môn đã ghi nhận. Đạo hữu hãy xem thông tin trên màn hình.'};
const base=process.env.VAN_HAI_VIENEU_DIR||'C:/WorkSpace/TIKTOK/tools/vieneu',pending=new Map();let readyResolve;
const ready=new Promise(r=>readyResolve=r),worker=spawn(path.join(base,'.venv/Scripts/python.exe'),[path.join(root,'scripts/vieneu_worker.py')],{cwd:base,windowsHide:true,stdio:['pipe','pipe','inherit'],env:{...process.env,PYTHONIOENCODING:'utf-8',HF_HUB_OFFLINE:'1',VAN_HAI_TTS_THREADS:'2'}});
readline.createInterface({input:worker.stdout}).on('line',s=>{try{const m=JSON.parse(s);if(m.ready)readyResolve();else if(pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);m.ok?p.resolve():p.reject(Error(m.error));}}catch{}});
const deadline=setTimeout(()=>{worker.kill();process.exitCode=1;},180000);
try{await ready;for(const [id,text]of Object.entries(lines)){const output=path.join(dir,id+'.mp3');if(fs.existsSync(output))continue;const at=Date.now();await new Promise((resolve,reject)=>{pending.set(id,{resolve,reject});worker.stdin.write(JSON.stringify({id,segments:[{voice:'tongsu',text}],output})+'\n');});console.log(id,Date.now()-at,'ms');}fs.writeFileSync(path.join(dir,'sources.json'),JSON.stringify({engine:'VieNeu local',voice:'Thiền Tâm Đức',purpose:'Deadline fallback when personalized voice is late; never reads a different player name',lines},null,2));}finally{clearTimeout(deadline);worker.stdin.end();}
