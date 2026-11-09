import test from 'node:test';import assert from 'node:assert/strict';
import {BGM_LIST,musicIndex,musicChangesAt,applyMusicCommand,MUSIC_ROTATE_MS as R} from '../public/music-rotation.js';
import fs from 'node:fs';
test('music files exist and rotation changes every 30 minutes',()=>{
 for(const t of BGM_LIST)assert.ok(fs.existsSync('public'+t.src),t.src);
 const m={mode:'auto',index:2,at:1000};assert.equal(musicIndex(m,1000+R-1),2);assert.equal(musicIndex(m,1000+R),3);assert.equal(musicIndex(m,1000+R*6),0);
 assert.equal(musicChangesAt(m,1000+5),1000+R);assert.equal(musicChangesAt({mode:'fixed',index:1},5),null);
 assert.equal(musicIndex(null,R*9),9%BGM_LIST.length);
});
test('admin commands: fixed pick, next, back to auto from the playing track',()=>{
 const now=10*R;let m=applyMusicCommand(null,'3',now);assert.deepEqual(m,{mode:'fixed',index:3,at:now});assert.equal(musicIndex(m,now+5*R),3);
 m=applyMusicCommand(m,'next',now+R);assert.equal(m.mode,'fixed');assert.equal(musicIndex(m,now+9*R),4);
 m=applyMusicCommand(m,'auto',now+2*R);assert.equal(musicIndex(m,now+2*R),4);assert.equal(musicIndex(m,now+3*R),5);
 assert.equal(applyMusicCommand(m,'99',now),null);assert.equal(applyMusicCommand(m,'x',now),null);
});
