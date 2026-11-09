import test from 'node:test';import assert from 'node:assert/strict';
import {ownsGear,SKIN_GEAR} from '../public/skin-gear.js';
test('skin gear shows when owned, whatever skin or equipped item',()=>{
 const p={skinChoice:'vuonglam-avatar',equipped:'galaxy-dharma-wheel',skinGear:['phan-thien-song-dao']};
 assert.equal(ownsGear(p,'phan-thien-song-dao'),true);assert.equal(ownsGear(p,'khuy-niet-tu-loi-long'),false);
 assert.equal(ownsGear({artifacts:['tudo-huyet-dao']},'tudo-huyet-dao'),true);assert.equal(ownsGear({equipped:'khuy-niet-tu-loi-long'},'khuy-niet-tu-loi-long'),true);
 assert.equal(ownsGear(null,'phan-thien-song-dao'),false);assert.equal(SKIN_GEAR.length,3);
});
