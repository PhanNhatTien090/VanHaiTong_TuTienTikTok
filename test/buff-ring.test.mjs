import test from 'node:test';
import assert from 'node:assert/strict';
import {buffLeft,BUFF_MS} from '../public/buff-ring.js';
import fs from 'node:fs';
// 20/11 C: người đang có phúc duyên (sau khi tặng quà) có vòng sáng dưới chân, vòng ngắn dần theo thời gian còn lại.
test('vòng phúc duyên: chỉ khi còn phúc duyên và có nhân; tỉ lệ còn lại đúng',()=>{
 const now=1e12;
 assert.equal(buffLeft({buffUntil:now+BUFF_MS,buffMult:3},now),1);
 assert.equal(buffLeft({buffUntil:now+BUFF_MS/2,buffMult:5},now),.5);
 assert.equal(buffLeft({buffUntil:now-1,buffMult:8},now),0);
 assert.equal(buffLeft({buffUntil:now+1000,buffMult:1},now),0);
});
test('server gửi buffUntil/buffMult xuống overlay',()=>{assert.match(fs.readFileSync('server.mjs','utf8'),/fields=\['buffUntil','buffMult'/);});
