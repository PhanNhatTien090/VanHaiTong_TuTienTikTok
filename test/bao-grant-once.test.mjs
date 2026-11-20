import test from 'node:test';
import assert from 'node:assert/strict';
import {rollBao,BAO_GRANT_ONCE} from '../phap-bao.mjs';
// 20/11: chủ game dặn — lượt cầu đầu của Chan Bố Mày Đê trong Bảo Khố kế tiếp ra Tru Tiên Kiếm Trận, đúng 1 lần.
test('Tru Tiên cho Chan: chỉ trong Bảo Khố, đúng lượt đầu, chỉ 1 lần', () => {
  const w={players:{},baoKho:{phase:'finished'}},p={id:BAO_GRANT_ONCE.user},other={id:'x'};
  assert.equal(rollBao(w,p,'free',()=>.99).tier,0,'Bảo Khố chưa mở thì không trao');
  w.baoKho={phase:'open'};
  assert.equal(rollBao(w,other,'free',()=>.99).tier,0,'người khác không được');
  const r=rollBao(w,p,'free',()=>.99);assert.equal(r.tier,6);assert.equal(r.id,'L01-tru-tien');
  assert.equal(w.baoSeason.owners['L01-tru-tien'],p.id);
  assert.equal(rollBao(w,p,'free',()=>.99).tier,0,'lượt sau quay về bình thường');
  const w2={players:{},baoKho:{phase:'open'},baoGrantsDone:[BAO_GRANT_ONCE.key]};
  assert.equal(rollBao(w2,{id:BAO_GRANT_ONCE.user},'free',()=>.99).tier,0,'đã dùng thì thôi');
});
