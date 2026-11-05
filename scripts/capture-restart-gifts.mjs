// Temporary handover buffer: record real TikFinity gifts while the game server restarts.
import {WebSocket} from 'ws';
import fs from 'node:fs';
import path from 'node:path';
const dest=path.resolve(process.argv[2]),rows=[],ws=new WebSocket('ws://127.0.0.1:21213/');
let finished=false;
function finish(){if(finished)return;finished=true;fs.writeFileSync(dest,JSON.stringify(rows));console.log('Gift recovery buffer saved: '+rows.length);ws.close();setTimeout(()=>process.exit(0),250).unref();}
ws.on('open',()=>console.log('Gift recovery buffer connected'));
ws.on('message',raw=>{try{const e=JSON.parse(String(raw));if(e.event==='gift'){rows.push(e);if(rows.length>1000)rows.shift();}}catch{}});
ws.on('error',()=>{console.error('Gift recovery buffer unavailable');process.exit(1);});
setTimeout(finish,45000);process.on('SIGTERM',finish);
