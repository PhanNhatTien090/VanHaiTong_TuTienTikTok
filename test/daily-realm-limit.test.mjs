// 21/11/2026 tối (chủ game): từ Hóa Thần mỗi ngày đột phá tối đa 3 lần; người đã chuyển sinh không giới hạn; chỉ điểm không tính (test/mentor).
import test from 'node:test';import assert from 'node:assert/strict';
import {createWorld,ensurePlayer} from '../engine.mjs';
import {dailyAscensionView,recordDailyAscension,DAILY_REALM_LIMIT} from '../daily-practice.mjs';
const N=1_800_000_000_000;
const setup=()=>{const w=createWorld('live');const p=ensurePlayer(w,'a','An',N);p.realm=5;return {w,p};};
test('mặc định 3 lần/ngày từ Hóa Thần; dưới Hóa Thần không giới hạn; qua ngày mới làm lại',()=>{
 const {w,p}=setup();assert.equal(DAILY_REALM_LIMIT,3);
 for(let i=0;i<3;i++){assert.equal(dailyAscensionView(w,p,N).exhausted,false);recordDailyAscension(w,p,N);}
 assert.equal(dailyAscensionView(w,p,N).exhausted,true);assert.equal(dailyAscensionView(w,p,N+86400000).exhausted,false);
 p.realm=4;assert.equal(dailyAscensionView(w,p,N).enabled,false);
});
test('người đã chuyển sinh không giới hạn; settings 0 = tắt, số khác = đổi mức',()=>{
 let {w,p}=setup();p.reincarnations=1;for(let i=0;i<5;i++)recordDailyAscension(w,p,N);assert.equal(dailyAscensionView(w,p,N).exhausted,false);
 ({w,p}=setup());w.settings.dailyRealmLimit=0;for(let i=0;i<5;i++)recordDailyAscension(w,p,N);assert.equal(dailyAscensionView(w,p,N).exhausted,false);
 ({w,p}=setup());w.settings.dailyRealmLimit=1;recordDailyAscension(w,p,N);assert.equal(dailyAscensionView(w,p,N).exhausted,true);
});