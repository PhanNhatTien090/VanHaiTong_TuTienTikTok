import test from 'node:test';import assert from 'node:assert/strict';
import {waitingRows,stageQueueHTML,stageReason} from '../public/stage-queue.js';
const esc=s=>String(s);
test('shows at most three important viewer turns with cumulative wait',()=>{
 const items=[
  {id:1,user:'a',name:'An',gift:true,coins:5,effect:'qi'},
  {id:2,user:'b',name:'Bảo',effect:'status'},
  {id:3,user:'c',name:'NPC',effect:'status',resident:true},
  {id:4,user:'d',name:'Dạ',effect:'qi'},
  {id:5,user:'e',name:'Em',effect:'skin'},
  {id:6,user:'f',name:'Phong',effect:'blessing'}];
 const rows=waitingRows(items,1000,null);
 assert.deepEqual(rows.map(r=>r.name),['An','Bảo','Em']);
 assert.equal(rows[0].reason,'dâng lễ vật');assert.equal(rows[1].reason,'xem tu vi');
 assert.ok(rows[0].waitSec>=1&&rows[1].waitSec>rows[0].waitSec&&rows[2].waitSec>rows[1].waitSec);
});
test('current show adds its remaining time; empty queue renders nothing',()=>{
 const rows=waitingRows([{id:1,name:'An',effect:'skin'}],5000,{e:{effect:'skin'},at:4000});
 assert.ok(rows[0].waitSec>=1);
 assert.equal(stageQueueHTML([],esc),'');
 assert.match(stageQueueHTML(rows,esc),/VÂN ĐÀI/);
});
test('reasons stay in the sect voice',()=>{
 assert.equal(stageReason({heavenStrike:{}}),'Thiên Đạo giáng lôi');
 assert.equal(stageReason({effect:'qi'}),null);
});
