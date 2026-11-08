import test from 'node:test';import assert from 'node:assert/strict';
import {speechPlan,withoutCoinSpeech} from '../speech-lines.mjs';
test('narration never reads gift prices or coin milestones, including system fallback',()=>{
 for(const text of ['100 coin nhận skin. Chào mừng đồng môn!','Một trăm coin mở áo.','200 coins nhận quà • Gõ cơ duyên','Ba trăm xu để mở quà.'])assert.doesNotMatch(withoutCoinSpeech(text),/coin|\bxu\b|trăm|200|100/i);
 for(const e of [{visitorStart:true,visitorKind:'hailam'},{effect:'status',text:'100 coin nhận skin • Cơ duyên đang mở'},{effect:'status',text:'Một trăm coin mở áo.'},{name:'An',gift:'Hoa hồng',coins:100,count:1,reward:{qi:50},buff:{mult:3}}]){
  const plan=speechPlan(e);assert.ok(plan.length>0);for(const line of plan){assert.ok(line.text.trim());assert.doesNotMatch(line.text,/coin|\bxu\b/i);}
 }
 assert.match(speechPlan({visitorStart:true,visitorKind:'hailam'}).map(x=>x.text).join(' '),/Long Duệ Hải Lam giáng thế.*có thể sở hữu skin/);
});
