// Lịch luyện — túi đồ chồng (ll_stacks). Gọi trong transaction của nghiệp vụ. Không bao giờ âm.
export function stacks(db, avatarId) {
  return Object.fromEntries(db.prepare('SELECT item_id, count FROM ll_stacks WHERE avatar_id=? AND count>0').all(avatarId).map(r => [r.item_id, r.count]));
}
export function countOf(db, avatarId, itemId) {
  return db.prepare('SELECT count FROM ll_stacks WHERE avatar_id=? AND item_id=?').get(avatarId, itemId)?.count || 0;
}
export function addItems(db, avatarId, items, content) {
  const up = db.prepare('INSERT INTO ll_stacks(avatar_id,item_id,count) VALUES(?,?,?) ON CONFLICT(avatar_id,item_id) DO UPDATE SET count=count+excluded.count');
  for (const [id, n] of Object.entries(items)) {
    if (!content.byId.get(id)?.kind) throw Error('Vật phẩm lạ: ' + id);
    if (!Number.isSafeInteger(n) || n < 1) throw RangeError('Số lượng phải ≥ 1');
    up.run(avatarId, id, n);
  }
}
// Tiêu: kiểm đủ trước (ném lỗi INSUFFICIENT) rồi trừ. Trong transaction nên toàn bộ hoặc không gì cả.
export function removeItems(db, avatarId, items) {
  for (const [id, n] of Object.entries(items)) if (countOf(db, avatarId, id) < n) throw Object.assign(Error('Thiếu ' + id), { code: 'INSUFFICIENT', item: id });
  const dec = db.prepare('UPDATE ll_stacks SET count=count-? WHERE avatar_id=? AND item_id=? AND count>=?');
  for (const [id, n] of Object.entries(items)) if (dec.run(n, avatarId, id, n).changes !== 1) throw Error('Trừ đồ thất bại: ' + id);
}
