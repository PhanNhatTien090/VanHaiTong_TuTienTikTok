import test from 'node:test';
import assert from 'node:assert/strict';
import {TS,THAI_SO_DURATION,thaiSoHits,thaiSoState} from '../public/thai-so-awakening.js';
import {lateAscension} from '../public/late-ascension-data.js';
import {THAI_SO_SCORE} from '../public/thai-so-audio.js';

test('Thái Sơ v2 keeps the queue/audio timing of realm 25', () => {
  const spec=lateAscension(25);
  assert.equal(THAI_SO_DURATION,spec.duration);
  assert.equal(TS.impact,spec.impact);
  assert.ok(TS.reveal>TS.impact&&TS.reveal<TS.impact+.5);
});

test('Thái Sơ v2 is dense: a hit at least every 2.6 s before the impact', () => {
  const at=thaiSoHits().map(([a])=>a).sort((a,b)=>a-b);
  for(let i=1;i<at.length;i++)if(at[i]<=TS.impact)assert.ok(at[i]-at[i-1]<=2.6,`gap ${at[i-1]}→${at[i]}`);
  assert.ok(at.length>=50);
});

test('skin changes only after the impact', () => {
  assert.equal(thaiSoState((TS.impact-.01)/TS.duration).revealed,false);
  assert.equal(thaiSoState((TS.reveal+.01)/TS.duration).revealed,true);
});

test('score cues stay inside the ritual and below clipping levels', () => {
  for(const cue of THAI_SO_SCORE){assert.ok(cue.at>=0&&cue.at<TS.duration);assert.ok(cue.level<=.4);}
});
