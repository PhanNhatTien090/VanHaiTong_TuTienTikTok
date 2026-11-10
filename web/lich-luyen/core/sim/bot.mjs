// Lịch luyện — AI điều khiển người chơi. Dùng cho: tự động chiến đấu (thưởng 70%), quét ải, Luận Kiếm (điều khiển bản chụp),
// giả lập cân bằng, và test. Thuần, tất định: chỉ đọc trạng thái trận, không dùng ngẫu nhiên riêng.
import { dist2, dirTo, DIR_COUNT, DIRS, POS, isqrt } from '../fixed.mjs';
import { BTN } from './inputs.mjs';

// opts.react: số nhịp bot cần để "thấy" một vòng hiểm họa mới (mô phỏng phản xạ người thật ~10–12 nhịp). 0 = phản xạ tức thì.
export function botInput(content, state, opts = {}) {
  const react = opts.react || 0;
  const p = state.player;
  if (!p.alive || state.over) return { dir: -1, buttons: 0 };
  // Né hiểm họa: đứng trong vòng sắp giáng thì chạy ra (sắp giáng mà gần tâm thì lướt)
  for (const z of state.hazards || []) {
    if (z.total - z.left < react) continue;
    const rr = z.r + p.r + 12 * POS;
    if (dist2(z.x, z.y, p.x, p.y) > rr * rr) continue;
    const toward = dirTo(z.x - p.x, z.y - p.y), away = escape(state, p, z.x === p.x && z.y === p.y ? 0 : toward);
    return { dir: away, buttons: z.left <= 10 && (p.cds.dash || 0) === 0 ? BTN.DASH : 0 };
  }
  let foe = null, bd = Infinity, near = 0;
  for (const e of state.entities) {
    if (!e.alive || e.team !== 'enemy') continue;
    const d = dist2(p.x, p.y, e.x, e.y);
    if (d < bd) { bd = d; foe = e; }
    if (d < (260 * POS) ** 2) near++;
  }
  if (!foe) { // không có quái (thử thách): giữ quanh giữa sân để còn chỗ né
    const cx = state.w >> 1, cy = state.h >> 1;
    return { dir: dist2(p.x, p.y, cx, cy) > (120 * POS) ** 2 ? dirTo(cx - p.x, cy - p.y) : -1, buttons: 0 };
  }
  const attack = content.byId.get(p.skills.attack), special = content.byId.get(p.skills.special);
  const reach = attackReach(attack) * POS;
  const toward = dirTo(foe.x - p.x, foe.y - p.y);
  let buttons = 0, dir = -1;

  // Né khi máu thấp và bị áp sát
  if (p.hp * 100 < p.maxHp * 35 && bd < (120 * POS) ** 2 && (p.cds.dash || 0) === 0) return { dir: escape(state, p, toward), buttons: BTN.DASH };
  // Tiếp cận tới ~80% tầm đánh; quá gần với đạo lộ đánh xa thì lùi (thả diều), tránh lùi vào tường
  const d = isqrt(bd); // số nguyên: bot cũng điều khiển đối thủ Luận Kiếm nên phải tất định như mô phỏng
  if (d * 10 > reach * 8) dir = toward;
  else if (reach > 200 * POS && d * 10 < reach * 6) dir = escape(state, p, toward);
  buttons |= BTN.ATTACK;
  if (special && p.mp >= special.mp && (p.cds.special || 0) === 0 && (near >= 2 || foe.boss)) buttons |= BTN.SPECIAL;
  return { dir, buttons };
}

// Hướng chạy khỏi địch: trong các hướng "ngược phía địch" (±90°), chọn hướng xa tường nhất sau 80px.
function escape(state, p, toward) {
  const back = (toward + DIR_COUNT / 2) % DIR_COUNT, margin = 80 * POS;
  let best = back, bestRoom = -1;
  for (const off of [0, 4, -4, 8, -8, 12, -12, 16, -16]) {
    const dir = (back + off + DIR_COUNT) % DIR_COUNT, [cx, sy] = DIRS[dir];
    const x = p.x + Math.trunc(cx * margin / 10000), y = p.y + Math.trunc(sy * margin / 10000);
    const room = Math.min(x, y, state.w - x, state.h - y);
    if (room > bestRoom) { bestRoom = room; best = dir; }
    if (room >= margin) break; // hướng gần "thẳng lùi" nhất mà còn chỗ
  }
  return best;
}

function attackReach(skill) {
  const a = skill.action;
  if (a.type === 'projectile') return Math.trunc(a.range * 85 / 100);
  if (a.type === 'melee') return a.offset + a.radius;
  if (a.type === 'nova') return a.radius;
  if (a.type === 'zone') return a.offset + a.radius;
  return 60;
}
