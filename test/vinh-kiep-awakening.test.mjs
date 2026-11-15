import test from 'node:test';
import assert from 'node:assert/strict';
import {VK,VINH_KIEP_DURATION,vinhKiepHits,vinhKiepState,flowClock} from '../public/vinh-kiep-awakening.js';
import {lateAscension} from '../public/late-ascension-data.js';
import {VINH_KIEP_SCORE} from '../public/vinh-kiep-audio.js';

test('Vĩnh Kiếp v2 keeps the queue/audio timing of realm 26', () => {
  const spec=lateAscension(26);
  assert.equal(VINH_KIEP_DURATION,spec.duration);assert.equal(VK.impact,spec.impact);assert.ok(VK.reveal>VK.impact&&VK.reveal<VK.impact+.5);
});
test('dense hits before the impact, except the deliberate frozen hush', () => {
  const at=vinhKiepHits().map(([a])=>a).sort((a,b)=>a-b);
  for(let i=1;i<at.length;i++)if(at[i]<=VK.impact)assert.ok(at[i]-at[i-1]<=2.6,`gap ${at[i-1]}→${at[i]}`);
});
test('action clock runs, freezes under the hourglass, then rewinds', () => {
  assert.equal(flowClock(10),10);
  const a=flowClock(VK.freeze+1),b=flowClock(VK.flip-.1);assert.ok(Math.abs(a-b)<.05,'frozen');
  assert.ok(flowClock(VK.rewindEnd)<flowClock(VK.flip)-10,'rewound');
});
test('skin changes only after the impact; score stays in range', () => {
  assert.equal(vinhKiepState((VK.impact-.01)/VK.duration).revealed,false);
  assert.equal(vinhKiepState((VK.reveal+.01)/VK.duration).revealed,true);
  for(const cue of VINH_KIEP_SCORE){assert.ok(cue.at>=0&&cue.at<VK.duration);assert.ok(cue.level<=.4);}
});
