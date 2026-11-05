// Nhân vật người chơi vẽ bằng ĐÚNG code của LIVE (scene.js): áo cảnh giới, skin, thần trang, pháp bảo, hào quang.
// Mỗi khung hình vẽ vào một canvas riêng rồi đưa sang PixiJS làm texture. Không vẽ lại, không thay model.
import { Texture } from '/lib/pixi.mjs';
import { Scene } from '/scene.js';
import { skinFor } from '/cosmetics.js';
import { specialSkinFor } from '/patrons.js';
import { CharacterAnimator } from '/character-animation.js';
import { drawDivineHalo, divineSelection, divineAsset, sliceDivineAtlas } from '/divine-wardrobe.js';

// Bộ tư thế cho trận đánh, phát triển từ bộ tư thế LIVE:
// - luôn đứng (LIVE mặc định ngồi thiền giữa các hành động);
// - khi chạy: nghiêng người theo hướng chạy, nhún theo bước, tà áo bay mạnh hơn;
// - chém/tụ khí/đột phá dùng lại đúng động tác LIVE nhưng nhịp nhanh hơn cho hợp trận đánh.
class BattleAnimator extends CharacterAnimator {
  constructor() { super(); this.move = 0; this.hurtAt = -1e9; this.dashAt = -1e9; }
  act(id, mode, duration, t) { this.actions.set(id, { id: mode + t, mode, start: t, duration }); }
  pose(p, t, motion = true) {
    const pose = super.pose(p, t, motion);
    if (pose.mode === 'meditate' || pose.mode === 'stretch' || pose.mode === 'practice') {
      // Thế đứng thủ: hai tay hơi mở, thở nhẹ.
      pose.mode = 'stance'; pose.stand = 1; pose.energy = 0;
      pose.left = -0.18 + Math.sin(t * 0.002) * 0.04; pose.right = 0.28 - Math.sin(t * 0.002 + 0.5) * 0.04;
      pose.lift = Math.sin(t * 0.0025) * 0.8;
    } else pose.stand = 1;
    const m = this.move;
    if (m > 0.01) {
      const step = t * 0.016;
      pose.lean += 0.16 * m;
      pose.lift -= Math.abs(Math.sin(step)) * 3.2 * m;
      pose.cloth += Math.sin(step * 2) * 2.5 * m - 2 * m;
      pose.step = (pose.step || 0) + Math.sin(step) * 1.2 * m;
      if (!pose.blade) { pose.left -= Math.sin(step) * 0.25 * m; pose.right += Math.sin(step) * 0.25 * m; }
    }
    const dash = (t - this.dashAt) / 320;
    if (dash >= 0 && dash < 1) { pose.lean += 0.3 * Math.sin(dash * Math.PI); pose.lift -= 6 * Math.sin(dash * Math.PI); pose.cloth -= 4; }
    const hurt = (t - this.hurtAt) / 260;
    if (hurt >= 0 && hurt < 1) { pose.lean -= 0.22 * Math.sin(hurt * Math.PI); pose.head -= 0.15 * Math.sin(hurt * Math.PI); }
    return pose;
  }
}

// Khung vẽ: x từ -W/2..W/2, y từ -TOP..BOTTOM (đơn vị toạ độ của LIVE, chân ở y≈0..20).
const W = 180, TOP = 170, BOTTOM = 40;

export class LiveActor {
  // shared: dùng chung một cảnh LIVE ẩn cho nhiều nhân vật (quảng trường); playerId: nhân vật cần vẽ.
  constructor(sceneState, { resolution = 4, shared = null, playerId = null, standing = true } = {}) {
    this.res = resolution;
    if (shared) { this.scene = shared.scene; this.animator = shared.animator; }
    else {
      // Cảnh LIVE ẩn, chỉ để nạp ảnh và dùng các hàm vẽ nhân vật của LIVE.
      const hidden = document.createElement('canvas');
      this.scene = new Scene(hidden, () => {});
      this.scene.residents = false;
      this.scene.motion = true;
      this.animator = new BattleAnimator();
      this.scene.animator = this.animator;
    }
    this.playerId = playerId;
    this.setState(sceneState);
    this.canvas = document.createElement('canvas');
    this.canvas.width = W * this.res; this.canvas.height = (TOP + BOTTOM) * this.res;
    this.ctx = this.canvas.getContext('2d');
    this.texture = Texture.from(this.canvas);
    this.anchor = { x: 0.5, y: TOP / (TOP + BOTTOM) }; // gốc = chân nhân vật
  }
  setState(sceneState, { update = true } = {}) {
    this.player = (this.playerId && sceneState.players.find(p => p.id === this.playerId)) || sceneState.players[0];
    if (this.player) this.preloadSharp(this.player);
    if (update) this.scene.update(sceneState, this.player?.id || null);
  }
  // LIVE cắt thần trang ở 256px cho nhẹ buổi phát; web nạp trước đúng ảnh gốc đó ở 640px cho nét.
  preloadSharp(p) {
    const look = divineSelection(p);
    if (!look) return;
    const sc = this.scene;
    sc.divineArt ??= new Map(); sc.divineLoading ??= new Set();
    sc.sharpGroups ??= new Set();
    if (sc.sharpGroups.has(look.group)) return;
    sc.sharpGroups.add(look.group);
    sc.divineLoading.add(look.group); // chặn LIVE tự nạp bản 256px
    const im = new Image();
    im.onload = () => { sc.divineArt.set(look.group, sliceDivineAtlas(im, look.group, undefined, 640)); sc.divineLoading.delete(look.group); };
    im.onerror = () => { sc.divineLoading.delete(look.group); };
    im.src = divineAsset(look.group);
  }
  get id() { return this.player?.id; }
  // Hành động: 'slash' (chém), 'cast' (tụ khí tung chiêu), 'ascend' (đại chiêu), 'celebrate' (thắng trận).
  act(mode, duration) { this.animator.act(this.id, mode, duration, performance.now()); }
  // Phát lại đúng động tác LIVE theo một sự kiện ký sự (vd. người chơi LIVE vừa tu luyện/đột phá).
  replay(event) { this.animator.trigger({ ...event, user: this.id }, performance.now()); }
  setMove(amount) { this.animator.move = amount; }
  hurt() { this.animator.hurtAt = performance.now(); }
  dash() { this.animator.dashAt = performance.now(); }
  render(t = performance.now()) {
    const p = this.player;
    if (!p) return;
    const c = this.ctx, r = this.res;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, this.canvas.width, this.canvas.height);
    c.setTransform(r, 0, 0, r, (W / 2) * r, TOP * r);
    try {
      // Hào quang sau lưng (từ Chân Tiên trở lên) — đúng hàm của LIVE.
      drawDivineHalo(this.scene, c, { id: p.id, player: p, x: 0, y: 0, scale: 1 }, t);
      const skin = skinFor(p.giftCoins);
      this.scene.drawSkinVFX(c, specialSkinFor(p) || skin, t, p);
      this.scene.drawCharacterBody(c, p, skin, t);
    } catch (e) {
      if (!this.warned) { console.warn('Vẽ nhân vật LIVE lỗi', e); this.warned = true; }
    }
    this.texture.source.update();
  }
}
