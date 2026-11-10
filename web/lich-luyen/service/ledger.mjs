// Lịch luyện — sổ cái tiền tệ. MỌI thay đổi số dư đi qua đây (không UPDATE thẳng ll_balances ở chỗ khác).
// Gọi trong transaction của nghiệp vụ (service/battles.mjs…) để thưởng và trạng thái cập nhật cùng lúc.
export const CURRENCIES = Object.freeze(['linh-thach', 'tien-ngoc', 'cong-hien', 'vinh-du']);

export function balance(db, avatarId, currency) {
  return db.prepare('SELECT amount FROM ll_balances WHERE avatar_id=? AND currency=?').get(avatarId, currency)?.amount || 0;
}
export function balances(db, avatarId) {
  return Object.fromEntries(CURRENCIES.map(c => [c, 0]).concat(db.prepare('SELECT currency, amount FROM ll_balances WHERE avatar_id=?').all(avatarId).map(r => [r.currency, r.amount])));
}

// delta âm = tiêu; không đủ thì ném lỗi (transaction bên ngoài sẽ hoàn tác).
export function post(db, { avatarId, currency, delta, reason, ref = null, at }) {
  if (!CURRENCIES.includes(currency)) throw Error('Tiền tệ lạ: ' + currency);
  if (!Number.isSafeInteger(delta) || delta === 0) throw RangeError('delta phải là số nguyên khác 0');
  if (!reason) throw Error('Thiếu lý do ghi sổ');
  const next = balance(db, avatarId, currency) + delta;
  if (next < 0) throw Object.assign(Error('Không đủ ' + currency), { code: 'INSUFFICIENT' });
  db.prepare('INSERT INTO ll_balances(avatar_id,currency,amount) VALUES(?,?,?) ON CONFLICT(avatar_id,currency) DO UPDATE SET amount=excluded.amount').run(avatarId, currency, next);
  db.prepare('INSERT INTO ll_ledger(avatar_id,currency,delta,balance_after,reason,ref,at) VALUES(?,?,?,?,?,?,?)').run(avatarId, currency, delta, next, reason, ref, at);
  return next;
}
