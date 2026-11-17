import {test} from 'node:test';import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,action,tick,snapshot,startBaoKhoEvent,BIG_EVENTS} from '../engine.mjs';
import {rollBao,BAO_ODDS,baoKhoView,queueReveal,REVEAL_MS} from '../phap-bao.mjs';
import {speechPlan} from '../speech-lines.mjs';
import {syncBaoKho,drawBaoKho,findReveal,drawGoldReveal,drawLimitedReveal} from '../public/bao-kho.js';
import {BAO_PITY4,BAO_PITY5,BAO_EVENT_MS,BAO_FREE_CD} from '../public/phap-bao-data.js';
const N=1800000000000;
const world=()=>{const w=createWorld('live');Object.assign(w.settings,{residents:false,autoEvents:false,blessingMinutes:0});w.nextBossAt=N+1e10;return w;};
const miss=()=>.999999; // không bao giờ trúng ngẫu nhiên → chỉ còn bảo hiểm

test('bảo hiểm: 4★ chắc chắn trong mỗi 10 lượt, 5★ trong 80 lượt; trượt không lưu đồ',()=>{
 const w=world(),p=ensurePlayer(w,'a','A',N);const got=[];
 for(let i=1;i<=BAO_PITY5;i++)got.push(rollBao(w,p,'free',miss).tier);
 assert.ok(got.slice(0,9).every(t=>t===0),'9 lượt đầu trượt');assert.equal(got[9],4,'lượt 10 chắc 4★');
 for(let i=0;i+10<=got.length;i+=10)assert.ok(got.slice(i,i+10).some(t=>t>=4),'mỗi 10 lượt có ≥4★');
 assert.equal(got[BAO_PITY5-1],5,'lượt 80 chắc 5★');
 assert.equal(Object.keys(p.bao).sort().join(),'items,lim,p4,p5','dữ liệu gọn');
});

test('GIỚI HẠN không bảo hiểm; mỗi người tối đa 1 món/mùa; đúng 12 suất',()=>{
 const w=world(),p=ensurePlayer(w,'a','A',N);
 for(let i=0;i<400;i++)assert.notEqual(rollBao(w,p,'g999',miss).tier,6,'không ra GIỚI HẠN nhờ bảo hiểm');
 const lucky=()=>0;
 assert.equal(rollBao(w,p,'g999',lucky).tier,6);assert.notEqual(rollBao(w,p,'g999',lucky).tier,6,'đã có 1 món mùa này');
 for(let i=0;i<20;i++)rollBao(w,ensurePlayer(w,'b'+i,'B'+i,N),'g999',lucky);
 assert.equal(Object.keys(w.baoSeason.owners).length,12);
});

test('sự kiện: "cầu" free hồi 20 s; quà = lượt + tu vi; overlay không lộ số cơ duyên; có trong vòng xoay sự kiện lớn',()=>{
 assert.ok(BIG_EVENTS.some(([id])=>id==='bao-kho'),'18/11: có màn hình overlay → vào vòng xoay');
 const w=world(),p=ensurePlayer(w,'a','A',N);Object.assign(p,{realm:3,totalQi:1e6,lastActive:N});
 assert.equal(startBaoKhoEvent(w,N).ok,true);
 assert.equal(action(w,{type:'chat',text:'cầu',userId:'a'},N+10).ok,true);
 assert.equal(action(w,{type:'chat',text:'cau',userId:'a'},N+20).ok,false,'đang hồi');
 assert.equal(action(w,{type:'chat',text:'cau',userId:'a'},N+10+BAO_FREE_CD).ok,true);
 const qi=p.totalQi;action(w,{type:'gift',userId:'a',coins:10,count:3,giftName:'x'},N+40000);
 assert.equal(w.baoKho.hunters.a.n,5,'2 free + 3 quà');assert.ok(p.totalQi>qi,'quà có tu vi an ủi');
 const v=JSON.stringify(baoKhoView(w,N+41000));for(const k of ['g999','q5','limitedIn5','soft5From'])assert.ok(!v.includes(k),'không lộ '+k);
 assert.ok(snapshot(w,N+41000).baoKho,'có trong snapshot');
 tick(w,N+BAO_EVENT_MS+1000);assert.equal(w.baoKho.phase,'finished');
 assert.notEqual(action(w,{type:'chat',text:'cau',userId:'a'},N+BAO_EVENT_MS+60000)?.ok&&w.baoKho.hunters.a.n>5,true,'hết sự kiện không cầu được');
});

