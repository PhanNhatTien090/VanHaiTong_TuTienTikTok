import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,action,parseGender} from '../engine.mjs';
import {announcement} from '../speech.mjs';

test('viewers self-declare gender; undeclared stays neutral',()=>{
  assert.equal(parseGender('nữ'),'nu');assert.equal(parseGender('su ty'),'nu');assert.equal(parseGender('nam'),'nam');
  assert.equal(parseGender('sư huynh'),'nam');assert.equal(parseGender(''),null);assert.equal(parseGender('xyz'),null);
  const w=createWorld('demo');
  action(w,{type:'chat',userId:'a',name:'Lan',text:'nhapmon nữ'});
  assert.equal(w.players.a.gender,'nu');
  const join=w.events.find(e=>e.user==='a'&&e.effect==='join');assert.ok(join);
  assert.equal(w.events.filter(e=>e.user==='a'&&e.effect==='title').length,0,'new player gets one join event, not an extra title event');
  action(w,{type:'chat',userId:'b',name:'Minh',text:'nhapmon'});assert.equal(w.players.b.gender,null);
  action(w,{type:'chat',userId:'b',name:'Minh',text:'gioitinh nam'});assert.equal(w.players.b.gender,'nam');
  assert.equal(w.events.at(-1).effect,'title');
  const n=w.events.length;action(w,{type:'chat',userId:'b',name:'Minh',text:'gioitinh nam'});assert.equal(w.events.length,n,'repeat does not re-announce');
  action(w,{type:'chat',userId:'b',name:'Minh',text:'gioitinh an'});assert.equal(w.players.b.gender,null);
  assert.equal(action(w,{type:'chat',userId:'b',name:'Minh',text:'gioitinh ???'}).ok,false);
  action(w,{type:'join',userId:'c',name:'Hà',gender:'nu'});assert.equal(w.players.c.gender,'nu');
});

test('sect master addresses sư huynh / sư tỷ / đạo hữu',()=>{
  const e={name:'Lam Phong',effect:'join',text:''};
  assert.match(announcement({...e,gender:'nam'}),/sư huynh Lam Phong gia nhập Vân Hải Tông! .*(thả tim|tu luyện)/i);
  assert.match(announcement({...e,gender:'nu'}),/sư tỷ Lam Phong gia nhập/i);
  assert.match(announcement(e),/đạo hữu Lam Phong gia nhập/i);
  assert.match(announcement({...e,gender:'nu',effect:'qi',text:'Vận Thanh Tâm • +10 tu vi'}),/^Sư tỷ Lam Phong đang vận công/);
  assert.match(announcement({...e,gender:'nam',effect:'petal',text:'Linh hoa ×3 • cảm ơn đạo hữu'}),/^Đa tạ sư huynh Lam Phong/);
  assert.match(announcement({...e,gender:'nu',effect:'title'}),/gọi là sư tỷ Lam Phong/);
  assert.match(announcement({...e,gender:'nam',effect:'petal',text:'Kết duyên tiên môn • +20 tu vi, +10 linh thạch'}),/^Đa tạ sư huynh Lam Phong đã theo dõi Vân Hải Tông/);
});

test('female viewers get a female sprite, male viewers a male one; undeclared keeps the tier art',async()=>{
  const {spriteCell}=await import('../public/cosmetics.js');
  const female=new Set([1,4]);
  for(let level=0;level<5;level++){assert.ok(female.has(spriteCell(level,'nu')));assert.ok(!female.has(spriteCell(level,'nam')));assert.equal(spriteCell(level,null),level);}
});
test('fancy unicode nicknames are read as plain words',()=>{
  assert.match(announcement({name:'𝙈 𝙄 𝘾 𝙆 𝙀 𝙔 🫥',effect:'join',gender:'nam'}),/sư huynh MICKEY gia nhập/i);
  assert.match(announcement({name:'A Thanh',effect:'join'}),/đạo hữu A Thanh/i);
});
