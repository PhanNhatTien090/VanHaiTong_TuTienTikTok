// Lịch luyện — bộ ngẫu nhiên có hạt giống (sfc32). Tất định: cùng seed → cùng dãy số ở trình duyệt lẫn server.
// KHÔNG dùng Math.random trong core/. Trạng thái 4 số 32-bit, lưu/khôi phục được (save()/restore()).

const u32 = x => x >>> 0;

// Băm chuỗi → 4 số 32-bit (cyrb128) để seed từ chữ: "battle:abc", "loot:avatar1:day20261110".
export function hashSeed(text) {
  let h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762;
  const s = String(text);
  for (let i = 0; i < s.length; i++) {
    const k = s.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  return [u32(h1 ^ h2 ^ h3 ^ h4), u32(h2 ^ h1), u32(h3 ^ h1), u32(h4 ^ h1)];
}

// createRng(seed): seed là chữ/số (băm) hoặc 4 số 32-bit; luôn khuấy 12 lần.
// restoreRng(saved): khôi phục ĐÚNG trạng thái đã save(), không khuấy.
export function createRng(seed) { return makeRng(Array.isArray(seed) ? seed.map(u32) : hashSeed(seed), true); }
export function restoreRng(state) {
  if (!Array.isArray(state) || state.length !== 4 || !state.every(Number.isSafeInteger)) throw TypeError('restoreRng: cần 4 số nguyên');
  return makeRng(state.map(u32), false);
}
function makeRng(init, warm) {
  let [a, b, c, d] = init;
  function next() { // số nguyên 32-bit không dấu
    const t = u32(u32(a + b) + d);
    d = u32(d + 1);
    a = u32(b ^ (b >>> 9));
    b = u32(c + (c << 3));
    c = u32((c << 21) | (c >>> 11));
    c = u32(c + t);
    return t;
  }
  if (warm) for (let i = 0; i < 12; i++) next(); // khuấy cho seed yếu
  const rng = {
    next,
    // Số nguyên trong [0, n). Dùng loại bỏ để không lệch phân phối.
    int(n) {
      n = Math.trunc(n);
      if (!(n > 0) || n > 0x100000000) throw RangeError('rng.int: n phải trong 1..2^32');
      const limit = 0x100000000 - (0x100000000 % n);
      let x; do x = next(); while (x >= limit);
      return x % n;
    },
    range(min, max) { return min + rng.int(max - min + 1); }, // nguyên, gồm cả hai đầu
    chance(permille) { return rng.int(1000) < permille; }, // xác suất theo phần nghìn (số nguyên, không dùng số thực)
    pick(list) { if (!list.length) throw RangeError('rng.pick: danh sách rỗng'); return list[rng.int(list.length)]; },
    // Chọn theo trọng số nguyên: [{weight, ...}] hoặc hàm lấy trọng số.
    weighted(list, weightOf = x => x.weight) {
      let total = 0; for (const x of list) { const w = weightOf(x); if (!Number.isInteger(w) || w < 0) throw RangeError('rng.weighted: trọng số phải là số nguyên ≥ 0'); total += w; }
      if (total <= 0) throw RangeError('rng.weighted: tổng trọng số = 0');
      let r = rng.int(total);
      for (const x of list) { r -= weightOf(x); if (r < 0) return x; }
      throw Error('unreachable');
    },
    shuffle(list) { const a = list.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rng.int(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; },
    // Tách luồng con độc lập theo nhãn: rơi đồ không làm lệch dãy số của trận đánh.
    fork(label) { return createRng(hashSeed(`${a}:${b}:${c}:${d}:${label}`)); },
    save() { return [a, b, c, d]; },
  };
  return rng;
}
