import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,action,startArenaEvent} from '../engine.mjs';
import {tickArena} from '../arena.mjs';
import {SKIN_CUT_MS,PET_CUT_MS,signatureSkinOf,petUltOf,SIGNATURE_ULTS} from '../public/signature-ults.js';
import {findCut,cutFull,CUT_PHASE} from '../public/skill-cutscene.js';

const N=Date.UTC(2026,10,17,12);
const c={emit:(w,p,m,e,at,x={})=>{w.events.push({message:m,effect:e,at,...x});},active:()=>true,technique:()=>({id:'stars',name:'Tinh Hà Luân Chuyển'})};
function setup(skinA,petA){
 const w=createWorld('demo');Object.assign(w.settings,{residents:false,autoEvents:false,scheduledCompetitions:false,heartPlay:false});w.nextBossAt=N+1e10;
 for(const [id,q] of [['a',1e7],['b',1.02e7]]){const p=ensurePlayer(w,id,id.toUpperCase(),N);Object.assign(p,{totalQi:q,realm:8,qi:0,lastActive:N});}
 const a=w.players.a;if(skinA){a.rewardSkins=[skinA];a.skinChoice=skinA;}if(petA){a.spiritPets=[petA];a.spiritPet=petA;}
 assert.equal(startArenaEvent(w,N).ok,true);
 for(const id of ['a','b'])action(w,{type:'chat',userId:id,name:id.toUpperCase(),text:'lên đài'},N+10);
 return w;
}
function run(w){let t=N+20,log=[],m;for(let i=0;i<1200;i++){t+=250;tickArena(w,t,c);if(w.arena.current){m=w.arena.current;for(const e of m.log)if(!log.some(x=>x.n===e.n))log.push(e);}else if(m)break;}return {log,m,t};}

test('chỉ skin ≥300 coin đang mặc + đã sở hữu mới có chiêu riêng',()=>{
 assert.equal(Object.keys(SIGNATURE_ULTS).length,9); // 19/11: + Tinh Hà Kiếm Đế, Bích Lân Độc Hậu · 20/11: + Tuyết Phách Tiên Hậu
 assert.equal(signatureSkinOf({skinChoice:'nhan-qua-vuong-lam',rewardSkins:['nhan-qua-vuong-lam']}),'nhan-qua-vuong-lam');
 assert.equal(signatureSkinOf({skinChoice:'nhan-qua-vuong-lam',rewardSkins:[]}),null);
 assert.equal(signatureSkinOf({skinChoice:'tudo-ma-ton',rewardSkins:['tudo-ma-ton']}),null,'skin 200 coin không có');
 assert.equal(petUltOf({spiritPet:'ky-lan',spiritPets:['ky-lan']}),'ky-lan');
 assert.equal(petUltOf({spiritPet:'jade-rabbit',spiritPets:['jade-rabbit']}),null,'thú thường không có');
});

test('tuyệt kỹ skin đặc biệt được chiếu riêng 1 lần/trận và trận hoãn đúng thời gian chiếu (không đòn nào chen vào)',()=>{
 const w=setup('khuy-niet-loi-ton');const {log}=run(w);
 const cuts=log.filter(e=>e.cut?.kind==='skin');
 assert.equal(cuts.length,1,'đúng 1 lần chiếu riêng');
 const e=cuts[0];assert.equal(e.by,'a');assert.equal(e.slot,5);assert.equal(e.cut.skin,'khuy-niet-loi-ton');assert.equal(e.cut.ms,SKIN_CUT_MS);
 const during=log.filter(x=>x.n!==e.n&&x.at>e.at&&x.at<e.at+SKIN_CUT_MS);
 assert.equal(during.length,0,'không đòn/độc nào trong lúc chiếu');
 assert.ok(log.filter(x=>x.slot===5&&x.by==='a').length<=2);
});

