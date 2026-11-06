import {test} from 'node:test';import assert from 'node:assert/strict';
import {giftBoardRows,giftBoardHTML} from '../public/gift-board.js';
test('gift guide keeps four simple offers visible without coin counts or rotating pages',()=>{
 const state={gifts:[{}]},rows=giftBoardRows(state),html=giftBoardHTML(state,0);
 assert.equal(rows.length,4);for(const text of ['Hoa hồng','Tăng mạnh tu vi','Bánh vòng','Cơ duyên lớn','Quà lớn hơn','Thiên mệnh','Phượng Hoàng','Phong Tông chủ','Chủ LIVE xác nhận'])assert.ok(html.includes(text));
 assert.equal((html.match(/class="gift-board-row"/g)||[]).length,4);assert.doesNotMatch(html,/coin|linh thạch/);assert.equal(html,giftBoardHTML(state,24000));assert.equal(giftBoardHTML({gifts:[]}), '');
});
