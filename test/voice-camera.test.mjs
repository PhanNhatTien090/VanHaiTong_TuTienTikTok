import {test} from 'node:test';
import assert from 'node:assert/strict';
import {VoiceQueue,priority} from '../public/voice.js';
import {Scene} from '../public/scene.js';
import {announcement} from '../speech.mjs';

test('announcements describe identity and action rather than reading raw chat',()=>{
  const e={name:'Minh 🌸',effect:'join',text:'anything'};
  assert.match(announcement(e),/đạo hữu Minh gia nhập/i);
  assert.match(announcement({...e,effect:'qi',text:'Luận đạo cùng đồng môn • +3 tu vi'}),/Đạo hữu Minh vừa luận đạo/);
  assert.match(announcement({...e,effect:'petal',text:'Linh hoa ×3 • +36 tu vi • cảm ơn đạo hữu'}),/Đa tạ đạo hữu Minh.*ghi nhận tâm ý/);
});

test('voice flood stays bounded and protects important events; mute clears pending actions',()=>{
  const audio={enabled:true,duck(){}};const q=new VoiceQueue({world:'demo',audio});q.running=true;
  q.add({id:'gift',user:'giver',effect:'dragon',text:'cảm ơn đạo hữu'});
  for(let i=0;i<30;i++)q.add({id:String(i),user:String(i),effect:'qi'});
  assert.equal(q.queue.length,3,'routine lines stop once 3 are waiting (v54)');assert.ok(q.queue.some(x=>x.e.id==='gift'));
  q.add({id:'bt',user:'b',effect:'breakthrough',text:'ĐỘT PHÁ KIM ĐAN'});assert.ok(q.queue.some(x=>x.e.id==='bt'),'important lines still queue');
  assert.ok(priority(q.queue[0].e)>=1);
  q.stop();assert.equal(q.queue.length,0);assert.equal(q.running,false);
  q.enabled=false;q.add({id:'muted',effect:'join'});assert.equal(q.queue.length,0);
});

test('camera eases to the named character, stays inside scenery, then returns',()=>{
  const s=Object.create(Scene.prototype);Object.assign(s,{height:1600,motion:true,cameraEnabled:true,targets:[{id:'p',x:180,y:900}],camera:{s:1,x:0,y:0},cameraTime:0,focusId:'p',focusUntil:10000});
  for(let t=32;t<5000;t+=32){const c=s.moveCamera(t);assert.ok(c.s>=1&&c.s<=1.55);assert.ok(c.x<=0&&c.x>=900*(1-c.s)-.001);assert.ok(c.y<=0&&c.y>=1600*(1-c.s)-.001);}
  assert.ok(s.camera.s>1.54);
  for(let t=11000;t<23000;t+=32)s.moveCamera(t);
  assert.ok(s.camera.s<1.05);
  s.motion=false;for(let t=23000;t<36000;t+=32)s.moveCamera(t);
  assert.ok(Math.abs(s.camera.s-1)<.001);
});

test('crowded scenes focus on each individual effect and return to the wide idle view',()=>{
  const s=Object.create(Scene.prototype);Object.assign(s,{height:1600,motion:true,cameraEnabled:true,zoom:1,realPlayers:Array.from({length:24},(_,i)=>({id:'p'+i})),targets:[{id:'p0',x:180,y:900}],camera:{s:1,x:0,y:0},cameraTime:0,focusId:'p0',focusUntil:6000});
  for(let t=32;t<5000;t+=32)s.moveCamera(t);assert.ok(s.camera.s>1.5);
  for(let t=7000;t<19000;t+=32)s.moveCamera(t);assert.ok(s.camera.s<1.01);
  for(const presentation of [{id:'p0',kind:'breakthrough',until:30000},{id:'p0',spectacle:true,until:30000}]){
    s.presentation=presentation;s.focusUntil=30000;s.cameraTime=19000;s.camera={s:1,x:0,y:0};
    for(let t=19032;t<24000;t+=32)s.moveCamera(t);assert.ok(s.camera.s>1.3,'large effects zoom beyond the 100% idle view');
  }
  s.presentation=null;s.focusUntil=0;for(let t=31000;t<43000;t+=32)s.moveCamera(t);assert.ok(s.camera.s<1.01);
});

