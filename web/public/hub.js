// Trang chủ tông môn: ảnh nền + hiệu ứng sống động + công trình bấm được. Vẽ bằng PixiJS (WebGL).
import { Application, Assets, Container, Sprite, Graphics, Text, Texture, BlurFilter } from '/lib/pixi.mjs';

// Toạ độ tính theo ảnh gốc hub-bg (1672×941). Ảnh phóng to lớn hơn thì tự quy đổi theo tỉ lệ.
const BASE_W = 1672, BASE_H = 941;
export const BUILDINGS = [
  // x,y: tâm công trình (vùng chạm); lx,ly: chỗ đặt bảng tên, tránh thanh trên cùng và nút bên phải.
  { id: 'dungeon', name: 'Bí Cảnh', x: 372, y: 150, r: 120, lx: 372, ly: 300, tone: 'purple', fx: 'portal' },
  { id: 'alchemy', name: 'Đan Phòng', x: 170, y: 300, r: 130, lx: 205, ly: 420, fx: 'smoke' },
  { id: 'hall', name: 'Đại Điện', x: 836, y: 230, r: 150, lx: 836, ly: 345, fx: 'halo' },
  { id: 'events', name: 'Sự Kiện', x: 1462, y: 150, r: 115, lx: 1430, ly: 250, tone: 'red', fx: 'lantern' },
  { id: 'library', name: 'Tàng Kinh Các', x: 1530, y: 360, r: 95, lx: 1420, ly: 470, fx: 'halo' },
  { id: 'forge', name: 'Luyện Khí Các', x: 220, y: 610, r: 140, lx: 255, ly: 700, fx: 'embers' },
  { id: 'beasts', name: 'Linh Thú Cốc', x: 1470, y: 690, r: 150, lx: 1400, ly: 790, fx: 'sparkle' },
];
const TERRACE = { x: 836, y: 840 };

function radialTexture(size, stops) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  for (const [at, color] of stops) grad.addColorStop(at, color);
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return Texture.from(c);
}

