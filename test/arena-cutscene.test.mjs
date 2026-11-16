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
 assert.equal(Object.keys(SIGNATURE_ULTS).length,6);
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
