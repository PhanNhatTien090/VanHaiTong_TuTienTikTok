import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,markLiveSession,setEventSettings,tick} from '../engine.mjs';
import {automaticEventsPaused} from '../event-pacing.mjs';
import {eventDashboardHTML,runningEvents} from '../public/event-dashboard.js';

test('mở LIVE mới: giữ sự kiện tự động 10 phút, nhả lần lượt', () => {
  const now=1_800_000_000_000,w=createWorld('live');
  w.liveSession={active:false,startedAt:0};w.nextBigEventAt=now-1;w.nextBossAt=now-1;w.nextAutoEventAt=now-1;
  markLiveSession(w,true,now);
  assert.equal(w.autoHoldUntil,now+10*60000);
  assert.ok(automaticEventsPaused(w,now+60000));
  assert.ok(w.nextBossAt>w.autoHoldUntil&&w.nextBigEventAt>w.nextBossAt,'không dồn cùng lúc');
  tick(w,now+5*60000);
  assert.equal(w.boss,null);assert.ok(!w.maze);assert.ok(!w.tower?.active);
});

test('server restart giữa LIVE không giữ lại; chỉnh phút chờ, hoãn, thả', () => {
  const now=1_800_000_000_000,w=createWorld('live');w.liveSession={active:true,startedAt:now-3600e3};
  markLiveSession(w,true,now);assert.ok(!w.autoHoldUntil);
  assert.equal(setEventSettings(w,{liveWarmupMinutes:0}).ok,true);
  w.liveSession.active=false;markLiveSession(w,true,now);assert.equal(w.autoHoldUntil,now);
  assert.equal(setEventSettings(w,{liveWarmupMinutes:99}).ok,false);
  assert.ok(setEventSettings(w,{holdMinutes:30}).settings.autoHoldUntil>Date.now()+29*60000);
  setEventSettings(w,{releaseHold:true});assert.equal(w.autoHoldUntil,0);
  assert.deepEqual(setEventSettings(w,{randomExclude:['maze','boss','x']}).settings.randomExclude,['maze','boss']);
});

test('trang Sự kiện: Mê Cung đang chạy có nút Hủy ở đầu trang', () => {
  const now=Date.now(),state={serverNow:now,maze:{phase:'running',endsAt:now+60000},settings:{},players:[],socialStatus:{}};
  const r=runningEvents(state);assert.equal(r.length,1);assert.match(r[0].stop,/data-social="stop-maze"/);
  const html=eventDashboardHTML(state);assert.match(html,/Hủy Mê Cung/);assert.match(html,/data-setting="liveWarmupMinutes"/);
});
