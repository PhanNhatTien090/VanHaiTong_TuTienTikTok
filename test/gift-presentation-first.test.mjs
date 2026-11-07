import {test} from 'node:test';
import assert from 'node:assert/strict';
import {presentationPriority,PresentationQueue} from '../public/presentation.js';
const gift={id:'g',user:'a',gift:'Hoa hồng',coins:1,count:1,effect:'petal',text:'Hoa hồng • cảm ơn đạo hữu'};
// 07/11/2026: quà thật luôn diễn trước mọi hiệu ứng khác (kể cả đột phá, đại điển, Thiên Đạo).
test('real gifts outrank every other presentation; NPC gifts do not',()=>{
 for(const other of [{effect:'breakthrough',toRealm:12},{ceremony:true},{heavenStrike:{seed:1}},{transform:true,effect:'skin'},{effect:'visitor'}])assert.ok(presentationPriority(gift)>presentationPriority(other),JSON.stringify(other));
 assert.ok(presentationPriority({...gift,resident:true})<presentationPriority(gift));
 const q=new PresentationQueue();q.push({id:'b',user:'x',effect:'breakthrough',toRealm:3},1);q.push({id:'c',ceremony:true},2);q.push(gift,3);assert.equal(q.take(4).id,'g');
});
