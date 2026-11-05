// Bộ xương 2D: ráp các bộ phận (ảnh rời) vào khớp và chuyển động bằng khung hình động + quán tính.
// Mỗi bộ phận là một Sprite phẳng; vị trí/góc tính thủ công từ cây xương để tự sắp lớp trước/sau (z).
import { Container, Sprite, Texture, Rectangle, Assets } from '/lib/pixi.mjs';

const rad = d => (d * Math.PI) / 180;
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = t => t * t * (3 - 2 * t);

// Cắt một ảnh bộ phận thành nhiều mảnh (vd. chân → đùi + cẳng chân) theo khung chữ nhật.
function subTexture(tex, [x, y, w, h]) {
  return new Texture({ source: tex.source, frame: new Rectangle(tex.frame.x + x, tex.frame.y + y, w, h) });
}

export async function loadRig(def) {
  const textures = {};
  await Promise.all(Object.entries(def.images).map(async ([name, src]) => { textures[name] = await Assets.load(src); }));
  return { def, textures };
}

export class Rig extends Container {
  constructor({ def, textures }, { scale = 1 } = {}) {
    super();
    this.def = def;
    this.unit = scale;
    this.bones = new Map();
    for (const b of def.bones) {
      const base = textures[b.image];
      const tex = b.frame ? subTexture(base, b.frame) : base;
      const sprite = new Sprite(tex);
      // pivot tính theo toạ độ trong ảnh gốc của bộ phận; frame dời gốc toạ độ.
      const fx = b.frame ? b.frame[0] : 0, fy = b.frame ? b.frame[1] : 0;
      sprite.anchor.set((b.pivot[0] - fx) / tex.width, (b.pivot[1] - fy) / tex.height);
      sprite.zIndex = b.z;
      const bone = { ...b, sprite, angle: 0, x: 0, y: 0, rot: 0, sx: 1, sy: 1, offX: 0, offY: 0 };
      this.bones.set(b.name, bone);
      this.addChild(sprite);
    }
    this.sortableChildren = true;
    this.order = def.bones.map(b => this.bones.get(b.name)); // cha luôn đứng trước con trong def
    this.facing = 1;
    this.pose = {};
    this.springs = new Map(); // quán tính cho tóc, tà áo
    this.lastRoot = { x: 0, y: 0 };
    this.velocity = { x: 0, y: 0 };
    this.tint = 0xffffff;
  }

  // pose: { root:{x,y,rot}, bones:{name:angleDeg}, scale:{name:[sx,sy]} }
  apply(pose, dt = 1 / 60) {
    const s = this.unit;
    const root = pose.root || {};
    // Quán tính: bộ phận có "spring" trễ theo chuyển động của thân.
    const vx = ((root.x || 0) - this.lastRoot.x) / Math.max(dt, 1e-3);
    const vy = ((root.y || 0) - this.lastRoot.y) / Math.max(dt, 1e-3);
    this.lastRoot = { x: root.x || 0, y: root.y || 0 };
    const mvx = this.velocity.x + vx * 0.02, mvy = this.velocity.y + vy * 0.02;

    for (const bone of this.order) {
      let angle = pose.bones?.[bone.name] ?? 0;
      if (bone.spring) {
        const sp = this.springs.get(bone.name) || { a: 0, v: 0 };
        const target = -mvx * bone.spring.drag * this.facing + mvy * (bone.spring.lift || 0) + Math.sin(performance.now() / (bone.spring.period || 900)) * (bone.spring.idle || 0);
        sp.v += (target - sp.a) * bone.spring.k * dt * 60 - sp.v * bone.spring.damp;
        sp.a += sp.v * dt * 60;
        sp.a = Math.max(-bone.spring.max, Math.min(bone.spring.max, sp.a));
        this.springs.set(bone.name, sp);
        angle += sp.a;
      }
      const sc = pose.scale?.[bone.name] || [1, 1];
      if (!bone.parent) {
        bone.x = (root.x || 0) * s; bone.y = (root.y || 0) * s; bone.rot = rad((root.rot || 0) + angle);
      } else {
        const p = this.bones.get(bone.parent);
        const dx = (bone.at[0] - p.pivot[0]) * s * p.sx, dy = (bone.at[1] - p.pivot[1]) * s * p.sy;
        const c = Math.cos(p.rot), sn = Math.sin(p.rot);
        bone.x = p.x + dx * c - dy * sn;
        bone.y = p.y + dx * sn + dy * c;
        bone.rot = p.rot + rad(angle);
      }
      bone.sx = sc[0]; bone.sy = sc[1];
      const spr = bone.sprite;
      spr.position.set(bone.x, bone.y);
      spr.rotation = bone.rot;
      spr.scale.set(s * sc[0], s * sc[1]);
      spr.tint = this.tint;
      if (pose.hide?.[bone.name] !== undefined) spr.visible = !pose.hide[bone.name];
    }
    this.scale.x = this.facing;
  }