test('stopping an in-flight voice prevents stale playback and camera callback',async()=>{
  const originalFetch=globalThis.fetch;let resolveFetch,started=0;
  globalThis.fetch=()=>new Promise(r=>resolveFetch=r);
  const q=new VoiceQueue({world:'demo',audio:{enabled:true,duck(){}},onStart:()=>started++});
  try{q.add({id:'cancel',effect:'join'});q.stop();resolveFetch({ok:true,blob:async()=>new Blob(['audio'])});await new Promise(r=>setImmediate(r));assert.equal(started,0);assert.equal(q.running,false);}finally{globalThis.fetch=originalFetch;}
});

test('plaza stays wide despite legacy zoom URL; deliberate focus stays in bounds',()=>{
  const s=Object.create(Scene.prototype);Object.assign(s,{height:1600,floorY:860,motion:true,cameraEnabled:true,zoom:1.3,targets:[{id:'p',x:820,y:1000}],camera:{s:1,x:0,y:0},cameraTime:0,focusId:null,focusUntil:0});
  for(let t=32;t<8000;t+=32){const c=s.moveCamera(t);assert.ok(c.x<=0&&c.x>=900*(1-c.s)-.001);assert.ok(c.y<=0&&c.y>=1600*(1-c.s)-.001);}
  assert.ok(Math.abs(s.camera.s-1)<.002,'idle stays wide');
  s.focusId='p';s.focusUntil=1e9;for(let t=8000;t<14000;t+=32)s.moveCamera(t);
  assert.ok(s.camera.s>1.6,'focus zooms beyond the base');
  s.cameraEnabled=false;s.focusUntil=0;for(let t=14000;t<26000;t+=32)s.moveCamera(t);
  assert.ok(Math.abs(s.camera.s-1)<.01,'camera off returns to the full plaza');
});

test('idle lines play only when nothing else is speaking',async()=>{
  const {IDLE_LINES}=await import('../public/idle-lines.js');
  assert.ok(IDLE_LINES.length>0&&IDLE_LINES.every(l=>l.file.startsWith('/assets/idle/')&&l.text.length<120));
  let played=0;const q=new VoiceQueue({world:'demo',audio:{enabled:true,duck(){}}});q.play=async()=>{played++;};
  q.running=true;assert.equal(await q.idle(IDLE_LINES[0]),false);
  q.running=false;q.queue=[{e:{id:'x',effect:'join'},at:Date.now()}];assert.equal(await q.idle(IDLE_LINES[0]),false);
  q.queue=[];assert.equal(await q.idle(IDLE_LINES[0]),true);assert.equal(played,1);
});

test('resident cultivators act on their own, break through, attack bosses, and never outrank viewers',async()=>{
  const {nextAct,RESIDENT_VOICES}=await import('../public/resident-acts.js');
  const realms=['Phàm Nhân','Luyện Khí','Trúc Cơ','Kim Đan','Nguyên Anh'];const progress={};let seed=1;const rng=()=>((seed=seed*16807%2147483647)/2147483647);
  const kinds=new Set();for(let i=0;i<300;i++){const a=nextAct(progress,{realms,rng});kinds.add(a.kind);assert.ok(a.resident&&a.user.startsWith('resident:')&&a.effect);}
  for(const k of ['sword','lotus','dragon','learn','breakthrough'])assert.ok(kinds.has(k),k);
  assert.ok(Object.values(progress).every(p=>p.realm<=realms.length-1),'never beyond the last realm');
  let attacks=0;for(let i=0;i<60;i++)if(nextAct(progress,{realms,boss:true,rng}).kind==='attack')attacks++;assert.ok(attacks>25);
  assert.ok(RESIDENT_VOICES.every(v=>v.file.startsWith('/assets/resident/')));
  const q=new VoiceQueue({world:'demo',audio:{enabled:true,duck(){}}});q.running=true;
  q.add({id:'r1',resident:true,user:'resident:x',effect:'sword',file:'/a.mp3'});
  q.add({id:'v1',user:'viewer',effect:'join'});
  q.add({id:'r2',resident:true,user:'resident:y',effect:'sword',file:'/b.mp3'});
  assert.deepEqual(q.queue.map(x=>x.e.id),['r1','v1'],'resident voice waits behind viewers and never piles up');
  assert.equal(priority({resident:true,effect:'breakthrough'}),0);
});
