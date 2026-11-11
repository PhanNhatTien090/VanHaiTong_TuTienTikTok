import test from 'node:test';import assert from 'node:assert/strict';
import {resolveQuick,quickView} from '../quick-commands.mjs';
const now=1_000_000;
test('digits 1-9 map to the basic repeated commands, 6 falls back to gợi ý',()=>{
 const w={};
 assert.deepEqual(['1','2','3','4','5','6','7','8','9'].map(d=>resolveQuick(w,[d],now)),['tuluyen','hai','danh','luyendan','dung','goiy','ren','dotpha','tuvi']);
});
test('only a lone digit 1-6 is a shortcut',()=>{
 const w={};for(const words of [['0'],['12'],['2','abc'],['tuvi'],[]])assert.equal(resolveQuick(w,words,now),null);
});
test('6 follows the open event',()=>{
 assert.equal(resolveQuick({bonkFest:{endsAt:now+5000}},['6'],now),'godau');
 assert.equal(resolveQuick({maze:{phase:'registration',registrationEndsAt:now+5000}},['6'],now),'mecung');
 assert.equal(resolveQuick({race:{phase:'registration'}},['6'],now),'bay');
 assert.equal(resolveQuick({tournament:{phase:'registration'}},['6'],now),'tythi');
 assert.equal(resolveQuick({boss:{hp:5,endsAt:now+1}},['6'],now),'danh');
 assert.equal(resolveQuick({bonkFest:{endsAt:now-1}},['6'],now),'goiy');
 assert.equal(resolveQuick({flowerEvent:{kind:'flower',startedAt:now-1,endsAt:now+9}},['6'],now),'tuluyen');
 assert.equal(quickView({flowerEvent:{kind:'flower',startedAt:now-1,endsAt:now+9}},now).event.name.length>0,true);
});
test('digits yield to an open riddle or alchemy vote',()=>{
 assert.equal(resolveQuick({quiz:{endsAt:now+5000}},['2'],now),null);
 assert.equal(resolveQuick({quiz:{endsAt:now+5000,closedAt:now-1}},['9'],now),'tuvi');
 assert.equal(resolveQuick({alchemy:{phase:'brewing',quiz:{startsAt:now-1,endsAt:now+1}}},['1'],now),null);
});
test('quickView exposes six rows and the event ticker data',()=>{
 const v=quickView({bonkFest:{endsAt:now+9000}},now);
 assert.equal(v.rows.length,9);assert.deepEqual(v.rows.map(r=>r.n).join(''),'123456789');assert.equal(v.rows[5].event,true);assert.equal(v.rows[0].event,false);assert.equal(v.event.name,'HỘI GÕ ĐẦU');assert.equal(v.event.endsAt,now+9000);
 assert.equal(quickView({},now).event,null);
});
