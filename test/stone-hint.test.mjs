import {test} from 'node:test';import assert from 'node:assert/strict';
import {createWorld,ensurePlayer,action,requiredQi,requiredStones,STONE_HINT_MS} from '../engine.mjs';
import {bubbleText} from '../public/motion.js';import {speechPlan} from '../speech-lines.mjs';
const N=1800000000000;
test('đủ tu vi thiếu linh thạch: nhắc có giọng + bong bóng "Gõ hái", lặp lại mỗi 3 phút, gõ đột phá cũng nhắc',async()=>{
 const w=createWorld('live');Object.assign(w.settings,{residents:false,autoEvents:false});w.nextBossAt=N+1e9;const p=ensurePlayer(w,'a','Vo',N);
 Object.assign(p,{realm:6,qi:requiredQi({realm:6})+5000,stones:requiredStones({realm:6})-74});
 const hints=()=>w.events.filter(e=>e.user==='a'&&e.missing==='stones');
 action(w,{type:'chat',userId:'a',text:'dotpha'},N+1000);assert.equal(hints().length,1,'gõ đột phá → nhắc ngay');
 const e=hints().at(-1);assert.equal(bubbleText(e),'Gõ hái để lấy linh thạch!');assert.match(speechPlan(e).map(x=>x.text).join(' '),/thiếu linh thạch, gõ hái để lấy linh thạch!$/);assert.match(e.text,/thiếu 74 linh thạch · gõ hái/);
 action(w,{type:'chat',userId:'a',text:'tuluyen'},N+60000);assert.equal(hints().length,1,'trong 3 phút không nhắc dồn');
 action(w,{type:'chat',userId:'a',text:'tuluyen'},N+1000+STONE_HINT_MS+5000);assert.equal(hints().length,2,'sau 3 phút nhắc lại');
 const {tick}=await import('../engine.mjs');tick(w,N+1000+STONE_HINT_MS*2+20000);assert.equal(hints().length,3,'đứng yên vẫn được nhắc');
});