test('màn nhận: 5★ 4,5 s, GIỚI HẠN 8 s; GIỚI HẠN chen trước 5★ chưa chiếu; hàng chờ đầy thì 5★ bỏ màn',()=>{
 const e={reveals:[],revealUntil:0};
 assert.equal(queueReveal(e,{k:1,t:5},N),true);assert.equal(e.reveals[0].at,N);assert.equal(e.reveals[0].ms,REVEAL_MS[5]);
 queueReveal(e,{k:2,t:5},N+100);queueReveal(e,{k:3,t:6},N+200);
 const order=e.reveals.map(x=>x.k);assert.deepEqual(order,[1,3,2],'GIỚI HẠN lên trước 5★ đang chờ, màn đang chiếu giữ nguyên');
 const lim=e.reveals.find(x=>x.k===3);assert.equal(lim.ms,8000);assert.ok(lim.at>=N+REVEAL_MS[5],'không cắt màn đang chiếu');
 for(let i=0;i<3;i++)queueReveal(e,{k:10+i,t:5},N+300);
 assert.ok(e.reveals.filter(x=>x.at>N+300).length<=3,'tối đa 3 màn chờ');
 assert.equal(queueReveal(e,{k:99,t:6},N+300),true,'GIỚI HẠN luôn được chiếu');
 const at=e.reveals.map(x=>[x.at,x.at+x.ms]).sort((a,b)=>a[0]-b[0]);for(let i=1;i<at.length;i++)assert.ok(at[i][0]>=at[i-1][1],'không chồng màn');
});

test('giọng: quà đọc "thi triển cầu bảo", 4★ im lặng, GIỚI HẠN đọc chủ nhân; không "đa tạ"',()=>{
 const g=speechPlan({id:'1',effect:'gift',name:'Lan',text:'Lan tặng Rose',coins:1,count:1,baoGift:{pulls:1}});assert.match(g[0].text,/thi triển cầu bảo/);
 assert.deepEqual(speechPlan({id:'2',effect:'bao-kho',name:'Lan',text:'x',baoWin:{tier:4,item:'A'}}),[]);
 const l=speechPlan({id:'3',effect:'bao-kho',name:'Lan',text:'x',baoWin:{tier:6,item:'Hỗn Độn Chung'}});assert.match(l[0].text,/Hỗn Độn Chung.*chủ nhân duy nhất/);
 for(const x of [g,l])assert.ok(!/đa tạ|cảm ơn|tỷ lệ|ngẫu nhiên/i.test(x[0].text));
});

