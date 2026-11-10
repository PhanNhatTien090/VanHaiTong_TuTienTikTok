import {test} from 'node:test';import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,teasePair,snapshot} from '../engine.mjs';
import {speechPlan} from '../speech-lines.mjs';
import {isEventAnnouncement} from '../public/event-announcements.js';
const N=1800000000000;
test('chọc ghẹo: chọn 2 người bằng "Tên #MÃ"/tên/id → hiệu ứng 9 s + tông sư trêu, KHÔNG kết duyên',()=>{
 const w=createWorld('live');w.settings.residents=false;const a=ensurePlayer(w,'a','Mẹ em Gạo👧🏻',N),b=ensurePlayer(w,'b','Công Tài',N);snapshot(w,N);
 const r=teasePair(w,'Mẹ em Gạo👧🏻 #'+a.socialCode,'cong tai',N);assert.ok(r.ok,r.message);
 assert.deepEqual([w.tease.a,w.tease.b],['a','b']);assert.equal(w.tease.until,N+9000);
 assert.equal(Object.keys(w.social?.bonds||{}).length,0,'không tạo đạo lữ');assert.ok(!a.bondId&&!b.bondId);
 const e=w.events.at(-1);assert.ok(isEventAnnouncement(e));assert.match(speechPlan(e)[0].text,/Mẹ em Gạo|Công Tài/);
 assert.equal(teasePair(w,'a','a',N).ok,false);assert.equal(teasePair(w,'không có ai','b',N).ok,false);
});
