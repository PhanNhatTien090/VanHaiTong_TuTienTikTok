// 21/11: Luân Hồi — CHỈ ĐIỂM HẬU BỐI (người đã chuyển sinh giúp hậu bối cảnh giới 1–6 đột phá ngay)
import {test} from 'node:test';import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,action,MENTOR} from '../engine.mjs';
const N=Date.parse('2026-11-21T10:00:00+07:00');
function setup(){const w=createWorld('live');const m=ensurePlayer(w,'m','Đế giang',N);Object.assign(m,{realm:6,highestRealm:28,reincarnations:1,lastActive:N});
 const a=ensurePlayer(w,'a','Tiểu Muội',N);Object.assign(a,{realm:3,qi:0,stones:0,lastActive:N});
 const b=ensurePlayer(w,'b','Lão Ngưu',N);Object.assign(b,{realm:2,qi:0,stones:0,lastActive:N-60000});
 const c=ensurePlayer(w,'c','Cao Thủ',N);Object.assign(c,{realm:12,lastActive:N});return {w,m,a,b,c};}
const chat=(w,id,text,at=N)=>action(w,{type:'chat',userId:id,text},at);
test('chưa chuyển sinh thì không chỉ điểm được',()=>{const {w,a}=setup();a.realm=3;const r=chat(w,'c','chỉ điểm');assert.equal(r.ok,false);assert.equal(a.realm,3);});
test('gõ "chỉ điểm" tự chọn hậu bối thấp nhất đang có mặt → đột phá ngay, có giọng + khung',async()=>{
 const {w,m,b}=setup();const r=chat(w,'m','chỉ điểm');assert.equal(r.ok,true);assert.equal(r.mentored,'b');assert.equal(b.realm,3);assert.equal(m.mentorCount,1);
 const e=w.events.find(x=>x.effect==='breakthrough'&&x.user==='b'||x.playerId==='b'&&x.mentor);assert.ok(e?.mentor||w.events.some(x=>x.mentor?.id==='m'));
 const ev=w.events.find(x=>x.mentor);assert.equal(ev.toRealm,3);assert.equal(ev.mentor.name,'Đế giang');
 const {speechPlan}=await import('../speech-lines.mjs');const lines=speechPlan(ev).map(x=>x.text).join(' ');assert.match(lines,/Đế giang/);assert.match(lines,/chỉ điểm|truyền đạo/i);
 const {mentorRitualInfo}=await import('../public/luan-hoi-fx.js');assert.equal(mentorRitualInfo(ev).mentor.name,'Đế giang');
});
test('chỉ điểm theo tên; hồi 30 phút; mỗi hậu bối 1 lần/ngày; cảnh giới >6 và người vắng mặt bị từ chối',()=>{
 const {w,m,a,b,c}=setup();assert.equal(chat(w,'m','chỉ điểm tiểu muội').mentored,'a');assert.equal(a.realm,4);
 const cd=chat(w,'m','chỉ điểm',N+1000);assert.equal(cd.ok,false);assert.match(cd.message,/phút/);assert.equal(b.realm,2);
 b.lastActive=N+MENTOR.cdMs;assert.equal(chat(w,'m','chỉ điểm tieu muoi',N+MENTOR.cdMs).ok,false,'hậu bối hôm nay đã được chỉ điểm');assert.equal(a.realm,4);
 assert.equal(chat(w,'m','chỉ điểm cao thủ',N+MENTOR.cdMs).ok,false,'cảnh giới 12');assert.equal(c.realm,12);
 b.lastActive=N;const away=chat(w,'m','chỉ điểm lão ngưu',N+MENTOR.cdMs);assert.equal(away.ok,false,'vắng mặt');assert.equal(b.realm,2);
 b.lastActive=N+MENTOR.cdMs;assert.equal(chat(w,'m','chỉ điểm',N+MENTOR.cdMs+1).mentored,'b');
});
test('không có hậu bối nào thì báo rõ, không mất lượt',()=>{const {w,m,a,b}=setup();a.realm=10;b.realm=10;const r=chat(w,'m','chỉ điểm');assert.equal(r.ok,false);assert.match(r.message,/Chưa có hậu bối/);assert.equal(m.mentorAt,undefined);});
test('người đã chuyển sinh bình luận → nhắc "gõ chỉ điểm" khi có hậu bối, tối đa 30 phút/lần',()=>{
 const {w}=setup();chat(w,'m','chào cả nhà');const hints=()=>w.events.filter(e=>e.mentorHint).length;assert.equal(hints(),1);
 chat(w,'m','hello',N+60000);assert.equal(hints(),1);
 const {w:w2,a,b}=setup();a.realm=9;b.realm=9;chat(w2,'m','chào');assert.equal(w2.events.filter(e=>e.mentorHint).length,0,'không có hậu bối thì không nhắc');
});
test('cảnh giới 0 chỉ thả tim (chưa nhập môn) được chỉ điểm → nhập môn + đủ quà nhập môn, ưu tiên trước cảnh giới cao hơn',()=>{
 const {w,m,b}=setup();const z=ensurePlayer(w,'z','Người Xem',N);Object.assign(z,{realm:0,qi:0,stones:0,herbs:0,lastActive:N});
 const r=chat(w,'m','chỉ điểm');assert.equal(r.mentored,'z');assert.equal(z.realm,1);assert.equal(z.starterDone,true);assert.ok(z.firstStepAt);assert.equal(z.stones,20);assert.equal(z.herbs,5);assert.equal(b.realm,2);
 // đã nhập môn rồi thì lần bình luận đầu không cho thêm lần nữa
 const before=z.stones;action(w,{type:'chat',userId:'z',text:'chào',fromLive:true},N+1000);assert.equal(z.realm,1);assert.equal(z.stones,before);
});
test('tên quá ngắn bị từ chối, không mất lượt',()=>{const {w,m}=setup();const r=chat(w,'m','chỉ điểm a');assert.equal(r.ok,false);assert.match(r.message,/ít nhất 2/);assert.equal(m.mentorAt,undefined);});
