import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import {createHash} from 'node:crypto';
import {spawn} from 'node:child_process';
import {isEventAnnouncement} from './public/event-announcements.js';
// v75: lời thoại + phối giọng nằm ở speech-lines.mjs
import {speechPlan,announcement,viNumber} from './speech-lines.mjs';
export {speechPlan,announcement,viNumber};

const VIENEU_DIR=process.env.VAN_HAI_VIENEU_DIR||'C:\\WorkSpace\\TIKTOK\\tools\\vieneu';

/** Worker VieNeu chạy nền, nạp model một lần (~15s), tự khởi động lại khi chết. */
function vieneuWorker(root){
  const python=path.join(VIENEU_DIR,'.venv','Scripts','python.exe');
  let child=null,ready=null,seq=0,lastError=null;const pending=new Map();
  function start(){
    if(!fs.existsSync(python))return Promise.reject(Error(`Không thấy VieNeu tại ${VIENEU_DIR}.`));
    child=spawn(python,[path.join(root,'scripts','vieneu_worker.py')],{windowsHide:true,cwd:VIENEU_DIR,stdio:['pipe','pipe','ignore'],env:{...process.env,PYTHONIOENCODING:'utf-8',HF_HUB_OFFLINE:'1',HF_HUB_DISABLE_PROGRESS_BARS:'1'}});
    const me=child;
    ready=new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>{reject(Error('VieNeu nạp model quá lâu.'));me.kill();},90000);
      readline.createInterface({input:me.stdout}).on('line',line=>{
        let msg;try{msg=JSON.parse(line);}catch{return;}
        if(msg.ready){clearTimeout(timer);resolve();return;}
        const job=pending.get(msg.id);if(!job)return;pending.delete(msg.id);clearTimeout(job.timer);
        msg.ok?job.resolve():job.reject(Error('VieNeu lỗi: '+msg.error));
      });
      me.on('error',err=>{clearTimeout(timer);reject(err);});
      me.on('exit',()=>{clearTimeout(timer);reject(Error('VieNeu đã dừng.'));if(child===me){child=null;ready=null;}
        for(const [id,job]of pending){clearTimeout(job.timer);job.reject(Error('VieNeu đã dừng giữa chừng.'));pending.delete(id);}});
    });
    me.stdin.on('error',()=>{});
    ready.catch(err=>{lastError=err;});
    return ready;
  }
  return {
    warm(){if(!ready)start().catch(()=>{});},
    async synth(segments,output){
      await (ready||start());
      if(!child)throw Error('VieNeu đã dừng.');
      const id=String(++seq);
      return new Promise((resolve,reject)=>{
        const timer=setTimeout(()=>{pending.delete(id);reject(Error('VieNeu chưa phản hồi.'));},30000);
        pending.set(id,{resolve,reject,timer});
        child.stdin.write(JSON.stringify({id,segments,output})+'\n');
      });
    },
    get lastError(){return lastError;},
    stop(){child?.kill();child=null;ready=null;}
  };
}

function edgeSynth(root,text,output){
  return new Promise((resolve,reject)=>{
    const child=spawn(process.env.VAN_HAI_PYTHON||'python',[path.join(root,'scripts/speak.py')],{windowsHide:true,stdio:['pipe','ignore','ignore']});
    let done=false;const timer=setTimeout(()=>{child.kill();finish(Error('Dịch vụ giọng Edge chưa phản hồi.'));},18000);
    function finish(err){if(done)return;done=true;clearTimeout(timer);err?reject(err):resolve();}
    child.on('error',finish);child.stdin.on('error',()=>{});
    child.on('close',code=>finish(code!==0||!fs.existsSync(output)?Error('Không tạo được giọng Edge.'):null));
    child.stdin.end(JSON.stringify({text,output}));
  });
}

/**
 * Engine: VAN_HAI_TTS=vieneu (mặc định, local, giọng tông sư) | edge (online) | off.
 * VieNeu lỗi → tự dùng edge-tts để LIVE không mất tiếng.
 */
export function createSpeech(root,dataDir){
  const engine=(process.env.VAN_HAI_TTS||'vieneu').toLowerCase();
  const dir=path.join(dataDir,'speech');fs.mkdirSync(dir,{recursive:true});
  const vieneu=engine==='vieneu'?vieneuWorker(root):null;
  const jobs=new Map();let active=0,lastClean=0;
  async function speech(e){
    if(engine==='off')throw Error('Giọng đọc đang tắt (VAN_HAI_TTS=off).');
    // v75: kế hoạch đọc nhiều đoạn, mỗi đoạn một giọng (tông sư / tiên nữ / trọng tài)
    const important=(e.gift&&Number(e.coins)>0&&!e.simulated&&!e.autoRose)||e.heavenStrike||isEventAnnouncement(e);
    return synthPlan(speechPlan(e),important);
  }
  // 08/11: dùng chung cho câu đầy đủ và mảnh ghép làm sẵn (tên người chơi, câu cảm ơn quà).
  async function synthPlan(plan,important=false){
    if(engine==='off')throw Error('Giọng đọc đang tắt (VAN_HAI_TTS=off).');
    const text=plan.map(x=>x.text).join(' '),key=createHash('sha256').update(engine+'|v3|'+JSON.stringify(plan)).digest('hex');
    const output=path.join(dir,key+'.mp3');
    if(fs.existsSync(output))return output;
    if(jobs.has(key))return jobs.get(key);
    // 07/11/2026: quà thật và thông báo sự kiện được xếp hàng chờ (tối đa 3) thay vì bị trả 'đang bận' → không còn đọc câu chung chung.
    if(active>=(important?3:1))throw Error('Giọng đọc đang bận; dùng phản hồi nhanh.');
    active++;
    const tmp=output+'.tmp';
    const promise=(async()=>{
      try{
        if(vieneu){try{await vieneu.synth(plan,tmp);}catch(err){fs.rmSync(tmp,{force:true});console.error('[giọng] VieNeu lỗi, dùng Edge:',err.message);await edgeSynth(root,text,tmp);}}
        else await edgeSynth(root,text,tmp);
        fs.renameSync(tmp,output);return output;
      }catch(err){fs.rmSync(tmp,{force:true});throw Error('Không tạo được giọng đọc. '+err.message);}
    })().finally(()=>{active--;jobs.delete(key);});
    jobs.set(key,promise);
    // Giới hạn cache: giữ 900 clip mới nhất (08/11: thêm mảnh ghép tên + quà).
    if(Date.now()-lastClean>60000){lastClean=Date.now();const files=fs.readdirSync(dir).filter(f=>f.endsWith('.mp3')).map(f=>({f,t:fs.statSync(path.join(dir,f)).mtimeMs})).sort((a,b)=>b.t-a.t);
    for(const {f}of files.slice(899))fs.rmSync(path.join(dir,f),{force:true});
    }
    return promise;
  }
  speech.plan=synthPlan;
  speech.cached=plan=>{const key=createHash('sha256').update(engine+'|v3|'+JSON.stringify(plan)).digest('hex'),file=path.join(dir,key+'.mp3');return fs.existsSync(file)?file:null;};
  speech.warm=()=>vieneu?.warm();
  speech.stop=()=>vieneu?.stop();
  speech.engine=engine;
  Object.defineProperty(speech,'busy',{get:()=>active>0});
  return speech;
}
