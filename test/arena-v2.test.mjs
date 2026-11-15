import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createCanvas} from '@napi-rs/canvas';
import {createWorld,ensurePlayer,action,snapshot,startArenaEvent} from '../engine.mjs';
import {arenaCommand,tickArena,arenaGift} from '../arena.mjs';
import {ARENA_BOOKS,bookLoadout,findBook} from '../public/arena-books.js';
import {arenaKit,hanhBeats} from '../public/arena-skills.js';
import {drawArena,arenaTargets,ARENA_GUIDES,ARENA_COMMANDS} from '../public/arena-stage.js';
import {bannerTier,bannerPlan,TIER4_GAP_MS} from '../public/skill-banner.js';

const N=Date.UTC(2026,10,15,14);
const c={emit:(w,p,m,e,at,x={})=>w.events.push({text:m,effect:e,at,...x}),active:()=>true,technique:p=>({id:p.id==='a'?'thunder':'flame',name:'x'})};
function world(){const w=createWorld('demo');Object.assign(w.settings,{residents:false,autoEvents:false,scheduledCompetitions:false});w.nextBossAt=N+1e10;return w;}
const player=(w,id,q,extra={})=>Object.assign(ensurePlayer(w,id,id.toUpperCase(),N),{totalQi:q,realm:9,lastActive:N,...extra});
const chat=(w,id,text,at)=>action(w,{type:'chat',userId:id,name:id.toUpperCase(),text},at);

test('12 bí pháp: học bằng linh thạch + thảo, bậc cao cần cảnh giới + huy chương (không trừ), tự xếp 2 bí pháp mạnh nhất',()=>{
 assert.equal(ARENA_BOOKS.length,12);assert.ok(ARENA_BOOKS.every(b=>b.power<=1.12));
 const w=world(),p=player(w,'a',1e7,{stones:30000,herbs:3000,tournamentMedals:20});let t=N;
 assert.equal(chat(w,'a','học khai thiên cự phủ',t+=20000).ok,true);
 assert.equal(chat(w,'a','học độc long vụ',t+=20000).ok,true);
 assert.equal(chat(w,'a','học thương hải nộ đào',t+=20000).ok,true);
 assert.equal(p.tournamentMedals,20);assert.equal(p.stones,30000-8000-900-2500);
 assert.deepEqual(bookLoadout(p).map(b=>b.id),['khai-thien','no-dao']);
 assert.equal(chat(w,'a','chiêu đổi độc long',t+=20000).ok,true);
 assert.deepEqual(bookLoadout(p).map(b=>b.id),['doc-long','khai-thien']);
 const kit=arenaKit(p,undefined,bookLoadout(p));assert.equal(kit[1].name,'Độc Long Vụ');assert.equal(kit[1].art,'poison');assert.equal(kit[2].art,'axe');
 const poor=player(w,'b',1e7,{stones:100,herbs:0,realm:1});
 assert.equal(chat(w,'b','học khai thiên cự phủ',t+=20000).ok,false);
 // "học" bí pháp tu luyện cũ vẫn đi đường cũ
 Object.assign(p,{stones:5000,herbs:500});chat(w,'a','học vạn kiếm quy tông',t+=20000);assert.ok((p.manuals||[]).includes('sword'));
 assert.equal(findBook('Đ'),null);
});

