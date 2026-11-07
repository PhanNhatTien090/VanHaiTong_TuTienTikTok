import test from 'node:test';import assert from 'node:assert/strict';import {giftBoardHTML,giftBoardRows} from '../public/gift-board.js';
test('in-game gift chart is disabled for the native TikTok chart',()=>{assert.equal(giftBoardHTML({gifts:[{}]}),'');assert.deepEqual(giftBoardRows(),[]);});
