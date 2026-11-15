import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DIVINE_TIMING} from '../public/divine-timing.js';
import {maxHitGap} from '../public/divine-kit.js';
import {ASCENSIONS} from '../public/ascension-art.js';

// Mỗi realm 14–21 đã nâng cấp: module riêng xuất *_SPEC + bản nhạc *_SCORE.
const DONE=[[14,'dao-to','DT14_SPEC','DAO_TO_SCORE'],[15,'thien-ton','TT15_SPEC','THIEN_TON_SCORE'],[16,'than-quan','TQ16_SPEC','THAN_QUAN_SCORE']];
test('realm 14–21 durations step up 1–1.5 s between Tiên Đế and Ma Thần',()=>{
  let prev=ASCENSIONS[13].duration;
  for(let r=14;r<=21;r++){const d=ASCENSIONS[r].duration;assert.equal(d,DIVINE_TIMING[r].duration*1000);assert.ok(d-prev>=900&&d-prev<=1600,`realm ${r}: +${d-prev}`);prev=d;}
  assert.ok(ASCENSIONS[22].duration>prev);
});
for(const [realm,slug,specName,scoreName] of DONE){
  test(`realm ${realm} (${slug}) timing, density, skin swap and score`,async()=>{
    const m=await import(`../public/${slug}-awakening.js`),a=await import(`../public/${slug}-audio.js`),spec=m[specName];
    assert.equal(spec.realm,realm);assert.equal(spec.duration,DIVINE_TIMING[realm].duration);assert.equal(spec.impact,DIVINE_TIMING[realm].impact);
    assert.ok(spec.reveal>spec.impact&&spec.reveal<spec.impact+.5);assert.ok(spec.fade>spec.reveal+2);
    assert.ok(maxHitGap(spec.hits,spec.impact)<=2.6,`gap ${maxHitGap(spec.hits,spec.impact)}`);
    for(const cue of a[scoreName]){assert.ok(cue.at>=0&&cue.at<spec.duration);assert.ok(cue.level<=.4);}
    assert.ok(fs.readFileSync('public/live-cinema.js','utf8').includes(`./${slug}-awakening.js`));
  });
}