test('chiêu linh thú ≥200 coin chiếu riêng ngắn hơn; thú thường thì không',()=>{
 const w=setup(null,'bach-nguyet-ho');const {log}=run(w);
 const pet=log.filter(e=>e.cut?.kind==='pet');
 assert.ok(pet.length<=1);if(pet.length){assert.equal(pet[0].slot,4);assert.equal(pet[0].cut.ms,PET_CUT_MS);assert.equal(pet[0].cut.pet,'bach-nguyet-ho');}
 const w2=setup(null,'jade-rabbit');assert.equal(run(w2).log.filter(e=>e.cut).length,0);
});

test('hạ gục bằng đòn chiếu riêng: chờ chiếu xong mới báo thắng',()=>{
 const w=setup('nhan-qua-vuong-lam');
 // đối thủ gần chết để tuyệt kỹ đầu tiên hạ gục
 let t=N+20,cutEntry=null,finishedAt=null;
 for(let i=0;i<1200;i++){t+=100;const m=w.arena.current;if(m&&now0(m))m.fighters.b.hp=Math.min(m.fighters.b.hp,m.fighters.b.maxHp*.02);
  tickArena(w,t,c);const cur=w.arena.current;if(cur&&!cutEntry)cutEntry=cur.log.find(e=>e.cut);if(cutEntry&&!cur){finishedAt=t;break;}}
 function now0(m){return m.fighters.a.rage>=90;}
 assert.ok(cutEntry,'có đòn chiếu riêng');
 if(cutEntry.ko)assert.ok(finishedAt>=cutEntry.at+cutEntry.cut.ms,'không báo thắng giữa lúc chiếu');
});

test('client: pha toàn màn chỉ trong khoảng giữa, có vào/ra + dư ảnh',()=>{
 const e={n:1,at:1000,cut:{kind:'skin',skin:'nhan-qua-vuong-lam',ms:SKIN_CUT_MS}};
 assert.equal(findCut([e],900),null);
 assert.equal(cutFull(findCut([e],1000+SKIN_CUT_MS*.02)),false,'đang chém vào');
 assert.equal(cutFull(findCut([e],1000+SKIN_CUT_MS*.5)),true);
 assert.equal(cutFull(findCut([e],1000+SKIN_CUT_MS*(CUT_PHASE.wipeOut+.03))),false,'đang mở lại sân');
 assert.ok(findCut([e],1000+SKIN_CUT_MS+500),'dư ảnh sau khi chiếu');
});

test('quà trợ chiêu ≥99 coin được chiếu riêng (18/11: hạ từ 499), không chồng lên màn đang chiếu; quà nhỏ thì không',async()=>{
 const {arenaGift}=await import('../arena.mjs');const {GIFT_CUT_MS}=await import('../public/signature-ults.js');
 const w=setup(null);let t=N+20;for(let i=0;i<40&&!(w.arena.current&&t>=w.arena.current.fightAt);i++){t+=250;tickArena(w,t,c);}
 const m=w.arena.current;assert.ok(m);
 const small=arenaGift(w,w.players.a,30,t);assert.equal(small.cut,undefined);
 const big=arenaGift(w,w.players.a,500,t+10);assert.equal(big.cut.kind,'gift');assert.equal(big.cut.ms,GIFT_CUT_MS);assert.equal(big.at,t+10);
 const big2=arenaGift(w,w.players.b,2000,t+20);assert.equal(big2.cut.kind,'gift');assert.ok(big2.at>=big.at+GIFT_CUT_MS,'xếp sau màn đang chiếu');
 assert.ok(m.next.a>=big2.at+GIFT_CUT_MS&&m.next.b>=big2.at+GIFT_CUT_MS,'đòn thường hoãn tới khi chiếu xong');
});

