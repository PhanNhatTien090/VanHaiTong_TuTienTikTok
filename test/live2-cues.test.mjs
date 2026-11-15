import {test} from 'node:test';
import assert from 'node:assert/strict';
import {live2CueForEvent} from '../public/live2-cues.js';
test('Boss shield break and successful Heaven Trial are sound milestones',()=>{
 const boss=live2CueForEvent({id:'b',effect:'daoPath',live2Kind:'boss',bossPhase:'seal-break'});
 const heaven=live2CueForEvent({id:'h',effect:'daoPath',live2Kind:'tribulation',tribulationComplete:true});
 assert.equal(boss.theme,'void');
 assert.equal(heaven.theme,'void');
 assert.equal(boss.priority,2);
 assert.ok(boss.gain<.4);
});
test('ordinary combat, progression polls and boss phase ticks are silent',()=>{
 assert.equal(live2CueForEvent({effect:'status',daoStatus:true}),null);
 assert.equal(live2CueForEvent({effect:'daoPath',daoStatus:true}),null);
 assert.equal(live2CueForEvent({effect:'daoPath',bossPhase:'gathering'}),null);
 assert.equal(live2CueForEvent({effect:'attack'}),null);
});
