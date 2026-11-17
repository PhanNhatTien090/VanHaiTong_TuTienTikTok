import test from 'node:test';
import assert from 'node:assert/strict';
import {infoPages,spotlightPage,spotlightHTML,INFO_PERIOD_MS,INFO_SHOW_MS} from '../public/info-spotlight.js';
const state={realms:['Phàm nhân','Luyện Khí','Trúc Cơ'],catalog:[
 {type:'artifact',name:'Kiếm A',price:100,tier:1},{type:'artifact',name:'Kiếm Riêng',price:5,exclusive:true},
 {type:'manual',name:'Thanh Tâm Quyết',price:35,description:'Tu luyện nhận thêm 15% tu vi.'},{type:'pill',name:'Tinh Thể',price:12,herbs:2,qi:65}]};

test('các trang thông tin: chức vị, xem của mình, rèn, bí pháp, đan dược, trang bị, Lôi Đài', () => {
  const ids = infoPages(state).map(p => p.id);
  assert.deepEqual(ids, ['honor','me','forge','manual','pill','gear','master','bao','arena']);
  const forge = infoPages(state).find(p => p.id === 'forge');
  assert.ok(!forge.rows.some(r => r[0] === 'Kiếm Riêng'), 'món độc quyền không hiện');
});

test('mỗi 4 phút hiện 1 phút, chu kỳ sau đổi chủ đề', () => {
  assert.equal(spotlightPage(state, 1000).id, 'honor');
  assert.equal(spotlightPage(state, INFO_SHOW_MS + 1000), null);
  assert.equal(spotlightPage(state, INFO_PERIOD_MS + 5000).id, 'me');
  assert.equal(spotlightPage(state, INFO_PERIOD_MS * 9 + 5000).id, 'honor');
});

test('HTML thoát ký tự và có tiêu đề', () => {
  const esc = s => String(s).replace(/</g, '&lt;');
  const html = spotlightHTML({title:'X<y', rows:[['a','b']]}, esc);
  assert.match(html, /X&lt;y/);
  assert.equal(spotlightHTML(null, esc), '');
});
