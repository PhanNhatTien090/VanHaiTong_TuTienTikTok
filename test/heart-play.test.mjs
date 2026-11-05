import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,action,snapshot} from '../engine.mjs';
import {safeTalk} from '../talk.mjs';
const N=1800000000000;
const live=()=>{const w=createWorld('live');w.settings.residents=false;action(w,{type:'join',userId:'a',name:'An'},N);return w;};
test('heartPlay (mặc định LIVE): tim = vận công, chung hồi 10 s với tuluyen nên gõ lệnh không thêm gì',()=>{
 const w=live(),p=w.players.a,q0=p.qi;
 const r=action(w,{type:'like',userId:'a',count:15},N+1);assert.equal(r.heartCultivated,true);assert.ok(p.qi>q0);
 const q1=p.qi;assert.equal(action(w,{type:'cultivate',userId:'a'},N+2).ok,false);assert.equal(p.qi,q1,'tuluyen trong hồi chiêu không cộng thêm');
 assert.equal(action(w,{type:'like',userId:'a',count:50},N+3).heartCultivated,undefined);assert.equal(p.qi,q1,'tim dồn dập không nhân thưởng');
 assert.equal(action(w,{type:'like',userId:'a',count:1},N+10002).heartCultivated,true);assert.ok(p.qi>q1);
});
test('trò chuyện thường: bong bóng thoại đã lọc + Luận Đạo +20%, câu lặp lại không gia hạn',()=>{
 const w=live(),p=w.players.a;
 action(w,{type:'chat',userId:'a',text:'chào cả nhà nha'},N+5);assert.ok(p.talkUntil>N+5);
 assert.equal(snapshot(w,N+6).players.find(x=>x.id==='a').talk,'chào cả nhà nha');
 assert.equal(snapshot(w,N+9000).players.find(x=>x.id==='a').talk,undefined);
 const until=p.talkUntil;action(w,{type:'chat',userId:'a',text:'chào cả nhà nha'},N+60000);assert.equal(p.talkUntil,until,'câu y hệt không gia hạn');
 assert.equal(safeTalk('gọi 0912 345 678 nhé'),'gọi *** nhé');assert.ok(!safeTalk('vào www.abc.com xem').includes('abc'));
 const solo=live(),s=solo.players.a;action(solo,{type:'like',userId:'a',count:1},N+1);const plain=s.qi;
 const chatty=live(),c=chatty.players.a;action(chatty,{type:'chat',userId:'a',text:'mọi người tu tới đâu rồi'},N);action(chatty,{type:'like',userId:'a',count:1},N+1);
 assert.ok(c.qi>plain,'Luận Đạo tăng tu vi khi vận công');
});
test('heartPlay=false quay về luật nghiêm: tim chỉ được đếm',()=>{
 const w=live();w.settings.heartPlay=false;const p=w.players.a,q0=p.qi;
 assert.equal(action(w,{type:'like',userId:'a',count:10},N+1).metricOnly,true);assert.equal(p.qi,q0);
});
test('Luận Đạo chỉ tính trò chuyện thật; lệnh (kể cả gõ lệch) không bong bóng, không buff',async()=>{
 const {isCommandLike,isRealTalk}=await import('../talk.mjs');
 for(const t of ['tuluyen','tu luyen','tuluyện','Tu Luyện!!!','tuluyen123','tuluyen tuluyen','dot pha','dotphaaa','hai','ren kiem','!tuvi','12345','anh em ơi tuluyen đi'])assert.equal(isCommandLike(t),true,t);
 for(const t of ['hai người ơi','học bài chưa','chào cả nhà nha','tối nay ăn gì'])assert.equal(isRealTalk(t),true,t);
 assert.equal(isRealTalk('ok'),false);
 const w=live(),p=w.players.a;action(w,{type:'chat',userId:'a',text:'tu luyen'},N+5);assert.equal(p.talkUntil,undefined);assert.equal(p.talk,undefined);
 action(w,{type:'chat',userId:'a',text:'ok'},N+6000);assert.equal(p.talkUntil,undefined,'câu quá ngắn chỉ hiện bong bóng');assert.equal(p.talk.text,'ok');
});
test('câu đố mẹo: không có a/b/c, gõ đáp án vào chat; sai vẫn là trò chuyện, đúng không lộ bong bóng',async()=>{
 const {QUIZ_BANK,quizMatch}=await import('../engagement.mjs');
 assert.ok(QUIZ_BANK.length>=25&&QUIZ_BANK.every(x=>x.q&&x.show&&x.a.length));assert.ok(QUIZ_BANK.filter(x=>!x.options).length>=25);
 const cua=QUIZ_BANK.find(x=>x.show==='Con cua');assert.ok(quizMatch('là con cua nè',cua.a));assert.ok(!quizMatch('con cá',cua.a));
 const w=live();action(w,{type:'join',userId:'b',name:'Bean'},N);
 w.quiz={id:'quiz-t',q:cua.q,show:cua.show,accepted:cua.a,riddle:true,startedAt:N,endsAt:N+45000,answers:{},order:[],tries:0};
 action(w,{type:'chat',userId:'a',text:'con cá hả'},N+1000);assert.equal(w.quiz.order.length,0);assert.ok(w.players.a.talk,'câu sai vẫn là trò chuyện');
 const r=action(w,{type:'chat',userId:'b',text:'con cua'},N+2000);assert.equal(r.correct,true);assert.deepEqual(w.quiz.order,['b']);assert.equal(w.players.b.talk,undefined,'câu đúng không hiện bong bóng');
 assert.equal(snapshot(w,N+2001).engagement?.quiz?.options??undefined,undefined);
});
test('câu đố mẹo có a/b/c (rau câu): chọn một lần, chọn sai không đoán lại; gõ thẳng đáp án cũng đúng',async()=>{
 const {QUIZ_BANK}=await import('../engagement.mjs');const rc=QUIZ_BANK.find(x=>x.show==='Rau câu');assert.deepEqual(rc.options,['Rau câu','Cần câu','Cá kho tộ']);
 const w=live();for(const [id,n] of [['b','Bean'],['k','KQ']])action(w,{type:'join',userId:id,name:n},N);
 w.quiz={id:'quiz-r',q:rc.q,show:rc.show,accepted:rc.a,options:rc.options,answer:0,riddle:true,startedAt:N,endsAt:N+45000,answers:{},order:[],tries:0,locked:{}};
 assert.equal(action(w,{type:'chat',userId:'a',text:'b'},N+1).correct,false);assert.equal(action(w,{type:'chat',userId:'a',text:'a'},N+2).duplicate,true,'không đoán lại');
 assert.equal(action(w,{type:'chat',userId:'b',text:'a'},N+3).correct,true);
 assert.equal(action(w,{type:'chat',userId:'k',text:'rau câu'},N+4).correct,true);
 assert.deepEqual(w.quiz.order,['b','k']);assert.deepEqual(snapshot(w,N+5).engagement?.quiz?.options??rc.options,rc.options);
});
test('điều khiển LIVE: tắt từng sự kiện ngẫu nhiên, câu đố, hồng bao, heartPlay; ban thưởng tùy chỉnh đúng số',async()=>{
 const {setEventSettings,adminGift,RANDOM_EVENTS}=await import('../engine.mjs');
 const w=live(),p=w.players.a;
 let r=setEventSettings(w,{randomExclude:['boss','race','khong-co'],quiz:false,envelope:false,heartPlay:false});assert.equal(r.ok,true);
 assert.deepEqual(w.settings.randomExclude,['boss','race']);assert.equal(w.settings.quiz,false);assert.equal(w.settings.envelope,false);assert.equal(w.settings.heartPlay,false);
 assert.ok(RANDOM_EVENTS.some(([id])=>id==='boss'));
 const q0=p.qi,s0=p.stones;r=adminGift(w,'a','custom',N+1,{qi:12345,stones:67,herbs:8,buff:5,minutes:15});assert.equal(r.ok,true);
 assert.equal(p.qi-q0,12345);assert.equal(p.stones-s0,67);assert.equal(p.buffMult,5);assert.equal(p.buffUntil,N+1+15*60000);
 {const g=w.events.findLast(e=>e.adminGift==='custom');assert.ok(g&&g.text.includes('+12345 tu vi'));}
 assert.equal(adminGift(w,'a','custom',N+2,{qi:-5}).ok,false);assert.equal(adminGift(w,'a','custom',N+2,{}).ok,false);assert.equal(adminGift(w,'a','custom',N+2,{buff:1}).ok,false);
});