test('ngũ hành khắc vòng tròn; trận có trạng thái (độc, giảm công, đẩy lùi, phá khiên, phản đòn) và liên chiêu',()=>{
 assert.ok(hanhBeats('kim','moc')&&hanhBeats('moc','tho')&&hanhBeats('tho','thuy')&&hanhBeats('thuy','hoa')&&hanhBeats('hoa','kim'));
 const seen=new Set();
 for(let i=0;i<30;i++){const w=world();player(w,'a',1e7,{arenaBooks:['doc-long','kim-cuong']});player(w,'b',1e7,{arenaBooks:['nhu-y','phong-bao']});const t0=N+i*1e6;
  startArenaEvent(w,t0);arenaCommand(w,w.players.a,'lendai','',t0,c);arenaCommand(w,w.players.b,'lendai','',t0,c);tickArena(w,t0+2000,c);let t=t0+2000;
  while(w.arena.current&&t<t0+60000){t+=250;tickArena(w,t,c);for(const e of w.arena.current?.log||[])for(const k of ['burn','dot','weaken','knock','broke','reflectOn','combo','counter'])if(e[k])seen.add(k);}}
 for(const k of ['burn','dot','knock','reflectOn','combo'])assert.ok(seen.has(k),k);
});

test('bảng chiêu theo bậc: thường 1, bí pháp ≥2, linh thú 3, tuyệt kỹ 4; bậc 4 tối đa 1 lần/20 s',()=>{
 assert.equal(bannerTier({slot:1}),1);assert.equal(bannerTier({slot:2,tier:1}),2);assert.equal(bannerTier({slot:3,tier:4}),4);assert.equal(bannerTier({slot:4}),3);assert.equal(bannerTier({slot:5}),4);assert.equal(bannerTier({gift:true,tier:4}),4);
 const scene={};assert.equal(bannerPlan(scene,{n:1,at:1,slot:5},1000).tier,4);
 assert.equal(bannerPlan(scene,{n:2,at:2,slot:5},1000+TIER4_GAP_MS-1).tier,3);
 assert.equal(bannerPlan(scene,{n:3,at:3,slot:5},1000+TIER4_GAP_MS+1).tier,4);
});

test('bảng hướng dẫn lúc đấu: lệnh + quà trợ chiêu (ảnh quà, không số xu) + cơ chế + 5 ô chiêu',()=>{
 for(const k of ['lên đài','thách + tên','c1 – c5','cv1 · cv2','chiêu'])assert.ok(ARENA_COMMANDS.some(r=>r[0]===k),k);
 const gift=ARENA_GUIDES.find(g=>/QUÀ TRỢ CHIÊU/.test(g.title));assert.equal(gift.rows.length,5);
 for(const [k,v] of gift.rows){assert.match(k,/^@/);assert.doesNotMatch(k+' '+v,/(^|\s)xu(\s|$)|coin|\d{2,}/i);}
});

test('vẽ Lôi Đài với mọi loại đòn (choáng, độc, quà 5 bậc, bí pháp có ảnh) không lỗi và trả canvas sạch',()=>{
 const w=world();player(w,'a',1e7,{arenaBooks:['khai-thien','doc-long']});player(w,'b',1e7,{arenaBooks:['phong-bao','kim-cuong']});
 startArenaEvent(w,N);arenaCommand(w,w.players.a,'lendai','',N,c);arenaCommand(w,w.players.b,'lendai','',N,c);tickArena(w,N+2000,c);
 const m=w.arena.current;let t=m.fightAt;for(const v of [1,10,99,500,2000])arenaGift(w,w.players.a,v,t+=10);
 m.log.push({n:900,at:t,by:'b',to:'a',stunned:true},{n:901,at:t,by:'a',to:'b',dot:true,dmg:100,hpTo:1,hpBy:1,skill:{name:'Độc khí',tech:'soul'}});
 const H=1600,ctx=createCanvas(900,H).getContext('2d');
 for(let dt=0;dt<4000;dt+=137){const now=t+1200+dt,state=snapshot(w,now);const scene={height:H,motion:true,budget:{level:'high'},arena:state.arena,arenaClockOffset:now-Date.now(),lastState:state,onCombatSound(){},onFeedbackSound(){},onCinematicSound(){}};
  scene.targets=arenaTargets(scene,(state.socialStage||[]).map(id=>state.players.find(p=>p.id===id)).filter(Boolean),[],H);
  drawArena(scene,ctx,dt,'back');drawArena(scene,ctx,dt,'front');assert.equal(ctx.globalAlpha,1);}
});
