import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

test('dọn data/: giữ 48 bản mới + 1 bản/ngày 14 ngày, 5 bản sao trước restart; không đụng dữ liệu thật',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'clean-data-')),b=path.join(dir,'backups');fs.mkdirSync(b);
 const now=Date.now(),day=864e5,stamp=t=>{const d=new Date(t),p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;};
 for(let i=0;i<20*48;i++)fs.writeFileSync(path.join(b,`live-${stamp(now-i*30*60000)}.json`),'{}'); // 20 ngày, 30 phút/bản
 fs.mkdirSync(path.join(b,'prune-realm0-20200101T000000'));fs.writeFileSync(path.join(b,'prune-realm0-20200101T000000','live.json'),'{}');
 for(const f of ['live.json','demo.json','source-visual.json'])fs.writeFileSync(path.join(dir,f),'{}');
 fs.mkdirSync(path.join(dir,'audit'));fs.writeFileSync(path.join(dir,'audit','gifts-live-2020-01-01.jsonl'),'x');
 for(let i=0;i<9;i++){const p=path.join(dir,`live-pre-x-${i}.json`);fs.writeFileSync(p,'{}');const t=(now-i*day)/1000;fs.utimesSync(p,t,t);}
 fs.writeFileSync(path.join(dir,'x-buffer-1-error.log'),'');
 execFileSync(process.execPath,['scripts/clean-data.mjs','--apply','--data='+dir]);
 const snaps=fs.readdirSync(b).filter(f=>/^live-\d{8}-\d{4}\.json$/.test(f));
 assert.ok(snaps.length>=48&&snaps.length<=48+15,'còn '+snaps.length);
 for(const f of ['live.json','demo.json','source-visual.json','audit/gifts-live-2020-01-01.jsonl','backups/prune-realm0-20200101T000000/live.json'])assert.ok(fs.existsSync(path.join(dir,f)),f);
 assert.equal(fs.readdirSync(dir).filter(f=>f.startsWith('live-pre-')).length,5);
 assert.ok(!fs.existsSync(path.join(dir,'x-buffer-1-error.log')));
 fs.rmSync(dir,{recursive:true,force:true});
});

test('server.mjs: regex giữ bản sao 30 phút khớp đúng tên file (lỗi cũ thiếu \\d)',()=>{
 const src=fs.readFileSync('server.mjs','utf8');assert.ok(src.includes(String.raw`/^live-\d{8}-\d{4}\.json$/`));
});
