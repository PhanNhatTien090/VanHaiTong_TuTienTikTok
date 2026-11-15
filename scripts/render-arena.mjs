// Xem thử Vân Hải Lôi Đài offline: mô phỏng 1 trận bằng server thật rồi vẽ khung hình. node scripts/render-arena.mjs [out] [giây...]
import fs from 'node:fs';import {createCanvas,loadImage} from '@napi-rs/canvas';
import {createWorld,ensurePlayer,snapshot} from '../engine.mjs';
import {startArena,arenaCommand,tickArena} from '../arena.mjs';
import {drawArena,arenaTargets} from '../public/arena-stage.js';
const out=process.argv[2]||'output/arena';fs.mkdirSync(out,{recursive:true});
const times=process.argv.slice(3).map(Number).filter(Number.isFinite);
const N=Date.UTC(2026,10,15,13),W=900,H=1600;
const w=createWorld('demo');Object.assign(w.settings,{residents:false,autoEvents:false,scheduledCompetitions:false});w.nextBossAt=N+1e10;
const mk=(id,name,q,realm,extra={})=>Object.assign(ensurePlayer(w,id,name,N),{totalQi:q,realm,lastActive:N,...extra});
mk('a','Tu chân giả',2.1e7,9,{spiritPet:'loi-oa',spiritPets:['loi-oa']});mk('b','Hắc Vũ',2.3e7,10,{spiritPet:'ky-lan',spiritPets:['ky-lan']});
for(let i=0;i<22;i++)mk('f'+i,'Khán giả '+(i+1),1e5*(i+1),i%12);
const c={emit:(w2,p,m,e,at,x={})=>w.events.push({message:m,effect:e,at,...x}),active:()=>true,technique:p=>p.id==='a'?{id:'thunder',name:'Cửu Tiêu Thần Lôi'}:{id:'flame',name:'Xích Phượng Liệt Diễm'}};
startArena(w,N,c);arenaCommand(w,w.players.a,'lendai','',N,c);arenaCommand(w,w.players.b,'lendai','',N+10,c);
for(let i=0;i<8;i++)arenaCommand(w,w.players['f'+i],'cv'+(i%2+1),'',N+3000+i,c);
tickArena(w,N+1500,c);
const bg=await loadImage('public/assets/arena-v1/loi-dai-night.webp');
const body=await loadImage('public/assets/realm-skins-v2/kim-dan/male-standing-v1.png');
const fem=await loadImage('public/assets/realm-skins-v2/kim-dan/female-standing-v1.png');
const m=w.arena.current;
const shots=times.length?times:[1.5,4,7,10,14,18];
for(const s of shots){
 const t=N+1500+s*1000;
 // tick server tới thời điểm này (giữ nhật ký đầy đủ)
 for(let x=w._simAt||N+1500;x<=t;x+=250)tickArena(w,x,c);w._simAt=t;
 const state=snapshot(w,t);const arena=state.arena;if(!arena){console.log('arena closed at',s);continue;}
 const canvas=createCanvas(W,H),ctx=canvas.getContext('2d');ctx.drawImage(bg,0,0,W,H*(bg.height/bg.width)*W/W>H?H:W*bg.height/bg.width);
 const scene={height:H,motion:true,budget:{level:'high'},arena,arenaClockOffset:0,lastState:state,onCombatSound(){},onFeedbackSound(){}};
 const actors=(state.socialStage||[]).map(id=>state.players.find(p=>p.id===id)).filter(Boolean);
 const audience=state.players.filter(p=>p.id.startsWith('f'));
 scene.targets=arenaTargets(scene,actors,audience,H);
 const realNow=Date.now;Date.now=()=>t;
 drawArena(scene,ctx,t,'back');
 for(const tg of [...scene.targets].sort((p,q)=>p.y-q.y)){const h=150*tg.scale*.62,im=tg.id==='b'||tg.id.endsWith('1')?fem:body;ctx.save();if(tg.facing<0){ctx.translate(tg.x,0);ctx.scale(-1,1);ctx.translate(-tg.x,0);}ctx.drawImage(im,tg.x-h*.33,tg.y-h*.97,h*.66,h);ctx.restore();}
 drawArena(scene,ctx,t,'front');
 Date.now=realNow;
 fs.writeFileSync(`${out}/arena-${s}.png`,canvas.toBuffer('image/png'));
}
console.log('ok',out,'log',m.log.length,'result',w.arena.lastResult?.winner);
