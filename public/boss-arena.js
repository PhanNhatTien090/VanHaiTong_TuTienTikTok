// Màn đánh boss (3/11/2026): khi có yêu thú, cảnh chuyển sang chiến trường riêng.
// Yêu thú ở trên cao, các tu sĩ xếp hàng phía dưới bắn linh quang lên; yêu thú bắn yêu khí xuống.
// Cánh tiên vỗ nhẹ sau lưng tu sĩ (theo cảnh giới), dùng cả ngoài màn đánh boss.
// Ảnh: /assets/arena-v1/boss-arena.png (nền dọc) và wings-atlas.png (4 kiểu cánh, nền trong suốt).
import {attackTechnique,drawCombatTechnique} from './combat-techniques.js';
const TAU = Math.PI * 2;
const hash = s => { let h = 2166136261; for (const ch of String(s)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return h >>> 0; };
const testArena = (() => { try { return new URLSearchParams(location.search).get('arena') === 'test'; } catch { return false; } })();

function load(src) { if (typeof Image === 'undefined') return null; const img = new Image(); img.decoding = 'async'; img.src = src; return img; } // chạy trong Node (kiểm thử) thì không có Image
const ready = img => img && img.complete && img.naturalWidth > 0;
export function arenaArt(scene) {
  return scene.arenaArt ??= { bg: load('/assets/arena-v1/boss-arena.png'), wings: load('/assets/arena-v1/wings-atlas.png') };
}

/** Đang ở màn đánh boss? (không áp khi đua phi kiếm / tỷ thí / kết duyên) */
export function arenaOn(scene) {
  if (testArena && !scene.boss) scene.boss = { species: 'storm-tiger', name: 'Lôi Hổ Thiên Kiếp', startedAt: Date.now() - 5000, hp: 80, maxHp: 100 };
  return !!scene.boss && !scene.raceStatus?.active && !scene.socialScene && !scene.socialStage?.length;
}
export const ARENA_BOSS_Y = .22; // tỷ lệ chiều cao: yêu thú ở trên cao
export function arenaBackground(scene, fallback) { const a = arenaArt(scene); return arenaOn(scene) && ready(a.bg) ? a.bg : fallback; }

/** Tu sĩ xếp thành các hàng ở nửa dưới, hàng trước to hơn, so le để không che nhau. */
export function arenaTargets(players, H) {
  const n = players.length, cols = n > 24 ? 7 : n > 12 ? 6 : n > 6 ? 5 : Math.max(1, n), rows = Math.max(1, Math.ceil(n / cols));
  const top = H * .60, bottom = H * .85;
  return players.map((player, i) => {
    const row = Math.floor(i / cols), len = Math.min(cols, n - row * cols), depth = rows === 1 ? 1 : row / (rows - 1);
    const scale = Math.min(1.25, .9 + depth * .3) * (n > 24 ? .82 : n > 12 ? .9 : 1), stagger = row % 2 ? 780 / cols / 2 * .5 : 0;
    return { id: player.id, player, x: 450 + (i % cols - (len - 1) / 2) * 780 / cols + stagger, y: rows === 1 ? H * .74 : top + row * (bottom - top) / (rows - 1), scale, lift: 0 };
  });
}

// 3/11: CHỈ người đã tặng quà mới có cánh; kiểu cánh theo tổng coin đã tặng.
const WING_TIERS = [
  { min: 1, cell: 0 },     // tặng quà: cánh ngọc trắng
  { min: 100, cell: 3 },   // 100+ coin: cánh long vũ lam
  { min: 500, cell: 2 },   // 500+ coin: cánh pha lê tím
  { min: 2000, cell: 1 },  // 2000+ coin: cánh phượng hoàng vàng
];
/** Cánh tiên sau lưng (vẽ trước thân). Chưa tặng quà / NPC / tu sĩ giả thì không có cánh. */
export function drawWings(scene, c, target, t) {
  const p = target.player; if (!p || p.resident || p.puppet) return;
  const coins = Number(p.giftCoins) || 0; if (coins < 1) return;
  const img = arenaArt(scene).wings; if (!ready(img)) return;
  const cell = [...WING_TIERS].reverse().find(w => coins >= w.min)?.cell ?? 0;
  const cw = img.naturalWidth / 4, ch = img.naturalHeight, s = (target.scale || 1) * (scene.compact ? .9 : 1);
  const w = 150 * s * (1 + Math.min(.35, Math.log10(coins + 1) * .08)), h = w * ch / cw;
  const flap = scene.motion ? Math.sin(t * .0042 + (hash(p.id) % 628) / 100) : 0;
  c.save(); c.translate(target.x, target.y - 46 * s); c.scale(1 + flap * .07, 1 - flap * .03);
  c.globalAlpha = scene.compact ? .85 : .95;
  c.drawImage(img, cell * cw, 0, cw, ch, -w / 2, -h * .55, w, h);
  c.restore();
}

const SHOT_COLORS = ['#bff6ff', '#9ff3d0', '#ffe6a0', '#d8b4ff', '#ffb38a'];
/** Linh quang của tu sĩ bay lên yêu thú + yêu khí của yêu thú dội xuống. */
export function drawArenaShots(scene, c, t, H) {
  if (!scene.motion || !scene.targets?.length) return;
  const bx = 450, by = H * ARENA_BOSS_Y, light = scene.budget?.level === 'light';
  c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
  scene.targets.forEach((tg, i) => {
    if (light && i % 2) return; if (arenaCasting(scene, tg.id) || (Number(tg.player?.realm) || 0) >= 6 && i % 2) return;
    const h = hash(tg.id), period = 1500 + h % 900, k = ((t + h % period) % period) / 520; if (k > 1) return;
    if(k<.08){const soundKey=tg.id+':'+Math.floor((t+h%period)/period);if(scene.lastBoltSound!==soundKey){scene.lastBoltSound=soundKey;scene.onCombatSound?.('cast','sword');}}
    const sx = tg.x, sy = tg.y - 55 * (tg.scale || 1), bend = ((h % 200) - 100) * .9;
    const at = u => ({ x: sx + (bx - sx) * u + Math.sin(u * Math.PI) * bend, y: sy + (by + 40 - sy) * u });
    const head = at(k), tail = at(Math.max(0, k - .22)), color = SHOT_COLORS[(Number(tg.player?.realm) || 0) % SHOT_COLORS.length];
    const g = c.createLinearGradient(tail.x, tail.y, head.x, head.y); g.addColorStop(0, color + '00'); g.addColorStop(1, color);
    c.strokeStyle = g; c.globalAlpha = .35; c.lineWidth = 14 + (tg.scale || 1) * 4; c.beginPath(); c.moveTo(tail.x, tail.y); c.lineTo(head.x, head.y); c.stroke();
    c.globalAlpha = 1; c.lineWidth = 4 + (tg.scale || 1) * 2; c.beginPath(); c.moveTo(tail.x, tail.y); c.lineTo(head.x, head.y); c.stroke();
    const orb = c.createRadialGradient(head.x, head.y, 0, head.x, head.y, 16); orb.addColorStop(0, color + 'ff'); orb.addColorStop(1, color + '00'); c.fillStyle = orb; c.beginPath(); c.arc(head.x, head.y, 16, 0, TAU); c.fill();
    c.fillStyle = '#ffffff'; c.beginPath(); c.arc(head.x, head.y, 3.5, 0, TAU); c.fill();
    if (k > .9) { c.globalAlpha = (1 - k) * 10; c.strokeStyle = color; c.lineWidth = 2; c.beginPath(); c.arc(bx + bend * .2, by + 40, 18 + (k - .9) * 220, 0, TAU); c.stroke(); c.globalAlpha = 1; }
  });
  // Yêu thú phản đòn: 2 luồng yêu khí so le dội xuống tu sĩ
  for (const lane of (scene.boss?.species==='abyss-dragon'?[]:[0, 1])) {
    const period = 1100, slot = Math.floor((t + lane * 550) / period), k = ((t + lane * 550) % period) / 650; if (k > 1.35) continue;
    const tg = scene.targets[hash(slot + ':' + lane) % scene.targets.length]; if (!tg) continue;
    const tx = tg.x, ty = tg.y - 40 * (tg.scale || 1);
    if (k <= 1) {
      const x = bx + (tx - bx) * k, y = by + 60 + (ty - by - 60) * k * k;
      const r = 9 + 5 * Math.sin(t * .02), glow = c.createRadialGradient(x, y, 0, x, y, r * 3);
      glow.addColorStop(0, '#fff2f8'); glow.addColorStop(.35, '#ff5fa0cc'); glow.addColorStop(1, '#7a1cff00');
      c.fillStyle = glow; c.beginPath(); c.arc(x, y, r * 3, 0, TAU); c.fill();
    } else {
      const u = (k - 1) / .35; c.globalAlpha = 1 - u; c.strokeStyle = '#ff7ab8'; c.lineWidth = 3;
      c.beginPath(); c.ellipse(tx, ty + 30, 20 + u * 50, 7 + u * 16, 0, 0, TAU); c.stroke(); c.globalAlpha = 1;
    }
  }
  c.restore();
}

/**
 * Tu sĩ tự thi triển CHIÊU THẬT của mình lên yêu thú (đúng chiêu như lệnh "danh": theo pháp bảo trang bị
 * và cảnh giới — Thanh Phong Trảm, Vạn Kiếm Quy Tông, Cửu Tiêu Thần Lôi, Thiên Liên Phá Trận, Tinh Hà Luân Chuyển,
 * Thiên Đế Trấn Giới, Xích Phượng Liệt Diễm, Thương Long Xuất Hải…). Cảnh giới cao ra chiêu thường xuyên hơn, chiêu mạnh hơn.
 * Chỉ là hình ảnh trên cảnh, không tính sát thương (sát thương thật vẫn do lệnh danh trên server).
 */
export function drawArenaCasts(scene, c, t, H) {
  if (!scene.motion || !scene.targets?.length) return;
  const light = scene.budget?.level === 'light', st = scene.arenaCasts ??= { list: [], next: 0 };
  const byId = new Map(scene.targets.map(tg => [tg.id, tg]));
  st.list = st.list.filter(x => t - x.start < x.duration && byId.has(x.id));
  const busy = (scene.effects || []).filter(e => e.effect === 'attack').length; // chiêu thật của người chơi đang diễn thì nhường
  if (t >= st.next && st.list.length + busy < (light ? 2 : 3)) {
    const pool = scene.targets.filter(tg => !st.list.some(x => x.id === tg.id));
    const weight = tg => 1 + Math.pow(Math.max(0, Number(tg.player?.realm) || 0), 1.35) + (tg.player?.equipped ? 2 : 0);
    let r = Math.random() * pool.reduce((n, tg) => n + weight(tg), 0);
    const tg = pool.find(x => (r -= weight(x)) < 0) || pool[0];
    if (tg) {
      let tech; try { tech = attackTechnique(tg.player); } catch { tech = null; }
      if (tech?.id) {
        scene.onCombatSound?.('cast',tech.id);
        const realm = Number(tg.player?.realm) || 0;
        st.list.push({ id: tg.id, start: t, duration: tech.duration || 2000, realm,
          e: { effect: 'attack', user: tg.id, technique: tech, target: { x: 450, yRatio: ARENA_BOSS_Y + .02 }, damage: 60 + realm * 35 } });
      }
    }
    st.next = t + (light ? 1500 : 900) + Math.random() * 700;
  }
  for (const x of st.list) {
    const tg = byId.get(x.id), k = (t - x.start) / x.duration;
    drawCombatTechnique(c, x.e, t, k, tg, H, { light, signatures: scene.signatureSprites, relics: scene.combatSprites });
    // Tên chiêu bay lên trên đầu người ra chiêu (từ Kim Đan trở lên)
    if (x.realm >= 3 && k < .45) {
      const a = Math.min(1, k / .08, (.45 - k) / .12), y = tg.y - 95 * (tg.scale || 1) - k * 40;
      c.save(); c.globalAlpha = a; c.font = `800 ${Math.round(16 + Math.min(10, x.realm))}px "Segoe UI", sans-serif`; c.textAlign = 'center';
      c.lineWidth = 4; c.strokeStyle = '#000000cc'; c.strokeText(x.e.technique.name, tg.x, y); c.fillStyle = x.e.technique.color || '#fff3c4'; c.fillText(x.e.technique.name, tg.x, y);
      c.restore();
    }
  }
}
export const arenaCasting = (scene, id) => !!scene.arenaCasts?.list.some(x => x.id === id);
