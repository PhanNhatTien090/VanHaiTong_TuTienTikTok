// Lịch Luyện — hình TẠM mượn từ LIVE cho tới khi có bộ hình riêng:
// - nhân vật: vẽ bằng đúng code skin LIVE (live-actor.js), theo hồ sơ LIVE đã liên kết (hoặc hồ sơ quản trị chọn);
// - quái: sprite linh thú (3 khung) và boss-atlas của LIVE; nền: ảnh bí cảnh của web.
// Chỉ phục vụ phần vẽ; không chạm vào mô phỏng. Ảnh chưa tải xong thì play.js tự vẽ hình tròn như cũ.

const images = new Map();
function img(src) {
  if (!images.has(src)) { const im = new Image(); im.decoding = 'async'; im.src = src; images.set(src, im); }
  const im = images.get(src);
  return im.complete && im.naturalWidth ? im : null;
}

const PET = id => ({ src: `/assets/spirit-pets-v1/${id}.png`, cells: 3, animate: true, faceRight: false });
const BOSS = cell => ({ src: '/assets/boss-atlas.png', cells: 3, cell, faceRight: true });
// scale: chiều cao ảnh so với đường kính va chạm
export const MONSTER_ART = {
  'monster.yeu-lang': { ...PET('frost-tiger'), scale: 2.6 },
  'monster.doc-xa': { ...PET('loi-oa'), scale: 2.8 },
  'monster.hoa-ho': { ...PET('ember-fox'), scale: 2.8 },
  'monster.thach-vien': { ...PET('van-thu'), scale: 2.4 },
  'monster.thiet-giap-hung': { ...BOSS(1), scale: 2.2 },
  'monster.xich-luyen-xa': { ...BOSS(2), scale: 2.4 },
};
const MAP_BG = { 'map.thanh-van-chau': '/art/zone1/bg.png', 'map.lac-ha-chau': '/art/hub-bg.png', 'map.thien-kiep': '/art/zone2/bg.png' };
export function preload(stageMap) { for (const a of Object.values(MONSTER_ART)) img(a.src); if (MAP_BG[stageMap]) img(MAP_BG[stageMap]); }

// Nền: ảnh bí cảnh phủ đầy sân, tối bớt để nhân vật nổi.
export function drawBackground(ctx, mapId, x, y, w, h) {
  const im = MAP_BG[mapId] && img(MAP_BG[mapId]);
  if (!im) return false;
  const s = Math.max(w / im.naturalWidth, h / im.naturalHeight), iw = im.naturalWidth * s, ih = im.naturalHeight * s;
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.drawImage(im, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih);
  ctx.fillStyle = 'rgba(5,8,12,.5)'; ctx.fillRect(x, y, w, h);
  ctx.restore();
  return true;
}

// Quái: cx, cy là tâm (px), r là bán kính va chạm (px), lookLeft: đang nhìn sang trái.
export function drawMonster(ctx, kind, cx, cy, r, lookLeft, t, hurt) {
  const a = MONSTER_ART[kind], im = a && img(a.src);
  if (!im) return false;
  const cw = im.naturalWidth / a.cells, ch = im.naturalHeight;
  const cell = a.animate ? Math.floor(t / 260) % a.cells : a.cell;
  const h = r * 2 * a.scale, w = h * cw / ch, bob = a.animate ? 0 : Math.sin(t / 300) * r * 0.05;
  // bóng dưới chân
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(cx, cy + r * 0.85, r * 1.1, r * 0.35, 0, 0, 7); ctx.fill();
  ctx.save(); ctx.translate(cx, cy + r * 0.95 + bob);
  if (lookLeft === a.faceRight) ctx.scale(-1, 1);
  if (hurt) ctx.filter = 'brightness(1.8)';
  ctx.drawImage(im, cw * cell, 0, cw, ch, -w / 2, -h, w, h);
  ctx.restore();
  return true;
}

// ── Nhân vật: LiveActor của web (đúng code skin LIVE) ──
let actor = null, actorKey = '';
export async function prepareActor(avatar) {
  const key = (avatar.lookId || '') + ':' + avatar.realmIndex;
  if (actor && actorKey === key) return actor;
  try {
    let look = null;
    if (avatar.lookId) {
      const r = await fetch('/api/profile?id=' + encodeURIComponent(avatar.lookId), { credentials: 'same-origin' }).then(x => x.json()).catch(() => null);
      const p = r?.profile;
      if (p) look = { ...p.appearance, ...p, equipped: p.appearance?.equipped, artifacts: (p.artifacts || []).map(x => x.id), manuals: (p.manuals || []).map(x => x.id) };
    }
    look ??= { id: 'll-self', name: avatar.name, gender: 'nam', realm: avatar.realmIndex, giftCoins: 0, artifacts: [], manuals: [] };
    const { LiveActor } = await import('/live-actor.js');
    const state = { players: [{ ...look, active: true }], serverNow: Date.now(), events: [], boss: null };
    actor = new LiveActor(state, { resolution: 2, playerId: look.id });
    actorKey = key;
  } catch (e) { console.warn('Không nạp được hình nhân vật LIVE', e); actor = null; }
  return actor;
}
export function playerActor() { return actor; }

// Vẽ nhân vật: cy là tâm va chạm; chân đặt dưới tâm. Ảnh LiveActor có gốc chân ở anchor.
export function drawPlayer(ctx, cx, cy, r, lookLeft, t, alpha = 1) {
  if (!actor) return false;
  actor.render(t);
  const c = actor.canvas, h = r * 12, w = h * c.width / c.height;
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(cx, cy + r * 0.85, r * 1.0, r * 0.32, 0, 0, 7); ctx.fill();
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(cx, cy + r * 0.9);
  if (lookLeft) ctx.scale(-1, 1);
  ctx.drawImage(c, -w * actor.anchor.x, -h * actor.anchor.y, w, h);
  ctx.restore();
  return true;
}