const fakeCtx=()=>{const g={addColorStop(){}};return new Proxy({},{get(t,k){if(k in t)return t[k];if(k==='canvas')return null;if(/^create/.test(k))return ()=>g;if(k==='measureText')return ()=>({width:50});return ()=>{};},set(t,k,v){t[k]=v;return true;}});};
test('overlay: không phát lại lượt cũ khi vừa mở; lượt mới ra băng rôn/thẻ 4★; mọi màn vẽ không lỗi',()=>{
 const w=world(),p=ensurePlayer(w,'a','A',N);Object.assign(p,{realm:3,totalQi:1e6,lastActive:N});startBaoKhoEvent(w,N);
 for(let i=0;i<10;i++)rollBao(w,p,'free',miss);action(w,{type:'chat',text:'cau',userId:'a'},N+10);
 const scene={};syncBaoKho(scene,{baoKho:baoKhoView(w,N+20)});assert.equal(scene.baoFx.banners.length,0,'lượt cũ không phát lại');
 p.bao.p4=9;action(w,{type:'chat',text:'cau',userId:'a'},N+10+20000);
 syncBaoKho(scene,{baoKho:baoKhoView(w,N+20030)});assert.equal(scene.baoFx.banners.length,1);assert.equal(scene.baoFx.cards.length,1,'4★ có thẻ');
 const c=fakeCtx();scene.stateServerNow=N+20030;scene.stateReceivedAt=0;
 assert.doesNotThrow(()=>drawBaoKho(scene,c,100,1600));
 const x={k:5,u:'a',name:'A',t:5,id:'s5-kiem',s:1,at:0,ms:4500},y={k:6,u:'a',name:'A',t:6,id:'L02-hon-don-chung',s:1,at:0,ms:8000};
 for(const sec of [.3,1,1.85,2.5,4]) assert.doesNotThrow(()=>drawGoldReveal(scene,c,1e6,1600,{x,age:sec*1000,ms:4500,k:sec/4.5}));
 for(const sec of [.5,1.5,3,3.65,4,4.3,5,7,7.8]) assert.doesNotThrow(()=>drawLimitedReveal(scene,c,1e6,1600,{x:y,age:sec*1000,ms:8000,k:sec/8},{limited:[]}));
 assert.equal(findReveal({reveals:[x]},2000).x.k,5);assert.equal(findReveal({reveals:[x]},5000),null);
});

test('18/11 tối: mỗi lượt Bảo Khố tối đa 1 món GIỚI HẠN; tỷ lệ 5★ ngẫu nhiên thấp (chủ yếu nhờ bảo hiểm)',async()=>{
 const {BAO_LIMITED_PER_EVENT}=await import('../phap-bao.mjs');assert.equal(BAO_LIMITED_PER_EVENT,1);
 assert.ok(BAO_ODDS.q5<=.02&&BAO_ODDS.limitedIn5<=.05);
 const w=world();startBaoKhoEvent(w,N);const lucky=()=>0;let got=0;
 for(let i=0;i<10;i++)if(rollBao(w,ensurePlayer(w,'x'+i,'X'+i,N),'g999',lucky).tier===6)got++;
 assert.equal(got,1,'một lượt sự kiện chỉ ra 1 món GIỚI HẠN');
});

test('18/11 tối: "trang bị <tên thần khí>" đeo làm bản mệnh; Tháp có thần thông + tăng sát thương',async()=>{
 const w=world(),p=ensurePlayer(w,'a','A',N);Object.assign(p,{realm:3,totalQi:1e6,lastActive:N});p.bao={p4:0,p5:0,items:{'s4-kiem':1,'L12-huyet-hai-dao':1},lim:null};
 const r=action(w,{type:'chat',text:'trang bị huyết hải ma đao',userId:'a'},N+10);assert.equal(r.ok,true);assert.equal(p.bao.ban,'L12-huyet-hai-dao');
 action(w,{type:'chat',text:'trang bị thanh phong kiếm',userId:'a'},N+20);assert.equal(p.bao.ban,'s4-kiem','đổi lại được, không hồi chờ');
 assert.notEqual(action(w,{type:'chat',text:'trang bị',userId:'a'},N+30)?.message,undefined);
 const {tickTower,startTower:st}=await import('../tower.mjs');void tickTower;void st;
 const {startTower}=await import('../engine.mjs');p.bao.ban='L12-huyet-hai-dao';
 assert.equal(startTower(w,N+100).ok,true);action(w,{type:'chat',text:'6',userId:'a'},N+200);tick(w,N+300);
 const lane=w.tower.lanes.find(l=>l?.id==='a');assert.ok(lane,'đã lên đài');
 for(let t=N+400;t<N+12000;t+=500)tick(w,t);
 assert.ok(w.tower.fx.some(f=>f.kind==='bao'&&f.id==='L12-huyet-hai-dao'),'có thần thông bản mệnh trong Tháp');
});
