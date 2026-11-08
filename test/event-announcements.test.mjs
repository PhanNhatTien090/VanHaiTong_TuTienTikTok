import {test} from 'node:test';import assert from 'node:assert/strict';import {isEventAnnouncement,EventAnnouncementHistory} from '../public/event-announcements.js';import {VoiceQueue,priority} from '../public/voice.js';import {speechPlan} from '../speech-lines.mjs';
test('event lifecycle announcements take priority over gifts and combat, rather than every participant interaction',()=>{
 for(const effect of ['visitor','boss','race','tournament','social','bond','flower','opportunity','blessing']){const e={id:effect,effect,text:'Mở sự kiện'};assert.ok(isEventAnnouncement(e));assert.equal(priority(e),5);assert.ok(priority(e)>priority({user:'a',effect:'dragon',gift:'Quà'}));}
 for(const effect of ['race','tournament','social','bond'])assert.equal(isEventAnnouncement({user:'a',effect,text:'Đã đăng ký'}),false);
 const q=new VoiceQueue({world:'demo',audio:{enabled:true,duck(){}}});q.running=true;for(let i=0;i<12;i++)q.add({id:'gift'+i,user:'a',gift:'Quà',effect:'dragon'});q.add({id:'start',effect:'visitor',visitorStart:true});q.add({id:'start',effect:'visitor',visitorStart:true});assert.equal(q.queue.filter(x=>x.e.id==='start').length,1);assert.ok(q.queue.length<=6);q.stop();
});
test('server announcement history survives ordinary event eviction, expires and remains bounded',()=>{
 const h=new EventAnnouncementHistory(3,120000),e={id:'opening',at:1000,effect:'visitor',visitorStart:true};h.remember([e],1000);h.remember(Array.from({length:100},(_,i)=>({id:'chat'+i,user:'p',at:1100,effect:'qi'})),1100);assert.equal(h.get(e.id,30000),e);assert.equal(h.get(e.id,121000),undefined);for(let i=0;i<10;i++)h.remember([{...e,id:String(i),at:200000+i}],200000+i);assert.equal(h.recent(200100).length,3);
});
test('Han Lap, Vuong Lam and Than De have explicit spoken entrances and every event gets non-empty speech',()=>{
 for(const [visitorKind,name]of [['hanlap','Hàn Lập'],['vuonglam','Vương Lâm'],['shende','Thần Đế']]){const plan=speechPlan({id:'start-'+visitorKind,effect:'visitor',visitorStart:true,visitorKind,text:'Sự kiện mở'});assert.equal(plan[0].voice,'tiennu');assert.ok(plan[0].text.includes(name+' giáng lâm'));assert.ok(plan[1].text.includes('có thể sở hữu skin'));assert.ok(plan.every(s=>s.text.length>0&&s.text.length<=200));}
 for(const effect of ['boss','race','tournament','bond','flower','opportunity','blessing'])assert.ok(speechPlan({effect,text:'Sự kiện đã mở • cùng tham gia',count:2}).every(s=>s.text));
});
