import test from 'node:test';
import assert from 'node:assert/strict';
import {voiceDecision,priority,stageVoice} from '../public/voice.js';
import {speechPlan} from '../speech-lines.mjs';
import {heartQiPlan,HEART_QI_MS} from '../public/heart-qi-fx.js';
import {createWorld,action,requiredQi,hardRealmMult,lateGrowthMult} from '../engine.mjs';

test('lên trung kỳ/hậu kỳ được đọc kể cả người chơi lâu, cả sân 1 câu / 15 s', () => {
  const e={id:'s1',user:'a',name:'An',effect:'qi',text:'Bước vào Kim Đan Trung kỳ',stageUp:1};
  const vet={activeMs:9e9,interactions:9999,realm:20};
  assert.equal(stageVoice(e),true);
  assert.ok(priority(e)>=3);
  assert.equal(voiceDecision(e,{now:100000,player:vet}),'play');
  assert.equal(voiceDecision(e,{now:100000,player:vet,lastStageAt:95000}),'drop');
  assert.equal(voiceDecision(e,{now:100000,player:vet,ritualBusy:true}),'drop');
  const line=speechPlan(e).map(x=>x.text).join(' ');
  assert.match(line,/Kim Đan Trung kỳ/);assert.match(line,/An/);
  assert.doesNotMatch(line,/thả tim|cảm ơn|đa tạ/i);
});

test('tim vận công hiện "Tăng tu vi +X" và mang qiGain cho hiệu ứng', () => {
  const w=createWorld('live');const N=Date.parse('2026-11-17T12:00:00Z');
  action(w,{type:'join',userId:'a',name:'An'},N);const p=w.players.a;p.engagedAt=N;
  const r=action(w,{type:'like',userId:'a',count:5},N+1);
  assert.equal(r.heartCultivated,true);
  const ev=w.events.findLast(x=>x.heartCultivate);
  assert.ok(ev);assert.match(ev.text,/^Tăng tu vi \+\d/);assert.doesNotMatch(ev.text,/Tim tụ linh/);
  assert.ok(ev.qiGain>0);
});

test('hiệu ứng tim hóa tu vi: tim bay vào, bùng giữa, chữ mờ dần; máy yếu ít tim hơn', () => {
  assert.ok(HEART_QI_MS<=2000);
  assert.ok(heartQiPlan(.4).hearts.length>heartQiPlan(.4,true).hearts.length);
  assert.ok(heartQiPlan(.57).burst>.9);
  assert.equal(heartQiPlan(0).textAlpha,0);
  assert.ok(heartQiPlan(.7).textAlpha>.9);
  assert.ok(heartQiPlan(.999).textAlpha<.05);
  assert.equal(heartQiPlan(.999).hearts.length,0);
});

test('nới độ khó 17/11: ×1,1/cảnh giới từ 15, cảnh giới cuối ăn nhiều tu vi hơn', () => {
  assert.equal(hardRealmMult(14),1);
  assert.ok(Math.abs(hardRealmMult(20)-1.1**6)<1e-9);
  assert.ok(hardRealmMult(23)<2.4);
  assert.equal(lateGrowthMult({realm:25}),.6);
  assert.ok(requiredQi({realm:20})<requiredQi({realm:21}));
});