export async function createHub(host, { onBuilding, reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches } = {}) {
  const app = new Application();
  await app.init({ resizeTo: host, antialias: true, backgroundAlpha: 0, resolution: Math.min(2, devicePixelRatio || 1), autoDensity: true, preference: 'webgl' });
  host.appendChild(app.canvas);

  const [bg, plaque, plaqueRed] = await Promise.all([
    Assets.load('/art/hub-bg.png'),
    Assets.load('/art/ui/plaque.png').catch(() => null),
    Assets.load('/art/ui/plaque-red.png').catch(() => null),
  ]);
  const k = bg.width / BASE_W; // hệ số khi dùng ảnh phóng to

  const world = new Container();
  app.stage.addChild(world);
  const bgSprite = new Sprite(bg);
  world.addChild(bgSprite);

  const glow = radialTexture(256, [[0, 'rgba(255,255,255,1)'], [0.35, 'rgba(255,255,255,.45)'], [1, 'rgba(255,255,255,0)']]);
  const soft = radialTexture(256, [[0, 'rgba(255,255,255,.9)'], [0.6, 'rgba(255,255,255,.25)'], [1, 'rgba(255,255,255,0)']]);

  // ---------- Lớp hiệu ứng ----------
  const fxBack = new Container(), fxFront = new Container(), labels = new Container(), actorLayer = new Container();
  actorLayer.sortableChildren = true;
  world.addChild(fxBack, actorLayer, fxFront, labels);
  const updaters = [];

  // Tia nắng chéo từ mặt trời phía trên.
  for (let i = 0; i < 4; i++) {
    const ray = new Sprite(soft);
    ray.anchor.set(0.5, 0);
    ray.width = 160 * k; ray.height = 900 * k;
    ray.position.set((1050 + i * 70) * k, 60 * k);
    ray.rotation = 0.35 + i * 0.08;
    ray.tint = 0xfff1c4; ray.blendMode = 'add'; ray.alpha = 0.05;
    fxBack.addChild(ray);
    updaters.push(t => { ray.alpha = 0.05 + 0.04 * Math.sin(t / 2300 + i * 1.7); });
  }

  // Mây trôi chậm qua tầng dưới.
  const cloudLayer = new Container();
  cloudLayer.filters = [new BlurFilter({ strength: 18 * k })];
  fxFront.addChild(cloudLayer);
  const clouds = [];
  for (let i = 0; i < 9; i++) {
    const c = new Sprite(soft);
    c.anchor.set(0.5);
    c.width = (380 + Math.random() * 380) * k; c.height = c.width * 0.32;
    c.position.set(Math.random() * BASE_W * k, (420 + Math.random() * 420) * k);
    c.alpha = 0.22 + Math.random() * 0.2;
    c.speed = (6 + Math.random() * 10) * k;
    cloudLayer.addChild(c); clouds.push(c);
  }
  updaters.push((t, dt) => {
    for (const c of clouds) { c.x += c.speed * dt; if (c.x - c.width / 2 > BASE_W * k) c.x = -c.width / 2; }
  });

  // Cánh hoa đào rơi.
  const petalTex = (() => {
    const g = new Graphics().ellipse(0, 0, 7, 4).fill({ color: 0xffc4dc }).ellipse(1, -1, 3, 1.6).fill({ color: 0xfff0f6, alpha: 0.8 });
    return app.renderer.generateTexture(g);
  })();
  const petals = [];
  for (let i = 0; i < (reducedMotion ? 0 : 46); i++) {
    const p = new Sprite(petalTex);
    p.anchor.set(0.5);
    p.scale.set((0.8 + Math.random()) * k);
    p.position.set(Math.random() * BASE_W * k, Math.random() * BASE_H * k);
    p.vx = (14 + Math.random() * 18) * k; p.vy = (18 + Math.random() * 22) * k; p.spin = (Math.random() - 0.5) * 2; p.phase = Math.random() * 6;
    fxFront.addChild(p); petals.push(p);
  }
  updaters.push((t, dt) => {
    for (const p of petals) {
      p.x += (p.vx + Math.sin(t / 900 + p.phase) * 20 * k) * dt; p.y += p.vy * dt; p.rotation += p.spin * dt;
      p.scale.y = Math.abs(Math.sin(t / 400 + p.phase)) * k + 0.2 * k;
      if (p.y > BASE_H * k + 20 || p.x > BASE_W * k + 20) { p.y = -20; p.x = Math.random() * BASE_W * k * 0.8; }
    }
  });

  // Hiệu ứng riêng của từng công trình.
  function emitter(b, { color, count, rise, spread, size, life, add = true }) {
    const parts = [];
    for (let i = 0; i < count; i++) {
      const s = new Sprite(glow);
      s.anchor.set(0.5); s.tint = color; if (add) s.blendMode = 'add';
      s.age = Math.random() * life;
      fxBack.addChild(s); parts.push(s);
    }
    updaters.push((t, dt) => {
      for (const s of parts) {
        s.age += dt;
        if (s.age > life) { s.age = 0; s.ox = (Math.random() - 0.5) * spread; s.vx = (Math.random() - 0.5) * 12; }
        const f = s.age / life;
        s.position.set((b.x + (s.ox || 0) + (s.vx || 0) * s.age) * k, (b.y + 40 - rise * f) * k);
        s.alpha = Math.sin(Math.PI * f) * 0.9;
        s.width = s.height = size * (1 - f * 0.5) * k;
      }
    });
  }
  for (const b of BUILDINGS) {
    if (b.fx === 'portal') {
      for (let i = 0; i < 3; i++) {
        const ring = new Sprite(glow);
        ring.anchor.set(0.5); ring.position.set(b.x * k, b.y * k);
        ring.tint = [0xb070ff, 0x7a5cff, 0xe0b0ff][i]; ring.blendMode = 'add';
        fxBack.addChild(ring);
        updaters.push(t => { const s = (150 + 40 * Math.sin(t / (700 + i * 230) + i)) * k; ring.width = s * (1.15 - i * 0.2); ring.height = s * (1.3 - i * 0.2); ring.alpha = 0.35 - i * 0.07; ring.rotation = t / (1500 - i * 300); });
      }
      emitter(b, { color: 0xc89bff, count: 24, rise: 120, spread: 120, size: 22, life: 2.6 });
    } else if (b.fx === 'embers') {
      emitter({ x: b.x - 20, y: b.y + 20 }, { color: 0xff9a3c, count: 34, rise: 180, spread: 90, size: 16, life: 2.2 });
    } else if (b.fx === 'smoke') {
      emitter({ x: b.x + 15, y: b.y + 10 }, { color: 0xffe2a8, count: 16, rise: 160, spread: 40, size: 70, life: 4, add: false });
    } else if (b.fx === 'lantern') {
      emitter(b, { color: 0xff6040, count: 18, rise: 60, spread: 220, size: 26, life: 3 });
    } else if (b.fx === 'sparkle') {
      emitter({ x: b.x - 30, y: b.y - 20 }, { color: 0x9ef3ff, count: 30, rise: 90, spread: 260, size: 14, life: 3 });
    } else if (b.fx === 'halo') {
      const h = new Sprite(glow);
      h.anchor.set(0.5); h.position.set(b.x * k, b.y * k); h.tint = 0xffe9a8; h.blendMode = 'add';
      fxBack.addChild(h);
      updaters.push(t => { h.width = h.height = (260 + 30 * Math.sin(t / 1300 + b.x)) * k; h.alpha = 0.18 + 0.08 * Math.sin(t / 1300 + b.x); });
    }
  }

  // Vòng tụ linh trên sân, chỗ nhân vật đứng (bước sau thay bằng nhân vật có bộ xương).
  const circle = new Sprite(glow);
  circle.anchor.set(0.5); circle.position.set(TERRACE.x * k, TERRACE.y * k); circle.tint = 0x8ff5d0; circle.blendMode = 'add';
  fxBack.addChild(circle);
  updaters.push(t => { circle.width = (330 + 20 * Math.sin(t / 900)) * k; circle.height = circle.width * 0.32; circle.alpha = 0.32 + 0.1 * Math.sin(t / 900); });

  // ---------- Bảng tên công trình ----------
  const hot = [];
  for (const b of BUILDINGS) {
    const group = new Container();
    group.position.set(b.lx * k, b.ly * k);
    const face = new Container();
    const tex = b.tone === 'red' && plaqueRed ? plaqueRed : plaque;
    const label = new Text({ text: b.name, style: { fontFamily: 'Noto Serif, Georgia, serif', fontWeight: '700', fontSize: 34 * k, fill: 0xfff3cf, letterSpacing: 2 * k, dropShadow: { color: 0x000000, alpha: 0.7, blur: 4 * k, distance: 2 * k } } });
    label.anchor.set(0.5);
    if (tex) {
      const p = new Sprite(tex);
      p.anchor.set(0.5, 0.37); // tâm thanh chữ, phía dưới là tua rua
      const w = Math.max(label.width * 1.6, 270 * k);
      p.width = w; p.height = w * tex.height / tex.width;
      face.addChild(p);
    } else {
      const g = new Graphics().roundRect(-label.width / 2 - 26 * k, -28 * k, label.width + 52 * k, 56 * k, 14 * k).fill({ color: 0x0d2a27, alpha: 0.85 }).stroke({ color: 0xe8c977, width: 3 * k });
      face.addChild(g);
    }
    face.addChild(label);
    // Vùng chạm rộng hơn bảng tên: cả công trình.
    const hit = new Graphics().circle((b.x - b.lx) * k, (b.y - b.ly) * k, b.r * k).fill({ color: 0xffffff, alpha: 0.001 });
    group.addChild(hit, face);
    group.face = face;
    group.eventMode = 'static'; group.cursor = 'pointer';
    group.on('pointerover', () => { group.hover = true; });
    group.on('pointerout', () => { group.hover = false; });
    group.on('pointertap', () => { if (!dragMoved) onBuilding?.(b); });
    labels.addChild(group);
    hot.push(group);
    group.pulse = 1;
    updaters.push(t => {
      const target = group.hover ? 1.1 : 1 + 0.025 * Math.sin(t / 700 + b.x);
      group.pulse += (target - group.pulse) * 0.2;
    });
  }

  // ---------- Khung nhìn: phủ kín màn hình, kéo để xem hai bên trên điện thoại ----------
  let labelScale = 1, scale = 1, offsetX = 0, offsetY = 0, minX = 0, minY = 0;
  function layout() {
    const W = app.screen.width, H = app.screen.height;
    scale = Math.max(W / bg.width, H / bg.height);
    world.scale.set(scale);
    minX = W - bg.width * scale; minY = H - bg.height * scale;
    if (!layout.done) { offsetX = minX / 2; offsetY = minY * 0.4; layout.done = true; }
    clamp();
    // Bảng tên giữ kích thước dễ đọc kể cả khi ảnh nền bị thu nhỏ trên điện thoại.
    labelScale = Math.min(2, Math.max(0.8, (W < 700 ? 0.38 : 0.4) / (scale * k)));
  }
  function clamp() { offsetX = Math.min(0, Math.max(minX, offsetX)); offsetY = Math.min(0, Math.max(minY, offsetY)); world.position.set(offsetX, offsetY); }
  app.renderer.on('resize', layout);
  layout();

  let dragging = false, dragMoved = false, last = null, velocity = 0;
  app.stage.eventMode = 'static';
  app.stage.hitArea = app.screen;
  app.stage.on('pointerdown', e => { dragging = true; dragMoved = false; last = e.global.clone(); velocity = 0; });
  app.stage.on('pointermove', e => {
    if (!dragging) return;
    const dx = e.global.x - last.x, dy = e.global.y - last.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) dragMoved = true;
    offsetX += dx; offsetY += dy; velocity = dx; last = e.global.clone(); clamp();
  });
  const stop = () => { dragging = false; };
  app.stage.on('pointerup', stop); app.stage.on('pointerupoutside', stop);

  app.ticker.add(ticker => {
    const t = performance.now(), dt = Math.min(0.05, ticker.deltaMS / 1000);
    if (!dragging && Math.abs(velocity) > 0.2) { offsetX += velocity; velocity *= 0.92; clamp(); }
    if (!reducedMotion) for (const u of updaters) u(t, dt);
    for (const g of hot) g.face.scale.set(g.pulse * labelScale);
  });

  // ---------- Nhân vật trên quảng trường (vẽ bằng code LIVE ở live-actor.js) ----------
  const actors = new Map(), frameHooks = new Set();
  function addActor(id, texture, { x, y, unitPx, res, anchor, name, live = false, onTap }) {
    removeActor(id);
    const box = new Container();
    box.position.set(x * k, y * k); box.zIndex = y;
    const shadow = new Sprite(glow); shadow.anchor.set(0.5); shadow.tint = 0x000000; shadow.alpha = 0.4; shadow.width = 70 * k; shadow.height = 16 * k;
    const sp = new Sprite(texture); sp.anchor.set(anchor.x, anchor.y); sp.scale.set(unitPx * k / res);
    const tag = new Container();
    const label = new Text({ text: name, style: { fontFamily: 'Be Vietnam Pro, system-ui, sans-serif', fontWeight: '700', fontSize: 15 * k, fill: live ? 0xfff1cf : 0xffe08a, dropShadow: { color: 0x000000, alpha: 0.9, blur: 3 * k, distance: 1 } } });
    label.anchor.set(0.5);
    const padX = 10 * k, w = label.width + padX * 2 + (live ? 16 * k : 0), h = 22 * k;
    const plate = new Graphics().roundRect(-w / 2, -h / 2, w, h, h / 2).fill({ color: 0x06110f, alpha: 0.72 }).stroke({ color: live ? 0xff5a4a : 0xe8c977, width: 1.5 * k, alpha: 0.9 });
    tag.addChild(plate, label);
    if (live) { const dot = new Graphics().circle(-w / 2 + 11 * k, 0, 4 * k).fill(0xff4a3a); tag.addChild(dot); label.x = 8 * k; }
    tag.y = 18 * k;
    box.addChild(shadow, sp, tag);
    box.eventMode = 'static'; box.cursor = 'pointer';
    box.on('pointertap', () => { if (!dragMoved) onTap?.(); });
    actorLayer.addChild(box);
    actors.set(id, { box, sp });
  }
  function removeActor(id) { const a = actors.get(id); if (a) { a.box.destroy({ children: true }); actors.delete(id); } }
  app.ticker.add(() => { for (const fn of frameHooks) fn(); });

  return {
    app,
    addActor, removeActor, hasActor: id => actors.has(id), actorIds: () => [...actors.keys()],
    onFrame(fn) { frameHooks.add(fn); return () => frameHooks.delete(fn); },
    pause() { app.ticker.stop(); },
    resume() { app.ticker.start(); },
    focus(id) { const b = BUILDINGS.find(x => x.id === id); if (!b) return; offsetX = app.screen.width / 2 - b.x * k * scale; offsetY = app.screen.height / 2 - b.y * k * scale; clamp(); },
    // Làm nổi bảng tên một công trình (hướng dẫn tân thủ).
    highlight(id) { hot.forEach((g, i) => { g.hover = BUILDINGS[i].id === id; }); },
  };
}
