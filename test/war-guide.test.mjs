import test from 'node:test';
import assert from 'node:assert/strict';
import {warGuidePage,warGuideHTML} from '../public/war-guide.js';
const esc=s=>String(s);

test('không có Chính Ma thì không có bảng hướng dẫn trận', () => {
  assert.equal(warGuidePage(null), null);
  assert.equal(warGuidePage({active:false,phase:'finished'}), null);
});

test('giai đoạn tuyển quân hướng dẫn gõ chinh / ma', () => {
  const p = warGuidePage({active:true,phase:'registration'});
  const cmds = p.rows.map(r => r[0]);
  assert.ok(cmds.includes('chinh') && cmds.includes('ma'));
  assert.match(p.title, /CHỌN PHE/);
});

test('khai trận có lệnh chiến + tim + điều kiện thắng, không mồi tương tác', () => {
  const p = warGuidePage({active:true,phase:'running'});
  const html = warGuideHTML(p, esc, {chinh:3, ma:5});
  assert.match(html, /chiến/);
  assert.match(html, /sơn môn/);
  assert.match(html, /Chính 3/);
  assert.doesNotMatch(html, /follow|theo dõi|nhận thưởng mốc|đa tạ|cảm ơn/i);
});
