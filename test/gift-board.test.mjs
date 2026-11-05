import {test} from 'node:test';import assert from 'node:assert/strict';
import {giftBoardRows,giftBoardHTML} from '../public/gift-board.js';import {DEFAULT_GIFTS,CATALOG} from '../engine.mjs';
test('small gift board pages two real photos without emoji or tall footnotes',()=>{
 const s={gifts:DEFAULT_GIFTS,catalog:CATALOG},rows=giftBoardRows(s);
 assert.equal(rows.length,8);assert.ok(rows.every(r=>(r.sheet||r.image)&&!r.icon));assert.deepEqual(rows.slice(0,2).map(r=>r.coins),[1,30]);assert.match(giftBoardHTML(s,0),/gift-rose.webp/);assert.match(giftBoardHTML(s,0),/gift-doughnut.webp/);assert.equal(rows[0].qi,24);assert.equal(rows[1].artifact,'Thanh Ngọc Kiếm');
 assert.equal(rows.find(r=>r.coins===25999).artifact,'Thiên Đế Chí Tôn Ấn');
 assert.equal(giftBoardHTML(s,0).includes('gift-emoji'),false);assert.equal(giftBoardHTML(s,0).includes('gift-board-rule'),false);
 assert.equal((giftBoardHTML(s,8000).match(/class="gift-board-row"/g)||[]).length,2);
 assert.match(giftBoardHTML(s,24000),/gift-photo/);assert.match(giftBoardHTML(s,24000),/Thiên Đế Chí Tôn Ấn/);
 assert.notEqual(giftBoardHTML(s,0),giftBoardHTML(s,8000));
});
