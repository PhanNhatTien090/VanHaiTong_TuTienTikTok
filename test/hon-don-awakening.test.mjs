import test from 'node:test';
import assert from 'node:assert/strict';
import {HD,HON_DON_DURATION,honDonHits,honDonState} from '../public/hon-don-awakening.js';
import {lateAscension} from '../public/late-ascension-data.js';
import {HON_DON_SCORE} from '../public/hon-don-audio.js';

test('Hỗn Độn v2 keeps the queue/audio timing of realm 28', () => {
  const spec=lateAscension(28);
  assert.equal(HON_DON_DURATION,spec.duration);assert.equal(HD.impact,spec.impact);assert.ok(HD.reveal>HD.impact&&HD.reveal<HD.impact+.5);
});
test('dense hits before the impact', () => {
  const at=honDonHits().map(([a])=>a).sort((a,b)=>a-b);
  for(let i=1;i<at.length;i++)if(at[i]<=HD.impact)assert.ok(at[i]-at[i-1]<=2.6,`gap ${at[i-1]}→${at[i]}`);
});
test('world flips during gravity reversal and returns; split happens only at Khai Thiên', () => {
  const st=t=>honDonState(t/HD.duration);
  assert.equal(st(20).rot,0);assert.ok(st(26).rot>.99);assert.equal(st(31).rot,0);
  assert.equal(st(HD.impact-.01).split,0);assert.ok(st(HD.impact+.4).split>.9);assert.equal(st(HD.impact+2).split,0);
  assert.equal(st(HD.impact-.01).revealed,false);assert.equal(st(HD.reveal+.01).revealed,true);
  for(const cue of HON_DON_SCORE){assert.ok(cue.at>=0&&cue.at<HD.duration);assert.ok(cue.level<=.4);}
});