test('18/11: thần thông bản mệnh — pháp bảo Bảo Khố phát theo nhịp hồi, 5★/GIỚI HẠN chiếu riêng lần đầu mỗi trận',async()=>{
 const {BAO_PROC,BAO_CUT_MS,baoBanMenh}=await import('../public/phap-bao-data.js');
 assert.equal(baoBanMenh({bao:{items:{'s4-kiem':2,'s5-chung':1}}}).id,'s5-chung','mặc định món bậc cao nhất');
 assert.equal(baoBanMenh({bao:{items:{'s4-kiem':2,'s5-chung':1},ban:'s4-kiem'}}).id,'s4-kiem','ghim thì theo ghim');
 const w=setup(null);w.players.a.bao={p4:0,p5:0,items:{'s5-an':1},lim:null};
 const {log}=run(w);const procs=log.filter(e=>e.bao&&e.by==='a');
 assert.ok(procs.length>=2,'phát nhiều lần trong trận: '+procs.length);
 for(let i=1;i<procs.length;i++)assert.ok(procs[i].at-procs[i-1].at>=BAO_PROC[5].cd,'đúng nhịp hồi');
 assert.equal(procs.filter(e=>e.cut?.kind==='bao').length,1,'chiếu riêng đúng 1 lần');assert.equal(procs.find(e=>e.cut).cut.ms,BAO_CUT_MS[5]);
 assert.ok(procs.some(e=>e.stun),'Ấn = choáng');assert.ok(procs.every(e=>e.skill.bao==='s5-an'));
 assert.ok(!log.some(e=>e.bao&&e.by==='b'),'không có thần khí thì không phát');
});

test('18/11: lệnh bản mệnh — xem, đổi theo số, hồi 10 phút; "thần khí" có dấu cách vẫn nhận',async()=>{
 const {baoBanMenhCommand,BAN_MENH_CD}=await import('../phap-bao.mjs');const {commandWords}=await import('../engine.mjs');
 assert.deepEqual(commandWords('thần khí'),['thankhi']);assert.deepEqual(commandWords('bản mệnh 2'),['banmenh','2']);
 const p={name:'A',bao:{p4:0,p5:0,items:{'s4-kiem':1,'s5-dinh':2},lim:null}};
 assert.match(baoBanMenhCommand(p,'',N).message,/Cửu Long Thần Đỉnh/);
 assert.equal(baoBanMenhCommand(p,'2',N).ok,true);assert.equal(p.bao.ban,'s4-kiem');
 assert.equal(baoBanMenhCommand(p,'1',N+1000).ok,false,'đang hồi');assert.equal(baoBanMenhCommand(p,'1',N+BAN_MENH_CD+1).ok,true);
 assert.equal(baoBanMenhCommand({name:'B'},'',N).ok,false);
});

test('18/11: 12 chiêu GIỚI HẠN — mỗi món có chiêu riêng, vẽ mọi mốc không lỗi, màn dài 9,5 s',async()=>{
 const {BAO_ULTS,drawBaoUlt,BAO_ULT_MS}=await import('../public/bao-ults.js');const {BAO_ITEMS,BAO_CUT_MS}=await import('../public/phap-bao-data.js');
 const lim=BAO_ITEMS.filter(x=>x.tier===6);assert.equal(lim.length,12);for(const it of lim)assert.ok(BAO_ULTS[it.id]?.move,'thiếu chiêu '+it.id);
 assert.equal(new Set(Object.values(BAO_ULTS).map(u=>u.move)).size,12,'tên chiêu không trùng');assert.equal(BAO_CUT_MS[6],BAO_ULT_MS);
 const g={addColorStop(){}},c=new Proxy({},{get(t,k){if(k in t)return t[k];if(k==='canvas')return null;if(/^create/.test(k))return ()=>g;if(k==='measureText')return ()=>({width:50});return ()=>{};},set(t,k,v){t[k]=v;return true;}});
 const scene={budget:{level:'full'},motion:true};
 for(const it of lim)for(const sec of [.2,1,2.5,3.5,4.5,5.5,6.45,6.55,7,8,9.2]){const e={n:3,by:'a',to:'b',dmg:999,ko:false,cut:{kind:'bao',bao:it.id,tier:6,ms:BAO_ULT_MS}};
  assert.doesNotThrow(()=>drawBaoUlt(scene,c,1e6,1600,{e,age:sec*1000,k:sec*1000/BAO_ULT_MS,ms:BAO_ULT_MS},new Map()),it.id+' @'+sec);}
});
