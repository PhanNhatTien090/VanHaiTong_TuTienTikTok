import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,action,suggestion} from '../engine.mjs';
import {announcement} from '../speech.mjs';

test('suggests the exact next command a viewer can afford',()=>{
  const base={realm:0,stones:0,herbs:0,manuals:[],artifacts:[],pills:{}};
  assert.equal(suggestion({...base,stones:40}).cmd,'hoc');
  assert.equal(suggestion({...base,stones:70,herbs:3,manuals:['breath']}).cmd,'ren');
  assert.equal(suggestion({...base,pills:{'qi-pill':1}}).cmd,'dung');
  assert.equal(suggestion({...base,stones:5}),null);
});
test('advanced hints wait for introductory completion, are spoken once, and are rate-limited per sect',()=>{
  const w=createWorld('live');let now=1e7;const hints=()=>w.events.filter(e=>e.effect==='hint'&&!e.guide);
  action(w,{type:'chat',userId:'a',name:'Lan',text:'nhập môn nữ'},now);action(w,{type:'chat',userId:'b',name:'Minh',text:'nhapmon'},now);
  w.players.a.stones=50;w.players.b.stones=50;
  action(w,{type:'chat',userId:'a',name:'Lan',text:'tu luyện'},now+=1000);assert.equal(hints().length,0,'no hint in the first minute');
  action(w,{type:'chat',userId:'a',name:'Lan',text:'tu luyện'},now+=60000);
  assert.equal(hints().length,0,'no crafting checklist during introduction');w.players.a.intro.advancedAt=now;w.players.b.intro.advancedAt=now;
  action(w,{type:'cultivate',userId:'a'},now+=11000);
  assert.equal(hints().length,1);assert.equal(hints()[0].text,'Gõ: hoc');
  assert.match(announcement({...hints()[0],gender:'nu'}),/^Sư tỷ Lan, hãy gõ học để lĩnh ngộ Thanh Tâm Quyết\. Tu luyện nhận thêm mười lăm phần trăm tu vi\.$/);
  action(w,{type:'chat',userId:'b',name:'Minh',text:'hai'},now+=1000);assert.equal(hints().length,1,'sect-wide 12s gap');
  action(w,{type:'chat',userId:'b',name:'Minh',text:'tuluyen'},now+=15000);assert.equal(hints().length,2);
  action(w,{type:'chat',userId:'a',name:'Lan',text:'hai'},now+=25000);assert.equal(hints().length,2,'same viewer waits 90 seconds');
});

test('short commands pick the right item automatically',()=>{
  const w=createWorld('live');let now=1e7;action(w,{type:'chat',userId:'s',name:'S',text:'nhapmon'},now);const p=w.players.s;p.stones=500;p.herbs=50;
  assert.equal(action(w,{type:'chat',userId:'s',name:'S',text:'hoc'},now+=1000).ok,true);assert.deepEqual(p.manuals,['breath']);
  assert.equal(action(w,{type:'chat',userId:'s',name:'S',text:'ren'},now+=1000).ok,true);assert.ok(p.artifacts.includes('jade'));
  assert.equal(action(w,{type:'chat',userId:'s',name:'S',text:'luyendan'},now+=1000).ok,true);assert.equal(p.pills['qi-pill'],1);
  assert.equal(action(w,{type:'chat',userId:'s',name:'S',text:'dung'},now+=1000).ok,true);assert.equal(p.pills['qi-pill'],0);
  p.equipped=null;assert.equal(action(w,{type:'chat',userId:'s',name:'S',text:'trangbi'},now+=1000).ok,true);assert.equal(p.equipped,'jade');
  p.stones=0;const r=action(w,{type:'chat',userId:'s',name:'S',text:'hoc'},now+=1000);assert.equal(r.ok,false);assert.match(r.message,/Cần/);
});
test('gifts grant a timed phúc duyên buff that multiplies hand-played rewards, and the voice reads rewards',async()=>{
  const w=createWorld('live');let now=1e7;action(w,{type:'chat',userId:'g',name:'Gấm',text:'nhapmon nu'},now);const p=w.players.g;
  action(w,{type:'chat',userId:'g',name:'Gấm',text:'tuluyen'},now+=1000);assert.equal(p.qi,27,'Phàm nhân ×4,5');
  action(w,{type:'gift',userId:'g',name:'Gấm',coins:1,giftName:'Rose',eventId:'r1'},now+=1000);
  const e=w.events.find(x=>x.gift);assert.equal(e.buff.mult,5,'lễ quà đầu tiên: phúc duyên ≥×5');
  const say=announcement({...e,gender:'nu'});assert.match(say,/Hoa hồng/);assert.match(say,/hai mươi tư tu vi/);assert.match(say,/gấp năm/);assert.ok(say.length<=200,'câu quà nhỏ ngắn gọn');
  const before=p.qi;action(w,{type:'chat',userId:'g',name:'Gấm',text:'tuluyen'},now+=11000);assert.equal(p.qi-before,135,'6 × 4,5 (Phàm nhân) × 5 (phúc duyên lễ quà đầu)');
  action(w,{type:'gift',userId:'g',name:'Gấm',coins:199,eventId:'r2'},now+=1000);assert.equal(p.buffMult,8);
  const b2=p.qi;action(w,{type:'chat',userId:'g',name:'Gấm',text:'tuluyen'},now+=11000);assert.equal(p.qi-b2,297,'6 × 4,5 × 1,25 (Trấn Hồn Chung) × 8 × 1,1 (VIP Bạc)');
  now+=11*60000;const b3=p.qi;action(w,{type:'chat',userId:'g',name:'Gấm',text:'tuluyen'},now);assert.equal(p.qi-b3,37,'buff expires (6 × 4,5 × 1,25 × 1,1 VIP Bạc)');
});
