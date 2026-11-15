import test from 'node:test';
import assert from 'node:assert/strict';
import {VC,VO_CUC_DURATION,voCucHits,voCucState} from '../public/vo-cuc-awakening.js';
import {lateAscension} from '../public/late-ascension-data.js';
import {VO_CUC_SCORE} from '../public/vo-cuc-audio.js';

test('Vô Cực v2 keeps the queue/audio timing of realm 27', () => {
  const spec=lateAscension(27);
  assert.equal(VO_CUC_DURATION,spec.duration);assert.equal(VC.impact,spec.impact);assert.ok(VC.reveal>VC.impact&&VC.reveal<VC.impact+.5);
});
test('dense hits before the impact', () => {
  const at=voCucHits().map(([a])=>a).sort((a,b)=>a-b);
  for(let i=1;i<at.length;i++)if(at[i]<=VC.impact)assert.ok(at[i]-at[i-1]<=2.6,`gap ${at[i-1]}→${at[i]}`);
});
test('cloth is cut before the fate knots, web forms after; skin changes after impact', () => {
  const st=t=>voCucState(t/VC.duration);
  assert.ok(st(18).cloth>.9);assert.ok(st(30).loose>.9);assert.ok(st(40).web>.9);assert.ok(st(46.5).knot>.9);
  assert.equal(st(VC.impact-.01).revealed,false);assert.equal(st(VC.reveal+.01).revealed,true);
  for(const cue of VO_CUC_SCORE){assert.ok(cue.at>=0&&cue.at<VC.duration);assert.ok(cue.level<=.4);}
});
