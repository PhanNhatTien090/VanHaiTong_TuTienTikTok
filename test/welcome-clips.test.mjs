import test from 'node:test';import assert from 'node:assert/strict';
import {WelcomeClips,WELCOME_LINES,allWelcomeLines} from '../public/welcome-lines.js';
import {VoiceQueue,voiceDecision,priority} from '../public/voice.js';
import {tanDeTuHint} from '../public/tan-de-tu.js';

const allFiles=allWelcomeLines().map(l=>l.file);
const readyClips=(files=allFiles)=>{const c=new WelcomeClips();c.use(files);return c;};
const audio={enabled:true,duck(){}};

test('câu chào chỉ nói lệnh gõ, không mồi tim/follow/share, không có số coin',()=>{
 for(const l of allWelcomeLines()){assert.doesNotMatch(l.text,/tim|follow|share|theo dõi|chia sẻ|coin|xu\b/i,l.text);assert.ok(l.text.length<=90,l.text);}
 assert.ok(WELCOME_LINES.new.length>=8&&WELCOME_LINES.back.length>=3&&WELCOME_LINES.nhapmon.length>=4);
 assert.equal(new Set(allFiles).size,allFiles.length);
});

test('chưa có manifest → không có câu đọc sẵn (chạy như cũ); có thì xoay vòng, không lặp 3 câu gần nhất',()=>{
 const none=new WelcomeClips();assert.equal(none.has('new'),false);assert.equal(none.pick('new'),null);
 let i=0;const c=new WelcomeClips({random:()=>((i++)*0.37)%1});c.use(allFiles);
 const seen=[];for(let k=0;k<30;k++){const l=c.pick('new');assert.ok(l?.file);if(seen.length)assert.ok(!seen.slice(-3).includes(l.file),'lặp câu gần');seen.push(l.file);}
 const one=readyClips([WELCOME_LINES.back[0].file]);assert.equal(one.pick('back').file,WELCOME_LINES.back[0].file);assert.equal(one.pick('back').file,WELCOME_LINES.back[0].file);assert.equal(one.has('new'),false);
});

test('người MỚI vào: phát ngay câu đọc sẵn, không gọi máy tạo giọng; cả sân 1 câu / 8 s',async()=>{
 const q=new VoiceQueue({world:'live',audio,clips:readyClips(),shed:false});
 let prepared=0;q.prepare=()=>{prepared++;return Promise.resolve(new Blob());};
 const played=[];q.play=async(url,e)=>{played.push({url,e});};
 q.add({id:'a1',user:'n1',name:'A',effect:'join',autoArrival:true,text:'Chào'});
 await new Promise(r=>setTimeout(r,0));
 assert.equal(played.length,1);assert.match(played[0].url,/voice-welcome-v1\/new-\d\d\.mp3$/);assert.equal(prepared,0);
 q.add({id:'a2',user:'n2',name:'B',effect:'join',autoArrival:true,text:'Chào'});await new Promise(r=>setTimeout(r,0));
 assert.equal(played.length,1,'trong 8 s chỉ 1 câu chào');
 q.calmLast.arrival-=9000;q.add({id:'a3',user:'n3',name:'C',effect:'join',autoArrival:true,text:'Chào'});await new Promise(r=>setTimeout(r,0));
 assert.equal(played.length,2);q.stop();
});

test('người QUAY LẠI: thử câu có tên; máy giọng bận/lỗi → câu đọc sẵn thay vì im lặng',async()=>{
 const q=new VoiceQueue({world:'live',audio,clips:readyClips(),shed:false});q.arrivalWaitMs=10;
 q.prepare=()=>Promise.reject(Error('Giọng đọc đang bận; dùng phản hồi nhanh.'));
 const played=[];q.play=async(url)=>{played.push(url);};
 q.add({id:'b1',user:'old',name:'Cũ',effect:'join',autoArrival:true,returning:true,text:'Mừng trở lại'});
 await new Promise(r=>setTimeout(r,30));
 assert.equal(played.length,1);assert.match(played[0],/voice-welcome-v1\/back-\d\d\.mp3$/);q.stop();
});

test('không có file đọc sẵn: người mới vẫn theo luật cũ (20 s, chờ câu có tên)',()=>{
 const a={id:'a',user:'u1',autoArrival:true,effect:'join',text:'Chào'},now=1e7;
 assert.equal(voiceDecision(a,{now,lastArrivalAt:now-9000}),'drop');
 assert.equal(voiceDecision({...a,clipKind:'new'},{now,lastArrivalAt:now-9000}),'play');
});

test('nhập môn có câu chúc riêng, làn riêng 8 s, không bị câu chào chặn; thiếu file thì im',async()=>{
 const nm=k=>({id:'nm'+k,user:'u'+k,name:'N'+k,effect:'nhapmon',text:'Nhập môn',nhapMonVoice:true,clipKind:'nhapmon'});
 assert.ok(priority(nm(0))>3);
 const q=new VoiceQueue({world:'live',audio,clips:readyClips(),shed:false});const played=[];q.play=async(url,e)=>{played.push({url,e});};
 q.calmLast.arrival=Date.now();q.add(nm(1));await new Promise(r=>setTimeout(r,0));
 assert.equal(played.length,1);assert.match(played[0].url,/nhapmon-\d\d\.mp3$/);assert.equal(played[0].e.text,played[0].e.clipText);
 q.add(nm(2));await new Promise(r=>setTimeout(r,0));assert.equal(played.length,1);q.stop();
 const bare=new VoiceQueue({world:'live',audio,clips:new WelcomeClips(),shed:false});let n=0;bare.play=async()=>{n++;};bare.add(nm(3));await new Promise(r=>setTimeout(r,0));assert.equal(n,0);
});

test('nhãn Tân Đệ Tử hiện Giờ Vàng ×2 khi đang trong 30 phút đầu',()=>{
 assert.equal(tanDeTuHint({realm:1,qi:10,neededQi:100,golden:1}),'Gõ 1 · tu luyện ×2');
 assert.equal(tanDeTuHint({realm:1,qi:10,neededQi:100}),'Gõ 1 · tu luyện');
 assert.equal(tanDeTuHint({realm:0,golden:1}),'Gõ 1 · nhập môn');
});