  boneWorld(name, local = [0, 0]) {
    const b = this.bones.get(name);
    const dx = (local[0] - b.pivot[0]) * this.unit, dy = (local[1] - b.pivot[1]) * this.unit;
    const c = Math.cos(b.rot), s = Math.sin(b.rot);
    return { x: (b.x + dx * c - dy * s) * this.facing + this.x, y: b.y + dx * s + dy * c + this.y, rot: b.rot };
  }
}

// ---------- Khung hình động ----------
// clip = { duration (giây), loop, keys: [{ t: 0..1, root:{x,y,rot}, bones:{...} }], events: [{t, name}] }
export function sampleClip(clip, time) {
  const d = clip.duration;
  let u = clip.loop ? ((time % d) + d) % d / d : Math.min(1, time / d);
  const keys = clip.keys;
  let i = 0;
  while (i < keys.length - 1 && keys[i + 1].t <= u) i++;
  const a = keys[i], b = keys[Math.min(keys.length - 1, i + 1)];
  const span = b.t - a.t || 1;
  const f = a === b ? 0 : (b.ease === 'linear' ? (u - a.t) / span : smooth((u - a.t) / span));
  const out = { root: {}, bones: {}, scale: {} };
  for (const k of ['x', 'y', 'rot']) out.root[k] = lerp(a.root?.[k] || 0, b.root?.[k] || 0, f);
  const names = new Set([...Object.keys(a.bones || {}), ...Object.keys(b.bones || {})]);
  for (const n of names) out.bones[n] = lerp(a.bones?.[n] || 0, b.bones?.[n] || 0, f);
  const sn = new Set([...Object.keys(a.scale || {}), ...Object.keys(b.scale || {})]);
  for (const n of sn) { const sa = a.scale?.[n] || [1, 1], sb = b.scale?.[n] || [1, 1]; out.scale[n] = [lerp(sa[0], sb[0], f), lerp(sa[1], sb[1], f)]; }
  return out;
}

// Trộn hai tư thế (chuyển mượt giữa hai động tác).
export function blendPose(p, q, f) {
  if (f >= 1) return q;
  if (f <= 0) return p;
  const out = { root: {}, bones: {}, scale: {} };
  for (const k of ['x', 'y', 'rot']) out.root[k] = lerp(p.root?.[k] || 0, q.root?.[k] || 0, f);
  const names = new Set([...Object.keys(p.bones || {}), ...Object.keys(q.bones || {})]);
  for (const n of names) out.bones[n] = lerp(p.bones?.[n] || 0, q.bones?.[n] || 0, f);
  const sn = new Set([...Object.keys(p.scale || {}), ...Object.keys(q.scale || {})]);
  for (const n of sn) { const a = p.scale?.[n] || [1, 1], b = q.scale?.[n] || [1, 1]; out.scale[n] = [lerp(a[0], b[0], f), lerp(a[1], b[1], f)]; }
  return out;
}

// Bộ điều khiển: chạy clip hiện tại, chuyển clip có trộn 0,12 giây, báo sự kiện (vd. "hit" lúc kiếm chém tới).
export class Animator {
  constructor(rig, clips) {
    this.rig = rig; this.clips = clips;
    this.current = null; this.time = 0; this.prevPose = null; this.blend = 1; this.blendDur = 0.12;
    this.listeners = new Set();
    this.firedEvents = new Set();
  }
  play(name, { restart = false, blend = 0.12 } = {}) {
    if (this.current === name && !restart) return;
    this.prevPose = this.lastPose || null;
    this.current = name; this.time = 0; this.blend = 0; this.blendDur = blend;
    this.firedEvents = new Set();
  }
  get done() { const c = this.clips[this.current]; return c && !c.loop && this.time >= c.duration; }
  on(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  update(dt) {
    const clip = this.clips[this.current];
    if (!clip) return;
    this.time += dt * (clip.speed || 1);
    const u = clip.loop ? (this.time % clip.duration) / clip.duration : Math.min(1, this.time / clip.duration);
    for (const ev of clip.events || []) {
      const key = ev.name + '@' + ev.t + '#' + Math.floor(this.time / clip.duration);
      if (u >= ev.t && !this.firedEvents.has(key)) { this.firedEvents.add(key); for (const fn of this.listeners) fn(ev.name, this.current); }
    }
    let pose = sampleClip(clip, this.time);
    if (this.blend < 1 && this.prevPose) { this.blend = Math.min(1, this.blend + dt / this.blendDur); pose = blendPose(this.prevPose, pose, smooth(this.blend)); }
    this.lastPose = pose;
    this.rig.apply(pose, dt);
  }
}
