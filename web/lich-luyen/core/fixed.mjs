// Lịch luyện — số học nguyên cho mô phỏng tất định.
// Vị trí: đơn vị 1/100 px (POS=100). Hướng: bảng 64 hướng viết sẵn, độ dài DIR_SCALE.
// Không dùng Math.sin/cos/atan2/sqrt số thực trong mô phỏng: kết quả số thực có thể khác giữa các trình duyệt.

export const POS = 100;          // 1 px = 100 đơn vị
export const DIR_COUNT = 64;
export const DIR_SCALE = 10000;
// cos, sin của 64 hướng × 10000 (sinh một lần bằng Math.cos/sin rồi viết cứng; không tính lại lúc chạy).
const T = [10000,0,9952,980,9808,1951,9569,2903,9239,3827,8819,4714,8315,5556,7730,6344,7071,7071,6344,7730,5556,8315,4714,8819,3827,9239,2903,9569,1951,9808,980,9952,0,10000,-980,9952,-1951,9808,-2903,9569,-3827,9239,-4714,8819,-5556,8315,-6344,7730,-7071,7071,-7730,6344,-8315,5556,-8819,4714,-9239,3827,-9569,2903,-9808,1951,-9952,980,-10000,0,-9952,-980,-9808,-1951,-9569,-2903,-9239,-3827,-8819,-4714,-8315,-5556,-7730,-6344,-7071,-7071,-6344,-7730,-5556,-8315,-4714,-8819,-3827,-9239,-2903,-9569,-1951,-9808,-980,-9952,0,-10000,980,-9952,1951,-9808,2903,-9569,3827,-9239,4714,-8819,5556,-8315,6344,-7730,7071,-7071,7730,-6344,8315,-5556,8819,-4714,9239,-3827,9569,-2903,9808,-1951,9952,-980];
export const DIRS = Object.freeze(Array.from({ length: DIR_COUNT }, (_, i) => Object.freeze([T[2 * i], T[2 * i + 1]])));

export const wrapDir = d => ((Math.trunc(d) % DIR_COUNT) + DIR_COUNT) % DIR_COUNT;
export const dirVec = d => DIRS[wrapDir(d)];

// Chia làm tròn về 0 như số nguyên (tránh lệch giữa số âm/dương).
export const idiv = (a, b) => Math.trunc(a / b);
// a*b/c cho số nguyên; an toàn khi |a*b| < 2^53.
export function mulDiv(a, b, c) {
  const p = a * b;
  if (!Number.isSafeInteger(p)) throw RangeError('mulDiv tràn số');
  return Math.trunc(p / c);
}
// Dịch chuyển theo hướng d với tốc độ speed (đơn vị vị trí mỗi nhịp).
export function step(x, y, d, speed) { const [cx, sy] = dirVec(d); return [x + mulDiv(cx, speed, DIR_SCALE), y + mulDiv(sy, speed, DIR_SCALE)]; }

export function isqrt(n) { // căn bậc hai nguyên (floor), Newton trên số nguyên
  if (!Number.isSafeInteger(n) || n < 0) throw RangeError('isqrt: cần số nguyên ≥ 0');
  if (n < 2) return n;
  let x = n, y = Math.trunc((x + 1) / 2);
  while (y < x) { x = y; y = Math.trunc((x + Math.trunc(n / x)) / 2); }
  return x;
}
export const dist2 = (ax, ay, bx, by) => { const dx = bx - ax, dy = by - ay; return dx * dx + dy * dy; };
export const dist = (ax, ay, bx, by) => isqrt(dist2(ax, ay, bx, by));
export const clamp = (v, lo, hi) => v < lo ? lo : v > hi ? hi : v;

// Hướng gần nhất (0..63) từ vector (dx,dy) — so tích vô hướng với bảng, không dùng atan2.
export function dirTo(dx, dy) {
  if (dx === 0 && dy === 0) return 0;
  let best = 0, bestDot = -Infinity;
  for (let i = 0; i < DIR_COUNT; i++) { const [cx, sy] = DIRS[i]; const dot = cx * dx + sy * dy; if (dot > bestDot) { bestDot = dot; best = i; } }
  return best;
}

// Lượng tử hóa joystick (số thực ở trình duyệt) → hướng 0..63 + có/không di chuyển. Chỉ dùng ở lớp nhập liệu, không trong mô phỏng.
export function quantizeStick(x, y, dead = 0.25) {
  if (x * x + y * y < dead * dead) return -1;
  return dirTo(Math.round(x * 1000), Math.round(y * 1000));
}
